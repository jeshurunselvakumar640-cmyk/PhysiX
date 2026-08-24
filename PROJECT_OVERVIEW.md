# ⚛️ PhysiX Simulator — Project Overview & Technical Architecture

> **An interactive STEM physics simulation platform designed for students, educators, and classrooms.**  
> Built with Vanilla JavaScript, HTML5 Canvas, Matter.js, and Vite.

---

## 📑 Table of Contents
1. [Project Architecture & File Tree](#-project-architecture--file-tree)
2. [File-by-File Breakdown](#-file-by-file-breakdown)
   - [`index.html`](#1-indexhtml--user-interface-structure)
   - [`src/main.js`](#2-srcmainjs--physics-engine--simulation-core)
   - [`src/style.css`](#3-srcstylecss--design-system--styling)
   - [`package.json`](#4-packagejson--tooling)
3. [Physics Engine & Mathematical Model](#-physics-engine--mathematical-model)
   - [Coordinate System & Calibration](#coordinate-system--scaling)
   - [Kinematic Equations of Motion](#kinematic-equations-with-elevation-offset)
   - [Theoretical Metrics Formulas](#theoretical-metrics-formulas)
4. [Key Subsystems](#-key-subsystems)
   - [1. Real-Time Telemetry HUD](#1-real-time-telemetry-hud)
   - [2. Dynamic Velocity Vector Decomposition](#2-dynamic-velocity-vector-decomposition)
   - [3. Trajectory Ghost Comparison Trails](#3-trajectory-ghost-comparison-trails)
   - [4. Target Challenge Mode](#4-target-challenge-mode)
   - [5. Labs Explorer & Mechanics Roadmap](#5-labs-explorer--mechanics-roadmap)
   - [6. Guest-First Session Model](#6-guest-first-session-model)
5. [How to Run & Develop Locally](#-how-to-run--develop-locally)
6. [Guide: How to Add a New Lab](#-guide-how-to-add-a-new-lab-for-teammates)

---

## 📂 Project Architecture & File Tree

```
physix/
├── index.html              # Main HTML markup, HUD overlays, modals, and control panels
├── package.json            # Vite configuration and dependencies
├── README.md               # GitHub repository landing page
├── PROJECT_OVERVIEW.md     # Team technical documentation (this file)
└── src/
    ├── main.js             # Physics simulation logic, kinematics, rendering, and DOM events
    └── style.css           # Design tokens, dark cyber-academic theme, glassmorphism, responsive grid
```

---

## 🔍 File-by-File Breakdown

### 1. `index.html` — User Interface Structure
Organized into 4 distinct functional zones:

1. **Top Navbar (`<header class="header">`)**:
   - Brand logo with glowing animated atom icon.
   - **`🧪 Labs Explorer`** button: Opens the multi-lab selection modal.
   - **`📖 Formulas`** button: Opens the mathematical cheat sheet modal.
   - **`👤 Guest Profile`** chip: Shows local storage save status and cloud sync preview.

2. **Simulation Viewport (`<section class="simulation-card">`)**:
   - Status badge indicating active simulation state.
   - Target Challenge banner with real-time distance and score display.
   - **Telemetry HUD Overlay (`#telemetry-hud`)**: 4 live floating chips for Flight Time ($t$), Altitude ($y$), Distance ($x$), and Speed ($v$).
   - Mount container (`#simulation`) for the canvas.

3. **Controls Panel (`<section class="controls-card">`)**:
   - Initial Velocity slider ($v_0$: $1 - 40\text{ m/s}$).
   - Launch Angle slider ($\theta$: $0^\circ - 90^\circ$).
   - Gravity slider ($g$: $1.0 - 25.0\text{ m/s}^2$).
   - **Planetary Presets**: Quick buttons for 🌍 Earth, 🌕 Moon, 🔴 Mars, 🪐 Jupiter.
   - **Display Toggles**: Velocity Vectors, Ghost Comparison Trails, Target Challenge Mode.
   - Action buttons: Launch (▶), Reset (↺), Clear Trails (🗑).

4. **Results Dashboard & Modals**:
   - 4-card metric grid: Max Height ($H$), Total Range ($R$), Flight Time ($T$), Impact Velocity ($v_f$).
   - **Modals**: Labs Explorer (`#explorer-modal`), Theory Sheet (`#theory-modal`), Profile Popup (`#profile-modal`), and Toast Notifications (`#toast`).

---

### 2. `src/main.js` — Physics Engine & Simulation Core
The primary logic controller divided into clean modules:

| Module Section | Functionality |
| :--- | :--- |
| **Constants & Scale** | Defines `SCALE = 12` (12px = 1m), `GROUND_Y = 540`, `ORIGIN_X = 80`, and cannon pivot geometry. |
| **State Management (`simState`)** | Tracks active launch timestamp, live coordinates, speed, trail points, ghost trails, target location, and UI toggle states. |
| **Matter.js Setup** | Configures the canvas renderer and static visual bodies (ground, cannon base, barrel, wheel) as non-blocking sensors. |
| **Kinematic Update Loop (`beforeUpdate`)** | Computes continuous closed-form positions $x(t), y(t)$ and velocities $v_x(t), v_y(t)$ per frame at high precision. |
| **Canvas Overlay (`afterRender`)** | Directly paints custom lab graphics onto canvas: metric grid & height ruler, bullseye target, ghost trails, active glowing arc, and vector arrows. |
| **Vector Renderer (`drawVelocityVectors`)** | Calculates and draws instant arrows for resultant velocity $\vec{v}$ (Cyan), $v_x$ (Green), and $v_y$ (Orange). |
| **Theoretical Calculations (`calculateTheoreticalResults`)** | Computes analytical solutions accounting for initial elevation $h_0$ and updates metric cards in real time. |
| **DOM Controllers & Modals** | Handles slider changes, planet preset selection, toggles, launch triggers, modals open/close, and toast messages. |

---

### 3. `src/style.css` — Design System & Styling
- **Color Palette & CSS Variables (`:root`)**: Deep cyber-academic dark background (`#070a12`), glassmorphism card gradients, purple accents (`#8b5cf6`), and status colors.
- **Typography**: Dual-font system using `Inter` for clean UI text and `JetBrains Mono` for precise numbers and telemetry readouts.
- **Interactive Sliders**: Custom slider tracks and glowing thumb handles color-coded by control type (Red for Velocity, Blue for Angle, Green for Gravity).
- **Responsive Layout**: CSS Grid dashboard that seamlessly adapts from side-by-side desktop layout to stacked viewports on tablets and mobile screens.
- **Modals & Toast Animations**: Smooth backdrop blur, slide-up keyframe transitions, and glowing border pulse effects.

---

### 4. `package.json` — Tooling
- **Bundler**: [Vite](https://vitejs.dev/) for instant Hot Module Replacement (HMR) and fast builds.
- **Physics Library**: [Matter.js](https://brm.io/matter-js/) for canvas rigid body rendering.

---

## 🧮 Physics Engine & Mathematical Model

### Coordinate System & Scaling
- **Calibration Ratio**: **`1.0 meter = 12 pixels`** on screen.
- **Origin ($x = 0\text{ m}, y = 0\text{ m}$)**:
  - Horizontal origin $X_{\text{origin}} = 80\text{px}$.
  - Ground level $Y_{\text{ground}} = 540\text{px}$.
- **Cannon Barrel Geometry**:
  - Pivot located at $(80\text{px}, 495\text{px})$ ($3.75\text{ m}$ above ground).
  - Barrel length: $54\text{px}$ ($4.5\text{ m}$).
  - Tip coordinate where projectile leaves the cannon:
    $$x_0 = X_{\text{pivot}} + (L_{\text{barrel}} + r_{\text{ball}}) \cos\theta$$
    $$y_0 = Y_{\text{pivot}} - (L_{\text{barrel}} + r_{\text{ball}}) \sin\theta$$
  - Initial launch elevation above ground:
    $$h_0 = \frac{Y_{\text{ground}} - y_0}{\text{SCALE}}$$
  - Initial horizontal displacement:
    $$d_0 = \frac{x_0 - X_{\text{origin}}}{\text{SCALE}}$$

---

### Kinematic Equations (with Elevation Offset)
During flight, the position and velocity at elapsed time $t$ are calculated as:

$$\begin{aligned}
x(t) &= x_0 + (v_0 \cos\theta) \cdot t \cdot \text{SCALE} \\
y(t) &= y_0 - \left( (v_0 \sin\theta) \cdot t - \frac{1}{2} g t^2 \right) \cdot \text{SCALE} \\
v_x(t) &= v_0 \cos\theta \\
v_y(t) &= v_0 \sin\theta - g t \\
v(t) &= \sqrt{v_x(t)^2 + v_y(t)^2}
\end{aligned}$$

---

### Theoretical Metrics Formulas

1. **Time of Flight ($T$)**:
   Quadratic solution to $h_0 + v_0 \sin\theta \cdot T - \frac{1}{2} g T^2 = 0$:
   $$T = \frac{v_0 \sin\theta + \sqrt{(v_0 \sin\theta)^2 + 2 g h_0}}{g}$$

2. **Maximum Height ($H$)**:
   Peak altitude reached above ground level:
   $$H = h_0 + \frac{(v_0 \sin\theta)^2}{2g}$$

3. **Total Range ($R$)**:
   Total horizontal distance measured from origin $x = 0$:
   $$R = d_0 + (v_0 \cos\theta) \cdot T$$

4. **Terminal Impact Speed ($v_f$)**:
   Impact speed upon reaching the ground:
   $$v_f = \sqrt{v_0^2 + 2 g h_0}$$

---

## 🚀 How to Run & Develop Locally

```bash
# 1. Install dependencies
npm install

# 2. Start local Vite development server
npm run dev

# 3. Build optimized production bundle
npm run build

# 4. Preview production build locally
npm run preview
```
