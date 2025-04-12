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
html,
body {
  height: 100%;
  margin: 0;
}

body {
}



header,
footer {
  flex: 0 0 auto;           /* keep their natural height */
  width: 100%;
}

/* Main grows/shrinks and scrolls if necessary */
main {
  flex: 1 0 auto;           /* fills the leftover space */
  overflow-y: auto;
}
</style>