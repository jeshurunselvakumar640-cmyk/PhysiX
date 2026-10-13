/**
 * PhysiX — Daily Login Streak Engine & Firebase Persistence
 * Manages daily calendar streaks, broken streak detection, milestone celebrations,
 * and dual Firebase Firestore / Express / LocalStorage persistence.
 * Configured timezone: Asia/Kolkata (IST, UTC+05:30).
 */

import { db, doc, getDoc, setDoc } from "./firebase.js";
import { api } from "./api.js";
import {
  showStreakLostAnimation,
  showStreakMilestoneAnimation
} from "./celebrations.js";
import { isCloudOperationAllowed } from "./user-data-service.js";

// Application timezone for streak tracking
export const STREAK_TIMEZONE = "Asia/Kolkata";

/**
 * Helper: Format any date into YYYY-MM-DD in the configured timezone (Asia/Kolkata).
 * Uses standard Intl.DateTimeFormat to avoid midnight/local/DST skew.
 */
export function getCalendarDateString(date = new Date(), timeZone = STREAK_TIMEZONE) {
  const d = (date instanceof Date && !isNaN(date.getTime()))
    ? date
    : (typeof date === "number" || typeof date === "string")
      ? new Date(date)
      : new Date();
  const safeDate = isNaN(d.getTime()) ? new Date() : d;

  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
    const parts = formatter.formatToParts(safeDate);
    const y = parts.find((p) => p.type === "year")?.value;
    const m = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    if (y && m && day) return `${y}-${m}-${day}`;
  } catch (err) {
    console.warn(`[Streak] Intl format failed for timezone ${timeZone}:`, err);
  }

  // Fallback: standard calendar components
  const year = safeDate.getFullYear();
  const month = String(safeDate.getMonth() + 1).padStart(2, "0");
  const day = String(safeDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Backward-compatible alias for existing callers
export function getLocalDateString(date = new Date()) {
  return getCalendarDateString(date, STREAK_TIMEZONE);
}

/**
 * Helper: Robustly parse and normalize any date input (ISO string, YYYY-MM-DD, timestamp, Date)
 * into a YYYY-MM-DD calendar date in Asia/Kolkata.
 */
export function normalizeToLocalDateString(input, timeZone = STREAK_TIMEZONE) {
  if (!input) return getCalendarDateString(new Date(), timeZone);

  if (input instanceof Date) {
    return isNaN(input.getTime())
      ? getCalendarDateString(new Date(), timeZone)
      : getCalendarDateString(input, timeZone);
  }

  if (typeof input === "number") {
    const d = new Date(input);
    return isNaN(d.getTime())
      ? getCalendarDateString(new Date(), timeZone)
      : getCalendarDateString(d, timeZone);
  }

  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return getCalendarDateString(new Date(), timeZone);

    // If pure YYYY-MM-DD calendar date, return directly
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    // Parse full ISO string or date representation into Asia/Kolkata calendar day
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return getCalendarDateString(parsed, timeZone);
    }

    // Fallback: match leading YYYY-MM-DD
    const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }

  return getCalendarDateString(new Date(), timeZone);
}

/**
 * Helper: Calculate calendar day difference between two dates safely across all timezones.
 * Uses pure UTC calendar arithmetic so that daylight-saving time and millisecond variations
 * never corrupt consecutive day counts.
 */
export function getDayDifference(dateStr1, dateStr2, timeZone = STREAK_TIMEZONE) {
  if (!dateStr1 || !dateStr2) return 0;
  const d1Str = normalizeToLocalDateString(dateStr1, timeZone);
  const d2Str = normalizeToLocalDateString(dateStr2, timeZone);
  if (d1Str === d2Str) return 0;

  const [y1, m1, day1] = d1Str.split("-").map(Number);
  const [y2, m2, day2] = d2Str.split("-").map(Number);

  // Pure UTC calendar timestamps - exactly 86,400,000 ms per UTC day without DST transitions
  const utc1 = Date.UTC(y1, m1 - 1, day1);
  const utc2 = Date.UTC(y2, m2 - 1, day2);

  return Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

/**
 * Helper: Check if two dates represent consecutive calendar days (nextDate is d1 + 1 day).
 */
export function isConsecutiveCalendarDay(prevDateStr, nextDateStr, timeZone = STREAK_TIMEZONE) {
  return getDayDifference(prevDateStr, nextDateStr, timeZone) === 1;
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
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        const currentStreak = Number(parsed.currentStreak) || 0;
        const highestStreak = Number(parsed.highestStreak) || currentStreak || 0;
        const activityDates = Array.isArray(parsed.activityDates)
          ? Array.from(new Set(parsed.activityDates.filter(Boolean)))
          : [];
        return {
          currentStreak,
          highestStreak,
          lastLoginDate: parsed.lastLoginDate ? normalizeToLocalDateString(parsed.lastLoginDate) : null,
          lastBrokenStreak: Number(parsed.lastBrokenStreak) || 0,
          lastBrokenDate: parsed.lastBrokenDate ? normalizeToLocalDateString(parsed.lastBrokenDate) : null,
          activityDates,
          pendingSync: Boolean(parsed.pendingSync)
        };
      }
    }
  } catch (e) {
    console.warn("[Streak] Error reading local streak:", e);
  }
  return {
    currentStreak: 0,
    highestStreak: 0,
    lastLoginDate: null,
    lastBrokenStreak: 0,
    lastBrokenDate: null,
    activityDates: [],
    pendingSync: false
  };
}

// Save Streak data locally
export function saveStoredUserStreak(userId = "guest", streakData) {
  try {
    const todayStr = getCalendarDateString();
    const lastLogin = streakData.lastLoginDate ? normalizeToLocalDateString(streakData.lastLoginDate) : todayStr;
    const currentStreak = Number(streakData.currentStreak) || 0;
    const highestStreak = Math.max(Number(streakData.highestStreak) || 0, currentStreak);

    // Maintain recent activity dates history (unique sorted list, capped to last 60 days)
    const existingDates = Array.isArray(streakData.activityDates) ? streakData.activityDates : [];
    const dateSet = new Set(existingDates);
    if (lastLogin) dateSet.add(lastLogin);
    const activityDates = Array.from(dateSet).sort().slice(-60);

    const safeData = {
      currentStreak,
      highestStreak,
      lastLoginDate: lastLogin,
      lastBrokenStreak: Number(streakData.lastBrokenStreak) || 0,
      lastBrokenDate: streakData.lastBrokenDate ? normalizeToLocalDateString(streakData.lastBrokenDate) : null,
      activityDates,
      pendingSync: Boolean(streakData.pendingSync)
    };
    localStorage.setItem(getStreakStorageKey(userId), JSON.stringify(safeData));
  } catch (e) {
    console.warn("[Streak] Error saving local streak:", e);
  }
}

// Sync Streak with Firebase Firestore & track user email
export async function syncStreakWithFirebase(user, streakData) {
  if (!user || !user.uid || user.uid === "guest") return;

  // Guard: Queue sync when offline
  if (!navigator.onLine || !isCloudOperationAllowed()) {
    console.log("[Streak] Offline mode: Streak queued for cloud synchronization once back online");
    saveStoredUserStreak(user.uid, {
      ...streakData,
      pendingSync: true
    });
    return;
  }

  const cleanLastLogin = normalizeToLocalDateString(streakData.lastLoginDate || new Date());
  const currentStreak = Number(streakData.currentStreak) || 0;
  const highestStreak = Math.max(Number(streakData.highestStreak) || 0, currentStreak);
  const now = new Date().toISOString();

  const payload = {
    email: user.email || "",
    uid: user.uid,
    streak: currentStreak,
    highestStreak,
    lastLoginDate: cleanLastLogin,
    lastActiveDate: now,
    authProvider: user.providerData?.[0]?.providerId || "password",
    updatedAt: now
  };

  // 1. Sync to Firebase Firestore
  if (db) {
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        streak: payload.streak,
        highestStreak: payload.highestStreak,
        lastLoginDate: payload.lastLoginDate,
        lastActiveDate: payload.lastActiveDate,
        updatedAt: payload.updatedAt
      }, { merge: true });

      // Mark local copy as successfully synchronized
      saveStoredUserStreak(user.uid, {
        ...streakData,
        pendingSync: false
      });
    } catch (err) {
      console.warn("[Firebase] Firestore streak sync notice:", err.message);
      // Mark as pendingSync so next attempt will synchronize
      saveStoredUserStreak(user.uid, {
        ...streakData,
        pendingSync: true
      });
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

// Fetch Streak from Firebase Firestore / Express Backend on login
export async function fetchStreakFromFirebase(user) {
  if (!user || !user.uid || user.uid === "guest") return null;

  // Guard: Skip cloud fetch when offline
  if (!navigator.onLine || !isCloudOperationAllowed()) {
    console.log("[Streak] Offline mode: Skipping Firebase streak fetch");
    return null;
  }

  // 1. Try Firebase Firestore
  if (db) {
    try {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data && (data.streak !== undefined || data.lastActiveDate || data.lastLoginDate)) {
          const rawDate = data.lastLoginDate || data.lastActiveDate || null;
          const currentStreak = Number(data.streak) || 0;
          const highestStreak = Math.max(Number(data.highestStreak) || 0, currentStreak);
          return {
            currentStreak,
            highestStreak,
            lastLoginDate: rawDate ? normalizeToLocalDateString(rawDate) : null
          };
        }
      }
    } catch (err) {
      console.warn("[Firebase] Could not fetch Firestore streak:", err.message);
      throw err; // Propagate so caller knows it was an error, not an empty record
    }
  }

  // 2. Express Backend Fallback
  try {
    const res = await api.getProfile(user.uid);
    if (res && res.profile && (res.profile.streak !== undefined || res.profile.lastLoginDate)) {
      const rawDate = res.profile.lastLoginDate || res.profile.updatedAt || null;
      const currentStreak = Number(res.profile.streak) || 0;
      const highestStreak = Math.max(Number(res.profile.highestStreak) || 0, currentStreak);
      return {
        currentStreak,
        highestStreak,
        lastLoginDate: rawDate ? normalizeToLocalDateString(rawDate) : null
      };
    }
  } catch (err) {}

  return null;
}

// Lock to prevent concurrent execution of streak updates per user
const activeStreakProcessings = new Map();

/**
 * Process Daily User Streak on Login / Auth Transition / Daily Activity
 * Handles daily increments, broken streaks, and milestone animations.
 * Completely idempotent within the same calendar day (Asia/Kolkata).
 */
export async function processUserDailyStreak(user) {
  const userId = user ? user.uid : "guest";
  if (activeStreakProcessings.has(userId)) {
    return activeStreakProcessings.get(userId);
  }

  const promise = (async () => {
    try {
      const userId = user ? user.uid : "guest";
      const userEmail = user ? (user.email || user.displayName || "PhysiX Scholar") : "Guest User";
      const todayStr = getCalendarDateString();

      // Read local stored data
      let stored = getStoredUserStreak(userId);
      if (stored && stored.lastLoginDate) {
        stored.lastLoginDate = normalizeToLocalDateString(stored.lastLoginDate);
      }

      const isOffline = !navigator.onLine || !isCloudOperationAllowed();

      // If user is authenticated and online, reconcile with Firestore
      if (user && db && !isOffline) {
        try {
          const remoteData = await fetchStreakFromFirebase(user);
          if (remoteData) {
            const remoteDate = remoteData.lastLoginDate ? normalizeToLocalDateString(remoteData.lastLoginDate) : null;
            const storedDate = stored.lastLoginDate ? normalizeToLocalDateString(stored.lastLoginDate) : null;

            const bestHighest = Math.max(
              Number(remoteData.highestStreak) || 0,
              Number(stored.highestStreak) || 0,
              Number(remoteData.currentStreak) || 0,
              Number(stored.currentStreak) || 0
            );

            let mergedStreak = stored.currentStreak;
            let mergedLastLogin = storedDate;

            if (storedDate && remoteDate) {
              const dateDiff = getDayDifference(storedDate, remoteDate);
              if (dateDiff > 0) {
                // Remote date is more recent (activity occurred on another device)
                mergedLastLogin = remoteDate;
                mergedStreak = remoteData.currentStreak;
              } else if (dateDiff < 0) {
                // Stored date is more recent (local offline activity not yet in cloud)
                mergedLastLogin = storedDate;
                mergedStreak = stored.currentStreak;
              } else {
                // Both dates are identical: pick higher streak
                mergedLastLogin = storedDate;
                mergedStreak = Math.max(remoteData.currentStreak, stored.currentStreak);
              }
            } else if (remoteDate) {
              mergedLastLogin = remoteDate;
              mergedStreak = remoteData.currentStreak;
            } else if (storedDate) {
              mergedLastLogin = storedDate;
              mergedStreak = stored.currentStreak;
            } else {
              mergedStreak = Math.max(remoteData.currentStreak, stored.currentStreak);
            }

            stored = {
              ...stored,
              currentStreak: mergedStreak,
              highestStreak: bestHighest,
              lastLoginDate: mergedLastLogin
            };
          }
        } catch (fetchErr) {
          // Network or Firestore failure: DO NOT break streak!
          console.warn("[Streak] Cloud fetch encountered temporary error; preserving local streak:", fetchErr);
          // Flag for sync later
          stored.pendingSync = true;
        }
      }

      const { lastLoginDate, currentStreak = 0, highestStreak = 0 } = stored;

      // Case 1: First ever activity or uninitialized streak
      if (!lastLoginDate || currentStreak === 0) {
        const newStreakData = {
          currentStreak: 1,
          highestStreak: Math.max(highestStreak, 1),
          lastLoginDate: todayStr,
          lastBrokenStreak: 0,
          lastBrokenDate: null,
          pendingSync: isOffline,
          activityDates: [todayStr]
        };
        saveStoredUserStreak(userId, newStreakData);
        if (!isOffline) {
          syncStreakWithFirebase(user, newStreakData);
        }
        return { ...newStreakData, status: "initial", changed: true, offline: isOffline };
      }

      // Calculate calendar day difference in Asia/Kolkata
      const diffDays = getDayDifference(lastLoginDate, todayStr);

      // Case 2: Same calendar day activity (streak preserved, idempotent)
      if (diffDays === 0) {
        const newStreakData = {
          ...stored,
          currentStreak: Math.max(1, currentStreak),
          highestStreak: Math.max(highestStreak, currentStreak, 1),
          lastLoginDate: todayStr
        };
        saveStoredUserStreak(userId, newStreakData);
        if (!isOffline && (stored.pendingSync || user)) {
          syncStreakWithFirebase(user, newStreakData);
        }
        return { ...newStreakData, status: "same_day", changed: false, offline: isOffline };
      }

      // Case 3: Exactly 1 calendar day passed (Streak Maintained & Incremented!)
      if (diffDays === 1) {
        const nextStreak = currentStreak + 1;
        const nextHighest = Math.max(highestStreak, nextStreak);
        const newStreakData = {
          ...stored,
          currentStreak: nextStreak,
          highestStreak: nextHighest,
          lastLoginDate: todayStr,
          lastBrokenStreak: 0,
          lastBrokenDate: null,
          pendingSync: isOffline
        };

        saveStoredUserStreak(userId, newStreakData);
        if (!isOffline) {
          syncStreakWithFirebase(user, newStreakData);
        }

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

        return { ...newStreakData, status: "incremented", changed: true, offline: isOffline };
      }

      // Case 4: Missed one or more calendar days (diffDays > 1) -> Streak Lost!
      if (diffDays > 1) {
        const lostStreakCount = currentStreak;
        const newStreakData = {
          ...stored,
          currentStreak: 1,
          highestStreak: Math.max(highestStreak, 1),
          lastLoginDate: todayStr,
          lastBrokenStreak: lostStreakCount,
          lastBrokenDate: todayStr,
          pendingSync: isOffline
        };

        saveStoredUserStreak(userId, newStreakData);
        if (!isOffline) {
          syncStreakWithFirebase(user, newStreakData);
        }

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

        return { ...newStreakData, status: "broken", lostStreak: lostStreakCount, changed: true, offline: isOffline };
      }

      // Fallback for clock skew (diffDays < 0): preserve streak
      return { ...stored, status: "unchanged", changed: false, offline: isOffline };
    } finally {
      activeStreakProcessings.delete(userId);
    }
  })();

  activeStreakProcessings.set(userId, promise);
  return promise;
}


