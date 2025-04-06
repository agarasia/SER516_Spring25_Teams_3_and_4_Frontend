<template>
  <div class="page-container">
    <button class="back-button" @click="$emit('goBack')">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="arrow-icon"
      >
        <line x1="20" y1="12" x2="4" y2="12"></line>
        <polyline points="10 18 4 12 10 6"></polyline>
      </svg>
    </button>
    <!-- Cards for current metric values -->
    <div class="cards-container">
      <!-- Current LCOM4 (Filtered by selectedClass) -->
      <div v-if="filteredLCOM4Data.length" class="card">
        <h3>LCOM4</h3>
        <div
          v-for="item in filteredLCOM4Data"
          :key="item.class_name"
          class="card-content"
        >
          <div class="info-row">
            <span class="label">Class Name:</span>
            <span class="value">{{ item.class_name }}</span>
          </div>
          <div class="info-row">
            <span class="label">Score:</span>
            <span class="value">{{ item.score }}</span>
          </div>
        </div>
      </div>

      <!-- LCOMHS Card -->
      <div v-if="filteredLCOMHSData.length" class="card">
        <h3>LCOMHS</h3>
        <div
          v-for="item in filteredLCOMHSData"
          :key="item.class_name"
          class="card-content"
        >
          <div class="info-row">
            <span class="label">Class Name:</span>
            <span class="value">{{ item.class_name }}</span>
          </div>
          <div class="info-row">
            <span class="label">Score:</span>
            <span class="value">{{ item.score }}</span>
          </div>
        </div>
      </div>

      <!-- Current Defect Score -->
      <div v-if="computedData.DefectScore?.current_defect_score?.data" class="card">
        <h3>Defect Score</h3>
        <div class="card-content">
          <div class="info-row">
            <span class="label">Total Defects:</span>
            <span class="value">{{ computedData.DefectScore.current_defect_score.data.total_defects }}</span>
          </div>
          <div class="info-row">
            <span class="label">Weighted Average Severity:</span>
            <span class="value">{{ computedData.DefectScore.current_defect_score.data.weighted_average_severity }}</span>
          </div>
          <div class="info-row">
            <span class="label">Max Severity:</span>
            <span class="value">{{ computedData.DefectScore.current_defect_score.data.max_severity }}</span>
          </div>
          <div class="info-row">
            <span class="label">Min Severity:</span>
            <span class="value">{{ computedData.DefectScore.current_defect_score.data.min_severity }}</span>
          </div>
          <div class="info-row">
            <span class="label">Standard Deviation:</span>
            <span class="value">{{ computedData.DefectScore.current_defect_score.data.std_dev_severity }}</span>
          </div>
        </div>
      </div>
    </div>
    <br>
    <div v-if="computedData.LCOM4 || computedData.LCOMHS">
      <!-- LCOM Metrics Section -->
      <h2>LCOM Metrics Over Time</h2>
      <br>
        <div class="controls">
          <div class="control-group">
            <label for="class-select">Select Class:</label>
            <select id="class-select" v-model="selectedClass" v-if="classNames.length">
              <option v-for="className in classNames" :key="className" :value="className">
                {{ className }}
              </option>
            </select>
          </div>
          <div class="control-group">
            <label for="metric-select">Select Metric:</label>
            <select id="metric-select" v-model="selectedMetric">
              <option v-for="metric in availableLCOMMetrics" :key="metric" :value="metric">
                {{ metric }}
              </option>
            </select>
          </div>
        </div>
      <!-- LCOM Chart (only shows when a valid metric is selected) -->
      <div class="chart-container">
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <!-- DefectScore Visualization -->
    <div v-if="computedData.DefectScore">
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
  PointElement,
  Filler
} from 'chart.js';
import { computed, ref, watch } from 'vue';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler);

export default {
  components: { Line },
  props: {
    computedData: Object,
    benchmarks: Object,
    showBenchmarkLines: Object
  },
  setup(props) {
    const selectedClass = ref('');
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
        const currentKey = metricKeyMap[metric].current;
        return (
          props.computedData[metric] &&
          (
            (Array.isArray(props.computedData[metric][historyKey]) &&
             props.computedData[metric][historyKey].length > 0) ||
            (props.computedData[metric][currentKey] &&
             Array.isArray(props.computedData[metric][currentKey].data) &&
             props.computedData[metric][currentKey].data.length > 0)
          )
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
    }, { immediate: true });

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
    }, { immediate: true });

    // Filtered data for LCOM4
    const filteredLCOM4Data = computed(() => {
      if (!props.computedData.LCOM4?.current_lcom4?.data || !props.computedData.LCOM4.current_lcom4.data.length) {
        return [];
      }
      return props.computedData.LCOM4.current_lcom4.data.filter(
        item => item.class_name === selectedClass.value
      );
    });

    // Filtered data for LCOMHS
    const filteredLCOMHSData = computed(() => {
      if (!props.computedData.LCOMHS?.current_lcomhs?.data || !props.computedData.LCOMHS.current_lcomhs.data.length) {
        return [];
      }
      return props.computedData.LCOMHS.current_lcomhs.data.filter(
        item => item.class_name === selectedClass.value
      );
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
        dataPoints = dataPoints.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

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
      
      const datasets = [{
          label: `${selectedMetric.value} Score for ${selectedClass.value}`,
          data: dataArray,
          borderColor: defaultColor,
          backgroundColor: selectedMetric.value === 'LCOMHS'
            ? 'rgba(0, 0, 255, 0.1)'
            : 'rgba(255, 0, 0, 0.1)',
          fill: true,
          pointBackgroundColor,
          pointRadius
        }];

      // Create benchmark data points for the entire timeline.
      if(props.showBenchmarkLines &&
          props.showBenchmarkLines[selectedMetric.value] &&
          props.benchmarks &&
          props.benchmarks[selectedMetric.value] !== undefined) {
        const benchmarkValue = props.benchmarks[selectedMetric.value];
        const benchmarkData = labels.map(() => benchmarkValue); 
        
        datasets.push({
            label: 'Benchmark',
            data: benchmarkData,
            borderColor: 'green', // or any color you prefer
            borderDash: [5, 5],   // This creates a dotted line effect
            fill: false,
            pointRadius: 0        // Hide points for benchmark line
          });
      }
     
      return {
        labels,
        datasets: datasets
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

      let history = props.computedData.DefectScore.defect_score_history || [];
      history = history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      const labels = history.map(entry => new Date(entry.timestamp).toLocaleString());
      const totalDefectsData = history.map(entry => entry.data.total_defects);
      const weightedAvgData = history.map(entry => entry.data.weighted_average_severity);
      const maxSeverityData = history.map(entry => entry.data.max_severity);
      const stdDevSeverityData = history.map(entry => entry.data.std_dev_severity);
      const minSeverityData = history.map(entry => entry.data.min_severity);
      const current = props.computedData.DefectScore.current_defect_score;
      if (current && current.data) {
        labels.push(new Date(current.timestamp).toLocaleString());
        totalDefectsData.push(current.data.total_defects);
        weightedAvgData.push(current.data.weighted_average_severity);
        maxSeverityData.push(current.data.max_severity);
        stdDevSeverityData.push(current.data.std_dev_severity);
        minSeverityData.push(current.data.min_severity);
      }
      if (props.showBenchmarkLines &&
        props.showBenchmarkLines.DefectScore &&
        props.benchmarks &&
        props.benchmarks.DefectScore !== undefined)
      {
        const benchmarkValue = props.benchmarks["DefectScore"];
        const benchmarkData = labels.map(() => benchmarkValue);
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
      }
      else {
        return {
          labels,
          datasets: [
            {
              label: 'Total Defects',
              data: totalDefectsData,
              borderColor: 'green',
              backgroundColor: 'rgba(0, 255, 0, 0.1)',
              fill: true
            },
            {
              label: 'Weighted Avg Severity',
              data: weightedAvgData,
              borderColor: 'purple',
              backgroundColor: 'rgba(128, 0, 128, 0.1)',
              fill: true
            },
            {
              label: 'Max Severity',
              data: maxSeverityData,
              borderColor: 'cyan',
              backgroundColor: 'rgba(128, 0, 128, 0.1)',
              fill: true
            },
            {
              label: 'Min Severity',
              data: minSeverityData,
              borderColor: 'blue',
              backgroundColor: 'rgba(128, 0, 128, 0.1)',
              fill: true
            },
            {
              label: 'Standard Deviation Severity',
              data: stdDevSeverityData,
              borderColor: 'magenta',
              backgroundColor: 'rgba(128, 0, 128, 0.1)',
              fill: true
            }
          ]
        };
      }
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
      computedData: props.computedData,
      filteredLCOM4Data,
      filteredLCOMHSData
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

.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
  margin: 2rem auto;
}

/* Card styling */
.card {
  background: #537895;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 300px;
  padding: 0.5rem;
  transition: transform 0.3s, box-shadow 0.3s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

/* Card header styling */
.card h3 {
  margin: 0 0 1rem;
  font-size: 1.5rem;
  color: #fff;
  text-align: center;
}

/* Content rows */
.card-content {
  margin-bottom: 1rem;
  border-bottom: 1px dashed #e0e0e0;
  padding: 1rem;
  height: 50px;          /* Fixed smaller height */
  overflow-y:scroll;
}

.card-content:last-child {
  border-bottom: none;
}

/* Label and value styling */
.info-row {
  display: flex;
  justify-content: space-between;
  margin: 0.3rem 0;
}

.info-row .label {
  font-weight: bold;
  color: #fff;
}

.info-row .value {
  color: #fff;
}

.back-button {
  position: fixed; /* or absolute if within a positioned container */
  top: 1rem;
  left: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  z-index: 99999;
}

.back-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.arrow-icon {
  width: 24px;
  height: 24px;
  stroke: #000; /* Explicit stroke color */
}

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 1rem auto;
}

/* Each control group holds a label and a select inline */
.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Label styling */
.control-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #09203f;
}

/* Select dropdown styling */
.control-group select {
  min-width: 200px;
  width: auto;
  padding: 0.3rem 0.5rem;
  border: 1px solid #09203f;
  border-radius: 4px;
  background: #fff;
  font-size: 0.9rem;
  color: #09203f;
  outline: none;
  transition: border-color 0.2s ease;
  /* Remove default arrow */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  /* Custom arrow using inline SVG */
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9' stroke='%2309203f' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 0.8rem;
}

.control-group select:focus {
  border-color: #537895;
}

/* Hide default dropdown arrow in IE */
.control-group select::-ms-expand {
  display: none;
}
</style>
