<template>
  <footer class="footer">
    <div class="container">
      <p>© {{ year }} {{ customization.footerText }}</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear();
const { state: customization } = useLiveCustomization();
</script>

<style scoped>
.footer {
  border-top: 1px solid var(--line);
  color: var(--text-muted);
  margin-top: 2rem;
  padding: 1.5rem 0 2.5rem;
  text-align: center;
}
</style>
