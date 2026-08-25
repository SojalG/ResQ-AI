import axios from 'axios';

export async function getLiveAirQuality(lat, lng) {
    const url =
        'https://air-quality-api.open-meteo.com/v1/air-quality';

    const response = await axios.get(url, {
        params: {
            latitude: lat,
            longitude: lng,

            current: [
                'pm10',
                'pm2_5',
                'carbon_monoxide',
                'nitrogen_dioxide',
                'sulphur_dioxide',
                'ozone',
                'us_aqi'
            ].join(','),

            timezone: 'auto'
        },

        timeout: 10000
    });

    const data = response.data;

    return {
        aqi: data.current?.us_aqi ?? 0,

        pm2_5:
            data.current?.pm2_5 ?? 0,

        pm10:
            data.current?.pm10 ?? 0,

        carbonMonoxide:
            data.current?.carbon_monoxide ?? 0,

        nitrogenDioxide:
            data.current?.nitrogen_dioxide ?? 0,

        sulphurDioxide:
            data.current?.sulphur_dioxide ?? 0,

        ozone:
            data.current?.ozone ?? 0,

        timestamp:
            data.current?.time
    };
}