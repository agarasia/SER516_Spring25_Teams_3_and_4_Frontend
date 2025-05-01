<template>
  <div id="app">
    <nav class="navbar">
      <div class="brand" @click="switchTab('landing')" style="cursor: pointer;">Metric Calculator</div>
      <div class="nav-links">
        <button @click="switchTab('calculate')" :class="{ active: currentTab === 'calculate' }">Calculator</button>
        <button @click="switchTab('about')" :class="{ active: currentTab === 'about' }">About</button>
        <button @click="switchTab('metrics')" :class="{ active: currentTab === 'metrics' }">Metrics Guide</button>
      </div>
    </nav>


    <main>
      <LandingPage v-if="currentTab === 'landing'" />
      <HomeScreen v-else-if="currentTab === 'calculate'" :key="homeKey" />
      <About v-else-if="currentTab === 'about'" />
      <MetricsGuide v-else-if="currentTab === 'metrics'" />
    </main>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue';
import LandingPage from './components/LandingPage.vue';
import HomeScreen from './components/HomeScreen.vue';
import About from './components/About.vue';
import MetricsGuide from './components/MetricsGuide.vue';

export default defineComponent({
  name: 'App',
  components: {
    LandingPage,
    HomeScreen,
    About,
    MetricsGuide,
  },
  setup() {
    const currentTab = ref('landing'); // Start from landing page
    const homeKey = ref(0);

    const switchTab = (tab: string) => {
      // If switching away from Home, reset HomeScreen
      if (tab !== 'calculate') {
        homeKey.value++;
      }
      currentTab.value = tab;
    };

    return { currentTab, homeKey, switchTab };
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0 px;
  display: flex;
  flex-direction: column;
}

html,
body {
  height: 100%;
  margin: 0;
}

.navbar {
  background-color: #2c3e50;
  /* keep your original dark blue */
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  /* make navbar consistent font */
}

.brand {
  font-weight: 600;
  font-size: 22px;
  color: white;
}

.nav-links {
  display: flex;
  gap: 30px;
}

.nav-links button {
  background: none;
  border: none;
  color: white;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  /* ensure same font */
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  padding: 5px 10px;
  transition: all 0.3s ease;
}

.nav-links button:hover {
  text-decoration: underline;
}

.nav-links button.active {
  text-decoration: underline;
}


header,
footer {
  flex-shrink: 0;
  background: linear-gradient(to right, #09203f, #537895);
  color: #fff;
  text-align: center;
  padding: 10px 0;
  font-size: 10px;
  font-weight: bold;
}

@media (min-height: 700px) {
  footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
  }
}

/* Main grows/shrinks and scrolls if necessary */
main {
  flex: 1 0 auto;
  /* fills the leftover space */
  overflow-y: auto;
}
</style>