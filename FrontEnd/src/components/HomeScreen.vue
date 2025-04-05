<template>
  <main>
    <h1>Metric Calculator</h1>

    <!-- Show Input Form if OutputView is Hidden -->
    <div v-if="!showOutput">
      <div class="input-container">
        <label for="github-url">Enter GitHub Repository URL:</label>
        <input type="text" id="github-url" v-model="githubUrl" placeholder="https://github.com/user/repository" @keyup.enter="checkGitHubRepoExists"/>
        <button @click="checkGitHubRepoExists">Validate your URL</button>
        <p v-if="errorMessages.githubUrl" :class="{ 'error': !isValidRepo, 'success': isValidRepo }">
          {{ errorMessages.githubUrl }}
        </p>
      </div>

      <div class="input-container">
        <label>Select Metrics to Calculate:</label>
        <div class="checkbox-group" :class="{ 'disabled': !isValidRepo }">
          <div class="checkbox-item" v-for="metric in availableMetrics" :key="metric.value">
            <input type="checkbox" :id="metric.value" :value="metric.value" v-model="selectedMetrics" :disabled="!isValidRepo" />
            <label :for="metric.value">{{ metric.label }}</label>
          </div>
        </div>
      </div>

      <!-- Benchmark Input Section -->
      <div class="input-container" v-if="selectedMetrics.length > 0">
        <h3>Set Benchmarks</h3>
        <div v-for="metric in selectedMetrics" :key="metric">
          <label :for="metric + '-benchmark'">{{ metric }} Benchmark:</label>
          <input type="number" :id="metric + '-benchmark'" v-model.number="benchmarks[metric]" />
        </div>
      </div>

      <!-- Tag Input Box for Defect Score -->
      <div class="input-container" v-if="selectedMetrics.includes('DefectScore')">
        <h5>You can find the Defect tags and weights extracted from your project in the box below. If no tags were found, here are some default tags and weights. Customize them according to your need and click Update.</h5>
        <div class="tag-input">
          <input
            type="text"
            v-model="tagInput"
            @keyup.enter="addTag"
            placeholder="Add input and press Enter"
          />
          <div class="tags">
            <span v-for="(tag, index) in defectScoreTags" :key="index" class="tag">
              {{ tag }}
              <span class="remove-tag" @click="removeTag(index)">×</span>
            </span>
          </div>
          <h5>Once you have customized all of your tags and their weights, click on the Submit button.</h5>
        </div>
      </div>

      <button @click="submitData" :disabled="!isValidRepo || selectedMetrics.length === 0 || (selectedMetrics.includes('DefectScore') && defectScoreTags.length === 0)">Submit</button>
    </div>

    <!-- Show Output Screen After Validation -->
    <OutputView :computedData="computedData" :benchmarks="benchmarks" v-if="showOutput" @goBack="showFormAgain" />
  </main>
</template>

<script>
import { ref, reactive, watch } from 'vue';
import axios from 'axios';
import OutputView from './OutputView.vue';

export default {
  components: {
    OutputView
  },
  setup() {
    const githubUrl = ref('');
    const selectedMetrics = ref([]);
    const errorMessages = ref({ githubUrl: '' });
    const showOutput = ref(false);
    const isValidRepo = ref(false);

    const tagInput = ref('');
    const defectScoreTags = ref([]);

    // reactive object to hold benchmarks for each metric
    const benchmarks = reactive({});

    const computedData = ref({});

    const availableMetrics = [
      { value: 'LCOM4', label: 'LCOM4' },
      { value: 'LCOMHS', label: 'LCOMHS' },
      { value: 'DefectScore', label: 'Defect Score' }
    ];

    const isValidGitHubUrl = (url) => {
      const regex = /^https:\/\/github\.com\/[\w-]+\/[\w-]+\/?$/;
      return regex.test(url);
    };

    // fetch benchmark values using your GET gateway/benchmark API
    const fetchBenchmarks = async () => {
      try {
        const list = JSON.parse(JSON.stringify(selectedMetrics.value));
        let metricsString = list.join(", ");
        const response = await axios.get(`http://localhost:8080/gateway/benchmark?gitHubLink=${githubUrl.value}&metrics=${metricsString}`, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            mode: 'cors'
          }
        });
        // Sample response:
        // {
        //   "LCOM4": { "lcom4_benchmark": 1 },
        //   "DefectScore": { "sefect_score_benchmark": 2 },
        //   "LCOMHS": { "lcomhs_benchmark": 3 }
        // }
        selectedMetrics.value.forEach(metric => {
          let benchmarkKey = '';
          if (metric === 'LCOM4') {
            benchmarkKey = 'lcom4_benchmark';
          } else if (metric === 'LCOMHS') {
            benchmarkKey = 'lcomhs_benchmark';
          } else if (metric === 'DefectScore') {
            benchmarkKey = 'defect_score_benchmark';
          }
          if (response.data[metric] && response.data[metric][benchmarkKey] !== undefined) {
            benchmarks[metric] = response.data[metric][benchmarkKey];
          } else {
            benchmarks[metric] = 0; // default if none is returned
          }
        });
      } catch (error) {
        console.error("Error fetching benchmarks:", error);
      }
    };

    // When metrics are selected, fetch benchmarks and (if applicable) defect score tag mapping
    watch(selectedMetrics, async (newMetrics) => {
      if (newMetrics.length > 0) {
        // For DefectScore, fetch the label mapping if that metric is selected
        if (newMetrics.includes('DefectScore')) {
          try {
            const response = await axios.get(`http://localhost:8080/gateway/defectscore/labelmapping?gitHubLink=${githubUrl.value}`, {
              headers: {
                'Access-Control-Allow-Origin': '*',
                mode: 'cors'
              }
            });
            defectScoreTags.value = [];
            Object.entries(response.data).forEach(([tag, weight]) => {
              defectScoreTags.value.push(`${tag}: ${weight}`);
            });
          } catch (error) {
            console.error("Error fetching defect score label mapping:", error);
          }
        }
        // Fetch benchmarks for all selected metrics
        await fetchBenchmarks();
      }
    });

    const checkGitHubRepoExists = async () => {
      isValidRepo.value = false;
      if (!isValidGitHubUrl(githubUrl.value)) {
        errorMessages.value.githubUrl = "Invalid GitHub URL format.";
        return;
      }

      const repoPath = githubUrl.value.replace("https://github.com/", "");
      const apiUrl = `https://api.github.com/repos/${repoPath}/languages`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          errorMessages.value.githubUrl = "GitHub repository does not exist.";
          return;
        }
        const files = await response.json();
        const keys = Object.keys(files);

        if (!keys.includes("Java")) {
          errorMessages.value.githubUrl = "The repository does not have a Java project.";
          return;
        }

        errorMessages.value.githubUrl = "Valid GitHub repository.";
        isValidRepo.value = true;
      } catch (error) {
        errorMessages.value.githubUrl = "Error connecting to GitHub.";
      }
    };

    const sendDataToBackend = async () => {
      try {
        const list = JSON.parse(JSON.stringify(selectedMetrics.value));
        let metricsString = list.join(", ");
        const req = await axios.post(
          'http://localhost:8080/gateway/calculate',
          {
            "gitHubLink": githubUrl.value,
            "metrics": metricsString
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              mode: 'cors'
            }
          }
        );
        computedData.value = req.data;
        return true;
      } catch (error) {
        console.error("Error sending data to backend:", error);
        return false;
      }
    };

    const submitData = async () => {
      // Build the defect score label mapping
      const tags = defectScoreTags.value.map(tag => tag.split(":")[0].trim());
      const weights = defectScoreTags.value.map(tag => tag.split(":")[1].trim());
      const dictionary = {};
      for (let i = 0; i < tags.length; i++) {
        dictionary[tags[i]] = Number(weights[i]);
      }

      try {
        const request = await axios.post(
          'http://localhost:8080/gateway/defectscore/labelmapping',
          {
            "gitHubLink": githubUrl.value,
            "labelSeverityMap": dictionary
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              mode: 'cors'
            }
          }
        );
        console.log("Defect Score Mapping:", request.data);
      } catch (error) {
        console.error("Error updating defect score mapping:", error);
        return;
      }

      // If the user updated the benchmark, post the new benchmark data
      try {
        const list = JSON.parse(JSON.stringify(selectedMetrics.value));
        let metricsString = list.join(", ");
        const lowerCaseBenchmarks = Object.fromEntries(
          Object.entries(benchmarks).map(([key, value]) => [key.toLowerCase(), value])
        );
        const benchmarkRequest = await axios.post(
          'http://localhost:8080/gateway/benchmark',
          {
            "gitHubLink": githubUrl.value,
            "benchmarks": lowerCaseBenchmarks,
            "metrics": metricsString
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              mode: 'cors'
            }
          }
        );
        console.log("Benchmark updated:", benchmarkRequest.data);
      } catch (error) {
        console.error("Error updating benchmarks:", error);
      }

      // Only show the output view if the backend call for metrics was successful
      const success = await sendDataToBackend();
      if (success) {
        showOutput.value = true;
      } else {
        console.error("Failed to load metrics data");
      }
    };

    const showFormAgain = () => {
      showOutput.value = false;
    };

    const addTag = () => {
      if (tagInput.value.trim() !== '') {
        defectScoreTags.value.push(tagInput.value.trim());
        tagInput.value = '';
      }
    };

    const removeTag = (index) => {
      defectScoreTags.value.splice(index, 1);
    };

    return {
      githubUrl,
      selectedMetrics,
      errorMessages,
      submitData,
      showOutput,
      showFormAgain,
      tagInput,
      defectScoreTags,
      addTag,
      removeTag,
      checkGitHubRepoExists,
      isValidRepo,
      availableMetrics,
      computedData,
      benchmarks
    };
  }
};
</script>

<style scoped>
main {
  text-align: center;
  padding: 40px 20px;
}

.input-container {
  margin: 20px auto;
  width: 80%;
  max-width: 500px;
  text-align: left;
}

label {
  font-size: 16px;
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

input[type="text"],
input[type="number"] {
  display: block;
  width: 100%;
  padding: 10px;
  font-size: 16px;
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
</style>
