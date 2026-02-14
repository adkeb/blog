export default defineNuxtPlugin(() => {
  const { init } = useLiveCustomization();
  void init();
});
