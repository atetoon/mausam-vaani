
import { useCallback, useEffect, useState } from "react";
import {
  Sun, Cloud, CloudSun, CloudFog, CloudRain, CloudSnow,
  CloudLightning, RefreshCw, MapPin, Droplets, Wind,
  Activity, Clock3
} from "lucide-react";

import Sidebar from "./components/Sidebar";
import { getWeather } from "./services/weather";

const pollutants = [
  { id: "PM2.5", name: "PM2.5", description: "Fine particles", unit: "µg/m³" },
  { id: "PM10", name: "PM10", description: "Coarse particles", unit: "µg/m³" },
  { id: "OZONE", name: "O₃", description: "Ozone", unit: "µg/m³" },
  { id: "NO2", name: "NO₂", description: "Nitrogen dioxide", unit: "µg/m³" },
  { id: "SO2", name: "SO₂", description: "Sulphur dioxide", unit: "µg/m³" },
  { id: "CO", name: "CO", description: "Carbon monoxide", unit: "mg/m³" },
  { id: "NH3", name: "NH₃", description: "Ammonia", unit: "µg/m³" },
];

const aqiCategories = [
  { label: "Good", value: "0", color: "#00b77b" },
  { label: "Satisfactory", value: "51", color: "#f5a000" },
  { label: "Moderate", value: "101", color: "#ff7417" },
  { label: "Poor", value: "201", color: "#ef4444" },
  { label: "Very Poor", value: "301", color: "#a855f7" },
  { label: "Severe", value: "401", color: "#86133f" },
];

function getWeatherInfo(code) {
  if (code === 0) return { label: "Clear sky", Icon: Sun };
  if (code === 1) return { label: "Mainly clear", Icon: Sun };
  if (code === 2) return { label: "Partly cloudy", Icon: CloudSun };
  if (code === 3) return { label: "Overcast", Icon: Cloud };
  if ([45, 48].includes(code)) return { label: "Foggy", Icon: CloudFog };
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return { label: "Rain", Icon: CloudRain };
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return { label: "Snow", Icon: CloudSnow };
  if ([95, 96, 99].includes(code))
    return { label: "Thunderstorm", Icon: CloudLightning };

  return { label: "Conditions unavailable", Icon: Cloud };
}

function getStateForCity(city) {
  const states = {
    Noida: "Uttar Pradesh",
    Delhi: "Delhi",
    Mumbai: "Maharashtra",
    Bengaluru: "Karnataka",
    Bangalore: "Karnataka",
    Kolkata: "West Bengal",
    Chennai: "Tamil Nadu",
  };

  return states[city] || "Uttar Pradesh";
}

function App() {
  const [city, setCity] = useState("Noida");
  const [activePage, setActivePage] = useState("dashboard");

  const [weather, setWeather] = useState(null);
  const [airQuality, setAirQuality] = useState(null);

  const [weatherLoading, setWeatherLoading] = useState(false);
  const [aqLoading, setAqLoading] = useState(false);

  const [weatherError, setWeatherError] = useState("");
  const [aqError, setAqError] = useState("");

  const loadDashboard = useCallback(async (selectedCity) => {
    const state = getStateForCity(selectedCity);

    setWeatherLoading(true);
    setAqLoading(true);
    setWeatherError("");
    setAqError("");

    const weatherRequest = getWeather(selectedCity)
      .then(setWeather)
      .catch((error) => {
        setWeather(null);
        setWeatherError(error.message || "Unable to fetch weather.");
      })
      .finally(() => setWeatherLoading(false));

    const aqRequest = fetch(
      `http://localhost:8000/api/air-quality/?city=${encodeURIComponent(selectedCity)}&state=${encodeURIComponent(state)}`
    )
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.detail || `Request failed (${response.status})`);
        }

        return response.json();
      })
      .then(setAirQuality)
      .catch((error) => {
        setAirQuality(null);
        setAqError(error.message || "Unable to fetch CPCB data.");
      })
      .finally(() => setAqLoading(false));

    await Promise.allSettled([weatherRequest, aqRequest]);
  }, []);

  useEffect(() => {
    loadDashboard(city);
  }, [city, loadDashboard]);

  const current = weather?.current;
  const daily = weather?.daily;

  const condition = current
    ? getWeatherInfo(current.weather_code)
    : { label: "Weather unavailable", Icon: Cloud };

  const WeatherIcon = condition.Icon;

  const records = airQuality?.records || [];

  const latestUpdate = records.length
    ? records.reduce((latest, record) => {
        return record.last_update > latest ? record.last_update : latest;
      }, "")
    : null;

  function getPollutantRecords(id) {
    return records
      .filter((record) => record.pollutant_id === id)
      .map((record) => ({
        ...record,
        numericValue:
          record.avg_value !== "NA" && record.avg_value !== ""
            ? Number(record.avg_value)
            : null,
      }))
      .filter((record) => Number.isFinite(record.numericValue));
  }

  function getHighestReading(id) {
    const readings = getPollutantRecords(id);

    if (!readings.length) return null;

    return readings.reduce((highest, reading) =>
      reading.numericValue > highest.numericValue ? reading : highest
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#14243a]">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        selectedCity={city}
        setSelectedCity={setCity}
      />

      <main className="min-h-screen px-5 py-7 md:ml-[226px] md:px-7 lg:px-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-[23px] font-semibold tracking-tight text-[#10233d] sm:text-[26px]">
              {activePage === "dashboard"
                ? "Air Quality Index & Realtime Air Pollution"
                : activePage === "india"
                  ? "India overview"
                  : "Most polluted cities"}
            </h1>

            <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-slate-500">
              <MapPin size={14} />
              Live air quality and weather for {weather?.location?.name || city}
              {weather?.location?.admin1 ? `, ${weather.location.admin1}` : ""}
            </p>
          </div>

          <button
            onClick={() => loadDashboard(city)}
            disabled={weatherLoading || aqLoading}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={weatherLoading || aqLoading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </header>

        {activePage !== "dashboard" ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8">
            <p className="text-sm text-slate-500">
              This page is under development.
            </p>
          </div>
        ) : (
          <>
            {weatherError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                Weather error: {weatherError}
              </div>
            )}

            {aqError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                CPCB error: {aqError}
              </div>
            )}

            <section className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_206px]">
              <article className="rounded-2xl border border-slate-200 bg-gradient-to-br from-[#fff5ed] via-white to-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[13px] font-medium text-slate-700">
                    Live AQI in {city}
                  </p>

                  <span className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className={`size-2 rounded-full ${records.length ? "bg-emerald-500" : "bg-slate-300"}`} />
                    {aqLoading ? "Fetching CPCB data..." : records.length ? "CPCB data connected" : "Data unavailable"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <span className="text-6xl font-semibold leading-none text-slate-300">
                    —
                  </span>
                  <span className="mb-1 text-xs text-slate-400">
                    India AQI
                  </span>
                </div>

                <div className="mt-4 inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-[11px] text-slate-500">
                  <Activity size={13} className="mr-2" />
                  Official city AQI not calculated
                </div>

                <p className="mt-3 max-w-xl text-xs leading-5 text-slate-500">
                  CPCB pollutant measurements are available below by monitoring
                  station. A city AQI value requires the prescribed CPCB
                  calculation and valid pollutant sub-indices.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {["PM2.5", "PM10"].map((id) => {
                    const reading = getHighestReading(id);

                    return (
                      <div
                        key={id}
                        className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3"
                      >
                        <p className="text-[11px] text-slate-500">{id}</p>
                        <p className="mt-1 text-xl font-semibold">
                          {reading ? reading.numericValue : "—"}
                          <span className="ml-1 text-[10px] font-normal text-slate-400">
                            µg/m³
                          </span>
                        </p>
                        <p className="mt-1 truncate text-[9px] text-slate-400">
                          {reading ? `Highest: ${reading.station}` : "No valid reading"}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5">
                  <div className="flex h-2 overflow-hidden rounded-full">
                    {aqiCategories.map((category) => (
                      <div
                        key={category.label}
                        className="flex-1"
                        style={{ backgroundColor: category.color }}
                      />
                    ))}
                  </div>

                  <div className="mt-2 flex justify-between gap-1">
                    {aqiCategories.map((category) => (
                      <div key={category.label}>
                        <p className="text-[9px] text-slate-500">
                          {category.value}
                        </p>
                        <p className="hidden text-[9px] text-slate-400 sm:block">
                          {category.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-[15px] font-semibold">
                  Weather in {weather?.location?.name || city}
                </h2>

                {weatherLoading && !current ? (
                  <div className="flex min-h-48 items-center justify-center text-xs text-slate-400">
                    Loading weather...
                  </div>
                ) : current ? (
                  <>
                    <div className="mt-5 flex items-center gap-3">
                      <WeatherIcon size={43} className="shrink-0 text-amber-400" />
                      <div>
                        <p className="text-4xl font-medium tracking-tight">
                          {Math.round(current.temperature_2m)}°
                          <span className="text-base">C</span>
                        </p>
                        <p className="mt-1 truncate text-[11px] text-slate-500">
                          {condition.label}
                        </p>
                      </div>
                    </div>

                    <div className="my-5 border-t border-slate-100" />

                    <div className="grid grid-cols-2 gap-x-3 gap-y-5">
                      <WeatherMetric
                        icon={Droplets}
                        label="Humidity"
                        value={`${current.relative_humidity_2m}%`}
                      />
                      <WeatherMetric
                        icon={Wind}
                        label="Wind"
                        value={`${current.wind_speed_10m} km/h`}
                      />
                      <WeatherMetric
                        icon={Sun}
                        label="UV index"
                        value={daily?.uv_index_max?.[0] ?? "—"}
                      />
                      <WeatherMetric
                        icon={CloudRain}
                        label="Rain chance"
                        value={`${daily?.precipitation_probability_max?.[0] ?? "—"}%`}
                      />
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-3 text-[9px] text-slate-400">
                      Source: {weather.source}
                    </div>
                  </>
                ) : (
                  <div className="flex min-h-48 items-center justify-center text-center text-xs text-slate-400">
                    Weather data unavailable
                  </div>
                )}
              </article>
            </section>

            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="text-[16px] font-semibold">
                  Air pollutants in {city}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Highest valid reported average from available monitoring
                  stations. Select readings are station-specific, not city averages.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {pollutants.map((pollutant) => {
                  const readings = getPollutantRecords(pollutant.id);
                  const highest = getHighestReading(pollutant.id);

                  return (
                    <article
                      key={pollutant.id}
                      className="overflow-hidden rounded-xl border border-slate-200"
                    >
                      <div className="h-1 bg-slate-200" />
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold">
                            {pollutant.name}
                          </p>
                          <span className="text-[9px] text-slate-400">
                            {readings.length} stations
                          </span>
                        </div>

                        <p className="mt-0.5 text-[10px] text-slate-500">
                          {pollutant.description}
                        </p>

                        <p className={`mt-3 text-2xl font-semibold ${highest ? "text-slate-800" : "text-slate-300"}`}>
                          {highest ? highest.numericValue : "—"}
                          <span className="ml-1 text-[10px] font-normal text-slate-400">
                            {pollutant.unit}
                          </span>
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {highest
                            ? `Highest: ${highest.station}`
                            : "No valid reading available"}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>

              {latestUpdate && (
                <p className="mt-5 border-t border-slate-100 pt-3 text-[10px] text-slate-400">
                  <Clock3 size={12} className="mr-1 inline" />
                  Latest reported update: {latestUpdate}
                  {" · "}
                  Source: CPCB / data.gov.in
                </p>
              )}

              {aqLoading && (
                <p className="mt-3 text-[11px] text-slate-400">
                  Updating monitoring station readings...
                </p>
              )}
            </section>

            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-[16px] font-semibold">
                    AQI history in {city}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Historical air quality readings
                  </p>
                </div>

                <div className="flex gap-1">
                  {["12H", "24H", "7D", "30D"].map((period, index) => (
                    <button
                      key={period}
                      disabled
                      className={`rounded-md px-3 py-1.5 text-[10px] ${
                        index === 1
                          ? "bg-blue-50 text-blue-600"
                          : "text-slate-400"
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex min-h-52 flex-col items-center justify-center text-center">
                <Clock3 size={28} className="text-slate-300" />
                <p className="mt-3 text-xs font-medium text-slate-500">
                  Historical AQI data not connected
                </p>
                <p className="mt-1 max-w-sm text-[10px] text-slate-400">
                  Historical readings require a storage layer to retain
                  previous CPCB API responses.
                </p>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function WeatherMetric({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <Icon size={15} className="mt-0.5 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="text-[10px] text-slate-500">{label}</p>
        <p className="mt-0.5 truncate text-xs font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

export default App;
