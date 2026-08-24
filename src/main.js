import Matter from "matter-js";
import "./style.css";

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

// Launcher specs
const PIVOT = { x: ORIGIN_X, y: 495 }; // 45px (3.75m) above ground
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
  launchX: 0,
  launchY: 0,
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
  GROUND_Y - 20,
  60,
  40,
  {
    isStatic: true,
    isSensor: true,
    render: { fillStyle: "#1a243b" }
  }
);

const launcherWheel = Bodies.circle(
  PIVOT.x,
  PIVOT.y + 15,
  18,
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

Composite.add(world, [launcherBase, launcherBarrel, launcherWheel]);

let projectile = null;
let launchTimestamp = 0;

// ==========================================
// DOM ELEMENTS
// ==========================================
const velocitySlider = document.getElementById("velocity");
const angleSlider = document.getElementById("angle");
const gravitySlider = document.getElementById("gravity");

const velocityValue = document.getElementById("velocity-value");
const angleValue = document.getElementById("angle-value");
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

const btnOpenExplorer = document.getElementById("btn-open-explorer");
const btnCloseExplorer = document.getElementById("btn-close-explorer");

const btnOpenTheory = document.getElementById("btn-open-theory");
const btnCloseTheory = document.getElementById("btn-close-theory");

const userProfileBtn = document.getElementById("user-profile-btn");
const btnCloseProfile = document.getElementById("btn-close-profile");

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
  const centerX = PIVOT.x + (BARREL_LENGTH / 2) * Math.cos(rad);
  const centerY = PIVOT.y - (BARREL_LENGTH / 2) * Math.sin(rad);

  Body.setPosition(launcherBarrel, { x: centerX, y: centerY });
  Body.setAngle(launcherBarrel, -rad);
}

// Calculate tip position where projectile spawns
function getBarrelTip(angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  const tipX = PIVOT.x + (BARREL_LENGTH + PROJECTILE_RADIUS) * Math.cos(rad);
  const tipY = PIVOT.y - (BARREL_LENGTH + PROJECTILE_RADIUS) * Math.sin(rad);
  return { x: tipX, y: tipY, rad };
}

// ==========================================
// THEORETICAL CALCULATIONS
// ==========================================
function calculateTheoreticalResults() {
  const v0 = Number(velocitySlider.value);
  const angleDeg = Number(angleSlider.value);
  const g = Number(gravitySlider.value);
  const rad = (angleDeg * Math.PI) / 180;

  const tip = getBarrelTip(angleDeg);
  
  // Heights and offsets relative to origin ground (Origin_X = 80, Ground_Y = 540)
  const h0 = Math.max(0, (GROUND_Y - tip.y) / SCALE);
  const d0 = Math.max(0, (tip.x - ORIGIN_X) / SCALE);

  if (g <= 0.01) {
    maxHeightDisplay.textContent = "∞";
    rangeDisplay.textContent = "∞";
    flightTimeDisplay.textContent = "∞";
    impactVelocityDisplay.textContent = `${v0.toFixed(2)} m/s`;
    return { maxHeight: Infinity, totalRange: Infinity, timeOfFlight: Infinity, impactSpeed: v0 };
  }

  const v0y = v0 * Math.sin(rad);
  const v0x = v0 * Math.cos(rad);

  // Time of flight T: 0.5*g*T^2 - v0y*T - h0 = 0
  const discriminant = v0y * v0y + 2 * g * h0;
  const timeOfFlight = (v0y + Math.sqrt(Math.max(0, discriminant))) / g;

  // Max Height from ground H = h0 + (v0y^2)/(2g)
  const peakFromRelease = (v0y * v0y) / (2 * g);
  const maxHeight = h0 + peakFromRelease;

  // Total Range R = d0 + v0x * T
  const totalRange = d0 + v0x * timeOfFlight;

  // Impact Velocity vf = sqrt(v0^2 + 2*g*h0)
  const impactSpeed = Math.sqrt(v0 * v0 + 2 * g * h0);

  maxHeightDisplay.textContent = `${maxHeight.toFixed(2)} m`;
  rangeDisplay.textContent = `${totalRange.toFixed(2)} m`;
  flightTimeDisplay.textContent = `${timeOfFlight.toFixed(2)} s`;
  impactVelocityDisplay.textContent = `${impactSpeed.toFixed(2)} m/s`;

  return { maxHeight, totalRange, timeOfFlight, impactSpeed, h0, d0 };
}

// ==========================================
// LAUNCH PROJECTILE
// ==========================================
function launchProjectile() {
  const v0 = Number(velocitySlider.value);
  const angleDeg = Number(angleSlider.value);
  const g = Number(gravitySlider.value);
  const rad = (angleDeg * Math.PI) / 180;

  // Save current trail to ghost trails if comparison mode is enabled
  if (simState.currentTrail.length > 5 && simState.showGhosts) {
    simState.ghostTrails.push({
      points: [...simState.currentTrail],
      color: getRandomGhostColor(),
      label: `${angleDeg}° | ${v0.toFixed(0)}m/s | g=${g.toFixed(1)}`
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

  const tip = getBarrelTip(angleDeg);
  simState.launchX = tip.x;
  simState.launchY = tip.y;
  simState.v0x = v0 * Math.cos(rad);
  simState.v0y = v0 * Math.sin(rad);
  simState.g = g;

  const theoretical = calculateTheoreticalResults();
  simState.totalFlightTime = theoretical.timeOfFlight;

  // Create Projectile Rigid Body
  projectile = Bodies.circle(tip.x, tip.y, PROJECTILE_RADIUS, {
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
  if (projectile) {
    Composite.remove(world, projectile);
    projectile = null;
  }

  simState.isRunning = false;
  simState.flightTime = 0;
  simState.currentTrail = [];

  hudTime.textContent = "0.00 s";
  hudHeight.textContent = "0.00 m";
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
  if (!lastPoint || Math.hypot(px - lastPoint.x, py - lastPoint.y) >= 4) {
    simState.currentTrail.push({ x: px, y: py });
  }

  // Check Touchdown at Ground or End of Canvas
  if (py >= GROUND_Y - PROJECTILE_RADIUS || px > CANVAS_WIDTH + 50 || t >= simState.totalFlightTime) {
    const finalY = GROUND_Y - PROJECTILE_RADIUS;
    Body.setPosition(projectile, { x: px, y: finalY });
    simState.currentTrail.push({ x: px, y: finalY });
    simState.isRunning = false;
    checkTargetHit(px);
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

  // 5. DRAW VELOCITY VECTORS
  if (projectile && simState.isRunning && simState.showVectors) {
    drawVelocityVectors(ctx, simState.currentX, simState.currentY);
  }

  // 6. DRAW CANNON DETAILS & ACCENTS
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

// Close modals on backdrop click
[explorerModal, theoryModal, profileModal].forEach(modal => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });
});

// Close modals on Escape key
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    explorerModal.classList.add("hidden");
    theoryModal.classList.add("hidden");
    profileModal.classList.add("hidden");
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

// Mock Sign in button
document.getElementById("btn-mock-signin").addEventListener("click", () => {
  showToast("🔐 Google Classroom sync will be available in v2.1!");
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
updateLauncher(DEFAULT_ANGLE);
calculateTheoreticalResults();

const runner = Runner.create();
Runner.run(runner, engine);
Render.run(render);