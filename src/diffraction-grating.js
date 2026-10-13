/**
 * PhysiX • Experiment 5: Diffraction of Light using Diffraction Grating
 * Ultra-high precision, gamified, interactive virtual laboratory.
 * Retina-sharp canvas rendering, real-time wave optics physics solver,
 * wavelength-accurate spectral beam synthesis, live order tracking,
 * observation logbook, and integrated challenge system.
 * 100% Zero Emojis compliant.
 */

import { api } from "./api.js";
import { generateLabReportPdf } from "./pdf-export.js";

export function createDiffractionGratingExperiment(callbacks = {}) {
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

  // Scientific State
  const state = {
    // Apparatus & Hardware State
    powerOn: true,
    laserActive: true,
    screenAligned: true,

    // Core Physical Parameters
    wavelengthNm: 550, // 400 nm to 700 nm (Visible spectrum)
    gratingDensityLpMm: 600, // 300 to 1200 lines/mm
    screenDistanceM: 1.00, // 0.50 m to 2.00 m
    selectedOrder: 1, // 0, 1, -1, 2, -2, 3, -3, or 'all'

    // Computed Physical Values
    gratingSpacingD: 1.6667e-6, // d = 1 / (N * 10^3) in meters
    maxObservableOrder: 3, // floor(d / lambda)
    currentAngleDeg: 19.27, // theta = arcsin(m * lambda / d)
    currentAngleRad: 0.3363,
    currentFringePositionCm: 34.96, // y = L * tan(theta)
    currentDispersion: 0.635, // d(theta)/d(lambda) = m / (d * cos(theta)) in rad/um

    // Mystery Laser Mode (Challenge 4)
    isMysteryMode: false,
    mysterySpecimenId: "neon",
    mysterySpecimens: {
      neon: { name: "Specimen He-Ne Gas Tube", trueWavelengthNm: 633 },
      argon: { name: "Specimen Argon Ion Tube", trueWavelengthNm: 488 },
      krypton: { name: "Specimen Krypton Yellow Line", trueWavelengthNm: 568 }
    },

    // Observation Logbook
    observations: [],

    // Challenge States
    challenges: {
      firstOrder: { completed: false, xp: 100, targetWl: 633, targetLpMm: 600, targetAngle: 22.3 },
      highDensity: { completed: false, xp: 125, targetWl: 532, targetLpMm: 1000, targetAngle: 32.1 },
      secondOrder: { completed: false, xp: 150, targetWl: 450, targetLpMm: 600, targetOrder: 2 },
      wavelengthShift: { completed: false, xp: 175, solved: false },
      spectroscopyMaster: { completed: false, xp: 200, requiredLogs: 4 }
    }
  };

  // Canvas context & dimensions
  let benchCanvas = null;
  let benchCtx = null;
  let screenCanvas = null;
  let screenCtx = null;

  const BENCH_LOGICAL_W = 820;
  const BENCH_LOGICAL_H = 360;
  const SCREEN_LOGICAL_W = 440;
  const SCREEN_LOGICAL_H = 260;

  let animFrameId = null;
  let pulsePhase = 0;

  // Wavelength to precise RGB & Spectral characteristics
  function getWavelengthColor(wl) {
    let r = 0, g = 0, b = 0;

    if (wl >= 380 && wl < 440) {
      r = -(wl - 440) / (440 - 380);
      g = 0.0;
      b = 1.0;
    } else if (wl >= 440 && wl < 490) {
      r = 0.0;
      g = (wl - 440) / (490 - 440);
      b = 1.0;
    } else if (wl >= 490 && wl < 510) {
      r = 0.0;
      g = 1.0;
      b = -(wl - 510) / (510 - 490);
    } else if (wl >= 510 && wl < 580) {
      r = (wl - 510) / (580 - 510);
      g = 1.0;
      b = 0.0;
    } else if (wl >= 580 && wl < 645) {
      r = 1.0;
      g = -(wl - 645) / (645 - 580);
      b = 0.0;
    } else if (wl >= 645 && wl <= 780) {
      r = 1.0;
      g = 0.0;
      b = 0.0;
    } else {
      r = 0.0;
      g = 0.0;
      b = 0.0;
    }

    // Intensity falloff near vision edges
    let factor = 1.0;
    if (wl >= 380 && wl < 420) {
      factor = 0.3 + 0.7 * (wl - 380) / (420 - 380);
    } else if (wl >= 420 && wl <= 700) {
      factor = 1.0;
    } else if (wl > 700 && wl <= 780) {
      factor = 0.3 + 0.7 * (780 - wl) / (780 - 700);
    }

    const red = Math.round(r * factor * 255);
    const green = Math.round(g * factor * 255);
    const blue = Math.round(b * factor * 255);

    const hex = "#" + ((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1);
    const rgba = (alpha) => `rgba(${red}, ${green}, ${blue}, ${alpha})`;

    return {
      r: red,
      g: green,
      b: blue,
      hex,
      rgba,
      beamCore: "#ffffff",
      beamGlow: rgba(0.75),
      beamHalo: rgba(0.25),
      spotBloom: rgba(0.9)
    };
  }

  function getEffectiveWavelength() {
    if (state.isMysteryMode && state.mysterySpecimens[state.mysterySpecimenId]) {
      return state.mysterySpecimens[state.mysterySpecimenId].trueWavelengthNm;
    }
    return state.wavelengthNm;
  }

  // Pure wave optics calculations
  function calculatePhysics() {
    const lambdaM = getEffectiveWavelength() * 1e-9;
    const linesPerM = state.gratingDensityLpMm * 1e3;
    const d = 1 / linesPerM; // Grating spacing in meters
    state.gratingSpacingD = d;

    // Maximum theoretical order where |m * lambda / d| <= 1
    const maxM = Math.floor(d / lambdaM);
    state.maxObservableOrder = Math.max(0, maxM);

    // Constrain selected order if it exceeds physical bounds
    let m = state.selectedOrder === "all" ? 1 : Number(state.selectedOrder);
    if (Math.abs(m) > state.maxObservableOrder) {
      m = state.maxObservableOrder > 0 ? (m > 0 ? state.maxObservableOrder : -state.maxObservableOrder) : 0;
      if (state.selectedOrder !== "all") {
        state.selectedOrder = m;
      }
    }

    // Angle theta for order m
    const sinTheta = (m * lambdaM) / d;
    const clampedSinTheta = Math.max(-1, Math.min(1, sinTheta));
    const thetaRad = Math.asin(clampedSinTheta);
    const thetaDeg = (thetaRad * 180) / Math.PI;

    state.currentAngleRad = thetaRad;
    state.currentAngleDeg = thetaDeg;

    // Linear screen position: y = L * tan(theta)
    const yMeters = state.screenDistanceM * Math.tan(thetaRad);
    state.currentFringePositionCm = yMeters * 100;

    // Angular dispersion D = m / (d * cos(theta)) in rad/um
    const cosTheta = Math.cos(thetaRad);
    if (cosTheta > 0.0001 && d > 0) {
      const dispRadPerM = Math.abs(m) / (d * cosTheta);
      state.currentDispersion = (dispRadPerM * 1e-6); // rad/um
    } else {
      state.currentDispersion = 0;
    }
  }

  // Calculate order information list for rendering
  function getOrdersList() {
    const lambdaM = getEffectiveWavelength() * 1e-9;
    const d = state.gratingSpacingD;
    const maxM = state.maxObservableOrder;
    const list = [];

    for (let m = -maxM; m <= maxM; m++) {
      const sinTheta = (m * lambdaM) / d;
      if (Math.abs(sinTheta) <= 1) {
        const thetaRad = Math.asin(sinTheta);
        const thetaDeg = (thetaRad * 180) / Math.PI;
        const yMeters = state.screenDistanceM * Math.tan(thetaRad);
        const yCm = yMeters * 100;
        
        // Relative intensity: central order is highest, higher orders drop off
        let intensity = 1.0;
        if (m !== 0) {
          intensity = Math.pow(Math.cos(thetaRad), 2) / (Math.abs(m) * 1.5 + 0.5);
        }

        list.push({
          order: m,
          thetaRad,
          thetaDeg,
          yMeters,
          yCm,
          intensity: Math.max(0.15, Math.min(1.0, intensity))
        });
      }
    }
    return list;
  }

  // Canvas High-DPI setup helper
  function setupHiDPI(canvas, width, height) {
    if (!canvas) return null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    return ctx;
  }

  
  // Realistic atmospheric Rayleigh scattering dust motes in laser path
  const dustParticles = [];
  for (let i = 0; i < 28; i++) {
    dustParticles.push({
      x: 90 + Math.random() * 670,
      y: 155 + (Math.random() - 0.5) * 60,
      speed: 0.15 + Math.random() * 0.25,
      size: 0.8 + Math.random() * 1.4,
      opacity: 0.2 + Math.random() * 0.6
    });
  }

  // ==========================================
  // RENDER BENCH: Optical Rail, Laser, Grating & Beams
  // ==========================================
  function renderBench() {
    try {
      if (!benchCtx) {
        benchCanvas = document.getElementById("dg-bench-canvas");
        if (benchCanvas) benchCtx = setupHiDPI(benchCanvas, BENCH_LOGICAL_W, BENCH_LOGICAL_H);
        if (!benchCtx) return;
      }
    const ctx = benchCtx;
    const w = BENCH_LOGICAL_W;
    const h = BENCH_LOGICAL_H;

    ctx.clearRect(0, 0, w, h);

    const isLight = document.documentElement.getAttribute("data-theme") === "light";

    // 1. Technical Laboratory Tabletop & Atmosphere
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    if (isLight) {
      bgGrad.addColorStop(0, "#f0f9ff");
      bgGrad.addColorStop(0.65, "#e0f2fe");
      bgGrad.addColorStop(1, "#bae6fd");
    } else {
      bgGrad.addColorStop(0, "#060913");
      bgGrad.addColorStop(0.65, "#0b101d");
      bgGrad.addColorStop(1, "#03060a");
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Laboratory Table Surface (Optical Breadboard Surface at bottom)
    const tableTopY = 275;
    const tableGrad = ctx.createLinearGradient(0, tableTopY, 0, h);
    if (isLight) {
      tableGrad.addColorStop(0, "#cbd5e1");
      tableGrad.addColorStop(0.3, "#94a3b8");
      tableGrad.addColorStop(1, "#64748b");
    } else {
      tableGrad.addColorStop(0, "#111827");
      tableGrad.addColorStop(0.3, "#0f172a");
      tableGrad.addColorStop(1, "#020617");
    }
    ctx.fillStyle = tableGrad;
    ctx.fillRect(0, tableTopY, w, h - tableTopY);

    // Tabletop highlight line
    ctx.strokeStyle = isLight ? "rgba(14, 165, 233, 0.4)" : "rgba(56, 189, 248, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, tableTopY);
    ctx.lineTo(w, tableTopY);
    ctx.stroke();

    // Technical M6 Threaded Optical Breadboard Grid Holes (Every 36px)
    ctx.fillStyle = isLight ? "rgba(255, 255, 255, 0.55)" : "rgba(0, 0, 0, 0.6)";
    ctx.strokeStyle = isLight ? "rgba(71, 85, 105, 0.3)" : "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = 0.8;
    for (let bx = 30; bx < w - 20; bx += 36) {
      for (let by = tableTopY + 16; by < h - 10; by += 24) {
        ctx.beginPath();
        ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    // Technical Coordinate Background Grid Lines in air
    ctx.strokeStyle = isLight ? "rgba(14, 165, 233, 0.12)" : "rgba(56, 189, 248, 0.035)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, tableTopY);
      ctx.stroke();
    }
    for (let y = 0; y < tableTopY; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // 2. Heavy Extruded Aluminum Optical Bench Rail (Dovetail Profile)
    const railX = 35;
    const railY = 246;
    const railW = w - 70;
    const railH = 32;

    // Rail Support Leveling Feet (Left and Right)
    function drawLevelingFoot(fx, fy) {
      // Rubber foot pad
      ctx.fillStyle = "#0a0d14";
      ctx.beginPath();
      ctx.roundRect(fx - 14, fy + 12, 28, 6, 2);
      ctx.fill();
      ctx.strokeStyle = "#334155";
      ctx.stroke();

      // Knurled brass/steel leveling screw
      const screwGrad = ctx.createLinearGradient(fx - 8, 0, fx + 8, 0);
      screwGrad.addColorStop(0, "#475569");
      screwGrad.addColorStop(0.5, "#cbd5e1");
      screwGrad.addColorStop(1, "#334155");
      ctx.fillStyle = screwGrad;
      ctx.fillRect(fx - 7, fy, 14, 13);
      // Screw threads
      ctx.strokeStyle = "rgba(0, 0, 0, 0.6)";
      ctx.lineWidth = 1;
      for (let ty = fy + 2; ty <= fy + 10; ty += 2.5) {
        ctx.beginPath();
        ctx.moveTo(fx - 7, ty);
        ctx.lineTo(fx + 7, ty);
        ctx.stroke();
      }
    }
    drawLevelingFoot(railX + 35, railY + railH);
    drawLevelingFoot(railX + railW - 35, railY + railH);

    // Aluminum Rail Extrusion Body
    const railGrad = ctx.createLinearGradient(0, railY, 0, railY + railH);
    railGrad.addColorStop(0, "#475569");
    railGrad.addColorStop(0.15, "#cbd5e1"); // Specular top chamfer
    railGrad.addColorStop(0.35, "#334155");
    railGrad.addColorStop(0.7, "#1e293b");
    railGrad.addColorStop(0.9, "#0f172a");
    railGrad.addColorStop(1, "#020617");
    ctx.fillStyle = railGrad;
    ctx.beginPath();
    ctx.roundRect(railX, railY, railW, railH, 3);
    ctx.fill();

    // Rail Outer Bevel Stroke
    ctx.strokeStyle = "rgba(203, 213, 225, 0.4)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Longitudinal Dovetail Center Groove (Milled black recess)
    const grooveY = railY + 12;
    const grooveH = 8;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(railX + 5, grooveY, railW - 10, grooveH);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.strokeRect(railX + 5, grooveY, railW - 10, grooveH);

    // High-Precision Metric Millimeter Vernier Scale along the top rail edge
    ctx.strokeStyle = "rgba(241, 245, 249, 0.7)";
    ctx.fillStyle = "rgba(241, 245, 249, 0.85)";
    ctx.font = "bold 8px monospace";
    ctx.textAlign = "center";

    // 0 to 70 cm marked every 10mm
    const scaleStart = railX + 30;
    const scaleEnd = railX + railW - 30;
    const scaleLengthPx = scaleEnd - scaleStart;

    for (let mm = 0; mm <= 700; mm += 5) {
      const rx = scaleStart + (mm / 700) * scaleLengthPx;
      const isMajor = (mm % 50 === 0);
      const isMedium = (mm % 10 === 0 && !isMajor);

      const tickLen = isMajor ? 8 : (isMedium ? 5 : 3);
      ctx.lineWidth = isMajor ? 1.2 : 0.8;
      ctx.beginPath();
      ctx.moveTo(rx, railY + 1);
      ctx.lineTo(rx, railY + 1 + tickLen);
      ctx.stroke();

      if (isMajor && mm <= 680) {
        ctx.fillText(`${mm / 10}`, rx, railY + 18);
      }
    }
    ctx.textAlign = "left";
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 7.5px monospace";
    ctx.fillText("cm", scaleEnd + 6, railY + 18);

    // 3. Physical Component Placement coordinates
    const laserX = 100;
    const opticalAxisY = 158;
    const gratingX = 295;

    // Screen X position mapped from state.screenDistanceM (0.50m - 2.00m)
    // 0.50m -> 460px, 2.00m -> 750px
    const minScreenX = 460;
    const maxScreenX = 750;
    const normDist = (state.screenDistanceM - 0.50) / 1.50;
    const screenX = minScreenX + normDist * (maxScreenX - minScreenX);

    const palette = getWavelengthColor(getEffectiveWavelength());

    // Helper: Draw Heavy Anodized Rail Carrier Base Stage
    function drawCarrierBase(cx, topY) {
      const bW = 42;
      const bH = railY - topY;

      // Anodized Aluminum Clamp Block
      const blockGrad = ctx.createLinearGradient(cx - bW / 2, 0, cx + bW / 2, 0);
      blockGrad.addColorStop(0, "#1e293b");
      blockGrad.addColorStop(0.3, "#334155");
      blockGrad.addColorStop(0.7, "#1e293b");
      blockGrad.addColorStop(1, "#0f172a");
      ctx.fillStyle = blockGrad;
      ctx.beginPath();
      ctx.roundRect(cx - bW / 2, topY, bW, bH + 6, [4, 4, 0, 0]);
      ctx.fill();
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Stainless Steel Optical Mounting Rod (Ø 12.7mm Post)
      const postW = 12;
      const postGrad = ctx.createLinearGradient(cx - postW / 2, 0, cx + postW / 2, 0);
      postGrad.addColorStop(0, "#64748b");
      postGrad.addColorStop(0.4, "#f8fafc"); // specular glint
      postGrad.addColorStop(0.8, "#94a3b8");
      postGrad.addColorStop(1, "#475569");
      ctx.fillStyle = postGrad;
      ctx.fillRect(cx - postW / 2, topY - 14, postW, 16);
      ctx.strokeStyle = "#334155";
      ctx.strokeRect(cx - postW / 2, topY - 14, postW, 16);

      // Knurled Height-Locking Collar Ring
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.roundRect(cx - 9, topY - 4, 18, 6, 2);
      ctx.fill();
      ctx.strokeStyle = "#94a3b8";
      ctx.stroke();

      // Knurled Brass Rail Locking Thumbscrew (Right side of carrier)
      const tsX = cx + bW / 2 - 1;
      const tsY = railY + 6;
      const brassGrad = ctx.createLinearGradient(0, tsY - 6, 0, tsY + 6);
      brassGrad.addColorStop(0, "#f59e0b");
      brassGrad.addColorStop(0.5, "#fef08a");
      brassGrad.addColorStop(1, "#b45309");
      ctx.fillStyle = brassGrad;
      ctx.beginPath();
      ctx.roundRect(tsX, tsY - 5, 8, 10, 2);
      ctx.fill();
      ctx.strokeStyle = "#78350f";
      ctx.stroke();
      // Thumbscrew knurl grooves
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(tsX + 2, tsY - 4, 1.5, 8);
      ctx.fillRect(tsX + 5, tsY - 4, 1.5, 8);
    }

    // 4. LASER SOURCE UNIT (High-Precision Laboratory Laser Housing)
    drawCarrierBase(laserX, opticalAxisY + 28);

    // Flexible Black Power Cord curling down to table
    ctx.save();
    ctx.strokeStyle = "#020617";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(laserX - 66, opticalAxisY + 12);
    ctx.bezierCurveTo(laserX - 95, opticalAxisY + 40, laserX - 85, tableTopY + 10, laserX - 45, tableTopY + 18);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // Laser Head Chassis Body (Cylindrical Aerospace Alloy with Machined Chamfers)
    const lBodyW = 94;
    const lBodyH = 50;
    const lBodyX = laserX - 66;
    const lBodyY = opticalAxisY - lBodyH / 2;

    const laserChassisGrad = ctx.createLinearGradient(0, lBodyY, 0, lBodyY + lBodyH);
    laserChassisGrad.addColorStop(0, "#1e293b");
    laserChassisGrad.addColorStop(0.08, "#475569");
    laserChassisGrad.addColorStop(0.2, "#0f172a");
    laserChassisGrad.addColorStop(0.65, "#1e293b");
    laserChassisGrad.addColorStop(0.9, "#090d16");
    laserChassisGrad.addColorStop(1, "#020617");
    ctx.fillStyle = laserChassisGrad;
    ctx.beginPath();
    ctx.roundRect(lBodyX, lBodyY, lBodyW, lBodyH, 6);
    ctx.fill();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Milled Radiator Cooling Fins / Heat Sink Slots
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    for (let fx = lBodyX + 16; fx <= lBodyX + 46; fx += 6) {
      ctx.fillRect(fx, lBodyY + 6, 2.5, lBodyH - 12);
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fillRect(fx + 2.5, lBodyY + 6, 0.8, lBodyH - 12);
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    }

    // Collimating Output Aperture Snout (Machined stainless steel & brass lens bezel)
    const snoutX = lBodyX + lBodyW;
    const snoutY = opticalAxisY - 14;
    const snoutW = 16;
    const snoutH = 28;

    const snoutGrad = ctx.createLinearGradient(0, snoutY, 0, snoutY + snoutH);
    snoutGrad.addColorStop(0, "#94a3b8");
    snoutGrad.addColorStop(0.2, "#f8fafc");
    snoutGrad.addColorStop(0.6, "#475569");
    snoutGrad.addColorStop(1, "#1e293b");
    ctx.fillStyle = snoutGrad;
    ctx.beginPath();
    ctx.roundRect(snoutX, snoutY, snoutW, snoutH, [0, 4, 4, 0]);
    ctx.fill();
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Knurled beam aperture ring
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(snoutX + snoutW - 3, opticalAxisY - 7, 3, 14);

    // Official Safety Hazard Warning Emblem (Yellow Triangle Plate)
    const warnX = lBodyX + 56;
    const warnY = lBodyY + 12;
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.moveTo(warnX + 10, warnY);
    ctx.lineTo(warnX + 20, warnY + 16);
    ctx.lineTo(warnX, warnY + 16);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Mini Laser Radiation Burst icon inside warning triangle
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(warnX + 10, warnY + 11, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(warnX + 6, warnY + 10, 8, 1);

    // Laser Technical Label Plate
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 7.5px 'Space Grotesk', sans-serif";
    ctx.fillText("CLASS 3B LASER", lBodyX + 54, warnY + 26);
    ctx.font = "bold 8px monospace";
    ctx.fillStyle = state.powerOn && state.laserActive ? palette.hex : "#64748b";
    ctx.fillText(`${getEffectiveWavelength()}nm`, lBodyX + 54, warnY + 34);

    // Active Laser Jewel Status LED (High Refraction domed indicator)
    const ledX = lBodyX + 8;
    const ledY = opticalAxisY - 14;
    ctx.beginPath();
    ctx.arc(ledX, ledY, 4.5, 0, Math.PI * 2);
    if (state.powerOn && state.laserActive) {
      ctx.fillStyle = palette.hex;
      ctx.shadowColor = palette.hex;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
      // Specular dome glint
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(ledX - 1.5, ledY - 1.5, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = "#1e293b";
      ctx.fill();
      ctx.strokeStyle = "#475569";
      ctx.stroke();
    }

    // Rear Rocker / Key Switch on Laser
    ctx.fillStyle = "#020617";
    ctx.fillRect(lBodyX - 4, opticalAxisY + 2, 4, 12);
    ctx.strokeStyle = "#64748b";
    ctx.strokeRect(lBodyX - 4, opticalAxisY + 2, 4, 12);

    // 5. DIFFRACTION GRATING COMPONENT (Precision Spectrometer Goniometer Mount)
    drawCarrierBase(gratingX, opticalAxisY + 46);

    // 360° Circular Goniometer Rotary Stage Bezel
    const gRadius = 46;
    ctx.save();
    // Outer Gimbal Ring with metallic shading
    const gRingGrad = ctx.createRadialGradient(
      gratingX - 10, opticalAxisY - 10, 10,
      gratingX, opticalAxisY, gRadius + 6
    );
    gRingGrad.addColorStop(0, "#475569");
    gRingGrad.addColorStop(0.5, "#0f172a");
    gRingGrad.addColorStop(0.85, "#1e293b");
    gRingGrad.addColorStop(1, "#020617");

    ctx.beginPath();
    ctx.arc(gratingX, opticalAxisY, gRadius + 4, 0, Math.PI * 2);
    ctx.fillStyle = gRingGrad;
    ctx.fill();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Goniometer Calibrated Degree Scale Ticks (Every 15°)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 0.8;
    for (let deg = 0; deg < 360; deg += 15) {
      const rad = (deg * Math.PI) / 180;
      const isMajor = deg % 45 === 0;
      const rInner = gRadius - (isMajor ? 7 : 4);
      ctx.beginPath();
      ctx.moveTo(gratingX + rInner * Math.cos(rad), opticalAxisY + rInner * Math.sin(rad));
      ctx.lineTo(gratingX + gRadius * Math.cos(rad), opticalAxisY + gRadius * Math.sin(rad));
      ctx.stroke();
    }

    // Kinematic Spring-Loaded Tilt Adjustment Screws (Top and Right)
    function drawKinematicScrew(kx, ky, isVert) {
      ctx.fillStyle = "#b45309"; // brass
      ctx.beginPath();
      ctx.roundRect(kx - (isVert ? 4 : 7), ky - (isVert ? 7 : 4), isVert ? 8 : 14, isVert ? 14 : 8, 2);
      ctx.fill();
      ctx.strokeStyle = "#fef08a";
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
    drawKinematicScrew(gratingX, opticalAxisY - gRadius - 8, true);
    drawKinematicScrew(gratingX + gRadius + 8, opticalAxisY, false);

    // Inner Aperture Window
    ctx.beginPath();
    ctx.arc(gratingX, opticalAxisY, 32, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(4, 8, 20, 0.95)";
    ctx.fill();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
    ctx.stroke();

    // High-Transmission Quartz Optical Slide Body
    const slideW = 16;
    const slideH = 72;
    const slideX = gratingX - slideW / 2;
    const slideY = opticalAxisY - slideH / 2;

    // Glass transparency with rainbow iridescent reflection sheen
    const glassGrad = ctx.createLinearGradient(slideX, slideY, slideX + slideW, slideY + slideH);
    glassGrad.addColorStop(0, "rgba(255, 255, 255, 0.35)");
    glassGrad.addColorStop(0.2, "rgba(56, 189, 248, 0.2)");
    glassGrad.addColorStop(0.4, "rgba(168, 85, 247, 0.25)");
    glassGrad.addColorStop(0.6, "rgba(16, 185, 129, 0.2)");
    glassGrad.addColorStop(0.8, "rgba(245, 158, 11, 0.2)");
    glassGrad.addColorStop(1, "rgba(255, 255, 255, 0.3)");
    ctx.fillStyle = glassGrad;
    ctx.beginPath();
    ctx.roundRect(slideX, slideY, slideW, slideH, 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Microscopic rulings pattern lines etched inside glass
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 0.7;
    for (let gy = slideY + 6; gy <= slideY + slideH - 6; gy += 3.5) {
      ctx.beginPath();
      ctx.moveTo(slideX + 2, gy);
      ctx.lineTo(slideX + slideW - 2, gy);
      ctx.stroke();
    }

    // Dual Stainless Steel Spring Retaining Clips (Top & Bottom)
    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(slideX - 2, slideY - 1, slideW + 4, 4);
    ctx.fillRect(slideX - 2, slideY + slideH - 3, slideW + 4, 4);

    // Grating Component Etched Specifications Header
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 9px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("DIFFRACTION GRATING", gratingX, opticalAxisY - 58);
    ctx.font = "bold 8.5px monospace";
    ctx.fillStyle = "#00f0ff";
    ctx.fillText(`${state.gratingDensityLpMm} lines/mm`, gratingX, opticalAxisY - 70);
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "8px monospace";
    ctx.fillText(`d = ${(state.gratingSpacingD * 1e6).toFixed(3)} μm`, gratingX, opticalAxisY + 62);
    ctx.restore();

    // 6. OBSERVATION SCREEN & DETECTOR MOUNT
    drawCarrierBase(screenX, opticalAxisY + 76);

    // Screen Carrier Pointer Index on rail
    ctx.fillStyle = "#00f0ff";
    ctx.beginPath();
    ctx.moveTo(screenX, railY);
    ctx.lineTo(screenX - 4, railY - 6);
    ctx.lineTo(screenX + 4, railY - 6);
    ctx.closePath();
    ctx.fill();

    // Frosted Diffuse Target Screen (White / Matte Gray with measurement grid)
    const scrBodyW = 12;
    const scrBodyH = 216;
    const scrBodyX = screenX - scrBodyW / 2;
    const scrBodyY = opticalAxisY - scrBodyH / 2;

    const screenPlateGrad = ctx.createLinearGradient(scrBodyX, 0, scrBodyX + scrBodyW, 0);
    screenPlateGrad.addColorStop(0, "#475569");
    screenPlateGrad.addColorStop(0.3, "#f8fafc"); // matte white screen face
    screenPlateGrad.addColorStop(0.7, "#e2e8f0");
    screenPlateGrad.addColorStop(1, "#334155");
    ctx.fillStyle = screenPlateGrad;
    ctx.beginPath();
    ctx.roundRect(scrBodyX, scrBodyY, scrBodyW, scrBodyH, 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Reticle Measurement Centimeter Marks on Screen Face
    ctx.strokeStyle = "rgba(15, 23, 42, 0.6)";
    ctx.lineWidth = 0.8;
    for (let sy = scrBodyY + 8; sy <= scrBodyY + scrBodyH - 8; sy += 12) {
      ctx.beginPath();
      ctx.moveTo(scrBodyX + 2, sy);
      ctx.lineTo(scrBodyX + scrBodyW - 2, sy);
      ctx.stroke();
    }
    // Optical Axis Center Datum Notch
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(scrBodyX - 2, opticalAxisY);
    ctx.lineTo(scrBodyX + scrBodyW + 2, opticalAxisY);
    ctx.stroke();

    // Screen Badge Readout
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 9px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("DETECTOR SCREEN", screenX, opticalAxisY - 118);
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 8.5px monospace";
    ctx.fillText(`L = ${state.screenDistanceM.toFixed(2)} m`, screenX, opticalAxisY + 128);
    ctx.textAlign = "left";

    // 7. PHOTOREALISTIC LASER BEAM PROPAGATION & INTERFERENCE DYNAMICS
    if (state.powerOn && state.laserActive) {
      const beamStart = snoutX + snoutW;
      const beamEnd = slideX;

      ctx.save();
      // Primary Incident Collimated Beam from Laser to Grating
      // Pass 1: Volumetric Gaussian atmospheric halo
      ctx.strokeStyle = palette.rgba(0.2);
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(beamStart, opticalAxisY);
      ctx.lineTo(beamEnd, opticalAxisY);
      ctx.stroke();

      // Pass 2: Coherent Spectral Glow
      ctx.strokeStyle = palette.rgba(0.7);
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(beamStart, opticalAxisY);
      ctx.lineTo(beamEnd, opticalAxisY);
      ctx.stroke();

      // Pass 3: Concentrated Filament
      ctx.strokeStyle = palette.rgba(0.95);
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(beamStart, opticalAxisY);
      ctx.lineTo(beamEnd, opticalAxisY);
      ctx.stroke();

      // Pass 4: Pure White Laser Core
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(beamStart, opticalAxisY);
      ctx.lineTo(beamEnd, opticalAxisY);
      ctx.stroke();

      // Floating Rayleigh/Dust Particles in Laser Path
      ctx.fillStyle = palette.hex;
      dustParticles.forEach((dp) => {
        dp.x += dp.speed;
        if (dp.x > screenX) dp.x = beamStart;
        if (dp.x >= beamStart && dp.x <= screenX) {
          ctx.globalAlpha = dp.opacity * (0.6 + 0.4 * Math.sin(pulsePhase * 3 + dp.x));
          ctx.beginPath();
          ctx.arc(dp.x, dp.y, dp.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1.0;
      ctx.restore();

      // Diffracted Fan of Beams radiating from Grating to Screen
      const orders = getOrdersList();
      const gratingOriginX = slideX + slideW;

      orders.forEach((ord) => {
        const isSelected =
          state.selectedOrder === "all" || Number(state.selectedOrder) === ord.order;
        const beamAlpha = isSelected ? ord.intensity : 0.15;

        // Visual screen scale: 1 meter corresponds to ~180px visually
        const visualScale = 180;
        const targetScreenY = opticalAxisY - ord.yMeters * visualScale;
        const isWithinScreen =
          targetScreenY >= opticalAxisY - 105 && targetScreenY <= opticalAxisY + 105;
        const endY = isWithinScreen
          ? targetScreenY
          : opticalAxisY - Math.sign(ord.yMeters) * 105;

        ctx.save();
        // Layer 1: Diffused Beam Halo
        ctx.strokeStyle = palette.rgba(beamAlpha * (isSelected ? 0.35 : 0.1));
        ctx.lineWidth = isSelected ? 6.5 : 2.5;
        ctx.beginPath();
        ctx.moveTo(gratingOriginX, opticalAxisY);
        ctx.lineTo(scrBodyX, endY);
        ctx.stroke();

        // Layer 2: Radiant Coherent Envelope
        ctx.strokeStyle = palette.rgba(beamAlpha * (isSelected ? 0.85 : 0.4));
        ctx.lineWidth = isSelected ? 2.8 : 1.2;
        ctx.beginPath();
        ctx.moveTo(gratingOriginX, opticalAxisY);
        ctx.lineTo(scrBodyX, endY);
        ctx.stroke();

        // Layer 3: Brilliant Core
        ctx.strokeStyle = isSelected ? "#ffffff" : palette.rgba(beamAlpha * 0.9);
        ctx.lineWidth = isSelected ? 1.0 : 0.6;
        ctx.beginPath();
        ctx.moveTo(gratingOriginX, opticalAxisY);
        ctx.lineTo(scrBodyX, endY);
        ctx.stroke();

        // High-Intensity Beam Spot & Airy Diffraction Rings on Screen Face
        if (isWithinScreen) {
          // Subtle circular Airy diffraction fringe ring
          if (isSelected) {
            ctx.strokeStyle = palette.rgba(0.4);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(scrBodyX, endY, 6, 12, 0, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Main elliptical spot
          ctx.beginPath();
          ctx.ellipse(scrBodyX, endY, 3.5, isSelected ? 8 : 4.5, 0, 0, Math.PI * 2);
          ctx.fillStyle = isSelected ? "#ffffff" : palette.hex;
          ctx.shadowColor = palette.hex;
          ctx.shadowBlur = isSelected ? 16 : 8;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Order Tag Label next to beam strike
          if (isSelected) {
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 9px monospace";
            const labelX = scrBodyX + 16;
            ctx.fillText(`m=${ord.order >= 0 ? "+" : ""}${ord.order}`, labelX, endY + 3);
          }
        }
        ctx.restore();
      });

      // Angular Arc & Guide for Selected Order
      if (state.selectedOrder !== "all" && Number(state.selectedOrder) !== 0) {
        const selM = Number(state.selectedOrder);
        const selAngleRad = state.currentAngleRad;
        const arcRadius = 75;

        ctx.save();
        ctx.strokeStyle = "rgba(0, 240, 255, 0.6)";
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]);

        // Optical axis reference line
        ctx.beginPath();
        ctx.moveTo(gratingOriginX, opticalAxisY);
        ctx.lineTo(gratingOriginX + arcRadius + 25, opticalAxisY);
        ctx.stroke();

        // Vernier Angular Arc
        ctx.setLineDash([]);
        ctx.strokeStyle = "#00f0ff";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        if (selM > 0) {
          ctx.arc(gratingOriginX, opticalAxisY, arcRadius, -selAngleRad, 0);
        } else {
          ctx.arc(gratingOriginX, opticalAxisY, arcRadius, 0, -selAngleRad);
        }
        ctx.stroke();

        // Angle Badge Readout
        ctx.fillStyle = "#00f0ff";
        ctx.font = "bold 9.5px monospace";
        const textAngle = -selAngleRad / 2;
        const textX = gratingOriginX + (arcRadius + 16) * Math.cos(textAngle);
        const textY = opticalAxisY + (arcRadius + 16) * Math.sin(textAngle);
        ctx.fillText(`θ = ${Math.abs(state.currentAngleDeg).toFixed(1)}°`, textX, textY);
        ctx.restore();
      }
    }
      } catch (err) {
      console.warn("renderBench error:", err);
    }
  }

  function renderScreenFrontal() {
    try {
      if (!screenCtx) {
        screenCanvas = document.getElementById("dg-screen-canvas");
        if (screenCanvas) screenCtx = setupHiDPI(screenCanvas, SCREEN_LOGICAL_W, SCREEN_LOGICAL_H);
        if (!screenCtx) return;
      }
    const ctx = screenCtx;
    const w = SCREEN_LOGICAL_W;
    const h = SCREEN_LOGICAL_H;

    ctx.clearRect(0, 0, w, h);

    const isLight = document.documentElement.getAttribute("data-theme") === "light";

    // 1. Screen Canvas Background (White-blue frosted or Dark Obsidian)
    const scrGrad = ctx.createLinearGradient(0, 0, w, 0);
    if (isLight) {
      scrGrad.addColorStop(0, "#f8fafc");
      scrGrad.addColorStop(0.5, "#ffffff");
      scrGrad.addColorStop(1, "#f8fafc");
    } else {
      scrGrad.addColorStop(0, "#030712");
      scrGrad.addColorStop(0.5, "#0b0f1a");
      scrGrad.addColorStop(1, "#030712");
    }
    ctx.fillStyle = scrGrad;
    ctx.fillRect(0, 0, w, h);

    // Frame border
    ctx.strokeStyle = isLight ? "rgba(14, 165, 233, 0.45)" : "rgba(56, 189, 248, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(1, 1, w - 2, h - 2);

    const centerX = w / 2;
    const profileBaseY = h - 45;
    const apertureTopY = 25;
    const apertureHeight = 110;

    // 2. Optical Center Crosshair / Datum
    ctx.strokeStyle = isLight ? "rgba(100, 116, 139, 0.3)" : "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(centerX, apertureTopY);
    ctx.lineTo(centerX, apertureTopY + apertureHeight);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Millimeter Coordinate Scale along bottom of screen aperture
    ctx.strokeStyle = isLight ? "rgba(14, 165, 233, 0.5)" : "rgba(148, 163, 184, 0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, apertureTopY + apertureHeight);
    ctx.lineTo(w - 20, apertureTopY + apertureHeight);
    ctx.stroke();

    ctx.fillStyle = isLight ? "#0369a1" : "rgba(148, 163, 184, 0.6)";
    ctx.font = "8px monospace";
    ctx.textAlign = "center";

    // 1 meter on screen mapped to 320px in this view
    const pxPerMeter = 320;
    for (let cm = -50; cm <= 50; cm += 10) {
      const markX = centerX + (cm / 100) * pxPerMeter;
      if (markX >= 25 && markX <= w - 25) {
        ctx.beginPath();
        ctx.moveTo(markX, apertureTopY + apertureHeight);
        ctx.lineTo(markX, apertureTopY + apertureHeight + (cm === 0 ? 8 : 4));
        ctx.stroke();
        ctx.fillText(`${cm > 0 ? "+" : ""}${cm}`, markX, apertureTopY + apertureHeight + 17);
      }
    }
    ctx.fillText("Position y (cm)", w - 46, apertureTopY + apertureHeight + 17);

    // 4. Principal Maxima Line Fringes & Intensity Envelope
    if (state.powerOn && state.laserActive) {
      const palette = getWavelengthColor(getEffectiveWavelength());
      const orders = getOrdersList();

      // A. Intensity Envelope Waveform Curve
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.lineWidth = 1.2;

      // Draw mathematical intensity profile across X
      let started = false;
      for (let px = 20; px <= w - 20; px += 2) {
        const xPosM = (px - centerX) / pxPerMeter;
        let totalInt = 0.02; // ambient baseline

        orders.forEach((ord) => {
          const dist = Math.abs(xPosM - ord.yMeters);
          // Gaussian peak representing coherent principal maximum
          const peakWidth = 0.012; // ~1.2cm slit diffraction width
          const peak = ord.intensity * Math.exp(-Math.pow(dist / peakWidth, 2));
          totalInt += peak;
        });

        const plotY = profileBaseY - Math.min(1.0, totalInt) * 45;
        if (!started) {
          ctx.moveTo(px, plotY);
          started = true;
        } else {
          ctx.lineTo(px, plotY);
        }
      }
      ctx.stroke();

      // Gradient Fill under intensity curve
      ctx.lineTo(w - 20, profileBaseY);
      ctx.lineTo(20, profileBaseY);
      ctx.closePath();
      const fillGrad = ctx.createLinearGradient(0, profileBaseY - 50, 0, profileBaseY);
      fillGrad.addColorStop(0, palette.rgba(0.25));
      fillGrad.addColorStop(1, palette.rgba(0.0));
      ctx.fillStyle = fillGrad;
      ctx.fill();
      ctx.restore();

      // B. Bright Principal Maxima Vertical Slit Fringes on Screen
      orders.forEach((ord) => {
        const fringeX = centerX + ord.yMeters * pxPerMeter;
        const isSelected =
          state.selectedOrder === "all" || Number(state.selectedOrder) === ord.order;

        if (fringeX >= 15 && fringeX <= w - 15) {
          ctx.save();

          // Diffused Ambient Glow
          const fringeGlow = ctx.createRadialGradient(
            fringeX,
            apertureTopY + apertureHeight / 2,
            2,
            fringeX,
            apertureTopY + apertureHeight / 2,
            isSelected ? 18 : 10
          );
          fringeGlow.addColorStop(0, palette.rgba(isSelected ? 0.95 : 0.6));
          fringeGlow.addColorStop(0.5, palette.rgba(isSelected ? 0.4 : 0.2));
          fringeGlow.addColorStop(1, palette.rgba(0));
          ctx.fillStyle = fringeGlow;
          ctx.fillRect(
            fringeX - 25,
            apertureTopY,
            50,
            apertureHeight
          );

          // Central Sharp Core
          ctx.fillStyle = isSelected ? "#ffffff" : palette.hex;
          const coreWidth = ord.order === 0 ? 3.5 : 2.5;
          ctx.fillRect(
            fringeX - coreWidth / 2,
            apertureTopY + 5,
            coreWidth,
            apertureHeight - 10
          );

          // Order Tag Box
          ctx.fillStyle = isSelected ? "#00f0ff" : "#94a3b8";
          ctx.font = isSelected ? "bold 9px monospace" : "8px monospace";
          ctx.fillText(`m=${ord.order >= 0 ? "+" : ""}${ord.order}`, fringeX, apertureTopY - 6);

          ctx.restore();
        }
      });
    }

    // Top Header Readout on Frontal Screen
    ctx.textAlign = "left";
    ctx.font = "9px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("DETECTOR SCREEN VIEW", 14, 16);
    ctx.font = "8px monospace";
    ctx.fillStyle = "#00f0ff";
    ctx.fillText("DIFFRACTION PATTERN & SPECTRAL MAXIMA", w - 210, 16);
      } catch (err) {
      console.warn("renderScreenFrontal error:", err);
    }
  }

  function renderAll() {
    calculatePhysics();
    renderBench();
    renderScreenFrontal();
    updateTelemetryDom();
  }

  // Animation Loop for live beam shimmer
  function startAnimationLoop() {
    function loop() {
      pulsePhase += 0.05;
      renderBench();
      renderScreenFrontal();
      animFrameId = requestAnimationFrame(loop);
    }
    if (!animFrameId) {
      animFrameId = requestAnimationFrame(loop);
    }
  }

  function stopAnimationLoop() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  // ==========================================
  // DOM UPDATES: Telemetry, Values & Badges
  // ==========================================
  function updateTelemetryDom() {
    const wl = getEffectiveWavelength();
    const palette = getWavelengthColor(wl);

    // Color chips & indicator
    const chip = document.getElementById("dg-color-chip");
    if (chip) {
      chip.style.backgroundColor = palette.hex;
      chip.style.boxShadow = `0 0 10px ${palette.hex}`;
    }

    // Wavelength values
    const wlVal = document.getElementById("dg-wl-val");
    if (wlVal) wlVal.textContent = `${wl} nm`;
    const wlSlider = document.getElementById("dg-wl-slider");
    if (wlSlider && !state.isMysteryMode) wlSlider.value = wl;

    // Grating density values
    const densityVal = document.getElementById("dg-density-val");
    if (densityVal) densityVal.textContent = `${state.gratingDensityLpMm} lines/mm`;
    const densitySlider = document.getElementById("dg-density-slider");
    if (densitySlider) densitySlider.value = state.gratingDensityLpMm;

    // Grating spacing (d = 1/N)
    const spacingVal = document.getElementById("dg-spacing-val");
    if (spacingVal) {
      const dMicrons = state.gratingSpacingD * 1e6;
      spacingVal.textContent = `${dMicrons.toFixed(3)} μm`;
    }

    // Screen distance (L)
    const distVal = document.getElementById("dg-dist-val");
    if (distVal) distVal.textContent = `${state.screenDistanceM.toFixed(2)} m`;
    const distSlider = document.getElementById("dg-dist-slider");
    if (distSlider) distSlider.value = state.screenDistanceM;

    // Selected order
    const orderVal = document.getElementById("dg-order-val");
    if (orderVal) {
      orderVal.textContent =
        state.selectedOrder === "all"
          ? "All Orders"
          : `m = ${Number(state.selectedOrder) >= 0 ? "+" : ""}${state.selectedOrder}`;
    }

    // Max Observable Order
    const maxOrderVal = document.getElementById("dg-max-order-val");
    if (maxOrderVal) maxOrderVal.textContent = `m_max = ±${state.maxObservableOrder}`;

    // Diffraction angle (theta)
    const angleVal = document.getElementById("dg-angle-val");
    if (angleVal) {
      angleVal.textContent = `${Math.abs(state.currentAngleDeg).toFixed(2)}° (${Math.abs(state.currentAngleRad).toFixed(3)} rad)`;
    }

    // Linear Fringe position (y)
    const fringeVal = document.getElementById("dg-fringe-val");
    if (fringeVal) {
      fringeVal.textContent = `${Math.abs(state.currentFringePositionCm).toFixed(2)} cm`;
    }

    // Angular Dispersion
    const dispVal = document.getElementById("dg-dispersion-val");
    if (dispVal) {
      dispVal.textContent = `${state.currentDispersion.toFixed(3)} rad/μm`;
    }

    // Power buttons
    const btnLaser = document.getElementById("dg-btn-toggle-laser");
    if (btnLaser) {
      if (state.laserActive) {
        btnLaser.classList.add("active");
        btnLaser.textContent = "Laser ON";
      } else {
        btnLaser.classList.remove("active");
        btnLaser.textContent = "Laser OFF";
      }
    }

    // Check challenge completions dynamically
    checkChallenges();
  }

  // ==========================================
  // CHALLENGES ENGINE & CRITERIA EVALUATION
  // ==========================================
  function checkChallenges() {
    const wl = getEffectiveWavelength();
    const N = state.gratingDensityLpMm;
    const m = state.selectedOrder === "all" ? 1 : Number(state.selectedOrder);
    const angle = Math.abs(state.currentAngleDeg);

    // Challenge 1: First-Order Calibration (wl ~ 633nm, N = 600 lines/mm, m = 1, theta ~ 22.3 deg)
    if (
      !state.challenges.firstOrder.completed &&
      Math.abs(wl - 633) <= 5 &&
      N === 600 &&
      Math.abs(m) === 1 &&
      Math.abs(angle - 22.3) <= 0.8
    ) {
      completeChallenge("firstOrder", {
        challengeId: "diffraction.firstOrder",
        title: "First-Order Diffraction Calibrated",
        xp: state.challenges.firstOrder.xp,
        badgeId: "badge-diffraction-calibrator",
        badgeTitle: "First-Order Spectroscopist"
      });
    }

    // Challenge 2: High-Density Grating (N = 1000 lines/mm, wl = 532nm, angle ~ 32.1 deg)
    if (
      !state.challenges.highDensity.completed &&
      Math.abs(wl - 532) <= 5 &&
      N === 1000 &&
      Math.abs(m) === 1 &&
      Math.abs(angle - 32.1) <= 1.0
    ) {
      completeChallenge("highDensity", {
        challengeId: "diffraction.highDensity",
        title: "High-Density Grating Dispersion Verified",
        xp: state.challenges.highDensity.xp,
        badgeId: "badge-high-dispersion",
        badgeTitle: "Dispersion Explorer"
      });
    }

    // Challenge 3: Second-Order Analysis (wl = 450nm, N = 600 lines/mm, m = 2, angle ~ 32.7 deg)
    if (
      !state.challenges.secondOrder.completed &&
      Math.abs(wl - 450) <= 5 &&
      N === 600 &&
      Math.abs(m) === 2
    ) {
      completeChallenge("secondOrder", {
        challengeId: "diffraction.secondOrder",
        title: "Second-Order Principal Maximum Resolved",
        xp: state.challenges.secondOrder.xp,
        badgeId: "badge-second-order",
        badgeTitle: "Second-Order Master"
      });
    }
  }

  function completeChallenge(key, challengeData) {
    if (state.challenges[key]?.completed) return;
    state.challenges[key].completed = true;

    saveChallengesToStorage();
    renderChallengesDom();

    if (typeof onChallengeCompleted === "function") {
      onChallengeCompleted(challengeData);
    } else if (typeof onXpAwarded === "function") {
      onXpAwarded(challengeData.xp, challengeData.title);
      if (typeof showToast === "function") {
        showToast(`Challenge Completed: ${challengeData.title} (+${challengeData.xp} XP)`);
      }
    }
  }

  function renderChallengesDom() {
    const listEl = document.getElementById("dg-challenges-list");
    if (!listEl) return;

    const cards = [
      {
        key: "firstOrder",
        title: "Challenge 1 — First-Order Maxima Calibration",
        desc: "Set He-Ne laser (λ ≈ 633 nm) & grating to 600 lines/mm. Obtain the first-order diffraction angle (θ ≈ 22.3°).",
        xp: state.challenges.firstOrder.xp,
        completed: state.challenges.firstOrder.completed
      },
      {
        key: "highDensity",
        title: "Challenge 2 — High-Density Grating Dispersion",
        desc: "Set Green laser (λ = 532 nm) & increase grating density to 1000 lines/mm. Observe the wide dispersion angle (θ ≈ 32.1°).",
        xp: state.challenges.highDensity.xp,
        completed: state.challenges.highDensity.completed
      },
      {
        key: "secondOrder",
        title: "Challenge 3 — Second-Order Spectral Analysis",
        desc: "Set Blue laser (λ = 450 nm) with 600 lines/mm grating and resolve the second-order principal maximum (m = ±2).",
        xp: state.challenges.secondOrder.xp,
        completed: state.challenges.secondOrder.completed
      },
      {
        key: "wavelengthShift",
        title: "Challenge 4 — Unknown Laser Identification",
        desc: "Switch to Mystery Tube mode, calculate the emission wavelength using the grating equation d sin θ = mλ, and identify the gas line.",
        xp: state.challenges.wavelengthShift.xp,
        completed: state.challenges.wavelengthShift.completed
      },
      {
        key: "spectroscopyMaster",
        title: "Challenge 5 — Precision Spectroscopy Virtuoso",
        desc: "Record at least 4 scientific observation trials across diverse orders and wavelengths with < 1% experimental deviation.",
        xp: state.challenges.spectroscopyMaster.xp,
        completed: state.challenges.spectroscopyMaster.completed
      }
    ];

    listEl.innerHTML = cards
      .map(
        (c) => `
        <div class="dg-challenge-card ${c.completed ? "completed" : ""}" data-key="${c.key}">
          <div class="challenge-status-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              ${
                c.completed
                  ? '<polyline points="20 6 9 17 4 12"></polyline>'
                  : '<circle cx="12" cy="12" r="9"></circle><polyline points="12 6 12 12 14 14"></polyline>'
              }
            </svg>
          </div>
          <div class="challenge-info">
            <div class="challenge-title-bar">
              <h4>${c.title}</h4>
              <span class="challenge-xp-badge">+${c.xp} XP</span>
            </div>
            <p>${c.desc}</p>
          </div>
        </div>
      `
      )
      .join("");
  }

  function hydrateChallenges(completedIds) {
    if (!Array.isArray(completedIds)) return;
    const set = new Set(completedIds);
    let changed = false;

    if (set.has("diffraction.firstOrder") && !state.challenges.firstOrder.completed) {
      state.challenges.firstOrder.completed = true;
      changed = true;
    }
    if (set.has("diffraction.highDensity") && !state.challenges.highDensity.completed) {
      state.challenges.highDensity.completed = true;
      changed = true;
    }
    if (set.has("diffraction.secondOrder") && !state.challenges.secondOrder.completed) {
      state.challenges.secondOrder.completed = true;
      changed = true;
    }
    if (set.has("diffraction.wavelengthShift") && !state.challenges.wavelengthShift.completed) {
      state.challenges.wavelengthShift.completed = true;
      changed = true;
    }
    if (set.has("diffraction.spectroscopyMaster") && !state.challenges.spectroscopyMaster.completed) {
      state.challenges.spectroscopyMaster.completed = true;
      changed = true;
    }

    if (changed) {
      saveChallengesToStorage();
      renderChallengesDom();
    }
  }

  function saveChallengesToStorage() {
    try {
      localStorage.setItem("physix_dg_challenges", JSON.stringify(state.challenges));
    } catch (e) {}
  }

  function loadChallengesFromStorage() {
    try {
      const saved = localStorage.getItem("physix_dg_challenges");
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.keys(parsed).forEach((k) => {
          if (state.challenges[k]) {
            state.challenges[k].completed = parsed[k].completed;
          }
        });
      }
    } catch (e) {}
  }

  // ==========================================
  // OBSERVATION LOGBOOK WORKSTATION
  // ==========================================
  function recordObservation() {
    if (!state.powerOn || !state.laserActive) {
      if (typeof showToast === "function") {
        showToast("Activate the laser source before recording observations!");
      }
      return;
    }

    const wlTrue = getEffectiveWavelength();
    const N = state.gratingDensityLpMm;
    const d = state.gratingSpacingD;
    const m = state.selectedOrder === "all" ? 1 : Number(state.selectedOrder);
    const thetaDeg = Math.abs(state.currentAngleDeg);
    const thetaRad = Math.abs(state.currentAngleRad);
    const L = state.screenDistanceM;
    const yCm = Math.abs(state.currentFringePositionCm);

    // Calculated wavelength from grating formula: lambda_calc = (d * sin(theta)) / m
    let calculatedWlNm = 0;
    let errorPct = 0;

    if (m !== 0) {
      const calcMeters = (d * Math.sin(thetaRad)) / Math.abs(m);
      calculatedWlNm = calcMeters * 1e9;
      errorPct = Math.abs((calculatedWlNm - wlTrue) / wlTrue) * 100;
    } else {
      calculatedWlNm = wlTrue;
      errorPct = 0;
    }

    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];

    const obsEntry = {
      id: Date.now(),
      run: state.observations.length + 1,
      wavelengthNominal: wlTrue,
      densityLpMm: N,
      spacingMicrons: Number((d * 1e6).toFixed(3)),
      order: m,
      angleDeg: Number(thetaDeg.toFixed(2)),
      distanceL: Number(L.toFixed(2)),
      fringePositionCm: Number(yCm.toFixed(2)),
      wavelengthCalculated: Number(calculatedWlNm.toFixed(1)),
      errorPct: Number(errorPct.toFixed(2)),
      time: timeStr
    };

    state.observations.unshift(obsEntry);
    saveObservationsToStorage();
    renderObservationsTable();

    if (typeof showToast === "function") {
      showToast(`Trial #${obsEntry.run} Logged: λ_calc = ${obsEntry.wavelengthCalculated} nm (Dev: ${obsEntry.errorPct}%)`);
    }

    // Check Spectroscopy Master challenge (>= 4 records with < 1% error)
    if (!state.challenges.spectroscopyMaster.completed) {
      const accurateTrials = state.observations.filter((o) => o.errorPct <= 1.0 && o.order !== 0);
      if (accurateTrials.length >= state.challenges.spectroscopyMaster.requiredLogs) {
        completeChallenge("spectroscopyMaster", {
          challengeId: "diffraction.spectroscopyMaster",
          title: "Precision Spectroscopy Virtuoso",
          xp: state.challenges.spectroscopyMaster.xp,
          badgeId: "badge-diffraction-master",
          badgeTitle: "Diffraction Spectroscopist"
        });
      }
    }

    // Award general exploration telemetry
    if (typeof onExperimentRecorded === "function") {
      onExperimentRecorded("diffraction-grating", {
        type: "observation",
        wavelength: wlTrue,
        density: N,
        trials: state.observations.length
      });
    }
  }

  function renderObservationsTable() {
    const tbody = document.getElementById("dg-obs-tbody");
    const emptyState = document.getElementById("dg-obs-empty");
    const tableEl = document.getElementById("dg-obs-table");
    const countBadge = document.getElementById("dg-obs-count-badge");

    if (countBadge) {
      countBadge.textContent = `${state.observations.length} Trial${state.observations.length === 1 ? "" : "s"}`;
    }

    if (!tbody) return;

    if (state.observations.length === 0) {
      if (emptyState) emptyState.classList.remove("hidden");
      if (tableEl) tableEl.classList.add("hidden");
      tbody.innerHTML = "";
      return;
    }

    if (emptyState) emptyState.classList.add("hidden");
    if (tableEl) tableEl.classList.remove("hidden");

    tbody.innerHTML = state.observations
      .map(
        (obs, idx) => `
        <tr class="${idx === 0 ? "obs-row-highlight" : ""}">
          <td class="obs-run-num">#${obs.run}</td>
          <td>${obs.wavelengthNominal} nm</td>
          <td>${obs.densityLpMm} /mm</td>
          <td>${obs.spacingMicrons} μm</td>
          <td style="color:#00f0ff; font-weight:700;">m = ${obs.order >= 0 ? "+" : ""}${obs.order}</td>
          <td style="color:#c084fc;">${obs.angleDeg}°</td>
          <td>${obs.distanceL} m</td>
          <td style="color:#38bdf8;">${obs.fringePositionCm} cm</td>
          <td style="color:#10b981; font-weight:700;">${obs.wavelengthCalculated} nm</td>
          <td style="color:${obs.errorPct < 1 ? "#34d399" : "#fbbf24"};">${obs.errorPct}%</td>
          <td style="color:#94a3b8; font-size:11px;">${obs.time}</td>
          <td style="text-align:center;">
            <button type="button" class="btn-delete-obs" data-del-dg-obs="${idx}" title="Delete Record">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px; height:14px;">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </td>
        </tr>
      `
      )
      .join("");

    // Delete single observation listener
    tbody.querySelectorAll("[data-del-dg-obs]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = Number(btn.getAttribute("data-del-dg-obs"));
        if (!isNaN(idx) && state.observations[idx]) {
          state.observations.splice(idx, 1);
          // renumber runs
          state.observations.forEach((o, i) => {
            o.run = state.observations.length - i;
          });
          saveObservationsToStorage();
          renderObservationsTable();
        }
      });
    });
  }

  function clearObservations() {
    if (state.observations.length === 0) return;
    state.observations = [];
    saveObservationsToStorage();
    renderObservationsTable();
    if (typeof showToast === "function") {
      showToast("Cleared Diffraction Grating observation logbook.");
    }
  }

  function saveObservationsToStorage() {
    try {
      localStorage.setItem("physix_dg_observations", JSON.stringify(state.observations));
    } catch (e) {}
  }

  function loadObservationsFromStorage() {
    try {
      const saved = localStorage.getItem("physix_dg_observations");
      if (saved) {
        state.observations = JSON.parse(saved);
      }
    } catch (e) {}
  }

  // ==========================================
  // EXPORT FUNCTIONS: CSV & PDF REPORT
  // ==========================================
  function exportObservationsCsv() {
    if (state.observations.length === 0) {
      if (typeof showToast === "function") {
        showToast("No observation records to export!");
      }
      return;
    }

    const headers = [
      "Trial #",
      "Nominal Wavelength (nm)",
      "Grating Density (lines/mm)",
      "Grating Spacing d (um)",
      "Diffraction Order m",
      "Diffraction Angle theta (deg)",
      "Screen Distance L (m)",
      "Fringe Distance y (cm)",
      "Calculated Wavelength (nm)",
      "Error Percentage (%)",
      "Timestamp"
    ];

    const rows = state.observations.map((o) => [
      o.run,
      o.wavelengthNominal,
      o.densityLpMm,
      o.spacingMicrons,
      o.order,
      o.angleDeg,
      o.distanceL,
      o.fringePositionCm,
      o.wavelengthCalculated,
      o.errorPct,
      o.time
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PhysiX_Diffraction_Grating_Observations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (typeof showToast === "function") {
      showToast("Exported observation records to CSV successfully.");
    }
  }

  function exportObservationsPdf() {
    if (state.observations.length === 0) {
      if (typeof showToast === "function") {
        showToast("No observation records available to export report!");
      }
      return;
    }

    const columns = [
      { header: "Trial", dataKey: "run" },
      { header: "Nominal λ", dataKey: "nominal" },
      { header: "Lines/mm", dataKey: "density" },
      { header: "d (μm)", dataKey: "spacing" },
      { header: "Order m", dataKey: "order" },
      { header: "θ (deg)", dataKey: "angle" },
      { header: "L (m)", dataKey: "dist" },
      { header: "y (cm)", dataKey: "fringe" },
      { header: "Calc λ (nm)", dataKey: "calc" },
      { header: "Error %", dataKey: "error" }
    ];

    const rows = state.observations.map((o) => ({
      run: `#${o.run}`,
      nominal: `${o.wavelengthNominal} nm`,
      density: `${o.densityLpMm}`,
      spacing: `${o.spacingMicrons}`,
      order: `${o.order >= 0 ? "+" : ""}${o.order}`,
      angle: `${o.angleDeg}°`,
      dist: `${o.distanceL}`,
      fringe: `${o.fringePositionCm}`,
      calc: `${o.wavelengthCalculated} nm`,
      error: `${o.errorPct}%`
    }));

    // Average computed wavelength
    const validTrials = state.observations.filter((o) => o.order !== 0);
    const avgWl =
      validTrials.length > 0
        ? validTrials.reduce((sum, o) => sum + o.wavelengthCalculated, 0) / validTrials.length
        : state.wavelengthNm;

    const btn = document.getElementById("dg-btn-export-pdf");
    if (btn && btn.disabled) return;
    if (btn) {
      btn.disabled = true;
      btn.setAttribute("data-orig-html", btn.innerHTML);
      btn.innerHTML = `<span>Generating Report...</span>`;
    }

    const profile = (typeof getStoredUserProfile === "function") ? getStoredUserProfile() : {};
    const studentName = (profile?.name || "").trim() || "Guest Student";
    const collegeName = (profile?.college || profile?.occ || "").trim() || "---";
    const studentEmail = profile?.email || "guest@physix.lab";
    const studentRole = profile?.edu || "Student Researcher";

    try {
      generateLabReportPdf({
        labTitle: "Diffraction Grating Wave Optics Telemetry Logbook",
        labSubtitle: "Determination of Wavelength & Angular Dispersion Analysis",
        experimentCode: "EXP-05-DIFFRACTION",
        studentName,
        collegeName,
        studentEmail,
        studentRole,
        aimText:
          "To study the diffraction of monochromatic light through a diffraction grating, observe the formation of principal maxima for different orders, and verify the grating equation d sin theta = m*lambda.",
        apparatusList:
          "Tunable Monochromatic Laser Source, Transmission Diffraction Grating (300-1200 lines/mm), High-Precision Calibrated Optical Rail, Linear Scale Observation Screen.",
        kpis: [
          { label: "Mean Computed Wavelength", value: `${avgWl.toFixed(1)} nm` },
          { label: "Active Grating Spacing (d)", value: `${(state.gratingSpacingD * 1e6).toFixed(3)} um` },
          { label: "Max Observable Order", value: `m = +/- ${state.maxObservableOrder}` },
          { label: "Total Recorded Trials", value: `${state.observations.length}` }
        ],
        columns,
        rows,
        conclusionText:
          "The experimental observations conclusively substantiate the grating equation d sin theta = m*lambda. Angular dispersion increases proportionally with line density and diffraction order while maintaining strict spatial symmetry."
      });

      if (typeof showToast === "function") {
        showToast("Diffraction Grating PDF Report exported successfully!");
      }
      if (btn) btn.innerHTML = `<span>Report Exported!</span>`;
    } catch (err) {
      console.error("[Diffraction Grating] PDF Export error:", err);
      if (typeof showToast === "function") {
        showToast("Error generating PDF report.");
      }
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
  // EVENT LISTENERS & HARDWARE CONTROLS
  // ==========================================
  
  /**
   * Tactile Audio Feedback Synthesizer for Realistic Optical Console
   */
  function playTactileClick(freq = 950, duration = 0.035) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!window._dgAudioCtx) {
        window._dgAudioCtx = new AudioCtx();
      }
      const actx = window._dgAudioCtx;
      if (actx.state === "suspended") actx.resume();
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, actx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, actx.currentTime + duration);
      gain.gain.setValueAtTime(0.18, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + duration);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + duration + 0.01);
    } catch (e) {}
  }

  function bindDomEvents() {
    // Tactile audio feedback for realistic concave buttons and knurled sliders
    const dgButtons = document.querySelectorAll(
      ".dg-concave-btn, .dg-wl-preset-btn, .dg-density-preset-btn, .dg-order-select-btn, .dg-action-buttons button, .dg-mystery-btn, .dg-mystery-submit-btn, .obs-actions-group button"
    );
    dgButtons.forEach((btn) => {
      btn.addEventListener("pointerdown", () => playTactileClick(950, 0.035));
    });

    let lastSliderTick = 0;
    const dgSliders = document.querySelectorAll("#dg-wl-slider, #dg-density-slider, #dg-dist-slider");
    dgSliders.forEach((slider) => {
      slider.addEventListener("input", () => {
        const now = performance.now();
        if (now - lastSliderTick > 45) {
          lastSliderTick = now;
          playTactileClick(1350, 0.018);
        }
      });
    });

    // Canvas bindings
    benchCanvas = document.getElementById("dg-bench-canvas");
    screenCanvas = document.getElementById("dg-screen-canvas");

    if (benchCanvas) {
      benchCtx = setupHiDPI(benchCanvas, BENCH_LOGICAL_W, BENCH_LOGICAL_H);
    }
    if (screenCanvas) {
      screenCtx = setupHiDPI(screenCanvas, SCREEN_LOGICAL_W, SCREEN_LOGICAL_H);
    }

    // Wavelength slider
    const wlSlider = document.getElementById("dg-wl-slider");
    wlSlider?.addEventListener("input", (e) => {
      state.wavelengthNm = Number(e.target.value);
      state.isMysteryMode = false;
      renderAll();
    });

    // Quick Wavelength Presets
    document.querySelectorAll(".dg-wl-preset-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = Number(btn.getAttribute("data-wl"));
        if (!isNaN(val)) {
          state.wavelengthNm = val;
          state.isMysteryMode = false;
          renderAll();
        }
      });
    });

    // Grating Density slider
    const densitySlider = document.getElementById("dg-density-slider");
    densitySlider?.addEventListener("input", (e) => {
      state.gratingDensityLpMm = Number(e.target.value);
      renderAll();
    });

    // Quick Density Presets
    document.querySelectorAll(".dg-density-preset-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = Number(btn.getAttribute("data-density"));
        if (!isNaN(val)) {
          state.gratingDensityLpMm = val;
          renderAll();
        }
      });
    });

    // Screen Distance slider
    const distSlider = document.getElementById("dg-dist-slider");
    distSlider?.addEventListener("input", (e) => {
      state.screenDistanceM = Number(e.target.value);
      renderAll();
    });

    // Order Selector buttons
    document.querySelectorAll(".dg-order-select-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".dg-order-select-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const orderAttr = btn.getAttribute("data-order");
        state.selectedOrder = orderAttr === "all" ? "all" : Number(orderAttr);
        renderAll();
      });
    });

    // Laser Toggle button
    const btnLaser = document.getElementById("dg-btn-toggle-laser");
    btnLaser?.addEventListener("click", () => {
      state.laserActive = !state.laserActive;
      renderAll();
      if (typeof showToast === "function") {
        showToast(state.laserActive ? "Laser Source Activated" : "Laser Source Deactivated");
      }
    });

    // Reset button
    const btnReset = document.getElementById("dg-btn-reset");
    btnReset?.addEventListener("click", () => {
      state.wavelengthNm = 550;
      state.gratingDensityLpMm = 600;
      state.screenDistanceM = 1.00;
      state.selectedOrder = 1;
      state.isMysteryMode = false;
      document.querySelectorAll(".dg-order-select-btn").forEach((b) => {
        b.classList.toggle("active", b.getAttribute("data-order") === "1");
      });
      renderAll();
      if (typeof showToast === "function") {
        showToast("Diffraction Grating Apparatus calibrated to default specifications.");
      }
    });

    // Mystery Tube Challenge button
    const btnMystery = document.getElementById("dg-btn-start-mystery");
    btnMystery?.addEventListener("click", () => {
      state.isMysteryMode = true;
      const keys = Object.keys(state.mysterySpecimens);
      state.mysterySpecimenId = keys[Math.floor(Math.random() * keys.length)];
      renderAll();
      if (typeof showToast === "function") {
        showToast(`Mystery Gas Tube Installed (${state.mysterySpecimens[state.mysterySpecimenId].name}). Calculate λ to identify!`);
      }
    });

    // Mystery Guess Form submit
    const btnSubmitGuess = document.getElementById("dg-btn-submit-guess");
    btnSubmitGuess?.addEventListener("click", () => {
      const input = document.getElementById("dg-mystery-guess-input");
      const guess = Number(input?.value);
      if (!guess || isNaN(guess)) {
        if (typeof showToast === "function") showToast("Enter a valid calculated wavelength in nm!");
        return;
      }
      const trueWl = state.mysterySpecimens[state.mysterySpecimenId].trueWavelengthNm;
      const dev = Math.abs(guess - trueWl);

      if (dev <= 15) {
        completeChallenge("wavelengthShift", {
          challengeId: "diffraction.wavelengthShift",
          title: "Unknown Laser Wavelength Identified",
          xp: state.challenges.wavelengthShift.xp,
          badgeId: "badge-spectroscopy-sleuth",
          badgeTitle: "Spectroscopy Sleuth"
        });
        if (typeof showToast === "function") {
          showToast(`Spectacular! Target was ${trueWl} nm. Your calculation: ${guess} nm (Error: ${((dev/trueWl)*100).toFixed(1)}%).`);
        }
        state.isMysteryMode = false;
        renderAll();
      } else {
        if (typeof showToast === "function") {
          showToast(`Recalibrate: Calculated ${guess} nm deviates from true spectral line by ${dev.toFixed(1)} nm. Try again!`);
        }
      }
    });

    // Observations Actions
    document.getElementById("dg-btn-record")?.addEventListener("click", recordObservation);
    document.getElementById("dg-btn-clear-obs")?.addEventListener("click", clearObservations);
    document.getElementById("dg-btn-export-csv")?.addEventListener("click", exportObservationsCsv);
    document.getElementById("dg-btn-export-pdf")?.addEventListener("click", exportObservationsPdf);

    // Results Modal
    document.getElementById("dg-btn-view-results")?.addEventListener("click", () => {
      const modal = document.getElementById("dg-results-modal");
      if (modal) modal.classList.remove("hidden");
    });
    document.getElementById("dg-btn-close-results")?.addEventListener("click", () => {
      const modal = document.getElementById("dg-results-modal");
      if (modal) modal.classList.add("hidden");
    });

    // Click on Screen Canvas to pick an order
    screenCanvas?.addEventListener("click", (e) => {
      const rect = screenCanvas.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * SCREEN_LOGICAL_W;
      const centerX = SCREEN_LOGICAL_W / 2;
      const pxPerMeter = 320;
      const orders = getOrdersList();

      let closestOrder = null;
      let closestDist = 24;

      orders.forEach((ord) => {
        const fringeX = centerX + ord.yMeters * pxPerMeter;
        const d = Math.abs(clickX - fringeX);
        if (d < closestDist) {
          closestDist = d;
          closestOrder = ord.order;
        }
      });

      if (closestOrder !== null) {
        state.selectedOrder = closestOrder;
        document.querySelectorAll(".dg-order-select-btn").forEach((b) => {
          b.classList.toggle("active", b.getAttribute("data-order") === String(closestOrder));
        });
        renderAll();
      }
    });

    // Window resize handler
    window.addEventListener("resize", () => {
      if (benchCanvas) benchCtx = setupHiDPI(benchCanvas, BENCH_LOGICAL_W, BENCH_LOGICAL_H);
      if (screenCanvas) screenCtx = setupHiDPI(screenCanvas, SCREEN_LOGICAL_W, SCREEN_LOGICAL_H);
      renderAll();
    });
  }

  // Lifecycle Interface
  function init() {
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
    hydrateChallenges,
    getState: () => state,
    setWavelength: (wl) => {
      state.wavelengthNm = wl;
      renderAll();
    },
    setGratingDensity: (n) => {
      state.gratingDensityLpMm = n;
      renderAll();
    },
    setScreenDistance: (L) => {
      state.screenDistanceM = L;
      renderAll();
    },
    setOrder: (m) => {
      state.selectedOrder = m;
      renderAll();
    },
    recordObservation,
    clearObservations
  };
}
