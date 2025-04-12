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

        <!-- NEW wrapper -->
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
    <!-- metric selector -->
    <div class="controls">
      <label for="metric">Metric:</label>
      <select id="metric" v-model="selectedMetric">
        <option v-for="m in availableMetrics" :key="m.value" :value="m.value">
          {{ m.label }}
        </option>
      </select>

      <!-- class selector (only when we have classNames) -->
      <template v-if="hasClassData">
        <label for="cls">Class:</label>
        <select id="cls" v-model="selectedClass">
          <option v-for="c in classNames" :key="c" :value="c">{{ c }}</option>
        </select>
      </template>
    </div>

    <!-- <div class="card" v-if="cardRows.length">
      <h3>{{ metricCfg(selectedMetric).label }}</h3>
      <div class="card-content" v-for="row in cardRows" :key="row.label">
        <div class="info-row">
          <span class="label">{{ row.label }}:</span>
          <span class="value">{{ row.value }}</span>
        </div>
      </div>
    </div> -->

    <!-- history chart -->
    <div class="chart-container" v-if="chartData.labels.length">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>



<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS, Title, Tooltip, Legend,
  LineElement, CategoryScale, LinearScale, PointElement, Filler
} from 'chart.js';
import { METRICS, metricCfg, type MetricCfg } from '@/metricsConfig';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler);

const props = defineProps<{
  computedData: Record<string, any>;
  benchmarks:   Record<string, number>;
  showBenchmarkLines: Record<string, boolean>;
}>();



const selectedMetric = ref<string>(METRICS[0].value);
const selectedClass  = ref<string>('');


const availableMetrics = computed(() =>
  METRICS.filter(m => !!props.computedData[m.value])
);

const hasClassData = computed(() =>
  metricCfg(selectedMetric.value).classScoped === true
);

watch(availableMetrics, ms => {
  if (!ms.find(m => m.value === selectedMetric.value)) {
    selectedMetric.value = ms[0]?.value ?? '';
  }
});

const cfg = computed(() => metricCfg(selectedMetric.value));

/* ---------- class names ---------- */
const classNames = computed<string[]>(() => {
  if (!hasClassData.value) return [];

  const curArr = props.computedData[selectedMetric.value]
                    ?. [cfg.value.currentKey]?.data;

  if (!Array.isArray(curArr)) return [];   // <‑‑ guard

  const names = curArr
    .map((e: any) => e.class_name)
    .filter((n: string | undefined) => !!n);

  return Array.from(new Set(names));
});

watch(classNames, (names: string[]) => {
  if (names.length && !names.includes(selectedClass.value)) {
    selectedClass.value = names[0];
  }
});

/* ---------- helpers to normalise current & history ---------- */
function currentData(metricVal: string) {
  const c = metricCfg(metricVal);
  return props.computedData[metricVal]?.[c.currentKey];
}
function historyData(metricVal: string) {
  const c = metricCfg(metricVal);
  return c.historyKey
    ? props.computedData[metricVal]?.[c.historyKey] ?? []
    : [];
}

/* ---------- per‑metric card content ---------- */
const cardRows = computed(() => {
  const cur = currentData(selectedMetric.value);
  if (!cur) return [];

  /* if data is an array of {class_name, score} */
  if (Array.isArray(cur.data)) {
    return cur.data
      .filter((d: any) =>
        d.class_name ? d.class_name === selectedClass.value : true)
      .map((d: any) => ({
        label: d.class_name ?? 'Score',
        value: d.score ?? JSON.stringify(d)
      }));
  }
  /* scalar object – use all keys except details/git ids */
  return Object.entries(cur.data ?? cur)
    .filter(([k]) => !['details', 'gitUniqueId'].includes(k))
    .map(([k, v]) => ({ label: k.replace(/_/g, ' '), value: v }));
});


function rowsFor(metricVal: string) {
  const cur = currentData(metricVal);
  if (!cur) {
    console.warn(`No current data for ${metricVal} – check currentKey in metricsConfig`);
    return [];
  }

  const cfgObj = metricCfg(metricVal);

  /* -------- class‑scoped array -------- */
  if (cfgObj.classScoped && Array.isArray(cur.data)) {
    let row = cur.data.find((d: any) => d.class_name === selectedClass.value);

    /* fallback: first class in that metric if selectedClass not present */
    if (!row && cur.data.length) row = cur.data[0];

    if (!row) return [];                       // still nothing? give up
    return [{ label: row.class_name, value: row.score }];
  }

  /* -------- scalar number -------- */
  if (typeof cur === 'number' || typeof cur.data === 'number') {
    const val = typeof cur === 'number' ? cur : cur.data;
    return [{ label: 'Value', value: val }];
  }

  /* -------- object with numeric fields -------- */
  const src = cur.data ?? cur;
  return Object.entries(src)
    .filter(([, v]) => typeof v === 'number')
    .map(([k, v]) => ({ label: k.replace(/_/g, ' '), value: v }));
}

/* convenience computed so the template loops cleanly */
const snapshotCards = computed(() =>
  availableMetrics.value.map(m => ({
    metric: m,
    rows: rowsFor(m.value)
  })).filter(c => c.rows.length)      // show only if we have something to display
);


/* ---------- chart data (works for any metric with numeric history) ---------- */
const chartData = computed(() => {
  const hist = historyData(selectedMetric.value);
  const cur  = currentData(selectedMetric.value);

  type Point = { ts: string; series: string; val: number };
  const pts: Point[] = [];

  /* helper to push one point */
  const push = (ts: string, series: string, val: number) =>
    pts.push({ ts, series, val });

  /* ------- history ------- */
  hist.forEach((h: any) => {
    if (Array.isArray(h.data)) {
      /* class‑level score */
      const row = h.data.find((r: any) =>
        !hasClassData.value || r.class_name === selectedClass.value);
      if (row) push(h.timestamp, 'score', row.score);
    } else if (h.data?.defectDensity) {
      push(h.timestamp, 'defectDensity', h.data.defectDensity);
    } else if (typeof h.data === 'object') {
      Object.entries(h.data)
        .filter(([, v]) => typeof v === 'number')
        .forEach(([k, v]) => push(h.timestamp, k, v as number));
    }
  });

  /* ------- current ------- */
  if (cur) {
    if (Array.isArray(cur.data)) {
      const row = cur.data.find((r: any) =>
        !hasClassData.value || r.class_name === selectedClass.value);
      if (row) push(cur.timestamp, 'score', row.score);
    } else if (typeof cur === 'number' || typeof cur.data === 'number') {
      const val = typeof cur === 'number' ? cur : cur.data;
      push(cur.timestamp, 'value', val);
    } else {
      const src = cur.data ?? cur;
      Object.entries(src)
        .filter(([, v]) => typeof v === 'number')
        .forEach(([k, v]) => push(cur.timestamp, k, v as number));
    }
  }

  /* group by series name */
  const labels = Array.from(new Set(pts.map(p => p.ts)))
                      .sort()
                      .map(ts => new Date(ts).toLocaleString());

  const seriesMap: Record<string, number[]> = {};
  pts.forEach(p => {
    if (!seriesMap[p.series]) seriesMap[p.series] = Array(labels.length).fill(null);
    const idx = labels.indexOf(new Date(p.ts).toLocaleString());
    seriesMap[p.series][idx] = p.val;
  });

  const datasets = Object.entries(seriesMap).map(([name, data], i) => {
    const palette = ['red','blue','green','purple','orange','cyan','magenta'];
    const baseColor = palette[i % palette.length];

    /* make an array of radii: small everywhere, big on last point */
    const radii = data.map((_, idx) => idx === data.length - 1 ? 6 : 2);

    /* optional: tint the last point */
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

  /* add benchmark lines */
  if (props.benchmarks[selectedMetric.value] && props.showBenchmarkLines[selectedMetric.value]) {
    datasets.push({
      label: 'Benchmark',
      data: Array(labels.length).fill(props.benchmarks[selectedMetric.value]),
      borderColor: 'green',
      borderDash: [5, 5], // dashed line
      pointRadius: Array(labels.length).fill(0), // no points
      pointBorderColor: 'green',
      pointBackgroundColor: Array(labels.length).fill('rgba(0,0,0,0)'),
      backgroundColor: 'rgba(0,0,0,0.05)',
      pointStyle: 'circle',
      fill: false
    });
  }

  return { labels, datasets };
});

/* keep options simple – you can extend later */
const chartOptions = { responsive: true, plugins: { legend: { display: true } } };

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
.card {
  background: #537895;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 300px;
  height: 200px;              /* 👈 fixed card height */
  display: flex;
  flex-direction: column;
  transition: transform 0.3s, box-shadow 0.3s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

/* Header */
.card h3 {
  margin: 0;
  padding: 0.75rem 0.5rem;
  font-size: 1.4rem;
  color: #fff;
  text-align: center;
  border-bottom: 1px dashed rgba(255,255,255,0.3);
}

/* ───── Scrollable body ───── */
.card-body {
  flex: 1 1 auto;             /* take remaining space */
  overflow-y: auto;           /* one scrollbar per card */
  padding: 0.5rem;
}

/* Each row */
.card-row {
  display: flex;
  justify-content: space-between;
  margin: 0.25rem 0;
}

.card-row .label {
  font-weight: bold;
  color: #fff;
}

.card-row .value {
  color: #fff;
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