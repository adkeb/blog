export default defineNuxtPlugin(() => {
  const { init } = useLiveCustomization();
  init();
});
