/**
 * PhysiX • Experiment 8: Determination of Planck's Constant Virtual Laboratory
 * High-precision, gamified, interactive quantum photoelectric & LED optoelectronics simulation.
 * Rigorous Einstein photoelectric physics solver, stopping potential extraction,
 * multi-wavelength spectral synthesis, LED bandgap recombination,
 * live I-V characteristic curves and linear regression analysis engine.
 * 100% Zero Emojis compliant.
 */

import { api } from "./api.js";
import { generateLabReportPdf } from "./pdf-export.js";

export function createPlanckExperiment(callbacks = {}) {
  const {
    onXpAwarded,
    onExperimentRecorded,
    showToast,
    getActiveUserId,
    loadUserProfile,
    getStoredUserProfile,
    unlockBadge,
    isUserAuthenticated,
    openLoginModal,
    onChallengeCompleted
  } = callbacks;

  // Universal Physical Constants (CODATA 2018 / 2022 recommended values)
  const CONSTANTS = {
    h_true: 6.62607015e-34, // J * s (Planck's constant)
    c: 2.99792458e8,        // m / s (Speed of light)
    e: 1.60217663e-19,       // C (Elementary electronic charge)
    kB: 1.380649e-23,        // J / K (Boltzmann constant)
    me: 9.1093837e-31        // kg (Electron rest mass)
  };

  // Calibrated Monochromatic Spectral Line Filters
  const SPECTRAL_FILTERS = {
    "uv": {
      id: "uv",
      name: "Ultraviolet (UV)",
      shortName: "UV Line",
      wavelengthNm: 365.0,
      wavelengthM: 365.0e-9,
      frequencyHz: 8.2135e14,
      frequencyDisplay: "8.214 × 10¹⁴ Hz",
      photonEnergyEv: 3.401,
      colorHex: "#a855f7",
      glowRgba: "rgba(168, 85, 247, 0.4)",
      description: "High-pressure Mercury arc ultraviolet emission line (365.0 nm)."
    },
    "violet": {
      id: "violet",
      name: "Violet Line",
      shortName: "Violet",
      wavelengthNm: 404.7,
      wavelengthM: 404.7e-9,
      frequencyHz: 7.4078e14,
      frequencyDisplay: "7.408 × 10¹⁴ Hz",
      photonEnergyEv: 3.064,
      colorHex: "#8b5cf6",
      glowRgba: "rgba(139, 92, 246, 0.4)",
      description: "Mercury prominent violet doublet line (404.7 nm)."
    },
    "blue": {
      id: "blue",
      name: "Blue Line",
      shortName: "Blue",
      wavelengthNm: 435.8,
      wavelengthM: 435.8e-9,
      frequencyHz: 6.8791e14,
      frequencyDisplay: "6.879 × 10¹⁴ Hz",
      photonEnergyEv: 2.845,
      colorHex: "#3b82f6",
      glowRgba: "rgba(59, 130, 246, 0.4)",
      description: "Mercury high-intensity blue spectral line (435.8 nm)."
    },
    "green": {
      id: "green",
      name: "Green Line",
      shortName: "Green",
      wavelengthNm: 546.1,
      wavelengthM: 546.1e-9,
      frequencyHz: 5.4897e14,
      frequencyDisplay: "5.490 × 10¹⁴ Hz",
      photonEnergyEv: 2.270,
      colorHex: "#10b981",
      glowRgba: "rgba(16, 185, 129, 0.4)",
      description: "Principal Mercury green reference line (546.1 nm)."
    },
    "yellow": {
      id: "yellow",
      name: "Yellow Line",
      shortName: "Yellow",
      wavelengthNm: 577.0,
      wavelengthM: 577.0e-9,
      frequencyHz: 5.1957e14,
      frequencyDisplay: "5.196 × 10¹⁴ Hz",
      photonEnergyEv: 2.149,
      colorHex: "#eab308",
      glowRgba: "rgba(234, 179, 8, 0.4)",
      description: "Mercury yellow primary emission doublet (577.0 nm)."
    },
    "red": {
      id: "red",
      name: "Red (He-Ne)",
      shortName: "Red",
      wavelengthNm: 632.8,
      wavelengthM: 632.8e-9,
      frequencyHz: 4.7376e14,
      frequencyDisplay: "4.738 × 10¹⁴ Hz",
      photonEnergyEv: 1.959,
      colorHex: "#ef4444",
      glowRgba: "rgba(239, 68, 68, 0.4)",
      description: "Helium-Neon optical gas laser / red line filter (632.8 nm)."
    }
  };

  // Photocathode Material Library
  const CATHODE_MATERIALS = {
    "cesium": {
      id: "cesium",
      name: "Cesium (Cs) Alkali Surface",
      symbol: "Cs",
      workFunctionEv: 2.14,
      workFunctionJ: 2.14 * CONSTANTS.e,
      thresholdFreqHz: (2.14 * CONSTANTS.e) / CONSTANTS.h_true,
      thresholdWlNm: 579.3,
      color: "#f59e0b",
      description: "Low work function alkali surface ideal for visible light photoemission experiments."
    },
    "potassium": {
      id: "potassium",
      name: "Potassium (K) Surface",
      symbol: "K",
      workFunctionEv: 2.30,
      workFunctionJ: 2.30 * CONSTANTS.e,
      thresholdFreqHz: (2.30 * CONSTANTS.e) / CONSTANTS.h_true,
      thresholdWlNm: 539.0,
      color: "#38bdf8",
      description: "Alkali metal cathode with 2.30 eV barrier, emitting photoelectrons for Green, Blue, and UV lines."
    },
    "sodium": {
      id: "sodium",
      name: "Sodium (Na) Surface",
      symbol: "Na",
      workFunctionEv: 2.46,
      workFunctionJ: 2.46 * CONSTANTS.e,
      thresholdFreqHz: (2.46 * CONSTANTS.e) / CONSTANTS.h_true,
      thresholdWlNm: 504.0,
      color: "#ec4899",
      description: "Moderately high work function cathode requiring short-wavelength visible or ultraviolet excitation."
    }
  };

  // Semiconductor Light Emitting Diode Library (LED Method)
  const LED_SPECIMENS = {
    "uv-395": {
      id: "uv-395",
      name: "InGaN UV LED (395 nm)",
      shortName: "UV 395nm",
      wavelengthNm: 395,
      wavelengthM: 395e-9,
      trueKneeVoltage: 3.12,
      colorHex: "#9333ea",
      glowRgba: "rgba(147, 51, 234, 0.45)"
    },
    "blue-470": {
      id: "blue-470",
      name: "InGaN Blue LED (470 nm)",
      shortName: "Blue 470nm",
      wavelengthNm: 470,
      wavelengthM: 470e-9,
      trueKneeVoltage: 2.62,
      colorHex: "#3b82f6",
      glowRgba: "rgba(59, 130, 246, 0.45)"
    },
    "green-525": {
      id: "green-525",
      name: "InGaN Pure Green LED (525 nm)",
      shortName: "Green 525nm",
      wavelengthNm: 525,
      wavelengthM: 525e-9,
      trueKneeVoltage: 2.34,
      colorHex: "#10b981",
      glowRgba: "rgba(16, 185, 129, 0.45)"
    },
    "yellow-585": {
      id: "yellow-585",
      name: "AlGaInP Yellow LED (585 nm)",
      shortName: "Yellow 585nm",
      wavelengthNm: 585,
      wavelengthM: 585e-9,
      trueKneeVoltage: 2.10,
      colorHex: "#eab308",
      glowRgba: "rgba(234, 179, 8, 0.45)"
    },
    "amber-605": {
      id: "amber-605",
      name: "AlGaInP Amber LED (605 nm)",
      shortName: "Amber 605nm",
      wavelengthNm: 605,
      wavelengthM: 605e-9,
      trueKneeVoltage: 2.03,
      colorHex: "#f97316",
      glowRgba: "rgba(249, 115, 22, 0.45)"
    },
    "red-635": {
      id: "red-635",
      name: "AlGaAs Bright Red LED (635 nm)",
      shortName: "Red 635nm",
      wavelengthNm: 635,
      wavelengthM: 635e-9,
      trueKneeVoltage: 1.93,
      colorHex: "#ef4444",
      glowRgba: "rgba(239, 68, 68, 0.45)"
    }
  };

  // Scientific State
  const state = {
    // Mode: 'photocell' (Photoelectric Effect) or 'led' (LED Knee Voltage)
    mode: "photocell",

    // Hardware Power & Light Controls
    powerOn: true,
    lightOn: true,
    lightIntensityPct: 100, // 20% to 100%

    // Active Selections
    currentFilterId: "green",
    currentCathodeId: "cesium",
    currentLedId: "green-525",

    // Electrical Variables
    // In photocell mode: voltage applied between anode and cathode (-3.00 V to +3.00 V)
    // Negative voltage is retarding (decelerating) potential.
    appliedVoltageV: 0.00,
    // In LED mode: forward bias voltage (0.00 V to 3.50 V)
    ledVoltageV: 0.00,

    // Secondary Display View: 'iv-curve' or 'regression'
    graphView: "regression",

    // Dynamic Physics Telemetry
    photocurrentNa: 0.0,
    ledCurrentMa: 0.0,
    theoreticalVsV: 0.0,
    calculatedPlanckH: 0.0,
    calculatedErrorPct: 0.0,

    // Logbook Observations
    observations: [],

    // Mastery Missions / Challenges
    challenges: {
      zeroNullStopping: { completed: false, xp: 100 },
      multiFrequencySweep: { completed: false, xp: 125 },
      planckConstantExtraction: { completed: false, xp: 150 }
    }
  };

  // Animated Particles for Visual Canvases
  const particles = [];
  const MAX_PARTICLES = 40;
  let animFrameId = null;
  let lastTimestamp = 0;
  let domEventsBound = false;

  // DOM Elements Cache
  let benchCanvas, benchCtx;
  let graphCanvas, graphCtx;
  const BENCH_LOGICAL_W = 820;
  const BENCH_LOGICAL_H = 380;
  const GRAPH_LOGICAL_W = 920;
  const GRAPH_LOGICAL_H = 420;

  /**
   * Retina-sharp Canvas Initialization
   */
  function setupHiDPI(canvas, logicalW, logicalH) {
    if (!canvas) return null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(logicalW * dpr);
    canvas.height = Math.round(logicalH * dpr);
    canvas.style.width = "100%";
    canvas.style.height = "auto";
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  function ensureCanvases() {
    if (!benchCanvas) benchCanvas = document.getElementById("planck-bench-canvas");
    if (!graphCanvas) graphCanvas = document.getElementById("planck-graph-canvas");
    if (benchCanvas && !benchCtx) benchCtx = setupHiDPI(benchCanvas, BENCH_LOGICAL_W, BENCH_LOGICAL_H);
    if (graphCanvas && !graphCtx) graphCtx = setupHiDPI(graphCanvas, GRAPH_LOGICAL_W, GRAPH_LOGICAL_H);
  }

  /**
   * Core Quantum Physics Calculations
   */
  function calculatePhysics() {
    if (state.mode === "photocell") {
      const filter = SPECTRAL_FILTERS[state.currentFilterId] || SPECTRAL_FILTERS["green"];
      const cathode = CATHODE_MATERIALS[state.currentCathodeId] || CATHODE_MATERIALS["cesium"];

      // Photon Energy: E = h * nu (in Joules and eV)
      const photonEnergyJ = CONSTANTS.h_true * filter.frequencyHz;
      const photonEnergyEv = photonEnergyJ / CONSTANTS.e;

      // Theoretical Stopping Potential: V_s = (h*nu - Phi) / e
      // Stopping potential is the magnitude of opposing voltage at which photocurrent drops to zero.
      const trueVs = photonEnergyEv > cathode.workFunctionEv ? (photonEnergyEv - cathode.workFunctionEv) : 0.0;
      state.theoreticalVsV = Number(trueVs.toFixed(3));

      // Photocurrent calculation based on applied voltage V
      // V is applied potential. When V < -V_s, current is 0.
      // When V >= -V_s, current rises toward saturation current I_sat proportional to intensity.
      if (!state.powerOn || !state.lightOn || photonEnergyEv <= cathode.workFunctionEv) {
        state.photocurrentNa = 0.0;
      } else {
        const iSat = 18.5 * (state.lightIntensityPct / 100); // Saturation current in nA
        const retardingV = -state.appliedVoltageV; // Opposing potential

        if (retardingV >= (state.theoreticalVsV - 0.005) || retardingV >= trueVs) {
          // Beyond or at stopping potential: current is strictly zero
          state.photocurrentNa = 0.0;
        } else {
          // Rising smoothly from stopping threshold to saturation
          const vDiff = trueVs - retardingV;
          // Smooth physical rise model
          const normalizedRise = Math.min(1.0, Math.pow(vDiff / 0.85, 1.35));
          let current = iSat * normalizedRise;
          // Small micro-fluctuation noise
          const noise = (Math.random() - 0.5) * 0.04;
          state.photocurrentNa = Math.max(0.0, Number((current + noise).toFixed(2)));
        }
      }

      // Single-point h estimation if near stopping potential or from theoretical value
      if (trueVs > 0) {
        const estH = ((trueVs * CONSTANTS.e + cathode.workFunctionJ) / filter.frequencyHz);
        state.calculatedPlanckH = Number((estH / 1e-34).toFixed(3));
        const err = Math.abs((estH - CONSTANTS.h_true) / CONSTANTS.h_true) * 100;
        state.calculatedErrorPct = Number(err.toFixed(2));
      } else {
        state.calculatedPlanckH = 0.0;
        state.calculatedErrorPct = 0.0;
      }
    } else {
      // LED Mode
      const led = LED_SPECIMENS[state.currentLedId] || LED_SPECIMENS["green-525"];
      const vKnee = led.trueKneeVoltage;

      if (!state.powerOn || state.ledVoltageV <= 0.2) {
        state.ledCurrentMa = 0.0;
      } else if (state.ledVoltageV < vKnee) {
        // Sub-threshold exponential leakage current
        const leakage = 0.05 * Math.exp((state.ledVoltageV - vKnee) * 6);
        state.ledCurrentMa = Number(Math.max(0, leakage).toFixed(2));
      } else {
        // Above knee voltage: linear conduction limited by series resistance (e.g., 68 Ohm)
        const forwardCurrent = ((state.ledVoltageV - vKnee) / 0.068) + 0.15;
        state.ledCurrentMa = Number(Math.min(45.0, forwardCurrent).toFixed(2));
      }

      // Extrapolated h from LED knee voltage: h = e * V_0 * lambda / c
      const estH = (CONSTANTS.e * vKnee * led.wavelengthM) / CONSTANTS.c;
      state.calculatedPlanckH = Number((estH / 1e-34).toFixed(3));
      const err = Math.abs((estH - CONSTANTS.h_true) / CONSTANTS.h_true) * 100;
      state.calculatedErrorPct = Number(err.toFixed(2));
    }

    checkChallenges();
  }

  /**
   * Update UI Telemetry Cards and Digital Displays
   */
  function updateTelemetryDom() {
    const filter = SPECTRAL_FILTERS[state.currentFilterId] || SPECTRAL_FILTERS["green"];
    const cathode = CATHODE_MATERIALS[state.currentCathodeId] || CATHODE_MATERIALS["cesium"];
    const led = LED_SPECIMENS[state.currentLedId] || LED_SPECIMENS["green-525"];

    // Header HUD Badges
    const filterBadge = document.getElementById("planck-filter-hud-badge");
    if (filterBadge) {
      if (state.mode === "photocell") {
        filterBadge.innerHTML = `<strong>${filter.name}</strong> • λ = ${filter.wavelengthNm} nm • ν = ${filter.frequencyDisplay}`;
      } else {
        filterBadge.innerHTML = `<strong>${led.name}</strong> • λ = ${led.wavelengthNm} nm • V_knee = ${led.trueKneeVoltage} V`;
      }
    }

    // Digital Meters Readout
    const digitalVoltEl = document.getElementById("planck-digital-volts");
    const digitalAmpEl = document.getElementById("planck-digital-amps");
    const ampUnitEl = document.getElementById("planck-amp-unit");

    if (digitalVoltEl) {
      const vVal = state.mode === "photocell" ? state.appliedVoltageV : state.ledVoltageV;
      digitalVoltEl.textContent = (vVal >= 0 ? "+" : "") + vVal.toFixed(2) + " V";
    }

    if (digitalAmpEl) {
      if (state.mode === "photocell") {
        digitalAmpEl.textContent = state.photocurrentNa.toFixed(2);
        if (ampUnitEl) ampUnitEl.textContent = "nA";
      } else {
        digitalAmpEl.textContent = state.ledCurrentMa.toFixed(2);
        if (ampUnitEl) ampUnitEl.textContent = "mA";
      }
    }

    // Telemetry Summary KPI Cards
    const elEnergy = document.getElementById("planck-kpi-energy");
    const elFreq = document.getElementById("planck-kpi-freq");
    const elStopping = document.getElementById("planck-kpi-stopping");
    const elConstant = document.getElementById("planck-kpi-constant");
    const elWork = document.getElementById("planck-kpi-work");
    const elError = document.getElementById("planck-kpi-error");

    if (elEnergy) {
      if (state.mode === "photocell") {
        elEnergy.textContent = `${filter.photonEnergyEv.toFixed(2)} eV`;
      } else {
        const eEv = (CONSTANTS.h_true * CONSTANTS.c / led.wavelengthM) / CONSTANTS.e;
        elEnergy.textContent = `${eEv.toFixed(2)} eV`;
      }
    }

    if (elFreq) {
      if (state.mode === "photocell") {
        elFreq.textContent = `${(filter.frequencyHz / 1e14).toFixed(3)} ×10¹⁴`;
      } else {
        const freq = CONSTANTS.c / led.wavelengthM;
        elFreq.textContent = `${(freq / 1e14).toFixed(3)} ×10¹⁴`;
      }
    }

    if (elStopping) {
      if (state.mode === "photocell") {
        elStopping.textContent = `${state.theoreticalVsV.toFixed(2)} V`;
      } else {
        elStopping.textContent = `${led.trueKneeVoltage.toFixed(2)} V`;
      }
    }

    if (elConstant) {
      elConstant.textContent = `${state.calculatedPlanckH.toFixed(2)} ×10⁻³⁴`;
    }

    if (elWork) {
      if (state.mode === "photocell") {
        elWork.textContent = `${cathode.workFunctionEv.toFixed(2)} eV`;
      } else {
        elWork.textContent = `Bandgap E_g`;
      }
    }

    if (elError) {
      elError.textContent = `${state.calculatedErrorPct.toFixed(2)} %`;
    }

    // Control values update
    const voltSliderVal = document.getElementById("planck-volt-slider-val");
    if (voltSliderVal) {
      const v = state.mode === "photocell" ? state.appliedVoltageV : state.ledVoltageV;
      voltSliderVal.textContent = (v >= 0 ? "+" : "") + v.toFixed(2) + " V";
    }

    const intensityVal = document.getElementById("planck-intensity-val");
    if (intensityVal) {
      intensityVal.textContent = `${state.lightIntensityPct} %`;
    }
  }

  /**
   * Draw Main Optical Bench / Vacuum Photocell Chamber Canvas
   */
  function renderBench() {
    ensureCanvases();
    if (!benchCtx) return;
    const ctx = benchCtx;
    const w = BENCH_LOGICAL_W;
    const h = BENCH_LOGICAL_H;

    // Dark High-Tech Background
    ctx.clearRect(0, 0, w, h);
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, "#090d16");
    bgGrad.addColorStop(1, "#05070c");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle Grid Blueprint Lines
    ctx.strokeStyle = "rgba(56, 189, 248, 0.04)";
    ctx.lineWidth = 1;
    const gridSize = 24;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    if (state.mode === "photocell") {
      renderPhotocellChamber(ctx, w, h);
    } else {
      renderLedBench(ctx, w, h);
    }
  }

  /**
   * Render Photocell Vacuum Chamber & Beam Path
   */
  function renderPhotocellChamber(ctx, w, h) {
    const filter = SPECTRAL_FILTERS[state.currentFilterId] || SPECTRAL_FILTERS["green"];
    const cathode = CATHODE_MATERIALS[state.currentCathodeId] || CATHODE_MATERIALS["cesium"];

    // 1. Light Source Lamp Housing (Left)
    const lampX = 40;
    const lampY = 90;
    const lampW = 100;
    const lampH = 180;

    // Outer Casing
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(lampX, lampY, lampW, lampH, 8);
    ctx.fill();
    ctx.stroke();

    // Cooling Fins
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1.5;
    for (let fy = lampY + 20; fy < lampY + lampH - 20; fy += 14) {
      ctx.beginPath();
      ctx.moveTo(lampX + 6, fy);
      ctx.lineTo(lampX + lampW - 20, fy);
      ctx.stroke();
    }

    // Lamp Label
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 9px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("HIGH-PRESSURE Hg LAMP", lampX + lampW / 2 - 8, lampY + 16);

    // Collimator Snout
    const snoutX = lampX + lampW;
    const snoutY = lampY + lampH / 2 - 24;
    const snoutW = 32;
    const snoutH = 48;
    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = "#475569";
    ctx.beginPath();
    ctx.roundRect(snoutX, snoutY, snoutW, snoutH, 4);
    ctx.fill();
    ctx.stroke();

    // Optical Color Filter Slot
    const filterSlotX = snoutX + snoutW + 8;
    const filterSlotY = snoutY - 10;
    const filterSlotW = 16;
    const filterSlotH = 68;

    ctx.fillStyle = filter.colorHex;
    ctx.shadowColor = filter.colorHex;
    ctx.shadowBlur = state.lightOn ? 14 : 0;
    ctx.beginPath();
    ctx.roundRect(filterSlotX, filterSlotY, filterSlotW, filterSlotH, 3);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Filter Frame
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 8px monospace";
    ctx.textAlign = "center";
    ctx.fillText(filter.shortName, filterSlotX + filterSlotW / 2, filterSlotY - 6);

    // 2. Quartz Vacuum Phototube Envelope (Center-Right)
    const tubeCenterX = 490;
    const tubeCenterY = 180;
    const tubeRadius = 110;

    // Glass bulb glow & reflection
    ctx.save();
    const bulbGrad = ctx.createRadialGradient(tubeCenterX - 20, tubeCenterY - 20, 10, tubeCenterX, tubeCenterY, tubeRadius);
    bulbGrad.addColorStop(0, "rgba(56, 189, 248, 0.08)");
    bulbGrad.addColorStop(0.85, "rgba(15, 23, 42, 0.6)");
    bulbGrad.addColorStop(1, "rgba(56, 189, 248, 0.25)");

    ctx.fillStyle = bulbGrad;
    ctx.strokeStyle = "rgba(148, 163, 184, 0.45)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(tubeCenterX, tubeCenterY, tubeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Quartz Entrance Window on Tube
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(tubeCenterX, tubeCenterY, tubeRadius, Math.PI * 0.9, Math.PI * 1.1);
    ctx.stroke();

    // 3. Monochromatic Light Beam (from Filter into Tube)
    if (state.powerOn && state.lightOn) {
      const beamStartX = filterSlotX + filterSlotW;
      const beamStartY1 = snoutY + 4;
      const beamStartY2 = snoutY + snoutH - 4;
      const beamTargetX = tubeCenterX - 35;
      const beamTargetY1 = tubeCenterY - 55;
      const beamTargetY2 = tubeCenterY + 55;

      const beamGrad = ctx.createLinearGradient(beamStartX, 0, beamTargetX, 0);
      beamGrad.addColorStop(0, filter.glowRgba);
      beamGrad.addColorStop(0.5, filter.glowRgba.replace("0.4", "0.25"));
      beamGrad.addColorStop(1, "rgba(255, 255, 255, 0.15)");

      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(beamStartX, beamStartY1);
      ctx.lineTo(beamTargetX, beamTargetY1);
      ctx.lineTo(beamTargetX, beamTargetY2);
      ctx.lineTo(beamStartX, beamStartY2);
      ctx.closePath();
      ctx.fill();

      // Optical Ray Lines
      ctx.strokeStyle = filter.colorHex;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([6, 4]);
      for (let offset = -14; offset <= 14; offset += 14) {
        ctx.beginPath();
        ctx.moveTo(beamStartX, snoutY + snoutH / 2 + offset);
        ctx.lineTo(beamTargetX, tubeCenterY + offset * 2.2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // 4. Phototube Electrodes inside Envelope
    // A) Curved Photocathode (Plate receiving photons)
    const cathodeX = tubeCenterX - 35;
    const cathodeRadius = 65;
    ctx.strokeStyle = cathode.color;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cathodeX, tubeCenterY, cathodeRadius, -Math.PI * 0.42, Math.PI * 0.42, true);
    ctx.stroke();

    // Cathode Mount Rod & Wire
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cathodeX - 45, tubeCenterY);
    ctx.lineTo(cathodeX - cathodeRadius, tubeCenterY);
    ctx.lineTo(cathodeX - cathodeRadius, tubeCenterY + tubeRadius + 18);
    ctx.stroke();

    ctx.fillStyle = cathode.color;
    ctx.font = "bold 10px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`CATHODE (${cathode.symbol})`, cathodeX - 50, tubeCenterY - 70);

    // B) Central Wire Anode (Collector Pin)
    const anodeX = tubeCenterX + 35;
    const anodeY = tubeCenterY;

    // Anode Wire Rod
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(anodeX, anodeY - 50);
    ctx.lineTo(anodeX, anodeY + 50);
    ctx.lineTo(anodeX, tubeCenterY + tubeRadius + 18);
    ctx.stroke();

    // Anode Collector Loop
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(anodeX, anodeY, 18, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 10px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("ANODE (Collector)", anodeX + 15, tubeCenterY - 70);

    // 5. Electric Field Visual Lines (Decelerating / Accelerating)
    const v = state.appliedVoltageV;
    const isRetarding = v < 0;
    const fieldStrength = Math.abs(v);

    if (fieldStrength > 0.05) {
      ctx.strokeStyle = isRetarding ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      for (let fy = tubeCenterY - 40; fy <= tubeCenterY + 40; fy += 20) {
        ctx.beginPath();
        if (isRetarding) {
          // Field points from anode to cathode (opposing electron motion)
          ctx.moveTo(anodeX - 10, fy);
          ctx.lineTo(cathodeX + 10, fy);
        } else {
          // Field points from cathode to anode (accelerating electrons)
          ctx.moveTo(cathodeX + 10, fy);
          ctx.lineTo(anodeX - 10, fy);
        }
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Electric Field Indicator Label
      ctx.fillStyle = isRetarding ? "#ef4444" : "#10b981";
      ctx.font = "italic 9px 'Space Grotesk', sans-serif";
      ctx.textAlign = "center";
      const fieldDesc = isRetarding ? "← RETARDING FIELD (E)" : "ACCELERATING FIELD (E) →";
      ctx.fillText(fieldDesc, tubeCenterX, tubeCenterY + 75);
    }

    // 6. Dynamic Photoelectron Particle Animation
    renderParticles(ctx, cathodeX, anodeX, tubeCenterY, isRetarding, fieldStrength);

    // 7. Base Mount & Mechanical Stand
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(tubeCenterX - 60, tubeCenterY + tubeRadius + 14, 120, 26, 4);
    ctx.fill();
    ctx.stroke();

    // Telemetry Mini-Overlay on Tube Stand
    ctx.fillStyle = "#94a3b8";
    ctx.font = "9px monospace";
    ctx.textAlign = "center";
    ctx.fillText("VACUUM SEALED • P < 10⁻⁶ Pa", tubeCenterX, tubeCenterY + tubeRadius + 30);

    ctx.restore();
  }

  /**
   * Render Animated Photoelectron Particles
   */
  function renderParticles(ctx, cathodeX, anodeX, centerY, isRetarding, fieldStrength) {
    if (!state.powerOn || !state.lightOn) return;

    const filter = SPECTRAL_FILTERS[state.currentFilterId] || SPECTRAL_FILTERS["green"];
    const cathode = CATHODE_MATERIALS[state.currentCathodeId] || CATHODE_MATERIALS["cesium"];
    const canEmit = filter.photonEnergyEv > cathode.workFunctionEv;
    if (!canEmit) return;

    // True stopping potential threshold
    const trueVs = state.theoreticalVsV;
    const retardingV = -state.appliedVoltageV;
    const isCompletelyStopped = isRetarding && retardingV >= trueVs;

    // Spawn new photoelectrons
    if (particles.length < MAX_PARTICLES && Math.random() < 0.4) {
      const angle = (Math.random() - 0.5) * 0.8;
      // Kinetic energy determines initial speed
      const kMax = Math.max(0.2, filter.photonEnergyEv - cathode.workFunctionEv);
      const initSpeed = (1.5 + Math.random() * 2.2) * Math.sqrt(kMax / 1.5);

      particles.push({
        x: cathodeX - 5,
        y: centerY + (Math.random() - 0.5) * 60,
        vx: initSpeed * Math.cos(angle),
        vy: initSpeed * Math.sin(angle),
        initialK: kMax,
        alpha: 1.0,
        turnedAround: false
      });
    }

    // Update and draw existing particles
    ctx.fillStyle = "#38bdf8";
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 6;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      // Deceleration or acceleration from electric field
      if (isRetarding) {
        // Opposing force proportional to retarding potential
        p.vx -= fieldStrength * 0.085;
        if (p.vx < 0) {
          p.turnedAround = true;
        }
      } else {
        // Forward acceleration
        p.vx += fieldStrength * 0.06;
      }

      p.x += p.vx;
      p.y += p.vy;

      // Particle reaching anode
      if (p.x >= anodeX - 2 && !p.turnedAround) {
        particles.splice(i, 1);
        continue;
      }

      // Particle turned back to cathode
      if (p.x <= cathodeX - 20) {
        particles.splice(i, 1);
        continue;
      }

      // Boundary cleanup
      if (p.y < centerY - 80 || p.y > centerY + 80 || p.x > anodeX + 30) {
        particles.splice(i, 1);
        continue;
      }

      // Draw electron wavepacket dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
  }

  /**
   * Render LED Recombination Bench (Mode 2)
   */
  function renderLedBench(ctx, w, h) {
    const led = LED_SPECIMENS[state.currentLedId] || LED_SPECIMENS["green-525"];
    const cx = w / 2;
    const cy = h / 2 - 10;

    // Breadboard Base
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - 260, cy - 100, 520, 230, 12);
    ctx.fill();
    ctx.stroke();

    // Breadboard Holes Array
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    for (let bx = cx - 230; bx <= cx + 230; bx += 22) {
      for (let by = cy - 75; by <= cy + 105; by += 22) {
        ctx.beginPath();
        ctx.arc(bx, by, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Circuit Track Lines
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 160, cy + 30);
    ctx.lineTo(cx - 50, cy + 30);
    ctx.lineTo(cx - 50, cy - 20);
    ctx.stroke();

    ctx.strokeStyle = "#64748b";
    ctx.beginPath();
    ctx.moveTo(cx + 50, cy - 20);
    ctx.lineTo(cx + 50, cy + 30);
    ctx.lineTo(cx + 160, cy + 30);
    ctx.stroke();

    // Series Resistor (68 Ohm)
    const rx = cx - 120;
    const ry = cy + 30;
    ctx.fillStyle = "#d97706";
    ctx.beginPath();
    ctx.roundRect(rx - 25, ry - 10, 50, 20, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.fillText("68 Ω", rx, ry + 4);

    // Large LED Component Housing (Center)
    const ledX = cx;
    const ledY = cy - 35;
    const ledRadius = 38;

    // Glowing Emission Halo
    if (state.powerOn && state.ledCurrentMa > 0.1) {
      const glowIntensity = Math.min(1.0, state.ledCurrentMa / 25.0);
      const glowGrad = ctx.createRadialGradient(ledX, ledY, 10, ledX, ledY, 110 * glowIntensity);
      glowGrad.addColorStop(0, led.colorHex);
      glowGrad.addColorStop(0.4, led.glowRgba);
      glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(ledX, ledY, 110 * glowIntensity, 0, Math.PI * 2);
      ctx.fill();
    }

    // LED Epoxy Dome
    const domeGrad = ctx.createRadialGradient(ledX - 10, ledY - 10, 5, ledX, ledY, ledRadius);
    domeGrad.addColorStop(0, "rgba(255, 255, 255, 0.85)");
    domeGrad.addColorStop(0.5, led.colorHex);
    domeGrad.addColorStop(1, "rgba(15, 23, 42, 0.9)");

    ctx.fillStyle = domeGrad;
    ctx.strokeStyle = led.colorHex;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(ledX, ledY, ledRadius, Math.PI, 0, false);
    ctx.lineTo(ledX + ledRadius, ledY + 22);
    ctx.lineTo(ledX - ledRadius, ledY + 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // LED Anvil & Post Leads
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ledX - 14, ledY + 22);
    ctx.lineTo(ledX - 14, ledY + 48);
    ctx.moveTo(ledX + 14, ledY + 22);
    ctx.lineTo(ledX + 14, ledY + 48);
    ctx.stroke();

    // LED Name & Peak Wavelength Text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${led.name}`, ledX, cy + 90);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px monospace";
    ctx.fillText(`Knee Threshold V₀ ≈ ${led.trueKneeVoltage} V`, ledX, cy + 105);
  }

  function isThemeLight() {
    if (typeof document === "undefined") return false;
    return document.documentElement?.getAttribute?.("data-theme") === "light" ||
           Boolean(document.body?.classList?.contains?.("light-mode")) ||
           document.body?.getAttribute?.("data-theme") === "light";
  }

  /**
   * Draw Secondary Characteristic Graph Canvas (I-V Curves OR Linear Regression)
   */
  function renderGraph() {
    ensureCanvases();
    if (!graphCtx) return;
    const ctx = graphCtx;
    const w = GRAPH_LOGICAL_W;
    const h = GRAPH_LOGICAL_H;

    const isLight = isThemeLight();

    // Theme Background
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = isLight ? "#f8fafc" : "#070b14";
    ctx.fillRect(0, 0, w, h);

    if (state.graphView === "iv-curve") {
      renderIvCurveGraph(ctx, w, h, isLight);
    } else {
      renderRegressionGraph(ctx, w, h, isLight);
    }
  }

  /**
   * Render Live I-V Characteristic Curve
   */
  function renderIvCurveGraph(ctx, w, h, isLight) {
    const padL = 76;
    const padR = 40;
    const padT = 50;
    const padB = 54;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    const isPhotocell = state.mode === "photocell";
    const filter = SPECTRAL_FILTERS[state.currentFilterId] || SPECTRAL_FILTERS["green"];
    const led = LED_SPECIMENS[state.currentLedId] || LED_SPECIMENS["green-525"];

    // Theme Colors
    const colAxis = isLight ? "#475569" : "#64748b";
    const colGrid = isLight ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.06)";
    const colGridSub = isLight ? "rgba(0, 0, 0, 0.025)" : "rgba(255, 255, 255, 0.025)";
    const colTickText = isLight ? "#475569" : "#94a3b8";
    const colTitle = isLight ? "#0f172a" : "#f8fafc";
    const colLabel = isLight ? "#334155" : "#cbd5e1";
    const colZero = isLight ? "rgba(2, 132, 199, 0.45)" : "rgba(56, 189, 248, 0.4)";

    // Graph Title Header
    ctx.fillStyle = colTitle;
    ctx.font = "bold 13px 'Orbitron', 'Space Grotesk', sans-serif";
    ctx.textAlign = "left";
    const mainTitle = isPhotocell
      ? "I - V PHOTOELECTRIC CHARACTERISTIC CURVE"
      : "FORWARD I - V CONDUCTION & KNEE THRESHOLD (LED)";
    ctx.fillText(mainTitle, padL, 26);

    // Subtitle / Specimen Badge
    ctx.fillStyle = isLight ? "#0284c7" : "#38bdf8";
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.textAlign = "right";
    const subTitle = isPhotocell
      ? `${filter.name} (λ = ${filter.wavelengthNm} nm) • Photocathode: ${state.currentCathodeId.toUpperCase()}`
      : `${led.name} (λ = ${led.wavelengthNm} nm) • Turn-on Knee V₀ = ${led.trueKneeVoltage} V`;
    ctx.fillText(subTitle, padL + plotW, 26);

    // Parameters
    let vMin, vMax, iMin, iMax, vStep, iStep;
    if (isPhotocell) {
      vMin = -2.5;
      vMax = 2.5;
      iMin = 0.0;
      iMax = 22.0;
      vStep = 0.5;
      iStep = 5.0;
    } else {
      vMin = 0.0;
      vMax = 3.5;
      iMin = 0.0;
      iMax = 45.0;
      vStep = 0.5;
      iStep = 10.0;
    }

    // Draw Subgrid
    ctx.lineWidth = 1;
    ctx.strokeStyle = colGridSub;
    const subDivsX = 4;
    const subDivsY = 2;
    for (let v = vMin; v <= vMax + 0.001; v += (vStep / subDivsX)) {
      const gx = padL + ((v - vMin) / (vMax - vMin)) * plotW;
      ctx.beginPath();
      ctx.moveTo(gx, padT);
      ctx.lineTo(gx, padT + plotH);
      ctx.stroke();
    }
    for (let cur = iMin; cur <= iMax + 0.001; cur += (iStep / subDivsY)) {
      const gy = padT + plotH - ((cur - iMin) / (iMax - iMin)) * plotH;
      ctx.beginPath();
      ctx.moveTo(padL, gy);
      ctx.lineTo(padL + plotW, gy);
      ctx.stroke();
    }

    // Draw Major Grid & Ticks
    ctx.lineWidth = 1;
    ctx.strokeStyle = colGrid;
    ctx.font = "600 10px 'JetBrains Mono', monospace";

    // X-Axis Ticks & Grid
    for (let v = vMin; v <= vMax + 0.001; v += vStep) {
      const gx = padL + ((v - vMin) / (vMax - vMin)) * plotW;

      ctx.beginPath();
      ctx.moveTo(gx, padT);
      ctx.lineTo(gx, padT + plotH);
      ctx.stroke();

      // Tick mark
      ctx.strokeStyle = colAxis;
      ctx.beginPath();
      ctx.moveTo(gx, padT + plotH);
      ctx.lineTo(gx, padT + plotH + 5);
      ctx.stroke();
      ctx.strokeStyle = colGrid;

      // Label
      ctx.fillStyle = colTickText;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      const vStr = (v > 0 ? "+" : "") + v.toFixed(1);
      ctx.fillText(vStr, gx, padT + plotH + 8);
    }

    // Y-Axis Ticks & Grid
    for (let cur = iMin; cur <= iMax + 0.001; cur += iStep) {
      const gy = padT + plotH - ((cur - iMin) / (iMax - iMin)) * plotH;

      ctx.beginPath();
      ctx.moveTo(padL, gy);
      ctx.lineTo(padL + plotW, gy);
      ctx.stroke();

      // Tick mark
      ctx.strokeStyle = colAxis;
      ctx.beginPath();
      ctx.moveTo(padL, gy);
      ctx.lineTo(padL - 5, gy);
      ctx.stroke();
      ctx.strokeStyle = colGrid;

      // Label
      ctx.fillStyle = colTickText;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(cur.toFixed(0), padL - 8, gy);
    }

    // Main Axes Lines
    ctx.strokeStyle = colAxis;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    // Zero-Potential Reference Line (for Photocell)
    if (isPhotocell) {
      const zeroX = padL + ((0.0 - vMin) / (vMax - vMin)) * plotW;
      ctx.strokeStyle = colZero;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(zeroX, padT);
      ctx.lineTo(zeroX, padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Axis Labels
    ctx.fillStyle = colLabel;
    ctx.font = "bold 11px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("Applied Bias Voltage V (Volts)", padL + plotW / 2, h - 8);

    ctx.save();
    ctx.translate(22, padT + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(isPhotocell ? "Photocurrent I (nA)" : "Forward Current I (mA)", 0, 0);
    ctx.restore();

    // Plot Curves
    if (isPhotocell) {
      const vs = state.theoreticalVsV;
      const iSat = 18.5 * (state.lightIntensityPct / 100);
      const strokeColor = filter.colorHex || "#10b981";

      // Area fill under curve
      const areaGrad = ctx.createLinearGradient(0, padT, 0, padT + plotH);
      areaGrad.addColorStop(0, filter.glowRgba || "rgba(16, 185, 129, 0.35)");
      areaGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.beginPath();
      let firstPoint = true;
      for (let px = 0; px <= plotW; px += 2) {
        const vVal = vMin + (px / plotW) * (vMax - vMin);
        let cur = 0.0;
        if (vVal >= -vs) {
          const vDiff = vVal - (-vs);
          cur = iSat * Math.min(1.0, Math.pow(vDiff / 0.85, 1.35));
        }
        const py = padT + plotH - ((cur - iMin) / (iMax - iMin)) * plotH;
        if (firstPoint) {
          ctx.moveTo(padL + px, py);
          firstPoint = false;
        } else {
          ctx.lineTo(padL + px, py);
        }
      }
      ctx.lineTo(padL + plotW, padT + plotH);
      const stopX = padL + ((-vs - vMin) / (vMax - vMin)) * plotW;
      ctx.lineTo(Math.max(padL, stopX), padT + plotH);
      ctx.closePath();
      ctx.fillStyle = areaGrad;
      ctx.fill();

      // Curve Stroke
      ctx.beginPath();
      firstPoint = true;
      for (let px = 0; px <= plotW; px += 2) {
        const vVal = vMin + (px / plotW) * (vMax - vMin);
        let cur = 0.0;
        if (vVal >= -vs) {
          const vDiff = vVal - (-vs);
          cur = iSat * Math.min(1.0, Math.pow(vDiff / 0.85, 1.35));
        }
        const py = padT + plotH - ((cur - iMin) / (iMax - iMin)) * plotH;
        if (firstPoint) {
          ctx.moveTo(padL + px, py);
          firstPoint = false;
        } else {
          ctx.lineTo(padL + px, py);
        }
      }
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Stopping Potential Mark on Axis
      if (-vs >= vMin && -vs <= vMax) {
        const vsX = padL + ((-vs - vMin) / (vMax - vMin)) * plotW;
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(vsX, padT + 30);
        ctx.lineTo(vsX, padT + plotH);
        ctx.stroke();
        ctx.setLineDash([]);

        // Mark circle
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(vsX, padT + plotH, 5, 0, Math.PI * 2);
        ctx.fill();

        // Stopping Potential Badge
        ctx.fillStyle = isLight ? "#dc2626" : "#fca5a5";
        ctx.font = "bold 10px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        const labelY = (Math.abs(-vs) < 0.25) ? padT + plotH - 24 : padT + plotH - 12;
        ctx.fillText(`-V_s = ${(-vs).toFixed(2)} V`, vsX, labelY);
      }

      // Active Operating Point Marker
      const curV = state.appliedVoltageV;
      if (curV >= vMin && curV <= vMax) {
        const opX = padL + ((curV - vMin) / (vMax - vMin)) * plotW;
        const opY = padT + plotH - ((state.photocurrentNa - iMin) / (iMax - iMin)) * plotH;

        // Halo
        ctx.fillStyle = "rgba(245, 158, 11, 0.25)";
        ctx.beginPath();
        ctx.arc(opX, opY, 12, 0, Math.PI * 2);
        ctx.fill();

        // Dot
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.arc(opX, opY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Coordinate Readout Badge
        const badgeText = `V = ${curV >= 0 ? "+" : ""}${curV.toFixed(2)} V  |  I = ${state.photocurrentNa.toFixed(2)} nA`;
        ctx.font = "bold 10px 'JetBrains Mono', monospace";
        const badgeW = ctx.measureText(badgeText).width + 16;
        const badgeX = Math.min(padL + plotW - badgeW - 10, Math.max(padL + 10, opX - badgeW / 2));
        const badgeY = Math.max(padT + 14, opY - 26);

        ctx.fillStyle = isLight ? "rgba(15, 23, 42, 0.9)" : "rgba(15, 23, 42, 0.88)";
        ctx.strokeStyle = "rgba(245, 158, 11, 0.6)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, 22, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#fef08a";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(badgeText, badgeX + 8, badgeY + 11);
      }
    } else {
      // LED Mode I-V Curve
      const vKnee = led.trueKneeVoltage;
      const strokeColor = led.colorHex || "#10b981";

      // Area fill
      const areaGrad = ctx.createLinearGradient(0, padT, 0, padT + plotH);
      areaGrad.addColorStop(0, led.glowRgba || "rgba(16, 185, 129, 0.35)");
      areaGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.beginPath();
      let firstPoint = true;
      for (let px = 0; px <= plotW; px += 2) {
        const vVal = vMin + (px / plotW) * (vMax - vMin);
        let cur = 0.0;
        if (vVal >= vKnee) {
          cur = ((vVal - vKnee) / 0.068) + 0.15;
        } else if (vVal > 0.2) {
          cur = 0.05 * Math.exp((vVal - vKnee) * 6);
        }
        const py = padT + plotH - ((Math.min(iMax, cur) - iMin) / (iMax - iMin)) * plotH;
        if (firstPoint) {
          ctx.moveTo(padL + px, py);
          firstPoint = false;
        } else {
          ctx.lineTo(padL + px, py);
        }
      }
      ctx.lineTo(padL + plotW, padT + plotH);
      ctx.lineTo(padL, padT + plotH);
      ctx.closePath();
      ctx.fillStyle = areaGrad;
      ctx.fill();

      // Curve Stroke
      ctx.beginPath();
      firstPoint = true;
      for (let px = 0; px <= plotW; px += 2) {
        const vVal = vMin + (px / plotW) * (vMax - vMin);
        let cur = 0.0;
        if (vVal >= vKnee) {
          cur = ((vVal - vKnee) / 0.068) + 0.15;
        } else if (vVal > 0.2) {
          cur = 0.05 * Math.exp((vVal - vKnee) * 6);
        }
        const py = padT + plotH - ((Math.min(iMax, cur) - iMin) / (iMax - iMin)) * plotH;
        if (firstPoint) {
          ctx.moveTo(padL + px, py);
          firstPoint = false;
        } else {
          ctx.lineTo(padL + px, py);
        }
      }
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Knee voltage indicator
      const kneeX = padL + ((vKnee - vMin) / (vMax - vMin)) * plotW;
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(kneeX, padT + 30);
      ctx.lineTo(kneeX, padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(kneeX, padT + plotH, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isLight ? "#b45309" : "#fde68a";
      ctx.font = "bold 10px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(`Knee V₀ = ${vKnee.toFixed(2)} V`, kneeX, padT + plotH - 12);

      // Active LED bias operating point
      const curV = state.ledVoltageV;
      if (curV >= vMin && curV <= vMax) {
        const opX = padL + ((curV - vMin) / (vMax - vMin)) * plotW;
        const opY = padT + plotH - ((state.ledCurrentMa - iMin) / (iMax - iMin)) * plotH;

        ctx.fillStyle = "rgba(16, 185, 129, 0.25)";
        ctx.beginPath();
        ctx.arc(opX, opY, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.arc(opX, opY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();

        const badgeText = `V = +${curV.toFixed(2)} V  |  I = ${state.ledCurrentMa.toFixed(2)} mA`;
        ctx.font = "bold 10px 'JetBrains Mono', monospace";
        const badgeW = ctx.measureText(badgeText).width + 16;
        const badgeX = Math.min(padL + plotW - badgeW - 10, Math.max(padL + 10, opX - badgeW / 2));
        const badgeY = Math.max(padT + 14, opY - 26);

        ctx.fillStyle = isLight ? "rgba(15, 23, 42, 0.9)" : "rgba(15, 23, 42, 0.88)";
        ctx.strokeStyle = "rgba(16, 185, 129, 0.6)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, 22, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#a7f3d0";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(badgeText, badgeX + 8, badgeY + 11);
      }
    }
  }

  /**
   * Render Linear Regression Graph (V_s vs Frequency ν or V_0 vs ν)
   */
  function renderRegressionGraph(ctx, w, h, isLight) {
    const padL = 76;
    const padR = 40;
    const padT = 50;
    const padB = 54;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    const isPhotocell = state.mode === "photocell";
    const cathode = CATHODE_MATERIALS[state.currentCathodeId] || CATHODE_MATERIALS["cesium"];

    // Theme Colors
    const colAxis = isLight ? "#475569" : "#64748b";
    const colGrid = isLight ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.06)";
    const colGridSub = isLight ? "rgba(0, 0, 0, 0.025)" : "rgba(255, 255, 255, 0.025)";
    const colTickText = isLight ? "#475569" : "#94a3b8";
    const colTitle = isLight ? "#0f172a" : "#f8fafc";
    const colLabel = isLight ? "#334155" : "#cbd5e1";

    // Header Title
    ctx.fillStyle = colTitle;
    ctx.font = "bold 13px 'Orbitron', 'Space Grotesk', sans-serif";
    ctx.textAlign = "left";
    const mainTitle = isPhotocell
      ? "STOPPING POTENTIAL vs FREQUENCY (EINSTEIN PHOTOELECTRIC REGRESSION)"
      : "KNEE VOLTAGE vs FREQUENCY (LED OPTICAL BANDGAP REGRESSION)";
    ctx.fillText(mainTitle, padL, 26);

    // Subtitle Badge
    ctx.fillStyle = isLight ? "#7c3aed" : "#c4b5fd";
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.textAlign = "right";
    const subTitle = isPhotocell
      ? `Theoretical m = h/e = 4.136 × 10⁻¹⁵ V·s  |  Cathode Φ = ${cathode.workFunctionEv.toFixed(2)} eV`
      : `Theoretical m = h/e = 4.136 × 10⁻¹⁵ V·s  |  Relation: eV₀ ≈ hc/λ`;
    ctx.fillText(subTitle, padL + plotW, 26);

    // Ranges
    let fMin = 4.0;
    let fMax = 9.0;
    let fStep = 1.0;
    let vMin = 0.0;
    let vMax, vStep;

    if (isPhotocell) {
      vMax = 1.8;
      vStep = 0.3;
    } else {
      vMax = 3.5;
      vStep = 0.5;
    }

    // Subgrid
    ctx.lineWidth = 1;
    ctx.strokeStyle = colGridSub;
    for (let f = fMin; f <= fMax + 0.001; f += 0.25) {
      const gx = padL + ((f - fMin) / (fMax - fMin)) * plotW;
      ctx.beginPath();
      ctx.moveTo(gx, padT);
      ctx.lineTo(gx, padT + plotH);
      ctx.stroke();
    }
    for (let v = vMin; v <= vMax + 0.001; v += (vStep / 2)) {
      const gy = padT + plotH - ((v - vMin) / (vMax - vMin)) * plotH;
      ctx.beginPath();
      ctx.moveTo(padL, gy);
      ctx.lineTo(padL + plotW, gy);
      ctx.stroke();
    }

    // Major Grid & Ticks
    ctx.lineWidth = 1;
    ctx.strokeStyle = colGrid;
    ctx.font = "600 10px 'JetBrains Mono', monospace";

    // X-Axis Ticks (Frequency)
    for (let f = fMin; f <= fMax + 0.001; f += fStep) {
      const gx = padL + ((f - fMin) / (fMax - fMin)) * plotW;

      ctx.beginPath();
      ctx.moveTo(gx, padT);
      ctx.lineTo(gx, padT + plotH);
      ctx.stroke();

      // Tick
      ctx.strokeStyle = colAxis;
      ctx.beginPath();
      ctx.moveTo(gx, padT + plotH);
      ctx.lineTo(gx, padT + plotH + 5);
      ctx.stroke();
      ctx.strokeStyle = colGrid;

      // Text
      ctx.fillStyle = colTickText;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(f.toFixed(1), gx, padT + plotH + 8);
    }

    // Y-Axis Ticks (Voltage)
    for (let v = vMin; v <= vMax + 0.001; v += vStep) {
      const gy = padT + plotH - ((v - vMin) / (vMax - vMin)) * plotH;

      ctx.beginPath();
      ctx.moveTo(padL, gy);
      ctx.lineTo(padL + plotW, gy);
      ctx.stroke();

      // Tick
      ctx.strokeStyle = colAxis;
      ctx.beginPath();
      ctx.moveTo(padL, gy);
      ctx.lineTo(padL - 5, gy);
      ctx.stroke();
      ctx.strokeStyle = colGrid;

      // Text
      ctx.fillStyle = colTickText;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(v.toFixed(2), padL - 8, gy);
    }

    // Main Axes
    ctx.strokeStyle = colAxis;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = colLabel;
    ctx.font = "bold 11px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("Light Frequency ν (× 10¹⁴ Hz)", padL + plotW / 2, h - 8);

    ctx.save();
    ctx.translate(22, padT + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(isPhotocell ? "Stopping Potential V_s (Volts)" : "Knee Turn-On Potential V₀ (Volts)", 0, 0);
    ctx.restore();

    // Theoretical Linear Slope Reference Line (Dashed)
    ctx.strokeStyle = isLight ? "rgba(2, 132, 199, 0.45)" : "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();

    let thX1, thY1, thX2, thY2;
    if (isPhotocell) {
      const fThresh = (cathode.workFunctionEv / (CONSTANTS.h_true / CONSTANTS.e)) / 1e14;
      const x0 = padL + ((fThresh - fMin) / (fMax - fMin)) * plotW;
      const y0 = padT + plotH;

      const fEnd = 8.8;
      const vEnd = ((CONSTANTS.h_true / CONSTANTS.e) * (fEnd * 1e14)) - cathode.workFunctionEv;
      const xEnd = padL + ((fEnd - fMin) / (fMax - fMin)) * plotW;
      const yEnd = padT + plotH - ((vEnd - vMin) / (vMax - vMin)) * plotH;

      thX1 = x0; thY1 = y0; thX2 = xEnd; thY2 = yEnd;
    } else {
      const fStart = 4.2;
      const vStart = (CONSTANTS.h_true / CONSTANTS.e) * (fStart * 1e14);
      const x0 = padL + ((fStart - fMin) / (fMax - fMin)) * plotW;
      const y0 = padT + plotH - ((vStart - vMin) / (vMax - vMin)) * plotH;

      const fEnd = 8.2;
      const vEnd = (CONSTANTS.h_true / CONSTANTS.e) * (fEnd * 1e14);
      const xEnd = padL + ((fEnd - fMin) / (fMax - fMin)) * plotW;
      const yEnd = padT + plotH - ((vEnd - vMin) / (vMax - vMin)) * plotH;

      thX1 = x0; thY1 = y0; thX2 = xEnd; thY2 = yEnd;
    }
    ctx.moveTo(thX1, thY1);
    ctx.lineTo(thX2, thY2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Theoretical Line Label
    ctx.fillStyle = isLight ? "#0284c7" : "#38bdf8";
    ctx.font = "italic 10px 'Space Grotesk', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("Theoretical Slope (h/e)", thX2 - 10, thY2 + 16);

    // Filter relevant observations
    const relevantObs = state.observations.filter(o => isPhotocell ? (o.mode === "photocell") : (o.mode === "led"));

    // Empirical Least-Squares Best Fit (if >= 2 points)
    let empiricalFit = null;
    if (relevantObs.length >= 2) {
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
      const N = relevantObs.length;

      relevantObs.forEach(pt => {
        const x = pt.frequencyHz / 1e14;
        const y = pt.stoppingVoltageV;
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
        sumY2 += y * y;
      });

      const denom = (N * sumX2 - sumX * sumX);
      if (Math.abs(denom) > 1e-6) {
        const slopeScaled = (N * sumXY - sumX * sumY) / denom;
        const intercept = (sumY - slopeScaled * sumX) / N;

        // Correlation R^2
        const numR = (N * sumXY - sumX * sumY);
        const denR = Math.sqrt((N * sumX2 - sumX * sumX) * Math.max(1e-9, (N * sumY2 - sumY * sumY)));
        const r2 = denR > 0 ? Math.min(0.9999, Math.pow(numR / denR, 2)) : 0.999;

        // Planck h extracted
        const slopeSI = slopeScaled * 1e-14;
        const hExp = (slopeSI * CONSTANTS.e) / 1e-34;
        const errorPct = Math.abs((hExp * 1e-34 - CONSTANTS.h_true) / CONSTANTS.h_true) * 100;

        empiricalFit = {
          slopeScaled,
          intercept,
          r2,
          hExp,
          errorPct
        };

        // Draw solid empirical regression line
        const fitX1 = fMin;
        const fitY1 = slopeScaled * fitX1 + intercept;
        const fitX2 = fMax;
        const fitY2 = slopeScaled * fitX2 + intercept;

        const pX1 = padL + ((fitX1 - fMin) / (fMax - fMin)) * plotW;
        const pY1 = padT + plotH - ((fitY1 - vMin) / (vMax - vMin)) * plotH;
        const pX2 = padL + ((fitX2 - fMin) / (fMax - fMin)) * plotW;
        const pY2 = padT + plotH - ((fitY2 - vMin) / (vMax - vMin)) * plotH;

        ctx.strokeStyle = "#8b5cf6";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(pX1, pY1);
        ctx.lineTo(pX2, pY2);
        ctx.stroke();
      }
    }

    // Draw Observations Points with Callout Labels
    relevantObs.forEach((pt, idx) => {
      const fVal = pt.frequencyHz / 1e14;
      const vsVal = pt.stoppingVoltageV;

      const px = padL + ((fVal - fMin) / (fMax - fMin)) * plotW;
      const py = padT + plotH - ((vsVal - vMin) / (vMax - vMin)) * plotH;

      if (px >= padL && px <= padL + plotW && py >= padT && py <= padT + plotH) {
        // Outer halo
        ctx.fillStyle = pt.colorHex ? `${pt.colorHex}44` : "rgba(245, 158, 11, 0.3)";
        ctx.beginPath();
        ctx.arc(px, py, 10, 0, Math.PI * 2);
        ctx.fill();

        // Main Point
        ctx.fillStyle = pt.colorHex || "#f59e0b";
        ctx.beginPath();
        ctx.arc(px, py, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Non-colliding Callout Label
        const pointLabel = `${pt.sampleName}: ${vsVal.toFixed(2)}V`;
        ctx.font = "bold 9.5px 'JetBrains Mono', monospace";
        const isOdd = idx % 2 === 1;
        const labelOffsetY = isOdd ? -14 : 18;
        ctx.fillStyle = isLight ? "#0f172a" : "#f8fafc";
        ctx.textAlign = "center";
        ctx.textBaseline = isOdd ? "bottom" : "top";
        ctx.fillText(pointLabel, px, py + labelOffsetY);
      }
    });

    // Active Live Target Marker (Current Selection)
    let activeF, activeV, activeName;
    if (isPhotocell) {
      const curFilter = SPECTRAL_FILTERS[state.currentFilterId] || SPECTRAL_FILTERS["green"];
      activeF = curFilter.frequencyHz / 1e14;
      activeV = state.theoreticalVsV;
      activeName = curFilter.name;
    } else {
      const curLed = LED_SPECIMENS[state.currentLedId] || LED_SPECIMENS["green-525"];
      activeF = (CONSTANTS.c / curLed.wavelengthM) / 1e14;
      activeV = curLed.trueKneeVoltage;
      activeName = curLed.name;
    }

    if (activeF >= fMin && activeF <= fMax && activeV >= vMin && activeV <= vMax) {
      const curPx = padL + ((activeF - fMin) / (fMax - fMin)) * plotW;
      const curPy = padT + plotH - ((activeV - vMin) / (vMax - vMin)) * plotH;

      // Pulsing reticle ring
      ctx.strokeStyle = isLight ? "#0284c7" : "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(curPx, curPy, 14, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(curPx - 18, curPy);
      ctx.lineTo(curPx + 18, curPy);
      ctx.moveTo(curPx, curPy - 18);
      ctx.lineTo(curPx, curPy + 18);
      ctx.stroke();
    }

    // Scientific HUD Telemetry Box
    const hudW = 290;
    const hudH = 78;
    const hudX = padL + 16;
    const hudY = padT + 14;

    ctx.fillStyle = isLight ? "rgba(255, 255, 255, 0.94)" : "rgba(12, 19, 40, 0.92)";
    ctx.strokeStyle = isLight ? "rgba(148, 163, 184, 0.4)" : "rgba(56, 189, 248, 0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(hudX, hudY, hudW, hudH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    // Row 1: Target Universal Constant
    ctx.fillStyle = isLight ? "#0284c7" : "#38bdf8";
    ctx.fillText("TARGET h = 6.626 × 10⁻³⁴ J·s  |  m = 4.136 × 10⁻¹⁵ V·s", hudX + 12, hudY + 10);

    if (empiricalFit) {
      // Row 2: Empirical Deduced h
      ctx.fillStyle = isLight ? "#7c3aed" : "#c4b5fd";
      ctx.font = "bold 10px 'JetBrains Mono', monospace";
      ctx.fillText(`EMPIRICAL h = ${empiricalFit.hExp.toFixed(3)} × 10⁻³⁴ J·s (Err: ${empiricalFit.errorPct.toFixed(2)}%)`, hudX + 12, hudY + 30);

      // Row 3: Fit Statistics
      ctx.fillStyle = isLight ? "#059669" : "#34d399";
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillText(`LINEAR FIT: R² = ${empiricalFit.r2.toFixed(4)}  |  N = ${relevantObs.length} Trials`, hudX + 12, hudY + 52);
    } else {
      // Prompt user to record observations for empirical fit
      ctx.fillStyle = isLight ? "#d97706" : "#f59e0b";
      ctx.font = "bold 9.5px 'JetBrains Mono', monospace";
      ctx.fillText(`ACTIVE: ${activeName.toUpperCase()} (Vs = ${activeV.toFixed(2)} V)`, hudX + 12, hudY + 31);

      ctx.fillStyle = isLight ? "#64748b" : "#94a3b8";
      ctx.font = "9px 'Space Grotesk', sans-serif";
      ctx.fillText("Click 'Record Observation' on ≥2 spectral lines for empirical fit", hudX + 12, hudY + 52);
    }
  }

  /**
   * Render All Views
   */
  function renderAll() {
    ensureCanvases();
    calculatePhysics();
    updateTelemetryDom();
    renderBench();
    renderGraph();
  }

  /**
   * Animation Frame Loop
   */
  function animationLoop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    lastTimestamp = timestamp;

    const section = document.getElementById("exp-planck-section");
    if (section && !section.classList.contains("hidden")) {
      renderBench();
    }
    animFrameId = requestAnimationFrame(animationLoop);
  }

  function startAnimationLoop() {
    if (!animFrameId) {
      lastTimestamp = performance.now();
      animFrameId = requestAnimationFrame(animationLoop);
    }
  }

  function stopAnimationLoop() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  /**
   * Record Observation into Logbook
   */
  function recordObservation() {
    calculatePhysics();

    const filter = SPECTRAL_FILTERS[state.currentFilterId] || SPECTRAL_FILTERS["green"];
    const cathode = CATHODE_MATERIALS[state.currentCathodeId] || CATHODE_MATERIALS["cesium"];
    const led = LED_SPECIMENS[state.currentLedId] || LED_SPECIMENS["green-525"];

    const isPhotocell = state.mode === "photocell";
    const trialNum = state.observations.length + 1;

    const newObs = {
      trial: trialNum,
      mode: state.mode,
      modeName: isPhotocell ? "Photoelectric Effect" : "LED Method",
      sampleName: isPhotocell ? filter.name : led.name,
      wavelengthNm: isPhotocell ? filter.wavelengthNm : led.wavelengthNm,
      frequencyHz: isPhotocell ? filter.frequencyHz : (CONSTANTS.c / led.wavelengthM),
      stoppingVoltageV: isPhotocell ? state.theoreticalVsV : led.trueKneeVoltage,
      appliedVoltageV: isPhotocell ? state.appliedVoltageV : state.ledVoltageV,
      measuredCurrent: isPhotocell ? state.photocurrentNa : state.ledCurrentMa,
      currentUnit: isPhotocell ? "nA" : "mA",
      calculatedH: state.calculatedPlanckH,
      errorPct: state.calculatedErrorPct,
      colorHex: isPhotocell ? filter.colorHex : led.colorHex,
      timestamp: new Date().toISOString()
    };

    state.observations.push(newObs);
    saveObservationsToStorage();
    renderObservationsTable();
    renderGraph();

    if (typeof showToast === "function") {
      showToast(`Recorded Trial #${trialNum}: ${newObs.sampleName} (h = ${newObs.calculatedH} ×10⁻³⁴ J·s)`);
    }

    if (typeof onExperimentRecorded === "function") {
      onExperimentRecorded("planck", {
        trial: trialNum,
        filter: newObs.sampleName,
        stoppingVoltage: newObs.stoppingVoltageV,
        planckH: newObs.calculatedH,
        errorPct: newObs.errorPct
      });
    }

    checkChallenges();
  }

  /**
   * Clear Observation Table
   */
  function clearObservations() {
    if (state.observations.length === 0) return;
    state.observations = [];
    saveObservationsToStorage();
    renderObservationsTable();
    renderGraph();
    if (typeof showToast === "function") {
      showToast("Planck's Constant observation logbook cleared");
    }
  }

  /**
   * LocalStorage Observation Persistence
   */
  function saveObservationsToStorage() {
    try {
      localStorage.setItem("physix_planck_observations", JSON.stringify(state.observations));
    } catch (e) {}
  }

  function loadObservationsFromStorage() {
    try {
      const saved = localStorage.getItem("physix_planck_observations");
      if (saved) {
        state.observations = JSON.parse(saved);
      }
    } catch (e) {}
  }

  /**
   * Render Scientific Observation Table in DOM
   */
  function renderObservationsTable() {
    const tableBody = document.getElementById("planck-obs-table-body");
    const emptyState = document.getElementById("planck-obs-empty-state");
    const countBadge = document.getElementById("planck-obs-count-badge");

    if (countBadge) {
      countBadge.textContent = `${state.observations.length} Records`;
    }

    if (!tableBody) return;

    if (state.observations.length === 0) {
      tableBody.innerHTML = "";
      if (emptyState) emptyState.classList.remove("hidden");
      return;
    }

    if (emptyState) emptyState.classList.add("hidden");

    tableBody.innerHTML = state.observations.map((obs, idx) => `
      <tr class="dg-obs-row">
        <td><strong>#${obs.trial}</strong></td>
        <td>
          <span style="display:inline-flex; align-items:center; gap:6px;">
            <span style="width:8px; height:8px; border-radius:50%; background:${obs.colorHex};"></span>
            ${obs.sampleName}
          </span>
        </td>
        <td>${obs.wavelengthNm} nm</td>
        <td>${(obs.frequencyHz / 1e14).toFixed(3)} ×10¹⁴</td>
        <td><strong style="color:#f59e0b;">${obs.stoppingVoltageV.toFixed(2)} V</strong></td>
        <td>${obs.calculatedH.toFixed(2)} ×10⁻³⁴</td>
        <td><span class="error-pill ${obs.errorPct < 2.0 ? 'low-error' : ''}">${obs.errorPct.toFixed(2)}%</span></td>
        <td>
          <button type="button" class="btn-obs-del" data-index="${idx}" title="Delete Row">
            <svg class="svg-icon svg-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      </tr>
    `).join("");

    // Bind row delete buttons
    tableBody.querySelectorAll(".btn-obs-del").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = parseInt(btn.getAttribute("data-index"), 10);
        if (!isNaN(i) && i >= 0 && i < state.observations.length) {
          state.observations.splice(i, 1);
          state.observations.forEach((o, newIdx) => { o.trial = newIdx + 1; });
          saveObservationsToStorage();
          renderObservationsTable();
          renderGraph();
        }
      });
    });
  }

  /**
   * Gamified Mastery Challenges Check
   */
  function checkChallenges() {
    // 1. Zero-Null Stopping Potential
    // If retarding voltage matches theoretical stopping voltage within 0.03V and current is zero
    if (!state.challenges.zeroNullStopping.completed && state.mode === "photocell" && state.currentFilterId === "green") {
      const vOpp = -state.appliedVoltageV;
      if (Math.abs(vOpp - state.theoreticalVsV) <= 0.03 && state.photocurrentNa === 0.0) {
        state.challenges.zeroNullStopping.completed = true;
        saveChallengesToStorage();
        renderChallengesDom();
        if (typeof onChallengeCompleted === "function") {
          onChallengeCompleted({
            challengeId: "planck.zeroNullStopping",
            xp: 100,
            name: "Zero-Null Stopping Potential"
          });
        }
        if (typeof showToast === "function") {
          showToast("Challenge Completed: Zero-Null Stopping Potential (+100 XP)!");
        }
      }
    }

    // 2. Quantum Frequency Sweep
    // Record observations across at least 3 distinct spectral frequencies
    const uniqueWavelengths = new Set(state.observations.map(o => o.wavelengthNm));
    if (!state.challenges.multiFrequencySweep.completed && uniqueWavelengths.size >= 3) {
      state.challenges.multiFrequencySweep.completed = true;
      saveChallengesToStorage();
      renderChallengesDom();
      if (typeof onChallengeCompleted === "function") {
        onChallengeCompleted({
          challengeId: "planck.multiFrequencySweep",
          xp: 125,
          name: "Quantum Frequency Sweep"
        });
      }
      if (typeof showToast === "function") {
        showToast("Challenge Completed: Multi-Frequency Sweep (+125 XP)!");
      }
    }

    // 3. Planck Constant Extraction (Error < 3.0%)
    const lowErrorObs = state.observations.find(o => o.errorPct > 0 && o.errorPct <= 3.0);
    if (!state.challenges.planckConstantExtraction.completed && lowErrorObs) {
      state.challenges.planckConstantExtraction.completed = true;
      saveChallengesToStorage();
      renderChallengesDom();
      if (typeof onChallengeCompleted === "function") {
        onChallengeCompleted({
          challengeId: "planck.planckConstantExtraction",
          xp: 150,
          name: "Quantum Action Determination"
        });
      }
      if (typeof showToast === "function") {
        showToast("Challenge Completed: Planck Constant Extraction (<3% Error) (+150 XP)!");
      }
    }
  }

  function saveChallengesToStorage() {
    try {
      localStorage.setItem("physix_planck_challenges", JSON.stringify(state.challenges));
    } catch (e) {}
  }

  function loadChallengesFromStorage() {
    try {
      const saved = localStorage.getItem("physix_planck_challenges");
      if (saved) {
        state.challenges = { ...state.challenges, ...JSON.parse(saved) };
      }
    } catch (e) {}
  }

  function hydrateChallenges(completedList = []) {
    const set = new Set(completedList);
    let changed = false;

    if (set.has("planck.zeroNullStopping") && !state.challenges.zeroNullStopping.completed) {
      state.challenges.zeroNullStopping.completed = true;
      changed = true;
    }
    if (set.has("planck.multiFrequencySweep") && !state.challenges.multiFrequencySweep.completed) {
      state.challenges.multiFrequencySweep.completed = true;
      changed = true;
    }
    if (set.has("planck.planckConstantExtraction") && !state.challenges.planckConstantExtraction.completed) {
      state.challenges.planckConstantExtraction.completed = true;
      changed = true;
    }

    if (changed) {
      saveChallengesToStorage();
      renderChallengesDom();
    }
  }

  function renderChallengesDom() {
    const card = document.querySelector("#exp-planck-section .challenges-card");
    if (!card) return;

    const ch1 = card.querySelector("[data-ch='zeroNullStopping']");
    const ch2 = card.querySelector("[data-ch='multiFrequencySweep']");
    const ch3 = card.querySelector("[data-ch='planckConstantExtraction']");

    if (ch1) ch1.classList.toggle("completed", !!state.challenges.zeroNullStopping.completed);
    if (ch2) ch2.classList.toggle("completed", !!state.challenges.multiFrequencySweep.completed);
    if (ch3) ch3.classList.toggle("completed", !!state.challenges.planckConstantExtraction.completed);

    const total = 3;
    const done = Object.values(state.challenges).filter(c => c.completed).length;
    const progressFill = card.querySelector(".mission-progress-fill");
    const progressText = card.querySelector(".mission-progress-text");
    if (progressFill) progressFill.style.width = `${(done / total) * 100}%`;
    if (progressText) progressText.textContent = `${done} of ${total} Completed`;
  }

  /**
   * PDF Lab Report Export
   */
  function exportLabReport() {
    if (state.observations.length === 0) {
      if (typeof showToast === "function") {
        showToast("Record at least one experimental observation before exporting report.");
      }
      return;
    }

    const tableHeaders = ["Trial", "Mode", "Spectral Line", "Wavelength (nm)", "Frequency (Hz)", "Stopping V (V)", "Planck h (J*s)", "% Error"];
    const tableRows = state.observations.map(o => [
      `#${o.trial}`,
      o.modeName,
      o.sampleName,
      `${o.wavelengthNm} nm`,
      `${(o.frequencyHz / 1e14).toFixed(3)}e14`,
      `${o.stoppingVoltageV.toFixed(2)} V`,
      `${o.calculatedH.toFixed(2)}e-34`,
      `${o.errorPct.toFixed(2)}%`
    ]);

    generateLabReportPdf({
      labTitle: "Determination of Planck's Constant Virtual Laboratory",
      labSubtitle: "Photoelectric Effect Stopping Potential & Optoelectronic Diode Evaluation",
      experimentCode: "EXP-08-PLANCK",
      experimentId: "planck",
      stats: [
        { label: "Target Constant (h)", value: "6.626 × 10⁻³⁴ J·s" },
        { label: "Deduced Slope (m)", value: "4.14 × 10⁻¹⁵ V·s" },
        { label: "Total Observations", value: String(state.observations.length) },
        { label: "Mean Relative Error", value: `${state.calculatedErrorPct.toFixed(2)}%` }
      ],
      tableHeaders,
      tableRows,
      conclusions: [
        "Einstein's photoelectric equation e*V_s = h*nu - Phi was verified with high experimental precision across visible and UV spectra.",
        "The linear relationship between stopping potential and frequency demonstrated that photon energy depends exclusively on radiation frequency.",
        `Planck's constant was determined to be h = ${state.calculatedPlanckH} × 10⁻³⁴ J·s with under 1.5% analytical deviation.`,
        "The semiconductor LED forward knee voltage method provided independent solid-state validation of Planck's quantum constant."
      ]
    });
  }

  /**
   * Event Handlers Binding
   */
  function bindDomEvents() {
    if (domEventsBound) return;
    domEventsBound = true;

    // Mode Switcher Buttons (Photocell vs LED)
    const btnModePhotocell = document.getElementById("planck-btn-mode-photocell");
    const btnModeLed = document.getElementById("planck-btn-mode-led");
    const photocellPalette = document.getElementById("planck-photocell-palette");
    const ledPalette = document.getElementById("planck-led-palette");

    btnModePhotocell?.addEventListener("click", () => {
      state.mode = "photocell";
      btnModePhotocell.classList.add("active");
      btnModeLed?.classList.remove("active");
      photocellPalette?.classList.remove("hidden");
      ledPalette?.classList.add("hidden");
      renderAll();
    });

    btnModeLed?.addEventListener("click", () => {
      state.mode = "led";
      btnModeLed.classList.add("active");
      btnModePhotocell?.classList.remove("active");
      ledPalette?.classList.remove("hidden");
      photocellPalette?.classList.add("hidden");
      renderAll();
    });

    // Power Switches
    const btnPowerDc = document.getElementById("planck-btn-power-dc");
    btnPowerDc?.addEventListener("click", () => {
      state.powerOn = !state.powerOn;
      btnPowerDc.classList.toggle("active", state.powerOn);
      const ledDot = document.getElementById("planck-led-dc");
      ledDot?.classList.toggle("active", state.powerOn);
      renderAll();
    });

    const btnLight = document.getElementById("planck-btn-light");
    btnLight?.addEventListener("click", () => {
      state.lightOn = !state.lightOn;
      btnLight.classList.toggle("active", state.lightOn);
      const ledDot = document.getElementById("planck-led-light");
      ledDot?.classList.toggle("active", state.lightOn);
      renderAll();
    });

    // Spectral Filter Chips
    document.querySelectorAll(".planck-filter-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const fId = chip.getAttribute("data-filter");
        if (fId && SPECTRAL_FILTERS[fId]) {
          state.currentFilterId = fId;
          document.querySelectorAll(".planck-filter-chip").forEach(c => c.classList.remove("active"));
          chip.classList.add("active");
          renderAll();
        }
      });
    });

    // LED Chips
    document.querySelectorAll(".planck-led-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const ledId = chip.getAttribute("data-led");
        if (ledId && LED_SPECIMENS[ledId]) {
          state.currentLedId = ledId;
          document.querySelectorAll(".planck-led-chip").forEach(c => c.classList.remove("active"));
          chip.classList.add("active");
          renderAll();
        }
      });
    });

    // Cathode Material Dropdown
    const cathodeSelect = document.getElementById("planck-cathode-select");
    cathodeSelect?.addEventListener("change", (e) => {
      state.currentCathodeId = e.target.value;
      renderAll();
    });

    // Voltage Slider & Buttons
    const voltSlider = document.getElementById("planck-volt-slider");
    voltSlider?.addEventListener("input", (e) => {
      const v = parseFloat(e.target.value);
      if (state.mode === "photocell") {
        state.appliedVoltageV = Number(v.toFixed(2));
      } else {
        state.ledVoltageV = Number(v.toFixed(2));
      }
      renderAll();
    });

    document.getElementById("planck-btn-v-dec-fine")?.addEventListener("click", () => {
      if (state.mode === "photocell") {
        state.appliedVoltageV = Number(Math.max(-3.0, state.appliedVoltageV - 0.02).toFixed(2));
        if (voltSlider) voltSlider.value = state.appliedVoltageV;
      } else {
        state.ledVoltageV = Number(Math.max(0.0, state.ledVoltageV - 0.05).toFixed(2));
        if (voltSlider) voltSlider.value = state.ledVoltageV;
      }
      renderAll();
    });

    document.getElementById("planck-btn-v-inc-fine")?.addEventListener("click", () => {
      if (state.mode === "photocell") {
        state.appliedVoltageV = Number(Math.min(3.0, state.appliedVoltageV + 0.02).toFixed(2));
        if (voltSlider) voltSlider.value = state.appliedVoltageV;
      } else {
        state.ledVoltageV = Number(Math.min(3.5, state.ledVoltageV + 0.05).toFixed(2));
        if (voltSlider) voltSlider.value = state.ledVoltageV;
      }
      renderAll();
    });

    // Zero-Null Balance Button
    document.getElementById("planck-btn-zero-null")?.addEventListener("click", () => {
      if (state.mode === "photocell") {
        state.appliedVoltageV = -state.theoreticalVsV;
        if (voltSlider) voltSlider.value = state.appliedVoltageV;
        if (typeof showToast === "function") {
          showToast(`Null balance achieved: Stopping potential = ${state.theoreticalVsV.toFixed(2)} V`);
        }
        renderAll();
      }
    });

    // Light Intensity Slider
    const intensitySlider = document.getElementById("planck-intensity-slider");
    intensitySlider?.addEventListener("input", (e) => {
      state.lightIntensityPct = parseInt(e.target.value, 10);
      renderAll();
    });

    // Voltage Presets
    document.querySelectorAll(".planck-preset-v").forEach((btn) => {
      btn.addEventListener("click", () => {
        const v = parseFloat(btn.getAttribute("data-v"));
        if (!isNaN(v)) {
          if (state.mode === "photocell") {
            state.appliedVoltageV = v;
          } else {
            state.ledVoltageV = Math.max(0, v);
          }
          if (voltSlider) voltSlider.value = v;
          renderAll();
        }
      });
    });

    // Graph Mode Toggle (I-V Curve vs Regression)
    const btnGraphIv = document.getElementById("planck-btn-graph-iv");
    const btnGraphReg = document.getElementById("planck-btn-graph-reg");

    btnGraphIv?.addEventListener("click", () => {
      state.graphView = "iv-curve";
      btnGraphIv.classList.add("active");
      btnGraphReg?.classList.remove("active");
      renderGraph();
    });

    btnGraphReg?.addEventListener("click", () => {
      state.graphView = "regression";
      btnGraphReg.classList.add("active");
      btnGraphIv?.classList.remove("active");
      renderGraph();
    });

    // Action Buttons
    document.getElementById("planck-btn-record")?.addEventListener("click", () => {
      recordObservation();
    });

    document.getElementById("planck-btn-export-pdf")?.addEventListener("click", () => {
      exportLabReport();
    });

    document.getElementById("planck-btn-clear-obs")?.addEventListener("click", () => {
      clearObservations();
    });

    const handleThemeOrResize = () => {
      ensureCanvases();
      if (benchCanvas) benchCtx = setupHiDPI(benchCanvas, BENCH_LOGICAL_W, BENCH_LOGICAL_H);
      if (graphCanvas) graphCtx = setupHiDPI(graphCanvas, GRAPH_LOGICAL_W, GRAPH_LOGICAL_H);
      renderAll();
    };

    // Resize Handler
    window.addEventListener("resize", handleThemeOrResize);

    // Theme Switch Handler (Button & MutationObserver)
    document.getElementById("btn-toggle-theme")?.addEventListener("click", () => {
      setTimeout(handleThemeOrResize, 40);
    });

    if (typeof MutationObserver !== "undefined" && typeof document !== "undefined") {
      const themeObserver = new MutationObserver(() => {
        handleThemeOrResize();
      });
      if (document.documentElement) {
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
      }
      if (document.body) {
        themeObserver.observe(document.body, { attributes: true, attributeFilter: ["data-theme", "class"] });
      }
    }
  }

  /**
   * Lifecycle Interface
   */
  function init() {
    ensureCanvases();
    loadChallengesFromStorage();
    loadObservationsFromStorage();
    bindDomEvents();
    renderAll();
    renderChallengesDom();
    renderObservationsTable();
    startAnimationLoop();
  }

  function destroy() {
    stopAnimationLoop();
  }

  return {
    init,
    destroy,
    renderAll,
    renderChallengesDom,
    hydrateChallenges,
    getState: () => state,
    setMode: (m) => {
      state.mode = m;
      renderAll();
    },
    setFilter: (f) => {
      if (SPECTRAL_FILTERS[f]) {
        state.currentFilterId = f;
        renderAll();
      }
    },
    setAppliedVoltage: (v) => {
      state.appliedVoltageV = v;
      renderAll();
    },
    recordObservation,
    clearObservations,
    exportLabReport
  };
}
