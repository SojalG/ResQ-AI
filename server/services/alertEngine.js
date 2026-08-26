function severityFromRisk(risk) {
    if (risk >= 75) return 'High';
    if (risk >= 45) return 'Medium';
    return 'Low';
}

export function generateLiveAlerts({
    lat,
    lng,
    risks,
    weather,
    airQuality
}) {
    const alerts = [];

    /*
     * FLOOD ALERT
     */
    if (
        weather.next24HoursRainfall >= 50 ||
        risks.floodRisk >= 70
    ) {
        alerts.push({
            key: 'flood-risk',

            title: 'Flood / Heavy Rain Warning',

            type: 'Flood',

            severity: severityFromRisk(
                risks.floodRisk
            ),

            message:
                'Heavy rainfall is expected in the next 24 hours. Take precautions in low-lying and flood-prone areas.',

            source:
                'ResQAI live weather analysis',

            location: {
                lat,
                lng
            },

            recommendations: [
                'Avoid flooded roads and underpasses',
                'Move valuables above ground level',
                'Keep emergency contacts ready'
            ]
        });
    }

    /*
     * HEATWAVE ALERT
     */
    if (
        risks.heatwaveRisk >= 70
    ) {
        alerts.push({
            key: 'heatwave-risk',

            title: 'Heatwave Warning',

            type: 'Heatwave',

            severity: severityFromRisk(
                risks.heatwaveRisk
            ),

            message:
                'High heat conditions are currently detected. Stay hydrated and avoid prolonged outdoor exposure.',

            source:
                'ResQAI live weather analysis',

            location: {
                lat,
                lng
            },

            recommendations: [
                'Stay hydrated',
                'Avoid prolonged outdoor activity',
                'Check on children and older adults'
            ]
        });
    }

    /*
     * STORM ALERT
     */
    if (
        risks.stormRisk >= 70
    ) {
        alerts.push({
            key: 'storm-risk',

            title: 'Storm Risk Warning',

            type: 'Storm',

            severity: severityFromRisk(
                risks.stormRisk
            ),

            message:
                'Weather conditions indicate an elevated storm risk. Secure loose objects and monitor official warnings.',

            source:
                'ResQAI live weather analysis',

            location: {
                lat,
                lng
            },

            recommendations: [
                'Stay indoors when conditions worsen',
                'Secure loose outdoor objects',
                'Monitor official warnings'
            ]
        });
    }

    /*
     * AIR QUALITY ALERT
     */
    if (
        airQuality.aqi >= 150 ||
        risks.airQualityRisk >= 70
    ) {
        alerts.push({
            key: 'air-quality-risk',

            title: 'Poor Air Quality Warning',

            type: 'Air Quality',

            severity: severityFromRisk(
                risks.airQualityRisk
            ),

            message:
                'Air quality is currently poor. Sensitive individuals should reduce prolonged outdoor activity.',

            source:
                'Open-Meteo Air Quality',

            location: {
                lat,
                lng
            },

            recommendations: [
                'Reduce prolonged outdoor exertion',
                'Keep windows closed during pollution peaks',
                'Use a mask in highly polluted areas'
            ]
        });
    }

    return alerts;
}