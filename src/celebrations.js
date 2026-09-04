/**
 * PhysiX Celebrations Engine
 * High-performance confetti particle physics, cyber graffiti challenge toasts,
 * and AAA game-style Level Up animation modal.
 */

// ----------------------------------------------------
// 1. Synthesized Futuristic Web Audio Chimes
// ----------------------------------------------------
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playLevelUpFanfare() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Harmonious cyber fanfare: C4 -> E4 -> G4 -> C5 -> E5 arpeggio with shimmer
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.65);
    });
  } catch (e) {}
}

export function playChallengeCompleteChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Bright dual chime (G5 -> C6)
    [783.99, 1046.50].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.5);
    });
  } catch (e) {}
}

// ----------------------------------------------------
// 2. High-Performance Canvas Confetti & Particle Shower
// ----------------------------------------------------
class ConfettiParticle {
  constructor(w, h) {
    this.reset(w, h, true);
  }

  reset(w, h, initial = false) {
    this.x = initial ? Math.random() * w : w * 0.5 + (Math.random() - 0.5) * (w * 0.6);
    this.y = initial ? Math.random() * h * 0.6 : -20 - Math.random() * 50;
    this.size = Math.random() * 8 + 6;
    this.vx = (Math.random() - 0.5) * 6;
    this.vy = Math.random() * 4 + 3;
    this.rotation = Math.random() * 360;
    this.vRotation = (Math.random() - 0.5) * 10;
    this.color = ConfettiParticle.COLORS[Math.floor(Math.random() * ConfettiParticle.COLORS.length)];
    this.shape = Math.random() > 0.4 ? "rect" : "circle";
    this.opacity = 1;
    this.scaleY = Math.cos(this.rotation * (Math.PI / 180));
  }

  update(w, h) {
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.vRotation;
    this.scaleY = Math.cos(this.rotation * (Math.PI / 180));
    this.vx += Math.sin(this.y * 0.02) * 0.1; // gentle sway
    if (this.y > h + 30) {
      this.opacity = 0;
    }
  }

  draw(ctx) {
    if (this.opacity <= 0) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.scale(1, this.scaleY);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;

    if (this.shape === "rect") {
      ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size * 0.6);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

ConfettiParticle.COLORS = [
  "#38bdf8", // Neon Cyan
  "#818cf8", // Electric Indigo
  "#c084fc", // Radiant Purple
  "#34d399", // Emerald Green
  "#f43f5e", // Cyber Rose
  "#fbbf24", // Golden Amber
  "#ffffff"  // Holographic Silver
];

let globalConfettiAnimId = null;

export function triggerConfetti(durationMs = 3000, count = 80) {
  let canvas = document.getElementById("global-confetti-canvas");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "global-confetti-canvas";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "99999";
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext("2d");
  let w = (canvas.width = window.innerWidth);
  let h = (canvas.height = window.innerHeight);

  const onResize = () => {
    if (canvas) {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
  };
  window.addEventListener("resize", onResize, { passive: true });

  const particles = Array.from({ length: count }, () => new ConfettiParticle(w, h));
  const startTime = performance.now();

  if (globalConfettiAnimId) {
    cancelAnimationFrame(globalConfettiAnimId);
  }

  function loop(now) {
    const elapsed = now - startTime;
    ctx.clearRect(0, 0, w, h);

    let activeCount = 0;
    particles.forEach(p => {
      p.update(w, h);
      p.draw(ctx);
      if (p.opacity > 0) activeCount++;
    });

    if (elapsed < durationMs || activeCount > 0) {
      globalConfettiAnimId = requestAnimationFrame(loop);
    } else {
      ctx.clearRect(0, 0, w, h);
      window.removeEventListener("resize", onResize);
      globalConfettiAnimId = null;
    }
  }

  globalConfettiAnimId = requestAnimationFrame(loop);
}

// ----------------------------------------------------
// 3. Challenge Completed Graffiti Shower Banner
// ----------------------------------------------------
export function showChallengeGraffiti(title = "Challenge Completed", xp = 100, badge = "") {
  playChallengeCompleteChime();
  triggerConfetti(2800, 75);

  let banner = document.getElementById("challenge-graffiti-banner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "challenge-graffiti-banner";
    banner.className = "challenge-graffiti-banner";
    document.body.appendChild(banner);
  }

  banner.innerHTML = `
    <div class="graffiti-card-glow"></div>
    <div class="graffiti-spray-tag">COMPLETED</div>
    <div class="graffiti-content-row">
      <div class="graffiti-trophy-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
          <path d="M4 22h16"></path>
          <path d="M10 14.66V17c0 .55-.45 1-1 1H7c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-2c-.55 0-1-.45-1-1v-2.34"></path>
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
        </svg>
      </div>
      <div class="graffiti-details">
        <span class="graffiti-eyebrow">LABORATORY MILESTONE</span>
        <h4 class="graffiti-title">${title}</h4>
        ${badge ? `<p class="graffiti-badge-note">Badge Unlocked: <strong>${badge}</strong></p>` : ""}
      </div>
      <div class="graffiti-xp-pill">
        <span class="xp-plus">+</span><span class="xp-amount">${xp}</span>
        <span class="xp-unit">XP</span>
      </div>
    </div>
  `;

  banner.classList.remove("hide");
  banner.classList.add("show");

  // Auto-hide after 4.5 seconds
  if (banner._hideTimeout) clearTimeout(banner._hideTimeout);
  banner._hideTimeout = setTimeout(() => {
    banner.classList.remove("show");
    banner.classList.add("hide");
  }, 4500);
}

// ----------------------------------------------------
// 4. AAA Game-Style Level Up Modal Celebration
// ----------------------------------------------------
export function showLevelUpCelebration({
  level = 2,
  rank = "Galilean Scholar",
  xp = 1500,
  nextThreshold = 3000,
  onDismiss = null
} = {}) {
  const modal = document.getElementById("levelup-modal");
  if (!modal) return;

  playLevelUpFanfare();
  triggerConfetti(4500, 110);

  const displayNum = document.getElementById("levelup-display-num");
  const displayTitle = document.getElementById("levelup-display-title");
  const displayXp = document.getElementById("levelup-display-xp");
  const xpFill = document.getElementById("levelup-xp-fill");

  if (displayNum) displayNum.textContent = level;
  if (displayTitle) displayTitle.textContent = rank;
  if (displayXp) displayXp.textContent = `${xp.toLocaleString()} / ${nextThreshold.toLocaleString()} XP`;
  if (xpFill) {
    const pct = Math.min(100, Math.round((xp / (nextThreshold || 1)) * 100));
    xpFill.style.width = "0%";
    setTimeout(() => {
      xpFill.style.width = `${pct}%`;
    }, 250);
  }

  modal.classList.remove("hidden");
  modal.classList.add("active");

  function dismiss() {
    modal.classList.remove("active");
    modal.classList.add("hidden");
    if (typeof onDismiss === "function") {
      onDismiss();
    }
  }

  const claimBtn = document.getElementById("btn-claim-levelup");
  if (claimBtn) {
    claimBtn.onclick = (e) => {
      e.stopPropagation();
      dismiss();
    };
  }

  modal.onclick = (e) => {
    if (e.target === modal) {
      dismiss();
    }
  };

  const handleKey = (e) => {
    if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
      window.removeEventListener("keydown", handleKey);
      dismiss();
    }
  };
  window.addEventListener("keydown", handleKey, { once: true });
}

export function playStreakLostSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Melancholy descending minor chords: A4 -> F4 -> C4 -> G3
    const notes = [440.0, 349.23, 261.63, 196.0];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, now + idx * 0.14);

      gain.gain.setValueAtTime(0, now + idx * 0.14);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.14 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.14);
      osc.stop(now + idx * 0.14 + 0.5);
    });
  } catch (e) {}
}

export function playStreakMilestoneFanfare() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Triumphant fiery ascending fanfare: C4 -> G4 -> C5 -> E5 -> G5 -> C6
    const notes = [261.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0, now + idx * 0.09);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.09 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.75);
    });
  } catch (e) {}
}

export function triggerFireConfetti(durationMs = 4500, count = 90) {
  const fireColors = ["#f97316", "#ef4444", "#fbbf24", "#fef08a", "#ea580c", "#ffffff"];
  const origColors = ConfettiParticle.COLORS;
  ConfettiParticle.COLORS = fireColors;
  triggerConfetti(durationMs, count);
  setTimeout(() => {
    ConfettiParticle.COLORS = origColors;
  }, durationMs + 100);
}

// ----------------------------------------------------
// 5. Streak Broken / Lost Modal Animation
// ----------------------------------------------------
export function showStreakLostAnimation({
  lostStreak = 1,
  newStreak = 1,
  email = "",
  onDismiss = null
} = {}) {
  const modal = document.getElementById("streak-lost-modal");
  if (!modal) return;

  playStreakLostSound();

  const countEl = document.getElementById("streak-lost-prev-num");
  const emailEl = document.getElementById("streak-lost-email");
  const msgEl = document.getElementById("streak-lost-desc");

  if (countEl) countEl.textContent = `${lostStreak} Days`;
  if (emailEl) emailEl.textContent = email || "Student Account";
  if (msgEl) {
    msgEl.innerHTML = `You missed a day and lost your <strong>${lostStreak}-Day Active Streak</strong>. Don't worry, every grand physicist has setbacks. Start fresh today with <strong>Day 1 🔥</strong>!`;
  }

  modal.classList.remove("hidden");
  modal.classList.add("active");

  function dismiss() {
    modal.classList.remove("active");
    modal.classList.add("hidden");
    if (typeof onDismiss === "function") {
      onDismiss();
    }
  }

  const claimBtn = document.getElementById("btn-claim-streak-lost");
  if (claimBtn) {
    claimBtn.onclick = (e) => {
      e.stopPropagation();
      dismiss();
    };
  }

  modal.onclick = (e) => {
    if (e.target === modal) {
      dismiss();
    }
  };

  const handleKey = (e) => {
    if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
      window.removeEventListener("keydown", handleKey);
      dismiss();
    }
  };
  window.addEventListener("keydown", handleKey, { once: true });
}

// ----------------------------------------------------
// 6. Streak Maintained Milestone Celebration Modal
// ----------------------------------------------------
export function showStreakMilestoneAnimation({
  streakDays = 10,
  highestStreak = 10,
  email = "",
  onDismiss = null
} = {}) {
  const modal = document.getElementById("streak-milestone-modal");
  if (!modal) return;

  playStreakMilestoneFanfare();
  triggerFireConfetti(5000, 120);

  const numEl = document.getElementById("streak-milestone-num");
  const titleEl = document.getElementById("streak-milestone-title");
  const descEl = document.getElementById("streak-milestone-desc");
  const recordEl = document.getElementById("streak-milestone-record");

  if (numEl) numEl.textContent = `${streakDays} Days`;
  if (titleEl) titleEl.textContent = `🔥 ${streakDays}-Day Streak Maintained!`;
  if (descEl) {
    descEl.textContent = `Phenomenal dedication! You have consistently logged into the PhysiX Virtual Laboratory for ${streakDays} consecutive days.`;
  }
  if (recordEl) recordEl.textContent = `All-Time Record: ${Math.max(highestStreak, streakDays)} Days`;

  modal.classList.remove("hidden");
  modal.classList.add("active");

  function dismiss() {
    modal.classList.remove("active");
    modal.classList.add("hidden");
    if (typeof onDismiss === "function") {
      onDismiss();
    }
  }

  const claimBtn = document.getElementById("btn-claim-streak-milestone");
  if (claimBtn) {
    claimBtn.onclick = (e) => {
      e.stopPropagation();
      dismiss();
    };
  }

  modal.onclick = (e) => {
    if (e.target === modal) {
      dismiss();
    }
  };

  const handleKey = (e) => {
    if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
      window.removeEventListener("keydown", handleKey);
      dismiss();
    }
  };
  window.addEventListener("keydown", handleKey, { once: true });
}

// ----------------------------------------------------
// 7. Setup & Global Access
// ----------------------------------------------------
export function initCelebrations() {
  // Expose to window for testing or manual triggers
  window.triggerConfetti = triggerConfetti;
  window.triggerFireConfetti = triggerFireConfetti;
  window.showChallengeGraffiti = showChallengeGraffiti;
  window.showLevelUpCelebration = showLevelUpCelebration;
  window.showStreakLostAnimation = showStreakLostAnimation;
  window.showStreakMilestoneAnimation = showStreakMilestoneAnimation;
}
