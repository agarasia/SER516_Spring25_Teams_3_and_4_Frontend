// src/metricsConfig.ts
export interface MetricCfg {
    value: string;
    label: string;            
    needsTags?: boolean;     
    benchmarkKey: string;    
    calcPath: string;     
    currentKey: string;
    historyKey: string; 
    classScoped?: boolean;   
    extraPaths?: {            
      tags?: string;          
    };
    dependsOn?: string[];
  }
  
  export const METRICS: MetricCfg[] = [
    {
      value: 'LCOM4',
      label: 'LCOM4',
      benchmarkKey: 'lcom4_benchmark',
      calcPath: 'lcom4',
      currentKey: 'current_lcom4',
      historyKey: 'lcom4_history',
      classScoped: true
    },
    {
      value: 'LCOMHS',
      label: 'LCOMHS',
      benchmarkKey: 'lcomhs_benchmark',
      calcPath: 'lcomhs',
      currentKey: 'current_lcomhs',
      historyKey: 'lcomhs_history',
      classScoped: true
    },
    {
      value: 'DefectScore',
      label: 'Defect Score',
      benchmarkKey: 'defect_score_benchmark',
      calcPath: 'defectscore',
      needsTags: true,
      extraPaths: {
        tags: 'defectscore/labelmapping'
      },
      currentKey: 'current_defect_score',
      historyKey: 'defect_score_history',
      classScoped: false
    },
    {
      value: 'AfferentCoupling',
      label: 'Afferent Coupling',
      benchmarkKey: 'afferent_coupling_benchmark',
      calcPath: 'afferentcoupling',
      currentKey: 'current_afferent',
      historyKey: 'afferent_history',
      classScoped: true
    },
    {
      value: 'EfferentCoupling',
      label: 'Efferent Coupling',
      benchmarkKey: 'efferent_coupling_benchmark',
      calcPath: 'efferentcoupling',
      currentKey: 'current_efferent',
      historyKey: 'efferent_history',
      classScoped: true
    },
    {
      value: 'DefectDensityAnalysis',
      label: 'Defect Density Analysis',
      benchmarkKey: 'defect_density_analysis_benchmark',
      calcPath: 'defectdensity',
      currentKey: 'current_defect_density',
      historyKey: 'defect_density_history',
      classScoped: false
    },
    {
      value: 'Instability',
      label: 'Instability',
      benchmarkKey: 'instability_benchmark',
      calcPath: 'instability',
      currentKey: 'current_instability',
      historyKey: 'instability_history',
      classScoped: true,
      dependsOn: ['AfferentCoupling', 'EfferentCoupling']
    },
    {
      value: 'Halstead',
      label: 'Halstead',
      benchmarkKey: 'halstead_benchmark',
      calcPath: 'halstead',
      currentKey: 'current_halstead',
      historyKey: 'lcomhs_halstead',
      classScoped: true
    },
    {
      value: 'Cyclomatic Complexity',
      label: 'Cyclomatic Complexity',
      benchmarkKey: 'cyclomatic_benchmark',
      calcPath: 'cyclo',
      currentKey: 'current_cyclo',
      historyKey: 'cyclo_history',
      classScoped: true
    },
    {
      value: 'Defects Over Time',
      label: 'Defects Over Time',
      benchmarkKey: 'dot_benchmark',
      calcPath: 'dot',
      currentKey: 'current_dot',
      historyKey: 'dot_history',
      classScoped: true
    },
    {
      value: 'Code coverage',
      label: 'Code coverage',
      benchmarkKey: 'cc_benchmark',
      calcPath: 'cc',
      currentKey: 'current_cct',
      historyKey: 'cc_history',
      classScoped: true
    },
    {
      value: 'Fog index',
      label: 'Fog index',
      benchmarkKey: 'fog_benchmark',
      calcPath: 'fog',
      currentKey: 'current_fog',
      historyKey: 'fog_history',
      classScoped: true
    },
    {
      value: 'Code churn',
      label: 'Code churn',
      benchmarkKey: 'codechurn_benchmark',
      calcPath: 'codechurn',
      currentKey: 'current_codechurn',
      historyKey: 'codechurn_history',
      classScoped: true
    },
    {
      value: 'FIFO',
      label: 'FIFO',
      benchmarkKey: 'fifo_benchmark',
      calcPath: 'fifo',
      currentKey: 'current_fifo',
      historyKey: 'codechurn_fifo',
      classScoped: true
    }


  ];
  export const metricCfg = (value: string) =>
    METRICS.find(m => m.value === value)!; 