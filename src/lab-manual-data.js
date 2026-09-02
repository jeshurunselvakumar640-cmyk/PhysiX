/**
 * PhysiX Virtual Physics Laboratory
 * Comprehensive Lab Manual Database for 14 Syllabus Experiments
 * Contains Aim, Apparatus, Theory, Step-by-Step Procedure, Formulae, Precautions, and IEEE Reference Books.
 */

export const IEEE_REFERENCE_BOOKS = [
  {
    id: "young-freedman",
    citationKey: "[1]",
    title: "Sears and Zemansky's University Physics",
    edition: "15th ed.",
    authors: "H. D. Young and R. A. Freedman",
    publisher: "Pearson",
    location: "Boston, MA, USA",
    year: "2019",
    ieeeCitation: "H. D. Young and R. A. Freedman, Sears and Zemansky's University Physics, 15th ed. Boston, MA, USA: Pearson, 2019.",
    coverTheme: "green-openstax",
    coverTag: "University Physics",
    volumeTag: "Volume 1 & 2",
    accentColor: "#22c55e",
    topics: ["Mechanics", "Wave Optics", "Electromagnetism", "Quantum Physics", "Optics"]
  },
  {
    id: "halliday-resnick",
    citationKey: "[2]",
    title: "Fundamentals of Physics",
    edition: "12th ed.",
    authors: "D. Halliday, R. Resnick, and J. Walker",
    publisher: "Wiley",
    location: "Hoboken, NJ, USA",
    year: "2021",
    ieeeCitation: "D. Halliday, R. Resnick, and J. Walker, Fundamentals of Physics, 12th ed. Hoboken, NJ, USA: Wiley, 2021.",
    coverTheme: "dark-nebula",
    coverTag: "Fundamentals of Physics",
    volumeTag: "Extended 12th Ed.",
    accentColor: "#f59e0b",
    topics: ["Classical Kinematics", "Interference & Diffraction", "Semiconductors", "Hall Effect"]
  },
  {
    id: "serway-jewett",
    citationKey: "[3]",
    title: "Physics for Scientists and Engineers",
    edition: "10th ed.",
    authors: "R. A. Serway and J. W. Jewett",
    publisher: "Cengage Learning",
    location: "Boston, MA, USA",
    year: "2018",
    ieeeCitation: "R. A. Serway and J. W. Jewett, Physics for Scientists and Engineers, 10th ed. Boston, MA, USA: Cengage Learning, 2018.",
    coverTheme: "blue-helix",
    coverTag: "Physics for Scientists & Engineers",
    volumeTag: "Modern Physics Ed.",
    accentColor: "#38bdf8",
    topics: ["Fiber Optics", "Photoelectric Effect", "Laser Beam Divergence", "RTD Sensors"]
  },
  {
    id: "hewitt-conceptual",
    citationKey: "[4]",
    title: "Conceptual Physics",
    edition: "13th ed.",
    authors: "P. G. Hewitt",
    publisher: "Pearson",
    location: "San Francisco, CA, USA",
    year: "2022",
    ieeeCitation: "P. G. Hewitt, Conceptual Physics, 13th ed. San Francisco, CA, USA: Pearson, 2022.",
    coverTheme: "blue-wave",
    coverTag: "Conceptual Physics",
    volumeTag: "13th Edition",
    accentColor: "#818cf8",
    topics: ["Newtonian Mechanics", "Light & Optical Phenomena", "Atomic Spectra", "Nanotechnology"]
  }
];

export const EXPERIMENTS_CATALOG = [
  {
    id: "exp-1-projectile",
    number: 1,
    title: "2D Projectile Motion & Trajectory Kinematics",
    category: "Mechanics & Kinematics",
    simulatorActive: true,
    simulatorExpId: "projectile",
    shortDescription: "Investigate parabolic trajectory, apex height, time of flight, range, and planetary gravity variations.",
    aim: "To study the trajectory of a projectile launched in a 2-dimensional plane, determine the dependence of horizontal range, maximum altitude, and flight time on launch angle and initial velocity, and verify gravitational dynamics across celestial planetary bodies.",
    apparatus: [
      { name: "Kinematic Projectile Launcher", desc: "Angle-calibrated spring/pneumatic launcher (0° to 90°)" },
      { name: "Precision Photogate Timers", desc: "Digital microsecond airtime and muzzle velocity sensors" },
      { name: "Metric Landing Runway", desc: "Calibrated horizontal distance measurement scale" },
      { name: "Variable Elevation Pedestal", desc: "Vertical height adjustment platform (0 m to 10 m)" },
      { name: "Target Impact Sensor", desc: "Piezoelectric bullseye landing detection pad" }
    ],
    theory: `Projectile motion is a form of two-dimensional motion where an object is projected near the Earth's surface and moves along a curved path under the action of gravity alone (neglecting air resistance).

### 1. Kinematic Velocity Decomposition
An initial launch velocity $v_0$ directed at an angle $\\theta$ above the horizontal decomposes into orthogonal components:
$$v_{0x} = v_0 \\cos\\theta$$
$$v_{0y} = v_0 \\sin\\theta$$

### 2. Equations of Motion
- **Horizontal Direction** (Zero Acceleration: $a_x = 0$):
  $$x(t) = (v_0 \\cos\\theta) t$$
- **Vertical Direction** (Constant Downward Acceleration: $a_y = -g$):
  $$y(t) = h_0 + (v_0 \\sin\\theta) t - \\frac{1}{2} g t^2$$
  $$v_y(t) = v_0 \\sin\\theta - g t$$

### 3. Key Trajectory Milestones
- **Time to Apex ($t_{apex}$)**: Occurs when vertical velocity momentarily vanishes ($v_y = 0$):
  $$t_{apex} = \\frac{v_0 \\sin\\theta}{g}$$
- **Maximum Apex Altitude ($H_{max}$)**:
  $$H_{max} = h_0 + \\frac{(v_0 \\sin\\theta)^2}{2g}$$
- **Total Flight Airtime ($T$)**:
  $$T = \\frac{v_0 \\sin\\theta + \\sqrt{(v_0 \\sin\\theta)^2 + 2 g h_0}}{g}$$
- **Horizontal Ground Range ($R$)**:
  $$R = v_{0x} \\times T = \\frac{v_0^2 \\sin(2\\theta)}{g} \\quad (\\text{for } h_0 = 0)$$`,
    procedure: [
      "Set the launcher pedestal to the desired initial elevation height (h₀).",
      "Calibrate the launch angle (θ) on the protractor barrel from 15° to 75° in steps of 5°.",
      "Adjust the initial launch velocity (v₀) and select the planetary gravity environment (Earth: 9.8 m/s², Moon: 1.6 m/s², Mars: 3.7 m/s², Jupiter: 24.8 m/s²).",
      "Fire the projectile launcher and record the horizontal landing distance (x), flight airtime (t), and peak apex altitude (y) from the telemetry HUD.",
      "Enable 'Comparison Ghost Trails' to visually trace trajectories across consecutive launches.",
      "Toggle 'Target Landing Challenge Mode' and calculate the required launch angle θ to hit the randomized landing pad at distance d.",
      "Compare the experimental range with theoretical values calculated using the trajectory formula."
    ],
    formulae: [
      { name: "Horizontal Range", latex: "R = \\frac{v_0^2 \\sin(2\\theta)}{g}" },
      { name: "Maximum Apex Height", latex: "H_{max} = h_0 + \\frac{(v_0 \\sin\\theta)^2}{2g}" },
      { name: "Total Flight Duration", latex: "T = \\frac{v_0 \\sin\\theta + \\sqrt{(v_0 \\sin\\theta)^2 + 2gh_0}}{g}" },
      { name: "Trajectory Parabola Equation", latex: "y(x) = h_0 + x \\tan\\theta - \\frac{g x^2}{2 v_0^2 \\cos^2\\theta}" }
    ],
    precautions: [
      "Ensure the launcher base is perfectly leveled horizontally before initiating launches.",
      "Keep clear of the projectile launch trajectory line during firing.",
      "Verify that photogate timers are clean and aligned with the muzzle axis."
    ],
    references: [
      {
        bookId: "young-freedman",
        citation: "[1] H. D. Young and R. A. Freedman, Sears and Zemansky's University Physics, 15th ed. Boston, MA, USA: Pearson, 2019.",
        chapter: "Chapter 3: Motion in Two or Three Dimensions (Sections 3.3–3.4 Projectile Motion)"
      },
      {
        bookId: "halliday-resnick",
        citation: "[2] D. Halliday, R. Resnick, and J. Walker, Fundamentals of Physics, 12th ed. Hoboken, NJ, USA: Wiley, 2021.",
        chapter: "Chapter 4: Motion in Two and Three Dimensions (Section 4.6 Projectile Motion Analyzed)"
      },
      {
        bookId: "hewitt-conceptual",
        citation: "[4] P. G. Hewitt, Conceptual Physics, 13th ed. San Francisco, CA, USA: Pearson, 2022.",
        chapter: "Chapter 10: Projectile and Satellite Motion (Sections 10.1–10.2 Projectile Motion)"
      }
    ]
  },
  {
    id: "exp-2-optical-na",
    number: 2,
    title: "Determination of Numerical Aperture of an Optical Fibre",
    category: "Fiber Optics & Lasers",
    simulatorActive: true,
    simulatorExpId: "optical",
    shortDescription: "Calculate light-gathering power and acceptance cone angle of multimode step-index optical fibers.",
    aim: "To determine the Numerical Aperture (NA) and the maximum Acceptance Angle (θₐ) of a step-index multimode optical fibre using the far-field laser spot projection method.",
    apparatus: [
      { name: "Optical Fibre Trainer Bench", desc: "Stabilized DC power unit with integrated 660 nm red laser source" },
      { name: "Multimode Plastic Optical Fibre (POF)", desc: "1 mm core/cladding step-index patch cord (1 meter length)" },
      { name: "Concentric Ring Screen Target", desc: "Calibrated projection screen with millimeter concentric circles (10 mm to 50 mm)" },
      { name: "Precision Screen Rail Slider", desc: "Linear distance stage adjustable from L = 0.5 cm to 5.0 cm" },
      { name: "Fiber Optic Micro-Mounts", desc: "SMA-905 fiber connectors with SMA input/output receptacles" }
    ],
    theory: `The **Numerical Aperture (NA)** is a dimensionless figure of merit that characterizes the light-gathering capability of an optical fiber and defines the cone of acceptance within which light rays are guided via **Total Internal Reflection (TIR)**.

### 1. Refractive Index & Total Internal Reflection
For a step-index fiber with core refractive index $n_{core}$ and cladding refractive index $n_{cladding}$ ($n_{core} > n_{cladding}$):
$$NA = \\sin \\theta_a = \\sqrt{n_{core}^2 - n_{cladding}^2}$$
where $\\theta_a$ is the maximum half-angle of the acceptance cone in air ($n_{air} \\approx 1.0$).

### 2. Spot Geometry Derivation
When light exits the fiber end-face and projects onto a screen placed at a perpendicular distance $L$:
- Emerging light cone creates a circular spot of diameter $W$.
- The radius of the spot is $r = W/2$.
- By trigonometry:
$$\\tan \\theta_a = \\frac{W / 2}{L} = \\frac{W}{2L}$$
$$\\sin \\theta_a = \\frac{\\tan \\theta_a}{\\sqrt{1 + \\tan^2 \\theta_a}} = \\frac{\\frac{W}{2L}}{\\sqrt{1 + \\left(\\frac{W}{2L}\\right)^2}} = \\frac{W}{\\sqrt{4L^2 + W^2}}$$

Therefore, the **Numerical Aperture** is calculated directly as:
$$\\mathbf{NA = \\frac{W}{\\sqrt{4L^2 + W^2}}}$$
$$\\mathbf{\\theta_a = \\arcsin(NA)}$$`,
    procedure: [
      "Place the Optical Fibre Trainer Kit on a stable, horizontal work surface and connect the AC power adapter.",
      "Switch ON the DC Power Supply and energize the 660 nm Red Laser Transmitter LED.",
      "Couple one end of the 1-meter Plastic Optical Fibre to the transmitter SMA connector and securely mount the opposite end onto the calibrated screen slider arm.",
      "Set the screen distance to L = 1.0 cm and align the emerging red light cone with the concentric ring target.",
      "Identify the concentric circle whose circumference best encloses the illuminated spot boundary and record the diameter W (cm).",
      "Increment screen distance L by 0.5 cm (1.5 cm, 2.0 cm, 2.5 cm, 3.0 cm, 3.5 cm) and record the corresponding spot diameter W for each step.",
      "Compute the Numerical Aperture NA using NA = W / sqrt(4L² + W²) and acceptance angle θₐ = arcsin(NA).",
      "Plot a graph of Spot Diameter W (y-axis) versus Screen Distance L (x-axis) and verify linearity."
    ],
    formulae: [
      { name: "Numerical Aperture (NA)", latex: "NA = \\frac{W}{\\sqrt{4L^2 + W^2}}" },
      { name: "Maximum Acceptance Angle", latex: "0_a = \\arcsin(NA) = \\arcsin\\left(\\frac{W}{\\sqrt{4L^2 + W^2}}\\right)" },
      { name: "Core-Cladding Index Relation", latex: "NA = \\sqrt{n_{core}^2 - n_{cladding}^2}" }
    ],
    precautions: [
      "Never look directly into the fiber end-face when the laser source is active.",
      "Do not bend the optical fiber beyond its minimum allowable bend radius (R_min ≈ 30 mm) to prevent microbending losses.",
      "Ensure fiber connector end-faces are clean and polished before inserting into SMA receptacles."
    ],
    references: [
      {
        bookId: "serway-jewett",
        citation: "[3] R. A. Serway and J. W. Jewett, Physics for Scientists and Engineers, 10th ed. Boston, MA, USA: Cengage Learning, 2018.",
        chapter: "Chapter 35: Nature of Light and Laws of Ray Optics (Section 35.8 Total Internal Reflection & Fiber Optics)"
      },
      {
        bookId: "young-freedman",
        citation: "[1] H. D. Young and R. A. Freedman, Sears and Zemansky's University Physics, 15th ed. Boston, MA, USA: Pearson, 2019.",
        chapter: "Chapter 33: The Nature and Propagation of Light (Section 33.4 Total Internal Reflection)"
      },
      {
        bookId: "halliday-resnick",
        citation: "[2] D. Halliday, R. Resnick, and J. Walker, Fundamentals of Physics, 12th ed. Hoboken, NJ, USA: Wiley, 2021.",
        chapter: "Chapter 33: Electromagnetic Waves (Section 33.8 Total Internal Reflection)"
      }
    ]
  },
  {
    id: "exp-3-laser-divergence",
    number: 3,
    title: "Determine the Divergence of Laser Beam",
    category: "Fiber Optics & Lasers",
    simulatorActive: false,
    shortDescription: "Measure far-field beam spot expansion and calculate angular beam divergence of He-Ne/Diode lasers.",
    aim: "To determine the angular divergence of a semiconductor diode laser / He-Ne laser beam by measuring the beam spot diameter at varying propagation distances.",
    apparatus: [
      { name: "He-Ne / Semiconductor Laser Source", desc: "Wavelength λ = 632.8 nm or 650 nm, power 2-5 mW" },
      { name: "Optical Rail Bench", desc: "Graduated 2-meter optical rail with sliding carriers" },
      { name: "Millimeter Graph Target Screen", desc: "Precision grid target with 1 mm divisions" },
      { name: "Digital Vernier Caliper", desc: "Least count 0.01 mm for spot diameter measurement" },
      { name: "Photodetector Aperture", desc: "Gaussian beam waist profiler (optional)" }
    ],
    theory: `Laser beams exhibit very low divergence compared to conventional light sources. However, due to diffraction, every laser beam undergoes spatial beam spreading as it propagates along the z-axis.

For a circular Gaussian laser beam:
- Let $w_1$ be the spot diameter at distance $z_1$.
- Let $w_2$ be the spot diameter at distance $z_2$ ($z_2 > z_1$).

The **Angular Beam Divergence ($\\theta$)** in radians is given by:
$$\\mathbf{\\theta = \\frac{w_2 - w_1}{z_2 - z_1}}$$
In milliradians (mrad):
$$\\theta_{\\text{mrad}} = \\frac{w_2 - w_1}{z_2 - z_1} \\times 1000$$`,
    procedure: [
      "Mount the laser source securely on the optical bench and align it horizontally.",
      "Position the millimeter graph screen at distance z₁ = 50 cm from the laser aperture.",
      "Observe the circular beam spot and measure its horizontal and vertical diameter using the vernier caliper. Take the average as w₁.",
      "Move the screen to distances z₂ = 100 cm, 150 cm, 200 cm, 250 cm, and 300 cm.",
      "Measure and record spot diameters w₂, w₃, w₄, w₅ for each distance.",
      "Plot a graph of spot diameter w against distance z. The slope of the straight line gives the angular divergence θ."
    ],
    formulae: [
      { name: "Angular Divergence", latex: "\\theta = \\frac{w_2 - w_1}{z_2 - z_1} \\text{ (rad)}" },
      { name: "Half-Angle Divergence", latex: "\\theta_{1/2} = \\frac{\\lambda}{\\pi w_0}" }
    ],
    precautions: [
      "Never look directly into the laser beam or its specular reflections.",
      "Ensure ambient lighting is dimmed for accurate spot boundary perception."
    ],
    references: [
      {
        bookId: "serway-jewett",
        citation: "[3] R. A. Serway and J. W. Jewett, Physics for Scientists and Engineers, 10th ed. Boston, MA, USA: Cengage Learning, 2018.",
        chapter: "Chapter 36: Image Formation (Laser Beam Optics & Gaussian Beams)"
      },
      {
        bookId: "young-freedman",
        citation: "[1] H. D. Young and R. A. Freedman, Sears and Zemansky's University Physics, 15th ed. Boston, MA, USA: Pearson, 2019.",
        chapter: "Chapter 35: Interference (Section 35.5 Lasers and Coherent Light)"
      }
    ]
  },
  {
    id: "exp-4-newtons-rings",
    number: 4,
    title: "Determination of Radius of Curvature of a Lens using Newton's Ring Setup",
    category: "Wave Optics & Interference",
    simulatorActive: false,
    shortDescription: "Study division-of-amplitude interference and calculate convex lens radius of curvature from fringe diameters.",
    aim: "To determine the radius of curvature (R) of a plano-convex lens by forming Newton's circular interference rings using a monochromatic sodium light source.",
    apparatus: [
      { name: "Newton's Rings Apparatus", desc: "Plano-convex lens of large focal length placed on an optical flat glass plate" },
      { name: "Sodium Vapour Lamp", desc: "Monochromatic light source of wavelength λ = 589.3 nm" },
      { name: "Travelling Microscope", desc: "Horizontal vernier scale with crosswire and least count 0.001 cm" },
      { name: "45° Glass Plate Reflector", desc: "Semi-reflecting beam splitter for normal incidence" },
      { name: "Condensing Lens", desc: "Converging lens for parallel illumination" }
    ],
    theory: `When a plano-convex lens with large radius of curvature $R$ is placed on an optically flat glass plate, a thin wedge-shaped air film of gradually increasing thickness is formed between them.

Light reflected from the upper and lower surfaces of the air film interferes to produce concentric dark and bright circular fringes.

### Diameter of Dark Rings
For the $n$-th dark ring:
$$D_n^2 = 4 n \\lambda R$$
For the $(n+p)$-th dark ring:
$$D_{n+p}^2 = 4 (n + p) \\lambda R$$
Subtracting equations:
$$D_{n+p}^2 - D_n^2 = 4 p \\lambda R$$
Therefore, the **Radius of Curvature ($R$)** is:
$$\\mathbf{R = \\frac{D_{n+p}^2 - D_n^2}{4 p \\lambda}}$$`,
    procedure: [
      "Level the travelling microscope and focus on the center of the Newton's rings pattern.",
      "Traverse the crosswire to the 20th dark ring on the left side of the center.",
      "Record the main scale and vernier scale readings.",
      "Move the crosswire inward, taking readings at every 2nd ring (18th, 16th, ... 2nd).",
      "Pass through the center to the right side and record ring positions up to the 20th ring.",
      "Calculate diameter D_n = |Left - Right| and determine D_n².",
      "Plot D_n² vs ring number n and determine slope = 4λR to find R."
    ],
    formulae: [
      { name: "Radius of Curvature (R)", latex: "R = \\frac{D_{n+p}^2 - D_n^2}{4 p \\lambda}" },
      { name: "Dark Ring Diameter", latex: "D_n = 2 \\sqrt{n \\lambda R}" },
      { name: "Bright Ring Diameter", latex: "D_n = 2 \\sqrt{\\left(n - \\frac{1}{2}\\right) \\lambda R}" }
    ],
    precautions: [
      "The glass plate and lens surfaces must be thoroughly cleaned with lens tissue.",
      "The travelling microscope must always be moved in the same direction to avoid backlash error."
    ],
    references: [
      {
        bookId: "young-freedman",
        citation: "[1] H. D. Young and R. A. Freedman, Sears and Zemansky's University Physics, 15th ed. Boston, MA, USA: Pearson, 2019.",
        chapter: "Chapter 35: Interference (Section 35.4 Thin-Film Interference and Newton's Rings)"
      },
      {
        bookId: "halliday-resnick",
        citation: "[2] D. Halliday, R. Resnick, and J. Walker, Fundamentals of Physics, 12th ed. Hoboken, NJ, USA: Wiley, 2021.",
        chapter: "Chapter 35: Interference (Section 35.6 Interference from Thin Films)"
      }
    ]
  },
  {
    id: "exp-5-wedge-film",
    number: 5,
    title: "Determination of Diameter of Wire/Hair or Thickness of Paper using Wedge Shape Film Method",
    category: "Wave Optics & Interference",
    simulatorActive: false,
    shortDescription: "Measure microscopic thickness and hair wire diameter via straight equidistant interference fringes.",
    aim: "To determine the diameter of a thin wire (or hair / paper thickness) by forming a wedge-shaped air film and observing equal-thickness interference fringes.",
    apparatus: [
      { name: "Two Optically Flat Glass Plates", desc: "Matched rectangular glass plates (75 mm × 25 mm)" },
      { name: "Sodium Vapour Lamp (589.3 nm)", desc: "Monochromatic light source" },
      { name: "Travelling Microscope", desc: "Least count 0.001 cm" },
      { name: "Microscopic Specimen", desc: "Thin copper wire, hair fiber, or paper strip spacer" },
      { name: "45° Semi-Reflector", desc: "Glass plate for normal illumination" }
    ],
    theory: `When two glass plates are placed in contact at one end and separated by a thin wire of diameter $t$ at a distance $L$ from the contact edge, a wedge-shaped air film of angle $\\theta = t/L$ is formed.

Interference between rays reflected from upper and lower surfaces yields straight, parallel, equidistant fringes of fringe width $\\beta$:
$$\\beta = \\frac{\\lambda}{2 \\theta} = \\frac{\\lambda L}{2 t}$$

Solving for the **wire diameter / film thickness ($t$)**:
$$\\mathbf{t = \\frac{\\lambda L}{2 \\beta}}$$`,
    procedure: [
      "Clean glass plates and place the test wire spacer near one edge to create a wedge angle.",
      "Illuminate with monochromatic sodium light (λ = 589.3 nm) using the 45° glass reflector.",
      "Focus the travelling microscope to obtain sharp straight dark and bright fringes.",
      "Traverse crosswire across 20 successive fringes, recording positions to determine mean fringe width β.",
      "Measure length L from the contact edge to the position of the wire.",
      "Calculate diameter t = (λ L) / (2 β)."
    ],
    formulae: [
      { name: "Thickness of Spacer / Wire", latex: "t = \\frac{\\lambda L}{2 \\beta}" },
      { name: "Fringe Width", latex: "\\beta = \\frac{\\lambda}{2 \\theta}" }
    ],
    precautions: [
      "Ensure the contact edge of both plates is clean and firmly clamped.",
      "Avoid touching the optical surfaces with bare hands."
    ],
    references: [
      {
        bookId: "halliday-resnick",
        citation: "[2] D. Halliday, R. Resnick, and J. Walker, Fundamentals of Physics, 12th ed. Hoboken, NJ, USA: Wiley, 2021.",
        chapter: "Chapter 35: Interference (Section 35.7 Wedge-Shaped Films)"
      },
      {
        bookId: "young-freedman",
        citation: "[1] H. D. Young and R. A. Freedman, Sears and Zemansky's University Physics, 15th ed. Boston, MA, USA: Pearson, 2019.",
        chapter: "Chapter 35: Interference (Section 35.4 Thin Films)"
      }
    ]
  },
  {
    id: "exp-6-hall-effect",
    number: 6,
    title: "Determination of Hall Coefficient using Hall Effect Phenomenon",
    category: "Quantum & Solid State",
    simulatorActive: false,
    shortDescription: "Examine Lorentz force deflection in semiconductors, calculate Hall coefficient, carrier density and type.",
    aim: "To observe the Hall Effect in a semiconductor (Germanium / Silicon crystal), determine the Hall Coefficient ($R_H$), charge carrier concentration ($n$), and determine carrier sign (p-type or n-type).",
    apparatus: [
      { name: "Hall Effect Probe Setup", desc: "Ge crystal wafer with 4 contacts mounted on PCB" },
      { name: "Electromagnet & Power Supply", desc: "Generates uniform magnetic field B (0 to 0.5 Tesla)" },
      { name: "Constant Current Generator", desc: "Supplies current I = 0 to 20 mA to semiconductor" },
      { name: "Digital Gaussmeter & Hall Probe", desc: "Measures magnetic flux density B" },
      { name: "Digital Microvoltmeter", desc: "Measures transverse Hall voltage V_H (mV)" }
    ],
    theory: `When a current-carrying conductor or semiconductor is placed in a transverse magnetic field $B$, the magnetic Lorentz force $\\vec{F} = q(\\vec{v}_d \\times \\vec{B})$ deflects charge carriers toward one lateral face.

This accumulation establishes a transverse electric field known as the **Hall field ($E_H$)** and a transverse potential difference **Hall Voltage ($V_H$)**:
$$V_H = \\frac{R_H I B}{t}$$

where:
- $I$ = longitudinal current through sample
- $B$ = magnetic field strength
- $t$ = thickness of semiconductor wafer
- $R_H$ = Hall Coefficient:
$$\\mathbf{R_H = \\frac{V_H \\cdot t}{I \\cdot B} = \\frac{1}{n q}}$$
Carrier density $n = \\frac{1}{|R_H| q}$.`,
    procedure: [
      "Connect the Hall probe to the constant current generator and microvoltmeter.",
      "Place the Hall probe between the pole pieces of the electromagnet.",
      "With B = 0, adjust zero offset on microvoltmeter.",
      "Set constant probe current I = 5 mA and vary magnetic field B from 0.1 T to 0.5 T, recording Hall voltage V_H.",
      "Next, fix magnetic field B = 0.3 T and vary current I from 1 mA to 10 mA, recording V_H.",
      "Plot V_H vs B and V_H vs I to obtain slopes and determine R_H and carrier density n."
    ],
    formulae: [
      { name: "Hall Coefficient", latex: "R_H = \\frac{V_H \\cdot t}{I \\cdot B}" },
      { name: "Carrier Concentration", latex: "n = \\frac{1}{R_H \\cdot e}" },
      { name: "Hall Mobility", latex: "\\mu_H = \\sigma \\cdot |R_H|" }
    ],
    precautions: [
      "Ensure Hall probe is oriented perpendicular to the magnetic field lines.",
      "Do not exceed maximum allowable current through the semiconductor wafer."
    ],
    references: [
      {
        bookId: "halliday-resnick",
        citation: "[2] D. Halliday, R. Resnick, and J. Walker, Fundamentals of Physics, 12th ed. Hoboken, NJ, USA: Wiley, 2021.",
        chapter: "Chapter 28: Magnetic Fields (Section 28.5 The Hall Effect)"
      },
      {
        bookId: "young-freedman",
        citation: "[1] H. D. Young and R. A. Freedman, Sears and Zemansky's University Physics, 15th ed. Boston, MA, USA: Pearson, 2019.",
        chapter: "Chapter 27: Magnetic Field and Magnetic Forces (Section 27.9 The Hall Effect)"
      }
    ]
  },
  {
    id: "exp-7-diffraction-grating",
    number: 7,
    title: "Determination of Wavelength using Diffraction Grating (Laser Source)",
    category: "Wave Optics & Interference",
    simulatorActive: false,
    shortDescription: "Calculate laser light wavelength and grating element lines per inch from diffraction order angles.",
    aim: "To determine the wavelength of monochromatic laser light (He-Ne / Semiconductor Laser) using a plane transmission diffraction grating at normal incidence.",
    apparatus: [
      { name: "Laser Source (Red λ ~ 632.8 nm or Green λ ~ 532 nm)", desc: "Class II / IIIa laser module" },
      { name: "Plane Transmission Diffraction Grating", desc: "15,000 lines/inch (N ≈ 590,551 lines/meter) or 500 lines/mm" },
      { name: "Precision Optical Bench & Screen", desc: "Calibrated linear rail with millimeter coordinate screen" },
      { name: "Mounting Holders", desc: "Grating rotation stage and lens mount" }
    ],
    theory: `A diffraction grating consists of a large number of equidistant parallel slits. When parallel laser light falls normally on the grating, diffracted rays interfere constructively according to the **Grating Equation**:

$$(a + b) \\sin \\theta_m = m \\lambda$$

where:
- $(a + b) = d = \\frac{1}{N}$ is the grating element (slit separation).
- $m$ is the diffraction order ($m = 0, \\pm 1, \\pm 2, ...$).
- $\\theta_m$ is the diffraction angle for the $m$-th order:
$$\\tan \\theta_m = \\frac{x_m}{D}$$
where $x_m$ is the distance from central maximum ($m=0$) to $m$-th order spot, and $D$ is the distance from grating to screen.

Therefore, wavelength $\\lambda$:
$$\\mathbf{\\lambda = \\frac{d \\sin \\theta_m}{m}}$$`,
    procedure: [
      "Direct the laser beam normally onto the plane transmission diffraction grating.",
      "Position the screen at distance D = 1.0 m from the grating.",
      "Observe the bright diffraction spots on the screen corresponding to m = 0, m = ±1, m = ±2.",
      "Measure distance xₘ from central maximum (m=0) to left and right diffraction maxima.",
      "Repeat for multiple screen distances D = 1.2 m, 1.4 m, 1.6 m, 1.8 m.",
      "Calculate sin(θₘ) and solve for laser wavelength λ."
    ],
    formulae: [
      { name: "Grating Equation", latex: "(a + b) \\sin \\theta_m = m \\lambda" },
      { name: "Grating Element", latex: "d = \\frac{1}{N} \\quad (N = \\text{lines per meter})" },
      { name: "Diffraction Angle", latex: "\\theta_m = \\arctan\\left(\\frac{x_m}{D}\\right)" }
    ],
    precautions: [
      "Grating must be set exactly perpendicular to the incident laser beam.",
      "Do not touch the ruled surface of the optical grating."
    ],
    references: [
      {
        bookId: "young-freedman",
        citation: "[1] H. D. Young and R. A. Freedman, Sears and Zemansky's University Physics, 15th ed. Boston, MA, USA: Pearson, 2019.",
        chapter: "Chapter 36: Diffraction (Section 36.5 Multiple Slits & Diffraction Gratings)"
      },
      {
        bookId: "halliday-resnick",
        citation: "[2] D. Halliday, R. Resnick, and J. Walker, Fundamentals of Physics, 12th ed. Hoboken, NJ, USA: Wiley, 2021.",
        chapter: "Chapter 36: Diffraction (Section 36.7 Diffraction Gratings)"
      }
    ]
  },
  {
    id: "exp-8-plancks-constant",
    number: 8,
    title: "Determination of Planck's Constant using Photocell",
    category: "Quantum & Solid State",
    simulatorActive: false,
    shortDescription: "Validate Einstein's photoelectric equation and compute Planck's constant from stopping potentials.",
    aim: "To determine Planck's Constant ($h$) and the work function of a photocathode by measuring the stopping potential for various monochromatic optical wavelengths using a vacuum photocell.",
    apparatus: [
      { name: "Photoelectric Apparatus Kit", desc: "Enclosed vacuum photocell with microampere circuit" },
      { name: "Mercury Arc Lamp / LED Sources", desc: "Wavelengths: 365 nm, 405 nm, 436 nm, 546 nm, 577 nm" },
      { name: "Monochromatic Optical Filters", desc: "Narrowband optical pass filters" },
      { name: "Regulated Reverse Voltage Supply", desc: "Variable retarding potential 0 to -3.0 V" },
      { name: "Digital Picoammeter / Microvoltmeter", desc: "High sensitivity current sensor" }
    ],
    theory: `According to Einstein's Photoelectric Equation, the maximum kinetic energy of emitted photoelectrons depends linearly on photon frequency $\\nu$:

$$K_{max} = e V_0 = h \\nu - \\Phi_0$$

where:
- $h$ = Planck's constant ($6.626 \\times 10^{-34} \\text{ J}\\cdot\\text{s}$)
- $\\nu = c / \\lambda$ = frequency of incident radiation
- $V_0$ = stopping potential (retarding potential required to reduce photocurrent to zero)
- $\\Phi_0 = h \\nu_0$ = work function of cathode material

Rearranging in slope-intercept form:
$$V_0 = \\left(\\frac{h}{e}\\right) \\nu - \\frac{\\Phi_0}{e}$$

Plotting $V_0$ (y-axis) versus frequency $\\nu$ (x-axis) yields a straight line with slope:
$$\\text{Slope} = \\frac{h}{e} \\implies \\mathbf{h = e \\times \\text{Slope}}$$`,
    procedure: [
      "Place the photocell inside the dark enclosure facing the mercury lamp aperture.",
      "Insert the first color filter (e.g. Yellow, λ = 577 nm, ν = 5.19 × 10¹⁴ Hz).",
      "Vary reverse bias potential until photocurrent drops precisely to zero. Record stopping potential V₀.",
      "Repeat for Green (546 nm), Blue (436 nm), Violet (405 nm), and UV (365 nm) filters.",
      "Plot Stopping Potential V₀ vs Frequency ν.",
      "Calculate slope of the linear fit and multiply by electron charge e = 1.602 × 10⁻¹⁹ C to obtain h."
    ],
    formulae: [
      { name: "Einstein Photoelectric Equation", latex: "e V_0 = h \\nu - \\Phi_0" },
      { name: "Planck's Constant", latex: "h = e \\cdot \\left(\\frac{\\Delta V_0}{\\Delta \\nu}\\right)" },
      { name: "Work Function", latex: "\\Phi_0 = h \\nu_0 = e \\cdot |V_{\\text{intercept}}|" }
    ],
    precautions: [
      "Ensure the photocell box is shielded from ambient stray light.",
      "Allow the mercury discharge lamp to stabilize for 10 minutes prior to recording readings."
    ],
    references: [
      {
        bookId: "serway-jewett",
        citation: "[3] R. A. Serway and J. W. Jewett, Physics for Scientists and Engineers, 10th ed. Boston, MA, USA: Cengage Learning, 2018.",
        chapter: "Chapter 40: Quantum Physics (Section 40.2 The Photoelectric Effect)"
      },
      {
        bookId: "young-freedman",
        citation: "[1] H. D. Young and R. A. Freedman, Sears and Zemansky's University Physics, 15th ed. Boston, MA, USA: Pearson, 2019.",
        chapter: "Chapter 38: Photons: Light Waves Behaving as Particles (Section 38.2 The Photoelectric Effect)"
      }
    ]
  },
  {
    id: "exp-9-udm-parameters",
    number: 9,
    title: "Determine UDM Parameters",
    category: "Mechanics & Kinematics",
    simulatorActive: false,
    shortDescription: "Calculate Ultrasonic Distance Measurement acoustic velocity, pulse echo timing, and attenuation constants.",
    aim: "To calibrate an Ultrasonic Distance Measurement (UDM) transducer system and determine acoustic pulse transit velocity, ranging accuracy, and resolution parameters.",
    apparatus: [
      { name: "Ultrasonic Transceiver Module (HC-SR04 / 40 kHz)", desc: "Piezoelectric transmitter and receiver array" },
      { name: "Digital Storage Oscilloscope (DSO)", desc: "100 MHz bandwidth for Time-of-Flight (ToF) measurement" },
      { name: "Precision Calibrated Linear Track", desc: "Acoustic reflector target movable from 5 cm to 200 cm" },
      { name: "Microcontroller / Timing Generator", desc: "Generates 10 µs trigger pulses and reads echo duration" }
    ],
    theory: `Ultrasonic sensors emit 40 kHz acoustic burst pulses. The sound waves propagate through the medium (air), reflect off an acoustic impedance mismatch boundary, and return to the receiver.

The **Time-of-Flight (ToF) $\\Delta t$** relates to target distance $d$:
$$d = \\frac{v_{sound} \\cdot \\Delta t}{2}$$

where sound velocity in air varies with temperature $T$ (°C):
$$v_{sound}(T) = 331.3 \\sqrt{1 + \\frac{T}{273.15}} \\approx 331.3 + 0.606 T \\text{ (m/s)}$$`,
    procedure: [
      "Place the ultrasonic transducer normal to the acoustic reflection plane.",
      "Send a 10 µs trigger pulse and capture the echo waveform on the oscilloscope.",
      "Measure echo pulse duration Δt for distances d = 10, 20, 30, 50, 100, 150 cm.",
      "Plot Measured Distance vs True Track Distance and calculate linearity and velocity parameters."
    ],
    formulae: [
      { name: "Distance from Time-of-Flight", latex: "d = \\frac{v_{sound} \\cdot \\Delta t}{2}" },
      { name: "Acoustic Velocity vs Temperature", latex: "v(T) = 331.3 + 0.606 T \\text{ (m/s)}" }
    ],
    precautions: [
      "Ensure target reflector surface is rigid and perpendicular to acoustic beam axis.",
      "Keep transducer away from acoustic side-wall reflections."
    ],
    references: [
      {
        bookId: "halliday-resnick",
        citation: "[2] D. Halliday, R. Resnick, and J. Walker, Fundamentals of Physics, 12th ed. Hoboken, NJ, USA: Wiley, 2021.",
        chapter: "Chapter 17: Waves—II (Section 17.2 Sound Waves & Speed of Sound)"
      },
      {
        bookId: "hewitt-conceptual",
        citation: "[4] P. G. Hewitt, Conceptual Physics, 13th ed. San Francisco, CA, USA: Pearson, 2022.",
        chapter: "Chapter 20: Sound (Acoustic Wave Echoes & Sonar)"
      }
    ]
  },
  {
    id: "exp-10-colour-sensor",
    number: 10,
    title: "Study of Colour Sensor",
    category: "Sensors & Nanotechnology",
    simulatorActive: false,
    shortDescription: "Analyze RGB photodiode array spectral responsivity, frequency scaling, and chromatic calibration.",
    aim: "To study the operational characteristics and spectral response of an optical color sensor (TCS3200 / TCS34725 RGB sensor) and calibrate Red, Green, and Blue chromatic coordinates.",
    apparatus: [
      { name: "TCS3200 RGB Color Sensor Board", desc: "Photodiode array with red, green, blue, and clear optical filters" },
      { name: "Calibrated Standard Color Target Cards", desc: "Pantone Primary Red, Green, Blue, Yellow, White, Black swatches" },
      { name: "Microcontroller Interface & Frequency Counter", desc: "Reads pulse frequency output proportional to irradiance" },
      { name: "Constant Illumination Enclosure", desc: "White LED illuminator ring with uniform diffuse lighting" }
    ],
    theory: `The color sensor integrates an array of silicon photodiodes overlaid with primary optical color filters (Red, Green, Blue) and clear filters.

Light reflected from a target sample is decomposed into tristimulus color components:
$$I_{filter} = \\int_{\\lambda} R(\\lambda) \\cdot S(\\lambda) \\cdot F(\\lambda) d\\lambda$$
where $R(\\lambda)$ is the surface reflectance, $S(\\lambda)$ is the illuminant spectrum, and $F(\\lambda)$ is the filter transmission. The internal current-to-frequency converter yields a square wave of frequency $f_{out} \\propto I_{light}$.`,
    procedure: [
      "Place the sensor module at a fixed distance (e.g. 15 mm) from the color sample inside the dark hood.",
      "Calibrate the sensor against a pure white reference card to establish 100% RGB balance.",
      "Place Red, Green, and Blue reference swatches and record the output pulse frequency for each channel.",
      "Compute normalized RGB color coordinates and plot chromaticity response curves."
    ],
    formulae: [
      { name: "Normalized Color Ratio", latex: "r = \\frac{R}{R+G+B}, \\quad g = \\frac{G}{R+G+B}, \\quad b = \\frac{B}{R+G+B}" },
      { name: "Frequency Scaling", latex: "f_{out} = k \\cdot I_{irradiance}" }
    ],
    precautions: [
      "Maintain constant ambient illumination and fixed sensor-to-target sample distance.",
      "Perform white balance calibration before recording test color coordinates."
    ],
    references: [
      {
        bookId: "hewitt-conceptual",
        citation: "[4] P. G. Hewitt, Conceptual Physics, 13th ed. San Francisco, CA, USA: Pearson, 2022.",
        chapter: "Chapter 27: Light and Color (Sections 27.2–27.4 Color by Reflection & Absorption)"
      },
      {
        bookId: "serway-jewett",
        citation: "[3] R. A. Serway and J. W. Jewett, Physics for Scientists and Engineers, 10th ed. Boston, MA, USA: Cengage Learning, 2018.",
        chapter: "Chapter 38: Photons and Matter Waves (Optical Detectors & Sensors)"
      }
    ]
  },
  {
    id: "exp-11-nanotechnology",
    number: 11,
    title: "Simulation Experiments based on Nanotechnology using Open-Source Simulation",
    category: "Sensors & Nanotechnology",
    simulatorActive: false,
    shortDescription: "Model quantum confinement, density of states, and localized surface plasmon resonance in nanomaterials.",
    aim: "To simulate nanoscale physical phenomena, including quantum size confinement in quantum dots, localized surface plasmon resonance (LSPR) in metallic nanoparticles, and density of states in low-dimensional nanostructures.",
    apparatus: [
      { name: "Open-Source Computational Physics Simulator", desc: "NanoHUB / OpenFOAM / Quantum ESPRESSO computational suite" },
      { name: "High-Performance Compute Node", desc: "Multi-core simulation workstation" },
      { name: "Material Parameter Libraries", desc: "Band structure databases for CdSe, Au, Ag, and Graphene" }
    ],
    theory: `When the physical dimensions of a particle approach the **exciton Bohr radius ($a_B$)**, continuous energy bands discretize into quantum energy levels due to **Quantum Confinement**:

$$\\Delta E_g(R) = E_g(\\text{bulk}) + \\frac{\\hbar^2 \\pi^2}{2 \\mu R^2} - \\frac{1.786 e^2}{4 \\pi \\varepsilon_0 \\varepsilon_r R}$$

where:
- $\\mu = \\frac{m_e^* m_h^*}{m_e^* + m_h^*}$ is the reduced exciton effective mass.
- $R$ is the nanoparticle radius.
- The optical absorption band edge shifts toward higher energies (blue shift) as nanoparticle size shrinks.`,
    procedure: [
      "Launch the computational nanotechnology simulation environment.",
      "Configure spherical semiconductor quantum dot model (CdSe) with radii R = 1.5 nm to 6.0 nm.",
      "Run the Schrödinger-Poisson solver to compute discrete eigenenergies and optical absorption spectra.",
      "Plot Bandgap Energy Eg vs 1/R² and verify the Brus quantum confinement equation."
    ],
    formulae: [
      { name: "Brus Quantum Confinement Equation", latex: "E_g(R) = E_{g,bulk} + \\frac{\\hbar^2 \\pi^2}{2 \\mu R^2}" },
      { name: "Surface Plasmon Resonance Condition", latex: "\\text{Re}(\\varepsilon_{metal}(\\omega)) = -2 \\varepsilon_{dielectric}" }
    ],
    precautions: [
      "Ensure spatial grid mesh resolution is finer than the characteristic de Broglie wavelength.",
      "Verify dielectric function convergence parameters."
    ],
    references: [
      {
        bookId: "serway-jewett",
        citation: "[3] R. A. Serway and J. W. Jewett, Physics for Scientists and Engineers, 10th ed. Boston, MA, USA: Cengage Learning, 2018.",
        chapter: "Chapter 41: Quantum Mechanics (Section 41.6 Quantum Dots & Nanotechnology)"
      },
      {
        bookId: "hewitt-conceptual",
        citation: "[4] P. G. Hewitt, Conceptual Physics, 13th ed. San Francisco, CA, USA: Pearson, 2022.",
        chapter: "Chapter 32: The Atom and the Quantum (Nanotechnology Frontiers)"
      }
    ]
  },
  {
    id: "exp-12-optical-attenuation",
    number: 12,
    title: "Measuring Optical Power Attenuation in Plastic Optical Fiber",
    category: "Fiber Optics & Lasers",
    simulatorActive: false,
    shortDescription: "Determine transmission loss coefficient (dB/km) and bending losses across optical fiber cables.",
    aim: "To measure the optical power attenuation coefficient ($\\alpha$ in dB/km) and investigate insertion/bending losses in a plastic optical fiber (POF) using the cutback transmission method.",
    apparatus: [
      { name: "Stabilized Optical Light Source (650 nm / 850 nm)", desc: "Constant power laser/LED transmitter" },
      { name: "Digital Optical Power Meter", desc: "Measures power in dBm and µW with 0.01 dB resolution" },
      { name: "Plastic Optical Fiber Cable Spools", desc: "Calibrated lengths: 10 m, 20 m, 50 m" },
      { name: "Fiber Mandrels & Cleaver", desc: "Precision curvature cylinders (R = 5 mm to 30 mm)" }
    ],
    theory: `As light propagates along an optical fiber, optical power decays exponentially due to Rayleigh scattering, core material absorption, and geometric waveguide imperfections:

$$P(L) = P_{in} \\cdot 10^{-\\frac{\\alpha L}{10}}$$

The **Optical Attenuation Coefficient ($\\alpha$)** in decibels per kilometer (dB/km) is given by:
$$\\mathbf{\\alpha = \\frac{10}{L} \\log_{10}\\left(\\frac{P_{in}}{P_{out}}\\right)}$$
or in terms of measured power in dBm:
$$\\alpha = \\frac{P_{in}(\\text{dBm}) - P_{out}(\\text{dBm})}{L(\\text{km})}$$`,
    procedure: [
      "Connect optical power meter directly to the transmitter to record baseline reference power P_in.",
      "Insert test optical fiber spool of known length L (km) between transmitter and power meter.",
      "Record received optical power P_out (dBm).",
      "Repeat for varying fiber lengths and calculate attenuation α.",
      "Wrap fiber around calibrated mandrels (radii 30 mm down to 5 mm) to quantify bending loss."
    ],
    formulae: [
      { name: "Attenuation Coefficient", latex: "\\alpha = \\frac{10}{L} \\log_{10}\\left(\\frac{P_{in}}{P_{out}}\\right) \\text{ (dB/km)}" },
      { name: "Power in dBm", latex: "P(\\text{dBm}) = 10 \\log_{10}\\left(\\frac{P(\\text{mW})}{1\\text{ mW}}\\right)" }
    ],
    precautions: [
      "Clean all fiber optic SMA connector faces before plugging into optical power meter.",
      "Ensure transmitter source output power is stabilized before taking baseline readings."
    ],
    references: [
      {
        bookId: "serway-jewett",
        citation: "[3] R. A. Serway and J. W. Jewett, Physics for Scientists and Engineers, 10th ed. Boston, MA, USA: Cengage Learning, 2018.",
        chapter: "Chapter 35: Nature of Light and Laws of Ray Optics (Fiber Optic Waveguides & Attenuation)"
      },
      {
        bookId: "young-freedman",
        citation: "[1] H. D. Young and R. A. Freedman, Sears and Zemansky's University Physics, 15th ed. Boston, MA, USA: Pearson, 2019.",
        chapter: "Chapter 33: The Nature and Propagation of Light (Optical Fiber Propagation)"
      }
    ]
  },
  {
    id: "exp-13-diode-characteristics",
    number: 13,
    title: "I-V Characteristics of PN Junction Diode / Zener Diode / Photo Diode",
    category: "Quantum & Solid State",
    simulatorActive: false,
    shortDescription: "Plot forward/reverse voltage-current curves, determine knee voltage, breakdown voltage, and responsivity.",
    aim: "To plot the forward and reverse bias Current-Voltage ($I-V$) characteristics of a PN junction diode, Zener diode, and Photo Diode, and determine knee voltage ($V_k$), reverse breakdown voltage ($V_Z$), and dynamic resistance ($r_d$).",
    apparatus: [
      { name: "Semiconductor Diode Board", desc: "Silicon PN Diode (1N4007), Zener Diode (5.1V), Photodiode module" },
      { name: "Variable DC Power Supplies", desc: "Dual output: 0 to 3V (forward) and 0 to 30V (reverse)" },
      { name: "Digital Milliammeter & Microammeter", desc: "Range 0-100 mA (forward) and 0-500 µA (reverse)" },
      { name: "Digital Voltmeter", desc: "High input impedance multimeters" },
      { name: "Calibrated Light Source", desc: "Variable lux illuminator for photodiode reverse response" }
    ],
    theory: `The current-voltage relationship of a semiconductor PN junction diode is governed by the **Shockley Diode Equation**:

$$I = I_s \\left(e^{\\frac{q V}{\\eta k_B T}} - 1\\right)$$

where:
- $I_s$ = reverse saturation current
- $\\eta$ = ideality factor ($\approx 1$ for Ge, $\approx 2$ for Si)
- $V_T = \\frac{k_B T}{q} \\approx 26 \\text{ mV}$ at room temperature ($300 \\text{ K}$)

### Diode Breakdown & Zener Effect
- In **Forward Bias**: Current rises exponentially past the knee/barrier voltage ($V_k \\approx 0.7 \\text{ V}$ for Silicon).
- In **Reverse Bias**: Zener diodes experience quantum tunneling (Zener breakdown) or avalanche multiplication at sharp reverse voltage $V_Z$, maintaining stable voltage regulation.`,
    procedure: [
      "Connect the PN diode in forward bias circuit with variable DC power supply, milliammeter, and voltmeter.",
      "Increase forward voltage in steps of 0.1 V (0 to 1.0 V) and record forward current I_F.",
      "Switch circuit to reverse bias with microammeter; increase reverse voltage (0 to 20 V) and record I_R.",
      "Repeat for Zener Diode in reverse breakdown and record Zener breakdown voltage V_Z.",
      "Plot I-V curves and calculate dynamic forward resistance r_d = ΔV / ΔI."
    ],
    formulae: [
      { name: "Shockley Diode Equation", latex: "I = I_s \\left(e^{\\frac{q V}{\\eta k_B T}} - 1\\right)" },
      { name: "Dynamic Resistance", latex: "r_d = \\frac{\\Delta V}{\\Delta I}" }
    ],
    precautions: [
      "Do not exceed maximum forward rated current to prevent thermal breakdown of the junction.",
      "Ensure ammeters are placed correctly in series and voltmeters in parallel."
    ],
    references: [
      {
        bookId: "halliday-resnick",
        citation: "[2] D. Halliday, R. Resnick, and J. Walker, Fundamentals of Physics, 12th ed. Hoboken, NJ, USA: Wiley, 2021.",
        chapter: "Chapter 41: Conduction of Electricity in Solids (Section 41.7 The p-n Junction & Semiconductor Diodes)"
      },
      {
        bookId: "young-freedman",
        citation: "[1] H. D. Young and R. A. Freedman, Sears and Zemansky's University Physics, 15th ed. Boston, MA, USA: Pearson, 2019.",
        chapter: "Chapter 42: Molecules and Condensed Matter (Section 42.7 Semiconductor Devices)"
      }
    ]
  },
  {
    id: "exp-14-rtd-sensors",
    number: 14,
    title: "Study of the Characteristics of Resistance Temperature Detector (RTD) / Optical Sensors",
    category: "Sensors & Nanotechnology",
    simulatorActive: false,
    shortDescription: "Evaluate platinum Pt100 temperature coefficient of resistance (alpha) and thermistor sensitivity.",
    aim: "To determine the Temperature Coefficient of Resistance ($\\alpha$) of a Resistance Temperature Detector (Pt100 RTD) and analyze temperature vs resistance linearity.",
    apparatus: [
      { name: "Pt100 Platinum RTD Probe", desc: "Standard 100 Ω at 0°C platinum wire RTD sensor" },
      { name: "Temperature-Controlled Water Bath / Oven", desc: "Digital heating bath adjustable from 20°C to 100°C" },
      { name: "Precision Digital Thermometer", desc: "Resolution 0.1°C calibration reference" },
      { name: "Wheatstone / Kelvin Bridge / Digital Multimeter", desc: "4-wire resistance measurement bridge" }
    ],
    theory: `The electrical resistance of pure metals increases predictably and linearly with temperature due to increased electron-phonon lattice scattering.

The **Callendar-Van Dusen equation** simplifies in the range 0°C to 100°C to:
$$R(T) = R_0 (1 + \\alpha T)$$

where:
- $R(T)$ is the resistance at temperature $T$ (°C).
- $R_0$ is the resistance at $0^\\circ\\text{C}$ (Nominally $100.0\\,\\Omega$ for Pt100).
- $\\alpha$ is the **Temperature Coefficient of Resistance**:
$$\\mathbf{\\alpha = \\frac{R_2 - R_1}{R_0 (T_2 - T_1)}} \\approx 0.00385\\,^\\circ\\text{C}^{-1} \\text{ (for Platinum DIN IEC 751)}$$`,
    procedure: [
      "Immerse the Pt100 RTD probe and reference thermometer into the temperature-controlled bath.",
      "Connect the RTD probe leads to the 4-wire digital resistance multimeter.",
      "Record baseline resistance R at room temperature (~25°C).",
      "Heat the water bath, recording resistance R at every 5°C interval from 30°C to 95°C.",
      "Plot Resistance R (y-axis) vs Temperature T (x-axis).",
      "Calculate slope = R₀ · α and solve for temperature coefficient α."
    ],
    formulae: [
      { name: "Resistance vs Temperature", latex: "R(T) = R_0 (1 + \\alpha T)" },
      { name: "Temperature Coefficient (α)", latex: "\\alpha = \\frac{\\Delta R}{R_0 \\Delta T} \\quad (^\\circ\\text{C}^{-1})" }
    ],
    precautions: [
      "Use a 4-wire connection configuration to eliminate lead wire resistance errors.",
      "Ensure uniform bath temperature by gentle continuous stirring."
    ],
    references: [
      {
        bookId: "halliday-resnick",
        citation: "[2] D. Halliday, R. Resnick, and J. Walker, Fundamentals of Physics, 12th ed. Hoboken, NJ, USA: Wiley, 2021.",
        chapter: "Chapter 26: Current and Resistance (Section 26.5 Resistance vs Temperature)"
      },
      {
        bookId: "young-freedman",
        citation: "[1] H. D. Young and R. A. Freedman, Sears and Zemansky's University Physics, 15th ed. Boston, MA, USA: Pearson, 2019.",
        chapter: "Chapter 25: Current, Resistance, and Electromotive Force (Section 25.3 Resistivity and Temperature)"
      }
    ]
  }
];
