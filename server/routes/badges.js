import { Router } from "express";
import { store } from "../data/store.js";

const router = Router();

function handleGetBadges(req, res) {
  try {
    const userId = req.params.userId || req.query.userId || "guest";
    const badges = store.getBadges(userId);
    res.json({
      success: true,
      userId,
      count: badges.length,
      badges
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// GET /api/badges and /api/badges/:userId
router.get("/", handleGetBadges);
router.get("/:userId", handleGetBadges);

// POST /api/badges/unlock - Unlock a badge
router.post("/unlock", (req, res) => {
  try {
    const { userId = "guest", badgeId } = req.body;
    if (!badgeId) {
      return res.status(400).json({ success: false, error: "badgeId is required." });
    }
    const badges = store.unlockBadge(userId, badgeId);
    res.json({
      success: true,
      message: `Badge ${badgeId} unlocked.`,
      userId,
      badges
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
