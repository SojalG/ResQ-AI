import {
    createContext,
    useContext,
    useEffect,
    useState
} from 'react';

import {
    api,
    getPosition
} from '../api';

const DataContext =
    createContext();

export function DataProvider({
    children
}) {
    const [risks, setRisks] =
        useState(null);

    const [alerts, setAlerts] =
        useState([]);

    const [incidents, setIncidents] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const refresh = async () => {
    try {
        const position = await getPosition();

        console.log(
            'ResQAI location:',
            position
        );

        const riskUrl =
            `/risk/current?lat=${position.lat}&lng=${position.lng}`;

        const riskResponse =
            await api.get(riskUrl);

        const alertsResponse =
            await api.get('/alerts');

        const incidentsResponse =
            await api.get('/incidents?limit=50');

        setRisks(
            riskResponse.data
        );

        setAlerts(
            alertsResponse.data
        );

        setIncidents(
            incidentsResponse.data
        );

    } catch (error) {
        console.error(
            'Failed to load ResQAI data:',
            error
        );
    } finally {
        setLoading(false);
    }
};

    useEffect(() => {

        /*
         * Initial live data load.
         */
        refresh();

        /*
         * Refresh ALL live data every minute.
         *
         * This means:
         *
         * GPS
         *   ↓
         * Weather
         *   ↓
         * AQI
         *   ↓
         * Risk
         *   ↓
         * Alerts
         *   ↓
         * MongoDB
         */
        const timer =
            setInterval(
                () => {
                    refresh();
                },
                60000
            );

        return () =>
            clearInterval(timer);

    }, []);

    return (
        <DataContext.Provider
            value={{
                risks,
                alerts,
                incidents,
                loading,
                refresh,
                setAlerts,
                setIncidents
            }}
        >
            {children}
        </DataContext.Provider>
    );
}

export const useData =
    () => useContext(DataContext);