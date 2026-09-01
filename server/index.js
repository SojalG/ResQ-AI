import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "node:path";

import incidents from "./routes/incidents.js";
import alerts from "./routes/alerts.js";
import liveAlerts from "./routes/liveAlerts.js";
import risk from "./routes/risk.js";
import chat from "./routes/chat.js";
import location from "./routes/location.js";

import { getRecommendation } from "./services/gemini.js";

const app = express();

app.use(
  cors({
    origin:
      process.env.CLIENT_ORIGIN?.split(",") || true,
  }),
);

app.use(
  express.json({
    limit: "2mb",
  }),
);

app.use(
  "/uploads",
  express.static(
    path.resolve("uploads"),
  ),
);

app.get(
  "/api/health",
  (_req, res) =>
    res.json({
      ok: true,
      database:
        global.mongoConnected
          ? "mongodb"
          : "memory",
    }),
);

app.use(
  "/api/incidents",
  incidents,
);

app.use(
  "/api/alerts",
  alerts,
);

app.use(
  "/api/live-alerts",
  liveAlerts,
);

app.use(
  "/api/risk",
  risk,
);

app.use(
  "/api/location",
  location,
);

app.use(
  "/api/chat",
  chat,
);

app.post(
  "/api/resources/suggest",
  async (req, res, next) => {
    try {
      const {
        zone,
        floodRisk,
      } = req.body;

      const recommendation =
        await getRecommendation({
          zone,
          floodRisk,
        });

      const resources =
        floodRisk >= 70
          ? "2 Rescue Boats, 1 Medical Team, 3 Relief Centers"
          : floodRisk >= 40
            ? "1 Medical Team, 2 Relief Centers"
            : "1 Rapid Response Unit";

      res.json({
        zone,
        resources,
        recommendation,
      });
    } catch (e) {
      next(e);
    }
  },
);

app.use(
  (err, _req, res, _next) => {
    console.error(err);

    res
      .status(
        err.code ===
          "LIMIT_FILE_SIZE"
          ? 413
          : 500,
      )
      .json({
        error:
          err.message ||
          "Unexpected server error",
      });
  },
);

const port =
  Number(process.env.PORT) || 3001;

if (process.env.MONGODB_URI) {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI,
    );

    global.mongoConnected = true;

    console.log(
      "MongoDB connected",
    );
  } catch (error) {
    console.error(
      "MongoDB connection failed:",
      error.message,
    );

    if (
      process.env.NODE_ENV ===
      "production"
    ) {
      process.exit(1);
    }
  }
} else if (
  process.env.NODE_ENV ===
  "production"
) {
  console.error(
    "MONGODB_URI is required in production.",
  );

  process.exit(1);
}

app.listen(port, () =>
  console.log(
    `ResQAI API running on http://localhost:${port}`,
  ),
);