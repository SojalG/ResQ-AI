import axios from 'axios';

export async function getLiveWeather(lat, lng) {
    const url =
        'https://api.open-meteo.com/v1/forecast';

    const response = await axios.get(url, {
        params: {
            latitude: lat,
            longitude: lng,

            current: [
                'temperature_2m',
                'relative_humidity_2m',
                'precipitation',
                'rain',
                'showers',
                'snowfall',
                'wind_speed_10m'
            ].join(','),

            hourly: [
                'temperature_2m',
                'precipitation_probability',
                'precipitation'
            ].join(','),

            forecast_days: 3,

            timezone: 'auto'
        },

        timeout: 10000
    });

    const data = response.data;

    // -----------------------------
    // HOURLY FORECAST
    // -----------------------------

    const hourly =
        data.hourly || {};

    const precipitation =
        hourly.precipitation || [];

    const precipitationProbability =
        hourly.precipitation_probability || [];

    // -----------------------------
    // NEXT 24 HOURS RAINFALL
    // -----------------------------

    const next24HoursRainfall =
        precipitation
            .slice(0, 24)
            .reduce(
                (total, value) =>
                    total +
                    (Number(value) || 0),
                0
            );

    // -----------------------------
    // MAX RAIN PROBABILITY
    // -----------------------------

    const maxRainProbability =
        Math.max(
            0,
            ...precipitationProbability
                .slice(0, 24)
                .map(
                    value =>
                        Number(value) || 0
                )
        );

    // -----------------------------
    // RETURN
    // -----------------------------

    return {
        latitude:
            data.latitude,

        longitude:
            data.longitude,

        temperature:
            data.current
                ?.temperature_2m ?? 0,

        humidity:
            data.current
                ?.relative_humidity_2m ?? 0,

        rainfall:
            data.current
                ?.rain ?? 0,

        precipitation:
            data.current
                ?.precipitation ?? 0,

        showers:
            data.current
                ?.showers ?? 0,

        snowfall:
            data.current
                ?.snowfall ?? 0,

        windSpeed:
            data.current
                ?.wind_speed_10m ?? 0,

        timestamp:
            data.current?.time,

        next24HoursRainfall,

        maxRainProbability,

        hourly
    };
}