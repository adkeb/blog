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

function buildGitHubAuthorizeUrl(env, state, scope = "repo") {
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  authorize.searchParams.set("redirect_uri", env.GITHUB_REDIRECT_URI);
  authorize.searchParams.set("scope", scope || "repo");
  authorize.searchParams.set("state", state);
  return authorize.toString();
}

function normalizeOrigin(value) {
  if (!value) {
    return "";
  }

  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
}

function buildAuthHandshakePage({ provider, cmsOrigin, authorizeUrl }) {
  const handshake = `authorizing:${provider}`;
  const targetOrigin = normalizeOrigin(cmsOrigin) || "*";

  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Authorizing...</title>
  </head>
  <body>
    <script>
      (function () {
        const handshake = ${JSON.stringify(handshake)};
        const targetOrigin = ${JSON.stringify(targetOrigin)};
        const authorizeUrl = ${JSON.stringify(authorizeUrl)};
        let redirected = false;

        function goAuthorize() {
          if (redirected) {
            return;
          }
          redirected = true;
          window.location.replace(authorizeUrl);
        }

        function onMessage(event) {
          if (event.data !== handshake) {
            return;
          }
          window.removeEventListener("message", onMessage, false);
          goAuthorize();
        }

        window.addEventListener("message", onMessage, false);

        if (window.opener && typeof window.opener.postMessage === "function") {
          try {
            window.opener.postMessage(handshake, targetOrigin);
          } catch {
            window.opener.postMessage(handshake, "*");
          }
        } else {
          goAuthorize();
          return;
        }

        // Fallback if handshake echo fails in strict popup environments.
        setTimeout(goAuthorize, 1500);
      })();
    </script>
    Authorizing...
  </body>
</html>`;
}

function buildAuthResultPage({ provider, type, payload, cmsOrigin }) {
  const targetOrigin = normalizeOrigin(cmsOrigin) || "*";
  const eventName = `authorization:${provider}:${type}:`;

  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Auth ${type}</title>
  </head>
  <body>
    <script>
      (function () {
        const targetOrigin = ${JSON.stringify(targetOrigin)};
        const message = ${JSON.stringify(eventName)} + JSON.stringify(${JSON.stringify(payload)});

        if (!window.opener) {
          document.body.textContent = "OAuth completed. You can close this window.";
          return;
        }

        try {
          window.opener.postMessage(message, targetOrigin);
        } catch {
          window.opener.postMessage(message, "*");
        }

        window.close();
      })();
    </script>
  </body>
</html>`;
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
  const siteId = url.searchParams.get("site_id");
  const provider = url.searchParams.get("provider") || "github";
  const scope = url.searchParams.get("scope") || "repo";

  if (provider !== "github") {
    return json({ error: "unsupported provider" }, 400);
  }

  const decodedState = parseRawState(rawState);
  const cmsOrigin =
    normalizeOrigin(origin) ||
    normalizeOrigin(decodedState?.origin) ||
    normalizeOrigin(host ? `https://${host}` : "") ||
    normalizeOrigin(siteId ? `https://${siteId}` : "") ||
    normalizeOrigin(env.CMS_ORIGIN) ||
    "";

  if (!cmsOrigin) {
    return json({ error: "missing origin" }, 400);
  }

  const now = Date.now();
  const payload = {
    cmsOrigin,
    provider,
    ts: now
  };
  const signedState = encodeState(payload, env.OAUTH_STATE_SECRET);
  const authorizeUrl = buildGitHubAuthorizeUrl(env, signedState, scope);

  return html(buildAuthHandshakePage({ provider, cmsOrigin, authorizeUrl }));
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

  const provider = parsedState.provider || "github";

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
    const errorPayload = {
      message: "token exchange failed",
      detail: tokenJson
    };

    return html(
      buildAuthResultPage({
        provider,
        type: "error",
        payload: errorPayload,
        cmsOrigin: parsedState.cmsOrigin
      }),
      500
    );
  }

  return html(
    buildAuthResultPage({
      provider,
      type: "success",
      payload: {
        token: accessToken,
        provider
      },
      cmsOrigin: parsedState.cmsOrigin
    }),
    200
  );
}
