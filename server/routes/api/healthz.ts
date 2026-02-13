export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  return {
    ok: true,
    now: new Date().toISOString(),
    previewMode: config.public.showDrafts
  };
});

