/**
 * PhysiX Frontend API Client
 * Seamlessly interfaces with Express.js backend on /api with offline local storage fallback.
 */

const API_BASE = "/api";
const DIRECT_API_BASE = "http://localhost:3001/api";

async function fetchJson(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // If proxied /api failed, attempt direct connection to Express server on port 3001
    if (url.startsWith("/api")) {
      try {
        const directUrl = url.replace("/api", DIRECT_API_BASE);
        const directRes = await fetch(directUrl, {
          headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
          },
          ...options
        });
        if (directRes.ok) {
          return await directRes.json();
        }
      } catch (directErr) {}
    }
    console.warn(`[API Client] Network request to ${url} failed:`, err.message);
  }
  return null;
}

export const api = {
  // Check backend server health
  async checkHealth() {
    const data = await fetchJson(`${API_BASE}/health`);
    return data && data.status === "ok";
  },

  // Student Profile
  async getProfile(userId = "guest") {
    const res = await fetchJson(`${API_BASE}/profile/${userId}`);
    if (res && res.success && res.profile) {
      // Sync to localStorage
      try {
        localStorage.setItem("physix_user_profile", JSON.stringify(res.profile));
      } catch (e) {}
      return res.profile;
    }
    // Fallback to localStorage
    try {
      const cached = localStorage.getItem("physix_user_profile");
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return null;
  },

  async saveProfile(userId = "guest", profileData) {
    // Save to local cache first
    try {
      localStorage.setItem("physix_user_profile", JSON.stringify(profileData));
    } catch (e) {}

    const res = await fetchJson(`${API_BASE}/profile`, {
      method: "POST",
      body: JSON.stringify({ userId, profileData })
    });
    return res && res.success ? res.profile : profileData;
  },

  // Telemetry & Stats
  async getTelemetry(userId = "guest") {
    const res = await fetchJson(`${API_BASE}/telemetry/${userId}`);
    if (res && res.success && res.telemetry) {
      try {
        localStorage.setItem("physix_telemetry_stats", JSON.stringify(res.telemetry));
      } catch (e) {}
      return res.telemetry;
    }
    try {
      const cached = localStorage.getItem("physix_telemetry_stats");
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return null;
  },

  async recordLaunch(userId = "guest", { v0, angleDeg, h0, g }) {
    const res = await fetchJson(`${API_BASE}/telemetry/launch`, {
      method: "POST",
      body: JSON.stringify({ userId, v0, angleDeg, h0, g })
    });
    return res && res.success ? res.telemetry : null;
  },

  async recordFlightComplete(userId = "guest", flightData) {
    const res = await fetchJson(`${API_BASE}/telemetry/flight-complete`, {
      method: "POST",
      body: JSON.stringify({ userId, ...flightData })
    });
    return res && res.success ? res : null;
  },

  // Flight Logs
  async getFlightLogs(userId = "guest") {
    const res = await fetchJson(`${API_BASE}/telemetry/flight-logs/${userId}`);
    if (res && res.success && Array.isArray(res.flightLogs)) {
      try {
        localStorage.setItem("physix_flight_logs", JSON.stringify(res.flightLogs));
      } catch (e) {}
      return res.flightLogs;
    }
    try {
      const cached = localStorage.getItem("physix_flight_logs");
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [];
  },

  async clearFlightLogs(userId = "guest") {
    try {
      localStorage.setItem("physix_flight_logs", JSON.stringify([]));
    } catch (e) {}

    const res = await fetchJson(`${API_BASE}/telemetry/flight-logs/${userId}`, {
      method: "DELETE"
    });
    return res && res.success ? res.flightLogs : [];
  },

  // Observations Logbook
  async getObservations(userId = "guest") {
    const res = await fetchJson(`${API_BASE}/telemetry/observations?userId=${userId}`);
    if (res && res.success && Array.isArray(res.observations)) {
      try {
        localStorage.setItem("physix_observations", JSON.stringify(res.observations));
      } catch (e) {}
      return res.observations;
    }
    try {
      const cached = localStorage.getItem("physix_observations");
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [];
  },

  async addObservation(userId = "guest", observation) {
    const res = await fetchJson(`${API_BASE}/telemetry/observations`, {
      method: "POST",
      body: JSON.stringify({ userId, observation })
    });
    return res && res.success ? res.observations : null;
  },

  async clearObservations(userId = "guest") {
    try {
      localStorage.setItem("physix_observations", JSON.stringify([]));
    } catch (e) {}
    const res = await fetchJson(`${API_BASE}/telemetry/observations?userId=${userId}`, {
      method: "DELETE"
    });
    return res && res.success ? res.observations : [];
  },

  // XP & Challenges
  async addXp(userId = "guest", amount = 0, reason = "Challenge Complete") {
    const res = await fetchJson(`${API_BASE}/telemetry/xp`, {
      method: "POST",
      body: JSON.stringify({ userId, amount, reason })
    });
    return res && res.success ? res.bonusXp : null;
  },

  // Badges & Achievements
  async getBadges(userId = "guest") {
    const res = await fetchJson(`${API_BASE}/badges/${userId}`);
    if (res && res.success && Array.isArray(res.badges)) {
      try {
        localStorage.setItem("physix_unlocked_badges", JSON.stringify(res.badges));
      } catch (e) {}
      return res.badges;
    }
    try {
      const cached = localStorage.getItem("physix_unlocked_badges");
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [];
  },

  async unlockBadge(userId = "guest", badgeId) {
    const res = await fetchJson(`${API_BASE}/badges/unlock`, {
      method: "POST",
      body: JSON.stringify({ userId, badgeId })
    });
    return res && res.success ? res.badges : null;
  },

  // Quiz evaluation
  async submitQuiz(userId = "guest", userAnswers) {
    const res = await fetchJson(`${API_BASE}/quiz/submit`, {
      method: "POST",
      body: JSON.stringify({ userId, userAnswers })
    });
    return res && res.success ? res : null;
  },

  // Kinematics calculations
  async calculateKinematics({ v0, angleDeg, h0, g }) {
    const res = await fetchJson(`${API_BASE}/kinematics/calculate`, {
      method: "POST",
      body: JSON.stringify({ v0, angleDeg, h0, g })
    });
    return res && res.success ? res.results : null;
  },

  async checkTargetHit(userId = "guest", landXMeters, targetXMeters) {
    const res = await fetchJson(`${API_BASE}/kinematics/target-check`, {
      method: "POST",
      body: JSON.stringify({ userId, landXMeters, targetXMeters })
    });
    return res && res.success ? res : null;
  },

  // Vectra AI Physics Copilot
  async sendAiChat({ message, history = [], simulationContext = {} }) {
    const res = await fetchJson(`${API_BASE}/ai/chat`, {
      method: "POST",
      body: JSON.stringify({ message, history, simulationContext })
    });
    return res && res.success ? res : {
      success: true,
      name: "Vectra AI",
      reply: "### Vectra AI\nAnalyzing kinematics... Please ensure your Express server is connected on port 3001."
    };
  },

  async analyzeFlightWithAi({ flightData, simulationContext = {} }) {
    const res = await fetchJson(`${API_BASE}/ai/analyze-flight`, {
      method: "POST",
      body: JSON.stringify({ flightData, simulationContext })
    });
    return res && res.success ? res.analysis : null;
  },

  async getAiStatus() {
    const res = await fetchJson(`${API_BASE}/ai/status`);
    return res && res.status === "ready" ? res : null;
  }
};
