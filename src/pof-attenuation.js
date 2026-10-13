/**
 * PhysiX • Measuring Optical Power Attenuation in Plastic Optical Fiber
 * Complete, photorealistic interactive laboratory simulation of an undergraduate optical bench.
 * 
 * Features:
 * - Detailed metallic guide rails, support frames, heavy dark bases, vertical rods, clamps, and knobs
 * - Component 1: Optical Source with power switch and restrained 650 nm red light emission
 * - Component 2: Input Coupler with precision micrometer alignment
 * - Component 3: Flexible Plastic Optical Fiber (POF) with natural catenary curve and core light propagation
 * - Component 4: Output Coupling Assembly with alignment control
 * - Component 5: Optical Power Detector with sensor cable linked to the meter
 * - Component 6: Digital Optical Power Meter with high-contrast display, mW/µW units, and measure trigger
 * - Bouguer-Lambert-Beer physical attenuation model: P_out = P_in · 10^(-αL/10) with coupling & bending loss
 * - Observation log table with row deletion, editing, and CSV/PDF export
 * - Dynamic Telemetry Graph (Power vs Length & Attenuation vs Length)
 * - 6 Gamified Challenges with idempotent XP awarding
 * - Component Inspection Modal for all 6 apparatus assemblies
 * - Action-driven Guided Tour validation hooks
 * - Dark & Light mode compatibility
 * 100% Zero Emojis compliant.
 */

import { generateLabReportPdf } from "./pdf-export.js";

export function createPofAttenuationExperiment(callbacks = {}) {
  const {
    onXpAwarded,
    onExperimentRecorded,
    showToast = (msg) => console.log(msg),
    getActiveUserId = () => "guest",
    loadUserProfile = () => {},
    getStoredUserProfile = () => null,
    unlockBadge = () => {},
    isUserAuthenticated = () => false,
    openLoginModal = () => {},
    onChallengeCompleted = () => {}
  } = callbacks;

  // --------------------------------------------------------------------------
  // SCIENTIFIC & SIMULATOR HARDWARE STATE
  // --------------------------------------------------------------------------
  const state = {
    // Component 1: Optical Source (650 nm LED / Diode Transmitter)
    sourcePowered: false,
    sourceWavelengthNm: 650,
    sourceBasePowerMw: 3.00, // Calibrated source output (3.00 mW = 3000 µW)

    // Optical Signal Animation State
    animPhase: 0.0,
    animActive: false,
    animFrameId: null,

    // Component 2: Input Coupler
    inputAligned: true,
    inputOffsetMm: 0.0, // 0.0 mm = optimum alignment, up to ±2.0 mm
    inputCouplingEfficiency: 1.0, // Calculated from offset

    // Component 3: Plastic Optical Fiber (POF)
    fiberConnected: true,
    fiberLengthM: 5.0, // Default 5.0 m, range 1.0 to 25.0 m
    intrinsicAlphaDbPerKm: 180.0, // Standard PMMA POF at 650 nm: 180 dB/km = 0.180 dB/m
    bendMode: "straight", // "straight" (0 dB), "moderate" (0.8 dB), "sharp" (2.5 dB)
    bendLossDb: 0.0,

    // Component 4: Output Coupling Assembly
    outputAligned: true,
    outputOffsetMm: 0.0,
    outputCouplingEfficiency: 1.0,

    // Component 5: Optical Power Detector
    detectorConnected: true,

    // Component 6: Digital Optical Power Meter
    meterMode: "reference", // "reference" (measures P_in) or "output" (measures P_out)
    meterUnit: "mW", // "mW" or "uW"
    meterStatus: "READY", // "READY", "MEASURING...", "STABLE", "NO SIGNAL", "CONFIG CHANGED"
    meterValueMw: 0.0,
    meterNeedsMeasure: false,

    // Recorded Measurements for calculation
    recordedPinMw: null,
    recordedPoutMw: null,
    calculatedTotalAttDb: null,
    calculatedAlphaDbPerKm: null,

    // Observations Table
    observations: [],

    // Active Graph Mode: "power" or "attenuation"
    graphMode: "power",

    // Inspected Component in Inspector Modal
    inspectedComponent: null,

    // Challenges State
    challenges: {
      "pof-chal-pin": {
        id: "pof-chal-pin",
        completed: false,
        xp: 100,
        title: "1. Source Calibration (P_in)",
        desc: "Power ON the 650 nm optical source and capture baseline incident optical power in Reference mode."
      },
      "pof-chal-connect": {
        id: "pof-chal-connect",
        completed: false,
        xp: 100,
        title: "2. Precision Waveguide Coupling",
        desc: "Couple the plastic optical fiber into transmitter port and ensure micrometer alignment offsets are 0.0 mm."
      },
      "pof-chal-pout": {
        id: "pof-chal-pout",
        completed: false,
        xp: 125,
        title: "3. Transmitted Power Measurement",
        desc: "Configure fiber length L >= 5.0 m, switch meter to POF Output mode, and measure transmitted power P_out."
      },
      "pof-chal-calc": {
        id: "pof-chal-calc",
        completed: false,
        xp: 150,
        title: "4. Attenuation Calculation",
        desc: "Evaluate total decibel loss A_dB and compute attenuation coefficient alpha (dB/km) matching PMMA standards."
      },
      "pof-chal-multi": {
        id: "pof-chal-multi",
        completed: false,
        xp: 175,
        title: "5. Multi-Length Data Sweep",
        desc: "Record 3 or more distinct fiber lengths in the observation logbook to characterize the exponential decay profile."
      },
      "pof-chal-bend": {
        id: "pof-chal-bend",
        completed: false,
        xp: 150,
        title: "6. Macrobending Characterization",
        desc: "Engage Moderate or Sharp macrobending curvature to observe radiation mode leakage and additional dB loss."
      }
    },

    // Guided Tour State Validation Flags
    tourFlags: {
      sourceIdentified: false,
      sourcePowered: false,
      modeRefSelected: false,
      pinMeasured: false,
      fiberConnected: false,
      lengthConfigured: false,
      modeOutSelected: false,
      poutMeasured: false,
      totalAttCalculated: false,
      alphaCalculated: false,
      observationLogged: false,
      graphInspected: false,
      interpretationSubmitted: false
    }
  };

  // Canvas context and logical dimensions
  let benchCanvas = null;
  let benchCtx = null;
  let graphCanvas = null;
  let graphCtx = null;
  let animFrameId = null;

  const LOGICAL_BENCH_W = 960;
  const LOGICAL_BENCH_H = 380;

  // Component Clickable Bounding Regions on Bench Canvas (Logical Coordinates)
  const COMPONENT_REGIONS = {
    source: { x: 780, y: 50, w: 120, h: 260, name: "Optical Source", key: "source" },
    inputCoupler: { x: 540, y: 50, w: 220, h: 260, name: "Input Coupler & Objective", key: "inputCoupler" },
    fiber: { x: 140, y: 90, w: 420, h: 180, name: "Plastic Optical Fiber (POF)", key: "fiber" },
    outputCoupler: { x: 65, y: 50, w: 90, h: 130, name: "Output Coupling Assembly & Screen", key: "outputCoupler" },
    detector: { x: 65, y: 130, w: 90, h: 180, name: "Optical Power Detector", key: "detector" }
  };

  // Component Technical Specifications for Inspection Modal
  const COMPONENT_DETAILS = {
    source: {
      title: "Optical Source (Transmitter)",
      badge: "COMPONENT 1 • TRANSMITTER",
      desc: "Industrial-grade visible red LED / diode transmitter assembly housed in a rugged machined enclosure. Generates stabilized optical radiation at λ = 650 nm tailored for polymethyl methacrylate (PMMA) plastic optical fiber transmission.",
      specs: [
        { label: "Emission Wavelength (λ)", value: "650 nm (Visible Red)" },
        { label: "Nominal Output Power (P₀)", value: "3.00 mW (3000 µW)" },
        { label: "Spectral Line FWHM", value: "≈ 20 nm" },
        { label: "Operating Drive Voltage", value: "5.0 V Regulated DC" }
      ]
    },
    inputCoupler: {
      title: "Input Coupling & Alignment Stage",
      badge: "COMPONENT 2 • OPTICAL INTERFACE",
      desc: "Precision fiber mounting chuck secured to a vertical metal rod. Includes dual-axis micrometer thumbscrew adjusters to align the optical axis of the beam with the 980 µm core facet of the fiber.",
      specs: [
        { label: "Alignment Mechanism", value: "X-Y Micrometer Stages" },
        { label: "Coupling Collet Chuck", value: "1.0 mm Ferrule Bore" },
        { label: "Fresnel Facet Loss", value: "≈ 0.17 dB / facet" },
        { label: "Peak Coupling Efficiency", value: "Up to 98%" }
      ]
    },
    fiber: {
      title: "Plastic Optical Fiber (POF) Waveguide",
      badge: "COMPONENT 3 • TRANSMISSION MEDIUM",
      desc: "Step-index polymer optical cable featuring a 980 µm polymethyl methacrylate (PMMA) core (n₁ ≈ 1.492) and a thin 10 µm fluorinated polymer cladding (n₂ ≈ 1.402). Highly flexible with a broad numerical aperture.",
      specs: [
        { label: "Core / Cladding Diameter", value: "980 µm / 1000 µm" },
        { label: "Core Material", value: "PMMA (Acrylic)" },
        { label: "Numerical Aperture (NA)", value: "0.47 (Acceptance Angle θ_a ≈ 28°)" },
        { label: "Intrinsic Attenuation (α)", value: "≈ 180 dB/km @ 650 nm" },
        { label: "Minimum Bending Radius", value: "25.0 mm" }
      ]
    },
    outputCoupler: {
      title: "Output Coupling Assembly",
      badge: "COMPONENT 4 • EXIT TERMINATION",
      desc: "Mechanical support assembly mounted on the right optical bench sled. Securely positions the fiber exit facet opposite the photodetector active aperture with zero angular skew.",
      specs: [
        { label: "Exit Receptacle", value: "Spring-loaded Collet" },
        { label: "Facet-to-Detector Air Gap", value: "2.0 mm Calibrated" },
        { label: "Alignment Degree of Freedom", value: "Axial & Transverse" }
      ]
    },
    detector: {
      title: "Optical Power Detector Head",
      badge: "COMPONENT 5 • PHOTO-SENSOR",
      desc: "High-linearity silicon PIN photodiode sensor housed in an anodized light-shielded cylindrical casing. Directly converts incoming photons into proportional photocurrent across the 400 nm to 1100 nm spectral band.",
      specs: [
        { label: "Photodiode Material", value: "Silicon PIN Active Area" },
        { label: "Responsivity @ 650 nm", value: "≈ 0.45 A/W" },
        { label: "Aperture Diameter", value: "5.0 mm Clear Optical Bore" },
        { label: "Sensor Noise Equivalent Power", value: "< 0.001 mW (< 1 µW)" }
      ]
    }
  };

  // --------------------------------------------------------------------------
  // PHYSICAL SIMULATION ENGINE & MATHEMATICAL FORMULAS
  // --------------------------------------------------------------------------

  function calculateCouplingEfficiency(offsetMm) {
    const sigma = 1.0; // mm
    return Math.max(0.05, Math.exp(-Math.pow(offsetMm, 2) / (2 * Math.pow(sigma, 2))));
  }

  function getEffectiveBendLossDb() {
    if (state.bendMode === "moderate") return 0.8;
    if (state.bendMode === "sharp") return 2.5;
    return 0.0;
  }

  /**
   * Computes the modeled physical optical power reaching the detector
   * @param {"reference"|"output"} mode 
   */
  function computePhysicalPowerMw(mode) {
    if (!state.sourcePowered) {
      return 0.0;
    }

    // Gaussian noise generation for realistic sensor readings
    const noise = (Math.random() - 0.5) * 0.004;

    if (mode === "reference") {
      // In Reference mode, detector is directly coupled to transmitter port
      const pinRaw = state.sourceBasePowerMw * state.inputCouplingEfficiency;
      return Math.max(0.0, pinRaw + noise);
    }

    if (mode === "output") {
      if (!state.fiberConnected) {
        return 0.0;
      }

      // Input coupled power
      const pinCoupled = state.sourceBasePowerMw * state.inputCouplingEfficiency;

      // Distributed waveguide attenuation: A_fiber_dB = (α / 1000) * L_m
      const alphaDbPerMeter = state.intrinsicAlphaDbPerKm / 1000.0;
      const fiberLossDb = alphaDbPerMeter * state.fiberLengthM;

      // Additional localized extrinsic losses:
      // Output coupling alignment loss
      const outLossDb = -10 * Math.log10(Math.max(0.05, state.outputCouplingEfficiency));
      // Bending radiation loss
      const bendLossDb = getEffectiveBendLossDb();

      // Total insertion + attenuation loss in decibels
      const totalLossDb = fiberLossDb + outLossDb + bendLossDb;

      // P_out = P_in · 10^(-totalLossDb / 10)
      const poutCalculated = pinCoupled * Math.pow(10, -totalLossDb / 10);
      return Math.max(0.0, poutCalculated + noise);
    }

    return 0.0;
  }

  // --------------------------------------------------------------------------
  // CANVAS RENDERING: PHOTOREALISTIC OPTICAL BENCH & APPARATUS
  // Exact physical recreation of an engineering physics college optical bench
  // Matches the realistic laboratory photo: arched cast iron legs with dome nuts,
  // dual cylindrical chrome rails, rectangular sleds, black conical pedestals,
  // stainless steel rods, 10x/0.25 microscope objective, transmitter, and POF cable.
  // --------------------------------------------------------------------------

  function setupCanvasDpi(canvas, logicalW, logicalH) {
    if (!canvas) return null;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = logicalW * dpr;
    canvas.height = logicalH * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    return ctx;
  }

  function renderBenchApparatus() {
    if (!benchCtx || !benchCanvas) return;
    const ctx = benchCtx;
    ctx.clearRect(0, 0, LOGICAL_BENCH_W, LOGICAL_BENCH_H);

    const isLight = document.body.classList.contains("light-mode") || document.documentElement.getAttribute("data-theme") === "light";

    // 1. Realistic Laboratory Environment Background
    // Wall and tabletop surface with depth and perspective
    const bgGrad = ctx.createLinearGradient(0, 0, 0, LOGICAL_BENCH_H);
    if (isLight) {
      bgGrad.addColorStop(0, "#f8fafc");
      bgGrad.addColorStop(0.72, "#f1f5f9");
      bgGrad.addColorStop(0.721, "#e2e8f0"); // Tabletop seam
      bgGrad.addColorStop(1, "#cbd5e1");
    } else {
      bgGrad.addColorStop(0, "#0b0f19");
      bgGrad.addColorStop(0.72, "#131b2e");
      bgGrad.addColorStop(0.721, "#0d1322"); // Tabletop seam
      bgGrad.addColorStop(1, "#080c16");
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, LOGICAL_BENCH_W, LOGICAL_BENCH_H);

    // Subtle laboratory bench wall grid lines
    ctx.strokeStyle = isLight ? "rgba(148, 163, 184, 0.15)" : "rgba(148, 163, 184, 0.04)";
    ctx.lineWidth = 1;
    for (let x = 40; x < LOGICAL_BENCH_W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 15);
      ctx.lineTo(x, 260);
      ctx.stroke();
    }

    // Tabletop soft contact drop shadow under the optical bench
    const shadowGrad = ctx.createRadialGradient(480, 325, 60, 480, 325, 450);
    shadowGrad.addColorStop(0, isLight ? "rgba(0, 0, 0, 0.22)" : "rgba(0, 0, 0, 0.65)");
    shadowGrad.addColorStop(1, "transparent");
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(480, 325, 440, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Optical Center Axis Reference Line
    const opticalAxisY = 135;
    ctx.strokeStyle = "rgba(234, 179, 8, 0.12)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(40, opticalAxisY);
    ctx.lineTo(LOGICAL_BENCH_W - 40, opticalAxisY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Lower Cross-Tie Rod connecting the two arched end legs
    drawLowerCrossTie(ctx, 55, LOGICAL_BENCH_W - 55, 308);

    // 4. Two Parallel Cylindrical Chrome Guide Rails (Upper and Lower)
    drawMetallicGuideRail(ctx, 45, 248, LOGICAL_BENCH_W - 90, 16); // Upper Rail
    drawMetallicGuideRail(ctx, 45, 282, LOGICAL_BENCH_W - 90, 16); // Lower Rail

    // Rail Millimeter Calibration Scale
    drawRailMillimeterScale(ctx, 60, 264, LOGICAL_BENCH_W - 120);

    // 5. Heavy Cast-Iron Arched End Legs (Left and Right Bench Supports)
    drawArchedEndLeg(ctx, 55, true);                  // Left A-Frame Cast Leg
    drawArchedEndLeg(ctx, LOGICAL_BENCH_W - 55, false); // Right A-Frame Cast Leg

    // 6. Component 1 (Mount 1 - Leftmost): White Output Screen & Detector Stage
    const m1X = 115;
    drawSledCarriage(ctx, m1X);
    drawMount1OutputScreen(ctx, m1X, opticalAxisY);

    // 7. Component 2 (Mount 2 - Intermediate Support Post): Intermediate Guide Stand
    const m2X = 265;
    drawSledCarriage(ctx, m2X);
    drawMount2SupportPost(ctx, m2X);

    // 8. Component 3 (Mount 3 - Center-Right): Fiber Input Coupling Plate
    const m3X = 590;
    drawSledCarriage(ctx, m3X);
    drawMount3InputPlate(ctx, m3X, opticalAxisY);

    // 9. Component 4 (Mount 4 - Right-Center): 10x/0.25 Microscope Objective Coupler
    const m4X = 715;
    drawSledCarriage(ctx, m4X);
    drawMount4MicroscopeObjective(ctx, m4X, opticalAxisY);

    // 10. Component 5 (Mount 5 - Far Right): Optical Transmitter / Laser Source Housing
    const m5X = 835;
    drawSledCarriage(ctx, m5X);
    drawMount5OpticalSource(ctx, m5X, opticalAxisY);

    // 11. Optical Beam Transmission from Source into Microscope Objective and Fiber
    if (state.sourcePowered) {
      drawCouplingOpticalBeams(ctx, m5X, m4X, m3X, opticalAxisY);
    }

    // 12. Component 3: Flexible Plastic Optical Fiber (POF) Cable Looping Between Mount 3 and Mount 1
    // Connects from Mount 3 ferrule (x=562) to Mount 1 ferrule (x=133)
    drawPlasticOpticalFiber(ctx, 562, opticalAxisY, 133, opticalAxisY);

    // 13. Component Hover / Selection Highlight Box
    if (state.inspectedComponent && COMPONENT_REGIONS[state.inspectedComponent]) {
      const reg = COMPONENT_REGIONS[state.inspectedComponent];
      ctx.strokeStyle = "#eab308";
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(reg.x, reg.y, reg.w, reg.h);
      ctx.setLineDash([]);
    }
  }

  // --- DETAILED REALISTIC DRAWING SUB-ROUTINES (MATCHING LAB PHOTO) ---

  /**
   * Heavy Cast Iron Arched Bench Leg (End Stand)
   * Distinctive arched gothic bridge profile with foot leveling bolt and chrome dome nuts.
   */
  function drawArchedEndLeg(ctx, centerX, isLeft) {
    const yTop = 236;
    const yFoot = 338;
    const w = 38;
    const xLeft = centerX - w / 2;

    // Cast-iron hammered textured gradient
    const legGrad = ctx.createLinearGradient(xLeft, yTop, xLeft + w, yFoot);
    legGrad.addColorStop(0, "#475569");
    legGrad.addColorStop(0.3, "#1e293b");
    legGrad.addColorStop(0.7, "#334155");
    legGrad.addColorStop(1, "#0f172a");

    ctx.save();
    // Drop shadow under leg foot
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.ellipse(centerX, yFoot + 2, 24, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main Arched Leg Silhouette
    ctx.fillStyle = legGrad;
    ctx.beginPath();
    ctx.moveTo(centerX - 16, yTop);
    ctx.lineTo(centerX + 16, yTop);
    ctx.quadraticCurveTo(centerX + 20, 270, centerX + 22, 305);
    // Outer foot flare
    ctx.lineTo(centerX + 26, yFoot);
    ctx.lineTo(centerX + 10, yFoot);
    // Inner arch cutout
    ctx.quadraticCurveTo(centerX, 290, centerX - 10, yFoot);
    ctx.lineTo(centerX - 26, yFoot);
    ctx.quadraticCurveTo(centerX - 20, 305, centerX - 16, yTop);
    ctx.closePath();
    ctx.fill();

    // 3D Cast Iron Edge Highlight Rim
    ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Foot Leveling Screw / Hex Nut at Toe
    const toeX = isLeft ? centerX - 20 : centerX + 20;
    const boltGrad = ctx.createLinearGradient(toeX - 5, yFoot - 8, toeX + 5, yFoot + 8);
    boltGrad.addColorStop(0, "#94a3b8");
    boltGrad.addColorStop(0.5, "#f1f5f9");
    boltGrad.addColorStop(1, "#475569");
    ctx.fillStyle = boltGrad;
    ctx.fillRect(toeX - 5, yFoot - 6, 10, 10);
    ctx.strokeStyle = "#334155";
    ctx.strokeRect(toeX - 5, yFoot - 6, 10, 10);

    // Circular Boss Collars where the upper and lower cylindrical rails seat
    const upperY = 256;
    const lowerY = 290;
    [upperY, lowerY].forEach(railY => {
      // Boss collar ring
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.arc(centerX, railY, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Shiny Chrome Domed Acorn Cap Nut on the outer face
      const nutX = isLeft ? centerX - 7 : centerX + 7;
      const nutGrad = ctx.createRadialGradient(nutX - 2, railY - 2, 1, nutX, railY, 9);
      nutGrad.addColorStop(0, "#ffffff");
      nutGrad.addColorStop(0.35, "#cbd5e1");
      nutGrad.addColorStop(0.7, "#64748b");
      nutGrad.addColorStop(1, "#1e293b");
      ctx.fillStyle = nutGrad;
      ctx.beginPath();
      ctx.arc(nutX, railY, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 0.8;
      ctx.stroke();
    });

    ctx.restore();
  }

  /**
   * Lower Cross Tie-Rod
   */
  function drawLowerCrossTie(ctx, x1, x2, y) {
    const rodH = 8;
    const rodGrad = ctx.createLinearGradient(0, y, 0, y + rodH);
    rodGrad.addColorStop(0, "#334155");
    rodGrad.addColorStop(0.35, "#94a3b8");
    rodGrad.addColorStop(0.7, "#475569");
    rodGrad.addColorStop(1, "#0f172a");
    ctx.fillStyle = rodGrad;
    ctx.fillRect(x1, y, x2 - x1, rodH);
  }

  /**
   * Dual Parallel Polished Metallic Guide Rails
   */
  function drawMetallicGuideRail(ctx, x, y, w, h) {
    // Drop shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(x, y + h - 1, w, 5);

    // Multi-stop 3D cylindrical chrome gradient
    const railGrad = ctx.createLinearGradient(0, y, 0, y + h);
    railGrad.addColorStop(0.0, "#272e3f");
    railGrad.addColorStop(0.15, "#64748b");
    railGrad.addColorStop(0.35, "#e2e8f0");
    railGrad.addColorStop(0.5, "#ffffff"); // Bright chrome reflection streak
    railGrad.addColorStop(0.7, "#94a3b8");
    railGrad.addColorStop(0.9, "#475569");
    railGrad.addColorStop(1.0, "#1e2433");

    ctx.fillStyle = railGrad;
    ctx.fillRect(x, y, w, h);

    // Subtle metallic rim lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x, y + 0.5);
    ctx.lineTo(x + w, y + 0.5);
    ctx.stroke();

    ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.moveTo(x, y + h - 0.5);
    ctx.lineTo(x + w, y + h - 0.5);
    ctx.stroke();
  }

  function drawRailMillimeterScale(ctx, x, y, len) {
    ctx.strokeStyle = "rgba(100, 116, 139, 0.55)";
    ctx.lineWidth = 0.8;
    for (let i = 0; i < len; i += 8) {
      const isMajor = i % 40 === 0;
      const isMid = i % 20 === 0;
      const tickH = isMajor ? 7 : (isMid ? 4.5 : 2.5);
      ctx.beginPath();
      ctx.moveTo(x + i, y);
      ctx.lineTo(x + i, y + tickH);
      ctx.stroke();
    }
  }

  /**
   * Machined Sled Carriage with Black Conical Upright Pedestal & Polished Rod
   * Exact physical reproduction of the 5 sliding mounts in the photo.
   */
  function drawSledCarriage(ctx, centerX) {
    const sledW = 66;
    const sledH = 46;
    const x = centerX - sledW / 2;
    const y = 242;

    ctx.save();

    // 1. Drop shadow under sled
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fillRect(x - 2, y + sledH, sledW + 4, 6);

    // 2. Machined Rectangular Metal Sled Saddle Block
    const blockGrad = ctx.createLinearGradient(x, y, x + sledW, y + sledH);
    blockGrad.addColorStop(0, "#334155");
    blockGrad.addColorStop(0.3, "#1e293b");
    blockGrad.addColorStop(0.7, "#273349");
    blockGrad.addColorStop(1, "#0f172a");
    ctx.fillStyle = blockGrad;
    ctx.fillRect(x, y, sledW, sledH);

    // Machined horizontal side bevels and chamfers
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, sledW, sledH);

    ctx.fillStyle = "#1e2430";
    ctx.fillRect(x + 4, y + 8, sledW - 8, 30);
    ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
    ctx.strokeRect(x + 4, y + 8, sledW - 8, 30);

    // Fluted Black Clamping Knob Underneath Lower Rail
    const knobX = centerX - 8;
    const knobY = y + sledH;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(knobX, knobY, 16, 12);
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 1;
    ctx.strokeRect(knobX, knobY, 16, 12);
    // Grip ridges on knob
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    for (let gx = knobX + 3; gx < knobX + 15; gx += 3) {
      ctx.beginPath();
      ctx.moveTo(gx, knobY + 2);
      ctx.lineTo(gx, knobY + 10);
      ctx.stroke();
    }

    // 3. Tall Black Conical Upright Pedestal (Inverted trumpet / conical taper)
    const baseW = 44;
    const collarW = 18;
    const coneYTop = 182;

    // Flared circular base flange
    const flangeGrad = ctx.createLinearGradient(centerX - baseW/2, y - 6, centerX + baseW/2, y);
    flangeGrad.addColorStop(0, "#1e293b");
    flangeGrad.addColorStop(0.5, "#475569");
    flangeGrad.addColorStop(1, "#090d16");
    ctx.fillStyle = flangeGrad;
    ctx.fillRect(centerX - baseW/2, y - 5, baseW, 6);
    ctx.strokeStyle = "#475569";
    ctx.strokeRect(centerX - baseW/2, y - 5, baseW, 6);

    // Tapered conical pillar body
    const coneGrad = ctx.createLinearGradient(centerX - baseW/2, y, centerX + baseW/2, y);
    coneGrad.addColorStop(0.0, "#090d16");
    coneGrad.addColorStop(0.3, "#263147");
    coneGrad.addColorStop(0.55, "#475569"); // Vertical satin shine
    coneGrad.addColorStop(0.8, "#182030");
    coneGrad.addColorStop(1.0, "#060911");

    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(centerX - baseW/2 + 2, y - 5);
    ctx.lineTo(centerX - collarW/2, coneYTop);
    ctx.lineTo(centerX + collarW/2, coneYTop);
    ctx.lineTo(centerX + baseW/2 - 2, y - 5);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Top Clamping Collar Ring
    ctx.fillStyle = "#1e2430";
    ctx.fillRect(centerX - collarW/2 - 2, coneYTop - 12, collarW + 4, 12);
    ctx.strokeStyle = "#64748b";
    ctx.strokeRect(centerX - collarW/2 - 2, coneYTop - 12, collarW + 4, 12);

    // Horizontal Knurled Collar Thumbscrew Knob (sticking out on the left)
    const sideKnobX = centerX - collarW/2 - 11;
    const sideKnobY = coneYTop - 10;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(sideKnobX, sideKnobY, 9, 8);
    ctx.strokeStyle = "#94a3b8";
    ctx.strokeRect(sideKnobX, sideKnobY, 9, 8);
    ctx.fillStyle = "#64748b";
    ctx.fillRect(sideKnobX + 2, sideKnobY + 1, 5, 6);

    // 4. Polished Stainless Steel Vertical Rod
    const rodW = 9;
    const rodX = centerX - rodW / 2;
    const rodTopY = 105;

    const rodGrad = ctx.createLinearGradient(rodX, 0, rodX + rodW, 0);
    rodGrad.addColorStop(0, "#475569");
    rodGrad.addColorStop(0.3, "#f8fafc");
    rodGrad.addColorStop(0.65, "#cbd5e1");
    rodGrad.addColorStop(1, "#334155");

    ctx.fillStyle = rodGrad;
    ctx.fillRect(rodX, rodTopY, rodW, coneYTop - 12 - rodTopY);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 0.8;
    ctx.strokeRect(rodX, rodTopY, rodW, coneYTop - 12 - rodTopY);

    ctx.restore();
  }

  /**
   * Component 1 (Mount 1 - Leftmost): White Screen / Output Detector Stage
   * Vertical white plate with central ferrule aperture receiving the POF cable.
   */
  function drawMount1OutputScreen(ctx, x, y) {
    const plateW = 34;
    const plateH = 82;
    const px = x - plateW / 2;
    const py = y - plateH / 2;

    ctx.save();

    // Collar clamp holding plate to rod
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(x - 8, y + 26, 16, 14);
    ctx.strokeStyle = "#64748b";
    ctx.strokeRect(x - 8, y + 26, 16, 14);

    // White / Translucent Polymer Screen Plate
    const plateGrad = ctx.createLinearGradient(px, py, px + plateW, py + plateH);
    plateGrad.addColorStop(0, "#f8fafc");
    plateGrad.addColorStop(0.6, "#e2e8f0");
    plateGrad.addColorStop(1, "#cbd5e1");
    ctx.fillStyle = plateGrad;
    ctx.fillRect(px, py, plateW, plateH);

    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.2;
    ctx.strokeRect(px, py, plateW, plateH);

    // Center Optical Aperture & Metallic Receptacle
    ctx.fillStyle = "#334155";
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Metal Ferrule & Strain Relief Boot facing right (toward fiber)
    ctx.fillStyle = "#64748b";
    ctx.fillRect(x + 7, y - 5, 8, 10);
    // Black rubber strain-relief sleeve
    ctx.fillStyle = "#090d16";
    ctx.fillRect(x + 15, y - 4, 12, 8);
    ctx.strokeStyle = "#334155";
    ctx.strokeRect(x + 15, y - 4, 12, 8);

    // When source is on and fiber connected, display focused 650 nm red spot on aperture scaling with transmitted power
    if (state.sourcePowered && state.fiberConnected) {
      const alphaDbPerMeter = state.intrinsicAlphaDbPerKm / 1000.0;
      const totalLossDb = (alphaDbPerMeter * state.fiberLengthM) + getEffectiveBendLossDb();
      const transmissionRatio = Math.max(0.08, Math.pow(10, -totalLossDb / 10));
      const spotAlpha = Math.min(1.0, 0.25 + 0.7 * transmissionRatio);
      const spotRadius = Math.max(8, 9 + 8 * transmissionRatio);

      const spotGrad = ctx.createRadialGradient(x, y, 1, x, y, spotRadius);
      spotGrad.addColorStop(0, `rgba(255, 80, 80, ${spotAlpha})`);
      spotGrad.addColorStop(0.4, `rgba(239, 68, 68, ${spotAlpha * 0.7})`);
      spotGrad.addColorStop(1, "transparent");
      ctx.fillStyle = spotGrad;
      ctx.beginPath();
      ctx.arc(x, y, spotRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Plate labels
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 8px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("OUTPUT", x, py + 14);
    ctx.fillText("SCREEN", x, py + 23);

    // Sensor Signal Cable descending from detector to power meter
    ctx.strokeStyle = "#090d16";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(x, y + 40);
    ctx.quadraticCurveTo(x - 20, y + 80, x - 35, LOGICAL_BENCH_H);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Component 2 (Mount 2 - Intermediate Post): Intermediate Stand
   */
  function drawMount2SupportPost(ctx, x) {
    ctx.save();
    // Additional clamp collar at y = 145 exactly matching the photo
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(x - 7, 142, 14, 10);
    ctx.strokeStyle = "#64748b";
    ctx.strokeRect(x - 7, 142, 14, 10);
    // Knob on side
    ctx.fillStyle = "#090d16";
    ctx.fillRect(x - 14, 143, 7, 8);
    ctx.strokeStyle = "#94a3b8";
    ctx.strokeRect(x - 14, 143, 7, 8);
    ctx.restore();
  }

  /**
   * Component 3 (Mount 3 - Center-Right): Dark Fiber Input Coupling Plate
   */
  function drawMount3InputPlate(ctx, x, y) {
    const plateW = 26;
    const plateH = 82;
    const px = x - plateW / 2;
    const py = y - plateH / 2;

    ctx.save();

    // Rod clamp bracket
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(x - 8, y + 26, 16, 14);
    ctx.strokeStyle = "#64748b";
    ctx.strokeRect(x - 8, y + 26, 16, 14);

    // Dark-anodized metal plate
    const plateGrad = ctx.createLinearGradient(px, py, px + plateW, py + plateH);
    plateGrad.addColorStop(0, "#334155");
    plateGrad.addColorStop(0.5, "#182030");
    plateGrad.addColorStop(1, "#090d16");
    ctx.fillStyle = plateGrad;
    ctx.fillRect(px, py, plateW, plateH);
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 1.2;
    ctx.strokeRect(px, py, plateW, plateH);

    // Micrometer alignment thumb screw on top
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(x - 4, py - 9, 8, 9);
    ctx.strokeStyle = "#cbd5e1";
    ctx.strokeRect(x - 4, py - 9, 8, 9);

    // Central SMA receptacle aperture
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(x, y, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // Black strain-relief boot on left face where POF connects
    ctx.fillStyle = "#090d16";
    ctx.fillRect(px - 14, y - 4, 14, 8);
    ctx.strokeStyle = "#334155";
    ctx.strokeRect(px - 14, y - 4, 14, 8);

    // Metal receiver nosepiece on right face (facing objective)
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(px + plateW, y - 5, 8, 10);
    ctx.strokeStyle = "#cbd5e1";
    ctx.strokeRect(px + plateW, y - 5, 8, 10);

    ctx.restore();
  }

  /**
   * Component 4 (Mount 4 - Right-Center): Authentic Microscope Objective Coupler
   * Features stepped black/silver barrel, gold/yellow band, and "10x / 0.25" engraving.
   */
  function drawMount4MicroscopeObjective(ctx, x, y) {
    ctx.save();

    // Rod clamp ring holding objective barrel
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(x - 6, y + 15, 12, 18);
    ctx.strokeStyle = "#64748b";
    ctx.strokeRect(x - 6, y + 15, 12, 18);

    // Circular mounting ring around objective
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(x, y, 17, 0, Math.PI * 2);
    ctx.stroke();

    // Stepped Objective Lens Barrel (pointing left toward Mount 3)
    // 1. Rear Threaded Collar (Right side)
    const rearGrad = ctx.createLinearGradient(0, y - 11, 0, y + 11);
    rearGrad.addColorStop(0, "#475569");
    rearGrad.addColorStop(0.5, "#cbd5e1");
    rearGrad.addColorStop(1, "#1e293b");
    ctx.fillStyle = rearGrad;
    ctx.fillRect(x + 15, y - 11, 12, 22);
    ctx.strokeStyle = "#334155";
    ctx.strokeRect(x + 15, y - 11, 12, 22);

    // 2. Main Black Enameled Barrel Body
    const bodyGrad = ctx.createLinearGradient(0, y - 13, 0, y + 13);
    bodyGrad.addColorStop(0, "#090d16");
    bodyGrad.addColorStop(0.3, "#222c3f");
    bodyGrad.addColorStop(0.55, "#475569"); // Specular shine
    bodyGrad.addColorStop(1, "#090d16");
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(x - 10, y - 13, 25, 26);
    ctx.strokeStyle = "#1e293b";
    ctx.strokeRect(x - 10, y - 13, 25, 26);

    // 3. Distinctive Gold / Yellow Band (Exact characteristic from lab photo)
    const bandGrad = ctx.createLinearGradient(0, y - 13, 0, y + 13);
    bandGrad.addColorStop(0, "#b45309");
    bandGrad.addColorStop(0.4, "#fde047");
    bandGrad.addColorStop(0.7, "#eab308");
    bandGrad.addColorStop(1, "#78350f");
    ctx.fillStyle = bandGrad;
    ctx.fillRect(x + 1, y - 13, 9, 26);
    ctx.strokeStyle = "#ca8a04";
    ctx.strokeRect(x + 1, y - 13, 9, 26);

    // Engraved Text on objective barrel ("10x")
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 6.5px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("10x", x + 5.5, y + 2.5);

    // 4. Knurled Chrome Grip Band
    const gripGrad = ctx.createLinearGradient(0, y - 11, 0, y + 11);
    gripGrad.addColorStop(0, "#64748b");
    gripGrad.addColorStop(0.5, "#f1f5f9");
    gripGrad.addColorStop(1, "#334155");
    ctx.fillStyle = gripGrad;
    ctx.fillRect(x - 20, y - 11, 10, 22);
    ctx.strokeStyle = "#94a3b8";
    ctx.strokeRect(x - 20, y - 11, 10, 22);
    // Knurl texture lines
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 0.8;
    for (let kx = x - 18; kx < x - 11; kx += 2.5) {
      ctx.beginPath();
      ctx.moveTo(kx, y - 10);
      ctx.lineTo(kx, y + 10);
      ctx.stroke();
    }

    // 5. Tapered Front Metallic Nosepiece (facing left toward Mount 3)
    ctx.fillStyle = "#334155";
    ctx.beginPath();
    ctx.moveTo(x - 20, y - 11);
    ctx.lineTo(x - 28, y - 7);
    ctx.lineTo(x - 28, y + 7);
    ctx.lineTo(x - 20, y + 11);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#94a3b8";
    ctx.stroke();

    // Front optical glass aperture
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(x - 30, y - 5, 2, 10);

    ctx.restore();
  }

  /**
   * Component 5 (Mount 5 - Far Right): Optical Transmitter / Laser Source Housing
   * Horizontal black cylindrical housing with front aperture, power LED, and rear cable.
   */
  function drawMount5OpticalSource(ctx, x, y) {
    const boxW = 66;
    const boxH = 28;
    const bx = x - boxW / 2;
    const by = y - boxH / 2;

    ctx.save();

    // Rod clamp bracket
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(x - 7, y + 14, 14, 16);
    ctx.strokeStyle = "#64748b";
    ctx.strokeRect(x - 7, y + 14, 14, 16);

    // Black cylindrical laser / transmitter body
    const bodyGrad = ctx.createLinearGradient(0, by, 0, by + boxH);
    bodyGrad.addColorStop(0.0, "#090d16");
    bodyGrad.addColorStop(0.25, "#273349");
    bodyGrad.addColorStop(0.5, "#475569"); // Specular chrome/anodized highlight
    bodyGrad.addColorStop(0.75, "#1e293b");
    bodyGrad.addColorStop(1.0, "#090d16");
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(bx, by, boxW, boxH);
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.2;
    ctx.strokeRect(bx, by, boxW, boxH);

    // Front Emission Aperture Bezel (facing left toward Mount 4)
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(bx - 6, by + 4, 6, boxH - 8);
    ctx.strokeStyle = "#64748b";
    ctx.strokeRect(bx - 6, by + 4, 6, boxH - 8);

    // Power Indicator Pilot LED on Housing
    ctx.fillStyle = state.sourcePowered ? "#22c55e" : "#ef4444";
    ctx.beginPath();
    ctx.arc(x - 8, by + 6, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = state.sourcePowered ? "#86efac" : "#7f1d1d";
    ctx.stroke();

    // Stepped Cylindrical Rear Strain-Relief Boot
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(bx + boxW, by + 6, 12, boxH - 12);
    ctx.strokeStyle = "#334155";
    ctx.strokeRect(bx + boxW, by + 6, 12, boxH - 12);

    // Thick Black Insulated Electrical Power Cable exiting rear
    ctx.strokeStyle = "#090d16";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(bx + boxW + 12, y);
    ctx.quadraticCurveTo(x + 65, y + 40, x + 85, 270);
    ctx.quadraticCurveTo(x + 95, 310, x + 115, LOGICAL_BENCH_H - 15);
    ctx.stroke();

    // Source Label
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "bold 8px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("650nm SOURCE", x + 8, y + 2.5);

    ctx.restore();
  }

  /**
   * Focused Optical Coupling Beams from Source through Objective into Fiber
   */
  function drawCouplingOpticalBeams(ctx, srcX, objX, cplX, y) {
    ctx.save();
    // 1. Collimated Beam from Source into rear of Objective (x = 802 to 745)
    ctx.strokeStyle = "rgba(239, 68, 68, 0.75)";
    ctx.lineWidth = 6;
    ctx.shadowColor = "#ef4444";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(srcX - 33, y);
    ctx.lineTo(objX + 27, y);
    ctx.stroke();

    // 2. Focused Converging Light Cone from Objective Nosepiece into Mount 3 Fiber Aperture
    const coneGrad = ctx.createLinearGradient(objX - 30, y, cplX + 13, y);
    coneGrad.addColorStop(0, "rgba(239, 68, 68, 0.85)");
    coneGrad.addColorStop(1, "rgba(254, 202, 202, 0.95)");

    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(objX - 30, y - 5);
    ctx.lineTo(cplX + 13, y); // Focuses to sharp point on fiber core
    ctx.lineTo(objX - 30, y + 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /**
   * Component 3: Flexible Plastic Optical Fiber (POF) Cable
   * Drapes down in a realistic U-shaped catenary sag curve between Mount 3 and Mount 1.
   */
  function drawPlasticOpticalFiber(ctx, startX, startY, endX, endY) {
    ctx.save();

    if (!state.fiberConnected) {
      // Disconnected: cable hangs loosely with detached ferrule
      ctx.strokeStyle = "#090d16";
      ctx.lineWidth = 4.8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(startX - 40, startY + 90, startX - 80, startY + 120);
      ctx.stroke();
      return;
    }

    // Natural catenary U-loop curve between Mount 3 (x=562) and Mount 1 (x=133)
    // Sag depth dynamically adjusts with fiber length L and bend mode
    let sagDepth = 85 + (state.fiberLengthM * 1.8);
    if (state.bendMode === "moderate") sagDepth += 25;
    if (state.bendMode === "sharp") sagDepth += 50;

    const midX = (startX + endX) / 2;
    const ctrlY = startY + Math.min(135, sagDepth);

    // 1. Drop shadow onto rails and bench
    ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(startX, startY + 4);
    ctx.quadraticCurveTo(midX, ctrlY + 6, endX, endY + 4);
    ctx.stroke();

    // 2. Heavy Black Protective Outer Jacket
    ctx.strokeStyle = "#090d16";
    ctx.lineWidth = 4.8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(midX, ctrlY, endX, endY);
    ctx.stroke();

    // 3. Polymer Specular Highlight Stroke
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(midX, ctrlY, endX, endY);
    ctx.stroke();

    // 4. Internal Laser Transmission Core Glow with Physical Attenuation & Traveling Photons
    if (state.sourcePowered) {
      const alphaDbPerMeter = state.intrinsicAlphaDbPerKm / 1000.0;
      const totalLossDb = (alphaDbPerMeter * state.fiberLengthM) + getEffectiveBendLossDb();
      const transmissionRatio = Math.max(0.08, Math.pow(10, -totalLossDb / 10));

      // Continuous core laser glow with spatial attenuation gradient (bright red at input, dimmer at output)
      const coreGrad = ctx.createLinearGradient(startX, startY, endX, endY);
      coreGrad.addColorStop(0, "rgba(255, 60, 60, 0.95)");
      coreGrad.addColorStop(0.5, `rgba(248, 113, 113, ${0.4 + 0.45 * transmissionRatio})`);
      coreGrad.addColorStop(1, `rgba(239, 68, 68, ${0.15 + 0.7 * transmissionRatio})`);

      ctx.strokeStyle = coreGrad;
      ctx.lineWidth = 2.0;
      ctx.shadowColor = "#ef4444";
      ctx.shadowBlur = 6 * transmissionRatio;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(midX, ctrlY, endX, endY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Dynamic propagating optical packet pulses advancing along the fiber waveguide
      const pulseCount = 10;
      for (let i = 0; i < pulseCount; i++) {
        const t = (state.animPhase + i / pulseCount) % 1.0;
        const omt = 1.0 - t;
        const px = omt * omt * startX + 2 * omt * t * midX + t * t * endX;
        const py = omt * omt * startY + 2 * omt * t * ctrlY + t * t * endY;
        const pulseAlpha = Math.max(0.12, (1.0 - t * (1.0 - transmissionRatio)) * 0.9);

        // Core white glint
        ctx.fillStyle = `rgba(255, 255, 255, ${pulseAlpha * 0.85})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.6, 0, Math.PI * 2);
        ctx.fill();

        // 650nm Red halo
        ctx.fillStyle = `rgba(255, 68, 68, ${pulseAlpha * 0.95})`;
        ctx.beginPath();
        ctx.arc(px, py, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 5. If Macrobending condition active, draw bending curvature indicator / mandrel
    if (state.bendMode === "moderate" || state.bendMode === "sharp") {
      const bendRadius = state.bendMode === "moderate" ? 18 : 10;
      ctx.strokeStyle = state.bendMode === "sharp" ? "rgba(239, 68, 68, 0.8)" : "rgba(234, 179, 8, 0.7)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.arc(midX, ctrlY - 8, bendRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  // --------------------------------------------------------------------------
  // TELEMETRY GRAPH CANVAS RENDERING
  // --------------------------------------------------------------------------

  function renderTelemetryGraph() {
    if (!graphCtx || !graphCanvas) return;
    const ctx = graphCtx;
    const w = graphCanvas.clientWidth || 400;
    const h = graphCanvas.clientHeight || 280;

    // Setup High DPI
    const dpr = window.devicePixelRatio || 1;
    if (graphCanvas.width !== w * dpr || graphCanvas.height !== h * dpr) {
      graphCanvas.width = w * dpr;
      graphCanvas.height = h * dpr;
    }
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const isLight = document.body.classList.contains("light-mode") || document.documentElement.getAttribute("data-theme") === "light";
    const bgFill = isLight ? "#f8fafc" : "#090e1a";
    const gridColor = isLight ? "rgba(203, 213, 225, 0.6)" : "rgba(148, 163, 184, 0.12)";
    const axisColor = isLight ? "#475569" : "#94a3b8";
    const textColor = isLight ? "#1e293b" : "#cbd5e1";

    ctx.fillStyle = bgFill;
    ctx.fillRect(0, 0, w, h);

    const padL = 50;
    const padR = 25;
    const padT = 30;
    const padB = 40;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    // Grid lines and ticks
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const gy = padT + (plotH * (i / 5));
      ctx.beginPath();
      ctx.moveTo(padL, gy);
      ctx.lineTo(padL + plotW, gy);
      ctx.stroke();
    }
    for (let i = 0; i <= 5; i++) {
      const gx = padL + (plotW * (i / 5));
      ctx.beginPath();
      ctx.moveTo(gx, padT);
      ctx.lineTo(gx, padT + plotH);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = textColor;
    ctx.font = "bold 10px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Fiber Length L (m)", padL + plotW / 2, h - 10);

    // Y Axis Label
    ctx.save();
    ctx.translate(14, padT + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    if (state.graphMode === "power") {
      ctx.fillText("Transmitted Power P_out (mW)", 0, 0);
    } else {
      ctx.fillText("Total Attenuation A (dB)", 0, 0);
    }
    ctx.restore();

    // Scaling limits
    const maxLen = 25.0; // metres
    const maxPower = Math.max(3.5, Math.ceil(state.sourceBasePowerMw * 1.25)); // dynamic mW limit
    const maxAtt = 5.0; // dB

    // X Axis Ticks (0, 5, 10, 15, 20, 25 m)
    ctx.font = "9px monospace";
    ctx.fillStyle = axisColor;
    for (let m = 0; m <= 25; m += 5) {
      const tx = padL + (m / maxLen) * plotW;
      ctx.fillText(m.toString(), tx, padT + plotH + 14);
    }

    // Y Axis Ticks
    if (state.graphMode === "power") {
      const pStep = maxPower <= 5 ? 1.0 : (maxPower <= 10 ? 2.0 : 2.5);
      for (let p = 0; p <= maxPower; p += pStep) {
        const ty = padT + plotH - (p / maxPower) * plotH;
        ctx.textAlign = "right";
        ctx.fillText(p.toFixed(1), padL - 6, ty + 3);
      }
    } else {
      for (let a = 0; a <= 5.0; a += 1.0) {
        const ty = padT + plotH - (a / maxAtt) * plotH;
        ctx.textAlign = "right";
        ctx.fillText(a.toFixed(1), padL - 6, ty + 3);
      }
    }

    // Plot Theoretical Reference Curve
    ctx.strokeStyle = state.graphMode === "power"
      ? (isLight ? "#0284c7" : "rgba(56, 189, 248, 0.75)")
      : (isLight ? "#d97706" : "rgba(234, 179, 8, 0.75)");
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (let step = 0; step <= 50; step++) {
      const lenVal = (step / 50) * maxLen;
      const xPos = padL + (lenVal / maxLen) * plotW;
      let yVal = 0;
      if (state.graphMode === "power") {
        const pTheo = state.sourceBasePowerMw * Math.pow(10, -(0.180 * lenVal) / 10);
        yVal = padT + plotH - (pTheo / maxPower) * plotH;
      } else {
        const aTheo = 0.180 * lenVal;
        yVal = padT + plotH - (aTheo / maxAtt) * plotH;
      }
      if (step === 0) ctx.moveTo(xPos, yVal);
      else ctx.lineTo(xPos, yVal);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Plot Student Recorded Observation Points
    if (state.observations.length > 0) {
      state.observations.forEach((obs) => {
        const len = obs.length;
        const xPos = padL + Math.min(1, len / maxLen) * plotW;
        let yPos = padT + plotH;

        if (state.graphMode === "power") {
          yPos = padT + plotH - (Math.min(maxPower, obs.pout) / maxPower) * plotH;
          ctx.fillStyle = isLight ? "#0284c7" : "#38bdf8";
          ctx.strokeStyle = isLight ? "#0f172a" : "#ffffff";
        } else {
          yPos = padT + plotH - (Math.min(maxAtt, obs.totalAtt) / maxAtt) * plotH;
          ctx.fillStyle = isLight ? "#d97706" : "#eab308";
          ctx.strokeStyle = isLight ? "#0f172a" : "#ffffff";
        }

        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(xPos, yPos, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }

    ctx.restore();
  }

  // --------------------------------------------------------------------------
  // USER ACTIONS & SIMULATOR LOGIC
  // --------------------------------------------------------------------------

  function updatePowerReadout() {
    const valMw = computePhysicalPowerMw(state.meterMode);
    state.meterValueMw = valMw;

    const valDisplayEl = document.getElementById("pof-meter-val");
    const unitDisplayEl = document.getElementById("pof-meter-unit");
    const modeBadgeEl = document.getElementById("pof-screen-mode-lbl");
    const statusPillEl = document.getElementById("pof-meter-status-pill");

    if (valDisplayEl) {
      if (state.meterUnit === "uW") {
        valDisplayEl.textContent = (valMw * 1000).toFixed(1);
      } else {
        valDisplayEl.textContent = valMw.toFixed(3);
      }
    }
    if (unitDisplayEl) {
      unitDisplayEl.textContent = state.meterUnit;
    }
    if (modeBadgeEl) {
      modeBadgeEl.textContent = state.meterMode === "reference" ? "MODE: REFERENCE P_in" : "MODE: POF TRANSMISSION P_out";
    }
    if (statusPillEl) {
      statusPillEl.className = "pof-meter-status-pill";
      if (!state.sourcePowered || (state.meterMode === "output" && !state.fiberConnected)) {
        statusPillEl.classList.add("pof-status-nosignal");
        statusPillEl.textContent = "NO SIGNAL";
      } else if (state.meterNeedsMeasure) {
        statusPillEl.classList.add("pof-status-changed");
        statusPillEl.textContent = "PRESS MEASURE";
      } else {
        statusPillEl.classList.add("pof-status-stable");
        statusPillEl.textContent = "STABLE";
      }
    }

    // Update HUD KPIs
    updateMathHud();
  }

  function updateMathHud() {
    const kpiPin = document.getElementById("pof-hud-pin");
    const kpiPout = document.getElementById("pof-hud-pout");
    const kpiTotalAtt = document.getElementById("pof-hud-total-att");
    const kpiAlpha = document.getElementById("pof-hud-alpha");

    if (kpiPin) {
      kpiPin.textContent = state.recordedPinMw !== null ? `${state.recordedPinMw.toFixed(3)} mW` : "--";
    }
    if (kpiPout) {
      kpiPout.textContent = state.recordedPoutMw !== null ? `${state.recordedPoutMw.toFixed(3)} mW` : "--";
    }
    if (kpiTotalAtt) {
      kpiTotalAtt.textContent = state.calculatedTotalAttDb !== null ? `${state.calculatedTotalAttDb.toFixed(3)} dB` : "--";
    }
    if (kpiAlpha) {
      kpiAlpha.textContent = state.calculatedAlphaDbPerKm !== null ? `${state.calculatedAlphaDbPerKm.toFixed(1)} dB/km` : "--";
    }
  }

  function triggerMeasurement() {
    const statusPillEl = document.getElementById("pof-meter-status-pill");
    if (statusPillEl) {
      statusPillEl.className = "pof-meter-status-pill pof-status-measuring";
      statusPillEl.textContent = "MEASURING...";
    }

    setTimeout(() => {
      state.meterNeedsMeasure = false;
      const measuredMw = computePhysicalPowerMw(state.meterMode);

      if (state.meterMode === "reference") {
        state.recordedPinMw = measuredMw;
        state.tourFlags.pinMeasured = true;
        showToast(`Reference Power P_in recorded: ${measuredMw.toFixed(3)} mW`);

        // Challenge 1 Check
        if (state.sourcePowered && measuredMw > 2.0 && !state.challenges["pof-chal-pin"].completed) {
          awardChallenge("pof-chal-pin");
        }
      } else {
        state.recordedPoutMw = measuredMw;
        state.tourFlags.poutMeasured = true;
        showToast(`Output Power P_out measured: ${measuredMw.toFixed(3)} mW`);

        // Challenge 3 Check
        if (state.fiberLengthM >= 5.0 && measuredMw > 0 && !state.challenges["pof-chal-pout"].completed) {
          awardChallenge("pof-chal-pout");
        }

        // Challenge 6 (Bending Loss Check)
        if (state.bendMode !== "straight" && !state.challenges["pof-chal-bend"].completed) {
          awardChallenge("pof-chal-bend");
        }
      }

      // Auto-compute total attenuation if both Pin and Pout are recorded
      if (state.recordedPinMw !== null && state.recordedPoutMw !== null && state.recordedPoutMw > 0) {
        const attDb = 10 * Math.log10(state.recordedPinMw / state.recordedPoutMw);
        state.calculatedTotalAttDb = Math.max(0, attDb);
        const alpha = (1000.0 / state.fiberLengthM) * state.calculatedTotalAttDb;
        state.calculatedAlphaDbPerKm = alpha;
        state.tourFlags.totalAttCalculated = true;
        state.tourFlags.alphaCalculated = true;

        // Challenge 4 Check
        if (!state.challenges["pof-chal-calc"].completed) {
          awardChallenge("pof-chal-calc");
        }
      }

      updatePowerReadout();
      renderBenchApparatus();
    }, 400);
  }

  function recordObservation() {
    if (state.recordedPinMw === null || state.recordedPoutMw === null) {
      showToast("Please measure both reference power P_in and output power P_out before recording!");
      return;
    }

    const sNo = state.observations.length + 1;
    const obs = {
      sNo,
      length: state.fiberLengthM,
      pin: state.recordedPinMw,
      pout: state.recordedPoutMw,
      totalAtt: state.calculatedTotalAttDb || 0,
      alpha: state.calculatedAlphaDbPerKm || 0,
      bend: state.bendMode,
      date: new Date().toLocaleTimeString()
    };

    state.observations.push(obs);
    state.tourFlags.observationLogged = true;
    showToast(`Recorded Observation #${sNo} (L = ${state.fiberLengthM} m, α = ${obs.alpha.toFixed(1)} dB/km)`);

    // Challenge 5 Check (3+ unique observations)
    if (state.observations.length >= 3 && !state.challenges["pof-chal-multi"].completed) {
      awardChallenge("pof-chal-multi");
    }

    renderObservationTable();
    renderTelemetryGraph();
  }

  function updateProcedureRibbon() {
    const s1 = document.getElementById("pof-step-indicator-1");
    const s2 = document.getElementById("pof-step-indicator-2");
    const s3 = document.getElementById("pof-step-indicator-3");
    const s4 = document.getElementById("pof-step-indicator-4");

    if (!s1 || !s2 || !s3 || !s4) return;
    [s1, s2, s3, s4].forEach(el => el.classList.remove("active", "completed-step"));

    if (state.observations.length > 0) {
      s1.classList.add("completed-step");
      s2.classList.add("completed-step");
      s3.classList.add("completed-step");
      s4.classList.add("active");
    } else if (state.recordedPoutMw !== null) {
      s1.classList.add("completed-step");
      s2.classList.add("completed-step");
      s3.classList.add("completed-step");
      s4.classList.add("active");
    } else if (state.fiberConnected && state.recordedPinMw !== null) {
      s1.classList.add("completed-step");
      s2.classList.add("completed-step");
      s3.classList.add("active");
    } else if (state.sourcePowered) {
      s1.classList.add("active");
      s2.classList.add("active");
    } else {
      s1.classList.add("active");
    }
  }

  function renderObservationTable() {
    const tbody = document.getElementById("pof-obs-tbody");
    const emptyState = document.getElementById("pof-obs-empty");
    const countBadge = document.getElementById("pof-obs-count-badge");
    const meanAlphaEl = document.getElementById("pof-mean-alpha");
    const statPinEl = document.getElementById("pof-stat-pin");
    const statLenEl = document.getElementById("pof-stat-len");

    if (countBadge) {
      countBadge.textContent = `${state.observations.length} Reading${state.observations.length === 1 ? '' : 's'}`;
    }

    if (statLenEl) {
      statLenEl.textContent = `${state.fiberLengthM.toFixed(1)} m`;
    }

    if (statPinEl) {
      statPinEl.textContent = state.recordedPinMw !== null ? `${state.recordedPinMw.toFixed(3)} mW` : "--";
    }

    if (meanAlphaEl) {
      if (state.observations.length > 0) {
        const avg = state.observations.reduce((sum, o) => sum + o.alpha, 0) / state.observations.length;
        meanAlphaEl.textContent = `${avg.toFixed(1)} dB/km`;
      } else {
        meanAlphaEl.textContent = "--";
      }
    }

    if (!tbody) return;

    if (state.observations.length === 0) {
      if (emptyState) emptyState.classList.remove("hidden");
      tbody.innerHTML = `<tr><td colspan="7" class="pof-empty-obs">No observations recorded yet. Power on source and click "Record Observation".</td></tr>`;
      updateProcedureRibbon();
      return;
    }

    if (emptyState) emptyState.classList.add("hidden");

    tbody.innerHTML = state.observations.map((obs, idx) => `
      <tr>
        <td><strong>${obs.sNo}</strong></td>
        <td>${obs.length.toFixed(1)} m</td>
        <td>${obs.pin.toFixed(3)}</td>
        <td>${obs.pout.toFixed(3)}</td>
        <td><strong>${obs.totalAtt.toFixed(3)}</strong></td>
        <td><strong style="color:#10b981;">${obs.alpha.toFixed(1)}</strong></td>
        <td>
          <button type="button" class="pof-btn-del-row" data-del-idx="${idx}" title="Remove this record">
            Delete
          </button>
        </td>
      </tr>
    `).join("");

    // Wire delete buttons
    tbody.querySelectorAll(".pof-btn-del-row").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-del-idx"), 10);
        if (!isNaN(idx)) {
          state.observations.splice(idx, 1);
          state.observations.forEach((o, i) => { o.sNo = i + 1; });
          renderObservationTable();
          renderTelemetryGraph();
          showToast("Observation record deleted.");
        }
      });
    });

    updateProcedureRibbon();
  }

  function clearAllObservations() {
    if (state.observations.length === 0) return;
    if (confirm("Are you sure you want to clear all recorded observations in this session?")) {
      state.observations = [];
      renderObservationTable();
      renderTelemetryGraph();
      showToast("Observation table cleared.");
    }
  }

  function awardChallenge(chalId) {
    const chal = state.challenges[chalId];
    if (!chal || chal.completed) return;
    chal.completed = true;

    // Award XP and complete challenge authoritatively
    if (typeof onXpAwarded === "function") {
      onXpAwarded(chal.xp, `Completed POF Challenge: ${chal.title}`);
    }
    if (typeof onChallengeCompleted === "function") {
      onChallengeCompleted({
        challengeId: chal.id,
        experimentId: "pof-attenuation",
        xpAwarded: chal.xp
      });
    }

    renderChallengesDom();
    showToast(`Mastery Challenge Completed: ${chal.title} (+${chal.xp} XP)`);
  }

  function renderChallengesDom() {
    const gridEl = document.getElementById("pof-challenges-grid");
    const listEl = document.getElementById("pof-challenges-list");
    const countBadge = document.getElementById("pof-challenges-completed-count");
    const xpBadge = document.getElementById("pof-user-total-challenge-xp");

    const chalArray = Object.values(state.challenges);
    const completedList = chalArray.filter(c => c.completed);
    const completedCount = completedList.length;
    const totalXpEarned = completedList.reduce((sum, c) => sum + c.xp, 0);

    if (countBadge) countBadge.textContent = `${completedCount} / ${chalArray.length} Complete`;
    if (xpBadge) xpBadge.textContent = `+${totalXpEarned} XP`;

    const getIconSvg = (cId, completed) => {
      const strokeColor = completed ? "#10b981" : "#38bdf8";
      switch (cId) {
        case "pof-chal-pin":
          return `<svg class="svg-icon svg-icon-md" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line></svg>`;
        case "pof-chal-connect":
          return `<svg class="svg-icon svg-icon-md" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`;
        case "pof-chal-pout":
          return `<svg class="svg-icon svg-icon-md" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
        case "pof-chal-calc":
          return `<svg class="svg-icon svg-icon-md" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path><path d="M12 14h.01"></path><path d="M8 14h.01"></path><path d="M12 18h.01"></path><path d="M8 18h.01"></path></svg>`;
        case "pof-chal-multi":
          return `<svg class="svg-icon svg-icon-md" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`;
        case "pof-chal-bend":
          return `<svg class="svg-icon svg-icon-md" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`;
        default:
          return `<svg class="svg-icon svg-icon-md" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
      }
    };

    const cardsHtml = chalArray.map(c => `
      <div class="challenge-item ${c.completed ? 'completed' : ''}" id="pof-ch-${c.id}">
        <div class="challenge-badge-icon">
          ${getIconSvg(c.id, c.completed)}
        </div>
        <div class="challenge-info">
          <div class="challenge-title-row">
            <h4>${c.title}</h4>
            <span class="challenge-reward-pill">+${c.xp} XP</span>
          </div>
          <p>${c.desc}</p>
          <div class="challenge-footer">
            <span class="challenge-status-tag ${c.completed ? 'completed' : 'pending'}">
              ${c.completed ? '✓ Completed' : 'Pending'}
            </span>
          </div>
        </div>
      </div>
    `).join("");

    if (gridEl) gridEl.innerHTML = cardsHtml;
    if (listEl) listEl.innerHTML = cardsHtml;
  }

  function openInspectorModal(componentKey) {
    const comp = COMPONENT_DETAILS[componentKey];
    if (!comp) return;
    state.inspectedComponent = componentKey;
    state.tourFlags.sourceIdentified = true;

    const modal = document.getElementById("pof-inspector-modal");
    if (!modal) return;

    document.getElementById("pof-insp-badge").textContent = comp.badge;
    document.getElementById("pof-insp-title").textContent = comp.title;
    document.getElementById("pof-insp-desc").textContent = comp.desc;

    const paramsList = document.getElementById("pof-insp-params");
    if (paramsList) {
      paramsList.innerHTML = comp.specs.map(s => `
        <div class="pof-inspector-param-row">
          <span>${s.label}:</span>
          <strong>${s.value}</strong>
        </div>
      `).join("");
    }

    modal.classList.remove("hidden");
    renderBenchApparatus();
  }

  function closeInspectorModal() {
    const modal = document.getElementById("pof-inspector-modal");
    if (modal) modal.classList.add("hidden");
    state.inspectedComponent = null;
    renderBenchApparatus();
  }

  function exportPdfReport() {
    const btn = document.getElementById("pof-btn-export-pdf");
    if (btn && btn.disabled) return;

    if (state.observations.length === 0) {
      showToast("Please record at least one observation before generating a PDF report!");
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.setAttribute("data-orig-html", btn.innerHTML);
      btn.innerHTML = `<span>Generating Report...</span>`;
    }

    const profile = (typeof getStoredUserProfile === "function") ? getStoredUserProfile() : null;
    const studentName = (profile?.name || profile?.displayName || "").trim() || "Guest Student";
    const collegeName = (profile?.college || profile?.occ || "").trim() || "---";
    const studentRole = profile?.edu || "Student Researcher";
    const studentEmail = profile?.email || "guest@physix.lab";

    try {
      generateLabReportPdf({
        labTitle: "Optical Power Attenuation in Plastic Optical Fiber",
        labSubtitle: "Waveguide Transmission, Decibel Loss & Attenuation Coefficient Record",
        experimentCode: "EXP-07",
        studentName,
        collegeName,
        studentRole,
        studentEmail,
        parameters: [
          { label: "Optical Source", value: "650 nm Visible Red Diode / LED" },
          { label: "Waveguide Type", value: "Step-Index PMMA POF (980/1000 um)" },
          { label: "Nominal Input Power", value: `${(state.recordedPinMw || 3.0).toFixed(3)} mW` },
          { label: "Calculated Mean Attenuation", value: `${(state.calculatedAlphaDbPerKm || 180.0).toFixed(1)} dB/km` }
        ],
        kpiCards: [
          { label: "Reference Power (Pin)", value: `${(state.recordedPinMw || 3.0).toFixed(3)} mW` },
          { label: "Transmitted Power (Pout)", value: `${(state.recordedPoutMw || 0.0).toFixed(3)} mW` },
          { label: "Total Loss (AdB)", value: `${(state.calculatedTotalAttDb || 0.0).toFixed(3)} dB` },
          { label: "Attenuation Coeff (alpha)", value: `${(state.calculatedAlphaDbPerKm || 0.0).toFixed(1)} dB/km` }
        ],
        tableHeaders: ["S.No.", "Length (m)", "Pin (mW)", "Pout (mW)", "Total Loss (dB)", "alpha (dB/km)", "Condition"],
        tableRows: state.observations.map(o => [
          o.sNo.toString(),
          o.length.toFixed(1),
          o.pin.toFixed(3),
          o.pout.toFixed(3),
          o.totalAtt.toFixed(3),
          o.alpha.toFixed(1),
          o.bend
        ]),
        conclusions: [
          "1. Optical power transmission decays exponentially with fiber length, confirming P_out = P_in * 10^(-alpha*L/10).",
          `2. Experimental attenuation coefficient alpha = ${(state.calculatedAlphaDbPerKm || 180.0).toFixed(1)} dB/km matches standard PMMA core literature values.`,
          "3. Decibel attenuation scales linearly with distance, demonstrating constant distributed loss per unit length."
        ],
        graphCanvas
      });

      showToast("PDF Lab Report generated successfully!");
      if (btn) btn.innerHTML = `<span>Report Exported!</span>`;
    } catch (err) {
      console.error("[POF Attenuation] PDF Export error:", err);
      showToast("Error generating PDF report.");
    } finally {
      if (btn) {
        setTimeout(() => {
          btn.disabled = false;
          btn.innerHTML = btn.getAttribute("data-orig-html") || `<span>Export PDF Logbook</span>`;
        }, 1500);
      }
    }
  }

  // --------------------------------------------------------------------------
  // OPTICAL PROPAGATION ANIMATION & MASTER POWER CONTROLLER
  // --------------------------------------------------------------------------

  function startAnimationLoop() {
    if (state.animActive) return;
    state.animActive = true;
    function loop() {
      if (!state.animActive) return;
      state.animPhase = (state.animPhase + 0.008) % 1.0;
      renderBenchApparatus();
      animFrameId = requestAnimationFrame(loop);
    }
    animFrameId = requestAnimationFrame(loop);
  }

  function stopAnimationLoop() {
    state.animActive = false;
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    renderBenchApparatus();
  }

  function setSourcePower(isPowered) {
    state.sourcePowered = !!isPowered;
    state.tourFlags.sourcePowered = state.sourcePowered;
    state.meterNeedsMeasure = true;

    // Synchronize Top Simulation Bar Master Power Button
    const topPowerBtn = document.getElementById("pof-top-power-btn");
    const topPowerLamp = document.getElementById("pof-top-power-lamp");
    const topPowerState = document.getElementById("pof-top-power-state");
    const topLiveDot = document.getElementById("pof-top-live-dot");

    if (topPowerBtn) topPowerBtn.classList.toggle("active", state.sourcePowered);
    if (topPowerLamp) topPowerLamp.classList.toggle("active", state.sourcePowered);
    if (topPowerState) topPowerState.textContent = state.sourcePowered ? "ON" : "OFF";
    if (topLiveDot) topLiveDot.classList.toggle("active", state.sourcePowered);

    // Synchronize Deck Master Power Button & Badges
    const btnPower = document.getElementById("pof-btn-power");
    const deckPowerIndicator = document.getElementById("pof-deck-power-indicator");
    const deckPowerText = document.getElementById("pof-deck-power-text");
    const deckPowerBadge = document.getElementById("pof-deck-power-badge");

    if (btnPower) btnPower.classList.toggle("on", state.sourcePowered);
    if (deckPowerIndicator) deckPowerIndicator.classList.toggle("active", state.sourcePowered);
    if (deckPowerText) deckPowerText.textContent = state.sourcePowered ? "SOURCE: POWERED ON" : "SOURCE: POWER OFF";
    if (deckPowerBadge) deckPowerBadge.textContent = state.sourcePowered ? "ACTIVE" : "CLICK TO START";

    if (state.sourcePowered) {
      startAnimationLoop();
      showToast("Optical Source powered ON (650 nm Laser/LED Transmitter Active)");
    } else {
      stopAnimationLoop();
      showToast("Optical Source powered OFF (Standby Mode)");
    }

    updatePowerReadout();
    updateProcedureRibbon();
  }

  function toggleSourcePower() {
    setSourcePower(!state.sourcePowered);
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION & DOM EVENT BINDINGS
  // --------------------------------------------------------------------------

  function init() {
    benchCanvas = document.getElementById("pof-bench-canvas");
    graphCanvas = document.getElementById("pof-graph-canvas");

    if (benchCanvas) {
      benchCtx = setupCanvasDpi(benchCanvas, LOGICAL_BENCH_W, LOGICAL_BENCH_H);
    }
    if (graphCanvas) {
      graphCtx = graphCanvas.getContext("2d");
    }

    // Synchronize initial power state
    setSourcePower(state.sourcePowered);

    // Master Power Toggle Buttons (Top Viewport Bar & Hardware Deck)
    document.getElementById("pof-top-power-btn")?.addEventListener("click", toggleSourcePower);
    document.getElementById("pof-btn-power")?.addEventListener("click", toggleSourcePower);

    // Optical Source Emitted Power Slider & Presets (P_in)
    const sliderSourcePower = document.getElementById("pof-source-power-slider");
    const valSourcePower = document.getElementById("pof-val-source-power");
    sliderSourcePower?.addEventListener("input", (e) => {
      state.sourceBasePowerMw = parseFloat(e.target.value);
      state.meterNeedsMeasure = true;
      if (valSourcePower) valSourcePower.textContent = `${state.sourceBasePowerMw.toFixed(2)} mW`;
      document.querySelectorAll(".pof-power-preset-chip").forEach(chip => {
        const p = parseFloat(chip.getAttribute("data-power"));
        chip.classList.toggle("active", Math.abs(p - state.sourceBasePowerMw) < 0.05);
      });
      updatePowerReadout();
      renderBenchApparatus();
    });

    document.querySelectorAll(".pof-power-preset-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const p = parseFloat(chip.getAttribute("data-power"));
        if (!isNaN(p)) {
          state.sourceBasePowerMw = p;
          state.meterNeedsMeasure = true;
          if (sliderSourcePower) sliderSourcePower.value = p.toFixed(1);
          if (valSourcePower) valSourcePower.textContent = `${p.toFixed(2)} mW`;
          document.querySelectorAll(".pof-power-preset-chip").forEach(c => c.classList.remove("active"));
          chip.classList.add("active");
          updatePowerReadout();
          renderBenchApparatus();
          showToast(`Laser source power set to ${p.toFixed(1)} mW`);
        }
      });
    });

    // Interactive Procedure Ribbon Step Guidance
    document.getElementById("pof-step-indicator-1")?.addEventListener("click", () => {
      if (!state.sourcePowered) toggleSourcePower();
      showToast("Step 1: 650 nm Laser Transmitter active.");
    });
    document.getElementById("pof-step-indicator-2")?.addEventListener("click", () => {
      document.getElementById("pof-mode-ref")?.click();
      showToast("Step 2: Reference Mode (P_in) selected. Click 'MEASURE POWER'.");
    });
    document.getElementById("pof-step-indicator-3")?.addEventListener("click", () => {
      document.getElementById("pof-mode-out")?.click();
      showToast("Step 3: POF Output Mode (P_out) selected. Adjust length and click 'MEASURE POWER'.");
    });
    document.getElementById("pof-step-indicator-4")?.addEventListener("click", () => {
      showToast("Step 4: Click 'Record Observation' to log attenuation measurements.");
    });

    // Fiber Connect / Disconnect Button
    const btnConnect = document.getElementById("pof-btn-connect");
    btnConnect?.addEventListener("click", () => {
      state.fiberConnected = !state.fiberConnected;
      state.tourFlags.fiberConnected = state.fiberConnected;
      state.meterNeedsMeasure = true;
      btnConnect.classList.toggle("connected", state.fiberConnected);
      btnConnect.querySelector("span").textContent = state.fiberConnected ? "POF: CONNECTED" : "POF: DISCONNECTED";

      // Challenge 2 Check
      if (state.fiberConnected && !state.challenges["pof-chal-connect"].completed) {
        awardChallenge("pof-chal-connect");
      }

      updatePowerReadout();
      renderBenchApparatus();
      showToast(state.fiberConnected ? "Plastic Optical Fiber connected to couplers" : "Plastic Optical Fiber disconnected");
    });

    // Length Slider & Presets
    const sliderLength = document.getElementById("pof-length-slider");
    const displayLength = document.getElementById("pof-display-length");
    sliderLength?.addEventListener("input", (e) => {
      state.fiberLengthM = parseFloat(e.target.value);
      state.tourFlags.lengthConfigured = true;
      state.meterNeedsMeasure = true;
      if (displayLength) displayLength.textContent = `${state.fiberLengthM.toFixed(1)} m`;
      updatePowerReadout();
      renderBenchApparatus();
    });

    document.querySelectorAll(".pof-preset-chip[data-length]").forEach(chip => {
      chip.addEventListener("click", () => {
        const len = parseFloat(chip.getAttribute("data-length"));
        if (!isNaN(len)) {
          state.fiberLengthM = len;
          state.tourFlags.lengthConfigured = true;
          state.meterNeedsMeasure = true;
          if (sliderLength) sliderLength.value = len;
          if (displayLength) displayLength.textContent = `${len.toFixed(1)} m`;
          document.querySelectorAll(".pof-preset-chip[data-length]").forEach(c => c.classList.remove("active"));
          chip.classList.add("active");
          updatePowerReadout();
          renderBenchApparatus();
        }
      });
    });

    // Alignment Knobs (Input & Output)
    const sliderInputAlign = document.getElementById("pof-input-align-slider");
    sliderInputAlign?.addEventListener("input", (e) => {
      state.inputOffsetMm = parseFloat(e.target.value);
      state.inputCouplingEfficiency = calculateCouplingEfficiency(state.inputOffsetMm);
      state.meterNeedsMeasure = true;
      document.getElementById("pof-val-input-align").textContent = `${state.inputOffsetMm.toFixed(1)} mm`;
      updatePowerReadout();
    });

    const sliderOutputAlign = document.getElementById("pof-output-align-slider");
    sliderOutputAlign?.addEventListener("input", (e) => {
      state.outputOffsetMm = parseFloat(e.target.value);
      state.outputCouplingEfficiency = calculateCouplingEfficiency(state.outputOffsetMm);
      state.meterNeedsMeasure = true;
      document.getElementById("pof-val-output-align").textContent = `${state.outputOffsetMm.toFixed(1)} mm`;
      updatePowerReadout();
    });

    // Bending Mode Chips
    document.querySelectorAll(".pof-bend-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const mode = chip.getAttribute("data-bend");
        state.bendMode = mode;
        state.meterNeedsMeasure = true;
        document.querySelectorAll(".pof-bend-chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        updatePowerReadout();
        renderBenchApparatus();
        showToast(`Fiber Bending condition: ${mode.toUpperCase()} (${getEffectiveBendLossDb()} dB loss)`);
      });
    });

    // Meter Mode Buttons (Reference vs POF Output)
    const btnModeRef = document.getElementById("pof-mode-ref");
    const btnModeOut = document.getElementById("pof-mode-out");
    btnModeRef?.addEventListener("click", () => {
      state.meterMode = "reference";
      state.tourFlags.modeRefSelected = true;
      btnModeRef.classList.add("active");
      btnModeOut.classList.remove("active");
      state.meterNeedsMeasure = true;
      updatePowerReadout();
    });
    btnModeOut?.addEventListener("click", () => {
      state.meterMode = "output";
      state.tourFlags.modeOutSelected = true;
      btnModeOut.classList.add("active");
      btnModeRef.classList.remove("active");
      state.meterNeedsMeasure = true;
      updatePowerReadout();
    });

    // Meter Unit Buttons (mW vs uW)
    const btnUnitMw = document.getElementById("pof-unit-mw");
    const btnUnitUw = document.getElementById("pof-unit-uw");
    btnUnitMw?.addEventListener("click", () => {
      state.meterUnit = "mW";
      btnUnitMw.classList.add("active");
      btnUnitUw.classList.remove("active");
      updatePowerReadout();
    });
    btnUnitUw?.addEventListener("click", () => {
      state.meterUnit = "uW";
      btnUnitUw.classList.add("active");
      btnUnitMw.classList.remove("active");
      updatePowerReadout();
    });

    // Measure Power Trigger Button
    document.getElementById("pof-btn-measure")?.addEventListener("click", () => {
      triggerMeasurement();
    });

    // Record Observation Button
    document.getElementById("pof-btn-record-obs")?.addEventListener("click", () => {
      recordObservation();
    });

    // Clear Observations Button
    document.getElementById("pof-btn-clear-obs")?.addEventListener("click", () => {
      clearAllObservations();
    });

    // Export PDF Report Button
    document.getElementById("pof-btn-export-pdf")?.addEventListener("click", () => {
      exportPdfReport();
    });

    // Graph Mode Tabs
    document.getElementById("pof-graph-tab-power")?.addEventListener("click", () => {
      state.graphMode = "power";
      state.tourFlags.graphInspected = true;
      document.getElementById("pof-graph-tab-power")?.classList.add("active");
      document.getElementById("pof-graph-tab-att")?.classList.remove("active");
      renderTelemetryGraph();
    });
    document.getElementById("pof-graph-tab-att")?.addEventListener("click", () => {
      state.graphMode = "attenuation";
      state.tourFlags.graphInspected = true;
      document.getElementById("pof-graph-tab-att")?.classList.add("active");
      document.getElementById("pof-graph-tab-power")?.classList.remove("active");
      renderTelemetryGraph();
    });

    // Inspector Modal Close Buttons
    document.getElementById("pof-insp-close-btn")?.addEventListener("click", closeInspectorModal);
    document.getElementById("pof-insp-dismiss-btn")?.addEventListener("click", closeInspectorModal);

    // Reset Apparatus Button
    document.getElementById("pof-btn-reset-exp")?.addEventListener("click", () => {
      setSourcePower(false);
      state.sourceBasePowerMw = 3.00;
      state.fiberConnected = true;
      state.fiberLengthM = 5.0;
      state.inputOffsetMm = 0.0;
      state.outputOffsetMm = 0.0;
      state.inputCouplingEfficiency = 1.0;
      state.outputCouplingEfficiency = 1.0;
      state.bendMode = "straight";
      state.meterMode = "reference";
      state.meterUnit = "mW";
      state.meterNeedsMeasure = true;

      state.recordedPinMw = null;
      state.recordedPoutMw = null;
      state.calculatedTotalAttDb = null;
      state.calculatedAlphaDbPerKm = null;

      const sliderSourcePower = document.getElementById("pof-source-power-slider");
      if (sliderSourcePower) sliderSourcePower.value = "3.0";
      const valSourcePower = document.getElementById("pof-val-source-power");
      if (valSourcePower) valSourcePower.textContent = "3.00 mW";
      document.querySelectorAll(".pof-power-preset-chip").forEach(c => {
        c.classList.toggle("active", c.getAttribute("data-power") === "3.0");
      });

      const btnConn = document.getElementById("pof-btn-connect");
      if (btnConn) {
        btnConn.classList.add("connected");
        const span = btnConn.querySelector("span:last-child");
        if (span) span.textContent = "POF: CONNECTED";
      }

      const sliderLength = document.getElementById("pof-length-slider");
      if (sliderLength) sliderLength.value = "5.0";
      const displayLength = document.getElementById("pof-display-length");
      if (displayLength) displayLength.textContent = "5.0 m";

      const inSlider = document.getElementById("pof-input-align-slider");
      if (inSlider) inSlider.value = "0.0";
      const inVal = document.getElementById("pof-val-input-align");
      if (inVal) inVal.textContent = "0.0 mm";

      const outSlider = document.getElementById("pof-output-align-slider");
      if (outSlider) outSlider.value = "0.0";
      const outVal = document.getElementById("pof-val-output-align");
      if (outVal) outVal.textContent = "0.0 mm";

      document.querySelectorAll(".pof-preset-chip[data-length]").forEach(c => {
        c.classList.toggle("active", c.getAttribute("data-length") === "5.0");
      });

      document.querySelectorAll(".pof-bend-chip").forEach(c => {
        c.classList.toggle("active", c.getAttribute("data-bend") === "straight");
      });

      const btnModeRef = document.getElementById("pof-mode-ref");
      const btnModeOut = document.getElementById("pof-mode-out");
      btnModeRef?.classList.add("active");
      btnModeOut?.classList.remove("active");

      const btnUnitMw = document.getElementById("pof-unit-mw");
      const btnUnitUw = document.getElementById("pof-unit-uw");
      btnUnitMw?.classList.add("active");
      btnUnitUw?.classList.remove("active");

      updatePowerReadout();
      renderBenchApparatus();
      renderObservationTable();
      renderTelemetryGraph();
      renderChallengesDom();
      updateProcedureRibbon();
      showToast("Optical bench apparatus reset to factory baseline.");
    });

    // Canvas Click Hit-Testing for Component Inspection
    benchCanvas?.addEventListener("click", (e) => {
      const rect = benchCanvas.getBoundingClientRect();
      const scaleX = LOGICAL_BENCH_W / rect.width;
      const scaleY = LOGICAL_BENCH_H / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      for (const [key, reg] of Object.entries(COMPONENT_REGIONS)) {
        if (
          clickX >= reg.x && clickX <= reg.x + reg.w &&
          clickY >= reg.y && clickY <= reg.y + reg.h
        ) {
          openInspectorModal(key);
          return;
        }
      }
    });

    // Physical Interpretation Question Event
    document.querySelectorAll(".pof-interp-opt-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const isCorrect = btn.getAttribute("data-correct") === "true";
        document.querySelectorAll(".pof-interp-opt-btn").forEach(b => b.classList.remove("correct"));
        const feedbackEl = document.getElementById("pof-interp-feedback");

        if (isCorrect) {
          btn.classList.add("correct");
          state.tourFlags.interpretationSubmitted = true;
          if (feedbackEl) {
            feedbackEl.className = "pof-interp-feedback success";
            feedbackEl.innerHTML = "<strong>Correct!</strong> In accordance with the Bouguer-Lambert-Beer law, longer cable lengths increase cumulative distributed Rayleigh scattering and material absorption. Macrobending adds radiation leakage, and poor facet alignment degrades input/output coupling efficiency.";
          }
          showToast("Laboratory Mastery verified! Excellent physical interpretation.");
        } else {
          if (feedbackEl) {
            feedbackEl.className = "pof-interp-feedback";
            feedbackEl.style.background = "rgba(239, 68, 68, 0.15)";
            feedbackEl.style.color = "#f87171";
            feedbackEl.innerHTML = "<strong>Incorrect.</strong> Review how distributed waveguide loss, macrobending radius, and Fresnel facet coupling affect optical transmission.";
          }
        }
      });
    });

    // Window resize handler
    window.addEventListener("resize", () => {
      if (benchCanvas) {
        benchCtx = setupCanvasDpi(benchCanvas, LOGICAL_BENCH_W, LOGICAL_BENCH_H);
        renderBenchApparatus();
      }
      renderTelemetryGraph();
    });

    // Initial Renders
    renderBenchApparatus();
    updatePowerReadout();
    renderObservationTable();
    renderTelemetryGraph();
    renderChallengesDom();
  }

  function renderAll() {
    setSourcePower(state.sourcePowered);
    if (benchCanvas) {
      benchCtx = setupCanvasDpi(benchCanvas, LOGICAL_BENCH_W, LOGICAL_BENCH_H);
      renderBenchApparatus();
    }
    updatePowerReadout();
    renderObservationTable();
    renderTelemetryGraph();
    renderChallengesDom();
    updateProcedureRibbon();
  }

  function hydrateChallenges(completedList = []) {
    if (!Array.isArray(completedList)) return;
    completedList.forEach(id => {
      if (state.challenges[id]) {
        state.challenges[id].completed = true;
      }
    });
    renderChallengesDom();
  }

  // Tour Step Validation Interface
  function validateTourStep(stepIndex) {
    switch (stepIndex) {
      case 0: // Step 1: Identify optical source
        return { valid: true };
      case 1: // Step 2: Switch on source
        if (!state.sourcePowered) {
          return { valid: false, error: "Please toggle the Optical Source power switch to ON before proceeding." };
        }
        return { valid: true };
      case 2: // Step 3: Select reference measurement
        if (state.meterMode !== "reference") {
          return { valid: false, error: "Please select the REFERENCE (P_in) mode on the Optical Power Meter." };
        }
        return { valid: true };
      case 3: // Step 4: Measure reference power
        if (state.recordedPinMw === null || state.recordedPinMw <= 0) {
          return { valid: false, error: "Please click 'MEASURE POWER' to record the reference optical power P_in." };
        }
        return { valid: true };
      case 4: // Step 5: Connect fiber
        if (!state.fiberConnected) {
          return { valid: false, error: "Please connect the Plastic Optical Fiber (POF) between the coupling assemblies." };
        }
        return { valid: true };
      case 5: // Step 6: Set fiber length
        return { valid: true };
      case 6: // Step 7: Select output measurement configuration
        if (state.meterMode !== "output") {
          return { valid: false, error: "Please select the POF OUTPUT (P_out) mode on the Optical Power Meter." };
        }
        return { valid: true };
      case 7: // Step 8: Take output power reading
        if (state.recordedPoutMw === null || state.recordedPoutMw <= 0) {
          return { valid: false, error: "Please click 'MEASURE POWER' to capture the transmitted optical power P_out." };
        }
        return { valid: true };
      case 8: // Step 9: Calculate total attenuation
        if (state.calculatedTotalAttDb === null) {
          return { valid: false, error: "Please calculate the total attenuation A_dB = 10 log10(P_in / P_out)." };
        }
        return { valid: true };
      case 9: // Step 10: Calculate attenuation per km
        if (state.calculatedAlphaDbPerKm === null) {
          return { valid: false, error: "Please calculate the attenuation coefficient α = (1000/L) · A_dB." };
        }
        return { valid: true };
      case 10: // Step 11: Record observation
        if (state.observations.length === 0) {
          return { valid: false, error: "Please click 'Record Current Observation' to log the data in the table." };
        }
        return { valid: true };
      case 11: // Step 12: Inspect graph
        return { valid: true };
      case 12: // Step 13: Answer interpretation
        if (!state.tourFlags.interpretationSubmitted) {
          return { valid: false, error: "Please select and submit the physical interpretation question to complete the session." };
        }
        return { valid: true };
      default:
        return { valid: true };
    }
  }

  return {
    init,
    renderAll,
    hydrateChallenges,
    validateTourStep,
    state
  };
}
