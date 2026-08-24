# ⚛️ PhysiX — Interactive STEM Physics Laboratory

![PhysiX Banner](src/assets/hero.png)

> **PhysiX** is an interactive Classical Mechanics and Physics Laboratory platform designed for students, educators, and science enthusiasts. Built with modern web technologies, high-precision kinematics, and sleek cyber-academic aesthetics.

---

## 🚀 Live Features

- 📐 **Calibrated Projectile Motion Lab**: High-precision 2D kinematics simulation with ground elevation offsets ($h_0, d_0$) and scale calibration ($12\text{ px} = 1\text{ m}$).
- ⏱️ **Real-Time Telemetry HUD**: Floating glassmorphic HUD tracking flight time ($t$), altitude ($y$), distance ($x$), and instant speed ($v$).
- 🏹 **Dynamic Velocity Vectors**: Real-time vector decomposition displaying $\vec{v}$ (Cyan), horizontal component $v_x$ (Green), and vertical component $v_y$ (Amber).
- 🪐 **Planetary Gravity Presets**: Instant simulation of gravity for 🌍 Earth ($9.8\,\text{m/s}^2$), 🌕 Moon ($1.62\,\text{m/s}^2$), 🔴 Mars ($3.72\,\text{m/s}^2$), and 🪐 Jupiter ($24.79\,\text{m/s}^2$).
- 👻 **Ghost Comparison Trails**: Retains previous trajectory paths with parameter labels for visual multi-angle comparison.
- 🎯 **Target Challenge Mode**: Interactive bullseye targets with hit detection, particle splash effects, and scoring.
- 🧪 **Labs Explorer Hub**: Browse 7 Classical Mechanics experiments including upcoming Simple Pendulum, 2D Collisions, Friction & Incline, and Orbital Mechanics.
- 📖 **Mathematical Reference Sheet**: In-app formulas reference covering projectile equations and upcoming lab foundations.

---

## 🛠️ Tech Stack

- **Core**: Vanilla JavaScript (ES6+), HTML5 Canvas
- **Physics**: Analytical Kinematics + [Matter.js](https://brm.io/matter-js/)
- **Styling**: Vanilla CSS (Custom Design System, Glassmorphism, CSS Grid)
- **Tooling**: [Vite](https://vitejs.dev/)

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/ojasjoshi-007/PhysiX.git
cd PhysiX

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Build for production
npm run build
```

---

## 📄 License
MIT License © 2026 Ojas Joshi
