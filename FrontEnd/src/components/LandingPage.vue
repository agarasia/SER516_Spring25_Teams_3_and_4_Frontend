<template>
  <div style="background-color: #f4f4f5;">
    <div class="landing">
      <!-- Top Section -->
      <div class="section glass">
        <div class="text">
          <h1>Welcome to Metric Calculator</h1>
          <p>A platform for calculating software quality metrics easily.</p>
        </div>
        <div class="image ">
          <img src="../assets/welcome_metrics.png" alt="Welcome Image" />
        </div>
      </div>

      <!-- Bottom Section -->
      <div class="section reverse glass">
        <div class="image">
          <img src="../assets/why_metrics.png" alt="Metrics Insight" />
        </div>
        <div class="text">
          <h2>Why Use Software Metrics?</h2>
          <p>
            Software metrics play a crucial role in evaluating the quality, maintainability, and complexity of your
            codebase.
            By measuring aspects like complexity, dependency, documentation, and defects, developers can make informed
            decisions about where to refactor, what to test, and how to optimize. Tracking these metrics helps maintain
            clean,
            efficient, and scalable software over time.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>



<script lang="ts">
export default {
  name: 'LandingPage',
};
</script>

<style scoped>
.landing {
  display: flex;
  flex-direction: column;
  gap: 60px;
  padding: 60px 40px;
  background-color: #fefffe;
}

.section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  gap: 40px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.section.reverse {
  flex-direction: row;
}

@media (max-width: 768px) {

  .section,
  .section.reverse {
    flex-direction: column;
  }
}

.text {
  flex: 1;
  min-width: 300px;
  text-align: left;
}

.text h1,
.text h2 {
  margin-bottom: 15px;
  font-size: 2rem;
}

.text p {
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
}

.image {
  flex: 1;
  min-width: 300px;
  text-align: center;
}

.image img {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
}

/* --- glassy card effect --- */
.glass {
  position: relative;
  padding: 32px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.12);
  /* subtle white tint */
  border: 1px solid #ccc;
  /* faint border */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  /* soft depth */
  backdrop-filter: blur(14px) saturate(180%);
  -webkit-backdrop-filter: blur(14px) saturate(180%);
  overflow: hidden;
  /* keeps children inside rounded corners */
}


/* tweak the image so it fills its card nicely */
.image img {
  width: 100%;
  height: auto;
  border-radius: 12px;
}
</style>
