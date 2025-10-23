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
  // Only test specific files with passing tests
  mutate: [
    "src/pages/Dashboard/Dashboard.jsx",
    "src/components/Layout/Layout.jsx",
    "src/utils/uuid.js"
  ],
  testRunnerCmd: ["test -- Dashboard.roles.test.jsx uuid.test.js --run"]
};
export default config;
