import Matter from "matter-js";
import "./style.css";
import "./light-mode.css";
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
import { api } from "./api.js";
import { ICONS, AVATAR_SVGS, BADGE_SVGS } from "./icons.js";
import { createOpticalFibreExperiment } from "./optical-fibre.js";
import { initSplashScreen } from "./splash.js";

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
  targetHitX: 0,
  targetSpawnEffect: 0,

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

const btnOpenBadgesNav = document.getElementById("btn-open-badges-nav");
const navBadgesCountBadge = document.getElementById("nav-badges-count-badge");

const userProfileBtn = document.getElementById("user-profile-btn");
const btnOpenProfileNav = document.getElementById("btn-open-profile-nav");
const btnCloseProfile = document.getElementById("btn-close-profile");

// Vectra AI DOM Elements
const aiCopilotModal = document.getElementById("ai-copilot-modal");
const btnOpenAiNav = document.getElementById("btn-open-ai-nav");
const btnAiFab = document.getElementById("btn-ai-fab");
const btnCloseAiCopilot = document.getElementById("btn-close-ai-copilot");
const aiLiveBadge = document.getElementById("ai-live-badge");
const aiCtxV0 = document.getElementById("ai-ctx-v0");
const aiCtxAngle = document.getElementById("ai-ctx-angle");
const aiCtxH0 = document.getElementById("ai-ctx-h0");
const aiCtxG = document.getElementById("ai-ctx-g");
const aiChatMessages = document.getElementById("ai-chat-messages");
const formAiChat = document.getElementById("form-ai-chat");
const aiChatInput = document.getElementById("ai-chat-input");
const btnAiSend = document.getElementById("btn-ai-send");
const btnAiClear = document.getElementById("btn-ai-clear");
const aiSuggestionChips = document.querySelectorAll(".ai-suggestion-chip");

const toastEl = document.getElementById("toast");

// ==========================================
// STUDENT PROFILE & AUTH DOM ELEMENTS
// ==========================================
const heroAvatarChar = document.getElementById("hero-avatar-char");
const heroLevelBadge = document.getElementById("hero-level-badge");
const heroStudentName = document.getElementById("hero-student-name");
const heroStatusBadge = document.getElementById("hero-status-badge");
const heroStudentHandle = document.getElementById("hero-student-handle");
const heroStudentEmail = document.getElementById("hero-student-email");
const heroRankPill = document.getElementById("hero-rank-pill");
const heroEduPill = document.getElementById("hero-edu-pill");
const heroInstPill = document.getElementById("hero-inst-pill");
const btnHeroAuthToggle = document.getElementById("btn-hero-auth-toggle");
const heroAuthIcon = document.getElementById("hero-auth-icon");
const heroAuthLabel = document.getElementById("hero-auth-label");

const profileTabBtns = document.querySelectorAll(".profile-tab-btn");
const tabOverview = document.getElementById("tab-overview");
const tabStats = document.getElementById("tab-stats");
const tabBadges = document.getElementById("tab-badges");
const tabLogs = document.getElementById("tab-logs");
const tabSecurity = document.getElementById("tab-security");

// Overview Tab Elements
const pOverviewName = document.getElementById("p-overview-name");
const pOverviewEdu = document.getElementById("p-overview-edu");
const pOverviewOcc = document.getElementById("p-overview-occ");
const pOverviewInterests = document.getElementById("p-overview-interests");
const pOverviewBio = document.getElementById("p-overview-bio");
const pMetaType = document.getElementById("p-meta-type");
const pMetaUid = document.getElementById("p-meta-uid");
const pMetaEmail = document.getElementById("p-meta-email");
const pMetaBackend = document.getElementById("p-meta-backend");
const pMetaSync = document.getElementById("p-meta-sync");
const pMetaRank = document.getElementById("p-meta-rank");

// Telemetry Stats Elements
const statQuizScore = document.getElementById("stat-quiz-score");
const statQuizGrade = document.getElementById("stat-quiz-grade");
const statTargetScore = document.getElementById("stat-target-score");
const statTargetHits = document.getElementById("stat-target-hits");
const statTotalLaunches = document.getElementById("stat-total-launches");
const statMaxRange = document.getElementById("stat-max-range");
const statMaxHeight = document.getElementById("stat-max-height");
const statMaxVelocity = document.getElementById("stat-max-velocity");
const statFavPlanet = document.getElementById("stat-fav-planet");
const statTotalAirtime = document.getElementById("stat-total-airtime");

// Badges & Logs Elements
const badgesUnlockedCount = document.getElementById("badges-unlocked-count");
const badgesUnlockedPill = document.getElementById("badges-unlocked-pill");
const logsCountBadge = document.getElementById("logs-count-badge");
const flightLogsTbody = document.getElementById("flight-logs-tbody");
const btnClearFlightLogs = document.getElementById("btn-clear-flight-logs");

// Security / Auth Elements
const secGuestPanel = document.getElementById("sec-guest-panel");
const secUserPanel = document.getElementById("sec-user-panel");
const btnSubtabLogin = document.getElementById("btn-subtab-login");
const btnSubtabSignup = document.getElementById("btn-subtab-signup");
const btnSubtabForgot = document.getElementById("btn-subtab-forgot");
const authSubtabBtns = document.querySelectorAll(".auth-subtab-btn");

const authViewLogin = document.getElementById("auth-view-login");
const authViewSignup = document.getElementById("auth-view-signup");
const authViewForgot = document.getElementById("auth-view-forgot");

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

const secUserEmailDisplay = document.getElementById("sec-user-email-display");
const secDetailEmail = document.getElementById("sec-detail-email");
const secDetailUid = document.getElementById("sec-detail-uid");
const btnDashboardLogout = document.getElementById("btn-dashboard-logout");

// ==========================================
// OBSERVATIONS & CHALLENGES DOM ELEMENTS
// ==========================================
const btnRecordObservation = document.getElementById("record-observation");
const btnRecordObsTable = document.getElementById("btn-record-obs-table");
const btnClearObservations = document.getElementById("btn-clear-observations");
const obsCountBadge = document.getElementById("obs-count-badge");
const obsEmptyState = document.getElementById("obs-empty-state");
const observationsTable = document.getElementById("observations-table");
const observationsTbody = document.getElementById("observations-tbody");

const challengesCompletedCount = document.getElementById("challenges-completed-count");
const userTotalChallengeXp = document.getElementById("user-total-challenge-xp");
const challengeCardTarget = document.getElementById("challenge-card-target");
const statusTagTarget = document.getElementById("status-tag-target");
const challengeCardComplementary = document.getElementById("challenge-card-complementary");
const statusTagComplementary = document.getElementById("status-tag-complementary");
const challengeCardApex = document.getElementById("challenge-card-apex");
const statusTagApex = document.getElementById("status-tag-apex");

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

  // Track telemetry and check launch achievements
  recordLaunchTelemetry(v0, angleDeg, h0, g);
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
// TARGET MODE HIT DETECTION & RESPAWN
// ==========================================
function checkTargetHit(landX) {
  if (!simState.targetMode) return;

  const currentTargetX = ORIGIN_X + simState.targetDistance * SCALE;
  const diffMeters = Math.abs(landX - currentTargetX) / SCALE;

  if (diffMeters <= 2.0) {
    // Direct Bullseye Hit
    simState.targetScore += 100;
    simState.targetHitEffect = 40;
    simState.targetHitX = currentTargetX;
    showToast(`🎯 DIRECT HIT! Bullseye (+100 pts) • Spawning new target...`);
    recordTargetHitTelemetry(true);
    unlockBadge("badge-target-hit", "Bullseye Sniper");
    setTimeout(() => {
      spawnNewTarget(true);
    }, 600);
  } else if (diffMeters <= 4.0) {
    // Near Hit
    simState.targetScore += 50;
    simState.targetHitEffect = 30;
    simState.targetHitX = currentTargetX;
    showToast(`🎯 NEAR HIT! (+50 pts) • Spawning new target...`);
    recordTargetHitTelemetry(false);
    setTimeout(() => {
      spawnNewTarget(true);
    }, 600);
  }
  if (targetScoreText) {
    targetScoreText.textContent = simState.targetScore;
  }
}

function spawnNewTarget(notify = false) {
  const oldDistance = simState.targetDistance || 35.0;
  let newDistance = oldDistance;
  let attempts = 0;

  // Choose a guaranteed new random distance between 18.0m and 65.0m in 0.5m intervals
  while (attempts < 30) {
    const candidate = Math.round((Math.random() * 47 + 18) * 2) / 2;
    if (Math.abs(candidate - oldDistance) >= 8.0) {
      newDistance = candidate;
      break;
    }
    attempts++;
  }
  if (newDistance === oldDistance) {
    newDistance = oldDistance > 40 ? oldDistance - 15 : oldDistance + 15;
  }

  simState.targetDistance = newDistance;
  simState.targetSpawnEffect = 35; // Pulse glow effect on newly spawned target
  if (targetDistanceText) {
    targetDistanceText.textContent = `${simState.targetDistance.toFixed(1)} m`;
  }
  if (notify) {
    showToast(`🎯 New Target Spawned at ${simState.targetDistance.toFixed(1)} m`);
  }
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

    // Record flight completion to profile telemetry & flight logs
    const peakHeight = simState.h0 + (simState.v0y * simState.v0y) / (2 * Math.max(0.1, simState.g));
    recordFlightComplete({
      angle: Number(angleSlider.value),
      v0: Number(velocitySlider.value),
      h0: simState.h0,
      g: simState.g,
      range: finalRangeMeters,
      apex: peakHeight,
      airtime: t
    });

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
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  ctx.lineWidth = 1;
  ctx.strokeStyle = isLight ? "rgba(203, 213, 225, 0.75)" : "rgba(35, 49, 78, 0.4)";
  ctx.fillStyle = isLight ? "#475569" : "#64748b";
  ctx.font = "11px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";

  const maxMeters = Math.floor((CANVAS_WIDTH - ORIGIN_X) / SCALE);

  for (let m = 0; m <= maxMeters; m += 5) {
    const x = ORIGIN_X + m * SCALE;
    const isMajor = m % 10 === 0;

    if (isMajor) {
      // Full subtle height grid line
      ctx.beginPath();
      ctx.strokeStyle = isLight ? "rgba(203, 213, 225, 0.65)" : "rgba(42, 58, 92, 0.35)";
      ctx.setLineDash([4, 4]);
      ctx.moveTo(x, 40);
      ctx.lineTo(x, GROUND_Y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label at ground
      ctx.fillStyle = isLight ? "#334155" : "#7987a5";
      ctx.fillText(`${m}m`, x, GROUND_Y + 22);
    } else {
      // Sub-tick on ground line
      ctx.beginPath();
      ctx.strokeStyle = isLight ? "rgba(148, 163, 184, 0.8)" : "rgba(74, 96, 144, 0.6)";
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
    ctx.strokeStyle = isLight ? "rgba(203, 213, 225, 0.5)" : "rgba(42, 58, 92, 0.25)";
    ctx.setLineDash([3, 5]);
    ctx.moveTo(ORIGIN_X - 20, y);
    ctx.lineTo(CANVAS_WIDTH - 20, y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = isLight ? "#64748b" : "#506080";
    ctx.textAlign = "right";
    ctx.fillText(`${h}m`, ORIGIN_X - 10, y + 4);
  }

  // Ground Line Glowing Top Border
  ctx.beginPath();
  ctx.strokeStyle = isLight ? "#0284c7" : "#38bdf8";
  ctx.shadowColor = isLight ? "rgba(2, 132, 199, 0.3)" : "#0284c7";
  ctx.shadowBlur = isLight ? 4 : 8;
  ctx.lineWidth = 2;
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawTarget(ctx) {
  const targetX = ORIGIN_X + simState.targetDistance * SCALE;
  const targetY = GROUND_Y;

  // 1. Draw Hit Shockwave / Blast Effect at the impact coordinate
  if (simState.targetHitEffect > 0) {
    const blastX = simState.targetHitX || targetX;
    const progress = simState.targetHitEffect / 40;
    const radius = 55 * (1 - progress * 0.4);

    ctx.save();
    // Outer golden blast
    ctx.beginPath();
    ctx.arc(blastX, targetY - 15, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(245, 158, 11, ${progress * 0.7})`;
    ctx.shadowColor = "#f59e0b";
    ctx.shadowBlur = 20;
    ctx.fill();

    // Inner fiery shockwave
    ctx.beginPath();
    ctx.arc(blastX, targetY - 15, radius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(239, 68, 68, ${progress * 0.9})`;
    ctx.fill();
    ctx.restore();

    simState.targetHitEffect--;
  }

  // 2. Draw Spawn Beacon Pulse on newly randomized target
  if (simState.targetSpawnEffect > 0) {
    const pulseAlpha = simState.targetSpawnEffect / 35;
    ctx.save();
    ctx.beginPath();
    ctx.arc(targetX, targetY - 18, 32, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(56, 189, 248, ${pulseAlpha})`;
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 4]);
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.restore();

    simState.targetSpawnEffect--;
  }

  // 3. Target Base Pad
  ctx.fillStyle = "#f59e0b";
  ctx.shadowColor = "#f59e0b";
  ctx.shadowBlur = 10;
  ctx.fillRect(targetX - 25, targetY - 4, 50, 6);
  ctx.shadowBlur = 0;

  // 4. Bullseye Concentric Target Rings
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

  // 5. Target Flag Pole
  ctx.beginPath();
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 2;
  ctx.moveTo(targetX, targetY - 34);
  ctx.lineTo(targetX, targetY - 4);
  ctx.stroke();

  // 6. Target Pennant Flag
  ctx.beginPath();
  ctx.fillStyle = "#f59e0b";
  ctx.moveTo(targetX, targetY - 34);
  ctx.lineTo(targetX + 16, targetY - 26);
  ctx.lineTo(targetX, targetY - 18);
  ctx.closePath();
  ctx.fill();

  // 7. Metric Target Distance Text Floating Above Target
  ctx.save();
  ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#fbbf24";
  ctx.textAlign = "center";
  ctx.fillText(`${simState.targetDistance.toFixed(1)}m`, targetX, targetY - 40);
  ctx.restore();
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
// STUDENT PROFILE & TELEMETRY CONTROLLER
// ==========================================
let selectedAvatar = "quantum";
let isExpressApiOnline = false;

const ALL_BADGES = [
  // Kinematics Artillery & Trajectory Feats
  { id: "badge-high-velocity", name: "Hypersonic Trajectory", desc: "Launch a projectile with high muzzle velocity v₀ ≥ 40 m/s." },
  { id: "badge-optimal-angle", name: "Optimal 45° Angle", desc: "Fire projectile at the theoretical 45° angle for maximum horizontal range." },
  { id: "badge-high-platform", name: "Sky Platform Artillery", desc: "Launch projectile from an elevated platform altitude h₀ ≥ 10.0m." },
  { id: "badge-long-airtime", name: "Stratospheric Arc", desc: "Achieve sustained high projectile airtime of flight time ≥ 5.0s." },
  { id: "badge-multi-planet", name: "Interplanetary Explorer", desc: "Launch trajectories across all 4 planetary bodies (Moon, Mars, Earth, Jupiter)." },

  // Kinematics Challenges & Precision
  { id: "badge-target-hit", name: "Bullseye Sniper", desc: "Score a direct hit on the target in Target Challenge Mode." },
  { id: "badge-ch-compl", name: "Complementary Angle Ace", desc: "Verify complementary angle theorem with equivalent horizontal range." },
  { id: "badge-ch-moon", name: "Stratospheric Apex", desc: "Fire high-altitude trajectories reaching apex H ≥ 40m." },
  
  // Optical Fibre NA Mastery (Exp 2)
  { id: "badge-of-spot-match", name: "Spot Match Master", desc: "Match diverging laser spot precisely on 2.0 cm concentric target ring." },
  { id: "badge-of-rapid-calib", name: "Laser Calibration Virtuoso", desc: "Complete the 40s rapid 3-point calibration run in Optical Lab." },
  { id: "badge-of-multi-sweep", name: "NA Invariance Champion", desc: "Record readings across 3 distance zones proving Numerical Aperture invariance." },
  
  // Knowledge & Profile Honors
  { id: "badge-quiz-pass", name: "Kinematics Scholar", desc: "Achieve at least 80% (8/10) on the 2D Kinematics Quiz." },
  { id: "badge-quiz-perfect", name: "Grand Physics Virtuoso", desc: "Score a flawless 10/10 on the Kinematics Knowledge Check." },
  { id: "badge-profile-saved", name: "PhysiX Pioneer", desc: "Personalize and customize your student profile dossier." }
];

function getActiveUserId() {
  return auth.currentUser ? auth.currentUser.uid : "guest";
}

async function checkBackendStatus() {
  try {
    const isHealthy = await api.checkHealth();
    isExpressApiOnline = isHealthy;
    if (pMetaBackend) {
      if (isHealthy) {
        pMetaBackend.textContent = "● Express API Online (Port 3001)";
        pMetaBackend.className = "meta-val highlight-cyan";
      } else {
        pMetaBackend.textContent = "● Local Mode (Express Standby)";
        pMetaBackend.className = "meta-val status-local";
      }
    }
  } catch (e) {
    if (pMetaBackend) {
      pMetaBackend.textContent = "● Local Mode (Express Standby)";
      pMetaBackend.className = "meta-val status-local";
    }
  }
}

function getStoredUserProfile() {
  try {
    const saved = localStorage.getItem("physix_user_profile");
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn("Error reading profile from localStorage", e);
  }
  return {
    name: "",
    avatar: "quantum",
    handle: "",
    edu: "",
    occ: "",
    interests: "",
    bio: ""
  };
}

function saveStoredUserProfile(profileData) {
  try {
    localStorage.setItem("physix_user_profile", JSON.stringify(profileData));
  } catch (e) {
    console.warn("Error saving profile to localStorage", e);
  }
  // Asynchronously sync with Express backend
  api.saveProfile(getActiveUserId(), profileData).catch(() => {});
}

function getStoredTelemetry() {
  try {
    const saved = localStorage.getItem("physix_telemetry_stats");
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn("Error reading telemetry stats", e);
  }
  return {
    totalLaunches: 0,
    maxRange: 0,
    maxHeight: 0,
    maxVelocity: 0,
    totalAirtime: 0,
    targetHits: 0,
    planetsUsed: { "Earth": 0, "Moon": 0, "Mars": 0, "Jupiter": 0 }
  };
}

function saveStoredTelemetry(stats) {
  try {
    localStorage.setItem("physix_telemetry_stats", JSON.stringify(stats));
  } catch (e) {
    console.warn("Error saving telemetry stats", e);
  }
}

function getStoredFlightLogs() {
  try {
    const saved = localStorage.getItem("physix_flight_logs");
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn("Error reading flight logs", e);
  }
  return [];
}

function saveStoredFlightLogs(logs) {
  try {
    localStorage.setItem("physix_flight_logs", JSON.stringify(logs));
  } catch (e) {
    console.warn("Error saving flight logs", e);
  }
}

function getStoredBadges() {
  try {
    const saved = localStorage.getItem("physix_unlocked_badges");
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn("Error reading badges", e);
  }
  return [];
}

function saveStoredBadges(badges) {
  try {
    localStorage.setItem("physix_unlocked_badges", JSON.stringify(badges));
  } catch (e) {
    console.warn("Error saving badges", e);
  }
}

function unlockBadge(badgeId, badgeTitle) {
  const badges = getStoredBadges();
  if (!badges.includes(badgeId)) {
    badges.push(badgeId);
    saveStoredBadges(badges);
    api.unlockBadge(getActiveUserId(), badgeId).catch(() => {});
    showToast(`Milestone Unlocked: ${badgeTitle}`);
    loadUserProfile();
  }
}

// ==========================================
// USER BONUS XP & CHALLENGES STATE
// ==========================================
function getStoredBonusXp() {
  return Number(localStorage.getItem("physix_user_bonus_xp") || 0);
}

function saveStoredBonusXp(xp) {
  localStorage.setItem("physix_user_bonus_xp", String(xp));
}

let flatGroundLaunches = [];

function getStoredChallenges() {
  try {
    const saved = localStorage.getItem("physix_challenges_state");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.complementary) {
        parsed.complementary = { completed: false, xp: 75, title: "Complementary Angle Law" };
      }
      return parsed;
    }
  } catch (e) {
    console.warn("Error reading challenges", e);
  }
  return {
    target: { completed: false, xp: 50, title: "Precision Bullseye" },
    complementary: { completed: false, xp: 75, title: "Complementary Angle Law" },
    apex: { completed: false, xp: 100, title: "Stratospheric Apex" }
  };
}

function saveStoredChallenges(challenges) {
  try {
    localStorage.setItem("physix_challenges_state", JSON.stringify(challenges));
  } catch (e) {
    console.warn("Error saving challenges", e);
  }
}

function addStudentXp(amount, reason) {
  const currentXp = getStoredBonusXp();
  const newXp = currentXp + amount;
  saveStoredBonusXp(newXp);

  // Sync to Express backend
  api.addXp(getActiveUserId(), amount, reason).catch(() => {});

  showToast(`+${amount} XP Earned: ${reason}!`);
  loadUserProfile();
  renderChallenges();
}

function renderChallenges() {
  const challenges = getStoredChallenges();
  let doneCount = 0;
  let totalEarnedXp = 0;

  // Challenge 1: Target
  if (challenges.target?.completed) {
    doneCount++;
    totalEarnedXp += challenges.target.xp || 50;
    challengeCardTarget?.classList.add("completed");
    if (statusTagTarget) {
      statusTagTarget.className = "challenge-status-tag completed";
      statusTagTarget.innerHTML = `<svg class="svg-icon svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Complete (+50 XP)`;
    }
  } else {
    challengeCardTarget?.classList.remove("completed");
    if (statusTagTarget) {
      statusTagTarget.className = "challenge-status-tag pending";
      statusTagTarget.textContent = "Pending";
    }
  }

  // Challenge 2: Complementary Angle Law
  if (challenges.complementary?.completed) {
    doneCount++;
    totalEarnedXp += challenges.complementary.xp || 75;
    challengeCardComplementary?.classList.add("completed");
    if (statusTagComplementary) {
      statusTagComplementary.className = "challenge-status-tag completed";
      statusTagComplementary.innerHTML = `<svg class="svg-icon svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Complete (+75 XP)`;
    }
  } else {
    challengeCardComplementary?.classList.remove("completed");
    if (statusTagComplementary) {
      statusTagComplementary.className = "challenge-status-tag pending";
      statusTagComplementary.textContent = "Pending";
    }
  }

  // Challenge 3: Apex
  if (challenges.apex?.completed) {
    doneCount++;
    totalEarnedXp += challenges.apex.xp || 100;
    challengeCardApex?.classList.add("completed");
    if (statusTagApex) {
      statusTagApex.className = "challenge-status-tag completed";
      statusTagApex.innerHTML = `<svg class="svg-icon svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Complete (+100 XP)`;
    }
  } else {
    challengeCardApex?.classList.remove("completed");
    if (statusTagApex) {
      statusTagApex.className = "challenge-status-tag pending";
      statusTagApex.textContent = "Pending";
    }
  }

  if (challengesCompletedCount) {
    challengesCompletedCount.textContent = `${doneCount} / 3 Complete`;
  }
  if (userTotalChallengeXp) {
    userTotalChallengeXp.textContent = `+${totalEarnedXp} XP`;
  }
}

function checkFlightChallenges(flightData) {
  const challenges = getStoredChallenges();
  let updated = false;

  const currentAngle = Number(flightData.angle);
  const currentV0 = Number(flightData.v0);
  const currentH0 = Number(flightData.h0);
  const currentG = Number(flightData.g);
  const currentRange = Number(flightData.range);

  // Challenge 2: Complementary Angle Law (θ1 + θ2 = 90° on flat ground h0 = 0 -> equal range)
  if (!challenges.complementary?.completed && currentH0 <= 0.2) {
    const candidateLogs = [...flatGroundLaunches, ...getStoredFlightLogs().filter(l => Number(l.h0) <= 0.2)];
    
    const compMatch = candidateLogs.find(prev => {
      const pAngle = Number(prev.angle);
      const pV0 = Number(prev.v0);
      const pG = Number(prev.g);
      const pRange = Number(prev.range);

      const isSameSpeed = Math.abs(pV0 - currentV0) <= 0.5;
      const isSameGravity = Math.abs(pG - currentG) <= 0.2;
      const isComplementaryAngle = Math.abs((pAngle + currentAngle) - 90) <= 1.5;
      const isDistinctAngle = Math.abs(pAngle - currentAngle) >= 3.0;
      const isRangeMatching = Math.abs(pRange - currentRange) <= 2.5;

      return isSameSpeed && isSameGravity && isComplementaryAngle && isDistinctAngle && isRangeMatching;
    });

    if (compMatch) {
      challenges.complementary.completed = true;
      updated = true;
      addStudentXp(75, `Complementary Law Verified (${Math.round(compMatch.angle)}° & ${Math.round(currentAngle)}°)`);
      unlockBadge("badge-ch-compl", "Complementary Angle Ace (Verified θ & 90°-θ Law)");
    }

    flatGroundLaunches.unshift({ angle: currentAngle, v0: currentV0, g: currentG, range: currentRange, h0: currentH0 });
    if (flatGroundLaunches.length > 20) flatGroundLaunches.pop();
  }

  // Challenge 3: Stratospheric Apex / Moon gravity
  if (!challenges.apex?.completed && flightData.apex >= 40) {
    challenges.apex.completed = true;
    updated = true;
    addStudentXp(100, "Stratospheric Apex Challenge");
    unlockBadge("badge-ch-moon", "Lunar Gravity Explorer (Stratospheric High Apex)");
  }

  if (updated) {
    saveStoredChallenges(challenges);
    renderChallenges();
  }
}

// ==========================================
// OBSERVATIONS LOGBOOK STATE & METHODS
// ==========================================
function getStoredObservations() {
  try {
    const saved = localStorage.getItem("physix_observations");
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn("Error reading observations", e);
  }
  return [];
}

function saveStoredObservations(obsList) {
  try {
    localStorage.setItem("physix_observations", JSON.stringify(obsList));
  } catch (e) {
    console.warn("Error saving observations", e);
  }
}

function renderObservationsTable() {
  const obsList = getStoredObservations();
  if (obsCountBadge) {
    obsCountBadge.textContent = `${obsList.length} Observation${obsList.length === 1 ? "" : "s"}`;
  }

  if (obsList.length === 0) {
    if (obsEmptyState) obsEmptyState.classList.remove("hidden");
    if (observationsTable) observationsTable.classList.add("hidden");
    if (observationsTbody) observationsTbody.innerHTML = "";
    return;
  }

  if (obsEmptyState) obsEmptyState.classList.add("hidden");
  if (observationsTable) observationsTable.classList.remove("hidden");

  if (observationsTbody) {
    observationsTbody.innerHTML = obsList.map((obs, idx) => `
      <tr class="${idx === 0 ? 'obs-row-highlight' : ''}">
        <td class="obs-run-num">#${obsList.length - idx}</td>
        <td>${Number(obs.v0).toFixed(1)} m/s</td>
        <td>${Number(obs.angle).toFixed(1)}°</td>
        <td>${Number(obs.h0).toFixed(1)} m</td>
        <td>${Number(obs.g).toFixed(1)} m/s² <span style="color:#64748b; font-size:11px;">(${obs.planet || 'Planet'})</span></td>
        <td>${Number(obs.airtime).toFixed(2)} s</td>
        <td style="color:#c4b5fd;">${Number(obs.apex).toFixed(2)} m</td>
        <td style="color:#67e8f9; font-weight:700;">${Number(obs.range).toFixed(2)} m</td>
        <td style="color:#6ee7b7;">${Number(obs.impactSpeed || obs.v0).toFixed(2)} m/s</td>
        <td style="color:#94a3b8; font-size:11px;">${obs.time || 'Logged'}</td>
      </tr>
    `).join("");
  }
}

function recordCurrentObservation() {
  const v0 = Number(velocitySlider.value);
  const angle = Number(angleSlider.value);
  const h0 = Number(heightSlider.value);
  const g = Number(gravitySlider.value);

  let planet = "Earth";
  if (Math.abs(g - 1.6) < 0.1) planet = "Moon";
  else if (Math.abs(g - 3.7) < 0.1) planet = "Mars";
  else if (Math.abs(g - 9.8) < 0.1) planet = "Earth";
  else if (Math.abs(g - 24.8) < 0.1) planet = "Jupiter";

  // Analytical computation for real-time consistency
  const rad = (angle * Math.PI) / 180;
  const v0y = v0 * Math.sin(rad);
  const v0x = v0 * Math.cos(rad);
  const disc = v0y * v0y + 2 * Math.max(0.1, g) * h0;
  const theoT = (v0y + Math.sqrt(Math.max(0, disc))) / Math.max(0.1, g);
  const theoR = v0x * theoT;
  const theoH = h0 + (v0y * v0y) / (2 * Math.max(0.1, g));
  const theoVf = Math.sqrt(v0 * v0 + 2 * Math.max(0.1, g) * h0);

  const rangeVal = lastRecordedFlightForAi ? lastRecordedFlightForAi.range : theoR;
  const apexVal = lastRecordedFlightForAi ? lastRecordedFlightForAi.apex : theoH;
  const airtimeVal = lastRecordedFlightForAi ? lastRecordedFlightForAi.airtime : theoT;
  const impactVal = theoVf;

  const now = new Date();
  const timeStr = now.toTimeString().split(" ")[0];

  const obsEntry = {
    id: Date.now(),
    time: timeStr,
    v0,
    angle,
    h0,
    g,
    planet,
    range: rangeVal,
    apex: apexVal,
    airtime: airtimeVal,
    impactSpeed: impactVal
  };

  const obsList = getStoredObservations();
  obsList.unshift(obsEntry);
  if (obsList.length > 50) obsList.pop();
  saveStoredObservations(obsList);

  // Sync with Express backend
  api.addObservation(getActiveUserId(), obsEntry).catch(() => {});

  renderObservationsTable();
  showToast(`Observation #${obsList.length} Recorded: v₀=${v0}m/s, θ=${angle}°, R=${Number(rangeVal).toFixed(1)}m`);
}

function clearAllObservations() {
  saveStoredObservations([]);
  api.clearObservations(getActiveUserId()).catch(() => {});
  renderObservationsTable();
  showToast("All experimental observations cleared.");
}

function calculateStudentRankAndLevel(stats, quizHigh, targetScore, badgeCount) {
  const bonusXp = getStoredBonusXp();
  let ofXp = 0;
  try {
    const ofChallenges = JSON.parse(localStorage.getItem("physix_of_challenges") || "{}");
    if (ofChallenges.spotMatch?.completed) ofXp += 100;
    if (ofChallenges.rapidCalib?.completed) ofXp += 125;
    if (ofChallenges.multiSweep?.completed) ofXp += 150;
  } catch (e) {}

  const totalScore = (quizHigh * 50) + targetScore + (stats.totalLaunches * 15) + (badgeCount * 40) + bonusXp + ofXp;
  
  // Progressive doubling level scale:
  // Level 1: 0 -> 1000 XP
  // Level 2: 1000 -> 3000 XP (delta: 2000)
  // Level 3: 3000 -> 7000 XP (delta: 4000)
  // Level 4: 7000 -> 15000 XP (delta: 8000)
  // Level 5: 15000 -> 31000 XP (delta: 16000)
  // Level 6: 31000 -> 63000 XP (delta: 32000)
  let level = 1;
  let currentThreshold = 0;
  let currentDelta = 1000;
  let nextThreshold = 1000;

  while (totalScore >= nextThreshold) {
    level++;
    currentThreshold = nextThreshold;
    currentDelta = currentDelta * 2;
    nextThreshold = currentThreshold + currentDelta;
  }

  const xpInLevel = totalScore - currentThreshold;
  const xpNeededForNext = nextThreshold - currentThreshold;
  const progressPct = Math.min(100, Math.max(0, (xpInLevel / xpNeededForNext) * 100));

  const rankTitles = [
    "Newtonian Novice",
    "Galilean Scholar",
    "Kinetic Specialist",
    "Orbital Dynamist",
    "Waveguide Optician",
    "Quantum Luminary",
    "Grand Astrophysics Virtuoso"
  ];
  const rank = rankTitles[Math.min(level - 1, rankTitles.length - 1)];

  return {
    level,
    rank,
    title: `Level ${level} • ${rank}`,
    totalXp: totalScore,
    currentThreshold,
    nextThreshold,
    xpInLevel,
    xpNeededForNext,
    progressPct
  };
}

function recordLaunchTelemetry(v0, angleDeg, h0, g) {
  const stats = getStoredTelemetry();
  stats.totalLaunches = (stats.totalLaunches || 0) + 1;
  stats.maxVelocity = Math.max(stats.maxVelocity || 0, v0);

  // Track planetary usage
  if (!stats.planetsUsed) stats.planetsUsed = {};
  if (Math.abs(g - 1.6) < 0.1) stats.planetsUsed["Moon"] = (stats.planetsUsed["Moon"] || 0) + 1;
  else if (Math.abs(g - 3.7) < 0.1) stats.planetsUsed["Mars"] = (stats.planetsUsed["Mars"] || 0) + 1;
  else if (Math.abs(g - 9.8) < 0.1) stats.planetsUsed["Earth"] = (stats.planetsUsed["Earth"] || 0) + 1;
  else if (Math.abs(g - 24.8) < 0.1) stats.planetsUsed["Jupiter"] = (stats.planetsUsed["Jupiter"] || 0) + 1;

  // Check achievements
  if (v0 >= 40.0) {
    unlockBadge("badge-high-velocity", "Hypersonic Trajectory (v₀ ≥ 40 m/s)");
  }
  if (Math.round(angleDeg) === 45) {
    unlockBadge("badge-optimal-angle", "Optimal 45° Angle (Max Range)");
  }
  if (h0 >= 10.0) {
    unlockBadge("badge-high-platform", "Sky Platform Artillery (h₀ ≥ 10m)");
  }
  const uniquePlanets = Object.keys(stats.planetsUsed).filter(p => stats.planetsUsed[p] > 0);
  if (uniquePlanets.length >= 4) {
    unlockBadge("badge-multi-planet", "Interplanetary Explorer (Moon, Mars, Earth, Jupiter)");
  }

  saveStoredTelemetry(stats);
  // Express backend sync
  api.recordLaunch(getActiveUserId(), { v0, angleDeg, h0, g }).catch(() => {});
  loadUserProfile();
}

function recordFlightComplete(flightData) {
  const stats = getStoredTelemetry();
  stats.totalAirtime = (stats.totalAirtime || 0) + (flightData.airtime || 0);
  stats.maxRange = Math.max(stats.maxRange || 0, flightData.range || 0);
  stats.maxHeight = Math.max(stats.maxHeight || 0, flightData.apex || 0);

  if (flightData.airtime >= 5.0) {
    unlockBadge("badge-long-airtime", "Stratospheric Arc (Flight Time > 5s)");
  }

  saveStoredTelemetry(stats);

  // Check interactive challenges
  checkFlightChallenges(flightData);

  // Add to Flight Logs
  const logs = getStoredFlightLogs();
  const now = new Date();
  const timeStr = now.toTimeString().split(" ")[0];

  logs.unshift({
    id: logs.length + 1,
    time: timeStr,
    angle: flightData.angle,
    v0: flightData.v0,
    h0: flightData.h0,
    g: flightData.g,
    range: flightData.range,
    apex: flightData.apex,
    airtime: flightData.airtime
  });

  if (logs.length > 10) logs.pop();
  saveStoredFlightLogs(logs);

  // Express backend sync
  api.recordFlightComplete(getActiveUserId(), flightData).catch(() => {});

  loadUserProfile();
}

function recordTargetHitTelemetry(isBullseye) {
  const stats = getStoredTelemetry();
  stats.targetHits = (stats.targetHits || 0) + 1;
  saveStoredTelemetry(stats);

  // Check Challenge 1: Precision Bullseye (+50 XP)
  const challenges = getStoredChallenges();
  if (!challenges.target?.completed) {
    challenges.target.completed = true;
    saveStoredChallenges(challenges);
    addStudentXp(50, "Precision Bullseye Challenge");
  }

  unlockBadge("badge-target-hit", isBullseye ? "Bullseye Sniper (Direct Hit)" : "Target Hit Accomplished");
  loadUserProfile();
}

function recordQuizTelemetry(score, total) {
  if (score >= 8) {
    unlockBadge("badge-quiz-pass", `Kinematics Scholar (${score}/${total} score)`);
  }
  if (score === total) {
    unlockBadge("badge-quiz-perfect", "Grand Kinematics Virtuoso (10/10 Perfect Score)");
  }
  loadUserProfile();
}

function loadUserProfile() {
  const profile = getStoredUserProfile();
  const stats = getStoredTelemetry();
  const logs = getStoredFlightLogs();
  const badges = getStoredBadges();
  const quizHigh = Number(localStorage.getItem("physix_quiz_highscore") || 0);
  const targetScore = simState.targetScore || 0;

  const rankInfo = calculateStudentRankAndLevel(stats, quizHigh, targetScore, badges.length);

  // Derive active user identity
  const user = auth.currentUser;
  const isAuth = !!user;

  const displayName = profile.name || (user ? user.email.split("@")[0] : "");
  const displayEmail = user ? user.email : "";
  const displayHandle = profile.handle || (displayName ? `@${displayName.toLowerCase().replace(/[^a-z0-9_]/g, "")}` : (user ? `@${user.email.split("@")[0]}` : ""));
  const avatar = profile.avatar || "quantum";
  selectedAvatar = avatar;

  // Check Express Backend Status
  checkBackendStatus();

  // 1. Update Header Nav Chip & Modal Visibility according to Auth State
  const userNameEl = userProfileBtn?.querySelector(".user-name");
  const userStatusEl = userProfileBtn?.querySelector(".user-status");
  const navAvatarChar = document.getElementById("nav-avatar-char");
  const profileHeroCard = document.querySelector(".profile-hero-card");
  const profileTabsBar = document.querySelector(".profile-tabs-bar");
  const profileModalHeaderTitle = profileModal?.querySelector(".modal-header h2");
  const profileModalHeaderDesc = profileModal?.querySelector(".modal-header p");

  if (!isAuth) {
    // GUEST MODE: Do not show profile or any details, show ONLY login username and password form
    if (navAvatarChar) {
      navAvatarChar.innerHTML = `<svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
    }
    if (userNameEl) userNameEl.textContent = "Sign In";
    if (userStatusEl) {
      userStatusEl.textContent = "● Guest Mode";
      userStatusEl.style.color = "";
    }

    if (profileHeroCard) profileHeroCard.classList.add("hidden");
    if (profileTabsBar) profileTabsBar.classList.add("hidden");

    // Hide all personal detail tabs
    [tabOverview, tabStats, tabBadges, tabLogs].forEach(pane => {
      if (pane) pane.classList.add("hidden");
    });
    // Show only the Security/Login tab
    if (tabSecurity) tabSecurity.classList.remove("hidden");
    if (secGuestPanel) secGuestPanel.classList.remove("hidden");
    if (secUserPanel) secUserPanel.classList.add("hidden");

    if (profileModalHeaderTitle) {
      profileModalHeaderTitle.innerHTML = `
        <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#06b6d4;">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        Account Sign In & Access
      `;
    }
    if (profileModalHeaderDesc) {
      profileModalHeaderDesc.textContent = "Sign in to access your student profile, cloud-synced telemetry analytics, and physics milestones";
    }

  } else {
    // AUTHENTICATED MODE: Show complete student profile hero card and detail tabs
    if (navAvatarChar) navAvatarChar.innerHTML = AVATAR_SVGS[avatar] || AVATAR_SVGS.quantum;
    if (userNameEl) userNameEl.textContent = displayName || user.email.split("@")[0];
    if (userStatusEl) {
      userStatusEl.textContent = "● Firebase Online";
      userStatusEl.style.color = "#34d399";
    }

    if (profileHeroCard) profileHeroCard.classList.remove("hidden");
    if (profileTabsBar) profileTabsBar.classList.remove("hidden");

    if (profileModalHeaderTitle) {
      profileModalHeaderTitle.innerHTML = `
        <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#06b6d4;">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
        </svg>
        PhysiX Student Dossier
      `;
    }
    if (profileModalHeaderDesc) {
      profileModalHeaderDesc.textContent = "Personalized physics credentials, telemetry analytics, and experimental kinematics records";
    }

    // 2. Update Profile Hero Card
    if (heroAvatarChar) heroAvatarChar.innerHTML = AVATAR_SVGS[avatar] || AVATAR_SVGS.quantum;
    if (heroLevelBadge) heroLevelBadge.textContent = `LVL ${rankInfo.level}`;
    if (heroStudentName) heroStudentName.textContent = displayName || "Student Physicist";
    if (heroStudentHandle) heroStudentHandle.textContent = displayHandle || "@student";
    if (heroStudentEmail) heroStudentEmail.textContent = displayEmail;

    if (heroStatusBadge) {
      heroStatusBadge.textContent = "● Firebase Online (Cloud Synced)";
      heroStatusBadge.className = "profile-status-badge firebase-badge";
    }

    if (heroRankPill) heroRankPill.textContent = rankInfo.rank;
    if (heroEduPill) heroEduPill.textContent = profile.edu || "Undergraduate Student";
    if (heroInstPill) heroInstPill.textContent = profile.occ || "PhysiX Virtual Lab";

    // Render Progressive Doubling Level XP Tracker
    const xpTitleEl = document.getElementById("hero-xp-level-title");
    const xpReadoutEl = document.getElementById("hero-xp-progress-readout");
    const xpBarFillEl = document.getElementById("hero-xp-bar-fill");
    const xpNextNoteEl = document.getElementById("hero-xp-next-note");

    if (xpTitleEl) xpTitleEl.textContent = rankInfo.title;
    if (xpReadoutEl) xpReadoutEl.textContent = `${rankInfo.totalXp.toLocaleString()} / ${rankInfo.nextThreshold.toLocaleString()} XP (${Math.round(rankInfo.progressPct)}%)`;
    if (xpBarFillEl) xpBarFillEl.style.width = `${rankInfo.progressPct}%`;
    if (xpNextNoteEl) {
      const needed = Math.max(0, rankInfo.nextThreshold - rankInfo.totalXp);
      xpNextNoteEl.textContent = `Earn ${needed.toLocaleString()} XP to reach Level ${rankInfo.level + 1} • Target: ${rankInfo.nextThreshold.toLocaleString()} XP`;
    }

    if (heroAuthIcon && heroAuthLabel) {
      heroAuthIcon.innerHTML = `<svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`;
      heroAuthLabel.textContent = "Sign Out";
    }

    // 3. Update Overview & Bio Tab
    if (pOverviewName) pOverviewName.textContent = displayName || "—";
    if (pOverviewEdu) pOverviewEdu.textContent = profile.edu || "—";
    if (pOverviewOcc) pOverviewOcc.textContent = profile.occ || "—";
    if (pOverviewBio) pOverviewBio.textContent = profile.bio || "No student statement provided. Click 'Edit Profile' to customize your research identity.";

    if (pOverviewInterests) {
      const rawInterests = profile.interests || "";
      const tags = rawInterests.split(",").map(t => t.trim()).filter(Boolean);
      if (tags.length > 0) {
        pOverviewInterests.innerHTML = tags.map(tag => `<span class="p-interest-tag">${tag}</span>`).join("");
      } else {
        pOverviewInterests.innerHTML = `<span class="p-interest-tag" style="opacity:0.6;">No specialization tags added</span>`;
      }
    }

    if (pMetaType) pMetaType.textContent = "Firebase Cloud Account";
    if (pMetaUid) pMetaUid.textContent = user.uid;
    if (pMetaEmail) pMetaEmail.textContent = displayEmail;
    if (pMetaSync) {
      pMetaSync.textContent = "● Cloud Synced (Firebase Auth)";
      pMetaSync.className = "meta-val highlight-cyan";
    }
    if (pMetaRank) pMetaRank.textContent = rankInfo.title;

    // 4. Update Telemetry & Stats Tab
    if (statQuizScore) statQuizScore.textContent = `${quizHigh} / 10`;
    if (statQuizGrade) {
      const pct = Math.round((quizHigh / 10) * 100);
      if (quizHigh === 10) statQuizGrade.textContent = "Grade: A+ (100%)";
      else if (quizHigh >= 8) statQuizGrade.textContent = `Grade: A (${pct}%)`;
      else if (quizHigh >= 6) statQuizGrade.textContent = `Grade: B (${pct}%)`;
      else if (quizHigh >= 4) statQuizGrade.textContent = `Grade: C (${pct}%)`;
      else if (quizHigh > 0) statQuizGrade.textContent = `Grade: D (${pct}%)`;
      else statQuizGrade.textContent = "Not Evaluated";
    }

    if (statTargetScore) statTargetScore.textContent = `${targetScore} pts`;
    if (statTargetHits) statTargetHits.textContent = `${stats.targetHits || 0} Hits`;
    if (statTotalLaunches) statTotalLaunches.textContent = `${stats.totalLaunches || 0}`;
    if (statMaxRange) statMaxRange.textContent = (stats.maxRange || 0).toFixed(2);
    if (statMaxHeight) statMaxHeight.textContent = (stats.maxHeight || 0).toFixed(2);
    if (statMaxVelocity) statMaxVelocity.textContent = (stats.maxVelocity || 0).toFixed(1);
    if (statTotalAirtime) statTotalAirtime.textContent = (stats.totalAirtime || 0).toFixed(2);

    if (statFavPlanet) {
      const gVal = Number(gravitySlider.value);
      let pName = "Earth (9.8 m/s²)";
      if (Math.abs(gVal - 1.6) < 0.1) pName = "Moon (1.6 m/s²)";
      else if (Math.abs(gVal - 3.7) < 0.1) pName = "Mars (3.7 m/s²)";
      else if (Math.abs(gVal - 24.8) < 0.1) pName = "Jupiter (24.8 m/s²)";
      else if (Math.abs(gVal - 9.8) >= 0.1) pName = `Custom Planet (${gVal.toFixed(1)} m/s²)`;
      statFavPlanet.textContent = pName;
    }

    // 5. Update Badges Tab with Dynamic Vector SVGs
    const badgesGridContainer = document.getElementById("badges-grid-container");
    if (badgesGridContainer) {
      badgesGridContainer.innerHTML = ALL_BADGES.map(b => {
        const isUnlocked = badges.includes(b.id);
        return `
          <div class="badge-item-card ${isUnlocked ? "unlocked" : "locked"}" id="${b.id}">
            <div class="badge-card-icon">
              ${BADGE_SVGS[b.id] || BADGE_SVGS["badge-profile-saved"]}
            </div>
            <div class="badge-card-content">
              <h5>${b.name}</h5>
              <p>${b.desc}</p>
              <span class="badge-status-tag">${isUnlocked ? "Unlocked" : "Locked"}</span>
            </div>
          </div>
        `;
      }).join("");
    }

    let unlockedCount = ALL_BADGES.filter(b => badges.includes(b.id)).length;
    if (badgesUnlockedCount) badgesUnlockedCount.textContent = unlockedCount;
    const badgesTotalCount = document.getElementById("badges-total-count");
    if (badgesTotalCount) badgesTotalCount.textContent = ALL_BADGES.length;
    if (badgesUnlockedPill) badgesUnlockedPill.textContent = `${unlockedCount} of ${ALL_BADGES.length} Unlocked`;
    if (navBadgesCountBadge) navBadgesCountBadge.textContent = `${unlockedCount}/${ALL_BADGES.length}`;

    // 6. Update Flight Logs Tab
    if (logsCountBadge) logsCountBadge.textContent = logs.length;
    if (flightLogsTbody) {
      if (logs.length === 0) {
        flightLogsTbody.innerHTML = `<tr><td colspan="9" class="empty-logs-msg">No simulation flight records yet. Fire the cannon to record telemetry!</td></tr>`;
      } else {
        flightLogsTbody.innerHTML = logs.map((l, index) => `
          <tr>
            <td><strong>#${index + 1}</strong></td>
            <td style="color:var(--text-muted);">${l.time}</td>
            <td style="color:#c4b5fd;">${l.angle}°</td>
            <td style="color:#93c5fd;">${Number(l.v0).toFixed(1)} m/s</td>
            <td>${Number(l.h0).toFixed(1)} m</td>
            <td>${Number(l.g).toFixed(1)} m/s²</td>
            <td style="color:#34d399; font-weight:700;">${Number(l.range).toFixed(2)} m</td>
            <td style="color:#fbbf24;">${Number(l.apex).toFixed(2)} m</td>
            <td>${Number(l.airtime).toFixed(2)} s</td>
          </tr>
        `).join("");
      }
    }

    // 7. Update Security Tab
    if (secGuestPanel) secGuestPanel.classList.add("hidden");
    if (secUserPanel) secUserPanel.classList.remove("hidden");
    if (secUserEmailDisplay) secUserEmailDisplay.textContent = `Connected: ${user.email}`;
    if (secDetailEmail) secDetailEmail.textContent = user.email;
    if (secDetailUid) secDetailUid.textContent = user.uid;

    // Show active tab
    const activeBtn = document.querySelector(".profile-tab-btn.active");
    const activeTab = activeBtn ? activeBtn.getAttribute("data-tab") : "overview";
    [tabOverview, tabStats, tabBadges, tabLogs, tabSecurity].forEach(pane => {
      if (pane) pane.classList.add("hidden");
    });
    if (activeTab === "overview" && tabOverview) tabOverview.classList.remove("hidden");
    else if (activeTab === "stats" && tabStats) tabStats.classList.remove("hidden");
    else if (activeTab === "badges" && tabBadges) tabBadges.classList.remove("hidden");
    else if (activeTab === "logs" && tabLogs) tabLogs.classList.remove("hidden");
    else if (activeTab === "security" && tabSecurity) tabSecurity.classList.remove("hidden");
    else if (tabOverview) tabOverview.classList.remove("hidden");
  }

  // 8. Sync Edit Profile Modal Inputs
  const nameInput = document.getElementById("profile-name-input");
  const handleInput = document.getElementById("profile-handle-input");
  const eduInput = document.getElementById("profile-edu-status");
  const occInput = document.getElementById("profile-occupation-input");
  const interestsInput = document.getElementById("profile-interests-input");
  const bioInput = document.getElementById("profile-interests-bio");

  if (nameInput) nameInput.value = profile.name || displayName;
  if (handleInput) handleInput.value = profile.handle || displayHandle;
  if (eduInput) eduInput.value = profile.edu || "Undergraduate Student";
  if (occInput) occInput.value = profile.occ || "MIT Physics Lab / Student";
  if (interestsInput) interestsInput.value = profile.interests || "2D Kinematics, Planetary Gravity, Orbital Dynamics";
  if (bioInput) bioInput.value = profile.bio || "Exploring 2D projectile kinematics, parabolic trajectories, vector breakdown components, and gravitational effects across the solar system.";

  avatarButtons.forEach(b => {
    if (b.getAttribute("data-avatar") === selectedAvatar) {
      b.classList.add("selected");
    } else {
      b.classList.remove("selected");
    }
  });
}

// PROFILE TAB NAVIGATION
profileTabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const targetTab = btn.getAttribute("data-tab");
    profileTabBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    [tabOverview, tabStats, tabBadges, tabLogs, tabSecurity].forEach(pane => {
      if (pane) pane.classList.add("hidden");
    });

    if (targetTab === "overview" && tabOverview) tabOverview.classList.remove("hidden");
    else if (targetTab === "stats" && tabStats) tabStats.classList.remove("hidden");
    else if (targetTab === "badges" && tabBadges) tabBadges.classList.remove("hidden");
    else if (targetTab === "logs" && tabLogs) tabLogs.classList.remove("hidden");
    else if (targetTab === "security" && tabSecurity) tabSecurity.classList.remove("hidden");
  });
});

function showAuthSubView(viewName) {
  authSubtabBtns.forEach(b => b.classList.remove("active"));
  [authViewLogin, authViewSignup, authViewForgot].forEach(v => {
    if (v) v.classList.add("hidden");
  });

  [loginErrorMsg, signupErrorMsg, forgotErrorMsg, forgotSuccessMsg, changeErrorMsg].forEach(el => {
    if (el) {
      el.classList.add("hidden");
      el.textContent = "";
    }
  });

  if (viewName === "login") {
    btnSubtabLogin?.classList.add("active");
    authViewLogin?.classList.remove("hidden");
  } else if (viewName === "signup") {
    btnSubtabSignup?.classList.add("active");
    authViewSignup?.classList.remove("hidden");
  } else if (viewName === "forgot") {
    btnSubtabForgot?.classList.add("active");
    authViewForgot?.classList.remove("hidden");
  }
}

btnSubtabLogin?.addEventListener("click", () => showAuthSubView("login"));
btnSubtabSignup?.addEventListener("click", () => showAuthSubView("signup"));
btnSubtabForgot?.addEventListener("click", () => showAuthSubView("forgot"));

// Clear Flight Logs
btnClearFlightLogs?.addEventListener("click", () => {
  saveStoredFlightLogs([]);
  api.clearFlightLogs(getActiveUserId()).catch(() => {});
  loadUserProfile();
  showToast("Telemetry flight records cleared.");
});

// Hero Auth Button Toggle
btnHeroAuthToggle?.addEventListener("click", async () => {
  if (auth.currentUser) {
    try {
      await signOut(auth);
      showToast("Signed out of PhysiX account.");
      loadUserProfile();
    } catch (error) {
      showToast(`Error: ${error.message}`);
    }
  } else {
    // Switch to Security Tab to sign in
    const secTabBtn = document.querySelector(`.profile-tab-btn[data-tab="security"]`);
    secTabBtn?.click();
    showAuthSubView("login");
  }
});

// Firebase Auth Handlers
formLogin?.addEventListener("submit", async (e) => {
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
    showToast(`Welcome back, ${userCredential.user.email}! Please review your student details.`);
    loginEmail.value = "";
    loginPassword.value = "";
    loadUserProfile();
    openEditProfileModal();
  } catch (error) {
    console.error("Login error:", error);
    loginErrorMsg.textContent = formatAuthError(error.message);
    loginErrorMsg.classList.remove("hidden");
  }
});

formSignup?.addEventListener("submit", async (e) => {
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
    showToast(`Account created for ${userCredential.user.email}! Please enter your student details.`);
    signupEmail.value = "";
    signupPassword.value = "";
    signupConfirm.value = "";
    loadUserProfile();
    openEditProfileModal();
  } catch (error) {
    console.error("Signup error:", error);
    signupErrorMsg.textContent = formatAuthError(error.message);
    signupErrorMsg.classList.remove("hidden");
  }
});

formForgot?.addEventListener("submit", async (e) => {
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
    showToast("Password reset email sent.");
  } catch (error) {
    console.error("Forgot password error:", error);
    forgotErrorMsg.textContent = formatAuthError(error.message);
    forgotErrorMsg.classList.remove("hidden");
  }
});

formChangePassword?.addEventListener("submit", async (e) => {
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
    showToast("Password changed successfully.");
    changeNewPassword.value = "";
    changeConfirmPassword.value = "";
    loadUserProfile();
  } catch (error) {
    console.error("Change password error:", error);
    changeErrorMsg.textContent = formatAuthError(error.message);
    changeErrorMsg.classList.remove("hidden");
  }
});

btnDashboardLogout?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    showToast("Signed out of PhysiX account.");
    loadUserProfile();
  } catch (error) {
    showToast(`Error: ${error.message}`);
  }
});

// Password Visibility Toggle (Show / Hide Password)
const SVG_EYE = `<svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
const SVG_EYE_OFF = `<svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

document.querySelectorAll(".btn-toggle-password").forEach(btn => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-target");
    const input = document.getElementById(targetId);
    if (!input) return;
    if (input.type === "password") {
      input.type = "text";
      btn.innerHTML = `<span class="eye-icon">${SVG_EYE_OFF}</span>`;
      btn.title = "Hide Password";
    } else {
      input.type = "password";
      btn.innerHTML = `<span class="eye-icon">${SVG_EYE}</span>`;
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

avatarButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    avatarButtons.forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedAvatar = btn.getAttribute("data-avatar");
  });
});

function openEditProfileModal() {
  const profile = getStoredUserProfile();
  const user = auth.currentUser;
  const defaultName = profile.name || "";
  const defaultHandle = profile.handle || (defaultName ? `@${defaultName.toLowerCase().replace(/[^a-z0-9_]/g, "")}` : (user ? `@${user.email.split("@")[0]}` : ""));

  const nameInput = document.getElementById("profile-name-input");
  const handleInput = document.getElementById("profile-handle-input");
  const eduInput = document.getElementById("profile-edu-status");
  const occInput = document.getElementById("profile-occupation-input");
  const interestsInput = document.getElementById("profile-interests-input");
  const bioInput = document.getElementById("profile-interests-bio");

  if (nameInput) {
    nameInput.value = profile.name || "";
    nameInput.required = true;
  }
  if (handleInput) handleInput.value = profile.handle || defaultHandle;
  if (eduInput) eduInput.value = profile.edu || "Undergraduate Student";
  if (occInput) occInput.value = profile.occ || "";
  if (interestsInput) interestsInput.value = profile.interests || "";
  if (bioInput) bioInput.value = profile.bio || "";

  const activeAvatar = profile.avatar || selectedAvatar || "quantum";
  avatarButtons.forEach(b => {
    if (b.getAttribute("data-avatar") === activeAvatar) {
      b.classList.add("selected");
    } else {
      b.classList.remove("selected");
    }
  });

  profileModal?.classList.add("hidden");
  editProfileModal?.classList.remove("hidden");

  setTimeout(() => {
    nameInput?.focus();
  }, 100);
}

if (formEditProfile) {
  formEditProfile.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("profile-name-input");
    const handleInput = document.getElementById("profile-handle-input");
    const eduInput = document.getElementById("profile-edu-status");
    const occInput = document.getElementById("profile-occupation-input");
    const interestsInput = document.getElementById("profile-interests-input");
    const bioInput = document.getElementById("profile-interests-bio");

    const nameVal = nameInput?.value.trim();
    if (!nameVal) {
      showToast("Student Full Name is compulsory. Please enter your name.");
      nameInput?.focus();
      return;
    }

    const profileData = {
      name: nameVal,
      avatar: selectedAvatar || "quantum",
      handle: handleInput?.value.trim() || `@${nameVal.toLowerCase().replace(/[^a-z0-9_]/g, "")}`,
      edu: eduInput?.value || "Undergraduate Student",
      occ: occInput?.value.trim() || "",
      interests: interestsInput?.value.trim() || "",
      bio: bioInput?.value.trim() || ""
    };

    saveStoredUserProfile(profileData);
    unlockBadge("badge-profile-saved", "PhysiX Pioneer (Customized Profile Dossier)");
    loadUserProfile();
    editProfileModal?.classList.add("hidden");
    profileModal?.classList.remove("hidden");
    showToast("Profile dossier updated successfully.");
  });
}

btnOpenEditProfile?.addEventListener("click", () => {
  openEditProfileModal();
});

btnCloseEditProfile?.addEventListener("click", () => {
  editProfileModal?.classList.add("hidden");
  profileModal?.classList.remove("hidden");
});

// Track Auth State in Real-Time
onAuthStateChanged(auth, () => {
  loadUserProfile();
});

function openBadgesModal() {
  loadUserProfile();
  profileModal?.classList.remove("hidden");
  profileTabBtns.forEach(b => {
    if (b.getAttribute("data-tab") === "badges") {
      b.classList.add("active");
    } else {
      b.classList.remove("active");
    }
  });
  [tabOverview, tabStats, tabBadges, tabLogs, tabSecurity].forEach(pane => {
    if (pane) pane.classList.add("hidden");
  });
  if (tabBadges) tabBadges.classList.remove("hidden");
}

btnOpenBadgesNav?.addEventListener("click", openBadgesModal);
heroRankPill?.addEventListener("click", openBadgesModal);

// Profile Button click opens modal
userProfileBtn?.addEventListener("click", () => {
  loadUserProfile();
  if (!auth.currentUser) {
    showAuthSubView("login");
  }
  profileModal?.classList.remove("hidden");
});

btnOpenProfileNav?.addEventListener("click", () => {
  loadUserProfile();
  if (!auth.currentUser) {
    showAuthSubView("login");
  }
  profileModal?.classList.remove("hidden");
});

// ==========================================
// QUIZ ENGINE & INTERACTIVITY (ANTI-COPY SECURED)
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

  // Previous Button
  btnQuizPrev.disabled = index === 0;
  btnQuizPrev.innerHTML = `
    <svg class="svg-icon svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
    <span>Previous Question</span>
  `;

  // Next / Submit Button
  const isLastQuestion = index === QUIZ_DATA.questions.length - 1;
  if (isLastQuestion) {
    btnQuizNext.classList.add("finish-btn");
    btnQuizNext.innerHTML = `
      <span>Finish & View Evaluation</span>
      <svg class="svg-icon svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
    `;
  } else {
    btnQuizNext.classList.remove("finish-btn");
    btnQuizNext.innerHTML = `
      <span>Next Question</span>
      <svg class="svg-icon svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
    `;
  }
}

function handleSelectOption(question, chosenOption) {
  // Save answer in secret
  quizState.userAnswers[question.id] = { chosenOption };
  renderQuizQuestion(quizState.currentQuestionIndex);
}

// ANTI-COPY SECURITY LAYER ON QUIZ MODAL
if (quizModal) {
  // Prevent context menu (right click)
  quizModal.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    showToast("Right-click context menu is disabled during the quiz.");
  });

  // Prevent copy, cut, drag, and selection copying
  ["copy", "cut", "dragstart"].forEach(eventName => {
    quizModal.addEventListener(eventName, (e) => {
      e.preventDefault();
      showToast("Copying quiz questions is restricted during evaluation.");
    });
  });

  // Prevent keyboard shortcuts (Ctrl+C, Ctrl+X, Ctrl+A, Ctrl+U, Ctrl+P)
  quizModal.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && ["c", "x", "a", "u", "p"].includes(e.key.toLowerCase())) {
      e.preventDefault();
      showToast("Keyboard copy shortcuts are disabled during the quiz.");
    }
  });
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
    quizGradeBadge.textContent = "Kinematics Master (Outstanding)";
    quizGradeBadge.style.color = "#fde68a";
  } else if (pct >= 70) {
    quizGradeBadge.textContent = "Physics Ace (Proficient)";
    quizGradeBadge.style.color = "#a7f3d0";
  } else if (pct >= 50) {
    quizGradeBadge.textContent = "Apprentice Physicist (Good Effort)";
    quizGradeBadge.style.color = "#93c5fd";
  } else {
    quizGradeBadge.textContent = "Keep Exploring Simulator!";
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
          Your Answer: <strong>${userChoice} (${isCorrect ? "Correct" : "Incorrect"})</strong>
        </span>
        ${!isCorrect ? `<span class="review-correct-ans">Correct Answer: <strong>${q.answer}</strong></span>` : ""}
      </div>
      <div class="review-exp"><strong>Solution & Concept:</strong> ${q.explanation}</div>
    `;
    quizReviewList.appendChild(item);
  });

  // Save High Score and update profile telemetry
  try {
    const currentHigh = Number(localStorage.getItem("physix_quiz_highscore") || 0);
    if (score > currentHigh) {
      localStorage.setItem("physix_quiz_highscore", score);
      showToast(`New Quiz High Score: ${score}/${total}!`);
    }
    recordQuizTelemetry(score, total);
    api.submitQuiz(getActiveUserId(), quizState.userAnswers).catch(() => {});
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
  const height = Number(heightSlider.value);
  heightValue.textContent = `${height.toFixed(1)} m`;
  updateLauncher(Number(angleSlider.value), height);
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
    spawnNewTarget(true);
  } else {
    targetBanner.classList.add("hidden");
  }
});

const btnRandomizeTarget = document.getElementById("btn-randomize-target");
btnRandomizeTarget?.addEventListener("click", () => {
  spawnNewTarget(true);
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

  showToast("Loaded Quiz Q7 Setup: v₀=20m/s, θ=45°, g=10m/s² -> R=40.0m");
});

// ==========================================
// MODALS & NAVIGATION LOGIC
// ==========================================
// Quiz Modal & Optical Fibre Alert
const ofQuizAlertModal = document.getElementById("optical-quiz-alert-modal");
const btnCloseOfQuizAlert = document.getElementById("btn-close-of-quiz-alert");
const btnOfQuizSwitchProj = document.getElementById("btn-of-quiz-switch-proj");
const btnOfQuizDismiss = document.getElementById("btn-of-quiz-dismiss");

btnOpenQuiz.addEventListener("click", () => {
  if (activeExperimentId === "optical") {
    ofQuizAlertModal?.classList.remove("hidden");
    return;
  }
  initQuiz();
  quizModal.classList.remove("hidden");
});
btnCloseQuiz.addEventListener("click", () => {
  quizModal.classList.add("hidden");
});

btnCloseOfQuizAlert?.addEventListener("click", () => {
  ofQuizAlertModal?.classList.add("hidden");
});

btnOfQuizDismiss?.addEventListener("click", () => {
  ofQuizAlertModal?.classList.add("hidden");
});

btnOfQuizSwitchProj?.addEventListener("click", () => {
  ofQuizAlertModal?.classList.add("hidden");
  switchExperiment("projectile");
  initQuiz();
  quizModal.classList.remove("hidden");
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
  if (activeExperimentId === "optical") {
    btnTheoryExp2?.click();
  } else {
    btnTheoryExp1?.click();
  }
  theoryModal.classList.remove("hidden");
});
btnCloseTheory.addEventListener("click", () => {
  theoryModal.classList.add("hidden");
});

// Close Profile Modal
btnCloseProfile.addEventListener("click", () => {
  profileModal.classList.add("hidden");
});

// ==========================================
// VECTRA AI COPILOT CONTROLLER
// ==========================================
let aiConversationHistory = [];
let lastRecordedFlightForAi = null;
let activeExperimentId = "projectile";
let opticalExperimentInstance = null;

function getLiveSimulationContext() {
  if (activeExperimentId === "optical" && opticalExperimentInstance) {
    const ofState = opticalExperimentInstance.getState();
    return {
      experiment: "Optical Fibre Numerical Aperture",
      activeLab: "Determination of Numerical Aperture of an Optical Fibre",
      powerSupplyOn: ofState.powerSupplyOn,
      lightSourceActive: ofState.lightSourceActive,
      fibreConnected: ofState.fibreInputConnected && ofState.fibreOutputMounted,
      distanceL: ofState.distanceL,
      spotDiameterW: ofState.currentSpotDiameter,
      numericalApertureNA: ofState.currentCalculatedNA,
      acceptanceAngleDeg: ofState.currentAcceptanceAngleDeg,
      matchedRing: ofState.matchedRing,
      isPerfectMatch: ofState.isPerfectMatch,
      observationsCount: ofState.observations.length
    };
  }

  const gVal = Number(gravitySlider.value);
  let planet = "Earth";
  if (Math.abs(gVal - 1.6) < 0.1) planet = "Moon";
  else if (Math.abs(gVal - 3.7) < 0.1) planet = "Mars";
  else if (Math.abs(gVal - 24.8) < 0.1) planet = "Jupiter";
  else if (Math.abs(gVal - 9.8) >= 0.1) planet = `Custom (${gVal.toFixed(1)} m/s²)`;

  return {
    experiment: "2D Projectile Motion",
    activeLab: "2D Projectile Motion Kinematics",
    v0: Number(velocitySlider.value),
    angleDeg: Number(angleSlider.value),
    h0: Number(heightSlider.value),
    g: gVal,
    planet,
    targetDistance: simState.targetDistance,
    targetMode: simState.targetMode,
    lastFlight: lastRecordedFlightForAi
  };
}

function updateAiContextStrip() {
  const ctx = getLiveSimulationContext();
  if (ctx.experiment === "Optical Fibre Numerical Aperture") {
    if (aiCtxV0) aiCtxV0.textContent = `L: ${ctx.distanceL.toFixed(1)} cm`;
    if (aiCtxAngle) aiCtxAngle.textContent = `W: ${ctx.spotDiameterW.toFixed(2)} cm`;
    if (aiCtxH0) aiCtxH0.textContent = `NA: ${ctx.numericalApertureNA.toFixed(4)}`;
    if (aiCtxG) aiCtxG.textContent = `θ_a: ${ctx.acceptanceAngleDeg.toFixed(1)}°`;
  } else {
    if (aiCtxV0) aiCtxV0.textContent = `v₀: ${ctx.v0.toFixed(1)} m/s`;
    if (aiCtxAngle) aiCtxAngle.textContent = `θ: ${ctx.angleDeg}°`;
    if (aiCtxH0) aiCtxH0.textContent = `h₀: ${ctx.h0.toFixed(1)} m`;
    if (aiCtxG) aiCtxG.textContent = `g: ${ctx.g.toFixed(1)} m/s² (${ctx.planet})`;
  }
}

async function updateAiServerStatus() {
  if (!aiLiveBadge) return;
  try {
    const status = await api.getAiStatus();
    if (status && status.status === "ready") {
      aiLiveBadge.textContent = "● Gemini 3.6 Online";
      aiLiveBadge.style.color = "#34d399";
    } else {
      aiLiveBadge.textContent = "● Kinematics Core Online";
      aiLiveBadge.style.color = "#38bdf8";
    }
  } catch (e) {
    aiLiveBadge.textContent = "● Kinematics Core Online";
    aiLiveBadge.style.color = "#38bdf8";
  }
}

function openAiCopilot() {
  updateAiContextStrip();
  updateAiServerStatus();
  aiCopilotModal?.classList.remove("hidden");
  setTimeout(() => aiChatInput?.focus(), 100);
}

function closeAiCopilot() {
  aiCopilotModal?.classList.add("hidden");
}

function formatMarkdownToHtml(markdownText) {
  if (!markdownText) return "";
  let text = markdownText
    .replace(/^#### (.*$)/gim, '<h5>$1</h5>')
    .replace(/^### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^## (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code class="font-mono">$1</code>')
    .replace(/\\mathbf\{([^}]+)\}/gim, '<strong>$1</strong>')
    .replace(/\\text\{([^}]+)\}/gim, '$1')
    .replace(/\\approx/gim, '≈')
    .replace(/\\times/gim, '×')
    .replace(/\\cdot/gim, '·')
    .replace(/\\theta/gim, 'θ')
    .replace(/\\pi/gim, 'π')
    .replace(/\\le/gim, '≤')
    .replace(/\\ge/gim, '≥')
    .replace(/\\pm/gim, '±')
    .replace(/\\Delta/gim, 'Δ')
    .replace(/\\circ/gim, '°')
    .replace(/\\\((.*?)\\\)/gim, '<span class="font-mono">$1</span>')
    .replace(/\\\[(.*?)\\\]/gim, '<div class="formula-latex">$1</div>')
    .replace(/\$\$([\s\S]*?)\$\$/gim, '<div class="formula-latex">$1</div>')
    .replace(/\$([^$]+)\$/gim, '<span class="font-mono">$1</span>');

  const lines = text.split("\n");
  const formattedLines = [];
  let inList = false;
  let inTable = false;

  for (let line of lines) {
    const trimmed = line.trim();

    // Horizontal Rule
    if (trimmed === "***" || trimmed === "---" || trimmed === "___") {
      if (inList) { formattedLines.push("</ul>"); inList = false; }
      if (inTable) { formattedLines.push("</tbody></table>"); inTable = false; }
      formattedLines.push("<hr />");
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      if (inList) { formattedLines.push("</ul>"); inList = false; }
      if (inTable) { formattedLines.push("</tbody></table>"); inTable = false; }
      formattedLines.push(`<blockquote>${trimmed.substring(2)}</blockquote>`);
      continue;
    }

    // Markdown Table
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      if (inList) { formattedLines.push("</ul>"); inList = false; }
      const cells = trimmed.split("|").slice(1, -1).map(c => c.trim());
      // Check if separator row
      if (cells.every(c => /^:?-+:?$/.test(c))) {
        continue;
      }
      if (!inTable) {
        formattedLines.push("<table><thead><tr>");
        cells.forEach(c => formattedLines.push(`<th>${c}</th>`));
        formattedLines.push("</tr></thead><tbody>");
        inTable = true;
      } else {
        formattedLines.push("<tr>");
        cells.forEach(c => formattedLines.push(`<td>${c}</td>`));
        formattedLines.push("</tr>");
      }
      continue;
    } else if (inTable) {
      formattedLines.push("</tbody></table>");
      inTable = false;
    }

    // List item
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (!inList) {
        formattedLines.push("<ul>");
        inList = true;
      }
      formattedLines.push(`<li>${trimmed.substring(2)}</li>`);
    } else {
      if (inList) {
        formattedLines.push("</ul>");
        inList = false;
      }
      if (trimmed.length > 0) {
        if (!trimmed.startsWith("<h") && !trimmed.startsWith("<div") && !trimmed.startsWith("<blockquote") && !trimmed.startsWith("<table") && !trimmed.startsWith("<hr")) {
          formattedLines.push(`<p>${trimmed}</p>`);
        } else {
          formattedLines.push(trimmed);
        }
      }
    }
  }
  if (inList) formattedLines.push("</ul>");
  if (inTable) formattedLines.push("</tbody></table>");

  return formattedLines.join("");
}

function appendAiMessage(role, text) {
  if (!aiChatMessages) return;
  const msgEl = document.createElement("div");
  msgEl.className = `ai-msg ${role === "user" ? "ai-msg-user" : "ai-msg-bot"}`;

  const now = new Date();
  const timeStr = now.toTimeString().split(" ")[0].substring(0, 5);

  const userAvatarSvg = `<svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
  const botAvatarSvg = `<svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`;

  msgEl.innerHTML = `
    <div class="ai-msg-avatar">${role === "user" ? userAvatarSvg : botAvatarSvg}</div>
    <div class="ai-msg-content">
      <div class="ai-msg-header">
        <strong>${role === "user" ? "You" : "Vectra AI"}</strong>
        <span class="ai-msg-time">${timeStr}</span>
      </div>
      ${formatMarkdownToHtml(text)}
    </div>
  `;

  aiChatMessages.appendChild(msgEl);
  aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
}

let typingIndicatorEl = null;

function showAiTypingIndicator() {
  if (typingIndicatorEl || !aiChatMessages) return;
  typingIndicatorEl = document.createElement("div");
  typingIndicatorEl.className = "ai-msg ai-msg-bot";
  typingIndicatorEl.innerHTML = `
    <div class="ai-msg-avatar">
      <svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
    </div>
    <div class="ai-msg-content">
      <div class="ai-typing-indicator">
        <span class="ai-typing-dot"></span>
        <span class="ai-typing-dot"></span>
        <span class="ai-typing-dot"></span>
      </div>
    </div>
  `;
  aiChatMessages.appendChild(typingIndicatorEl);
  aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
}

function hideAiTypingIndicator() {
  if (typingIndicatorEl && typingIndicatorEl.parentNode) {
    typingIndicatorEl.parentNode.removeChild(typingIndicatorEl);
  }
  typingIndicatorEl = null;
}

async function handleSendAiChat(userText) {
  const message = (userText || aiChatInput?.value || "").trim();
  if (!message) return;

  if (aiChatInput) aiChatInput.value = "";
  appendAiMessage("user", message);
  aiConversationHistory.push({ role: "user", text: message });

  if (btnAiSend) btnAiSend.disabled = true;
  showAiTypingIndicator();

  try {
    const simContext = getLiveSimulationContext();
    const result = await api.sendAiChat({
      message,
      history: aiConversationHistory,
      simulationContext: simContext
    });

    hideAiTypingIndicator();
    const replyText = result?.reply || "I analyzed your setup. Let me know if you need specific angle or trajectory calculations!";
    appendAiMessage("bot", replyText);
    aiConversationHistory.push({ role: "model", text: replyText });
  } catch (err) {
    hideAiTypingIndicator();
    appendAiMessage("bot", "Vectra AI: Real-time telemetry analyzed. Let me know which formula you want me to solve!");
  } finally {
    if (btnAiSend) btnAiSend.disabled = false;
  }
}

// Vectra AI Event Listeners
btnOpenAiNav?.addEventListener("click", openAiCopilot);
btnAiFab?.addEventListener("click", openAiCopilot);
btnCloseAiCopilot?.addEventListener("click", closeAiCopilot);

formAiChat?.addEventListener("submit", (e) => {
  e.preventDefault();
  handleSendAiChat();
});

btnAiClear?.addEventListener("click", () => {
  aiConversationHistory = [];
  if (aiChatMessages) {
    aiChatMessages.innerHTML = `
      <div class="ai-msg ai-msg-bot">
        <div class="ai-msg-avatar">
          <svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
        </div>
        <div class="ai-msg-content">
          <div class="ai-msg-header">
            <strong>Vectra AI</strong> <span class="ai-msg-time">Just now</span>
          </div>
          <p>Chat cleared! Ready for new physics questions and trajectory calculations.</p>
        </div>
      </div>
    `;
  }
  showToast("Vectra AI chat history cleared.");
});

aiSuggestionChips.forEach(chip => {
  chip.addEventListener("click", () => {
    const prompt = chip.getAttribute("data-prompt");
    if (prompt) {
      handleSendAiChat(prompt);
    }
  });
});

// Close modals on backdrop click
[explorerModal, theoryModal, profileModal, quizModal, editProfileModal, aiCopilotModal].forEach(modal => {
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
    explorerModal?.classList.add("hidden");
    theoryModal?.classList.add("hidden");
    profileModal?.classList.add("hidden");
    quizModal?.classList.add("hidden");
    editProfileModal?.classList.add("hidden");
    aiCopilotModal?.classList.add("hidden");
  }
});

// ==========================================
// EXPERIMENT SWITCHER CONTROLLER
// ==========================================
const expProjSection = document.getElementById("exp-projectile-section");
const expOptSection = document.getElementById("exp-optical-section");
const btnSwitchProj = document.getElementById("btn-switch-exp-projectile");
const btnSwitchOpt = document.getElementById("btn-switch-exp-optical");

function switchExperiment(expId) {
  activeExperimentId = expId;

  if (expId === "optical") {
    expProjSection?.classList.add("hidden");
    expOptSection?.classList.remove("hidden");
    btnSwitchProj?.classList.remove("active");
    btnSwitchOpt?.classList.add("active");

    if (!opticalExperimentInstance) {
      opticalExperimentInstance = createOpticalFibreExperiment({
        onXpAwarded: (amount, reason) => addStudentXp(amount, reason),
        showToast,
        getActiveUserId,
        loadUserProfile,
        unlockBadge: (badgeId, badgeName) => unlockBadge(badgeId, badgeName)
      });
      opticalExperimentInstance.init();
    } else {
      opticalExperimentInstance.renderAll();
    }

    showToast("Switched to Exp 2: Numerical Aperture of Optical Fibre");
  } else {
    expOptSection?.classList.add("hidden");
    expProjSection?.classList.remove("hidden");
    btnSwitchOpt?.classList.remove("active");
    btnSwitchProj?.classList.add("active");

    showToast("Switched to Exp 1: 2D Projectile Motion");
  }

  updateAiContextStrip();
}

btnSwitchProj?.addEventListener("click", () => switchExperiment("projectile"));
btnSwitchOpt?.addEventListener("click", () => switchExperiment("optical"));

// Lab Cards Interaction in Hub
const labCards = document.querySelectorAll(".lab-card");
labCards.forEach(card => {
  card.addEventListener("click", () => {
    const target = card.getAttribute("data-exp-target");
    if (target === "optical") {
      explorerModal.classList.add("hidden");
      switchExperiment("optical");
    } else if (card.classList.contains("active-lab")) {
      explorerModal.classList.add("hidden");
      switchExperiment("projectile");
    } else {
      const name = card.getAttribute("data-name") || "This experiment";
      showToast(`${name} is currently in development.`);
    }
  });
});

// Theory Modal Subtabs Controller
const btnTheoryExp1 = document.getElementById("btn-theory-tab-exp1");
const btnTheoryExp2 = document.getElementById("btn-theory-tab-exp2");
const paneTheoryExp1 = document.getElementById("theory-pane-exp1");
const paneTheoryExp2 = document.getElementById("theory-pane-exp2");

btnTheoryExp1?.addEventListener("click", () => {
  btnTheoryExp1.classList.add("active");
  btnTheoryExp2?.classList.remove("active");
  paneTheoryExp1?.classList.remove("hidden");
  paneTheoryExp2?.classList.add("hidden");
});

btnTheoryExp2?.addEventListener("click", () => {
  btnTheoryExp2.classList.add("active");
  btnTheoryExp1?.classList.remove("active");
  paneTheoryExp2?.classList.remove("hidden");
  paneTheoryExp1?.classList.add("hidden");
});

// Observations Event Listeners (Exp 1)
btnRecordObservation?.addEventListener("click", recordCurrentObservation);
btnRecordObsTable?.addEventListener("click", recordCurrentObservation);
btnClearObservations?.addEventListener("click", clearAllObservations);

// Category filter pills in Explore Labs Hub
const catPills = document.querySelectorAll(".cat-pill");
catPills.forEach(pill => {
  pill.addEventListener("click", () => {
    catPills.forEach(p => p.classList.remove("active"));
    pill.classList.add("active");
    const category = pill.getAttribute("data-category") || "all";
    const cards = document.querySelectorAll(".labs-grid .lab-card");
    cards.forEach(card => {
      const cardCat = card.getAttribute("data-category") || "all";
      if (category === "all" || cardCat === category || cardCat === "all") {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
    showToast(`Filtered: ${pill.textContent}`);
  });
});

// ==========================================
// THEME CONTROLLER (DARK / LIGHT MODE)
// ==========================================
const btnToggleTheme = document.getElementById("btn-toggle-theme");

function applyTheme(theme) {
  const isLight = theme === "light";
  document.documentElement.setAttribute("data-theme", isLight ? "light" : "dark");
  document.body.setAttribute("data-theme", isLight ? "light" : "dark");
  document.body.classList.toggle("light-mode", isLight);

  const lightModeStylesheet = document.getElementById("light-mode-stylesheet");
  if (lightModeStylesheet) {
    lightModeStylesheet.disabled = !isLight;
  }

  if (btnToggleTheme) {
    btnToggleTheme.setAttribute("aria-checked", isLight ? "true" : "false");
    btnToggleTheme.setAttribute("title", isLight ? "Click to switch to Dark Mode" : "Click to switch to Light Mode");
    btnToggleTheme.setAttribute("aria-label", isLight ? "Switch to Dark Mode" : "Switch to Light Mode");
  }

  // Update Matter.js simulation canvas background and ground styling
  if (render && render.options) {
    render.options.background = isLight ? "#f0f9ff" : "#080d18";
  }
  if (groundBody && groundBody.render) {
    groundBody.render.fillStyle = isLight ? "#e0f2fe" : "#121a2d";
    groundBody.render.strokeStyle = isLight ? "#38bdf8" : "#23314e";
  }
  if (launcherBase && launcherBase.render) {
    launcherBase.render.fillStyle = isLight ? "#0284c7" : "#1a243b";
  }
  if (launcherWheel && launcherWheel.render) {
    launcherWheel.render.fillStyle = isLight ? "#0369a1" : "#2a3756";
    launcherWheel.render.strokeStyle = isLight ? "#38bdf8" : "#8b5cf6";
  }

  // Update Optical Fibre (Exp 2) simulation canvases
  if (opticalExperimentInstance) {
    opticalExperimentInstance.renderAll();
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem("physix_theme");
  if (savedTheme === "light") {
    applyTheme("light");
  } else {
    // Default theme remains Dark Mode, preserving the exact original design
    applyTheme("dark");
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  const newTheme = currentTheme === "light" ? "dark" : "light";
  localStorage.setItem("physix_theme", newTheme);
  applyTheme(newTheme);
  showToast(`Switched to ${newTheme === "light" ? "Light" : "Dark"} Mode`);
}

btnToggleTheme?.addEventListener("click", toggleTheme);

// ==========================================
// INITIAL SETUP & RUN
// ==========================================
initSplashScreen();
initTheme();
loadUserProfile();
renderObservationsTable();
renderChallenges();
updateLauncher(DEFAULT_ANGLE, DEFAULT_HEIGHT);
calculateTheoreticalResults();

const runner = Runner.create();
Runner.run(runner, engine);
Render.run(render);