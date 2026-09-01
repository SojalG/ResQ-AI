import { createContext, useContext, useEffect, useState } from "react";

import { api, getPosition } from "../api";

const DataContext = createContext();

export function DataProvider({ children }) {
  const [risks, setRisks] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [position, setPosition] = useState(null);
  const [locationName, setLocationName] = useState("Your location");

  const refresh = async () => {
    try {
      const currentPosition = await getPosition();

      console.log("ResQAI location:", currentPosition);

      setPosition(currentPosition);

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

  /*
   * Get city/place name only when
   * the user's position changes.
   */
  useEffect(() => {
    if (!position) return;

    let cancelled = false;

    const getLocationName = async () => {
      try {
        const lat = position.lat.toFixed(3);
        const lng = position.lng.toFixed(3);

        const response = await api.get(
          `/location/reverse?lat=${lat}&lng=${lng}`,
        );

        if (!cancelled) {
          setLocationName(response.data.name || "Your location");
        }
      } catch (error) {
        console.error("Failed to get location name:", error);
      }
    };

    getLocationName();

    return () => {
      cancelled = true;
    };
  }, [
    position?.lat ? position.lat.toFixed(3) : null,
    position?.lng ? position.lng.toFixed(3) : null,
  ]);

  useEffect(() => {
    refresh();

    const timer = setInterval(refresh, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <DataContext.Provider
      value={{
        risks,
        alerts,
        incidents,
        loading,
        refresh,
        position,
        locationName,
        setAlerts,
        setIncidents,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
