<template>
  <div style="background-color: #f4f4f5;overflow-y: auto; margin-bottom: 2em;">
    <!-- Show Input Form if OutputView or BenchmarkDialog is Hidden -->
    <div v-if="!showOutput && !showBenchmarkDialog" class="container-wrapper" style="background-color: #f4f4f5;">
      <div class="input-container1"
        style="background-color: #fefffe; border: 1px solid #ccc;padding: 4em 4em; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <p>To assess the quality trends of your repository, please enter the Repository URL and then click Calculate. If
          we do not have any data for the entered repository URL, then it may take some time to compute and assess
          historical data.</p>
        <label for="github-url">Enter GitHub Repository URL:</label>
        <input type="text" id="github-url" v-model="githubUrl" placeholder="https://github.com/user/repository"
          @keyup.enter="checkGitHubRepoExists" />
        <button v-if="!isValidRepo" @click="checkGitHubRepoExists" style="margin-top: 1em; margin-bottom: 1em;">Validate
          your
          URL</button>
        <p v-if="errorMessages.githubUrl" :class="{ error: !isValidRepo, success: isValidRepo }">
          {{ errorMessages.githubUrl }}
        </p>
        <div class="metric-selection" v-if="isValidRepo">
          <h4>Select Metrics to Calculate:</h4>
          <label><input type="checkbox" value="cc" v-model="selectedMetrics" @change="handleMetricChange" /> CC</label>
          <label>
            <input type="checkbox" value="cyclo" v-model="selectedMetrics" @change="handleMetricChange" />
            Cyclomatic Complexity
          </label>
          <label>
            <input type="checkbox" value="hal" v-model="selectedMetrics" @change="handleMetricChange" />
            Halstead
          </label>
          <label>
            <input type="checkbox" value="loc" v-model="selectedMetrics" @change="handleMetricChange" /> Lines of
            Code
          </label>
          <label>
            <input type="checkbox" value="defects-over-time" v-model="selectedMetrics" @change="handleMetricChange" />
            Defects Over Time
          </label>
          <label>
            <input type="checkbox" value="mttr" v-model="selectedMetrics" @change="handleMetricChange" />
            MTTR
          </label>
          <label>
            <input type="checkbox" value="ici" v-model="selectedMetrics" @change="handleMetricChange" />
            ICI
          </label>
          <label>
            <input type="checkbox" value="defects-stats" v-model="selectedMetrics" @change="handleMetricChange" />
            Defects Stats
          </label>

          <label>
            <input type="checkbox" value="fogindex" v-model="selectedMetrics" @change="handleMetricChange" />
            Fog Index
          </label>
          <label>
            <input type="checkbox" value="lcom4" v-model="selectedMetrics" @change="handleMetricChange" />
            LCOM4
          </label>


          <label>
            <input type="checkbox" value="lcomhs" v-model="selectedMetrics" @change="handleMetricChange" />
            LCOMHS
          </label>

        </div>
        <div class="calculate-button" style="margin-top: 1em;">
          <button @click="submitData" :disabled="!isValidRepo">
            {{ buttonText }}
          </button>
        </div>
      </div>
    </div>

    <!-- Benchmark Input Dialog -->
    <div v-if="showBenchmarkDialog" class="dialog-overlay">
      <div class="dialog">
        <h4>
          PLEASE NOTE
        </h4>
        <p>When running the metrics for the first time, the system will not have any data. In that case, it will compute
          the metrics based on the latest available data. This is done in tandem with verification of GitHub URL and its
          addition to shared volume. Consequently, the visualizations would contain only one
          data point.<br><br>
          If you want to see the visualizations with historical data, please try again at later time.</p>
        <br />
        <div class="button-container">
          <button @click="handleBenchmarkSubmit()">I understand</button>
        </div>
      </div>

      <OutputView :computedData="computedData" :benchmarks="benchmarks" :showBenchmarkLines="showBenchmarkLines"
        v-if="showOutput" @goBack="showFormAgain" @updateBenchmarks="postBenchmarks" />

    </div>
    <!-- Show Output Screen After Validation -->
    <OutputView :computedData="computedData" :benchmarks="benchmarks" :showBenchmarkLines="showBenchmarkLines"
      v-if="showOutput" @goBack="showFormAgain" @updateBenchmarks="postBenchmarks" />
    <LoadingSpinner v-if="isLoading" />

  </div>
  <!-- Footer Section
  <footer class="footer" v-if="!showOutput">
    <p>&copy; 2025 Metric Calculator. All rights reserved.</p>
    <p>
      Developed by: SER516 Class (Spring 2025)
    </p>
  </footer> -->
</template>

<script lang="ts">
import { ref, reactive, watch } from 'vue';
import axios from 'axios';
import TagInput from './TagInput.vue';
import OutputView from './OutputView.vue';
import LoadingSpinner from './LoadingSpinner.vue';

export default {
  name: 'HomeScreen',
  components: { TagInput, OutputView, LoadingSpinner },
  setup() {
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    const githubUrl = ref('');
    const selectedMetrics = ref([]);
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


    const isValidGitHubUrl = (url) => {
      const regex = /^https:\/\/github\.com\/[\w-]+\/[\w-]+\/?$/;
      return regex.test(url);
    };

    const checkGitHubRepoExists = async () => {
      isLoading.value = true;
      isValidRepo.value = false;

      if (!githubUrl.value) {
        errorMessages.githubUrl = 'Repository URL cannot be empty.';
        isLoading.value = false;
        return;
      }

      if (!isValidGitHubUrl(githubUrl.value)) {
        errorMessages.githubUrl = 'Invalid GitHub URL format.';
        isLoading.value = false;
        return;
      }

      const repoPath = githubUrl.value.replace('https://github.com/', '');

      try {
        const response = await axios.get(
          `https://api.github.com/repos/${repoPath}/languages`,
          {
            headers: {
              Authorization: `token ${token}`,
            },
          }
        );
        if (response.status !== 200) {
          errorMessages.githubUrl = 'GitHub repository does not exist.';
          isLoading.value = false;
          return;
        }
        const files = response.data;
        const keys = Object.keys(files);
        if (!keys.includes('Java')) {
          errorMessages.githubUrl =
            'The repository does not have a Java project.';
          isLoading.value = false;
          return;
        }
        errorMessages.githubUrl = 'Valid GitHub Repository.';

        const req = githubUrl.value;
        const res = await axios.post(
          'http://localhost:8080/add_repo',
          { repo_url: req },
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              mode: 'cors',
            },
          }
        );
        console.log('Response from backend:', res.data);
        if (res.status === 200) {
          console.log('Repository added successfully.');
        } else {
          console.error('Failed to add repository.');
        }
        isValidRepo.value = true;
      } catch (error) {
        console.error('Error checking GitHub repository:', error);
        errorMessages.githubUrl = 'Error connecting to GitHub.';
        isLoading.value = false;
        return;
      }
      isLoading.value = false;
    };

    const submitData = async () => {
      buttonText.value = 'Loading…';
      isLoading.value = true;

      try {
        await calculateMetrics();
        // showBenchmarkDialog.value = true;
      } catch (e) {
        console.error(e);
      } finally {
        isLoading.value = false;
        buttonText.value = 'Calculate';
      }
    };
    function sortByTimestamp<T extends { timestamp: string, data: any }>(arr: T[]) {
      return [...arr].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    }

    const calculateMetrics = async () => {

      try {
        const metrics = selectedMetrics.value;
        const req = `http://localhost:8080/get_metrics?repo_url=${githubUrl.value}&metrics=${metrics}`;
        const { data } = await axios.get(req);
        console.log('Response from backend:', data);
        const transformed = {CC: {}, ICI: {}, MTTR: {}, DefectsOverTime: {}, LOC: {}, Halstead: {}, Cyclo: {}, DefectsStats: {}, LCOM4: {}, LCOMHS: {}, FogIndex: {}};
        (data.metrics_data ?? []).forEach(group => {
          if (Array.isArray(group.cc) && group.cc.length) {
            const cc = sortByTimestamp(group.cc);
            const dates = cc.map(e => e.timestamp);                 // already ascending
            const added   = cc.map(e => e?.data?.added_lines);
            const deleted = cc.map(e => e?.data?.deleted_lines);
            const modified= cc.map(e => e.data.modified_lines);
            const commits = cc.map(e => e?.data?.total_commits);
            transformed.CC = {
              timestamp: dates,
              data: { added, deleted, modified, commits }
            };
          }

          if (Array.isArray(group.ici) && group.ici.length) {
            const ici = sortByTimestamp(group.ici);
            const dates = ici.map(e => e.timestamp);                 // already ascending
            const ici_score = ici.map(e => e?.data?.ici_score);
            const repo_size = ici.map(e => e?.data?.repo_size_mb);
            transformed.ICI = {
              timestamp: dates,
              data: { iCI_score: ici_score, repo_size_in_mB: repo_size }
            };
          }

          if (Array.isArray(group.mttr) && group.mttr.length) {
            const mttr = sortByTimestamp(group.mttr);
            const dates = mttr.map(e => e.timestamp);
            const mttr_time_in_hours = mttr.map(e => e?.data?.mttr);
            transformed.MTTR = {
              timestamp: dates,
              data: mttr_time_in_hours
            };
            console.log('MTTR:', transformed.MTTR);
          }


          if (Array.isArray(group['defects-over-time']) && group['defects-over-time'].length) {

            const defects = sortByTimestamp(group['defects-over-time']);
            const dates = defects.map(e => e.timestamp);                 // already ascending
            const defect_closure_rate = defects.map(e => e?.data?.defect_closure_rate_last_30_days);
            const defect_discovery_rate = defects.map(e => e?.data?.defect_discovery_rate_last_30_days);
            const open_issues = defects.map(e => e?.data?.open_issues);
            const completed_issues = defects.map(e => e?.data?.completed_issues);
            const total_issues = defects.map(e => e?.data?.total_issues);
            transformed.DefectsOverTime = {
              timestamp: dates,
              data: { defect_closure_rate_30d: defect_closure_rate, defect_discovery_rate_30d: defect_discovery_rate, open_issues, completed_issues, total_issues }
            };
          }

          if (Array.isArray(group.loc) && group.loc.length) {
            const locData = sortByTimestamp(group.loc);
            const dates = locData.map(e => e.timestamp);
            const extractedData = locData.map(e => e?.data);            // already ascending
            transformed.LOC = {
              timestamp: dates,
              data: extractedData
            };
          }

          if (Array.isArray(group.hal) && group.hal.length) {
            const halData = sortByTimestamp(group.hal);
            const summaryKeys = Object.keys(
              halData[0]?.data.find(e => e.Summary)?.Summary ?? {}
            );
            const metrics: Record<string, number[]> = Object.fromEntries(
              summaryKeys.map(k => [k, []])
            );
            const dates: string[] = [];
            halData.forEach(item => {
            dates.push(item.timestamp);

            const summary = item.data.find(e => e.Summary)?.Summary ?? {};
              summaryKeys.forEach(k => metrics[k].push(summary[k] ?? null));
            });

            transformed.Halstead = {
              timestamp: dates,
              data: {
                difficulty : metrics['Total Difficulty'],
                effort     : metrics['Total Efforts'],
                volume     : metrics['Total Program Volume'],
                vocabulary : metrics['Total Program Vocabulary'],
                length     : metrics['Total Program Length']
              }
            };
            console.log('Halstead:', transformed.Halstead);
          }

          if (Array.isArray(group['defects-stats']) && group['defects-stats'].length) {
            const stats = sortByTimestamp(group['defects-stats']);
            const dates = stats.map(e => e.timestamp);
            const percentages = stats.map(e => e?.data[0]?.percentageBugsClosed);

            transformed.DefectsStats = {
              timestamp: dates,
              data: percentages
            };
          }
          if (Array.isArray(group.lcom4) && group.lcom4.length) {
            const lcom4Data = sortByTimestamp(group.lcom4);
            const dates = lcom4Data.map(e => e.timestamp);                 // already ascending
            const lcom4_score = lcom4Data.map(e => e?.data[0]?.score);

            transformed.LCOM4 = {
              timestamp: dates,
              data: lcom4_score
            };
          }

          if (Array.isArray(group.lcomhs) && group.lcomhs.length) {
            const lcomhs = sortByTimestamp(group.lcomhs);
            const dates = lcomhs.map(e => e.timestamp);                 // already ascending
            const lcomhs_score = lcomhs.map(e => e?.data[0]?.score);

            transformed.LCOMHS = {
              timestamp: dates,
              data: lcomhs_score
            };
          }

          if (Array.isArray(group.fogindex) && group.fogindex.length) {
            const fogindex = sortByTimestamp(group.fogindex);
            const dates = fogindex.map(e => e.timestamp);                 // already ascending
            const fogindexactual = fogindex.map(e => e?.data[0]?.fogIndex);
            const pctComplexWordsList = fogindex.map(e => e?.data[0]?.percentageComplexWords);
            const totalFilesList = fogindex.map(e => e?.data[0]?.totalFiles);
            const avgSentenceLengthList = fogindex.map(e => e?.data[0]?.averageSentenceLength);
            transformed.FogIndex = {
              timestamp: dates,
              data: {
                fog_index: fogindexactual,
                pct_complex_words: pctComplexWordsList,
                total_files: totalFilesList,
                avg_sentence_length: avgSentenceLengthList,
              }
            };


          }
          if (Array.isArray(group.cyclo) && group.cyclo.length) {
            const cycloData = sortByTimestamp(group.cyclo);
            const dates = cycloData.map(e => e.timestamp);
            const keys = Object.entries(cycloData[0].data[0])
                     .filter(([, v]) => typeof v === 'number')
                     .map(([k]) => k);
            const metrics: Record<string, number[]> = Object.fromEntries(keys.map(k => [k, []]));
            cycloData.forEach(item => {
              item.data.forEach(obj => {
                const [k, v] = Object.entries(obj)[0] as [string, number];
                if (metrics[k] !== undefined) metrics[k].push(v);
              });
            });
            transformed.Cyclo = {
              timestamp: dates,
              data: metrics
            };
          }
        });
        computedData.value = transformed;
        showBenchmarkDialog.value = true;
      } catch (error) {
        console.error('Error sending data to backend:', error);
        return false;
      }
    };



    const handleBenchmarkSubmit = async () => {
      showBenchmarkDialog.value = false; // close the dialog
      // await postBenchmarks(benchmarkInputs);
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
      selectedMetrics,
    };
  },
};
</script>

<style scoped>
.container-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 100px);
  margin-top: -40px;
}

@media (min-height: 700px) {
  footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
  }
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
