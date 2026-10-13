/**
 * PhysiX • Experiment 4: Hall Effect Virtual Laboratory
 * High-precision, gamified, interactive magnetotransport physics simulation.
 * Rigorous Lorentz force kinematics, carrier concentration determination,
 * Hall coefficient calculation, and dual-mode quantum lattice & characteristic graph engine.
 * 100% Zero Emojis compliant.
 */

import { api } from "./api.js";
import { generateLabReportPdf } from "./pdf-export.js";

export function createHallEffectExperiment(callbacks = {}) {
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

  // Calibrated Specimen Semiconductor & Metal Library
  const SPECIMENS = {
    "n-ge": {
      id: "n-ge",
      name: "n-type Germanium (Ge)",
      shortName: "n-Ge",
      material: "Germanium",
      carrierType: "Electrons (n-type)",
      carrierSign: -1,
      thicknessMm: 0.5, // 0.5 mm = 5e-4 m
      thicknessM: 0.0005,
      widthMm: 5.0,
      lengthMm: 10.0,
      hallCoeff: -3.80e-2, // m^3 / C (-3.80 x 10^-2)
      carrierDensity: 1.64e20, // m^-3
      resistivity: 0.098, // Ohm * m
      mobility: 0.388, // m^2 / (V * s)
      chipColor: "#38bdf8",
      accentGlow: "rgba(56, 189, 248, 0.4)",
      description: "Doped with group-V donors (Antimony). Electrons dominate transport with large negative Hall coefficient."
    },
    "p-ge": {
      id: "p-ge",
      name: "p-type Germanium (Ge)",
      shortName: "p-Ge",
      material: "Germanium",
      carrierType: "Holes (p-type)",
      carrierSign: 1,
      thicknessMm: 0.5,
      thicknessM: 0.0005,
      widthMm: 5.0,
      lengthMm: 10.0,
      hallCoeff: +3.25e-2, // m^3 / C (+3.25 x 10^-2)
      carrierDensity: 1.92e20, // m^-3
      resistivity: 0.171, // Ohm * m
      mobility: 0.190, // m^2 / (V * s)
      chipColor: "#f59e0b",
      accentGlow: "rgba(245, 158, 11, 0.4)",
      description: "Doped with group-III acceptors (Gallium). Positive valence-band holes dominate transport with positive Hall voltage."
    },
    "inas": {
      id: "inas",
      name: "n-type Indium Arsenide (InAs)",
      shortName: "n-InAs",
      material: "Indium Arsenide",
      carrierType: "High-Mobility Electrons",
      carrierSign: -1,
      thicknessMm: 0.1, // 0.1 mm = 1e-4 m
      thicknessM: 0.0001,
      widthMm: 4.0,
      lengthMm: 8.0,
      hallCoeff: -1.20e-1, // m^3 / C (-0.120)
      carrierDensity: 5.21e19, // m^-3
      resistivity: 0.043, // Ohm * m
      mobility: 2.79, // m^2 / (V * s)
      chipColor: "#a855f7",
      accentGlow: "rgba(168, 85, 247, 0.4)",
      description: "Narrow-gap III-V compound semiconductor with exceptionally high electron mobility and high Hall sensitivity."
    },
    "cu": {
      id: "cu",
      name: "Polycrystalline Copper Foil (Cu)",
      shortName: "Cu Foil",
      material: "Copper",
      carrierType: "Free Electrons (Metal)",
      carrierSign: -1,
      thicknessMm: 0.05, // 0.05 mm = 5e-5 m
      thicknessM: 0.00005,
      widthMm: 6.0,
      lengthMm: 12.0,
      hallCoeff: -5.45e-11, // m^3 / C
      carrierDensity: 1.14e29, // m^-3
      resistivity: 1.68e-8, // Ohm * m
      mobility: 0.0032, // m^2 / (V * s)
      chipColor: "#f97316",
      accentGlow: "rgba(249, 115, 22, 0.4)",
      description: "Pure metallic conductor with extremely dense carrier sea; generates microvolt-scale Hall potential."
    }
  };

  // Experiment State
  const state = {
    // Hardware Switches & Controls
    specimenPowerOn: true,
    magnetPowerOn: true,
    bPolarityNormal: true, // true = +B (North top/left), false = -B (Inverted)
    iPolarityForward: true, // true = +I (Left to right), false = -I (Right to left)

    // Current & Magnetic Field Values
    currentMa: 20.0, // 0 to 50 mA
    magneticFieldT: 0.40, // 0.0 to 0.80 Tesla (0 to 800 mT)
    offsetVoltageMv: 0.0, // Misalignment offset voltage (-2.0 to +2.0 mV)

    // Active Specimen
    currentSpecimenId: "n-ge",

    // Secondary Screen Display Mode: 'lattice' | 'graph'
    secondaryScreenMode: "graph",

    // Real-Time Computed Physics Readouts
    effectiveCurrentA: 0.02,
    effectiveFieldT: 0.40,
    hallVoltageMv: 0.0,
    measuredHallVoltageMv: 0.0, // includes offset
    evaluatedHallCoeff: 0.0,
    evaluatedCarrierDensity: 0.0,
    hallAngleDeg: 0.0,

    // Observations Table
    observations: [],

    // Mastery Challenges
    challenges: {
      carrierType: {
        completed: false,
        xp: 100,
        testedNGe: false,
        testedPGe: false,
        invertedPolarity: false
      },
      linearSweep: {
        completed: false,
        xp: 125,
        recordedFields: [] // field values logged at fixed current
      },
      carrierDensity: {
        completed: false,
        xp: 150,
        achievedAccurateDensity: false
      }
    }
  };

  // Canvas elements & contexts
  let benchCanvas = null;
  let benchCtx = null;
  let graphCanvas = null;
  let graphCtx = null;

  const BENCH_LOGICAL_W = 800;
  const BENCH_LOGICAL_H = 380;
  const GRAPH_LOGICAL_W = 380;
  const GRAPH_LOGICAL_H = 300;

  // Animation loop variables
  let animationFrameId = null;
  let simTime = 0;
  const carrierParticles = [];

  // Initialize carrier stream particles
  for (let i = 0; i < 48; i++) {
    carrierParticles.push({
      x: Math.random() * 220 + 290,
      y: Math.random() * 70 + 155,
      vx: (Math.random() * 0.4 + 0.8),
      vy: (Math.random() - 0.5) * 0.2,
      phase: Math.random() * Math.PI * 2,
      size: Math.random() * 1.5 + 2.5
    });
  }

  // Microscopic lattice particles for secondary view
  const latticeParticles = [];
  for (let i = 0; i < 24; i++) {
    latticeParticles.push({
      x: Math.random() * 320 + 30,
      y: Math.random() * 220 + 40,
      vx: (Math.random() - 0.5) * 1.8,
      vy: (Math.random() - 0.5) * 1.8,
      life: Math.random() * 100
    });
  }

  // Elementary charge constant e
  const Q_E = 1.602176634e-19;

  function calculatePhysics() {
    const spec = SPECIMENS[state.currentSpecimenId] || SPECIMENS["n-ge"];

    // Current in Amperes
    const curSign = state.iPolarityForward ? 1 : -1;
    const currentA = state.specimenPowerOn ? (state.currentMa / 1000.0) * curSign : 0.0;
    state.effectiveCurrentA = currentA;

    // Magnetic field in Tesla
    const magSign = state.bPolarityNormal ? 1 : -1;
    const fieldT = state.magnetPowerOn ? state.magneticFieldT * magSign : 0.0;
    state.effectiveFieldT = fieldT;

    // V_H = (R_H * I * B) / t
    // V_H in Volts:
    const vH_volts = (spec.hallCoeff * currentA * fieldT) / spec.thicknessM;

    // Convert to mV (or micro-volts for metal)
    if (spec.id === "cu") {
      state.hallVoltageMv = vH_volts * 1e6; // displayed in micro-volts for Cu
    } else {
      state.hallVoltageMv = vH_volts * 1e3; // displayed in mV for semiconductors
    }

    // Include offset potentiometer voltage (mV)
    const effectiveOffset = state.specimenPowerOn ? state.offsetVoltageMv : 0;
    state.measuredHallVoltageMv = state.hallVoltageMv + effectiveOffset;

    // Evaluated Hall coefficient from measured readings (with offset eliminated):
    if (Math.abs(currentA) > 1e-6 && Math.abs(fieldT) > 1e-4) {
      // R_H = (V_H * t) / (I * B)
      const measuredVolts = (state.measuredHallVoltageMv - effectiveOffset) * (spec.id === "cu" ? 1e-6 : 1e-3);
      state.evaluatedHallCoeff = (measuredVolts * spec.thicknessM) / (currentA * fieldT);
      state.evaluatedCarrierDensity = 1.0 / (Math.abs(state.evaluatedHallCoeff) * Q_E);
    } else {
      state.evaluatedHallCoeff = spec.hallCoeff;
      state.evaluatedCarrierDensity = spec.carrierDensity;
    }

    // Hall Angle theta_H = arctan(mu * B)
    state.hallAngleDeg = (Math.atan(spec.mobility * Math.abs(fieldT)) * 180) / Math.PI;
  }

  // Scientific notation formatter with clean exponents (e.g. 1.92 × 10²⁰ m⁻³)
  function formatScientificNotation(num, unit = "") {
    if (typeof num !== "number" || isNaN(num) || num === 0) {
      return "0" + (unit ? " " + unit : "");
    }
    const [mantissaStr, exponentStr] = num.toExponential().split("e");
    const exp = parseInt(exponentStr, 10);
    const mantissa = parseFloat(mantissaStr).toFixed(2);
    const superscripts = {
      "-": "⁻", "+": "⁺", "0": "⁰", "1": "¹", "2": "²", "3": "³",
      "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹"
    };
    const expSup = String(exp).split("").map((c) => superscripts[c] || c).join("");
    return `${mantissa} × 10${expSup}${unit ? " " + unit : ""}`;
  }

  function updateDomHud() {
    calculatePhysics();
    const spec = SPECIMENS[state.currentSpecimenId] || SPECIMENS["n-ge"];

    // Telemetry displays
    const vhValEl = document.getElementById("hall-hud-vh");
    const bValEl = document.getElementById("hall-hud-b");
    const rhValEl = document.getElementById("hall-hud-rh");
    const nValEl = document.getElementById("hall-hud-n");
    const subCarrierEl = document.getElementById("hall-hud-carrier-sub");
    const subRhEl = document.getElementById("hall-hud-rh-sub");

    // Status pill
    const statusPill = document.getElementById("hall-match-badge");
    if (statusPill) {
      if (!state.specimenPowerOn && !state.magnetPowerOn) {
        statusPill.className = "cs-status-pill pill-offline";
        statusPill.textContent = "Apparatus Offline";
      } else if (!state.specimenPowerOn) {
        statusPill.className = "cs-status-pill pill-offline";
        statusPill.textContent = "Current Supply OFF";
      } else if (!state.magnetPowerOn) {
        statusPill.className = "cs-status-pill pill-offline";
        statusPill.textContent = "Electromagnet OFF (B = 0)";
      } else {
        statusPill.className = "cs-status-pill pill-live";
        statusPill.textContent = "Active Hall Equilibrium";
      }
    }

    // Hall voltage readout
    if (vhValEl) {
      if (spec.id === "cu") {
        vhValEl.textContent = `${state.measuredHallVoltageMv >= 0 ? "+" : ""}${state.measuredHallVoltageMv.toFixed(2)} μV`;
      } else {
        vhValEl.textContent = `${state.measuredHallVoltageMv >= 0 ? "+" : ""}${state.measuredHallVoltageMv.toFixed(2)} mV`;
      }
    }

    // Magnetic field readout
    if (bValEl) {
      const polText = state.bPolarityNormal ? "(+B)" : "(-B)";
      bValEl.textContent = `${state.effectiveFieldT.toFixed(3)} T ${polText}`;
    }

    // Hall coefficient readout
    if (rhValEl) {
      if (spec.id === "cu") {
        rhValEl.textContent = `${state.evaluatedHallCoeff.toExponential(2)} m³/C`;
      } else {
        const rhScaled = (state.evaluatedHallCoeff * 1e2).toFixed(2);
        rhValEl.textContent = `${rhScaled} × 10⁻² m³/C`;
      }
    }

    if (subRhEl) {
      subRhEl.textContent = state.evaluatedHallCoeff < 0 ? "R_H < 0 (Electrons predominate)" : "R_H > 0 (Holes predominate)";
    }

    // Carrier density readout
    if (nValEl) {
      nValEl.textContent = formatScientificNotation(state.evaluatedCarrierDensity, "m⁻³");
    }

    if (subCarrierEl) {
      subCarrierEl.textContent = `Type: ${spec.carrierType}`;
    }

    // Controls indicators
    const currentValDisplay = document.getElementById("hall-current-val");
    if (currentValDisplay) {
      const signStr = state.iPolarityForward ? "+ " : "- ";
      currentValDisplay.textContent = `${signStr}${state.currentMa.toFixed(1)} mA`;
    }

    const fieldValDisplay = document.getElementById("hall-field-val");
    if (fieldValDisplay) {
      const signStr = state.bPolarityNormal ? "+ " : "- ";
      fieldValDisplay.textContent = `${signStr}${state.magneticFieldT.toFixed(2)} T (${(state.magneticFieldT * 1000).toFixed(0)} mT)`;
    }

    const offsetValDisplay = document.getElementById("hall-offset-val");
    if (offsetValDisplay) {
      offsetValDisplay.textContent = `${state.offsetVoltageMv >= 0 ? "+" : ""}${state.offsetVoltageMv.toFixed(2)} mV`;
    }

    // Update switch & concave LED visual states
    const ledSample = document.getElementById("hall-led-sample");
    const stateSample = document.getElementById("hall-state-sample");
    if (ledSample) {
      ledSample.className = `concave-led-dot led-amber ${state.specimenPowerOn ? "active" : ""}`;
    }
    if (stateSample) stateSample.textContent = state.specimenPowerOn ? "ON" : "OFF";

    const ledMagnet = document.getElementById("hall-led-magnet");
    const stateMagnet = document.getElementById("hall-state-magnet");
    if (ledMagnet) {
      ledMagnet.className = `concave-led-dot led-red ${state.magnetPowerOn ? "active" : ""}`;
    }
    if (stateMagnet) stateMagnet.textContent = state.magnetPowerOn ? "ON" : "OFF";

    const ledBPol = document.getElementById("hall-led-b-pol");
    if (ledBPol) {
      ledBPol.className = `concave-led-dot led-blue ${state.bPolarityNormal ? "active" : "inverted"}`;
    }
    const polBState = document.getElementById("hall-state-b-pol");
    if (polBState) polBState.textContent = state.bPolarityNormal ? "+B (NORM)" : "-B (REV)";

    const ledIPol = document.getElementById("hall-led-i-pol");
    if (ledIPol) {
      ledIPol.className = `concave-led-dot led-green ${state.iPolarityForward ? "active" : "inverted"}`;
    }
    const polIState = document.getElementById("hall-state-i-pol");
    if (polIState) polIState.textContent = state.iPolarityForward ? "+I (FWD)" : "-I (REV)";

    // Update specimen card badges in top bar
    const specHudBadge = document.getElementById("hall-specimen-hud-badge");
    if (specHudBadge) {
      specHudBadge.textContent = `${spec.name} • Thickness t = ${spec.thicknessMm} mm`;
    }

    // Update specimen chips
    document.querySelectorAll(".hall-specimen-chip").forEach((chip) => {
      if (chip.getAttribute("data-specimen") === state.currentSpecimenId) {
        chip.classList.add("active");
      } else {
        chip.classList.remove("active");
      }
    });

    // Update slider values
    const curSlider = document.getElementById("hall-slider-current");
    if (curSlider && Number(curSlider.value) !== state.currentMa) {
      curSlider.value = state.currentMa;
    }

    const fieldSlider = document.getElementById("hall-slider-field");
    if (fieldSlider && Number(fieldSlider.value) !== state.magneticFieldT) {
      fieldSlider.value = state.magneticFieldT;
    }

    const offsetSlider = document.getElementById("hall-slider-offset");
    if (offsetSlider && Number(offsetSlider.value) !== state.offsetVoltageMv) {
      offsetSlider.value = state.offsetVoltageMv;
    }
  }

  // -----------------------------------------------------------
  // Canvas 1: Main Electromagnetic Apparatus Viewport (Matching Reference Image)
  // -----------------------------------------------------------
  function renderBenchCanvas() {
    if (!benchCtx || !benchCanvas) return;
    const ctx = benchCtx;
    const w = BENCH_LOGICAL_W;
    const h = BENCH_LOGICAL_H;

    ctx.clearRect(0, 0, w, h);

    // 1. Heavy Industrial Textured Slate Faceplate Base
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, "#181a20");
    bgGrad.addColorStop(0.5, "#1f232b");
    bgGrad.addColorStop(1, "#14161c");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Chassis Outer Border Bezel
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, w - 8, h - 8);

    // Chassis Inner Plate with chamfer
    const innerX = 36;
    const innerY = 16;
    const innerW = w - 72;
    const innerH = h - 32;

    ctx.fillStyle = "#222630";
    ctx.fillRect(innerX, innerY, innerW, innerH);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.6)";
    ctx.lineWidth = 2;
    ctx.strokeRect(innerX, innerY, innerW, innerH);

    // Industrial Mounting Holes (left and right flanges)
    const drawHole = (hx, hy) => {
      ctx.fillStyle = "#0c0d11";
      ctx.beginPath();
      ctx.arc(hx, hy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    // 6 Mounting holes along left & right borders (matching reference image)
    drawHole(20, 30);
    drawHole(20, h / 2);
    drawHole(20, h - 30);
    drawHole(w - 20, 30);
    drawHole(w - 20, h / 2);
    drawHole(w - 20, h - 30);

    // Corner Machine Screws on Inner Plate
    const drawBolt = (bx, by) => {
      ctx.fillStyle = "#475569";
      ctx.beginPath();
      ctx.arc(bx, by, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.strokeStyle = "#0f172a";
      ctx.beginPath();
      ctx.moveTo(bx - 3, by);
      ctx.lineTo(bx + 3, by);
      ctx.stroke();
    };

    drawBolt(innerX + 14, innerY + 14);
    drawBolt(innerX + innerW - 14, innerY + 14);
    drawBolt(innerX + 14, innerY + innerH - 14);
    drawBolt(innerX + innerW - 14, innerY + innerH - 14);

    // Specimen & Field Properties
    const spec = SPECIMENS[state.currentSpecimenId] || SPECIMENS["n-ge"];
    const fieldMagnitude = state.magnetPowerOn ? state.magneticFieldT : 0;
    const isNormalB = state.bPolarityNormal;
    const isForwardI = state.iPolarityForward;

    // 2. Heavy Cast-Iron Electromagnet Yoke Base (Bottom Bar bridging coils)
    const yokeX = 130;
    const yokeY = 205;
    const yokeW = 540;
    const yokeH = 46;

    const yokeGrad = ctx.createLinearGradient(0, yokeY, 0, yokeY + yokeH);
    yokeGrad.addColorStop(0, "#2d3340");
    yokeGrad.addColorStop(0.3, "#3a4252");
    yokeGrad.addColorStop(0.7, "#242933");
    yokeGrad.addColorStop(1, "#181b22");
    ctx.fillStyle = yokeGrad;
    ctx.fillRect(yokeX, yokeY, yokeW, yokeH);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(yokeX, yokeY, yokeW, yokeH);

    // 3. Two Large Cylindrical Electromagnet Coils (Copper Windings)
    const leftCoilX = 145;
    const rightCoilX = 555;
    const coilW = 100;
    const coilH = 155;
    const coilY = 60;

    const drawRealisticCoil = (cx, cy, cw, ch, active) => {
      // Background core cylinder
      ctx.fillStyle = "#11141c";
      ctx.fillRect(cx, cy, cw, ch);

      // Multi-layer lustrous copper winding turns
      const turns = 28;
      const turnH = ch / turns;
      for (let i = 0; i < turns; i++) {
        const ty = cy + i * turnH;
        const copperGrad = ctx.createLinearGradient(cx, ty, cx + cw, ty);
        if (active && fieldMagnitude > 0) {
          copperGrad.addColorStop(0, "#92400e");
          copperGrad.addColorStop(0.2, "#d97706");
          copperGrad.addColorStop(0.5, "#fde68a"); // Bright specular glint
          copperGrad.addColorStop(0.8, "#b45309");
          copperGrad.addColorStop(1, "#78350f");
        } else {
          copperGrad.addColorStop(0, "#572b0c");
          copperGrad.addColorStop(0.3, "#92400e");
          copperGrad.addColorStop(0.6, "#b45309");
          copperGrad.addColorStop(1, "#451a03");
        }
        ctx.fillStyle = copperGrad;
        ctx.fillRect(cx, ty + 0.5, cw, turnH - 1);

        // Turn separator groove
        ctx.strokeStyle = "rgba(15, 23, 42, 0.75)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, ty);
        ctx.lineTo(cx + cw, ty);
        ctx.stroke();
      }

      // Top and Bottom Flange Collar Plates with mounting screws
      const drawFlange = (fy) => {
        const fGrad = ctx.createLinearGradient(0, fy, 0, fy + 10);
        fGrad.addColorStop(0, "#475569");
        fGrad.addColorStop(1, "#1e293b");
        ctx.fillStyle = fGrad;
        ctx.fillRect(cx - 8, fy, cw + 16, 10);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - 8, fy, cw + 16, 10);
        // Small corner screws on flange
        drawBolt(cx - 3, fy + 5);
        drawBolt(cx + cw + 3, fy + 5);
      };

      drawFlange(cy - 6);
      drawFlange(cy + ch - 4);

      // Active electromagnetic volumetric warmth glow
      if (active && fieldMagnitude > 0) {
        ctx.fillStyle = "rgba(245, 158, 11, 0.1)";
        ctx.fillRect(cx - 10, cy - 8, cw + 20, ch + 16);
      }
    };

    drawRealisticCoil(leftCoilX, coilY, coilW, coilH, state.magnetPowerOn);
    drawRealisticCoil(rightCoilX, coilY, coilW, coilH, state.magnetPowerOn);

    // 4. Heavy Machined Steel Pole Pieces projecting inward
    const poleY = 100;
    const poleH = 75;
    const poleW = 75;

    // Left Pole Piece: NORTH (N)
    const leftPoleX = 248;
    const leftPoleGrad = ctx.createLinearGradient(leftPoleX, poleY, leftPoleX + poleW, poleY + poleH);
    leftPoleGrad.addColorStop(0, "#475569");
    leftPoleGrad.addColorStop(0.5, "#64748b");
    leftPoleGrad.addColorStop(1, "#334155");
    ctx.fillStyle = leftPoleGrad;
    ctx.fillRect(leftPoleX, poleY, poleW, poleH);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(leftPoleX, poleY, poleW, poleH);

    // Right Pole Piece: SOUTH (S)
    const rightPoleX = 477;
    const rightPoleGrad = ctx.createLinearGradient(rightPoleX, poleY, rightPoleX + poleW, poleY + poleH);
    rightPoleGrad.addColorStop(0, "#475569");
    rightPoleGrad.addColorStop(0.5, "#64748b");
    rightPoleGrad.addColorStop(1, "#334155");
    ctx.fillStyle = rightPoleGrad;
    ctx.fillRect(rightPoleX, poleY, poleW, poleH);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(rightPoleX, poleY, poleW, poleH);

    // Pole labels engraved in metal (matching reference image)
    const leftPoleLabel = isNormalB ? "NORTH (N)" : "SOUTH (S)";
    const rightPoleLabel = isNormalB ? "SOUTH (S)" : "NORTH (N)";

    ctx.font = "800 10px -apple-system, sans-serif";
    ctx.fillStyle = "#f1f5f9";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 3;
    ctx.fillText(leftPoleLabel, leftPoleX + poleW / 2, poleY + poleH / 2 + 4);
    ctx.fillText(rightPoleLabel, rightPoleX + poleW / 2, poleY + poleH / 2 + 4);
    ctx.shadowBlur = 0;

    // 5. Magnetic Flux Lines Across the Air Gap (between leftPoleX + poleW and rightPoleX)
    const gapLeft = leftPoleX + poleW;
    const gapRight = rightPoleX;

    if (state.magnetPowerOn && fieldMagnitude > 0) {
      const lineCount = 7;
      const intensity = fieldMagnitude / 0.8;
      for (let i = 0; i < lineCount; i++) {
        const lineY = poleY + 12 + i * 8.5;
        const alpha = 0.25 + intensity * 0.55;

        ctx.strokeStyle = isNormalB ? `rgba(56, 189, 248, ${alpha})` : `rgba(244, 63, 94, ${alpha})`;
        ctx.lineWidth = 1.6;
        ctx.setLineDash([5, 4]);

        ctx.beginPath();
        ctx.moveTo(gapLeft, lineY);
        ctx.lineTo(gapRight, lineY);
        ctx.stroke();

        // Directional flow arrow animated along the line
        const arrowSpacing = 50;
        const offset = (simTime * 35 * (isNormalB ? 1 : -1)) % arrowSpacing;
        const arrowX = gapLeft + 25 + ((offset + arrowSpacing) % arrowSpacing);

        if (arrowX > gapLeft + 10 && arrowX < gapRight - 10) {
          ctx.fillStyle = isNormalB ? "#38bdf8" : "#f43f5e";
          ctx.beginPath();
          if (isNormalB) {
            ctx.moveTo(arrowX + 4, lineY);
            ctx.lineTo(arrowX - 4, lineY - 3);
            ctx.lineTo(arrowX - 4, lineY + 3);
          } else {
            ctx.moveTo(arrowX - 4, lineY);
            ctx.lineTo(arrowX + 4, lineY - 3);
            ctx.lineTo(arrowX + 4, lineY + 3);
          }
          ctx.fill();
        }
      }
      ctx.setLineDash([]);
    }

    // 6. Central Hall Probe PCB Card ("PHYSIX HALL PROBE" matching reference image)
    const pcbW = 110;
    const pcbH = 100;
    const pcbX = 400 - pcbW / 2;
    const poleCenterY = poleY + poleH / 2;
    const pcbY = poleCenterY - pcbH / 2;

    // Emerald Green FR4 PCB
    const pcbGrad = ctx.createLinearGradient(pcbX, pcbY, pcbX + pcbW, pcbY + pcbH);
    pcbGrad.addColorStop(0, "#047857");
    pcbGrad.addColorStop(0.5, "#065f46");
    pcbGrad.addColorStop(1, "#064e3b");
    ctx.fillStyle = pcbGrad;
    ctx.fillRect(pcbX, pcbY, pcbW, pcbH);
    ctx.strokeStyle = "rgba(52, 211, 153, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(pcbX, pcbY, pcbW, pcbH);

    // 4 Corner Gold Mounting Eyelets on PCB
    const drawEyelet = (ex, ey) => {
      ctx.fillStyle = "#eab308";
      ctx.beginPath();
      ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#022c22";
      ctx.beginPath();
      ctx.arc(ex, ey, 1.5, 0, Math.PI * 2);
      ctx.fill();
    };
    drawEyelet(pcbX + 6, pcbY + 6);
    drawEyelet(pcbX + pcbW - 6, pcbY + 6);
    drawEyelet(pcbX + 6, pcbY + pcbH - 6);
    drawEyelet(pcbX + pcbW - 6, pcbY + pcbH - 6);

    // Silkscreen Text on PCB
    ctx.font = "800 7.5px -apple-system, monospace";
    ctx.fillStyle = "#d1fae5";
    ctx.textAlign = "center";
    ctx.fillText("PHYSIX HALL PROBE", pcbX + pcbW / 2, pcbY + 16);

    // Specimen Wafer Window in Center
    const chipW = 66;
    const chipH = 50;
    const chipX = pcbX + (pcbW - chipW) / 2;
    const chipY = pcbY + 24;

    // Wafer Glass / Metallic Window
    ctx.fillStyle = "#0a0f1d";
    ctx.fillRect(chipX, chipY, chipW, chipH);

    const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
    chipGrad.addColorStop(0, spec.chipColor);
    chipGrad.addColorStop(1, "#0f172a");
    ctx.fillStyle = chipGrad;
    ctx.fillRect(chipX, chipY, chipW, chipH);
    ctx.strokeStyle = spec.chipColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(chipX, chipY, chipW, chipH);

    // Wafer Label: Material (e.g. n-Ge) & Thickness
    ctx.font = "800 10px monospace";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(spec.shortName, chipX + chipW / 2, chipY + 16);

    ctx.font = "7px monospace";
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.fillText(`t = ${spec.thicknessMm}mm`, pcbX + pcbW / 2, pcbY + pcbH - 6);

    // 7. Live Lorentz Deflected Charge Carriers Inside Wafer
    if (state.specimenPowerOn && state.currentMa > 0) {
      const isElectron = spec.carrierSign === -1;
      const driftDirection = isElectron ? (isForwardI ? -1 : 1) : (isForwardI ? 1 : -1);
      const currentSpeed = (state.currentMa / 20.0) * 1.4;

      let deflectionFactor = 0;
      if (state.magnetPowerOn && fieldMagnitude > 0) {
        deflectionFactor = driftDirection * (isNormalB ? 1 : -1) * spec.carrierSign * (fieldMagnitude / 0.8) * 1.5;
      }

      carrierParticles.forEach((p) => {
        if (p.x < chipX + 4) p.x = chipX + chipW - 6;
        if (p.x > chipX + chipW - 4) p.x = chipX + 6;

        p.x += driftDirection * currentSpeed * p.vx;
        const targetY = (chipY + chipH / 2) + (deflectionFactor * 16);
        p.y += (targetY - p.y) * 0.05;

        if (p.y < chipY + 5) p.y = chipY + 5;
        if (p.y > chipY + chipH - 5) p.y = chipY + chipH - 5;

        ctx.fillStyle = isElectron ? "#38bdf8" : "#f59e0b";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = "bold 6px monospace";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(isElectron ? "-" : "+", p.x, p.y + 2);
      });

      // Transverse Hall Electric Field arrow E_H
      if (Math.abs(state.hallVoltageMv) > 0.05) {
        const topPositive = state.measuredHallVoltageMv > 0;
        const midX = chipX + chipW / 2;

        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (topPositive) {
          ctx.moveTo(midX, chipY + 22);
          ctx.lineTo(midX, chipY + chipH - 6);
        } else {
          ctx.moveTo(midX, chipY + chipH - 6);
          ctx.lineTo(midX, chipY + 22);
        }
        ctx.stroke();

        ctx.font = "7.5px monospace";
        ctx.fillStyle = "#f8fafc";
        ctx.fillText("E_H", midX + 11, chipY + 34);
      }
    }

    // 8. 4 Realistic Terminal Lugs with Insulated Flex Wires (Matching Reference Image)
    // Metallic solder lugs on PCB
    const drawLug = (lx, ly, isVertical) => {
      ctx.fillStyle = "#e2e8f0";
      ctx.beginPath();
      ctx.arc(lx, ly, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3b82f6"; // Blue insulated crimp sleeve
      if (isVertical) {
        ctx.fillRect(lx - 2.5, ly - 5, 5, 10);
      } else {
        ctx.fillRect(lx - 5, ly - 2.5, 10, 5);
      }
    };

    // Left and Right current lugs
    drawLug(pcbX + 4, pcbY + pcbH / 2, false);
    drawLug(pcbX + pcbW - 4, pcbY + pcbH / 2, false);

    // Top and Bottom voltage lugs
    drawLug(pcbX + pcbW / 2 - 8, pcbY + 4, true);
    drawLug(pcbX + pcbW / 2 + 8, pcbY + 4, true);
    drawLug(pcbX + pcbW / 2, pcbY + pcbH - 4, true);

    // Realistic curved wire harness
    // Wire 1: Top Green Wire arching upward (Probe lead 1)
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pcbX + pcbW / 2 - 8, pcbY + 4);
    ctx.bezierCurveTo(pcbX + pcbW / 2 - 15, pcbY - 40, 360, 10, 370, 0);
    ctx.stroke();

    // Wire 2: Top Purple Wire arching upward (Probe lead 2)
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pcbX + pcbW / 2 + 8, pcbY + 4);
    ctx.bezierCurveTo(pcbX + pcbW / 2 + 15, pcbY - 40, 420, 10, 410, 0);
    ctx.stroke();

    // Wire 3: Left Current Lead (Green wire curving down)
    ctx.strokeStyle = state.specimenPowerOn ? "#10b981" : "#475569";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pcbX + 4, pcbY + pcbH / 2);
    ctx.bezierCurveTo(pcbX - 50, pcbY + 60, 240, 260, 230, 290);
    ctx.stroke();

    // Wire 4: Right Current Lead (Purple wire curving down)
    ctx.strokeStyle = state.specimenPowerOn ? "#a855f7" : "#475569";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pcbX + pcbW - 4, pcbY + pcbH / 2);
    ctx.bezierCurveTo(pcbX + pcbW + 50, pcbY + 60, 560, 260, 570, 290);
    ctx.stroke();

    // Wire 5: Bottom probe wire (Purple looping down to meter)
    ctx.strokeStyle = "#9333ea";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pcbX + pcbW / 2, pcbY + pcbH - 4);
    ctx.bezierCurveTo(pcbX + pcbW / 2 + 20, pcbY + pcbH + 40, 510, 240, 530, 225);
    ctx.stroke();

    // 9. Embedded Digital LCD / OLED Mini-Meter on the Yoke (Matching Reference Image)
    const meterX = 450;
    const meterY = 210;
    const meterW = 100;
    const meterH = 34;

    // Bezel & Screen
    ctx.fillStyle = "#05070c";
    ctx.fillRect(meterX, meterY, meterW, meterH);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.strokeRect(meterX, meterY, meterW, meterH);

    // Glowing Speedo/Gauge Icon
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(meterX + 10, meterY + meterH / 2, 6, Math.PI * 0.8, Math.PI * 2.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(meterX + 10, meterY + meterH / 2);
    ctx.lineTo(meterX + 13, meterY + meterH / 2 - 3);
    ctx.stroke();

    // Line 1: Magnetic Field Readout (Cyan / Bright Lime)
    const bPolStr = isNormalB ? "(+B)" : "(-B)";
    ctx.font = "800 8.5px monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.textAlign = "left";
    ctx.fillText(`B: ${state.effectiveFieldT.toFixed(2)} T ${bPolStr}`, meterX + 20, meterY + 13);

    // Line 2: Hall Voltage Readout (Warm Amber)
    const vhUnit = spec.id === "cu" ? "μV" : "mV";
    ctx.fillStyle = "#f59e0b";
    ctx.fillText(`V_Hall: ${state.measuredHallVoltageMv.toFixed(2)} ${vhUnit}`, meterX + 20, meterY + 27);

    // Miniature toggle switches beside meter (matching reference image)
    const drawMiniToggle = (tx, ty) => {
      ctx.fillStyle = "#334155";
      ctx.fillRect(tx, ty, 6, 12);
      ctx.fillStyle = "#94a3b8";
      ctx.beginPath();
      ctx.arc(tx + 3, ty + 3, 2.5, 0, Math.PI * 2);
      ctx.fill();
    };
    drawMiniToggle(meterX + meterW + 6, meterY + 10);
    drawMiniToggle(meterX + meterW + 15, meterY + 10);

    // Red & Black Banana Jacks on Yoke Edge
    const drawJack = (jx, jy, color) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(jx, jy, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#020617";
      ctx.beginPath();
      ctx.arc(jx, jy, 2, 0, Math.PI * 2);
      ctx.fill();
    };
    drawJack(meterX + meterW + 36, meterY + 8, "#ef4444");
    drawJack(meterX + meterW + 36, meterY + 24, "#64748b");

    // Red and black wires leading from banana jacks
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(meterX + meterW + 36, meterY + 8);
    ctx.bezierCurveTo(meterX + meterW + 55, meterY + 8, w - 120, 200, w - 80, 220);
    ctx.stroke();

    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(meterX + meterW + 36, meterY + 24);
    ctx.bezierCurveTo(meterX + meterW + 55, meterY + 24, w - 120, 230, w - 80, 240);
    ctx.stroke();
  }

  // -----------------------------------------------------------
  // Canvas 2: Microscopic Lattice OR Characteristic Plots
  // -----------------------------------------------------------
  function renderSecondaryCanvas() {
    if (!graphCtx || !graphCanvas) return;
    const ctx = graphCtx;
    const w = GRAPH_LOGICAL_W;
    const h = GRAPH_LOGICAL_H;

    ctx.clearRect(0, 0, w, h);

    // Dark screen background with digital CRT cathode tint
    ctx.fillStyle = "#0a0f1d";
    ctx.fillRect(0, 0, w, h);

    if (state.secondaryScreenMode === "lattice") {
      renderMicroscopicLatticeView(ctx, w, h);
    } else {
      renderCharacteristicGraphView(ctx, w, h);
    }
  }

  function renderMicroscopicLatticeView(ctx, w, h) {
    const spec = SPECIMENS[state.currentSpecimenId] || SPECIMENS["n-ge"];
    const isElectron = spec.carrierSign === -1;

    // Header title
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.textAlign = "left";
    ctx.fillText("MICROSCOPIC CARRIER DYNAMICS", 16, 22);

    ctx.font = "9.5px monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.textAlign = "right";
    ctx.fillText("F_L = q(v × B)", w - 16, 22);

    // Draw crystal lattice atoms (hexagonal/diamond cubic nodes)
    const cols = 7;
    const rows = 5;
    const startX = 35;
    const startY = 50;
    const spacingX = 48;
    const spacingY = 44;

    ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
    ctx.lineWidth = 1;

    // Lattice bonds
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * spacingX + ((r % 2) * (spacingX / 2));
        const y = startY + r * spacingY;

        if (c < cols - 1) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + spacingX, y);
          ctx.stroke();
        }
        if (r < rows - 1) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + (r % 2 ? -spacingX / 2 : spacingX / 2), y + spacingY);
          ctx.stroke();
        }
      }
    }

    // Atomic nuclei
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * spacingX + ((r % 2) * (spacingX / 2));
        const y = startY + r * spacingY;

        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.fillStyle = "#94a3b8";
        ctx.font = "7.5px monospace";
        ctx.textAlign = "center";
        ctx.fillText(spec.material.slice(0, 2).toUpperCase(), x, y + 2.5);
      }
    }

    // Dynamic drifting charge carriers with velocity and Lorentz force vectors
    const isForwardI = state.iPolarityForward;
    const driftDir = isElectron ? (isForwardI ? -1 : 1) : (isForwardI ? 1 : -1);
    const hasField = state.magnetPowerOn && state.magneticFieldT > 0;
    const hasCurrent = state.specimenPowerOn && state.currentMa > 0;

    latticeParticles.forEach((lp) => {
      if (hasCurrent) {
        lp.x += lp.vx * 0.8 + (driftDir * 1.5);
        if (hasField) {
          const magSign = state.bPolarityNormal ? 1 : -1;
          const defl = driftDir * magSign * spec.carrierSign * (state.magneticFieldT / 0.8) * 1.2;
          lp.y += defl;
        }
      } else {
        lp.x += (Math.random() - 0.5) * 0.6;
        lp.y += (Math.random() - 0.5) * 0.6;
      }

      // Wrap around bounds
      if (lp.x < 20) lp.x = w - 20;
      if (lp.x > w - 20) lp.x = 20;
      if (lp.y < 35) lp.y = h - 35;
      if (lp.y > h - 35) lp.y = 35;

      // Particle
      ctx.fillStyle = isElectron ? "#38bdf8" : "#f59e0b";
      ctx.beginPath();
      ctx.arc(lp.x, lp.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Sign
      ctx.font = "bold 8px monospace";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(isElectron ? "-" : "+", lp.x, lp.y + 3);

      // Lorentz vector arrow on sample particle
      if (hasField && hasCurrent && lp === latticeParticles[0]) {
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(lp.x, lp.y);
        ctx.lineTo(lp.x, lp.y - 25);
        ctx.stroke();

        ctx.fillStyle = "#f43f5e";
        ctx.beginPath();
        ctx.moveTo(lp.x, lp.y - 27);
        ctx.lineTo(lp.x - 4, lp.y - 21);
        ctx.lineTo(lp.x + 4, lp.y - 21);
        ctx.fill();

        ctx.font = "bold 9px monospace";
        ctx.fillText("F_L", lp.x + 12, lp.y - 20);
      }
    });

    // Lower footer explanation
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fillRect(10, h - 38, w - 20, 28);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.strokeRect(10, h - 38, w - 20, 28);

    ctx.font = "10px system-ui, sans-serif";
    ctx.fillStyle = "#cbd5e1";
    ctx.textAlign = "center";
    ctx.fillText(
      `Carrier: ${spec.carrierType} • Hall Angle: θ_H = ${state.hallAngleDeg.toFixed(2)}°`,
      w / 2,
      h - 20
    );
  }

  function renderCharacteristicGraphView(ctx, w, h) {
    const spec = SPECIMENS[state.currentSpecimenId] || SPECIMENS["n-ge"];

    // Header
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.textAlign = "left";
    ctx.fillText("CHARACTERISTIC CURVE: V_H vs B", 16, 22);

    ctx.font = "9.5px monospace";
    ctx.fillStyle = "#a855f7";
    ctx.textAlign = "right";
    ctx.fillText(`I_S = ${state.currentMa.toFixed(1)} mA`, w - 16, 22);

    // Graph Area Bounds
    const gx = 45;
    const gy = 40;
    const gw = w - 65;
    const gh = h - 80;

    // Grid lines & Axis
    ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {
      const y = gy + (i * gh) / 4;
      ctx.beginPath();
      ctx.moveTo(gx, y);
      ctx.lineTo(gx + gw, y);
      ctx.stroke();
    }
    for (let i = 0; i <= 4; i++) {
      const x = gx + (i * gw) / 4;
      ctx.beginPath();
      ctx.moveTo(x, gy);
      ctx.lineTo(x, gy + gh);
      ctx.stroke();
    }

    // Origin axis (B = 0 and V_H = 0)
    // Middle horizontal axis line
    const zeroY = gy + gh / 2;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(gx, zeroY);
    ctx.lineTo(gx + gw, zeroY);
    ctx.stroke();

    // Left vertical axis
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx, gy + gh);
    ctx.stroke();

    // Axis Labels
    ctx.font = "9px monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.textAlign = "right";
    ctx.fillText("+60mV", gx - 6, gy + 10);
    ctx.fillText("0", gx - 6, zeroY + 3);
    ctx.fillText("-60mV", gx - 6, gy + gh);

    ctx.textAlign = "center";
    ctx.fillText("0.0T", gx, gy + gh + 14);
    ctx.fillText("0.4T", gx + gw / 2, gy + gh + 14);
    ctx.fillText("0.8T", gx + gw, gy + gh + 14);

    // Theoretical Linear Fit Curve
    // V_H(B) = (R_H * I * B) / t
    const curA = (state.currentMa / 1000.0) * (state.iPolarityForward ? 1 : -1);
    const maxB = 0.8;
    const vH_at_maxB = ((spec.hallCoeff * curA * maxB) / spec.thicknessM) * 1e3; // mV

    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(gx, zeroY);

    // Point at B = 0.8T
    // Scale: 60 mV = gh / 2
    const yEnd = zeroY - (vH_at_maxB / 60.0) * (gh / 2);
    ctx.lineTo(gx + gw, Math.max(gy, Math.min(gy + gh, yEnd)));
    ctx.stroke();
    ctx.setLineDash([]);

    // Recorded Observation Points in current session for this specimen
    state.observations
      .filter((obs) => obs.specimenId === state.currentSpecimenId)
      .forEach((obs) => {
        const obsB = Math.abs(obs.fieldT);
        const ptX = gx + (obsB / 0.8) * gw;
        const ptY = zeroY - (obs.vHMv / 60.0) * (gh / 2);

        ctx.fillStyle = "#c084fc";
        ctx.beginPath();
        ctx.arc(ptX, Math.max(gy, Math.min(gy + gh, ptY)), 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

    // Current Operating Point (Live cursor indicator)
    const curB = state.magneticFieldT;
    const curPtX = gx + (curB / 0.8) * gw;
    const liveVh = state.hallVoltageMv;
    const curPtY = zeroY - (liveVh / 60.0) * (gh / 2);
    const boundedY = Math.max(gy, Math.min(gy + gh, curPtY));

    // Glowing live reticle
    ctx.fillStyle = "#ec4899";
    ctx.beginPath();
    ctx.arc(curPtX, boundedY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Live Readout Label
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 9.5px monospace";
    ctx.textAlign = curPtX > w - 80 ? "right" : "left";
    ctx.fillText(`(${curB.toFixed(2)}T, ${liveVh.toFixed(1)}mV)`, curPtX > w - 80 ? curPtX - 10 : curPtX + 10, boundedY - 6);

    // Slope & Linearity formula footer
    ctx.font = "9.5px monospace";
    ctx.fillStyle = "#cbd5e1";
    ctx.textAlign = "center";
    const slope = maxB > 0 ? (vH_at_maxB / maxB).toFixed(2) : "0.00";
    ctx.fillText(`Slope dV_H/dB = ${slope} mV/T • Linearity R² ≈ 0.999`, w / 2, h - 10);
  }

  // -----------------------------------------------------------
  // Observations Logbook, Export, and Report
  // -----------------------------------------------------------
  function recordCurrentObservation() {
    if (!state.specimenPowerOn) {
      if (showToast) showToast("Switch ON sample current power supply before logging readings.");
      return;
    }

    const spec = SPECIMENS[state.currentSpecimenId] || SPECIMENS["n-ge"];
    calculatePhysics();

    const reading = {
      id: state.observations.length + 1,
      specimenId: spec.id,
      specimenName: spec.name,
      shortName: spec.shortName,
      material: spec.material,
      carrierType: spec.carrierType,
      currentMa: Number((state.currentMa * (state.iPolarityForward ? 1 : -1)).toFixed(1)),
      fieldT: Number((state.magneticFieldT * (state.bPolarityNormal ? 1 : -1)).toFixed(3)),
      offsetMv: Number(state.offsetVoltageMv.toFixed(2)),
      vHMv: Number(state.measuredHallVoltageMv.toFixed(2)),
      hallCoeff: Number(state.evaluatedHallCoeff.toExponential(3)),
      carrierDensity: Number(state.evaluatedCarrierDensity.toExponential(3)),
      thicknessMm: spec.thicknessMm,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    };

    state.observations.push(reading);
    renderObservationsTable();

    // Check Challenges Progress
    evaluateChallengesOnRecord(reading);

    if (onExperimentRecorded) {
      onExperimentRecorded("hall-effect", {
        experimentName: "Hall Effect in Semiconductor & Metal Probes",
        completed: true,
        score: 95,
        xpEarned: 25
      });
    }

    if (showToast) {
      showToast(`Recorded Observation #${reading.id}: ${spec.shortName} (V_H = ${reading.vHMv} mV)`);
    }
  }

  function renderObservationsTable() {
    const emptyState = document.getElementById("hall-obs-empty");
    const table = document.getElementById("hall-obs-table");
    const tbody = document.getElementById("hall-obs-tbody");
    const countBadge = document.getElementById("hall-obs-count-badge");

    if (countBadge) {
      countBadge.textContent = `${state.observations.length} Reading${state.observations.length === 1 ? "" : "s"}`;
    }

    if (!table || !tbody) return;

    if (state.observations.length === 0) {
      if (emptyState) emptyState.classList.remove("hidden");
      table.classList.add("hidden");
      tbody.innerHTML = "";
      updateObservationsSummaryBar();
      return;
    }

    if (emptyState) emptyState.classList.add("hidden");
    table.classList.remove("hidden");
    tbody.innerHTML = "";

    state.observations.forEach((obs) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>#${obs.id}</strong></td>
        <td><span class="obs-tag" style="background:rgba(139, 92, 246, 0.2); color:#c084fc; border:1px solid rgba(139, 92, 246, 0.4); border-radius:4px; padding:2px 6px;">${obs.shortName}</span></td>
        <td>${obs.currentMa >= 0 ? "+" : ""}${obs.currentMa} mA</td>
        <td>${obs.fieldT >= 0 ? "+" : ""}${obs.fieldT} T</td>
        <td><strong>${obs.vHMv >= 0 ? "+" : ""}${obs.vHMv} ${obs.specimenId === "cu" ? "μV" : "mV"}</strong></td>
        <td><code>${obs.hallCoeff}</code></td>
        <td><code>${formatScientificNotation(obs.carrierDensity, "m⁻³")}</code></td>
        <td>${obs.carrierType.split(" ")[0]}</td>
        <td><span style="font-size:11px; color:#94a3b8;">${obs.timestamp}</span></td>
        <td>
          <button type="button" class="btn-obs-del" data-del-id="${obs.id}" title="Delete Reading" style="background:none; border:none; color:#f43f5e; cursor:pointer; font-size:14px; padding:2px 6px;">
            ✕
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".btn-obs-del").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idToDelete = Number(btn.getAttribute("data-del-id"));
        state.observations = state.observations.filter((o) => o.id !== idToDelete);
        renderObservationsTable();
        if (showToast) showToast(`Deleted Observation #${idToDelete}`);
      });
    });

    updateObservationsSummaryBar();
  }

  function updateObservationsSummaryBar() {
    const meanVhEl = document.getElementById("hall-mean-vh");
    const meanRhEl = document.getElementById("hall-mean-rh");
    const meanDensityEl = document.getElementById("hall-mean-density");
    const totalSamplesEl = document.getElementById("hall-total-samples");

    if (state.observations.length === 0) {
      if (meanVhEl) meanVhEl.textContent = "--";
      if (meanRhEl) meanRhEl.textContent = "--";
      if (meanDensityEl) meanDensityEl.textContent = "--";
      if (totalSamplesEl) totalSamplesEl.textContent = "0";
      return;
    }

    const totalVh = state.observations.reduce((acc, o) => acc + o.vHMv, 0);
    const meanVh = (totalVh / state.observations.length).toFixed(2);

    const validSemi = state.observations.filter((o) => o.specimenId !== "cu");
    let meanDensityStr = "--";
    let meanRhStr = "--";

    if (validSemi.length > 0) {
      const avgN = validSemi.reduce((acc, o) => acc + Number(o.carrierDensity), 0) / validSemi.length;
      meanDensityStr = formatScientificNotation(avgN, "m⁻³");

      const avgRh = validSemi.reduce((acc, o) => acc + Number(o.hallCoeff), 0) / validSemi.length;
      meanRhStr = `${(avgRh * 1e2).toFixed(2)} × 10⁻²`;
    }

    const uniqueSamples = new Set(state.observations.map((o) => o.specimenId)).size;

    if (meanVhEl) meanVhEl.textContent = `${meanVh} mV`;
    if (meanRhEl) meanRhEl.textContent = meanRhStr;
    if (meanDensityEl) meanDensityEl.textContent = meanDensityStr;
    if (totalSamplesEl) totalSamplesEl.textContent = `${uniqueSamples}`;
  }

  function clearObservations() {
    state.observations = [];
    renderObservationsTable();
    if (showToast) showToast("All Hall Effect observations cleared.");
  }

  function exportObservationsCsv() {
    if (isUserAuthenticated && !isUserAuthenticated()) {
      if (openLoginModal) {
        openLoginModal("Exporting Hall Effect observations requires account sign-in. Sign in to download your CSV dataset!");
      } else if (showToast) {
        showToast("Please sign in to export observations to CSV.");
      }
      return;
    }

    if (state.observations.length === 0) {
      if (showToast) showToast("No observations to export.");
      return;
    }

    let csv = "data:text/csv;charset=utf-8,";
    csv += "Reading_ID,Specimen_Name,Material,Carrier_Type,Current_mA,Field_Tesla,Offset_mV,Hall_Voltage_mV,Hall_Coefficient_m3_per_C,Carrier_Density_per_m3,Thickness_mm,Timestamp\n";

    state.observations.forEach((o) => {
      csv += `${o.id},"${o.specimenName}","${o.material}","${o.carrierType}",${o.currentMa},${o.fieldT},${o.offsetMv},${o.vHMv},${o.hallCoeff},${o.carrierDensity},${o.thicknessMm},"${o.timestamp}"\n`;
    });

    const encodedUri = encodeURI(csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PhysiX_Hall_Effect_Lab_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (showToast) showToast("Exported observation data to CSV.");
  }

  function exportObservationsPdf() {
    if (isUserAuthenticated && !isUserAuthenticated()) {
      if (openLoginModal) {
        openLoginModal("Generating official Hall Effect PDF lab reports requires account sign-in. Sign in to download your report!");
      } else if (showToast) {
        showToast("Please sign in to download PDF reports.");
      }
      return;
    }

    if (state.observations.length === 0) {
      if (showToast) showToast("No observations recorded yet. Record observations first!");
      return;
    }

    const profile = getStoredUserProfile ? getStoredUserProfile() : {};
    const studentName = (profile?.name || "").trim() || "Guest Student";
    const collegeName = (profile?.college || profile?.occ || "").trim() || "---";
    const studentEmail = profile?.email || (getActiveUserId && getActiveUserId() !== "guest" && String(getActiveUserId()).includes("@") ? `${getActiveUserId()}` : "guest@physix.lab");
    const studentRole = profile?.edu || "Student Researcher";

    const totalVh = state.observations.reduce((acc, o) => acc + o.vHMv, 0);
    const meanVh = (totalVh / state.observations.length).toFixed(2);
    const uniqueSamples = new Set(state.observations.map((o) => o.specimenName)).size;

    const columns = [
      "ID",
      "Specimen",
      "Carrier Type",
      "Current (mA)",
      "Field B (T)",
      "Hall Voltage (mV)",
      "Hall Coeff (m³/C)",
      "Carrier Density (m⁻³)",
      "Time"
    ];

    const rows = state.observations.map((obs) => [
      `#${obs.id}`,
      obs.shortName,
      obs.carrierType.split(" ")[0],
      `${obs.currentMa >= 0 ? "+" : ""}${obs.currentMa}`,
      `${obs.fieldT >= 0 ? "+" : ""}${obs.fieldT}`,
      `${obs.vHMv >= 0 ? "+" : ""}${obs.vHMv}`,
      obs.hallCoeff,
      obs.carrierDensity,
      obs.timestamp
    ]);

    const btn = document.getElementById("hall-btn-export-pdf");
    if (btn && btn.disabled) return;
    if (btn) {
      btn.disabled = true;
      btn.setAttribute("data-orig-html", btn.innerHTML);
      btn.innerHTML = `<span>Generating Report...</span>`;
    }

    try {
      generateLabReportPdf({
        labTitle: "Hall Effect in Semiconductor & Metal Probes Logbook",
        labSubtitle: "Lorentz Force Magnetotransport, Carrier Concentration & Hall Coefficient Evaluation",
        experimentCode: "EXP-04",
        studentName,
        collegeName,
        studentEmail,
        studentRole,
        summaryMetrics: [
          { label: "Total Observations", value: `${state.observations.length} Readings`, color: [139, 92, 246] },
          { label: "Mean Hall Voltage", value: `${meanVh} mV`, color: [56, 189, 248] },
          { label: "Specimens Tested", value: `${uniqueSamples} Types`, color: [16, 185, 129] },
          { label: "Peak Magnetic Field", value: "0.80 Tesla", color: [245, 158, 11] }
        ],
        columns,
        rows,
        filename: `PhysiX_Hall_Effect_Report_${Date.now()}.pdf`,
        orientation: "landscape"
      });

      if (showToast) showToast("Generated official Hall Effect Laboratory Report (PDF)!");
      if (btn) btn.innerHTML = `<span>Report Exported!</span>`;
    } catch (err) {
      console.error("[PDF Export] Error generating report:", err);
      if (showToast) showToast("Failed to generate PDF. Check console for details.");
    } finally {
      if (btn) {
        setTimeout(() => {
          btn.disabled = false;
          btn.innerHTML = btn.getAttribute("data-orig-html") || `<span>Export PDF Logbook</span>`;
        }, 1500);
      }
    }
  }

  function openLabResultsModal() {
    const modal = document.getElementById("hall-results-modal");
    if (!modal) return;

    // Populate report metrics
    const resCount = document.getElementById("hall-res-count");
    const resVh = document.getElementById("hall-res-vh");
    const resDensity = document.getElementById("hall-res-density");
    const resXp = document.getElementById("hall-res-xp");
    const resTbody = document.getElementById("hall-res-tbody");

    const totalObs = state.observations.length;
    if (resCount) resCount.textContent = `${totalObs}`;

    const totalVh = state.observations.reduce((acc, o) => acc + o.vHMv, 0);
    const meanVh = totalObs > 0 ? (totalVh / totalObs).toFixed(2) : "0.00";
    if (resVh) resVh.textContent = `${meanVh} mV`;

    const semiObs = state.observations.filter((o) => o.specimenId !== "cu");
    if (resDensity) {
      if (semiObs.length > 0) {
        const avgN = semiObs.reduce((acc, o) => acc + Number(o.carrierDensity), 0) / semiObs.length;
        resDensity.textContent = formatScientificNotation(avgN, "m⁻³");
      } else {
        resDensity.textContent = "--";
      }
    }

    // Calculate earned XP from challenges
    let xpSum = 0;
    if (state.challenges.carrierType.completed) xpSum += state.challenges.carrierType.xp;
    if (state.challenges.linearSweep.completed) xpSum += state.challenges.linearSweep.xp;
    if (state.challenges.carrierDensity.completed) xpSum += state.challenges.carrierDensity.xp;
    if (resXp) resXp.textContent = `+${xpSum} XP`;

    // Populate observations summary in report modal
    if (resTbody) {
      resTbody.innerHTML = "";
      state.observations.slice(0, 10).forEach((o) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>#${o.id}</td>
          <td>${o.shortName}</td>
          <td>${o.currentMa} mA</td>
          <td>${o.fieldT} T</td>
          <td><strong>${o.vHMv} ${o.specimenId === "cu" ? "μV" : "mV"}</strong></td>
          <td>${formatScientificNotation(o.carrierDensity, "m⁻³")}</td>
        `;
        resTbody.appendChild(tr);
      });
    }

    modal.classList.remove("hidden");
  }

  function closeLabResultsModal() {
    const modal = document.getElementById("hall-results-modal");
    if (modal) modal.classList.add("hidden");
  }

  // -----------------------------------------------------------
  // Gamified Mastery Challenges Engine
  // -----------------------------------------------------------
  function evaluateChallengesOnRecord(reading) {
    // Challenge 1: Carrier Type & Polarity Inversion (+100 XP)
    if (!state.challenges.carrierType.completed) {
      if (reading.specimenId === "n-ge") state.challenges.carrierType.testedNGe = true;
      if (reading.specimenId === "p-ge") state.challenges.carrierType.testedPGe = true;
      if (reading.fieldT < 0 || reading.currentMa < 0) state.challenges.carrierType.invertedPolarity = true;

      const tag1 = document.getElementById("hall-ch-tag-1");
      let stepsCompleted = 0;
      if (state.challenges.carrierType.testedNGe) stepsCompleted++;
      if (state.challenges.carrierType.testedPGe) stepsCompleted++;
      if (state.challenges.carrierType.invertedPolarity) stepsCompleted++;

      if (tag1 && !state.challenges.carrierType.completed) {
        tag1.textContent = `${stepsCompleted} / 3 Verified`;
      }

      if (state.challenges.carrierType.testedNGe && state.challenges.carrierType.testedPGe && state.challenges.carrierType.invertedPolarity) {
        state.challenges.carrierType.completed = true;
        if (tag1) {
          tag1.className = "challenge-status-tag completed";
          tag1.textContent = "Completed (+100 XP)";
        }
        if (onChallengeCompleted) {
          onChallengeCompleted({ challengeId: "hall-effect.carrierType", xp: 100, name: "Carrier Type & Polarity Law" });
        }
        if (onXpAwarded) onXpAwarded(100, "Mastered Hall Effect Carrier Type & Polarity Reversal!");
        if (showToast) showToast("Challenge Unlocked: Carrier Type & Polarity Law (+100 XP)!");
      }
    }

    // Challenge 2: Magnetic Field Linear Sweep (+125 XP)
    if (!state.challenges.linearSweep.completed) {
      const bAbs = Math.abs(reading.fieldT);
      if (bAbs >= 0.05 && !state.challenges.linearSweep.recordedFields.some((f) => Math.abs(f - bAbs) < 0.08)) {
        state.challenges.linearSweep.recordedFields.push(bAbs);
      }

      const count = state.challenges.linearSweep.recordedFields.length;
      const tag2 = document.getElementById("hall-ch-tag-2");
      if (tag2 && !state.challenges.linearSweep.completed) {
        tag2.textContent = `${count} / 4 Field Points Logged`;
      }

      if (count >= 4) {
        state.challenges.linearSweep.completed = true;
        if (tag2) {
          tag2.className = "challenge-status-tag completed";
          tag2.textContent = "Completed (+125 XP)";
        }
        if (onChallengeCompleted) {
          onChallengeCompleted({ challengeId: "hall-effect.linearSweep", xp: 125, name: "Magnetic Linearity Sweep" });
        }
        if (onXpAwarded) onXpAwarded(125, "Mastered Hall Voltage Linearity vs Magnetic Flux Density!");
        if (showToast) showToast("Challenge Unlocked: Magnetic Linearity Sweep (+125 XP)!");
      }
    }

    // Challenge 3: Quantum Carrier Concentration Determination (+150 XP)
    if (!state.challenges.carrierDensity.completed) {
      // Must be calibrated with offset ~ 0, and non-zero B and I
      if (Math.abs(state.offsetVoltageMv) < 0.05 && Math.abs(reading.fieldT) >= 0.20 && Math.abs(reading.currentMa) >= 15.0) {
        const spec = SPECIMENS[reading.specimenId];
        const evaluatedN = Number(reading.carrierDensity);
        const theoryN = spec.carrierDensity;
        const errorPct = Math.abs((evaluatedN - theoryN) / theoryN) * 100;

        if (errorPct <= 5.0) {
          state.challenges.carrierDensity.completed = true;
          const tag3 = document.getElementById("hall-ch-tag-3");
          if (tag3) {
            tag3.className = "challenge-status-tag completed";
            tag3.textContent = "Completed (+150 XP)";
          }
          if (onChallengeCompleted) {
            onChallengeCompleted({ challengeId: "hall-effect.carrierDensity", xp: 150, name: "Quantum Carrier Concentration" });
          }
          if (onXpAwarded) onXpAwarded(150, "Mastered High-Precision Carrier Concentration Evaluation!");
          if (showToast) showToast("Challenge Unlocked: Quantum Carrier Concentration (+150 XP)!");
        }
      }
    }

    updateChallengeCounters();
    saveChallengesToStorage();
  }

  function updateChallengeCounters() {
    const totalCountEl = document.getElementById("hall-challenges-completed-count");
    const totalXpEl = document.getElementById("hall-user-total-challenge-xp");

    let completed = 0;
    let xpSum = 0;

    if (state.challenges.carrierType.completed) {
      completed++;
      xpSum += state.challenges.carrierType.xp;
    }
    if (state.challenges.linearSweep.completed) {
      completed++;
      xpSum += state.challenges.linearSweep.xp;
    }
    if (state.challenges.carrierDensity.completed) {
      completed++;
      xpSum += state.challenges.carrierDensity.xp;
    }

    if (totalCountEl) totalCountEl.textContent = `${completed} / 3 Complete`;
    if (totalXpEl) totalXpEl.textContent = `+${xpSum} XP`;
  }

  function saveChallengesToStorage() {
    try {
      const data = {
        carrierType: { completed: state.challenges.carrierType.completed },
        linearSweep: { completed: state.challenges.linearSweep.completed },
        carrierDensity: { completed: state.challenges.carrierDensity.completed }
      };
      localStorage.setItem("physix_hall_challenges", JSON.stringify(data));
    } catch (e) {}
  }

  function loadChallengesFromStorage() {
    try {
      const saved = JSON.parse(localStorage.getItem("physix_hall_challenges") || "{}");
      if (saved.carrierType?.completed) {
        state.challenges.carrierType.completed = true;
        const tag1 = document.getElementById("hall-ch-tag-1");
        if (tag1) {
          tag1.className = "challenge-status-tag completed";
          tag1.textContent = "Completed (+100 XP)";
        }
      }
      if (saved.linearSweep?.completed) {
        state.challenges.linearSweep.completed = true;
        const tag2 = document.getElementById("hall-ch-tag-2");
        if (tag2) {
          tag2.className = "challenge-status-tag completed";
          tag2.textContent = "Completed (+125 XP)";
        }
      }
      if (saved.carrierDensity?.completed) {
        state.challenges.carrierDensity.completed = true;
        const tag3 = document.getElementById("hall-ch-tag-3");
        if (tag3) {
          tag3.className = "challenge-status-tag completed";
          tag3.textContent = "Completed (+150 XP)";
        }
      }
      updateChallengeCounters();
    } catch (e) {}
  }

  function hydrateChallenges(candidateList = []) {
    const set = new Set(candidateList);
    if (set.has("hall-effect.carrierType") && !state.challenges.carrierType.completed) {
      state.challenges.carrierType.completed = true;
      const tag1 = document.getElementById("hall-ch-tag-1");
      if (tag1) {
        tag1.className = "challenge-status-tag completed";
        tag1.textContent = "Completed (+100 XP)";
      }
    }
    if (set.has("hall-effect.linearSweep") && !state.challenges.linearSweep.completed) {
      state.challenges.linearSweep.completed = true;
      const tag2 = document.getElementById("hall-ch-tag-2");
      if (tag2) {
        tag2.className = "challenge-status-tag completed";
        tag2.textContent = "Completed (+125 XP)";
      }
    }
    if (set.has("hall-effect.carrierDensity") && !state.challenges.carrierDensity.completed) {
      state.challenges.carrierDensity.completed = true;
      const tag3 = document.getElementById("hall-ch-tag-3");
      if (tag3) {
        tag3.className = "challenge-status-tag completed";
        tag3.textContent = "Completed (+150 XP)";
      }
    }
    updateChallengeCounters();
  }

  // -----------------------------------------------------------
  // Event Bindings
  // -----------------------------------------------------------
  function bindEvents() {
    // Hardware Power Switches
    const btnPowerSample = document.getElementById("hall-btn-power-sample");
    btnPowerSample?.addEventListener("click", () => {
      state.specimenPowerOn = !state.specimenPowerOn;
      updateDomHud();
      if (showToast) showToast(`Sample Current Supply: ${state.specimenPowerOn ? "ENABLED" : "OFF"}`);
    });

    const btnPowerMagnet = document.getElementById("hall-btn-power-magnet");
    btnPowerMagnet?.addEventListener("click", () => {
      state.magnetPowerOn = !state.magnetPowerOn;
      updateDomHud();
      if (showToast) showToast(`Electromagnet Field Supply: ${state.magnetPowerOn ? "ENABLED" : "OFF"}`);
    });

    // Polarity Inversion Switches
    const btnPolB = document.getElementById("hall-btn-pol-b");
    btnPolB?.addEventListener("click", () => {
      state.bPolarityNormal = !state.bPolarityNormal;
      updateDomHud();
      if (showToast) showToast(`Magnetic Polarity: ${state.bPolarityNormal ? "+B (Normal)" : "-B (Inverted)"}`);
    });

    const btnPolI = document.getElementById("hall-btn-pol-i");
    btnPolI?.addEventListener("click", () => {
      state.iPolarityForward = !state.iPolarityForward;
      updateDomHud();
      if (showToast) showToast(`Current Direction: ${state.iPolarityForward ? "+I (Forward)" : "-I (Reverse)"}`);
    });

    // Specimen Material Selector Chips
    document.querySelectorAll(".hall-specimen-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const specId = chip.getAttribute("data-specimen");
        if (SPECIMENS[specId]) {
          state.currentSpecimenId = specId;
          updateDomHud();
          if (showToast) showToast(`Mounted Specimen: ${SPECIMENS[specId].name}`);
        }
      });
    });

    // Secondary Screen Mode Toggle Buttons (Lattice vs Characteristic Graph)
    const btnModeGraph = document.getElementById("hall-btn-mode-graph");
    const btnModeLattice = document.getElementById("hall-btn-mode-lattice");

    btnModeGraph?.addEventListener("click", () => {
      state.secondaryScreenMode = "graph";
      btnModeGraph.classList.add("active");
      btnModeLattice?.classList.remove("active");
    });

    btnModeLattice?.addEventListener("click", () => {
      state.secondaryScreenMode = "lattice";
      btnModeLattice.classList.add("active");
      btnModeGraph?.classList.remove("active");
    });

    // Current Slider & Steppers
    const sliderCurrent = document.getElementById("hall-slider-current");
    sliderCurrent?.addEventListener("input", (e) => {
      state.currentMa = parseFloat(e.target.value);
      updateDomHud();
    });

    const btnDecCurrent = document.getElementById("hall-btn-dec-current");
    btnDecCurrent?.addEventListener("click", () => {
      state.currentMa = Math.max(0.0, parseFloat((state.currentMa - 5.0).toFixed(1)));
      updateDomHud();
    });

    const btnIncCurrent = document.getElementById("hall-btn-inc-current");
    btnIncCurrent?.addEventListener("click", () => {
      state.currentMa = Math.min(50.0, parseFloat((state.currentMa + 5.0).toFixed(1)));
      updateDomHud();
    });

    // Current Quick Presets
    document.querySelectorAll(".hall-preset-btn-cur").forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = parseFloat(btn.getAttribute("data-cur"));
        if (!isNaN(val)) {
          state.currentMa = val;
          updateDomHud();
        }
      });
    });

    // Magnetic Field Slider & Steppers
    const sliderField = document.getElementById("hall-slider-field");
    sliderField?.addEventListener("input", (e) => {
      state.magneticFieldT = parseFloat(e.target.value);
      updateDomHud();
    });

    const btnDecField = document.getElementById("hall-btn-dec-field");
    btnDecField?.addEventListener("click", () => {
      state.magneticFieldT = Math.max(0.0, parseFloat((state.magneticFieldT - 0.1).toFixed(2)));
      updateDomHud();
    });

    const btnIncField = document.getElementById("hall-btn-inc-field");
    btnIncField?.addEventListener("click", () => {
      state.magneticFieldT = Math.min(0.8, parseFloat((state.magneticFieldT + 0.1).toFixed(2)));
      updateDomHud();
    });

    // Field Quick Presets
    document.querySelectorAll(".hall-preset-btn-field").forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = parseFloat(btn.getAttribute("data-field"));
        if (!isNaN(val)) {
          state.magneticFieldT = val;
          updateDomHud();
        }
      });
    });

    // Offset Null Potentiometer Slider
    const sliderOffset = document.getElementById("hall-slider-offset");
    sliderOffset?.addEventListener("input", (e) => {
      state.offsetVoltageMv = parseFloat(e.target.value);
      updateDomHud();
    });

    const btnZeroOffset = document.getElementById("hall-btn-zero-offset");
    btnZeroOffset?.addEventListener("click", () => {
      state.offsetVoltageMv = 0.0;
      updateDomHud();
      if (showToast) showToast("Zero-Null Potentiometer Balanced: V_offset = 0.00 mV");
    });

    // Action Buttons
    const btnRecord = document.getElementById("hall-btn-record");
    btnRecord?.addEventListener("click", recordCurrentObservation);

    const btnLabReport = document.getElementById("hall-btn-view-results");
    btnLabReport?.addEventListener("click", openLabResultsModal);

    const btnCloseReport = document.getElementById("hall-btn-close-results");
    btnCloseReport?.addEventListener("click", closeLabResultsModal);

    const btnExportCsv = document.getElementById("hall-btn-export-csv");
    btnExportCsv?.addEventListener("click", exportObservationsCsv);

    const btnExportPdf = document.getElementById("hall-btn-export-pdf");
    btnExportPdf?.addEventListener("click", exportObservationsPdf);

    const btnClearObs = document.getElementById("hall-btn-clear-obs");
    btnClearObs?.addEventListener("click", clearObservations);

    // Click regions on canvas
    if (benchCanvas) {
      benchCanvas.addEventListener("click", (e) => {
        const rect = benchCanvas.getBoundingClientRect();
        const scaleX = BENCH_LOGICAL_W / rect.width;
        const scaleY = BENCH_LOGICAL_H / rect.height;
        const clickX = (e.clientX - rect.left) * scaleX;
        const clickY = (e.clientY - rect.top) * scaleY;

        // Click on specimen chip toggles next specimen
        if (clickX >= 356 && clickX <= 444 && clickY >= 156 && clickY <= 224) {
          const keys = Object.keys(SPECIMENS);
          const nextIdx = (keys.indexOf(state.currentSpecimenId) + 1) % keys.length;
          state.currentSpecimenId = keys[nextIdx];
          updateDomHud();
          if (showToast) showToast(`Swapped Specimen: ${SPECIMENS[state.currentSpecimenId].name}`);
        }
      });
    }
  }

  // -----------------------------------------------------------
  // Continuous Animation Loop
  // -----------------------------------------------------------
  function animationLoop() {
    simTime += 0.016;
    renderBenchCanvas();
    renderSecondaryCanvas();
    animationFrameId = requestAnimationFrame(animationLoop);
  }

  return {
    init() {
      benchCanvas = document.getElementById("hall-bench-canvas");
      if (benchCanvas) benchCtx = benchCanvas.getContext("2d");

      graphCanvas = document.getElementById("hall-graph-canvas");
      if (graphCanvas) graphCtx = graphCanvas.getContext("2d");

      loadChallengesFromStorage();
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
      renderSecondaryCanvas();
      updateChallengeCounters();
    },

    updateChallengeCounters,
    hydrateChallenges,

    getState() {
      const spec = SPECIMENS[state.currentSpecimenId] || SPECIMENS["n-ge"];
      return {
        specimenPowerOn: state.specimenPowerOn,
        magnetPowerOn: state.magnetPowerOn,
        specimenName: spec.name,
        carrierType: spec.carrierType,
        currentMa: state.currentMa,
        magneticFieldT: state.magneticFieldT,
        hallVoltageMv: state.measuredHallVoltageMv,
        hallCoeff: state.evaluatedHallCoeff,
        carrierDensity: state.evaluatedCarrierDensity,
        hallAngleDeg: state.hallAngleDeg,
        observationsCount: state.observations.length
      };
    },

    destroy() {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    }
  };
}
