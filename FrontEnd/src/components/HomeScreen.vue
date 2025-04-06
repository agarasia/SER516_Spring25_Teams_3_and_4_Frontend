<template>
  <header v-if="!showOutput">
      <h1>Metric Calculator</h1>
    </header>
  <main>
    
    <!-- Show Input Form if OutputView or BenchmarkDialog is Hidden -->
    <div v-if="!showOutput && !showBenchmarkDialog">
      <div class="input-container1">
        <label for="github-url">Enter GitHub Repository URL:</label>
        <input type="text" id="github-url" v-model="githubUrl" placeholder="https://github.com/user/repository"
          @keyup.enter="checkGitHubRepoExists" />
        <button v-if="!isValidRepo" @click="checkGitHubRepoExists">Validate your URL</button>
        <p v-if="errorMessages.githubUrl" :class="{ 'error': !isValidRepo, 'success': isValidRepo }">
          {{ errorMessages.githubUrl }}
        </p>
      </div>

      <br>
      <br>
      <div class="container-wrapper">
        <div
          :class="{ 'input-container2': !selectedMetrics.includes('DefectScore'), 'input-container-defect': selectedMetrics.includes('DefectScore') }"
          v-if="isValidRepo">
          <label>Select Metrics to Calculate:</label>
          <div class="checkbox-group">
            <div class="checkbox-item" v-for="metric in availableMetrics" :key="metric.value">
              <input type="checkbox" :id="metric.value" :value="metric.value" v-model="selectedMetrics"
                :disabled="!isValidRepo" />
              <label :for="metric.value">{{ metric.label }}</label>
            </div>
          </div>
        </div>

        <!-- Tag Input Box for Defect Score -->
        <div class="input-container3" v-if="selectedMetrics.includes('DefectScore')">
          <label1>You can find the Defect tags and weights extracted from your project in the box below. If no tags
            were
            found, here are some default tags and weights. Customize them according to your need and click Update.
          </label1>
          <TagInput v-model:tags="tagsData" />
          <label1>Once you have customized all of your tags and their weights, click on the Calculate button.</label1>
        </div>
      </div>
      <br>
      <br>
      <button v-if="selectedMetrics.length > 0" @click="submitData"
        :disabled="!isValidRepo || selectedMetrics.length === 0 || (selectedMetrics.includes('DefectScore') && tagsData.length === 0)">{{
          buttonText }}</button>
      <h4 class="loading-text" v-if="isLoading">Please Wait, your metrics are being computed.<br>The larger the reop,
        the longer the time.</h4>
    </div>

    <!-- Benchmark Input Dialog -->
    <div v-if="showBenchmarkDialog" class="dialog-overlay">
      <div class="dialog">
        <h4>For each selected metric,
          you can optionally enter a benchmark
          score in the input box and choose whether to display it
          on the chart by checking or unchecking the checkbox for that metric</h4>
        <br>
        <div class="benchmark-container">
          <div v-for="metric in availableMetrics" :key="metric.value" class="benchmark-item">
            <div v-if="selectedMetrics.includes(metric.value)" class="metric-row">
              <input type="checkbox" :id="`show-${metric.value}`" v-model="showBenchmarkLines[metric.value]" />
              <div class="label-input-container">
                <label :for="`benchmark-${metric.value}`">
                  {{ metric.label }} Benchmark:
                </label>
                <input type="number" :id="`benchmark-${metric.value}`" v-model.number="benchmarkInputs[metric.value]"
                  :placeholder="`Enter ${metric.label} benchmark`" />
              </div>
            </div>
          </div>
        </div>

        <div class="button-container">
          <button @click="handleBenchmarkSubmit(true)">Apply/Continue</button>
        </div>
      </div>
    </div>


    <!-- Show Output Screen After Validation -->
    <OutputView :computedData="computedData" :benchmarks="benchmarks" :showBenchmarkLines="showBenchmarkLines"
      v-if="showOutput" @goBack="showFormAgain" @updateBenchmarks="postBenchmarks" />
  </main>
  <!-- Footer Section -->
  <footer class="footer" v-if="!showOutput">
    <p>&copy; 2024 Metric Calculator. All rights reserved.</p>
    <p>Developed by: Aniket Patil, Aum Garasia, Satyam Shekhar, Uma Maheswar Reddy Nallamilli</p>
  </footer>
</template>

<script>
import { ref, reactive, watch, onMounted } from 'vue';
import axios from 'axios';
import TagInput from "./TagInput.vue";
import OutputView from './OutputView.vue';

export default {
  components: {
    OutputView,
    TagInput,
  },
  setup() {
    const githubUrl = ref('');
    const selectedMetrics = ref([]);
    const errorMessages = ref({ githubUrl: '' });
    const showOutput = ref(false);
    const isValidRepo = ref(false);
    const tagComponent = ref([]);
    // reactive object to hold benchmarks for each metric
    const benchmarks = reactive({});
    //New ref for benchmark input dialog
    const showBenchmarkDialog = ref(false);
    const benchmarkInputs = ref({});
    const showBenchmarkLines = ref({});

    const tagsData = ref([]);
    const computedData = ref({});
    // Loading state
    const isLoading = ref(false);
    const loadingText = ref('Loading...');
    const buttonText = ref('Calculate');
    const availableMetrics = [
      { value: 'LCOM4', label: 'LCOM4' },
      { value: 'LCOMHS', label: 'LCOMHS' },
      { value: 'DefectScore', label: 'Defect Score' },
      { value: 'AfferentCoupling', label: 'Afferent Coupling' },
      { value: 'EfferentCoupling', label: 'Efferent Coupling' },
      { value: 'DefectDensityAnalysis', label: 'Defect Density Analysis' }
    ];

    const isValidGitHubUrl = (url) => {
      const regex = /^https:\/\/github\.com\/[\w-]+\/[\w-]+\/?$/;
      return regex.test(url);
    };

    const fetchBenchmarks = async () => {
      try {
        const list = JSON.parse(JSON.stringify(selectedMetrics.value));
        let metricsString = list.join(", ");
        const response = await axios.get(
          `http://localhost:8080/gateway/benchmark?gitHubLink=${githubUrl.value}&metrics=${metricsString}`,
          {
            headers: {
              'Access-Control-Allow-Origin': '*',
              mode: 'cors',
            },
          }
        );
        // Sample response:
        // {
        //   "LCOM4": { "lcom4_benchmark": 1 },
        //   "DefectScore": { "sefect_score_benchmark": 2 },
        //   "LCOMHS": { "lcomhs_benchmark": 3 }
        // }
        selectedMetrics.value.forEach((metric) => {
          let benchmarkKey = '';
          if (metric === 'LCOM4') {
            benchmarkKey = 'lcom4_benchmark';
          } else if (metric === 'LCOMHS') {
            benchmarkKey = 'lcomhs_benchmark';
          } else if (metric === 'DefectScore') {
            benchmarkKey = 'defect_score_benchmark';
          } else if (metric === 'AfferentCoupling') {
            benchmarkKey = 'afferent_coupling_benchmark';
          }  else if (metric === 'EfferentCoupling') {
            benchmarkKey = 'efferent_coupling_benchmark';
          }else if (metric === 'DefectDensityAnalysis') {
            benchmarkKey = 'defect_density_analysis_benchmark';
          }
          if (
            response.data[metric] &&
            response.data[metric][benchmarkKey] !== undefined
          ) {
            benchmarks[metric] = response.data[metric][benchmarkKey];
          } else {
            benchmarks[metric] = 0; // default if none is returned
          }
        });
      } catch (error) {
        console.error('Error fetching benchmarks:', error);
      }
    };

    const fetchTags = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/gateway/defectscore/labelmapping?gitHubLink=${githubUrl.value}`,
          {
            headers: {
              'Access-Control-Allow-Origin': '*',
              mode: 'cors',
            },
          }
        );
        tagsData.value = response.data;
        console.log(tagsData.value);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    // When metrics are selected, fetch benchmarks and (if applicable) defect score tag mapping
    watch(selectedMetrics, async (newMetrics) => {
      if (newMetrics.length > 0) {
        // For DefectScore, fetch the label mapping if that metric is selected
        const apiCalls = [];
        if (newMetrics.includes('DefectScore')) {
          apiCalls.push(fetchTags());
        }
        // Fetch benchmarks for all selected metrics
        apiCalls.push(fetchBenchmarks());
        await Promise.all(apiCalls);
        // Initialize benchmarkInputs with fetched benchmark values
        availableMetrics.forEach((metric) => {
          if (newMetrics.includes(metric.value)) {
            benchmarkInputs.value[metric.value] = benchmarks[metric.value] || ''; // Use fetched benchmark or default to empty string
            showBenchmarkLines.value[metric.value] = true; // Default showBenchmarkLines to true
          }
        });
      }
    });

    const checkGitHubRepoExists = async () => {
      isValidRepo.value = false;

      if (!githubUrl.value) {
        errorMessages.value.githubUrl = 'Repository URL cannot be empty.';
        return;
      }

      if (!isValidGitHubUrl(githubUrl.value)) {
        errorMessages.value.githubUrl = 'Invalid GitHub URL format.';
        return;
      }

      const repoPath = githubUrl.value.replace('https://github.com/', '');
      const apiUrl = `https://api.github.com/repos/${repoPath}/languages`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          errorMessages.value.githubUrl = 'GitHub repository does not exist.';
          return;
        }
        const files = await response.json();
        const keys = Object.keys(files);
        if (!keys.includes('Java')) {
          errorMessages.value.githubUrl =
            'The repository does not have a Java project.';
          return;
        }
        errorMessages.value.githubUrl = 'Valid GitHub Repository.';
        isValidRepo.value = true;
      } catch (error) {
        errorMessages.value.githubUrl = 'Error connecting to GitHub.';
      }
    };
    watch(githubUrl, () => {
      isValidRepo.value = false;
      errorMessages.value.githubUrl = '';
      selectedMetrics.value = [];
    });

    const calculateMetrics = async () => {
      try {
        const list = JSON.parse(JSON.stringify(selectedMetrics.value));
        let metricsString = list.join(", ");
        const req = await axios.post(
          'http://localhost:8080/gateway/calculate',
          {
            gitHubLink: githubUrl.value,
            metrics: metricsString,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              mode: 'cors',
            },
          }
        );
        computedData.value = req.data;
        return true;
      } catch (error) {
        console.error('Error sending data to backend:', error);
        return false;
      }
    };

    const postLabelMapping = async () => {
      try {
        const request = await axios.post(
          'http://localhost:8080/gateway/defectscore/labelmapping',
          {
            gitHubLink: githubUrl.value,
            labelSeverityMap: tagsData.value,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              mode: 'cors',
            },
          }
        );
        console.log('Defect Score Mapping:', request.data);
      } catch (error) {
        console.error('Error updating defect score mapping:', error);
        return;
      }
    };

    const submitData = async () => {
      const promises = [];
      promises.push(postLabelMapping());
      buttonText.value = 'Loading...';
      await Promise.all(promises);

      // Only show the output view if the backend call for metrics was successful
      const success = await calculateMetrics();
      if (success) {
        showBenchmarkDialog.value = true; // Show benchmark dialog after successful data submission
      } else {
        console.error('Failed to load metrics data');
      }
    };

    const showFormAgain = () => {
      showOutput.value = false;
      buttonText.value = 'Calculate';
    };

    //New function to handle the benchmark submission
    const handleBenchmarkSubmit = async () => {
      showBenchmarkDialog.value = false; // close the dialog
      await postBenchmarks(benchmarkInputs.value);
      showOutput.value = true; //Show the output, with or without benchmarks
    };

    const postBenchmarks = async (benchmarkData) => {
      try {
        const list = JSON.parse(JSON.stringify(selectedMetrics.value));
        let metricsString = list.join(", ");
        const lowerCaseBenchmarks = {};
        Object.keys(benchmarkData).forEach((key) => {
          // If the benchmark is provided, update the value
          if (benchmarkData[key] !== '') {
            lowerCaseBenchmarks[key.toLowerCase()] = benchmarkData[key];
          }
          // If the benchmark is not provided, use the previous value
          else {
            lowerCaseBenchmarks[key.toLowerCase()] = benchmarks[key];
          }
        });
        const benchmarkRequest = await axios.post(
          'http://localhost:8080/gateway/benchmark',
          {
            gitHubLink: githubUrl.value,
            benchmarks: lowerCaseBenchmarks,
            metrics: metricsString,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              mode: 'cors',
            },
          }
        );
        console.log('Benchmark updated:', benchmarkRequest.data);
        // Retrieve the updated benchmarks
        fetchBenchmarks();
      } catch (error) {
        console.error('Error updating benchmarks:', error);
      }
    };

    return {
      githubUrl,
      selectedMetrics,
      errorMessages,
      submitData,
      showOutput,
      showFormAgain,
      checkGitHubRepoExists,
      isValidRepo,
      availableMetrics,
      computedData,
      benchmarks,
      tagsData,
      isLoading,
      loadingText,
      buttonText,
      postBenchmarks,
      showBenchmarkDialog,
      benchmarkInputs,
      handleBenchmarkSubmit,
      showBenchmarkLines,
    };
  },
};
</script>

<style scoped>


header {
  background: linear-gradient(to right, #09203f, #537895);
  padding: px;
  text-align: center;
  color: white;
  font-size: 24px;
  font-weight: bold;
  border-radius: 0;
  width: 100%;
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  z-index: 1000;
}

.footer {
  background: linear-gradient(to right, #09203f, #537895);
  padding: px;
  text-align: center;
  color: white;
  font-size: 10px;
  font-weight: bold;
  border-radius: 0;
  width: 100%;
  position: fixed;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 1000;
}

.input-container1 {
  margin: 100px auto;
  margin-bottom: 5px;
  width: 80%;
  max-width: 500px;
  text-align: left;
}

.container-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 0px;
  width: 100%;
}

.input-container2 {
  margin: 10px auto;
  width: 100%;
  max-width: 500px;
  margin-left: 500px;
  text-align: left;
}

.input-container3 {
  margin-top: 20px auto;
  width: 50%;
  max-width: 400px;
  text-align: left;
  margin-left: 0px;
  margin-right: 320px;
  margin-bottom: 0px;
  padding-left: 20px;
  border-left: 1px solid #007bff;
}


.input-container-defect {
  margin: 10px auto;
  margin-left: 450px;
  text-align: left;
}


label {
  font-size: 16px;
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

label1 {
  font-size: 13px;
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

input[type="text"],
input[type="number"] {
  display: block;
  width: 100%;
  padding: 10px;
  font-size: 15px;
  margin-bottom: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.error {
  color: red;
  font-size: 14px;
  margin-top: 5px;
}

button {
  margin-top: 10px;
  padding: 10px 20px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.tag-input {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag {
  background-color: #e0e0e0;
  padding: 5px 10px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.remove-tag {
  cursor: pointer;
  font-weight: bold;
  color: red;
}

.success {
  color: green;
  font-size: 14px;
  margin-top: 5px;
}

.checkbox-group.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.loading-text {
  color: #0056b3;
}

/* Styles for the dialog */
/* Overlay for the dialog */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Dialog box styling */
.dialog {
  background-color: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
  text-align: center;
  width: 40%;
  max-width: 500px;
  min-width: 350px;
}

/* Header styling */
.dialog h3 {
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

/* Container for all benchmark inputs */
.benchmark-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
}

/* Individual benchmark item */
.benchmark-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

/* Label styling */
.dialog label {
  font-size: 14px;
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
  text-align: center;
}

/* Input field styling */
.dialog input[type="number"] {
  width: 80%;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  text-align: center;
}

/* Checkbox container */
.checkbox-container {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 5px;
  flex-direction: row-reverse;
}

/* Button styling */
.button-container {
  margin-top: 20px;
}

.dialog button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.dialog button:hover {
  background-color: #0056b3;
}

.metric-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  margin-bottom: 10px;
  width: 100%;
}

.label-input-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.label-input-container label {
  white-space: nowrap;
  font-weight: bold;
}

.label-input-container input[type="number"] {
  padding: 5px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 220px;
  text-align: left;
}

.metric-row input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin-right: 5px;
}
</style>
