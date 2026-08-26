import { useEffect, useState } from "react";
import {
  ArrowRight,
  Droplets,
  Eye,
  MapPinned,
  Sun,
  TriangleAlert,
  Wind,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import { formatAgo, getPosition } from "../api";
import { SectionTitle, SeverityBadge, Skeleton } from "../components/UI";
import MapPanel from "../components/MapPanel";
const riskMeta = [
  ["floodRisk", "Flood risk", Droplets],
  ["heatwaveRisk", "Heatwave risk", Sun],
  ["stormRisk", "Storm risk", Zap],
  ["airQualityRisk", "Air quality", Wind],
];
function riskColor(v) {
  return v > 60
    ? ["bg-red-500", "text-red-700 bg-red-50", "High"]
    : v > 30
      ? ["bg-amber-400", "text-amber-700 bg-amber-50", "Watch"]
      : ["bg-emerald-500", "text-emerald-700 bg-emerald-50", "Low"];
}
function RiskCard({ meta, value }) {
  const [key, label, Icon] = meta;
  const c = riskColor(value || 0);
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700">
          <Icon size={20} />
        </span>
        <span className={`badge ${c[1]}`}>{c[2]}</span>
      </div>
      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight text-ink">
            {Math.round(value || 0)}
            <span className="text-lg text-slate-400">%</span>
          </p>
        </div>
        <span className="text-[10px] font-bold uppercase text-slate-400">
          Live
        </span>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${c[0]}`}
          style={{ width: `${value || 0}%` }}
        />
      </div>
    </div>
  );
}
function Weather() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const p = await getPosition();
        const key = import.meta.env.VITE_OPENWEATHER_API_KEY;

        if (key) {
          try {
            const response = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${p.lat}&lon=${p.lng}&units=metric&appid=${key}`,
            );

            if (response.ok) {
              const d = await response.json();

              setWeather({
                city: d.name || "Lucknow",
                temp: Math.round(d.main.temp),
                humidity: d.main.humidity,
                wind: Math.round(d.wind.speed * 3.6),
                condition: d.weather?.[0]?.main || "Clear",
              });

              return;
            }
          } catch (error) {
            console.error("Weather API error:", error);
          }
        }

        // Fallback
        setWeather({
          city: "Lucknow, India",
          temp: 34,
          humidity: 68,
          wind: 11,
          condition: "Partly cloudy",
        });
      } catch (error) {
        console.error("Location/weather error:", error);

        setWeather({
          city: "Lucknow, India",
          temp: 34,
          humidity: 68,
          wind: 11,
          condition: "Partly cloudy",
        });
      }
    })();
  }, []);

  if (!weather) {
    return <Skeleton className="h-[250px]" />;
  }

  return (
    <div className="card overflow-hidden p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="eyebrow !text-teal-500">Local conditions</p>

          <h3 className="mt-2 font-bold text-ink">{weather.city}</h3>
        </div>

        <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-50">
          <Sun className="text-amber-400" size={28} />
        </div>
      </div>

      {/* Temperature */}
      <div className="mt-8 flex items-end justify-between">
        <div>
          <span className="text-6xl font-extrabold tracking-tighter text-ink">
            {weather.temp}°
          </span>
        </div>

        <span className="mb-2 text-xs font-semibold text-slate-400">
          {weather.condition}
        </span>
      </div>

      {/* Divider */}
      <div className="mt-7 border-t border-slate-100 pt-5">
        <div className="grid grid-cols-2 gap-5">
          {/* Humidity */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Humidity</span>

            <b className="text-xs font-bold text-ink">{weather.humidity}%</b>
          </div>

          {/* Wind */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Wind</span>

            <b className="text-xs font-bold text-ink">{weather.wind} km/h</b>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function Dashboard() {
  const { risks, alerts, incidents, loading } = useData();
  return (
    <div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:py-10">
      <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Citizen intelligence · Lucknow</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            Your city, in view.
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Live risk intelligence and verified community reports, distilled
            into the things that matter now.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-xs font-semibold text-slate-600">
          <i className="h-2 w-2 rounded-full bg-emerald-500" /> Updated just now
        </div>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-[190px]" />
            ))
          : riskMeta.map((m) => (
              <RiskCard key={m[0]} meta={m} value={risks?.[m[0]]} />
            ))}
      </section>
      <section className="mt-7 grid gap-6 lg:grid-cols-[.86fr_1.5fr]">
        <Weather />
        <div className="card p-5 sm:p-6">
          <SectionTitle
            eyebrow="What needs attention"
            title="Active alerts"
            action={
              <Link className="text-xs font-bold text-teal-700" to="/chat">
                Ask ResQAI <ArrowRight className="inline" size={14} />
              </Link>
            }
          />
          <div className="space-y-3">
            {loading
              ? Array.from({ length: 3 }, (_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))
              : alerts.slice(0, 3).map((a) => (
                  <div
                    key={a._id}
                    className="group rounded-xl border border-slate-100 p-4 transition hover:border-slate-300"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <SeverityBadge level={a.severity} />
                      <b className="text-sm text-ink">{a.title}</b>
                      <span className="ml-auto text-[10px] font-semibold text-slate-400">
                        {formatAgo(a.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-600">
                      {a.message}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                      {a.recommendations?.slice(0, 2).map((x) => (
                        <span
                          className="text-[11px] font-semibold text-slate-500"
                          key={x}
                        >
                          • {x}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>
      <section className="card mt-7 overflow-hidden">
        <div className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <p className="eyebrow">Community signal</p>
            <h2 className="mt-2 text-xl font-extrabold text-ink">
              Live incident map
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-2">
              <i className="h-2 w-2 rounded-full bg-red-500" /> High severity
            </span>
            <span className="flex items-center gap-2">
              <i className="h-2 w-2 rounded-full bg-teal-700" /> Reports
            </span>
            <Link to="/report" className="btn-primary !py-2">
              <MapPinned size={15} /> Report incident
            </Link>
          </div>
        </div>
        <MapPanel incidents={incidents} />
      </section>
      <section className="mt-7 grid gap-4 md:grid-cols-3">
        <div className="card flex items-center gap-4 p-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-red-500">
            <TriangleAlert />
          </span>
          <div>
            <b className="text-2xl text-ink">
              {incidents.filter((i) => i.status !== "Resolved").length}
            </b>
            <p className="text-xs font-semibold text-slate-500">
              Open community reports
            </p>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
            <Eye />
          </span>
          <div>
            <b className="text-2xl text-ink">24/7</b>
            <p className="text-xs font-semibold text-slate-500">
              City monitoring active
            </p>
          </div>
        </div>
        <Link
          to="/chat"
          className="card flex items-center justify-between p-5 transition hover:-translate-y-1"
        >
          <div>
            <b className="text-ink">Unsure what to do?</b>
            <p className="mt-1 text-xs text-slate-500">
              Ask the preparedness assistant
            </p>
          </div>
          <ArrowRight className="text-teal-700" />
        </Link>
      </section>
    </div>
  );
}
