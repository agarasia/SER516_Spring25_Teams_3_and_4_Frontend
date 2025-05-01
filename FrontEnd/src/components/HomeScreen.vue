<template>
  <!-- <header v-if="!showOutput">
    <h1>Software Quality Metric Calculator</h1>
  </header> -->
  <main>
    <!-- Show Input Form if OutputView or BenchmarkDialog is Hidden -->
    <div v-if="!showOutput && !showBenchmarkDialog">
      <div class="input-container1">
        <p>To assess the quality trends of your repository, please enter the Repository URL and then click Calculate. If
          we do not have any data for the entered repository URL, then it may take some time to compute and assess
          historical data.</p>
        <label for="github-url">Enter GitHub Repository URL:</label>
        <input type="text" id="github-url" v-model="githubUrl" placeholder="https://github.com/user/repository"
          @keyup.enter="checkGitHubRepoExists" />
        <button v-if="!isValidRepo" @click="checkGitHubRepoExists">Validate your URL</button>
        <p v-if="errorMessages.githubUrl" :class="{ error: !isValidRepo, success: isValidRepo }">
          {{ errorMessages.githubUrl }}
        </p>
        <div class="metric-selection">
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
                <input type="checkbox" value="defects-over-time" v-model="selectedMetrics"
                       @change="handleMetricChange" /> Defects Over Time
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

        </div>
      </div>



      <br />
      <br />
      <!-- <div class="container-wrapper">
      <div class="input-container2" v-if="isValidRepo">
        <label>All metrics will be calculated automatically.</label>
      </div>

    </div>
    <br />
    <br /> -->
      <button @click="submitData" :disabled="!isValidRepo">
        {{ buttonText }}
      </button>
      <h4 class="loading-text" v-if="isLoading">
        Please Wait, your metrics are being computed.<br />
        The larger the repo, the longer the time.
      </h4>
    </div>

    <!-- Benchmark Input Dialog -->
    <div v-if="showBenchmarkDialog" class="dialog-overlay">
      <div class="dialog">
        <h4>
          For each metric, you can optionally enter a benchmark score in the input box and choose whether to display it
          on the chart by checking or unchecking the checkbox for that metric.
        </h4>
        <br />
        <div class="benchmark-container">
          <div v-for="metric in availableMetrics" :key="metric.value" class="benchmark-item">
            <div class="label-input-container">
              <label :for="`benchmark-${metric.value}`">
                {{ metric.label }} Benchmark:
              </label>
              <input type="number" :id="`benchmark-${metric.value}`"
                v-model.number="benchmarkInputs[metric.benchmarkKey]"
                :placeholder="`Enter ${metric.label} benchmark`" />
            </div>
          </div>
        </div>
      </div>

      <div class="button-container">
        <button @click="handleBenchmarkSubmit()">Apply/Continue</button>
      </div>
      <OutputView :computedData="computedData" :benchmarks="benchmarks" :showBenchmarkLines="showBenchmarkLines"
        v-if="showOutput" @goBack="showFormAgain" @updateBenchmarks="postBenchmarks" />
    </div>

    <!-- Show Output Screen After Validation -->
    <OutputView :computedData="computedData" :benchmarks="benchmarks" :showBenchmarkLines="showBenchmarkLines"
      v-if="showOutput" @goBack="showFormAgain" @updateBenchmarks="postBenchmarks" />
  </main>
  <!-- Footer Section -->
  <footer class="footer" v-if="!showOutput">
    <p>&copy; 2025 Metric Calculator. All rights reserved.</p>
    <p>
      Developed by: SER516 Class (Spring 2025)
    </p>
  </footer>
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
        // Finally, add repo to shared volume.
        const req = githubUrl.value.toLowerCase();
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
        errorMessages.githubUrl = 'Error connecting to GitHub.';
      }
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

    const calculateMetrics = async () => {

      try {
        const metrics = selectedMetrics.value;
        const req = `http://localhost:8080/get_metrics?repo_url=${githubUrl.value}&metrics=${metrics}`.toLowerCase();

        const { data } = await axios.get(req);
        console.log('Response from backend:', data);
        const transformed = {};
        (data.metrics_data ?? []).forEach(group => {
            if (Array.isArray(group.cc) && group.cc.length) {
                
            const cc = group.cc;
            let dates = [];
            let added_lines_list = [];
            let deleted_lines_list = [];
            let modified_lines_list = [];
            let total_commits_list = [];
            for (let i = 0; i < cc.length; i++) {
              added_lines_list.push(cc[i].data.added_lines);
              deleted_lines_list.push(cc[i].data.deleted_lines);
              modified_lines_list.push(cc[i].data.modified_lines);
              total_commits_list.push(cc[i].data.total_commits);
              dates.push(cc[i].timestamp);
            }

            transformed.CC = {
              timestamp: dates.reverse(),
              data: {
                added_lines: added_lines_list.reverse(),
                deleted_lines: deleted_lines_list.reverse(),
                modified_lines: modified_lines_list.reverse(),
                total_commits: total_commits_list.reverse()
              }
            };
          }

          if (Array.isArray(group.ici) && group.ici.length) {
            const ici = group.ici;
            let dates = [];
            let ici_score_list = [];
            let repo_size_list = [];
            for (let i = 0; i < ici.length; i++) {
              ici_score_list.push(ici[i].data.ici_score);
              repo_size_list.push(ici[i].data.repo_size_mb);
              dates.push(ici[i].timestamp);
            }
            transformed.ICI = {
              timestamp: dates.reverse(),
              data: {
                iCI_score: ici_score_list.reverse(),
                repo_size_in_mB: repo_size_list.reverse()
              }
            };
          }

            if (Array.isArray(group.mttr) && group.mttr.length) {
                const mttrArr = group.mttr;

                const dates: number[] = [];
                const mttrValues: number[] = [];

                mttrArr.forEach(item => {
                    let value = 0.0;

                    if (
                        item.data &&
                        typeof item.data === 'object' &&
                        item.data.error === null &&
                        typeof item.data.mttr === 'number'
                    ) {
                        value = item.data.mttr;                                     
                    }

                    dates.push(item.timestamp);                                   
                    mttrValues.push(value);                                        
                });

                transformed.MTTR = {
                    timestamp: dates.reverse(),    // newest first
                    data: mttrValues.reverse()
                };
            }


          if (Array.isArray(group['defects-over-time']) && group['defects-over-time'].length) {

            const defects = group['defects-over-time'];
            let dates = [];
            let defect_closure_rate_list = [];
            let defect_discovery_rate_list = [];
            let open_issues_list = [];
            let completed_issues_list = [];
            let total_issues_list = [];
            for (let i = 0; i < defects.length; i++) {
              defect_closure_rate_list.push(defects[i].data.defect_closure_rate_last_30_days);
              defect_discovery_rate_list.push(defects[i].data.defect_discovery_rate_last_30_days);
              open_issues_list.push(defects[i].data.open_issues);
              completed_issues_list.push(defects[i].data.completed_issues);
              total_issues_list.push(defects[i].data.total_issues);
              dates.push(defects[i].timestamp);
            }
            transformed.DefectsOverTime = {
              timestamp: dates.reverse(),
              data: {
                defect_closure_rate_30d: defect_closure_rate_list.reverse(),
                defect_discovery_rate_30d: defect_discovery_rate_list.reverse(),
                open_issues: open_issues_list.reverse(),
                completed_issues: completed_issues_list.reverse(),
                total_issues: total_issues_list.reverse()
              }
            };
          }

          if (Array.isArray(group.loc) && group.loc.length) {
            const loc = group.loc;
            let dates = [];
            const extractedData = loc.map(item => item.data);

            for (let i = 0; i < loc.length; i++) {
              dates.push(loc[i].timestamp);
            }
            transformed.LOC = {
              timestamp: dates.reverse(),
              data: extractedData.reverse()
            };
          }

      
            if (Array.isArray(group.hal) && group.hal.length) {
                const hal = group.hal;

                const dates = [];
                const difficultyList= [];
                const effortList = [];

                hal.forEach(item => {
                    let metrics: Record<string, any> = {};

                    if (Array.isArray(item.data)) {
                        const summary = item.data.find(e => e.Summary)?.Summary;
                        const firstFile = item.data.find(e => e.metrics)?.metrics;
                        metrics = summary ?? firstFile ?? {};
                    }

                    dates.push(item.timestamp);        
                    difficultyList.push(                                           
                        metrics['Total Difficulty'] ?? metrics.Difficulty
                    );
                    effortList.push(                                               
                        metrics['Total Efforts'] ?? metrics.Effort
                    );
                });

                transformed.Halstead = {
                    timestamp: dates.reverse(),         
                    data: {
                        difficulty: difficultyList.reverse(),
                        effort: effortList.reverse(),

                    }
                };
            }

           if (Array.isArray(group['defects-stats']) && group['defects-stats'].length) {
                const stats = group['defects-stats'];

                const dates = [];
                const percentages = [];

                for (let i = 0; i < stats.length; i++) {
                    const entry = stats[i];
                    const dataBlock = Array.isArray(entry.data) ? entry.data[0] : null;

                    if (dataBlock && typeof dataBlock.percentageBugsClosed === 'number') {
                        percentages.push(dataBlock.percentageBugsClosed);
                        dates.push(entry.timestamp);
                    }
                }

                if (dates.length > 0 && percentages.length > 0) {
                    transformed.DefectsStats = {
                        timestamp: dates.reverse(),
                        data: percentages.reverse()
                    };
                }
            }

            if (Array.isArray(group.fogindex) && group.fogindex.length) {
                const fogArr = group.fogindex;

                const dates = [];
                const pctComplexWordsList = [];
                const totalFilesList = [];
                const avgSentenceLengthList = [];
                const fogIndexVal = []

                fogArr.forEach(item => {
                    const d = Array.isArray(item.data) && item.data.length ? item.data[0] : null;

                    dates.push(item.timestamp);                        
                    pctComplexWordsList.push(d.percentageComplexWords);
                    totalFilesList.push(d.totalFiles);
                    avgSentenceLengthList.push(d.averageSentenceLength);
                    fogIndexVal.push(d.fogIndex);
                });

                transformed.FogIndex = {
                    timestamp: dates.reverse(),
                    data: {
                        pct_complex_words: pctComplexWordsList.reverse(),
                        total_files: totalFilesList.reverse(),
                        avg_sentence_length: avgSentenceLengthList.reverse(),
                        fog_index: fogIndexVal.reverse()
                    }
                };


            }
          if (Array.isArray(group.cyclo) && group.cyclo.length) {
            const cyclo = group.cyclo;
              let metrics = {};

            const dates  = [];
            const totalCyclomaticList = [];

              cyclo.forEach(item => {
                  let metrics: Record<string, any> = {};

                  if (Array.isArray(item.data)) {
                      item.data.forEach(entry => {
                          for (const [key, value] of Object.entries(entry)) {
                              if (typeof value === 'number') {
                                  metrics[key] = value;
                              }
                          }
                      });
                  }

                  dates.push(item.timestamp);                                 
                  totalCyclomaticList.push(                                   
                      metrics['total cyclomatic complexity']
                  );
              });

              transformed.Cyclo = {
                  timestamp: dates.reverse(),
                  data: {
                      total_cyclomatic_complexity: totalCyclomaticList.reverse(),

                  }
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
