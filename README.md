# ⚛️ PhysiX — Advanced Interactive Virtual Physics Laboratory

![PhysiX Banner](src/assets/hero.png)

> **PhysiX** is a state-of-the-art interactive Virtual Physics Laboratory platform designed for undergraduate engineering, physics students, and educators. Featuring high-precision scientific simulation engines, authentic physical instrument facias, live dual-quadrant graphing, interactive banana-plug wiring, formula rendering with KaTeX, observation logbooks, and publication-ready PDF lab report generation.

---

## 🌐 Live Deployments & Repositories

* 🚀 **Secondary Branch / Mirror Live App**: [https://physi-x-orcin.vercel.app/](https://physi-x-orcin.vercel.app/)
* 📦 **Secondary Repository**: [https://github.com/jeshurunselvakumar640-cmyk/physics.git](https://github.com/jeshurunselvakumar640-cmyk/physics.git)
* 📦 **Primary Repository**: [https://github.com/jeshurunselvakumar640-cmyk/PhysiX](https://github.com/jeshurunselvakumar640-cmyk/PhysiX)

---

## 🔬 Virtual Experiments & Laboratories

PhysiX features a comprehensive suite of rigorous, curriculum-aligned virtual laboratory experiments across Classical Mechanics, Wave Optics, Fiber Optics, Semiconductor Physics, and Sensor Instrumentation:

### 1. 📐 2D Projectile Motion Virtual Laboratory
* **Engine**: Analytical Kinematics & [Matter.js](https://brm.io/matter-js/) Newtonian Physics Engine.
* **Features**:
  * Precision trajectory simulation with launch elevation angle ($\theta$), muzzle speed ($v_0$), and ground elevation offsets ($h_0, d_0$).
  * Real-time vector decomposition: total velocity vector $\vec{v}$, horizontal component $v_x$, and vertical component $v_y$.
  * Planetary gravity presets: Earth ($9.80\,\text{m/s}^2$), Moon ($1.62\,\text{m/s}^2$), Mars ($3.72\,\text{m/s}^2$), and Jupiter ($24.79\,\text{m/s}^2$), plus custom $g$ tuning.
  * Ghost comparison trails, telemetry HUD ($t$, $x$, $y$, $v$), and interactive target challenge bullseyes.

### 2. ⚡ P-N Junction Diode Characteristics Apparatus
* **Engine**: Shockley Ideal Diode Equation & Dynamic Equivalent Resistance Solver.
* **Features**:
  * Photorealistic hardware apparatus inspired by laboratory training instruments.
  * Dual variable DC power supplies: Forward Bias ($0.0\text{ to }1.5\,\text{V}$) and Reverse Bias ($0.0\text{ to }30.0\,\text{V}$) with rotary potentiometer controls and precision step buttons.
  * Dual-range analog meters: Voltmeter ($1.5\,\text{V} / 30.0\,\text{V}$) and Ammeter ($10\,\text{mA} / 100\,\mu\text{A}$) with spring-damped needle physics and digital readouts.
  * Interactive banana-plug wiring system: realistic catenary cable sagging, terminal socket snapping, open/short circuit validation, and auto-patch presets.
  * Real-time dual live canvas plotting of forward (1st quadrant) and reverse (3rd quadrant) $V\text{–}I$ characteristic curves with knees and breakdown regions.
  * Dynamic observation logbook with knee voltage ($V_k$) and dynamic resistance ($r_d$) calculations.

### 3. 🌐 Determination of Numerical Aperture of an Optical Fibre
* **Engine**: Waveguide Ray Tracing & Conical Divergence Solver.
* **Features**:
  * Industrial-grade optical bench featuring a laser transmitter, NA jig assembly, and graduated projection screen.
  * Divergence circle measurement across variable propagation distances ($L = 10\text{ to }50\,\text{mm}$).
  * Interactive vernier calipers measurement of spot diameter ($W$).
  * Precise analytical computation of Numerical Aperture:
    $$\text{NA} = \sin \theta_{\max} = \frac{W}{\sqrt{4L^2 + W^2}}$$
  * Acceptance angle ($\theta_a$) and core-cladding index validation.

### 4. 📏 Laser Diffraction Grating Laboratory (Wavelength of Light)
* **Engine**: Fraunhofer Far-Field Diffraction & Wave Interference Physics.
* **Features**:
  * Monochromatic laser source ($\text{He-Ne } 632.8\,\text{nm}$, Green $532\,\text{nm}$, or Violet $405\,\text{nm}$).
  * Precision diffraction grating with selectable grating density ($15{,}000\text{ lines/inch}$ or $300\text{ lines/mm}$).
  * Multi-order diffraction spots ($m = \pm 1, \pm 2, \pm 3$) projected onto an interactive graduated scale.
  * Experimental wavelength extraction using the grating equation:
    $$\lambda = \frac{d \sin \theta_m}{m} = \frac{x_m}{m \cdot N \sqrt{D^2 + x_m^2}}$$

### 5. 🧲 Hall Effect in Semiconductor Crystals
* **Engine**: Lorentz Force Galvanomagnetic Solid-State Physics.
* **Features**:
  * Heavy laboratory electromagnet with variable magnetic field current ($0\text{ to }5.0\,\text{A}$) producing up to $0.8\,\text{Tesla}$.
  * Constant crystal sample probe current supply ($0\text{ to }50.0\,\text{mA}$).
  * Bismuth / Germanium thin-film semiconductor crystal wafer with 4-point probe connections.
  * Live Hall voltage ($V_H$) detection with digital gaussmeter readings.
  * Authoritative determination of Hall coefficient ($R_H$), majority carrier type (n-type vs. p-type), carrier concentration ($n$), and carrier mobility ($\mu$).

### 6. 🌈 TCS3200 RGB Colour Sensor Characterization
* **Engine**: Photodiode Array Optoelectronic Transduction & PWM Frequency Mapping.
* **Features**:
  * TCS3200 optical sensor module with $8\times 8$ photodiode matrix and colour filters (Red, Green, Blue, Clear).
  * Color frequency response curves ($f_0$ to $f_{\max}$) with adjustable output frequency scaling ($2\%, 20\%, 100\%$).
  * Interactive color swatch picker and spectrometer breakdown.
  * Real-time square-wave pulse oscilloscope waveform generator.

### 7. 💡 Attenuation Loss in Plastic Optical Fiber (POF)
* **Engine**: Optical Power Transmission & Fiber Scattering/Absorption Model.
* **Features**:
  * Heavy cast dual-rail optical bench with machined sliding saddles and locking thumbscrews.
  * Optical transmitter module ($650\,\text{nm}$ red LED source) with adjustable launch power.
  * Optical power meter readout (optical power $P$ in $\text{dBm}$ / $\mu\text{W}$).
  * Cut-back method and multi-length fiber loss comparison ($L_1$ vs. $L_2$).
  * Precise calculation of attenuation coefficient:
    $$\alpha = \frac{10}{L_2 - L_1} \log_{10}\left(\frac{P_1}{P_2}\right) \quad (\text{dB/m})$$

### 8. 🛠️ Interactive Physics Sandbox
* **Engine**: [Matter.js](https://brm.io/matter-js/) Rigid Body Mechanics.
* **Features**:
  * Freeform creative sandbox for multi-body Newtonian simulations.
  * Variable gravity vectors, bounce/restitution, air friction, and static/kinetic friction.
  * Interactive constraint joints, pendulums, Newton's cradles, and stacking pyramids.

---

## ✨ Platform Features

* 📊 **Live Canvas & SVG Visualizations**: High-DPI retina rendering of circular meters, galvanometer needles, oscilloscope waveforms, and circuit cables.
* 📝 **Automated Observation Logbooks**: One-click logging of trial readings with real-time error propagation and least-count analysis.
* 📄 **Lab Report PDF Export**: Generates institutional laboratory reports using `jspdf` and `jspdf-autotable`, including student credentials, apparatus diagrams, formulas, observation tables, and signature lines.
* 🏆 **Gamification & Mastery**: XP progression, streak tracking, interactive challenge checklists, achievement badges, and multiple-choice lab mastery quizzes.
* 📐 **Math & Theory Engine**: Comprehensive derivations, procedure steps, and formulas rendered in standard LaTeX math notation using [KaTeX](https://katex.org/).
* 🌓 **Cyber-Academic Theme**: Bespoke deep navy/cyan dark mode with full light-mode toggle and responsive layouts for desktop, tablet, and mobile.
* 📶 **Progressive Web App (PWA)**: Built-in offline support and local storage caching for field and offline lab usage.

---

## 🛠️ Tech Stack

* **Front-End**: HTML5, Vanilla JavaScript (ES6+ Modules), Vanilla CSS (Custom Design System, Glassmorphism, CSS Grid)
* **Physics & Math**: Analytical Physics Models, [Matter.js](https://brm.io/matter-js/), [KaTeX](https://katex.org/)
* **PDF Engine**: [jsPDF](https://github.com/parallax/jsPDF), [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)
* **Build Tooling & Bundler**: [Vite](https://vitejs.dev/)
* **Backend / API (Optional)**: Node.js, Express, Firebase Authentication & Cloud Firestore

---

## 💻 Getting Started

### Prerequisites
* Node.js (`v18` or higher)
* npm or yarn

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/jeshurunselvakumar640-cmyk/PhysiX.git
cd PhysiX

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Create production bundle
npm run build
```

---

## 📄 License
MIT License © 2026 PhysiX Virtual Laboratory
