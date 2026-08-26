import axios from "axios";

import { getLiveWeather } from "./weather.js";
import { getLiveAirQuality } from "./airQuality.js";

const localPredict = ({
  rainfall = 0,
  temperature = 25,
  aqi = 0,
  waterLevel = 0,
  next24HoursRainfall = 0,
  maxRainProbability = 0,
}) => ({
  floodRisk: Math.min(
    100,
    Math.max(
      2,
      rainfall * 0.65 +
        next24HoursRainfall * 0.35 +
        maxRainProbability * 0.12 +
        waterLevel * 10,
    ),
  ),

  heatwaveRisk: Math.min(
    100,
    Math.max(
      3,
      (temperature - 20) * 4.2,
    ),
  ),

  stormRisk: Math.min(
    100,
    Math.max(
      4,
      rainfall * 0.48 +
        next24HoursRainfall * 0.20 +
        maxRainProbability * 0.10 +
        waterLevel * 5,
    ),
  ),

  airQualityRisk: Math.min(
    100,
    Math.max(
      2,
      aqi * 0.55,
    ),
  ),
});

export async function predictRisk(input) {
  try {
    const response = await axios.post(
      `${process.env.ML_SERVICE_URL || "http://localhost:5001"}/predict`,
      input,
      {
        timeout: 2500,
      },
    );

    return response.data;
  } catch (error) {
    console.warn(
      "ML service unavailable. Using local risk calculation.",
    );

    return localPredict(input);
  }
}

export async function getCurrentRisk(
  lat,
  lng,
) {
  const liveWeather =
    await getLiveWeather(
      lat,
      lng,
    );

  const liveAirQuality =
    await getLiveAirQuality(
      lat,
      lng,
    );

  const weather = {
    rainfall:
      liveWeather.rainfall,

    temperature:
      liveWeather.temperature,

    aqi:
      liveAirQuality.aqi,

    // Real river-level data
    // can be added later.
    waterLevel: 0,

    next24HoursRainfall:
      liveWeather.next24HoursRainfall,

    maxRainProbability:
      liveWeather.maxRainProbability,
  };

  const risks =
    await predictRisk(weather);

  return {
    risks,

    weather: {
      temperature:
        liveWeather.temperature,

      humidity:
        liveWeather.humidity,

      rainfall:
        liveWeather.rainfall,

      precipitation:
        liveWeather.precipitation,

      windSpeed:
        liveWeather.windSpeed,

      next24HoursRainfall:
        liveWeather.next24HoursRainfall,

      maxRainProbability:
        liveWeather.maxRainProbability,
    },

    airQuality: {
      aqi:
        liveAirQuality.aqi,

      pm2_5:
        liveAirQuality.pm2_5,

      pm10:
        liveAirQuality.pm10,

      ozone:
        liveAirQuality.ozone,

      nitrogenDioxide:
        liveAirQuality.nitrogenDioxide,

      sulphurDioxide:
        liveAirQuality.sulphurDioxide,
    },

    location: {
      lat,
      lng,
    },

    updatedAt:
      new Date().toISOString(),
  };
}