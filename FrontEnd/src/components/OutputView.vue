<template>
  <div class="metrics-guide-container">
    <button class="back-button" @click="$emit('goBack')">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" class="arrow-icon">
        <line x1="20" y1="12" x2="4" y2="12"></line>
        <polyline points="10 18 4 12 10 6"></polyline>
      </svg>
      Back
    </button>
    <!-- Metrics Content -->
    <div class="metrics-guide-box-1">
      <p class="metrics-guide-heading">Results</p>
      <hr style="width: 3.8%; margin-left: 1.45em; height: 2px; background-color: #4A6C8B;">
      <table style="width: 100%; margin-top: 0em; margin-left:-1em">
        <td style="width: 20%; padding-right: 2em; padding-left: 2em;">
          <!-- Sidebar -->
          <div class="sidebar">
            <h3>Toggle Metrics</h3><br>
            <ul>
              <li :class="{ active: selectedMetric === 'All' }" @click="filterByMetric('All')">
                All Metrics
              </li>
              <li v-for="metric in availableMetrics" :key="metric.value"
                :class="{ active: selectedMetric === metric.label }" @click="filterByMetric(metric.label)">
                {{ metric.label }}
              </li>
            </ul>
          </div>
        </td>
        <td style="padding-left: 2em;">
          <p id="metrics-guide-overview" style="font-weight: 500;">
            The Metrics Guide offers a thorough description of the many software quality metrics that are used to assess
            and
            enhance your codebase's readability, maintainability, and general quality. These metrics assist teams and
            developers in spotting any problems, improving performance, and making sure the code complies with best
            practices. You can attain greater software quality and dependability by prioritizing development efforts,
            testing, and refactoring using knowledge of these metrics.<br><br>
            The following page elucidates the various metrics and their significance in the context of software
            development.
          </p>

          <div class="metrics-guide-box" style="margin-left: -2.7%; border: 0; box-shadow: none;">
            <div v-for="metric in displayedMetrics" :key="metric.value" class="chart-container">
              <h3 class="chart-heading">{{ metric.label }}</h3>
              <div class="chart-content">
                <Line :data="getChartData(metric.value)" :options="chartOptions" />
              </div>
            </div>
          </div>
        </td>
      </table>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler);

export default {
  name: 'OutputView',
  props: {
    computedData: Object, // Metrics data passed from HomeScreen.vue
    benchmarks: Object, // Benchmark data
    showBenchmarkLines: Object // Whether to show benchmark lines
  },
  components: {
    Line
  },
  setup(props) {
    const metric = [
      { value: 'CC', label: 'Code Churn', dataDict: true },
      { value: 'LOC', label: 'Lines of Code', dataDict: false },
      { value: 'ICI', label: 'Interface Change Impact', dataDict: true },
      { value: 'MTTR', label: 'Mean Time to Repair', dataDict: false },
      { value: 'DefectsOverTime', label: 'Defects Over Time', dataDict: true },
      { value: 'Cyclo', label: 'Cyclomatic Complexity', dataDict: true },
      { value: 'Halstead', label: 'Halstead Complexity', dataDict: true }
    ];

    // Filter metrics based on availability in computedData
    const availableMetrics = computed(() =>
      metric.filter((m) => props.computedData[m.value])
    );

    const selectedMetrics = ref(availableMetrics.value.map((m) => m.value));

    const selectedMetric = ref('All');

    const displayedMetrics = computed(() => {
      return availableMetrics.value.filter((metric) => selectedMetrics.value.includes(metric.value));
    });

    function toggleMetric(metricValue) {
      if (selectedMetrics.value.includes(metricValue)) {
        selectedMetrics.value = selectedMetrics.value.filter((m) => m !== metricValue);
      } else {
        selectedMetrics.value.push(metricValue);
      }
    }

    // Select all metrics
    function selectAllMetrics() {
      selectedMetrics.value = availableMetrics.value.map((m) => m.value);
    }

    // Filter metrics by category
    function filterByMetric(value) {
      selectedMetric.value = value;

      if (value === 'All') {
        // If "All" is selected, include all available metrics
        selectedMetrics.value = availableMetrics.value.map((m) => m.value);
      } else {
        // If a specific metric is selected, ensure only that metric is in the selectedMetrics array
        selectedMetrics.value = [availableMetrics.value.find((m) => m.label === value).value];
      }
    }

    const timestamps = computed(() => {
      const timestamps = [];

      for (const m of availableMetrics.value) {
        timestamps.push(props.computedData[m.value]["timestamp"]);
        break;
      }
      return timestamps;
    });

    function getGraphLabels() {
      const labels = {};

      for (const m of availableMetrics.value) {
        if (m.dataDict) {
          const metricData = props.computedData[m.value];
          if (metricData && metricData.data && typeof metricData.data === 'object') {
            labels[m.value] = Object.keys(metricData.data);
          } else {
            labels[m.value] = [];
          }
        } else {
          labels[m.value] = [m.label]; // make it consistent (return an array)
        }
      }

      return labels;
    }

    // Create a computed ref for reactive access
    const graphLabels = computed(() => getGraphLabels());

    function getGraphData() {
      const data = {};

      for (const m of availableMetrics.value) {
        const metricData = props.computedData[m.value];

        if (m.dataDict) {
          if (metricData && metricData.data && typeof metricData.data === 'object') {
            data[m.value] = Object.values(metricData.data);
          } else {
            data[m.value] = [];
          }
        } else {
          // For non-dictionary metrics, data is a primitive
          if (metricData && metricData.data !== undefined) {
            data[m.value] = [metricData.data]; // wrap in array for consistency
          } else {
            data[m.value] = [];
          }
        }
      }

      return data;
    }

    // Reactive/computed graph data
    const graphData = computed(() => getGraphData());

    function getChartData(metricValue) {
      const labels = graphLabels.value[metricValue];
      const data = graphData.value[metricValue];
      let datasets = [];

      // Predefined list of colors
      const colors = [
        { borderColor: 'rgba(75, 192, 192, 1)', backgroundColor: 'rgba(75, 192, 192, 0.2)' }, // Teal
        { borderColor: 'rgba(255, 99, 132, 1)', backgroundColor: 'rgba(255, 99, 132, 0.2)' }, // Red
        { borderColor: 'rgba(54, 162, 235, 1)', backgroundColor: 'rgba(54, 162, 235, 0.2)' }, // Blue
        { borderColor: 'rgba(255, 206, 86, 1)', backgroundColor: 'rgba(255, 206, 86, 0.2)' }, // Yellow
        { borderColor: 'rgba(153, 102, 255, 1)', backgroundColor: 'rgba(153, 102, 255, 0.2)' }, // Purple
        { borderColor: 'rgba(255, 159, 64, 1)', backgroundColor: 'rgba(255, 159, 64, 0.2)' }, // Orange
        { borderColor: 'rgba(0, 128, 0, 1)', backgroundColor: 'rgba(0, 128, 0, 0.2)' } // Green
      ];

      for (let i = 0; i < labels.length; i++) {
        const colorIndex = i % colors.length;
        datasets.push({
          label: [labels[i]],
          data: [data[i]],
          fill: false,
          borderColor: colors[colorIndex].borderColor,
          backgroundColor: colors[colorIndex].backgroundColor,
          tension: 0.4
        });
      }
      return {
        labels: timestamps.value,
        datasets: datasets
      };
    }

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true
        },
        title: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };

    return {
      metric,
      availableMetrics,
      selectedMetrics,
      selectedMetric,
      displayedMetrics,
      toggleMetric,
      selectAllMetrics,
      filterByMetric,
      graphLabels,
      graphData,
      getChartData,
      chartOptions,
      timestamps,
      Line,
    };
  }
};
</script>

<style scoped>
.page-container {
  padding: 20px;
  background-color: #f4f4f5;
  border-radius: 8px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #4a6c8b;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  font-size: 14px;
  cursor: pointer;
  margin: 50px 20px 20px 20px;
  transition: background-color 0.3s;
}

.back-button:hover {
  background-color: #3a5670;
}

.arrow-icon {
  width: 16px;
  height: 16px;
}

.metric-item {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
}

.metric-item p {
  margin: 5px 0;
}

.layout-container {
  display: flex;
  gap: 20px;
  width: 100%;
  /* Ensure the layout container spans the full width */
}

.side-panel {
  width: 20%;
  /* Adjust the width of the side panel */
  background-color: #ffffff;
  border-radius: 8px;
  padding: 1em;
  border: 1px solid #ddd;
}

.toggle-item {
  margin-bottom: 10px;
}

.visualization-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  align-items: flex-start;
  width: 80%;
  /* Adjust the width of the visualization container */
}

.chart-container {
  width: 100%;
  /* Ensure the chart container spans the full width of its parent */
  max-width: 800px;
  /* Optional: Set a max width for better readability */
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 2em;
  border: 1px solid #ddd;
  gap: 10px;
  margin-bottom: 2em;
}

.chart-heading {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
}

.chart-content {
  width: 100%;
  height: 100%;
}

.main-content {
  border-radius: 10px;
  background-color: #fefffe;
  width: 100%;
  /* Ensure the main content spans the full width */
  padding: 2em;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.metrics-guide-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  /* Align content to the top */
  background-color: #f5f5f5;
  /* Optional: Add a light background color */
  /* padding-top: 5em; Ensure consistent space at the top */
  padding-bottom: 5em;
  /* Ensure consistent space at the bottom */
  min-height: 100vh;
  /* Ensure the container takes at least the full viewport height */
  box-sizing: border-box;
  /* Include padding in the height calculation */
}

.metric-heading-container {
  display: flex;
  margin-bottom: 1em;
  /* Space below the heading */
}

#metrics-guide-overview {
  font-size: 1.2em;
  color: #555;
  /* Optional: Change text color */
  margin-top: 2.5em;
  /* Space above the paragraph */
  margin-bottom: 4em;
  /* Space below the paragraph */
  margin-right: 2em;
  /* Space to the right */
}

.metrics-guide-heading {
  font-size: 2.5em;
  font-weight: bold;
  color: #333;
  /* Optional: Change text color */
  margin-bottom: -0.4em;
  margin-left: 0.5em;
  /* Space below the heading */
}

.metrics-guide-box-1 {
  width: 85vw;
  /* Optional: Limit the maximum width */
  border-radius: 10px;
  border: 1px solid #ccc;
  text-align: left;
  margin: 3em;
  padding-left: 1.5em;
  background-color: #fff;
  /* Optional: Add a white background for contrast */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  /* Optional: Add a subtle shadow */
}

.metrics-guide-box {
  width: auto;
  max-width: 1200px;
  /* Optional: Limit the maximum width */
  border-radius: 10px;
  border: 1px solid #ccc;
  text-align: left;
  margin: 3em;
  padding-left: 1.5em;
  background-color: #fff;
  /* Optional: Add a white background for contrast */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  /* Optional: Add a subtle shadow */
}

.metric-heading {
  font-size: 1.5em;
  font-weight: bold;
  color: #333;
  /* Optional: Change text color */
  margin-bottom: -0.4em;
  /* Space below the heading */
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

.sidebar {
  width: 100%;
  margin-top: 3em;
  font-size: small;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  padding: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.sidebar li:hover {
  background-color: #f5f5f5;
}

.sidebar li.active {
  background-color: #4A6C8B;
  color: #fff;
}

.category-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
</style>