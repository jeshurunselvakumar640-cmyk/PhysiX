/**
 * PhysiX — Ultra High-Performance Cinematic Splash Screen & Logo Animation
 * Engineered for 60fps / 120fps buttery smooth rendering
 */

export function initSplashScreen(onComplete) {
  const splashEl = document.getElementById("physix-splash");
  if (!splashEl) {
    if (typeof onComplete === "function") onComplete();
    return;
  }

  const progressBar = document.getElementById("splash-progress-bar");
  const statusText = document.getElementById("splash-status-text");
  const statusPct = document.getElementById("splash-status-pct");
  const skipBtn = document.getElementById("splash-skip-btn");
  const canvas = document.getElementById("splash-particle-canvas");

  let isDismissed = false;
  let animFrameId = null;

  // ----------------------------------------------------
  // 1. High-Performance Ambient Quantum Particle Canvas
  // ----------------------------------------------------
  if (canvas) {
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas || isDismissed) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize, { passive: true });

    // Lightweight particle array
    const PARTICLE_COUNT = 24;
    const particles = new Float32Array(PARTICLE_COUNT * 5); // x, y, vx, vy, size
    const colors = ["#38bdf8", "#818cf8", "#34d399"];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 5;
      particles[idx] = Math.random() * width;
      particles[idx + 1] = Math.random() * height;
      particles[idx + 2] = (Math.random() - 0.5) * 0.6; // vx
      particles[idx + 3] = (Math.random() - 0.5) * 0.6; // vy
      particles[idx + 4] = Math.random() * 1.6 + 0.8;  // radius
    }

    const renderParticles = () => {
      if (isDismissed || !ctx) return;

      ctx.clearRect(0, 0, width, height);

      // Fast single-pass drawing with zero shadowBlur
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const idx = i * 5;
        let x = particles[idx] + particles[idx + 2];
        let y = particles[idx + 1] + particles[idx + 3];

        if (x < 0) x = width;
        else if (x > width) x = 0;
        if (y < 0) y = height;
        else if (y > height) y = 0;

        particles[idx] = x;
        particles[idx + 1] = y;

        ctx.fillStyle = colors[i % 3];
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(x, y, particles[idx + 4], 0, 6.283);
        ctx.fill();
      }

      animFrameId = requestAnimationFrame(renderParticles);
    };

    animFrameId = requestAnimationFrame(renderParticles);
  }

  // ----------------------------------------------------
  // 2. Optimized Telemetry Sequence (Zero Layout Reflow)
  // ----------------------------------------------------
  const telemetrySteps = [
    { threshold: 0, text: "Initializing Kinematics & Physics Engine..." },
    { threshold: 35, text: "Calibrating Gravitational Vector Fields..." },
    { threshold: 70, text: "Synchronizing Waveguide Optical Engines..." },
    { threshold: 92, text: "Quantum Laboratory Ready." }
  ];

  const startTime = performance.now();
  const DURATION_MS = 1650; // Crisp & punchy 1.65s duration
  let lastPct = -1;
  let currentStepIdx = -1;

  function updateProgress(now) {
    if (isDismissed) return;

    const elapsed = now - startTime;
    const rawProgress = Math.min(1, elapsed / DURATION_MS);
    
    // Smooth fast ease-out
    const easeProgress = 1 - Math.pow(1 - rawProgress, 3);
    const pct = Math.round(easeProgress * 100);

    // Only touch DOM when integer value changes
    if (pct !== lastPct) {
      lastPct = pct;
      if (progressBar) {
        progressBar.style.width = `${pct}%`;
      }
      if (statusPct) {
        statusPct.textContent = `${pct}%`;
      }

      // Check status line step
      for (let i = telemetrySteps.length - 1; i >= 0; i--) {
        if (pct >= telemetrySteps[i].threshold) {
          if (currentStepIdx !== i) {
            currentStepIdx = i;
            if (statusText) {
              statusText.textContent = telemetrySteps[i].text;
            }
          }
          break;
        }
      }
    }

    if (rawProgress < 1) {
      requestAnimationFrame(updateProgress);
    } else {
      setTimeout(dismissSplash, 180);
    }
  }

  requestAnimationFrame(updateProgress);

  // ----------------------------------------------------
  // 3. Hardware-Accelerated Smooth Dismissal
  // ----------------------------------------------------
  function dismissSplash() {
    if (isDismissed) return;
    isDismissed = true;

    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }

    splashEl.classList.add("splash-fade-out");

    if (typeof onComplete === "function") {
      onComplete();
    }

    setTimeout(() => {
      splashEl.style.display = "none";
      splashEl.setAttribute("aria-hidden", "true");
      document.body.classList.add("physix-loaded");
    }, 550);
  }

  // Skip Handlers
  splashEl.addEventListener("click", dismissSplash, { once: true });

  if (skipBtn) {
    skipBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dismissSplash();
    }, { once: true });
  }

  const handleKey = (e) => {
    if (isDismissed) return;
    if (e.key === " " || e.key === "Enter" || e.key === "Escape") {
      e.preventDefault();
      dismissSplash();
      window.removeEventListener("keydown", handleKey);
    }
  };
  window.addEventListener("keydown", handleKey);
}
