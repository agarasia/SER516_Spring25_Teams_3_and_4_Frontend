<template>
  <div>
    <!-- LCOM Metrics Section -->
    <h2>LCOM Metrics Over Time</h2>
    <br>
    <br>
    <button class="back-button" @click="$emit('goBack')">Back</button>
    <br>
    <br>
    <div class="controls">
      <label for="class-select">Select Class:</label>
      <select v-model="selectedClass" v-if="classNames.length">
        <option v-for="className in classNames" :key="className" :value="className">
          {{ className }}
        </option>
      </select>
      
      <label for="metric-select">Select Metric:</label>
      <select v-model="selectedMetric">
        <option v-for="metric in availableLCOMMetrics" :key="metric" :value="metric">
          {{ metric }}
        </option>
      </select>
    </div>

    <!-- LCOM Chart (only shows when a valid metric is selected) -->
    <div class="chart-container">
      <Line v-if="selectedMetric !== 'DefectScore'" :data="chartData" :options="chartOptions" />
    </div>

    <!-- DefectScore Visualization -->
    <div v-if="computedData.DefectScore && computedData.DefectScore.defect_score_history.length">
      <h2>Defect Score Over Time</h2>
      <div class="chart-container">
        <Line :data="defectScoreChartData" :options="defectScoreChartOptions" />
      </div>
    </div>
  </div>
</template>


<script>
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from 'chart.js';
import { computed, ref, watch } from 'vue';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

export default {
  components: { Line },
  props: {
    computedData: Object,
    benchmarks: Object
  },
  setup(props) {
    // Mapping keys for LCOM metrics (DefectScore uses a different structure)
    const metricKeyMap = {
      LCOM4: { current: 'current_lcom4', history: 'lcom4_history' },
      LCOMHS: { current: 'current_lcomhs', history: 'lcomhs_history' }
    };

    // Compute only those LCOM metrics that have data (i.e. non-empty history arrays)
    const availableLCOMMetrics = computed(() => {
      const metrics = ['LCOM4', 'LCOMHS'];
      return metrics.filter(metric => {
        const historyKey = metricKeyMap[metric].history;
        return (
          props.computedData[metric] &&
          Array.isArray(props.computedData[metric][historyKey]) &&
          props.computedData[metric][historyKey].length > 0
        );
      });
    });

    // Selected metric for LCOM metrics.
    // Initialize to the first available metric if one exists.
    const selectedMetric = ref(
      availableLCOMMetrics.value.length > 0 ? availableLCOMMetrics.value[0] : ''
    );
    // Update the selected metric if the available list changes
    watch(availableLCOMMetrics, (newMetrics) => {
      if (newMetrics.length && !newMetrics.includes(selectedMetric.value)) {
        selectedMetric.value = newMetrics[0];
      }
    });

    const selectedClass = ref('');

    // Compute class names for the selected LCOM metric.
    const classNames = computed(() => {
      const currentKey = metricKeyMap[selectedMetric.value]?.current;
      const metricData = props.computedData[selectedMetric.value]?.[currentKey]?.data || [];
      return [...new Set(metricData.map(entry => entry.class_name))];
    });

    // Set a default class when available class names change.
    watch(classNames, (newClassNames) => {
      if (newClassNames.length && !newClassNames.includes(selectedClass.value)) {
        selectedClass.value = newClassNames[0];
      }
    });

    // LCOM Chart Data (for LCOM4 and LCOMHS)
    const chartData = computed(() => {
      if (!props.computedData[selectedMetric.value]) return { labels: [], datasets: [] };

      const historyKey = metricKeyMap[selectedMetric.value].history;
      let dataPoints = (props.computedData[selectedMetric.value]?.[historyKey] || [])
        .map(entry => {
          const classData = entry.data.find(item => item.class_name === selectedClass.value);
          return { timestamp: entry.timestamp, score: classData ? classData.score : null };
        })
        .filter(entry => entry.score !== null);

      // Append the current value from the current object if available.
      const currentKey = metricKeyMap[selectedMetric.value].current;
      const currentObj = props.computedData[selectedMetric.value]?.[currentKey];
      if (currentObj && currentObj.data) {
        const currentClassData = currentObj.data.find(item => item.class_name === selectedClass.value);
        if (currentClassData) {
          dataPoints.push({
            timestamp: currentObj.timestamp,
            score: currentClassData.score
          });
        }
      }

      const labels = dataPoints.map(entry => new Date(entry.timestamp).toLocaleString());
      const dataArray = dataPoints.map(entry => entry.score);
      const defaultColor = selectedMetric.value === 'LCOMHS' ? 'blue' : 'red';
      const highlightColor = 'orange';
      const pointBackgroundColor = dataPoints.map((_, index) =>
        index === dataPoints.length - 1 ? highlightColor : defaultColor
      );
      const pointRadius = dataPoints.map((_, index) =>
        index === dataPoints.length - 1 ? 8 : 3
      );
      // Create benchmark data points for the entire timeline.
      const benchmarkValue = props.benchmarks[selectedMetric.value];
      const benchmarkData = labels.map(() => benchmarkValue);
      return {
        labels,
        datasets: [
          {
          label: `${selectedMetric.value} Score for ${selectedClass.value}`,
          data: dataArray,
          borderColor: defaultColor,
          backgroundColor: selectedMetric.value === 'LCOMHS'
            ? 'rgba(0, 0, 255, 0.1)'
            : 'rgba(255, 0, 0, 0.1)',
          fill: true,
          pointBackgroundColor,
          pointRadius
          },
          {
            label: 'Benchmark',
            data: benchmarkData,
            borderColor: 'green', // or any color you prefer
            borderDash: [5, 5],   // This creates a dotted line effect
            fill: false,
            pointRadius: 0        // Hide points for benchmark line
          }
      ]
      };
    });

    // LCOM Chart Options with dynamic Y-axis scaling for LCOMHS
    const chartOptions = computed(() => {
      const yOptions = { beginAtZero: true };
      if (selectedMetric.value === 'LCOMHS') {
        yOptions.min = 0;
        yOptions.max = 2;
      }
      return {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: { y: yOptions }
      };
    });

    // DefectScore Chart Data – note the structure is different from LCOM metrics
    const defectScoreChartData = computed(() => {
      if (!props.computedData.DefectScore) return { labels: [], datasets: [] };

      const history = props.computedData.DefectScore.defect_score_history || [];
      const labels = history.map(entry => new Date(entry.timestamp).toLocaleString());
      const totalDefectsData = history.map(entry => entry.data.total_defects);
      const weightedAvgData = history.map(entry => entry.data.weighted_average_severity);
      const maxSeverityData = history.map(entry => entry.data.max_severity);
      const stdDevSeverityData = history.map(entry => entry.data.std_dev_severity);
      const minSeverityData = history.map(entry => entry.data.min_severity);
      const benchmarkValue = props.benchmarks["DefectScore"];
      const benchmarkData = labels.map(() => benchmarkValue);
      const current = props.computedData.DefectScore.current_defect_score;
      if (current && current.data) {
        labels.push(new Date(current.timestamp).toLocaleString());
        totalDefectsData.push(current.data.total_defects);
        weightedAvgData.push(current.data.weighted_average_severity);
        maxSeverityData.push(current.data.max_severity);
        stdDevSeverityData.push(current.data.std_dev_severity);
        minSeverityData.push(current.data.min_severity);
      }
      const defaultColor = 'red';
      const highlightColor = 'orange';
      const pointBackgroundColor = totalDefectsData.map((_, index) =>
        index === totalDefectsData.length - 1 ? highlightColor : defaultColor
      );
      const pointRadius = totalDefectsData.map((_, index) =>
        index === totalDefectsData.length - 1 ? 8 : 3
      );
      return {
        labels,
        datasets: [
          {
            label: 'Total Defects',
            data: totalDefectsData,
            borderColor: 'green',
            backgroundColor: 'rgba(0, 255, 0, 0.1)',
            fill: true,
            pointBackgroundColor,
            pointRadius
          },
          {
            label: 'Weighted Avg Severity',
            data: weightedAvgData,
            borderColor: 'purple',
            backgroundColor: 'rgba(128, 0, 128, 0.1)',
            fill: true,
            pointBackgroundColor,
            pointRadius
          },
          {
            label: 'Max Severity',
            data: maxSeverityData,
            borderColor: 'cyan',
            backgroundColor: 'rgba(128, 0, 128, 0.1)',
            fill: true,
            pointBackgroundColor,
            pointRadius
          },
          {
            label: 'Min Severity',
            data: minSeverityData,
            borderColor: 'blue',
            backgroundColor: 'rgba(128, 0, 128, 0.1)',
            fill: true,
            pointBackgroundColor,
            pointRadius
          },
          {
            label: 'Standard Deviation Severity',
            data: stdDevSeverityData,
            borderColor: 'magenta',
            backgroundColor: 'rgba(128, 0, 128, 0.1)',
            fill: true,
            pointBackgroundColor,
            pointRadius
          },
          {
            label: 'Benchmark',
            data: benchmarkData,
            borderColor: 'green', // or any color you prefer
            borderDash: [5, 5],   // This creates a dotted line effect
            fill: false,
            pointRadius: 0        // Hide points for benchmark line
          }
        ]
      };
    });

    // Options for the DefectScore chart
    const defectScoreChartOptions = computed(() => ({
      responsive: true,
      plugins: { legend: { display: true } },
      scales: { y: { beginAtZero: true } }
    }));

    return {
      availableLCOMMetrics,
      selectedMetric,
      selectedClass,
      classNames,
      chartData,
      chartOptions,
      defectScoreChartData,
      defectScoreChartOptions,
      computedData: props.computedData
    };
  }
};
</script>

<style scoped>
.chart-container {
  width: 60%;
  margin: auto;
}

.controls {
  width: 60%;
  margin: auto;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
label {
  font-weight: bold;
}
select {
  padding: 0.5rem;
}
</style>
