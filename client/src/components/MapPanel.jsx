import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";

const center = [26.8467, 80.9462];

const markerIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function RecenterMap({ position }) {
  const map = useMap();

  useEffect(() => {
    if (
      position &&
      typeof position.lat === 'number' &&
      typeof position.lng === 'number'
    ) {
      map.setView(
        [position.lat, position.lng],
        12
      );
    }
  }, [position, map]);

  return null;
}

function MapClickHandler({ pickable, onPick }) {
  useMapEvents({
    click(e) {
      if (!pickable) return;

      onPick?.({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  return null;
}

export default function MapPanel({
  incidents = [],
  height = 390,
  pickable = false,
  position,
  onPick,
}) {
  const [active, setActive] = useState(null);

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{ width: "100%", height }}
    >
      <MapContainer
        center={position ? [position.lat, position.lng] : center}
        zoom={12}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%" }}
      >
        <RecenterMap position={position} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler pickable={pickable} onPick={onPick} />

        {incidents.map((incident) => {
          const lat = incident?.location?.lat;
          const lng = incident?.location?.lng;

          if (typeof lat !== "number" || typeof lng !== "number") {
            return null;
          }

          const isHigh = incident?.aiAnalysis?.severity === "High";

          return (
            <Marker
              key={incident._id || incident.id}
              position={[lat, lng]}
              icon={markerIcon}
              eventHandlers={{
                click: () => setActive(incident),
              }}
            >
              <Popup>
                <div className="max-w-[220px]">
                  <strong>{incident.type}</strong>

                  <p className="mt-1 text-xs">{incident.description}</p>

                  {incident?.aiAnalysis?.severity && (
                    <p className="mt-2 text-xs font-semibold">
                      Severity: {incident.aiAnalysis.severity}
                    </p>
                  )}
                </div>
              </Popup>

              {isHigh && (
                <Circle
                  center={[lat, lng]}
                  radius={500}
                  pathOptions={{
                    color: "red",
                    fillColor: "red",
                    fillOpacity: 0.12,
                  }}
                />
              )}
            </Marker>
          );
        })}

        {position &&
          typeof position.lat === "number" &&
          typeof position.lng === "number" && (
            <Marker position={[position.lat, position.lng]} icon={markerIcon}>
              <Popup>Your selected location</Popup>
            </Marker>
          )}
      </MapContainer>

      <div className="absolute bottom-3 left-3 z-[1000] rounded-lg bg-white/90 px-3 py-2 text-[11px] font-bold text-slate-600 shadow">
        © OpenStreetMap contributors
      </div>

      {active && (
        <div className="absolute right-3 top-3 z-[1000] max-w-[240px] rounded-xl bg-white p-3 text-xs shadow-xl">
          <b>{active.type}</b>

          <p className="mt-1 text-slate-600">{active.description}</p>

          <button
            className="mt-2 font-bold text-teal-700"
            onClick={() => setActive(null)}
          >
            Close
          </button>
        </div>
      )}

      {pickable && (
        <div className="pointer-events-none absolute right-3 top-3 z-[1000] rounded-lg bg-black/70 px-3 py-2 text-xs text-white">
          Click anywhere on the map to select a location
        </div>
      )}
    </div>
  );
}
