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

    <!-- snapshot card -->
    <div class="cards-container">
      <div
        v-for="card in snapshotCards"
        :key="card.metric.value"
        class="card"
      >
        <h3>{{ card.metric.label }}</h3>

        <div class="card-body">
          <div
            class="card-row"
            v-for="row in card.rows"
            :key="row.label"
          >
            <span class="label">{{ row.label }}:</span>
            <span class="value">{{ row.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- history chart -->
    <div class="chart-container" v-if="chartData.labels.length">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS, Title, Tooltip, Legend,
  LineElement, CategoryScale, LinearScale, PointElement, Filler
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler);

export default {
  name: 'OutputView',
  props: {
    computedData: Object,
    benchmarks: Object,
    showBenchmarkLines: Object
  },
  setup(props) {
    const METRICS = [
      {
            value: 'LCOM4',
            label: 'LCOM4',
            benchmarkKey: 'lcom4_benchmark',
            currentKey: 'current_lcom4',
            historyKey: 'lcom4_history',
            classScoped: true
      },
      {
            value: 'LCOMHS',
            label: 'LCOMHS',
            benchmarkKey: 'lcomhs_benchmark',
            currentKey: 'current_lcomhs',
            historyKey: 'lcomhs_history',
            classScoped: true
      },
      {
            value: 'DefectScore',
            label: 'Defect Score',
            benchmarkKey: 'defect_score_benchmark',
            currentKey: 'current_defect_score',
            historyKey: 'defect_score_history',
            classScoped: false
      },
      {
            value: 'AfferentCoupling',
            label: 'Afferent Coupling',
            benchmarkKey: 'afferent_coupling_benchmark',
            currentKey: 'current_afferent',
            historyKey: 'afferent_history',
            classScoped: true
      },
      {
            value: 'EfferentCoupling',
            label: 'Efferent Coupling',
            benchmarkKey: 'efferent_coupling_benchmark',
            currentKey: 'current_efferent',
            historyKey: 'efferent_history',
            classScoped: true
      },
      {
            value: 'DefectDensityAnalysis',
            label: 'Defect Density Analysis',
            benchmarkKey: 'defect_density_analysis_benchmark',
            currentKey: 'current_defect_density',
            historyKey: 'defect_density_history',
            classScoped: false
      },
      {
            value: 'Instability',
            label: 'Instability',
            benchmarkKey: 'instability_benchmark',
            currentKey: 'current_instability',
            historyKey: 'instability_history',
            classScoped: true
        },
      {
            value: 'CC',                   
            label: 'Code Churn (CC)',
            benchmarkKey: 'cc_benchmark',  
            currentKey: 'data',           
            historyKey: 'history',       
            classScoped: false            
      }, 
      {
            value: 'Halstead',            
            label: 'Halstead Metrics',
            benchmarkKey: 'hal_benchmark',
            currentKey: 'data',
            historyKey: 'history',
            classScoped: false
      },
      {
            value: 'Cyclo',
            label: 'Cyclomatic Complexity',
            benchmarkKey: 'cyclo_benchmark',
            currentKey: 'data',
            historyKey: 'history',
            classScoped: false
       },
       {
            value: 'LOC',
            label: 'Lines Of Code',
            benchmarkKey: 'loc_benchmark',
            currentKey: 'data',
            historyKey: 'history',
            classScoped: false
       },
       {
            value: 'DefectsOverTime',                  
            label: 'Defects Over Time',
            benchmarkKey: 'defects_benchmark',     
            currentKey: 'data',
            historyKey: 'history',                 
            classScoped: false
       },
    ];

    const selectedMetric = ref(METRICS[0].value);
    const selectedClass = ref('');

    const availableMetrics = computed(() =>
      METRICS.filter(m => !!props.computedData[m.value])
    );

    const hasClassData = computed(() =>
      METRICS.find(m => m.value === selectedMetric.value)?.classScoped === true
    );

    watch(availableMetrics, ms => {
      if (!ms.find(m => m.value === selectedMetric.value)) {
        selectedMetric.value = ms[0]?.value ?? '';
      }
    });

    const classNames = computed(() => {
      if (!hasClassData.value) return [];

      const metric = METRICS.find(m => m.value === selectedMetric.value);
      const curArr = props.computedData[selectedMetric.value]?.[metric.currentKey]?.data;

      if (!Array.isArray(curArr)) return [];

      const names = curArr
        .map(e => e.class_name)
        .filter(n => !!n);

      return Array.from(new Set(names));
    });

    watch(classNames, names => {
      if (names.length && !names.includes(selectedClass.value)) {
        selectedClass.value = names[0];
      }
    });

    function currentData(metricVal) {
      const metric = METRICS.find(m => m.value === metricVal);
      return props.computedData[metricVal]?.[metric.currentKey];
    }

    function historyData(metricVal) {
      const metric = METRICS.find(m => m.value === metricVal);
      return metric.historyKey
        ? props.computedData[metricVal]?.[metric.historyKey] ?? []
        : [];
    }

    const snapshotCards = computed(() =>
      availableMetrics.value.map(m => ({
        metric: m,
        rows: rowsFor(m.value)
      })).filter(c => c.rows.length)
    );

    function rowsFor(metricVal) {
      const cur = currentData(metricVal);
      if (!cur) return [];

      const metric = METRICS.find(m => m.value === metricVal);

      if (metric.classScoped && Array.isArray(cur.data)) {
        let row = cur.data.find(d => d.class_name === selectedClass.value);
        if (!row && cur.data.length) row = cur.data[0];
        if (!row) return [];
        return [{ label: row.class_name, value: row.score }];
      }

      if (typeof cur === 'number' || typeof cur.data === 'number') {
        const val = typeof cur === 'number' ? cur : cur.data;
        return [{ label: 'Value', value: val }];
      }

      const src = cur.data ?? cur;
      return Object.entries(src)
        .filter(([, v]) => typeof v === 'number')
        .map(([k, v]) => ({ label: k.replace(/_/g, ' '), value: v }));
    }

    const chartData = computed(() => {
      const hist = historyData(selectedMetric.value);
      const cur = currentData(selectedMetric.value);

      const pts = [];
      const push = (ts, series, val) => pts.push({ ts, series, val });

      hist.forEach(h => {
        if (Array.isArray(h.data)) {
          const row = h.data.find(r =>
            !hasClassData.value || r.class_name === selectedClass.value);
          if (row) push(h.timestamp, 'score', row.score);
        } else if (typeof h.data === 'object') {
          Object.entries(h.data)
            .filter(([, v]) => typeof v === 'number')
            .forEach(([k, v]) => push(h.timestamp, k, v));
        }
      });

      if (cur) {
        if (Array.isArray(cur.data)) {
          const row = cur.data.find(r =>
            !hasClassData.value || r.class_name === selectedClass.value);
          if (row) push(cur.timestamp, 'score', row.score);
        } else if (typeof cur === 'number' || typeof cur.data === 'number') {
          const val = typeof cur === 'number' ? cur : cur.data;
          push(cur.timestamp, 'value', val);
        } else {
          const src = cur.data ?? cur;
          Object.entries(src)
            .filter(([, v]) => typeof v === 'number')
            .forEach(([k, v]) => push(cur.timestamp, k, v));
        }
      }

      const labels = Array.from(new Set(pts.map(p => p.ts)))
        .sort()
        .map(ts => new Date(ts).toLocaleString());

      const seriesMap = {};
      pts.forEach(p => {
        if (!seriesMap[p.series]) seriesMap[p.series] = Array(labels.length).fill(null);
        const idx = labels.indexOf(new Date(p.ts).toLocaleString());
        seriesMap[p.series][idx] = p.val;
      });

      const datasets = Object.entries(seriesMap).map(([name, data], i) => {
        const palette = ['red', 'blue', 'green', 'purple', 'orange', 'cyan', 'magenta'];
        const baseColor = palette[i % palette.length];

        const radii = data.map((_, idx) => idx === data.length - 1 ? 6 : 2);
        const bgColors = data.map((_, idx) =>
          idx === data.length - 1 ? "orange" : baseColor);

        return {
          label: name.replace(/_/g, ' '),
          data,
          borderColor: baseColor,
          backgroundColor: 'rgba(0,0,0,0.05)',
          pointBorderColor: baseColor,
          pointBackgroundColor: bgColors,
          pointRadius: radii,
          pointStyle: 'circle',
          borderDash: [0, 0],
          fill: true
        };
      });

      if (props.benchmarks[selectedMetric.value] && props.showBenchmarkLines[selectedMetric.value]) {
        datasets.push({
          label: 'Benchmark',
          data: Array(labels.length).fill(props.benchmarks[selectedMetric.value]),
          borderColor: 'green',
          borderDash: [5, 5],
          pointRadius: Array(labels.length).fill(0),
          pointBorderColor: 'green',
          pointBackgroundColor: Array(labels.length).fill('rgba(0,0,0,0)'),
          backgroundColor: 'rgba(0,0,0,0.05)',
          pointStyle: 'circle',
          fill: false
        });
      }

      return { labels, datasets };
    });

    const chartOptions = { responsive: true, plugins: { legend: { display: true } } };

    return {
      selectedMetric,
      selectedClass,
      availableMetrics,
      hasClassData,
      classNames,
      snapshotCards,
      chartData,
      chartOptions
    };
  }
};
</script>

<style scoped>
/* Existing styles remain unchanged */
</style>