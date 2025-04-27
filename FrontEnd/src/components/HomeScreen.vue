<template>
  <div class="home-screen">
    <!-- Show Input Form if OutputView or BenchmarkDialog is Hidden -->
    <div v-if="!showOutput && !showBenchmarkDialog">
      <h1>Software Quality Metric Calculator</h1>

      <div class="input-container1">
        <p>To assess the quality trends of your repository, please enter the Repository URL and then click Calculate. If we do not have any data for the entered repository URL, then it may take some time to compute and assess historical data.</p>
        
        <label for="github-url">Enter GitHub Repository URL:</label>
        <input
          type="text"
          id="github-url"
          v-model="githubUrl"
          placeholder="https://github.com/user/repository"
          @keyup.enter="checkGitHubRepoExists"
        />
        <button v-if="!isValidRepo" @click="checkGitHubRepoExists">Validate your URL</button>
        <p v-if="errorMessages.githubUrl" :class="{ error: !isValidRepo, success: isValidRepo }">
          {{ errorMessages.githubUrl }}
        </p>
      </div>

      <button @click="submitData" :disabled="!isValidRepo">
        {{ buttonText }}
      </button>

      <h4 class="loading-text" v-if="isLoading">
        Please Wait, your metrics are being computed.<br />
        The larger the repo, the longer the time.
      </h4>
    </div>

    <!-- Benchmark Dialog -->
    <div v-if="showBenchmarkDialog" class="dialog-overlay">
      <div class="dialog">
        <h4>For each metric, you can optionally enter a benchmark score in the input box and choose whether to display it
          on the chart by checking or unchecking the checkbox for that metric.</h4>
        <div class="benchmark-container">
          <div v-for="metric in availableMetrics" :key="metric.value" class="benchmark-item">
            <div class="label-input-container">
              <label :for="`benchmark-${metric.value}`">{{ metric.label }} Benchmark:</label>
              <input
                type="number"
                :id="`benchmark-${metric.value}`"
                v-model.number="benchmarkInputs[metric.benchmarkKey]"
                :placeholder="`Enter ${metric.label} benchmark`"
              />
            </div>
          </div>
        </div>
        <div class="button-container">
          <button @click="handleBenchmarkSubmit()">Apply/Continue</button>
        </div>
      </div>
    </div>

    <!-- Output View -->
    <OutputView
      v-if="showOutput"
      :computedData="computedData"
      :benchmarks="benchmarks"
      :showBenchmarkLines="showBenchmarkLines"
      @goBack="showFormAgain"
      @updateBenchmarks="postBenchmarks"
    />
  </div>
</template>

<script lang="ts">
import { ref, reactive, watch } from 'vue';
import axios from 'axios';
import TagInput from './TagInput.vue';
import OutputView from './OutputView.vue';

export default {
  name: 'HomeScreen',
  components: { TagInput, OutputView },
  setup() {
    const githubUrl = ref('');
    const errorMessages = reactive({ githubUrl: '' });
    const showOutput = ref(false);
    const isValidRepo = ref(false);

    const benchmarks = reactive({});
    const benchmarkInputs = reactive({});
    const showBenchmarkLines = reactive({});

    const tagsData = ref([]);
    const computedData = ref({});
    const showBenchmarkDialog = ref(false);
    const buttonText = ref('Calculate');
    const isLoading = ref(false);

    const availableMetrics = [
      {
        value: 'LCOM4',
        label: 'LCOM4',
        benchmarkKey: 'lcom4_benchmark',
      },
      {
        value: 'LCOMHS',
        label: 'LCOMHS',
        benchmarkKey: 'lcomhs_benchmark',
      },
      {
        value: 'DefectScore',
        label: 'Defect Score',
        benchmarkKey: 'defect_score_benchmark',
      },
      {
        value: 'AfferentCoupling',
        label: 'Afferent Coupling',
        benchmarkKey: 'afferent_coupling_benchmark',
      },
      {
        value: 'EfferentCoupling',
        label: 'Efferent Coupling',
        benchmarkKey: 'efferent_coupling_benchmark',
      },
      {
        value: 'DefectDensityAnalysis',
        label: 'Defect Density Analysis',
        benchmarkKey: 'defect_density_analysis_benchmark',
      },
      {
        value: 'Instability',
        label: 'Instability',
        benchmarkKey: 'instability_benchmark',
      },
    ];

    const isValidGitHubUrl = (url) => {
      const regex = /^https:\/\/github\.com\/[\w-]+\/[\w-]+\/?$/;
      return regex.test(url);
    };

    const checkGitHubRepoExists = async () => {
      isValidRepo.value = false;

      if (!githubUrl.value) {
        errorMessages.githubUrl = 'Repository URL cannot be empty.';
        return;
      }

      if (!isValidGitHubUrl(githubUrl.value)) {
        errorMessages.githubUrl = 'Invalid GitHub URL format.';
        return;
      }

      const repoPath = githubUrl.value.replace('https://github.com/', '');
      const apiUrl = `https://api.github.com/repos/${repoPath}/languages`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          errorMessages.githubUrl = 'GitHub repository does not exist.';
          return;
        }
        const files = await response.json();
        const keys = Object.keys(files);
        if (!keys.includes('Java')) {
          errorMessages.githubUrl =
            'The repository does not have a Java project.';
          return;
        }
        errorMessages.githubUrl = 'Valid GitHub Repository.';
        isValidRepo.value = true;
      } catch (error) {
        errorMessages.githubUrl = 'Error connecting to GitHub.';
      }
    };

    const submitData = async () => {
      buttonText.value = 'Loading…';
      isLoading.value = true;

      try {
        await calculateMetrics();
        showBenchmarkDialog.value = true;
      } catch (e) {
        console.error(e);
      } finally {
        isLoading.value = false;
        buttonText.value = 'Calculate';
      }
    };

    const calculateMetrics = async () => {
      try {
        const { data } = await axios.post(
          'http://localhost:8080/metrics',
          {
            repo_url: githubUrl.value,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              mode: 'cors',
            },
          }
        );
        computedData.value = data;
        console.log('Computed Data:', computedData.value);
        return true;
      } catch (error) {
        console.error('Error sending data to backend:', error);
        return false;
      }
    };

    const handleBenchmarkSubmit = async () => {
      showBenchmarkDialog.value = false; // close the dialog
      await postBenchmarks(benchmarkInputs);
      showOutput.value = true; // Show the output, with or without benchmarks
    };

    const postBenchmarks = async (benchmarkData) => {
      try {
        const lowerCaseBenchmarks = {};
        Object.keys(benchmarkData).forEach((key) => {
          if (benchmarkData[key] !== '') {
            lowerCaseBenchmarks[key.toLowerCase()] = benchmarkData[key];
          } else {
            lowerCaseBenchmarks[key.toLowerCase()] = benchmarks[key];
          }
        });
        const benchmarkRequest = await axios.post(
          'http://localhost:8080/gateway/benchmark',
          {
            gitHubLink: githubUrl.value,
            benchmarks: lowerCaseBenchmarks,
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
      } catch (error) {
        console.error('Error updating benchmarks:', error);
      }
    };

    const showFormAgain = () => {
      showOutput.value = false;
      buttonText.value = 'Calculate';
    };

    watch(githubUrl, () => {
      isValidRepo.value = false;
      errorMessages.githubUrl = '';
    });

    return {
      githubUrl,
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

.input-container1 {
  margin: 10px auto;
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

label {
  font-size: 16px;
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

input[type='text'],
input[type='number'] {
  display: block;
  width: 100%;
  padding: 10px;
  font-size: 15px;
  margin-bottom: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
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

.success {
  color: green;
  font-size: 14px;
  margin-top: 5px;
}

.loading-text {
  color: #0056b3;
}

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

.dialog h4 {
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.benchmark-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
}

.benchmark-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.dialog label {
  font-size: 14px;
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
  text-align: center;
}

.dialog input[type='number'] {
  width: 80%;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  text-align: center;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 5px;
  flex-direction: row-reverse;
}

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

.label-input-container input[type='number'] {
  padding: 5px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 220px;
  text-align: left;
}

.metric-row input[type='checkbox'] {
  width: 16px;
  height: 16px;
  margin-right: 5px;
}
</style>
