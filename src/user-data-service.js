/**
 * PhysiX — Comprehensive Firestore User & Subcollections Data Service
 * 
 * Database Schema:
 * users
 *  └── {uid}
 *       ├── name
 *       ├── email
 *       ├── totalXP
 *       ├── level
 *       ├── streak
 *       ├── lastActiveDate
 *       ├── experimentsPerformed
 *       ├── quizzesAttempted
 *       ├── quizzesCompleted
 *       ├── totalQuizScore
 *       ├── bestQuizScore
 *       ├── createdAt
 *       └── updatedAt
 * 
 *       experiments (subcollection)
 *        └── {experimentId}
 *             ├── experimentName
 *             ├── attempts
 *             ├── completed
 *             ├── bestScore
 *             ├── xpEarned
 *             └── lastPerformed
 * 
 *       quizAttempts (subcollection)
 *        └── {attemptId}
 *             ├── quizId
 *             ├── score
 *             ├── totalQuestions
 *             ├── percentage
 *             ├── xpEarned
 *             └── attemptedAt
 */

import {
  db,
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  orderBy,
  limit,
  increment,
  arrayUnion,
  onSnapshot,
  runTransaction
} from "./firebase.js";

/**
 * Network status check for offline protection
 * Uses navigator.onLine as fast path; can be overridden by offline-manager for more accuracy
 */
let _networkStatusOverride = null;
export function setNetworkStatusOverride(fn) {
  _networkStatusOverride = fn;
}

export function isCloudOperationAllowed() {
  if (_networkStatusOverride) {
    return _networkStatusOverride();
  }
  // Fast path: browser's online status
  return navigator.onLine;
}

/**
 * Standard Progressive Doubling Level Calculation from Authoritative XP.
 * Preserves the exact PhysiX formula:
 * Level 1: 0 -> 1000 XP
 * Level 2: 1000 -> 3000 XP (delta: 2000)
 * Level 3: 3000 -> 7000 XP (delta: 4000)
 * Level 4: 7000 -> 15000 XP (delta: 8000)
 * Level 5: 15000 -> 31000 XP (delta: 16000)
 * Level 6: 31000 -> 63000 XP (delta: 32000)
 */
export function calculateRankFromXp(totalScore = 0) {
  const score = Math.max(0, Number(totalScore) || 0);
  let level = 1;
  let currentThreshold = 0;
  let currentDelta = 1000;
  let nextThreshold = 1000;

  while (score >= nextThreshold) {
    level++;
    currentThreshold = nextThreshold;
    currentDelta = currentDelta * 2;
    nextThreshold = currentThreshold + currentDelta;
  }

  const xpInLevel = score - currentThreshold;
  const xpNeededForNext = nextThreshold - currentThreshold;
  const progressPct = Math.min(100, Math.max(0, (xpInLevel / xpNeededForNext) * 100));

  const rankTitles = [
    "Newtonian Novice",
    "Galilean Scholar",
    "Kinetic Specialist",
    "Orbital Dynamist",
    "Waveguide Optician",
    "Quantum Luminary",
    "Grand Astrophysics Virtuoso"
  ];
  const rank = rankTitles[Math.min(level - 1, rankTitles.length - 1)];

  return {
    level,
    rank,
    title: `Level ${level} • ${rank}`,
    totalXp: score,
    currentThreshold,
    nextThreshold,
    xpInLevel,
    xpNeededForNext,
    progressPct
  };
}

/**
 * Initialize or update the user document in Firestore users/{uid}
 * Firestore is the single source of truth for totalXP and level.
 */
export async function syncUserToFirestore(user, customData = {}) {
  if (!user || !user.uid || !db) return null;
  if (!isCloudOperationAllowed()) {
    console.log("[Firestore] Offline mode: Skipping syncUserToFirestore");
    return null;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    const now = new Date().toISOString();

    const name = customData.name || user.displayName || (user.email ? user.email.split("@")[0] : "PhysiX Scholar");
    const email = user.email || "";
    const photoURL = user.photoURL || customData.photoURL || null;

    if (!snap.exists()) {
      // Create initial document matching schema
      const initialXp = typeof customData.totalXP === "number" ? Math.max(0, customData.totalXP) : 0;
      const rankInfo = calculateRankFromXp(initialXp);

      const initialDoc = {
        name,
        email,
        photoURL,
        totalXP: initialXp,
        level: rankInfo.level,
        streak: customData.streak || 1,
        highestStreak: Math.max(customData.highestStreak || 0, customData.streak || 1),
        lastLoginDate: customData.lastLoginDate || null,
        lastActiveDate: now,
        experimentsPerformed: customData.experimentsPerformed || 0,
        quizzesAttempted: customData.quizzesAttempted || 0,
        quizzesCompleted: customData.quizzesCompleted || 0,
        totalQuizScore: customData.totalQuizScore || 0,
        bestQuizScore: customData.bestQuizScore || 0,
        badges: Array.isArray(customData.badges) ? Array.from(new Set(customData.badges)) : [],
        completedChallenges: Array.isArray(customData.completedChallenges) ? Array.from(new Set(customData.completedChallenges)) : [],
        createdAt: now,
        updatedAt: now,
        ...(customData.extra || {})
      };

      await setDoc(userRef, initialDoc);
      console.log(`%c[Firestore] ✓ Successfully created new user document: users/${user.uid}`, "color: #10b981; font-weight: bold;");
      return initialDoc;
    } else {
      // Update existing document
      const current = snap.data();
      const updates = {
        name: customData.name || user.displayName || current.name || name,
        email: email || current.email,
        photoURL: user.photoURL !== undefined ? (user.photoURL || null) : (customData.photoURL !== undefined ? (customData.photoURL || null) : (current.photoURL || null)),
        lastActiveDate: now,
        updatedAt: now
      };

      // Authoritative XP rule:
      // Existing Firestore XP is ALWAYS preserved as the single source of truth.
      // A lower or stale local device XP MUST NEVER downgrade or overwrite Firestore.
      const currentCloudXp = typeof current.totalXP === "number" ? current.totalXP : (typeof current.xp === "number" ? current.xp : 0);
      const incomingXp = typeof customData.totalXP === "number" ? customData.totalXP : 0;
      const targetXp = Math.max(currentCloudXp, incomingXp);

      updates.totalXP = targetXp;
      // Derived authoritative level strictly calculated from authoritative totalXP
      updates.level = calculateRankFromXp(targetXp).level;

      // Authoritative Streak preservation:
      // Existing Firestore streak and highestStreak MUST NEVER be blindly overwritten or downgraded by a stale write
      const currentStreak = Number(current.streak) || 0;
      const incomingStreak = typeof customData.streak === "number" ? customData.streak : currentStreak;
      const currentHighest = Math.max(Number(current.highestStreak) || 0, currentStreak);
      const incomingHighest = typeof customData.highestStreak === "number" ? customData.highestStreak : 0;

      updates.highestStreak = Math.max(currentHighest, incomingHighest, incomingStreak);

      if (typeof customData.streak === "number") {
        const currentLoginDate = current.lastLoginDate || null;
        const incomingLoginDate = customData.lastLoginDate || null;
        if (incomingLoginDate && (!currentLoginDate || incomingLoginDate >= currentLoginDate)) {
          updates.streak = customData.streak;
          updates.lastLoginDate = incomingLoginDate;
        } else if (incomingStreak >= currentStreak) {
          updates.streak = incomingStreak;
          if (incomingLoginDate) updates.lastLoginDate = incomingLoginDate;
        } else {
          // Preserve valid existing streak
          updates.streak = currentStreak;
        }
      } else {
        updates.streak = currentStreak;
      }
      if (customData.lastLoginDate && !updates.lastLoginDate) {
        updates.lastLoginDate = customData.lastLoginDate;
      }
      // Never overwrite a higher Firestore experimentsPerformed with a lower local count
      if (typeof customData.experimentsPerformed === "number") {
        updates.experimentsPerformed = Math.max(current.experimentsPerformed || 0, customData.experimentsPerformed);
      }
      if (typeof customData.quizzesAttempted === "number") updates.quizzesAttempted = Math.max(current.quizzesAttempted || 0, customData.quizzesAttempted);
      if (typeof customData.quizzesCompleted === "number") updates.quizzesCompleted = Math.max(current.quizzesCompleted || 0, customData.quizzesCompleted);
      if (typeof customData.totalQuizScore === "number") updates.totalQuizScore = Math.max(current.totalQuizScore || 0, customData.totalQuizScore);
      if (typeof customData.bestQuizScore === "number") updates.bestQuizScore = Math.max(current.bestQuizScore || 0, customData.bestQuizScore);

      // Preserve existing badges and merge any new ones safely (never downgrade or overwrite with empty)
      if (Array.isArray(customData.badges)) {
        updates.badges = Array.from(new Set([...(current.badges || []), ...customData.badges]));
      }

      // Preserve existing completedChallenges and merge any new ones safely (never downgrade or overwrite with empty)
      if (Array.isArray(customData.completedChallenges)) {
        updates.completedChallenges = Array.from(new Set([...(current.completedChallenges || []), ...customData.completedChallenges]));
      }

      await setDoc(userRef, updates, { merge: true });
      console.log(`%c[Firestore] ✓ Successfully synced user document: users/${user.uid}`, "color: #10b981; font-weight: bold;");
      return { ...current, ...updates };
    }
  } catch (err) {
    console.error("[Firestore] syncUserToFirestore error:", err);
    return null;
  }
}

/**
 * Atomically and idempotently record a challenge completion in Firestore users/{uid}.
 * Guarantees that:
 * 1. Challenge ID is recorded in completedChallenges array exactly once.
 * 2. XP is awarded exactly once via authoritative atomic calculation.
 * 3. Associated badge (if provided) is unlocked in badges array exactly once.
 * 4. Concurrent race conditions from multiple tabs or devices are resolved safely via Firestore transaction.
 */
export async function recordChallengeCompletionInFirestore(uid, challengeId, xpAmount = 0, badgeId = null) {
  if (!uid || !db || uid === "guest" || !challengeId) return null;
  if (!isCloudOperationAllowed()) {
    console.log("[Firestore] Offline mode: Skipping recordChallengeCompletionInFirestore");
    return { alreadyCompleted: false, offline: true };
  }

  try {
    const userRef = doc(db, "users", uid);
    const xpToAdd = Math.max(0, Number(xpAmount) || 0);

    const result = await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(userRef);
      if (!snap.exists()) {
        console.warn(`[Firestore] User document users/${uid} does not exist for challenge completion.`);
        return null;
      }

      const currentData = snap.data();
      const existingChallenges = Array.isArray(currentData.completedChallenges) ? currentData.completedChallenges : [];
      
      // Idempotency check: check if already completed
      const isAlreadyCompleted = existingChallenges.includes(challengeId);
      if (isAlreadyCompleted) {
        console.log(`[Firestore] Challenge '${challengeId}' already completed for users/${uid}. Idempotent bypass.`);
        return {
          alreadyCompleted: true,
          totalXP: currentData.totalXP || 0,
          level: currentData.level || 1,
          completedChallenges: existingChallenges,
          badges: Array.isArray(currentData.badges) ? currentData.badges : []
        };
      }

      // Compute new values
      const currentXp = Number(currentData.totalXP) || 0;
      const newTotalXp = currentXp + xpToAdd;
      const rankInfo = calculateRankFromXp(newTotalXp);
      const updatedChallenges = [...existingChallenges, challengeId];
      
      const existingBadges = Array.isArray(currentData.badges) ? currentData.badges : [];
      let updatedBadges = existingBadges;
      if (badgeId && !existingBadges.includes(badgeId)) {
        updatedBadges = [...existingBadges, badgeId];
      }

      const now = new Date().toISOString();
      const updates = {
        completedChallenges: updatedChallenges,
        totalXP: newTotalXp,
        level: rankInfo.level,
        badges: updatedBadges,
        lastActiveDate: now,
        updatedAt: now
      };

      transaction.update(userRef, updates);

      console.log(`%c[Firestore] ✓ Challenge '${challengeId}' completed (+${xpToAdd} XP) in users/${uid}`, "color: #10b981; font-weight: bold;");

      return {
        alreadyCompleted: false,
        totalXP: newTotalXp,
        level: rankInfo.level,
        completedChallenges: updatedChallenges,
        badges: updatedBadges
      };
    });

    return result;
  } catch (err) {
    console.error(`[Firestore] recordChallengeCompletionInFirestore error for ${challengeId}:`, err);
    if (!isCloudOperationAllowed()) {
      return { alreadyCompleted: false, offline: true };
    }
    // Fallback: If transaction failed while online, use safe atomic setDoc
    try {
      const userRef = doc(db, "users", uid);
      const updates = {
        completedChallenges: arrayUnion(challengeId),
        updatedAt: new Date().toISOString()
      };
      if (badgeId) {
        updates.badges = arrayUnion(badgeId);
      }
      if (xpAmount > 0) {
        updates.totalXP = increment(xpAmount);
      }
      await setDoc(userRef, updates, { merge: true });
      return { alreadyCompleted: false, fallback: true };
    } catch (fbErr) {
      console.error("[Firestore] Fallback write error:", fbErr);
      return null;
    }
  }
}

/**
 * Atomically and idempotently unlock a badge in Firestore users/{uid}.badges
 */
export async function unlockBadgeInFirestore(uid, badgeId) {
  if (!uid || !db || uid === "guest" || !badgeId) return null;
  if (!isCloudOperationAllowed()) {
    console.log("[Firestore] Offline mode: Skipping unlockBadgeInFirestore");
    return { alreadyUnlocked: false, offline: true };
  }

  try {
    const userRef = doc(db, "users", uid);

    const result = await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(userRef);
      if (!snap.exists()) {
        console.warn(`[Firestore] User document users/${uid} does not exist yet.`);
        return null;
      }

      const currentData = snap.data();
      const existingBadges = Array.isArray(currentData.badges) ? currentData.badges : [];
      const isAlreadyUnlocked = existingBadges.includes(badgeId);

      if (isAlreadyUnlocked) {
        return { alreadyUnlocked: true, badges: existingBadges };
      }

      const updatedBadges = [...existingBadges, badgeId];
      const now = new Date().toISOString();
      transaction.update(userRef, {
        badges: arrayUnion(badgeId),
        updatedAt: now
      });

      console.log(`%c[Firestore] ✓ Firestore write successful: Badge '${badgeId}' persisted in users/${uid}`, "color: #10b981; font-weight: bold;");
      return { alreadyUnlocked: false, badges: updatedBadges };
    });

    return result;
  } catch (err) {
    console.error("[Firestore] unlockBadgeInFirestore error:", err);
    if (!isCloudOperationAllowed()) {
      return { alreadyUnlocked: false, offline: true };
    }
    try {
      const userRef = doc(db, "users", uid);
      await setDoc(userRef, {
        badges: arrayUnion(badgeId),
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return { alreadyUnlocked: false, fallback: true };
    } catch (fbErr) {
      return null;
    }
  }
}

/**
 * Record experiment open or activity in users/{uid}/experiments/{experimentId}
 * and atomically increment the parent user's experimentsPerformed count.
 */
export async function recordExperimentActivity(uid, experimentId, expData = {}) {
  if (!uid || !db || uid === "guest") return null;
  if (!isCloudOperationAllowed()) {
    console.log("[Firestore] Offline mode: Skipping recordExperimentActivity");
    return null;
  }

  try {
    const expDocRef = doc(db, "users", uid, "experiments", experimentId);
    const userRef = doc(db, "users", uid);
    const now = new Date().toISOString();

    console.log(`[Firestore] Before Firestore write: Incrementing activity count for ${experimentId}`);

    // Atomic increments in subcollection document
    await setDoc(expDocRef, {
      experimentName: expData.experimentName || getExperimentNameById(experimentId),
      attempts: increment(1),
      completed: Boolean(expData.completed || false),
      lastPerformed: now,
      ...(expData.bestScore !== undefined ? { bestScore: expData.bestScore } : {}),
      ...(expData.score !== undefined ? { bestScore: expData.score } : {}),
      ...(expData.xpEarned ? { xpEarned: increment(expData.xpEarned) } : {})
    }, { merge: true });

    // Atomic increment on parent user document
    const parentUpdates = {
      experimentsPerformed: increment(1),
      lastActiveDate: now,
      updatedAt: now
    };
    if (expData.xpEarned && Number(expData.xpEarned) > 0) {
      parentUpdates.totalXP = increment(Number(expData.xpEarned));
    }
    await setDoc(userRef, parentUpdates, { merge: true });

    console.log(`%c[Firestore] ✓ Firestore write successful: Recorded activity for users/${uid}/experiments/${experimentId}`, "color: #06b6d4; font-weight: bold;");

    // Read the authoritative updated document
    const userSnap = await getDoc(userRef);
    const expSnap = await getDoc(expDocRef);

    const userData = userSnap.exists() ? userSnap.data() : {};
    const expDocData = expSnap.exists() ? expSnap.data() : {};

    const totalExperiments = userData.experimentsPerformed || 0;
    const currentBadges = Array.isArray(userData.badges) ? userData.badges : [];
    const expAttempts = expDocData.attempts || 1;
    const currentTotalXp = userData.totalXP || 0;
    const rankInfo = calculateRankFromXp(currentTotalXp);

    // Keep level aligned with authoritative totalXP
    if (userData.level !== rankInfo.level) {
      await setDoc(userRef, { level: rankInfo.level }, { merge: true });
    }

    console.log(`[Firestore] Firestore read result: Total experimentsPerformed: ${totalExperiments}, ${experimentId} attempts: ${expAttempts}, totalXP: ${currentTotalXp}`);
    console.log(`[Firestore] Current activity count:`, totalExperiments);
    console.log(`[Firestore] Existing unlocked badges:`, currentBadges);

    return {
      attempts: expAttempts,
      experimentsPerformed: totalExperiments,
      badges: currentBadges,
      totalXP: currentTotalXp,
      level: rankInfo.level,
      completed: expDocData.completed
    };
  } catch (err) {
    console.error("[Firestore] recordExperimentActivity error:", err);
    return null;
  }
}

/**
 * Record experiment activity in users/{uid}/experiments/{experimentId}
 */
export async function recordExperimentInFirestore(uid, experimentId, expData = {}) {
  return recordExperimentActivity(uid, experimentId, expData);
}

/**
 * Atomically award XP in Firestore users/{uid}.totalXP and sync calculated level.
 * Prevents race conditions and cross-device overwrites.
 */
export async function awardUserXpInFirestore(uid, amount, reason = "") {
  if (!uid || !db || uid === "guest" || !amount || Number(amount) <= 0) return null;
  if (!isCloudOperationAllowed()) {
    console.log("[Firestore] Offline mode: Skipping awardUserXpInFirestore");
    return null;
  }

  try {
    const userRef = doc(db, "users", uid);
    const now = new Date().toISOString();
    const numAmount = Math.max(0, Number(amount) || 0);

    // Atomic increment on server
    await setDoc(userRef, {
      totalXP: increment(numAmount),
      lastActiveDate: now,
      updatedAt: now
    }, { merge: true });

    console.log(`%c[Firestore] ✓ Atomically added +${numAmount} XP to users/${uid} (${reason})`, "color: #10b981; font-weight: bold;");

    // Read authoritative total and update level if threshold crossed
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const uData = userSnap.data();
      const currentTotalXp = uData.totalXP || 0;
      const rankInfo = calculateRankFromXp(currentTotalXp);

      if (uData.level !== rankInfo.level) {
        await setDoc(userRef, { level: rankInfo.level, updatedAt: now }, { merge: true });
      }

      return {
        totalXP: currentTotalXp,
        level: rankInfo.level,
        rankInfo
      };
    }
    return null;
  } catch (err) {
    console.error("[Firestore] awardUserXpInFirestore error:", err);
    return null;
  }
}

/**
 * Real-time listener for multi-device synchronization.
 * Triggers callback immediately when users/{uid} is updated on any device.
 */
export function subscribeToUserDoc(uid, onUpdate) {
  if (!uid || !db || uid === "guest" || typeof onUpdate !== "function") return () => {};
  if (!isCloudOperationAllowed()) {
    console.log("[Firestore] Offline mode: Skipping subscribeToUserDoc");
    return () => {};
  }

  try {
    const userRef = doc(db, "users", uid);
    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data());
      }
    }, (err) => {
      console.warn("[Firestore] subscribeToUserDoc notice:", err.message);
    });
    return unsubscribe;
  } catch (e) {
    console.warn("[Firestore] subscribeToUserDoc error:", e);
    return () => {};
  }
}

/**
 * Record a completed or attempted quiz in users/{uid}/quizAttempts/{attemptId}
 */
export async function recordQuizAttemptInFirestore(uid, attemptData) {
  if (!uid || !db || uid === "guest") return null;
  if (!isCloudOperationAllowed()) {
    console.log("[Firestore] Offline mode: Skipping recordQuizAttemptInFirestore");
    return null;
  }

  try {
    const attemptsColl = collection(db, "users", uid, "quizAttempts");
    const now = new Date().toISOString();
    const score = Number(attemptData.score || 0);
    const totalQuestions = Number(attemptData.totalQuestions || 10);
    const percentage = Number(attemptData.percentage || Math.round((score / totalQuestions) * 100));
    const xpEarned = Number(attemptData.xpEarned || (score * 10));

    const attemptDoc = {
      quizId: attemptData.quizId || "kinematics-mastery-quiz",
      score,
      totalQuestions,
      percentage,
      xpEarned,
      attemptedAt: now
    };

    const added = await addDoc(attemptsColl, attemptDoc);
    console.log(`%c[Firestore] ✓ Logged quiz attempt in users/${uid}/quizAttempts/${added.id}`, "color: #a855f7; font-weight: bold;");

    // Atomic update of parent user document metrics
    const userRef = doc(db, "users", uid);
    const quizUserUpdates = {
      quizzesAttempted: increment(1),
      quizzesCompleted: increment(1),
      totalQuizScore: increment(score),
      lastActiveDate: now,
      updatedAt: now
    };

    if (xpEarned > 0) {
      quizUserUpdates.totalXP = increment(xpEarned);
    }

    if (score > 0) {
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const uData = userSnap.data();
        if (score > (uData.bestQuizScore || 0)) {
          quizUserUpdates.bestQuizScore = score;
        }
      }
    }

    await setDoc(userRef, quizUserUpdates, { merge: true });

    // Recalculate level
    const updatedSnap = await getDoc(userRef);
    if (updatedSnap.exists()) {
      const uData = updatedSnap.data();
      const currentXp = uData.totalXP || 0;
      const rankInfo = calculateRankFromXp(currentXp);
      if (uData.level !== rankInfo.level) {
        await setDoc(userRef, { level: rankInfo.level }, { merge: true });
      }
      return { id: added.id, ...attemptDoc, totalXP: currentXp, level: rankInfo.level, rankInfo };
    }

    return { id: added.id, ...attemptDoc };
  } catch (err) {
    console.error("[Firestore] recordQuizAttemptInFirestore error:", err);
    return null;
  }
}

/**
 * Fetch full user profile and subcollections from Firestore
 */
export async function fetchFullUserDataFromFirestore(uid) {
  if (!uid || !db || uid === "guest") return null;
  if (!isCloudOperationAllowed()) {
    console.log("[Firestore] Offline mode: Skipping fetchFullUserDataFromFirestore");
    return null;
  }

  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return null;

    const userData = userSnap.data();

    // Fetch experiments subcollection
    const expColl = collection(db, "users", uid, "experiments");
    const expSnaps = await getDocs(expColl);
    const experiments = {};
    expSnaps.forEach((d) => {
      experiments[d.id] = d.data();
    });

    // Fetch quizAttempts subcollection (last 20 attempts)
    const quizColl = collection(db, "users", uid, "quizAttempts");
    const qQuery = query(quizColl, orderBy("attemptedAt", "desc"), limit(20));
    let quizAttempts = [];
    try {
      const qSnaps = await getDocs(qQuery);
      qSnaps.forEach((d) => {
        quizAttempts.push({ id: d.id, ...d.data() });
      });
    } catch (e) {
      // Fallback without query order
      const qSnaps = await getDocs(quizColl);
      qSnaps.forEach((d) => {
        quizAttempts.push({ id: d.id, ...d.data() });
      });
    }

    console.log(`[Firestore] Firestore read result: Full profile for users/${uid}`);
    console.log(`[Firestore] Current activity count: ${userData.experimentsPerformed || 0}`);
    console.log(`[Firestore] Existing unlocked badges:`, userData.badges || []);

    return {
      user: userData,
      experiments,
      quizAttempts
    };
  } catch (err) {
    console.warn("[Firestore] fetchFullUserDataFromFirestore notice:", err.message);
    return null;
  }
}

export function getExperimentNameById(id) {
  switch (id) {
    case "projectile":
    case "exp-projectile":
      return "2D Projectile Motion";
    case "optical":
    case "exp-optical":
      return "Determination of Numerical Aperture of an Optical Fibre";
    case "colour-sensor":
    case "exp-colour-sensor":
      return "Study of Colour Sensor (TCS3200)";
    case "hall-effect":
    case "exp-hall-effect":
      return "Hall Effect Experiment";
    case "sandbox":
    case "exp-sandbox":
      return "Physics Sandbox";
    case "diffraction":
    case "diffraction-grating":
    case "exp-diffraction":
    case "exp-diffraction-grating":
      return "Diffraction Grating";
    case "diode":
    case "diode-vi":
    case "exp-diode":
      return "Diode V-I Characteristics";
    default:
      return id;
  }
}
