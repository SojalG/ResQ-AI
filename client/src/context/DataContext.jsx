import { createContext, useContext, useEffect, useState } from "react";

import { api, getPosition } from "../api";

const DataContext = createContext();

export function DataProvider({ children }) {
  const [risks, setRisks] = useState(null);

  const [alerts, setAlerts] = useState([]);

  const [incidents, setIncidents] = useState([]);

  const [loading, setLoading] = useState(true);

  const [locationName, setLocationName] = useState("Your location");

  const [position, setPosition] = useState(null);

  const refresh = async () => {
    try {
      const currentPosition = await getPosition();

      console.log("ResQAI location:", currentPosition);

      setPosition(currentPosition);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${currentPosition.lat}&lon=${currentPosition.lng}&zoom=10&addressdetails=1`,
        );

        if (response.ok) {
          const data = await response.json();
          const address = data.address || {};

          const city =
            address.city ||
            address.town ||
            address.municipality ||
            address.village ||
            address.county;

          const state = address.state;

          if (city) {
            setLocationName(state ? `${city}, ${state}` : city);
          }
        }
      } catch (error) {
        console.error("Failed to get location name:", error);
      }

      const riskUrl = `/risk/current?lat=${currentPosition.lat}&lng=${currentPosition.lng}`;

      const riskResponse = await api.get(riskUrl);

      const alertsResponse = await api.get("/alerts");

      const incidentsResponse = await api.get("/incidents?limit=50");

      setRisks(riskResponse.data);

      setAlerts(alertsResponse.data);

      setIncidents(incidentsResponse.data);
    } catch (error) {
      console.error("Failed to load ResQAI data:", error);
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
    const timer = setInterval(() => {
      refresh();
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <DataContext.Provider
      value={{
        risks,
        alerts,
        incidents,
        loading,
        locationName,
        position,
        refresh,
        setAlerts,
        setIncidents,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
