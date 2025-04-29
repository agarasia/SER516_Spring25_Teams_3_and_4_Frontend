<template>
  <div class="metrics-guide-container">
    <div class="metrics-guide-box">
      <p class="metrics-guide-heading">Metrics Guide</p>
      <hr style="width: 3.8%; margin-left: 1.8px; height: 2px; background-color: #4A6C8B;">
      <p id="metrics-guide-overview">
        The Metrics Guide offers a thorough description of the many software quality metrics that are used to assess and enhance your codebase's readability, maintainability, and general quality. These metrics assist teams and developers in spotting any problems, improving performance, and making sure the code complies with best practices. You can attain greater software quality and dependability by prioritizing development efforts, testing, and refactoring using knowledge of these metrics.<br><br>
        The following page elucidates the various metrics and their significance in the context of software development.
      </p>

      <div class="metrics-guide-box" style="margin-left: -2.7%; border: 0; box-shadow: none;">
        <div class="metric-category">
            <span style="display: inline-flex; align-items: center;">
            <span style="width: 10px; height: 10px; background-color: violet; border-radius: 50%; margin-right: 0.4em;"></span>
            Complexity
            </span>
        </div>
        <div class="metric-heading-container">
          <img src="https://img.icons8.com/?size=100&id=94186&format=png&color=000000" alt="Icon" style="width: 22px; height: 22px; margin-top:1.25em; padding-right:0.5em">
          <h1 class="metric-heading">McCabe's Cyclomatic Complexity</h1>
        </div>
        <p>Number of linearly independent paths through the source code.</p>
        <hr style="width: 96.8%; margin-left: 0em; height: 0.1px; border: 0px; background-color: #ccc;">
        <div class="metric-overview" style="width: 95%;">
          <h2>Overview</h2>
            <p style="font-weight: 500;">McCabe's Cyclomatic Complexity measures independent paths in code, aiding in identifying complexity, maintainability, and risks to improve quality and reliability.</p>
          <h2>How to use this metric</h2>
            <p style="font-weight: 500;">Use Cyclomatic Complexity to identify overly complex code sections, prioritize refactoring efforts, and improve maintainability. It helps in assessing the risk of changes and ensuring better test coverage by focusing on independent paths.</p>
            <div class="important-considerations">
              <div class="important-header">
                <img src="https://img.icons8.com/ios-filled/50/ffa500/error--v1.png" alt="Important Icon" class="important-icon" />
                <span>Important Considerations</span>
              </div>
              <p>
                Ensure that Cyclomatic Complexity values are regularly reviewed and kept within acceptable thresholds. Excessively high values can indicate unmanageable code, while overly low values may suggest insufficient functionality.
              </p>
            </div>
            <h2>Interpretation</h2>
              <p style="font-weight: 500;">
                Higher Cyclomatic Complexity values indicate more complex code, which may be harder to maintain and test. Lower values suggest simpler, more maintainable code. Aim for a balance to ensure code quality and functionality.
              </p>
              
        </div>
      </div>
    </div>
    </div>
</template>

<script>
export default {
  name: 'MetricsGuide',
};
</script>

<style scoped>
.metric-category {
  background-color: #d5d5d5;
  padding: 0.4em;
  border-radius: 5px;
  width: fit-content;
  font-weight: normal;
}

.metrics-guide-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5; /* Optional: Add a light background color */
  padding-bottom: 18em; /* Add extra space at the bottom to avoid footer obstruction */
  padding-top: 11em;
}

.metric-heading-container {
  display: flex;
  margin-bottom: 1em; /* Space below the heading */
}

#metrics-guide-overview {
  font-size: 1.2em;
  color: #555; /* Optional: Change text color */
  margin-top: 2.5em; /* Space above the paragraph */
  margin-bottom: 4em; /* Space below the paragraph */
  margin-right: 2em; /* Space to the right */
}

.metrics-guide-heading {
  font-size: 2.5em;
  font-weight: bold;
  color: #333; /* Optional: Change text color */
  margin-bottom: -0.4em; /* Space below the heading */
}
.metrics-guide-box {
  width: 60vw;
  max-width: 1200px; /* Optional: Limit the maximum width */
  border-radius: 10px;
  border: 1px solid #ccc;
  text-align: left;
  margin: 3em;
  padding-left: 1.5em;
  background-color: #fff; /* Optional: Add a white background for contrast */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Optional: Add a subtle shadow */
}

.metric-heading {
  font-size: 1.5em;
  font-weight: bold;
  color: #333; /* Optional: Change text color */
  margin-bottom: -0.4em; /* Space below the heading */
}

.important-considerations {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.important-header {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 1.2em;
  color: #333;
}

.important-icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}
</style>
