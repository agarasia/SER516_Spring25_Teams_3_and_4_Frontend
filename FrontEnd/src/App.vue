<template>
  <HomeScreen />
</template>

<script>
import HomeScreen from './components/HomeScreen.vue';

export default {
  name: 'App',
  components: {
    HomeScreen
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

body {
  display: flex;
  flex-direction: column;
}

header, footer {
  /* They can be auto-height, or whatever height you prefer */
  flex: 0 0 auto;
}

main {
  flex: 1 0 auto; /* fills remaining vertical space */
  overflow-y: auto; /* scrolls if content is too tall */
}
</style>