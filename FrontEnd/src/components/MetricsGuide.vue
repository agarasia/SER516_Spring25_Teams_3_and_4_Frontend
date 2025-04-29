<template>
  <div class="metrics-guide-container">
    <!-- Metrics Content -->
    <div class="metrics-guide-box-1">
      <p class="metrics-guide-heading">Metrics Guide</p>
      <hr style="width: 3.8%; margin-left: 1.45em; height: 2px; background-color: #4A6C8B;">
      <table style="width: 100%; margin-top: 0em; margin-left:-1em">
        <td style="width: 20%; padding-right: 2em; padding-left: 2em;">
          <!-- Sidebar -->
          <div class="sidebar">
            <ul>
              <li v-for="(category, key) in categories" :key="key" :class="{ active: selectedCategory === key }"
                @click="filterByCategory(key)">
                <span :style="{ backgroundColor: category.color }" class="category-dot"></span>
                {{ key }}
              </li>
              <li :class="{ active: selectedCategory === 'All' }" @click="filterByCategory('All')">
                <span class="category-dot" style="background-color: #ccc;"></span>
                All Metrics
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
            <div v-for="metric in filteredMetrics" :key="metric.id" class="metric">
              <div class="metric-category">
                <span style="display: inline-flex; align-items: center;">
                  <span
                    :style="{ width: '10px', height: '10px', backgroundColor: metric.categoryColor, borderRadius: '50%', marginRight: '0.4em' }"></span>
                  {{ metric.category }}
                </span>
              </div>
              <div class="metric-heading-container">
                <img :src="metric.icon" alt="Icon"
                  style="width: 22px; height: 22px; margin-top:1.25em; padding-right:0.5em">
                <h1 class="metric-heading">{{ metric.name }}</h1>
              </div>
              <p>{{ metric.description }}</p>
              <hr style="width: 96.8%; margin-left: 0em; height: 0.1px; border: 0px; background-color: #ccc;">
              <div class="metric-overview" style="width: 95%;">
                <h2>Overview</h2>
                <p style="font-weight: 500;">{{ metric.overview }}</p>
                <h2>How to use this metric</h2>
                <p style="font-weight: 500;">{{ metric.usage.join(', ') }}</p>
                <div class="important-considerations">
                  <div class="important-header">
                    <img src="https://img.icons8.com/ios-filled/50/ffa500/error--v1.png" alt="Important Icon"
                      class="important-icon" />
                    <span>Important Considerations</span>
                  </div>
                  <p>{{ metric.considerations }}</p>
                </div>
                <div style="display: flex;gap: 20px; margin-top: 1em;">
                  <div class="when-to-use">
                    <h2>When to use</h2>
                    <ul style="font-weight: 500;">
                      <li v-for="usage in metric.whenToUse" :key="usage">{{ usage }}</li>
                    </ul>
                  </div>
                  <div class="when-to-use">
                    <h2>When not to use</h2>
                    <ul style="font-weight: 500;">
                      <li v-for="usage in metric.whenNotToUse" :key="usage">{{ usage }}</li>
                    </ul>
                  </div>
                </div>
                <div class="metric-interpretation">
                  <h2>Interpretation</h2>
                  <p style="font-weight: 500;">{{ metric.interpretation }}</p>
                </div>
                <h2>Related Metrics</h2>
                <div class="related-metrics">
                  <div v-for="related in metric.relatedMetrics" :key="related.name" class="related-metric">
                    <span class="related-metric-dot" :style="{ backgroundColor: related.color }"></span>
                    <span><strong>{{ related.name }}</strong></span>
                    <p>{{ related.description }}</p>
                  </div>
                </div>
                <br>
                <hr style="width: 96.8%; margin-left: 0em; height: 0.1px; border: 0px; background-color: #ccc;">
                <br>
              </div>
            </div>
          </div>
        </td>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MetricsGuide',
  data() {
    return {
      selectedCategory: 'All',
      categories: {
        Complexity: { color: 'violet' },
        Dependency: { color: 'Aqua' },
        Documentation: { color: 'green' },
        Coupling: { color: 'orange' },
        Cohesion: { color: 'purple' },
        Size: { color: 'blue' },
        Defect: { color: 'red' }
      },
      metrics: [
        {
          id: 'mccabe',
          name: "McCabe's Cyclomatic Complexity",
          category: 'Complexity',
          categoryColor: 'violet',
          icon: 'https://img.icons8.com/?size=100&id=94186&format=png&color=000000',
          description: 'Number of linearly independent paths through the source code.',
          overview: "Measures independent paths in code, aiding in identifying complexity, maintainability, and risks to improve quality and reliability.",
          usage: [
            'Identify overly complex code sections',
            'Prioritize refactoring efforts',
            'Improve maintainability and test coverage'
          ],
          considerations: "Ensure that Cyclomatic Complexity values are regularly reviewed and kept within acceptable thresholds. Excessively high values can indicate unmanageable code, while overly low values may suggest insufficient functionality.",
          interpretation: "Higher values indicate more complex code, which may be harder to maintain and test. Lower values suggest simpler, more maintainable code.",
          whenToUse: [
            'When assessing code maintainability',
            'When identifying complex sections of code',
            'When prioritizing refactoring efforts'
          ],
          whenNotToUse: [
            'For trivial or simple codebases',
            'When complexity is not a concern'
          ],
          relatedMetrics: [
            { name: "Halstead’s Program Volume", description: "Measures the size of a program based on operators and operands.", color: '#4A90E2' },
            { name: "Fan-in / Fan-out", description: "Analyzes the complexity of function or module interactions.", color: '#50E3C2' }
          ]
        },
        {
          id: 'halstead',
          name: "Halstead’s Program Volume",
          category: 'Complexity',
          categoryColor: 'violet',
          icon: 'https://img.icons8.com/?size=100&id=94186&format=png&color=000000',
          description: 'Measures the size of a program based on operators and operands.',
          overview: "Quantifies the size and complexity of code by counting operators and operands, providing insight into code maintainability and effort estimation.",
          usage: [
            'Estimate program complexity',
            'Assess maintainability',
            'Guide refactoring decisions'
          ],
          considerations: "Interpret volume in context with other metrics; high volume may indicate complex or verbose code.",
          interpretation: "Higher volume indicates larger and potentially more complex code that may require more effort to maintain.",
          whenToUse: [
            'When estimating program complexity',
            'When assessing maintainability',
            'When guiding refactoring decisions'
          ],
          whenNotToUse: [
            'For small or simple programs',
            'When operator and operand counts are irrelevant'
          ],
          relatedMetrics: [
            { name: "McCabe’s Cyclomatic Complexity", description: "Measures independent paths in code.", color: '#4A90E2' },
            { name: "Fog Index", description: "Measures readability of code.", color: '#50E3C2' }
          ]
        },
        {
          id: 'fanInFanOut',
          name: "Fan-in / Fan-out",
          category: 'Dependency',
          categoryColor: 'Aqua',
          icon: 'https://img.icons8.com/?size=100&id=i5rX6rFPpdpD&format=png&color=000000',
          description: 'Analyzes the complexity of function or module interactions.',
          overview: "Fan-in / Fan-out measures the number of functions or modules that call or are called by a specific function or module, helping to identify dependencies and potential bottlenecks.",
          usage: [
            'Identify tightly coupled modules',
            'Optimize module interactions',
            'Improve modularity and maintainability'
          ],
          considerations: "High fan-in indicates a module is heavily reused, which can be beneficial but may also create a bottleneck. High fan-out suggests a module depends on many others, increasing complexity.",
          interpretation: "Balanced fan-in and fan-out values indicate well-structured code. Extreme values may require refactoring to improve modularity and reduce dependencies.",
          whenToUse: [
            'When analyzing module dependencies',
            'When optimizing module interactions',
            'When improving modularity'
          ],
          whenNotToUse: [
            'For isolated or standalone modules',
            'When dependency analysis is not required'
          ],
          relatedMetrics: [
            { name: "McCabe’s Cyclomatic Complexity", description: "Measures independent paths in code.", color: '#4A90E2' },
            { name: "Halstead’s Program Volume", description: "Measures the size of a program based on operators and operands.", color: '#50E3C2' }
          ]
        },
        {
          id: 'fogIndex',
          name: "Fog Index",
          category: 'Documentation',
          categoryColor: 'green',
          icon: 'https://img.icons8.com/?size=100&id=Nufwnz5o5ElJ&format=png&color=000000',
          description: 'Measures the readability of code comments and documentation.',
          overview: "The Fog Index evaluates the readability of code by analyzing sentence complexity and word difficulty, helping to ensure code is understandable.",
          usage: [
            'Assess code readability',
            'Identify overly complex documentation',
            'Guide simplification efforts for better understanding'
          ],
          considerations: "A high Fog Index indicates documentation that may be difficult to read and understand. Aim for a balance between simplicity and functionality.",
          interpretation: "Lower Fog Index values suggest more readable documentation, while higher values indicate complexity that may hinder comprehension.",
          whenToUse: [
            'When assessing documentation readability',
            'When simplifying complex documentation',
            'When onboarding new developers'
          ],
          whenNotToUse: [
            'For informal or temporary documentation',
            'When readability is not a priority'
          ],
          relatedMetrics: [
            { name: "Code Comment Coverage", description: "Measures the percentage of code that is covered by comments.", color: '#50E3C2' },
            { name: "Halstead’s Program Volume", description: "Measures the size of a program based on operators and operands.", color: '#4A90E2' }
          ]
        },
        {
          id: 'codeCommentCoverage',
          name: "Code Comment Coverage",
          category: 'Documentation',
          categoryColor: 'green',
          icon: 'https://img.icons8.com/?size=100&id=Nufwnz5o5ElJ&format=png&color=000000',
          description: 'Measures the percentage of code that is covered by comments.',
          overview: "Code Comment Coverage ensures that code is well-documented, improving readability and maintainability.",
          usage: [
            'Ensure code is well-documented',
            'Improve code readability for developers',
            'Assist in onboarding new team members'
          ],
          considerations: "Higher coverage is generally better, but excessive comments may clutter the code. Aim for meaningful and concise comments.",
          interpretation: "Higher values indicate better-documented code, which is easier to understand and maintain.",
          whenToUse: [
            'When ensuring code is well-documented',
            'When improving code readability',
            'When onboarding new developers'
          ],
          whenNotToUse: [
            'For experimental or throwaway code',
            'When documentation is not required'
          ],
          relatedMetrics: [
            { name: "Fog Index", description: "Measures readability of code comments and documentation.", color: '#50E3C2' },
            { name: "McCabe’s Cyclomatic Complexity", description: "Measures independent paths in code.", color: '#4A90E2' }
          ]
        },
        {
          id: 'afferentCoupling',
          name: "Afferent Coupling",
          category: 'Coupling',
          categoryColor: 'orange',
          icon: 'https://img.icons8.com/?size=100&id=12640&format=png&color=000000',
          description: 'Measures the number of classes that depend on a given class.',
          overview: "Afferent Coupling identifies classes that are heavily relied upon, helping to assess stability and modularity.",
          usage: [
            'Analyze class dependencies',
            'Identify critical classes',
            'Improve modularity'
          ],
          considerations: "High afferent coupling indicates a class is heavily relied upon, which may reduce stability.",
          interpretation: "Lower values indicate better modularity, while higher values suggest critical dependencies.",
          whenToUse: [
            'When analyzing class dependencies',
            'When identifying critical classes',
            'When improving modularity'
          ],
          whenNotToUse: [
            'For standalone or isolated classes',
            'When dependency analysis is not required'
          ],
          relatedMetrics: [
            { name: "Efferent Coupling", description: "Measures the number of classes a given class depends on.", color: '#4A90E2' }
          ]
        },
        {
          id: 'efferentCoupling',
          name: "Efferent Coupling",
          category: 'Coupling',
          categoryColor: 'orange',
          icon: 'https://img.icons8.com/?size=100&id=12640&format=png&color=000000',
          description: 'Measures the number of classes that a given class depends on.',
          overview: "Efferent Coupling identifies classes that rely heavily on other classes, helping to assess modularity and maintainability.",
          usage: [
            'Analyze class dependencies',
            'Identify tightly coupled classes',
            'Guide refactoring efforts'
          ],
          considerations: "High efferent coupling indicates a class relies on many others, which may reduce modularity.",
          interpretation: "Lower values indicate better modularity, while higher values suggest potential refactoring opportunities.",
          whenToUse: [
            'When analyzing class dependencies',
            'When identifying tightly coupled classes',
            'When guiding refactoring efforts'
          ],
          whenNotToUse: [
            'For standalone or isolated classes',
            'When dependency analysis is not required'
          ],
          relatedMetrics: [
            { name: "Afferent Coupling", description: "Measures the number of classes that depend on a given class.", color: '#50E3C2' }
          ]
        },
        {
          id: 'instability',
          name: "Instability",
          category: 'Dependency',
          categoryColor: 'aqua',
          icon: 'https://img.icons8.com/?size=100&id=i5rX6rFPpdpD&format=png&color=000000',
          description: 'Measures the stability of a module based on its dependencies.',
          overview: "Instability is a measure of how likely a module is to change due to changes in other modules it depends on. It helps assess the robustness of the module's design.",
          usage: [
            'Identify modules with high dependency risks',
            'Guide refactoring efforts to reduce instability',
            'Improve the modularity of the codebase'
          ],
          considerations: "High instability indicates that a module is highly dependent on other modules, making it more prone to changes. Low instability suggests a more stable and independent module.",
          interpretation: "Values closer to 1 indicate high instability (high dependency), while values closer to 0 indicate low instability (high stability).",
          whenToUse: [
            'When analyzing module dependencies',
            'When improving modularity',
            'When reducing dependency risks'
          ],
          whenNotToUse: [
            'For standalone or isolated modules',
            'When dependency analysis is not required'
          ],
          relatedMetrics: [
            { name: "Afferent Coupling", description: "Measures the number of classes that depend on a given class.", color: '#50E3C2' },
            { name: "Efferent Coupling", description: "Measures the number of classes that a given class depends on.", color: '#4A90E2' }
          ]
        },
        {
          id: 'lcom4',
          name: "LCOM4",
          category: 'Cohesion',
          categoryColor: 'purple',
          icon: 'https://img.icons8.com/?size=100&id=89671&format=png&color=000000',
          description: 'Measures the cohesion of a class by analyzing the relationships between its methods and fields.',
          overview: "LCOM4 helps identify classes that may need to be split into smaller, more cohesive classes.",
          usage: [
            'Analyze class cohesion',
            'Identify poorly designed classes',
            'Guide refactoring efforts'
          ],
          considerations: "Low cohesion may indicate that a class is doing too much and should be split into smaller, more focused classes.",
          interpretation: "Lower values indicate higher cohesion, which is desirable. Higher values suggest poor cohesion.",
          whenToUse: [
            'When analyzing class cohesion',
            'When identifying poorly designed classes',
            'When guiding refactoring efforts'
          ],
          whenNotToUse: [
            'For small or simple classes',
            'When cohesion is not a concern'
          ],
          relatedMetrics: [
            { name: "LCOMHS", description: "A variation of LCOM4 that provides a more detailed analysis of class cohesion.", color: '#4A90E2' }
          ]
        },
        {
          id: 'lcomhs',
          name: "LCOMHS",
          category: 'Cohesion',
          categoryColor: 'purple',
          icon: 'https://img.icons8.com/?size=100&id=89671&format=png&color=000000',
          description: 'A variation of LCOM4 that provides a more detailed analysis of class cohesion.',
          overview: "LCOMHS offers a deeper analysis of class cohesion, helping to identify opportunities for refactoring and improving design.",
          usage: [
            'Analyze class cohesion in detail',
            'Identify opportunities for refactoring',
            'Improve class design'
          ],
          considerations: "Use LCOMHS in conjunction with other metrics to get a comprehensive view of class cohesion.",
          interpretation: "Lower values indicate higher cohesion, which is desirable. Higher values suggest poor cohesion.",
          whenToUse: [
            'When analyzing class cohesion in detail',
            'When identifying opportunities for refactoring',
            'When improving class design'
          ],
          whenNotToUse: [
            'For small or simple classes',
            'When cohesion is not a concern'
          ],
          relatedMetrics: [
            { name: "LCOM4", description: "Measures the cohesion of a class by analyzing the relationships between its methods and fields.", color: '#50E3C2' }
          ]
        },
        {
          id: 'codeChurn',
          name: "Code Churn",
          category: 'Size',
          categoryColor: 'blue',
          icon: 'https://img.icons8.com/?size=100&id=78833&format=png&color=000000',
          description: 'Tracks the number of lines of code added, modified, or deleted over time.',
          overview: "Code Churn measures the frequency of code changes, helping to assess code stability and development activity.",
          usage: [
            'Track development activity',
            'Identify unstable code areas',
            'Guide refactoring efforts'
          ],
          considerations: "High churn may indicate unstable code, while low churn may suggest mature and stable code.",
          interpretation: "Higher values indicate frequent changes, which may reduce stability. Lower values suggest stable code.",
          whenToUse: [
            'When tracking development activity',
            'When identifying unstable code areas',
            'When guiding refactoring efforts'
          ],
          whenNotToUse: [
            'For stable or legacy codebases',
            'When code changes are infrequent'
          ],
          relatedMetrics: [
            { name: "LOC", description: "Measures the total lines of code in the codebase.", color: '#4A90E2' }
          ]
        },
        {
          id: 'loc',
          name: "Lines of Code (LOC)",
          category: 'Size',
          categoryColor: 'blue',
          icon: 'https://img.icons8.com/?size=100&id=78833&format=png&color=000000',
          description: 'Measures the total lines of code in the codebase.',
          overview: "LOC provides a basic measure of the size of the codebase, helping to estimate effort and complexity.",
          usage: [
            'Estimate project size',
            'Track growth of the codebase',
            'Guide resource allocation'
          ],
          considerations: "High LOC may indicate a large and complex codebase, while low LOC may suggest simplicity or insufficient functionality.",
          interpretation: "Higher values indicate a larger codebase, which may require more effort to maintain.",
          whenToUse: [
            'When estimating project size',
            'When tracking growth of the codebase',
            'When guiding resource allocation'
          ],
          whenNotToUse: [
            'For small or simple projects',
            'When code size is not a concern'
          ],
          relatedMetrics: [
            { name: "Code Churn", description: "Tracks the number of lines of code added, modified, or deleted over time.", color: '#50E3C2' }
          ]
        },
        {
          id: 'defectsDiscovered',
          name: "Defects Discovered",
          category: 'Defect',
          categoryColor: 'red',
          icon: 'https://img.icons8.com/?size=100&id=94186&format=png&color=000000',
          description: 'Tracks the number of new defects found per unit time (or unit change).',
          overview: "Tracks the number of new defects discovered in the codebase over time, helping to assess code quality and testing effectiveness.",
          usage: [
            'Monitor defect discovery rates',
            'Identify areas of the codebase with frequent defects',
            'Guide testing and debugging efforts'
          ],
          considerations: "High defect discovery rates may indicate poor code quality or insufficient testing. Low rates may suggest stable code or insufficient testing coverage.",
          interpretation: "Higher values indicate more defects being discovered, which may require immediate attention. Lower values suggest fewer defects or stable code.",
          whenToUse: [
            'When monitoring code quality over time',
            'When identifying high-risk areas of the codebase',
            'When assessing testing effectiveness'
          ],
          whenNotToUse: [
            'For small or simple projects with minimal defects',
            'When defect tracking is not a priority'
          ],
          relatedMetrics: [
            { name: "Defects Removed", description: "Tracks the number of defects resolved over time.", color: '#50E3C2' },
            { name: "Defect Density", description: "Measures the number of defects per unit of code.", color: '#4A90E2' }
          ]
        },
        {
          id: 'defectsRemoved',
          name: "Defects Removed",
          category: 'Defect',
          categoryColor: 'red',
          icon: 'https://img.icons8.com/?size=100&id=94186&format=png&color=000000',
          description: 'Tracks the number of defects resolved per unit time (or unit change).',
          overview: "Tracks the number of defects resolved in the codebase over time, helping to assess the effectiveness of debugging and maintenance efforts.",
          usage: [
            'Monitor defect resolution rates',
            'Assess the effectiveness of debugging efforts',
            'Guide resource allocation for defect resolution'
          ],
          considerations: "High defect resolution rates indicate effective debugging efforts, while low rates may suggest resource constraints or complex defects.",
          interpretation: "Higher values indicate more defects being resolved, which is desirable. Lower values suggest slower resolution or resource constraints.",
          whenToUse: [
            'When tracking debugging efficiency',
            'When assessing defect resolution rates',
            'When prioritizing resource allocation for debugging'
          ],
          whenNotToUse: [
            'For projects with minimal defects',
            'When defect resolution tracking is not required'
          ],
          relatedMetrics: [
            { name: "Defects Discovered", description: "Tracks the number of new defects found over time.", color: '#50E3C2' },
            { name: "Mean-Time to Resolve", description: "Measures the average time taken to resolve defects.", color: '#4A90E2' }
          ]
        },
        {
          id: 'defectDensity',
          name: "Defect Density",
          category: 'Defect',
          categoryColor: 'red',
          icon: 'https://img.icons8.com/?size=100&id=94186&format=png&color=000000',
          description: 'Measures the number of defects per unit of code (e.g., per KLOC).',
          overview: "Defect Density provides a measure of code quality by calculating the number of defects per unit of code.",
          usage: [
            'Assess overall code quality',
            'Identify high-risk areas of the codebase',
            'Guide testing and refactoring efforts'
          ],
          considerations: "High defect density indicates poor code quality, while low density suggests better quality. Use in conjunction with other metrics for a comprehensive view.",
          interpretation: "Higher values indicate more defects per unit of code, which may require immediate attention. Lower values suggest better code quality.",
          whenToUse: [
            'When assessing code quality',
            'When identifying high-risk areas of the codebase',
            'When guiding testing and refactoring efforts'
          ],
          whenNotToUse: [
            'For small or simple projects',
            'When defect density tracking is not required'
          ],
          relatedMetrics: [
            { name: "Defects Discovered", description: "Tracks the number of new defects found over time.", color: '#50E3C2' },
            { name: "Defect Score", description: "Measures the severity of defects in the codebase.", color: '#4A90E2' }
          ]
        },
        {
          id: 'meanTimeToResolve',
          name: "Mean-Time to Resolve",
          category: 'Defect',
          categoryColor: 'red',
          icon: 'https://img.icons8.com/?size=100&id=94186&format=png&color=000000',
          description: 'Measures the average time taken to resolve defects.',
          overview: "Mean-Time to Resolve (MTTR) tracks the average time taken to resolve defects, helping to assess the efficiency of debugging efforts.",
          usage: [
            'Monitor defect resolution efficiency',
            'Identify bottlenecks in debugging processes',
            'Guide resource allocation for defect resolution'
          ],
          considerations: "High MTTR indicates slow defect resolution, which may impact project timelines. Low MTTR suggests efficient debugging efforts.",
          interpretation: "Higher values indicate slower defect resolution, which may require process improvements. Lower values suggest faster resolution times.",
          whenToUse: [
            'When tracking debugging efficiency',
            'When identifying bottlenecks in defect resolution',
            'When improving debugging processes'
          ],
          whenNotToUse: [
            'For projects with minimal defects',
            'When defect resolution tracking is not required'
          ],
          relatedMetrics: [
            { name: "Defects Removed", description: "Tracks the number of defects resolved over time.", color: '#50E3C2' },
            { name: "Defect Score", description: "Measures the severity of defects in the codebase.", color: '#4A90E2' }
          ]
        }
      ]
    };
  },
  computed: {
    filteredMetrics() {
      if (this.selectedCategory === 'All') {
        return this.metrics;
      }
      return this.metrics.filter(metric => metric.category === this.selectedCategory);
    }
  },
  methods: {
    filterByCategory(category) {
      this.selectedCategory = category;
    }
  }
};
</script>

<style scoped>
.related-metrics {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
}

.related-metric {
  border: 1.5px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  flex: 1;
  min-width: 250px;
  /* Ensure a minimum width for smaller screens */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.related-metric-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 10px;
}

.related-metric strong {
  font-size: 1em;
  margin-bottom: 5px;
}

.related-metric p {
  font-size: 0.9em;
  color: #555;
  margin-top: 5px;
}

.when-to-use {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
  width: 45%;
}

.metric-category {
  background-color: #f2f3f3;
  padding: 0.4em;
  border-radius: 5px;
  width: fit-content;
  font-weight: normal;
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
