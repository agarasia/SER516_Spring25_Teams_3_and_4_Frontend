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
    }
  ];
  export const metricCfg = (value: string) =>
    METRICS.find(m => m.value === value)!; 