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
  const { onXpAwarded, onExperimentRecorded, showToast, getActiveUserId, loadUserProfile, getStoredUserProfile, unlockBadge, isUserAuthenticated, openLoginModal, onChallengeCompleted } = callbacks;

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
    trainer: {
      voltage: 5.0,
      voltageIndex: 1,
      voltageSteps: [3.3, 5.0, 9.0, 12.0],
      waveform: "sine",
      freqKhz: 4700,
      freqIndex: 2,
      freqSteps: [100, 1000, 4700, 10000],
      freqLabels: ["100 kHz", "1.0 MHz", "4.7 MHz", "10.0 MHz"],
      amplitudeV: 3.2,
      ampIndex: 2,
      ampSteps: [1.0, 2.0, 3.2, 5.0],
      modulation: "am",
      scopeCh1: true,
      scopeCh2: true,
      scopeRunning: true,
      scopeGrid: true,
      scopeTimebase: 1.0,
      timeOffset: 0,
      wlIndex: 0,
      wlPresets: [650, 532, 450, 850, 1310, 1550]
    },

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
  let scopeCanvas = null;
  let scopeCtx = null;
  let spectralCanvas = null;
  let spectralCtx = null;
  let scopeAnimId = null;

  const BENCH_LOGICAL_W = 800;
  const BENCH_LOGICAL_H = 380;
  const SCREEN_LOGICAL_W = 380;
  const SCREEN_LOGICAL_H = 300;

  // Clickable interactive bounding boxes on the bench canvas (in logical coordinates)
  const clickRegions = {
    powerSwitch: { x: 36, y: 212, w: 40, h: 40 },
    laserSwitch: { x: 88, y: 212, w: 40, h: 40 },
    cableCoupler: { x: 168, y: 212, w: 38, h: 40 },
    jigClamp: { x: 230, y: 165, w: 40, h: 75 }
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

    // 2. Silver-Toned Dual-Rail Optical Bench with 7 Sliding Carriers
    const railY = height - 55;
    const railStartX = 20;
    const railEndX = width - 20;
    const railH = 22;

    // Dual parallel steel rails (silver-toned)
    const railGrad = ctx.createLinearGradient(0, railY, 0, railY + railH);
    railGrad.addColorStop(0, "#d1d5db");
    railGrad.addColorStop(0.3, "#9ca3af");
    railGrad.addColorStop(0.7, "#6b7280");
    railGrad.addColorStop(1, "#374151");

    // Upper rail
    ctx.fillStyle = railGrad;
    ctx.fillRect(railStartX, railY, railEndX - railStartX, 7);
    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 0.8;
    ctx.strokeRect(railStartX, railY, railEndX - railStartX, 7);

    // Lower rail
    ctx.fillStyle = railGrad;
    ctx.fillRect(railStartX, railY + 15, railEndX - railStartX, 7);
    ctx.strokeRect(railStartX, railY + 15, railEndX - railStartX, 7);

    // Dark grey cast-iron arched bracket on far-left
    ctx.fillStyle = "#374151";
    ctx.beginPath();
    ctx.moveTo(railStartX - 4, railY + 22);
    ctx.lineTo(railStartX - 4, railY + 38);
    ctx.quadraticCurveTo(railStartX + 6, railY + 48, railStartX + 16, railY + 38);
    ctx.lineTo(railStartX + 16, railY + 22);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Vernier millimeter scale between rails
    ctx.fillStyle = "#1f2937";
    ctx.fillRect(railStartX, railY + 8, railEndX - railStartX, 7);

    const scaleZeroX = 230;
    const maxCm = 6.0;
    const pxPerCm = (width - scaleZeroX - 80) / maxCm;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let cm = 0; cm <= 6.0; cm += 0.1) {
      const sx = scaleZeroX + cm * pxPerCm;
      const isWhole = Math.abs(cm - Math.round(cm)) < 0.01;
      const isHalf = Math.abs(cm % 0.5) < 0.01;

      ctx.beginPath();
      if (isWhole) {
        ctx.strokeStyle = "#1f2937";
        ctx.lineWidth = 1.5;
        ctx.moveTo(sx, railY + 8);
        ctx.lineTo(sx, railY + 4);
        ctx.stroke();
        ctx.fillStyle = "#374151";
        ctx.font = "bold 8px 'JetBrains Mono', monospace";
        ctx.fillText(`${Math.round(cm)}cm`, sx, railY + 30);
      } else if (isHalf) {
        ctx.strokeStyle = "#4b5563";
        ctx.lineWidth = 1;
        ctx.moveTo(sx, railY + 8);
        ctx.lineTo(sx, railY + 5);
        ctx.stroke();
      } else {
        ctx.strokeStyle = "rgba(75, 85, 99, 0.5)";
        ctx.lineWidth = 0.6;
        ctx.moveTo(sx, railY + 8);
        ctx.lineTo(sx, railY + 6);
        ctx.stroke();
      }
    }

    // 3. REALISTIC PHOTOREALISTIC OPTICAL TRAINER KIT CONSOLE MODULE (Left side)
    const kitX = 24;
    const kitY = railY - 185;
    const kitW = 166;
    const kitH = 185;
    const btnY = kitY + 122; // Horizontal centerline for buttons and optical port (y = 247)
    const tipY = btnY;       // Exact matching centerline for the jig clamp (y = 247)

    ctx.save();

    // Console Chassis Drop Shadow on Bench & Rail
    ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;

    // Dark Anodized Brushed Metal Console Body
    const kitGrad = ctx.createLinearGradient(kitX, kitY, kitX, kitY + kitH);
    kitGrad.addColorStop(0, "#2a313d");
    kitGrad.addColorStop(0.25, "#1c222c");
    kitGrad.addColorStop(0.65, "#141820");
    kitGrad.addColorStop(1, "#0d1016");

    ctx.fillStyle = kitGrad;
    ctx.beginPath();
    ctx.roundRect(kitX, kitY, kitW, kitH, 10);
    ctx.fill();

    // Outer Chamfered Bezel Rim
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = state.powerSupplyOn ? "#475569" : "#334155";
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Subtle brushed metal horizontal micro-sheen
    ctx.strokeStyle = "rgba(255, 255, 255, 0.025)";
    ctx.lineWidth = 1;
    for (let ly = kitY + 4; ly < kitY + kitH - 4; ly += 3) {
      ctx.beginPath();
      ctx.moveTo(kitX + 6, ly);
      ctx.lineTo(kitX + kitW - 6, ly);
      ctx.stroke();
    }

    // 4 Precision Countersunk Hex Socket Cap Screws in Corners
    const boltOffsets = [
      { bx: kitX + 9, by: kitY + 9 },
      { bx: kitX + kitW - 9, by: kitY + 9 },
      { bx: kitX + 9, by: kitY + kitH - 9 },
      { bx: kitX + kitW - 9, by: kitY + kitH - 9 }
    ];

    boltOffsets.forEach(({ bx, by }) => {
      // Metallic outer washer ring
      const boltGrad = ctx.createRadialGradient(bx - 1, by - 1, 1, bx, by, 5);
      boltGrad.addColorStop(0, "#cbd5e1");
      boltGrad.addColorStop(0.5, "#64748b");
      boltGrad.addColorStop(1, "#1e293b");
      ctx.fillStyle = boltGrad;
      ctx.beginPath();
      ctx.arc(bx, by, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Recessed dark hex socket hole
      ctx.fillStyle = "#090d16";
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        const hx = bx + 2.2 * Math.cos(ang);
        const hy = by + 2.2 * Math.sin(ang);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
    });

    // Silkscreen Console Title
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "bold 10px 'Outfit', 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("OPTICAL TRAINER KIT", kitX + kitW / 2, kitY + 18);

    // Metallic dividing hairline
    ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(kitX + 16, kitY + 23);
    ctx.lineTo(kitX + kitW - 16, kitY + 23);
    ctx.stroke();

    // High-Tech Digital Parameter Display Box (OLED Screen)
    const oledX = kitX + 14;
    const oledY = kitY + 28;
    const oledW = kitW - 28;
    const oledH = 34;

    ctx.fillStyle = isLight ? "#ffffff" : "#05080f";
    ctx.fillRect(oledX, oledY, oledW, oledH);
    ctx.strokeStyle = state.powerSupplyOn ? (isLight ? "#0284c7" : "rgba(56, 189, 248, 0.5)") : "#1e293b";
    ctx.lineWidth = 1.2;
    ctx.strokeRect(oledX, oledY, oledW, oledH);

    // Anti-reflective glare gradient on OLED glass
    const glareGrad = ctx.createLinearGradient(oledX, oledY, oledX, oledY + oledH * 0.5);
    glareGrad.addColorStop(0, "rgba(255, 255, 255, 0.07)");
    glareGrad.addColorStop(1, "transparent");
    ctx.fillStyle = glareGrad;
    ctx.fillRect(oledX, oledY, oledW, oledH * 0.5);

    if (state.powerSupplyOn) {
      ctx.fillStyle = isLight ? "#0284c7" : palette.ledHex;
      ctx.font = "bold 9.5px 'JetBrains Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText(`λ: ${state.wavelengthNm} nm`, oledX + 6, oledY + 14);

      ctx.fillStyle = state.lightSourceActive ? (isLight ? "#059669" : "#4ade80") : "#94a3b8";
      ctx.font = "8.5px 'JetBrains Mono', monospace";
      ctx.fillText(`LASER: ${state.lightSourceActive ? "5.0mW ON" : "STANDBY"}`, oledX + 6, oledY + 27);
    } else {
      ctx.fillStyle = "#334155";
      ctx.font = "bold 9px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("SYSTEM OFF", oledX + oledW / 2, oledY + 21);
    }

    // --- SECTION 1: POWER SECTION ---
    const pwrCenterX = 56;
    const pwrCenterY = btnY;
    const pwrR = 16;

    // Label: POWER SECTION
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 7px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("POWER", pwrCenterX, kitY + 74);
    ctx.fillText("SECTION", pwrCenterX, kitY + 82);

    // Power Indicator LED
    const pwrLedY = kitY + 93;
    // Chrome socket
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.arc(pwrCenterX, pwrLedY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1;
    ctx.stroke();

    if (state.powerSupplyOn) {
      // Radiant Green Glow Aura
      const pwrGlow = ctx.createRadialGradient(pwrCenterX, pwrLedY, 0, pwrCenterX, pwrLedY, 12);
      pwrGlow.addColorStop(0, "rgba(34, 197, 94, 0.7)");
      pwrGlow.addColorStop(0.5, "rgba(34, 197, 94, 0.25)");
      pwrGlow.addColorStop(1, "transparent");
      ctx.fillStyle = pwrGlow;
      ctx.beginPath();
      ctx.arc(pwrCenterX, pwrLedY, 12, 0, Math.PI * 2);
      ctx.fill();

      // Green LED Dome
      const ledGrad = ctx.createRadialGradient(pwrCenterX - 1, pwrLedY - 1, 0.5, pwrCenterX, pwrLedY, 3.5);
      ledGrad.addColorStop(0, "#bbf7d0");
      ledGrad.addColorStop(0.5, "#22c55e");
      ledGrad.addColorStop(1, "#15803d");
      ctx.fillStyle = ledGrad;
    } else {
      ctx.fillStyle = "#064e3b";
    }
    ctx.beginPath();
    ctx.arc(pwrCenterX, pwrLedY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Power Button (Machined Outer Bezel + Deep Recessed Concave Dish)
    // Outer Bezel Ring
    const pwrBezelGrad = ctx.createLinearGradient(pwrCenterX - pwrR, pwrCenterY - pwrR, pwrCenterX + pwrR, pwrCenterY + pwrR);
    pwrBezelGrad.addColorStop(0, "#94a3b8");
    pwrBezelGrad.addColorStop(0.4, "#475569");
    pwrBezelGrad.addColorStop(0.8, "#1e293b");
    pwrBezelGrad.addColorStop(1, "#64748b");
    ctx.fillStyle = pwrBezelGrad;
    ctx.beginPath();
    ctx.arc(pwrCenterX, pwrCenterY, pwrR + 3, 0, Math.PI * 2);
    ctx.fill();

    // Recessed Concave Dish
    const pwrDishGrad = ctx.createRadialGradient(pwrCenterX, pwrCenterY, 2, pwrCenterX, pwrCenterY, pwrR);
    pwrDishGrad.addColorStop(0, "#0c1017");
    pwrDishGrad.addColorStop(0.65, "#151b24");
    pwrDishGrad.addColorStop(1, "#252e3e");
    ctx.fillStyle = pwrDishGrad;
    ctx.beginPath();
    ctx.arc(pwrCenterX, pwrCenterY, pwrR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = state.powerSupplyOn ? "rgba(34, 197, 94, 0.8)" : "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Power Glyph `⏻`
    ctx.save();
    ctx.strokeStyle = state.powerSupplyOn ? "#22c55e" : "#64748b";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    if (state.powerSupplyOn) {
      ctx.shadowColor = "#22c55e";
      ctx.shadowBlur = 8;
    }
    ctx.beginPath();
    ctx.arc(pwrCenterX, pwrCenterY + 1, 7, -Math.PI * 0.72, Math.PI * 0.72, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pwrCenterX, pwrCenterY - 7);
    ctx.lineTo(pwrCenterX, pwrCenterY);
    ctx.stroke();
    ctx.restore();

    // Label below: POWER
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "bold 8px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("POWER", pwrCenterX, kitY + 149);

    // --- SECTION 2: LASER CONTROLS ---
    const lsrCenterX = 108;
    const lsrCenterY = btnY;
    const lsrR = 16;

    // Label: LASER CONTROLS
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 7px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("LASER", lsrCenterX, kitY + 74);
    ctx.fillText("CONTROLS", lsrCenterX, kitY + 82);

    // Laser Indicator LED
    const lsrLedY = kitY + 93;
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.arc(lsrCenterX, lsrLedY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1;
    ctx.stroke();

    if (state.lightSourceActive) {
      // Radiant Red Glow Aura
      const lsrGlow = ctx.createRadialGradient(lsrCenterX, lsrLedY, 0, lsrCenterX, lsrLedY, 12);
      lsrGlow.addColorStop(0, "rgba(239, 68, 68, 0.8)");
      lsrGlow.addColorStop(0.5, "rgba(239, 68, 68, 0.3)");
      lsrGlow.addColorStop(1, "transparent");
      ctx.fillStyle = lsrGlow;
      ctx.beginPath();
      ctx.arc(lsrCenterX, lsrLedY, 12, 0, Math.PI * 2);
      ctx.fill();

      // Red LED Dome
      const ledGrad2 = ctx.createRadialGradient(lsrCenterX - 1, lsrLedY - 1, 0.5, lsrCenterX, lsrLedY, 3.5);
      ledGrad2.addColorStop(0, "#fecaca");
      ledGrad2.addColorStop(0.5, "#ef4444");
      ledGrad2.addColorStop(1, "#991b1b");
      ctx.fillStyle = ledGrad2;
    } else {
      ctx.fillStyle = "#450a0a";
    }
    ctx.beginPath();
    ctx.arc(lsrCenterX, lsrLedY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Laser Hazard Triangle Glyph
    const triY = kitY + 101;
    ctx.strokeStyle = state.lightSourceActive ? "#f59e0b" : "#64748b";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(lsrCenterX, triY);
    ctx.lineTo(lsrCenterX - 5, triY + 8);
    ctx.lineTo(lsrCenterX + 5, triY + 8);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = state.lightSourceActive ? "#fbbf24" : "#475569";
    ctx.beginPath();
    ctx.arc(lsrCenterX, triY + 6.2, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Laser Concave Button
    // Outer Bezel Ring
    const lsrBezelGrad = ctx.createLinearGradient(lsrCenterX - lsrR, lsrCenterY - lsrR, lsrCenterX + lsrR, lsrCenterY + lsrR);
    lsrBezelGrad.addColorStop(0, "#94a3b8");
    lsrBezelGrad.addColorStop(0.4, "#475569");
    lsrBezelGrad.addColorStop(0.8, "#1e293b");
    lsrBezelGrad.addColorStop(1, "#64748b");
    ctx.fillStyle = lsrBezelGrad;
    ctx.beginPath();
    ctx.arc(lsrCenterX, lsrCenterY, lsrR + 3, 0, Math.PI * 2);
    ctx.fill();

    // Concave Dish
    if (state.lightSourceActive) {
      ctx.save();
      ctx.shadowColor = "#ef4444";
      ctx.shadowBlur = 12;
      const lsrActiveDish = ctx.createRadialGradient(lsrCenterX, lsrCenterY, 2, lsrCenterX, lsrCenterY, lsrR);
      lsrActiveDish.addColorStop(0, "#b91c1c");
      lsrActiveDish.addColorStop(0.65, "#ef4444");
      lsrActiveDish.addColorStop(1, "#7f1d1d");
      ctx.fillStyle = lsrActiveDish;
      ctx.beginPath();
      ctx.arc(lsrCenterX, lsrCenterY, lsrR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      const lsrDishGrad = ctx.createRadialGradient(lsrCenterX, lsrCenterY, 2, lsrCenterX, lsrCenterY, lsrR);
      lsrDishGrad.addColorStop(0, "#0c1017");
      lsrDishGrad.addColorStop(0.65, "#151b24");
      lsrDishGrad.addColorStop(1, "#252e3e");
      ctx.fillStyle = lsrDishGrad;
      ctx.beginPath();
      ctx.arc(lsrCenterX, lsrCenterY, lsrR, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = state.lightSourceActive ? "#f87171" : "rgba(239, 68, 68, 0.4)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Centered LASER text
    ctx.fillStyle = state.lightSourceActive ? "#ffffff" : "#94a3b8";
    ctx.font = "bold 8px 'Orbitron', 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("LASER", lsrCenterX, lsrCenterY);
    ctx.textBaseline = "alphabetic";

    // --- SECTION 3: EMITTER PORT (LASER OUT / EMITTER) ---
    const portCenterX = kitX + kitW - 14;
    const portCenterY = btnY;

    // Label: EMITTER PORT
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 6.5px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("EMITTER", portCenterX - 2, kitY + 74);
    ctx.fillText("PORT", portCenterX - 2, kitY + 82);

    ctx.fillStyle = "#64748b";
    ctx.font = "bold 6.5px 'JetBrains Mono', monospace";
    ctx.fillText("LASER OUT", portCenterX - 2, kitY + 93);

    // Square Flange Plate
    const flangeW = 28;
    const flangeH = 32;
    const flangeX = portCenterX - flangeW / 2 - 2;
    const flangeY = portCenterY - flangeH / 2;

    const flangeGrad = ctx.createLinearGradient(flangeX, flangeY, flangeX + flangeW, flangeY + flangeH);
    flangeGrad.addColorStop(0, "#475569");
    flangeGrad.addColorStop(0.5, "#334155");
    flangeGrad.addColorStop(1, "#1e293b");
    ctx.fillStyle = flangeGrad;
    ctx.beginPath();
    ctx.roundRect(flangeX, flangeY, flangeW, flangeH, 3);
    ctx.fill();
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 1;
    ctx.stroke();

    // 4 Corner Screws on Flange
    [
      { sx: flangeX + 3.5, sy: flangeY + 3.5 },
      { sx: flangeX + flangeW - 3.5, sy: flangeY + 3.5 },
      { sx: flangeX + 3.5, sy: flangeY + flangeH - 3.5 },
      { sx: flangeX + flangeW - 3.5, sy: flangeY + flangeH - 3.5 }
    ].forEach(({ sx, sy }) => {
      ctx.fillStyle = "#94a3b8";
      ctx.beginPath();
      ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(sx, sy, 0.8, 0, Math.PI * 2);
      ctx.fill();
    });

    // Circular Threaded Barrel Collar
    const collarGrad = ctx.createLinearGradient(portCenterX - 11, portCenterY - 11, portCenterX + 11, portCenterY + 11);
    collarGrad.addColorStop(0, "#cbd5e1");
    collarGrad.addColorStop(0.4, "#64748b");
    collarGrad.addColorStop(0.8, "#1e293b");
    collarGrad.addColorStop(1, "#94a3b8");
    ctx.fillStyle = collarGrad;
    ctx.beginPath();
    ctx.arc(portCenterX - 2, portCenterY, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Concentric inner collar ring
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.arc(portCenterX - 2, portCenterY, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // Central dark optical aperture hole
    ctx.fillStyle = "#030712";
    ctx.beginPath();
    ctx.arc(portCenterX - 2, portCenterY, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Active Laser Beam Flare inside Aperture when Powered & Laser ON
    if (state.powerSupplyOn && state.lightSourceActive) {
      ctx.save();
      const beamGlow = ctx.createRadialGradient(portCenterX - 2, portCenterY, 0, portCenterX - 2, portCenterY, 8);
      beamGlow.addColorStop(0, "#ffffff");
      beamGlow.addColorStop(0.4, palette.primaryHex);
      beamGlow.addColorStop(1, "transparent");
      ctx.fillStyle = beamGlow;
      ctx.beginPath();
      ctx.arc(portCenterX - 2, portCenterY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Label below: EMITTER
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "bold 7px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("EMITTER", portCenterX - 2, kitY + 149);

    // Connected Strain-Relief Boot at Emitter Port
    const bootStartX = portCenterX + 7;
    if (state.fibreInputConnected) {
      // Metallic FC Knurled Lock Nut
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(bootStartX - 2, portCenterY - 6.5, 5, 13);
      ctx.strokeStyle = "#e2e8f0";
      ctx.strokeRect(bootStartX - 2, portCenterY - 6.5, 5, 13);

      // Black Flexible Rubber Boot with Strain-Relief Ribs
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(bootStartX + 3, portCenterY - 4.5, 12, 9);
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1;
      ctx.strokeRect(bootStartX + 3, portCenterY - 4.5, 12, 9);

      // Rib lines
      ctx.strokeStyle = "#475569";
      for (let rx = bootStartX + 6; rx <= bootStartX + 12; rx += 3) {
        ctx.beginPath();
        ctx.moveTo(rx, portCenterY - 4);
        ctx.lineTo(rx, portCenterY + 4);
        ctx.stroke();
      }
    }

    ctx.restore(); // Restore chassis save state

    // --- 4. PRECISION NA MEASUREMENT JIG CLAMP (at scaleZeroX) ---
    const jigX = scaleZeroX - 16;
    const jigY = railY - 145;
    const jigW = 28;
    const jigH = 145;

    // Solid Vertical Steel Riser Post Anchored on Rail Slider
    const postGrad = ctx.createLinearGradient(jigX, jigY, jigX + jigW, jigY);
    postGrad.addColorStop(0, "#475569");
    postGrad.addColorStop(0.3, "#94a3b8");
    postGrad.addColorStop(0.7, "#64748b");
    postGrad.addColorStop(1, "#334155");

    ctx.fillStyle = postGrad;
    ctx.fillRect(jigX + 6, jigY + 25, jigW - 12, jigH - 25);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1.2;
    ctx.strokeRect(jigX + 6, jigY + 25, jigW - 12, jigH - 25);

    // Label: JIG CLAMP
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 8px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("JIG CLAMP", scaleZeroX - 2, tipY - 48);

    // Stainless Steel Clamp Block
    const clampBlockW = 34;
    const clampBlockH = 22;
    const clampBlockX = scaleZeroX - clampBlockW / 2 - 2;
    const clampBlockY = tipY - clampBlockH / 2;

    const clampGrad = ctx.createLinearGradient(clampBlockX, clampBlockY, clampBlockX + clampBlockW, clampBlockY + clampBlockH);
    clampGrad.addColorStop(0, "#94a3b8");
    clampGrad.addColorStop(0.3, "#cbd5e1");
    clampGrad.addColorStop(0.7, "#64748b");
    clampGrad.addColorStop(1, "#334155");
    ctx.fillStyle = clampGrad;
    ctx.beginPath();
    ctx.roundRect(clampBlockX, clampBlockY, clampBlockW, clampBlockH, 2);
    ctx.fill();
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Horizontal Center V-Groove Channel through Clamp
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(clampBlockX, tipY - 2.5, clampBlockW, 5);

    // Vertical Threaded Screw Shaft
    const shaftW = 6;
    const shaftH = 14;
    const shaftX = scaleZeroX - shaftW / 2 - 2;
    const knobY = state.fibreOutputMounted ? tipY - 32 : tipY - 40;
    const shaftY = knobY + 12;

    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(shaftX, shaftY, shaftW, clampBlockY - shaftY);
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 0.8;
    for (let ty = shaftY + 2; ty < clampBlockY; ty += 2) {
      ctx.beginPath();
      ctx.moveTo(shaftX, ty);
      ctx.lineTo(shaftX + shaftW, ty + 1);
      ctx.stroke();
    }

    // Cylindrical Knurled Stainless Steel Thumbscrew Knob
    const knobW = 20;
    const knobH = 14;
    const knobX = scaleZeroX - knobW / 2 - 2;

    const knobGrad = ctx.createLinearGradient(knobX, knobY, knobX + knobW, knobY);
    knobGrad.addColorStop(0, "#94a3b8");
    knobGrad.addColorStop(0.2, "#cbd5e1");
    knobGrad.addColorStop(0.8, "#475569");
    knobGrad.addColorStop(1, "#1e293b");

    ctx.fillStyle = knobGrad;
    ctx.beginPath();
    ctx.roundRect(knobX, knobY, knobW, knobH, 2);
    ctx.fill();
    ctx.strokeStyle = state.fibreOutputMounted ? "#22c55e" : "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Knurling Texture: vertical milled grip ridges
    ctx.strokeStyle = "rgba(15, 23, 42, 0.4)";
    ctx.lineWidth = 1;
    for (let kx = knobX + 2; kx < knobX + knobW - 1; kx += 2) {
      ctx.beginPath();
      ctx.moveTo(kx, knobY + 1);
      ctx.lineTo(kx, knobY + knobH - 1);
      ctx.stroke();
    }

    // Output Collimation Ferrule at Output Tip
    const ferruleW = 12;
    const ferruleH = 8;
    const ferruleX = clampBlockX + clampBlockW;
    const ferruleY = tipY - ferruleH / 2;

    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(ferruleX, ferruleY, ferruleW, ferruleH);
    ctx.strokeStyle = "#334155";
    ctx.strokeRect(ferruleX, ferruleY, ferruleW, ferruleH);

    // Cleaved Fiber Core Tip (Emission aperture)
    ctx.fillStyle = "#020617";
    ctx.fillRect(ferruleX + ferruleW - 1, tipY - 2, 2, 4);

    // --- 5. HIGH-FIDELITY OPTICAL FIBRE PATCH CABLE ---
    const cableStartPt = { x: bootStartX + 15, y: portCenterY };
    const cableEndPt = { x: clampBlockX, y: tipY };

    if (state.fibreInputConnected && state.fibreOutputMounted) {
      // Natural physical catenary S-curve control points
      const cp1 = { x: cableStartPt.x + 24, y: cableStartPt.y + 60 };
      const cp2 = { x: cableEndPt.x - 24, y: cableEndPt.y + 65 };

      // 1. Soft Drop Shadow cast onto the optical bench
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cableStartPt.x, cableStartPt.y + 6);
      ctx.bezierCurveTo(cp1.x, cp1.y + 12, cp2.x, cp2.y + 12, cableEndPt.x, cableEndPt.y + 6);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
      ctx.lineWidth = 9;
      ctx.stroke();
      ctx.restore();

      // 2. High-Visibility Protective Polymer Buffer Jacket (Rich Orange)
      ctx.beginPath();
      ctx.moveTo(cableStartPt.x, cableStartPt.y);
      ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, cableEndPt.x, cableEndPt.y);
      ctx.strokeStyle = "#ea580c";
      ctx.lineWidth = 6.5;
      ctx.lineCap = "round";
      ctx.stroke();

      // Secondary brighter amber layer
      ctx.beginPath();
      ctx.moveTo(cableStartPt.x, cableStartPt.y);
      ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, cableEndPt.x, cableEndPt.y);
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 4.5;
      ctx.stroke();

      // 3. 3D Cylindrical Specular Highlight Along Upper Crest
      ctx.beginPath();
      ctx.moveTo(cableStartPt.x, cableStartPt.y - 1.5);
      ctx.bezierCurveTo(cp1.x, cp1.y - 1.5, cp2.x, cp2.y - 1.5, cableEndPt.x, cableEndPt.y - 1.5);
      ctx.strokeStyle = "rgba(254, 240, 138, 0.85)";
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // 4. Glowing Active Internal Optical Core Ray
      if (state.lightSourceActive && state.powerSupplyOn) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cableStartPt.x, cableStartPt.y);
        ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, cableEndPt.x, cableEndPt.y);
        ctx.strokeStyle = palette.primaryHex;
        ctx.lineWidth = 3.2;
        ctx.shadowColor = palette.primaryHex;
        ctx.shadowBlur = 10;
        ctx.stroke();

        // High-intensity white laser single-mode core
        ctx.beginPath();
        ctx.moveTo(cableStartPt.x, cableStartPt.y);
        ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, cableEndPt.x, cableEndPt.y);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.restore();
      }

      // Cable Label: FIBER CABLE under the loop
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 7px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("FIBER CABLE", (cableStartPt.x + cableEndPt.x) / 2, Math.max(cp1.y, cp2.y) + 16);

    } else if (state.fibreInputConnected && !state.fibreOutputMounted) {
      // Dangles downward from port
      ctx.beginPath();
      ctx.moveTo(cableStartPt.x, cableStartPt.y);
      ctx.bezierCurveTo(
        cableStartPt.x + 25, cableStartPt.y + 40,
        cableStartPt.x + 35, cableStartPt.y + 85,
        cableStartPt.x + 30, cableStartPt.y + 105
      );
      ctx.strokeStyle = "#ea580c";
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.fillStyle = "#cbd5e1";
      ctx.fillRect(cableStartPt.x + 27, cableStartPt.y + 105, 7, 14);
      ctx.strokeStyle = "#475569";
      ctx.strokeRect(cableStartPt.x + 27, cableStartPt.y + 105, 7, 14);

    } else if (!state.fibreInputConnected && state.fibreOutputMounted) {
      // Dangles downward from jig
      ctx.beginPath();
      ctx.moveTo(cableEndPt.x, cableEndPt.y);
      ctx.bezierCurveTo(
        cableEndPt.x - 25, cableEndPt.y + 40,
        cableEndPt.x - 35, cableEndPt.y + 85,
        cableEndPt.x - 30, cableEndPt.y + 105
      );
      ctx.strokeStyle = "#ea580c";
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(cableEndPt.x - 34, cableEndPt.y + 105, 9, 14);
      ctx.strokeStyle = "#38bdf8";
      ctx.strokeRect(cableEndPt.x - 34, cableEndPt.y + 105, 9, 14);
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


  // ==========================================
  // REALISTIC HARDWARE AUDIO FEEDBACK & TACTILE RESPONSES
  // ==========================================
  function playClickAudio(type = "click") {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const actx = new AudioCtx();
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.connect(gain);
      gain.connect(actx.destination);
      const now = actx.currentTime;
      if (type === "toggle" || type === "rocker") {
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.05);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else {
        osc.frequency.setValueAtTime(750, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.03);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
      }
    } catch (e) {}
  }

  // ==========================================
  // REAL-TIME DIGITAL OSCILLOSCOPE ENGINE
  // ==========================================
  function renderScopeCanvas() {
    if (!scopeCanvas) scopeCanvas = document.getElementById("of-scope-canvas");
    if (!scopeCanvas) return;
    if (!scopeCtx) scopeCtx = scopeCanvas.getContext("2d");
    const ctx = scopeCtx;
    const w = scopeCanvas.width;
    const h = scopeCanvas.height;

    // Dark CRT screen background
    ctx.fillStyle = "#020713";
    ctx.fillRect(0, 0, w, h);

    // Reticle Grid (10x8 divisions)
    if (state.trainer.scopeGrid) {
      ctx.strokeStyle = "rgba(34, 197, 94, 0.16)";
      ctx.lineWidth = 1;
      const numX = 10;
      const numY = 8;
      const stepX = w / numX;
      const stepY = h / numY;
      for (let i = 1; i < numX; i++) {
        ctx.beginPath();
        ctx.moveTo(i * stepX + 0.5, 0);
        ctx.lineTo(i * stepX + 0.5, h);
        ctx.stroke();
      }
      for (let j = 1; j < numY; j++) {
        ctx.beginPath();
        ctx.moveTo(0, j * stepY + 0.5);
        ctx.lineTo(w, j * stepY + 0.5);
        ctx.stroke();
      }
      // Center crosshairs
      ctx.strokeStyle = "rgba(34, 197, 94, 0.32)";
      ctx.beginPath();
      ctx.moveTo(w / 2 + 0.5, 0);
      ctx.lineTo(w / 2 + 0.5, h);
      ctx.moveTo(0, h / 2 + 0.5);
      ctx.lineTo(w, h / 2 + 0.5);
      ctx.stroke();
    }

    if (!state.powerSupplyOn) {
      // Zero voltage flatline on power off
      ctx.strokeStyle = "rgba(100, 116, 139, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      ctx.fillStyle = "#64748b";
      ctx.font = "bold 9px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("STANDBY • POWER OFF", w / 2, h / 2 - 8);
      return;
    }

    const midY = h / 2;
    const ampPx = (state.trainer.amplitudeV / 5.0) * (h * 0.34);
    const freqFactor = (state.trainer.freqKhz / 4700) * 0.045 * state.trainer.scopeTimebase;
    const t = state.trainer.timeOffset;

    function getWaveformVal(angle, form) {
      const a = (angle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      if (form === "square") {
        return a < Math.PI ? 1 : -1;
      } else if (form === "pulse") {
        return a < (Math.PI * 0.4) ? 1 : -0.25;
      } else if (form === "triangle") {
        return a < Math.PI ? -1 + (2 * a) / Math.PI : 1 - (2 * (a - Math.PI)) / Math.PI;
      }
      return Math.sin(a);
    }

    // Channel 1: Transmitter (Neon Green #22c55e)
    if (state.trainer.scopeCh1) {
      ctx.beginPath();
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 1.8;
      ctx.shadowColor = "#22c55e";
      ctx.shadowBlur = 4;

      for (let x = 0; x < w; x++) {
        let angle = x * freqFactor * 2.6 + t;
        let v = getWaveformVal(angle, state.trainer.waveform);
        if (state.trainer.modulation === "am") {
          v *= (0.7 + 0.3 * Math.sin(angle * 0.15));
        } else if (state.trainer.modulation === "fm") {
          angle += 0.8 * Math.sin(x * 0.03);
          v = getWaveformVal(angle, state.trainer.waveform);
        } else if (state.trainer.modulation === "pwm") {
          const duty = 0.5 + 0.3 * Math.sin(angle * 0.1);
          v = ((angle % (Math.PI * 2)) / (Math.PI * 2)) < duty ? 1 : -0.5;
        }
        const y = midY - v * ampPx;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Channel 2: Receiver (Neon Cyan #06b6d4)
    if (state.trainer.scopeCh2) {
      ctx.beginPath();
      ctx.strokeStyle = "#06b6d4";
      ctx.lineWidth = 1.6;
      ctx.shadowColor = "#06b6d4";
      ctx.shadowBlur = 4;

      const isCoupled = state.fibreInputConnected && state.lightSourceActive;
      const phaseLag = 0.85;

      for (let x = 0; x < w; x++) {
        let y = midY;
        if (isCoupled) {
          let angle = x * freqFactor * 2.6 + t - phaseLag;
          let v = getWaveformVal(angle, state.trainer.waveform);
          if (state.trainer.modulation === "am") {
            v *= (0.7 + 0.3 * Math.sin(angle * 0.15));
          } else if (state.trainer.modulation === "fm") {
            angle += 0.8 * Math.sin(x * 0.03);
            v = getWaveformVal(angle, state.trainer.waveform);
          } else if (state.trainer.modulation === "pwm") {
            const duty = 0.5 + 0.3 * Math.sin(angle * 0.1);
            v = ((angle % (Math.PI * 2)) / (Math.PI * 2)) < duty ? 1 : -0.5;
          }
          y = midY - v * (ampPx * 0.84); // Slight optical attenuation
        } else {
          // Photodetector dark thermal noise
          y = midY + (Math.sin(x * 0.9 + t * 4) * 1.5);
        }
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  // ==========================================
  // REAL-TIME SPECTRAL EMISSION ANALYZER
  // ==========================================
  function renderSpectralCanvas() {
    if (!spectralCanvas) spectralCanvas = document.getElementById("of-spectral-canvas");
    if (!spectralCanvas) return;
    if (!spectralCtx) spectralCtx = spectralCanvas.getContext("2d");
    const ctx = spectralCtx;
    const w = spectralCanvas.width;
    const h = spectralCanvas.height;

    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, w, h);

    if (!state.powerSupplyOn) {
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h - 5);
      ctx.lineTo(w, h - 5);
      ctx.stroke();
      return;
    }

    // Grid baseline
    ctx.strokeStyle = "rgba(56, 189, 248, 0.18)";
    ctx.lineWidth = 0.8;
    for (let x = 10; x < w; x += 15) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Map wavelength (400-1000nm) to horizontal position
    const minWl = 400;
    const maxWl = 1000;
    const centerNorm = (state.wavelengthNm - minWl) / (maxWl - minWl);
    const peakX = Math.max(15, Math.min(w - 15, centerNorm * w));
    const peakY = state.lightSourceActive ? 8 : h - 10;
    const sigma = 8.5;

    const grad = ctx.createLinearGradient(peakX - 25, 0, peakX + 25, 0);
    if (state.wavelengthNm < 500) {
      grad.addColorStop(0, "rgba(59, 130, 246, 0.08)");
      grad.addColorStop(0.5, "rgba(56, 189, 248, 0.8)");
      grad.addColorStop(1, "rgba(59, 130, 246, 0.08)");
    } else if (state.wavelengthNm < 600) {
      grad.addColorStop(0, "rgba(16, 185, 129, 0.08)");
      grad.addColorStop(0.5, "rgba(52, 211, 153, 0.85)");
      grad.addColorStop(1, "rgba(16, 185, 129, 0.08)");
    } else {
      grad.addColorStop(0, "rgba(239, 68, 68, 0.08)");
      grad.addColorStop(0.5, "rgba(248, 113, 113, 0.85)");
      grad.addColorStop(1, "rgba(239, 68, 68, 0.08)");
    }

    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 2) {
      const dist = (x - peakX) / sigma;
      const intensity = Math.exp(-0.5 * dist * dist);
      const y = h - (h - peakY) * intensity;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = state.wavelengthNm < 500 ? "#38bdf8" : (state.wavelengthNm < 600 ? "#34d399" : "#f87171");
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }

  function startScopeAnimation() {
    if (scopeAnimId) cancelAnimationFrame(scopeAnimId);

    function loop() {
      if (state.trainer.scopeRunning && state.powerSupplyOn) {
        state.trainer.timeOffset += 0.08 * (state.trainer.freqKhz / 2500);
      }
      renderScopeCanvas();
      renderSpectralCanvas();
      scopeAnimId = requestAnimationFrame(loop);
    }
    scopeAnimId = requestAnimationFrame(loop);
  }

  // ==========================================
  // HARDWARE TRAINER ACTION HANDLERS
  // ==========================================
  function setTrainerWaveform(wave) {
    state.trainer.waveform = wave;
    playClickAudio("click");

    document.querySelectorAll(".func-wave-btn").forEach(btn => {
      if (btn.getAttribute("data-wave") === wave) btn.classList.add("active");
      else btn.classList.remove("active");
    });

    document.getElementById("of-ind-sine")?.querySelector(".radio-led-pip")?.classList.toggle("active", wave === "sine");
    document.getElementById("of-ind-square")?.querySelector(".radio-led-pip")?.classList.toggle("active", wave === "square" || wave === "pulse");
    document.getElementById("of-ind-triangle")?.querySelector(".radio-led-pip")?.classList.toggle("active", wave === "triangle");

    const waveTag = document.getElementById("of-scope-wave-tag");
    if (waveTag) waveTag.textContent = wave.charAt(0).toUpperCase() + wave.slice(1, 3);
  }

  function cycleVoltage() {
    playClickAudio("click");
    state.trainer.voltageIndex = (state.trainer.voltageIndex + 1) % state.trainer.voltageSteps.length;
    state.trainer.voltage = state.trainer.voltageSteps[state.trainer.voltageIndex];

    const knob = document.getElementById("of-knob-voltage");
    if (knob) knob.style.transform = `rotate(${(state.trainer.voltageIndex * 70) - 70}deg)`;

    const voltReadout = document.getElementById("of-voltage-readout");
    if (voltReadout) voltReadout.textContent = `${state.trainer.voltage.toFixed(1)}V`;
  }

  function cycleFrequency() {
    playClickAudio("click");
    state.trainer.freqIndex = (state.trainer.freqIndex + 1) % state.trainer.freqSteps.length;
    state.trainer.freqKhz = state.trainer.freqSteps[state.trainer.freqIndex];

    const knob = document.getElementById("of-knob-freq");
    if (knob) knob.style.transform = `rotate(${(state.trainer.freqIndex * 60) - 90}deg)`;

    const label = state.trainer.freqLabels[state.trainer.freqIndex];
    const freqReadout = document.getElementById("of-freq-readout");
    const freqTag = document.getElementById("of-scope-freq-tag");
    if (freqReadout) freqReadout.textContent = label;
    if (freqTag) freqTag.textContent = `@ ${label}`;
  }

  function cycleAmplitude() {
    playClickAudio("click");
    state.trainer.ampIndex = (state.trainer.ampIndex + 1) % state.trainer.ampSteps.length;
    state.trainer.amplitudeV = state.trainer.ampSteps[state.trainer.ampIndex];

    const knob = document.getElementById("of-knob-amp");
    if (knob) knob.style.transform = `rotate(${(state.trainer.ampIndex * 70) - 70}deg)`;

    const ampReadout = document.getElementById("of-amp-readout");
    if (ampReadout) ampReadout.textContent = `${state.trainer.amplitudeV.toFixed(1)} V`;
  }

  function cycleWavelength() {
    playClickAudio("click");
    state.trainer.wlIndex = (state.trainer.wlIndex + 1) % state.trainer.wlPresets.length;
    const wl = state.trainer.wlPresets[state.trainer.wlIndex];
    setWavelength(wl);

    const knob = document.getElementById("of-knob-wavelength");
    if (knob) knob.style.transform = `rotate(${(state.trainer.wlIndex * 60) - 60}deg)`;
  }

  function setTrainerModulation(mod) {
    playClickAudio("click");
    state.trainer.modulation = mod;

    document.querySelectorAll(".mod-pill-btn").forEach(btn => {
      if (btn.getAttribute("data-mod") === mod) btn.classList.add("active");
      else btn.classList.remove("active");
    });
  }

  function toggleScopeRun() {
    playClickAudio("click");
    state.trainer.scopeRunning = !state.trainer.scopeRunning;
    const btn = document.getElementById("of-btn-scope-run");
    if (btn) btn.classList.toggle("active", state.trainer.scopeRunning);
  }

  function toggleScopePhase() {
    playClickAudio("click");
    state.trainer.scopeCh2 = !state.trainer.scopeCh2;
    const btn = document.getElementById("of-btn-scope-rq");
    if (btn) btn.classList.toggle("active", state.trainer.scopeCh2);
  }

  function cycleScopeTimebase() {
    playClickAudio("click");
    state.trainer.scopeTimebase = state.trainer.scopeTimebase === 1.0 ? 2.0 : (state.trainer.scopeTimebase === 2.0 ? 0.5 : 1.0);
    const btn = document.getElementById("of-btn-scope-scale");
    if (btn) btn.classList.toggle("active", state.trainer.scopeTimebase !== 1.0);
  }

  function toggleScopeCh1() {
    playClickAudio("click");
    state.trainer.scopeCh1 = !state.trainer.scopeCh1;
    document.getElementById("of-scope-btn-ch1")?.classList.toggle("active", state.trainer.scopeCh1);
  }

  function toggleScopeCh2() {
    playClickAudio("click");
    state.trainer.scopeCh2 = !state.trainer.scopeCh2;
    document.getElementById("of-scope-btn-ch2")?.classList.toggle("active", state.trainer.scopeCh2);
  }

  function toggleScopeGrid() {
    playClickAudio("click");
    state.trainer.scopeGrid = !state.trainer.scopeGrid;
    document.getElementById("of-scope-btn-grid")?.classList.toggle("active", state.trainer.scopeGrid);
  }

  function updateHardwareSwitchesDom() {
    const pwrBtn = document.getElementById("of-btn-power-switch");
    const pwrState = document.getElementById("of-state-power");
    const pwrLed = document.getElementById("of-led-power");

    const lsrBtn = document.getElementById("of-btn-laser-switch");
    const lsrState = document.getElementById("of-state-laser");
    const lsrLed = document.getElementById("of-led-laser");
    const lsrFault = document.getElementById("of-led-fault");
    const hazardSign = document.getElementById("of-hazard-sign");

    const cableBtn = document.getElementById("of-btn-cable-toggle");
    const cableState = document.getElementById("of-state-cable");

    const jigBtn = document.getElementById("of-btn-jig-toggle");
    const jigState = document.getElementById("of-state-jig");

    const voltReadout = document.getElementById("of-voltage-readout");
    const freqReadout = document.getElementById("of-freq-readout");
    const ampReadout = document.getElementById("of-amp-readout");
    const waveTag = document.getElementById("of-scope-wave-tag");
    const freqTag = document.getElementById("of-scope-freq-tag");
    const spectralPeak = document.getElementById("of-spectral-peak-tag");

    // Power rocker switch & LED
    if (pwrBtn) {
      if (state.powerSupplyOn) pwrBtn.classList.add("active");
      else pwrBtn.classList.remove("active");
    }
    if (pwrState) pwrState.textContent = state.powerSupplyOn ? "ON" : "OFF";
    if (pwrLed) {
      if (state.powerSupplyOn) pwrLed.classList.add("active");
      else pwrLed.classList.remove("active");
    }

    // Laser emitter, indicator LED & hazard badge
    const isLaserActive = state.lightSourceActive && state.powerSupplyOn;
    if (lsrBtn) {
      if (isLaserActive) {
        lsrBtn.classList.add("active");
        lsrBtn.classList.add("active-laser-glow");
      } else {
        lsrBtn.classList.remove("active");
        lsrBtn.classList.remove("active-laser-glow");
      }
    }
    if (lsrState) lsrState.textContent = state.lightSourceActive ? "ON" : "OFF";
    if (lsrLed) {
      if (isLaserActive) lsrLed.classList.add("active");
      else lsrLed.classList.remove("active");
    }
    if (lsrFault) {
      if (isLaserActive) lsrFault.classList.add("active");
      else lsrFault.classList.remove("active");
    }
    if (hazardSign) {
      if (isLaserActive) hazardSign.classList.add("active-hazard");
      else hazardSign.classList.remove("active-hazard");
    }

    // Fiber cable spool glowing and coupling state on the realistic chassis
    const kitChassis = document.querySelector(".kit-chassis");
    if (kitChassis) {
      kitChassis.classList.toggle("cable-emitter-connected", Boolean(state.fibreInputConnected));
      kitChassis.classList.toggle("cable-receiver-connected", Boolean(state.fibreOutputMounted));
      kitChassis.classList.toggle("laser-on", Boolean(isLaserActive && state.fibreInputConnected));
      kitChassis.classList.toggle("laser-active-chassis", Boolean(isLaserActive));
      kitChassis.classList.toggle("cable-unplugged", !state.fibreInputConnected);
    }
    const clampAssembly = document.querySelector(".jig-clamp-assembly");
    if (clampAssembly) {
      clampAssembly.classList.toggle("clamped", Boolean(state.fibreOutputMounted));
    }

    if (cableBtn) {
      if (isLaserActive && state.fibreInputConnected) {
        cableBtn.classList.add("laser-glowing");
        if (state.wavelengthNm < 500) {
          cableBtn.classList.remove("wl-green");
          cableBtn.classList.add("wl-blue");
        } else if (state.wavelengthNm < 600) {
          cableBtn.classList.remove("wl-blue");
          cableBtn.classList.add("wl-green");
        } else {
          cableBtn.classList.remove("wl-blue", "wl-green");
        }
      } else {
        cableBtn.classList.remove("laser-glowing", "wl-blue", "wl-green");
      }
    }
    if (cableState) {
      cableState.textContent = state.fibreInputConnected ? "Coupled" : "Unplugged";
      cableState.style.color = state.fibreInputConnected ? "#10b981" : "#ef4444";
    }

    // Jig clamp
    if (jigBtn) {
      if (state.fibreOutputMounted) jigBtn.classList.add("active");
      else jigBtn.classList.remove("active");
    }
    if (jigState) jigState.textContent = state.fibreOutputMounted ? "Locked" : "Unlocked";

    // Refresh dynamic fiber cable geometry coordinates
    updateFiberCableGeometry();

    // Telemetry readouts
    if (voltReadout) voltReadout.textContent = `${state.trainer.voltage.toFixed(1)}V`;
    if (freqReadout) freqReadout.textContent = state.trainer.freqLabels[state.trainer.freqIndex];
    if (ampReadout) ampReadout.textContent = `${state.trainer.amplitudeV.toFixed(1)} V`;
    if (waveTag) waveTag.textContent = state.trainer.waveform.charAt(0).toUpperCase() + state.trainer.waveform.slice(1, 3);
    if (freqTag) freqTag.textContent = `@ ${state.trainer.freqLabels[state.trainer.freqIndex]}`;
    if (spectralPeak) spectralPeak.textContent = `${state.wavelengthNm}nm`;

    // Wavelength tags
    document.querySelectorAll(".wl-pos-tag").forEach(tag => {
      const tagWl = Number(tag.getAttribute("data-wl"));
      if (tagWl === state.wavelengthNm) tag.classList.add("active");
      else tag.classList.remove("active");
    });

    // Legacy wavelength chip buttons
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

    if (onExperimentRecorded) {
      onExperimentRecorded("optical", {
        experimentName: "Determination of Numerical Aperture of an Optical Fibre",
        completed: true,
        score: Number((obsEntry.na * 100).toFixed(1)),
        xpEarned: 20
      });
    }
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
            <td style="text-align:center;">
              <button type="button" class="btn-delete-obs of-btn-delete-obs" data-del-of-obs="${idx}" title="Delete Reading #${obs.reading}">
                <svg class="svg-icon svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </td>
          </tr>
        `;
      }).join("");

      if (!tbody._deleteListenerAttached) {
        tbody._deleteListenerAttached = true;
        tbody.addEventListener("click", (e) => {
          const delBtn = e.target.closest("[data-del-of-obs]");
          if (delBtn) {
            const idx = parseInt(delBtn.getAttribute("data-del-of-obs"), 10);
            if (!isNaN(idx) && idx >= 0 && idx < state.observations.length) {
              const deleted = state.observations.splice(idx, 1)[0];
              state.observations.forEach((o, i) => { o.reading = i + 1; });
              renderObservationsDom();
              if (showToast) showToast(`Optical Fibre Reading #${deleted.reading} deleted.`);
            }
          }
        });
      }
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
    if (isUserAuthenticated && !isUserAuthenticated()) {
      if (openLoginModal) {
        openLoginModal("Exporting Optical Fibre observations to CSV requires account sign-in. Sign in to download your dataset!");
      } else if (showToast) {
        showToast("Please sign in to export observations to CSV.");
      }
      return;
    }

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
    if (isUserAuthenticated && !isUserAuthenticated()) {
      if (openLoginModal) {
        openLoginModal("Generating official Optical Fibre PDF lab reports requires account sign-in. Sign in to download your certified report!");
      } else if (showToast) {
        showToast("Please sign in to download PDF reports.");
      }
      return;
    }

    if (state.observations.length === 0) {
      if (showToast) showToast("No optical fibre readings recorded yet. Record observations first!");
      return;
    }

    const profile = getStoredUserProfile ? getStoredUserProfile() : {};
    const studentName = (profile?.name || "").trim() || "Guest Student";
    const collegeName = (profile?.college || profile?.occ || "").trim() || "---";
    const studentEmail = profile?.email || (getActiveUserId && getActiveUserId() !== "guest" && String(getActiveUserId()).includes("@") ? `${getActiveUserId()}` : "guest@physix.lab");
    const studentRole = profile?.edu || "Student Researcher";

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

    const btn = document.getElementById("of-btn-export-pdf");
    if (btn && btn.disabled) return;
    if (btn) {
      btn.disabled = true;
      btn.setAttribute("data-orig-html", btn.innerHTML);
      btn.innerHTML = `<span>Generating Report...</span>`;
    }

    try {
      generateLabReportPdf({
        labTitle: "Numerical Aperture of an Optical Fibre Logbook",
        labSubtitle: "Optoelectronic Laser Divergence, Total Internal Reflection & Acceptance Angle Dynamics",
        experimentCode: "EXP-02",
        studentName,
        collegeName,
        studentEmail,
        studentRole,
        summaryMetrics: [
          { label: "Total Readings", value: `${state.observations.length} Entries`, color: [14, 165, 233] },
          { label: "Mean Numerical Aperture", value: `${meanNA.toFixed(4)}`, color: [6, 182, 212] },
          { label: "Mean Acceptance Angle", value: `${meanTheta.toFixed(1)} deg`, color: [139, 92, 246] },
          { label: "Experimental Accuracy", value: `${accuracyPct.toFixed(1)}%`, color: [16, 185, 129] }
        ],
        columns,
        rows,
        filename: `PhysiX_Optical_Fibre_NA_Report_${Date.now()}.pdf`,
        orientation: "landscape"
      });

      if (showToast) showToast("Generated and downloaded official PhysiX PDF report.");
      if (btn) btn.innerHTML = `<span>Report Exported!</span>`;
    } catch (err) {
      console.error("Optical Fibre PDF export failed:", err);
      if (showToast) showToast("Failed to generate PDF report. Please try again.");
    } finally {
      if (btn) {
        setTimeout(() => {
          btn.disabled = false;
          btn.innerHTML = btn.getAttribute("data-orig-html") || `<span>Export PDF Logbook</span>`;
        }, 1500);
      }
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
      if (onChallengeCompleted) {
        onChallengeCompleted({
          challengeId: "optical.spotMatch",
          xp: ch.xp,
          badgeId: "badge-of-spot-match",
          badgeTitle: "Spot Match Master (Concentric Laser Alignment)",
          title: `Spot Match Master (${ch.targetDiameter} cm)`
        });
      } else {
        if (onXpAwarded) onXpAwarded(ch.xp, `Spot Match Master (${ch.targetDiameter} cm)`);
        if (unlockBadge) unlockBadge("badge-of-spot-match", "Spot Match Master (Concentric Laser Alignment)");
        showToast(`Challenge Accomplished: Spot Match (${ch.targetDiameter} cm) +${ch.xp} XP!`);
      }
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
        if (onChallengeCompleted) {
          onChallengeCompleted({
            challengeId: "optical.rapidCalib",
            xp: ch.xp,
            badgeId: "badge-of-rapid-calib",
            badgeTitle: "Laser Calibration Virtuoso (40s Speedrun)",
            title: "Rapid 3-Point Laser Calibration"
          });
        } else {
          if (onXpAwarded) onXpAwarded(ch.xp, "Rapid 3-Point Laser Calibration");
          if (unlockBadge) unlockBadge("badge-of-rapid-calib", "Laser Calibration Virtuoso (40s Speedrun)");
          showToast(`Challenge Accomplished: Rapid Calibration Run +${ch.xp} XP!`);
        }
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
      if (onChallengeCompleted) {
        onChallengeCompleted({
          challengeId: "optical.multiSweep",
          xp: ch.xp,
          badgeId: "badge-of-multi-sweep",
          badgeTitle: "NA Invariance Champion (3-Zone Distance Sweep)",
          title: "Multi-Distance NA Invariance Sweep"
        });
      } else {
        if (onXpAwarded) onXpAwarded(ch.xp, "Multi-Distance NA Invariance Sweep");
        if (unlockBadge) unlockBadge("badge-of-multi-sweep", "NA Invariance Champion (3-Zone Distance Sweep)");
        showToast(`Challenge Accomplished: Multi-Distance Data Sweep +${ch.xp} XP!`);
      }
    } else {
      renderChallengesDom();
    }
  }

  function hydrateChallenges(completedIds) {
    if (!Array.isArray(completedIds)) return;
    const set = new Set(completedIds);
    let changed = false;
    if (set.has("optical.spotMatch") && !state.challenges.spotMatch.completed) {
      state.challenges.spotMatch.completed = true;
      changed = true;
    }
    if (set.has("optical.rapidCalib") && !state.challenges.rapidCalib.completed) {
      state.challenges.rapidCalib.completed = true;
      changed = true;
    }
    if (set.has("optical.multiSweep") && !state.challenges.multiSweep.completed) {
      state.challenges.multiSweep.completed = true;
      changed = true;
    }
    if (changed) {
      saveChallengesToStorage();
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
    playClickAudio(state.powerSupplyOn ? "power-off" : "power-on");
    state.powerSupplyOn = !state.powerSupplyOn;
    if (!state.powerSupplyOn) {
      state.lightSourceActive = false;
    }
    showToast(state.powerSupplyOn ? "Main Trainer Power ON" : "Trainer Power Switched OFF");
    renderAll();
  }

  function toggleLaser() {
    if (!state.powerSupplyOn) {
      playClickAudio("warning");
      showToast("Switch on Power Supply first!");
      return;
    }
    playClickAudio(state.lightSourceActive ? "click-light" : "laser-hum");
    state.lightSourceActive = !state.lightSourceActive;
    showToast(state.lightSourceActive ? `Laser Active (${state.wavelengthNm}nm)` : "Laser Light Deactivated");
    renderAll();
  }

  function toggleCable() {
    playClickAudio("click");
    state.fibreInputConnected = !state.fibreInputConnected;
    if (!state.fibreInputConnected) {
      state.fibreOutputMounted = false;
      showToast("Fibre Cable Disconnected from Emitter Port");
    } else {
      showToast("Fibre Cable Connected to Emitter Port! Click Jig Clamp to connect to Receiver.");
    }
    renderAll();
    if (state.fibreInputConnected) {
      updateFiberCableGeometry("seg1");
    }
  }

  function toggleJig() {
    playClickAudio("ratchet");
    if (!state.fibreInputConnected) {
      state.fibreInputConnected = true;
      state.fibreOutputMounted = true;
      showToast("Fibre Cable Attached to Emitter & Connected to Receiver Port!");
      renderAll();
      updateFiberCableGeometry("both");
    } else {
      state.fibreOutputMounted = !state.fibreOutputMounted;
      showToast(state.fibreOutputMounted 
        ? "Fibre Cable Clamped & Connected to Receiver Sensor Port!" 
        : "Fibre Cable Unclamped from Receiver");
      renderAll();
      if (state.fibreOutputMounted) {
        updateFiberCableGeometry("seg2");
      }
    }
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
    document.getElementById("of-btn-sensor-toggle")?.addEventListener("click", toggleJig);

    // Dynamic optical cable geometry resize observer
    window.addEventListener("resize", () => updateFiberCableGeometry());
    const kitChassisEl = document.querySelector(".kit-chassis");
    if (kitChassisEl && window.ResizeObserver) {
      new ResizeObserver(() => updateFiberCableGeometry()).observe(kitChassisEl);
    }
    setTimeout(() => updateFiberCableGeometry(), 120);

    // Realistic Trainer Waveform Selectors
    document.getElementById("of-btn-wave-sine")?.addEventListener("click", () => setTrainerWaveform("sine"));
    document.getElementById("of-btn-wave-square")?.addEventListener("click", () => setTrainerWaveform("square"));
    document.getElementById("of-btn-wave-pulse")?.addEventListener("click", () => setTrainerWaveform("pulse"));
    document.getElementById("of-btn-wave-triangle")?.addEventListener("click", () => setTrainerWaveform("triangle"));

    // Knobs
    document.getElementById("of-knob-voltage")?.addEventListener("click", cycleVoltage);
    document.getElementById("of-knob-freq")?.addEventListener("click", cycleFrequency);
    document.getElementById("of-knob-amp")?.addEventListener("click", cycleAmplitude);
    document.getElementById("of-knob-wavelength")?.addEventListener("click", cycleWavelength);
    document.getElementById("of-knob-meas-volt")?.addEventListener("click", cycleVoltage);

    // Modulation Buttons
    document.getElementById("of-btn-mod-am")?.addEventListener("click", () => setTrainerModulation("am"));
    document.getElementById("of-btn-mod-fm")?.addEventListener("click", () => setTrainerModulation("fm"));
    document.getElementById("of-btn-mod-pwm")?.addEventListener("click", () => setTrainerModulation("pwm"));

    // Digital Oscilloscope Buttons
    document.getElementById("of-btn-scope-run")?.addEventListener("click", toggleScopeRun);
    document.getElementById("of-btn-scope-rq")?.addEventListener("click", toggleScopePhase);
    document.getElementById("of-btn-scope-scale")?.addEventListener("click", cycleScopeTimebase);
    document.getElementById("of-scope-btn-ch1")?.addEventListener("click", toggleScopeCh1);
    document.getElementById("of-scope-btn-ch2")?.addEventListener("click", toggleScopeCh2);
    document.getElementById("of-scope-btn-math")?.addEventListener("click", () => {
      state.trainer.scopeMath = !state.trainer.scopeMath;
      document.getElementById("of-scope-btn-math")?.classList.toggle("active", state.trainer.scopeMath);
    });
    document.getElementById("of-scope-btn-grid")?.addEventListener("click", toggleScopeGrid);

    // Spectral Toggle
    document.getElementById("of-btn-spectral-toggle")?.addEventListener("click", () => {
      playClickAudio("click");
      state.trainer.spectralMode = state.trainer.spectralMode === "spectrum" ? "power" : "spectrum";
      showToast(`Spectral Display Mode: ${state.trainer.spectralMode.toUpperCase()}`);
    });

    // TX Mode Button
    document.getElementById("of-btn-tx-mode")?.addEventListener("click", () => {
      playClickAudio("click");
      showToast("Transmitter Mode: High-Coherence Semiconductor Laser Diode (SMA Coupled)");
    });

    // Wavelength Tag Click Handlers
    document.querySelectorAll(".wl-pos-tag").forEach(tag => {
      tag.addEventListener("click", () => {
        const wl = Number(tag.getAttribute("data-wl"));
        if (wl) {
          playClickAudio("click");
          setWavelength(wl);
        }
      });
    });

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
    hydrateChallenges,
    getState: () => state,
    setDistance: (d) => { state.distanceL = d; renderAll(); },
    setWavelength,
    togglePower,
    toggleLaser,
    recordObservation,
    clearObservations
  };
}
