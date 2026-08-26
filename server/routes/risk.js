import { Router } from "express";

import {
  getRecommendation,
} from "../services/gemini.js";

import {
  getCurrentRisk,
  predictRisk,
} from "../services/riskService.js";

const router = Router();

router.get(
  "/current",
  async (req, res, next) => {
    try {
      const lat =
        Number(req.query.lat) ||
        26.8467;

      const lng =
        Number(req.query.lng) ||
        80.9462;

      const result =
        await getCurrentRisk(
          lat,
          lng,
        );

      res.json({
        ...result.risks,

        weather:
          result.weather,

        airQuality:
          result.airQuality,

        location:
          result.location,

        updatedAt:
          result.updatedAt,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/predict",
  async (req, res, next) => {
    try {
      const risks =
        await predictRisk(
          req.body,
        );

      res.json({
        ...risks,

        recommendation:
          await getRecommendation(
            risks,
          ),
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;