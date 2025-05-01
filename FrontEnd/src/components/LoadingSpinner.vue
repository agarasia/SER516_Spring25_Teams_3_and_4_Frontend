<!-- src/components/LoadingSpinner.vue -->
<template>
    <div class="spinner-overlay">
      <div class="spinner"></div>
    </div>
  </template>
  
  <script lang="ts">
  export default {
    name: 'LoadingSpinner',
  };
  </script>
  
  <style scoped>
  .spinner-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.7);
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
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  </style>
  