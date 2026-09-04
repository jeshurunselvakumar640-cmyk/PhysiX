/**
 * PhysiX — Daily Login Streak Engine & Firebase Email Tracking
 * Manages daily calendar streaks, broken streak detection, milestone celebrations,
 * and dual Firebase Firestore / Express / LocalStorage persistence.
 */

import { db, doc, getDoc, setDoc } from "./firebase.js";
import { api } from "./api.js";
import {
  showStreakLostAnimation,
  showStreakMilestoneAnimation
} from "./celebrations.js";

// Helper: Format date to local YYYY-MM-DD
export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper: Calculate calendar day difference between two YYYY-MM-DD dates
export function getDayDifference(dateStr1, dateStr2) {
  if (!dateStr1 || !dateStr2) return 0;
  const d1 = new Date(dateStr1 + "T00:00:00");
  const d2 = new Date(dateStr2 + "T00:00:00");
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// Helper: Check if streak day count matches milestone criteria (10, 50, 100, 200, 300, 400, etc.)
export function isStreakMilestone(streak) {
  if (!streak || streak < 10) return false;
  if (streak === 10 || streak === 50) return true;
  if (streak >= 100 && streak % 100 === 0) return true;
  return false;
}

// Helper: Compute next milestone target
export function getNextStreakMilestone(currentStreak = 1) {
  if (currentStreak < 10) return 10;
  if (currentStreak < 50) return 50;
  if (currentStreak < 100) return 100;
  return Math.ceil((currentStreak + 1) / 100) * 100;
}

// Local Storage Fallback Key
function getStreakStorageKey(userId = "guest") {
  return `physix_user_streak_${userId}`;
}

// Read Streak data locally
export function getStoredUserStreak(userId = "guest") {
  try {
    const raw = localStorage.getItem(getStreakStorageKey(userId));
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("[Streak] Error reading local streak:", e);
  }
  return {
    currentStreak: 0,
    highestStreak: 0,
    lastLoginDate: null,
    lastBrokenStreak: 0,
    lastBrokenDate: null
  };
}

// Save Streak data locally
export function saveStoredUserStreak(userId = "guest", streakData) {
  try {
    localStorage.setItem(getStreakStorageKey(userId), JSON.stringify(streakData));
  } catch (e) {
    console.warn("[Streak] Error saving local streak:", e);
  }
}

// Sync Streak with Firebase Firestore & track user email
export async function syncStreakWithFirebase(user, streakData) {
  if (!user || !user.uid) return;

  const payload = {
    email: user.email || "",
    uid: user.uid,
    streak: streakData.currentStreak || 0,
    highestStreak: streakData.highestStreak || 0,
    lastLoginDate: streakData.lastLoginDate || getLocalDateString(),
    lastSeenAt: new Date().toISOString(),
    authProvider: user.providerData?.[0]?.providerId || "password",
    updatedAt: new Date().toISOString()
  };

  // 1. Sync to Firebase Firestore
  if (db) {
    try {
      const userRef = doc(db, "physix_users", user.uid);
      await setDoc(userRef, { tracking: payload }, { merge: true });
    } catch (err) {
      // If Firestore rules or offline, fallback smoothly
      console.warn("[Firebase] Firestore streak sync notice:", err.message);
    }
  }

  // 2. Sync to Express Backend
  try {
    await api.saveProfile(user.uid, {
      email: user.email,
      streak: payload.streak,
      highestStreak: payload.highestStreak,
      lastLoginDate: payload.lastLoginDate
    });
  } catch (err) {}
}

// Fetch Streak from Firebase Firestore on login
export async function fetchStreakFromFirebase(user) {
  if (!user || !user.uid || !db) return null;
  try {
    const userRef = doc(db, "physix_users", user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data && data.tracking) {
        return {
          currentStreak: data.tracking.streak || 0,
          highestStreak: data.tracking.highestStreak || 0,
          lastLoginDate: data.tracking.lastLoginDate || null
        };
      }
    }
  } catch (err) {
    console.warn("[Firebase] Could not fetch Firestore streak:", err.message);
  }
  return null;
}

/**
 * Process Daily User Streak on Login / Auth Transition
 * Handles daily increments, broken streaks, and milestone animations.
 */
export async function processUserDailyStreak(user) {
  const userId = user ? user.uid : "guest";
  const userEmail = user ? user.email : "Guest User";
  const todayStr = getLocalDateString();

  // Try reading remote Firebase data first if authenticated
  let stored = getStoredUserStreak(userId);
  if (user && db) {
    try {
      const remoteData = await fetchStreakFromFirebase(user);
      if (remoteData && remoteData.lastLoginDate) {
        // Use latest record
        if (remoteData.currentStreak >= stored.currentStreak) {
          stored = { ...stored, ...remoteData };
        }
      }
    } catch (e) {}
  }

  const { lastLoginDate, currentStreak = 0, highestStreak = 0 } = stored;

  // Case 1: First ever login or uninitialized streak
  if (!lastLoginDate || currentStreak === 0) {
    const newStreakData = {
      currentStreak: 1,
      highestStreak: Math.max(highestStreak, 1),
      lastLoginDate: todayStr,
      lastBrokenStreak: 0,
      lastBrokenDate: null
    };
    saveStoredUserStreak(userId, newStreakData);
    syncStreakWithFirebase(user, newStreakData);
    return { ...newStreakData, status: "initial", changed: true };
  }

  // Calculate day difference
  const diffDays = getDayDifference(lastLoginDate, todayStr);

  // Case 2: Same calendar day login (streak preserved, no repeat animation)
  if (diffDays === 0) {
    const newStreakData = {
      ...stored,
      currentStreak: Math.max(1, currentStreak),
      highestStreak: Math.max(highestStreak, currentStreak, 1),
      lastLoginDate: todayStr
    };
    saveStoredUserStreak(userId, newStreakData);
    syncStreakWithFirebase(user, newStreakData);
    return { ...newStreakData, status: "same_day", changed: false };
  }

  // Case 3: Exactly 1 calendar day passed (Streak Maintained & Incremented!)
  if (diffDays === 1) {
    const nextStreak = currentStreak + 1;
    const nextHighest = Math.max(highestStreak, nextStreak);
    const newStreakData = {
      currentStreak: nextStreak,
      highestStreak: nextHighest,
      lastLoginDate: todayStr,
      lastBrokenStreak: 0,
      lastBrokenDate: null
    };

    saveStoredUserStreak(userId, newStreakData);
    syncStreakWithFirebase(user, newStreakData);

    // Check if user reached a milestone (10, 50, 100, 200, 300, 400, etc.)
    if (isStreakMilestone(nextStreak)) {
      setTimeout(() => {
        showStreakMilestoneAnimation({
          streakDays: nextStreak,
          highestStreak: nextHighest,
          email: userEmail
        });
      }, 500);
    }

    return { ...newStreakData, status: "incremented", changed: true };
  }

  // Case 4: Missed one or more days (diffDays > 1) -> Streak Lost!
  if (diffDays > 1) {
    const lostStreakCount = currentStreak;
    const newStreakData = {
      currentStreak: 1,
      highestStreak: Math.max(highestStreak, 1),
      lastLoginDate: todayStr,
      lastBrokenStreak: lostStreakCount,
      lastBrokenDate: todayStr
    };

    saveStoredUserStreak(userId, newStreakData);
    syncStreakWithFirebase(user, newStreakData);

    // Trigger Streak Lost Animation if previous streak was 1 or higher
    if (lostStreakCount >= 1) {
      setTimeout(() => {
        showStreakLostAnimation({
          lostStreak: lostStreakCount,
          newStreak: 1,
          email: userEmail
        });
      }, 500);
    }

    return { ...newStreakData, status: "broken", lostStreak: lostStreakCount, changed: true };
  }

  // Fallback for clock skew (diffDays < 0)
  return { ...stored, status: "unchanged", changed: false };
}
