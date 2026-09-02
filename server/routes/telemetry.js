import { Router } from "express";
import { store } from "../data/store.js";

const router = Router();

function handleGetTelemetry(req, res) {
  try {
    const userId = req.params.userId || req.query.userId || "guest";
    const telemetry = store.getTelemetry(userId);
    const flightLogs = store.getFlightLogs(userId);
    res.json({
      success: true,
      userId,
      telemetry,
      flightLogsCount: flightLogs.length
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// POST /api/telemetry/launch - Record a trajectory launch
router.post("/launch", (req, res) => {
  try {
    const { userId = "guest", v0, angleDeg, h0, g } = req.body;
    const stats = store.getTelemetry(userId);

    stats.totalLaunches = (stats.totalLaunches || 0) + 1;
    stats.maxVelocity = Math.max(stats.maxVelocity || 0, Number(v0) || 0);

    if (!stats.planetsUsed) stats.planetsUsed = {};
    const gravityVal = Number(g) || 9.8;
    if (Math.abs(gravityVal - 1.6) < 0.1) stats.planetsUsed["Moon"] = (stats.planetsUsed["Moon"] || 0) + 1;
    else if (Math.abs(gravityVal - 3.7) < 0.1) stats.planetsUsed["Mars"] = (stats.planetsUsed["Mars"] || 0) + 1;
    else if (Math.abs(gravityVal - 9.8) < 0.1) stats.planetsUsed["Earth"] = (stats.planetsUsed["Earth"] || 0) + 1;
    else if (Math.abs(gravityVal - 24.8) < 0.1) stats.planetsUsed["Jupiter"] = (stats.planetsUsed["Jupiter"] || 0) + 1;

    // Check achievements
    if (Number(v0) >= 40.0) store.unlockBadge(userId, "badge-high-velocity");
    if (Math.round(Number(angleDeg)) === 45) store.unlockBadge(userId, "badge-optimal-angle");
    if (Number(h0) >= 10.0) store.unlockBadge(userId, "badge-high-platform");

    const uniquePlanets = Object.keys(stats.planetsUsed).filter(p => stats.planetsUsed[p] > 0);
    if (uniquePlanets.length >= 4) store.unlockBadge(userId, "badge-multi-planet");

    const updatedStats = store.saveTelemetry(userId, stats);
    res.json({
      success: true,
      message: "Launch telemetry recorded.",
      userId,
      telemetry: updatedStats
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/telemetry/flight-complete - Record landing telemetry & save flight log
router.post("/flight-complete", (req, res) => {
  try {
    const { userId = "guest", angle, v0, h0, g, range, apex, airtime } = req.body;
    const stats = store.getTelemetry(userId);

    const flightAirtime = Number(airtime) || 0;
    const groundRange = Number(range) || 0;
    const peakApex = Number(apex) || 0;

    stats.totalAirtime = (stats.totalAirtime || 0) + flightAirtime;
    stats.maxRange = Math.max(stats.maxRange || 0, groundRange);
    stats.maxHeight = Math.max(stats.maxHeight || 0, peakApex);

    if (flightAirtime >= 5.0) store.unlockBadge(userId, "badge-long-airtime");

    store.saveTelemetry(userId, stats);

    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];
    const logEntry = {
      time: timeStr,
      angle: Number(angle),
      v0: Number(v0),
      h0: Number(h0),
      g: Number(g),
      range: groundRange,
      apex: peakApex,
      airtime: flightAirtime
    };

    const updatedLogs = store.addFlightLog(userId, logEntry);

    res.json({
      success: true,
      message: "Flight completed & recorded to dossier logs.",
      userId,
      telemetry: stats,
      newLog: logEntry,
      flightLogs: updatedLogs
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

function handleGetFlightLogs(req, res) {
  try {
    const userId = req.params.userId || req.query.userId || "guest";
    const logs = store.getFlightLogs(userId);
    res.json({
      success: true,
      userId,
      count: logs.length,
      flightLogs: logs
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

function handleDeleteFlightLogs(req, res) {
  try {
    const userId = req.params.userId || req.query.userId || "guest";
    const cleared = store.clearFlightLogs(userId);
    res.json({
      success: true,
      message: "Flight records cleared.",
      userId,
      flightLogs: cleared
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// GET /api/telemetry/flight-logs and /flight-logs/:userId
router.get("/flight-logs", handleGetFlightLogs);
router.get("/flight-logs/:userId", handleGetFlightLogs);

// DELETE /api/telemetry/flight-logs and /flight-logs/:userId
router.delete("/flight-logs", handleDeleteFlightLogs);
router.delete("/flight-logs/:userId", handleDeleteFlightLogs);

// Observations Routes
router.get("/observations", (req, res) => {
  try {
    const userId = req.params.userId || req.query.userId || "guest";
    const observations = store.getObservations(userId);
    res.json({ success: true, userId, count: observations.length, observations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/observations", (req, res) => {
  try {
    const { userId = "guest", observation } = req.body;
    const updated = store.addObservation(userId, observation);
    res.json({ success: true, message: "Observation recorded.", userId, observations: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/observations", (req, res) => {
  try {
    const userId = req.params.userId || req.query.userId || "guest";
    const cleared = store.clearObservations(userId);
    res.json({ success: true, message: "Observations cleared.", userId, observations: cleared });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// XP Routes
router.post("/xp", (req, res) => {
  try {
    const { userId = "guest", amount = 0, reason = "Challenge Complete" } = req.body;
    const totalBonusXp = store.addBonusXp(userId, amount);
    res.json({ success: true, message: `Awarded ${amount} XP for ${reason}`, userId, bonusXp: totalBonusXp });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/telemetry and /api/telemetry/:userId
router.get("/", handleGetTelemetry);
router.get("/:userId", handleGetTelemetry);

export default router;
