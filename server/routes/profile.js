import { Router } from "express";
import { store } from "../data/store.js";

const router = Router();

function handleGetProfile(req, res) {
  try {
    const userId = req.params.userId || req.query.userId || "guest";
    const profile = store.getProfile(userId);
    res.json({
      success: true,
      userId,
      profile
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Support both GET /api/profile and GET /api/profile/:userId
router.get("/", handleGetProfile);
router.get("/:userId", handleGetProfile);

// POST /api/profile - Save/Update profile dossier
router.post("/", (req, res) => {
  try {
    const { userId = "guest", profileData } = req.body;
    if (!profileData) {
      return res.status(400).json({ success: false, error: "profileData is required." });
    }

    const updatedProfile = store.saveProfile(userId, profileData);
    // Auto-unlock pioneer badge on profile update
    store.unlockBadge(userId, "badge-profile-saved");

    res.json({
      success: true,
      message: "Student profile dossier updated successfully.",
      userId,
      profile: updatedProfile
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
