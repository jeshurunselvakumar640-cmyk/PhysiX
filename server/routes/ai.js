import { Router } from "express";
import dotenv from "dotenv";

dotenv.config();

const router = Router();
const API_KEY = process.env.VECTRA_AI_KEY || process.env.GEMINI_API_KEY || "";
const AI_NAME = process.env.AI_NAME || "Vectra AI";
const PROJECT_NAME = process.env.GCP_PROJECT_NAME || "";

const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.7-flash",
  "gemini-flash-latest"
];

const CREATOR_RESPONSE = "This is a Project built by four Computer Engineering students Ojas Joshi, Jeshurun Selvakumar, Kshitij Jadhav, Adithya Iyer.";

export function isCreatorQuestion(text = "") {
  const t = text.toLowerCase();
  return (
    t.includes("who built") ||
    t.includes("who made") ||
    t.includes("who created") ||
    t.includes("who developed") ||
    t.includes("who are the owners") ||
    t.includes("who is the owner") ||
    t.includes("who owns") ||
    t.includes("who are the creators") ||
    t.includes("who are the authors") ||
    t.includes("who designed this") ||
    t.includes("who worked on this") ||
    t.includes("developers of") ||
    t.includes("creators of") ||
    t.includes("team behind") ||
    (t.includes("about the team") || t.includes("about the creators")) ||
    (t.includes("who are you built by") || t.includes("who made this website") || t.includes("who built this website"))
  );
}

// Compute verified analytical kinematics ground truth for any simulation context
export function calculateTrajectoryGroundTruth(context = {}) {
  const v0 = Number(context.v0) || 20;
  const angleDeg = Number(context.angleDeg) || 45;
  const h0 = Math.max(0, Number(context.h0) || 0);
  const g = Math.max(0.1, Number(context.g) || 9.8);
  const planet = context.planet || "Earth";
  const targetDistance = context.targetDistance ? Number(context.targetDistance) : null;
  const targetMode = !!context.targetMode;

  const rad = (angleDeg * Math.PI) / 180;
  const v0x = v0 * Math.cos(rad);
  const v0y = v0 * Math.sin(rad);

  const tApex = v0y > 0 ? v0y / g : 0;
  const hApex = h0 + (v0y > 0 ? (v0y * v0y) / (2 * g) : 0);

  const discriminant = v0y * v0y + 2 * g * h0;
  const tFlight = (v0y + Math.sqrt(Math.max(0, discriminant))) / g;
  const range = v0x * tFlight;

  const vfx = v0x;
  const vfy = v0y - g * tFlight;
  const vfSpeed = Math.sqrt(vfx * vfx + vfy * vfy);
  const vfAngleDeg = Math.abs((Math.atan2(vfy, vfx) * 180) / Math.PI);

  // Optimal launch angle for max range
  let optimalAngleDeg = 45;
  let maxPossibleRange = (v0 * v0) / g;
  if (h0 > 0) {
    optimalAngleDeg = (Math.asin(1 / Math.sqrt(2 + (2 * g * h0) / (v0 * v0))) * 180) / Math.PI;
    maxPossibleRange = (v0 * v0 / g) * Math.sqrt(1 + (2 * g * h0) / (v0 * v0));
  }

  // Target calculations
  let targetSolutions = null;
  if (targetDistance && targetDistance > 0) {
    const d = targetDistance;
    const A = (g * d * d) / (2 * v0 * v0);
    const B = -d;
    const C = -h0 + A;
    const disc = B * B - 4 * A * C;
    if (disc >= 0) {
      const tan1 = (-B - Math.sqrt(disc)) / (2 * A);
      const tan2 = (-B + Math.sqrt(disc)) / (2 * A);
      const angle1 = (Math.atan(tan1) * 180) / Math.PI;
      const angle2 = (Math.atan(tan2) * 180) / Math.PI;
      targetSolutions = {
        reachable: true,
        lowAngle: Math.min(angle1, angle2).toFixed(2),
        highAngle: Math.max(angle1, angle2).toFixed(2),
        minVelocityForTarget: Math.sqrt(g * (Math.sqrt(d * d + h0 * h0) - h0)).toFixed(2)
      };
    } else {
      targetSolutions = {
        reachable: false,
        minVelocityForTarget: Math.sqrt(g * (Math.sqrt(d * d + h0 * h0) - h0)).toFixed(2)
      };
    }
  }

  return {
    v0,
    angleDeg,
    h0,
    g,
    planet,
    v0x: Number(v0x.toFixed(3)),
    v0y: Number(v0y.toFixed(3)),
    tApex: Number(tApex.toFixed(3)),
    hApex: Number(hApex.toFixed(3)),
    tFlight: Number(tFlight.toFixed(3)),
    range: Number(range.toFixed(3)),
    vfSpeed: Number(vfSpeed.toFixed(3)),
    vfAngleDeg: Number(vfAngleDeg.toFixed(2)),
    optimalAngleDeg: Number(optimalAngleDeg.toFixed(2)),
    maxPossibleRange: Number(maxPossibleRange.toFixed(3)),
    targetDistance,
    targetMode,
    targetSolutions
  };
}

// Master System Prompt with complete domain physics training and exact ground truth injection
export function getSystemPrompt(simulationContext = {}) {
  const gt = calculateTrajectoryGroundTruth(simulationContext);

  let targetBlock = "Target Challenge Mode: Inactive";
  if (gt.targetMode && gt.targetDistance) {
    if (gt.targetSolutions && gt.targetSolutions.reachable) {
      targetBlock = `Target Challenge Mode: ACTIVE
- Target Distance: ${gt.targetDistance} m
- Reachable at current v0 (${gt.v0} m/s): YES
- Target Aiming Angles: Low Trajectory = ${gt.targetSolutions.lowAngle} deg | High Arc = ${gt.targetSolutions.highAngle} deg
- Min Launch Speed Required at 45 deg: ${gt.targetSolutions.minVelocityForTarget} m/s`;
    } else {
      targetBlock = `Target Challenge Mode: ACTIVE
- Target Distance: ${gt.targetDistance} m
- Reachable at current v0 (${gt.v0} m/s): NO (insufficient kinetic energy)
- Min Launch Speed Required: >= ${gt.targetSolutions?.minVelocityForTarget || "N/A"} m/s`;
    }
  }

  return `You are **${AI_NAME}**, the master Theoretical & Computational Physics Copilot embedded in the PhysiX Virtual Physics Laboratory (Project: ${PROJECT_NAME}).
You are an expert in 2D projectile kinematics, classical mechanics, vector dynamics, and planetary gravitation.

### STRICT RULES:
1. Website Authorship & Ownership Queries: ONLY when the user specifically inquires about who created, built, developed, owns, or authored PhysiX/Vectra AI, you must reply solely with the exact sentence:
"${CREATOR_RESPONSE}"
Do NOT append or include this attribution sentence at the end of regular physics, mathematics, or trajectory answers.
2. Zero Emojis: Do NOT use emojis anywhere in your response under any circumstances. Use clean, high-tech scientific markdown, bold terminology, bulleted derivations, and standard LaTeX formulas instead.
3. Strict Mathematical Accuracy: All calculations must be exact, rigorously derived, and grounded in the verified simulator physics engine.

### VERIFIED LIVE SIMULATOR GROUND-TRUTH TELEMETRY:
- Initial Launch Speed (v0): ${gt.v0} m/s
- Launch Angle (theta): ${gt.angleDeg} deg
- Initial Height (h0): ${gt.h0} m
- Planetary Gravity (g): ${gt.g} m/s^2 (Celestial Environment: ${gt.planet})
- Velocity Decomposition:
  * Horizontal Component (v0x = v0 * cos(theta)): ${gt.v0x} m/s (CONSTANT throughout flight)
  * Vertical Component (v0y = v0 * sin(theta)): ${gt.v0y} m/s
- Exact Peak Apex Altitude (H_max = h0 + v0y^2 / (2g)): ${gt.hApex} m
- Time to Peak Apex (t_apex = v0y / g): ${gt.tApex} s
- Total Flight Airtime (T = (v0y + sqrt(v0y^2 + 2gh0)) / g): ${gt.tFlight} s
- Total Ground Range (R = v0x * T): ${gt.range} m
- Impact Speed (vf = sqrt(v0^2 + 2gh0)): ${gt.vfSpeed} m/s at angle ${gt.vfAngleDeg} deg below horizontal
- Optimal Launch Angle for Maximum Range: ${gt.optimalAngleDeg} deg (Yielding R_max = ${gt.maxPossibleRange} m)
- ${targetBlock}

### MASTER PHYSICS DOMAIN KNOWLEDGE:
1. **Equations of Motion**:
   - Horizontal: a_x = 0, v_x(t) = v_0\\cos\\theta, x(t) = (v_0\\cos\\theta)t
   - Vertical: a_y = -g, v_y(t) = v_0\\sin\\theta - gt, y(t) = h_0 + (v_0\\sin\\theta)t - \\frac{1}{2}gt^2
   - Trajectory Equation: y(x) = h_0 + x\\tan\\theta - \\frac{g x^2}{2 v_0^2 \\cos^2\\theta}
2. **Velocity & Acceleration at Apex**:
   - At the highest point, vertical velocity v_y = 0 m/s.
   - However, horizontal velocity is NEVER zero (v_x = v_0\\cos\\theta). The velocity vector at peak is (v_0\\cos\\theta, 0).
   - Gravitational acceleration is constant and downward (a = -g) at EVERY point along the flight path, including the peak.
3. **Elevated Launches (h0 > 0)**:
   - When launched from a platform (h0 > 0), the optimal angle theta_opt is strictly LESS than 45 degrees:
     \\theta_{opt} = \\arcsin\\left(\\frac{1}{\\sqrt{2 + \\frac{2gh_0}{v_0^2}}}\\right)
4. **Planetary Gravity Effects**:
   - Earth: g = 9.8 m/s^2 (Standard baseline)
   - Moon: g = 1.62 m/s^2 (Range is ~6.05x longer than Earth)
   - Mars: g = 3.72 m/s^2 (Range is ~2.63x longer than Earth)
   - Jupiter: g = 24.79 m/s^2 (Heavy gravity rapidly curtails range to ~0.395x Earth)
5. **Target Aiming Ballistics**:
   - To hit a target at distance d, solve for theta: \\tan\\theta = \\frac{v_0^2 \\pm \\sqrt{v_0^4 - g(g d^2 - 2 v_0^2 h_0)}}{g d}
   - For h0 = 0: \\sin(2\\theta) = \\frac{d \\cdot g}{v_0^2}. Two complementary angles exist (low flat trajectory vs high lofted arc).

### OUTPUT FORMAT:
- Present mathematical solutions with clear headings, explicit algebraic formulas, step-by-step substitution, and boxed/bold final results with SI units.
- Explain physical intuition clearly to foster deep conceptual mastery.`;
}

// Fallback high-precision mathematical engine when offline or testing
export function generateLocalPhysicsResponse(userMessage = "", context = {}) {
  if (isCreatorQuestion(userMessage)) {
    return CREATOR_RESPONSE;
  }

  const msg = userMessage.toLowerCase();

  // Colour Sensor & Tristimulus Colorimetry Queries
  if (
    context?.experiment === "Study of Colour Sensor" ||
    msg.includes("colour sensor") ||
    msg.includes("color sensor") ||
    msg.includes("tcs3200") ||
    msg.includes("tcs230") ||
    msg.includes("photodiode") ||
    msg.includes("tristimulus") ||
    msg.includes("colorimetry") ||
    msg.includes("spectral filter")
  ) {
    const d = context?.distanceMm || 12.0;
    const filter = (context?.filterChannel || "clear").toUpperCase();
    const fOut = context?.outputFrequencyKhz || 0;
    const hex = context?.detectedHex || "#000000";
    const fidelity = context?.matchFidelityPct || 0;

    return `### Colour Sensor & Tristimulus Analysis by **${AI_NAME}**

#### 1. Fundamental Optoelectronic Principles
The **TCS3200** color sensor converts spectral light irradiance into a calibrated square-wave pulse train:
$$I_{ph} = \\eta \\cdot \\frac{q P_{opt} \\lambda}{h c} \\implies f_{out} \\propto I_{ph}$$
- **Micro-Filter Array**: $8 \\times 8$ silicon photodiode matrix (16 Red, 16 Green, 16 Blue, 16 Clear unfiltered).
- **Pin Controls**:
  - $S_2=0, S_3=0 \\implies \\text{Red Filter } (\\approx 650\\text{ nm})$
  - $S_2=0, S_3=1 \\implies \\text{Blue Filter } (\\approx 470\\text{ nm})$
  - $S_2=1, S_3=0 \\implies \\text{Clear / Broadband } (350-950\\text{ nm})$
  - $S_2=1, S_3=1 \\implies \\text{Green Filter } (\\approx 540\\text{ nm})$

#### 2. Live Laboratory Telemetry
- **Standoff Distance ($d$)**: **${Number(d).toFixed(1)} mm**
- **Filter Channel**: **${filter}** (Active Output $f_{out} = \\mathbf{${Number(fOut).toFixed(1)}\\text{ kHz}}$)
- **Detected Color**: $\\mathbf{${hex}}$ (${fidelity}% Match Fidelity)

#### 3. Normalized Chromaticity Coordinates
$$r = \\frac{f_R}{f_R + f_G + f_B}, \\quad g = \\frac{f_G}{f_R + f_G + f_B}, \\quad b = \\frac{f_B}{f_R + f_G + f_B}$$
*Physical Guidance*: Light irradiance follows the Inverse-Square Law ($E \\propto 1/d^2$). Optimal standoff distance is $10-14\\text{ mm}$.`;
  }

  // Optical Fibre Numerical Aperture Queries
  if (
    context?.experiment === "Optical Fibre Numerical Aperture" ||
    msg.includes("optical fibre") ||
    msg.includes("optical fiber") ||
    msg.includes("numerical aperture") ||
    msg.includes("acceptance angle") ||
    msg.includes("light spot") ||
    msg.includes("cladding") ||
    msg.includes("core")
  ) {
    const L = context?.distanceL || 1.5;
    const W = context?.spotDiameterW || 1.51;
    const na = context?.numericalApertureNA || 0.4498;
    const theta = context?.acceptanceAngleDeg || 26.7;

    return `### Optical Fibre & Numerical Aperture Analysis by **${AI_NAME}**

#### 1. Core Physics & Acceptance Cone
- **Numerical Aperture (NA)** represents the light-gathering capacity of an optical waveguide.
- **Waveguide Formula**:
$$NA = \\sqrt{n_1^2 - n_2^2} = \\sin(\\theta_a)$$
where $n_1$ is Core Refractive Index and $n_2$ is Cladding Refractive Index ($n_1 > n_2$).

#### 2. Output Light Spot Method Formula
When light exits the fiber tip, it diverges conically. On a screen at distance $L$, the spot diameter is $W$:
$$NA = \\frac{W}{\\sqrt{4L^2 + W^2}}$$
$$\\theta_a = \\arcsin(NA)$$

#### 3. Current Laboratory Telemetry
- **Screen Distance ($L$)**: **${Number(L).toFixed(2)} cm**
- **Spot Diameter ($W$)**: **${Number(W).toFixed(2)} cm**
- **Calculated NA**: **${Number(na).toFixed(4)}**
- **Acceptance Half-Angle ($\\theta_a$)**: **${Number(theta).toFixed(1)}^\\circ**

#### 4. Practical Guidance
- Move the screen closer (smaller $L$) to decrease spot diameter $W$.
- Move the screen farther (larger $L$) to expand spot diameter $W$.
- Align $W$ with concentric circles ($1.0, 1.5, 2.0, 2.5, 3.0, 3.5\\text{ cm}$) and click **Record Observation**!`;
  }

  const gt = calculateTrajectoryGroundTruth(context);

  // 1. Target & Aiming Query
  if (msg.includes("target") || msg.includes("hit") || msg.includes("aim") || msg.includes("reach")) {
    if (gt.targetSolutions) {
      if (gt.targetSolutions.reachable) {
        return `### Target Solution Analysis from **${AI_NAME}**

To strike the target at **${gt.targetDistance} m** with your current launch velocity ($v_0 = ${gt.v0}\\text{ m/s}$ on ${gt.planet}, $g = ${gt.g}\\text{ m/s}^2$):

#### 1. Kinematic Aiming Solutions
- **Low Flat Trajectory**: Launch at **$\\mathbf{${gt.targetSolutions.lowAngle}^\\circ}$** (Direct, high-speed line with shorter travel time)
- **High Lofted Arc**: Launch at **$\\mathbf{${gt.targetSolutions.highAngle}^\\circ}$** (High apex, steep downward impact angle)

#### 2. Governing Ballistics Formula
For range $R$ and platform elevation $h_0$:
$$y(x) = h_0 + x\\tan\\theta - \\frac{g x^2 (1 + \\tan^2\\theta)}{2 v_0^2} = 0$$
$$\\tan\\theta = \\frac{v_0^2 \\pm \\sqrt{v_0^4 - g(g R^2 - 2 v_0^2 h_0)}}{g R}$$

- Minimum required launch velocity to reach this target at $45^\\circ$: **$v_{0,\\min} = ${gt.targetSolutions.minVelocityForTarget}\\text{ m/s}$**.`;
      } else {
        return `### Target Reachability Analysis from **${AI_NAME}**

At your current velocity ($v_0 = ${gt.v0}\\text{ m/s}$), the projectile has a maximum possible range of **${gt.maxPossibleRange} m**, which cannot reach the target at **${gt.targetDistance} m**.

#### Recommended Adjustments:
1. **Increase Launch Velocity**: Set $v_0 \\ge \\mathbf{${gt.targetSolutions.minVelocityForTarget}\\text{ m/s}}$ to bridge the distance.
2. **Optimize Angle**: Ensure your launch angle is close to **${gt.optimalAngleDeg}^\\circ** for maximum distance efficiency.`;
      }
    }
  }

  // 2. Maximum Range & Optimal Angle Query
  if (msg.includes("max range") || msg.includes("optimal") || msg.includes("45") || msg.includes("farthest")) {
    return `### Maximum Range & Launch Angle Optimization by **${AI_NAME}**

#### 1. Analytical Range Formula
$$R = \\frac{v_0 \\cos\\theta}{g} \\left( v_0 \\sin\\theta + \\sqrt{v_0^2 \\sin^2\\theta + 2 g h_0} \\right)$$

#### 2. Elevation Analysis:
${gt.h0 === 0
  ? `- For a flat ground launch ($h_0 = 0$), $R = \\frac{v_0^2 \\sin(2\\theta)}{g}$. The maximum occurs precisely at **$\\theta = 45^\\circ$**, where $\\sin(2\\theta) = 1.0$.`
  : `- Because the projectile is launched from an elevated platform ($h_0 = ${gt.h0}\\text{ m}$), the optimal launch angle shifts downward to **$\\mathbf{${gt.optimalAngleDeg}^\\circ}$**.\n- Formula: $\\theta_{opt} = \\arcsin\\left(\\frac{1}{\\sqrt{2 + \\frac{2gh_0}{v_0^2}}}\\right) = \\mathbf{${gt.optimalAngleDeg}^\\circ}$`
}

#### 3. Telemetry Comparison
- **Current Setup (${gt.angleDeg} deg, v0 = ${gt.v0} m/s)**: Range = **${gt.range} m**
- **Optimal Setup (${gt.optimalAngleDeg} deg, v0 = ${gt.v0} m/s)**: Max Range = **${gt.maxPossibleRange} m**`;
  }

  // 3. Peak Altitude & Apex Physics Query
  if (msg.includes("apex") || msg.includes("peak") || msg.includes("maximum height") || msg.includes("max height") || msg.includes("highest")) {
    return `### Trajectory Apex & Peak Altitude Analysis by **${AI_NAME}**

#### 1. Velocity Breakdown at Apex
- **Vertical Velocity ($v_y$)**: $\\mathbf{0.00\\text{ m/s}}$ (The projectile momentarily ceases rising before falling).
- **Horizontal Velocity ($v_x$)**: $\\mathbf{${gt.v0x}\\text{ m/s}}$ (Constant throughout the entire flight).
- **Total Speed at Peak**: $v_{apex} = \\sqrt{v_x^2 + v_y^2} = \\mathbf{${gt.v0x}\\text{ m/s}}$ directed horizontally.
- **Acceleration at Peak**: $\\mathbf{${gt.g}\\text{ m/s}^2}$ strictly downward. Acceleration does **NOT** equal zero at the top!

#### 2. Maximum Altitude Calculation
$$H_{max} = h_0 + \\frac{v_{0y}^2}{2g} = ${gt.h0} + \\frac{(${gt.v0y})^2}{2(${gt.g})} = \\mathbf{${gt.hApex}\\text{ m}}$$
- Time taken to reach apex: $t_{peak} = \\frac{v_{0y}}{g} = \\frac{${gt.v0y}}{${gt.g}} = \\mathbf{${gt.tApex}\\text{ s}}$.`;
  }

  // 4. Flight Time / Airtime Query
  if (msg.includes("time") || msg.includes("airtime") || msg.includes("duration") || msg.includes("how long")) {
    return `### Flight Duration & Airtime Analysis by **${AI_NAME}**

#### 1. Time of Flight Derivation
Using the vertical position equation $y(T) = 0$:
$$h_0 + (v_0 \\sin\\theta) T - \\frac{1}{2} g T^2 = 0$$

Applying the quadratic formula:
$$T = \\frac{v_{0y} + \\sqrt{v_{0y}^2 + 2 g h_0}}{g}$$

#### 2. Numerical Evaluation for Your Setup
- Initial Vertical Speed ($v_{0y}$): $20 \\cdot \\sin(${gt.angleDeg}^\\circ) = \\mathbf{${gt.v0y}\\text{ m/s}}$
- Quadratic Discriminant: $(${gt.v0y})^2 + 2(${gt.g})(${gt.h0}) = \\mathbf{${(gt.v0y * gt.v0y + 2 * gt.g * gt.h0).toFixed(2)}}$
- **Total Airtime**: $\\mathbf{${gt.tFlight}\\text{ seconds}}$`;
  }

  // 5. Planetary Gravity Comparison
  if (msg.includes("planet") || msg.includes("moon") || msg.includes("mars") || msg.includes("jupiter") || msg.includes("gravity")) {
    const rMoon = ((gt.v0 * gt.v0 * Math.sin((2 * gt.angleDeg * Math.PI) / 180)) / 1.62).toFixed(2);
    const rMars = ((gt.v0 * gt.v0 * Math.sin((2 * gt.angleDeg * Math.PI) / 180)) / 3.72).toFixed(2);
    const rJup = ((gt.v0 * gt.v0 * Math.sin((2 * gt.angleDeg * Math.PI) / 180)) / 24.79).toFixed(2);

    return `### Planetary Gravitation Kinematics Comparison by **${AI_NAME}**

Horizontal range and flight duration are inversely proportional to gravitational acceleration ($g$):

| Celestial Body | Gravity ($g$) | Trajectory Range ($v_0 = ${gt.v0}\\text{ m/s}, \\theta = ${gt.angleDeg}^\\circ$) | Relative Multiplier |
| :--- | :--- | :--- | :--- |
| **Earth** | $9.80\\text{ m/s}^2$ | **${gt.range} m** | $1.00\\times$ (Baseline) |
| **Moon** | $1.62\\text{ m/s}^2$ | **${rMoon} m** | **$6.05\\times$ farther** |
| **Mars** | $3.72\\text{ m/s}^2$ | **${rMars} m** | **$2.63\\times$ farther** |
| **Jupiter** | $24.79\\text{ m/s}^2$ | **${rJup} m** | **$0.40\\times$ (Suppressed)** |

**Active Environment**: ${gt.planet} ($g = ${gt.g}\\text{ m/s}^2$).`;
  }

  // Default Full Kinematics Breakdown
  return `### Precision Kinematic Dossier by **${AI_NAME}**

Based on the verified parameters in the active PhysiX laboratory:

#### 1. Launch Parameters & Velocity Decomposition
- **Launch Velocity ($v_0$)**: ${gt.v0} m/s at **$\\theta = ${gt.angleDeg}^\\circ$**
- **Horizontal Velocity ($v_{0x}$)**: $v_0 \\cos(${gt.angleDeg}^\\circ) = \\mathbf{${gt.v0x}\\text{ m/s}}$ (Constant)
- **Initial Vertical Velocity ($v_{0y}$)**: $v_0 \\sin(${gt.angleDeg}^\\circ) = \\mathbf{${gt.v0y}\\text{ m/s}}$
- **Environment**: ${gt.planet} ($g = ${gt.g}\\text{ m/s}^2$), Platform Height $h_0 = ${gt.h0}\\text{ m}$

#### 2. Calculated Trajectory Metrics
- **Total Flight Airtime ($T$)**: $\\mathbf{${gt.tFlight}\\text{ s}}$
- **Horizontal Range ($R$)**: $\\mathbf{${gt.range}\\text{ m}}$
- **Peak Altitude ($H_{max}$)**: $\\mathbf{${gt.hApex}\\text{ m}}$ (reached at $t = ${gt.tApex}\\text{ s}$)
- **Impact Speed ($v_f$)**: $\\mathbf{${gt.vfSpeed}\\text{ m/s}}$ at $\\mathbf{${gt.vfAngleDeg}^\\circ}$ downward angle
- **Theoretical Max Range Angle**: $\\mathbf{${gt.optimalAngleDeg}^\\circ}$ (Potential Range: **${gt.maxPossibleRange} m**)

Feel free to ask me to solve any target challenge, calculate custom projectile metrics, or explain classical mechanics theory!`;
}

// POST /api/ai/chat - Interactive AI Physics Copilot Chat
router.post("/chat", async (req, res) => {
  try {
    const { message, history = [], simulationContext = {} } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ success: false, error: "message is required." });
    }

    // Direct answer for creator / ownership queries
    if (isCreatorQuestion(message)) {
      return res.json({
        success: true,
        name: AI_NAME,
        project: PROJECT_NAME,
        model: "Vectra AI Direct",
        reply: CREATOR_RESPONSE
      });
    }

    const systemPrompt = getSystemPrompt(simulationContext);
    let aiResponseText = null;
    let usedModel = null;

    if (API_KEY) {
      for (const model of CANDIDATE_MODELS) {
        try {
          const contents = [];

          if (Array.isArray(history) && history.length > 0) {
            const formattedHistory = history.slice(-6).map(h => ({
              role: h.role === "user" ? "user" : "model",
              parts: [{ text: h.text || h.content || "" }]
            }));
            contents.push(...formattedHistory);
          }

          contents.push({
            role: "user",
            parts: [{ text: message }]
          });

          const requestBody = {
            system_instruction: {
              parts: [{ text: systemPrompt }]
            },
            contents,
            generationConfig: {
              temperature: 0.15,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1400
            }
          };

          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(9000),
            body: JSON.stringify(requestBody)
          });

          const data = await response.json();
          if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
            aiResponseText = data.candidates[0].content.parts[0].text;
            usedModel = model;
            break;
          } else {
            console.warn(`[Vectra AI] Model ${model} returned:`, data.error?.message || response.status);
          }
        } catch (callErr) {
          console.warn(`[Vectra AI] Model ${model} error:`, callErr.message);
        }
      }
    }

    if (!aiResponseText) {
      aiResponseText = generateLocalPhysicsResponse(message, simulationContext);
      usedModel = "Vectra AI (Precision Kinematics Core)";
    }

    res.json({
      success: true,
      name: AI_NAME,
      project: PROJECT_NAME,
      model: usedModel,
      reply: aiResponseText
    });
  } catch (err) {
    console.error("[Vectra AI Router] Error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
      reply: generateLocalPhysicsResponse(req.body.message || "physics", req.body.simulationContext)
    });
  }
});

// POST /api/ai/analyze-flight - Deep flight analysis
router.post("/analyze-flight", (req, res) => {
  try {
    const { flightData } = req.body;
    const gt = calculateTrajectoryGroundTruth(flightData || {});

    const analysis = `### Flight Telemetry Debrief by **${AI_NAME}**

#### 1. Experimental Flight Outcome
- **Launch Settings**: $v_0 = ${gt.v0}\\text{ m/s}$, $\\theta = ${gt.angleDeg}^\\circ$, $h_0 = ${gt.h0}\\text{ m}$, $g = ${gt.g}\\text{ m/s}^2$ (${gt.planet})
- **Touchdown Range ($R$)**: **${gt.range} meters**
- **Maximum Apex ($H_{max}$)**: **${gt.hApex} meters**
- **Flight Duration ($T$)**: **${gt.tFlight} seconds**
- **Terminal Impact Velocity**: **${gt.vfSpeed} m/s** at **${gt.vfAngleDeg} deg**

#### 2. Efficiency & Kinematic Assessment
- Velocity Decomposition: $v_{0x} = ${gt.v0x}\\text{ m/s}$, $v_{0y} = ${gt.v0y}\\text{ m/s}$
- Optimal Launch Angle for Setup: **${gt.optimalAngleDeg} deg** (Maximum Possible Range: **${gt.maxPossibleRange} m**)
- Launch Range Efficiency: **${Math.min(100, Math.round((gt.range / gt.maxPossibleRange) * 100))}%** of theoretical limit.`;

    res.json({
      success: true,
      name: AI_NAME,
      analysis
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/ai/status - AI Service Status
router.get("/status", (req, res) => {
  res.json({
    status: "ready",
    name: AI_NAME,
    project: PROJECT_NAME,
    hasApiKey: !!API_KEY
  });
});

export default router;
