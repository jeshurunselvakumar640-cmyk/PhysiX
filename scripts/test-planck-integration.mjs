import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('====================================================');
console.log('PHYSIX - PLANCK\'S CONSTANT INTEGRATION VERIFICATION');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

// ----------------------------------------------------
// TEST 1: Inspect Files & Artifacts
// ----------------------------------------------------
console.log('\n--- Test 1: File Existence & Integrity ---');
const requiredFiles = [
  'src/planck.css',
  'src/planck.js',
  'src/experiment-details-data.js',
  'src/main.js',
  'src/pdf-export.js',
  'src/tutorial-manager.js',
  'src/user-data-service.js',
  'public/sw.js',
  'index.html'
];

requiredFiles.forEach(relPath => {
  const fullPath = path.join(rootDir, relPath);
  assert(fs.existsSync(fullPath), `File exists: ${relPath}`);
});

// ----------------------------------------------------
// TEST 2: Explore Simulations Card in index.html
// ----------------------------------------------------
console.log('\n--- Test 2: Explore Simulations Card in index.html ---');
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');

assert(indexHtml.includes('data-exp-target="planck"'), 'Planck card has data-exp-target="planck"');
assert(indexHtml.includes('class="lab-card active-lab" data-category="all quantum" data-exp-target="planck"'), 'Planck card is marked as active-lab in Explore Simulations');
assert(indexHtml.includes("Determination of Planck’s Constant using Photocell"), 'Card name includes Planck’s Constant');
assert(indexHtml.includes('data-category="all quantum"'), 'Card category includes "quantum"');
assert(indexHtml.includes('<link rel="stylesheet" href="/src/planck.css" />'), 'planck.css stylesheet is included in <head>');

// ----------------------------------------------------
// TEST 3: Experiment Details Data
// ----------------------------------------------------
console.log('\n--- Test 3: Experiment Details Registry & Content ---');
import { EXPERIMENT_DETAILS } from '../src/experiment-details-data.js';

assert(Boolean(EXPERIMENT_DETAILS['planck']), 'EXPERIMENT_DETAILS["planck"] is defined');
assert(Boolean(EXPERIMENT_DETAILS['plancks-constant']), 'EXPERIMENT_DETAILS["plancks-constant"] alias is defined');
assert(Boolean(EXPERIMENT_DETAILS['planck-constant']), 'EXPERIMENT_DETAILS["planck-constant"] alias is defined');

const planckDetails = EXPERIMENT_DETAILS['planck'];
assert(planckDetails.id === 'planck', 'Details ID is "planck"');
assert(planckDetails.title.includes("Planck"), 'Details title is accurate');
assert(planckDetails.aim && planckDetails.aim.length > 50, 'Aim section is populated');
assert(planckDetails.apparatus && planckDetails.apparatus.length > 50, 'Apparatus section is populated');
assert(planckDetails.theory && planckDetails.theory.length > 100, 'Theory section is populated');
assert(planckDetails.formula && planckDetails.formula.length > 100, 'Formula section is populated');
assert(planckDetails.procedure && planckDetails.procedure.length > 100, 'Procedure section is populated (Photocell + LED)');
assert(planckDetails.observation && planckDetails.observation.length > 100, 'Observation section has sample tables');
assert(planckDetails.result && planckDetails.result.length > 100, 'Result section is populated');
assert(planckDetails.precautions && planckDetails.precautions.length > 100, 'Precautions section is populated');
assert(Array.isArray(planckDetails.referenceBooks) && planckDetails.referenceBooks.length >= 3, 'Reference books has at least 3 verified citations');

// ----------------------------------------------------
// TEST 4: DOM Elements in #exp-planck-section
// ----------------------------------------------------
console.log('\n--- Test 4: DOM Elements in #exp-planck-section ---');
const requiredElementIds = [
  'exp-planck-section',
  'planck-filter-hud-badge',
  'planck-bench-canvas',
  'planck-graph-canvas',
  'planck-digital-volts',
  'planck-digital-amps',
  'planck-amp-unit',
  'planck-kpi-energy',
  'planck-kpi-freq',
  'planck-kpi-stopping',
  'planck-kpi-constant',
  'planck-kpi-work',
  'planck-kpi-error',
  'planck-btn-mode-photocell',
  'planck-btn-mode-led',
  'planck-btn-power-dc',
  'planck-btn-light',
  'planck-led-dc',
  'planck-led-light',
  'planck-photocell-palette',
  'planck-led-palette',
  'planck-cathode-select',
  'planck-volt-slider',
  'planck-volt-slider-val',
  'planck-btn-v-dec-fine',
  'planck-btn-v-inc-fine',
  'planck-btn-zero-null',
  'planck-intensity-slider',
  'planck-intensity-val',
  'planck-btn-graph-iv',
  'planck-btn-graph-reg',
  'planck-obs-count-badge',
  'planck-obs-table-body',
  'planck-obs-empty-state',
  'planck-btn-record',
  'planck-btn-export-pdf',
  'planck-btn-clear-obs',
  'theory-pane-exp-planck'
];

requiredElementIds.forEach(id => {
  assert(indexHtml.includes(`id="${id}"`), `DOM element exists: #${id}`);
});

// Check Spectral Filter and LED Chips
['uv', 'violet', 'blue', 'green', 'yellow', 'red'].forEach(filterId => {
  assert(indexHtml.includes(`data-filter="${filterId}"`), `Spectral filter chip exists: ${filterId}`);
});

['uv-395', 'blue-470', 'green-525', 'yellow-585', 'amber-605', 'red-635'].forEach(ledId => {
  assert(indexHtml.includes(`data-led="${ledId}"`), `LED specimen chip exists: ${ledId}`);
});

// ----------------------------------------------------
// TEST 5: Routing & Event Integration in main.js
// ----------------------------------------------------
console.log('\n--- Test 5: Routing & Experiment Switching in main.js ---');
const mainJs = fs.readFileSync(path.join(rootDir, 'src/main.js'), 'utf-8');

assert(mainJs.includes('import { createPlanckExperiment } from "./planck.js"'), 'createPlanckExperiment is imported');
assert(mainJs.includes('import "./planck.css"'), 'planck.css is imported in main.js');
assert(mainJs.includes('expId === "planck" || expId === "plancks-constant"'), 'switchExperiment normalizes planck ID');
assert(mainJs.includes('normalizedId === "planck"'), 'switchExperiment handles normalized planck');
assert(mainJs.includes('routeSlug = normalizedId === "planck"\n    ? "plancks-constant"'), 'routeSlug is set to plancks-constant');
assert(mainJs.includes('planckExperimentInstance = createPlanckExperiment('), 'planckExperimentInstance is created with callbacks');
assert(mainJs.includes('"planck": document.getElementById("theory-pane-exp-planck")'), 'theoryPanes includes planck');
assert(mainJs.includes('"planck": {\n      title: "Exp 8: Planck\'s Constant'), 'titles includes planck');
assert(mainJs.includes('experiment: "Determination of Planck\'s Constant"'), 'Live simulation context supports Planck telemetry for Vectra AI');
assert(mainJs.includes('target === "planck" || target === "plancks-constant"'), 'Card click handlers support planck');

// ----------------------------------------------------
// TEST 6: Core Quantum Physics Equations & Logic Validation
// ----------------------------------------------------
console.log('\n--- Test 6: Core Quantum Physics Equations ---');

// Mock DOM for headless Node test
const mockElements = {};
global.document = {
  getElementById: (id) => {
    if (!mockElements[id]) {
      mockElements[id] = {
        id,
        classList: { add: () => {}, remove: () => {}, toggle: () => {} },
        style: {},
        textContent: '',
        innerHTML: '',
        value: '0',
        getContext: () => ({
          clearRect: () => {},
          fillRect: () => {},
          beginPath: () => {},
          closePath: () => {},
          moveTo: () => {},
          lineTo: () => {},
          stroke: () => {},
          fill: () => {},
          arc: () => {},
          roundRect: () => {},
          fillText: () => {},
          measureText: () => ({ width: 100 }),
          save: () => {},
          restore: () => {},
          translate: () => {},
          rotate: () => {},
          setTransform: () => {},
          setLineDash: () => {},
          createLinearGradient: () => ({ addColorStop: () => {} }),
          createRadialGradient: () => ({ addColorStop: () => {} })
        }),
        querySelectorAll: () => [],
        querySelector: () => null,
        addEventListener: () => {}
      };
    }
    return mockElements[id];
  },
  querySelectorAll: () => [],
  querySelector: () => null
};

global.window = {
  devicePixelRatio: 1,
  addEventListener: () => {},
  removeEventListener: () => {},
  requestAnimationFrame: () => 1,
  cancelAnimationFrame: () => {}
};

global.localStorage = {
  _store: {},
  getItem: (k) => global.localStorage._store[k] || null,
  setItem: (k, v) => { global.localStorage._store[k] = v; },
  removeItem: (k) => { delete global.localStorage._store[k]; }
};

import { createPlanckExperiment } from '../src/planck.js';

const exp = createPlanckExperiment({
  showToast: () => {},
  onExperimentRecorded: () => {},
  onChallengeCompleted: () => {}
});

assert(typeof exp.getState === 'function', 'getState is exported');
assert(typeof exp.setFilter === 'function', 'setFilter is exported');
assert(typeof exp.setMode === 'function', 'setMode is exported');
assert(typeof exp.setAppliedVoltage === 'function', 'setAppliedVoltage is exported');
assert(typeof exp.recordObservation === 'function', 'recordObservation is exported');

const state = exp.getState();
assert(state.mode === 'photocell', 'Initial mode is photocell');

// Test Green Filter (546.1 nm) on Cesium (Phi = 2.14 eV)
// h = 6.62607e-34, c = 2.99792e8, e = 1.60218e-19
// nu = 5.4897e14 Hz. E = h*nu/e = 2.270 eV
// Theoretical Vs = 2.270 - 2.140 = 0.130 V
exp.setFilter('green');
exp.setAppliedVoltage(-0.13);
exp.renderAll();

assert(Math.abs(state.theoreticalVsV - 0.13) <= 0.01, `Theoretical Vs for Green on Cesium is ~0.13V (got: ${state.theoreticalVsV}V)`);
assert(state.photocurrentNa === 0, `Photocurrent is 0 at stopping potential (got: ${state.photocurrentNa} nA)`);
assert(Math.abs(state.calculatedPlanckH - 6.63) <= 0.05, `Deduced h is ~6.63 x 10^-34 J*s (got: ${state.calculatedPlanckH})`);

// Test Accelerating Voltage (+1.0 V) -> Non-zero Photocurrent
exp.setAppliedVoltage(1.0);
exp.renderAll();
assert(state.photocurrentNa > 0, `Photocurrent is positive under accelerating voltage (+1.0V: ${state.photocurrentNa} nA)`);

// Test Red Filter (632.8 nm) -> Below Threshold (1.959 eV < 2.14 eV)
exp.setFilter('red');
exp.setAppliedVoltage(1.0);
exp.renderAll();
assert(state.photocurrentNa === 0, `Photocurrent is zero for Red line below threshold frequency (got: ${state.photocurrentNa} nA)`);
assert(state.theoreticalVsV === 0, `Theoretical Vs is 0 when photon energy < work function (got: ${state.theoreticalVsV})`);

// Test UV Filter (365.0 nm) -> High Frequency (3.401 eV)
exp.setFilter('uv');
exp.renderAll();
assert(state.theoreticalVsV >= 1.25, `Theoretical Vs for UV line is high (~1.26V: got: ${state.theoreticalVsV}V)`);

// Test LED Mode
exp.setMode('led');
exp.renderAll();
assert(state.mode === 'led', 'Switched to LED Mode');
assert(state.calculatedPlanckH > 6.0 && state.calculatedPlanckH < 7.0, `LED deduced h is accurate (got: ${state.calculatedPlanckH} x 10^-34 J*s)`);

// Test Observation Recording
exp.clearObservations();
exp.recordObservation();
assert(state.observations.length === 1, 'Observation recorded to logbook (length: 1)');
assert(state.observations[0].sampleName.includes('LED'), `Observation sample matches mode (${state.observations[0].sampleName})`);

exp.destroy();

// ----------------------------------------------------
// TEST 7: CSS Architecture & Light Mode Scoping
// ----------------------------------------------------
console.log('\n--- Test 7: CSS Scoping & Theme Support ---');
const planckCss = fs.readFileSync(path.join(rootDir, 'src/planck.css'), 'utf-8');

assert(planckCss.includes('#exp-planck-section'), 'Styles are scoped to #exp-planck-section');
assert(planckCss.includes('[data-theme="light"] #exp-planck-section'), 'Light mode theme override is present');
assert(planckCss.includes('#planck-bench-canvas'), 'Bench canvas styling exists');
assert(planckCss.includes('#planck-graph-canvas'), 'Graph canvas styling exists');
assert(planckCss.includes('@media (max-width: 1100px)'), 'Responsive media query 1100px exists');
assert(planckCss.includes('@media (max-width: 768px)'), 'Responsive media query 768px exists');

// ----------------------------------------------------
// TEST 8: PDF Export & User Data Services Integration
// ----------------------------------------------------
console.log('\n--- Test 8: PDF Export & Utility Integrations ---');
const pdfExportJs = fs.readFileSync(path.join(rootDir, 'src/pdf-export.js'), 'utf-8');
assert(pdfExportJs.includes('raw.includes("planck")'), 'PDF export supports planck normalization');

const tutorialManagerJs = fs.readFileSync(path.join(rootDir, 'src/tutorial-manager.js'), 'utf-8');
assert(tutorialManagerJs.includes('case "planck":'), 'tutorialManager normalizes planck ID');

const userDataJs = fs.readFileSync(path.join(rootDir, 'src/user-data-service.js'), 'utf-8');
assert(userDataJs.includes('case "planck":'), 'userDataService normalizes planck for display');

const swJs = fs.readFileSync(path.join(rootDir, 'public/sw.js'), 'utf-8');
assert(swJs.includes('/src/planck.js'), 'Service worker precaches /src/planck.js');
assert(swJs.includes('/src/planck.css'), 'Service worker precaches /src/planck.css');

// ----------------------------------------------------
// Summary
// ----------------------------------------------------
console.log('\n====================================================');
console.log(`TOTAL TESTS: ${totalTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log('====================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('\nALL INTEGRATION TESTS PASSED PERFECTLY!\n');
  process.exit(0);
}
