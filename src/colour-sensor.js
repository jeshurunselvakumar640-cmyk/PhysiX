/**
 * PhysiX • Experiment 3: Study of Colour Sensor
 * High-precision, gamified, interactive virtual laboratory.
 * TCS3200 / TCS230 Optoelectronic light-to-frequency conversion model,
 * silicon photodiode array spectral response, tristimulus colorimetry,
 * real-time digital oscilloscope pulse generator, and inverse-square distance optics.
 * 100% Zero Emojis compliant.
 */

import { api } from "./api.js";
import { generateLabReportPdf } from "./pdf-export.js";

export function createColourSensorExperiment(callbacks = {}) {
  const { onXpAwarded, showToast, getActiveUserId, loadUserProfile, getStoredUserProfile, unlockBadge, isUserAuthenticated, openLoginModal } = callbacks;

  // Preset Calibrated Swatches
  const PRESET_SWATCHES = {
    red: { id: "red", name: "Crimson Red", hex: "#ef4444", r: 239, g: 68, b: 68, rRef: 0.94, gRef: 0.18, bRef: 0.18, domWl: 650 },
    green: { id: "green", name: "Emerald Green", hex: "#10b981", r: 16, g: 185, b: 129, rRef: 0.12, gRef: 0.88, bRef: 0.35, domWl: 532 },
    blue: { id: "blue", name: "Cobalt Blue", hex: "#3b82f6", r: 59, g: 130, b: 246, rRef: 0.15, gRef: 0.32, bRef: 0.95, domWl: 470 },
    yellow: { id: "yellow", name: "Cadmium Yellow", hex: "#eab308", r: 234, g: 179, b: 8, rRef: 0.92, gRef: 0.86, bRef: 0.12, domWl: 580 },
    cyan: { id: "cyan", name: "Cyan Aqua", hex: "#06b6d4", r: 6, g: 182, b: 212, rRef: 0.10, gRef: 0.82, bRef: 0.92, domWl: 495 },
    magenta: { id: "magenta", name: "Magenta Violet", hex: "#d946ef", r: 217, g: 70, b: 239, rRef: 0.88, gRef: 0.15, bRef: 0.90, domWl: 420 },
    orange: { id: "orange", name: "Amber Orange", hex: "#f97316", r: 249, g: 115, b: 22, rRef: 0.95, gRef: 0.55, bRef: 0.10, domWl: 605 },
    violet: { id: "violet", name: "Deep Violet", hex: "#8b5cf6", r: 139, g: 92, b: 246, rRef: 0.50, gRef: 0.20, bRef: 0.92, domWl: 430 },
    white: { id: "white", name: "White Calibration Card", hex: "#f8fafc", r: 248, g: 250, b: 252, rRef: 0.98, gRef: 0.98, bRef: 0.98, domWl: 550 },
    black: { id: "black", name: "Matte Black Card", hex: "#1e293b", r: 30, g: 41, b: 59, rRef: 0.05, gRef: 0.05, bRef: 0.06, domWl: 0 }
  };

  // Mystery Specimen Database for Detective Challenge
  const MYSTERY_SPECIMENS = {
    m1: { id: "m1", name: "Specimen A", chemicalName: "Chlorophyll-A Extract", hex: "#15803d", rRef: 0.14, gRef: 0.75, bRef: 0.22, domWl: 545, clue: "Photosynthetic organic pigment with strong green reflection." },
    m2: { id: "m2", name: "Specimen B", chemicalName: "Copper(II) Sulfate Hydrate", hex: "#0284c7", rRef: 0.08, gRef: 0.45, bRef: 0.92, domWl: 480, clue: "Inorganic transition metal salt with intense cyan-blue absorption spectrum." },
    m3: { id: "m3", name: "Specimen C", chemicalName: "Potassium Permanganate", hex: "#7e22ce", rRef: 0.65, gRef: 0.12, bRef: 0.85, domWl: 415, clue: "Potent crystalline oxidizer exhibiting deep royal magenta-purple hue." },
    m4: { id: "m4", name: "Specimen D", chemicalName: "Curcumin Bio-Extract", hex: "#f59e0b", rRef: 0.95, gRef: 0.72, bRef: 0.08, domWl: 585, clue: "Natural polyphenol dye exhibiting vivid golden-amber spectral peaks." }
  };

  // Scientific Model State
  const state = {
    // Hardware Switches & Pins
    powerSupplyOn: false,
    ledArrayActive: false,
    scaling: "20%", // "0%", "2%", "20%", "100%"
    filterChannel: "clear", // "red", "green", "blue", "clear"
    distanceMm: 12.0, // Standoff distance in mm (5.0 to 30.0 mm, optimal ~ 10-14 mm)

    // Active Swatch State
    currentSwatchId: "red",
    isCustomMode: false,
    customColorHex: "#f59e0b",
    isMysteryMode: false,
    mysteryId: "m1",

    // Calibration Reference (White Card at 12mm with 20% scaling)
    whiteRefFreqs: { red: 82.5, green: 89.0, blue: 94.2, clear: 118.5 },

    // Real-time calculated frequencies (kHz)
    freqRed: 0,
    freqGreen: 0,
    freqBlue: 0,
    freqClear: 0,
    currentOutputFrequency: 0, // kHz for active S2/S3 channel

    // Normalized color reconstruction (0 - 255)
    reconR: 0,
    reconG: 0,
    reconB: 0,
    reconHex: "#000000",
    matchFidelityPct: 0,
    dominantWavelengthNm: 0,

    // Observations
    observations: [],

    // Mastery Challenges
    challenges: {
      primaryCalib: {
        completed: false,
        xp: 100,
        calibratedSteps: { white: false, red: false, green: false, blue: false }
      },
      mysteryDetective: {
        completed: false,
        xp: 125,
        solved: false
      },
      distanceSweep: {
        completed: false,
        xp: 150,
        zones: { near: false, optimal: false, far: false }
      }
    }
  };

  // Canvas contexts
  let benchCanvas = null;
  let benchCtx = null;
  let oscCanvas = null;
  let oscCtx = null;

  const BENCH_LOGICAL_W = 800;
  const BENCH_LOGICAL_H = 380;
  const OSC_LOGICAL_W = 380;
  const OSC_LOGICAL_H = 300;

  // Animation frame loop
  let animationFrameId = null;
  let oscPhase = 0;
  let photonTick = 0;

  // Clickable interactive bounding boxes on bench canvas
  const clickRegions = {
    powerSwitch: { x: 45, y: 250, w: 45, h: 45 },
    ledSwitch: { x: 105, y: 250, w: 45, h: 45 },
    sensorArray: { x: 260, y: 130, w: 90, h: 90 },
    specimenStage: { x: 480, y: 110, w: 100, h: 140 }
  };

  function isApparatusOperable() {
    return state.powerSupplyOn && state.scaling !== "0%";
  }

  function hexToRgb(hex) {
    const clean = hex.replace("#", "");
    const bigint = parseInt(clean, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
  }

  function getActiveSampleReflectance() {
    if (state.isMysteryMode) {
      const myst = MYSTERY_SPECIMENS[state.mysteryId] || MYSTERY_SPECIMENS.m1;
      return {
        name: myst.name,
        hex: myst.hex,
        rRef: myst.rRef,
        gRef: myst.gRef,
        bRef: myst.bRef,
        domWl: myst.domWl,
        isMystery: true
      };
    }

    if (state.isCustomMode) {
      const rgb = hexToRgb(state.customColorHex);
      const rRef = Math.max(0.04, rgb.r / 255);
      const gRef = Math.max(0.04, rgb.g / 255);
      const bRef = Math.max(0.04, rgb.b / 255);
      let domWl = 550;
      if (rRef > gRef && rRef > bRef) domWl = 630;
      else if (gRef > rRef && gRef > bRef) domWl = 530;
      else if (bRef > rRef && bRef > gRef) domWl = 465;
      return {
        name: `Custom (${state.customColorHex})`,
        hex: state.customColorHex,
        rRef,
        gRef,
        bRef,
        domWl,
        isMystery: false
      };
    }

    const preset = PRESET_SWATCHES[state.currentSwatchId] || PRESET_SWATCHES.red;
    return {
      name: preset.name,
      hex: preset.hex,
      rRef: preset.rRef,
      gRef: preset.gRef,
      bRef: preset.bRef,
      domWl: preset.domWl,
      isMystery: false
    };
  }

  // ==========================================
  // SCIENTIFIC OPTOELECTRONICS CALCULATIONS
  // ==========================================
  function calculateSensorPhysics() {
    if (!state.powerSupplyOn || state.scaling === "0%") {
      state.freqRed = 0;
      state.freqGreen = 0;
      state.freqBlue = 0;
      state.freqClear = 0;
      state.currentOutputFrequency = 0;
      state.reconR = 0;
      state.reconG = 0;
      state.reconB = 0;
      state.reconHex = "#000000";
      state.matchFidelityPct = 0;
      state.dominantWavelengthNm = 0;
      return;
    }

    // Scaling multiplier
    let scaleMult = 0.2; // default 20%
    if (state.scaling === "2%") scaleMult = 0.02;
    else if (state.scaling === "100%") scaleMult = 1.0;

    // Illumination Factor
    const illFactor = state.ledArrayActive ? 1.0 : 0.08; // Ambient dark response if LEDs are OFF

    // Inverse Square Distance Attenuation Model with optimal focal distance d0 = 12mm
    // At d < 7mm, shadow vignette reduces efficiency; at d > 15mm, 1/d^2 light dropoff dominates
    const d = state.distanceMm;
    const d0 = 12.0;
    let distanceEfficiency = 1.0;
    if (d < d0) {
      // Slight mechanical shading under 8mm
      distanceEfficiency = Math.max(0.65, 1.0 - Math.pow((d0 - d) / d0, 1.6) * 0.45);
    } else {
      // Inverse square dropoff
      distanceEfficiency = Math.pow(d0 / d, 1.75);
    }

    const sample = getActiveSampleReflectance();
    const baseFreq = 500.0 * scaleMult * illFactor * distanceEfficiency; // Max base scale kHz

    // Silicon Photodiode Matrix Cross-Talk Responsivity Matrix (TCS3200 empirical model)
    // Red Channel: peak red + slight blue/IR leak
    state.freqRed = Math.max(0.2, baseFreq * (0.86 * sample.rRef + 0.08 * sample.gRef + 0.06 * sample.bRef));
    // Green Channel: peak green + slight red/blue overlap
    state.freqGreen = Math.max(0.2, baseFreq * (0.10 * sample.rRef + 0.82 * sample.gRef + 0.08 * sample.bRef));
    // Blue Channel: peak blue + slight green overlap
    state.freqBlue = Math.max(0.2, baseFreq * (0.08 * sample.rRef + 0.14 * sample.gRef + 0.84 * sample.bRef));
    // Clear Channel: broadband unfiltered summation
    state.freqClear = Math.max(0.4, baseFreq * (0.33 * sample.rRef + 0.38 * sample.gRef + 0.29 * sample.bRef) * 1.35);

    // Active Channel Output Frequency
    switch (state.filterChannel) {
      case "red":
        state.currentOutputFrequency = state.freqRed;
        break;
      case "green":
        state.currentOutputFrequency = state.freqGreen;
        break;
      case "blue":
        state.currentOutputFrequency = state.freqBlue;
        break;
      case "clear":
      default:
        state.currentOutputFrequency = state.freqClear;
        break;
    }

    // Normalized Chromaticity & RGB Reconstruction via White Balance Reference
    const refScale = (500.0 * scaleMult * illFactor * distanceEfficiency) / (500.0 * 0.2 * 1.0 * 1.0);
    const expectedWhiteR = Math.max(1, state.whiteRefFreqs.red * refScale);
    const expectedWhiteG = Math.max(1, state.whiteRefFreqs.green * refScale);
    const expectedWhiteB = Math.max(1, state.whiteRefFreqs.blue * refScale);

    let rawR = Math.min(255, Math.max(0, Math.round((state.freqRed / expectedWhiteR) * 255)));
    let rawG = Math.min(255, Math.max(0, Math.round((state.freqGreen / expectedWhiteG) * 255)));
    let rawB = Math.min(255, Math.max(0, Math.round((state.freqBlue / expectedWhiteB) * 255)));

    if (!state.ledArrayActive) {
      rawR = Math.round(rawR * 0.2);
      rawG = Math.round(rawG * 0.2);
      rawB = Math.round(rawB * 0.2);
    }

    state.reconR = rawR;
    state.reconG = rawG;
    state.reconB = rawB;

    const toHex = (c) => {
      const h = c.toString(16);
      return h.length === 1 ? "0" + h : h;
    };
    state.reconHex = `#${toHex(rawR)}${toHex(rawG)}${toHex(rawB)}`;
    state.dominantWavelengthNm = sample.domWl;

    // Calculate match fidelity % compared to sample target
    const targetRgb = hexToRgb(sample.hex);
    const distR = rawR - targetRgb.r;
    const distG = rawG - targetRgb.g;
    const distB = rawB - targetRgb.b;
    const euclideanDist = Math.sqrt(distR * distR + distG * distG + distB * distB);
    const maxDist = Math.sqrt(255 * 255 * 3);
    state.matchFidelityPct = Math.max(0, Math.min(100, Math.round((1 - euclideanDist / maxDist) * 100)));

    // Live evaluate active challenges
    evaluateLiveChallenges();
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

  // 1. RENDER MAIN HARDWARE BENCH CANVAS
  function renderBenchCanvas() {
    if (!benchCtx || !benchCanvas) return;
    prepareCanvasDpi(benchCanvas, benchCtx, BENCH_LOGICAL_W, BENCH_LOGICAL_H);

    const ctx = benchCtx;
    const width = BENCH_LOGICAL_W;
    const height = BENCH_LOGICAL_H;
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    const sample = getActiveSampleReflectance();

    ctx.clearRect(0, 0, width, height);

    // Workbench Background
    ctx.fillStyle = isLight ? "#f0f9ff" : "#0a0f1d";
    ctx.fillRect(0, 0, width, height);

    // Fine grid
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

    // Laboratory Bench Top Plate
    const benchY = 230;
    const gradBench = ctx.createLinearGradient(0, benchY, 0, height);
    gradBench.addColorStop(0, isLight ? "#e2e8f0" : "#131b2e");
    gradBench.addColorStop(1, isLight ? "#cbd5e1" : "#0d1322");
    ctx.fillStyle = gradBench;
    ctx.fillRect(30, benchY, width - 60, height - benchY - 20);
    ctx.strokeStyle = isLight ? "#94a3b8" : "#23314e";
    ctx.lineWidth = 2;
    ctx.strokeRect(30, benchY, width - 60, height - benchY - 20);

    // Precision Graduated Vernier Optical Rail (under stage)
    const railX = 220;
    const railW = 440;
    const railY = benchY + 15;
    const railH = 22;

    ctx.fillStyle = isLight ? "#cbd5e1" : "#1e293b";
    ctx.fillRect(railX, railY, railW, railH);
    ctx.strokeStyle = isLight ? "#64748b" : "#475569";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(railX, railY, railW, railH);

    // Rail Millimeter Tick Marks
    ctx.fillStyle = isLight ? "#475569" : "#94a3b8";
    ctx.font = "8px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    for (let mm = 0; mm <= 35; mm += 1) {
      const tx = railX + 20 + mm * 11;
      if (tx > railX + railW - 10) break;
      const isMajor = mm % 5 === 0;
      const isCm = mm % 10 === 0;
      const tLen = isCm ? 12 : isMajor ? 8 : 4;
      ctx.beginPath();
      ctx.moveTo(tx, railY + railH);
      ctx.lineTo(tx, railY + railH - tLen);
      ctx.strokeStyle = isCm ? (isLight ? "#0f172a" : "#38bdf8") : isLight ? "#64748b" : "#64748b";
      ctx.lineWidth = isCm ? 1.5 : 0.8;
      ctx.stroke();

      if (isMajor && mm >= 5 && mm <= 30) {
        ctx.fillText(`${mm}`, tx, railY + railH - tLen - 3);
      }
    }

    // Rail scale caption
    ctx.fillStyle = isLight ? "#64748b" : "#64748b";
    ctx.font = "9px 'Inter', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("Optical Standoff Distance (mm)", railX + railW - 10, railY + railH + 18);

    // ==========================================
    // 1. TRAINER MAIN CONTROL UNIT CHASSIS (LEFT)
    // ==========================================
    const unitX = 40;
    const unitY = 60;
    const unitW = 160;
    const unitH = 240;

    const gradUnit = ctx.createLinearGradient(unitX, unitY, unitX + unitW, unitY + unitH);
    gradUnit.addColorStop(0, isLight ? "#f8fafc" : "#182238");
    gradUnit.addColorStop(1, isLight ? "#e2e8f0" : "#0f1626");
    ctx.fillStyle = gradUnit;
    ctx.fillRect(unitX, unitY, unitW, unitH);
    ctx.strokeStyle = isLight ? "#94a3b8" : "#2a3b5c";
    ctx.lineWidth = 2;
    ctx.strokeRect(unitX, unitY, unitW, unitH);

    // Unit Header
    ctx.fillStyle = isLight ? "#0f172a" : "#f1f5f9";
    ctx.font = "bold 11px 'Inter', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("TCS3200 CONTROLLER", unitX + 12, unitY + 22);

    ctx.fillStyle = isLight ? "#64748b" : "#94a3b8";
    ctx.font = "8.5px 'JetBrains Mono', monospace";
    ctx.fillText("COLORIMETRY TRAINER", unitX + 12, unitY + 34);

    // Power Switch (Clickable)
    const pX = unitX + 15;
    const pY = unitY + 65;
    clickRegions.powerSwitch = { x: pX, y: pY, w: 55, h: 42 };

    ctx.fillStyle = state.powerSupplyOn ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.12)";
    ctx.strokeStyle = state.powerSupplyOn ? "#10b981" : "#ef4444";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(pX, pY, 55, 42, 6);
    ctx.fill();
    ctx.stroke();

    // LED Indicator
    ctx.beginPath();
    ctx.arc(pX + 12, pY + 14, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = state.powerSupplyOn ? "#10b981" : "#475569";
    ctx.fill();
    if (state.powerSupplyOn) {
      ctx.shadowColor = "#10b981";
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = isLight ? "#0f172a" : "#f8fafc";
    ctx.font = "bold 9.5px 'Inter', sans-serif";
    ctx.fillText("POWER", pX + 22, pY + 17);
    ctx.font = "8px 'JetBrains Mono', monospace";
    ctx.fillStyle = state.powerSupplyOn ? "#10b981" : "#ef4444";
    ctx.fillText(state.powerSupplyOn ? "ON (5V)" : "OFF", pX + 12, pY + 34);

    // LED Spotlight Array Switch (Clickable)
    const ledX = unitX + 85;
    const ledY = unitY + 65;
    clickRegions.ledSwitch = { x: ledX, y: ledY, w: 60, h: 42 };

    ctx.fillStyle = state.ledArrayActive ? "rgba(56, 189, 248, 0.15)" : "rgba(100, 116, 139, 0.15)";
    ctx.strokeStyle = state.ledArrayActive ? "#38bdf8" : "#64748b";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(ledX, ledY, 60, 42, 6);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(ledX + 12, ledY + 14, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = state.ledArrayActive && state.powerSupplyOn ? "#38bdf8" : "#475569";
    ctx.fill();
    if (state.ledArrayActive && state.powerSupplyOn) {
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = isLight ? "#0f172a" : "#f8fafc";
    ctx.font = "bold 9.5px 'Inter', sans-serif";
    ctx.fillText("WHITE LED", ledX + 20, ledY + 17);
    ctx.font = "8px 'JetBrains Mono', monospace";
    ctx.fillStyle = state.ledArrayActive && state.powerSupplyOn ? "#38bdf8" : "#64748b";
    ctx.fillText(state.ledArrayActive ? "ACTIVE" : "DARK", ledX + 12, ledY + 34);

    // Digital Frequency Readout Display (LCD screen on unit)
    const lcdX = unitX + 12;
    const lcdY = unitY + 125;
    const lcdW = unitW - 24;
    const lcdH = 50;

    ctx.fillStyle = isLight ? "#0f172a" : "#050811";
    ctx.fillRect(lcdX, lcdY, lcdW, lcdH);
    ctx.strokeStyle = isLight ? "#38bdf8" : "#1e3a5f";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(lcdX, lcdY, lcdW, lcdH);

    ctx.fillStyle = isLight ? "#38bdf8" : "#38bdf8";
    ctx.font = "7.5px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText(`FILTER: S2,S3=[${getFilterPinText()}]`, lcdX + 8, lcdY + 14);

    ctx.font = "bold 15px 'JetBrains Mono', monospace";
    ctx.fillStyle = state.powerSupplyOn ? (isLight ? "#0284c7" : "#38bdf8") : "#475569";
    ctx.fillText(
      state.powerSupplyOn ? `${state.currentOutputFrequency.toFixed(1)} kHz` : "---.- kHz",
      lcdX + 8,
      lcdY + 35
    );

    ctx.font = "8px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.textAlign = "right";
    ctx.fillText(`Scale: ${state.scaling}`, lcdX + lcdW - 8, lcdY + 44);

    // Pin Connections Header
    ctx.fillStyle = isLight ? "#475569" : "#64748b";
    ctx.font = "8px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("I/O: VCC GND S0 S1 S2 S3 OUT", unitX + 12, unitY + 195);
    ctx.fillText("STATUS: CALIBRATED 20%", unitX + 12, unitY + 210);

    // ==========================================
    // 2. TCS3200 SENSOR MODULE BOARD (CENTER-LEFT)
    // ==========================================
    const sensX = 240;
    const sensY = 90;
    const sensW = 75;
    const sensH = 135;
    clickRegions.sensorArray = { x: sensX, y: sensY, w: sensW, h: sensH };

    // Sensor PCB Plate (Deep Blue / Black FR4)
    ctx.fillStyle = "#0c1b33";
    ctx.fillRect(sensX, sensY, sensW, sensH);
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 2;
    ctx.strokeRect(sensX, sensY, sensW, sensH);

    // Gold Corner Mounting Holes & Traces
    const goldPads = [
      [sensX + 8, sensY + 8],
      [sensX + sensW - 8, sensY + 8],
      [sensX + 8, sensY + sensH - 8],
      [sensX + sensW - 8, sensY + sensH - 8]
    ];
    goldPads.forEach(([gx, gy]) => {
      ctx.beginPath();
      ctx.arc(gx, gy, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#eab308";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(gx, gy, 2, 0, Math.PI * 2);
      ctx.fillStyle = "#0a0f1d";
      ctx.fill();
    });

    // 4 White Spotlight Illumination LEDs
    const ledPositions = [
      [sensX + 16, sensY + 25],
      [sensX + sensW - 16, sensY + 25],
      [sensX + 16, sensY + sensH - 25],
      [sensX + sensW - 16, sensY + sensH - 25]
    ];

    ledPositions.forEach(([lx, ly]) => {
      ctx.beginPath();
      ctx.arc(lx, ly, 6, 0, Math.PI * 2);
      ctx.fillStyle = state.ledArrayActive && state.powerSupplyOn ? "#ffffff" : "#64748b";
      ctx.fill();
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      ctx.stroke();

      if (state.ledArrayActive && state.powerSupplyOn) {
        ctx.beginPath();
        ctx.arc(lx, ly, 10, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.fill();
      }
    });

    // TCS3200 IC Package (Center Square)
    const icX = sensX + sensW / 2 - 18;
    const icY = sensY + sensH / 2 - 18;
    const icSize = 36;

    ctx.fillStyle = "#030712";
    ctx.fillRect(icX, icY, icSize, icSize);
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1;
    ctx.strokeRect(icX, icY, icSize, icSize);

    // 8x8 Photodiode Micro-Aperture Array Matrix inside IC
    const arrayPad = 3;
    const microSize = 3.2;
    const rows = 4;
    const cols = 4;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const mx = icX + 6 + c * (microSize + 3.5);
        const my = icY + 6 + r * (microSize + 3.5);

        // Pattern: Red (r0,c0), Blue (r0,c1), Clear (r1,c0), Green (r1,c1)...
        let filterType = "clear";
        if ((r + c) % 4 === 0) filterType = "red";
        else if ((r + c) % 4 === 1) filterType = "blue";
        else if ((r + c) % 4 === 2) filterType = "green";

        let fillColor = "#94a3b8";
        let glow = false;
        if (filterType === "red") {
          fillColor = state.filterChannel === "red" ? "#ef4444" : "#7f1d1d";
          glow = state.filterChannel === "red" && state.powerSupplyOn;
        } else if (filterType === "green") {
          fillColor = state.filterChannel === "green" ? "#10b981" : "#064e3b";
          glow = state.filterChannel === "green" && state.powerSupplyOn;
        } else if (filterType === "blue") {
          fillColor = state.filterChannel === "blue" ? "#3b82f6" : "#1e3a8a";
          glow = state.filterChannel === "blue" && state.powerSupplyOn;
        } else {
          fillColor = state.filterChannel === "clear" ? "#f8fafc" : "#475569";
          glow = state.filterChannel === "clear" && state.powerSupplyOn;
        }

        ctx.fillStyle = fillColor;
        ctx.fillRect(mx, my, microSize, microSize);

        if (glow) {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 0.5;
          ctx.strokeRect(mx, my, microSize, microSize);
        }
      }
    }

    // Sensor Label
    ctx.fillStyle = "#93c5fd";
    ctx.font = "bold 8px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("TCS3200", sensX + sensW / 2, sensY + sensH - 8);

    // ==========================================
    // 3. TARGET SPECIMEN STAGE ON VERNIER RAIL (CENTER-RIGHT)
    // ==========================================
    // Position stage along rail according to standoff distance (5mm to 30mm)
    const stageOffsetPx = (state.distanceMm - 5.0) * 11.0;
    const stageX = sensX + sensW + 30 + stageOffsetPx;
    const stageY = 75;
    const stageW = 38;
    const stageH = 160;

    clickRegions.specimenStage = { x: stageX - 10, y: stageY, w: stageW + 20, h: stageH };

    // Stage Carrier Base on Optical Rail
    const baseW = 56;
    const baseH = 26;
    const baseX = stageX + stageW / 2 - baseW / 2;
    const baseY = benchY + 6;

    ctx.fillStyle = isLight ? "#94a3b8" : "#334155";
    ctx.beginPath();
    ctx.roundRect(baseX, baseY, baseW, baseH, 4);
    ctx.fill();
    ctx.strokeStyle = isLight ? "#475569" : "#64748b";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Stage Vernier Index Hairline (aligns with millimeter rail)
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(stageX + stageW / 2, baseY);
    ctx.lineTo(stageX + stageW / 2, baseY + baseH);
    ctx.stroke();

    // Standoff Readout Tag above Stage
    ctx.fillStyle = isLight ? "#0f172a" : "#f8fafc";
    ctx.font = "bold 10px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`d = ${state.distanceMm.toFixed(1)} mm`, stageX + stageW / 2, stageY - 14);

    // Stage Vertical Upright Holder
    ctx.fillStyle = isLight ? "#cbd5e1" : "#1e293b";
    ctx.fillRect(stageX, stageY, stageW, stageH);
    ctx.strokeStyle = isLight ? "#64748b" : "#475569";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(stageX, stageY, stageW, stageH);

    // Color Swatch Target Face
    const swatchPad = 4;
    const swatchX = stageX + swatchPad;
    const swatchY = stageY + 25;
    const swatchW = stageW - swatchPad * 2;
    const swatchH = 105;

    ctx.fillStyle = sample.hex;
    ctx.beginPath();
    ctx.roundRect(swatchX, swatchY, swatchW, swatchH, 4);
    ctx.fill();
    ctx.strokeStyle = isLight ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Swatch Specular Sheen highlight
    const gradSheen = ctx.createLinearGradient(swatchX, swatchY, swatchX + swatchW, swatchY + swatchH);
    gradSheen.addColorStop(0, "rgba(255, 255, 255, 0.4)");
    gradSheen.addColorStop(0.3, "rgba(255, 255, 255, 0.05)");
    gradSheen.addColorStop(1, "rgba(0, 0, 0, 0.25)");
    ctx.fillStyle = gradSheen;
    ctx.beginPath();
    ctx.roundRect(swatchX, swatchY, swatchW, swatchH, 4);
    ctx.fill();

    // Swatch Name / Mystery label
    ctx.save();
    ctx.translate(swatchX + swatchW / 2, swatchY + swatchH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 4;
    ctx.font = "bold 9.5px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(sample.isMystery ? "MYSTERY SAMPLE" : sample.name.toUpperCase(), 0, 3);
    ctx.restore();

    // ==========================================
    // 4. RAY OPTICS & LIGHT CONES (ILLUMINATION & REFLECTION)
    // ==========================================
    if (state.ledArrayActive && state.powerSupplyOn) {
      // 4 Incident Light Cones from LEDs hitting Swatch
      ctx.save();
      ledPositions.forEach(([lx, ly]) => {
        const gradCone = ctx.createRadialGradient(lx, ly, 4, swatchX, ly, stageOffsetPx + 40);
        gradCone.addColorStop(0, "rgba(255, 255, 255, 0.7)");
        gradCone.addColorStop(0.5, "rgba(254, 240, 138, 0.25)");
        gradCone.addColorStop(1, "rgba(255, 255, 255, 0.0)");

        ctx.fillStyle = gradCone;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(swatchX, ly - 28);
        ctx.lineTo(swatchX, ly + 28);
        ctx.closePath();
        ctx.fill();
      });

      // Reflected Colored Light returning into Photodiode Array
      const refGrad = ctx.createRadialGradient(swatchX, sensY + sensH / 2, 5, sensX + sensW / 2, sensY + sensH / 2, stageOffsetPx + 50);
      const targetRgb = hexToRgb(sample.hex);
      const alphaVal = Math.min(0.65, Math.max(0.15, (25.0 / state.distanceMm) * 0.45));

      refGrad.addColorStop(0, `rgba(${targetRgb.r}, ${targetRgb.g}, ${targetRgb.b}, ${alphaVal})`);
      refGrad.addColorStop(0.6, `rgba(${targetRgb.r}, ${targetRgb.g}, ${targetRgb.b}, ${alphaVal * 0.5})`);
      refGrad.addColorStop(1, "rgba(0, 0, 0, 0.0)");

      ctx.fillStyle = refGrad;
      ctx.beginPath();
      ctx.moveTo(swatchX, swatchY + 15);
      ctx.lineTo(sensX + sensW / 2, sensY + sensH / 2 - 16);
      ctx.lineTo(sensX + sensW / 2, sensY + sensH / 2 + 16);
      ctx.lineTo(swatchX, swatchY + swatchH - 15);
      ctx.closePath();
      ctx.fill();

      // Photon flux particles moving along optical path
      photonTick = (photonTick + 0.08) % 1.0;
      for (let p = 0; p < 6; p++) {
        const pFrac = (photonTick + p / 6) % 1.0;
        const px = swatchX - pFrac * (swatchX - (sensX + sensW));
        const py = sensY + sensH / 2 + Math.sin(pFrac * Math.PI * 2 + p) * 12;

        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = sample.hex;
        ctx.shadowColor = sample.hex;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.restore();
    }

    // Distance Dimension Arrow Line
    const dimY = 50;
    ctx.strokeStyle = isLight ? "#0284c7" : "#38bdf8";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(sensX + sensW, dimY);
    ctx.lineTo(swatchX, dimY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Arrows
    drawArrowHead(ctx, sensX + sensW, dimY, "left", isLight ? "#0284c7" : "#38bdf8");
    drawArrowHead(ctx, swatchX, dimY, "right", isLight ? "#0284c7" : "#38bdf8");
  }

  function drawArrowHead(ctx, x, y, dir, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    if (dir === "left") {
      ctx.moveTo(x, y);
      ctx.lineTo(x + 6, y - 3.5);
      ctx.lineTo(x + 6, y + 3.5);
    } else {
      ctx.moveTo(x, y);
      ctx.lineTo(x - 6, y - 3.5);
      ctx.lineTo(x - 6, y + 3.5);
    }
    ctx.closePath();
    ctx.fill();
  }

  // 2. RENDER DIGITAL OSCILLOSCOPE & SPECTRAL DECOMPOSITION CANVAS
  function renderOscilloscopeCanvas() {
    if (!oscCtx || !oscCanvas) return;
    prepareCanvasDpi(oscCanvas, oscCtx, OSC_LOGICAL_W, OSC_LOGICAL_H);

    const ctx = oscCtx;
    const width = OSC_LOGICAL_W;
    const height = OSC_LOGICAL_H;
    const isLight = document.documentElement.getAttribute("data-theme") === "light";

    ctx.clearRect(0, 0, width, height);

    // CRT Oscilloscope Screen Bezel & Grid
    const scrX = 12;
    const scrY = 12;
    const scrW = width - 24;
    const scrH = 150;

    // Dark Phosphor Screen Background
    ctx.fillStyle = "#040d1a";
    ctx.fillRect(scrX, scrY, scrW, scrH);
    ctx.strokeStyle = isLight ? "#0284c7" : "#1e3a5f";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(scrX, scrY, scrW, scrH);

    // Oscilloscope Reticle Grid Lines (10x8 divisions)
    ctx.strokeStyle = "rgba(14, 116, 144, 0.35)";
    ctx.lineWidth = 0.8;
    const divX = scrW / 10;
    const divY = scrH / 6;

    for (let i = 1; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo(scrX + i * divX, scrY);
      ctx.lineTo(scrX + i * divX, scrY + scrH);
      ctx.stroke();
    }
    for (let j = 1; j < 6; j++) {
      ctx.beginPath();
      ctx.moveTo(scrX, scrY + j * divY);
      ctx.lineTo(scrX + scrW, scrY + j * divY);
      ctx.stroke();
    }

    // Center Crosshairs with fine tick subdivisions
    ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(scrX + scrW / 2, scrY);
    ctx.lineTo(scrX + scrW / 2, scrY + scrH);
    ctx.moveTo(scrX, scrY + scrH / 2);
    ctx.lineTo(scrX + scrW, scrY + scrH / 2);
    ctx.stroke();

    // Pulse Waveform Generation
    if (state.powerSupplyOn && state.scaling !== "0%") {
      const f = state.currentOutputFrequency; // in kHz
      // Normalize wave period visually: higher frequency = more cycles
      const cycles = Math.min(8, Math.max(1.5, f * 0.065));
      const periodPx = scrW / cycles;

      oscPhase = (oscPhase + (f * 0.008 + 0.05)) % (Math.PI * 2);
      const phasePx = (oscPhase / (Math.PI * 2)) * periodPx;

      const waveTop = scrY + 28;
      const waveBot = scrY + scrH - 28;

      ctx.save();
      ctx.beginPath();
      ctx.rect(scrX + 1, scrY + 1, scrW - 2, scrH - 2);
      ctx.clip();

      ctx.strokeStyle = "#38bdf8";
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 8;
      ctx.lineWidth = 2.2;
      ctx.beginPath();

      let isHigh = true;
      let curX = scrX;
      let startOffset = (phasePx % periodPx);
      curX -= startOffset;

      while (curX < scrX + scrW + periodPx) {
        const nextX = curX + periodPx / 2;
        const yVal = isHigh ? waveTop : waveBot;

        if (curX === scrX - startOffset) {
          ctx.moveTo(curX, yVal);
        } else {
          ctx.lineTo(curX, yVal);
        }
        ctx.lineTo(nextX, yVal);

        const nextY = isHigh ? waveBot : waveTop;
        ctx.lineTo(nextX, nextY);

        isHigh = !isHigh;
        curX = nextX;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
    } else {
      // Flat Zero-Volt Baseline
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(scrX, scrY + scrH - 28);
      ctx.lineTo(scrX + scrW, scrY + scrH - 28);
      ctx.stroke();
    }

    // Oscilloscope Channel Telemetry HUD Overlay
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("CH1: 5.0V/DIV", scrX + 8, scrY + 14);

    const tPeriod = state.currentOutputFrequency > 0 ? (1000.0 / state.currentOutputFrequency).toFixed(1) : "---";
    ctx.textAlign = "right";
    ctx.fillText(`T = ${tPeriod} μs | ${state.currentOutputFrequency.toFixed(1)} kHz`, scrX + scrW - 8, scrY + 14);

    // ==========================================
    // MULTI-CHANNEL SPECTRAL FREQUENCY BAR GAUGES
    // ==========================================
    const barY = scrY + scrH + 16;
    const maxFreqScale = 120.0; // kHz for 100% bar width

    const channels = [
      { label: "RED (S2=0, S3=0)", val: state.freqRed, color: "#ef4444", barY: barY },
      { label: "GREEN (S2=1, S3=1)", val: state.freqGreen, color: "#10b981", barY: barY + 28 },
      { label: "BLUE (S2=0, S3=1)", val: state.freqBlue, color: "#3b82f6", barY: barY + 56 },
      { label: "CLEAR (S2=1, S3=0)", val: state.freqClear, color: "#f8fafc", barY: barY + 84 }
    ];

    channels.forEach((ch) => {
      // Label
      ctx.fillStyle = isLight ? "#0f172a" : "#cbd5e1";
      ctx.font = "bold 8.5px 'JetBrains Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText(ch.label, scrX, ch.barY + 9);

      // Value
      ctx.textAlign = "right";
      ctx.fillStyle = ch.color;
      ctx.fillText(
        state.powerSupplyOn ? `${ch.val.toFixed(1)} kHz` : "--.- kHz",
        scrX + scrW,
        ch.barY + 9
      );

      // Bar Track
      const trackX = scrX;
      const trackY = ch.barY + 13;
      const trackW = scrW;
      const trackH = 8;

      ctx.fillStyle = isLight ? "#e2e8f0" : "#1e293b";
      ctx.beginPath();
      ctx.roundRect(trackX, trackY, trackW, trackH, 3);
      ctx.fill();

      // Filled Level
      if (state.powerSupplyOn && ch.val > 0) {
        const fillW = Math.min(trackW, Math.max(4, (ch.val / maxFreqScale) * trackW));
        ctx.fillStyle = ch.color;
        ctx.beginPath();
        ctx.roundRect(trackX, trackY, fillW, trackH, 3);
        ctx.fill();
      }
    });
  }

  function getFilterPinText() {
    switch (state.filterChannel) {
      case "red": return "0, 0 (Red)";
      case "blue": return "0, 1 (Blue)";
      case "clear": return "1, 0 (Clear)";
      case "green": return "1, 1 (Green)";
      default: return "1, 0";
    }
  }

  // ==========================================
  // DOM UPDATES & SYNCHRONIZATION
  // ==========================================
  function updateDomHud() {
    calculateSensorPhysics();

    // 1. Hardware State Text & LEDs
    const btnPower = document.getElementById("cs-btn-power-switch");
    const ledPower = document.getElementById("cs-led-power");
    const statePower = document.getElementById("cs-state-power");
    if (ledPower && statePower) {
      if (state.powerSupplyOn) {
        ledPower.className = "hw-switch-led led-green active";
        statePower.textContent = "ON";
        btnPower?.classList.add("active", "power-on");
      } else {
        ledPower.className = "hw-switch-led led-off";
        statePower.textContent = "OFF";
        btnPower?.classList.remove("active", "power-on");
      }
    }

    const btnIllum = document.getElementById("cs-btn-illum-switch");
    const ledIllum = document.getElementById("cs-led-illum");
    const stateIllum = document.getElementById("cs-state-illum");
    if (ledIllum && stateIllum) {
      if (state.ledArrayActive && state.powerSupplyOn) {
        ledIllum.className = "hw-switch-led led-white active";
        stateIllum.textContent = "ON";
        btnIllum?.classList.add("active", "illum-on");
      } else {
        ledIllum.className = "hw-switch-led led-off";
        stateIllum.textContent = "OFF";
        btnIllum?.classList.remove("active", "illum-on");
      }
    }

    // 2. Telemetry HUD Cards
    const hudDist = document.getElementById("cs-hud-dist");
    if (hudDist) hudDist.textContent = `${state.distanceMm.toFixed(1)} mm`;

    const hudFreq = document.getElementById("cs-hud-freq");
    if (hudFreq) hudFreq.textContent = state.powerSupplyOn ? `${state.currentOutputFrequency.toFixed(1)} kHz` : "0.0 kHz";

    const hudColor = document.getElementById("cs-hud-color");
    if (hudColor) {
      hudColor.textContent = state.powerSupplyOn ? state.reconHex.toUpperCase() : "#000000";
    }

    const hudFidelity = document.getElementById("cs-hud-fidelity");
    if (hudFidelity) {
      hudFidelity.textContent = state.powerSupplyOn ? `${state.matchFidelityPct}%` : "0%";
    }

    // 3. Match Status Pill
    const matchBadge = document.getElementById("cs-match-badge");
    if (matchBadge) {
      if (!state.powerSupplyOn) {
        matchBadge.className = "cs-status-pill pill-offline";
        matchBadge.textContent = "Power Supply OFF";
      } else if (!state.ledArrayActive) {
        matchBadge.className = "cs-status-pill pill-warning";
        matchBadge.textContent = "LED Illuminator Inactive";
      } else if (state.matchFidelityPct >= 90) {
        matchBadge.className = "cs-status-pill pill-success";
        matchBadge.textContent = `High Fidelity Match (${state.matchFidelityPct}%)`;
      } else {
        matchBadge.className = "cs-status-pill pill-info";
        matchBadge.textContent = `Decoding Spectrum (${state.matchFidelityPct}%)`;
      }
    }

    // 4. Standoff Slider & Step Displays
    const distVal = document.getElementById("cs-distance-val");
    if (distVal) distVal.textContent = `${state.distanceMm.toFixed(1)} mm`;
    const sliderDist = document.getElementById("cs-slider-distance");
    if (sliderDist && Number(sliderDist.value) !== state.distanceMm) {
      sliderDist.value = state.distanceMm;
    }

    // 5. Active Filter Buttons (S2, S3)
    document.querySelectorAll(".cs-filter-btn").forEach((btn) => {
      const f = btn.getAttribute("data-filter");
      btn.classList.toggle("active", f === state.filterChannel);
    });

    // 6. Active Scaling Buttons (S0, S1)
    document.querySelectorAll(".cs-scale-btn").forEach((btn) => {
      const s = btn.getAttribute("data-scale");
      btn.classList.toggle("active", s === state.scaling);
    });

    // 7. Active Swatch Chips
    document.querySelectorAll(".cs-swatch-chip").forEach((chip) => {
      const sw = chip.getAttribute("data-swatch");
      chip.classList.toggle("active", sw === state.currentSwatchId && !state.isCustomMode && !state.isMysteryMode);
    });

    // 8. Reconstructed Color Preview Swatch
    const swatchTargetPreview = document.getElementById("cs-preview-target");
    const swatchReconPreview = document.getElementById("cs-preview-recon");
    const sample = getActiveSampleReflectance();

    if (swatchTargetPreview) {
      swatchTargetPreview.style.backgroundColor = sample.hex;
    }
    if (swatchReconPreview) {
      swatchReconPreview.style.backgroundColor = state.powerSupplyOn ? state.reconHex : "#000000";
    }

    // 9. Mean Observation Statistics
    updateObservationStats();
  }

  // ==========================================
  // OBSERVATIONS LOGBOOK & DATA EXPORT
  // ==========================================
  function recordObservation() {
    if (!state.powerSupplyOn) {
      if (showToast) showToast("Switch ON main power supply before recording readings.");
      return;
    }

    const sample = getActiveSampleReflectance();
    const reading = {
      id: state.observations.length + 1,
      swatchName: sample.name,
      filterChannel: state.filterChannel.toUpperCase(),
      pinSetting: getFilterPinText(),
      freqKhz: Number(state.currentOutputFrequency.toFixed(2)),
      freqRed: Number(state.freqRed.toFixed(2)),
      freqGreen: Number(state.freqGreen.toFixed(2)),
      freqBlue: Number(state.freqBlue.toFixed(2)),
      freqClear: Number(state.freqClear.toFixed(2)),
      reconHex: state.reconHex,
      fidelityPct: state.matchFidelityPct,
      distanceMm: Number(state.distanceMm.toFixed(1)),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    };

    state.observations.push(reading);
    renderObservationsTable();

    // Check Distance Sweep Challenge
    if (state.distanceMm <= 8.0) state.challenges.distanceSweep.zones.near = true;
    else if (state.distanceMm >= 10.0 && state.distanceMm <= 15.0) state.challenges.distanceSweep.zones.optimal = true;
    else if (state.distanceMm >= 22.0) state.challenges.distanceSweep.zones.far = true;

    evaluateDistanceSweepChallenge();

    if (showToast) showToast(`Recorded Reading #${reading.id}: ${sample.name} (${state.filterChannel.toUpperCase()})`);
  }

  function renderObservationsTable() {
    const emptyState = document.getElementById("cs-obs-empty");
    const table = document.getElementById("cs-obs-table");
    const tbody = document.getElementById("cs-obs-tbody");
    const countBadge = document.getElementById("cs-obs-count-badge");

    if (countBadge) {
      countBadge.textContent = `${state.observations.length} Reading${state.observations.length === 1 ? "" : "s"}`;
    }

    if (!tbody) return;

    if (state.observations.length === 0) {
      emptyState?.classList.remove("hidden");
      table?.classList.add("hidden");
      tbody.innerHTML = "";
      return;
    }

    emptyState?.classList.add("hidden");
    table?.classList.remove("hidden");

    tbody.innerHTML = state.observations
      .map(
        (obs, idx) => `
        <tr>
          <td><strong>#${obs.id}</strong></td>
          <td>
            <div style="display:inline-flex; align-items:center; gap:6px;">
              <span style="display:inline-block; width:12px; height:12px; border-radius:3px; background:${obs.reconHex}; border:1px solid rgba(255,255,255,0.2);"></span>
              <span>${obs.swatchName}</span>
            </div>
          </td>
          <td><span class="cs-badge-filter">${obs.filterChannel}</span></td>
          <td><strong>${obs.freqKhz.toFixed(1)} kHz</strong></td>
          <td>${obs.distanceMm.toFixed(1)} mm</td>
          <td><strong style="color:#10b981;">${obs.fidelityPct}%</strong></td>
          <td><code class="cs-hex-code">${obs.reconHex}</code></td>
          <td style="color:#94a3b8; font-size:11px;">${obs.timestamp}</td>
          <td style="text-align:center;">
            <button type="button" class="btn-delete-obs cs-btn-delete-obs" data-del-cs-obs="${idx}" title="Delete Reading #${obs.id}">
              <svg class="svg-icon svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </td>
        </tr>
      `
      )
      .join("");

    if (!tbody._deleteListenerAttached) {
      tbody._deleteListenerAttached = true;
      tbody.addEventListener("click", (e) => {
        const delBtn = e.target.closest("[data-del-cs-obs]");
        if (delBtn) {
          const idx = parseInt(delBtn.getAttribute("data-del-cs-obs"), 10);
          if (!isNaN(idx) && idx >= 0 && idx < state.observations.length) {
            const deleted = state.observations.splice(idx, 1)[0];
            saveState();
            renderObservationsTable();
            if (showToast) showToast(`Colour Sensor Reading #${deleted.id} deleted.`);
          }
        }
      });
    }

    updateObservationStats();
  }

  function updateObservationStats() {
    const meanFidEl = document.getElementById("cs-mean-fidelity");
    const meanFreqEl = document.getElementById("cs-mean-freq");
    const totalSwatchesEl = document.getElementById("cs-total-swatches");

    if (state.observations.length === 0) {
      if (meanFidEl) meanFidEl.textContent = "--";
      if (meanFreqEl) meanFreqEl.textContent = "--";
      if (totalSwatchesEl) totalSwatchesEl.textContent = "0";
      return;
    }

    const totalFid = state.observations.reduce((acc, o) => acc + o.fidelityPct, 0);
    const meanFid = Math.round(totalFid / state.observations.length);

    const totalFreq = state.observations.reduce((acc, o) => acc + o.freqKhz, 0);
    const meanFreq = (totalFreq / state.observations.length).toFixed(1);

    const uniqueSwatches = new Set(state.observations.map((o) => o.swatchName)).size;

    if (meanFidEl) meanFidEl.textContent = `${meanFid}%`;
    if (meanFreqEl) meanFreqEl.textContent = `${meanFreq} kHz`;
    if (totalSwatchesEl) totalSwatchesEl.textContent = `${uniqueSwatches}`;
  }

  function clearObservations() {
    state.observations = [];
    renderObservationsTable();
    if (showToast) showToast("All Colour Sensor observations cleared.");
  }

  function exportObservationsCsv() {
    if (isUserAuthenticated && !isUserAuthenticated()) {
      if (openLoginModal) {
        openLoginModal("Exporting Colour Sensor observations to CSV requires account sign-in. Sign in to download your dataset!");
      } else if (showToast) {
        showToast("Please sign in to export observations to CSV.");
      }
      return;
    }

    if (state.observations.length === 0) {
      if (showToast) showToast("No observations to export.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Reading_ID,Sample_Name,Filter_Channel,Pin_Selection,Frequency_kHz,Red_Freq_kHz,Green_Freq_kHz,Blue_Freq_kHz,Clear_Freq_kHz,Reconstructed_Hex,Fidelity_Pct,Distance_mm,Timestamp\n";

    state.observations.forEach((o) => {
      csvContent += `${o.id},"${o.swatchName}",${o.filterChannel},"${o.pinSetting}",${o.freqKhz},${o.freqRed},${o.freqGreen},${o.freqBlue},${o.freqClear},"${o.reconHex}",${o.fidelityPct},${o.distanceMm},"${o.timestamp}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PhysiX_Colour_Sensor_Lab_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (showToast) showToast("Exported observation data to CSV.");
  }

  function exportObservationsPdf() {
    if (isUserAuthenticated && !isUserAuthenticated()) {
      if (openLoginModal) {
        openLoginModal("Generating official Colour Sensor PDF lab reports requires account sign-in. Sign in to download your certified report!");
      } else if (showToast) {
        showToast("Please sign in to download PDF reports.");
      }
      return;
    }

    if (state.observations.length === 0) {
      if (showToast) showToast("No colour sensor readings recorded yet. Record observations first!");
      return;
    }

    const profile = getStoredUserProfile ? getStoredUserProfile() : {};
    const studentName = profile.name || "Student Colorimetrist";
    const studentEmail = getActiveUserId && getActiveUserId() !== "guest" ? `${getActiveUserId()}` : "Guest Mode";

    const totalFid = state.observations.reduce((acc, o) => acc + o.fidelityPct, 0);
    const meanFid = Math.round(totalFid / state.observations.length);
    const totalFreq = state.observations.reduce((acc, o) => acc + o.freqKhz, 0);
    const meanFreq = (totalFreq / state.observations.length).toFixed(1);
    const uniqueSwatches = new Set(state.observations.map((o) => o.swatchName)).size;

    const columns = ["ID", "Sample Swatch", "Filter", "Pin Select", "Out Frequency", "R / G / B / Clear", "Detected Hex", "Fidelity", "Distance", "Time"];

    const rows = state.observations.map((obs) => [
      `#${obs.id}`,
      obs.swatchName,
      obs.filterChannel,
      obs.pinSetting,
      `${obs.freqKhz.toFixed(1)} kHz`,
      `${obs.freqRed.toFixed(1)} / ${obs.freqGreen.toFixed(1)} / ${obs.freqBlue.toFixed(1)} / ${obs.freqClear.toFixed(1)}`,
      obs.reconHex,
      `${obs.fidelityPct}%`,
      `${obs.distanceMm.toFixed(1)} mm`,
      obs.timestamp
    ]);

    try {
      generateLabReportPdf({
        labTitle: "Study of Colour Sensor (TCS3200) Logbook",
        labSubtitle: "Optoelectronic Photodiode Responsivity, Tristimulus Colorimetry & Inverse-Square Irradiance Dynamics",
        experimentCode: "EXP-03",
        studentName,
        studentEmail,
        studentRole: profile.occ || "Student Colorimetrist",
        summaryMetrics: [
          { label: "Total Observations", value: `${state.observations.length} Readings`, color: [14, 165, 233] },
          { label: "Mean Spectral Fidelity", value: `${meanFid}%`, color: [16, 185, 129] },
          { label: "Mean Output Frequency", value: `${meanFreq} kHz`, color: [6, 182, 212] },
          { label: "Unique Swatches Tested", value: `${uniqueSwatches}`, color: [139, 92, 246] }
        ],
        columns,
        rows,
        filename: `PhysiX_Colour_Sensor_Report_${Date.now()}.pdf`,
        orientation: "landscape"
      });

      if (showToast) showToast("Generated and downloaded official PhysiX PDF report.");
    } catch (err) {
      console.error("Colour Sensor PDF export failed:", err);
      if (showToast) showToast("Failed to generate PDF report. Please try again.");
    }
  }

  // ==========================================
  // GAMIFIED MASTERY CHALLENGES (NO QUIZ)
  // ==========================================
  function evaluateLiveChallenges() {
    if (isUserAuthenticated && !isUserAuthenticated()) return;
    if (!state.powerSupplyOn || !state.ledArrayActive) return;

    // Challenge 1: Primary Triplet & White Balance Calibration
    if (!state.challenges.primaryCalib.completed) {
      const sample = getActiveSampleReflectance();
      if (state.currentSwatchId === "white" && state.matchFidelityPct >= 92) {
        state.challenges.primaryCalib.calibratedSteps.white = true;
      }
      if (state.currentSwatchId === "red" && state.matchFidelityPct >= 92) {
        state.challenges.primaryCalib.calibratedSteps.red = true;
      }
      if (state.currentSwatchId === "green" && state.matchFidelityPct >= 92) {
        state.challenges.primaryCalib.calibratedSteps.green = true;
      }
      if (state.currentSwatchId === "blue" && state.matchFidelityPct >= 92) {
        state.challenges.primaryCalib.calibratedSteps.blue = true;
      }

      const st = state.challenges.primaryCalib.calibratedSteps;
      const count = (st.white ? 1 : 0) + (st.red ? 1 : 0) + (st.green ? 1 : 0) + (st.blue ? 1 : 0);

      const tag1 = document.getElementById("cs-ch-tag-1");
      if (tag1) tag1.textContent = `${count} / 4 Calibrated`;

      if (count === 4) {
        state.challenges.primaryCalib.completed = true;
        if (tag1) {
          tag1.className = "challenge-status-tag completed";
          tag1.textContent = "COMPLETED (+100 XP)";
        }
        if (onXpAwarded) onXpAwarded(100, "Colour Sensor: Primary Triplet Calibration Complete");
        if (unlockBadge) unlockBadge("badge-cs-tristimulus", "Tristimulus Virtuoso (Primary RGB Calibration)");
        if (showToast) showToast("Challenge 1 Completed! +100 XP awarded");
        updateChallengeCounters();
      }
    }
  }

  function submitMysteryGuess(selectedGuessId) {
    if (isUserAuthenticated && !isUserAuthenticated()) {
      if (openLoginModal) openLoginModal("Please sign in to solve the Spectroscopic Detective challenge and earn XP!");
      return;
    }
    if (state.challenges.mysteryDetective.completed) {
      if (showToast) showToast("Mystery Detective mission already solved!");
      return;
    }

    if (selectedGuessId === state.mysteryId) {
      state.challenges.mysteryDetective.completed = true;
      state.challenges.mysteryDetective.solved = true;

      const tag2 = document.getElementById("cs-ch-tag-2");
      if (tag2) {
        tag2.className = "challenge-status-tag completed";
        tag2.textContent = "SOLVED (+125 XP)";
      }

      if (onXpAwarded) onXpAwarded(125, "Colour Sensor: Mystery Pigment Identified");
      if (unlockBadge) unlockBadge("badge-cs-mystery-detective", "Spectroscopic Detective (Mystery Compound Unmasked)");
      if (showToast) showToast(`Correct! Solved ${MYSTERY_SPECIMENS[state.mysteryId].chemicalName} (+125 XP)`);
      updateChallengeCounters();
    } else {
      if (showToast) showToast("Incorrect spectral match! Compare R, G, B peak frequencies.");
    }
  }

  function evaluateDistanceSweepChallenge() {
    if (isUserAuthenticated && !isUserAuthenticated()) return;
    if (state.challenges.distanceSweep.completed) return;

    const z = state.challenges.distanceSweep.zones;
    const z1 = document.getElementById("cs-zone-1");
    const z2 = document.getElementById("cs-zone-2");
    const z3 = document.getElementById("cs-zone-3");

    if (z.near && z1) z1.classList.add("completed");
    if (z.optimal && z2) z2.classList.add("completed");
    if (z.far && z3) z3.classList.add("completed");

    const completedZones = (z.near ? 1 : 0) + (z.optimal ? 1 : 0) + (z.far ? 1 : 0);
    const tag3 = document.getElementById("cs-ch-tag-3");
    if (tag3) tag3.textContent = `${completedZones} / 3 Zones Logged`;

    if (completedZones === 3) {
      state.challenges.distanceSweep.completed = true;
      if (tag3) {
        tag3.className = "challenge-status-tag completed";
        tag3.textContent = "COMPLETED (+150 XP)";
      }
      if (onXpAwarded) onXpAwarded(150, "Colour Sensor: Inverse-Square Distance Sweep Verified");
      if (unlockBadge) unlockBadge("badge-cs-inverse-sweep", "Optoelectronic Photometrist (Distance Attenuation Sweep)");
      if (showToast) showToast("Challenge 3 Completed! +150 XP awarded");
      updateChallengeCounters();
    }
  }

  function updateChallengeCounters() {
    const isAuth = typeof isUserAuthenticated === "function" ? isUserAuthenticated() : true;
    const challengesCard = document.querySelector("#exp-colour-sensor-section .challenges-card");

    if (!isAuth) {
      challengesCard?.classList.add("challenges-locked");
      const countEl = document.getElementById("cs-challenges-completed-count");
      const xpEl = document.getElementById("cs-user-total-challenge-xp");
      if (countEl) countEl.innerHTML = `<span class="lock-indicator-badge"><svg class="svg-icon svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> Sign In Required</span>`;
      if (xpEl) xpEl.textContent = "+375 XP Available";

      const tag1 = document.getElementById("cs-ch-tag-1");
      const tag2 = document.getElementById("cs-ch-tag-2");
      const tag3 = document.getElementById("cs-ch-tag-3");
      [tag1, tag2, tag3].forEach(tag => {
        if (tag) {
          tag.className = "challenge-status-tag locked";
          tag.innerHTML = `<svg class="svg-icon svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> Locked`;
        }
      });
      return;
    }

    challengesCard?.classList.remove("challenges-locked");
    const ch = state.challenges;
    const count = (ch.primaryCalib.completed ? 1 : 0) + (ch.mysteryDetective.completed ? 1 : 0) + (ch.distanceSweep.completed ? 1 : 0);
    let totalXp = 0;
    if (ch.primaryCalib.completed) totalXp += 100;
    if (ch.mysteryDetective.completed) totalXp += 125;
    if (ch.distanceSweep.completed) totalXp += 150;

    const countEl = document.getElementById("cs-challenges-completed-count");
    const xpEl = document.getElementById("cs-user-total-challenge-xp");

    if (countEl) countEl.textContent = `${count} / 3 Complete`;
    if (xpEl) xpEl.textContent = `+${totalXp} XP`;

    // Restore challenge status tags for authenticated user
    const tag1 = document.getElementById("cs-ch-tag-1");
    if (tag1) {
      if (ch.primaryCalib.completed) {
        tag1.className = "challenge-status-tag completed";
        tag1.innerHTML = `<svg class="svg-icon svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Complete (+100 XP)`;
      } else {
        tag1.className = "challenge-status-tag pending";
        const calCount = (ch.primaryCalib.calibratedSwatches.white ? 1 : 0) + (ch.primaryCalib.calibratedSwatches.red ? 1 : 0) + (ch.primaryCalib.calibratedSwatches.green ? 1 : 0) + (ch.primaryCalib.calibratedSwatches.blue ? 1 : 0);
        tag1.textContent = `${calCount} / 4 Calibrated`;
      }
    }

    const tag2 = document.getElementById("cs-ch-tag-2");
    if (tag2) {
      if (ch.mysteryDetective.completed) {
        tag2.className = "challenge-status-tag completed";
        tag2.innerHTML = `<svg class="svg-icon svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Solved (+125 XP)`;
      } else {
        tag2.className = "challenge-status-tag pending";
        tag2.textContent = "Pending Analysis";
      }
    }

    const tag3 = document.getElementById("cs-ch-tag-3");
    if (tag3) {
      if (ch.distanceSweep.completed) {
        tag3.className = "challenge-status-tag completed";
        tag3.innerHTML = `<svg class="svg-icon svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Complete (+150 XP)`;
      } else {
        const zones = ch.distanceSweep.zones;
        const zCount = (zones.near ? 1 : 0) + (zones.optimal ? 1 : 0) + (zones.far ? 1 : 0);
        tag3.className = "challenge-status-tag pending";
        tag3.textContent = `${zCount} / 3 Zones Logged`;
      }
    }
  }

  // ==========================================
  // LABORATORY PERFORMANCE REPORT MODAL
  // ==========================================
  function openReportModal() {
    const modal = document.getElementById("cs-results-modal");
    if (!modal) return;

    // Calculate Summary Stats
    const totalReadings = state.observations.length;
    let meanFidelity = 95;
    if (totalReadings > 0) {
      const sum = state.observations.reduce((acc, o) => acc + o.fidelityPct, 0);
      meanFidelity = Math.round(sum / totalReadings);
    }

    let grade = "Novice Optician (Grade B)";
    if (meanFidelity >= 92 && totalReadings >= 3) {
      grade = "Virtuoso Optician (Grade A+)";
    } else if (meanFidelity >= 85) {
      grade = "Proficient Colorimetrist (Grade A)";
    }

    const gradeEl = document.getElementById("cs-res-grade");
    const fidEl = document.getElementById("cs-res-fidelity");
    const countEl = document.getElementById("cs-res-count");
    const xpEl = document.getElementById("cs-res-xp");
    const tbody = document.getElementById("cs-res-tbody");

    let totalXp = 0;
    if (state.challenges.primaryCalib.completed) totalXp += 100;
    if (state.challenges.mysteryDetective.completed) totalXp += 125;
    if (state.challenges.distanceSweep.completed) totalXp += 150;

    if (gradeEl) gradeEl.textContent = grade;
    if (fidEl) fidEl.textContent = `${meanFidelity}%`;
    if (countEl) countEl.textContent = `${totalReadings}`;
    if (xpEl) xpEl.textContent = `+${totalXp} XP`;

    if (tbody) {
      if (state.observations.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#94a3b8; padding:16px;">No observation data logged yet. Record readings to generate table.</td></tr>`;
      } else {
        tbody.innerHTML = state.observations
          .map(
            (o) => `
            <tr>
              <td>#${o.id}</td>
              <td>${o.swatchName}</td>
              <td>${o.filterChannel}</td>
              <td>${o.freqKhz.toFixed(1)} kHz</td>
              <td><strong style="color:#10b981;">${o.fidelityPct}%</strong></td>
            </tr>
          `
          )
          .join("");
      }
    }

    modal.classList.remove("hidden");
  }

  function autoSetupApparatus() {
    state.powerSupplyOn = true;
    state.ledArrayActive = true;
    state.scaling = "20%";
    state.filterChannel = "clear";
    state.distanceMm = 12.0;
    state.currentSwatchId = "red";
    state.isCustomMode = false;
    state.isMysteryMode = false;

    updateDomHud();
    if (showToast) showToast("Apparatus calibrated to optimal laboratory defaults.");
  }

  // ==========================================
  // EVENT LISTENERS & LIFECYCLE
  // ==========================================
  function bindEvents() {
    // 1. Hardware Deck Switches
    const btnPower = document.getElementById("cs-btn-power-switch");
    btnPower?.addEventListener("click", () => {
      state.powerSupplyOn = !state.powerSupplyOn;
      updateDomHud();
      if (showToast) showToast(`Main Power Supply: ${state.powerSupplyOn ? "ON" : "OFF"}`);
    });

    const btnIllum = document.getElementById("cs-btn-illum-switch");
    btnIllum?.addEventListener("click", () => {
      state.ledArrayActive = !state.ledArrayActive;
      updateDomHud();
      if (showToast) showToast(`White Illumination LEDs: ${state.ledArrayActive ? "ON" : "OFF"}`);
    });

    // 2. Filter Channel S2/S3 Buttons
    document.querySelectorAll(".cs-filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const filter = btn.getAttribute("data-filter");
        if (filter) {
          state.filterChannel = filter;
          updateDomHud();
          if (showToast) showToast(`Filter Selected: ${filter.toUpperCase()} (${getFilterPinText()})`);
        }
      });
    });

    // 3. Scaling S0/S1 Buttons
    document.querySelectorAll(".cs-scale-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const scale = btn.getAttribute("data-scale");
        if (scale) {
          state.scaling = scale;
          updateDomHud();
          if (showToast) showToast(`Frequency Scaling: ${scale}`);
        }
      });
    });

    // 4. Standoff Distance Slider & Step Buttons
    const sliderDist = document.getElementById("cs-slider-distance");
    sliderDist?.addEventListener("input", (e) => {
      state.distanceMm = parseFloat(e.target.value);
      updateDomHud();
    });

    const btnDecDist = document.getElementById("cs-btn-dec-dist");
    btnDecDist?.addEventListener("click", () => {
      state.distanceMm = Math.max(5.0, Number((state.distanceMm - 1.0).toFixed(1)));
      updateDomHud();
    });

    const btnIncDist = document.getElementById("cs-btn-inc-dist");
    btnIncDist?.addEventListener("click", () => {
      state.distanceMm = Math.min(30.0, Number((state.distanceMm + 1.0).toFixed(1)));
      updateDomHud();
    });

    // Distance Preset Buttons
    document.querySelectorAll(".cs-preset-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const dist = parseFloat(btn.getAttribute("data-dist"));
        if (!isNaN(dist)) {
          state.distanceMm = dist;
          updateDomHud();
        }
      });
    });

    // 5. Preset Color Swatches
    document.querySelectorAll(".cs-swatch-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const sw = chip.getAttribute("data-swatch");
        if (sw && PRESET_SWATCHES[sw]) {
          state.currentSwatchId = sw;
          state.isCustomMode = false;
          state.isMysteryMode = false;
          updateDomHud();
          if (showToast) showToast(`Selected Swatch: ${PRESET_SWATCHES[sw].name}`);
        }
      });
    });

    // 6. Custom Color Input Picker
    const customColorInput = document.getElementById("cs-custom-color-input");
    customColorInput?.addEventListener("input", (e) => {
      state.customColorHex = e.target.value;
      state.isCustomMode = true;
      state.isMysteryMode = false;
      updateDomHud();
    });

    // 7. Mystery Pigment Toggle & Detective Guess Buttons
    const btnToggleMystery = document.getElementById("cs-btn-toggle-mystery");
    btnToggleMystery?.addEventListener("click", () => {
      state.isMysteryMode = !state.isMysteryMode;
      state.isCustomMode = false;
      if (state.isMysteryMode) {
        // Random mystery selection
        const keys = Object.keys(MYSTERY_SPECIMENS);
        state.mysteryId = keys[Math.floor(Math.random() * keys.length)];
      }
      updateDomHud();
      if (showToast) showToast(state.isMysteryMode ? "Mystery Pigment Specimen Mounted!" : "Returned to Calibrated Swatches.");
    });

    document.querySelectorAll(".cs-mystery-guess-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const guessId = btn.getAttribute("data-guess");
        submitMysteryGuess(guessId);
      });
    });

    // 8. Action Buttons
    const btnRecord = document.getElementById("cs-btn-record");
    btnRecord?.addEventListener("click", recordObservation);

    const btnAutoSetup = document.getElementById("cs-btn-auto-setup");
    btnAutoSetup?.addEventListener("click", autoSetupApparatus);

    const btnViewResults = document.getElementById("cs-btn-view-results");
    btnViewResults?.addEventListener("click", openReportModal);

    const btnCloseResults = document.getElementById("cs-btn-close-results");
    btnCloseResults?.addEventListener("click", () => {
      document.getElementById("cs-results-modal")?.classList.add("hidden");
    });

    const btnExportCsv = document.getElementById("cs-btn-export-csv");
    btnExportCsv?.addEventListener("click", exportObservationsCsv);

    const btnExportPdf = document.getElementById("cs-btn-export-pdf");
    btnExportPdf?.addEventListener("click", exportObservationsPdf);

    // 9. Interactive Clicking directly on Canvas
    benchCanvas?.addEventListener("click", (e) => {
      const rect = benchCanvas.getBoundingClientRect();
      const scaleX = BENCH_LOGICAL_W / rect.width;
      const scaleY = BENCH_LOGICAL_H / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      // Click on Power Switch
      const p = clickRegions.powerSwitch;
      if (clickX >= p.x && clickX <= p.x + p.w && clickY >= p.y && clickY <= p.y + p.h) {
        state.powerSupplyOn = !state.powerSupplyOn;
        updateDomHud();
        return;
      }

      // Click on LED Switch
      const l = clickRegions.ledSwitch;
      if (clickX >= l.x && clickX <= l.x + l.w && clickY >= l.y && clickY <= l.y + l.h) {
        state.ledArrayActive = !state.ledArrayActive;
        updateDomHud();
        return;
      }
    });

    // Dragging Specimen Stage along Graduated Optical Rail
    let isDraggingStage = false;
    benchCanvas?.addEventListener("mousedown", (e) => {
      const rect = benchCanvas.getBoundingClientRect();
      const scaleX = BENCH_LOGICAL_W / rect.width;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * (BENCH_LOGICAL_H / rect.height);
      const s = clickRegions.specimenStage;

      if (clickX >= s.x && clickX <= s.x + s.w && clickY >= s.y && clickY <= s.y + s.h) {
        isDraggingStage = true;
      }
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDraggingStage || !benchCanvas) return;
      const rect = benchCanvas.getBoundingClientRect();
      const scaleX = BENCH_LOGICAL_W / rect.width;
      const curX = (e.clientX - rect.left) * scaleX;

      // Map canvas X to standoff distance (5mm to 30mm)
      const minX = 240 + 75 + 30; // 5mm
      const maxX = minX + 25 * 11; // 30mm
      const clampedX = Math.max(minX, Math.min(maxX, curX));
      const dist = 5.0 + (clampedX - minX) / 11.0;

      state.distanceMm = Math.round(dist * 10) / 10;
      updateDomHud();
    });

    window.addEventListener("mouseup", () => {
      isDraggingStage = false;
    });
  }

  // Animation render loop
  function animationLoop() {
    renderBenchCanvas();
    renderOscilloscopeCanvas();
    animationFrameId = requestAnimationFrame(animationLoop);
  }

  return {
    init() {
      benchCanvas = document.getElementById("cs-bench-canvas");
      if (benchCanvas) benchCtx = benchCanvas.getContext("2d");

      oscCanvas = document.getElementById("cs-osc-canvas");
      if (oscCanvas) oscCtx = oscCanvas.getContext("2d");

      bindEvents();
      updateDomHud();
      renderObservationsTable();
      updateChallengeCounters();

      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(animationLoop);
    },

    renderAll() {
      updateDomHud();
      renderBenchCanvas();
      renderOscilloscopeCanvas();
      updateChallengeCounters();
    },

    updateChallengeCounters,

    getState() {
      return {
        powerSupplyOn: state.powerSupplyOn,
        ledArrayActive: state.ledArrayActive,
        scaling: state.scaling,
        filterChannel: state.filterChannel,
        distanceMm: state.distanceMm,
        currentOutputFrequency: state.currentOutputFrequency,
        freqRed: state.freqRed,
        freqGreen: state.freqGreen,
        freqBlue: state.freqBlue,
        freqClear: state.freqClear,
        reconHex: state.reconHex,
        matchFidelityPct: state.matchFidelityPct,
        activeSwatch: getActiveSampleReflectance().name,
        observationsCount: state.observations.length
      };
    },

    destroy() {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    }
  };
}
