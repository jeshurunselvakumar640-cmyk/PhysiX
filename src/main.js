import Matter from "matter-js";
import "./style.css";
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  onAuthStateChanged
} from "./firebase.js";
import { QUIZ_DATA } from "./quiz-data.js";

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
const DEFAULT_HEIGHT = 0.0;
const DEFAULT_GRAVITY = 9.8;

// Launcher specs
const BARREL_LENGTH = 54;              // 4.5m
const BARREL_WIDTH = 18;
const PROJECTILE_RADIUS = 10;          // 0.83m radius

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
  launchY: GROUND_Y - PROJECTILE_RADIUS,
  v0x: 0,
  v0y: 0,
  h0: 0,
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
  ORIGIN_X - 10,
  GROUND_Y - 15,
  56,
  30,
  {
    isStatic: true,
    isSensor: true,
    render: { fillStyle: "#1a243b" }
  }
);

const launcherWheel = Bodies.circle(
  ORIGIN_X,
  GROUND_Y - 10,
  16,
  {
    isStatic: true,
    isSensor: true,
    render: { fillStyle: "#2a3756", strokeStyle: "#8b5cf6", lineWidth: 2 }
  }
);

// Launcher Barrel Body
const initialRadians = (DEFAULT_ANGLE * Math.PI) / 180;
const initialBarrelX = ORIGIN_X + (BARREL_LENGTH / 2) * Math.cos(initialRadians);
const initialBarrelY = GROUND_Y - (BARREL_LENGTH / 2) * Math.sin(initialRadians);

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

Composite.add(world, [launcherBase, launcherBarrel, launcherWheel]);

let projectile = null;
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
const heightBtns = document.querySelectorAll(".height-btn");

// HUD Elements
const hudTime = document.getElementById("hud-time");
const hudHeight = document.getElementById("hud-height");
const hudDistance = document.getElementById("hud-distance");
const hudSpeed = document.getElementById("hud-speed");

// Results Display & Kinematic Analytics
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

const btnOpenQuiz = document.getElementById("btn-open-quiz");
const btnCloseQuiz = document.getElementById("btn-close-quiz");

const userProfileBtn = document.getElementById("user-profile-btn");
const btnCloseProfile = document.getElementById("btn-close-profile");

const toastEl = document.getElementById("toast");

// ==========================================
// FIREBASE AUTH DOM ELEMENTS
// ==========================================
const authModalTitle = document.getElementById("auth-modal-title");
const authModalSubtitle = document.getElementById("auth-modal-subtitle");

const authViewLogin = document.getElementById("auth-view-login");
const authViewSignup = document.getElementById("auth-view-signup");
const authViewForgot = document.getElementById("auth-view-forgot");
const authViewChangePassword = document.getElementById("auth-view-change-password");
const authViewDashboard = document.getElementById("auth-view-dashboard");

const formLogin = document.getElementById("form-login");
const formSignup = document.getElementById("form-signup");
const formForgot = document.getElementById("form-forgot");
const formChangePassword = document.getElementById("form-change-password");

const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const loginErrorMsg = document.getElementById("login-error-msg");

const signupEmail = document.getElementById("signup-email");
const signupPassword = document.getElementById("signup-password");
const signupConfirm = document.getElementById("signup-confirm");
const signupErrorMsg = document.getElementById("signup-error-msg");

const forgotEmail = document.getElementById("forgot-email");
const forgotErrorMsg = document.getElementById("forgot-error-msg");
const forgotSuccessMsg = document.getElementById("forgot-success-msg");

const changeNewPassword = document.getElementById("change-new-password");
const changeConfirmPassword = document.getElementById("change-confirm-password");
const changeErrorMsg = document.getElementById("change-error-msg");

const btnGotoForgot = document.getElementById("btn-goto-forgot");
const btnGotoSignup = document.getElementById("btn-goto-signup");
const btnSignupGotoLogin = document.getElementById("btn-signup-goto-login");
const btnForgotGotoLogin = document.getElementById("btn-forgot-goto-login");
const btnDashboardChangePwd = document.getElementById("btn-dashboard-change-pwd");
const btnChangeGotoDashboard = document.getElementById("btn-change-goto-dashboard");
const btnDashboardLogout = document.getElementById("btn-dashboard-logout");

const profileUserEmail = document.getElementById("profile-user-email");
const profileAvatarChar = document.getElementById("profile-avatar-char");
const profileStatQuiz = document.getElementById("profile-stat-quiz");
const profileStatTarget = document.getElementById("profile-stat-target");

// ==========================================
// QUIZ STATE
// ==========================================
let quizState = {
  currentQuestionIndex: 0,
  userAnswers: {},
  score: 0
};

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
// BARREL & LAUNCHER POSITIONING
// ==========================================
function updateLauncher(angleDeg, heightMeters) {
  const h = heightMeters !== undefined ? heightMeters : Number(heightSlider.value);
  const pivotY = GROUND_Y - h * SCALE;
  const rad = (angleDeg * Math.PI) / 180;

  // Center of barrel rectangle
  const centerX = ORIGIN_X + (BARREL_LENGTH / 2) * Math.cos(rad);
  const centerY = pivotY - (BARREL_LENGTH / 2) * Math.sin(rad);

  Body.setPosition(launcherBarrel, { x: centerX, y: centerY });
  Body.setAngle(launcherBarrel, -rad);

  // Position base and wheel under pivot
  Body.setPosition(launcherBase, { x: ORIGIN_X - 10, y: pivotY + 14 });
  Body.setPosition(launcherWheel, { x: ORIGIN_X, y: pivotY + 10 });
}

// ==========================================
// THEORETICAL CALCULATIONS
// ==========================================
function calculateTheoreticalResults() {
  const v0 = Number(velocitySlider.value);
  const angleDeg = Number(angleSlider.value);
  const h0 = Number(heightSlider.value);
  const g = Number(gravitySlider.value);
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

  // Time of flight T: 0.5*g*T^2 - v0y*T - h0 = 0
  // T = (v0y + sqrt(v0y^2 + 2*g*h0)) / g
  const discriminant = v0y * v0y + 2 * g * h0;
  const timeOfFlight = (v0y + Math.sqrt(Math.max(0, discriminant))) / g;

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

  return { maxHeight, totalRange, timeOfFlight, impactSpeed, h0, v0x, v0y };
}

// ==========================================
// LAUNCH PROJECTILE
// ==========================================
function launchProjectile() {
  const v0 = Number(velocitySlider.value);
  const angleDeg = Number(angleSlider.value);
  const h0 = Number(heightSlider.value);
  const g = Number(gravitySlider.value);
  const rad = (angleDeg * Math.PI) / 180;

  // Save current trail to ghost trails if comparison mode is enabled
  if (simState.currentTrail.length > 2 && simState.showGhosts) {
    simState.ghostTrails.push({
      points: [...simState.currentTrail],
      color: getRandomGhostColor(),
      label: `${angleDeg}° | ${v0.toFixed(0)}m/s | h=${h0.toFixed(1)}m`
    });
    if (simState.ghostTrails.length > 8) {
      simState.ghostTrails.shift();
    }
  }
  simState.currentTrail = [];

  // Remove existing projectile body
  if (projectile) {
    Composite.remove(world, projectile);
    projectile = null;
  }

  const launchY = GROUND_Y - h0 * SCALE - PROJECTILE_RADIUS;
  simState.launchX = ORIGIN_X;
  simState.launchY = launchY;
  simState.v0x = v0 * Math.cos(rad);
  simState.v0y = v0 * Math.sin(rad);
  simState.h0 = h0;
  simState.g = g;

  const theoretical = calculateTheoreticalResults();
  simState.totalFlightTime = theoretical.timeOfFlight;

  // Create Projectile Rigid Body
  projectile = Bodies.circle(ORIGIN_X, launchY, PROJECTILE_RADIUS, {
    isSensor: true,
    render: {
      fillStyle: "#ff4757",
      strokeStyle: "#ffffff",
      lineWidth: 2
    }
  });

  Composite.add(world, projectile);

  // Initial trail point
  simState.currentTrail = [{ x: ORIGIN_X, y: launchY }];

  simState.isRunning = true;
  simState.flightTime = 0;
  launchTimestamp = performance.now();
}

function getRandomGhostColor() {
  const colors = [
    "rgba(139, 92, 246, 0.65)",  // Purple
    "rgba(59, 130, 246, 0.65)",  // Blue
    "rgba(16, 185, 129, 0.65)",  // Emerald
    "rgba(245, 158, 11, 0.65)",  // Amber
    "rgba(236, 72, 153, 0.65)",  // Pink
    "rgba(6, 182, 212, 0.65)"    // Cyan
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// ==========================================
// RESET SIMULATION
// ==========================================
function resetSimulation() {
  if (projectile) {
    Composite.remove(world, projectile);
    projectile = null;
  }

  simState.isRunning = false;
  simState.flightTime = 0;
  simState.currentTrail = [];

  const h0 = Number(heightSlider.value);
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
    showToast("🎯 DIRECT HIT! Bullseye (+100 pts)");
    spawnNewTarget();
  } else if (diffMeters <= 3.5) {
    // Near hit
    simState.targetScore += 50;
    simState.targetHitEffect = 25;
    showToast("✨ NEAR HIT! (+50 pts)");
    spawnNewTarget();
  }
  targetScoreText.textContent = simState.targetScore;
  if (profileStatTarget) profileStatTarget.textContent = `${simState.targetScore} pts`;
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
  let t = (performance.now() - launchTimestamp) / 1000;
  if (t <= 0) return;

  // Check Touchdown / End of Flight
  if (t >= simState.totalFlightTime || simState.totalFlightTime <= 0) {
    t = simState.totalFlightTime;
    simState.flightTime = t;

    const finalRangeMeters = simState.v0x * t;
    const finalPx = ORIGIN_X + finalRangeMeters * SCALE;
    const finalPy = GROUND_Y - PROJECTILE_RADIUS;

    Body.setPosition(projectile, { x: finalPx, y: finalPy });
    simState.currentTrail.push({ x: finalPx, y: finalPy });
    simState.isRunning = false;

    // Update HUD with impact values
    hudTime.textContent = `${t.toFixed(2)} s`;
    hudHeight.textContent = "0.00 m";
    hudDistance.textContent = `${finalRangeMeters.toFixed(2)} m`;
    const finalVy = simState.v0y - simState.g * t;
    const finalSpeed = Math.sqrt(simState.v0x * simState.v0x + finalVy * finalVy);
    hudSpeed.textContent = `${finalSpeed.toFixed(2)} m/s`;

    checkTargetHit(finalPx);
    return;
  }

  simState.flightTime = t;

  // Exact Kinematics
  const xMeters = simState.v0x * t;
  const yMeters = Math.max(0, simState.h0 + simState.v0y * t - 0.5 * simState.g * t * t);

  const px = ORIGIN_X + xMeters * SCALE;
  const py = GROUND_Y - yMeters * SCALE - PROJECTILE_RADIUS;

  // Kinematic Velocities:
  const vx = simState.v0x;
  const vy = simState.v0y - simState.g * t;
  const speed = Math.hypot(vx, vy);

  simState.currentX = px;
  simState.currentY = py;
  simState.currentVx = vx;
  simState.currentVy = vy;
  simState.currentSpeed = speed;

  // Update HUD
  hudTime.textContent = `${t.toFixed(2)} s`;
  hudHeight.textContent = `${yMeters.toFixed(2)} m`;
  hudDistance.textContent = `${xMeters.toFixed(2)} m`;
  hudSpeed.textContent = `${speed.toFixed(2)} m/s`;

  // Add trail point
  const lastPoint = simState.currentTrail[simState.currentTrail.length - 1];
  if (!lastPoint || Math.hypot(px - lastPoint.x, py - lastPoint.y) >= 4) {
    simState.currentTrail.push({ x: px, y: py });
  }

  // End of Canvas boundary
  if (px > CANVAS_WIDTH + 60) {
    simState.isRunning = false;
    return;
  }

  Body.setPosition(projectile, { x: px, y: py });
});

// ==========================================
// CUSTOM CANVAS OVERLAY RENDER
// (Coordinate Grid, Elevation Tower, Target, Glowing Trails)
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

  // 5. DRAW VELOCITY VECTORS
  if (projectile && simState.isRunning && simState.showVectors) {
    drawVelocityVectors(ctx, simState.currentX, simState.currentY);
  }

  // 6. DRAW CANNON ACCENTS & ELEVATION PEDESTAL
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
  const h0 = Number(heightSlider.value);
  const pivotY = GROUND_Y - h0 * SCALE;

  // Draw Elevation Tower / Pedestal if elevated
  if (h0 > 0.05) {
    const towerLeft = ORIGIN_X - 22;
    const towerRight = ORIGIN_X + 18;
    const towerTop = pivotY + 16;
    const towerBottom = GROUND_Y;

    // Metal Truss Tower Pillars
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;

    ctx.fillRect(towerLeft, towerTop, 6, towerBottom - towerTop);
    ctx.strokeRect(towerLeft, towerTop, 6, towerBottom - towerTop);

    ctx.fillRect(towerRight - 6, towerTop, 6, towerBottom - towerTop);
    ctx.strokeRect(towerRight - 6, towerTop, 6, towerBottom - towerTop);

    // Cross Braces (X-patterns)
    ctx.beginPath();
    ctx.strokeStyle = "rgba(100, 116, 139, 0.6)";
    ctx.lineWidth = 1.5;
    const step = 24;
    for (let y = towerTop + 10; y < towerBottom; y += step) {
      const nextY = Math.min(y + step, towerBottom);
      ctx.moveTo(towerLeft + 3, y);
      ctx.lineTo(towerRight - 3, nextY);
      ctx.moveTo(towerRight - 3, y);
      ctx.lineTo(towerLeft + 3, nextY);
    }
    ctx.stroke();

    // Top Platform Stage
    ctx.fillStyle = "#334155";
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2;
    ctx.fillRect(towerLeft - 6, towerTop - 4, (towerRight - towerLeft) + 12, 6);
    ctx.strokeRect(towerLeft - 6, towerTop - 4, (towerRight - towerLeft) + 12, 6);

    // Height Marker Tag
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(ORIGIN_X - 70, pivotY - 4, 44, 18, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fbbf24";
    ctx.font = "9.5px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${h0.toFixed(1)}m`, ORIGIN_X - 48, pivotY + 9);
  }

  // Glowing Cannon Pivot Hub
  ctx.beginPath();
  ctx.arc(ORIGIN_X, pivotY, 8, 0, Math.PI * 2);
  ctx.fillStyle = "#8b5cf6";
  ctx.shadowColor = "#8b5cf6";
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Origin Ground Marker
  ctx.fillStyle = "#94a3b8";
  ctx.font = "10px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("x=0m", ORIGIN_X, GROUND_Y + 36);
}

// ==========================================
// FIREBASE AUTHENTICATION CONTROLLER
// ==========================================
function showAuthView(viewName) {
  // Hide all auth views
  [authViewLogin, authViewSignup, authViewForgot, authViewChangePassword, authViewDashboard].forEach(v => {
    if (v) v.classList.add("hidden");
  });

  // Clear messages
  [loginErrorMsg, signupErrorMsg, forgotErrorMsg, forgotSuccessMsg, changeErrorMsg].forEach(el => {
    if (el) {
      el.classList.add("hidden");
      el.textContent = "";
    }
  });

  if (viewName === "login") {
    authModalTitle.textContent = "🔐 Student Sign In";
    authModalSubtitle.textContent = "Log in with your Firebase credentials to sync your lab progress.";
    authViewLogin.classList.remove("hidden");
  } else if (viewName === "signup") {
    authModalTitle.textContent = "✨ Create PhysiX Account";
    authModalSubtitle.textContent = "Sign up with Firebase to save experiments and quiz mastery.";
    authViewSignup.classList.remove("hidden");
  } else if (viewName === "forgot") {
    authModalTitle.textContent = "🔑 Reset Your Password";
    authModalSubtitle.textContent = "Enter your email to receive a password reset link.";
    authViewForgot.classList.remove("hidden");
  } else if (viewName === "change-password") {
    authModalTitle.textContent = "🔒 Change Password";
    authModalSubtitle.textContent = "Update your account password securely.";
    authViewChangePassword.classList.remove("hidden");
  } else if (viewName === "dashboard") {
    authModalTitle.textContent = "👤 Student Session Profile";
    authModalSubtitle.textContent = "Firebase Authenticated Account & Lab Notebook";
    authViewDashboard.classList.remove("hidden");

    // Update dashboard statistics
    const highQuiz = localStorage.getItem("physix_quiz_highscore") || 0;
    profileStatQuiz.textContent = `${highQuiz} / 10`;
    profileStatTarget.textContent = `${simState.targetScore} pts`;
  }
}

// Login Handler
formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  if (!email || !password) {
    loginErrorMsg.textContent = "Please fill in all fields.";
    loginErrorMsg.classList.remove("hidden");
    return;
  }

  try {
    loginErrorMsg.classList.add("hidden");
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    showToast(`🎉 Welcome back, ${userCredential.user.email}!`);
    loginEmail.value = "";
    loginPassword.value = "";
    showAuthView("dashboard");
  } catch (error) {
    console.error("Login error:", error);
    loginErrorMsg.textContent = formatAuthError(error.message);
    loginErrorMsg.classList.remove("hidden");
  }
});

// Signup Handler
formSignup.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = signupEmail.value.trim();
  const password = signupPassword.value.trim();
  const confirm = signupConfirm.value.trim();

  if (!email || !password || !confirm) {
    signupErrorMsg.textContent = "Please fill in all fields.";
    signupErrorMsg.classList.remove("hidden");
    return;
  }

  if (password !== confirm) {
    signupErrorMsg.textContent = "Passwords do not match.";
    signupErrorMsg.classList.remove("hidden");
    return;
  }

  if (password.length < 6) {
    signupErrorMsg.textContent = "Password must be at least 6 characters long.";
    signupErrorMsg.classList.remove("hidden");
    return;
  }

  try {
    signupErrorMsg.classList.add("hidden");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    showToast(`✨ Account created for ${userCredential.user.email}!`);
    signupEmail.value = "";
    signupPassword.value = "";
    signupConfirm.value = "";
    showAuthView("dashboard");
  } catch (error) {
    console.error("Signup error:", error);
    signupErrorMsg.textContent = formatAuthError(error.message);
    signupErrorMsg.classList.remove("hidden");
  }
});

// Forgot Password Handler
formForgot.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = forgotEmail.value.trim();

  if (!email) {
    forgotErrorMsg.textContent = "Please enter your email.";
    forgotErrorMsg.classList.remove("hidden");
    return;
  }

  try {
    forgotErrorMsg.classList.add("hidden");
    await sendPasswordResetEmail(auth, email);
    forgotSuccessMsg.textContent = `Password reset link sent to ${email}! Check your inbox.`;
    forgotSuccessMsg.classList.remove("hidden");
    showToast("✉️ Password reset email sent!");
  } catch (error) {
    console.error("Forgot password error:", error);
    forgotErrorMsg.textContent = formatAuthError(error.message);
    forgotErrorMsg.classList.remove("hidden");
  }
});

// Change Password Handler
formChangePassword.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newPwd = changeNewPassword.value.trim();
  const confirmPwd = changeConfirmPassword.value.trim();

  if (!newPwd || !confirmPwd) {
    changeErrorMsg.textContent = "Please fill in all fields.";
    changeErrorMsg.classList.remove("hidden");
    return;
  }

  if (newPwd !== confirmPwd) {
    changeErrorMsg.textContent = "Passwords do not match.";
    changeErrorMsg.classList.remove("hidden");
    return;
  }

  if (newPwd.length < 6) {
    changeErrorMsg.textContent = "Password must be at least 6 characters.";
    changeErrorMsg.classList.remove("hidden");
    return;
  }

  if (!auth.currentUser) {
    changeErrorMsg.textContent = "You must be logged in to change your password.";
    changeErrorMsg.classList.remove("hidden");
    return;
  }

  try {
    changeErrorMsg.classList.add("hidden");
    await updatePassword(auth.currentUser, newPwd);
    showToast("🔒 Password changed successfully!");
    changeNewPassword.value = "";
    changeConfirmPassword.value = "";
    showAuthView("dashboard");
  } catch (error) {
    console.error("Change password error:", error);
    changeErrorMsg.textContent = formatAuthError(error.message);
    changeErrorMsg.classList.remove("hidden");
  }
});

// Logout Handler
btnDashboardLogout.addEventListener("click", async () => {
  try {
    await signOut(auth);
    showToast("👋 Logged out successfully!");
    showAuthView("login");
  } catch (error) {
    showToast(`Error: ${error.message}`);
  }
});

// Navigation between Auth views
btnGotoForgot.addEventListener("click", () => showAuthView("forgot"));
btnGotoSignup.addEventListener("click", () => showAuthView("signup"));
btnSignupGotoLogin.addEventListener("click", () => showAuthView("login"));
btnForgotGotoLogin.addEventListener("click", () => showAuthView("login"));
btnDashboardChangePwd.addEventListener("click", () => showAuthView("change-password"));
btnChangeGotoDashboard.addEventListener("click", () => showAuthView("dashboard"));

// Password Visibility Toggle (Show / Hide Password)
document.querySelectorAll(".btn-toggle-password").forEach(btn => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-target");
    const input = document.getElementById(targetId);
    if (!input) return;
    if (input.type === "password") {
      input.type = "text";
      btn.innerHTML = `<span class="eye-icon">🙈</span>`;
      btn.title = "Hide Password";
    } else {
      input.type = "password";
      btn.innerHTML = `<span class="eye-icon">👁️</span>`;
      btn.title = "Show Password";
    }
  });
});

function formatAuthError(msg) {
  if (msg.includes("invalid-credential") || msg.includes("wrong-password") || msg.includes("user-not-found")) {
    return "Invalid email or password. Please try again.";
  }
  if (msg.includes("email-already-in-use")) {
    return "This email is already registered. Please sign in instead.";
  }
  if (msg.includes("invalid-email")) {
    return "Please enter a valid email address.";
  }
  if (msg.includes("weak-password")) {
    return "Password is too weak. Must be at least 6 characters.";
  }
  if (msg.includes("requires-recent-login")) {
    return "This action requires recent login. Please log in again first.";
  }
  return msg.replace("Firebase: ", "").replace(/\(auth\/.*\)\.?/, "").trim();
}

// Edit Profile Modal Elements
const editProfileModal = document.getElementById("edit-profile-modal");
const btnOpenEditProfile = document.getElementById("btn-open-edit-profile");
const btnCloseEditProfile = document.getElementById("btn-close-edit-profile");
const formEditProfile = document.getElementById("form-edit-profile");
const avatarButtons = document.querySelectorAll(".avatar-opt-btn");
let selectedAvatar = "🧑‍🔬";

function loadUserProfile() {
  let profileData = {};
  try {
    profileData = JSON.parse(localStorage.getItem("physix_user_profile") || "{}");
  } catch (e) {
    profileData = {};
  }

  const name = profileData.name || (auth.currentUser ? auth.currentUser.email.split("@")[0] : "Guest Student");
  const avatar = profileData.avatar || "🧑‍🔬";
  selectedAvatar = avatar;

  const userNameEl = userProfileBtn.querySelector(".user-name");
  const userStatusEl = userProfileBtn.querySelector(".user-status");
  const navAvatarChar = document.getElementById("nav-avatar-char");

  if (navAvatarChar) navAvatarChar.textContent = avatar;
  if (userNameEl) userNameEl.textContent = name;

  if (auth.currentUser) {
    if (userStatusEl) {
      userStatusEl.textContent = "● Firebase Online";
      userStatusEl.style.color = "#34d399";
    }
    if (profileUserEmail) profileUserEmail.textContent = auth.currentUser.email;
    if (profileAvatarChar) profileAvatarChar.textContent = avatar;
  } else {
    if (userStatusEl) {
      userStatusEl.textContent = "● Guest Mode";
      userStatusEl.style.color = "";
    }
    if (profileUserEmail) profileUserEmail.textContent = "Guest Student";
    if (profileAvatarChar) profileAvatarChar.textContent = "👤";
  }

  const nameInput = document.getElementById("profile-name-input");
  const eduInput = document.getElementById("profile-edu-status");
  const occInput = document.getElementById("profile-occupation-input");
  const bioInput = document.getElementById("profile-interests-input");

  if (nameInput) nameInput.value = profileData.name || "";
  if (eduInput) eduInput.value = profileData.edu || "Undergraduate Student";
  if (occInput) occInput.value = profileData.occ || "";
  if (bioInput) bioInput.value = profileData.bio || "";

  avatarButtons.forEach(b => {
    if (b.getAttribute("data-avatar") === selectedAvatar) {
      b.classList.add("selected");
    } else {
      b.classList.remove("selected");
    }
  });
}

avatarButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    avatarButtons.forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedAvatar = btn.getAttribute("data-avatar");
  });
});

if (formEditProfile) {
  formEditProfile.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("profile-name-input");
    const eduInput = document.getElementById("profile-edu-status");
    const occInput = document.getElementById("profile-occupation-input");
    const bioInput = document.getElementById("profile-interests-input");

    const profileData = {
      name: nameInput?.value.trim() || "Student Physicist",
      avatar: selectedAvatar,
      edu: eduInput?.value || "Undergraduate Student",
      occ: occInput?.value.trim() || "Physics Explorer",
      bio: bioInput?.value.trim() || "Exploring simulations and kinematics."
    };

    localStorage.setItem("physix_user_profile", JSON.stringify(profileData));
    loadUserProfile();
    editProfileModal?.classList.add("hidden");
    showToast("✨ Profile updated successfully!");
  });
}

btnOpenEditProfile?.addEventListener("click", () => {
  profileModal?.classList.add("hidden");
  editProfileModal?.classList.remove("hidden");
});

btnCloseEditProfile?.addEventListener("click", () => {
  editProfileModal?.classList.add("hidden");
});

// Track Auth State in Real-Time
onAuthStateChanged(auth, () => {
  loadUserProfile();
});

// Profile Button click opens modal
userProfileBtn.addEventListener("click", () => {
  if (auth.currentUser) {
    showAuthView("dashboard");
  } else {
    showAuthView("login");
  }
  profileModal.classList.remove("hidden");
});

// ==========================================
// QUIZ ENGINE & INTERACTIVITY (SECRET EVALUATION)
// ==========================================
const quizCurrentNum = document.getElementById("quiz-current-num");
const quizTotalNum = document.getElementById("quiz-total-num");
const quizProgressBar = document.getElementById("quiz-progress-bar");
const quizQuestionText = document.getElementById("quiz-question-text");
const quizOptionsList = document.getElementById("quiz-options-list");
const btnQuizPrev = document.getElementById("btn-quiz-prev");
const btnQuizNext = document.getElementById("btn-quiz-next");

const quizActiveView = document.getElementById("quiz-active-view");
const quizResultsView = document.getElementById("quiz-results-view");
const quizFinalScore = document.getElementById("quiz-final-score");
const quizFinalPercent = document.getElementById("quiz-final-percent");
const quizGradeBadge = document.getElementById("quiz-grade-badge");
const quizReviewList = document.getElementById("quiz-review-list");
const btnRetakeQuiz = document.getElementById("btn-retake-quiz");
const btnQuizToSim = document.getElementById("btn-quiz-to-sim");

function initQuiz() {
  quizState = {
    currentQuestionIndex: 0,
    userAnswers: {},
    score: 0
  };
  quizTotalNum.textContent = QUIZ_DATA.questions.length;
  quizActiveView.classList.remove("hidden");
  quizResultsView.classList.add("hidden");
  renderQuizQuestion(0);
}

function renderQuizQuestion(index) {
  quizState.currentQuestionIndex = index;
  const q = QUIZ_DATA.questions[index];

  quizCurrentNum.textContent = index + 1;
  const progressPercent = ((index + 1) / QUIZ_DATA.questions.length) * 100;
  quizProgressBar.style.width = `${progressPercent}%`;

  quizQuestionText.textContent = `${index + 1}. ${q.question}`;
  quizOptionsList.innerHTML = "";

  const savedAnswer = quizState.userAnswers[q.id];
  const chosenOption = savedAnswer ? savedAnswer.chosenOption : null;

  const letters = ["A", "B", "C", "D"];
  q.options.forEach((opt, optIdx) => {
    const card = document.createElement("div");
    card.className = "quiz-option-card";
    if (opt === chosenOption) {
      card.classList.add("selected");
    }

    card.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px;">
        <span class="quiz-option-marker">${letters[optIdx]}</span>
        <span>${opt}</span>
      </div>
      <span style="font-size:18px;">${opt === chosenOption ? "●" : "○"}</span>
    `;

    card.addEventListener("click", () => handleSelectOption(q, opt));
    quizOptionsList.appendChild(card);
  });

  btnQuizPrev.disabled = index === 0;
  btnQuizNext.disabled = !chosenOption;
  btnQuizNext.textContent = index === QUIZ_DATA.questions.length - 1 ? "Finish Quiz & View Evaluation 🏁" : "Next Question →";
}

function handleSelectOption(question, chosenOption) {
  // Save answer in secret
  quizState.userAnswers[question.id] = { chosenOption };
  renderQuizQuestion(quizState.currentQuestionIndex);
}

function showQuizResults() {
  quizActiveView.classList.add("hidden");
  quizResultsView.classList.remove("hidden");

  // Calculate final score
  let score = 0;
  const total = QUIZ_DATA.questions.length;

  QUIZ_DATA.questions.forEach(q => {
    const userAns = quizState.userAnswers[q.id];
    if (userAns && userAns.chosenOption === q.answer) {
      score += 1;
    }
  });
  quizState.score = score;

  const pct = Math.round((score / total) * 100);
  quizFinalScore.textContent = score;
  quizFinalPercent.textContent = `${pct}%`;

  if (pct >= 90) {
    quizGradeBadge.textContent = "🏆 Kinematics Master (Outstanding!)";
    quizGradeBadge.style.color = "#fde68a";
  } else if (pct >= 70) {
    quizGradeBadge.textContent = "🚀 Physics Ace (Proficient)";
    quizGradeBadge.style.color = "#a7f3d0";
  } else if (pct >= 50) {
    quizGradeBadge.textContent = "📚 Apprentice Physicist (Good Effort)";
    quizGradeBadge.style.color = "#93c5fd";
  } else {
    quizGradeBadge.textContent = "🔭 Keep Exploring Simulator!";
    quizGradeBadge.style.color = "#fca5a5";
  }

  // Populate Review List
  quizReviewList.innerHTML = "";
  QUIZ_DATA.questions.forEach((q, i) => {
    const userAns = quizState.userAnswers[q.id];
    const userChoice = userAns ? userAns.chosenOption : "Not Answered";
    const isCorrect = userChoice === q.answer;

    const item = document.createElement("div");
    item.className = `review-item ${isCorrect ? "is-correct" : "is-incorrect"}`;
    item.innerHTML = `
      <div class="review-q">${i + 1}. ${q.question}</div>
      <div class="review-ans-row">
        <span class="review-user-ans ${isCorrect ? "" : "wrong"}">
          Your Answer: <strong>${userChoice} ${isCorrect ? "✓ (Correct)" : "✗ (Incorrect)"}</strong>
        </span>
        ${!isCorrect ? `<span class="review-correct-ans">Correct Answer: <strong>${q.answer}</strong></span>` : ""}
      </div>
      <div class="review-exp">💡 <strong>Solution & Concept:</strong> ${q.explanation}</div>
    `;
    quizReviewList.appendChild(item);
  });

  // Save High Score
  try {
    const currentHigh = Number(localStorage.getItem("physix_quiz_highscore") || 0);
    if (score > currentHigh) {
      localStorage.setItem("physix_quiz_highscore", score);
      showToast(`🌟 New Quiz High Score: ${score}/${total}!`);
    }
  } catch (e) {
    console.warn("Storage error", e);
  }
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
  const h = Number(heightSlider.value);
  heightValue.textContent = `${h.toFixed(1)} m`;

  heightBtns.forEach(btn => {
    const btnH = Number(btn.getAttribute("data-height"));
    if (Math.abs(btnH - h) < 0.1) btn.classList.add("active");
    else btn.classList.remove("active");
  });

  updateLauncher(Number(angleSlider.value), h);
  calculateTheoreticalResults();
});

gravitySlider.addEventListener("input", () => {
  const g = Number(gravitySlider.value);
  gravityValue.textContent = `${g.toFixed(1)} m/s²`;

  planetBtns.forEach(btn => {
    const btnG = Number(btn.getAttribute("data-gravity"));
    if (Math.abs(btnG - g) < 0.1) btn.classList.add("active");
    else btn.classList.remove("active");
  });

  calculateTheoreticalResults();
});

// Height Presets Buttons
heightBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    heightBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const h = Number(btn.getAttribute("data-height"));
    heightSlider.value = h;
    heightValue.textContent = `${h.toFixed(1)} m`;
    updateLauncher(Number(angleSlider.value), h);
    calculateTheoreticalResults();
  });
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

// Simulation Action Buttons
launchButton.addEventListener("click", launchProjectile);
resetButton.addEventListener("click", resetSimulation);
clearTrailsButton.addEventListener("click", () => {
  simState.ghostTrails = [];
  simState.currentTrail = [];
  showToast("Trajectory comparison trails cleared");
});

// Quiz Controls Navigation
btnQuizPrev.addEventListener("click", () => {
  if (quizState.currentQuestionIndex > 0) {
    renderQuizQuestion(quizState.currentQuestionIndex - 1);
  }
});

btnQuizNext.addEventListener("click", () => {
  if (quizState.currentQuestionIndex < QUIZ_DATA.questions.length - 1) {
    renderQuizQuestion(quizState.currentQuestionIndex + 1);
  } else {
    showQuizResults();
  }
});

btnRetakeQuiz.addEventListener("click", initQuiz);

btnQuizToSim.addEventListener("click", () => {
  quizModal.classList.add("hidden");
  // Set simulator to Question 7 values (v=20, theta=45, g=10 -> Range = 40m)
  velocitySlider.value = 20;
  velocityValue.textContent = "20.0 m/s";
  angleSlider.value = 45;
  angleValue.textContent = "45°";
  heightSlider.value = 0;
  heightValue.textContent = "0.0 m";
  gravitySlider.value = 10;
  gravityValue.textContent = "10.0 m/s²";

  updateLauncher(45, 0);
  calculateTheoreticalResults();
  launchProjectile();

  showToast("🚀 Loaded Quiz Q7 Setup: v₀=20m/s, θ=45°, g=10m/s² ➔ R=40.0m!");
});

// ==========================================
// MODALS & NAVIGATION LOGIC
// ==========================================
// Quiz Modal
btnOpenQuiz.addEventListener("click", () => {
  initQuiz();
  quizModal.classList.remove("hidden");
});
btnCloseQuiz.addEventListener("click", () => {
  quizModal.classList.add("hidden");
});

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

// Close Profile Modal
btnCloseProfile.addEventListener("click", () => {
  profileModal.classList.add("hidden");
});

// Close modals on backdrop click
[explorerModal, theoryModal, profileModal, quizModal, editProfileModal].forEach(modal => {
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.add("hidden");
      }
    });
  }
});

// Close modals on Escape key
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    explorerModal.classList.add("hidden");
    theoryModal.classList.add("hidden");
    profileModal.classList.add("hidden");
    quizModal.classList.add("hidden");
    editProfileModal.classList.add("hidden");
  }
});

// Lab Cards Interaction
const labCards = document.querySelectorAll(".lab-card");
labCards.forEach(card => {
  card.addEventListener("click", () => {
    if (card.classList.contains("active-lab")) {
      explorerModal.classList.add("hidden");
      showToast("🚀 Viewing Projectile Motion Lab");
    } else {
      const name = card.getAttribute("data-name") || "This experiment";
      showToast(`⚡ ${name} is currently in development!`);
    }
  });
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
updateLauncher(DEFAULT_ANGLE, DEFAULT_HEIGHT);
calculateTheoreticalResults();

const runner = Runner.create();
Runner.run(runner, engine);
Render.run(render);