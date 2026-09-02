import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import profileRouter from "./routes/profile.js";
import telemetryRouter from "./routes/telemetry.js";
import quizRouter from "./routes/quiz.js";
import kinematicsRouter from "./routes/kinematics.js";
import badgesRouter from "./routes/badges.js";
import aiRouter from "./routes/ai.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[Express API] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "PhysiX Virtual Laboratory Backend API",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Mount Routes
app.use("/api/profile", profileRouter);
app.use("/api/telemetry", telemetryRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/kinematics", kinematicsRouter);
app.use("/api/badges", badgesRouter);
app.use("/api/ai", aiRouter);

// Serve frontend static build files if dist exists (production mode)
const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));

// Fallback for SPA routing
app.use((req, res) => {
  const indexPath = path.join(distPath, "index.html");
  if (req.accepts("html") && !req.path.startsWith("/api")) {
    res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(404).json({ error: "PhysiX Express API Running. Frontend build not found." });
      }
    });
  } else {
    res.status(404).json({ error: "Endpoint not found" });
  }
});

// Start Server only in local Node.js daemon (non-Vercel environment)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`=============================================`);
    console.log(`🚀 PhysiX Express.js Backend Server running`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
    console.log(`=============================================`);
  });
}

export default app;
