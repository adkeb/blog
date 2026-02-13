/**
 * Decap CMS GitHub OAuth for Cloudflare Workers.
 *
 * Routes:
 * - GET /auth
 * - GET /callback
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/auth") {
      return handleAuth(url, env);
    }

    if (url.pathname === "/callback") {
      return handleCallback(url, env);
    }

    return new Response("Not Found", { status: 404 });
  }
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}

function buildGitHubAuthorizeUrl(env, state) {
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  authorize.searchParams.set("redirect_uri", env.GITHUB_REDIRECT_URI);
  authorize.searchParams.set("scope", "repo");
  authorize.searchParams.set("state", state);
  return authorize.toString();
}

function encodeState(payload, secret) {
  const raw = JSON.stringify(payload);
  const data = btoa(raw);
  const sig = btoa(`${data}.${secret}`).replaceAll("=", "");
  return `${data}.${sig}`;
}

function decodeAndVerifyState(state, secret) {
  if (!state || !state.includes(".")) {
    return null;
  }
  const [data, sig] = state.split(".");
  const expected = btoa(`${data}.${secret}`).replaceAll("=", "");
  if (sig !== expected) {
    return null;
  }

  try {
    const decoded = atob(data);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function parseRawState(input) {
  if (!input) {
    return null;
  }
  try {
    return JSON.parse(atob(input));
  } catch {
    return null;
  }
}

async function handleAuth(url, env) {
  const rawState = url.searchParams.get("state");
  const origin = url.searchParams.get("origin");
  const host = url.searchParams.get("host");

  const decodedState = parseRawState(rawState);
  const cmsOrigin =
    origin || decodedState?.origin || (host ? `https://${host}` : env.CMS_ORIGIN || "");

  if (!cmsOrigin) {
    return json({ error: "missing origin" }, 400);
  }

  const now = Date.now();
  const payload = {
    cmsOrigin,
    ts: now
  };
  const signedState = encodeState(payload, env.OAUTH_STATE_SECRET);
  const location = buildGitHubAuthorizeUrl(env, signedState);

  return Response.redirect(location, 302);
}

async function handleCallback(url, env) {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return json({ error: "missing code/state" }, 400);
  }

  const parsedState = decodeAndVerifyState(state, env.OAUTH_STATE_SECRET);
  if (!parsedState?.cmsOrigin) {
    return json({ error: "invalid state" }, 400);
  }

  const tokenResp = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: env.GITHUB_REDIRECT_URI,
      state
    })
  });

  const tokenJson = await tokenResp.json();
  const accessToken = tokenJson.access_token;

  if (!accessToken) {
    return json(
      {
        error: "token exchange failed",
        detail: tokenJson
      },
      500
    );
  }

  const script = `
<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><title>Auth success</title></head>
  <body>
    <script>
      (function () {
        const token = ${JSON.stringify(accessToken)};
        const target = ${JSON.stringify(parsedState.cmsOrigin)};
        if (window.opener) {
          window.opener.postMessage(
            "authorization:github:success:" + JSON.stringify({ token: token }),
            target
          );
          window.close();
        } else {
          document.body.textContent = "OAuth succeeded. You can close this window.";
        }
      })();
    </script>
  </body>
</html>`;

  return html(script, 200);
}

