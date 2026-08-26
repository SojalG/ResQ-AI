import { Router } from 'express';

import { getCurrentRisk } from '../services/riskService.js';
import { generateLiveAlerts } from '../services/alertEngine.js';
import { store } from '../services/store.js';

const router = Router();

router.post('/refresh', async (req, res, next) => {
    try {
        const lat = Number(req.body.lat);
        const lng = Number(req.body.lng);

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng)
        ) {
            return res.status(400).json({
                error: 'Valid latitude and longitude are required'
            });
        }

        /*
         * Get live weather + AQI + risk.
         *
         * This is the same calculation
         * used by /api/risk/current.
         */
        const result = await getCurrentRisk(
            lat,
            lng
        );

        /*
         * Generate alerts using the data
         * that was ALREADY fetched.
         */
        const alerts = generateLiveAlerts({
            lat,
            lng,
            risks: result.risks,
            weather: result.weather,
            airQuality: result.airQuality
        });

        /*
         * Track which alert types are currently active.
         */
        const activeKeys = new Set(
            alerts.map(alert => alert.key)
        );

        /*
         * Create/update active alerts.
         */
        for (const alert of alerts) {
            await store.createAlert(alert);
        }

        /*
         * Deactivate alerts that are no longer triggered.
         */
        const knownKeys = [
            'flood-risk',
            'heatwave-risk',
            'storm-risk',
            'air-quality-risk'
        ];

        for (const key of knownKeys) {
            if (!activeKeys.has(key)) {
                await store.deactivateAlert(key);
            }
        }

        res.json({
            ok: true,

            risks: result.risks,

            weather: result.weather,

            airQuality: result.airQuality,

            alerts,

            updatedAt: result.updatedAt
        });

    } catch (error) {
        next(error);
    }
});

export default router;