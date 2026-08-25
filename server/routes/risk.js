import {
    Router
} from 'express';
import axios from 'axios';
import {
    demoRisks
} from '../data/demo.js';
import {
    getRecommendation
} from '../services/gemini.js';
import {
    getLiveWeather
} from '../services/weather.js';
import {
    getLiveAirQuality
} from '../services/airQuality.js';

const router = Router();

const localPredict = ({
    rainfall = 0,
    temperature = 25,
    aqi = 0,
    waterLevel = 0,
    next24HoursRainfall = 0,
    maxRainProbability = 0
}) => ({
    floodRisk: Math.min(
        100,
        Math.max(
            2,
            rainfall * 0.65 +
            next24HoursRainfall * 0.35 +
            maxRainProbability * 0.12 +
            waterLevel * 10
        )
    ),

    heatwaveRisk: Math.min(
        100,
        Math.max(
            3,
            (temperature - 20) * 4.2
        )
    ),

    stormRisk: Math.min(
        100,
        Math.max(
            4,
            rainfall * 0.48 +
            next24HoursRainfall * 0.20 +
            maxRainProbability * 0.10 +
            waterLevel * 5
        )
    ),

    airQualityRisk: Math.min(
        100,
        Math.max(
            2,
            aqi * 0.55
        )
    )
});

async function predict(input) {
    try {
        return (await axios.post(`${process.env.ML_SERVICE_URL||'http://localhost:5001'}/predict`, input, {
            timeout: 2500
        })).data;
    } catch {
        return localPredict(input);
    }
}
router.get('/current', async (req, res, next) => {
    try {
        const lat =
            Number(req.query.lat) || 26.8467;

        const lng =
            Number(req.query.lng) || 80.9462;

        const liveWeather =
            await getLiveWeather(
                lat,
                lng
            );

        const liveAirQuality =
            await getLiveAirQuality(
                lat,
                lng
            );

        const weather = {
            rainfall: liveWeather.rainfall,

            temperature: liveWeather.temperature,

            aqi: liveAirQuality.aqi,

            // Temporary until we have
            // actual river-level data.
            waterLevel: 0,

            // New live forecast features
            next24HoursRainfall: liveWeather.next24HoursRainfall,

            maxRainProbability: liveWeather.maxRainProbability
        };

        const risks =
            await predict(weather);

        res.json({
            ...risks,

            weather: {
                temperature: liveWeather.temperature,

                humidity: liveWeather.humidity,

                rainfall: liveWeather.rainfall,

                precipitation: liveWeather.precipitation,

                windSpeed: liveWeather.windSpeed,

                next24HoursRainfall: liveWeather.next24HoursRainfall,

                maxRainProbability: liveWeather.maxRainProbability
            },

            airQuality: {
                aqi: liveAirQuality.aqi,

                pm2_5: liveAirQuality.pm2_5,

                pm10: liveAirQuality.pm10,

                ozone: liveAirQuality.ozone,

                nitrogenDioxide: liveAirQuality.nitrogenDioxide,

                sulphurDioxide: liveAirQuality.sulphurDioxide
            },

            location: {
                lat,
                lng
            },

            updatedAt: new Date().toISOString()
        });

    } catch (error) {
        next(error);
    }
});
router.post('/predict', async (req, res, next) => {
    try {
        const risks = await predict(req.body);
        res.json({
            ...risks,
            recommendation: await getRecommendation(risks)
        });
    } catch (e) {
        next(e);
    }
});
export default router;