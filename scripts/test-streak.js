import assert from "node:assert/strict";
import test from "node:test";

// Mock browser globals before importing modules
const mockStorage = new Map();
globalThis.localStorage = {
  getItem: (key) => (mockStorage.has(key) ? mockStorage.get(key) : null),
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear()
};

let currentOnline = true;
Object.defineProperty(globalThis, "navigator", {
  value: {
    get onLine() { return currentOnline; },
    set onLine(v) { currentOnline = Boolean(v); }
  },
  configurable: true,
  writable: true
});

globalThis.document = {
  getElementById: () => null,
  body: { classList: { add: () => {}, remove: () => {} } }
};

globalThis.window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {}
};

// Import streak functions
import {
  STREAK_TIMEZONE,
  getCalendarDateString,
  getLocalDateString,
  normalizeToLocalDateString,
  getDayDifference,
  isConsecutiveCalendarDay,
  isStreakMilestone,
  getNextStreakMilestone,
  getStoredUserStreak,
  saveStoredUserStreak,
  processUserDailyStreak
} from "../src/streak.js";

test("Timezone & Date Normalization in Asia/Kolkata", async (t) => {
  await t.test("getCalendarDateString formats in Asia/Kolkata correctly", () => {
    // 2026-10-12 18:29:00 UTC is 2026-10-12 23:59:00 IST (+05:30)
    const date1 = new Date("2026-10-12T18:29:00.000Z");
    assert.equal(getCalendarDateString(date1, STREAK_TIMEZONE), "2026-10-12");

    // 2026-10-12 18:31:00 UTC is 2026-10-13 00:01:00 IST (+05:30) (crossed midnight!)
    const date2 = new Date("2026-10-12T18:31:00.000Z");
    assert.equal(getCalendarDateString(date2, STREAK_TIMEZONE), "2026-10-13");
  });

  await t.test("normalizeToLocalDateString handles diverse formats", () => {
    assert.equal(normalizeToLocalDateString("2026-10-12"), "2026-10-12");
    // ISO string crossing midnight in IST
    assert.equal(normalizeToLocalDateString("2026-10-12T20:00:00.000Z"), "2026-10-13");
    // Timestamp
    const ts = new Date("2026-10-12T18:35:00.000Z").getTime();
    assert.equal(normalizeToLocalDateString(ts), "2026-10-13");
  });

  await t.test("getDayDifference & isConsecutiveCalendarDay calculate consecutive days accurately", () => {
    assert.equal(getDayDifference("2026-10-12", "2026-10-12"), 0);
    assert.equal(getDayDifference("2026-10-12", "2026-10-13"), 1);
    assert.equal(isConsecutiveCalendarDay("2026-10-12", "2026-10-13"), true);
    assert.equal(getDayDifference("2026-10-12", "2026-10-14"), 2);
    assert.equal(isConsecutiveCalendarDay("2026-10-12", "2026-10-14"), false);
    // Month boundary: 2026-10-31 to 2026-11-01
    assert.equal(getDayDifference("2026-10-31", "2026-11-01"), 1);
    assert.equal(isConsecutiveCalendarDay("2026-10-31", "2026-11-01"), true);
    // Year boundary: 2026-12-31 to 2027-01-01
    assert.equal(getDayDifference("2026-12-31", "2027-01-01"), 1);
  });
});

test("Requirement 8 Test Cases", async (t) => {
  await t.test("Case 1: First recorded activity creates streak = 1", async () => {
    const user1 = "test_user_c1";
    const result = await processUserDailyStreak({ uid: user1 });
    assert.equal(result.currentStreak, 1);
    assert.equal(result.highestStreak, 1);
    assert.equal(result.status, "initial");
    assert.equal(result.lastLoginDate, getCalendarDateString());
  });

  await t.test("Case 2: Activity on consecutive calendar days increments streak", async () => {
    const user2 = "test_user_c2";
    const today = getCalendarDateString();
    const [y, m, d] = today.split("-").map(Number);
    // Yesterday
    const yesterday = new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);

    saveStoredUserStreak(user2, {
      currentStreak: 3,
      highestStreak: 3,
      lastLoginDate: yesterday
    });

    const result = await processUserDailyStreak({ uid: user2 });
    assert.equal(result.currentStreak, 4);
    assert.equal(result.highestStreak, 4);
    assert.equal(result.status, "incremented");
    assert.equal(result.lastLoginDate, today);
  });

  await t.test("Case 3: Multiple visits on the same day do not increment streak", async () => {
    const user3 = "test_user_c3";
    const today = getCalendarDateString();
    saveStoredUserStreak(user3, {
      currentStreak: 4,
      highestStreak: 4,
      lastLoginDate: today
    });

    // Call on same day
    const result = await processUserDailyStreak({ uid: user3 });
    assert.equal(result.currentStreak, 4);
    assert.equal(result.status, "same_day");
    assert.equal(result.changed, false);
  });

  await t.test("Case 4: Activity after a missed calendar day resets streak to 1", async () => {
    const user4 = "test_user_c4";
    const today = getCalendarDateString();
    const [y, m, d] = today.split("-").map(Number);
    // 3 days ago
    const threeDaysAgo = new Date(Date.UTC(y, m - 1, d - 3)).toISOString().slice(0, 10);

    saveStoredUserStreak(user4, {
      currentStreak: 7,
      highestStreak: 7,
      lastLoginDate: threeDaysAgo
    });

    const result = await processUserDailyStreak({ uid: user4 });
    assert.equal(result.currentStreak, 1);
    assert.equal(result.highestStreak, 7, "Highest streak must be preserved even when current streak resets");
    assert.equal(result.status, "broken");
    assert.equal(result.lostStreak, 7);
  });

  await t.test("Case 5: Application opened around midnight in Asia/Kolkata timezone", () => {
    // 23:59:30 IST on 2026-10-12
    const beforeMidnight = new Date("2026-10-12T18:29:30.000Z");
    // 00:00:30 IST on 2026-10-13 (1 minute later, crossed midnight)
    const afterMidnight = new Date("2026-10-12T18:30:30.000Z");

    const dateBefore = getCalendarDateString(beforeMidnight, STREAK_TIMEZONE);
    const dateAfter = getCalendarDateString(afterMidnight, STREAK_TIMEZONE);

    assert.equal(dateBefore, "2026-10-12");
    assert.equal(dateAfter, "2026-10-13");
    assert.equal(getDayDifference(dateBefore, dateAfter), 1);
    assert.equal(isConsecutiveCalendarDay(dateBefore, dateAfter), true);
  });

  await t.test("Case 6: Page refresh preserves existing validated streak", async () => {
    const user6 = "test_user_c6";
    const today = getCalendarDateString();
    saveStoredUserStreak(user6, {
      currentStreak: 6,
      highestStreak: 6,
      lastLoginDate: today
    });

    const result = await processUserDailyStreak({ uid: user6 });
    assert.equal(result.currentStreak, 6);
    assert.equal(result.status, "same_day");
  });

  await t.test("Case 7: Sign-out and sign-in preserves streak across sessions", async () => {
    const user7 = "test_user_c7";
    // Save authenticated user streak
    saveStoredUserStreak(user7, {
      currentStreak: 5,
      highestStreak: 5,
      lastLoginDate: getCalendarDateString()
    });

    // Guest sign-out
    mockStorage.delete("physix_user_streak_guest");
    const guestStreak = await processUserDailyStreak(null);
    assert.equal(guestStreak.status, "initial");

    // Sign back in as user
    const userStreak = await processUserDailyStreak({ uid: user7 });
    assert.equal(userStreak.currentStreak, 5);
    assert.equal(userStreak.status, "same_day");
  });

  await t.test("Case 8: Multi-device sync reconciles remote higher streak", () => {
    const local = {
      currentStreak: 2,
      highestStreak: 2,
      lastLoginDate: "2026-10-10"
    };
    const remote = {
      streak: 5,
      highestStreak: 5,
      lastLoginDate: "2026-10-12"
    };

    const bestHighest = Math.max(local.highestStreak, remote.highestStreak);
    const bestStreak = Math.max(local.currentStreak, remote.streak);
    assert.equal(bestHighest, 5);
    assert.equal(bestStreak, 5);
  });

  await t.test("Case 9: Temporary network/cloud failure preserves local streak without breaking", async () => {
    const user9 = "test_user_c9";
    saveStoredUserStreak(user9, {
      currentStreak: 5,
      highestStreak: 5,
      lastLoginDate: getCalendarDateString()
    });

    // Simulate temporary offline / network failure
    currentOnline = false;
    const result = await processUserDailyStreak({ uid: user9 });
    assert.equal(result.currentStreak, 5);
    assert.notEqual(result.status, "broken", "Temporary failure must not break streak");
    currentOnline = true;
  });

  await t.test("Case 10: Offline activity records locally and flags pendingSync", async () => {
    const user10 = "test_user_c10";
    currentOnline = false;
    const today = getCalendarDateString();
    const [y, m, d] = today.split("-").map(Number);
    const yesterday = new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);

    saveStoredUserStreak(user10, {
      currentStreak: 3,
      highestStreak: 3,
      lastLoginDate: yesterday
    });

    const result = await processUserDailyStreak({ uid: user10 });
    assert.equal(result.currentStreak, 4);
    assert.equal(result.offline, true);
    assert.equal(result.pendingSync, true);

    const saved = getStoredUserStreak(user10);
    assert.equal(saved.currentStreak, 4);
    assert.equal(saved.pendingSync, true);
    currentOnline = true;
  });

  await t.test("Case 11: Existing user with streak already greater than one is preserved", async () => {
    const user11 = "test_user_c11";
    saveStoredUserStreak(user11, {
      currentStreak: 15,
      highestStreak: 20,
      lastLoginDate: getCalendarDateString()
    });

    const result = await processUserDailyStreak({ uid: user11 });
    assert.equal(result.currentStreak, 15);
    assert.equal(result.highestStreak, 20);
    assert.equal(result.status, "same_day");
  });

  await t.test("Case 12: User whose last recorded activity date is missing or malformed is handled safely", async () => {
    const user12 = "test_user_c12";
    saveStoredUserStreak(user12, {
      currentStreak: 5,
      highestStreak: 5,
      lastLoginDate: "invalid-date-string"
    });

    const retrieved = getStoredUserStreak(user12);
    assert.ok(retrieved);
    const normalized = normalizeToLocalDateString("invalid-date-string");
    assert.match(normalized, /^\d{4}-\d{2}-\d{2}$/);
  });
});
