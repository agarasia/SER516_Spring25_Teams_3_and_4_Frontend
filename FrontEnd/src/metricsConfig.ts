// src/metricsConfig.ts
export interface MetricCfg {
    value: string;
    label: string;            
    needsTags?: boolean;     
    benchmarkKey: string;    
    calcPath: string;         
    extraPaths?: {            
      tags?: string;          
    };
  }
  
  export const METRICS: MetricCfg[] = [
    {
      value: 'LCOM4',
      label: 'LCOM4',
      benchmarkKey: 'lcom4_benchmark',
      calcPath: 'lcom4'
    },
    {
      value: 'LCOMHS',
      label: 'LCOMHS',
      benchmarkKey: 'lcomhs_benchmark',
      calcPath: 'lcomhs'
    },
    {
      value: 'DefectScore',
      label: 'Defect Score',
      benchmarkKey: 'defect_score_benchmark',
      calcPath: 'defectscore',
      needsTags: true,
      extraPaths: {
        tags: 'defectscore/labelmapping'
      }
    },
    {
      value: 'AfferentCoupling',
      label: 'Afferent Coupling',
      benchmarkKey: 'afferent_coupling_benchmark',
      calcPath: 'afferentcoupling'
    },
    {
      value: 'EfferentCoupling',
      label: 'Efferent Coupling',
      benchmarkKey: 'efferent_coupling_benchmark',
      calcPath: 'efferentcoupling'
    },
    {
      value: 'DefectDensityAnalysis',
      label: 'Defect Density Analysis',
      benchmarkKey: 'defect_density_analysis_benchmark',
      calcPath: 'defectdensity'
    }
  ];
  export const metricCfg = (value: string) =>
    METRICS.find(m => m.value === value)!; 