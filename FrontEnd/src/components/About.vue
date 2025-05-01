<template>
  <div style="background-color: #f4f4f5; overflow-y: auto;">
    <section class="about glass">
      <h1>About Metric&nbsp;Calculator</h1>

      <p>
        <strong>Metric Calculator</strong> is the Spring&nbsp;2025 project for
        <em>SER 516: Software Agility</em> at Arizona State University.
        The course began with 4-person sub-teams, each building a single
        metric as an independent <em>micro-service</em>.
        In the final period the entire class merged those services
        into one cohesive web application.
      </p>

      <h2>Architecture Snapshot</h2>
      <p>
        Every service runs as a container on <code>analysis-network</code> and
        mounts the shared repository volume <code>shared-repos</code>.
        The UI calls an API-gateway that orchestrates the individual workers.
      </p>
      <div class="image">
        <img src="../assets/Architecture_image.png" alt="Metrics Architecture" />
      </div>
    </section>
  </div>
</template>

<script lang="ts">
export default {
  name: 'About',
};
</script>

<style scoped>
/* glass-card wrapper (matches landing-page style) */
.about {
  width: 80vw;
  margin: 3em auto;
  padding: 48px;
  border-radius: 10px;
  background: #fefffe;
  border: 1px solid #ccc;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(14px) saturate(180%);
  -webkit-backdrop-filter: blur(14px) saturate(180%);
  color: #000;
  line-height: 1.7;
}

/* headings */
.about h1 {
  margin-top: 0;
  font-size: 2.4rem;
}

.about h2 {
  margin: 40px 0 15px;
  font-size: 1.6rem;
  color: #000;
}

/* service list */
.services {
  list-style: none;
  padding-left: 0;
  column-count: 2;
  gap: 10px 40px;
}

.services li {
  margin: 6px 0;
}

/* docker-compose block */
.compose {
  margin-top: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.35);
  border-radius: 12px;
  overflow-x: auto;
  font-size: 0.85rem;
  line-height: 1.4;
  color: #e0e0e0;
}

.image {
  margin-top: 30px;
  text-align: center;
}

.image img {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
}

.compose code {
  white-space: pre;
}
</style>
