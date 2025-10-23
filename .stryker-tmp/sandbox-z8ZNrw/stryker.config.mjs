// @ts-nocheck
// 
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  _comment:
    "This config was generated using 'stryker init'. Please take a look at: https://stryker-mutator.io/docs/stryker-js/configuration/ for more information.",
  packageManager: "npm",
  reporters: ["html", "clear-text", "progress"],
  testRunner: "vitest",
  testRunner_comment:
    "Take a look at https://stryker-mutator.io/docs/stryker-js/vitest-runner for information about the vitest plugin.",
  coverageAnalysis: "perTest",
  buildCommand: "npm run build",
  // Focus on Layout and Dashboard for better coverage
  mutate: [
    "src/pages/Dashboard/Dashboard.jsx",
    "src/components/Layout/Layout.jsx"
  ]
};
export default config;
