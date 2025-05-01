<!-- src/components/LoadingSpinner.vue -->
<template>
  <div class="spinner-overlay">
    <div
      style="background-color: white; border-radius: 20px; padding: 20px; display: flex; border: 1px solid #ccc; box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);">
      <div class="spinner"></div>
      <h4 class="loading-text">
        Please Wait, your repository is being added to shared volume.<br />
        The larger the repo, the longer the time.
      </h4>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'LoadingSpinner',
};
</script>

<style scoped>
.loading-text {
  color: #0056b3;
}

.spinner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.352);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 6px solid #ccc;
  border-top: 6px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>