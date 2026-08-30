import Matter from "matter-js";
import "./style.css";
import quizData from "../quiz.json";

const {
  Engine,
  Render,
  Runner,
  Bodies,
  Composite,
  Body,
  Events
} = Matter;

// ==========================================
// CONSTANTS & CALIBRATION SCALE
// ==========================================
// 12 screen pixels = 1.0 physical meter
const SCALE = 12;
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 600;
const GROUND_Y = 540; // Ground surface y coordinate
const ORIGIN_X = 80;  // X=0m anchor coordinate

const DEFAULT_VELOCITY = 20.0;
const DEFAULT_ANGLE = 45;
const DEFAULT_GRAVITY = 9.8;
const DEFAULT_HEIGHT = 0.0;

// Launcher specs
const PIVOT = { x: ORIGIN_X, y: GROUND_Y }; // Anchored at ground origin by default
const BARREL_LENGTH = 48;                   // 4.0m
const BARREL_WIDTH = 16;
const PROJECTILE_RADIUS = 9;                // 0.75m radius

// ==========================================
// SIMULATION STATE
// ==========================================
let simState = {
  isRunning: false,
  flightTime: 0,
  currentX: 0,
  currentY: 0,
  currentVx: 0,
  currentVy: 0,
  currentSpeed: 0,

  // Kinematic parameters for current shot
  launchX: ORIGIN_X,
  launchY: GROUND_Y,
  v0x: 0,
  v0y: 0,
  g: 9.8,
  totalFlightTime: 0,

  showVectors: true,
  showGhosts: true,
  targetMode: false,
  targetDistance: 35.0, // meters
  targetScore: 0,
  targetHitEffect: 0,

  currentTrail: [],
  ghostTrails: []
};

// ==========================================
// MATTER.JS INITIALIZATION
// ==========================================
const engine = Engine.create({
  enableSleeping: false
});
const world = engine.world;
// Disable default Matter.js gravity so we can run exact physics kinematics
engine.gravity.y = 0;
engine.gravity.scale = 0;

const render = Render.create({
  element: document.getElementById("simulation"),
  engine: engine,
  options: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    wireframes: false,
    background: "#080d18",
    showVelocity: false
  }
});

// Create Ground
const groundBody = Bodies.rectangle(
  CANVAS_WIDTH / 2,
  GROUND_Y + 40,
  CANVAS_WIDTH + 200,
  80,
  {
    isStatic: true,
    isSensor: true,
    render: {
      fillStyle: "#121a2d",
      strokeStyle: "#23314e",
      lineWidth: 2
    }
  }
);
Composite.add(world, groundBody);

// Create Launcher Base and Wheel (sensors to avoid collision blocking)
const launcherBase = Bodies.rectangle(
  PIVOT.x - 10,
  GROUND_Y - 15,
  50,
  30,
  {
    isStatic: true,
    isSensor: true,
    render: { fillStyle: "#1a243b" }
  }
);

const launcherWheel = Bodies.circle(
  PIVOT.x,
  PIVOT.y,
  14,
  {
    isStatic: true,
    isSensor: true,
    render: { fillStyle: "#2a3756", strokeStyle: "#8b5cf6", lineWidth: 2 }
  }
);

// Launcher Barrel Body
const initialRadians = (DEFAULT_ANGLE * Math.PI) / 180;
const initialBarrelX = PIVOT.x + (BARREL_LENGTH / 2) * Math.cos(initialRadians);
const initialBarrelY = PIVOT.y - (BARREL_LENGTH / 2) * Math.sin(initialRadians);

const launcherBarrel = Bodies.rectangle(
  initialBarrelX,
  initialBarrelY,
  BARREL_LENGTH,
  BARREL_WIDTH,
  {
    isStatic: true,
    isSensor: true,
    render: {
      fillStyle: "#ff4757"
    }
  }
);

// Initialize projectile body so it is immediately visible on screen
let projectile = Bodies.circle(PIVOT.x, PIVOT.y, PROJECTILE_RADIUS, {
  isSensor: true,
  render: {
    fillStyle: "#ff4757",
    strokeStyle: "#ffffff",
    lineWidth: 2
  }
});

Composite.add(world, [launcherBase, launcherBarrel, launcherWheel, projectile]);

let launchTimestamp = 0;

// ==========================================
// DOM ELEMENTS
// ==========================================
const velocitySlider = document.getElementById("velocity");
const angleSlider = document.getElementById("angle");
const heightSlider = document.getElementById("height");
const gravitySlider = document.getElementById("gravity");

const velocityValue = document.getElementById("velocity-value");
const angleValue = document.getElementById("angle-value");
const heightValue = document.getElementById("height-value");
const gravityValue = document.getElementById("gravity-value");

const launchButton = document.getElementById("launch");
const resetButton = document.getElementById("reset");
const clearTrailsButton = document.getElementById("clear-trails");

const toggleVectors = document.getElementById("toggle-vectors");
const toggleGhosts = document.getElementById("toggle-ghosts");
const toggleTarget = document.getElementById("toggle-target");

const targetBanner = document.getElementById("target-banner");
const targetDistanceText = document.getElementById("target-distance-text");
const targetScoreText = document.getElementById("target-score");

const planetBtns = document.querySelectorAll(".planet-btn");

// HUD Elements
const hudTime = document.getElementById("hud-time");
const hudHeight = document.getElementById("hud-height");
const hudDistance = document.getElementById("hud-distance");
const hudSpeed = document.getElementById("hud-speed");

// Results Display
const maxHeightDisplay = document.getElementById("max-height");
const rangeDisplay = document.getElementById("range");
const flightTimeDisplay = document.getElementById("flight-time");
const impactVelocityDisplay = document.getElementById("impact-velocity");

// Modals
const explorerModal = document.getElementById("explorer-modal");
const theoryModal = document.getElementById("theory-modal");
const profileModal = document.getElementById("profile-modal");
const quizModal = document.getElementById("quiz-modal");

const btnOpenExplorer = document.getElementById("btn-open-explorer");
const btnCloseExplorer = document.getElementById("btn-close-explorer");

const btnOpenTheory = document.getElementById("btn-open-theory");
const btnCloseTheory = document.getElementById("btn-close-theory");

const userProfileBtn = document.getElementById("user-profile-btn");
const btnCloseProfile = document.getElementById("btn-close-profile");

// Quiz DOM Elements
const btnOpenQuiz = document.getElementById("btn-open-quiz");
const btnQuickQuiz = document.getElementById("btn-quick-quiz");
const btnCloseQuiz = document.getElementById("btn-close-quiz");
const btnStartQuiz = document.getElementById("btn-start-quiz");
const btnPrevQuestion = document.getElementById("btn-prev-question");
const btnNextQuestion = document.getElementById("btn-next-question");
const btnToggleHint = document.getElementById("btn-toggle-hint");
const btnRetakeQuiz = document.getElementById("btn-retake-quiz");
const btnFinishQuiz = document.getElementById("btn-finish-quiz");

const quizStartView = document.getElementById("quiz-start-view");
const quizActiveView = document.getElementById("quiz-active-view");
const quizResultsView = document.getElementById("quiz-results-view");

const quizStatTotal = document.getElementById("quiz-stat-total");
const quizBestScoreDisplay = document.getElementById("quiz-best-score-display");
const quizProgressText = document.getElementById("quiz-progress-text");
const quizQuestionCategory = document.getElementById("quiz-question-category");
const quizProgressFill = document.getElementById("quiz-progress-fill");
const quizDifficultyPill = document.getElementById("quiz-difficulty-pill");
const quizQuestionText = document.getElementById("quiz-question-text");
const quizOptionsContainer = document.getElementById("quiz-options-container");
const quizHintAccordion = document.getElementById("quiz-hint-accordion");
const quizHintBody = document.getElementById("quiz-hint-body");
const quizHintFormula = document.getElementById("quiz-hint-formula");
const hintChevron = document.getElementById("hint-chevron");
const quizStepperDots = document.getElementById("quiz-stepper-dots");

// Quiz Results Elements
const scoreCircleBar = document.getElementById("score-circle-bar");
const resultsScorePercent = document.getElementById("results-score-percent");
const resultsScoreFraction = document.getElementById("results-score-fraction");
const resultsTierBadge = document.getElementById("results-tier-badge");
const resultsHeadline = document.getElementById("results-headline");
const resultsMessage = document.getElementById("results-message");
const resultsCorrectCount = document.getElementById("results-correct-count");
const resultsIncorrectCount = document.getElementById("results-incorrect-count");
const resultsTimeTaken = document.getElementById("results-time-taken");
const resultsHighScore = document.getElementById("results-high-score");
const quizReviewList = document.getElementById("quiz-review-list");

// ==========================================
// QUIZ STATE
// ==========================================
let quizState = {
  questions: quizData.questions || [],
  currentIndex: 0,
  userAnswers: new Array((quizData.questions || []).length).fill(null),
  isSubmitted: false,
  startTime: null,
  timeTaken: 0,
  score: 0,
  highScore: parseInt(localStorage.getItem("physix_quiz_highscore") || "0", 10)
};

const toastEl = document.getElementById("toast");

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
let toastTimeout = null;
function showToast(message) {
  if (toastTimeout) clearTimeout(toastTimeout);
  toastEl.textContent = message;
  toastEl.classList.remove("hidden");
  toastTimeout = setTimeout(() => {
    toastEl.classList.add("hidden");
  }, 3200);
}

// ==========================================
// BARREL POSITIONING
// ==========================================
function updateLauncher(angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  const h0 = Number(heightSlider ? heightSlider.value : 0);
  PIVOT.y = GROUND_Y - h0 * SCALE;

  const centerX = PIVOT.x + (BARREL_LENGTH / 2) * Math.cos(rad);
  const centerY = PIVOT.y - (BARREL_LENGTH / 2) * Math.sin(rad);

  Body.setPosition(launcherBarrel, { x: centerX, y: centerY });
  Body.setAngle(launcherBarrel, -rad);

  Body.setPosition(launcherWheel, { x: PIVOT.x, y: PIVOT.y });
  Body.setPosition(launcherBase, { x: PIVOT.x - 10, y: GROUND_Y - 15 });

  if (projectile && !simState.isRunning) {
    Body.setPosition(projectile, { x: PIVOT.x, y: PIVOT.y });
  }
}

// ==========================================
// THEORETICAL CALCULATIONS
// ==========================================
function calculateTheoreticalResults() {
  const v0 = Number(velocitySlider.value);
  const angleDeg = Number(angleSlider.value);
  const g = Number(gravitySlider.value);
  const h0 = Number(heightSlider ? heightSlider.value : 0);
  const rad = (angleDeg * Math.PI) / 180;

  if (g <= 0.01) {
    maxHeightDisplay.textContent = "∞";
    rangeDisplay.textContent = "∞";
    flightTimeDisplay.textContent = "∞";
    impactVelocityDisplay.textContent = `${v0.toFixed(2)} m/s`;
    return { maxHeight: Infinity, totalRange: Infinity, timeOfFlight: Infinity, impactSpeed: v0, h0 };
  }

  const v0y = v0 * Math.sin(rad);
  const v0x = v0 * Math.cos(rad);

  // Time of flight T
  let timeOfFlight = 0;
  if (h0 <= 0.001) {
    timeOfFlight = (2 * v0y) / g;
  } else {
    const discriminant = v0y * v0y + 2 * g * h0;
    timeOfFlight = (v0y + Math.sqrt(Math.max(0, discriminant))) / g;
  }

  // Max Height from ground H = h0 + (v0y^2)/(2g)
  const peakFromRelease = (v0y * v0y) / (2 * g);
  const maxHeight = h0 + peakFromRelease;

  // Total Range R = v0x * T
  const totalRange = v0x * timeOfFlight;

  // Impact Velocity vf = sqrt(v0^2 + 2*g*h0)
  const impactSpeed = Math.sqrt(v0 * v0 + 2 * g * h0);

  maxHeightDisplay.textContent = `${maxHeight.toFixed(2)} m`;
  rangeDisplay.textContent = `${totalRange.toFixed(2)} m`;
  flightTimeDisplay.textContent = `${timeOfFlight.toFixed(2)} s`;
  impactVelocityDisplay.textContent = `${impactSpeed.toFixed(2)} m/s`;

  return { maxHeight, totalRange, timeOfFlight, impactSpeed, h0 };
}

// ==========================================
// LAUNCH PROJECTILE
// ==========================================
function launchProjectile() {
  const v0 = Number(velocitySlider.value);
  const angleDeg = Number(angleSlider.value);
  const g = Number(gravitySlider.value);
  const h0 = Number(heightSlider ? heightSlider.value : 0);
  const rad = (angleDeg * Math.PI) / 180;

  const theoretical = calculateTheoreticalResults();

  // Save current trail to ghost trails if comparison mode is enabled
  if (simState.currentTrail.length > 5 && simState.showGhosts) {
    simState.ghostTrails.push({
      points: [...simState.currentTrail],
      color: getRandomGhostColor(),
      label: `${angleDeg}° | ${v0.toFixed(0)}m/s | R=${theoretical.totalRange.toFixed(1)}m`
    });
    if (simState.ghostTrails.length > 6) {
      simState.ghostTrails.shift();
    }
  }
  simState.currentTrail = [];

  // Remove existing projectile body
  if (projectile) {
    Composite.remove(world, projectile);
    projectile = null;
  }

  simState.launchX = ORIGIN_X;
  simState.launchY = GROUND_Y - h0 * SCALE;
  simState.v0x = v0 * Math.cos(rad);
  simState.v0y = v0 * Math.sin(rad);
  simState.g = g;
  simState.totalFlightTime = theoretical.timeOfFlight;

  // Create Projectile Rigid Body
  projectile = Bodies.circle(simState.launchX, simState.launchY, PROJECTILE_RADIUS, {
    isSensor: true,
    render: {
      fillStyle: "#ff4757",
      strokeStyle: "#ffffff",
      lineWidth: 2
    }
  });

  Composite.add(world, projectile);

  simState.isRunning = true;
  simState.flightTime = 0;
  launchTimestamp = performance.now();
}

function getRandomGhostColor() {
  const colors = [
    "rgba(139, 92, 246, 0.55)",  // Purple
    "rgba(59, 130, 246, 0.55)",  // Blue
    "rgba(16, 185, 129, 0.55)",  // Emerald
    "rgba(245, 158, 11, 0.55)",  // Amber
    "rgba(236, 72, 153, 0.55)",  // Pink
    "rgba(6, 182, 212, 0.55)"    // Cyan
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// ==========================================
// RESET SIMULATION
// ==========================================
function resetSimulation() {
  simState.isRunning = false;
  simState.flightTime = 0;
  simState.currentTrail = [];

  const h0 = Number(heightSlider ? heightSlider.value : 0);
  PIVOT.y = GROUND_Y - h0 * SCALE;

  if (projectile) {
    Body.setPosition(projectile, { x: PIVOT.x, y: PIVOT.y });
  } else {
    projectile = Bodies.circle(PIVOT.x, PIVOT.y, PROJECTILE_RADIUS, {
      isSensor: true,
      render: {
        fillStyle: "#ff4757",
        strokeStyle: "#ffffff",
        lineWidth: 2
      }
    });
    Composite.add(world, projectile);
  }

  hudTime.textContent = "0.00 s";
  hudHeight.textContent = `${h0.toFixed(2)} m`;
  hudDistance.textContent = "0.00 m";
  hudSpeed.textContent = "0.00 m/s";

  calculateTheoreticalResults();
}

// ==========================================
// TARGET MODE HIT DETECTION
// ==========================================
function checkTargetHit(landX) {
  if (!simState.targetMode) return;

  const targetPixelX = ORIGIN_X + simState.targetDistance * SCALE;
  const diffMeters = Math.abs(landX - targetPixelX) / SCALE;

  if (diffMeters <= 1.5) {
    // Bullseye!
    simState.targetScore += 100;
    simState.targetHitEffect = 35;
    showToast("Target Hit: Bullseye (+100 pts)");
    spawnNewTarget();
  } else if (diffMeters <= 3.5) {
    // Near hit
    simState.targetScore += 50;
    simState.targetHitEffect = 25;
    showToast("Target Hit: Near Miss (+50 pts)");
    spawnNewTarget();
  }
  targetScoreText.textContent = simState.targetScore;
}

function spawnNewTarget() {
  simState.targetDistance = Math.floor(Math.random() * 40 + 20);
  targetDistanceText.textContent = `${simState.targetDistance.toFixed(1)} m`;
}

// ==========================================
// KINEMATIC UPDATE LOOP (PHYSICAL ACCURACY)
// ==========================================
Events.on(engine, "beforeUpdate", () => {
  if (!projectile || !simState.isRunning) return;

  // Real-world elapsed time in seconds
  const t = (performance.now() - launchTimestamp) / 1000;
  simState.flightTime = t;

  // Kinematic Position:
  // x(t) = launchX + (v0x * t) * SCALE
  // y(t) = launchY - (v0y * t - 0.5 * g * t^2) * SCALE
  const px = simState.launchX + (simState.v0x * t) * SCALE;
  const py = simState.launchY - (simState.v0y * t - 0.5 * simState.g * t * t) * SCALE;

  // Kinematic Velocities:
  const vx = simState.v0x;
  const vy = simState.v0y - simState.g * t;
  const speed = Math.hypot(vx, vy);

  const realDistance = Math.max(0, (px - ORIGIN_X) / SCALE);
  const realAltitude = Math.max(0, (GROUND_Y - py) / SCALE);

  simState.currentX = px;
  simState.currentY = py;
  simState.currentVx = vx;
  simState.currentVy = vy;
  simState.currentSpeed = speed;

  // Update HUD
  hudTime.textContent = `${t.toFixed(2)} s`;
  hudHeight.textContent = `${realAltitude.toFixed(2)} m`;
  hudDistance.textContent = `${realDistance.toFixed(2)} m`;
  hudSpeed.textContent = `${speed.toFixed(2)} m/s`;

  // Add trail point
  const lastPoint = simState.currentTrail[simState.currentTrail.length - 1];
  if (!lastPoint || Math.hypot(px - lastPoint.x, py - lastPoint.y) >= 3) {
    simState.currentTrail.push({ x: px, y: py });
  }

  // Check Touchdown at Ground or End of Canvas
  if (py >= GROUND_Y || px > CANVAS_WIDTH + 50 || t >= simState.totalFlightTime) {
    const finalY = GROUND_Y;
    const finalX = simState.launchX + (simState.v0x * simState.totalFlightTime) * SCALE;
    Body.setPosition(projectile, { x: finalX, y: finalY });
    simState.currentTrail.push({ x: finalX, y: finalY });
    simState.isRunning = false;

    // Set exact landing metrics in HUD
    const theoretical = calculateTheoreticalResults();
    hudTime.textContent = `${theoretical.timeOfFlight.toFixed(2)} s`;
    hudHeight.textContent = "0.00 m";
    hudDistance.textContent = `${theoretical.totalRange.toFixed(2)} m`;
    hudSpeed.textContent = `${theoretical.impactSpeed.toFixed(2)} m/s`;

    checkTargetHit(finalX);
    return;
  }

  Body.setPosition(projectile, { x: px, y: py });
});

// ==========================================
// CUSTOM CANVAS OVERLAY RENDER
// (Coordinate Grid, Rulers, Vectors, Target, Glowing Trails)
// ==========================================
Events.on(render, "afterRender", () => {
  const ctx = render.context;
  if (!ctx) return;

  ctx.save();

  // 1. DRAW METRIC COORDINATE GRID
  drawCoordinateGrid(ctx);

  // 2. DRAW TARGET (if enabled)
  if (simState.targetMode) {
    drawTarget(ctx);
  }

  // 3. DRAW GHOST TRAILS
  if (simState.showGhosts) {
    drawGhostTrails(ctx);
  }

  // 4. DRAW ACTIVE TRAJECTORY TRAIL
  drawActiveTrail(ctx);

  // 5. DRAW ACTIVE PROJECTILE (Glowing Red Projectile with White Core Highlight)
  if (projectile) {
    const pos = projectile.position;
    ctx.save();
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, PROJECTILE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "#ff4757";
    ctx.shadowColor = "#ff4757";
    ctx.shadowBlur = 14;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(pos.x - 2, pos.y - 2, PROJECTILE_RADIUS / 2.8, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.restore();
  }

  // 6. DRAW VELOCITY VECTORS
  if (projectile && simState.isRunning && simState.showVectors) {
    drawVelocityVectors(ctx, simState.currentX, simState.currentY);
  }

  // 7. DRAW CANNON DETAILS & ACCENTS
  drawCannonAccent(ctx);

  ctx.restore();
});

function drawCoordinateGrid(ctx) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(35, 49, 78, 0.4)";
  ctx.fillStyle = "#64748b";
  ctx.font = "11px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";

  const maxMeters = Math.floor((CANVAS_WIDTH - ORIGIN_X) / SCALE);

  for (let m = 0; m <= maxMeters; m += 5) {
    const x = ORIGIN_X + m * SCALE;
    const isMajor = m % 10 === 0;

    if (isMajor) {
      // Full subtle height grid line
      ctx.beginPath();
      ctx.strokeStyle = "rgba(42, 58, 92, 0.35)";
      ctx.setLineDash([4, 4]);
      ctx.moveTo(x, 40);
      ctx.lineTo(x, GROUND_Y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label at ground
      ctx.fillStyle = "#7987a5";
      ctx.fillText(`${m}m`, x, GROUND_Y + 22);
    } else {
      // Sub-tick on ground line
      ctx.beginPath();
      ctx.strokeStyle = "rgba(74, 96, 144, 0.6)";
      ctx.moveTo(x, GROUND_Y - 5);
      ctx.lineTo(x, GROUND_Y + 5);
      ctx.stroke();
    }
  }

  // Horizontal altitude grid lines every 10m
  for (let h = 10; h <= 40; h += 10) {
    const y = GROUND_Y - h * SCALE;
    if (y < 40) continue;

    ctx.beginPath();
    ctx.strokeStyle = "rgba(42, 58, 92, 0.25)";
    ctx.setLineDash([3, 5]);
    ctx.moveTo(ORIGIN_X - 20, y);
    ctx.lineTo(CANVAS_WIDTH - 20, y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#506080";
    ctx.textAlign = "right";
    ctx.fillText(`${h}m`, ORIGIN_X - 10, y + 4);
  }

  // Ground Line Glowing Top Border
  ctx.beginPath();
  ctx.strokeStyle = "#38bdf8";
  ctx.shadowColor = "#0284c7";
  ctx.shadowBlur = 8;
  ctx.lineWidth = 2;
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawTarget(ctx) {
  const targetX = ORIGIN_X + simState.targetDistance * SCALE;
  const targetY = GROUND_Y;

  // Flash effect on hit
  if (simState.targetHitEffect > 0) {
    ctx.beginPath();
    ctx.arc(targetX, targetY - 15, 45, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(245, 158, 11, ${simState.targetHitEffect / 35})`;
    ctx.fill();
    simState.targetHitEffect--;
  }

  // Target Pad
  ctx.fillStyle = "#f59e0b";
  ctx.shadowColor = "#f59e0b";
  ctx.shadowBlur = 10;
  ctx.fillRect(targetX - 25, targetY - 4, 50, 6);
  ctx.shadowBlur = 0;

  // Bullseye Concentric Rings
  ctx.beginPath();
  ctx.arc(targetX, targetY - 18, 16, 0, Math.PI * 2);
  ctx.fillStyle = "#ef4444";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(targetX, targetY - 18, 11, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(targetX, targetY - 18, 6, 0, Math.PI * 2);
  ctx.fillStyle = "#ef4444";
  ctx.fill();

  // Flag pole
  ctx.beginPath();
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 2;
  ctx.moveTo(targetX, targetY - 34);
  ctx.lineTo(targetX, targetY - 4);
  ctx.stroke();

  // Flag
  ctx.beginPath();
  ctx.fillStyle = "#f59e0b";
  ctx.moveTo(targetX, targetY - 34);
  ctx.lineTo(targetX + 16, targetY - 26);
  ctx.lineTo(targetX, targetY - 18);
  ctx.closePath();
  ctx.fill();
}

function drawGhostTrails(ctx) {
  simState.ghostTrails.forEach(trail => {
    if (trail.points.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = trail.color;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);

    ctx.moveTo(trail.points[0].x, trail.points[0].y);
    for (let i = 1; i < trail.points.length; i++) {
      ctx.lineTo(trail.points[i].x, trail.points[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Small label near landing
    const lastP = trail.points[trail.points.length - 1];
    ctx.fillStyle = trail.color;
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(trail.label, lastP.x, lastP.y - 12);
  });
}

function drawActiveTrail(ctx) {
  const points = simState.currentTrail;
  if (points.length < 2) return;

  // Glowing Outer Stroke
  ctx.beginPath();
  ctx.strokeStyle = "rgba(255, 71, 87, 0.45)";
  ctx.lineWidth = 6;
  ctx.shadowColor = "#ff4757";
  ctx.shadowBlur = 12;
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Solid Inner Path
  ctx.beginPath();
  ctx.strokeStyle = "#ffbe76";
  ctx.lineWidth = 2.5;
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
}

function drawVelocityVectors(ctx, px, py) {
  const scaleVec = 2.2; // visual scale factor for arrows
  const vxPix = simState.currentVx * scaleVec;
  const vyPix = -simState.currentVy * scaleVec; // screen y is inverted

  // 1. Vx Component (Green)
  drawArrow(ctx, px, py, px + vxPix, py, "#10b981", 2);

  // 2. Vy Component (Amber/Orange)
  drawArrow(ctx, px, py, px, py + vyPix, "#f59e0b", 2);

  // 3. Resultant Velocity Vector (Cyan)
  drawArrow(ctx, px, py, px + vxPix, py + vyPix, "#06b6d4", 3);

  // Small telemetry badge next to ball
  ctx.fillStyle = "rgba(8, 13, 24, 0.85)";
  ctx.strokeStyle = "rgba(6, 182, 212, 0.5)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(px + 14, py - 26, 82, 20, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#38bdf8";
  ctx.font = "10px 'JetBrains Mono', monospace";
  ctx.textAlign = "left";
  ctx.fillText(`v=${simState.currentSpeed.toFixed(1)}m/s`, px + 18, py - 13);
}

function drawArrow(ctx, fromX, fromY, toX, toY, color, width) {
  const headLength = 8;
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);
  const length = Math.hypot(dx, dy);

  if (length < 4) return;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  // Arrow Head
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}

function drawCannonAccent(ctx) {
  const h0 = Number(heightSlider ? heightSlider.value : 0);
  const pivotY = GROUND_Y - h0 * SCALE;

  // If elevated, draw sci-fi support pedestal
  if (h0 > 0) {
    ctx.save();
    ctx.fillStyle = "rgba(18, 25, 42, 0.95)";
    ctx.strokeStyle = "rgba(139, 92, 246, 0.6)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#8b5cf6";
    ctx.shadowBlur = 8;
    ctx.fillRect(ORIGIN_X - 14, pivotY, 28, GROUND_Y - pivotY);
    ctx.strokeRect(ORIGIN_X - 14, pivotY, 28, GROUND_Y - pivotY);
    ctx.shadowBlur = 0;

    // Pedestal base plate
    ctx.fillStyle = "#2a3756";
    ctx.fillRect(ORIGIN_X - 22, GROUND_Y - 6, 44, 6);

    // Height indicator text on pillar
    ctx.fillStyle = "#c084fc";
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText(`${h0.toFixed(1)}m`, ORIGIN_X - 18, pivotY + 14);
    ctx.restore();
  }

  // Glowing cannon pivot hub
  ctx.beginPath();
  ctx.arc(PIVOT.x, PIVOT.y, 8, 0, Math.PI * 2);
  ctx.fillStyle = "#8b5cf6";
  ctx.shadowColor = "#8b5cf6";
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Origin Marker
  ctx.fillStyle = "#94a3b8";
  ctx.font = "10px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("x=0m", ORIGIN_X, GROUND_Y + 36);
}

// ==========================================
// EVENT LISTENERS & CONTROLS
// ==========================================
velocitySlider.addEventListener("input", () => {
  velocityValue.textContent = `${Number(velocitySlider.value).toFixed(1)} m/s`;
  calculateTheoreticalResults();
});

angleSlider.addEventListener("input", () => {
  const angle = Number(angleSlider.value);
  angleValue.textContent = `${angle}°`;
  updateLauncher(angle);
  calculateTheoreticalResults();
});

heightSlider.addEventListener("input", () => {
  const h0 = Number(heightSlider.value);
  heightValue.textContent = `${h0.toFixed(1)} m`;
  updateLauncher(Number(angleSlider.value));
  calculateTheoreticalResults();
});

gravitySlider.addEventListener("input", () => {
  const g = Number(gravitySlider.value);
  gravityValue.textContent = `${g.toFixed(1)} m/s²`;

  // Highlight active planet button if match
  planetBtns.forEach(btn => {
    const btnG = Number(btn.getAttribute("data-gravity"));
    if (Math.abs(btnG - g) < 0.1) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  calculateTheoreticalResults();
});

// Planetary Presets Buttons
planetBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    planetBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const g = Number(btn.getAttribute("data-gravity"));
    gravitySlider.value = g;
    gravityValue.textContent = `${g.toFixed(1)} m/s²`;
    calculateTheoreticalResults();
  });
});

// Display Toggles
toggleVectors.addEventListener("change", (e) => {
  simState.showVectors = e.target.checked;
});

toggleGhosts.addEventListener("change", (e) => {
  simState.showGhosts = e.target.checked;
});

toggleTarget.addEventListener("change", (e) => {
  simState.targetMode = e.target.checked;
  if (simState.targetMode) {
    targetBanner.classList.remove("hidden");
    spawnNewTarget();
  } else {
    targetBanner.classList.add("hidden");
  }
});

// Buttons
launchButton.addEventListener("click", launchProjectile);
resetButton.addEventListener("click", resetSimulation);
clearTrailsButton.addEventListener("click", () => {
  simState.ghostTrails = [];
  simState.currentTrail = [];
  showToast("Trajectory comparison trails cleared");
});

// ==========================================
// QUIZ HELPERS & ANSWER MATCHING LOGIC
// ==========================================
function getQuestionCorrectIndex(q) {
  if (!q || !Array.isArray(q.options) || q.options.length === 0) return 0;

  // 1. Explicit 0-based index property
  if (typeof q.correctIndex === "number" && q.correctIndex >= 0 && q.correctIndex < q.options.length) {
    return q.correctIndex;
  }
  if (typeof q.answerIndex === "number" && q.answerIndex >= 0 && q.answerIndex < q.options.length) {
    return q.answerIndex;
  }
  if (typeof q.correct_index === "number" && q.correct_index >= 0 && q.correct_index < q.options.length) {
    return q.correct_index;
  }

  // 2. Answer key field
  const ans = q.answer !== undefined ? q.answer : (q.correctAnswer !== undefined ? q.correctAnswer : q.correct_answer);
  if (ans === undefined || ans === null) return 0;

  if (typeof ans === "number") {
    if (ans >= 0 && ans < q.options.length) return ans;
    if (ans >= 1 && ans <= q.options.length) return ans - 1;
  }

  if (typeof ans === "string") {
    const trimmed = ans.trim();

    // Direct match against option strings (case-insensitive & trimmed)
    const exactIdx = q.options.findIndex(opt => opt.trim().toLowerCase() === trimmed.toLowerCase());
    if (exactIdx !== -1) return exactIdx;

    // Single letter option reference (e.g. "A", "B", "C", "D", "Option A")
    const letterMatch = trimmed.match(/^(?:Option\s*)?([A-D])$/i);
    if (letterMatch) {
      const idx = letterMatch[1].toUpperCase().charCodeAt(0) - 65;
      if (idx >= 0 && idx < q.options.length) return idx;
    }

    // Numerical index as string ("0", "1", "2", "3")
    const parsedNum = parseInt(trimmed, 10);
    if (!isNaN(parsedNum)) {
      if (parsedNum >= 0 && parsedNum < q.options.length) return parsedNum;
      if (parsedNum >= 1 && parsedNum <= q.options.length) return parsedNum - 1;
    }
  }

  return 0;
}

function getQuestionFormula(q) {
  if (q.formula) return q.formula;
  const text = (q.question || "").toLowerCase();
  if (text.includes("maximum") && text.includes("height")) return "H = (v₀² sin²θ) / (2g)";
  if (text.includes("time") || text.includes("air")) return "T = (2v₀ sinθ) / g";
  if (text.includes("20 m/s") || (text.includes("45°") && text.includes("range"))) return "R = (v₀² sin 2θ) / g";
  if (text.includes("acceleration")) return "a_x = 0, a_y = -g";
  if (text.includes("force")) return "F_net = m · g (downward)";
  if (text.includes("angle") || text.includes("speed")) return "R = (v₀² sin 2θ) / g";
  return "R = (v₀² sin 2θ) / g";
}

function getQuestionExplanation(q, correctIdx) {
  if (q.explanation) return q.explanation;
  const correctText = q.options && q.options[correctIdx] ? q.options[correctIdx] : "";
  const questionLower = (q.question || "").toLowerCase();

  if (questionLower.includes("30° to 45°")) {
    return "Horizontal range on level ground is given by R = (v₀² sin 2θ) / g. Since sin(2 × 45°) = sin(90°) = 1.0 is greater than sin(2 × 30°) = sin(60°) ≈ 0.866, the range increases.";
  }
  if (questionLower.includes("maximum horizontal range") || (questionLower.includes("which angle") && questionLower.includes("maximum"))) {
    return "For level ground launches, the factor sin(2θ) reaches its maximum possible value of 1 when 2θ = 90°, which means θ = 45°.";
  }
  if (questionLower.includes("force acts on an ideal projectile")) {
    return "In ideal projectile motion (neglecting air drag), the only force acting after release is the gravitational force (F = mg directed downward).";
  }
  if (questionLower.includes("horizontal acceleration")) {
    return "Because there are no forces acting along the horizontal axis (F_x = 0), Newton's second law gives a_x = 0 m/s², so horizontal velocity v_x remains constant.";
  }
  if (questionLower.includes("speed is increased")) {
    return "Horizontal range is directly proportional to the square of initial speed (R ∝ v₀²). Therefore, increasing launch speed increases the total range.";
  }
  if (questionLower.includes("highest point") || questionLower.includes("vertical velocity")) {
    return "At the peak apex of flight, the projectile momentarily ceases upward motion before falling, so the vertical velocity v_y is 0 m/s.";
  }
  if (questionLower.includes("20 m/s at 45°")) {
    return "Using R = (v₀² sin 2θ) / g with v₀ = 20 m/s, θ = 45°, and g = 10 m/s²: R = (20² × sin 90°) / 10 = (400 × 1) / 10 = 40 meters.";
  }
  if (questionLower.includes("30° and 60°")) {
    return "Complementary launch angles (angles summing to 90°) yield identical ranges because sin(2 × 30°) = sin(60°) and sin(2 × 60°) = sin(120°) = sin(60°).";
  }
  if (questionLower.includes("remains in the air") || questionLower.includes("how long")) {
    return "Flight duration is governed strictly by vertical motion: T = 2(v₀ sin θ) / g. Thus, the vertical velocity component determines the total air time.";
  }
  if (questionLower.includes("parameter should be changed")) {
    return "In a scientific experiment, to study the effect of launch angle on range, the launch angle is the independent variable while speed and gravity are held constant.";
  }

  return `The correct answer is "${correctText}". This follows directly from the kinematic laws governing 2D projectile motion.`;
}

// ==========================================
// QUIZ CONTROLLER & STATE LOGIC
// ==========================================
function initQuizStartView() {
  if (quizStatTotal) quizStatTotal.textContent = quizState.questions.length;
  if (quizBestScoreDisplay) {
    quizBestScoreDisplay.textContent = quizState.highScore > 0
      ? `${quizState.highScore} / ${quizState.questions.length}`
      : `-- / ${quizState.questions.length}`;
  }
}

function openQuizModal() {
  quizModal.classList.remove("hidden");
  if (!quizState.isSubmitted && quizState.startTime !== null) {
    // Resume in-progress quiz
    quizStartView.classList.add("hidden");
    quizActiveView.classList.remove("hidden");
    quizResultsView.classList.add("hidden");
    renderQuestion(quizState.currentIndex);
  } else if (quizState.isSubmitted) {
    // Show results
    renderResultsView();
  } else {
    // Show start view
    quizStartView.classList.remove("hidden");
    quizActiveView.classList.add("hidden");
    quizResultsView.classList.add("hidden");
    initQuizStartView();
  }
}

function closeQuizModal() {
  quizModal.classList.add("hidden");
}

function startQuiz() {
  quizState.currentIndex = 0;
  quizState.userAnswers = new Array(quizState.questions.length).fill(null);
  quizState.isSubmitted = false;
  quizState.startTime = performance.now();

  quizStartView.classList.add("hidden");
  quizActiveView.classList.remove("hidden");
  quizResultsView.classList.add("hidden");

  renderQuestion(0);
}

function renderQuestion(index) {
  if (index < 0 || index >= quizState.questions.length) return;
  quizState.currentIndex = index;
  const q = quizState.questions[index];

  // Tracker and category
  if (quizProgressText) {
    quizProgressText.textContent = `Question ${index + 1} of ${quizState.questions.length}`;
  }
  if (quizQuestionCategory) {
    quizQuestionCategory.textContent = q.category || "2D Kinematics";
  }

  // Progress bar
  if (quizProgressFill) {
    const pct = ((index + 1) / quizState.questions.length) * 100;
    quizProgressFill.style.width = `${pct}%`;
  }

  // Difficulty badge
  if (quizDifficultyPill) {
    const diff = (q.difficulty || "standard").toLowerCase();
    quizDifficultyPill.textContent = q.difficulty || "Standard";
    quizDifficultyPill.className = `quiz-difficulty-pill ${diff}`;
  }

  // Question statement
  if (quizQuestionText) {
    quizQuestionText.textContent = q.question;
  }

  // Hint Formula reset
  if (quizHintFormula) {
    quizHintFormula.textContent = q.formula || getQuestionFormula(q);
  }
  if (quizHintBody) {
    quizHintBody.classList.add("hidden");
  }
  if (hintChevron) {
    hintChevron.classList.remove("open");
  }

  // Render option choices A, B, C, D
  if (quizOptionsContainer) {
    quizOptionsContainer.innerHTML = "";
    const letters = ["A", "B", "C", "D"];

    q.options.forEach((optText, optIdx) => {
      const card = document.createElement("div");
      card.className = "quiz-option-card";
      if (quizState.userAnswers[index] === optIdx) {
        card.classList.add("selected");
      }

      card.innerHTML = `
        <div class="option-key-badge">${letters[optIdx]}</div>
        <div class="option-text">${optText}</div>
      `;

      card.addEventListener("click", () => {
        selectOption(index, optIdx);
      });

      quizOptionsContainer.appendChild(card);
    });
  }

  // Stepper dots
  renderStepperDots(index);

  // Button labels & states
  if (btnPrevQuestion) {
    btnPrevQuestion.disabled = (index === 0);
  }
  if (btnNextQuestion) {
    if (index === quizState.questions.length - 1) {
      btnNextQuestion.innerHTML = `Submit Quiz`;
    } else {
      btnNextQuestion.innerHTML = `Next`;
    }
  }
}

function renderStepperDots(currentIndex) {
  if (!quizStepperDots) return;
  quizStepperDots.innerHTML = "";

  quizState.questions.forEach((_, i) => {
    const dot = document.createElement("div");
    dot.className = "stepper-dot";
    if (i === currentIndex) dot.classList.add("active");
    if (quizState.userAnswers[i] !== null) dot.classList.add("answered");
    dot.title = `Question ${i + 1}`;

    dot.addEventListener("click", () => {
      renderQuestion(i);
    });

    quizStepperDots.appendChild(dot);
  });
}

function selectOption(qIdx, optIdx) {
  quizState.userAnswers[qIdx] = optIdx;

  // Update visual selection
  if (quizOptionsContainer) {
    const optionCards = quizOptionsContainer.querySelectorAll(".quiz-option-card");
    optionCards.forEach((c, idx) => {
      if (idx === optIdx) {
        c.classList.add("selected");
      } else {
        c.classList.remove("selected");
      }
    });
  }

  renderStepperDots(qIdx);
}

function nextQuestion() {
  if (quizState.currentIndex === quizState.questions.length - 1) {
    submitQuiz();
  } else {
    renderQuestion(quizState.currentIndex + 1);
  }
}

function prevQuestion() {
  if (quizState.currentIndex > 0) {
    renderQuestion(quizState.currentIndex - 1);
  }
}

function toggleHint() {
  if (quizHintBody) {
    quizHintBody.classList.toggle("hidden");
  }
  if (hintChevron) {
    hintChevron.classList.toggle("open");
  }
}

function submitQuiz() {
  const unansweredCount = quizState.userAnswers.filter(a => a === null).length;
  if (unansweredCount > 0) {
    const proceed = window.confirm(
      `You have ${unansweredCount} unanswered question(s). Do you want to submit anyway?`
    );
    if (!proceed) return;
  }

  quizState.isSubmitted = true;
  quizState.timeTaken = Math.max(1, Math.round((performance.now() - (quizState.startTime || performance.now())) / 1000));

  let correctCount = 0;
  quizState.questions.forEach((q, i) => {
    const correctIdx = getQuestionCorrectIndex(q);
    if (quizState.userAnswers[i] === correctIdx) {
      correctCount++;
    }
  });
  quizState.score = correctCount;

  if (correctCount > quizState.highScore) {
    quizState.highScore = correctCount;
    localStorage.setItem("physix_quiz_highscore", correctCount.toString());
    showToast(`New Personal Best: ${correctCount}/${quizState.questions.length}`);
  }

  renderResultsView();
}

function renderResultsView() {
  quizStartView.classList.add("hidden");
  quizActiveView.classList.add("hidden");
  quizResultsView.classList.remove("hidden");

  const total = quizState.questions.length;
  const score = quizState.score;
  const pct = Math.round((score / total) * 100);

  // Animate circular gauge
  const circumference = 2 * Math.PI * 52; // ~326.7
  const offset = circumference - (pct / 100) * circumference;

  if (scoreCircleBar) {
    scoreCircleBar.style.strokeDashoffset = offset;
    if (pct >= 80) {
      scoreCircleBar.style.stroke = "#10b981";
      scoreCircleBar.style.filter = "drop-shadow(0 0 10px rgba(16, 185, 129, 0.4))";
    } else if (pct >= 50) {
      scoreCircleBar.style.stroke = "#f59e0b";
      scoreCircleBar.style.filter = "drop-shadow(0 0 10px rgba(245, 158, 11, 0.4))";
    } else {
      scoreCircleBar.style.stroke = "#ff4757";
      scoreCircleBar.style.filter = "drop-shadow(0 0 10px rgba(255, 71, 87, 0.4))";
    }
  }

  if (resultsScorePercent) resultsScorePercent.textContent = `${pct}%`;
  if (resultsScoreFraction) resultsScoreFraction.textContent = `${score}/${total}`;
  if (resultsCorrectCount) resultsCorrectCount.textContent = score;
  if (resultsIncorrectCount) resultsIncorrectCount.textContent = total - score;
  if (resultsTimeTaken) resultsTimeTaken.textContent = `${quizState.timeTaken}s`;
  if (resultsHighScore) resultsHighScore.textContent = `${quizState.highScore} / ${total}`;

  // Tier badge & custom feedback
  if (pct === 100) {
    if (resultsTierBadge) resultsTierBadge.textContent = "Mastery: Advanced";
    if (resultsHeadline) resultsHeadline.textContent = "Score: 100% (Perfect)";
    if (resultsMessage) {
      resultsMessage.textContent = "You demonstrated complete understanding of projectile motion kinematics, symmetry, and gravity.";
    }
  } else if (pct >= 80) {
    if (resultsTierBadge) resultsTierBadge.textContent = "Mastery: Proficient";
    if (resultsHeadline) resultsHeadline.textContent = "High Proficiency";
    if (resultsMessage) {
      resultsMessage.textContent = "You demonstrated strong mastery over 2D kinematic calculations and trajectory principles.";
    }
  } else if (pct >= 50) {
    if (resultsTierBadge) resultsTierBadge.textContent = "Mastery: Intermediate";
    if (resultsHeadline) resultsHeadline.textContent = "Assessment Completed";
    if (resultsMessage) {
      resultsMessage.textContent = "Solid foundational grasp. Review the detailed solutions below to master advanced cliff and planetary cases.";
    }
  } else {
    if (resultsTierBadge) resultsTierBadge.textContent = "Mastery: Foundational";
    if (resultsHeadline) resultsHeadline.textContent = "Needs Review";
    if (resultsMessage) {
      resultsMessage.textContent = "Review the physics solution derivations below and test the scenarios in the simulation.";
    }
  }

  // Detailed Review Breakdown
  if (quizReviewList) {
    quizReviewList.innerHTML = "";
    const letters = ["A", "B", "C", "D"];

    quizState.questions.forEach((q, i) => {
      const userChoice = quizState.userAnswers[i];
      const correctIdx = getQuestionCorrectIndex(q);
      const isCorrect = userChoice === correctIdx;

      const card = document.createElement("div");
      card.className = `review-card ${isCorrect ? "correct" : "incorrect"}`;

      const userAnsText = userChoice !== null
        ? `${letters[userChoice]}: ${q.options[userChoice]}`
        : "Not answered (Skipped)";
      const correctAnsText = `${letters[correctIdx]}: ${q.options[correctIdx]}`;

      const explanation = q.explanation || getQuestionExplanation(q, correctIdx);
      const formula = q.formula || getQuestionFormula(q);

      card.innerHTML = `
        <div class="review-card-top">
          <span class="review-q-num">Q${i + 1} &bull; ${q.category || "Kinematics"}</span>
          <span class="review-q-status ${isCorrect ? "correct" : "incorrect"}">
            ${isCorrect ? "Correct (+1)" : "Incorrect"}
          </span>
        </div>
        <p class="review-q-text">${q.question}</p>
        <div class="review-answers-grid">
          <div class="review-ans-pill ${isCorrect ? "correct-ans" : "your-wrong"}">
            <strong>Your Choice:</strong> ${userAnsText}
          </div>
          <div class="review-ans-pill correct-ans">
            <strong>Correct Answer:</strong> ${correctAnsText}
          </div>
        </div>
        <div class="review-explanation-box">
          <div><strong>Scientific Derivation:</strong> ${explanation}</div>
          ${formula ? `<div class="review-formula">Formula: <code>${formula}</code></div>` : ""}
        </div>
      `;

      quizReviewList.appendChild(card);
    });
  }
}

// ==========================================
// MODALS & NAVIGATION LOGIC
// ==========================================
// Explorer Modal
btnOpenExplorer.addEventListener("click", () => {
  explorerModal.classList.remove("hidden");
});
btnCloseExplorer.addEventListener("click", () => {
  explorerModal.classList.add("hidden");
});

// Theory Modal
btnOpenTheory.addEventListener("click", () => {
  theoryModal.classList.remove("hidden");
});
btnCloseTheory.addEventListener("click", () => {
  theoryModal.classList.add("hidden");
});

// Profile Modal
userProfileBtn.addEventListener("click", () => {
  profileModal.classList.remove("hidden");
});
btnCloseProfile.addEventListener("click", () => {
  profileModal.classList.add("hidden");
});

// Quiz Modal triggers
if (btnOpenQuiz) btnOpenQuiz.addEventListener("click", openQuizModal);
if (btnQuickQuiz) btnQuickQuiz.addEventListener("click", openQuizModal);
if (btnCloseQuiz) btnCloseQuiz.addEventListener("click", closeQuizModal);
if (btnStartQuiz) btnStartQuiz.addEventListener("click", startQuiz);
if (btnPrevQuestion) btnPrevQuestion.addEventListener("click", prevQuestion);
if (btnNextQuestion) btnNextQuestion.addEventListener("click", nextQuestion);
if (btnToggleHint) btnToggleHint.addEventListener("click", toggleHint);
if (btnRetakeQuiz) btnRetakeQuiz.addEventListener("click", startQuiz);
if (btnFinishQuiz) btnFinishQuiz.addEventListener("click", closeQuizModal);

// Close modals on backdrop click
[explorerModal, theoryModal, profileModal, quizModal].forEach(modal => {
  if (!modal) return;
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });
});

// Keyboard Navigation & Shortcuts
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    explorerModal.classList.add("hidden");
    theoryModal.classList.add("hidden");
    profileModal.classList.add("hidden");
    quizModal.classList.add("hidden");
    return;
  }

  // If Quiz Modal is open and in active question view
  if (quizModal && !quizModal.classList.contains("hidden") && quizActiveView && !quizActiveView.classList.contains("hidden")) {
    if (e.key === "1" || e.key === "a" || e.key === "A") {
      selectOption(quizState.currentIndex, 0);
    } else if (e.key === "2" || e.key === "b" || e.key === "B") {
      selectOption(quizState.currentIndex, 1);
    } else if (e.key === "3" || e.key === "c" || e.key === "C") {
      selectOption(quizState.currentIndex, 2);
    } else if (e.key === "4" || e.key === "d" || e.key === "D") {
      selectOption(quizState.currentIndex, 3);
    } else if (e.key === "ArrowRight" || e.key === "Enter") {
      nextQuestion();
    } else if (e.key === "ArrowLeft") {
      prevQuestion();
    }
  }
});

// Lab Cards Interaction
const labCards = document.querySelectorAll(".lab-card");
labCards.forEach(card => {
  card.addEventListener("click", () => {
    if (card.classList.contains("active-lab")) {
      explorerModal.classList.add("hidden");
      showToast("Viewing Projectile Motion Lab");
    } else {
      const name = card.getAttribute("data-name") || "This experiment";
      showToast(`${name} is in development.`);
    }
  });
});

// Mock Sign in button
document.getElementById("btn-mock-signin").addEventListener("click", () => {
  showToast("Google Classroom sync will be available in v2.1.");
  profileModal.classList.add("hidden");
});

// Category filter pills
const catPills = document.querySelectorAll(".cat-pill");
catPills.forEach(pill => {
  pill.addEventListener("click", () => {
    catPills.forEach(p => p.classList.remove("active"));
    pill.classList.add("active");
    showToast(`Showing ${pill.textContent}`);
  });
});

// ==========================================
// INITIAL SETUP & RUN
// ==========================================
initQuizStartView();
updateLauncher(DEFAULT_ANGLE);
calculateTheoreticalResults();

const runner = Runner.create();
Runner.run(runner, engine);
Render.run(render);