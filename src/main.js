import { renderMathInDOM, formatMarkdownWithMath, initMathRenderer } from "./math-renderer.js";
import Matter from "matter-js";
import "./style.css";
import "./light-mode.css";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  sendEmailVerification,
  reload,
  onAuthStateChanged
} from "./firebase.js";
import { QUIZ_DATA, generateRandom10QuestionQuiz } from "./quiz-data.js";
import { api } from "./api.js";
import { ICONS, AVATAR_SVGS, BADGE_SVGS } from "./icons.js";
import { createOpticalFibreExperiment } from "./optical-fibre.js";
import { createColourSensorExperiment } from "./colour-sensor.js";
import { createHallEffectExperiment } from "./hall-effect.js";
import { createPhysicsSandboxExperiment } from "./sandbox/sandbox-experiment.js";
import { createDiffractionGratingExperiment } from "./diffraction-grating.js";
import { createDiodeExperiment } from "./diode-vi.js";
import { createPofAttenuationExperiment } from "./pof-attenuation.js";
import "./pof-attenuation.css";
import {
  tutorialManager,
  normalizeExpId,
  isExperimentTutorialCompleted,
  markExperimentTutorialCompleted,
  syncTutorialsWithCloud,
  setAuthReadyPromise
} from "./tutorial-manager.js";
import { initSplashScreen } from "./splash.js";
import { initHomepage } from "./homepage/homepage.js";
import { initPhysixLogoAnimation } from "./logo-animation.js";
import { generateLabReportPdf } from "./pdf-export.js";
import { initContentProtection } from "./content-protection.js";
import { EXPERIMENT_DETAILS } from "./experiment-details-data.js";
import { renderMathInText, renderMathInElement } from "./math-renderer.js";
import {
  initCelebrations,
  showLevelUpCelebration,
  showChallengeGraffiti,
  showStreakLostAnimation,
  showStreakMilestoneAnimation,
  triggerConfetti,
  triggerFireConfetti
} from "./celebrations.js";
import {
  processUserDailyStreak,
  getStoredUserStreak,
  getNextStreakMilestone
} from "./streak.js";
import {
  initPwaSystem,
  getNetworkStatus,
  canPerformCloudOperation,
  onNetworkChange,
  setNetworkStatusOverride
} from "./offline-manager.js";
import { updateManager } from "./update-manager.js";
import {
  syncUserToFirestore,
  recordExperimentInFirestore,
  recordQuizAttemptInFirestore,
  fetchFullUserDataFromFirestore,
  unlockBadgeInFirestore,
  recordChallengeCompletionInFirestore,
  recordExperimentActivity,
  getExperimentNameById,
  calculateRankFromXp,
  awardUserXpInFirestore,
  subscribeToUserDoc,
  isCloudOperationAllowed
} from "./user-data-service.js";

// ==========================================
// AUTHORITATIVE PROGRESSION & MULTI-DEVICE SYNC
// ==========================================
let activeAuthoritativeXp = null; // null indicates not yet loaded from Firestore
let activeAuthoritativeCompletedChallenges = [];
const inFlightChallenges = new Set();
const inFlightBadges = new Set();
let userDocUnsubscribe = null;

let resolveAuthReady;
export const authReadyPromise = new Promise((res) => {
  resolveAuthReady = res;
});
setAuthReadyPromise(authReadyPromise);
setTimeout(() => {
  if (resolveAuthReady) resolveAuthReady(auth.currentUser);
}, 1200);

export function getAuthoritativeUserXp(uid) {
  if (typeof activeAuthoritativeXp === "number") {
    return activeAuthoritativeXp;
  }
  if (uid && uid !== "guest") {
    try {
      const cached = localStorage.getItem(`physix_xp_${uid}`);
      if (cached !== null) {
        const parsed = Number(cached);
        if (!isNaN(parsed) && parsed >= 0) return parsed;
      }
    } catch (e) {}
  }
  return 0;
}

export function setAuthoritativeUserXp(uid, xp, persistToStorage = true) {
  const cleanXp = Math.max(0, Number(xp) || 0);
  activeAuthoritativeXp = cleanXp;
  if (persistToStorage && canPerformCloudOperation() && uid && uid !== "guest") {
    try {
      localStorage.setItem(`physix_xp_${uid}`, String(cleanXp));
    } catch (e) {}
  }
}

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
const btnCloseProfile = document.getElementById("btn-close-profile");

// Homepage & Legal Modals Elements
const physixHome = document.getElementById("physix-home");
const legalModal = document.getElementById("legal-modal");
const btnCloseLegal = document.getElementById("btn-close-legal");
const btnLegalTabTerms = document.getElementById("btn-legal-tab-terms");
const btnLegalTabPrivacy = document.getElementById("btn-legal-tab-privacy");
const legalTermsContent = document.getElementById("legal-terms-content");
const legalPrivacyContent = document.getElementById("legal-privacy-content");
const legalModalHeading = document.getElementById("legal-modal-heading");
const navLogo = document.querySelector(".logo");

let homepageInstance = null;

// Active Experiment State
let activeExperimentId = "projectile";
let opticalExperimentInstance = null;
let colourSensorExperimentInstance = null;
let hallEffectExperimentInstance = null;
let physicsSandboxExperimentInstance = null;
let diffractionExperimentInstance = null;
let diodeExperimentInstance = null;

// Help & Interactive User Guide DOM Elements
const helpModal = document.getElementById("help-modal");
const btnOpenHelp = document.getElementById("btn-open-help");
const btnCloseHelp = document.getElementById("btn-close-help");
const btnHelpExp1 = document.getElementById("btn-help-tab-exp1");
const btnHelpExp2 = document.getElementById("btn-help-tab-exp2");
const btnHelpExp3 = document.getElementById("btn-help-tab-exp3");
const btnHelpExp4 = document.getElementById("btn-help-tab-exp4");
const btnHelpExp5 = document.getElementById("btn-help-tab-exp5");
const btnHelpExp6 = document.getElementById("btn-help-tab-exp6");
const helpPaneExp1 = document.getElementById("help-pane-exp1");
const helpPaneExp2 = document.getElementById("help-pane-exp2");
const helpPaneExp3 = document.getElementById("help-pane-exp3");
const helpPaneExp4 = document.getElementById("help-pane-exp4");
const helpPaneExp5 = document.getElementById("help-pane-exp5");
const helpPaneExp6 = document.getElementById("help-pane-exp6");
const helpNavTabs = document.getElementById("help-nav-tabs");
const helpPaneExpDiode = document.getElementById("help-pane-exp-diode");
const helpPaneExpPof = document.getElementById("help-pane-exp-pof");
const helpModalTitle = document.getElementById("help-modal-title");
const helpModalSubtitle = document.getElementById("help-modal-subtitle");

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

// Firebase Email Verification Modal DOM Elements
const emailVerificationModal = document.getElementById("email-verification-modal");
const verifyUserEmail = document.getElementById("verify-user-email");
const verifyFeedbackBanner = document.getElementById("verify-feedback-banner");
const btnVerifyCheck = document.getElementById("btn-verify-check");
const btnVerifyResend = document.getElementById("btn-verify-resend");
const verifyResendLabel = document.getElementById("verify-resend-label");
const btnVerifySignout = document.getElementById("btn-verify-signout");

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
    showToast(`DIRECT HIT! Bullseye (+100 pts) • Spawning new target...`);
    recordTargetHitTelemetry(true);
    setTimeout(() => {
      spawnNewTarget(true);
    }, 600);
  } else if (diffMeters <= 4.0) {
    // Near Hit
    simState.targetScore += 50;
    simState.targetHitEffect = 30;
    simState.targetHitX = currentTargetX;
    showToast(`NEAR HIT! (+50 pts) • Spawning new target...`);
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
    showToast(`New Target Spawned at ${simState.targetDistance.toFixed(1)} m`);
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

    ctx.fillStyle = isLight ? "#334155" : "#506080";
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
  
  // Colour Sensor Mastery (Exp 3)
  { id: "badge-cs-tristimulus", name: "Tristimulus Virtuoso", desc: "Calibrate White Balance and verify primary RGB spectral filters." },
  { id: "badge-cs-mystery-detective", name: "Spectroscopic Detective", desc: "Identify unknown chemical pigment by analyzing spectral frequency peaks." },
  { id: "badge-cs-inverse-sweep", name: "Optoelectronic Photometrist", desc: "Complete 3-zone distance sweep verifying irradiance decay and optimal focus." },

  // Physics Sandbox Mastery (Exp 4)
  { id: "badge-sb-thrust", name: "Newtonian Dynamicist", desc: "Apply continuous force F ≥ 50N to accelerate rigid body to |v| ≥ 12 m/s." },
  { id: "badge-sb-kick", name: "Momentum Master", desc: "Deliver high-force KICK impulse (F ≥ 80N) imparting kinetic energy KE ≥ 100 J." },
  { id: "badge-sb-zerog", name: "Gravity Defier", desc: "Navigate in Zero-G (g = 0) and maintain unhindered inertial drift for 3 seconds." },

  // Knowledge & Profile Honors
  { id: "badge-quiz-pass", name: "Kinematics Scholar", desc: "Achieve at least 80% (8/10) on the 2D Kinematics Quiz." },
  { id: "badge-quiz-perfect", name: "Grand Physics Virtuoso", desc: "Score a flawless 10/10 on the Kinematics Knowledge Check." },
  { id: "badge-profile-saved", name: "PhysiX Pioneer", desc: "Personalize and customize your student profile dossier." },
  { id: "badge-lab-veteran", name: "Laboratory Veteran", desc: "Engage with virtual lab experiments 5 or more times." }
];

// ==========================================
// EMAIL VERIFICATION HELPER & STATE
// ==========================================
function isEmailVerificationRequired(user) {
  if (!user) return false;
  if (user.emailVerified) return false;

  // Distinguish providers: Google accounts are pre-verified OAuth accounts
  const providers = Array.isArray(user.providerData) ? user.providerData.map(p => p.providerId) : [];
  const isGoogle = providers.includes("google.com");
  if (isGoogle) return false;

  const isPassword = providers.includes("password");
  return isPassword || providers.length === 0;
}

function getActiveUserId() {
  if (!auth.currentUser || isEmailVerificationRequired(auth.currentUser)) {
    return "guest";
  }
  return auth.currentUser.uid;
}

// Early binding for tutorialManager user scoping
tutorialManager.init({
  getActiveUserId,
  showToast
});

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
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === "object") {
        const cVal = (parsed.college || parsed.occ || "").trim();
        parsed.college = cVal;
        parsed.occ = cVal;
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Error reading profile from localStorage", e);
  }
  return {
    name: "",
    avatar: "quantum",
    handle: "",
    edu: "",
    occ: "",
    college: "",
    interests: "",
    bio: ""
  };
}

function saveStoredUserProfile(profileData) {
  const cVal = (profileData.college || profileData.occ || "").trim();
  profileData.college = cVal;
  profileData.occ = cVal;
  try {
    localStorage.setItem("physix_user_profile", JSON.stringify(profileData));
  } catch (e) {
    console.warn("Error saving profile to localStorage", e);
  }
  // Asynchronously sync with Express backend
  api.saveProfile(getActiveUserId(), profileData).catch(() => {});

  // Asynchronously sync with Firestore users/{uid}
  if (auth.currentUser) {
    try {
      const stats = getStoredTelemetry();
      const badges = getStoredBadges(auth.currentUser.uid);
      const quizHigh = Number(localStorage.getItem("physix_quiz_highscore") || 0);
      const authoritativeXp = getAuthoritativeUserXp(auth.currentUser.uid);
      const rankInfo = calculateRankFromXp(authoritativeXp);
      const streak = getStoredUserStreak(auth.currentUser.uid);

      syncUserToFirestore(auth.currentUser, {
        name: profileData.name || auth.currentUser.displayName || (auth.currentUser.email ? auth.currentUser.email.split("@")[0] : "PhysiX Scholar"),
        email: auth.currentUser.email,
        photoURL: auth.currentUser.photoURL || null,
        totalXP: authoritativeXp,
        level: rankInfo.level,
        streak: streak.currentStreak || 1,
        highestStreak: streak.highestStreak || streak.currentStreak || 1,
        lastLoginDate: streak.lastLoginDate,
        experimentsPerformed: stats.totalLaunches || 0,
        badges: badges,
        bestQuizScore: quizHigh,
        extra: {
          avatar: profileData.avatar || "quantum",
          handle: profileData.handle || "",
          edu: profileData.edu || "",
          occ: profileData.occ || "",
          college: profileData.college || profileData.occ || "",
          interests: profileData.interests || "",
          bio: profileData.bio || ""
        }
      });
    } catch (e) {
      console.warn("[Firestore] saveStoredUserProfile sync notice:", e);
    }
  }
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

function getStoredBadges(userId = getActiveUserId()) {
  try {
    const userKey = userId && userId !== "guest" ? `physix_unlocked_badges_${userId}` : "physix_unlocked_badges";
    let saved = localStorage.getItem(userKey);
    // Backward compatibility: check legacy key
    if (!saved && userId && userId !== "guest") {
      saved = localStorage.getItem("physix_unlocked_badges");
      if (saved) {
        localStorage.setItem(userKey, saved);
      }
    }
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn("Error reading badges", e);
  }
  return [];
}

function saveStoredBadges(badges, userId = getActiveUserId()) {
  try {
    const unique = Array.from(new Set(badges || []));
    const userKey = userId && userId !== "guest" ? `physix_unlocked_badges_${userId}` : "physix_unlocked_badges";
    localStorage.setItem(userKey, JSON.stringify(unique));
    if (!userId || userId === "guest") {
      localStorage.setItem("physix_unlocked_badges", JSON.stringify(unique));
    }
  } catch (e) {
    console.warn("Error saving badges", e);
  }
}

async function unlockBadge(badgeId, badgeTitle, persistToStorage = true) {
  if (!badgeId) return;
  const userId = getActiveUserId();
  const currentBadges = getStoredBadges(userId);

  // In offline mode or transient session: do NOT persist to cloud or localStorage
  if (!canPerformCloudOperation() || !persistToStorage) {
    console.log(`[Badge] Offline unlock of "${badgeTitle}" (${badgeId}) — in-memory only`);
    showToast(`Milestone Unlocked: ${badgeTitle} (Offline Session)`);
    return;
  }

  // 1. Fast local idempotency check & in-flight debouncing
  if (inFlightBadges.has(badgeId) || currentBadges.includes(badgeId)) {
    return;
  }
  inFlightBadges.add(badgeId);

  try {
    console.log(`[Badge] Checking eligibility for: ${badgeId}`);

    // 2. If authenticated in Firebase, atomically check & persist in Firestore
    if (auth.currentUser) {
      try {
        const res = await unlockBadgeInFirestore(auth.currentUser.uid, badgeId);
        if (res && res.alreadyUnlocked) {
          console.log(`[Badge] Badge already unlocked? true. (Firestore check). Idempotent bypass.`);
          if (!currentBadges.includes(badgeId)) {
            currentBadges.push(badgeId);
            saveStoredBadges(currentBadges, userId);
            loadUserProfile();
          }
          return;
        }
        if (res && res.badges) {
          saveStoredBadges(res.badges, userId);
        }
      } catch (e) {
        console.warn("[Badge] Firestore unlock sync notice:", e);
      }
    }

    // 3. Update local storage with newly unlocked badge
    const updatedBadges = getStoredBadges(userId);
    if (!updatedBadges.includes(badgeId)) {
      updatedBadges.push(badgeId);
      saveStoredBadges(updatedBadges, userId);
    }

    // 4. Sync with Express backend
    api.unlockBadge(userId, badgeId).catch(() => {});

    // 5. Notify user and refresh UI
    console.log(`%c[Badge] ✓ Badge eligibility result: Unlocked "${badgeTitle}" (${badgeId})`, "color: #10b981; font-weight: bold;");
    showToast(`Milestone Unlocked: ${badgeTitle}`);
    loadUserProfile();
  } finally {
    inFlightBadges.delete(badgeId);
  }
}

// ==========================================
// AUTHENTICATION & ACCESS RESTRICTION HELPERS
// ==========================================
function isUserAuthenticated() {
  if (!auth.currentUser) return false;
  if (isEmailVerificationRequired(auth.currentUser)) return false;
  return true;
}

function openLoginModal(reasonMessage) {
  loadUserProfile();
  const secTabBtn = document.querySelector(`.profile-tab-btn[data-tab="security"]`);
  secTabBtn?.click();
  showAuthSubView("login");
  profileModal?.classList.remove("hidden");
  if (reasonMessage) {
    showToast(reasonMessage);
  }
}

const GUEST_AI_MAX_MESSAGES = 5;

function getGuestAiMessageCount() {
  return Number(localStorage.getItem("physix_guest_ai_count") || 0);
}

function incrementGuestAiMessageCount() {
  const count = getGuestAiMessageCount() + 1;
  localStorage.setItem("physix_guest_ai_count", String(count));
  return count;
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

function syncChallengeToLocalState(challengeId, persistToStorage = true) {
  if (!challengeId) return;
  if (!activeAuthoritativeCompletedChallenges.includes(challengeId)) {
    activeAuthoritativeCompletedChallenges.push(challengeId);
  }

  // Exp 1: Projectile Motion
  if (challengeId.startsWith("projectile.")) {
    const projKey = challengeId.replace("projectile.", "");
    const projState = getStoredChallenges();
    if (projState[projKey]) {
      projState[projKey].completed = true;
      if (persistToStorage && canPerformCloudOperation()) {
        saveStoredChallenges(projState);
      }
    }
    renderChallenges();
  }

  // Exp 2: Optical Fibre
  if (challengeId.startsWith("optical.")) {
    const ofKey = challengeId.replace("optical.", "");
    if (persistToStorage && canPerformCloudOperation()) {
      try {
        const savedOf = JSON.parse(localStorage.getItem("physix_of_challenges") || "{}");
        if (!savedOf[ofKey]) savedOf[ofKey] = {};
        savedOf[ofKey].completed = true;
        localStorage.setItem("physix_of_challenges", JSON.stringify(savedOf));
      } catch (e) {}
    }
    if (opticalExperimentInstance && typeof opticalExperimentInstance.hydrateChallenges === "function") {
      opticalExperimentInstance.hydrateChallenges(activeAuthoritativeCompletedChallenges);
    }
  }

  // Exp 3: Colour Sensor
  if (challengeId.startsWith("colour-sensor.")) {
    const csKey = challengeId.replace("colour-sensor.", "");
    if (persistToStorage && canPerformCloudOperation()) {
      try {
        const savedCs = JSON.parse(localStorage.getItem("physix_cs_challenges") || "{}");
        if (!savedCs[csKey]) savedCs[csKey] = {};
        savedCs[csKey].completed = true;
        localStorage.setItem("physix_cs_challenges", JSON.stringify(savedCs));
      } catch (e) {}
    }
    if (colourSensorExperimentInstance && typeof colourSensorExperimentInstance.hydrateChallenges === "function") {
      colourSensorExperimentInstance.hydrateChallenges(activeAuthoritativeCompletedChallenges);
    }
  }

  // Exp 4: Hall Effect
  if (challengeId.startsWith("hall-effect.")) {
    const hallKey = challengeId.replace("hall-effect.", "");
    if (persistToStorage && canPerformCloudOperation()) {
      try {
        const savedHall = JSON.parse(localStorage.getItem("physix_hall_challenges") || "{}");
        if (!savedHall[hallKey]) savedHall[hallKey] = {};
        savedHall[hallKey].completed = true;
        localStorage.setItem("physix_hall_challenges", JSON.stringify(savedHall));
      } catch (e) {}
    }
    if (hallEffectExperimentInstance && typeof hallEffectExperimentInstance.hydrateChallenges === "function") {
      hallEffectExperimentInstance.hydrateChallenges(activeAuthoritativeCompletedChallenges);
    }
  }

  // Exp 5: Physics Sandbox
  if (challengeId.startsWith("sandbox.")) {
    const sbKey = challengeId.replace("sandbox.", "");
    if (persistToStorage && canPerformCloudOperation()) {
      try {
        const savedSb = JSON.parse(localStorage.getItem("physix_sb_challenges") || "{}");
        if (!savedSb[sbKey]) savedSb[sbKey] = {};
        savedSb[sbKey].completed = true;
        localStorage.setItem("physix_sb_challenges", JSON.stringify(savedSb));
      } catch (e) {}
    }
    if (physicsSandboxExperimentInstance && typeof physicsSandboxExperimentInstance.hydrateChallenges === "function") {
      physicsSandboxExperimentInstance.hydrateChallenges(activeAuthoritativeCompletedChallenges);
    }
  }

  // Exp 5: Diffraction Grating
  if (challengeId.startsWith("diffraction.")) {
    const dgKey = challengeId.replace("diffraction.", "");
    if (persistToStorage && canPerformCloudOperation()) {
      try {
        const savedDg = JSON.parse(localStorage.getItem("physix_dg_challenges") || "{}");
        if (!savedDg[dgKey]) savedDg[dgKey] = {};
        savedDg[dgKey].completed = true;
        localStorage.setItem("physix_dg_challenges", JSON.stringify(savedDg));
      } catch (e) {}
    }
    if (diffractionExperimentInstance && typeof diffractionExperimentInstance.hydrateChallenges === "function") {
      diffractionExperimentInstance.hydrateChallenges(activeAuthoritativeCompletedChallenges);
    }
  }

  // Exp 6: Diode V-I Characteristics
  if (challengeId.startsWith("diode.")) {
    const diodeKey = challengeId.replace("diode.", "");
    if (persistToStorage && canPerformCloudOperation()) {
      try {
        const savedDiode = JSON.parse(localStorage.getItem("physix_diode_challenges") || "{}");
        if (!savedDiode[diodeKey]) savedDiode[diodeKey] = {};
        savedDiode[diodeKey].completed = true;
        localStorage.setItem("physix_diode_challenges", JSON.stringify(savedDiode));
      } catch (e) {}
    }
    if (diodeExperimentInstance && typeof diodeExperimentInstance.hydrateChallenges === "function") {
      diodeExperimentInstance.hydrateChallenges(activeAuthoritativeCompletedChallenges);
    }
  }
}

export async function completeChallengeAuthoritatively({ challengeId, xp, badgeId, badgeTitle, title }) {
  if (!challengeId) return { alreadyCompleted: false };

  // Fast client idempotency / in-flight check
  if (inFlightChallenges.has(challengeId) || activeAuthoritativeCompletedChallenges.includes(challengeId)) {
    console.log(`[Challenge] Challenge ${challengeId} already in flight or completed. Skipping.`);
    syncChallengeToLocalState(challengeId, canPerformCloudOperation());
    return { alreadyCompleted: true };
  }
  inFlightChallenges.add(challengeId);

  try {
    const user = auth.currentUser;
    const isAuth = isUserAuthenticated();
    const numXp = Math.max(0, Number(xp) || 0);

    // OFFLINE MODE:
    // In-session temporary interaction ONLY.
    // Do NOT write to Firestore, do NOT sync to API, do NOT persist to permanent localStorage.
    if (!canPerformCloudOperation()) {
      console.log(`[Challenge] Offline completion of ${challengeId} (+${numXp} XP) — in-memory session only`);
      
      activeAuthoritativeCompletedChallenges = Array.from(new Set([...activeAuthoritativeCompletedChallenges, challengeId]));
      if (typeof activeAuthoritativeXp === "number") {
        activeAuthoritativeXp += numXp;
      }
      
      // Update in-memory state of active experiment simulators without writing to localStorage
      syncChallengeToLocalState(challengeId, false);

      showChallengeGraffiti(title || "Laboratory Challenge Completed", numXp);
      showToast(`Challenge Accomplished: ${title || challengeId} +${numXp} XP (Offline Session)`);
      if (badgeId && badgeTitle) {
        unlockBadge(badgeId, badgeTitle, false);
      }

      loadUserProfile();
      renderChallenges();
      return { alreadyCompleted: false, offline: true };
    }

    if (user && isAuth) {
      try {
        const res = await recordChallengeCompletionInFirestore(user.uid, challengeId, numXp, badgeId);
        if (res && res.alreadyCompleted) {
          console.log(`[Challenge] Challenge ${challengeId} was already completed in Firestore. Skipping duplicate award.`);
          syncChallengeToLocalState(challengeId);
          return { alreadyCompleted: true };
        }

        if (res && typeof res.totalXP === "number") {
          setAuthoritativeUserXp(user.uid, res.totalXP);
          loadUserProfile();
        }
        if (res && Array.isArray(res.badges)) {
          saveStoredBadges(res.badges, user.uid);
          loadUserProfile();
        }
        if (res && Array.isArray(res.completedChallenges)) {
          activeAuthoritativeCompletedChallenges = res.completedChallenges;
        }
      } catch (err) {
        console.error("[Challenge] Error recording completion in Firestore:", err);
      }

      // Sync with Express backend
      api.addXp(user.uid, numXp, title || challengeId).catch(() => {});
      if (badgeId) {
        api.unlockBadge(user.uid, badgeId).catch(() => {});
      }
    } else {
      // Unauthenticated guest mode
      const guestXp = getStoredBonusXp() + numXp;
      saveStoredBonusXp(guestXp);
    }

    // Synchronize to local state across all experiments
    syncChallengeToLocalState(challengeId);

    // Celebratory feedback
    showChallengeGraffiti(title || "Laboratory Challenge Completed", numXp);
    showToast(`Challenge Accomplished: ${title || challengeId} +${numXp} XP!`);
    if (badgeId && badgeTitle) {
      unlockBadge(badgeId, badgeTitle);
    }

    loadUserProfile();
    renderChallenges();

    return { alreadyCompleted: false };
  } finally {
    inFlightChallenges.delete(challengeId);
  }
}

function hydrateAllExperimentChallenges(completedChallengeIds) {
  if (!Array.isArray(completedChallengeIds)) return;
  activeAuthoritativeCompletedChallenges = Array.from(new Set(completedChallengeIds));
  const set = new Set(activeAuthoritativeCompletedChallenges);

  // 1. Exp 1: Projectile Motion
  const projState = getStoredChallenges();
  let projChanged = false;
  if (set.has("projectile.target") && !projState.target?.completed) {
    if (!projState.target) projState.target = { xp: 50, title: "Precision Bullseye" };
    projState.target.completed = true;
    projChanged = true;
  }
  if (set.has("projectile.complementary") && !projState.complementary?.completed) {
    if (!projState.complementary) projState.complementary = { xp: 75, title: "Complementary Angle Law" };
    projState.complementary.completed = true;
    projChanged = true;
  }
  if (set.has("projectile.apex") && !projState.apex?.completed) {
    if (!projState.apex) projState.apex = { xp: 100, title: "Stratospheric Apex" };
    projState.apex.completed = true;
    projChanged = true;
  }
  if (projChanged) {
    saveStoredChallenges(projState);
  }
  renderChallenges();

  // 2. Exp 2: Optical Fibre
  try {
    const savedOf = JSON.parse(localStorage.getItem("physix_of_challenges") || "{}");
    if (set.has("optical.spotMatch")) {
      if (!savedOf.spotMatch) savedOf.spotMatch = { xp: 100 };
      savedOf.spotMatch.completed = true;
    }
    if (set.has("optical.rapidCalib")) {
      if (!savedOf.rapidCalib) savedOf.rapidCalib = { xp: 125 };
      savedOf.rapidCalib.completed = true;
    }
    if (set.has("optical.multiSweep")) {
      if (!savedOf.multiSweep) savedOf.multiSweep = { xp: 150 };
      savedOf.multiSweep.completed = true;
    }
    localStorage.setItem("physix_of_challenges", JSON.stringify(savedOf));
  } catch (e) {}

  if (opticalExperimentInstance && typeof opticalExperimentInstance.hydrateChallenges === "function") {
    opticalExperimentInstance.hydrateChallenges(activeAuthoritativeCompletedChallenges);
  }

  // 3. Exp 3: Colour Sensor
  try {
    const savedCs = JSON.parse(localStorage.getItem("physix_cs_challenges") || "{}");
    if (set.has("colour-sensor.primaryCalib")) {
      if (!savedCs.primaryCalib) savedCs.primaryCalib = { xp: 100 };
      savedCs.primaryCalib.completed = true;
    }
    if (set.has("colour-sensor.mysteryDetective")) {
      if (!savedCs.mysteryDetective) savedCs.mysteryDetective = { xp: 125 };
      savedCs.mysteryDetective.completed = true;
    }
    if (set.has("colour-sensor.distanceSweep")) {
      if (!savedCs.distanceSweep) savedCs.distanceSweep = { xp: 150 };
      savedCs.distanceSweep.completed = true;
    }
    localStorage.setItem("physix_cs_challenges", JSON.stringify(savedCs));
  } catch (e) {}

  if (colourSensorExperimentInstance && typeof colourSensorExperimentInstance.hydrateChallenges === "function") {
    colourSensorExperimentInstance.hydrateChallenges(activeAuthoritativeCompletedChallenges);
  }

  // 4. Exp 4: Hall Effect
  try {
    const savedHall = JSON.parse(localStorage.getItem("physix_hall_challenges") || "{}");
    if (set.has("hall-effect.zeroOffsetCalib")) {
      if (!savedHall.zeroOffsetCalib) savedHall.zeroOffsetCalib = { xp: 100 };
      savedHall.zeroOffsetCalib.completed = true;
    }
    if (set.has("hall-effect.carrierIdentification")) {
      if (!savedHall.carrierIdentification) savedHall.carrierIdentification = { xp: 125 };
      savedHall.carrierIdentification.completed = true;
    }
    if (set.has("hall-effect.mobilityExtraction")) {
      if (!savedHall.mobilityExtraction) savedHall.mobilityExtraction = { xp: 150 };
      savedHall.mobilityExtraction.completed = true;
    }
    localStorage.setItem("physix_hall_challenges", JSON.stringify(savedHall));
  } catch (e) {}

  if (hallEffectExperimentInstance && typeof hallEffectExperimentInstance.hydrateChallenges === "function") {
    hallEffectExperimentInstance.hydrateChallenges(activeAuthoritativeCompletedChallenges);
  }

  // 5. Exp 5: Physics Sandbox
  try {
    const savedSb = JSON.parse(localStorage.getItem("physix_sb_challenges") || "{}");
    if (set.has("sandbox.thrust")) {
      if (!savedSb.thrust) savedSb.thrust = { xp: 100 };
      savedSb.thrust.completed = true;
    }
    if (set.has("sandbox.kick")) {
      if (!savedSb.kick) savedSb.kick = { xp: 125 };
      savedSb.kick.completed = true;
    }
    if (set.has("sandbox.zerog")) {
      if (!savedSb.zerog) savedSb.zerog = { xp: 150 };
      savedSb.zerog.completed = true;
    }
    localStorage.setItem("physix_sb_challenges", JSON.stringify(savedSb));
  } catch (e) {}

  if (physicsSandboxExperimentInstance && typeof physicsSandboxExperimentInstance.hydrateChallenges === "function") {
    physicsSandboxExperimentInstance.hydrateChallenges(activeAuthoritativeCompletedChallenges);
  }

  // 5. Exp 5: Diffraction Grating
  try {
    const savedDg = JSON.parse(localStorage.getItem("physix_dg_challenges") || "{}");
    const dgKeys = ["firstOrder", "highDensity", "secondOrder", "wavelengthShift", "spectroscopyMaster"];
    dgKeys.forEach(k => {
      if (set.has(`diffraction.${k}`)) {
        if (!savedDg[k]) savedDg[k] = {};
        savedDg[k].completed = true;
      }
    });
    localStorage.setItem("physix_dg_challenges", JSON.stringify(savedDg));
  } catch (e) {}

  if (diffractionExperimentInstance && typeof diffractionExperimentInstance.hydrateChallenges === "function") {
    diffractionExperimentInstance.hydrateChallenges(activeAuthoritativeCompletedChallenges);
  }

  // 6. Exp 6: Diode V-I Characteristics
  try {
    const savedDiode = JSON.parse(localStorage.getItem("physix_diode_challenges") || "{}");
    const diodeKeys = ["setRangesFwd", "connectFwd", "recordFwd", "setRangesRev", "connectRev", "recordRev", "generateFwdCurve", "generateRevCurve"];
    diodeKeys.forEach(k => {
      if (set.has(`diode.${k}`)) {
        if (!savedDiode[k]) savedDiode[k] = {};
        savedDiode[k].completed = true;
      }
    });
    localStorage.setItem("physix_diode_challenges", JSON.stringify(savedDiode));
  } catch (e) {}

  if (diodeExperimentInstance && typeof diodeExperimentInstance.hydrateChallenges === "function") {
    diodeExperimentInstance.hydrateChallenges(activeAuthoritativeCompletedChallenges);
  }
}

function addStudentXp(amount, reason) {
  const user = auth.currentUser;
  const numAmount = Math.max(0, Number(amount) || 0);
  if (numAmount <= 0) return;

  if (user && isUserAuthenticated()) {
    if (!canPerformCloudOperation()) {
      // In offline mode: ONLY in-memory visual update for this session!
      // Do NOT persist to localStorage or call Firestore / Express.
      activeAuthoritativeXp = (activeAuthoritativeXp !== null ? activeAuthoritativeXp : getAuthoritativeUserXp(user.uid)) + numAmount;
      loadUserProfile();
      showChallengeGraffiti(reason || "Laboratory Challenge Completed", numAmount);
      showToast(`+${numAmount} XP (Offline Session): ${reason}!`);
      renderChallenges();
      return;
    }

    // 1. Optimistically update local authoritative XP so the UI responds immediately
    const prevXp = getAuthoritativeUserXp(user.uid);
    const optimisticXp = prevXp + numAmount;
    setAuthoritativeUserXp(user.uid, optimisticXp);

    // 2. Persist atomically to Firestore users/{uid}.totalXP via increment()
    awardUserXpInFirestore(user.uid, numAmount, reason).then(res => {
      if (res && typeof res.totalXP === "number") {
        setAuthoritativeUserXp(user.uid, res.totalXP);
        loadUserProfile();
      }
    }).catch(err => {
      console.error("[Firestore] Failed to award XP in cloud:", err);
    });

    // Sync to Express backend
    api.addXp(user.uid, numAmount, reason).catch(() => {});
  } else {
    if (!canPerformCloudOperation()) {
      showChallengeGraffiti(reason || "Laboratory Challenge Completed", numAmount);
      showToast(`+${numAmount} XP (Offline Session): ${reason}!`);
      return;
    }
    // Guest mode: save to guest bonus XP
    const guestXp = getStoredBonusXp() + numAmount;
    saveStoredBonusXp(guestXp);
  }

  // Trigger celebratory cyber graffiti banner and confetti shower
  showChallengeGraffiti(reason || "Laboratory Challenge Completed", numAmount);
  showToast(`+${numAmount} XP Earned: ${reason}!`);
  loadUserProfile();
  renderChallenges();
}

function renderChallenges() {
  const isAuth = isUserAuthenticated();
  const challengesCardProj = document.querySelector("#exp-projectile-section .challenges-card");

  if (!isAuth) {
    challengesCardProj?.classList.add("challenges-locked");
    if (challengesCompletedCount) {
      challengesCompletedCount.innerHTML = `<span class="lock-indicator-badge"><svg class="svg-icon svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> Sign In Required</span>`;
    }
    if (userTotalChallengeXp) {
      userTotalChallengeXp.textContent = "+300 XP Available";
    }

    [statusTagTarget, statusTagComplementary, statusTagApex].forEach(tag => {
      if (tag) {
        tag.className = "challenge-status-tag locked";
        tag.innerHTML = `<svg class="svg-icon svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> Locked`;
      }
    });
    return;
  }

  challengesCardProj?.classList.remove("challenges-locked");
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
  if (!isUserAuthenticated()) return;
  const challenges = getStoredChallenges();
  let updated = false;

  const currentAngle = Number(flightData.angle);
  const currentV0 = Number(flightData.v0);
  const currentH0 = Number(flightData.h0);
  const currentG = Number(flightData.g);
  const currentRange = Number(flightData.range);

  // Challenge 2: Complementary Angle Law (θ1 + θ2 = 90° on flat ground h0 = 0 -> equal range)
  if (!challenges.complementary?.completed && currentH0 <= 0.2) {
    const candidateLogs = [...flatGroundLaunches, ...getStoredObservations().filter(l => Number(l.h0) <= 0.2)];
    
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
      completeChallengeAuthoritatively({
        challengeId: "projectile.complementary",
        xp: 75,
        badgeId: "badge-ch-compl",
        badgeTitle: "Complementary Angle Ace (Verified θ & 90°-θ Law)",
        title: `Complementary Law Verified (${Math.round(compMatch.angle)}° & ${Math.round(currentAngle)}°)`
      });
    }

    flatGroundLaunches.unshift({ angle: currentAngle, v0: currentV0, g: currentG, range: currentRange, h0: currentH0 });
    if (flatGroundLaunches.length > 20) flatGroundLaunches.pop();
  }

  // Challenge 3: Stratospheric Apex / Moon gravity
  if (!challenges.apex?.completed && flightData.apex >= 40) {
    challenges.apex.completed = true;
    updated = true;
    completeChallengeAuthoritatively({
      challengeId: "projectile.apex",
      xp: 100,
      badgeId: "badge-ch-moon",
      badgeTitle: "Lunar Gravity Explorer (Stratospheric High Apex)",
      title: "Stratospheric Apex Challenge"
    });
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
        <td style="text-align:center;">
          <button type="button" class="btn-delete-obs" data-del-obs="${idx}" title="Delete Observation #${obsList.length - idx}">
            <svg class="svg-icon svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </td>
      </tr>
    `).join("");
  }
}

// Delegate individual observation delete clicks
observationsTbody?.addEventListener("click", (e) => {
  const delBtn = e.target.closest("[data-del-obs]");
  if (delBtn) {
    const idx = parseInt(delBtn.getAttribute("data-del-obs"), 10);
    if (!isNaN(idx)) {
      deleteObservation(idx);
    }
  }
});

function deleteObservation(idx) {
  const obsList = getStoredObservations();
  if (idx >= 0 && idx < obsList.length) {
    const runNum = obsList.length - idx;
    obsList.splice(idx, 1);
    saveStoredObservations(obsList);
    renderObservationsTable();
    showToast(`Observation #${runNum} deleted successfully.`);
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

  // Sync with Express backend if online
  if (canPerformCloudOperation()) {
    api.addObservation(getActiveUserId(), obsEntry).catch(() => {});
  }

  // Sync to Firestore users/{uid}/experiments/projectile if online
  if (auth.currentUser && canPerformCloudOperation()) {
    recordExperimentInFirestore(auth.currentUser.uid, "projectile", {
      experimentName: "2D Projectile Motion",
      completed: true,
      score: Number(rangeVal),
      xpEarned: 15
    }).then(res => {
      if (res && typeof res.totalXP === "number") {
        setAuthoritativeUserXp(auth.currentUser.uid, res.totalXP);
        loadUserProfile();
      }
      if (res && res.experimentsPerformed >= 5) {
        unlockBadge("badge-lab-veteran", "Laboratory Veteran (Explored Labs 5+ Times)");
      }
    }).catch(() => {});
  }

  renderObservationsTable();
  showToast(`Observation #${obsList.length} Recorded: v₀=${v0}m/s, θ=${angle}°, R=${Number(rangeVal).toFixed(1)}m`);
}

function clearAllObservations() {
  saveStoredObservations([]);
  api.clearObservations(getActiveUserId()).catch(() => {});
  renderObservationsTable();
  showToast("All experimental observations cleared.");
}

function exportProjectileCsv() {
  if (!isUserAuthenticated()) {
    openLoginModal("Exporting experimental observations to CSV requires account sign-in. Sign in to download your laboratory dataset!");
    return;
  }

  const obsList = getStoredObservations();
  if (obsList.length === 0) {
    showToast("No flight observations recorded yet. Launch and record observations first!");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Run_Number,Velocity_m_s,Angle_deg,Platform_Height_m,Gravity_m_s2,Planet,Flight_Time_s,Apex_Altitude_m,Range_m,Impact_Speed_m_s,Logged_Time\n";

  obsList.forEach((obs, idx) => {
    csvContent += `${obsList.length - idx},${Number(obs.v0).toFixed(1)},${Number(obs.angle).toFixed(1)},${Number(obs.h0).toFixed(1)},${Number(obs.g).toFixed(1)},"${obs.planet || 'Earth'}",${Number(obs.airtime).toFixed(2)},${Number(obs.apex).toFixed(2)},${Number(obs.range).toFixed(2)},${Number(obs.impactSpeed || obs.v0).toFixed(2)},"${obs.time || 'Logged'}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `PhysiX_Projectile_Motion_Observations_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast("Exported Projectile Motion observations to CSV.");
}

function exportProjectilePdf() {
  if (!isUserAuthenticated()) {
    openLoginModal("Generating official PhysiX PDF lab reports requires account sign-in. Sign in to download your certified report!");
    return;
  }

  const obsList = getStoredObservations();
  if (obsList.length === 0) {
    showToast("No flight observations recorded yet. Launch and record observations first!");
    return;
  }

  const profile = getStoredUserProfile();
  const user = auth.currentUser;
  const studentName = (profile.name || user?.displayName || "").trim() || "Guest Student";
  const collegeName = (profile.college || profile.occ || "").trim() || "---";
  const studentEmail = user ? user.email : "guest@physix.lab";
  const studentRole = profile.edu || profile.occ || "Student Researcher";

  let maxRange = 0;
  let maxApex = 0;
  let maxAirtime = 0;
  obsList.forEach(o => {
    maxRange = Math.max(maxRange, Number(o.range) || 0);
    maxApex = Math.max(maxApex, Number(o.apex) || 0);
    maxAirtime = Math.max(maxAirtime, Number(o.airtime) || 0);
  });

  const columns = ["Run #", "Speed (v₀)", "Angle (θ)", "Height (h₀)", "Gravity (g)", "Airtime (t)", "Apex (H_max)", "Range (R)", "Impact Speed", "Time"];

  const rows = obsList.map((obs, idx) => [
    `#${obsList.length - idx}`,
    `${Number(obs.v0).toFixed(1)} m/s`,
    `${Number(obs.angle).toFixed(1)}°`,
    `${Number(obs.h0).toFixed(1)} m`,
    `${Number(obs.g).toFixed(1)} m/s² (${obs.planet || 'Earth'})`,
    `${Number(obs.airtime).toFixed(2)} s`,
    `${Number(obs.apex).toFixed(2)} m`,
    `${Number(obs.range).toFixed(2)} m`,
    `${Number(obs.impactSpeed || obs.v0).toFixed(2)} m/s`,
    obs.time || 'Logged'
  ]);

  const btn = document.getElementById("btn-export-proj-pdf");
  if (btn && btn.disabled) return;
  if (btn) {
    btn.disabled = true;
    btn.setAttribute("data-orig-html", btn.innerHTML);
    btn.innerHTML = `<span>Generating Report...</span>`;
  }

  try {
    generateLabReportPdf({
      labTitle: "2D Projectile Motion Kinematics Logbook",
      labSubtitle: "Classical Kinematic Trajectory Telemetry & Ballistic Flight Dynamics",
      experimentCode: "EXP-01",
      studentName,
      collegeName,
      studentEmail,
      studentRole,
      summaryMetrics: [
        { label: "Total Observations", value: `${obsList.length} Runs`, color: [14, 165, 233] },
        { label: "Maximum Range", value: `${maxRange.toFixed(2)} m`, color: [6, 182, 212] },
        { label: "Maximum Apex Altitude", value: `${maxApex.toFixed(2)} m`, color: [139, 92, 246] },
        { label: "Longest Airtime", value: `${maxAirtime.toFixed(2)} s`, color: [245, 158, 11] }
      ],
      columns,
      rows,
      filename: `PhysiX_Projectile_Motion_Report_${Date.now()}.pdf`,
      orientation: "landscape"
    });

    showToast("Generated and downloaded official PhysiX PDF report.");
    if (btn) btn.innerHTML = `<span>Report Exported!</span>`;
  } catch (err) {
    console.error("PDF generation failed:", err);
    showToast("Failed to generate PDF report. Please try again.");
  } finally {
    if (btn) {
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = btn.getAttribute("data-orig-html") || `<span>Export PDF Logbook</span>`;
      }, 1500);
    }
  }
}

function calculateLegacyLocalXp(stats, quizHigh, targetScore, badgeCount) {
  const bonusXp = getStoredBonusXp();
  let chXp = 0;
  try {
    const ofChallenges = JSON.parse(localStorage.getItem("physix_of_challenges") || "{}");
    if (ofChallenges.spotMatch?.completed) chXp += 100;
    if (ofChallenges.rapidCalib?.completed) chXp += 125;
    if (ofChallenges.multiSweep?.completed) chXp += 150;

    const csChallenges = JSON.parse(localStorage.getItem("physix_cs_challenges") || "{}");
    if (csChallenges.primaryCalib?.completed) chXp += 100;
    if (csChallenges.mysteryDetective?.completed) chXp += 125;
    if (csChallenges.distanceSweep?.completed) chXp += 150;

    const sbChallenges = JSON.parse(localStorage.getItem("physix_sb_challenges") || "{}");
    if (sbChallenges.thrust?.completed) chXp += 100;
    if (sbChallenges.kick?.completed) chXp += 125;
    if (sbChallenges.zerog?.completed) chXp += 150;
  } catch (e) {}

  return (quizHigh * 50) + (targetScore || 0) + ((stats?.totalLaunches || 0) * 15) + ((badgeCount || 0) * 40) + bonusXp + chXp;
}

function calculateStudentRankAndLevel(stats, quizHigh, targetScore, badgeCount) {
  const user = auth.currentUser;
  let totalScore = 0;
  if (user && isUserAuthenticated()) {
    // For authenticated users, Firestore is the single source of truth
    totalScore = getAuthoritativeUserXp(user.uid);
  } else {
    // Fallback for unauthenticated guest mode
    totalScore = calculateLegacyLocalXp(stats, quizHigh, targetScore, badgeCount);
  }
  return calculateRankFromXp(totalScore);
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
  if (!challenges.target?.completed && !activeAuthoritativeCompletedChallenges.includes("projectile.target")) {
    challenges.target.completed = true;
    saveStoredChallenges(challenges);
    completeChallengeAuthoritatively({
      challengeId: "projectile.target",
      xp: 50,
      badgeId: "badge-target-hit",
      badgeTitle: isBullseye ? "Bullseye Sniper (Direct Hit)" : "Target Hit Accomplished",
      title: "Precision Bullseye Challenge"
    });
  } else {
    unlockBadge("badge-target-hit", isBullseye ? "Bullseye Sniper (Direct Hit)" : "Target Hit Accomplished");
  }

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

function setAvatarElement(container, photoUrl, defaultSvg) {
  if (!container) return;
  if (photoUrl) {
    const isHero = container.classList.contains("profile-avatar-large") || container.id === "hero-avatar-char";
    const img = document.createElement("img");
    img.src = photoUrl;
    img.alt = "Profile Picture";
    img.className = isHero ? "profile-avatar-img" : "user-avatar-img";
    img.setAttribute("referrerpolicy", "no-referrer");
    img.onerror = () => {
      container.innerHTML = defaultSvg;
    };
    container.innerHTML = "";
    container.appendChild(img);
  } else {
    container.innerHTML = defaultSvg;
  }
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
  const isAuth = isUserAuthenticated();

  // Automatic Level-Up celebration: triggers ONLY when a user advances to a higher level
  try {
    const prevLevelKey = `physix_last_level_${user ? user.uid : "guest"}`;
    const savedLevel = localStorage.getItem(prevLevelKey);
    if (savedLevel !== null) {
      const prevLevelNum = parseInt(savedLevel, 10);
      if (!isNaN(prevLevelNum) && rankInfo.level > prevLevelNum) {
        showLevelUpCelebration({
          level: rankInfo.level,
          rank: rankInfo.rank,
          xp: rankInfo.totalXp,
          nextThreshold: rankInfo.nextThreshold
        });
      }
    }
    localStorage.setItem(prevLevelKey, rankInfo.level.toString());
  } catch (e) {}

  const displayName = (user && user.displayName) || profile.name || (user ? user.email.split("@")[0] : "");
  const displayEmail = (user && user.email) || "";
  const displayHandle = profile.handle || (displayName ? `@${displayName.toLowerCase().replace(/[^a-z0-9_]/g, "")}` : (user ? `@${user.email.split("@")[0]}` : ""));
  const avatar = profile.avatar || "quantum";
  selectedAvatar = avatar;
  const defaultAvatarSvg = AVATAR_SVGS[avatar] || AVATAR_SVGS.quantum;
  const photoUrl = (user && user.photoURL) || null;

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

  // 1. Update Header Nav Chip
  if (navAvatarChar) setAvatarElement(navAvatarChar, photoUrl, defaultAvatarSvg);
  if (userNameEl) userNameEl.textContent = displayName || profile.name || (isAuth ? (user.displayName || user.email.split("@")[0]) : "Student Profile");
  if (userStatusEl) {
    if (isAuth) {
      userStatusEl.textContent = "● Firebase Online";
      userStatusEl.style.color = "#34d399";
    } else {
      userStatusEl.textContent = "● Local Session";
      userStatusEl.style.color = "#94a3b8";
    }
  }

  // Ensure Profile Hero Card and Tabs Bar are visible for all users
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
  if (heroAvatarChar) setAvatarElement(heroAvatarChar, photoUrl, defaultAvatarSvg);
  if (heroLevelBadge) heroLevelBadge.textContent = `LVL ${rankInfo.level}`;
  if (heroStudentName) heroStudentName.textContent = displayName || profile.name || "Guest Student";
  if (heroStudentHandle) heroStudentHandle.textContent = displayHandle || "@student";
  if (heroStudentEmail) heroStudentEmail.textContent = displayEmail || (isAuth ? user.email : "Local Session");

  if (heroStatusBadge) {
    if (isAuth) {
      heroStatusBadge.textContent = "● Firebase Online (Cloud Synced)";
      heroStatusBadge.className = "profile-status-badge firebase-badge";
    } else {
      heroStatusBadge.textContent = "● Local Session";
      heroStatusBadge.className = "profile-status-badge guest-badge";
    }
  }

  if (heroRankPill) heroRankPill.textContent = rankInfo.rank;
  if (heroEduPill) heroEduPill.textContent = profile.edu || "Undergraduate Student";
  if (heroInstPill) heroInstPill.textContent = profile.college || profile.occ || "PhysiX Virtual Lab";

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
    if (isAuth) {
      heroAuthIcon.innerHTML = `<svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`;
      heroAuthLabel.textContent = "Sign Out";
    } else {
      heroAuthIcon.innerHTML = `<svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>`;
      heroAuthLabel.textContent = "Sign In";
    }
  }

  // 3. Update Overview & Bio Tab
  if (pOverviewName) pOverviewName.textContent = displayName || profile.name || "Guest Student";
  if (pOverviewEdu) pOverviewEdu.textContent = profile.edu || "Undergraduate Student";
  if (pOverviewOcc) pOverviewOcc.textContent = profile.college || profile.occ || "—";
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

  if (pMetaType) pMetaType.textContent = isAuth ? "Firebase Cloud Account" : "Local Student Profile";
  if (pMetaUid) pMetaUid.textContent = isAuth ? user.uid : "local-guest-session";
  if (pMetaEmail) pMetaEmail.textContent = displayEmail || (isAuth ? user.email : "Local (Unregistered)");
  if (pMetaSync) {
    if (isAuth) {
      pMetaSync.textContent = "● Cloud Synced (Firebase Auth)";
      pMetaSync.className = "meta-val highlight-cyan";
    } else {
      pMetaSync.textContent = "● Stored Locally in Browser";
      pMetaSync.className = "meta-val status-local";
    }
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

  // 6. Update Security Tab
  if (isAuth) {
    if (secGuestPanel) secGuestPanel.classList.add("hidden");
    if (secUserPanel) secUserPanel.classList.remove("hidden");
    if (secUserEmailDisplay) secUserEmailDisplay.textContent = `Connected: ${user.email}`;
    if (secDetailEmail) secDetailEmail.textContent = user.email;
    if (secDetailUid) secDetailUid.textContent = user.uid;
    const secDetailProvider = document.getElementById("sec-detail-provider");
    if (secDetailProvider) {
      const isGoogle = user.providerData?.some(p => p.providerId === "google.com");
      secDetailProvider.textContent = isGoogle ? "Google Account (OAuth)" : "Firebase Email / Password";
    }
  } else {
    if (secGuestPanel) secGuestPanel.classList.remove("hidden");
    if (secUserPanel) secUserPanel.classList.add("hidden");
  }

  // Show active tab
  const activeBtn = document.querySelector(".profile-tab-btn.active");
  const activeTab = activeBtn ? activeBtn.getAttribute("data-tab") : "overview";
  [tabOverview, tabStats, tabBadges, tabSecurity].forEach(pane => {
    if (pane) pane.classList.add("hidden");
  });
  if (activeTab === "overview" && tabOverview) tabOverview.classList.remove("hidden");
  else if (activeTab === "stats" && tabStats) tabStats.classList.remove("hidden");
  else if (activeTab === "badges" && tabBadges) tabBadges.classList.remove("hidden");
  else if (activeTab === "security" && tabSecurity) tabSecurity.classList.remove("hidden");
  else if (tabOverview) tabOverview.classList.remove("hidden");

  // 7. Update Daily Login Streak (Displayed ONLY inside Student Profile Dossier)
  const streakData = getStoredUserStreak(user ? user.uid : "guest");
  const heroStreakText = document.getElementById("hero-streak-text");
  const pStreakCurrent = document.getElementById("p-streak-current");
  const pStreakHighest = document.getElementById("p-streak-highest");
  const pStreakNextMilestone = document.getElementById("p-streak-next-milestone");
  const pStreakMilestoneDiff = document.getElementById("p-streak-milestone-diff");
  const pStreakSubnote = document.getElementById("p-streak-subnote");
  const streakActiveStatus = document.getElementById("streak-active-status");

  const currentStreak = Math.max(0, streakData.currentStreak || 0);
  const highestStreak = Math.max(currentStreak, streakData.highestStreak || 0);
  const nextMilestone = getNextStreakMilestone(currentStreak);
  const remainingDays = Math.max(0, nextMilestone - currentStreak);

  if (heroStreakText) {
    heroStreakText.textContent = `${currentStreak} Day${currentStreak === 1 ? "" : "s"} Streak`;
  }
  if (pStreakCurrent) pStreakCurrent.textContent = currentStreak;
  if (pStreakHighest) pStreakHighest.textContent = highestStreak;
  if (pStreakNextMilestone) pStreakNextMilestone.textContent = nextMilestone;
  if (pStreakMilestoneDiff) {
    pStreakMilestoneDiff.textContent = remainingDays === 0 ? "Milestone Reached Today! 🔥" : `${remainingDays} day${remainingDays === 1 ? "" : "s"} remaining`;
  }
  if (pStreakSubnote) {
    if (currentStreak >= 100) pStreakSubnote.textContent = "Grand Century Streaker! Legendary laboratory dedication.";
    else if (currentStreak >= 50) pStreakSubnote.textContent = "Golden Streaker! Research mastery on full display.";
    else if (currentStreak >= 10) pStreakSubnote.textContent = "Double-Digit Streaker! Excellent laboratory consistency.";
    else if (currentStreak >= 1) pStreakSubnote.textContent = "Keep logging in daily to maintain laboratory momentum!";
    else pStreakSubnote.textContent = "Begin your daily streak by exploring the physics laboratory!";
  }
  if (streakActiveStatus) {
    const todayStr = getLocalDateString();
    if (streakData.lastLoginDate === todayStr) {
      streakActiveStatus.textContent = streakData.pendingSync ? "Recorded Offline (Pending Sync) 🔥" : "Active Today 🔥";
      streakActiveStatus.style.background = "";
    } else {
      streakActiveStatus.textContent = "Streak Inactive";
      streakActiveStatus.style.background = "rgba(148, 163, 184, 0.2)";
    }
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
  renderProfileCalendar();
}

// PROFILE TAB NAVIGATION
profileTabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const targetTab = btn.getAttribute("data-tab");
    profileTabBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    [tabOverview, tabStats, tabBadges, tabSecurity].forEach(pane => {
      if (pane) pane.classList.add("hidden");
    });

    if (targetTab === "overview" && tabOverview) tabOverview.classList.remove("hidden");
    else if (targetTab === "stats" && tabStats) tabStats.classList.remove("hidden");
    else if (targetTab === "badges" && tabBadges) tabBadges.classList.remove("hidden");
    else if (targetTab === "security" && tabSecurity) tabSecurity.classList.remove("hidden");
  });
});

// ==========================================
// PROFILE CALENDAR CONTROLLER
// ==========================================
let currentCalendarDate = new Date();

const calMonthTitle = document.getElementById("cal-month-title");
const calPrevBtn = document.getElementById("cal-prev-btn");
const calNextBtn = document.getElementById("cal-next-btn");
const calTodayBtn = document.getElementById("cal-today-btn");
const calDaysContainer = document.getElementById("profile-calendar-days");
const calTodayDateText = document.getElementById("cal-today-date-text");

function renderProfileCalendar() {
  if (!calDaysContainer || !calMonthTitle) return;

  const now = new Date();
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  calMonthTitle.textContent = `${monthNames[month]} ${year}`;

  if (calTodayDateText) {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayName = dayNames[now.getDay()];
    const todayMonth = monthNames[now.getMonth()].slice(0, 3);
    calTodayDateText.textContent = `Today: ${todayName}, ${todayMonth} ${now.getDate()}, ${now.getFullYear()}`;
  }

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  let daysHtml = "";

  // 1. Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    daysHtml += `
      <div class="cal-day other-month">
        <span class="cal-day-num">${dayNum}</span>
      </div>
    `;
  }

  // 2. Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday =
      now.getFullYear() === year &&
      now.getMonth() === month &&
      now.getDate() === day;

    daysHtml += `
      <div class="cal-day current-month ${isToday ? "today" : ""}" data-day="${day}" data-month="${month}" data-year="${year}">
        <span class="cal-day-num">${day}</span>
        ${isToday ? '<span class="cal-today-badge">TODAY</span>' : ""}
        ${isToday ? '<span class="cal-activity-dot" title="Active Lab Session Today"></span>' : ""}
      </div>
    `;
  }

  // 3. Next month leading days
  const totalSlots = firstDayIndex + daysInMonth;
  const nextMonthDays = totalSlots % 7 === 0 ? 0 : 7 - (totalSlots % 7);
  for (let day = 1; day <= nextMonthDays; day++) {
    daysHtml += `
      <div class="cal-day other-month">
        <span class="cal-day-num">${day}</span>
      </div>
    `;
  }

  calDaysContainer.innerHTML = daysHtml;

  calDaysContainer.querySelectorAll(".cal-day.current-month").forEach(dayEl => {
    dayEl.addEventListener("click", () => {
      const d = dayEl.getAttribute("data-day");
      const isDayToday = dayEl.classList.contains("today");
      showToast(isDayToday ? `Today (${monthNames[month]} ${d}, ${year}) • Simulation Lab Active` : `${monthNames[month]} ${d}, ${year} selected`);
    });
  });
}

calPrevBtn?.addEventListener("click", () => {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
  renderProfileCalendar();
});

calNextBtn?.addEventListener("click", () => {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
  renderProfileCalendar();
});

calTodayBtn?.addEventListener("click", () => {
  currentCalendarDate = new Date();
  renderProfileCalendar();
  showToast("Jumped to Today");
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
    loginEmail.value = "";
    loginPassword.value = "";

    // Check if email verification is required for email/password user
    if (isEmailVerificationRequired(userCredential.user)) {
      profileModal?.classList.add("hidden");
      showVerificationOverlay(userCredential.user);
      setVerifyBanner("Your email is not verified yet. Please check your inbox and verify your email to unlock PhysiX.", "info");
      showToast("Email verification required. Please verify your email.");
      return;
    }

    showToast(`Welcome back, ${userCredential.user.email}! Please review your student details.`);
    await completeVerifiedUserInitialization(userCredential.user);
    loadUserProfile();
    openEditProfileModal();
  } catch (error) {
    console.error("Login error:", error);
    loginErrorMsg.textContent = formatAuthError(error);
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
    
    // 1. Immediately send verification email
    try {
      await sendEmailVerification(userCredential.user);
    } catch (verifErr) {
      console.warn("sendEmailVerification error upon signup:", verifErr);
    }

    signupEmail.value = "";
    signupPassword.value = "";
    signupConfirm.value = "";

    // 2. Block main app and display verification screen
    profileModal?.classList.add("hidden");
    showVerificationOverlay(userCredential.user);
    startResendCooldown(60);
    setVerifyBanner(`We've sent a verification link to ${userCredential.user.email}. Please verify your email to activate your account.`, "info");
    showToast(`Verification email sent to ${userCredential.user.email}!`);
  } catch (error) {
    console.error("Signup error:", error);
    signupErrorMsg.textContent = formatAuthError(error);
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
    forgotErrorMsg.textContent = formatAuthError(error);
    forgotErrorMsg.classList.remove("hidden");
  }
});

// Google Sign-In Handler
async function handleGoogleSignIn() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    showToast(`Signed in with Google as ${result.user.displayName || result.user.email}!`);
    await processUserDailyStreak(result.user);
    loadUserProfile();
    openEditProfileModal();
  } catch (error) {
    console.error("Google sign-in error:", error);
    if (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-popup-request") {
      return;
    }
    const formatted = formatAuthError(error);
    showToast(formatted);
    const activeErrEl = document.querySelector("#auth-view-login:not(.hidden) #login-error-msg, #auth-view-signup:not(.hidden) #signup-error-msg");
    if (activeErrEl) {
      activeErrEl.textContent = formatted;
      activeErrEl.classList.remove("hidden");
    }
  }
}

document.querySelectorAll(".btn-google-signin").forEach((btn) => {
  btn.addEventListener("click", handleGoogleSignIn);
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
    changeErrorMsg.textContent = formatAuthError(error);
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

function formatAuthError(error) {
  if (!error) return "An unknown error occurred. Please try again.";
  const code = typeof error === "object" && error.code ? error.code : "";
  const msg = typeof error === "object" && error.message ? error.message : String(error);

  if (code === "auth/operation-not-allowed" || msg.includes("operation-not-allowed")) {
    return "Email/Password sign-in is disabled in your Firebase project. Please enable 'Email/Password' under Firebase Console > Build > Authentication > Sign-in method.";
  }
  if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found" || msg.includes("invalid-credential") || msg.includes("wrong-password") || msg.includes("user-not-found")) {
    return "Invalid email or password. If you haven't created an account yet in this Firebase project, please click the 'Create Account' tab first.";
  }
  if (code === "auth/email-already-in-use" || msg.includes("email-already-in-use")) {
    return "This email is already registered. Please sign in instead.";
  }
  if (code === "auth/invalid-email" || msg.includes("invalid-email")) {
    return "Please enter a valid email address.";
  }
  if (code === "auth/weak-password" || msg.includes("weak-password")) {
    return "Password is too weak. Must be at least 6 characters long.";
  }
  if (code === "auth/requires-recent-login" || msg.includes("requires-recent-login")) {
    return "This action requires recent login. Please log in again first.";
  }
  if (code === "auth/network-request-failed" || msg.includes("network-request-failed")) {
    return "Network connection failed. Please check your internet connection.";
  }
  if (code === "auth/too-many-requests" || msg.includes("too-many-requests")) {
    return "Access temporarily blocked due to too many failed attempts. Try again later or reset your password.";
  }
  if (code === "auth/unauthorized-domain" || msg.includes("unauthorized-domain")) {
    return "Domain Authorization Required: Please add 'physi-x-orcin.vercel.app' (and 'vercel.app') in Firebase Console > Authentication > Settings > Authorized domains.";
  }
  if (code === "auth/user-disabled" || msg.includes("user-disabled")) {
    return "This user account has been disabled by an administrator.";
  }

  const cleaned = msg.replace(/^Firebase:\s*/i, "").replace(/\s*\(auth\/[^\)]+\)\.?/i, "").trim();
  return cleaned || msg;
}

// ==========================================
// EMAIL VERIFICATION UI CONTROLLER & LISTENERS
// ==========================================
let resendCooldownInterval = null;
let resendCooldownRemaining = 0;

function showVerificationOverlay(user) {
  if (!emailVerificationModal) return;
  const email = (user && user.email) || (auth.currentUser && auth.currentUser.email) || "your email address";
  if (verifyUserEmail) {
    verifyUserEmail.textContent = email;
  }
  // Close any potentially interfering modals
  profileModal?.classList.add("hidden");
  editProfileModal?.classList.add("hidden");

  emailVerificationModal.classList.remove("hidden");
}

function hideVerificationOverlay() {
  if (!emailVerificationModal) return;
  emailVerificationModal.classList.add("hidden");
}

function setVerifyBanner(message, type = "info") {
  if (!verifyFeedbackBanner) return;
  verifyFeedbackBanner.textContent = message;
  verifyFeedbackBanner.className = `verify-feedback-banner feedback-${type}`;
  verifyFeedbackBanner.classList.remove("hidden");
}

function startResendCooldown(seconds = 60) {
  if (resendCooldownInterval) {
    clearInterval(resendCooldownInterval);
    resendCooldownInterval = null;
  }
  resendCooldownRemaining = seconds;
  if (btnVerifyResend) btnVerifyResend.disabled = true;
  if (verifyResendLabel) verifyResendLabel.textContent = `Resend in ${resendCooldownRemaining}s`;

  resendCooldownInterval = setInterval(() => {
    resendCooldownRemaining--;
    if (resendCooldownRemaining <= 0) {
      clearInterval(resendCooldownInterval);
      resendCooldownInterval = null;
      if (btnVerifyResend) btnVerifyResend.disabled = false;
      if (verifyResendLabel) verifyResendLabel.textContent = "Resend Verification Email";
    } else {
      if (verifyResendLabel) verifyResendLabel.textContent = `Resend in ${resendCooldownRemaining}s`;
    }
  }, 1000);
}

// "I've Verified My Email" Button Handler (Refresh & Check)
btnVerifyCheck?.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    setVerifyBanner("No active session found. Please sign in again.", "error");
    return;
  }

  const originalContent = btnVerifyCheck.innerHTML;
  btnVerifyCheck.disabled = true;
  btnVerifyCheck.innerHTML = `
    <svg class="svg-icon svg-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
      <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-linecap="round"></circle>
    </svg>
    <span>Checking Verification...</span>
  `;

  try {
    // 1. Force reload user from Firebase server to get fresh emailVerified state
    await reload(user);

    // 2. Inspect reloaded verification status
    if (auth.currentUser && auth.currentUser.emailVerified) {
      setVerifyBanner("Email verified successfully! Initializing PhysiX Laboratory...", "success");
      showToast("Email verified! Welcome to PhysiX.");
      setTimeout(async () => {
        hideVerificationOverlay();
        btnVerifyCheck.disabled = false;
        btnVerifyCheck.innerHTML = originalContent;
        await completeVerifiedUserInitialization(auth.currentUser);
      }, 600);
    } else {
      setVerifyBanner("Your email is not verified yet. Please check your inbox (and spam/junk folder), click the link, and try again.", "info");
      btnVerifyCheck.disabled = false;
      btnVerifyCheck.innerHTML = originalContent;
    }
  } catch (error) {
    console.error("Verification reload error:", error);
    setVerifyBanner("Unable to refresh verification status. Please check your internet connection.", "error");
    btnVerifyCheck.disabled = false;
    btnVerifyCheck.innerHTML = originalContent;
  }
});

// "Resend Verification Email" Button Handler
btnVerifyResend?.addEventListener("click", async () => {
  if (resendCooldownRemaining > 0) return;
  const user = auth.currentUser;
  if (!user) {
    setVerifyBanner("No active session found. Please sign in again.", "error");
    return;
  }

  btnVerifyResend.disabled = true;
  if (verifyResendLabel) verifyResendLabel.textContent = "Sending Email...";

  try {
    await sendEmailVerification(user);
    setVerifyBanner(`Verification link resent to ${user.email}! Please check your inbox and spam folder.`, "success");
    showToast("Verification email resent.");
    startResendCooldown(60);
  } catch (error) {
    console.error("Resend verification error:", error);
    const code = error?.code || "";
    const msg = error?.message || "";
    if (code === "auth/too-many-requests" || msg.includes("too-many-requests")) {
      setVerifyBanner("Too many requests. Please wait a minute before requesting another verification email.", "error");
      startResendCooldown(60);
    } else if (code === "auth/network-request-failed" || msg.includes("network-request-failed")) {
      setVerifyBanner("Network connection failed. Please check your internet connection.", "error");
      btnVerifyResend.disabled = false;
      if (verifyResendLabel) verifyResendLabel.textContent = "Resend Verification Email";
    } else if (code === "auth/user-token-expired" || code === "auth/requires-recent-login" || msg.includes("user-token-expired")) {
      setVerifyBanner("Your authentication session has expired. Please sign out and sign in again.", "error");
      btnVerifyResend.disabled = false;
      if (verifyResendLabel) verifyResendLabel.textContent = "Resend Verification Email";
    } else {
      setVerifyBanner(formatAuthError(error), "error");
      btnVerifyResend.disabled = false;
      if (verifyResendLabel) verifyResendLabel.textContent = "Resend Verification Email";
    }
  }
});

// "Sign Out / Use Another Account" Button Handler
btnVerifySignout?.addEventListener("click", async () => {
  try {
    if (resendCooldownInterval) {
      clearInterval(resendCooldownInterval);
      resendCooldownInterval = null;
      resendCooldownRemaining = 0;
    }
    if (btnVerifyResend) btnVerifyResend.disabled = false;
    if (verifyResendLabel) verifyResendLabel.textContent = "Resend Verification Email";

    await signOut(auth);
    hideVerificationOverlay();
    showToast("Signed out. You can sign in with another account.");
    loadUserProfile();
  } catch (error) {
    showToast(`Error signing out: ${error.message}`);
  }
});

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
  if (occInput) occInput.value = profile.college || profile.occ || "";
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
      college: occInput?.value.trim() || "",
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
  [tabOverview, tabStats, tabBadges, tabSecurity].forEach(pane => {
    if (pane) pane.classList.add("hidden");
  });
  if (tabBadges) tabBadges.classList.remove("hidden");
}

btnOpenBadgesNav?.addEventListener("click", openBadgesModal);
heroRankPill?.addEventListener("click", openBadgesModal);

export function openProfileModal(initialTab = "overview") {
  loadUserProfile();
  profileModal?.classList.remove("hidden");
  profileTabBtns.forEach(b => {
    if (b.getAttribute("data-tab") === initialTab) {
      b.classList.add("active");
    } else {
      b.classList.remove("active");
    }
  });
  [tabOverview, tabStats, tabBadges, tabSecurity].forEach(pane => {
    if (pane) pane.classList.add("hidden");
  });
  if (initialTab === "stats" && tabStats) tabStats.classList.remove("hidden");
  else if (initialTab === "badges" && tabBadges) tabBadges.classList.remove("hidden");
  else if (initialTab === "security" && tabSecurity) tabSecurity.classList.remove("hidden");
  else if (tabOverview) tabOverview.classList.remove("hidden");
}

// Profile Button click opens student profile modal
userProfileBtn?.addEventListener("click", () => {
  openProfileModal("overview");
});


// ==========================================
// QUIZ ENGINE & INTERACTIVITY (ANTI-COPY SECURED)
// ==========================================
// QUIZ ENGINE & INTERACTIVITY (MULTI-EXPERIMENT SHUFFLER)
// ==========================================
let activeQuizData = null;
const quizModalTitle = document.getElementById("quiz-modal-title");
const quizModalDesc = document.getElementById("quiz-modal-desc");
const quizBadgeHeader = document.getElementById("quiz-badge-header");
const quizCurrentNum = document.getElementById("quiz-current-num");
const quizTotalNum = document.getElementById("quiz-total-num");
const quizProgressBar = document.getElementById("quiz-progress-bar");
const quizProgressPercent = document.getElementById("quiz-progress-percent");
const quizQuestionText = document.getElementById("quiz-question-text");
const quizOptionsList = document.getElementById("quiz-options-list");
const btnQuizPrev = document.getElementById("btn-quiz-prev");
const btnQuizNext = document.getElementById("btn-quiz-next");

const quizActiveView = document.getElementById("quiz-active-view");
const quizResultsView = document.getElementById("quiz-results-view");
const quizFinalScore = document.getElementById("quiz-final-score");
const quizFinalPercent = document.getElementById("quiz-final-percent");
const quizGradeBadge = document.getElementById("quiz-grade-badge");
const quizResultsSummaryText = document.getElementById("quiz-results-summary-text");
const quizReviewList = document.getElementById("quiz-review-list");
const btnRetakeQuiz = document.getElementById("btn-retake-quiz");
const btnQuizToSim = document.getElementById("btn-quiz-to-sim");
const quizExpTabBtns = document.querySelectorAll(".quiz-exp-tab-btn");

function initQuiz(expId) {
  const chosenExp = (typeof expId === "string" && expId) ? expId : (activeExperimentId || "projectile");
  activeQuizData = generateRandom10QuestionQuiz(chosenExp);

  quizState = {
    currentQuestionIndex: 0,
    userAnswers: {},
    score: 0
  };

  // Update tabs UI
  quizExpTabBtns.forEach(btn => {
    if (btn.getAttribute("data-quiz-exp") === chosenExp) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Update Header details
  if (quizBadgeHeader) {
    if (chosenExp === "projectile") quizBadgeHeader.textContent = "MASTERY EVALUATION • EXP 1";
    else if (chosenExp === "optical") quizBadgeHeader.textContent = "MASTERY EVALUATION • EXP 2";
    else if (chosenExp === "colour-sensor") quizBadgeHeader.textContent = "MASTERY EVALUATION • EXP 3";
    else if (chosenExp === "hall-effect") quizBadgeHeader.textContent = "MASTERY EVALUATION • EXP 4";
    else if (chosenExp === "diffraction") quizBadgeHeader.textContent = "MASTERY EVALUATION • EXP 5";
    else if (chosenExp === "sandbox") quizBadgeHeader.textContent = "MASTERY EVALUATION • EXP 6";
  }

  if (quizModalTitle) {
    if (chosenExp === "projectile") {
      quizModalTitle.innerHTML = `
        <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#a855f7;">
          <circle cx="12" cy="12" r="9"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        2D Kinematics Knowledge Check (10Q)
      `;
    } else if (chosenExp === "optical") {
      quizModalTitle.innerHTML = `
        <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#06b6d4;">
          <circle cx="12" cy="12" r="9"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        Optical Fibre Numerical Aperture Quiz (10Q)
      `;
    } else if (chosenExp === "colour-sensor") {
      quizModalTitle.innerHTML = `
        <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#ec4899;">
          <circle cx="12" cy="12" r="9"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        Colour Sensor TCS3200 Quiz (10Q)
      `;
    } else if (chosenExp === "hall-effect") {
      quizModalTitle.innerHTML = `
        <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#3b82f6;">
          <circle cx="12" cy="12" r="9"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        Hall Effect & Semiconductor Physics Quiz (10Q)
      `;
    } else if (chosenExp === "diffraction") {
      quizModalTitle.innerHTML = `
        <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#a855f7;">
          <circle cx="12" cy="12" r="9"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        Diffraction Grating Spectrometry Quiz (10Q)
      `;
    } else if (chosenExp === "sandbox") {
      quizModalTitle.innerHTML = `
        <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#00f0ff;">
          <circle cx="12" cy="12" r="9"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        Physics Sandbox Newtonian Dynamics Quiz (10Q)
      `;
    }
  }

  if (quizModalDesc) {
    if (chosenExp === "projectile") {
      quizModalDesc.textContent = "Randomized 10-question evaluation sampled from 50-question 2D Kinematics bank";
    } else if (chosenExp === "optical") {
      quizModalDesc.textContent = "Randomized 10-question evaluation sampled from 50-question Optical Fibre & TIR bank";
    } else if (chosenExp === "colour-sensor") {
      quizModalDesc.textContent = "Randomized 10-question evaluation sampled from 50-question Colour Sensor & Photometry bank";
    } else if (chosenExp === "hall-effect") {
      quizModalDesc.textContent = "Randomized 10-question evaluation sampled from 50-question Hall Effect & Electromagnetism bank";
    } else if (chosenExp === "diffraction") {
      quizModalDesc.textContent = "Randomized 10-question evaluation sampled from Diffraction Grating & Multi-Slit Optics bank";
    } else if (chosenExp === "sandbox") {
      quizModalDesc.textContent = "Randomized 10-question evaluation sampled from Newtonian Rigid-Body Dynamics bank";
    }
  }

  if (quizTotalNum) quizTotalNum.textContent = activeQuizData.questions.length;
  quizActiveView?.classList.remove("hidden");
  quizResultsView?.classList.add("hidden");
  renderQuizQuestion(0);
}

function renderQuizQuestion(index) {
  if (!activeQuizData || !activeQuizData.questions[index]) return;

  quizState.currentQuestionIndex = index;
  const q = activeQuizData.questions[index];

  if (quizCurrentNum) quizCurrentNum.textContent = index + 1;
  const progressPercent = ((index + 1) / activeQuizData.questions.length) * 100;
  if (quizProgressBar) quizProgressBar.style.width = `${progressPercent}%`;
  if (quizProgressPercent) quizProgressPercent.textContent = `${Math.round(progressPercent)}%`;

  if (quizQuestionText) quizQuestionText.textContent = `${index + 1}. ${q.question}`;

  const savedAnswer = quizState.userAnswers[q.id];
  const chosenOption = savedAnswer ? savedAnswer.chosenOption : null;

  const letters = ["A", "B", "C", "D"];
  const fragment = document.createDocumentFragment();
  q.options.forEach((opt, optIdx) => {
    const card = document.createElement("div");
    card.className = `quiz-option-card${opt === chosenOption ? " selected" : ""}`;
    card.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px;">
        <span class="quiz-option-marker">${letters[optIdx]}</span>
        <span>${renderMathInText(opt)}</span>
      </div>
      <span style="font-size:18px;">${opt === chosenOption ? "●" : "○"}</span>
    `;

    card.addEventListener("click", () => handleSelectOption(q, opt));
    fragment.appendChild(card);
  });

  if (quizOptionsList) {
    quizOptionsList.innerHTML = "";
    quizOptionsList.appendChild(fragment);
  }

  // Previous Button
  if (btnQuizPrev) {
    btnQuizPrev.disabled = index === 0;
    btnQuizPrev.innerHTML = `
      <svg class="svg-icon svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
      <span>Previous Question</span>
    `;
  }

  // Next / Submit Button
  const isLastQuestion = index === activeQuizData.questions.length - 1;
  if (btnQuizNext) {
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
}

function handleSelectOption(question, chosenOption) {
  quizState.userAnswers[question.id] = { chosenOption };
  renderQuizQuestion(quizState.currentQuestionIndex);
}

// ANTI-COPY SECURITY LAYER ON QUIZ MODAL
if (quizModal) {
  quizModal.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    showToast("Right-click context menu is disabled during the quiz.");
  });

  ["copy", "cut", "dragstart"].forEach(eventName => {
    quizModal.addEventListener(eventName, (e) => {
      e.preventDefault();
      showToast("Copying quiz questions is restricted during evaluation.");
    });
  });

  quizModal.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && ["c", "x", "a", "u", "p"].includes(e.key.toLowerCase())) {
      e.preventDefault();
      showToast("Keyboard copy shortcuts are disabled during the quiz.");
    }
  });
}

// Bind Quiz Experiment Tabs
quizExpTabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const targetExp = btn.getAttribute("data-quiz-exp");
    initQuiz(targetExp);
  });
});

function showQuizResults() {
  if (!activeQuizData) return;

  quizActiveView?.classList.add("hidden");
  quizResultsView?.classList.remove("hidden");

  // Calculate final score
  let score = 0;
  const total = activeQuizData.questions.length;

  activeQuizData.questions.forEach(q => {
    const userAns = quizState.userAnswers[q.id];
    if (userAns && userAns.chosenOption === q.answer) {
      score += 1;
    }
  });
  quizState.score = score;

  const pct = Math.round((score / total) * 100);
  if (quizFinalScore) quizFinalScore.textContent = score;
  if (quizFinalPercent) quizFinalPercent.textContent = `${pct}%`;
  if (quizResultsSummaryText) {
    quizResultsSummaryText.innerHTML = `Score: <strong id="quiz-final-percent">${pct}%</strong> accuracy on ${activeQuizData.experimentName}.`;
  }

  // Grade Titles based on experiment
  if (quizGradeBadge) {
    if (pct >= 90) {
      quizGradeBadge.textContent = activeQuizData.experimentId === "projectile" ? "Kinematics Master (Outstanding)" : (activeQuizData.experimentId === "optical" ? "Photonics Virtuoso (Outstanding)" : "Spectrometry Virtuoso (Outstanding)");
      quizGradeBadge.style.color = "#fde68a";
      triggerConfetti();
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
  }

  // Populate Review List
  if (quizReviewList) {
    quizReviewList.innerHTML = "";
    activeQuizData.questions.forEach((q, i) => {
      const userAns = quizState.userAnswers[q.id];
      const userChoice = userAns ? userAns.chosenOption : "Not Answered";
      const isCorrect = userChoice === q.answer;

      const item = document.createElement("div");
      item.className = `review-item ${isCorrect ? "is-correct" : "is-incorrect"}`;
      item.innerHTML = `
        <div class="review-q">${i + 1}. ${q.question}</div>
        <div class="review-ans-row">
          <span class="review-user-ans ${isCorrect ? "" : "wrong"}">
            Your Answer: <strong>${userChoice} (${isCorrect ? "Correct ✓" : "Incorrect ✗"})</strong>
          </span>
          ${!isCorrect ? `<span class="review-correct-ans">Correct Answer: <strong>${q.answer}</strong></span>` : ""}
        </div>
        <div class="review-exp"><strong>Concept & Explanation:</strong> ${q.explanation}</div>
      `;
      quizReviewList.appendChild(item);
    });
  }

  // Save High Score and update profile telemetry
  try {
    const storageKey = `physix_quiz_highscore_${activeQuizData.experimentId}`;
    const currentHigh = Number(localStorage.getItem(storageKey) || 0);
    if (score > currentHigh) {
      localStorage.setItem(storageKey, score);
      showToast(`New ${activeQuizData.experimentName} High Score: ${score}/${total}!`);
    }
    if (!canPerformCloudOperation()) {
      console.log("[Quiz] Offline mode: quiz completed in-memory. Skipping persistence.");
      return;
    }
    localStorage.setItem("physix_quiz_highscore", Math.max(score, Number(localStorage.getItem("physix_quiz_highscore") || 0)));

    recordQuizTelemetry(score, total);
    api.submitQuiz(getActiveUserId(), quizState.userAnswers).catch(() => {});

    // Sync to Firestore users/{uid}/quizAttempts/{attemptId}
    if (auth.currentUser) {
      recordQuizAttemptInFirestore(auth.currentUser.uid, {
        quizId: activeQuizData.quizId,
        score,
        totalQuestions: total,
        percentage: pct,
        xpEarned: score * 10
      }).then(res => {
        if (res && typeof res.totalXP === "number") {
          setAuthoritativeUserXp(auth.currentUser.uid, res.totalXP);
          loadUserProfile();
        }
      }).catch(err => {
        console.warn("[Quiz Sync] Error recording quiz attempt:", err);
      });
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
  if (!isUserAuthenticated()) {
    toggleTarget.checked = false;
    simState.targetMode = false;
    targetBanner.classList.add("hidden");
    openLoginModal("Target Landing Challenge requires account sign-in. Sign in to test your artillery precision and score points!");
    return;
  }
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
  if (!isUserAuthenticated()) {
    openLoginModal("Please sign in to access Target Landing Challenge!");
    return;
  }
  spawnNewTarget(true);
});

// Simulation Action Buttons
launchButton.addEventListener("click", launchProjectile);
resetButton.addEventListener("click", resetSimulation);
btnRecordObservation?.addEventListener("click", recordCurrentObservation);
btnRecordObsTable?.addEventListener("click", recordCurrentObservation);
btnClearObservations?.addEventListener("click", clearAllObservations);
document.getElementById("btn-export-proj-csv")?.addEventListener("click", exportProjectileCsv);
document.getElementById("btn-export-proj-pdf")?.addEventListener("click", exportProjectilePdf);
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
  const total = activeQuizData ? activeQuizData.questions.length : 10;
  if (quizState.currentQuestionIndex < total - 1) {
    renderQuizQuestion(quizState.currentQuestionIndex + 1);
  } else {
    showQuizResults();
  }
});

btnRetakeQuiz.addEventListener("click", () => {
  initQuiz(activeQuizData?.experimentId || activeExperimentId || "projectile");
});

btnQuizToSim.addEventListener("click", () => {
  quizModal.classList.add("hidden");
  if (activeQuizData && activeQuizData.experimentId !== activeExperimentId) {
    switchExperiment(activeQuizData.experimentId);
  }
});

// ==========================================
// MODALS & NAVIGATION LOGIC
// ==========================================
// Quiz Modal
btnOpenQuiz?.addEventListener("click", (e) => {
  e?.preventDefault?.();
  e?.stopPropagation?.();
  try {
    if (tutorialManager && typeof tutorialManager.skipTutorial === "function" && tutorialManager.isActive) {
      tutorialManager.skipTutorial();
    }
  } catch (err) {}
  const norm = (typeof normalizeExpId === "function")
    ? normalizeExpId(activeExperimentId || "projectile")
    : (activeExperimentId || "projectile");
  initQuiz(norm);
  if (quizModal) {
    quizModal.classList.remove("hidden");
  }
});
btnCloseQuiz?.addEventListener("click", (e) => {
  e?.preventDefault?.();
  quizModal?.classList.add("hidden");
});

// Explorer Modal
btnOpenExplorer.addEventListener("click", () => {
  explorerModal.classList.remove("hidden");
});
btnCloseExplorer.addEventListener("click", () => {
  explorerModal.classList.add("hidden");
});

// Theory & Formulas Controller (Exclusive to Active Experiment)
function showTheoryForExperiment(expId) {
  const norm = (typeof normalizeExpId === "function")
    ? normalizeExpId(expId || activeExperimentId)
    : (expId || activeExperimentId || "projectile");
  const theoryPanes = {
    "projectile": document.getElementById("theory-pane-exp1"),
    "optical": document.getElementById("theory-pane-exp2"),
    "colour-sensor": document.getElementById("theory-pane-exp3"),
    "hall-effect": document.getElementById("theory-pane-exp4"),
    "diffraction": document.getElementById("theory-pane-exp5"),
    "sandbox": document.getElementById("theory-pane-exp6"),
    "diode": document.getElementById("theory-pane-exp-diode"),
    "pof-attenuation": document.getElementById("theory-pane-exp-pof")
  };

  const titles = {
    "projectile": {
      title: "Exp 1: 2D Projectile Motion — Theory & Formulas",
      desc: "Mathematical foundations used by the 2D kinematics simulation engine"
    },
    "optical": {
      title: "Exp 2: Optical Fibre NA — Theory & Formulas",
      desc: "Total internal reflection, acceptance cone, and numerical aperture formulas"
    },
    "colour-sensor": {
      title: "Exp 3: Study of Colour Sensor — Theory & Formulas",
      desc: "TCS3200 spectral response, photocurrent, and light-to-frequency conversions"
    },
    "hall-effect": {
      title: "Exp 4: Hall Effect Experiment — Theory & Formulas",
      desc: "Lorentz force, Hall voltage, carrier concentration, and mobility relationships"
    },
    "diffraction": {
      title: "Exp 5: Diffraction Grating — Theory & Formulas",
      desc: "Fraunhofer multi-slit diffraction, grating equation, and dispersion formulas"
    },
    "sandbox": {
      title: "Physics Sandbox — Theory & Formulas",
      desc: "Newtonian rigid-body mechanics, impulse momentum, and energy conservation"
    },
    "diode": {
      title: "Exp 6: Diode Characteristics — Theory & Formulas",
      desc: "Shockley equation, barrier potential, and dynamic resistance relationships"
    },
    "pof-attenuation": {
      title: "Exp 7: Plastic Optical Fiber Attenuation — Theory & Formulas",
      desc: "Bouguer-Lambert-Beer attenuation, decibel loss, and coupling loss models"
    }
  };

  Object.values(theoryPanes).forEach(pane => {
    if (pane) {
      pane.classList.add("hidden");
      pane.classList.remove("active");
    }
  });

  const activePane = theoryPanes[norm] || theoryPanes["projectile"];
  if (activePane) {
    activePane.classList.remove("hidden");
    activePane.classList.add("active");
  }

  const modalTitle = document.querySelector("#theory-modal .modal-header h2");
  const modalDesc = document.querySelector("#theory-modal .modal-header p");
  const info = titles[norm] || titles["projectile"];
  if (modalTitle) {
    modalTitle.innerHTML = `
      <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      </svg>
      ${info.title}
    `;
  }
  if (modalDesc) modalDesc.textContent = info.desc;

  // Render project-wide shared References & Further Reading inside Theory modal
  const refsContainer = document.getElementById("theory-references-container");
  if (refsContainer) {
    const data = EXPERIMENT_DETAILS[norm] || EXPERIMENT_DETAILS["projectile"] || {};
    refsContainer.innerHTML = renderReferencesHtml(data.referenceBooks || []);
  }
}

btnOpenTheory?.addEventListener("click", (e) => {
  e?.preventDefault?.();
  e?.stopPropagation?.();
  try {
    if (tutorialManager && typeof tutorialManager.skipTutorial === "function" && tutorialManager.isActive) {
      tutorialManager.skipTutorial();
    }
  } catch (err) {}
  showTheoryForExperiment(activeExperimentId);
  theoryModal?.classList.remove("hidden");
  renderMathInDOM(theoryModal);
});
btnCloseTheory?.addEventListener("click", (e) => {
  e?.preventDefault?.();
  theoryModal?.classList.add("hidden");
});

// Help & Interactive User Guide Modal
function switchHelpTab(tabIndex) {
  [btnHelpExp1, btnHelpExp2, btnHelpExp3, btnHelpExp4, btnHelpExp5, btnHelpExp6].forEach((btn, idx) => {
    if (btn) {
      if (idx === tabIndex - 1) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    }
  });

  [helpPaneExp1, helpPaneExp2, helpPaneExp3, helpPaneExp4, helpPaneExp5, helpPaneExp6].forEach((pane, idx) => {
    if (pane) {
      if (idx === tabIndex - 1) {
        pane.classList.remove("hidden");
        pane.classList.add("active");
        renderMathInElement(pane);
      } else {
        pane.classList.add("hidden");
        pane.classList.remove("active");
      }
    }
  });
}

btnHelpExp1?.addEventListener("click", () => switchHelpTab(1));
btnHelpExp2?.addEventListener("click", () => switchHelpTab(2));
btnHelpExp3?.addEventListener("click", () => switchHelpTab(3));
btnHelpExp4?.addEventListener("click", () => switchHelpTab(4));
btnHelpExp5?.addEventListener("click", () => switchHelpTab(5));
btnHelpExp6?.addEventListener("click", () => switchHelpTab(6));

function openHelpForCurrentExperiment() {
  if (!helpModal) return;

  // 1. Remove/hide experiment switcher tabs when opened from an experiment
  if (helpNavTabs) {
    helpNavTabs.classList.add("hidden");
    helpNavTabs.style.display = "none";
  }

  // 2. Hide ALL help panes to completely prevent stale content from any previous experiment
  const allPanes = document.querySelectorAll(".help-pane");
  allPanes.forEach(pane => {
    pane.classList.add("hidden");
    pane.classList.remove("active");
  });

  // 3. Resolve active experiment guide pane and header text
  const currentExp = activeExperimentId;
  let targetPane = null;
  let titleText = "PhysiX Virtual Laboratory User Guide & Operations Manual";
  let subtitleText = "Complete step-by-step instructions, interactive Control Deck breakdown, machine hardware switches, and telemetry export walkthrough";

  if (currentExp === "diode" || currentExp === "diode-vi" || currentExp === "pn-junction") {
    targetPane = helpPaneExpDiode || document.getElementById("help-pane-exp-diode");
    titleText = "Diode V-I Characteristics — Interactive User Guide & Lab Manual";
    subtitleText = "Step-by-step procedure, circuit controls breakdown, Shockley diode equations, forward/reverse bias recording, and challenge walkthrough";
  } else if (currentExp === "pof-attenuation" || currentExp === "optical-attenuation" || currentExp === "pof") {
    targetPane = helpPaneExpPof || document.getElementById("help-pane-exp-pof");
    titleText = "POF Attenuation Experiment — User Guide & Lab Manual";
    subtitleText = "Step-by-step optical power attenuation procedure, optical bench components, Bouguer-Lambert-Beer law, and challenge walkthrough";
  } else if (currentExp === "optical" || currentExp === "optical-fibre") {
    targetPane = helpPaneExp2;
    titleText = "Optical Fibre Numerical Aperture — User Guide";
    subtitleText = "Measurement of numerical aperture and normalized frequency (V-number) in multimode step-index optical fibers";
  } else if (currentExp === "colour-sensor") {
    targetPane = helpPaneExp3;
    titleText = "Colour Sensor (TCS3200) — User Guide";
    subtitleText = "Measurement of RGB spectral sensitivity and square-wave frequency output response";
  } else if (currentExp === "hall-effect") {
    targetPane = helpPaneExp4;
    titleText = "Hall Effect Virtual Laboratory — User Guide";
    subtitleText = "Determination of Hall coefficient, carrier density, charge polarity, and carrier mobility";
  } else if (currentExp === "diffraction") {
    targetPane = helpPaneExp5;
    titleText = "Diffraction Grating Spectrometer — User Guide";
    subtitleText = "Measurement of laser wavelength and line density using optical diffraction patterns";
  } else if (currentExp === "sandbox") {
    targetPane = helpPaneExp6;
    titleText = "Physics Sandbox Simulation Engine — User Guide";
    subtitleText = "Freeform physics simulation, kinematics, trajectories, and gravity experimentation";
  } else {
    targetPane = helpPaneExp1;
    titleText = "2D Projectile Motion Laboratory — User Guide";
    subtitleText = "Ballistic kinematics, launch parameters, atmospheric drag, and trajectory analysis";
  }

  // 4. Update Modal Header Title & Subtitle
  if (helpModalTitle) {
    helpModalTitle.innerHTML = `
      <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" style="color:#38bdf8;">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
      ${titleText}
    `;
  }
  if (helpModalSubtitle) {
    helpModalSubtitle.textContent = subtitleText;
  }

  // 5. Activate exclusively the target experiment guide pane
  if (targetPane) {
    targetPane.classList.remove("hidden");
    targetPane.classList.add("active");
    if (typeof renderMathInElement === "function") {
      try {
        renderMathInElement(targetPane);
      } catch (err) {
        console.warn("[Help Guide] Math rendering error:", err);
      }
    }
  }

  // 6. Reveal modal
  helpModal.classList.remove("hidden");
  if (typeof renderMathInElement === "function") {
    try {
      renderMathInElement(helpModal);
    } catch (_) {}
  }
}

btnOpenHelp?.addEventListener("click", () => {
  openHelpForCurrentExperiment();
});

btnCloseHelp?.addEventListener("click", () => {
  helpModal?.classList.add("hidden");
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

function getLiveSimulationContext() {
  if (activeExperimentId === "hall-effect" && hallEffectExperimentInstance) {
    const hState = hallEffectExperimentInstance.getState ? hallEffectExperimentInstance.getState() : {};
    const rhVal = typeof hState.hallCoeff === "number" ? hState.hallCoeff.toExponential(3) : "0.00e0";
    const nVal = typeof hState.carrierDensity === "number" ? hState.carrierDensity.toExponential(3) : "0.00e0";
    return {
      experiment: "Hall Effect Experiment",
      activeLab: "Determination of Hall Coefficient, Carrier Type, and Mobility",
      specimen: hState.specimenName || "n-type Germanium",
      specimenType: hState.carrierType || "electrons",
      sampleCurrentMa: hState.currentMa || 0,
      magneticFieldTesla: typeof hState.magneticFieldT === "number" ? hState.magneticFieldT.toFixed(4) : "0.0000",
      hallVoltageMv: typeof hState.hallVoltageMv === "number" ? hState.hallVoltageMv.toFixed(3) : "0.000",
      hallCoefficientRh: rhVal + " m³/C",
      carrierConcentrationN: nVal + " m⁻³",
      powerSupplyOn: !!hState.specimenPowerOn,
      magnetPowerOn: !!hState.magnetPowerOn
    };
  }

  if (activeExperimentId === "colour-sensor" && colourSensorExperimentInstance) {
    const csState = colourSensorExperimentInstance.getState();
    return {
      experiment: "Study of Colour Sensor",
      activeLab: "Study of Colour Sensor & Spectral Photodiode Response",
      powerSupplyOn: csState.powerSupplyOn,
      ledArrayActive: csState.ledArrayActive,
      scaling: csState.scaling,
      filterChannel: csState.filterChannel,
      distanceMm: csState.distanceMm,
      outputFrequencyKhz: csState.currentOutputFrequency,
      freqRed: csState.freqRed,
      freqGreen: csState.freqGreen,
      freqBlue: csState.freqBlue,
      freqClear: csState.freqClear,
      detectedHex: csState.reconHex,
      matchFidelityPct: csState.matchFidelityPct,
      activeSwatch: csState.activeSwatch,
      observationsCount: csState.observationsCount
    };
  }

  if (activeExperimentId === "diffraction" && diffractionExperimentInstance) {
    const dgState = diffractionExperimentInstance.getState();
    const density = dgState.gratingDensityLpMm || dgState.linesPerMm || 600;
    const theta = dgState.currentAngleDeg ?? dgState.currentThetaDeg ?? 19.27;
    const yPos = dgState.currentFringePositionCm ?? dgState.currentYPosCm ?? 34.96;
    return {
      experiment: "Diffraction Grating",
      activeLab: "Diffraction Grating Principal Maxima & Wavelength",
      wavelengthNm: dgState.wavelengthNm || 550,
      linesPerMm: density,
      gratingSpacingD: dgState.gratingSpacingD || (1 / (density * 1000)),
      screenDistanceM: dgState.screenDistanceM || 1.00,
      selectedOrder: dgState.selectedOrder ?? 1,
      thetaDeg: Number(theta),
      yPosCm: Number(yPos),
      dispersion: dgState.currentDispersion || 0,
      maxOrder: dgState.maxObservableOrder || 3,
      isMysteryMode: !!dgState.isMysteryMode,
      observationsCount: Array.isArray(dgState.observations) ? dgState.observations.length : 0
    };
  }

  if ((activeExperimentId === "diode" || activeExperimentId === "diode-vi") && diodeExperimentInstance) {
    const dState = diodeExperimentInstance.getState();
    return {
      experiment: "Diode V-I Characteristics",
      activeLab: "Voltage-Current Characteristics of Forward and Reverse Biased P-N Junction Diode",
      mode: dState.mode,
      powerOn: dState.powerOn,
      circuitValid: dState.circuitValid,
      forwardVoltage: dState.vf,
      reverseVoltage: dState.vr,
      forwardCurrentMa: dState.ifMa,
      reverseCurrentUa: dState.irUa,
      voltmeterRange: dState.vRange,
      ammeterRange: dState.iRange,
      observationsCount: dState.observationsCount
    };
  }

  if (activeExperimentId === "sandbox") {
    return {
      experiment: "Physics Sandbox",
      activeLab: "Physics Sandbox & 2D Kinematics Playground"
    };
  }

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
  if (ctx.experiment === "Diffraction Grating") {
    if (aiCtxV0) aiCtxV0.textContent = `λ: ${ctx.wavelengthNm || 550} nm`;
    if (aiCtxAngle) aiCtxAngle.textContent = `N: ${ctx.linesPerMm || 600} L/mm`;
    const orderStr = ctx.selectedOrder === "all" ? "All" : (Number(ctx.selectedOrder) > 0 ? `+${ctx.selectedOrder}` : `${ctx.selectedOrder ?? 1}`);
    if (aiCtxH0) aiCtxH0.textContent = `m: ${orderStr}`;
    const thetaVal = typeof ctx.thetaDeg === "number" ? ctx.thetaDeg : 0;
    if (aiCtxG) aiCtxG.textContent = `θ: ${thetaVal.toFixed(2)}°`;
  } else if (ctx.experiment === "Study of Colour Sensor") {
    if (aiCtxV0) aiCtxV0.textContent = `d: ${Number(ctx.distanceMm || 12).toFixed(1)} mm`;
    if (aiCtxAngle) aiCtxAngle.textContent = `Filter: ${(ctx.filterChannel || "clear").toUpperCase()}`;
    if (aiCtxH0) aiCtxH0.textContent = `f: ${Number(ctx.outputFrequencyKhz || 0).toFixed(1)} kHz`;
    if (aiCtxG) aiCtxG.textContent = `Match: ${ctx.matchFidelityPct || 0}% (${ctx.detectedHex || "#000000"})`;
  } else if (ctx.experiment === "Optical Fibre Numerical Aperture") {
    if (aiCtxV0) aiCtxV0.textContent = `L: ${Number(ctx.distanceL || 2).toFixed(1)} cm`;
    if (aiCtxAngle) aiCtxAngle.textContent = `W: ${Number(ctx.spotDiameterW || 1.88).toFixed(2)} cm`;
    if (aiCtxH0) aiCtxH0.textContent = `NA: ${Number(ctx.numericalApertureNA || 0.426).toFixed(4)}`;
    if (aiCtxG) aiCtxG.textContent = `θ_a: ${Number(ctx.acceptanceAngleDeg || 25.2).toFixed(1)}°`;
  } else if (ctx.experiment === "Physics Sandbox") {
    if (aiCtxV0) aiCtxV0.textContent = "Mode: Sandbox";
    if (aiCtxAngle) aiCtxAngle.textContent = "Bodies: 2D Rigid";
    if (aiCtxH0) aiCtxH0.textContent = "Engine: Verlet";
    if (aiCtxG) aiCtxG.textContent = "Physics: Active";
  } else {
    if (aiCtxV0) aiCtxV0.textContent = `v₀: ${Number(ctx.v0 || 20).toFixed(1)} m/s`;
    if (aiCtxAngle) aiCtxAngle.textContent = `θ: ${ctx.angleDeg || 45}°`;
    if (aiCtxH0) aiCtxH0.textContent = `h₀: ${Number(ctx.h0 || 0).toFixed(1)} m`;
    if (aiCtxG) aiCtxG.textContent = `g: ${Number(ctx.g || 9.8).toFixed(1)} m/s² (${ctx.planet || "Earth"})`;
  }
}

async function updateAiServerStatus() {
  if (!aiLiveBadge) return;
  if (!canPerformCloudOperation()) {
    aiLiveBadge.textContent = "○ Vectra Offline";
    aiLiveBadge.style.color = "#94a3b8";
    return;
  }
  const isAuth = isUserAuthenticated();
  if (!isAuth) {
    const used = getGuestAiMessageCount();
    const remaining = Math.max(0, GUEST_AI_MAX_MESSAGES - used);
    aiLiveBadge.innerHTML = `<span style="color:#fbbf24; font-weight:700;">● Guest: ${remaining}/${GUEST_AI_MAX_MESSAGES} msgs left</span>`;
    return;
  }
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

function updateAiSuggestionChipsForExperiment() {
  const container = document.querySelector(".ai-suggestions-container");
  if (!container) return;

  let chips = [];
  if (activeExperimentId === "diffraction") {
    chips = [
      { text: "🌈 Grating Equation", prompt: "Explain the diffraction grating equation d sin(theta) = m lambda and how to compute wavelength" },
      { text: "🔬 Calculate Wavelength", prompt: "How do I calculate laser wavelength from diffraction angle and grating density?" },
      { text: "📊 Angular Dispersion", prompt: "What is angular dispersion D and how does grating ruling density N affect it?" },
      { text: "🧪 Mystery Gas Tube", prompt: "How do I identify unknown gas specimens in the Mystery Gas Tube challenge?" },
      { text: "📖 Lab Operation Guide", prompt: "Give me step-by-step instructions on how to use the Diffraction Grating spectrometer" },
      { text: "👨‍💻 About Authors", prompt: "Who built this website?" }
    ];
  } else if (activeExperimentId === "colour-sensor") {
    chips = [
      { text: "🌈 Tristimulus Principles", prompt: "How does the TCS3200 photodiode array convert light to frequency?" },
      { text: "🔍 S2/S3 Filter Channels", prompt: "Explain the S2 and S3 pin filter selection truth table" },
      { text: "📐 Inverse-Square Law", prompt: "How does standoff distance affect TCS3200 output frequency?" },
      { text: "🧪 Mystery Sample Challenge", prompt: "How do I decode the unknown specimen in the Spectroscopic Detective challenge?" },
      { text: "📖 Lab Operation Guide", prompt: "How to operate the Colour Sensor experiment step by step?" },
      { text: "👨‍💻 About Authors", prompt: "Who built this website?" }
    ];
  } else if (activeExperimentId === "optical") {
    chips = [
      { text: "💡 Numerical Aperture Formula", prompt: "Explain the formula NA = W / sqrt(4L^2 + W^2) and acceptance angle" },
      { text: "🔴 Wavelength Presets", prompt: "How does laser wavelength affect beam propagation through optical fibre?" },
      { text: "⏱️ Rapid Calibration", prompt: "How do I complete the 40s Rapid Calibration Challenge?" },
      { text: "📖 Lab Operation Guide", prompt: "How to operate the Numerical Aperture of Optical Fibre experiment step by step?" },
      { text: "👨‍💻 About Authors", prompt: "Who built this website?" }
    ];
  } else if (activeExperimentId === "sandbox") {
    chips = [
      { text: "⚛️ Newtonian Playground", prompt: "How does the 2D physics sandbox engine work?" },
      { text: "🚀 Dynamic Thrust Challenge", prompt: "How do I complete Newton's Dynamic Thrust challenge in the sandbox?" },
      { text: "💥 High-Impulse Kick", prompt: "How do I apply impulse forces to rigid bodies in the sandbox?" },
      { text: "📖 Sandbox Guide", prompt: "Give me a guide on how to use all sandbox tools and controls" },
      { text: "👨‍💻 About Authors", prompt: "Who built this website?" }
    ];
  } else {
    chips = [
      { text: "🎯 Hit Target Solution", prompt: "How do I hit the target with my current velocity?" },
      { text: "📐 Why 45° Max Range?", prompt: "Explain why 45 degrees gives the maximum range" },
      { text: "🌕 Moon vs Earth", prompt: "How does launching on the Moon compare to Earth?" },
      { text: "⏱️ Derive Flight Time", prompt: "Derive the formula for time of flight" },
      { text: "📊 Flight Telemetry Debrief", prompt: "Analyze the kinematics of my latest flight" },
      { text: "👨‍💻 About Authors", prompt: "Who built this website?" }
    ];
  }

  container.innerHTML = chips
    .map(c => `<button type="button" class="ai-suggestion-chip" data-prompt="${c.prompt}">${c.text}</button>`)
    .join("");

  container.querySelectorAll(".ai-suggestion-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const prompt = chip.getAttribute("data-prompt");
      if (prompt) handleSendAiChat(prompt);
    });
  });
}

function openAiCopilot() {
  updateAiContextStrip();
  updateAiServerStatus();
  updateAiSuggestionChipsForExperiment();
  aiCopilotModal?.classList.remove("hidden");
  setTimeout(() => aiChatInput?.focus(), 100);
}

function closeAiCopilot() {
  aiCopilotModal?.classList.add("hidden");
}

function formatMarkdownToHtml(markdownText) {
  return formatMarkdownWithMath(markdownText);
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

  if (!canPerformCloudOperation()) {
    if (aiChatInput) aiChatInput.value = "";
    appendAiMessage("user", message);
    appendAiMessage("bot", "Vectra AI is currently unavailable offline. An active internet connection is required for cloud physics intelligence. All simulators, experiments, formulas, and sandbox controls remain fully operational offline!");
    return;
  }

  const isAuth = isUserAuthenticated();
  if (!isAuth) {
    const used = getGuestAiMessageCount();
    if (used >= GUEST_AI_MAX_MESSAGES) {
      openLoginModal(`Guest Limit Reached: You have used all ${GUEST_AI_MAX_MESSAGES} free Vectra AI messages. Sign in or create an account for unlimited AI physics assistance!`);
      return;
    }
    incrementGuestAiMessageCount();
    updateAiServerStatus();
  }

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
[explorerModal, theoryModal, profileModal, quizModal, editProfileModal, aiCopilotModal, legalModal].forEach(modal => {
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
    helpModal?.classList.add("hidden");
    profileModal?.classList.add("hidden");
    quizModal?.classList.add("hidden");
    editProfileModal?.classList.add("hidden");
    aiCopilotModal?.classList.add("hidden");
    legalModal?.classList.add("hidden");
  }
});

// ==========================================
// EXPERIMENT SWITCHER CONTROLLER
// ==========================================
const expProjSection = document.getElementById("exp-projectile-section");
const expOptSection = document.getElementById("exp-optical-section");
const expColourSection = document.getElementById("exp-colour-sensor-section");
const expHallSection = document.getElementById("exp-hall-effect-section");
const expSandboxSection = document.getElementById("exp-sandbox-section");
const expDiffractionSection = document.getElementById("exp-diffraction-section");
const expDiodeSection = document.getElementById("exp-diode-section");
const expPofSection = document.getElementById("exp-pof-attenuation-section");
let pofExperimentInstance = null;

async function trackExperimentEngagement(expId) {
  if (!canPerformCloudOperation()) return;
  const userId = getActiveUserId();
  const isAuth = !!auth.currentUser;

  let currentCount = 0;
  if (isAuth) {
    try {
      const res = await recordExperimentActivity(auth.currentUser.uid, expId, {
        experimentName: getExperimentNameById(expId)
      });
      if (res && typeof res.experimentsPerformed === "number") {
        currentCount = res.experimentsPerformed;
        const stats = getStoredTelemetry();
        stats.totalLaunches = Math.max(stats.totalLaunches || 0, currentCount);
        saveStoredTelemetry(stats);
      }
    } catch (err) {
      console.warn("[Experiment Activity] Sync notice:", err);
    }
  } else {
    const guestKey = "physix_guest_experiment_count";
    currentCount = (Number(localStorage.getItem(guestKey)) || 0) + 1;
    localStorage.setItem(guestKey, String(currentCount));
    const stats = getStoredTelemetry();
    stats.totalLaunches = Math.max(stats.totalLaunches || 0, currentCount);
    saveStoredTelemetry(stats);
  }

  console.log(`[Experiment Activity] Current activity count: ${currentCount} (exp: ${expId})`);

  // Check 5-use milestone badge threshold
  const BADGE_THRESHOLD = 5;
  const isEligible = currentCount >= BADGE_THRESHOLD;
  console.log(`[Badge] Badge eligibility result for 'badge-lab-veteran': eligible = ${isEligible} (${currentCount}/${BADGE_THRESHOLD})`);

  if (isEligible) {
    unlockBadge("badge-lab-veteran", "Laboratory Veteran (Explored Labs 5+ Times)");
  }
}

function switchExperiment(expId, updateUrl = true) {
  window.switchExperiment = switchExperiment;
  let normalizedId = expId;
  if (expId === "pof-attenuation" || expId === "optical-attenuation" || expId === "pof") normalizedId = "pof-attenuation";
  else if (expId === "diode" || expId === "diode-vi" || expId === "pn-junction") normalizedId = "diode";
  else if (expId === "diffraction-grating") normalizedId = "diffraction";
  else if (expId === "optical-fibre") normalizedId = "optical";
  else if (expId === "physics-sandbox") normalizedId = "sandbox";

  activeExperimentId = normalizedId;
  trackExperimentEngagement(normalizedId);

  expProjSection?.classList.add("hidden");
  expOptSection?.classList.add("hidden");
  expColourSection?.classList.add("hidden");
  expHallSection?.classList.add("hidden");
  expSandboxSection?.classList.add("hidden");
  expDiffractionSection?.classList.add("hidden");
  expDiodeSection?.classList.add("hidden");
  expPofSection?.classList.add("hidden");

  const routeSlug = normalizedId === "pof-attenuation"
    ? "pof-attenuation"
    : (normalizedId === "diode"
      ? "diode-vi"
      : (normalizedId === "diffraction"
        ? "diffraction-grating"
        : (normalizedId === "optical" ? "optical-fibre" : normalizedId)));

  if (updateUrl && !document.body.classList.contains("on-homepage")) {
    const targetUrl = `/simulations/${routeSlug}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({}, "", targetUrl);
    }
  }

  if (normalizedId === "diffraction") {
    expDiffractionSection?.classList.remove("hidden");

    if (!diffractionExperimentInstance) {
      diffractionExperimentInstance = createDiffractionGratingExperiment({
        onXpAwarded: (amount, reason) => addStudentXp(amount, reason),
        onExperimentRecorded: (id, data) => {
          if (auth.currentUser && canPerformCloudOperation()) {
            recordExperimentInFirestore(auth.currentUser.uid, id, data).then(res => {
              if (res && typeof res.totalXP === "number") {
                setAuthoritativeUserXp(auth.currentUser.uid, res.totalXP);
                loadUserProfile();
              }
              if (res && res.experimentsPerformed >= 5) {
                unlockBadge("badge-lab-veteran", "Laboratory Veteran (Explored Labs 5+ Times)");
              }
            }).catch(() => {});
          }
        },
        showToast,
        getActiveUserId,
        loadUserProfile,
        getStoredUserProfile,
        unlockBadge: (badgeId, badgeName) => unlockBadge(badgeId, badgeName),
        isUserAuthenticated,
        openLoginModal,
        onChallengeCompleted: (data) => completeChallengeAuthoritatively(data)
      });
      diffractionExperimentInstance.init();
      if (activeAuthoritativeCompletedChallenges.length > 0 && typeof diffractionExperimentInstance.hydrateChallenges === "function") {
        diffractionExperimentInstance.hydrateChallenges(activeAuthoritativeCompletedChallenges);
      }
    } else {
      if (activeAuthoritativeCompletedChallenges.length > 0 && typeof diffractionExperimentInstance.hydrateChallenges === "function") {
        diffractionExperimentInstance.hydrateChallenges(activeAuthoritativeCompletedChallenges);
      }
      diffractionExperimentInstance.renderAll();
    }

    showToast("Switched to Exp 4: Diffraction Grating");
  } else if (normalizedId === "sandbox") {
    expSandboxSection?.classList.remove("hidden");

    if (!physicsSandboxExperimentInstance) {
      physicsSandboxExperimentInstance = createPhysicsSandboxExperiment({
        onXpAwarded: (amount, reason) => addStudentXp(amount, reason),
        showToast,
        getActiveUserId,
        loadUserProfile,
        getStoredUserProfile,
        unlockBadge: (badgeId, badgeName) => unlockBadge(badgeId, badgeName),
        isUserAuthenticated,
        openLoginModal,
        onChallengeCompleted: (data) => completeChallengeAuthoritatively(data)
      });
      physicsSandboxExperimentInstance.init();
      if (activeAuthoritativeCompletedChallenges.length > 0 && typeof physicsSandboxExperimentInstance.hydrateChallenges === "function") {
        physicsSandboxExperimentInstance.hydrateChallenges(activeAuthoritativeCompletedChallenges);
      }
    } else {
      if (activeAuthoritativeCompletedChallenges.length > 0 && typeof physicsSandboxExperimentInstance.hydrateChallenges === "function") {
        physicsSandboxExperimentInstance.hydrateChallenges(activeAuthoritativeCompletedChallenges);
      }
      physicsSandboxExperimentInstance.renderAll();
      if (physicsSandboxExperimentInstance.renderChallengesDom) {
        physicsSandboxExperimentInstance.renderChallengesDom();
      }
    }

    showToast("Switched to Exp 6: Physics Sandbox");
  } else if (normalizedId === "hall-effect") {
    expHallSection?.classList.remove("hidden");

    if (!hallEffectExperimentInstance) {
      hallEffectExperimentInstance = createHallEffectExperiment({
        onXpAwarded: (amount, reason) => addStudentXp(amount, reason),
        onExperimentRecorded: (id, data) => {
          if (auth.currentUser && canPerformCloudOperation()) {
            recordExperimentInFirestore(auth.currentUser.uid, id, data).then(res => {
              if (res && typeof res.totalXP === "number") {
                setAuthoritativeUserXp(auth.currentUser.uid, res.totalXP);
                loadUserProfile();
              }
              if (res && res.experimentsPerformed >= 5) {
                unlockBadge("badge-lab-veteran", "Laboratory Veteran (Explored Labs 5+ Times)");
              }
            }).catch(() => {});
          }
        },
        showToast,
        getActiveUserId,
        loadUserProfile,
        getStoredUserProfile,
        unlockBadge: (badgeId, badgeName) => unlockBadge(badgeId, badgeName),
        isUserAuthenticated,
        openLoginModal,
        onChallengeCompleted: (data) => completeChallengeAuthoritatively(data)
      });
      hallEffectExperimentInstance.init();
      if (activeAuthoritativeCompletedChallenges.length > 0 && typeof hallEffectExperimentInstance.hydrateChallenges === "function") {
        hallEffectExperimentInstance.hydrateChallenges(activeAuthoritativeCompletedChallenges);
      }
    } else {
      if (activeAuthoritativeCompletedChallenges.length > 0 && typeof hallEffectExperimentInstance.hydrateChallenges === "function") {
        hallEffectExperimentInstance.hydrateChallenges(activeAuthoritativeCompletedChallenges);
      }
      hallEffectExperimentInstance.renderAll();
    }

    showToast("Switched to Exp 4: Hall Effect Experiment");
  } else if (normalizedId === "colour-sensor") {
    expColourSection?.classList.remove("hidden");

    if (!colourSensorExperimentInstance) {
      colourSensorExperimentInstance = createColourSensorExperiment({
        onXpAwarded: (amount, reason) => addStudentXp(amount, reason),
        onExperimentRecorded: (id, data) => {
          if (auth.currentUser && canPerformCloudOperation()) {
            recordExperimentInFirestore(auth.currentUser.uid, id, data).then(res => {
              if (res && typeof res.totalXP === "number") {
                setAuthoritativeUserXp(auth.currentUser.uid, res.totalXP);
                loadUserProfile();
              }
              if (res && res.experimentsPerformed >= 5) {
                unlockBadge("badge-lab-veteran", "Laboratory Veteran (Explored Labs 5+ Times)");
              }
            }).catch(() => {});
          }
        },
        showToast,
        getActiveUserId,
        loadUserProfile,
        getStoredUserProfile,
        unlockBadge: (badgeId, badgeName) => unlockBadge(badgeId, badgeName),
        isUserAuthenticated,
        openLoginModal,
        onChallengeCompleted: (data) => completeChallengeAuthoritatively(data)
      });
      colourSensorExperimentInstance.init();
      if (activeAuthoritativeCompletedChallenges.length > 0 && typeof colourSensorExperimentInstance.hydrateChallenges === "function") {
        colourSensorExperimentInstance.hydrateChallenges(activeAuthoritativeCompletedChallenges);
      }
    } else {
      if (activeAuthoritativeCompletedChallenges.length > 0 && typeof colourSensorExperimentInstance.hydrateChallenges === "function") {
        colourSensorExperimentInstance.hydrateChallenges(activeAuthoritativeCompletedChallenges);
      }
      colourSensorExperimentInstance.renderAll();
    }

    showToast("Switched to Exp 3: Study of Colour Sensor");
  } else if (normalizedId === "optical") {
    expOptSection?.classList.remove("hidden");

    if (!opticalExperimentInstance) {
      opticalExperimentInstance = createOpticalFibreExperiment({
        onXpAwarded: (amount, reason) => addStudentXp(amount, reason),
        onExperimentRecorded: (id, data) => {
          if (auth.currentUser && canPerformCloudOperation()) {
            recordExperimentInFirestore(auth.currentUser.uid, id, data).then(res => {
              if (res && typeof res.totalXP === "number") {
                setAuthoritativeUserXp(auth.currentUser.uid, res.totalXP);
                loadUserProfile();
              }
              if (res && res.experimentsPerformed >= 5) {
                unlockBadge("badge-lab-veteran", "Laboratory Veteran (Explored Labs 5+ Times)");
              }
            }).catch(() => {});
          }
        },
        showToast,
        getActiveUserId,
        loadUserProfile,
        getStoredUserProfile,
        unlockBadge: (badgeId, badgeName) => unlockBadge(badgeId, badgeName),
        isUserAuthenticated,
        openLoginModal,
        onChallengeCompleted: (data) => completeChallengeAuthoritatively(data)
      });
      opticalExperimentInstance.init();
      if (activeAuthoritativeCompletedChallenges.length > 0 && typeof opticalExperimentInstance.hydrateChallenges === "function") {
        opticalExperimentInstance.hydrateChallenges(activeAuthoritativeCompletedChallenges);
      }
    } else {
      if (activeAuthoritativeCompletedChallenges.length > 0 && typeof opticalExperimentInstance.hydrateChallenges === "function") {
        opticalExperimentInstance.hydrateChallenges(activeAuthoritativeCompletedChallenges);
      }
      opticalExperimentInstance.renderAll();
    }

    showToast("Switched to Exp 2: Numerical Aperture of Optical Fibre");
  } else if (normalizedId === "diode") {
    expDiodeSection?.classList.remove("hidden");

    if (!diodeExperimentInstance) {
      diodeExperimentInstance = createDiodeExperiment({
        onXpAwarded: (amount, reason) => addStudentXp(amount, reason),
        onExperimentRecorded: (id, data) => {
          if (auth.currentUser && canPerformCloudOperation()) {
            recordExperimentInFirestore(auth.currentUser.uid, id, data).then(res => {
              if (res && typeof res.totalXP === "number") {
                setAuthoritativeUserXp(auth.currentUser.uid, res.totalXP);
                loadUserProfile();
              }
              if (res && res.experimentsPerformed >= 5) {
                unlockBadge("badge-lab-veteran", "Laboratory Veteran (Explored Labs 5+ Times)");
              }
            }).catch(() => {});
          }
        },
        showToast,
        getActiveUserId,
        loadUserProfile,
        getStoredUserProfile,
        unlockBadge: (badgeId, badgeName) => unlockBadge(badgeId, badgeName),
        isUserAuthenticated,
        openLoginModal,
        onChallengeCompleted: (data) => completeChallengeAuthoritatively(data)
      });
      diodeExperimentInstance.init();
      if (activeAuthoritativeCompletedChallenges.length > 0 && typeof diodeExperimentInstance.hydrateChallenges === "function") {
        diodeExperimentInstance.hydrateChallenges(activeAuthoritativeCompletedChallenges);
      }
    } else {
      if (activeAuthoritativeCompletedChallenges.length > 0 && typeof diodeExperimentInstance.hydrateChallenges === "function") {
        diodeExperimentInstance.hydrateChallenges(activeAuthoritativeCompletedChallenges);
      }
      diodeExperimentInstance.renderAll();
    }

    showToast("Switched to Exp 6: Diode Characteristics");
  } else if (normalizedId === "pof-attenuation") {
    expPofSection?.classList.remove("hidden");

    if (!pofExperimentInstance) {
      pofExperimentInstance = createPofAttenuationExperiment({
        onXpAwarded: (amount, reason) => addStudentXp(amount, reason),
        onExperimentRecorded: (id, data) => {
          if (auth.currentUser && canPerformCloudOperation()) {
            recordExperimentInFirestore(auth.currentUser.uid, id, data).then(res => {
              if (res && typeof res.totalXP === "number") {
                setAuthoritativeUserXp(auth.currentUser.uid, res.totalXP);
                loadUserProfile();
              }
              if (res && res.experimentsPerformed >= 5) {
                unlockBadge("badge-lab-veteran", "Laboratory Veteran (Explored Labs 5+ Times)");
              }
            }).catch(() => {});
          }
        },
        showToast,
        getActiveUserId,
        loadUserProfile,
        getStoredUserProfile,
        unlockBadge: (badgeId, badgeName) => unlockBadge(badgeId, badgeName),
        isUserAuthenticated,
        openLoginModal,
        onChallengeCompleted: (data) => completeChallengeAuthoritatively(data)
      });
      pofExperimentInstance.init();
      window.pofExperimentInstance = pofExperimentInstance;
      if (activeAuthoritativeCompletedChallenges.length > 0 && typeof pofExperimentInstance.hydrateChallenges === "function") {
        pofExperimentInstance.hydrateChallenges(activeAuthoritativeCompletedChallenges);
      }
    } else {
      if (activeAuthoritativeCompletedChallenges.length > 0 && typeof pofExperimentInstance.hydrateChallenges === "function") {
        pofExperimentInstance.hydrateChallenges(activeAuthoritativeCompletedChallenges);
      }
      pofExperimentInstance.renderAll();
    }

    showToast("Switched to Exp 7: Plastic Optical Fiber Attenuation");
  } else {
    expProjSection?.classList.remove("hidden");

    showToast("Switched to Exp 1: 2D Projectile Motion");
  }

  updateAiContextStrip();

  // Automatic first-time interactive guided onboarding tour
  tutorialManager.maybeTriggerFirstTimeTutorial(normalizedId);
  renderMathInDOM(document.body); // Update math on experiment switch
}
window.switchExperiment = switchExperiment;

// ==========================================
// LAB & EXPERIMENT CARDS INTERACTION & WHITE LIGHT EFFECT
// ==========================================
const allExperimentCards = document.querySelectorAll(".lab-card, .concept-card");
allExperimentCards.forEach(card => {
  card.addEventListener("click", (e) => {
    // If the click was on the bookmark button, do not launch
    if (e.target.closest(".card-bookmark-btn")) return;

    const target = card.getAttribute("data-exp-target");
    const name = card.getAttribute("data-name") || "";

    let expId = null;
    if (target === "pof-attenuation" || target === "pof" || name.toLowerCase().includes("attenuation") || name.toLowerCase().includes("plastic optical fiber")) expId = "pof-attenuation";
    else if (target === "diode" || target === "diode-vi" || name.toLowerCase().includes("diode") || name.toLowerCase().includes("p-n junction")) expId = "diode";
    else if (target === "diffraction" || target === "diffraction-grating" || name.toLowerCase().includes("diffraction")) expId = "diffraction-grating";
    else if (target === "hall-effect" || name.toLowerCase().includes("hall effect")) expId = "hall-effect";
    else if (target === "sandbox" || name.toLowerCase().includes("sandbox")) expId = "sandbox";
    else if (target === "colour-sensor" || name.toLowerCase().includes("colour sensor")) expId = "colour-sensor";
    else if (target === "optical" || name.toLowerCase().includes("optical fibre")) expId = "optical";
    else if (target === "projectile" || card.classList.contains("active-lab") || name.toLowerCase().includes("projectile")) expId = "projectile";

    if (expId) {
      explorerModal?.classList.add("hidden");
      navigateTo(`/experiment/${expId}`);
    } else {
      showToast(`${name || "This experiment"} is currently in calibration. Full module coming soon!`);
    }
  });
});

// Interactive Bookmarks Controller
const savedBookmarkList = JSON.parse(localStorage.getItem("physix_bookmarked_labs") || "[]");
const bookmarkedSet = new Set(savedBookmarkList);

document.querySelectorAll(".card-bookmark-btn").forEach(btn => {
  const card = btn.closest(".lab-card, .concept-card");
  const labName = card?.getAttribute("data-name") || "lab";
  if (bookmarkedSet.has(labName)) {
    btn.classList.add("bookmarked");
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isNowBookmarked = btn.classList.toggle("bookmarked");
    if (isNowBookmarked) {
      bookmarkedSet.add(labName);
      showToast(`Bookmarked: ${labName}`);
    } else {
      bookmarkedSet.delete(labName);
      showToast(`Removed bookmark: ${labName}`);
    }
    localStorage.setItem("physix_bookmarked_labs", JSON.stringify([...bookmarkedSet]));
  });
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

  // Update Colour Sensor (Exp 3) simulation canvases
  if (colourSensorExperimentInstance) {
    colourSensorExperimentInstance.renderAll();
  }

  // Update Physics Sandbox (Exp 4) simulation canvases & graphs
  if (physicsSandboxExperimentInstance) {
    physicsSandboxExperimentInstance.renderAll();
  }

  // Update Diffraction Grating (Exp 5) simulation canvases
  if (diffractionExperimentInstance) {
    diffractionExperimentInstance.renderAll();
  }
  // Update Hall Effect (Exp 4) simulation canvases
  if (hallEffectExperimentInstance) {
    hallEffectExperimentInstance.renderAll();
  }

  // Update math rendering on theme toggle
  renderMathInDOM(document.body); // Update math on theme toggle
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
// AUTH STATE SYNCHRONIZATION & GUEST RESTRICTIONS
// ==========================================
function updateAuthStateRestrictions() {
  const isAuth = isUserAuthenticated();

  // Reset Target Challenge Mode for guests
  if (!isAuth && simState.targetMode) {
    simState.targetMode = false;
    if (toggleTarget) toggleTarget.checked = false;
    if (targetBanner) targetBanner.classList.add("hidden");
  }

  // Re-render challenges across all experiments
  renderChallenges();

  const challengesCardExp2 = document.querySelector("#exp-optical-section .challenges-card");
  const challengesCardExp3 = document.querySelector("#exp-colour-sensor-section .challenges-card");
  const challengesCardExp4 = document.querySelector("#exp-hall-effect-section .challenges-card");
  const challengesCardExp5 = document.querySelector("#exp-diffraction-section .challenges-card");
  const challengesCardExp6 = document.querySelector("#exp-diode-section .challenges-card");
  if (isAuth) {
    challengesCardExp2?.classList.remove("challenges-locked");
    challengesCardExp3?.classList.remove("challenges-locked");
    challengesCardExp4?.classList.remove("challenges-locked");
    challengesCardExp5?.classList.remove("challenges-locked");
    challengesCardExp6?.classList.remove("challenges-locked");
  } else {
    challengesCardExp2?.classList.add("challenges-locked");
    challengesCardExp3?.classList.add("challenges-locked");
    challengesCardExp4?.classList.add("challenges-locked");
    challengesCardExp5?.classList.add("challenges-locked");
    challengesCardExp6?.classList.add("challenges-locked");
  }

  if (opticalExperimentInstance) {
    opticalExperimentInstance.renderAll();
    if (opticalExperimentInstance.renderChallengesDom) {
      opticalExperimentInstance.renderChallengesDom();
    }
  }
  if (colourSensorExperimentInstance) {
    colourSensorExperimentInstance.renderAll();
    if (colourSensorExperimentInstance.updateChallengeCounters) {
      colourSensorExperimentInstance.updateChallengeCounters();
    }
  }
  if (hallEffectExperimentInstance) {
    hallEffectExperimentInstance.renderAll();
    if (hallEffectExperimentInstance.updateChallengeCounters) {
      hallEffectExperimentInstance.updateChallengeCounters();
    }
  }
  if (physicsSandboxExperimentInstance) {
    physicsSandboxExperimentInstance.renderAll();
    if (physicsSandboxExperimentInstance.renderChallengesDom) {
      physicsSandboxExperimentInstance.renderChallengesDom();
    }
  }
  if (diffractionExperimentInstance) {
    diffractionExperimentInstance.renderAll();
    if (diffractionExperimentInstance.renderChallengesDom) {
      diffractionExperimentInstance.renderChallengesDom();
    }
  }
  if (diodeExperimentInstance) {
    diodeExperimentInstance.renderAll();
    if (diodeExperimentInstance.renderChallengesDom) {
      diodeExperimentInstance.renderChallengesDom();
    }
  }

  // Update Vectra AI copilot header badge
  updateAiServerStatus();
}

// Intercept clicks on locked challenges across all experiments
document.addEventListener("click", (e) => {
  const lockedCard = e.target.closest(".challenges-card.challenges-locked");
  if (lockedCard && !isUserAuthenticated()) {
    openLoginModal("Please sign in to unlock laboratory challenges and earn student XP!");
  }
});

let isInitializingUser = false;

async function completeVerifiedUserInitialization(user) {
  if (!user || isEmailVerificationRequired(user)) return;
  if (isInitializingUser) return;
  isInitializingUser = true;

  try {
    if (!canPerformCloudOperation()) {
      console.log("[Auth] Offline mode detected during user initialization. Loading cached profile/progression in read-only mode.");
      const cachedXp = Number(localStorage.getItem(`physix_xp_${user.uid}`) || 0);
      setAuthoritativeUserXp(user.uid, cachedXp, false);

      const localCandidates = [];
      try {
        const p = getStoredChallenges();
        if (p.target?.completed) localCandidates.push("projectile.target");
        if (p.complementary?.completed) localCandidates.push("projectile.complementary");
        if (p.apex?.completed) localCandidates.push("projectile.apex");

        const ofSaved = JSON.parse(localStorage.getItem("physix_of_challenges") || "{}");
        if (ofSaved.spotMatch?.completed) localCandidates.push("optical.spotMatch");
        if (ofSaved.rapidCalib?.completed) localCandidates.push("optical.rapidCalib");
        if (ofSaved.multiSweep?.completed) localCandidates.push("optical.multiSweep");

        const csSaved = JSON.parse(localStorage.getItem("physix_cs_challenges") || "{}");
        if (csSaved.primaryCalib?.completed) localCandidates.push("colour-sensor.primaryCalib");
        if (csSaved.mysteryDetective?.completed) localCandidates.push("colour-sensor.mysteryDetective");
        if (csSaved.distanceSweep?.completed) localCandidates.push("colour-sensor.distanceSweep");

        const hallSaved = JSON.parse(localStorage.getItem("physix_hall_challenges") || "{}");
        if (hallSaved.zeroOffsetCalib?.completed) localCandidates.push("hall-effect.zeroOffsetCalib");
        if (hallSaved.carrierIdentification?.completed) localCandidates.push("hall-effect.carrierIdentification");
        if (hallSaved.mobilityExtraction?.completed) localCandidates.push("hall-effect.mobilityExtraction");

        const sbSaved = JSON.parse(localStorage.getItem("physix_sb_challenges") || "{}");
        if (sbSaved.thrust?.completed) localCandidates.push("sandbox.thrust");
        if (sbSaved.kick?.completed) localCandidates.push("sandbox.kick");
        if (sbSaved.zerog?.completed) localCandidates.push("sandbox.zerog");
      } catch (e) {}

      activeAuthoritativeCompletedChallenges = localCandidates;
      hydrateAllExperimentChallenges(localCandidates);
      await processUserDailyStreak(user);
      updateAuthStateRestrictions();
      loadUserProfile();
      renderChallenges();
      return;
    }

    await processUserDailyStreak(user);

    // 1. Authoritative Firestore fetch: populate user progress, XP, and unlocked badges from Firestore
    let cloudBadges = [];
    let cloudExpCount = 0;
    let cloudXp = null;
    let cloudQuizScore = 0;
    let cloudChallenges = [];

    try {
      const cloudData = await fetchFullUserDataFromFirestore(user.uid);
      if (cloudData && cloudData.user) {
        const cUser = cloudData.user;
        cloudBadges = Array.isArray(cUser.badges) ? cUser.badges : [];
        cloudExpCount = Number(cUser.experimentsPerformed || 0);
        cloudQuizScore = Number(cUser.bestQuizScore || 0);
        cloudChallenges = Array.isArray(cUser.completedChallenges) ? cUser.completedChallenges : [];

        if (typeof cUser.totalXP === "number") {
          cloudXp = cUser.totalXP;
        } else if (typeof cUser.xp === "number") {
          cloudXp = cUser.xp;
        }

        if (cUser.tutorialsCompleted) {
          syncTutorialsWithCloud(user.uid, cUser.tutorialsCompleted);
        }

        // Sync authoritative cloud badges to user-scoped local storage
        const localBadges = getStoredBadges(user.uid);
        const mergedBadges = Array.from(new Set([...cloudBadges, ...localBadges]));
        saveStoredBadges(mergedBadges, user.uid);

        // Keep local telemetry counts aligned without downgrading
        const stats = getStoredTelemetry();
        if (cloudExpCount > (stats.totalLaunches || 0)) {
          stats.totalLaunches = cloudExpCount;
          saveStoredTelemetry(stats);
        }

        // Align high score if cloud has higher
        if (cloudQuizScore > 0) {
          const currentHigh = Number(localStorage.getItem("physix_quiz_highscore") || 0);
          if (cloudQuizScore > currentHigh) {
            localStorage.setItem("physix_quiz_highscore", String(cloudQuizScore));
          }
        }

        // Sync student profile information from Firestore into local storage
        const currentProfile = getStoredUserProfile();
        const cloudCollege = (cUser.college || cUser.occ || cUser.extra?.college || cUser.extra?.occ || "").trim();
        const cloudName = (cUser.name || cUser.displayName || user.displayName || "").trim();
        const updatedProfile = {
          ...currentProfile,
          name: cloudName || currentProfile.name || "",
          college: cloudCollege || currentProfile.college || currentProfile.occ || "",
          occ: cloudCollege || currentProfile.occ || currentProfile.college || "",
          handle: cUser.handle || cUser.extra?.handle || currentProfile.handle || "",
          avatar: cUser.avatar || cUser.extra?.avatar || currentProfile.avatar || "quantum",
          edu: cUser.edu || cUser.extra?.edu || currentProfile.edu || "",
          bio: cUser.bio || cUser.extra?.bio || currentProfile.bio || "",
          interests: cUser.interests || cUser.extra?.interests || currentProfile.interests || ""
        };
        try {
          localStorage.setItem("physix_user_profile", JSON.stringify(updatedProfile));
        } catch (e) {}
      }
    } catch (err) {
      console.warn("[Firestore] fetchFullUserDataFromFirestore sync notice:", err);
    }

    // 2. Authoritative Completed Challenges Resolution & Safe One-Way Migration:
    // Gather any legacy local completions and safely merge into cloud authoritative set.
    const localCandidates = [];
    try {
      const p = getStoredChallenges();
      if (p.target?.completed) localCandidates.push("projectile.target");
      if (p.complementary?.completed) localCandidates.push("projectile.complementary");
      if (p.apex?.completed) localCandidates.push("projectile.apex");

      const ofSaved = JSON.parse(localStorage.getItem("physix_of_challenges") || "{}");
      if (ofSaved.spotMatch?.completed) localCandidates.push("optical.spotMatch");
      if (ofSaved.rapidCalib?.completed) localCandidates.push("optical.rapidCalib");
      if (ofSaved.multiSweep?.completed) localCandidates.push("optical.multiSweep");

      const csSaved = JSON.parse(localStorage.getItem("physix_cs_challenges") || "{}");
      if (csSaved.primaryCalib?.completed) localCandidates.push("colour-sensor.primaryCalib");
      if (csSaved.mysteryDetective?.completed) localCandidates.push("colour-sensor.mysteryDetective");
      if (csSaved.distanceSweep?.completed) localCandidates.push("colour-sensor.distanceSweep");

      const hallSaved = JSON.parse(localStorage.getItem("physix_hall_challenges") || "{}");
      if (hallSaved.zeroOffsetCalib?.completed) localCandidates.push("hall-effect.zeroOffsetCalib");
      if (hallSaved.carrierIdentification?.completed) localCandidates.push("hall-effect.carrierIdentification");
      if (hallSaved.mobilityExtraction?.completed) localCandidates.push("hall-effect.mobilityExtraction");

      const sbSaved = JSON.parse(localStorage.getItem("physix_sb_challenges") || "{}");
      if (sbSaved.thrust?.completed) localCandidates.push("sandbox.thrust");
      if (sbSaved.kick?.completed) localCandidates.push("sandbox.kick");
      if (sbSaved.zerog?.completed) localCandidates.push("sandbox.zerog");
    } catch (e) {}

    const mergedChallenges = Array.from(new Set([...cloudChallenges, ...localCandidates]));
    activeAuthoritativeCompletedChallenges = mergedChallenges;
    hydrateAllExperimentChallenges(mergedChallenges);

    // 3. Authoritative XP Resolution:
    // Firestore is the SINGLE SOURCE OF TRUTH for progression.
    let authoritativeXp = 0;
    if (cloudXp !== null && cloudXp >= 0) {
      authoritativeXp = cloudXp;
    } else {
      // First-time migration check: only if Firestore has no record yet
      const stats = getStoredTelemetry();
      const badges = getStoredBadges(user.uid);
      const quizHigh = Number(localStorage.getItem("physix_quiz_highscore") || 0);
      const targetScore = simState.targetScore || 0;
      const legacyLocalXp = calculateLegacyLocalXp(stats, quizHigh, targetScore, badges.length);
      const cachedXp = Number(localStorage.getItem(`physix_xp_${user.uid}`) || 0);
      authoritativeXp = Math.max(legacyLocalXp, cachedXp);
      console.log(`[Firestore] Initializing new cloud progression with ${authoritativeXp} XP for users/${user.uid}`);
    }

    setAuthoritativeUserXp(user.uid, authoritativeXp);

    // 4. Sync user profile metadata & challenges to Firestore users/{uid} safely preserving cloud progression
    try {
      const profile = getStoredUserProfile();
      const stats = getStoredTelemetry();
      const badges = getStoredBadges(user.uid);
      const quizHigh = Number(localStorage.getItem("physix_quiz_highscore") || 0);
      const rankInfo = calculateRankFromXp(authoritativeXp);
      const streak = getStoredUserStreak(user.uid);

      await syncUserToFirestore(user, {
        name: (user && user.displayName) || profile.name || (user.email ? user.email.split("@")[0] : "PhysiX Scholar"),
        email: user.email,
        photoURL: user.photoURL || null,
        totalXP: authoritativeXp,
        level: rankInfo.level,
        streak: streak.currentStreak || 1,
        highestStreak: streak.highestStreak || streak.currentStreak || 1,
        lastLoginDate: streak.lastLoginDate,
        experimentsPerformed: Math.max(cloudExpCount, stats.totalLaunches || 0),
        badges: badges,
        completedChallenges: mergedChallenges,
        bestQuizScore: Math.max(cloudQuizScore, quizHigh)
      });
    } catch (e) {
      console.warn("[Firestore] User sync notice:", e);
    }

    // 5. Real-time Multi-Device Synchronization:
    // When another laptop or device completes challenges or awards XP, this listener automatically synchronizes state.
    if (userDocUnsubscribe) {
      userDocUnsubscribe();
      userDocUnsubscribe = null;
    }

    userDocUnsubscribe = subscribeToUserDoc(user.uid, (cloudUser) => {
      if (!cloudUser) return;
      const remoteXp = typeof cloudUser.totalXP === "number" ? cloudUser.totalXP : (typeof cloudUser.xp === "number" ? cloudUser.xp : null);
      if (remoteXp !== null && remoteXp !== activeAuthoritativeXp) {
        console.log(`%c[Firestore Realtime] Multi-device XP synchronized: ${activeAuthoritativeXp} -> ${remoteXp}`, "color: #10b981; font-weight: bold;");
        setAuthoritativeUserXp(user.uid, remoteXp);
        loadUserProfile();
        renderChallenges();
      }

      // Synchronize streak updates across multiple devices in real-time
      if (typeof cloudUser.streak === "number" || typeof cloudUser.highestStreak === "number") {
        const localStreak = getStoredUserStreak(user.uid);
        const remoteStreak = Number(cloudUser.streak) || 0;
        const remoteHighest = Number(cloudUser.highestStreak) || remoteStreak;
        const remoteLogin = cloudUser.lastLoginDate || null;

        if (remoteStreak > localStreak.currentStreak || remoteHighest > localStreak.highestStreak) {
          console.log(`%c[Firestore Realtime] Multi-device streak synchronized: ${localStreak.currentStreak} -> ${remoteStreak} (best: ${remoteHighest})`, "color: #10b981; font-weight: bold;");
          saveStoredUserStreak(user.uid, {
            ...localStreak,
            currentStreak: remoteStreak,
            highestStreak: remoteHighest,
            lastLoginDate: remoteLogin || localStreak.lastLoginDate,
            pendingSync: false
          });
          loadUserProfile();
        }
      }

      if (cloudUser.tutorialsCompleted) {
        syncTutorialsWithCloud(user.uid, cloudUser.tutorialsCompleted);
      }

      if (Array.isArray(cloudUser.completedChallenges)) {
        const hasDiff = cloudUser.completedChallenges.length !== activeAuthoritativeCompletedChallenges.length ||
          cloudUser.completedChallenges.some(id => !activeAuthoritativeCompletedChallenges.includes(id));
        if (hasDiff) {
          console.log(`%c[Firestore Realtime] Multi-device challenges synchronized:`, "color: #10b981; font-weight: bold;", cloudUser.completedChallenges);
          activeAuthoritativeCompletedChallenges = cloudUser.completedChallenges;
          hydrateAllExperimentChallenges(cloudUser.completedChallenges);
        }
      }

      if (Array.isArray(cloudUser.badges)) {
        const localBadges = getStoredBadges(user.uid);
        const hasNewBadge = cloudUser.badges.some(b => !localBadges.includes(b));
        if (hasNewBadge || cloudUser.badges.length !== localBadges.length) {
          saveStoredBadges(cloudUser.badges, user.uid);
          loadUserProfile();
        }
      }

      if (typeof cloudUser.experimentsPerformed === "number") {
        const curStats = getStoredTelemetry();
        if (cloudUser.experimentsPerformed > (curStats.totalLaunches || 0)) {
          curStats.totalLaunches = cloudUser.experimentsPerformed;
          saveStoredTelemetry(curStats);
          loadUserProfile();
        }
      }
    });

  } finally {
    isInitializingUser = false;
  }

  updateAuthStateRestrictions();
  loadUserProfile();
  renderChallenges();
}

// Listen to Firebase Auth state transitions
onAuthStateChanged(auth, async (user) => {
  if (resolveAuthReady) {
    resolveAuthReady(user);
  }
  if (user) {
    if (isEmailVerificationRequired(user)) {
      // Unverified email/password user: block access and do not initialize/sync Firestore data
      showVerificationOverlay(user);
      updateAuthStateRestrictions();
      loadUserProfile();
      return;
    }
    // Verified user (or Google user): dismiss overlay and complete initialization
    hideVerificationOverlay();
    await completeVerifiedUserInitialization(user);
  } else {
    // User signed out: cleanup subscriptions and reset progression to guest mode
    if (userDocUnsubscribe) {
      userDocUnsubscribe();
      userDocUnsubscribe = null;
    }
    activeAuthoritativeXp = null;
    activeAuthoritativeCompletedChallenges = [];
    hydrateAllExperimentChallenges([]);
    hideVerificationOverlay();
    updateAuthStateRestrictions();
    await processUserDailyStreak(null);
    loadUserProfile();
    renderChallenges();
  }
});

// Refresh daily streak when returning to tab (e.g. across midnight boundary)
document.addEventListener("visibilitychange", async () => {
  if (document.visibilityState === "visible") {
    try {
      const currentUser = auth?.currentUser || null;
      await processUserDailyStreak(currentUser);
      loadUserProfile();
    } catch (e) {}
  }
});

// ==========================================
// HOMEPAGE, STANDALONE ROUTING & EXPERIMENT DETAILS CONTROLLER
// ==========================================
let isExperimentsPageInitialized = false;
let currentActiveDetailExpId = "projectile";

/**
 * Shared, reusable References renderer.
 * Renders a "References & Further Reading" subsection using the project-wide
 * ref-card component so it works in both dark and light themes.
 * @param {Array<{title, source, url, description}>} books
 */
export function renderReferencesHtml(books) {
  const safeBooks = Array.isArray(books) ? books : [];
  if (safeBooks.length === 0) {
    return `<div class="refs-empty">No reference resources are listed for this experiment yet.</div>`;
  }
  const validBooks = safeBooks.filter(b => b && b.title && b.url);
  if (validBooks.length === 0) {
    return `<div class="refs-empty">No verified reference resources are listed for this experiment yet.</div>`;
  }
  return `
    <h3 style="margin-bottom:16px; color:var(--accent-cyan, #00f0ff); font-size:1.08rem; letter-spacing:0.5px;">References & Further Reading</h3>
    <div class="refs-grid">
      ${validBooks.map(b => `
        <a href="${b.url}" target="_blank" rel="noopener noreferrer" class="ref-card" aria-label="${b.title}">
          <div class="ref-card-header">
            <svg class="ref-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"></path>
              <path d="M8 7h12M8 12h12M8 17h12"></path>
            </svg>
            <strong class="ref-card-title">${b.title}</strong>
          </div>
          <div class="ref-card-source">${b.source || ""}</div>
          <div class="ref-card-desc">${b.description || ""}</div>
          <div class="ref-card-link">
            <span>Open resource</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17l9-9M7 7h9v9"></path></svg>
          </div>
        </a>
      `).join("")}
    </div>
  `;
}

export function openExperimentDetailsPage(expId) {
  tutorialManager.destroyTour();
  const normalizedId = (expId === "pof-attenuation" || expId === "optical-attenuation" || expId === "pof")
    ? "pof-attenuation"
    : ((expId === "sandbox" || expId === "hall-effect" || expId === "colour-sensor" || expId === "optical" || expId === "projectile" || expId === "diffraction" || expId === "diffraction-grating" || expId === "diode" || expId === "diode-vi")
    ? (expId === "diffraction-grating" ? "diffraction" : (expId === "diode-vi" ? "diode" : expId))
    : "projectile");

  const data = EXPERIMENT_DETAILS[normalizedId] || EXPERIMENT_DETAILS["projectile"];
  currentActiveDetailExpId = normalizedId;

  const detailPage = document.getElementById("physix-experiment-detail-page");
  if (!detailPage) return;

  // Header content
  const categoryBadge = document.getElementById("exp-detail-category-badge");
  const titleEl = document.getElementById("exp-detail-title");
  const descEl = document.getElementById("exp-detail-desc");
  const difficultyEl = document.getElementById("exp-meta-difficulty");
  const durationEl = document.getElementById("exp-meta-duration");
  const engineEl = document.getElementById("exp-meta-engine");

  if (categoryBadge) categoryBadge.textContent = data.category || "PHYSICS EXPERIMENT";
  if (titleEl) titleEl.textContent = data.title;
  if (descEl) descEl.textContent = data.shortDescription;
  if (difficultyEl) difficultyEl.textContent = data.difficulty || "Undergraduate Practical";
  if (durationEl) durationEl.textContent = data.duration || "45 Minutes";
  if (engineEl) engineEl.textContent = data.engine || "Wave Optics Engine";

  // Set the 7 sections in exact required order
  const aimContent = document.getElementById("manual-content-aim");
  const theoryContent = document.getElementById("manual-content-theory");
  const howToContent = document.getElementById("manual-content-how-to");
  const procContent = document.getElementById("manual-content-procedure");
  const formulasContent = document.getElementById("manual-content-formulas");
  const obsContent = document.getElementById("manual-content-observations");
  const resultContent = document.getElementById("manual-content-result");

  if (aimContent) aimContent.innerHTML = data.aim || "";
  if (theoryContent) theoryContent.innerHTML = data.theory || "";
  if (howToContent) howToContent.innerHTML = data.howToPerform || "";
  if (procContent) procContent.innerHTML = data.procedure || "";
  if (formulasContent) formulasContent.innerHTML = data.formulas || "";
  if (obsContent) obsContent.innerHTML = data.observations || "";
  if (resultContent) resultContent.innerHTML = data.result || "";

  // Render Reference Books & Learning Resources using the shared ref-card component
  const refsContent = document.getElementById("manual-content-references");
  if (refsContent) {
    refsContent.innerHTML = renderReferencesHtml(data.referenceBooks || []);
  }
  renderMathInDOM(detailPage);

  renderMathInElement(detailPage);

  // Hide other pages & modals
  document.body.classList.remove("on-homepage");
  document.body.classList.add("on-standalone-page");
  physixHome?.classList.add("hidden");
  document.getElementById("physix-terms-page")?.classList.add("hidden");
  document.getElementById("physix-privacy-page")?.classList.add("hidden");
  document.getElementById("physix-experiments-page")?.classList.add("hidden");
  explorerModal?.classList.add("hidden");

  // Show details page
  detailPage.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "instant" });
}

export function startSimulatorFromDetails(expId) {
  window.startSimulatorFromDetails = startSimulatorFromDetails;
  const targetId = expId || currentActiveDetailExpId || "projectile";

  // Hide standalone pages & leave standalone mode
  document.body.classList.remove("on-standalone-page");
  document.body.classList.remove("on-homepage");

  const detailPage = document.getElementById("physix-experiment-detail-page");
  const expPage = document.getElementById("physix-experiments-page");
  detailPage?.classList.add("hidden");
  expPage?.classList.add("hidden");
  physixHome?.classList.add("hidden");

  // Close modals
  [explorerModal, theoryModal, profileModal, quizModal, editProfileModal, aiCopilotModal, legalModal].forEach(m => m?.classList.add("hidden"));

  // Launch existing simulator without breaking existing functionality
  switchExperiment(targetId, true);
  window.scrollTo({ top: 0, behavior: "smooth" });
}
window.startSimulatorFromDetails = startSimulatorFromDetails;

function initExperimentsPage() {
  const pageGrid = document.getElementById("exp-page-labs-grid");
  const modalGrid = explorerModal?.querySelector(".labs-grid");
  const searchInput = document.getElementById("exp-page-search-input");
  const catPills = document.querySelectorAll("#exp-page-cat-pills .exp-cat-pill");

  if (!pageGrid || !modalGrid) return;

  // Populate cards from modal if not yet populated
  if (pageGrid.children.length === 0) {
    pageGrid.innerHTML = modalGrid.innerHTML;
  }

  // Sync bookmark states with current bookmarkedSet
  const savedBookmarks = JSON.parse(localStorage.getItem("physix_bookmarked_labs") || "[]");
  const bSet = new Set(savedBookmarks);
  pageGrid.querySelectorAll(".card-bookmark-btn").forEach(btn => {
    const card = btn.closest(".lab-card");
    const labName = card?.getAttribute("data-name") || "";
    if (bSet.has(labName)) {
      btn.classList.add("bookmarked");
    } else {
      btn.classList.remove("bookmarked");
    }
  });

  if (isExperimentsPageInitialized) return;
  isExperimentsPageInitialized = true;

  // Handle clicking on cards in the dedicated page grid
  pageGrid.addEventListener("click", (e) => {
    // If bookmark button clicked
    const bookmarkBtn = e.target.closest(".card-bookmark-btn");
    if (bookmarkBtn) {
      e.stopPropagation();
      const card = bookmarkBtn.closest(".lab-card");
      const labName = card?.getAttribute("data-name") || "lab";
      const isNowBookmarked = bookmarkBtn.classList.toggle("bookmarked");

      const curBookmarks = new Set(JSON.parse(localStorage.getItem("physix_bookmarked_labs") || "[]"));
      if (isNowBookmarked) {
        curBookmarks.add(labName);
        showToast(`Bookmarked: ${labName}`);
      } else {
        curBookmarks.delete(labName);
        showToast(`Removed bookmark: ${labName}`);
      }
      localStorage.setItem("physix_bookmarked_labs", JSON.stringify([...curBookmarks]));

      // Synchronize in explorer modal as well
      modalGrid.querySelectorAll(".lab-card").forEach(mc => {
        if (mc.getAttribute("data-name") === labName) {
          const mb = mc.querySelector(".card-bookmark-btn");
          if (mb) {
            if (isNowBookmarked) mb.classList.add("bookmarked");
            else mb.classList.remove("bookmarked");
          }
        }
      });
      return;
    }

    // Card or Perform button clicked -> Open dedicated details page!
    const card = e.target.closest(".lab-card");
    if (!card) return;

    const target = card.getAttribute("data-exp-target");
    const name = card.getAttribute("data-name") || "";

    let expId = null;
    if (target === "pof-attenuation" || target === "pof" || name.toLowerCase().includes("attenuation") || name.toLowerCase().includes("plastic optical fiber")) expId = "pof-attenuation";
    else if (target === "diode" || target === "diode-vi" || name.toLowerCase().includes("diode") || name.toLowerCase().includes("p-n junction")) expId = "diode";
    else if (target === "diffraction" || target === "diffraction-grating" || name.toLowerCase().includes("diffraction")) expId = "diffraction-grating";
    else if (target === "hall-effect" || name.toLowerCase().includes("hall effect")) expId = "hall-effect";
    else if (target === "sandbox" || name.toLowerCase().includes("sandbox")) expId = "sandbox";
    else if (target === "colour-sensor" || name.toLowerCase().includes("colour sensor")) expId = "colour-sensor";
    else if (target === "optical" || name.toLowerCase().includes("optical fibre")) expId = "optical";
    else if (target === "projectile" || card.classList.contains("active-lab") || name.toLowerCase().includes("projectile")) expId = "projectile";

    if (expId) {
      navigateTo(`/experiment/${expId}`);
    } else {
      showToast(`${name || "This experiment"} is currently in calibration. Full module coming soon!`);
    }
  });

  // Filter functionality for category pills
  let currentCategory = "all";
  let currentSearchQuery = "";

  function filterCards() {
    const cards = pageGrid.querySelectorAll(".lab-card");
    const q = currentSearchQuery.trim().toLowerCase();

    cards.forEach(card => {
      const cardCat = card.getAttribute("data-category") || "all";
      const cardName = (card.getAttribute("data-name") || "").toLowerCase();
      const cardDesc = (card.querySelector(".card-desc")?.textContent || "").toLowerCase();

      const matchesCat = currentCategory === "all" || cardCat === currentCategory;
      const matchesSearch = !q || cardName.includes(q) || cardDesc.includes(q);

      if (matchesCat && matchesSearch) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  }

  catPills.forEach(pill => {
    pill.addEventListener("click", () => {
      catPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      currentCategory = pill.getAttribute("data-category") || "all";
      filterCards();
    });
  });

  searchInput?.addEventListener("input", (e) => {
    currentSearchQuery = e.target.value;
    filterCards();
  });
}

export function handleRoute(path = window.location.pathname, hash = window.location.hash) {
  const cleanPath = (path || "/").toLowerCase();
  const cleanHash = (hash || "").toLowerCase();

  // Close any open modals and tours
  [explorerModal, theoryModal, profileModal, quizModal, editProfileModal, aiCopilotModal, legalModal].forEach(m => m?.classList.add("hidden"));
  tutorialManager.destroyTour();

  const termsPage = document.getElementById("physix-terms-page");
  const privacyPage = document.getElementById("physix-privacy-page");
  const expPage = document.getElementById("physix-experiments-page");
  const detailPage = document.getElementById("physix-experiment-detail-page");

  termsPage?.classList.add("hidden");
  privacyPage?.classList.add("hidden");
  expPage?.classList.add("hidden");
  detailPage?.classList.add("hidden");

  if (cleanPath.startsWith("/experiment/")) {
    const parts = cleanPath.split("/").filter(Boolean);
    const expId = parts[1] || "projectile";
    if (expId.includes("nanotech")) {
      showToast("The Nanotechnology Simulation experiment is no longer available.");
      navigateTo("/experiments", true);
      return;
    }
    openExperimentDetailsPage(expId);
  } else if (cleanPath.startsWith("/simulations/") || cleanPath.startsWith("/simulation/")) {
    const parts = cleanPath.split("/").filter(Boolean);
    const expId = parts[1] || "projectile";
    if (expId.includes("nanotech")) {
      showToast("The Nanotechnology Simulation experiment is no longer available.");
      navigateTo("/experiments", true);
      return;
    }
    document.body.classList.remove("on-homepage");
    document.body.classList.remove("on-standalone-page");
    physixHome?.classList.add("hidden");
    let mappedId = expId;
    if (expId === "pof-attenuation" || expId === "optical-attenuation" || expId === "pof") mappedId = "pof-attenuation";
    else if (expId === "diode" || expId === "diode-vi" || expId === "pn-junction") mappedId = "diode";
    else if (expId === "diffraction-grating" || expId === "diffraction") mappedId = "diffraction";
    else if (expId === "optical-fibre" || expId === "optical") mappedId = "optical";
    else if (expId === "colour-sensor") mappedId = "colour-sensor";
    else if (expId === "sandbox" || expId === "physics-sandbox") mappedId = "sandbox";
    else mappedId = "projectile";
    switchExperiment(mappedId, false);
  } else if (cleanPath.endsWith("/terms")) {
    document.body.classList.remove("on-homepage");
    document.body.classList.add("on-standalone-page");
    physixHome?.classList.add("hidden");
    termsPage?.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "instant" });
  } else if (cleanPath.endsWith("/privacy")) {
    document.body.classList.remove("on-homepage");
    document.body.classList.add("on-standalone-page");
    physixHome?.classList.add("hidden");
    privacyPage?.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "instant" });
  } else if (cleanPath.endsWith("/experiments") || cleanPath.endsWith("/simulations") || cleanHash === "#simulations" || cleanHash === "#experiments") {
    document.body.classList.remove("on-homepage");
    document.body.classList.add("on-standalone-page");
    physixHome?.classList.add("hidden");
    expPage?.classList.remove("hidden");
    initExperimentsPage();
    window.scrollTo({ top: 0, behavior: "instant" });
  } else if (cleanHash === "#diffraction" || cleanHash === "#diffraction-grating" || cleanHash === "#hall-effect" || cleanHash === "#sandbox" || cleanHash === "#pof-attenuation" || cleanHash === "#optical" || cleanHash === "#colour-sensor" || cleanHash === "#projectile") {
    // Direct link to simulation
    document.body.classList.remove("on-homepage");
    document.body.classList.remove("on-standalone-page");
    physixHome?.classList.add("hidden");
    let mapped = cleanHash.replace("#", "");
    if (mapped === "diode-vi" || mapped === "pn-junction") mapped = "diode";
    else if (mapped === "diffraction-grating") mapped = "diffraction";
    switchExperiment(mapped, false);
  } else if (cleanPath.endsWith("/profile") || cleanHash === "#profile") {
    document.body.classList.remove("on-standalone-page");
    if (!physixHome || physixHome.classList.contains("hidden")) {
      // Keep simulator active underneath
    } else {
      showHomePage();
    }
    openProfileModal("overview");
  } else {
    // Default to Homepage
    document.body.classList.remove("on-standalone-page");
    showHomePage();
  }
}

export function navigateTo(path, pushState = true) {
  if (pushState && window.location.pathname !== path) {
    window.history.pushState({}, "", path);
  }
  handleRoute(path);
}

// Global listener for [data-route] and profile triggers
document.addEventListener("click", (e) => {
  const routeTrigger = e.target.closest("[data-route]");
  if (routeTrigger) {
    const route = routeTrigger.getAttribute("data-route");
    if (route) {
      e.preventDefault();
      if (route === "/profile" || route.endsWith("/profile")) {
        openProfileModal("overview");
        return;
      }
      navigateTo(route);
    }
  }
  const profileTrigger = e.target.closest("[data-action='open-profile']");
  if (profileTrigger) {
    e.preventDefault();
    openProfileModal("overview");
  }
});

// Start Simulator button bindings on experiment details page
document.getElementById("btn-start-simulator")?.addEventListener("click", () => {
  startSimulatorFromDetails(currentActiveDetailExpId);
});
document.querySelector(".btn-start-simulator-bottom")?.addEventListener("click", () => {
  startSimulatorFromDetails(currentActiveDetailExpId);
});

window.addEventListener("popstate", () => {
  handleRoute(window.location.pathname, window.location.hash);
});

export function showHomePage() {
  tutorialManager.destroyTour();
  document.body.classList.add("on-homepage");
  if (physixHome) {
    physixHome.classList.remove("hidden");
  }
  // Close any open modals
  [explorerModal, theoryModal, profileModal, quizModal, editProfileModal, aiCopilotModal, legalModal].forEach(m => m?.classList.add("hidden"));

  if (!homepageInstance) {
    homepageInstance = initHomepage({
      onExplore: () => {
        navigateTo("/experiments");
      },
      onOpenTerms: () => {
        navigateTo("/terms");
      },
      onOpenPrivacy: () => {
        navigateTo("/privacy");
      }
    });
  } else {
    homepageInstance.resume?.();
  }
}

export function leaveHomePageAndExplore() {
  navigateTo("/experiments");
}

export function openLegalModal(tab = "terms") {
  if (tab === "terms") {
    navigateTo("/terms");
  } else {
    navigateTo("/privacy");
  }
}

btnCloseLegal?.addEventListener("click", () => {
  legalModal?.classList.add("hidden");
});

btnLegalTabTerms?.addEventListener("click", () => openLegalModal("terms"));
btnLegalTabPrivacy?.addEventListener("click", () => openLegalModal("privacy"));

if (navLogo) {
  navLogo.style.cursor = "pointer";
  navLogo.setAttribute("title", "Return to PhysiX Homepage");
  navLogo.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.location.hash || window.location.pathname !== "/") {
      window.history.pushState({}, "", "/");
    }
    handleRoute("/", "");
  });
}

// ==========================================
// INITIAL SETUP & RUN
// ==========================================
initContentProtection();
initCelebrations();

// Initialize Tutorial / Guided Onboarding System
tutorialManager.init({
  getActiveUserId,
  showToast
});

const btnReplayTutorial = document.getElementById("btn-replay-tutorial");
btnReplayTutorial?.addEventListener("click", () => {
  tutorialManager.startTutorial(activeExperimentId, true);
});

document.querySelectorAll("[data-tour-exp]").forEach(btn => {
  btn.addEventListener("click", () => {
    const targetExp = btn.getAttribute("data-tour-exp");
    helpModal?.classList.add("hidden");
    if (targetExp && targetExp !== activeExperimentId) {
      switchExperiment(targetExp, true);
    }
    setTimeout(() => {
      tutorialManager.startTutorial(targetExp || activeExperimentId, true);
    }, 250);
  });
});

// Initialize PWA / Offline System
initPwaSystem().then(() => {
  // Connect offline-manager's accurate network status to user-data-service
  setNetworkStatusOverride(() => canPerformCloudOperation());
}).catch(err => console.warn("[PWA] Initialization error:", err));

// Initialize Deployment Update Manager (Version detection & notification modal)
updateManager.init();

// Listen for network changes to handle transitions
onNetworkChange((isOnline, quality) => {
  if (isOnline) {
    console.log("[Network] Back online - restoring authoritative cloud state...");
    updateAiServerStatus();
    if (aiChatInput) aiChatInput.placeholder = "Ask Vectra AI about physics, formulas, or experiments...";
    if (auth.currentUser && isUserAuthenticated()) {
      completeVerifiedUserInitialization(auth.currentUser);
    }
  } else {
    console.log("[Network] Gone offline - pausing cloud operations");
    updateAiServerStatus();
    if (aiChatInput) aiChatInput.placeholder = "Vectra AI is unavailable while offline";
    // Clear any pending Firestore listeners to prevent errors
    if (userDocUnsubscribe) {
      userDocUnsubscribe();
      userDocUnsubscribe = null;
    }
  }
});

// Start on appropriate page based on current URL path and hash
const initialPath = window.location.pathname.toLowerCase();
const initialHash = (window.location.hash || "").toLowerCase();

if (initialPath.startsWith("/experiment/") || initialPath.startsWith("/simulations/") || initialPath.startsWith("/simulation/") || initialPath.endsWith("/terms") || initialPath.endsWith("/privacy") || initialPath.endsWith("/experiments") || initialPath.endsWith("/simulations")) {
  document.body.classList.remove("on-homepage");
  if (!initialPath.startsWith("/simulations/") && !initialPath.startsWith("/simulation/")) {
    document.body.classList.add("on-standalone-page");
  }
  physixHome?.classList.add("hidden");
  handleRoute(initialPath, initialHash);
  initSplashScreen(() => {
    handleRoute(initialPath, initialHash);
  });
} else if (initialHash === "#diffraction" || initialHash === "#diffraction-grating" || initialHash === "#hall-effect" || initialHash === "#sandbox" || initialHash === "#optical" || initialHash === "#colour-sensor" || initialHash === "#projectile") {
  document.body.classList.remove("on-homepage");
  physixHome?.classList.add("hidden");
  initSplashScreen(() => {
    let target = initialHash.replace("#", "");
    if (target === "diffraction-grating") target = "diffraction";
    switchExperiment(target, false);
  });
} else {
  document.body.classList.add("on-homepage");
  initSplashScreen(() => {
    handleRoute(initialPath, initialHash);
  });
}
initPhysixLogoAnimation();
initMathRenderer();
initTheme();
loadUserProfile();

// Asynchronously hydrate profile from Express API if available and local profile is incomplete
(async () => {
  try {
    const activeUid = getActiveUserId();
    const serverProf = await api.getProfile(activeUid);
    if (serverProf && (serverProf.name || serverProf.college || serverProf.occ)) {
      const cur = getStoredUserProfile();
      const sCollege = (serverProf.college || serverProf.occ || "").trim();
      const sName = (serverProf.name || "").trim();
      if ((!cur.name && sName) || (!cur.college && sCollege)) {
        const merged = {
          ...cur,
          name: cur.name || sName,
          college: cur.college || sCollege,
          occ: cur.occ || sCollege,
          handle: cur.handle || serverProf.handle || "",
          avatar: cur.avatar || serverProf.avatar || "quantum",
          edu: cur.edu || serverProf.edu || "",
          bio: cur.bio || serverProf.bio || "",
          interests: cur.interests || serverProf.interests || ""
        };
        localStorage.setItem("physix_user_profile", JSON.stringify(merged));
        loadUserProfile();
      }
    }
  } catch (e) {}
})();
renderObservationsTable();
renderChallenges();
updateLauncher(DEFAULT_ANGLE, DEFAULT_HEIGHT);
calculateTheoreticalResults();

const runner = Runner.create();
Runner.run(runner, engine);
Render.run(render);