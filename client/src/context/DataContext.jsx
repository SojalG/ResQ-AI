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
            /*
             * Get the user's actual
             * browser location.
             */
            const position =
                await getPosition();

            console.log(
                'ResQAI location:',
                position
            );

            const {
                lat,
                lng
            } = position;

            /*
             * Get live risk data.
             */
            const riskResponse =
                await api.get(
                    `/risk/current?lat=${lat}&lng=${lng}`
                );

            /*
             * Generate/update live alerts
             * using the SAME location.
             *
             * This calls:
             * POST /api/live-alerts/refresh
             */
            // await api.post(
            //     '/live-alerts/refresh',
            //     {
            //         lat,
            //         lng
            //     }
            // );

            /*
             * Now fetch the active alerts
             * from MongoDB.
             */
            // const alertsResponse =
            //     await api.get(
            //         '/alerts'
            //     );

            /*
             * Incidents are still loaded
             * normally from MongoDB.
             */
            const incidentsResponse =
                await api.get(
                    '/incidents?limit=50'
                );

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