/**
 * PhysiX • Experiment 2: Determination of Numerical Aperture of an Optical Fibre
 * Ultra-high clarity, gamified, interactive virtual laboratory.
 * Retina-sharp canvas rendering, customizable laser wavelength (nanometers),
 * interactive in-simulator physical switches, cable couplers, and jig clamp.
 * 100% Zero Emojis compliant.
 */

import { api } from "./api.js";
import { generateLabReportPdf } from "./pdf-export.js";

export function createOpticalFibreExperiment(callbacks = {}) {
  const { onXpAwarded, showToast, getActiveUserId, loadUserProfile, getStoredUserProfile, unlockBadge, isUserAuthenticated, openLoginModal } = callbacks;

  // Scientific Model State
  const state = {
    // Apparatus Setup & Interactive Hardware State
    powerSupplyOn: false,
    lightSourceActive: false,
    fibreInputConnected: false,
    fibreOutputMounted: false,
    screenAligned: true,

    // Optical & Laser Parameters
    wavelengthNm: 650, // Default 650nm (Red Diode), customizable 400 - 950nm
    distanceL: 1.5, // cm (0.5 to 5.0 cm)
    laserPowerMw: 5.0, // mW
    coreIndex: 1.48,
    claddingIndex: 1.41,
    trueNA: 0.4498, // sqrt(1.48^2 - 1.41^2)

    // Current Measured Values
    currentSpotDiameter: 0,
    currentCalculatedNA: 0,
    currentAcceptanceAngleDeg: 0,

    // Matching status
    matchedRing: null,
    isPerfectMatch: false,
    isNearMatch: false,

    // Observations
    observations: [],

    // Mystery Fibre Mode (Challenge 3)
    isMysteryMode: false,
    mysteryFibreId: "alpha",
    mysteryFibres: {
      alpha: { name: "Specimen Alpha (Silica Step-Index)", trueNA: 0.22, core: 1.46, clad: 1.443 },
      beta: { name: "Specimen Beta (Multimode POF)", trueNA: 0.45, core: 1.48, clad: 1.41 },
      gamma: { name: "Specimen Gamma (High-Delta Doped Glass)", trueNA: 0.56, core: 1.55, clad: 1.445 }
    },

    // Challenge States
    challenges: {
      spotMatch: { completed: false, xp: 100, targetDiameter: 2.0 },
      rapidCalib: { completed: false, xp: 125, currentStep: 0, targetSteps: [1.5, 2.5, 3.5], timerSeconds: 40, timerInterval: null, isRunning: false },
      multiSweep: { completed: false, xp: 150, zones: { zone1: false, zone2: false, zone3: false } }
    }
  };

  // Canvas context & dimensions
  let benchCanvas = null;
  let benchCtx = null;
  let screenCanvas = null;
  let screenCtx = null;

  const BENCH_LOGICAL_W = 800;
  const BENCH_LOGICAL_H = 380;
  const SCREEN_LOGICAL_W = 380;
  const SCREEN_LOGICAL_H = 300;

  // Clickable interactive bounding boxes on the bench canvas (in logical coordinates)
  const clickRegions = {
    powerSwitch: { x: 50, y: 236, w: 42, h: 42 },
    laserSwitch: { x: 100, y: 236, w: 42, h: 42 },
    cableCoupler: { x: 175, y: 230, w: 35, h: 40 },
    jigClamp: { x: 235, y: 155, w: 35, h: 40 }
  };

  // Concentric ring diameters in cm
  const CONCENTRIC_RINGS = [1.0, 1.5, 2.0, 2.5, 3.0, 3.5];

  function isSetupComplete() {
    return (
      state.powerSupplyOn &&
      state.lightSourceActive &&
      state.fibreInputConnected &&
      state.fibreOutputMounted &&
      state.screenAligned
    );
  }

  function getEffectiveNA() {
    if (state.isMysteryMode && state.mysteryFibres[state.mysteryFibreId]) {
      return state.mysteryFibres[state.mysteryFibreId].trueNA;
    }
    return state.trueNA;
  }

  // Wavelength spectral color mapping for sharp, accurate laser beam visualization
  function getWavelengthPalette(wl) {
    if (wl < 490) {
      return {
        primaryHex: "#3b82f6",
        beamStart: "rgba(59, 130, 246, 0.95)",
        beamMid: "rgba(96, 165, 250, 0.5)",
        beamEnd: "rgba(37, 99, 235, 0.25)",
        spotCore: "#ffffff",
        spotMid: "rgba(96, 165, 250, 0.9)",
        spotOuter: "rgba(59, 130, 246, 0.4)",
        spotFalloff: "rgba(37, 99, 235, 0.0)",
        spotBorder: "rgba(147, 197, 253, 0.95)",
        ledHex: "#38bdf8",
        label: "Blue (450nm)"
      };
    } else if (wl < 570) {
      return {
        primaryHex: "#10b981",
        beamStart: "rgba(52, 211, 153, 0.95)",
        beamMid: "rgba(16, 185, 129, 0.55)",
        beamEnd: "rgba(5, 150, 105, 0.25)",
        spotCore: "#f0fdf4",
        spotMid: "rgba(52, 211, 153, 0.95)",
        spotOuter: "rgba(16, 185, 129, 0.45)",
        spotFalloff: "rgba(5, 150, 105, 0.0)",
        spotBorder: "rgba(167, 243, 208, 0.95)",
        ledHex: "#34d399",
        label: "Green (532nm)"
      };
    } else if (wl < 700) {
      return {
        primaryHex: "#ef4444",
        beamStart: "rgba(248, 113, 113, 0.95)",
        beamMid: "rgba(239, 68, 68, 0.55)",
        beamEnd: "rgba(220, 38, 38, 0.25)",
        spotCore: "#fef2f2",
        spotMid: "rgba(248, 113, 113, 0.95)",
        spotOuter: "rgba(239, 68, 68, 0.45)",
        spotFalloff: "rgba(220, 38, 38, 0.0)",
        spotBorder: "rgba(254, 202, 202, 0.95)",
        ledHex: "#f87171",
        label: "Red (650nm)"
      };
    } else {
      return {
        primaryHex: "#a855f7",
        beamStart: "rgba(192, 132, 252, 0.95)",
        beamMid: "rgba(168, 85, 247, 0.5)",
        beamEnd: "rgba(147, 51, 234, 0.25)",
        spotCore: "#faf5ff",
        spotMid: "rgba(192, 132, 252, 0.9)",
        spotOuter: "rgba(168, 85, 247, 0.4)",
        spotFalloff: "rgba(147, 51, 234, 0.0)",
        spotBorder: "rgba(233, 213, 255, 0.95)",
        ledHex: "#c084fc",
        label: "Near-IR (850nm)"
      };
    }
  }

  function updateOpticalCalculations() {
    const na = getEffectiveNA();
    // Acceptance Angle: theta_a = arcsin(NA)
    const thetaRad = Math.asin(Math.min(0.999, na));
    state.currentAcceptanceAngleDeg = (thetaRad * 180) / Math.PI;

    if (!isSetupComplete()) {
      state.currentSpotDiameter = 0;
      state.currentCalculatedNA = 0;
      state.matchedRing = null;
      state.isPerfectMatch = false;
      state.isNearMatch = false;
      return;
    }

    // Spot Radius = L * tan(theta_a)
    // Spot Diameter W = 2 * L * tan(theta_a)
    const spotRadiusCm = state.distanceL * Math.tan(thetaRad);
    state.currentSpotDiameter = spotRadiusCm * 2;

    // Numerical Aperture formula: NA = W / sqrt(4*L^2 + W^2)
    const W = state.currentSpotDiameter;
    const L = state.distanceL;
    state.currentCalculatedNA = W / Math.sqrt(4 * L * L + W * W);

    // Check match against concentric circles
    state.matchedRing = null;
    state.isPerfectMatch = false;
    state.isNearMatch = false;

    for (const ring of CONCENTRIC_RINGS) {
      const diff = Math.abs(state.currentSpotDiameter - ring);
      if (diff <= 0.04) {
        state.matchedRing = ring;
        state.isPerfectMatch = true;
        break;
      } else if (diff <= 0.14) {
        state.matchedRing = ring;
        state.isNearMatch = true;
        break;
      }
    }

    // Evaluate live challenges
    checkSpotMatchChallenge();
    checkRapidCalibrationChallenge();
  }

  // ==========================================
  // HIGH-DPI RETINA CANVAS RENDERING
  // ==========================================
  function prepareCanvasDpi(canvas, ctx, logicalW, logicalH) {
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== logicalW * dpr || canvas.height !== logicalH * dpr) {
      canvas.width = logicalW * dpr;
      canvas.height = logicalH * dpr;
    }
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
  }

  function renderBenchCanvas() {
    if (!benchCtx || !benchCanvas) return;
    prepareCanvasDpi(benchCanvas, benchCtx, BENCH_LOGICAL_W, BENCH_LOGICAL_H);

    const ctx = benchCtx;
    const width = BENCH_LOGICAL_W;
    const height = BENCH_LOGICAL_H;
    const palette = getWavelengthPalette(state.wavelengthNm);

    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    ctx.clearRect(0, 0, width, height);

    // 1. Simulator Laboratory Background (Light mode sky-blue / Dark mode navy)
    ctx.fillStyle = isLight ? "#f0f9ff" : "#0a0f1d";
    ctx.fillRect(0, 0, width, height);

    // Fine 0.5px background grid
    ctx.strokeStyle = isLight ? "rgba(186, 230, 253, 0.75)" : "rgba(30, 41, 59, 0.45)";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(width, y + 0.5);
      ctx.stroke();
    }

    // 2. Heavy Dark Blue Optical Bench Rail & Vernier Slider Track
    const railY = height - 70;
    const railStartX = 30;
    const railEndX = width - 30;
    const railH = 24;

    // Dark Blue Metallic Rail Body
    const railGrad = ctx.createLinearGradient(0, railY, 0, railY + railH);
    railGrad.addColorStop(0, "#1e3a8a");
    railGrad.addColorStop(0.3, "#172554");
    railGrad.addColorStop(0.7, "#0f172a");
    railGrad.addColorStop(1, "#1e3a8a");

    ctx.fillStyle = railGrad;
    ctx.fillRect(railStartX, railY, railEndX - railStartX, railH);
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 1.8;
    ctx.strokeRect(railStartX, railY, railEndX - railStartX, railH);

    // Central T-Slot Track Line
    ctx.fillStyle = "#0a0f1d";
    ctx.fillRect(railStartX + 5, railY + 8, railEndX - railStartX - 10, 8);
    ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
    ctx.strokeRect(railStartX + 5, railY + 8, railEndX - railStartX - 10, 8);

    // Razor-Sharp Precision Vernier Millimeter Scale on Rail
    const scaleZeroX = 250; // Exact focal tip position at L = 0.0 cm
    const maxCm = 6.0;
    const pxPerCm = (width - scaleZeroX - 90) / maxCm;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let cm = 0; cm <= 6.0; cm += 0.1) {
      const sx = scaleZeroX + cm * pxPerCm;
      const isWhole = Math.abs(cm - Math.round(cm)) < 0.01;
      const isHalf = Math.abs(cm % 0.5) < 0.01;

      ctx.beginPath();
      if (isWhole) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.moveTo(sx, railY);
        ctx.lineTo(sx, railY - 12);
        ctx.stroke();

        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 10px 'JetBrains Mono', monospace";
        ctx.fillText(`${Math.round(cm)}cm`, sx, railY + 36);
      } else if (isHalf) {
        ctx.strokeStyle = "#93c5fd";
        ctx.lineWidth = 1.2;
        ctx.moveTo(sx, railY);
        ctx.lineTo(sx, railY - 8);
        ctx.stroke();
      } else {
        ctx.strokeStyle = "rgba(147, 197, 253, 0.4)";
        ctx.lineWidth = 0.8;
        ctx.moveTo(sx, railY);
        ctx.lineTo(sx, railY - 4);
        ctx.stroke();
      }
    }

    // 3. Dark Blue Optical Trainer Console Module (Left side)
    const kitX = 40;
    const kitY = railY - 170;
    const kitW = 145;
    const kitH = 170;

    // Dark Blue Console Chassis
    const kitGrad = ctx.createLinearGradient(kitX, kitY, kitX + kitW, kitY + kitH);
    kitGrad.addColorStop(0, "#1e3a8a");
    kitGrad.addColorStop(0.4, "#0f172a");
    kitGrad.addColorStop(1, "#172554");

    ctx.fillStyle = kitGrad;
    ctx.fillRect(kitX, kitY, kitW, kitH);
    ctx.strokeStyle = state.powerSupplyOn ? "#38bdf8" : "#2563eb";
    ctx.lineWidth = 2;
    ctx.strokeRect(kitX, kitY, kitW, kitH);

    // Console Title Banner
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 11px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("OPTICAL TRAINER", kitX + kitW / 2, kitY + 20);

    // Digital OLED Parameter Display Box (Shows reading in Light Mode when isLight is active)
    ctx.fillStyle = isLight ? "#ffffff" : "#020617";
    ctx.fillRect(kitX + 12, kitY + 32, kitW - 24, 46);
    ctx.strokeStyle = state.powerSupplyOn ? (isLight ? "#0284c7" : "rgba(6, 182, 212, 0.6)") : (isLight ? "#bae6fd" : "rgba(255, 255, 255, 0.1)");
    ctx.lineWidth = 1.5;
    ctx.strokeRect(kitX + 12, kitY + 32, kitW - 24, 46);

    if (state.powerSupplyOn) {
      ctx.fillStyle = isLight ? "#0284c7" : palette.ledHex;
      ctx.font = "bold 10px 'JetBrains Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText(`λ: ${state.wavelengthNm} nm`, kitX + 18, kitY + 47);
      ctx.fillStyle = state.lightSourceActive ? (isLight ? "#059669" : "#4ade80") : (isLight ? "#64748b" : "#94a3b8");
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillText(`LASER: ${state.lightSourceActive ? "ACTIVE (5mW)" : "STANDBY"}`, kitX + 18, kitY + 66);
    } else {
      ctx.fillStyle = isLight ? "#64748b" : "#475569";
      ctx.font = "bold 10px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("POWER OFF", kitX + kitW / 2, kitY + 56);
    }

    // Power Rocker Switch (Clickable area)
    const pwrX = clickRegions.powerSwitch.x;
    const pwrY = clickRegions.powerSwitch.y;
    const pwrW = clickRegions.powerSwitch.w;
    const pwrH = clickRegions.powerSwitch.h;

    ctx.fillStyle = state.powerSupplyOn ? "#059669" : "#1e293b";
    ctx.fillRect(pwrX, pwrY, pwrW, pwrH);
    ctx.strokeStyle = state.powerSupplyOn ? "#10b981" : "#3b82f6";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(pwrX, pwrY, pwrW, pwrH);

    ctx.beginPath();
    ctx.arc(pwrX + 12, pwrY + 14, 4, 0, Math.PI * 2);
    ctx.fillStyle = state.powerSupplyOn ? "#10b981" : "#ef4444";
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 9px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("PWR", pwrX + pwrW / 2, pwrY + 30);

    // Laser Toggle Button (Clickable area)
    const lsrX = clickRegions.laserSwitch.x;
    const lsrY = clickRegions.laserSwitch.y;
    const lsrW = clickRegions.laserSwitch.w;
    const lsrH = clickRegions.laserSwitch.h;

    ctx.fillStyle = state.lightSourceActive ? "rgba(239, 68, 68, 0.3)" : "#1e293b";
    ctx.fillRect(lsrX, lsrY, lsrW, lsrH);
    ctx.strokeStyle = state.lightSourceActive ? palette.primaryHex : "#3b82f6";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(lsrX, lsrY, lsrW, lsrH);

    ctx.beginPath();
    ctx.arc(lsrX + 12, lsrY + 14, 4, 0, Math.PI * 2);
    ctx.fillStyle = state.lightSourceActive ? palette.primaryHex : "#60a5fa";
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 9px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("LASER", lsrX + lsrW / 2, lsrY + 30);

    // Optical Output FC/PC Connector Port (Socket on kit right side)
    const portX = kitX + kitW;
    const portY = kitY + 115;

    // Metal chassis flange
    ctx.fillStyle = "#1e3a8a";
    ctx.fillRect(portX - 4, portY - 14, 8, 28);
    ctx.strokeStyle = "#38bdf8";
    ctx.strokeRect(portX - 4, portY - 14, 8, 28);

    // Central cylindrical output barrel
    ctx.fillStyle = "#334155";
    ctx.fillRect(portX + 4, portY - 9, 10, 18);
    ctx.strokeStyle = "#93c5fd";
    ctx.strokeRect(portX + 4, portY - 9, 10, 18);

    // 4. Precision NA Measurement Jig (at scaleZeroX)
    const jigX = scaleZeroX - 16;
    const jigY = railY - 130;
    const jigW = 22;
    const jigH = 130;

    // Dark Blue & Steel Mount
    const jigGrad = ctx.createLinearGradient(jigX, jigY, jigX + jigW, jigY);
    jigGrad.addColorStop(0, "#1e3a8a");
    jigGrad.addColorStop(0.5, "#334155");
    jigGrad.addColorStop(1, "#0f172a");

    ctx.fillStyle = jigGrad;
    ctx.fillRect(jigX, jigY, jigW, jigH);
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(jigX, jigY, jigW, jigH);

    // Output Collimation Ferrule
    const tipX = scaleZeroX;
    const tipY = jigY + 45;

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(jigX + jigW, tipY - 5, 14, 10);
    ctx.strokeStyle = "#f59e0b";
    ctx.strokeRect(jigX + jigW, tipY - 5, 14, 10);

    // Jig Thumbscrew Clamp
    ctx.fillStyle = state.fibreOutputMounted ? "#10b981" : "#f59e0b";
    ctx.fillRect(jigX + 4, jigY - 12, 14, 12);
    ctx.strokeStyle = "#ffffff";
    ctx.strokeRect(jigX + 4, jigY - 12, 14, 12);

    // 5. HIGH-FIDELITY OPTICAL FIBRE PATCH CABLE (3D Layered Tube with Strain Reliefs)
    const cableStartPt = { x: portX + 14, y: portY };
    const cableEndPt = { x: jigX, y: tipY };

    if (state.fibreInputConnected && state.fibreOutputMounted) {
      // Natural physical catenary / S-curve control points
      const cp1 = { x: cableStartPt.x + 35, y: cableStartPt.y + 60 };
      const cp2 = { x: cableEndPt.x - 35, y: cableEndPt.y + 70 };

      // 1. Soft Drop Shadow cast on rail bench
      ctx.beginPath();
      ctx.moveTo(cableStartPt.x, cableStartPt.y + 6);
      ctx.bezierCurveTo(cp1.x, cp1.y + 12, cp2.x, cp2.y + 12, cableEndPt.x, cableEndPt.y + 6);
      ctx.strokeStyle = isLight ? "rgba(2, 132, 199, 0.15)" : "rgba(0, 0, 0, 0.4)";
      ctx.lineWidth = 8;
      ctx.stroke();

      // 2. Outer Protective Yellow Polymer Buffer Jacket
      ctx.beginPath();
      ctx.moveTo(cableStartPt.x, cableStartPt.y);
      ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, cableEndPt.x, cableEndPt.y);
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.stroke();

      // 3. Specular 3D Cylindrical Highlight Curve
      ctx.beginPath();
      ctx.moveTo(cableStartPt.x, cableStartPt.y - 1.5);
      ctx.bezierCurveTo(cp1.x, cp1.y - 1.5, cp2.x, cp2.y - 1.5, cableEndPt.x, cableEndPt.y - 1.5);
      ctx.strokeStyle = "rgba(254, 240, 138, 0.75)";
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // 4. Glowing Active Internal Optical Core Ray
      if (state.lightSourceActive && state.powerSupplyOn) {
        ctx.beginPath();
        ctx.moveTo(cableStartPt.x, cableStartPt.y);
        ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, cableEndPt.x, cableEndPt.y);
        ctx.strokeStyle = palette.primaryHex;
        ctx.lineWidth = 3;
        ctx.stroke();

        // High-intensity white laser core line
        ctx.beginPath();
        ctx.moveTo(cableStartPt.x, cableStartPt.y);
        ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, cableEndPt.x, cableEndPt.y);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Strain relief rubber boot at trainer port
      ctx.fillStyle = "#1e3a8a";
      ctx.fillRect(cableStartPt.x - 2, cableStartPt.y - 4, 8, 8);
      ctx.strokeStyle = "#38bdf8";
      ctx.strokeRect(cableStartPt.x - 2, cableStartPt.y - 4, 8, 8);

      // Strain relief boot at jig mount
      ctx.fillStyle = "#1e3a8a";
      ctx.fillRect(cableEndPt.x - 6, cableEndPt.y - 4, 8, 8);
      ctx.strokeStyle = "#38bdf8";
      ctx.strokeRect(cableEndPt.x - 6, cableEndPt.y - 4, 8, 8);

    } else if (state.fibreInputConnected && !state.fibreOutputMounted) {
      // Cable connected to port, but unmounted from jig (dangles downward)
      ctx.beginPath();
      ctx.moveTo(cableStartPt.x, cableStartPt.y);
      ctx.bezierCurveTo(
        cableStartPt.x + 30, cableStartPt.y + 40,
        cableStartPt.x + 50, cableStartPt.y + 90,
        cableStartPt.x + 45, cableStartPt.y + 110
      );
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 6;
      ctx.stroke();

      // Dangling metallic ferrule
      ctx.fillStyle = "#cbd5e1";
      ctx.fillRect(cableStartPt.x + 42, cableStartPt.y + 110, 8, 14);
      ctx.strokeStyle = "#f59e0b";
      ctx.strokeRect(cableStartPt.x + 42, cableStartPt.y + 110, 8, 14);

    } else if (!state.fibreInputConnected && state.fibreOutputMounted) {
      // Mounted in jig, but unplugged from port
      ctx.beginPath();
      ctx.moveTo(cableEndPt.x, cableEndPt.y);
      ctx.bezierCurveTo(
        cableEndPt.x - 30, cableEndPt.y + 40,
        cableEndPt.x - 45, cableEndPt.y + 85,
        cableEndPt.x - 40, cableEndPt.y + 110
      );
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 6;
      ctx.stroke();

      // Dangling metallic FC connector
      ctx.fillStyle = "#1e3a8a";
      ctx.fillRect(cableEndPt.x - 46, cableEndPt.y + 110, 12, 14);
      ctx.strokeStyle = "#38bdf8";
      ctx.strokeRect(cableEndPt.x - 46, cableEndPt.y + 110, 12, 14);
    }

    // 6. Moveable Screen Carrier Slider on Rail (Dark Blue Slider)
    const screenPosX = scaleZeroX + state.distanceL * pxPerCm;
    const screenY = jigY - 30;
    const screenW = 12;
    const screenH = 175;

    // Dark Blue Carrier Base Slider Block on Rail
    ctx.fillStyle = "#1e3a8a";
    ctx.fillRect(screenPosX - 14, railY - 18, 28, 18);
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.8;
    ctx.strokeRect(screenPosX - 14, railY - 18, 28, 18);

    // Vernier Precision Pointer pointing down at the scale
    ctx.beginPath();
    ctx.moveTo(screenPosX, railY);
    ctx.lineTo(screenPosX - 5, railY - 10);
    ctx.lineTo(screenPosX + 5, railY - 10);
    ctx.closePath();
    ctx.fillStyle = "#ef4444";
    ctx.fill();

    // Matte White Translucent Target Screen
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(screenPosX - 4, screenY, screenW, screenH);
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(screenPosX - 4, screenY, screenW, screenH);

    // 7. Diverging Laser Cone Propagation (when active)
    if (isSetupComplete()) {
      const spotRadiusPx = (state.currentSpotDiameter / 2) * pxPerCm;

      // Volumetric Laser Cone Gradient
      const coneGrad = ctx.createLinearGradient(scaleZeroX + 14, tipY, screenPosX, tipY);
      coneGrad.addColorStop(0, palette.beamStart);
      coneGrad.addColorStop(0.35, palette.beamMid);
      coneGrad.addColorStop(1, palette.beamEnd);

      ctx.beginPath();
      ctx.moveTo(scaleZeroX + 14, tipY);
      ctx.lineTo(screenPosX - 4, tipY - spotRadiusPx);
      ctx.lineTo(screenPosX - 4, tipY + spotRadiusPx);
      ctx.closePath();
      ctx.fillStyle = coneGrad;
      ctx.fill();

      // Sharp Outer Boundary Ray Lines
      ctx.beginPath();
      ctx.strokeStyle = palette.primaryHex;
      ctx.lineWidth = 1.5;
      ctx.moveTo(scaleZeroX + 14, tipY);
      ctx.lineTo(screenPosX - 4, tipY - spotRadiusPx);
      ctx.moveTo(scaleZeroX + 14, tipY);
      ctx.lineTo(screenPosX - 4, tipY + spotRadiusPx);
      ctx.stroke();

      // Central Optical Core Axis Ray
      ctx.beginPath();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.moveTo(scaleZeroX + 14, tipY);
      ctx.lineTo(screenPosX - 4, tipY);
      ctx.stroke();

      // Screen Impact Edge Line
      ctx.beginPath();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.moveTo(screenPosX - 4, tipY - spotRadiusPx);
      ctx.lineTo(screenPosX - 4, tipY + spotRadiusPx);
      ctx.stroke();
    }

    // 8. Distance Callout Dimension Line & Badge
    ctx.beginPath();
    ctx.strokeStyle = isLight ? "#0284c7" : "#06b6d4";
    ctx.setLineDash([4, 3]);
    ctx.lineWidth = 1.2;
    ctx.moveTo(scaleZeroX + 14, tipY - 40);
    ctx.lineTo(screenPosX - 4, tipY - 40);
    ctx.stroke();
    ctx.setLineDash([]);

    // Distance Badge above screen (In-Simulator Distance Reading)
    ctx.fillStyle = isLight ? "#ffffff" : "rgba(15, 23, 42, 0.95)";
    ctx.fillRect(screenPosX - 36, screenY - 30, 72, 22);
    ctx.strokeStyle = isLight ? "#0284c7" : "#06b6d4";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(screenPosX - 36, screenY - 30, 72, 22);

    ctx.fillStyle = isLight ? "#0284c7" : "#38bdf8";
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`L = ${state.distanceL.toFixed(2)} cm`, screenPosX, screenY - 19);
  }

  function renderScreenCanvas() {
    if (!screenCtx || !screenCanvas) return;
    prepareCanvasDpi(screenCanvas, screenCtx, SCREEN_LOGICAL_W, SCREEN_LOGICAL_H);

    const ctx = screenCtx;
    const width = SCREEN_LOGICAL_W;
    const height = SCREEN_LOGICAL_H;
    const cx = width / 2;
    const cy = height / 2;
    const palette = getWavelengthPalette(state.wavelengthNm);

    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    ctx.clearRect(0, 0, width, height);

    // 1. Target Screen Canvas Frame
    ctx.fillStyle = isLight ? "#f0f9ff" : "#0a0f1d";
    ctx.fillRect(0, 0, width, height);

    // 2. High-Contrast Pure White Frosted Target Disc
    const screenRadius = Math.min(width, height) * 0.44;
    ctx.beginPath();
    ctx.arc(cx, cy, screenRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = isLight ? "#0284c7" : "#1e293b";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Scale Factor: 4.0 cm maps to screenRadius * 0.88
    const pxPerCmOnScreen = (screenRadius * 0.88) / 2.0;

    // 3. High-Contrast Precision Crosshairs
    ctx.beginPath();
    ctx.strokeStyle = isLight ? "rgba(2, 132, 199, 0.35)" : "rgba(30, 41, 59, 0.4)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(cx - screenRadius, cy);
    ctx.lineTo(cx + screenRadius, cy);
    ctx.moveTo(cx, cy - screenRadius);
    ctx.lineTo(cx, cy + screenRadius);
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. Laser-Etched Concentric Calibration Rings & Crisp Labels
    CONCENTRIC_RINGS.forEach((diameterCm) => {
      const radiusPx = (diameterCm / 2) * pxPerCmOnScreen;
      const isMatched = state.matchedRing === diameterCm && state.isPerfectMatch;
      const isNear = state.matchedRing === diameterCm && state.isNearMatch;

      ctx.beginPath();
      ctx.arc(cx, cy, radiusPx, 0, Math.PI * 2);

      if (isMatched) {
        ctx.strokeStyle = "#059669";
        ctx.lineWidth = 3.5;
      } else if (isNear) {
        ctx.strokeStyle = "#d97706";
        ctx.lineWidth = 2.5;
      } else {
        ctx.strokeStyle = isLight ? "rgba(2, 132, 199, 0.65)" : "rgba(30, 41, 59, 0.75)";
        ctx.lineWidth = 1.4;
      }

      ctx.stroke();

      // Numerical Diameter Label Tag on Ring
      ctx.fillStyle = isMatched ? "#047857" : (isNear ? "#b45309" : (isLight ? "#0f172a" : "#1e293b"));
      ctx.font = isMatched ? "bold 11px 'JetBrains Mono', monospace" : "10px 'JetBrains Mono', monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(`${diameterCm.toFixed(1)} cm`, cx + radiusPx + 4, cy - 3);
    });

    // 5. Emerging Laser Light Spot (Accurate Spectral Gradient & Sharp Edge)
    if (isSetupComplete() && state.currentSpotDiameter > 0) {
      const spotRadiusPx = (state.currentSpotDiameter / 2) * pxPerCmOnScreen;

      // Radial Spectral Gaussian Gradient
      const spotGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(1, spotRadiusPx));
      spotGrad.addColorStop(0, palette.spotCore);
      spotGrad.addColorStop(0.28, palette.spotMid);
      spotGrad.addColorStop(0.72, palette.spotOuter);
      spotGrad.addColorStop(0.95, palette.spotFalloff);

      ctx.beginPath();
      ctx.arc(cx, cy, spotRadiusPx, 0, Math.PI * 2);
      ctx.fillStyle = spotGrad;
      ctx.fill();

      // Sharp Defined Boundary Perimeter Ring
      ctx.beginPath();
      ctx.arc(cx, cy, spotRadiusPx, 0, Math.PI * 2);
      ctx.strokeStyle = palette.spotBorder;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Center Precision Optical Dot
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    } else {
      // Apparatus Offline Notice
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 12px 'Outfit', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("APPARATUS OFFLINE", cx, cy - 8);
      ctx.font = "11px sans-serif";
      ctx.fillText("Turn ON Power, Laser & Cable", cx, cy + 10);
    }
  }

  function renderAll() {
    updateOpticalCalculations();
    renderBenchCanvas();
    renderScreenCanvas();
    updateDomHud();
    renderChallengesDom();
  }

  // ==========================================
  // DOM TELEMETRY & HARDWARE CONTROLS UPDATE
  // ==========================================
  function updateDomHud() {
    const elDistance = document.getElementById("of-hud-distance");
    const elSpot = document.getElementById("of-hud-spot");
    const elNa = document.getElementById("of-hud-na");
    const elAngle = document.getElementById("of-hud-angle");
    const elStatusBadge = document.getElementById("of-match-badge");
    const elDistanceSlider = document.getElementById("of-slider-distance");
    const elDistanceVal = document.getElementById("of-distance-val");
    const elWlVal = document.getElementById("of-wavelength-val");
    const elWlSlider = document.getElementById("of-slider-wavelength");

    if (elDistance) elDistance.textContent = `${state.distanceL.toFixed(2)} cm`;
    if (elDistanceVal) elDistanceVal.textContent = `${state.distanceL.toFixed(2)} cm`;
    if (elWlVal) elWlVal.textContent = `${state.wavelengthNm} nm`;
    if (elWlSlider && Number(elWlSlider.value) !== state.wavelengthNm) {
      elWlSlider.value = state.wavelengthNm;
    }

    if (elDistanceSlider && Number(elDistanceSlider.value) !== state.distanceL) {
      elDistanceSlider.value = state.distanceL;
    }

    if (isSetupComplete()) {
      if (elSpot) elSpot.textContent = `${state.currentSpotDiameter.toFixed(2)} cm`;
      if (elNa) elNa.textContent = state.currentCalculatedNA.toFixed(4);
      if (elAngle) elAngle.textContent = `${state.currentAcceptanceAngleDeg.toFixed(1)}°`;

      if (elStatusBadge) {
        if (state.isPerfectMatch) {
          elStatusBadge.className = "of-status-pill pill-perfect";
          elStatusBadge.innerHTML = `<svg class="svg-icon svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> PERFECT MATCH (${state.matchedRing.toFixed(1)} cm)`;
        } else if (state.isNearMatch) {
          elStatusBadge.className = "of-status-pill pill-near";
          elStatusBadge.innerHTML = `<svg class="svg-icon svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> Almost There (${state.matchedRing.toFixed(1)} cm)`;
        } else {
          elStatusBadge.className = "of-status-pill pill-normal";
          elStatusBadge.textContent = "Adjust distance L to match concentric circle";
        }
      }
    } else {
      if (elSpot) elSpot.textContent = "0.00 cm";
      if (elNa) elNa.textContent = "0.0000";
      if (elAngle) elAngle.textContent = "0.0°";
      if (elStatusBadge) {
        elStatusBadge.className = "of-status-pill pill-warning";
        elStatusBadge.textContent = "Apparatus Setup Incomplete";
      }
    }

    // Update Hardware Switch States & LEDs in DOM
    updateHardwareSwitchesDom();
    updateProcedureRibbonDom();
  }

  function updateHardwareSwitchesDom() {
    const pwrBtn = document.getElementById("of-btn-power-switch");
    const pwrState = document.getElementById("of-state-power");
    const pwrLed = document.getElementById("of-led-power");

    const lsrBtn = document.getElementById("of-btn-laser-switch");
    const lsrState = document.getElementById("of-state-laser");
    const lsrLed = document.getElementById("of-led-laser");

    const cableBtn = document.getElementById("of-btn-cable-toggle");
    const cableState = document.getElementById("of-state-cable");

    const jigBtn = document.getElementById("of-btn-jig-toggle");
    const jigState = document.getElementById("of-state-jig");

    if (pwrBtn) pwrBtn.className = `of-hw-switch of-power-switch ${state.powerSupplyOn ? "active" : ""}`;
    if (pwrState) pwrState.textContent = state.powerSupplyOn ? "ON" : "OFF";
    if (pwrLed) pwrLed.className = `hw-switch-led ${state.powerSupplyOn ? "led-green" : "led-off"}`;

    if (lsrBtn) lsrBtn.className = `of-hw-switch of-laser-switch ${state.lightSourceActive ? "active" : ""}`;
    if (lsrState) lsrState.textContent = state.lightSourceActive ? "ON" : "OFF";
    if (lsrLed) lsrLed.className = `hw-switch-led ${state.lightSourceActive ? "led-red" : "led-off"}`;

    if (cableBtn) cableBtn.className = `of-hw-switch of-cable-switch ${state.fibreInputConnected ? "active" : ""}`;
    if (cableState) cableState.textContent = state.fibreInputConnected ? "Coupled" : "Unplugged";

    if (jigBtn) jigBtn.className = `of-hw-switch of-jig-switch ${state.fibreOutputMounted ? "active" : ""}`;
    if (jigState) jigState.textContent = state.fibreOutputMounted ? "Locked" : "Unlocked";

    // Wavelength chip buttons
    document.querySelectorAll(".of-wl-chip").forEach(chip => {
      const wl = Number(chip.getAttribute("data-wl"));
      if (wl === state.wavelengthNm) chip.classList.add("active");
      else chip.classList.remove("active");
    });
  }

  function updateProcedureRibbonDom() {
    const step1 = document.getElementById("of-step-indicator-1");
    const step2 = document.getElementById("of-step-indicator-2");
    const step3 = document.getElementById("of-step-indicator-3");
    const step4 = document.getElementById("of-step-indicator-4");

    if (step1) {
      if (state.powerSupplyOn) step1.className = "of-proc-step step-done";
      else step1.className = "of-proc-step step-current";
    }

    if (step2) {
      if (state.lightSourceActive) step2.className = "of-proc-step step-done";
      else if (state.powerSupplyOn) step2.className = "of-proc-step step-current";
      else step2.className = "of-proc-step";
    }

    if (step3) {
      if (state.fibreInputConnected) step3.className = "of-proc-step step-done";
      else if (state.lightSourceActive) step3.className = "of-proc-step step-current";
      else step3.className = "of-proc-step";
    }

    if (step4) {
      if (state.fibreOutputMounted) step4.className = "of-proc-step step-done";
      else if (state.fibreInputConnected) step4.className = "of-proc-step step-current";
      else step4.className = "of-proc-step";
    }
  }

  // ==========================================
  // OBSERVATION RECORDING & MEAN NA
  // ==========================================
  function recordObservation() {
    if (!isSetupComplete()) {
      showToast("Please complete apparatus setup before recording observations!");
      return;
    }

    const L = state.distanceL;
    const W = state.currentSpotDiameter;
    const na = state.currentCalculatedNA;
    const thetaDeg = state.currentAcceptanceAngleDeg;
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];

    const obsEntry = {
      id: Date.now(),
      reading: state.observations.length + 1,
      L: Number(L.toFixed(2)),
      W: Number(W.toFixed(2)),
      na: Number(na.toFixed(4)),
      theta: Number(thetaDeg.toFixed(1)),
      wavelength: state.wavelengthNm,
      time: timeStr
    };

    state.observations.push(obsEntry);
    saveObservationsToStorage();
    renderObservationsDom();
    checkMultiSweepChallenge();

    showToast(`Observation #${obsEntry.reading} Captured: L=${obsEntry.L}cm, W=${obsEntry.W}cm, NA=${obsEntry.na}`);

    // Sync to backend
    api.addObservation(getActiveUserId(), {
      experiment: "Optical Fibre NA",
      ...obsEntry
    }).catch(() => { });
  }

  function clearObservations() {
    state.observations = [];
    saveObservationsToStorage();
    renderObservationsDom();
    checkMultiSweepChallenge();
    showToast("Optical fibre observations table cleared.");
  }

  function saveObservationsToStorage() {
    try {
      localStorage.setItem("physix_of_observations", JSON.stringify(state.observations));
    } catch (e) { }
  }

  function loadObservationsFromStorage() {
    try {
      const saved = localStorage.getItem("physix_of_observations");
      if (saved) {
        state.observations = JSON.parse(saved);
        checkMultiSweepChallenge();
      }
    } catch (e) { }
  }

  function renderObservationsDom() {
    const tbody = document.getElementById("of-obs-tbody");
    const emptyState = document.getElementById("of-obs-empty");
    const table = document.getElementById("of-obs-table");
    const countBadge = document.getElementById("of-obs-count-badge");
    const meanNaDisplay = document.getElementById("of-mean-na");
    const meanThetaDisplay = document.getElementById("of-mean-theta");
    const accuracyDisplay = document.getElementById("of-accuracy-pct");

    if (countBadge) {
      countBadge.textContent = `${state.observations.length} Reading${state.observations.length === 1 ? "" : "s"}`;
    }

    if (state.observations.length === 0) {
      if (emptyState) emptyState.classList.remove("hidden");
      if (table) table.classList.add("hidden");
      if (tbody) tbody.innerHTML = "";
      if (meanNaDisplay) meanNaDisplay.textContent = "--";
      if (meanThetaDisplay) meanThetaDisplay.textContent = "--";
      if (accuracyDisplay) accuracyDisplay.textContent = "--";
      return;
    }

    if (emptyState) emptyState.classList.add("hidden");
    if (table) table.classList.remove("hidden");

    let sumNA = 0;
    let sumTheta = 0;

    if (tbody) {
      tbody.innerHTML = state.observations.map((obs, idx) => {
        sumNA += obs.na;
        sumTheta += obs.theta;
        const isLatest = idx === state.observations.length - 1;
        return `
          <tr class="${isLatest ? 'obs-row-highlight' : ''}">
            <td class="obs-run-num">#${obs.reading}</td>
            <td><strong>${obs.L.toFixed(2)} cm</strong></td>
            <td><span style="color:#f87171; font-weight:700;">${obs.W.toFixed(2)} cm</span></td>
            <td><strong style="color:#06b6d4;">${obs.na.toFixed(4)}</strong></td>
            <td><span style="color:#c4b5fd;">${obs.theta.toFixed(1)}°</span></td>
            <td style="color:#94a3b8; font-size:11px;">${obs.time}</td>
          </tr>
        `;
      }).join("");
    }

    const meanNA = sumNA / state.observations.length;
    const meanTheta = sumTheta / state.observations.length;
    const theoreticalNA = getEffectiveNA();
    const errorPct = Math.abs((meanNA - theoreticalNA) / theoreticalNA) * 100;
    const accuracyPct = Math.max(0, 100 - errorPct);

    if (meanNaDisplay) meanNaDisplay.textContent = meanNA.toFixed(4);
    if (meanThetaDisplay) meanThetaDisplay.textContent = `${meanTheta.toFixed(1)}°`;
    if (accuracyDisplay) accuracyDisplay.textContent = `${accuracyPct.toFixed(1)}%`;
  }

  function exportObservationsCsv() {
    if (state.observations.length === 0) {
      if (showToast) showToast("No optical fibre readings recorded yet. Record observations first!");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Reading_ID,Screen_Distance_L_cm,Spot_Diameter_W_cm,Numerical_Aperture_NA,Acceptance_Angle_deg,Theoretical_POF_NA,Timestamp\n";

    state.observations.forEach((obs) => {
      csvContent += `${obs.reading},${obs.L.toFixed(2)},${obs.W.toFixed(2)},${obs.na.toFixed(4)},${obs.theta.toFixed(1)},${getEffectiveNA().toFixed(4)},"${obs.time}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PhysiX_Optical_Fibre_NA_Observations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (showToast) showToast("Exported Optical Fibre observations to CSV.");
  }

  function exportObservationsPdf() {
    if (state.observations.length === 0) {
      if (showToast) showToast("No optical fibre readings recorded yet. Record observations first!");
      return;
    }

    const profile = getStoredUserProfile ? getStoredUserProfile() : {};
    const studentName = profile.name || "Student Physicist";
    const studentEmail = getActiveUserId && getActiveUserId() !== "guest" ? `${getActiveUserId()}` : "Guest Mode";

    let sumNA = 0;
    let sumTheta = 0;
    state.observations.forEach(o => {
      sumNA += o.na;
      sumTheta += o.theta;
    });
    const meanNA = sumNA / state.observations.length;
    const meanTheta = sumTheta / state.observations.length;
    const theoreticalNA = getEffectiveNA();
    const errorPct = Math.abs((meanNA - theoreticalNA) / theoreticalNA) * 100;
    const accuracyPct = Math.max(0, 100 - errorPct);

    const columns = ["Reading #", "Screen Distance L", "Spot Diameter W", "Numerical Aperture (NA)", "Acceptance Angle (θ_a)", "Benchmark POF NA", "Logged At"];

    const rows = state.observations.map(obs => [
      `#${obs.reading}`,
      `${obs.L.toFixed(2)} cm`,
      `${obs.W.toFixed(2)} cm`,
      obs.na.toFixed(4),
      `${obs.theta.toFixed(1)}°`,
      theoreticalNA.toFixed(4),
      obs.time
    ]);

    try {
      generateLabReportPdf({
        labTitle: "Numerical Aperture of an Optical Fibre Logbook",
        labSubtitle: "Optoelectronic Laser Divergence, Total Internal Reflection & Acceptance Angle Dynamics",
        experimentCode: "EXP-02",
        studentName,
        studentEmail,
        studentRole: profile.occ || "Student Physicist",
        summaryMetrics: [
          { label: "Total Readings", value: `${state.observations.length} Entries`, color: [14, 165, 233] },
          { label: "Mean Numerical Aperture", value: `${meanNA.toFixed(4)}`, color: [6, 182, 212] },
          { label: "Mean Acceptance Angle", value: `${meanTheta.toFixed(1)}°`, color: [139, 92, 246] },
          { label: "Experimental Accuracy", value: `${accuracyPct.toFixed(1)}%`, color: [16, 185, 129] }
        ],
        columns,
        rows,
        filename: `PhysiX_Optical_Fibre_NA_Report_${Date.now()}.pdf`,
        orientation: "landscape"
      });

      if (showToast) showToast("Generated and downloaded official PhysiX PDF report.");
    } catch (err) {
      console.error("Optical Fibre PDF export failed:", err);
      if (showToast) showToast("Failed to generate PDF report. Please try again.");
    }
  }

  // ==========================================
  // GAMIFIED CHALLENGES
  // ==========================================
  function checkSpotMatchChallenge() {
    if (isUserAuthenticated && !isUserAuthenticated()) return;
    const ch = state.challenges.spotMatch;
    if (ch.completed || !isSetupComplete()) return;

    if (state.isPerfectMatch && state.matchedRing === ch.targetDiameter) {
      ch.completed = true;
      saveChallengesToStorage();
      renderChallengesDom();
      if (onXpAwarded) onXpAwarded(ch.xp, `Spot Match Master (${ch.targetDiameter} cm)`);
      if (unlockBadge) unlockBadge("badge-of-spot-match", "Spot Match Master (Concentric Laser Alignment)");
      showToast(`Challenge Accomplished: Spot Match (${ch.targetDiameter} cm) +${ch.xp} XP!`);
    }
  }

  function startRapidCalibration() {
    if (isUserAuthenticated && !isUserAuthenticated()) {
      if (openLoginModal) openLoginModal("Please sign in to start the 40s Rapid Calibration challenge and earn XP!");
      return;
    }
    const ch = state.challenges.rapidCalib;
    if (ch.isRunning || ch.completed) return;

    ch.isRunning = true;
    ch.currentStep = 0;
    ch.timerSeconds = 40;

    if (ch.timerInterval) clearInterval(ch.timerInterval);
    ch.timerInterval = setInterval(() => {
      ch.timerSeconds--;
      const elTimer = document.getElementById("of-rapid-timer");
      if (elTimer) elTimer.textContent = `${ch.timerSeconds}s`;

      if (ch.timerSeconds <= 0) {
        clearInterval(ch.timerInterval);
        ch.isRunning = false;
        showToast("Rapid Calibration time expired! Try again.");
        renderChallengesDom();
      }
    }, 1000);

    showToast("Rapid 3-Point Calibration Started! Match 1.5cm, 2.5cm, and 3.5cm rings!");
    renderChallengesDom();
  }

  function checkRapidCalibrationChallenge() {
    if (isUserAuthenticated && !isUserAuthenticated()) return;
    const ch = state.challenges.rapidCalib;
    if (!ch.isRunning || ch.completed || !isSetupComplete()) return;

    const targetRing = ch.targetSteps[ch.currentStep];
    if (state.isPerfectMatch && state.matchedRing === targetRing) {
      ch.currentStep++;
      if (ch.currentStep >= ch.targetSteps.length) {
        clearInterval(ch.timerInterval);
        ch.isRunning = false;
        ch.completed = true;
        saveChallengesToStorage();
        renderChallengesDom();
        if (onXpAwarded) onXpAwarded(ch.xp, "Rapid 3-Point Laser Calibration");
        if (unlockBadge) unlockBadge("badge-of-rapid-calib", "Laser Calibration Virtuoso (40s Speedrun)");
        showToast(`Challenge Accomplished: Rapid Calibration Run +${ch.xp} XP!`);
      } else {
        const nextRing = ch.targetSteps[ch.currentStep];
        showToast(`Step ${ch.currentStep}/3 Aligned! Next target: ${nextRing} cm!`);
        renderChallengesDom();
      }
    }
  }

  function checkMultiSweepChallenge() {
    if (isUserAuthenticated && !isUserAuthenticated()) return;
    const ch = state.challenges.multiSweep;
    if (!ch) return;

    let hasZ1 = false;
    let hasZ2 = false;
    let hasZ3 = false;

    state.observations.forEach(obs => {
      if (obs.L <= 1.5) hasZ1 = true;
      else if (obs.L >= 2.0 && obs.L <= 2.5) hasZ2 = true;
      else if (obs.L >= 3.0) hasZ3 = true;
    });

    ch.zones = { zone1: hasZ1, zone2: hasZ2, zone3: hasZ3 };

    if (!ch.completed && hasZ1 && hasZ2 && hasZ3) {
      ch.completed = true;
      saveChallengesToStorage();
      renderChallengesDom();
      if (onXpAwarded) onXpAwarded(ch.xp, "Multi-Distance NA Invariance Sweep");
      if (unlockBadge) unlockBadge("badge-of-multi-sweep", "NA Invariance Champion (3-Zone Distance Sweep)");
      showToast(`Challenge Accomplished: Multi-Distance Data Sweep +${ch.xp} XP!`);
    } else {
      renderChallengesDom();
    }
  }

  function saveChallengesToStorage() {
    try {
      localStorage.setItem("physix_of_challenges", JSON.stringify(state.challenges));
    } catch (e) { }
  }

  function loadChallengesFromStorage() {
    try {
      const saved = localStorage.getItem("physix_of_challenges");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.spotMatch) state.challenges.spotMatch.completed = parsed.spotMatch.completed;
        if (parsed.rapidCalib) state.challenges.rapidCalib.completed = parsed.rapidCalib.completed;
        if (parsed.multiSweep) {
          state.challenges.multiSweep.completed = parsed.multiSweep.completed;
          if (parsed.multiSweep.zones) state.challenges.multiSweep.zones = parsed.multiSweep.zones;
        }
      }
    } catch (e) { }
  }

  function renderChallengesDom() {
    const isAuth = isUserAuthenticated ? isUserAuthenticated() : true;
    const challengesCard = document.querySelector("#exp-optical-section .challenges-card");

    if (!isAuth) {
      challengesCard?.classList.add("challenges-locked");
      const xpPill = document.getElementById("of-user-total-challenge-xp");
      const donePill = document.getElementById("of-challenges-completed-count");
      if (xpPill) xpPill.textContent = "+375 XP Available";
      if (donePill) donePill.innerHTML = `<span class="lock-indicator-badge">🔒 Sign In Required</span>`;

      const tag1 = document.getElementById("of-ch-tag-1");
      const tag2 = document.getElementById("of-ch-tag-2");
      const tag3 = document.getElementById("of-ch-tag-3");
      [tag1, tag2, tag3].forEach(tag => {
        if (tag) {
          tag.className = "challenge-status-tag locked";
          tag.innerHTML = `<svg class="svg-icon svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> Locked`;
        }
      });
      return;
    }

    challengesCard?.classList.remove("challenges-locked");

    // Challenge 1
    const card1 = document.getElementById("of-ch-card-1");
    const tag1 = document.getElementById("of-ch-tag-1");
    if (state.challenges.spotMatch.completed) {
      card1?.classList.add("completed");
      if (tag1) {
        tag1.className = "challenge-status-tag completed";
        tag1.innerHTML = `<svg class="svg-icon svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Complete (+100 XP)`;
      }
    } else {
      card1?.classList.remove("completed");
      if (tag1) {
        tag1.className = "challenge-status-tag pending";
        tag1.textContent = `Target: ${state.challenges.spotMatch.targetDiameter.toFixed(1)} cm`;
      }
    }

    // Challenge 2
    const card2 = document.getElementById("of-ch-card-2");
    const tag2 = document.getElementById("of-ch-tag-2");
    const btnStartRapid = document.getElementById("of-btn-start-rapid");
    if (state.challenges.rapidCalib.completed) {
      card2?.classList.add("completed");
      if (tag2) {
        tag2.className = "challenge-status-tag completed";
        tag2.innerHTML = `<svg class="svg-icon svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Complete (+125 XP)`;
      }
      if (btnStartRapid) btnStartRapid.style.display = "none";
    } else if (state.challenges.rapidCalib.isRunning) {
      if (tag2) {
        tag2.className = "challenge-status-tag pending";
        const target = state.challenges.rapidCalib.targetSteps[state.challenges.rapidCalib.currentStep];
        tag2.textContent = `Align ${target}cm (${state.challenges.rapidCalib.currentStep + 1}/3)`;
      }
    } else {
      card2?.classList.remove("completed");
      if (tag2) {
        tag2.className = "challenge-status-tag pending";
        tag2.textContent = "Ready to start (40s)";
      }
    }

    // Challenge 3: Multi-Distance Data Sweep
    const card3 = document.getElementById("of-ch-card-3");
    const tag3 = document.getElementById("of-ch-tag-3");
    const z1El = document.getElementById("of-zone-1");
    const z2El = document.getElementById("of-zone-2");
    const z3El = document.getElementById("of-zone-3");

    const ch3 = state.challenges.multiSweep;
    if (ch3) {
      if (z1El) z1El.className = `of-sweep-zone ${ch3.zones?.zone1 ? "active" : ""}`;
      if (z2El) z2El.className = `of-sweep-zone ${ch3.zones?.zone2 ? "active" : ""}`;
      if (z3El) z3El.className = `of-sweep-zone ${ch3.zones?.zone3 ? "active" : ""}`;

      let zonesCount = 0;
      if (ch3.zones?.zone1) zonesCount++;
      if (ch3.zones?.zone2) zonesCount++;
      if (ch3.zones?.zone3) zonesCount++;

      if (ch3.completed) {
        card3?.classList.add("completed");
        if (tag3) {
          tag3.className = "challenge-status-tag completed";
          tag3.innerHTML = `<svg class="svg-icon svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Complete (+150 XP)`;
        }
      } else {
        card3?.classList.remove("completed");
        if (tag3) {
          tag3.className = "challenge-status-tag pending";
          tag3.textContent = `${zonesCount} / 3 Zones Recorded`;
        }
      }
    }

    // XP count update
    let totalXp = 0;
    let doneCount = 0;
    if (state.challenges.spotMatch.completed) { totalXp += 100; doneCount++; }
    if (state.challenges.rapidCalib.completed) { totalXp += 125; doneCount++; }
    if (state.challenges.multiSweep?.completed) { totalXp += 150; doneCount++; }

    const xpPill = document.getElementById("of-user-total-challenge-xp");
    const donePill = document.getElementById("of-challenges-completed-count");
    if (xpPill) xpPill.textContent = `+${totalXp} XP`;
    if (donePill) donePill.textContent = `${doneCount} / 3 Complete`;
  }

  // ==========================================
  // RESULTS SCREEN MODAL
  // ==========================================
  function showResultsModal() {
    const modal = document.getElementById("of-results-modal");
    if (!modal) return;

    const resTbody = document.getElementById("of-res-tbody");
    const resMeanNa = document.getElementById("of-res-mean-na");
    const resMeanTheta = document.getElementById("of-res-mean-theta");
    const resAccuracy = document.getElementById("of-res-accuracy");
    const resGrade = document.getElementById("of-res-grade");
    const resXp = document.getElementById("of-res-xp");

    if (state.observations.length === 0) {
      showToast("Record at least 1 observation before generating results report!");
      return;
    }

    let sumNA = 0;
    let sumTheta = 0;

    if (resTbody) {
      resTbody.innerHTML = state.observations.map(obs => {
        sumNA += obs.na;
        sumTheta += obs.theta;
        return `
          <tr>
            <td>#${obs.reading}</td>
            <td>${obs.L.toFixed(2)} cm</td>
            <td>${obs.W.toFixed(2)} cm</td>
            <td><strong>${obs.na.toFixed(4)}</strong></td>
            <td>${obs.theta.toFixed(1)}°</td>
          </tr>
        `;
      }).join("");
    }

    const meanNA = sumNA / state.observations.length;
    const meanTheta = sumTheta / state.observations.length;
    const theoreticalNA = getEffectiveNA();
    const errorPct = Math.abs((meanNA - theoreticalNA) / theoreticalNA) * 100;
    const accuracyPct = Math.max(0, 100 - errorPct);

    if (resMeanNa) resMeanNa.textContent = meanNA.toFixed(4);
    if (resMeanTheta) resMeanTheta.textContent = `${meanTheta.toFixed(1)}°`;
    if (resAccuracy) resAccuracy.textContent = `${accuracyPct.toFixed(1)}%`;

    let grade = "Satisfactory (Grade B)";
    if (accuracyPct >= 95) grade = "Virtuoso Optician (Grade A+)";
    else if (accuracyPct >= 90) grade = "Optical Specialist (Grade A)";

    if (resGrade) resGrade.textContent = grade;

    let totalXp = 50 + state.observations.length * 10;
    if (state.challenges.spotMatch.completed) totalXp += 100;
    if (state.challenges.rapidCalib.completed) totalXp += 125;
    if (state.challenges.multiSweep?.completed) totalXp += 150;

    if (resXp) resXp.textContent = `+${totalXp} XP`;

    modal.classList.remove("hidden");
  }

  // ==========================================
  // HARDWARE TOGGLE ACTIONS
  // ==========================================
  function togglePower() {
    state.powerSupplyOn = !state.powerSupplyOn;
    if (!state.powerSupplyOn) {
      state.lightSourceActive = false;
    }
    showToast(state.powerSupplyOn ? "Main Trainer Power ON" : "Trainer Power Switched OFF");
    renderAll();
  }

  function toggleLaser() {
    if (!state.powerSupplyOn) {
      showToast("Switch on Power Supply first!");
      return;
    }
    state.lightSourceActive = !state.lightSourceActive;
    showToast(state.lightSourceActive ? `Laser Active (${state.wavelengthNm}nm)` : "Laser Light Deactivated");
    renderAll();
  }

  function toggleCable() {
    state.fibreInputConnected = !state.fibreInputConnected;
    showToast(state.fibreInputConnected ? "Fibre Patch Cord Coupled to Laser" : "Fibre Cable Disconnected");
    renderAll();
  }

  function toggleJig() {
    state.fibreOutputMounted = !state.fibreOutputMounted;
    showToast(state.fibreOutputMounted ? "Fibre Output Tip Clamped in Jig" : "Fibre Tip Unclamped");
    renderAll();
  }

  function setWavelength(wl) {
    state.wavelengthNm = Math.max(400, Math.min(950, Number(wl)));
    showToast(`Laser Wavelength tuned to ${state.wavelengthNm} nm`);
    renderAll();
  }

  // ==========================================
  // INITIALIZATION & EVENT BINDINGS
  // ==========================================
  function init() {
    benchCanvas = document.getElementById("of-bench-canvas");
    screenCanvas = document.getElementById("of-screen-canvas");

    if (benchCanvas) benchCtx = benchCanvas.getContext("2d");
    if (screenCanvas) screenCtx = screenCanvas.getContext("2d");

    // Load stored data
    loadObservationsFromStorage();
    loadChallengesFromStorage();

    // Distance Slider & Steppers
    const sliderDistance = document.getElementById("of-slider-distance");
    sliderDistance?.addEventListener("input", (e) => {
      state.distanceL = Math.max(0.5, Math.min(5.0, Number(e.target.value)));
      renderAll();
    });

    const btnDec = document.getElementById("of-btn-dec-dist");
    btnDec?.addEventListener("click", () => {
      state.distanceL = Math.max(0.5, Number((state.distanceL - 0.1).toFixed(2)));
      renderAll();
    });

    const btnInc = document.getElementById("of-btn-inc-dist");
    btnInc?.addEventListener("click", () => {
      state.distanceL = Math.min(5.0, Number((state.distanceL + 0.1).toFixed(2)));
      renderAll();
    });

    // Preset Distance Quick Buttons
    document.querySelectorAll(".of-preset-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const val = Number(btn.getAttribute("data-dist"));
        if (val) {
          state.distanceL = val;
          renderAll();
        }
      });
    });

    // Dedicated Hardware Switch Buttons
    document.getElementById("of-btn-power-switch")?.addEventListener("click", togglePower);
    document.getElementById("of-btn-laser-switch")?.addEventListener("click", toggleLaser);
    document.getElementById("of-btn-cable-toggle")?.addEventListener("click", toggleCable);
    document.getElementById("of-btn-jig-toggle")?.addEventListener("click", toggleJig);

    // Wavelength Selector Chips
    document.querySelectorAll(".of-wl-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const wl = Number(chip.getAttribute("data-wl"));
        if (wl) setWavelength(wl);
      });
    });

    // Wavelength Slider
    document.getElementById("of-slider-wavelength")?.addEventListener("input", (e) => {
      setWavelength(Number(e.target.value));
    });

    // Fast Auto-Setup Button
    const btnAutoSetup = document.getElementById("of-btn-auto-setup");
    btnAutoSetup?.addEventListener("click", () => {
      state.powerSupplyOn = true;
      state.lightSourceActive = true;
      state.fibreInputConnected = true;
      state.fibreOutputMounted = true;
      state.screenAligned = true;
      showToast("Full Optical Apparatus Configured & Calibrated!");
      renderAll();
    });

    // Observations
    document.getElementById("of-btn-record")?.addEventListener("click", recordObservation);
    document.getElementById("of-btn-clear-obs")?.addEventListener("click", clearObservations);
    document.getElementById("of-btn-export-csv")?.addEventListener("click", exportObservationsCsv);
    document.getElementById("of-btn-export-pdf")?.addEventListener("click", exportObservationsPdf);

    // Results Modal
    document.getElementById("of-btn-view-results")?.addEventListener("click", showResultsModal);
    document.getElementById("of-btn-close-results")?.addEventListener("click", () => {
      document.getElementById("of-results-modal")?.classList.add("hidden");
    });

    // Challenges Interactions
    document.getElementById("of-btn-start-rapid")?.addEventListener("click", startRapidCalibration);

    document.querySelectorAll(".of-fibre-choice-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const choice = btn.getAttribute("data-choice");
        if (choice) solveMysteryFibreChallenge(choice);
      });
    });

    // In-Canvas Click Detection on Simulator (Power switch, laser, cable coupler, jig)
    benchCanvas?.addEventListener("click", (e) => {
      if (!benchCanvas) return;
      const rect = benchCanvas.getBoundingClientRect();
      const scaleX = BENCH_LOGICAL_W / rect.width;
      const scaleY = BENCH_LOGICAL_H / rect.height;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;

      // Check click regions
      const inBox = (r) => mouseX >= r.x && mouseX <= r.x + r.w && mouseY >= r.y && mouseY <= r.y + r.h;

      if (inBox(clickRegions.powerSwitch)) {
        togglePower();
      } else if (inBox(clickRegions.laserSwitch)) {
        toggleLaser();
      } else if (inBox(clickRegions.cableCoupler)) {
        toggleCable();
      } else if (inBox(clickRegions.jigClamp)) {
        toggleJig();
      }
    });

    // Drag Screen along optical rail
    let isDraggingScreen = false;
    benchCanvas?.addEventListener("mousedown", (e) => {
      const rect = benchCanvas.getBoundingClientRect();
      const scaleX = BENCH_LOGICAL_W / rect.width;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const scaleZeroX = 250;
      const pxPerCm = (BENCH_LOGICAL_W - scaleZeroX - 90) / 6.0;
      const screenPosX = scaleZeroX + state.distanceL * pxPerCm;

      if (Math.abs(mouseX - screenPosX) < 25) {
        isDraggingScreen = true;
      }
    });

    window.addEventListener("mouseup", () => {
      isDraggingScreen = false;
    });

    benchCanvas?.addEventListener("mousemove", (e) => {
      if (!benchCanvas) return;
      const rect = benchCanvas.getBoundingClientRect();
      const scaleX = BENCH_LOGICAL_W / rect.width;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const scaleZeroX = 250;
      const pxPerCm = (BENCH_LOGICAL_W - scaleZeroX - 90) / 6.0;

      if (isDraggingScreen) {
        const newDistCm = (mouseX - scaleZeroX) / pxPerCm;
        if (newDistCm >= 0.5 && newDistCm <= 5.0) {
          state.distanceL = Number(newDistCm.toFixed(2));
          renderAll();
        }
      }
    });

    // Initial render
    renderAll();
    renderObservationsDom();
    renderChallengesDom();
  }

  return {
    init,
    renderAll,
    renderChallengesDom,
    getState: () => state,
    setDistance: (d) => { state.distanceL = d; renderAll(); },
    setWavelength,
    togglePower,
    toggleLaser,
    recordObservation,
    clearObservations
  };
}
