import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "db.json");

// Default template for a new user record
function getDefaultUserData(userId = "guest") {
  return {
    userId,
    profile: {
      name: "",
      avatar: "quantum",
      handle: "",
      edu: "",
      occ: "",
      interests: "",
      bio: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    telemetry: {
      totalLaunches: 0,
      maxRange: 0,
      maxHeight: 0,
      maxVelocity: 0,
      totalAirtime: 0,
      targetHits: 0,
      planetsUsed: { "Earth": 0, "Moon": 0, "Mars": 0, "Jupiter": 0 }
    },
    flightLogs: [],
    observations: [],
    challenges: {},
    bonusXp: 0,
    badges: ["badge-profile-saved"],
    quizHighScore: 0
  };
}

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialDb = { users: { guest: getDefaultUserData("guest") } };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8");
      return initialDb;
    }
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("[Store] Error reading database file:", err);
    return { users: { guest: getDefaultUserData("guest") } };
  }
}

function writeDb(data) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[Store] Error writing database file:", err);
  }
}

export const store = {
  getUser(userId = "guest") {
    const db = readDb();
    if (!db.users[userId]) {
      db.users[userId] = getDefaultUserData(userId);
      writeDb(db);
    }
    return db.users[userId];
  },

  getProfile(userId = "guest") {
    const user = this.getUser(userId);
    return user.profile;
  },

  saveProfile(userId = "guest", profileData) {
    const db = readDb();
    if (!db.users[userId]) {
      db.users[userId] = getDefaultUserData(userId);
    }
    db.users[userId].profile = {
      ...db.users[userId].profile,
      ...profileData,
      updatedAt: new Date().toISOString()
    };
    writeDb(db);
    return db.users[userId].profile;
  },

  getTelemetry(userId = "guest") {
    const user = this.getUser(userId);
    return user.telemetry;
  },

  saveTelemetry(userId = "guest", telemetryData) {
    const db = readDb();
    if (!db.users[userId]) {
      db.users[userId] = getDefaultUserData(userId);
    }
    db.users[userId].telemetry = {
      ...db.users[userId].telemetry,
      ...telemetryData
    };
    writeDb(db);
    return db.users[userId].telemetry;
  },

  getFlightLogs(userId = "guest") {
    const user = this.getUser(userId);
    return user.flightLogs || [];
  },

  addFlightLog(userId = "guest", logEntry) {
    const db = readDb();
    if (!db.users[userId]) {
      db.users[userId] = getDefaultUserData(userId);
    }
    if (!db.users[userId].flightLogs) {
      db.users[userId].flightLogs = [];
    }
    db.users[userId].flightLogs.unshift({
      id: db.users[userId].flightLogs.length + 1,
      createdAt: new Date().toISOString(),
      ...logEntry
    });
    // Keep last 30 logs
    if (db.users[userId].flightLogs.length > 30) {
      db.users[userId].flightLogs.pop();
    }
    writeDb(db);
    return db.users[userId].flightLogs;
  },

  clearFlightLogs(userId = "guest") {
    const db = readDb();
    if (db.users[userId]) {
      db.users[userId].flightLogs = [];
      writeDb(db);
    }
    return [];
  },

  getBadges(userId = "guest") {
    const user = this.getUser(userId);
    return user.badges || [];
  },

  unlockBadge(userId = "guest", badgeId) {
    const db = readDb();
    if (!db.users[userId]) {
      db.users[userId] = getDefaultUserData(userId);
    }
    if (!db.users[userId].badges) {
      db.users[userId].badges = [];
    }
    if (!db.users[userId].badges.includes(badgeId)) {
      db.users[userId].badges.push(badgeId);
      writeDb(db);
    }
    return db.users[userId].badges;
  },

  getQuizHighScore(userId = "guest") {
    const user = this.getUser(userId);
    return user.quizHighScore || 0;
  },

  saveQuizHighScore(userId = "guest", score) {
    const db = readDb();
    if (!db.users[userId]) {
      db.users[userId] = getDefaultUserData(userId);
    }
    const currentHigh = db.users[userId].quizHighScore || 0;
    if (score > currentHigh) {
      db.users[userId].quizHighScore = score;
      writeDb(db);
    }
    return db.users[userId].quizHighScore;
  },

  getObservations(userId = "guest") {
    const user = this.getUser(userId);
    return user.observations || [];
  },

  addObservation(userId = "guest", obsEntry) {
    const db = readDb();
    if (!db.users[userId]) {
      db.users[userId] = getDefaultUserData(userId);
    }
    if (!db.users[userId].observations) {
      db.users[userId].observations = [];
    }
    db.users[userId].observations.unshift({
      id: db.users[userId].observations.length + 1,
      createdAt: new Date().toISOString(),
      ...obsEntry
    });
    if (db.users[userId].observations.length > 50) {
      db.users[userId].observations.pop();
    }
    writeDb(db);
    return db.users[userId].observations;
  },

  clearObservations(userId = "guest") {
    const db = readDb();
    if (db.users[userId]) {
      db.users[userId].observations = [];
      writeDb(db);
    }
    return [];
  },

  getBonusXp(userId = "guest") {
    const user = this.getUser(userId);
    return user.bonusXp || 0;
  },

  addBonusXp(userId = "guest", amount = 0) {
    const db = readDb();
    if (!db.users[userId]) {
      db.users[userId] = getDefaultUserData(userId);
    }
    db.users[userId].bonusXp = (db.users[userId].bonusXp || 0) + Number(amount);
    writeDb(db);
    return db.users[userId].bonusXp;
  }
};
