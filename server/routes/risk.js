import { Router } from "express";

import {
  getRecommendation,
} from "../services/gemini.js";

import {
  getCurrentRisk,
  predictRisk,
} from "../services/riskService.js";

import {
  generateLiveAlerts,
} from "../services/alertEngine.js";

import {
  store,
} from "../services/store.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| GET /api/risk/current
|--------------------------------------------------------------------------
| Gets live weather + AQI for the user's location,
| calculates the disaster risks, generates live alerts,
| and stores/updates those alerts in MongoDB.
|--------------------------------------------------------------------------
*/
router.get(
  "/current",
  async (req, res, next) => {
    try {
      /*
       * Get latitude and longitude from
       * the frontend.
       *
       * Fallback coordinates are for
       * Lucknow only when no valid
       * coordinates are supplied.
       */
      const lat =
        Number(req.query.lat) || 26.8467;

      const lng =
        Number(req.query.lng) || 80.9462;

      /*
       * ----------------------------------------------------
       * 1. GET LIVE WEATHER + AQI + RISK
       * ----------------------------------------------------
       *
       * riskService handles:
       *
       * Location
       *    ↓
       * Open-Meteo Weather
       *    ↓
       * Open-Meteo Air Quality
       *    ↓
       * ML service / local prediction
       */
      const result =
        await getCurrentRisk(
          lat,
          lng,
        );

      /*
       * ----------------------------------------------------
       * 2. GENERATE LIVE ALERTS
       * ----------------------------------------------------
       *
       * The alert engine uses the data that was
       * ALREADY fetched above.
       *
       * This prevents another Weather/AQI API call.
       */
      const alerts =
        generateLiveAlerts({
          lat,
          lng,
          risks: result.risks,
          weather: result.weather,
          airQuality: result.airQuality,
        });

      /*
       * ----------------------------------------------------
       * 3. FIND CURRENTLY ACTIVE ALERT TYPES
       * ----------------------------------------------------
       */
      const activeKeys =
        new Set(
          alerts.map(
            (alert) => alert.key,
          ),
        );

      /*
       * ----------------------------------------------------
       * 4. CREATE / UPDATE ACTIVE ALERTS
       * ----------------------------------------------------
       *
       * store.createAlert() uses the alert key
       * to prevent duplicate alerts in MongoDB.
       */
      for (const alert of alerts) {
        await store.createAlert(
          alert,
        );
      }

      /*
       * ----------------------------------------------------
       * 5. DEACTIVATE ALERTS THAT ARE NO LONGER ACTIVE
       * ----------------------------------------------------
       *
       * Example:
       *
       * Previous request:
       * flood-risk = active
       *
       * Current request:
       * flood-risk condition disappeared
       *
       * Therefore:
       * flood-risk = inactive
       */
      const knownKeys = [
        "flood-risk",
        "heatwave-risk",
        "storm-risk",
        "air-quality-risk",
      ];

      for (const key of knownKeys) {
        if (!activeKeys.has(key)) {
          await store.deactivateAlert(
            key,
          );
        }
      }

      /*
       * ----------------------------------------------------
       * 6. RETURN EVERYTHING TO THE FRONTEND
       * ----------------------------------------------------
       *
       * The frontend now gets:
       *
       * - Risk scores
       * - Weather
       * - AQI
       * - Alerts
       * - Location
       * - Timestamp
       *
       * in ONE request.
       */
      res.json({
        ...result.risks,

        weather:
          result.weather,

        airQuality:
          result.airQuality,

        alerts,

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


/*
|--------------------------------------------------------------------------
| POST /api/risk/predict
|--------------------------------------------------------------------------
| Manual/custom prediction endpoint.
|
| This is useful if another part of your application
| sends custom weather/AQI values for prediction.
|--------------------------------------------------------------------------
*/
router.post(
  "/predict",
  async (req, res, next) => {
    try {
      /*
       * Calculate the risk using the
       * ML service or local fallback.
       */
      const risks =
        await predictRisk(
          req.body,
        );

      /*
       * Generate an AI recommendation
       * based on the calculated risks.
       */
      const recommendation =
        await getRecommendation(
          risks,
        );

      res.json({
        ...risks,

        recommendation,
      });

    } catch (error) {
      next(error);
    }
  },
);

export default router;