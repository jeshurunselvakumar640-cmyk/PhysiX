# Vectra AI Master Knowledge Base: PhysiX Interactive 2D Simulator
Document Version: 2.4.0 • Academic & Computational Specification
Target Ingestion System: Vectra AI Physics Copilot & Knowledge Retrieval Engine

---

## 1. PHYSIX OVERVIEW

### 1.1 Identity & Core Purpose
- **Full Platform Name**: PhysiX: An Interactive 2D Simulator
- **Platform Class**: Digital Physics Laboratory Manual & High-Precision Computational 2D Simulation Suite
- **Primary Objective**: Bridge theoretical physics equations and interactive graphical computation through real-time 60 FPS numerical solvers, allowing students to observe kinematic, optoelectronic, and wave phenomena with zero setup friction.
- **Target Audience**: Undergraduate physics students, engineering scholars, academic researchers, and science educators.
- **Authorship Attribution**: "This is a Project built by four Computer Engineering students Ojas Joshi, Jeshurun Selvakumar, Kshitij Jadhav, Adithya Iyer."

### 1.2 Core Pillars
1. **Interactive Simulation Engines**:
   - Matter.js 2D Newtonian engine (rigid body kinetics, constraint solvers, Verlet numerical integration).
   - Dedicated geometric optics raytracer (Total Internal Reflection, acceptance cone geometry, spot irradiance).
   - Optoelectronic spectral simulator (photodiode array response, frequency conversion, colorimetric tristimulus decoding).
   - Custom 2D kinematic canvas sandbox (impulse solvers, restitution, air drag, celestial gravitational fields).
2. **Integrated Digital Laboratory Manual**:
   - Every experiment contains complete manual documentation: Aim, Theory, How to Perform in PhysiX, Traditional Laboratory Procedure, Formulas & Equations with SI units, Observation Tables, and Experimental Conclusions.
3. **Structured Student Gamification**:
   - Progressive doubling level progression (Level 1 Newtonian Novice to Level 7 Grand Astrophysics Virtuoso).
   - 19 vector-rendered achievement badges.
   - Dynamic 10-question randomized quizzes drawn from 50-question categorized banks.
   - Consecutive daily login streak tracker with milestone celebrations.
4. **Vectra AI Copilot**:
   - Embedded real-time laboratory assistant with live telemetry analysis, trajectory verification, formula derivation, and step-by-step guidance.
5. **Cross-Device Synchronization**:
   - Single source of truth in Firebase Firestore (`users/{uid}`) with atomic increments (`increment(xp)`), real-time `onSnapshot` listeners, and user-scoped caching.

### 1.3 System Distinctions
- **Simulations vs Traditional Laboratory**:
  - Traditional labs suffer from component tolerances, mechanical friction, parallax reading errors, and equipment degradation.
  - PhysiX simulations compute mathematical equations in real time with continuous parameter modification (e.g., launching projectiles on the Moon at $1.62\text{ m/s}^2$ or Jupiter at $24.79\text{ m/s}^2$).
- **Experiments vs Physics Sandbox**:
  - **Experiments** (`projectile`, `optical`, `colour-sensor`): Structured scientific benches with fixed physical apparatus, formal observation logging, theoretical validations, and error tolerances.
  - **Physics Sandbox** (`sandbox`): Open-ended Newtonian sandbox where users spawn, drag, connect, collide, and manipulate rigid bodies with custom masses, restitution, friction, forces, and impulses.
- **Experiments vs Challenges**:
  - **Experiments** allow open empirical parameter sweeps and data exports.
  - **Challenges** are goal-oriented gamified milestones with specific pass/fail boundary conditions that test theoretical mastery and award bonus XP and exclusive badges.

---

## 2. EXPERIMENT CATALOG

PhysiX hosts 15 physics laboratories in its catalog: 4 fully implemented interactive computational simulators and 11 catalog laboratories in active calibration.

| Experiment ID | Title | Domain | Status |
| :--- | :--- | :--- | :--- |
| `experiment.projectile-motion` | 2D Projectile Motion Virtual Laboratory | Classical Mechanics | Fully Implemented & Interactive |
| `experiment.optical-fibre` | Determination of Numerical Aperture of an Optical Fibre | Fiber Optics & Photonics | Fully Implemented & Interactive |
| `experiment.colour-sensor` | Study of Colour Sensor (TCS3200) & Spectral Response | Optoelectronic Sensors | Fully Implemented & Interactive |
| `experiment.physics-sandbox` | Physics Sandbox & 2D Kinematics Playground | Newtonian Mechanics | Fully Implemented & Interactive |
| `experiment.laser-divergence` | Determine the Divergence of Laser Beam | Optics & Lasers | In Calibration |
| `experiment.newtons-rings` | Determination of Radius of Curvature via Newton's Rings | Wave Optics & Interference | In Calibration |
| `experiment.wedge-film` | Thickness Measurement using Wedge-Shaped Thin Film | Wave Optics & Interference | In Calibration |
| `experiment.hall-effect` | Determination of Hall Coefficient | Solid State & Magnetism | In Calibration |
| `experiment.diffraction-grating` | Wavelength Determination using Diffraction Grating | Wave Optics & Spectra | Fully Implemented & Interactive |
| `experiment.planck-constant` | Determination of Planck's Constant using Photocell | Quantum Mechanics | In Calibration |
| `experiment.udm-parameters` | Determine Ultrasonic Distance Measurement Parameters | Sensors & Instrumentation | In Calibration |
| `experiment.fiber-attenuation` | Measuring Optical Power Attenuation in Plastic Fibers | Fiber Optics | In Calibration |
| `experiment.semiconductor-diodes`| I-V Characteristics of PN / Zener / Photo Diodes | Semiconductor Devices | In Calibration |
| `experiment.rtd-sensor` | Characteristics of Resistance Temperature Detectors (RTD) | Thermal Sensors | In Calibration |

---

## 3. EXPERIMENT 1: 2D PROJECTILE MOTION (`experiment.projectile-motion`)

### 3.1 Identity
- **ID**: `experiment.projectile-motion` (Slug: `projectile`)
- **Title**: 2D Projectile Motion Virtual Laboratory
- **Domain**: Classical Mechanics & Ballistic Kinematics
- **Difficulty**: Undergraduate Practical (Level 1–2)
- **Duration**: 45 Minutes Standard Session
- **Engine**: Matter.js 2D Newtonian Physics Engine with Cartesian Canvas Overlay

### 3.2 Aim
To investigate the two-dimensional kinematic motion of a projectile fired at an initial elevation angle $\theta$ and launch speed $v_0$ under uniform gravitational acceleration $g$; to analyze the independence of orthogonal horizontal and vertical velocity components; to verify maximum apex altitude, total time of flight, and horizontal range relationships; and to observe the effect of complementary launch angles and platform elevation offsets.

### 3.3 Theoretical Background
1. **Orthogonal Independence of Motion**:
   Under Galileo's principle of inertia and Newton's second law $\mathbf{F} = m\mathbf{a}$, motion in orthogonal spatial dimensions can be analyzed independently:
   - Horizontal axis ($x$): Neglecting aerodynamic drag, $\Sigma F_x = 0 \implies a_x = 0$. Horizontal velocity remains invariant:
     $$v_x(t) = v_{0x} = v_0 \cos\theta$$
   - Vertical axis ($y$): Subject to uniform downward gravitational acceleration $\Sigma F_y = -mg \implies a_y = -g$:
     $$v_y(t) = v_{0y} - gt = v_0 \sin\theta - gt$$
2. **Trajectory Equation**:
   Eliminating time parameter $t = \frac{x}{v_0 \cos\theta}$ yields the parabolic trajectory relation:
   $$y(x) = h_0 + x\tan\theta - \frac{g x^2}{2 v_0^2 \cos^2\theta}$$
3. **Time of Flight ($T$)**:
   The duration until impact with the ground plane ($y = 0$):
   $$T = \frac{v_0 \sin\theta + \sqrt{v_0^2 \sin^2\theta + 2 g h_0}}{g}$$
   For launch from flat ground ($h_0 = 0$):
   $$T_{\text{flat}} = \frac{2 v_0 \sin\theta}{g}$$
4. **Maximum Apex Height ($H_{\max}$)**:
   Occurs at the trajectory stationary point where vertical velocity momentarily vanishes ($v_y = 0$):
   $$t_{\text{apex}} = \frac{v_0 \sin\theta}{g}, \quad H_{\max} = h_0 + \frac{v_0^2 \sin^2\theta}{2g}$$
5. **Horizontal Range ($R$)**:
   The horizontal displacement traversed during total flight time:
   $$R = v_{0x} \cdot T = \frac{v_0 \cos\theta}{g} \left( v_0 \sin\theta + \sqrt{v_0^2 \sin^2\theta + 2 g h_0} \right)$$
   For $h_0 = 0$:
   $$R_{\text{flat}} = \frac{v_0^2 \sin(2\theta)}{g}$$
6. **Complementary Launch Angles**:
   Because $\sin(2(90^\circ - \theta)) = \sin(180^\circ - 2\theta) = \sin(2\theta)$, any two complementary elevation angles ($\theta$ and $90^\circ - \theta$) fired at identical initial velocity $v_0$ from flat ground $h_0 = 0$ produce identical horizontal landing ranges.
7. **Elevated Platform Optimal Angle**:
   When launching from elevated platform $h_0 > 0$, the optimal launch angle for maximum horizontal range shifts below $45^\circ$:
   $$\theta_{\text{opt}} = \arcsin\left(\frac{1}{\sqrt{2 + \frac{2 g h_0}{v_0^2}}}\right)$$

### 3.4 Mathematical Formulations
- `formula.projectile.time-of-flight`:
  $$T = \frac{v_0 \sin\theta + \sqrt{v_0^2 \sin^2\theta + 2 g h_0}}{g} \quad [\text{s}]$$
- `formula.projectile.max-height`:
  $$H_{\max} = h_0 + \frac{v_0^2 \sin^2\theta}{2g} \quad [\text{m}]$$
- `formula.projectile.horizontal-range`:
  $$R = \frac{v_0^2 \sin(2\theta)}{g} \quad [\text{m}] \quad (\text{for } h_0 = 0)$$
- `formula.projectile.instantaneous-speed`:
  $$v(t) = \sqrt{v_x(t)^2 + v_y(t)^2} \quad [\text{m/s}]$$
- `formula.projectile.impact-velocity`:
  $$v_f = \sqrt{v_0^2 + 2 g h_0} \quad [\text{m/s}]$$

### 3.5 Simulator Controls & Interactive Telemetry
- **Launch Velocity Slider** (`#slider-velocity`):
  - Range: $10.0\text{ m/s}$ to $50.0\text{ m/s}$ (Default: $20.0\text{ m/s}$, Step: $0.5\text{ m/s}$).
  - Physics effect: Increasing $v_0$ quadratically expands range and maximum height.
- **Launch Angle Slider** (`#slider-angle`):
  - Range: $0^\circ$ to $90^\circ$ (Default: $45^\circ$, Step: $1^\circ$).
  - Physics effect: Rotates the visual cannon barrel. Adjusts proportion of energy between horizontal and vertical velocity components.
- **Platform Height Slider** (`#slider-height`):
  - Range: $0.0\text{ m}$ to $100.0\text{ m}$ (Default: $0.0\text{ m}$, Step: $1.0\text{ m}$).
  - Physics effect: Raises the launch platform above ground surface ($y=0$). Adds gravitational potential energy $mgh_0$.
- **Celestial Gravity Preset Selector** (`#select-gravity`):
  - Presets:
    - Earth ($g = 9.8\text{ m/s}^2$)
    - Moon ($g = 1.6\text{ m/s}^2$)
    - Mars ($g = 3.7\text{ m/s}^2$)
    - Jupiter ($g = 24.8\text{ m/s}^2$)
  - Physics effect: Directly modulates the vertical acceleration vector $a_y = -g$.
- **Action Buttons**:
  - **LAUNCH PROJECTILE** (`#btn-launch` / `Spacebar`): Arms and launches the ball with real-time trajectory trace.
  - **RESET** (`#btn-reset` / `Key R`): Clears canvas trace lines and repositions cannon.
  - **Target Mode Toggle** (`#btn-toggle-target`): Randomly positions a target landing pad on the ground terrain.
  - **Slow Motion Toggle** (`#btn-toggle-slowmo`): Reduces physics step time scale by $0.3\times$ for precise vector observation.
  - **Velocity Vectors Toggle** (`#btn-toggle-vectors`): Renders dynamic orthogonal vector arrows ($v_x$ cyan, $v_y$ magenta, $v$ yellow) attached to the moving projectile.
  - **Record Observation** (`#btn-record-obs`): Stores current flight metrics ($v_0, \theta, h_0, g, T, H_{\max}, R, v_f$) into the observation table.
  - **Export CSV** (`#btn-export-csv`): Generates and downloads spreadsheet dataset.
  - **Export PDF** (`#btn-export-pdf`): Generates certified formal lab report.

---

## 4. EXPERIMENT 2: OPTICAL FIBRE NUMERICAL APERTURE (`experiment.optical-fibre`)

### 4.1 Identity
- **ID**: `experiment.optical-fibre` (Slug: `optical`)
- **Title**: Determination of Numerical Aperture of an Optical Fibre
- **Domain**: Fiber Optics, Waveguides & Photonic Instrumentation
- **Difficulty**: Undergraduate Practical (Level 2)
- **Duration**: 45 Minutes Standard Session
- **Engine**: Precision Geometric Optoelectronic Raytracer

### 4.2 Aim
To determine the Numerical Aperture ($NA$) and maximum Acceptance Angle ($\theta_a$) of a step-index multimode optical fibre by experimentally mapping the emergent divergence cone diameter on a calibrated screen at variable bench distances; to observe the effect of core/cladding refractive index mismatch; and to verify NA invariance across transmission lengths.

### 4.3 Theoretical Background
1. **Total Internal Reflection (TIR)**:
   For light transmission within a cylindrical dielectric waveguide, light launched into the core (refractive index $n_1$) must strike the boundary with the cladding (refractive index $n_2 < n_1$) at an angle of incidence greater than the critical angle $\theta_c$:
   $$\sin\theta_c = \frac{n_2}{n_1}$$
2. **Acceptance Cone & Numerical Aperture ($NA$)**:
   By Snell's law applied at the air-core launching entrance interface ($n_0 \approx 1.0$):
   $$\sin\theta_a = \sqrt{n_1^2 - n_2^2}$$
   $NA$ is a dimensionless figure of merit expressing the light-gathering capacity of the optical fibre:
   $$NA = \sin\theta_a = \sqrt{n_1^2 - n_2^2} = n_1 \sqrt{2\Delta}$$
   where $\Delta = \frac{n_1 - n_2}{n_1}$ is the fractional refractive index contrast.
3. **Measurement Method (Far-Field Divergence Spot Mapping)**:
   As light exits the terminated circular fiber core of numerical aperture $NA$, it emerges in a conical beam of divergence half-angle $\theta_a$. At an axial distance $L$ from the fiber tip to an observing perpendicular frosted screen, the projected circular light spot has a diameter $W$:
   $$\tan\theta_a = \frac{W / 2}{L} = \frac{W}{2L}$$
   Using trigonometric identity $\sin\theta_a = \frac{\tan\theta_a}{\sqrt{1 + \tan^2\theta_a}}$:
   $$NA = \frac{\frac{W}{2L}}{\sqrt{1 + \left(\frac{W}{2L}\right)^2}} = \frac{W}{\sqrt{4L^2 + W^2}}$$
   Acceptance angle:
   $$\theta_a = \arcsin(NA) = \arctan\left(\frac{W}{2L}\right)$$

### 4.4 Mathematical Formulations
- `formula.optical.na-experimental`:
  $$NA = \frac{W}{\sqrt{4L^2 + W^2}} \quad [\text{Dimensionless}]$$
- `formula.optical.acceptance-angle`:
  $$\theta_a = \arcsin(NA) = \arctan\left(\frac{W}{2L}\right) \quad [^\circ]$$
- `formula.optical.na-theoretical`:
  $$NA_{\text{theo}} = \sqrt{n_1^2 - n_2^2} \quad [\text{Dimensionless}]$$
- `formula.optical.fractional-index`:
  $$\Delta = \frac{n_1 - n_2}{n_1} \quad [\text{Dimensionless}]$$
- `formula.optical.v-number`:
  $$V = \frac{2\pi a}{\lambda} \cdot NA \quad [\text{Dimensionless}]$$

### 4.5 Simulator Controls & Interactive Bench
- **Main Power Switch** (`#of-btn-power-switch`):
  - Turns 5V DC power supply ON/OFF. Powers up laser diode circuit and illuminates green LED.
- **Laser Source Toggle** (`#of-btn-laser-switch`):
  - Activates semiconductor laser beam injection into the fiber patch cord. Illuminates red status indicator.
- **Screen Distance Slider / Micrometer** (`#of-slider-distance`):
  - Range: $1.0\text{ cm}$ to $6.0\text{ cm}$ (Default: $3.0\text{ cm}$, Step: $0.1\text{ cm}$).
  - Physics effect: Increasing distance $L$ linearly increases spot diameter $W$ on the screen while maintaining constant $NA$.
- **Core Refractive Index Slider** (`#of-slider-n1`):
  - Range: $1.460$ to $1.520$ (Default: $1.480$, Step: $0.005$).
  - Physics effect: Increases $NA$ and widens the divergence cone.
- **Cladding Refractive Index Slider** (`#of-slider-n2`):
  - Range: $1.430$ to $1.480$ (Default: $1.450$, Step: $0.005$).
  - Physics effect: Constrained such that $n_2 < n_1$. Narrowing index contrast decreases $NA$.
- **Wavelength Selector** (`#of-select-wavelength`):
  - Choices: $650\text{ nm}$ (Red), $532\text{ nm}$ (Green), $405\text{ nm}$ (Violet), $850\text{ nm}$ (Infrared).
- **Bench Distance Preset Buttons** (`.of-dist-preset-btn`):
  - Quick presets: $1.5\text{ cm}, 2.5\text{ cm}, 3.5\text{ cm}, 4.5\text{ cm}, 5.5\text{ cm}$.
- **Record Observation Button** (`#of-btn-record-obs`):
  - Logs $L$, spot diameter $W$, calculated $NA$, acceptance angle $\theta_a$, and theoretical $NA$ into the logbook.

---

## 5. EXPERIMENT 3: COLOUR SENSOR TCS3200 (`experiment.colour-sensor`)

### 5.1 Identity
- **ID**: `experiment.colour-sensor` (Slug: `colour-sensor`)
- **Title**: Study of Colour Sensor (TCS3200) & Spectral Response
- **Domain**: Optoelectronics, Semiconductor Sensors & Colorimetry
- **Difficulty**: Undergraduate Practical (Level 2)
- **Duration**: 45 Minutes Standard Session
- **Engine**: Silicon Photodiode Array Tristimulus Engine

### 5.2 Aim
To characterize the operational architecture, spectral sensitivity, programmable frequency scaling, and RGB tristimulus color identification of the TCS3200 programmable color light-to-frequency converter; to measure photodiode channel output frequencies under varying illumination and target distance; and to solve inverse color decomposition for unknown pigment compounds.

### 5.3 Theoretical Background
1. **Sensor Architecture**:
   The TCS3200 integrates a $8 \times 8$ photodiode matrix configured into four interleaved spectral channel sets:
   - 16 photodiodes with Red optical bandpass filters ($\approx 640\text{ nm}$).
   - 16 photodiodes with Green optical bandpass filters ($\approx 524\text{ nm}$).
   - 16 photodiodes with Blue optical bandpass filters ($\approx 470\text{ nm}$).
   - 16 photodiodes with Clear optical filters (unfiltered panchromatic broadband).
2. **Current-to-Frequency Conversion (CFC)**:
   Light incident on the selected photodiode array induces a photocurrent $I_{\text{photo}}$ directly proportional to irradiance $E_e$:
   $$I_{\text{photo}} = \mathcal{R}(\lambda) \cdot E_e$$
   Internal current-to-frequency circuitry generates a square-wave output signal ($50\%$ duty cycle) with frequency:
   $$f_o = f_D + (S \times E_e)$$
   where $f_D$ is dark frequency ($E_e = 0$) and $S$ is spectral responsivity.
3. **Logic Control Pin Configurations**:
   - **Filter Selection (S2, S3)**:
     | S2 | S3 | Selected Optical Channel |
     | :---: | :---: | :--- |
     | Low (0) | Low (0) | Red Filter Photodiodes |
     | Low (0) | High (1) | Blue Filter Photodiodes |
     | High (1) | Low (0) | Clear (Unfiltered) Photodiodes |
     | High (1) | High (1) | Green Filter Photodiodes |
   - **Frequency Scaling (S0, S1)**:
     | S0 | S1 | Scaling Mode | Typical Max Full-Scale $f_o$ |
     | :---: | :---: | :--- | :--- |
     | Low (0) | Low (0) | Power Down | 0 Hz |
     | Low (0) | High (1) | 2% Frequency Scaling | $10\text{–}12\text{ kHz}$ |
     | High (1) | Low (0) | 20% Frequency Scaling | $100\text{–}120\text{ kHz}$ |
     | High (1) | High (1) | 100% Frequency Scaling | $500\text{–}600\text{ kHz}$ |
4. **Inverse-Square Distance Attenuation**:
   Reflected light intensity decays inversely with the square of standoff distance $d$ between target swatch and sensor face:
   $$E_e(d) \propto \frac{1}{d^2} \implies f_o(d) \propto \frac{1}{d^2}$$

### 5.4 Mathematical Formulations
- `formula.colour-sensor.frequency`:
  $$f_o = f_D + (S \cdot E_e) \quad [\text{Hz}]$$
- `formula.colour-sensor.inverse-square`:
  $$E_e \propto \frac{1}{d^2} \implies \frac{f_1}{f_2} \approx \frac{d_2^2}{d_1^2} \quad [\text{Hz}]$$
- `formula.colour-sensor.tristimulus-norm`:
  $$r = \frac{R}{R+G+B}, \quad g = \frac{G}{R+G+B}, \quad b = \frac{B}{R+G+B} \quad [\text{Dimensionless}]$$
- `formula.colour-sensor.chromaticity`:
  $$\text{RGB Intensity: } I_{\text{RGB}} = \frac{f_{\text{channel}}}{f_{\text{white\_ref}}} \times 255 \quad [\text{DN}]$$

### 5.5 Simulator Controls & Interactive Bench
- **Main Power Switch** (`#cs-btn-power-switch`):
  - Supplies 5V DC to TCS3200 IC.
- **Illumination Spotlight Ring Toggle** (`#cs-btn-illum-switch`):
  - Activates 4 perimeter white LEDs providing incident illumination on sample.
- **Calibrated Color Swatch Selector** (`.cs-swatch-chip`):
  - Swatches: Red, Green, Blue, Yellow, Orange, Purple, Cyan, Magenta, White, Black.
- **Standoff Distance Slider** (`#cs-slider-distance`):
  - Range: $5.0\text{ mm}$ to $30.0\text{ mm}$ (Default: $15.0\text{ mm}$, Step: $1.0\text{ mm}$).
- **Filter Channel Selectors (S2/S3)** (`.cs-filter-btn`):
  - Red (0,0), Blue (0,1), Clear (1,0), Green (1,1).
- **Frequency Scaling Selectors (S0/S1)** (`.cs-scale-btn`):
  - 100% (1,1), 20% (1,0), 2% (0,1), Power Down (0,0).
- **Mystery Pigment Toggle** (`#cs-btn-toggle-mystery`):
  - Mounts an unidentified chemical compound (`m1` Rhodamine B, `m2` Malachite Green, `m3` Prussian Blue, `m4` Auramine O, `m5` Methyl Violet, `m6` Titanium Dioxide).
- **Real-Time Oscilloscope Waveform Display**:
  - Graphs the live generated square wave output showing period $T = \frac{1}{f_o}$ and duty cycle $50\%$.

---

## 6. EXPERIMENT 4: PHYSICS SANDBOX (`experiment.physics-sandbox`)

### 6.1 Identity
- **ID**: `experiment.physics-sandbox` (Slug: `sandbox`)
- **Title**: Physics Sandbox & 2D Kinematics Playground
- **Domain**: Newtonian Mechanics, Rigid Body Dynamics & Kinematics
- **Difficulty**: Open Interactive Laboratory (All Levels)
- **Duration**: Flexible Exploratory Session
- **Engine**: Matter.js / Custom Newtonian Physics Engine

### 6.2 Purpose & Scope
An open computational laboratory where students instantiate rigid bodies (spheres, boxes, static barrier platforms), modulate celestial gravitational fields, manipulate contact friction and restitution coefficients, apply continuous vector forces and instantaneous impulse kicks, and examine energy conservation curves in real time.

### 6.3 Sandbox Objects
1. **Dynamic Ball / Sphere** (`btnAddBall` / `#btn-add-ball`):
   - Geometry: Circle with radius $0.6\text{ m}$.
   - Default mass: $2.0\text{ kg}$, Default friction: $0.20$, Default restitution: $0.75$.
2. **Dynamic Box / Crate** (`btnAddBox` / `#btn-add-box`):
   - Geometry: Rectangle $1.2\text{ m} \times 1.2\text{ m}$.
   - Default mass: $4.0\text{ kg}$, Default friction: $0.35$, Default restitution: $0.40$.
3. **Static Platform / Barrier** (`btnAddPlatform` / `#btn-add-platform`):
   - Geometry: Static non-moving obstacle $4.5\text{ m} \times 0.4\text{ m}$.
   - Physics: Infinite mass ($m = \infty$), fixed coordinates, zero acceleration.
4. **Delete Selected Object** (`#btn-delete-selected-obj`):
   - Removes currently selected entity from the simulation world.

### 6.4 Sandbox Physics Controls & Telemetry
- **Selected Object Parameter Sliders**:
  - **Mass ($m$)** (`#input-obj-mass`): $0.5\text{ kg}$ to $50.0\text{ kg}$. Modulates inertia in $\mathbf{F} = m\mathbf{a}$.
  - **Restitution ($e$)** (`#input-obj-restitution`): $0.00$ (completely inelastic) to $1.00$ (perfectly elastic).
  - **Friction Coefficient ($\mu$)** (`#input-obj-friction`): $0.00$ (frictionless ice) to $1.00$ (high-friction rubber).
- **Environment Gravitational Acceleration** (`#input-gravity-val`):
  - Continuous slider: $0.0\text{ m/s}^2$ to $25.0\text{ m/s}^2$.
  - Presets:
    - Zero Gravity ($g = 0.0\text{ m/s}^2$)
    - Moon ($g = 1.62\text{ m/s}^2$)
    - Mars ($g = 3.71\text{ m/s}^2$)
    - Earth ($g = 9.81\text{ m/s}^2$)
    - Jupiter ($g = 24.79\text{ m/s}^2$)
- **Simulation Time Controls**:
  - Play / Pause (`#btn-play-pause`)
  - Step Forward 1 Frame (`#btn-step-frame`)
  - Reset to Initial State (`#btn-reset-sim`)
  - Speed Toggles: $0.2\times$ Slow-mo, $1.0\times$ Realtime, $2.0\times$ Fast-forward.
- **Preset Scenarios**:
  - **Free Fall Under Gravity** (`#btn-preset-freefall`): Sphere dropped from $9.0\text{ m}$ above ground surface under $g = 9.81\text{ m/s}^2$.
  - **Push Box with Friction** (`#btn-preset-pushbox`): $5.0\text{ kg}$ crate on friction floor subject to continuous $35\text{ N}$ horizontal force.
  - **Elastic Kinetic Collision** (`#btn-preset-collision`): $4.0\text{ kg}$ cyan sphere ($v = +6.0\text{ m/s}$) colliding with $2.0\text{ kg}$ red sphere ($v = -2.0\text{ m/s}$) in Zero-G with $e = 1.0$.
  - **Friction Comparison Test** (`#btn-preset-friction`): Twin crates with identical initial velocity $v_0 = 8.0\text{ m/s}$ sliding on Teflon ($\mu = 0.05$) vs Sandpaper ($\mu = 0.65$).
- **Live Kinematics Graphing**:
  - Mode Tabs: Position ($y$ vs $t$), Velocity ($v$ vs $t$), Kinetic Energy ($K = \frac{1}{2}mv^2$ vs $t$).

---

## 7. KICK VS APPLY FORCE (IN-DEPTH SPECIFICATION)

### 7.1 "KICK" (`sandbox.kick`)
- **UI Trigger**: Center button `#btn-apply-impulse` labeled **"KICK"** inside the directional D-Pad.
- **Exact Implementation Behavior**:
  ```javascript
  const mag = state.appliedForceMagnitude; // 1 to 150 N
  const pulseDuration = 0.15; // exactly 0.15 seconds
  let fx = 0, fy = 0;
  if (state.continuousForceDir === "left") fx = -mag;
  else if (state.continuousForceDir === "right") fx = mag;
  else if (state.continuousForceDir === "up") fy = mag;
  else if (state.continuousForceDir === "down") fy = -mag;
  else fx = mag; // Default rightwards

  obj.applyImpulse(fx * pulseDuration, fy * pulseDuration);
  ```
- **Physics Meaning**: Represents an **instantaneous mechanical impulse** $\mathbf{J}$.
- **Magnitude**:
  $$J = F \times \Delta t = F \times 0.15\text{ s}$$
  For example, with $F = 30\text{ N}$, impulse $J = 30 \times 0.15 = 4.5\text{ N}\cdot\text{s}$ ($4.5\text{ kg}\cdot\text{m/s}$).
- **Duration**: Single discrete instant ($0.15\text{ s}$ equivalent integrated pulse).
- **Effect on Velocity**: Creates an immediate step change in velocity without requiring continuous application:
  $$\Delta \mathbf{v} = \frac{\mathbf{J}}{m} = \frac{\mathbf{F} \times 0.15}{m}$$
  For a $2.0\text{ kg}$ sphere with a $30\text{ N}$ kick to the right:
  $$\Delta v_x = \frac{30 \times 0.15}{2.0} = +2.25\text{ m/s}$$
- **Effect on Acceleration**: Non-zero only during that single collision instant; acceleration immediately returns to $0$ (or gravity/friction) once the impulse is delivered.

### 7.2 "APPLY FORCE" (`sandbox.apply-force`)
- **UI Trigger**: Directional D-Pad buttons:
  - `#btn-force-up` ($\uparrow$)
  - `#btn-force-down` ($\downarrow$)
  - `#btn-force-left` ($\leftarrow$)
  - `#btn-force-right` ($\rightarrow$)
  - Cleared via `#btn-clear-forces` ("Zero Forces").
- **Exact Implementation Behavior**:
  ```javascript
  const F = state.appliedForceMagnitude;
  if (state.continuousForceDir === "left") obj.fx = -F;
  if (state.continuousForceDir === "right") obj.fx = F;
  if (state.continuousForceDir === "up") obj.fy = F;
  if (state.continuousForceDir === "down") obj.fy = -F;
  ```
- **Physics Meaning**: Represents a **continuous sustained external force** $\mathbf{F}$.
- **Duration**: Persists across all physics integration cycles continuously until toggled off or cleared.
- **Effect on Acceleration**: Induces continuous constant acceleration by Newton's Second Law:
  $$\mathbf{a} = \frac{\Sigma \mathbf{F}}{m}$$
- **Effect on Velocity**: Velocity increases linearly over time:
  $$\mathbf{v}(t) = \mathbf{v}_0 + \mathbf{a} t = \mathbf{v}_0 + \left(\frac{\mathbf{F}}{m}\right)t$$
- **Effect on Displacement**: Quadratic displacement over time:
  $$\mathbf{r}(t) = \mathbf{r}_0 + \mathbf{v}_0 t + \frac{1}{2} \mathbf{a} t^2$$

### 7.3 Direct Comparison Matrix

| Feature | Kick (`#btn-apply-impulse`) | Apply Force (`#btn-force-*`) |
| :--- | :--- | :--- |
| **Physical Concept** | Mechanical Impulse ($\mathbf{J} = \Delta \mathbf{p}$) | Sustained External Force ($\mathbf{F}$) |
| **Active Duration** | Finite single pulse ($\Delta t = 0.15\text{ s}$) | Continuous over time until cleared |
| **Velocity Profile** | Instantaneous velocity step jump | Linear continuous velocity ramp |
| **Acceleration Profile** | Delta spike at $t=0$, then zero | Constant non-zero $\mathbf{a} = \mathbf{F}/m$ |
| **SI Units** | $\text{N}\cdot\text{s}$ ($\text{kg}\cdot\text{m/s}$) | $\text{N}$ ($\text{kg}\cdot\text{m/s}^2$) |
| **Governing Law** | Impulse-Momentum Theorem: $\mathbf{J} = m\Delta\mathbf{v}$ | Newton's Second Law: $\Sigma \mathbf{F} = m\mathbf{a}$ |
| **Reset Requirement**| Self-terminating (no clearing needed) | Must click "Zero Forces" to stop |

---

## 8. CHALLENGES & PROCEDURES

### 8.1 Experiment 1: Projectile Motion Challenges
1. `challenge.target` — **Precision Bullseye**:
   - **Objective**: Hit randomized landing target pad on ground terrain.
   - **Physics Concept**: Boundary value trajectory inversion:
     $$v_0 = \sqrt{\frac{g d}{\sin(2\theta)}} \quad \text{or} \quad \theta = \frac{1}{2}\arcsin\left(\frac{g d}{v_0^2}\right)$$
   - **Reward**: $+50\text{ XP}$ and badge `badge-ch-bullseye`.
2. `challenge.complementary` — **Complementary Angle Law**:
   - **Objective**: Launch two shots with complementary angles ($\theta_1 + \theta_2 = 90^\circ$) from flat ground ($h_0 = 0$) and achieve identical landing range.
   - **Physics Concept**: $\sin(2\theta) = \sin(2(90^\circ - \theta))$.
   - **Reward**: $+75\text{ XP}$ and badge `badge-ch-compl`.
3. `challenge.apex` — **Stratospheric Apex**:
   - **Objective**: Achieve a maximum apex altitude $H_{\max} \ge 80.0\text{ m}$.
   - **Physics Concept**: Vertical kinetic energy conversion: $H_{\max} = \frac{v_0^2 \sin^2\theta}{2g}$. Requires high initial velocity and steep elevation.
   - **Reward**: $+100\text{ XP}$.

### 8.2 Experiment 2: Optical Fibre Challenges
1. `challenge.of-spot-match` — **Spot Match Master**:
   - **Objective**: Match output beam divergence spot diameter exactly to target circular template ($W = 2.0\text{ cm}$).
   - **Physics Concept**: Geometric ray divergence: $W = 2 L \tan\theta_a$.
   - **Reward**: $+100\text{ XP}$ and badge `badge-of-spot-match`.
2. `challenge.of-rapid-calib` — **Rapid 3-Point Laser Calibration**:
   - **Objective**: Record 3 consecutive accurate readings across preset distances ($L = 1.5, 2.5, 3.5\text{ cm}$) within $40\text{ seconds}$.
   - **Reward**: $+125\text{ XP}$ and badge `badge-of-rapid-calib`.
3. `challenge.of-multi-sweep` — **Multi-Distance Data Sweep**:
   - **Objective**: Log observations in three distinct spatial zones: Near-field ($L \le 2.0\text{ cm}$), Mid-field ($2.0 < L \le 4.5\text{ cm}$), Far-field ($L > 4.5\text{ cm}$).
   - **Reward**: $+150\text{ XP}$ and badge `badge-of-multi-sweep`.

### 8.3 Experiment 3: Colour Sensor Challenges
1. `challenge.cs-primary-calib` — **Primary Triplet Calibration**:
   - **Objective**: Successfully log calibrated baseline frequencies for Red, Green, and Blue swatches.
   - **Reward**: $+100\text{ XP}$ and badge `badge-cs-tristimulus`.
2. `challenge.cs-mystery-detective` — **Spectroscopic Detective**:
   - **Objective**: Mount unknown mystery pigment specimen, cycle through S2/S3 filters, and correctly identify the chemical compound from its chromatic profile.
   - **Reward**: $+125\text{ XP}$ and badge `badge-cs-mystery-detective`.
3. `challenge.cs-distance-sweep` — **Inverse-Square Distance Sweep**:
   - **Objective**: Log sensor readings across 3 distinct standoff distances ($5\text{–}10\text{ mm}$, $11\text{–}20\text{ mm}$, $21\text{–}30\text{ mm}$) to verify $f_o \propto 1/d^2$.
   - **Reward**: $+150\text{ XP}$ and badge `badge-cs-inverse-sweep`.

### 8.4 Experiment 4: Physics Sandbox Challenges
1. `challenge.sb-thrust` — **Newton's Dynamic Thrust**:
   - **Objective**: Configure Force magnitude $F \ge 50\text{ N}$, apply directional continuous thrust ($\leftarrow$ or $\rightarrow$), and accelerate a dynamic body to a speed $|v| \ge 12.0\text{ m/s}$.
   - **Physics Concept**: Newton's Second Law ($\mathbf{F} = m \mathbf{a} \implies \mathbf{a} = \mathbf{F}/m$) and linear velocity accumulation over time ($\mathbf{v}(t) = \mathbf{v}_0 + \mathbf{a} t$).
   - **Reward**: $+100\text{ XP}$ and badge `badge-sb-thrust` ("Newtonian Dynamicist").
2. `challenge.sb-kick` — **High-Impulse Ballistic Kick**:
   - **Objective**: Configure Force magnitude $F \ge 80\text{ N}$ and trigger **KICK** ($\Delta t = 0.15\text{ s}$ impulse) to impart instantaneous kinetic energy $\text{KE} \ge 100.0\text{ J}$.
   - **Physics Concept**: Mechanical Impulse $\mathbf{J} = \mathbf{F} \Delta t = \Delta \mathbf{p}$ and Kinetic Energy $\text{KE} = \frac{1}{2}m v^2$.
   - **Reward**: $+125\text{ XP}$ and badge `badge-sb-kick` ("Momentum Master").
3. `challenge.sb-zerog` — **Zero-G Inertial Cruise**:
   - **Objective**: Select the **Zero-G** planetary preset ($g = 0\text{ m/s}^2$), launch an object into free cruise at $|v| \ge 5.0\text{ m/s}$, and maintain unhindered inertial drift for at least 3 continuous seconds.
   - **Physics Concept**: Newton's First Law (Law of Inertia) and weightlessness: $\sum \mathbf{F} = 0 \implies \mathbf{a} = 0 \implies \mathbf{v} = \text{constant}$.
   - **Reward**: $+150\text{ XP}$ and badge `badge-sb-zerog` ("Gravity Defier").

### 8.5 Experiment 5: Diffraction Grating Challenges
1. `challenge.dg-first-order` — **First-Order Precision**:
   - **Objective**: Configure laser to He-Ne $633\text{ nm}$ (Red) with grating ruling density $N = 600\text{ lines/mm}$, and accurately resolve the first-order diffraction maximum ($\theta \approx 22.3^\circ$).
   - **Physics Concept**: Fraunhofer multi-slit interference equation: $d \sin\theta = m\lambda$.
   - **Reward**: $+100\text{ XP}$.
2. `challenge.dg-high-density` — **High-Density Dispersion**:
   - **Objective**: Set $532\text{ nm}$ (Green) at $N = 1000\text{ lines/mm}$ and measure wide-angle spectral dispersion ($\theta \approx 32.1^\circ$).
   - **Physics Concept**: Angular dispersion $D = \frac{m}{d \cos\theta}$ increases directly with line density $N$.
   - **Reward**: $+125\text{ XP}$.
3. `challenge.dg-second-order` — **Second-Order Spectral Resolution**:
   - **Objective**: Isolate second-order maximum ($m = 2$) with $\lambda = 450\text{ nm}$ and $N = 600\text{ lines/mm}$.
   - **Reward**: $+150\text{ XP}$.
4. `challenge.dg-mystery-gas` — **Mystery Gas Tube Spectrometry**:
   - **Objective**: Mount unknown sealed discharge tube, measure diffraction angle $\theta$, calculate $\lambda = \frac{d\sin\theta}{m}$, and identify the atomic element (He-Ne 633nm, Argon 488nm, Krypton 568nm).
   - **Reward**: $+175\text{ XP}$.
5. `challenge.dg-spectroscopy-master` — **Spectroscopy Mastery**:
   - **Objective**: Complete and log at least 4 scientific observation trials across diverse orders and wavelengths into the Observation Table.
   - **Reward**: $+200\text{ XP}$.

---

## 9. XP, LEVELS & STUDENT RANKS

### 9.1 XP Sources
- **Observation Logging**: $+15\text{ XP}$ per projectile flight log, $+20\text{ XP}$ per optical fibre log, $+20\text{ XP}$ per colour sensor log.
- **Laboratory Challenges**: $+50$ to $+150\text{ XP}$ per completed challenge.
- **Physics Quizzes**: $10\text{ XP}$ per correct answer (up to $+100\text{ XP}$ for a 10/10 attempt).

### 9.2 Progressive Doubling Level Scale
Level is deterministically derived from total accumulated XP:

$$\text{Next Threshold}(L+1) = \text{Current Threshold}(L) + \left(1000 \times 2^{L-1}\right)$$

| Level | XP Range | Delta to Next | Student Rank Title |
| :---: | :---: | :---: | :--- |
| **1** | $0 \rightarrow 1,000\text{ XP}$ | $1,000\text{ XP}$ | **Newtonian Novice** |
| **2** | $1,000 \rightarrow 3,000\text{ XP}$ | $2,000\text{ XP}$ | **Galilean Scholar** |
| **3** | $3,000 \rightarrow 7,000\text{ XP}$ | $4,000\text{ XP}$ | **Kinetic Specialist** |
| **4** | $7,000 \rightarrow 15,000\text{ XP}$ | $8,000\text{ XP}$ | **Orbital Dynamist** |
| **5** | $15,000 \rightarrow 31,000\text{ XP}$ | $16,000\text{ XP}$ | **Waveguide Optician** |
| **6** | $31,000 \rightarrow 63,000\text{ XP}$ | $32,000\text{ XP}$ | **Quantum Luminary** |
| **7** | $\ge 63,000\text{ XP}$ | — | **Grand Astrophysics Virtuoso** |

---

## 10. BADGE DIRECTORY

PhysiX features 19 achievement badges:

1. `badge.high-velocity` — **Hypersonic Trajectory**:
   - Unlock condition: Launch projectile with $v_0 \ge 40.0\text{ m/s}$.
2. `badge.optimal-angle` — **Optimal 45° Angle**:
   - Unlock condition: Launch projectile at $\theta = 45^\circ$.
3. `badge.target-hit` — **Target Bullseye**:
   - Unlock condition: Score a direct hit on the target landing pad.
4. `badge.long-airtime` — **High Altitude Hangtime**:
   - Unlock condition: Achieve a projectile flight duration $T \ge 5.0\text{ s}$.
5. `badge.high-platform` — **Sky Platform Artillery**:
   - Unlock condition: Launch from an elevated platform $h_0 \ge 10.0\text{ m}$.
6. `badge.multi-planet` — **Interplanetary Explorer**:
   - Unlock condition: Launch projectiles on all 4 celestial environments (Moon, Mars, Earth, Jupiter).
7. `badge.profile-saved` — **Verified Physicist**:
   - Unlock condition: Successfully customize and save student dossier profile.
8. `badge.ch-bullseye` — **Precision Bullseye**:
   - Unlock condition: Complete Challenge 1 in Projectile Motion.
9. `badge.ch-compl` — **Complementary Law**:
   - Unlock condition: Complete Challenge 2 in Projectile Motion.
10. `badge.ch-moon` — **Lunar Gravity Mastery**:
    - Unlock condition: Complete projectile challenge under lunar gravity.
11. `badge.of-spot-match` — **Spot Match Master**:
    - Unlock condition: Complete optical fibre divergence spot match challenge.
12. `badge.of-rapid-calib` — **Optics Precisionist**:
    - Unlock condition: Complete 40-second rapid 3-point laser calibration.
13. `badge.of-multi-sweep` — **Multi-Distance Waveguide**:
    - Unlock condition: Complete multi-distance NA invariance data sweep.
14. `badge.quiz-pass` — **Physics Scholar**:
    - Unlock condition: Score $\ge 60\%$ on any 10-question physics quiz.
15. `badge.quiz-perfect` — **Grand Virtuoso**:
    - Unlock condition: Score a perfect 10/10 ($100\%$) on any physics quiz.
16. `badge.cs-tristimulus` — **Tristimulus Virtuoso**:
    - Unlock condition: Complete primary RGB calibration in Colour Sensor.
17. `badge.cs-mystery-detective` — **Spectroscopic Detective**:
    - Unlock condition: Unmask unknown chemical compound in Mystery mode.
18. `badge.cs-inverse-sweep` — **Optoelectronic Photometrist**:
    - Unlock condition: Complete inverse-square distance sweep in Colour Sensor.
19. `badge.lab-veteran` — **Laboratory Veteran**:
    - Unlock condition: Execute 5 or more experimental simulation runs.

---

## 11. QUIZ SYSTEM

- **Architecture**: Dynamic multi-experiment question generator drawn from 3 specialized 50-question categorized banks in `src/quiz-data.js` (total 150 verified questions).
- **Format**: 10 randomized multiple-choice questions (A, B, C, D) with shuffled option orders.
- **Scoring**: $10\text{ points}$ per question (Maximum score: $100\text{ points}$).
- **XP Reward**: $\text{Score} \times 10$ ($10\text{ XP}$ per correct answer).
- **Post-Quiz Review**: Detailed itemized debrief explaining concept, underlying physics, and correct derivation for every question.
- **Persistence**: Every attempt is recorded in Firestore subcollection `users/{uid}/quizAttempts/{attemptId}` with score, percentage, and timestamp.

---

## 12. STREAK SYSTEM

- **Engine**: Local calendar date comparator (`YYYY-MM-DD`).
- **Consecutive Day Rule**:
  - Consecutive day login ($\Delta t = 1\text{ day}$): Increments streak count (`streak++`). Updates `highestStreak = max(highestStreak, streak)`.
  - Same calendar day ($\Delta t = 0\text{ days}$): Streak maintained without duplicate increment.
  - Broken streak ($\Delta t > 1\text{ day}$): Streak resets to 1; displays broken streak notification with recovery prompt.
- **Milestones**: Celebrated at 10, 50, 100, 200, 300, 400... days with full-screen celebration animations.
- **Storage**: Synchronized across Firestore `users/{uid}.streak` and local storage `physix_user_streak_{uid}`.

---

## 13. USER DOSSIER & PROFILE

- **Identity**: Student Name, Email, Display Handle, Selected Avatar SVG (8 presets: Quantum, Astronaut, Cyber, Lightning, Planet, Cannon, Sniper, Nebula).
- **Academic Credentials**: Education Level, Institution/Occupation, Research Statement Bio, Subject Interests.
- **Progression Metrics**:
  - Live Student Level & Rank Title.
  - Total Accumulated XP.
  - Progress % toward next level.
  - Unlocked Badges Showcase ($x / 19$).
  - Total Experiments Performed.
  - Highest Quiz Score & Telemetry Records.

---

## 14. AUTHENTICATION & SECURITY

1. **Email / Password Authentication**:
   - Secure registration and login via Firebase Auth.
   - **Email Verification Guard**: Unverified email users encounter an overlay requiring email verification before access to cloud Firestore progression.
2. **Google OAuth 2.0 Sign-In**:
   - One-click Google sign-in with popup. Pre-verified email bypassing verification overlay.
3. **Guest Mode**:
   - Unauthenticated users can perform experiments and explore the sandbox.
   - Challenge badges, Firestore cloud persistence, CSV/PDF exports, and unlimited Vectra AI queries require account authentication.

---

## 15. FIRESTORE DATA MODEL & CROSS-DEVICE SYNC

### 15.1 Document Hierarchy
```text
users/{uid}
 ├── name: string
 ├── email: string
 ├── photoURL: string | null
 ├── totalXP: number (SINGLE SOURCE OF TRUTH FOR XP)
 ├── level: number (DERIVED FROM totalXP)
 ├── streak: number
 ├── experimentsPerformed: number
 ├── quizzesAttempted: number
 ├── quizzesCompleted: number
 ├── totalQuizScore: number
 ├── bestQuizScore: number
 ├── badges: string[] (Array of unlocked badge IDs)
 ├── lastActiveDate: ISO string
 ├── createdAt: ISO string
 └── updatedAt: ISO string

 subcollection: experiments/{experimentId}
  ├── experimentName: string
  ├── attempts: number (atomic increment)
  ├── completed: boolean
  ├── bestScore: number
  ├── xpEarned: number
  └── lastPerformed: ISO string

 subcollection: quizAttempts/{attemptId}
  ├── quizId: string
  ├── score: number
  ├── totalQuestions: number
  ├── percentage: number
  ├── xpEarned: number
  └── attemptedAt: ISO string
```

### 15.2 Cross-Device Synchronization Flow
```text
Device Action (Challenge / Quiz / Observation)
                     │
                     ▼
             addStudentXp(amount)
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
    Optimistic UI           Firestore Cloud
    Instant update      atomic increment(amount)
                                 │
                                 ▼
                     Real-time onSnapshot Listener
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
            Laptop A UI                     Laptop B UI
      (Identical XP & Level)          (Identical XP & Level)
```
1. **Firestore as Single Source of Truth**:
   - Local device storage is only an optional cache (`physix_xp_{uid}`).
   - Local device stats never overwrite or downgrade Firestore cloud progression.
2. **Atomic Increments**:
   - XP additions invoke `setDoc(userRef, { totalXP: increment(amount) }, { merge: true })`.
   - Simultaneous operations on multiple devices merge cleanly without overwriting.
3. **Real-Time `onSnapshot` Synchronization**:
   - Every active device subscribes to `users/{uid}` via Firestore's real-time listener.
   - When Laptop A earns $+100\text{ XP}$, Laptop B's level badge, XP progress bar, and dossier update immediately in real time.

---

## 16. MASTER FORMULA DATABASE

### 16.1 Classical Mechanics & Kinematics
- **Horizontal Velocity Component**:
  $$v_x = v_0 \cos\theta \quad [\text{m/s}]$$
- **Vertical Velocity Component**:
  $$v_y(t) = v_0 \sin\theta - gt \quad [\text{m/s}]$$
- **Parabolic Trajectory**:
  $$y(x) = h_0 + x\tan\theta - \frac{gx^2}{2v_0^2\cos^2\theta} \quad [\text{m}]$$
- **Total Flight Time ($h_0 \ge 0$)**:
  $$T = \frac{v_0 \sin\theta + \sqrt{v_0^2 \sin^2\theta + 2gh_0}}{g} \quad [\text{s}]$$
- **Maximum Apex Height**:
  $$H_{\max} = h_0 + \frac{v_0^2 \sin^2\theta}{2g} \quad [\text{m}]$$
- **Horizontal Range ($h_0 = 0$)**:
  $$R = \frac{v_0^2 \sin(2\theta)}{g} \quad [\text{m}]$$
- **Newton's Second Law**:
  $$\Sigma \mathbf{F} = m\mathbf{a} \implies \mathbf{a} = \frac{\mathbf{F}}{m} \quad [\text{m/s}^2]$$
- **Mechanical Impulse**:
  $$\mathbf{J} = \mathbf{F}\Delta t = \Delta \mathbf{p} = m(\mathbf{v}_f - \mathbf{v}_i) \quad [\text{N}\cdot\text{s}]$$
- **Kinetic Energy**:
  $$K = \frac{1}{2}mv^2 \quad [\text{J}]$$
- **Gravitational Potential Energy**:
  $$U = mgh \quad [\text{J}]$$
- **Coefficient of Restitution**:
  $$e = \frac{|\mathbf{v}'_{2n} - \mathbf{v}'_{1n}|}{|\mathbf{v}_{1n} - \mathbf{v}_{2n}|} \quad [\text{Dimensionless}]$$

### 16.2 Fiber Optics & Photonics
- **Snell's Law of Refraction**:
  $$n_1 \sin\theta_1 = n_2 \sin\theta_2 \quad [\text{Dimensionless}]$$
- **Critical Angle for TIR**:
  $$\theta_c = \arcsin\left(\frac{n_2}{n_1}\right) \quad [^\circ]$$
- **Experimental Numerical Aperture**:
  $$NA = \frac{W}{\sqrt{4L^2 + W^2}} \quad [\text{Dimensionless}]$$
- **Theoretical Numerical Aperture**:
  $$NA_{\text{theo}} = \sqrt{n_1^2 - n_2^2} \quad [\text{Dimensionless}]$$
- **Acceptance Angle**:
  $$\theta_a = \arcsin(NA) = \arctan\left(\frac{W}{2L}\right) \quad [^\circ]$$
- **Fractional Refractive Index Contrast**:
  $$\Delta = \frac{n_1 - n_2}{n_1} \quad [\text{Dimensionless}]$$

### 16.3 Optoelectronics & Sensor Photometry
- **Photodiode Conversion**:
  $$f_o = f_D + (S \cdot E_e) \quad [\text{Hz}]$$
- **Inverse-Square Law**:
  $$E_e \propto \frac{1}{d^2} \implies \frac{f_1}{f_2} = \frac{d_2^2}{d_1^2} \quad [\text{Hz}]$$
- **Normalized Tristimulus Coordinates**:
  $$r = \frac{R}{R+G+B}, \quad g = \frac{G}{R+G+B}, \quad b = \frac{B}{R+G+B} \quad [\text{Dimensionless}]$$

---

## 17. FREQUENTLY ASKED QUESTIONS (FAQ)

### General
- `faq.general.what-is-physix`:
  - **Q**: What is PhysiX?
  - **A**: PhysiX is an interactive 2D physics simulation suite and digital physics laboratory manual. It allows students to conduct physics experiments with real-time computational engines, live telemetry, and integrated laboratory manual guides.
- `faq.general.experiments-available`:
  - **Q**: What experiments are available in PhysiX?
  - **A**: PhysiX features 5 fully interactive laboratories: (1) 2D Projectile Motion, (2) Numerical Aperture of an Optical Fibre, (3) Study of Colour Sensor TCS3200, (4) Physics Sandbox Playground, and (5) Diffraction Grating Spectrometry Laboratory. An additional 10 virtual laboratories are featured in the catalog in calibration.

### Sandbox
- `faq.sandbox.what-is-kick`:
  - **Q**: What does Kick do in Physics Sandbox?
  - **A**: Kick delivers an instantaneous mechanical impulse ($\mathbf{J} = \mathbf{F} \Delta t$) to the selected object using a pulse duration of $\Delta t = 0.15\text{ s}$ at the configured force magnitude. It creates an immediate velocity step change $\Delta \mathbf{v} = \mathbf{J}/m$ and terminates immediately.
- `faq.sandbox.what-is-apply-force`:
  - **Q**: What does Apply Force do?
  - **A**: Apply Force applies a continuous sustained vector force $\mathbf{F}$ in the selected direction ($\uparrow, \downarrow, \leftarrow, \rightarrow$). It produces constant acceleration $\mathbf{a} = \mathbf{F}/m$ and linearly increasing velocity until cleared via "Zero Forces".
- `faq.sandbox.kick-vs-apply-force`:
  - **Q**: What is the difference between Kick and Apply Force?
  - **A**: Kick is an instantaneous impulse ($0.15\text{ s}$ single pulse) representing a strike or tap that gives an immediate jump in velocity. Apply Force is a continuous force that stays active frame-by-frame, producing continuous acceleration.

### Challenges & XP
- `faq.challenges.why-not-completed`:
  - **Q**: Why didn't my challenge complete?
  - **A**: (1) You must be signed in to an authenticated account (challenges are locked for guests). (2) For the Bullseye challenge, the projectile must land within the target area. (3) For the Complementary Angle challenge, $h_0$ must be $0.0\text{ m}$ (flat ground) and the two angles must sum to $90^\circ$. (4) For the Optical Fibre calibration challenge, all 3 readings must be recorded within the 40-second timer.
- `faq.xp.how-to-level-up`:
  - **Q**: How do I level up in PhysiX?
  - **A**: You level up by accumulating student XP through recording experimental observations, completing laboratory challenges, and scoring high on quizzes. PhysiX uses a progressive doubling scale: Level 2 at $1,000\text{ XP}$, Level 3 at $3,000\text{ XP}$, Level 4 at $7,000\text{ XP}$, Level 5 at $15,000\text{ XP}$, Level 6 at $31,000\text{ XP}$, and Level 7 at $63,000\text{ XP}$.

### Progress & Cross-Device Sync
- `faq.sync.cross-device`:
  - **Q**: Can I access my XP, level, and badges from another laptop?
  - **A**: Yes. All XP, levels, unlocked badges, and experiment statistics are saved directly to your cloud Firebase Firestore document (`users/{uid}`). When you log in with the same account on another device, Firestore synchronizes your exact XP and level in real time.

---

## 18. VECTRA AI ANSWERING RULES

When answering user queries, Vectra AI must adhere to the following rules:

1. **Authorship Rule**: ONLY when explicitly asked who built, created, designed, developed, authored, or owns PhysiX/Vectra AI, reply solely with the exact sentence:
   *"This is a Project built by four Computer Engineering students Ojas Joshi, Jeshurun Selvakumar, Kshitij Jadhav, Adithya Iyer."*
   Do NOT append this statement to regular physics or trajectory answers.
2. **Zero Emojis**: Do not use emojis anywhere in your response. Use clear, high-tech scientific formatting, markdown bolding, bullet points, and standard LaTeX formulas.
3. **Strict Truthfulness**: Ground all operational statements in PhysiX's actual implementation. Never invent a feature, button, slider, challenge, badge, formula, or XP value that does not exist in the platform.
4. **Simulator vs Physical Lab Distinction**: When asked "how to perform an experiment", distinguish between:
   - Traditional physical manual procedure (bench apparatus, micrometer, diode).
   - PhysiX simulator workflow (exact button names, sliders, and hotkeys).
5. **Kick vs Apply Force**: In Physics Sandbox queries, explicitly clarify that Kick is an instantaneous impulse ($0.15\text{ s}$ pulse, $\mathbf{J} = \mathbf{F}\Delta t$) while Apply Force is a continuous sustained force causing continuous acceleration ($\mathbf{a} = \mathbf{F}/m$).
6. **Mathematical Rigor**: Present physics formulas with variable definitions and standard SI units.
7. **Cross-Device Progression**: When asked about progress persistence, explain that authenticated accounts synchronize through Firebase Firestore (`users/{uid}`) with atomic increments and real-time listeners.
8. **Credentials Protection**: Never disclose API keys, Firebase configuration values, tokens, passwords, or secrets.
9. **Polite Missing Information Fallback**: If a question pertains to a physics domain or laboratory not yet implemented in PhysiX, explain that the feature is currently in calibration rather than fabricating simulated behavior.
