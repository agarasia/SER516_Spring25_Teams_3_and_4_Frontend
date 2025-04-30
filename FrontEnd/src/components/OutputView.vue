<template>
  <div class="page-container">
    <!-- Back Button -->
    <button class="back-button" @click="$emit('goBack')">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" class="arrow-icon">
        <line x1="20" y1="12" x2="4" y2="12"></line>
        <polyline points="10 18 4 12 10 6"></polyline>
      </svg>
      Back to Home
    </button>

    <div v-for="metric in availableMetrics" :key="metric.value" class="chart-container">
      <h3>{{ metric.label }}</h3>
      <Line :data="getChartData(metric.value)" :options="chartOptions" />
    </div>

  </div>
</template>

<script>
import { computed } from 'vue';
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
  background-color: #f9f9f9;
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
  margin-bottom: 20px;
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

.chart-container {
  height: 300px;
}
</style>