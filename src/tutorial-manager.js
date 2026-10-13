import { renderMathInDOM } from "./math-renderer.js";
/**
 * PhysiX Interactive Guided Tutorial / Onboarding System
 * Provides complete, per-experiment first-time onboarding walkthroughs
 * with spotlight cutouts, educational explanations, responsive tooltips,
 * and user-scoped offline-safe persistence.
 */

import { renderMathInText } from "./math-renderer.js";
import { db, doc, updateDoc } from "./firebase.js";

let _authReadyPromise = null;
export function setAuthReadyPromise(p) {
  _authReadyPromise = p;
}

// Storage key helper for user-scoping and offline/guest support
export function getTutorialStorageKey(userId) {
  const cleanId = (userId && userId !== "guest") ? userId : "guest";
  return `physix_tutorials_${cleanId}`;
}

export function getCompletedTutorials(userId) {
  try {
    const raw = localStorage.getItem(getTutorialStorageKey(userId));
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch (err) {
    console.warn("[Tutorial] Error reading completion state:", err);
    return {};
  }
}

export function isExperimentTutorialCompleted(expId, userId) {
  const normalized = normalizeExpId(expId);
  const completed = getCompletedTutorials(userId);
  if (completed[normalized]) return true;

  // Guest fallback / migration check: if user completed it on this device before signing in
  if (userId && userId !== "guest") {
    const guestCompleted = getCompletedTutorials("guest");
    if (guestCompleted[normalized]) {
      // Auto-migrate to authenticated account
      markExperimentTutorialCompleted(normalized, userId);
      return true;
    }
  }

  return false;
}

export function markExperimentTutorialCompleted(expId, userId) {
  const normalized = normalizeExpId(expId);
  try {
    const completed = getCompletedTutorials(userId);
    completed[normalized] = true;
    localStorage.setItem(getTutorialStorageKey(userId), JSON.stringify(completed));

    // If signed-in user, also persist to Firestore in cloud
    if (userId && userId !== "guest" && db) {
      updateDoc(doc(db, "users", userId), {
        [`tutorialsCompleted.${normalized}`]: true
      }).catch(err => {
        console.warn("[Tutorial] Cloud sync notice (will retry on next sync):", err);
      });
    }

    console.log(`[Tutorial] Marked tutorial completed for experiment: ${normalized} (user: ${userId || "guest"})`);
  } catch (err) {
    console.warn("[Tutorial] Error saving completion state:", err);
  }
}

export function syncTutorialsWithCloud(userId, cloudTutorials = {}) {
  if (!userId || userId === "guest" || !cloudTutorials) return;
  try {
    const local = getCompletedTutorials(userId);
    const guest = getCompletedTutorials("guest");
    const merged = { ...guest, ...local, ...cloudTutorials };
    localStorage.setItem(getTutorialStorageKey(userId), JSON.stringify(merged));
    return merged;
  } catch (err) {
    console.warn("[Tutorial] Error syncing tutorials with cloud:", err);
  }
}

export function resetExperimentTutorial(expId, userId) {
  const normalized = normalizeExpId(expId);
  try {
    const completed = getCompletedTutorials(userId);
    delete completed[normalized];
    localStorage.setItem(getTutorialStorageKey(userId), JSON.stringify(completed));
  } catch (err) {
    console.warn("[Tutorial] Error resetting tutorial state:", err);
  }
}

export function normalizeExpId(expId) {
  if (!expId) return "projectile";
  if (expId === "diffraction-grating" || expId === "diffraction") return "diffraction";
  if (expId === "optical-fibre" || expId === "optical") return "optical";
  if (expId === "physics-sandbox" || expId === "sandbox") return "sandbox";
  if (expId === "colour-sensor" || expId === "color-sensor") return "colour-sensor";
  if (expId === "hall-effect" || expId === "hall") return "hall-effect";
  if (expId === "diode" || expId === "diode-characteristics") return "diode";
  if (expId === "pof-attenuation" || expId === "optical-attenuation" || expId === "pof") return "pof-attenuation";
  return "projectile";
}

export function getExperimentFriendlyName(expId) {
  const normalized = normalizeExpId(expId);
  switch (normalized) {
    case "projectile": return "Exp 1: 2D Projectile Motion";
    case "optical": return "Exp 2: Optical Fibre NA";
    case "colour-sensor": return "Exp 3: Study of Colour Sensor";
    case "hall-effect": return "Exp 4: Hall Effect Experiment";
    case "diffraction": return "Exp 5: Diffraction Grating";
    case "diode": return "Exp 6: Diode Characteristics";
    case "pof-attenuation": return "Exp 7: Plastic Optical Fiber Attenuation";
    case "sandbox": return "Physics Sandbox";
    default: return "Interactive Physics Lab";
  }
}

// =========================================================================
// TUTORIAL STEP DEFINITIONS FOR ALL 5 EXPERIMENTS
// =========================================================================

export const TUTORIAL_DEFINITIONS = {
  // -----------------------------------------------------------------------
  // EXPERIMENT 1: 2D PROJECTILE MOTION
  // -----------------------------------------------------------------------
  projectile: [
    {
      id: "proj-welcome",
      selector: "#exp-projectile-section .simulation-card",
      title: "Welcome to 2D Projectile Motion",
      category: "OVERVIEW & LAB PURPOSE",
      description: "Explore classical Newtonian projectile dynamics under planetary gravitational fields. This simulation integrates real-time kinematics where horizontal motion ($v_x = v_0\\cos\\theta$) remains constant while vertical motion experiences constant gravitational acceleration ($a_y = -g$).",
      placement: "right"
    },
    {
      id: "proj-canvas",
      selector: "#simulation",
      title: "Kinematic Simulation Viewport",
      category: "REAL-TIME TRAJECTORY",
      description: "Watch the cannon fire a projectile along a parabolic ballistic curve: $y(x) = h_0 + x\\tan\\theta - \\frac{g x^2}{2(v_0\\cos\\theta)^2}$. Trajectory points, velocity vectors, and comparison ghost trails render live at 60 FPS.",
      placement: "bottom"
    },
    {
      id: "proj-hud",
      selector: "#exp-projectile-section .telemetry-hud",
      title: "Live Telemetry Flight HUD",
      category: "IN-FLIGHT SENSOR READOUT",
      description: "Monitors instantaneous projectile flight data in real time: Elapsed Airtime ($t$), Vertical Altitude ($y$), Horizontal Downrange Distance ($x$), and Resultant Velocity ($v = \\sqrt{v_x^2 + v_y^2}$).",
      placement: "top"
    },
    {
      id: "proj-velocity",
      selector: "#velocity",
      title: "Initial Launch Velocity (v₀)",
      category: "CONTROL DECK • SPEED",
      description: "Adjust the muzzle exit speed from 5.0 to 50.0 m/s. Increasing initial velocity expands both flight duration and ground range proportionally to $v_0^2$. Notice how both velocity vector components scale immediately.",
      placement: "left"
    },
    {
      id: "proj-angle",
      selector: "#angle",
      title: "Launch Elevation Angle (θ)",
      category: "CONTROL DECK • TRAJECTORY SHAPE",
      description: "Vary the barrel angle from 0° (flat fire) to 90° (pure vertical). In a vacuum over level ground, 45° yields theoretical maximum ground range ($R_{max} = v_0^2/g$), while complementary angles (e.g., 30° and 60°) achieve identical ground ranges.",
      placement: "left"
    },
    {
      id: "proj-height",
      selector: "#height",
      title: "Initial Elevation Height (h₀)",
      category: "CONTROL DECK • LAUNCH PLATFORM",
      description: "Elevate the cannon up to 30.0 meters above the ground using the slider or quick buttons (5m, 10m Tower, 20m Platform). As initial height increases, the optimum launch angle for maximum range drops below 45°.",
      placement: "left"
    },
    {
      id: "proj-gravity",
      selector: "#gravity",
      title: "Planetary Gravity Acceleration (g)",
      category: "CONTROL DECK • CELESTIAL MECHANICS",
      description: "Simulate firing on different celestial bodies: Moon (1.6 m/s²), Mars (3.7 m/s²), Earth (9.8 m/s²), or Jupiter (24.8 m/s²). Lower gravitational acceleration dramatically extends airtime and increases trajectory height.",
      placement: "left"
    },
    {
      id: "proj-toggles",
      selector: "#exp-projectile-section .toggles-group",
      title: "Visualizers & Target Challenge Mode",
      category: "DISPLAY SWITCHES",
      description: "Toggle live Velocity Vectors (green $v_x, v_y, v$), Ghost Comparison Trails to benchmark parameter tweaks, or activate Target Landing Challenge Mode to spawn a bullseye target at a randomized distance.",
      placement: "left"
    },
    {
      id: "proj-buttons",
      selector: "#exp-projectile-section .buttons",
      title: "Launch, Reset & Scientific Logging",
      category: "EXPERIMENT ACTIONS",
      description: "Click Fire Cannon to execute the shot. Click Reset to return to the launcher origin, or Record Observation to log the flight parameters and kinematic telemetry directly into your permanent Laboratory Logbook table below.",
      placement: "top"
    },
    {
      id: "proj-results",
      selector: "#exp-projectile-section .results-container",
      title: "Kinematic Analytics & Peak Results",
      category: "THEORETICAL VERIFICATION",
      description: "Displays theoretical and measured kinematic peaks: Peak Maximum Height ($H$), Total Ground Range ($R$), Total Time of Flight ($T$), and Impact Landing Velocity ($v_f$). Compare these values with analytical formulas!",
      placement: "top"
    },
    {
      id: "proj-challenges",
      selector: "#exp-projectile-section .challenges-card",
      title: "Kinematics Mastery Challenges",
      category: "XP & STUDENT DOSSIER",
      description: "Put your physics intuition to the test! Accomplish challenges like landing directly on a bullseye or achieving maximum altitude to earn student XP, unlock achievements, and level up your Student Dossier.",
      placement: "top"
    },
    {
      id: "proj-quiz",
      selector: "#btn-open-quiz",
      title: "Physics Quiz & Mastery Evaluation",
      category: "KNOWLEDGE CHECK & XP",
      description: "Test your theoretical and conceptual mastery! Click Physics Quiz in the top navigation to start a 10-question multiple-choice assessment tailored to this lab. Choose answers, submit your test, view detailed step-by-step solutions, and score 100% to earn bonus XP and the Quiz Whiz badge!",
      placement: "bottom"
    }
  ],

  // -----------------------------------------------------------------------
  // EXPERIMENT 2: OPTICAL FIBRE NUMERICAL APERTURE
  // -----------------------------------------------------------------------
  optical: [
    {
      id: "opt-welcome",
      selector: "#exp-optical-section .of-setup-container",
      title: "Welcome to Optical Fibre NA Analysis",
      category: "LABORATORY PURPOSE",
      description: "Determine the Numerical Aperture ($NA$) and Acceptance Angle ($\\theta_{max}$) of a step-index optical fibre using an optical bench rail and concentric circular screen. $NA$ defines the light-gathering capability governed by total internal reflection: $NA = \\sqrt{n_1^2 - n_2^2} = \\sin\\theta_{max}$.",
      placement: "bottom"
    },
    {
      id: "opt-switches",
      selector: "#exp-optical-section .of-hardware-deck",
      title: "Trainer Hardware Sequence",
      category: "APPARATUS ACTIVATION",
      description: "Operate the real-world bench trainer: 1. Turn ON Main Power, 2. Power the Laser Diode Emitter, 3. Connect the Fibre Cable patch cord to the source port, and 4. Lock the emitting tip securely into the NA Jig Clamp.",
      placement: "top"
    },
    {
      id: "opt-bench",
      selector: "#of-bench-canvas",
      title: "Optical Bench Vernier Rail",
      category: "OPTICAL PROFILE VIEWPORT",
      description: "Visualizes the physical laser propagation bench on a 0.0 to 6.0 cm precision graduated rail. Observe the divergent light cone emerging from the fibre core and striking the movable projection screen.",
      placement: "bottom"
    },
    {
      id: "opt-wavelength",
      selector: "#exp-optical-section .of-deck-section:nth-child(2)",
      title: "Laser Wavelength (λ) & Spectral Emission",
      category: "OPTICAL FREQUENCY",
      description: "Switch between calibrated laser emission lines: 650 nm (Red), 532 nm (Green), 450 nm (Blue), or 850 nm (Near-IR) or dial a custom wavelength. Fibre material dispersion slightly modulates refractive indices and divergence.",
      placement: "top"
    },
    {
      id: "opt-screen",
      selector: "#of-screen-canvas",
      title: "Concentric Circles Target Screen",
      category: "MEASUREMENT DETECTOR",
      description: "The illuminated projection face displays calibrated concentric rings. The illuminated spot diameter ($W$) is measured here. As distance $L$ changes, spot size expands proportionally with the divergence angle.",
      placement: "left"
    },
    {
      id: "opt-distance",
      selector: "#exp-optical-section .of-dist-control-group",
      title: "Screen Distance (L) Controls",
      category: "BENCH RAIL ADJUSTMENT",
      description: "Translate the screen along the bench rail from 0.5 cm to 5.0 cm using the slider, ±0.1 cm micro-steps, or quick presets. Notice how increasing distance $L$ expands the circular light spot diameter $W$.",
      placement: "left"
    },
    {
      id: "opt-telemetry",
      selector: "#exp-optical-section .results-container",
      title: "Real-time Numerical Aperture Telemetry",
      category: "OPTICAL CALCULATIONS",
      description: "Computes instantaneous parameters using trigonometric divergence: Screen Distance $L$, Spot Diameter $W$, Numerical Aperture $NA = \\frac{W}{\\sqrt{4L^2 + W^2}}$, and Acceptance Cone Half-Angle $\\theta_{max} = \\arcsin(NA)$.",
      placement: "top"
    },
    {
      id: "opt-actions",
      selector: "#exp-optical-section .of-action-buttons",
      title: "Record Observations & Laboratory Reports",
      category: "DATA LOGGING & PDF EXPORT",
      description: "Click Record Observation to log the current $(L, W, NA)$ data point into your observation table. Click Auto Setup to instantly configure the apparatus, or generate an official PhysiX Lab Report PDF!",
      placement: "top"
    },
    {
      id: "opt-challenges",
      selector: "#exp-optical-section .challenges-card",
      title: "Optical Fibre Mastery Challenges",
      category: "EXPERIMENTAL ACCURACY",
      description: "Complete targeted optical milestones, such as verifying distance-invariance of NA across 3 distinct zones, to earn student XP and prove experimental mastery.",
      placement: "top"
    },
    {
      id: "opt-quiz",
      selector: "#btn-open-quiz",
      title: "Optical Physics Quiz & XP Assessment",
      category: "KNOWLEDGE CHECK & XP",
      description: "Test your optics knowledge! Click Physics Quiz in the top navigation to challenge yourself on refractive index formulas, numerical aperture derivations, and ray acceptance cone geometry to earn student XP.",
      placement: "bottom"
    }
  ],

  // -----------------------------------------------------------------------
  // EXPERIMENT 3: STUDY OF COLOUR SENSOR (TCS3200)
  // -----------------------------------------------------------------------
  "colour-sensor": [
    {
      id: "cs-welcome",
      selector: "#exp-colour-sensor-section .cs-setup-container",
      title: "Welcome to Study of Colour Sensor (TCS3200)",
      category: "LABORATORY PURPOSE",
      description: "Study optoelectronic light-to-frequency conversion using the TCS3200 sensor. The chip houses an $8\\times 8$ photodiode array with selectable Red, Green, Blue, and Clear filters that output a 50% duty cycle square wave whose frequency is proportional to radiant irradiance.",
      placement: "bottom"
    },
    {
      id: "cs-switches",
      selector: "#exp-colour-sensor-section .cs-deck-buttons",
      title: "Sensor Power, LEDs & Mystery Specimen",
      category: "HARDWARE SWITCHES",
      description: "Switch ON the 5V DC power supply, then turn ON the 4x White LED spotlight ring to illuminate target swatches. You can also toggle the Mystery Sample mode to analyze and identify an unknown chemical pigment!",
      placement: "top"
    },
    {
      id: "cs-bench",
      selector: "#cs-bench-canvas",
      title: "Optoelectronic Spectrometer Bench",
      category: "PHYSICAL STANDOFF VIEWPORT",
      description: "Shows the TCS3200 sensor module mounted opposite the specimen holder on a 5.0 to 30.0 mm vernier rail. Reflected light rays reflect off the surface and enter the photodiode array.",
      placement: "bottom"
    },
    {
      id: "cs-swatches",
      selector: "#exp-colour-sensor-section .cs-swatches-grid",
      title: "Calibrated Surface Color Swatches",
      category: "SPECIMEN SELECTION",
      description: "Mount calibrated color swatches: Red, Green, Blue, Yellow, Cyan, Magenta, Orange, Violet, or calibration cards (White Reference and Matte Black). You can also use the custom color picker to test any hex tone.",
      placement: "top"
    },
    {
      id: "cs-filters",
      selector: "#exp-colour-sensor-section .cs-filter-control-group",
      title: "Photodiode Filter Matrix (S2 / S3)",
      category: "CHANNEL DECODER",
      description: "The TCS3200 uses two digital inputs (S2, S3) to select which internal photodiode group is active: Red, Green, Blue, or Clear (no optical filter). Cycle through filters to measure the spectral signature of the sample.",
      placement: "left"
    },
    {
      id: "cs-scaling",
      selector: "#exp-colour-sensor-section .cs-scale-control-group",
      title: "Frequency Output Prescaler (S0 / S1)",
      category: "CLOCK SCALING",
      description: "Select frequency scaling: 2%, 20%, or 100%. Dividing the output frequency adapts the signal for slower microcontrollers and prevents counter overflow under high-intensity illumination.",
      placement: "left"
    },
    {
      id: "cs-distance",
      selector: "#exp-colour-sensor-section .cs-dist-control-group",
      title: "Standoff Distance (d) Slider",
      category: "DISTANCE & ATTENUATION",
      description: "Adjust the sensor-to-target distance from 5.0 mm to 30.0 mm. Notice how radiant intensity drops off according to the inverse-square law ($E \\propto 1/d^2$), demonstrating optical attenuation.",
      placement: "left"
    },
    {
      id: "cs-detector",
      selector: "#cs-osc-canvas",
      title: "Colorimeter Reconstruction & Match Fidelity",
      category: "DIGITAL RGB SYNTHESIS",
      description: "Compares the actual specimen hue against the digital color reconstructed from measured $f_R, f_G, f_B$ frequency ratios. A live spectral fidelity percentage score grades color recognition accuracy.",
      placement: "left"
    },
    {
      id: "cs-telemetry",
      selector: "#exp-colour-sensor-section .results-container",
      title: "Sensor Frequency Telemetry",
      category: "LIVE FREQUENCY COUNTER",
      description: "Monitors instantaneous square wave output frequency ($f_{out}$ in kHz), normalized RGB frequency percentages, and spectral match fidelity in real time.",
      placement: "top"
    },
    {
      id: "cs-challenges",
      selector: "#exp-colour-sensor-section .challenges-card",
      title: "Color Sensor Mastery Challenges",
      category: "CALIBRATION & INVESTIGATION",
      description: "Complete White Balance calibration, identify the mystery chemical compound by analyzing peak frequencies, and execute standoff sweeps to earn student XP!",
      placement: "top"
    },
    {
      id: "cs-quiz",
      selector: "#btn-open-quiz",
      title: "Colorimetry Quiz & Spectral Knowledge",
      category: "KNOWLEDGE CHECK & XP",
      description: "Take the Colorimetry Quiz! Open Physics Quiz in the navbar to answer 10 questions on photodiode matrices, color filters ($S_2, S_3$), and frequency scaling ($S_0, S_1$) to prove your mastery and earn student XP.",
      placement: "bottom"
    }
  ],

  // -----------------------------------------------------------------------
  // EXPERIMENT 4: HALL EFFECT EXPERIMENT
  // -----------------------------------------------------------------------
  "hall-effect": [
    {
      id: "hall-welcome",
      selector: "#exp-hall-effect-section .cs-procedure-ribbon",
      title: "Welcome to Hall Effect Laboratory",
      category: "LABORATORY PURPOSE & OVERVIEW",
      description: "Investigate electromagnetic Lorentz force magnetotransport in semiconductors and metals. When current $I$ flows through a specimen under perpendicular magnetic field $B$, charge carriers deflect transversely, establishing the Hall electric field and voltage $V_H = \\frac{R_H I B}{t}$.",
      placement: "bottom"
    },
    {
      id: "hall-bench",
      selector: "#hall-bench-canvas",
      title: "Electromagnetic Bench Viewport",
      category: "APPARATUS & COIL POLES",
      description: "Visualizes the dual electromagnet pole pieces (North & South) producing uniform flux density $B$, and the central sample mount holding the precision wafer probe connected to constant current leads.",
      placement: "bottom"
    },
    {
      id: "hall-specimens",
      selector: "#exp-hall-effect-section .hall-specimens-bar",
      title: "Specimen Selection Bay",
      category: "MATERIAL SELECTION",
      description: "Switch between calibrated semiconductor and metal probes: n-type Germanium (electrons dominate), p-type Germanium (holes dominate), n-type Indium Arsenide (high mobility), and Copper Foil reference.",
      placement: "top"
    },
    {
      id: "hall-console",
      selector: "#exp-hall-effect-section .hall-controller-plate",
      title: "Concave Industrial Controller Panel",
      category: "POWER & POLARITY CONTROLS",
      description: "Operate heavy-duty tactile controls: Red button toggles Electromagnet Power Supply; Black button toggles Specimen Constant Current Supply; Blue reverses Magnetic Field Polarity (+B / -B); Green reverses Current Direction (+I / -I).",
      placement: "top"
    },
    {
      id: "hall-current",
      selector: "#hall-slider-current",
      title: "Specimen Current (I_S) Adjustment",
      category: "CURRENT REGULATION",
      description: "Adjust longitudinal sample current from 0.0 to 50.0 mA using the slider or quick presets (5mA, 10mA, 20mA, 30mA, 40mA). Higher current increases transverse carrier drift velocity and boosts $V_H$.",
      placement: "left"
    },
    {
      id: "hall-field",
      selector: "#hall-slider-field",
      title: "Magnetic Flux Density (B) Slider",
      category: "MAGNETIC FIELD CONTROL",
      description: "Regulate the electromagnet coil excitation from 0.00 to 0.80 Tesla (0 to 800 mT) with ±0.10 T step buttons. Notice the linear relationship between transverse potential $V_H$ and field $B$.",
      placement: "left"
    },
    {
      id: "hall-zero",
      selector: "#hall-btn-zero-offset",
      title: "Zero-Balance Potentiometer",
      category: "MISALIGNMENT CALIBRATION",
      description: "In physical Hall probes, transverse contacts are rarely perfectly aligned, creating an IR drop offset voltage $V_{offset}$. Click Zero Balance to auto-calibrate and nullify this offset before recording.",
      placement: "left"
    },
    {
      id: "hall-screen",
      selector: "#hall-graph-canvas",
      title: "Dual Display: Graph & Quantum Lattice",
      category: "DYNAMIC VISUALIZATIONS",
      description: "Toggle between the characteristic $V_H$ vs $B$ linear sweep curve and the microscopic Quantum Carrier Lattice View to observe electrons or holes deflecting under Lorentz forces in real time.",
      placement: "left"
    },
    {
      id: "hall-telemetry",
      selector: "#exp-hall-effect-section .results-container",
      title: "Real-Time Magnetotransport Telemetry",
      category: "PHYSICAL CALCULATIONS",
      description: "Inspect live calculated parameters: Measured Hall Voltage $V_H$, Applied Magnetic Field $B$, Hall Coefficient $R_H = \\frac{V_H t}{I B}$, and Carrier Density $n = \\frac{1}{|e| R_H}$ in clean scientific notation.",
      placement: "top"
    },
    {
      id: "hall-record",
      selector: "#hall-btn-record",
      title: "Record Observations & Lab Report",
      category: "DATA LOGGING & ASSESSMENT",
      description: "Click Record Observation to log the current measurement $(I, B, V_H, R_H, n)$ into your observation table. Complete challenges to earn XP and generate your official laboratory report!",
      placement: "top"
    }
  ],

  // -----------------------------------------------------------------------
  // EXPERIMENT 6: PHYSICS SANDBOX
  // -----------------------------------------------------------------------
  sandbox: [
    {
      id: "sb-welcome",
      selector: "#exp-sandbox-section .sandbox-header-banner",
      title: "Welcome to Physics Sandbox",
      category: "NEWTONIAN MECHANICS PLAYGROUND",
      description: "An open interactive 2D rigid-body dynamics environment. Spawn shapes, tweak physical properties like mass and bounciness, apply external force vectors, simulate elastic/inelastic collisions, and observe Newton's laws of motion live.",
      placement: "bottom"
    },
    {
      id: "sb-spawner",
      selector: "#exp-sandbox-section .sandbox-spawn-grid",
      title: "Object Spawner Deck",
      category: "RIGID-BODY GENERATION",
      description: "Click + Ball, + Box, or + Platform to introduce objects into the sandbox. Dynamic objects obey gravity and force impulses, while static platforms anchor firmly in space to create ramps and obstacles.",
      placement: "right"
    },
    {
      id: "sb-canvas",
      selector: "#sandbox-canvas",
      title: "Interactive Physics Canvas",
      category: "VIEWPORT & GESTURES",
      description: "Click and drag any object on the canvas with your mouse or touch screen to toss it across the room! Watch bodies bounce, roll with friction, collide with momentum conservation, and trigger velocity trail effects.",
      placement: "bottom"
    },
    {
      id: "sb-inspector",
      selector: "#inspector-dynamic-props",
      title: "Object Property Inspector",
      category: "MATERIAL PROPERTIES",
      description: "Select any object in the scene to inspect and customize: Mass ($m$), Surface Friction Coefficient ($\\mu$), Restitution / Bounciness ($e$), Geometric Size, and Initial Velocities ($v_x, v_y$).",
      placement: "right"
    },
    {
      id: "sb-gravity",
      selector: "#sandbox-gravity",
      title: "Planetary Gravity (g) Deck",
      category: "ACCELERATION CONTROL",
      description: "Adjust global gravitational acceleration from 0.0 m/s² (Zero-G space orbital drift) to 25.0 m/s², or switch between planetary presets: Earth (9.81), Moon (1.62), Mars (3.71), or Zero-G.",
      placement: "right"
    },
    {
      id: "sb-forces",
      selector: "#sandbox-forces-deck-card",
      title: "Forces Deck: Continuous Thrust vs. Ballistic Kick",
      category: "DYNAMICS & IMPULSE",
      description: "Apply external forces to the active body: The D-Pad arrow buttons (↑, ↓, ←, →) apply a steady continuous force vector $\\vec{F}$ (in Newtons) each frame, generating constant acceleration $\\vec{a} = \\vec{F}/m$. Meanwhile, the KICK button imparts an instantaneous 0.15s impulse blow $\\vec{J} = \\vec{F}\\Delta t$, producing an immediate momentum jump $\\Delta \\vec{p} = \\vec{J}$ and instantaneous velocity change $\\Delta \\vec{v} = \\vec{J}/m$. Click Zero Forces to clear applied forces!",
      placement: "right"
    },
    {
      id: "sb-master",
      selector: "#exp-sandbox-section .sandbox-master-controls-card",
      title: "Master Simulation Controls",
      category: "TIME INTEGRATION",
      description: "Control physics execution: Run/Pause the integrator, Reset the scene, change simulation speed (0.25x slow-motion up to 2.0x warp), or toggle live Velocity Vector arrows and Trajectory Trails.",
      placement: "bottom"
    },
    {
      id: "sb-telemetry",
      selector: "#exp-sandbox-section .sandbox-telemetry-col",
      title: "Live Energy & Kinematics Telemetry",
      category: "CONSERVATION LAWS",
      description: "Monitors real-time mechanics: Instantaneous Velocity ($v$), Acceleration ($a$), Kinetic Energy ($KE = \\frac{1}{2}mv^2$), Gravitational Potential Energy ($PE = mgh$), and Total Mechanical Energy ($E = KE + PE$).",
      placement: "left"
    },
    {
      id: "sb-challenges",
      selector: "#tab-sandbox-challenges",
      title: "Newtonian Physics Challenges",
      category: "PLAYGROUND CHALLENGES",
      description: "Switch to the Challenges tab to tackle objectives like Newton's Thrust (accelerating to high velocity), Ballistic Kick (imparting kinetic energy), and Zero-G drift to earn student XP!",
      placement: "right"
    },
    {
      id: "sb-quiz",
      selector: "#btn-open-quiz",
      title: "Classical Mechanics Quiz",
      category: "KNOWLEDGE CHECK & XP",
      description: "Test your Newtonian mechanics knowledge! Click Physics Quiz in the top navigation to answer 10 multiple-choice questions on Newton's laws, momentum conservation, and kinetic/potential energy transformations to earn bonus student XP.",
      placement: "bottom"
    }
  ],

  // -----------------------------------------------------------------------
  // EXPERIMENT 5: DIFFRACTION GRATING
  // -----------------------------------------------------------------------
  diffraction: [
    {
      id: "dg-welcome",
      selector: "#exp-diffraction-section .dg-setup-container",
      title: "Welcome to Diffraction Grating Spectrometry",
      category: "LABORATORY PURPOSE",
      description: "Investigate wave optics and Fraunhofer multi-slit interference. Coherent monochromatic laser light passing through a diffraction grating diffracts into sharp spectral orders governed by the grating equation: $d \\sin\\theta = m\\lambda$, where $d$ is slit spacing, $\\theta$ is diffraction angle, and $m$ is diffraction order.",
      placement: "bottom"
    },
    {
      id: "dg-wavelength",
      selector: "#dg-wl-slider",
      title: "Tunable Laser Wavelength (λ)",
      category: "COHERENT SOURCE",
      description: "Tune laser wavelength across the visible spectrum (400 nm to 700 nm) or choose calibrated laser presets: 405nm Violet, 488nm Cyan, 532nm Green, 589nm Sodium, and 633nm He-Ne. Notice how longer wavelengths diffract at larger angles!",
      placement: "top"
    },
    {
      id: "dg-density",
      selector: "#dg-density-slider",
      title: "Grating Line Density (N) & Pitch (d)",
      category: "DIFFRACTION GRATING",
      description: "Set grating ruling density from 300 to 1200 lines/mm. The microscopic slit spacing $d$ is calculated automatically ($d = 1/N$). Finer grating pitch (higher $N$) disperses diffracted beams much wider apart.",
      placement: "top"
    },
    {
      id: "dg-distance",
      selector: "#dg-dist-slider",
      title: "Screen Distance (L)",
      category: "OPTICAL BENCH ALIGNMENT",
      description: "Translate the detector screen along the optical bench rail from 0.50 m to 2.00 m. Live badges display the maximum observable order limit ($m_{max} = \\lfloor d/\\lambda \\rfloor$) and angular dispersion ($D$).",
      placement: "top"
    },
    {
      id: "dg-bench",
      selector: "#dg-bench-canvas",
      title: "Optical Bench Profile Canvas",
      category: "RAY TRACING PROFILE",
      description: "Visualizes the physical optical bench rail from source to screen. Watch divergent diffraction beams emerge symmetrically from the grating and propagate across space at angle $\\theta_m$.",
      placement: "bottom"
    },
    {
      id: "dg-screen",
      selector: "#dg-screen-canvas",
      title: "Detector Screen & Spectral Pattern",
      category: "INTERFERENCE ENVELOPE",
      description: "Displays the spatial diffraction pattern and intensity envelope. Observe the bright central zeroth-order maximum ($m=0$) and symmetric first-order ($m = \\pm 1$) and second-order ($m = \\pm 2$) spectral lines.",
      placement: "left"
    },
    {
      id: "dg-orders",
      selector: "#exp-diffraction-section .dg-order-controls-box",
      title: "Diffraction Order Selector (m)",
      category: "SPECTRAL ORDER ISOLATION",
      description: "Select individual diffraction orders ($m = -2, -1, 0, +1, +2$, or 'All') to isolate specific beams and inspect their exact angular deflection and spatial displacement $y = L\\tan\\theta$.",
      placement: "left"
    },
    {
      id: "dg-telemetry",
      selector: "#exp-diffraction-section .results-container",
      title: "Real-time Spectrometry Telemetry",
      category: "OPTICAL CALCULATIONS",
      description: "Provides high-precision readouts of Slit Spacing ($d$), Diffraction Angle ($\\theta$), Screen Fringe Distance ($y$), and Angular Dispersion ($D = \\frac{m}{d\\cos\\theta}$) for scientific verification.",
      placement: "top"
    },
    {
      id: "dg-mystery",
      selector: "#exp-diffraction-section .dg-mystery-card",
      title: "Mystery Gas Discharge Tube",
      category: "SPECTRAL IDENTIFICATION",
      description: "Engage the Mystery Discharge Tube! Analyze unknown spectral emission lines, calculate unknown wavelengths from measured fringe positions, and identify the chemical element (Hydrogen, Helium, Neon, Mercury, or Argon) to earn XP!",
      placement: "top"
    },
    {
      id: "dg-challenges",
      selector: "#exp-diffraction-section .challenges-card",
      title: "Diffraction Grating Challenges & Logbook",
      category: "XP & PDF EXPORT",
      description: "Complete grating challenges, log observations into your scientific table, and export an official PhysiX Lab Report PDF for your records.",
      placement: "top"
    },
    {
      id: "dg-quiz",
      selector: "#btn-open-quiz",
      title: "Wave Optics & Diffraction Quiz",
      category: "KNOWLEDGE CHECK & XP",
      description: "Master multi-slit interference! Open the Physics Quiz in the top navigation to solve 10 questions on Fraunhofer diffraction, angular dispersion ($D$), grating pitch ($d$), and maximum order limits to earn student XP and level up your dossier.",
      placement: "bottom"
    }
  ],

  // -----------------------------------------------------------------------
  // EXPERIMENT 6: DIODE V-I CHARACTERISTICS
  // -----------------------------------------------------------------------
  diode: [
    {
      id: "diode-tour-1",
      selector: "#exp-diode-section .diode-setup-ribbon",
      title: "Experiment Objective & Purpose",
      category: "1. EXPERIMENT OBJECTIVE",
      description: "Aim: To study the voltage - current (V-I) characteristics of a forward and reverse bias P-N Junction diode. Observe the cut-in knee voltage, barrier potential, and unidirectional conduction property.",
      placement: "bottom"
    },
    {
      id: "diode-tour-2",
      selector: "#diode-voltmeter-container",
      title: "Precision Analog Voltmeter",
      category: "2. VOLTMETER",
      description: "A dual-scale analog voltmeter measures the potential drop. It features dual concentric scales: an upper scale (0 to 1.5 V) for forward bias and a lower scale (0 to 30 V) for reverse bias.",
      placement: "bottom"
    },
    {
      id: "diode-tour-3",
      selector: "#diode-vm-range-box",
      title: "Voltmeter Range Selector",
      category: "3. VOLTMETER RANGE",
      description: "Toggle between 1.5 V (Forward Bias) and 30 V (Reverse Bias). The active range determines the scale interpretation of the needle.",
      placement: "top"
    },
    {
      id: "diode-tour-4",
      selector: "#diode-center-panel",
      title: "Master Power ON / OFF Switch",
      category: "4. ON/OFF SWITCH",
      description: "Flipping this heavy-duty toggle switch to ON energizes the laboratory circuit and illuminates the radiant red pilot lamp. When OFF, current drops to zero.",
      placement: "bottom"
    },
    {
      id: "diode-tour-5",
      selector: "#diode-ammeter-container",
      title: "Dual-Scale Analog Ammeter",
      category: "5. AMMETER",
      description: "Measures circuit current. Features an upper scale (0 to 10 mA) for forward bias and a lower scale (0 to 100 μA) for minute reverse saturation currents.",
      placement: "bottom"
    },
    {
      id: "diode-tour-6",
      selector: "#diode-am-range-box",
      title: "Ammeter Current Range Selector",
      category: "6. AMMETER RANGE",
      description: "Toggle between 10 mA (upper scale for Forward Bias) and 100 μA (lower scale for Reverse Bias). Greek symbol μA denotes microamperes.",
      placement: "top"
    },
    {
      id: "diode-tour-7",
      selector: "#diode-sec-fwd-supply",
      title: "Forward-Bias DC Power Supply (VF)",
      category: "7. FORWARD BIAS SUPPLY",
      description: "Adjusts the forward DC voltage (0 to 1.5 V) using the rotary potentiometer knob. Includes dual red (+) positive and black (−) negative DC output sockets.",
      placement: "top"
    },
    {
      id: "diode-tour-8",
      selector: "#diode-term-fwd-diode",
      title: "Forward Bias Diode Terminals (P ▷| N)",
      category: "8. FORWARD DIODE TERMINALS",
      description: "Red terminal connects to the P-type anode; black terminal connects to the N-type cathode. Current flows readily when forward voltage exceeds ~0.65 V.",
      placement: "top"
    },
    {
      id: "diode-tour-9",
      selector: "#diode-term-rev-diode",
      title: "Reverse Bias Diode Terminals (N |◁ P)",
      category: "9. REVERSE DIODE TERMINALS",
      description: "Black terminal connects to the N-region and red terminal connects to the P-region for reversed polarity, demonstrating depletion widening.",
      placement: "top"
    },
    {
      id: "diode-tour-10",
      selector: "#diode-sec-rev-supply",
      title: "Reverse-Bias DC Power Supply (VR)",
      category: "10. REVERSE BIAS SUPPLY",
      description: "Adjusts reverse DC supply voltage (0 to 30 V) with the rotary knob. Provides two red (+) and two black (−) terminals.",
      placement: "top"
    },
    {
      id: "diode-tour-11",
      selector: "#diode-wire-canvas",
      title: "Positive & Negative Connection Wires",
      category: "11. POSITIVE / NEGATIVE WIRES",
      description: "Realistic banana cables: RED for positive connections, BLACK for negative return paths. Click any terminal socket to attach or detach wires.",
      placement: "bottom"
    },
    {
      id: "diode-tour-12",
      selector: "#diode-btn-auto-fwd",
      title: "Forward-Bias Wiring Procedure",
      category: "12. FORWARD-BIAS PROCEDURE",
      description: "Connect DC Output (+) to Diode P, Diode N to Ammeter (+), Ammeter (−) to DC Output (−) in series, and Voltmeter in parallel across DC Output. Click 'Auto Connect Forward' to wire automatically.",
      placement: "bottom"
    },
    {
      id: "diode-tour-13",
      selector: "#diode-btn-auto-rev",
      title: "Reverse-Bias Wiring Procedure",
      category: "13. REVERSE-BIAS PROCEDURE",
      description: "Connect DC Output (+) to Diode N, Diode P to Microammeter (+), Microammeter (−) to DC Output (−) in series, and Voltmeter in parallel across DC Output. Click 'Auto Connect Reverse' to wire automatically.",
      placement: "bottom"
    },
    {
      id: "diode-tour-14",
      selector: "#diode-btn-record",
      title: "Recording Observations",
      category: "14. RECORDING OBSERVATIONS",
      description: "Click 'Record Observation' to log the live meter telemetry. For Reverse Bias, microamperes (μA) are automatically converted to milliamperes (mA) in the logbook (1 μA = 0.001 mA).",
      placement: "top"
    },
    {
      id: "diode-tour-15",
      selector: "#diode-fwd-graph-card",
      title: "Forward V-I Graph (1st Quadrant)",
      category: "15. FORWARD GRAPH",
      description: "Plots Forward Voltage Vf (V) along X-axis (1 cm = 0.1 V) versus Forward Current If (mA) along Y-axis (1 cm = 1 mA) in the 1st quadrant with real-time curve fitting.",
      placement: "top"
    },
    {
      id: "diode-tour-16",
      selector: "#diode-rev-graph-card",
      title: "Reverse V-I Graph (3rd Quadrant)",
      category: "16. REVERSE GRAPH",
      description: "Plots Reverse Voltage Vr (V) along negative X-axis (1 cm = 2 V) versus Reverse Current Ir (μA) along negative Y-axis (1 cm = 10 μA) strictly in the 3rd quadrant.",
      placement: "top"
    },
    {
      id: "diode-tour-17",
      selector: "#diode-btn-reset-exp",
      title: "Reset & Calibration",
      category: "17. RESET",
      description: "Resets the voltage supplies, clears the dynamic needle deflections, and resets wires or observations whenever starting a fresh experimental run.",
      placement: "top"
    }
  ],

  // -----------------------------------------------------------------------
  // EXPERIMENT 7: PLASTIC OPTICAL FIBER ATTENUATION (POF)
  // -----------------------------------------------------------------------
  "pof-attenuation": [
    {
      id: "pof-tour-1",
      selector: "#pof-bench-canvas",
      title: "Identify Optical Source Assembly",
      category: "1. IDENTIFY APPARATUS",
      description: "Inspect the 650 nm semiconductor LED transmitter on the left mounting post. Click directly on the Optical Source assembly on the bench canvas to open its technical specification card.",
      placement: "bottom"
    },
    {
      id: "pof-tour-2",
      selector: "#pof-btn-power",
      title: "Switch ON the Optical Source",
      category: "2. SOURCE ACTIVATION",
      description: "Flip the Optical Source toggle to ON. The stabilized 650 nm red transmitter energizes, emitting a restrained reference optical beam with output aperture cues.",
      placement: "bottom"
    },
    {
      id: "pof-tour-3",
      selector: "#pof-mode-ref",
      title: "Select Reference Measurement Mode",
      category: "3. REFERENCE CONFIGURATION",
      description: "Set the Optical Power Meter mode to 'Reference (P_in)' to align the photodetector directly with the transmitter output aperture for baseline calibration.",
      placement: "top"
    },
    {
      id: "pof-tour-4",
      selector: "#pof-btn-measure",
      title: "Measure Reference Power (P_in)",
      category: "4. INPUT POWER MEASUREMENT",
      description: "Press 'MEASURE POWER' on the digital power meter. The sensor registers the stabilized incident optical power ($P_{\\text{in}}$) entering the optical bench.",
      placement: "top"
    },
    {
      id: "pof-tour-5",
      selector: "#pof-btn-connect",
      title: "Connect the Plastic Optical Fiber",
      category: "5. POF CONNECTION",
      description: "Click 'Connect Fiber' to bridge the flexible 1 mm PMMA plastic optical fiber between the input micrometer coupler and the output receiver assembly.",
      placement: "bottom"
    },
    {
      id: "pof-tour-6",
      selector: "#pof-length-slider",
      title: "Configure Fiber Length (L)",
      category: "6. FIBER LENGTH (L)",
      description: "Adjust the modeled fiber length under test (1.0 m to 25.0 m). Longer propagation paths accumulate higher bulk absorption ($-\\alpha L$) and Rayleigh scattering losses.",
      placement: "top"
    },
    {
      id: "pof-tour-7",
      selector: "#pof-mode-out",
      title: "Select POF Output Mode (P_out)",
      category: "7. OUTPUT CONFIGURATION",
      description: "Switch the meter to 'POF Output (P_out)' mode to align the photodetector receiver with the light exiting the distal end of the fiber.",
      placement: "top"
    },
    {
      id: "pof-tour-8",
      selector: "#pof-btn-measure",
      title: "Measure Transmitted Power (P_out)",
      category: "8. OUTPUT POWER MEASUREMENT",
      description: "Press 'MEASURE POWER' again. The meter samples the transmitted optical power ($P_{\\text{out}}$), reflecting material attenuation and coupling losses.",
      placement: "top"
    },
    {
      id: "pof-tour-9",
      selector: "#pof-hud-total-att",
      title: "Calculate Total Attenuation (A_dB)",
      category: "9. DECIBEL ATTENUATION",
      description: "Inspect the Total Attenuation readout: $A_{\\text{dB}} = 10 \\log_{10}(P_{\\text{in}} / P_{\\text{out}})$. Total decibel loss increases logarithmically with power ratio.",
      placement: "top"
    },
    {
      id: "pof-tour-10",
      selector: "#pof-hud-alpha",
      title: "Compute Attenuation Rate (α in dB/km)",
      category: "10. ATTENUATION COEFFICIENT",
      description: "Review the normalized attenuation coefficient: $\\alpha_{\\text{dB/km}} = (1000 / L_{\\text{m}}) \\times 10 \\log_{10}(P_{\\text{in}} / P_{\\text{out}})$. Standard PMMA fibers exhibit ~180 dB/km at 650 nm.",
      placement: "top"
    },
    {
      id: "pof-tour-11",
      selector: "#pof-btn-record-obs",
      title: "Record Observation into Logbook",
      category: "11. OBSERVATION LOGBOOK",
      description: "Click 'Record Observation' to store the length, $P_{\\text{in}}$, $P_{\\text{out}}$, $A_{\\text{dB}}$, and $\\alpha$ into your scientific observations table.",
      placement: "top"
    },
    {
      id: "pof-tour-12",
      selector: "#pof-telemetry-graph-card",
      title: "Analyze Power vs Length Graph",
      category: "12. GRAPHICAL ANALYSIS",
      description: "Observe how output power decays exponentially with fiber length according to Beer-Lambert's Law $P_{\\text{out}} = P_{\\text{in}} 10^{-\\alpha L / 10}$. Switch between Power and Attenuation plots.",
      placement: "top"
    },
    {
      id: "pof-tour-13",
      selector: "#pof-interp-card",
      title: "Interpret Physical Loss Mechanisms",
      category: "13. PHYSICAL INTERPRETATION",
      description: "Identify the dominant physical mechanisms causing attenuation in plastic optical fibers (absorption, Rayleigh scattering, Fresnel reflections, macrobending) and submit your analysis.",
      placement: "top"
    }
  ]
};

// =========================================================================
// TUTORIAL RUNTIME ENGINE & CONTROLLER CLASS
// =========================================================================

class TutorialManager {
  constructor() {
    this.currentExpId = null;
    this.currentSteps = [];
    this.currentStepIndex = 0;
    this.isActive = false;
    this.getActiveUserId = () => "guest";
    this.showToast = (msg) => console.log(msg);

    // Overlay DOM references
    this.overlayEl = null;
    this.spotlightEl = null;
    this.cardEl = null;

    // Bound listeners for cleanup
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  init({ getActiveUserId, showToast }) {
    if (typeof getActiveUserId === "function") {
      this.getActiveUserId = getActiveUserId;
    }
    if (typeof showToast === "function") {
      this.showToast = showToast;
    }

    this.createDomElements();
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("keydown", this.handleKeyDown);

    console.log("[TutorialManager] Initialized successfully");
  }

  createDomElements() {
    if (document.getElementById("physix-tutorial-overlay")) {
      this.overlayEl = document.getElementById("physix-tutorial-overlay");
      this.spotlightEl = document.getElementById("physix-tutorial-spotlight");
      this.cardEl = document.getElementById("physix-tutorial-card");
      return;
    }

    // Main dark overlay container
    const overlay = document.createElement("div");
    overlay.id = "physix-tutorial-overlay";
    overlay.className = "physix-tutorial-overlay hidden";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "PhysiX Guided Tutorial");

    // Backdrop click blocker (with subtle dimmed vignette)
    const backdrop = document.createElement("div");
    backdrop.className = "tutorial-backdrop-blocker";
    overlay.appendChild(backdrop);

    // Glowing spotlight cutout element
    const spotlight = document.createElement("div");
    spotlight.id = "physix-tutorial-spotlight";
    spotlight.className = "tutorial-spotlight";
    overlay.appendChild(spotlight);

    // Floating glass tooltip card
    const card = document.createElement("div");
    card.id = "physix-tutorial-card";
    card.className = "tutorial-card";
    overlay.appendChild(card);

    document.body.appendChild(overlay);

    this.overlayEl = overlay;
    this.spotlightEl = spotlight;
    this.cardEl = card;
  }

  /**
   * Evaluates if tutorial should auto-launch on experiment open
   * Accounts for asynchronous Firebase Auth initialization race conditions,
   * active tutorial state, and per-user completion records.
   */
  async maybeTriggerFirstTimeTutorial(expId, delayMs = 380) {
    const normalized = normalizeExpId(expId);

    // If a tour is already actively running, do not interrupt
    if (this.isActive) return;

    // Wait for auth to settle if an auth readiness promise is registered
    if (_authReadyPromise) {
      try {
        await Promise.race([
          _authReadyPromise,
          new Promise(r => setTimeout(r, 650))
        ]);
      } catch (e) {}
    }

    const userId = this.getActiveUserId();

    // If user has already completed or skipped this experiment's tutorial, do not show
    if (isExperimentTutorialCompleted(normalized, userId)) {
      return;
    }

    // Wait for the DOM section of the experiment to unhide and render properly
    setTimeout(() => {
      // Re-check after timeout in case state changed or user navigated away
      if (this.isActive) return;
      const currentUserId = this.getActiveUserId();
      if (isExperimentTutorialCompleted(normalized, currentUserId)) return;
      this.startTutorial(normalized, false);
    }, delayMs);
  }

  /**
   * Starts or replays a tutorial for an experiment
   */
  startTutorial(expId, force = false) {
    const normalized = normalizeExpId(expId);
    const steps = TUTORIAL_DEFINITIONS[normalized];

    if (!steps || steps.length === 0) {
      console.warn(`[Tutorial] No steps defined for experiment: ${normalized}`);
      return;
    }

    this.currentExpId = normalized;
    this.currentSteps = steps;
    this.currentStepIndex = 0;
    this.isActive = true;

    if (!this.overlayEl) {
      this.createDomElements();
    }

    this.overlayEl.classList.remove("hidden");
    document.body.classList.add("tutorial-active");

    console.log(`[Tutorial] Starting walkthrough for ${normalized} (force: ${force})`);
    this.renderCurrentStep();
  }

  renderCurrentStep() {
    if (!this.isActive || !this.currentSteps || this.currentSteps.length === 0) {
      return;
    }

    const step = this.currentSteps[this.currentStepIndex];
    if (!step) return;

    // Optional prep action (e.g. switching tabs if step is in a hidden pane)
    if (typeof step.tabAction === "function") {
      try {
        step.tabAction();
      } catch (e) {}
    }

    const targetEl = document.querySelector(step.selector);
    const totalSteps = this.currentSteps.length;
    const stepNum = this.currentStepIndex + 1;
    const isFirstStep = this.currentStepIndex === 0;
    const isLastStep = this.currentStepIndex === totalSteps - 1;

    // Render Card Content
    this.cardEl.innerHTML = `
      <div class="tutorial-card-header">
        <div class="tutorial-card-meta">
          <span class="tutorial-badge">${step.category || "TUTORIAL GUIDE"}</span>
          <span class="tutorial-counter">Step ${stepNum} of ${totalSteps}</span>
        </div>
        <button type="button" class="tutorial-close-btn" id="tutorial-btn-close" title="Close & Skip Tutorial">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="tutorial-card-body">
        <h3 class="tutorial-card-title">${step.title}</h3>
        <p class="tutorial-card-desc">${renderMathInText(step.description)}</p>
      </div>

      <div class="tutorial-card-progress">
        <div class="tutorial-progress-bar">
          <div class="tutorial-progress-fill" style="width: ${(stepNum / totalSteps) * 100}%"></div>
        </div>
      </div>

      <div class="tutorial-card-footer">
        <div class="tutorial-btn-group-left">
          <button type="button" class="tutorial-btn tutorial-btn-skip" id="tutorial-btn-skip">
            Exit
          </button>
          <button type="button" class="tutorial-btn tutorial-btn-restart" id="tutorial-btn-restart" title="Restart Guided Tour">
            Restart
          </button>
        </div>
        <div class="tutorial-btn-group">
          ${!isFirstStep ? `
            <button type="button" class="tutorial-btn tutorial-btn-back" id="tutorial-btn-back">
              Back
            </button>
          ` : ""}
          <button type="button" class="tutorial-btn tutorial-btn-next ${isLastStep ? 'tutorial-btn-finish' : ''}" id="tutorial-btn-next">
            ${isLastStep ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    `;

    // Wire Card Button Events
    document.getElementById("tutorial-btn-close")?.addEventListener("click", () => this.skipTutorial());
    document.getElementById("tutorial-btn-skip")?.addEventListener("click", () => this.skipTutorial());
    document.getElementById("tutorial-btn-restart")?.addEventListener("click", () => {
      this.currentStepIndex = 0;
      this.renderCurrentStep();
    });
    document.getElementById("tutorial-btn-back")?.addEventListener("click", () => this.prevStep());
    document.getElementById("tutorial-btn-next")?.addEventListener("click", () => {
      if (isLastStep) {
        this.finishTutorial();
      } else {
        this.nextStep();
      }
    });

    // Position Spotlight & Card
    renderMathInDOM(this.cardEl);
    this.updatePositioning(targetEl, step.placement);
  }

  updatePositioning(targetEl, preferredPlacement = "bottom") {
    if (!targetEl || !this.isElementVisible(targetEl)) {
      // Fallback: If element is not found/visible, center the spotlight and card gracefully
      this.spotlightEl.style.opacity = "0";
      this.cardEl.classList.add("centered");
      this.cardEl.style.top = "50%";
      this.cardEl.style.left = "50%";
      this.cardEl.style.transform = "translate(-50%, -50%)";
      return;
    }

    this.cardEl.classList.remove("centered");
    this.cardEl.style.transform = "none";
    this.spotlightEl.style.opacity = "1";

    // Scroll element into view smoothly if offscreen
    targetEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });

    // Measure after short delay for scroll settle
    const rect = targetEl.getBoundingClientRect();
    const PADDING = 8;
    const spotTop = Math.max(4, rect.top - PADDING);
    const spotLeft = Math.max(4, rect.left - PADDING);
    const spotWidth = Math.min(window.innerWidth - 8, rect.width + PADDING * 2);
    const spotHeight = Math.min(window.innerHeight - 8, rect.height + PADDING * 2);

    this.spotlightEl.style.top = `${spotTop}px`;
    this.spotlightEl.style.left = `${spotLeft}px`;
    this.spotlightEl.style.width = `${spotWidth}px`;
    this.spotlightEl.style.height = `${spotHeight}px`;

    // Calculate smart Tooltip Card Placement
    const cardRect = this.cardEl.getBoundingClientRect();
    const cardWidth = cardRect.width || 360;
    const cardHeight = cardRect.height || 220;
    const margin = 14;

    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let cardLeft = 0;
    let cardTop = 0;

    // Mobile layout: position comfortably at bottom or top of viewport
    if (viewportW <= 640) {
      cardLeft = 16;
      if (spotTop > viewportH / 2) {
        // Spotlight is in lower half -> put card in upper half
        cardTop = Math.max(16, spotTop - cardHeight - margin);
      } else {
        // Spotlight is in upper half -> put card in lower half
        cardTop = Math.min(viewportH - cardHeight - 16, spotTop + spotHeight + margin);
      }
    } else {
      // Desktop / Tablet layout
      let placement = preferredPlacement;

      // Check space available
      const spaceBelow = viewportH - (spotTop + spotHeight);
      const spaceAbove = spotTop;
      const spaceRight = viewportW - (spotLeft + spotWidth);
      const spaceLeft = spotLeft;

      if (placement === "bottom" && spaceBelow < cardHeight + margin && spaceAbove > spaceBelow) {
        placement = "top";
      } else if (placement === "top" && spaceAbove < cardHeight + margin && spaceBelow > spaceAbove) {
        placement = "bottom";
      } else if (placement === "right" && spaceRight < cardWidth + margin && spaceLeft > spaceRight) {
        placement = "left";
      } else if (placement === "left" && spaceLeft < cardWidth + margin && spaceRight > spaceLeft) {
        placement = "right";
      }

      if (placement === "bottom") {
        cardTop = spotTop + spotHeight + margin;
        cardLeft = spotLeft + (spotWidth / 2) - (cardWidth / 2);
      } else if (placement === "top") {
        cardTop = spotTop - cardHeight - margin;
        cardLeft = spotLeft + (spotWidth / 2) - (cardWidth / 2);
      } else if (placement === "right") {
        cardLeft = spotLeft + spotWidth + margin;
        cardTop = spotTop + (spotHeight / 2) - (cardHeight / 2);
      } else if (placement === "left") {
        cardLeft = spotLeft - cardWidth - margin;
        cardTop = spotTop + (spotHeight / 2) - (cardHeight / 2);
      }
    }

    // Clamp coordinates safely within viewport
    const clampedLeft = Math.max(12, Math.min(viewportW - cardWidth - 12, cardLeft));
    const clampedTop = Math.max(12, Math.min(viewportH - cardHeight - 12, cardTop));

    this.cardEl.style.left = `${clampedLeft}px`;
    this.cardEl.style.top = `${clampedTop}px`;
  }

  isElementVisible(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
      return false;
    }
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  nextStep() {
    if (this.currentExpId === "pof-attenuation" && window.pofExperimentInstance?.validateTourStep) {
      const res = window.pofExperimentInstance.validateTourStep(this.currentStepIndex);
      if (res && !res.valid) {
        this.showToast(res.error || "Please perform the required step on the apparatus before continuing.");
        return;
      }
    }
    if (this.currentStepIndex < this.currentSteps.length - 1) {
      this.currentStepIndex++;
      this.renderCurrentStep();
    } else {
      this.finishTutorial();
    }
  }

  prevStep() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.renderCurrentStep();
    }
  }

  skipTutorial() {
    const userId = this.getActiveUserId();
    if (this.currentExpId) {
      markExperimentTutorialCompleted(this.currentExpId, userId);
    }
    this.destroyTour();
    this.showToast("Tutorial skipped. You can replay it anytime from the Tutorial button!");
  }

  finishTutorial() {
    const userId = this.getActiveUserId();
    if (this.currentExpId) {
      markExperimentTutorialCompleted(this.currentExpId, userId);
    }
    this.destroyTour();
    this.showToast(`${getExperimentFriendlyName(this.currentExpId)} Walkthrough Completed!`);
  }

  destroyTour() {
    this.isActive = false;
    if (this.overlayEl) {
      this.overlayEl.classList.add("hidden");
    }
    document.body.classList.remove("tutorial-active");
  }

  handleKeyDown(e) {
    if (!this.isActive) return;

    if (e.key === "Escape") {
      e.preventDefault();
      this.skipTutorial();
    } else if (e.key === "ArrowRight" || e.key === "Enter") {
      e.preventDefault();
      const isLastStep = this.currentStepIndex === this.currentSteps.length - 1;
      if (isLastStep) {
        this.finishTutorial();
      } else {
        this.nextStep();
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      this.prevStep();
    }
  }

  handleResize() {
    if (!this.isActive || !this.currentSteps) return;
    const step = this.currentSteps[this.currentStepIndex];
    if (step) {
      const targetEl = document.querySelector(step.selector);
      this.updatePositioning(targetEl, step.placement);
    }
  }
}

// Global Singleton
export const tutorialManager = new TutorialManager();
