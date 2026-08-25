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

            /*
             * Send that location to
             * the backend.
             */
            const riskUrl =
                `/risk/current?lat=${position.lat}&lng=${position.lng}`;

            const [
                riskResponse,
                alertsResponse,
                incidentsResponse
            ] = await Promise.all([
                api.get(riskUrl),

                api.get('/alerts'),

                api.get(
                    '/incidents?limit=50'
                )
            ]);

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
        refresh();

        /*
         * Refresh alerts every minute.
         */
        const timer =
            setInterval(
                async () => {
                    try {
                        const response =
                            await api.get(
                                '/alerts'
                            );

                        setAlerts(
                            response.data
                        );

                    } catch (error) {
                        console.error(
                            'Failed to refresh alerts:',
                            error
                        );
                    }
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