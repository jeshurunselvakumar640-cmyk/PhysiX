import { Router } from "express";
import { store } from "../data/store.js";

const router = Router();

// POST /api/kinematics/calculate - Calculate theoretical kinematics parameters
router.post("/calculate", (req, res) => {
  try {
    const { v0 = 20, angleDeg = 45, h0 = 0, g = 9.8 } = req.body;

    const velocity = Number(v0);
    const angle = Number(angleDeg);
    const height = Number(h0);
    const gravity = Number(g);

    if (gravity <= 0.001) {
      return res.json({
        success: true,
        maxHeight: Infinity,
        totalRange: Infinity,
        timeOfFlight: Infinity,
        impactSpeed: velocity
      });
    }

    const rad = (angle * Math.PI) / 180;
    const v0x = velocity * Math.cos(rad);
    const v0y = velocity * Math.sin(rad);

    // T = (v0y + sqrt(v0y^2 + 2*g*h0)) / g
    const discriminant = v0y * v0y + 2 * gravity * height;
    const timeOfFlight = (v0y + Math.sqrt(Math.max(0, discriminant))) / gravity;

    // Max Height H = h0 + (v0y^2)/(2g)
    const maxHeight = height + (v0y * v0y) / (2 * gravity);

    // Total Range R = v0x * T
    const totalRange = v0x * timeOfFlight;

    // Impact Velocity vf = sqrt(v0^2 + 2*g*h0)
    const impactSpeed = Math.sqrt(velocity * velocity + 2 * gravity * height);

    res.json({
      success: true,
      parameters: { v0: velocity, angleDeg: angle, h0: height, g: gravity },
      results: {
        timeOfFlight: Number(timeOfFlight.toFixed(3)),
        totalRange: Number(totalRange.toFixed(3)),
        maxHeight: Number(maxHeight.toFixed(3)),
        impactSpeed: Number(impactSpeed.toFixed(3)),
        v0x: Number(v0x.toFixed(3)),
        v0y: Number(v0y.toFixed(3))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/kinematics/target-check - Check target hit & update target points
router.post("/target-check", (req, res) => {
  try {
    const { userId = "guest", landXMeters, targetXMeters } = req.body;
    const diff = Math.abs(Number(landXMeters) - Number(targetXMeters));

    let hitType = "miss";
    let points = 0;

    if (diff <= 1.5) {
      hitType = "bullseye";
      points = 100;
      store.unlockBadge(userId, "badge-target-hit");
    } else if (diff <= 3.5) {
      hitType = "near";
      points = 50;
      store.unlockBadge(userId, "badge-target-hit");
    }

    if (points > 0) {
      const stats = store.getTelemetry(userId);
      stats.targetHits = (stats.targetHits || 0) + 1;
      store.saveTelemetry(userId, stats);
    }

    res.json({
      success: true,
      hitType,
      points,
      diffMeters: Number(diff.toFixed(2))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
