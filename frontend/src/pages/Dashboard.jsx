
import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudFog,
  CloudRain,
  CloudSnow,
  CloudLightning,
  RefreshCw,
  MapPin,
  Droplets,
  Wind,
  Thermometer,
  Activity,
  Clock3,
  Gauge,
  Sunrise,
  Sunset,
} from "lucide-react";

import { getWeather, getAirQuality } from "../services/weather";

const pollutants = [
  { key: "pm2_5", name: "PM2.5", description: "Fine particles", unit: "µg/m³" },
  { key: "pm10", name: "PM10", description: "Coarse particles", unit: "µg/m³" },
  { key: "ozone", name: "O₃", description: "Ozone", unit: "µg/m³" },
  { key: "nitrogen_dioxide", name: "NO₂", description: "Nitrogen dioxide", unit: "µg/m³" },
  { key: "sulphur_dioxide", name: "SO₂", description: "Sulphur dioxide", unit: "µg/m³" },
  { key: "carbon_monoxide", name: "CO", description: "Carbon monoxide", unit: "µg/m³" },
  { key: "ammonia", name: "NH₃", description: "Ammonia", unit: "µg/m³" },
];

function getWeatherInfo(code) {
  if (code === 0) return { label: "Clear sky", Icon: Sun };
  if (code === 1) return { label: "Mainly clear", Icon: Sun };
  if (code === 2) return { label: "Partly cloudy", Icon: CloudSun };
  if (code === 3) return { label: "Overcast", Icon: Cloud };

  if ([45, 48].includes(code)) {
    return { label: "Foggy", Icon: CloudFog };
  }

  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { label: "Rain", Icon: CloudRain };
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { label: "Snow", Icon: CloudSnow };
  }

  if ([95, 96, 99].includes(code)) {
    return { label: "Thunderstorm", Icon: CloudLightning };
  }

  return { label: "Conditions unavailable", Icon: Cloud };
}

function getAqiCategory(value) {
  if (value == null || !Number.isFinite(Number(value))) {
    return { label: "Unavailable", color: "text-slate-500", bg: "bg-slate-100" };
  }

  const aqi = Number(value);

  if (aqi <= 50) return { label: "Good", color: "text-green-700", bg: "bg-green-100" };
  if (aqi <= 100) return { label: "Moderate", color: "text-yellow-700", bg: "bg-yellow-100" };
  if (aqi <= 150) return { label: "Unhealthy for Sensitive Groups", color: "text-orange-700", bg: "bg-orange-100" };
  if (aqi <= 200) return { label: "Unhealthy", color: "text-red-700", bg: "bg-red-100" };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "text-purple-700", bg: "bg-purple-100" };

  return { label: "Hazardous", color: "text-rose-800", bg: "bg-rose-100" };
}

function formatHour(time) {
  if (!time) return "";

  const hour = Number(time.slice(11, 13));

  return new Date(Date.UTC(2020, 0, 1, hour)).toLocaleTimeString(
    "en-IN",
    {
      hour: "numeric",
      hour12: true,
      timeZone: "UTC",
    }
  );
}

function formatDay(date) {
  if (!date) return "";

  const [year, month, day] = date.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(
    "en-IN",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }
  );
}

function Dashboard() {
  const { selectedCity: city } = useOutletContext();

  const [weather, setWeather] = useState(null);
  const [airQuality, setAirQuality] = useState(null);

  const [weatherLoading, setWeatherLoading] = useState(false);
  const [aqLoading, setAqLoading] = useState(false);

  const [weatherError, setWeatherError] = useState("");
  const [aqError, setAqError] = useState("");

  const loadDashboard = useCallback(async (selectedCity) => {
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

    const airRequest = getAirQuality(selectedCity)
      .then(setAirQuality)
      .catch((error) => {
        setAirQuality(null);
        setAqError(error.message || "Unable to fetch air quality.");
      })
      .finally(() => setAqLoading(false));

    await Promise.allSettled([weatherRequest, airRequest]);
  }, []);

  useEffect(() => {
    loadDashboard(city);
  }, [city, loadDashboard]);

  const current = weather?.current;
  const hourly = weather?.hourly;
  const daily = weather?.daily;
  const timezone = weather?.timezone;

  const currentCondition = current
    ? getWeatherInfo(current.weather_code)
    : { label: "Weather unavailable", Icon: Cloud };

  const CurrentWeatherIcon = currentCondition.Icon;

  // The current observation is displayed separately.
  // Forecast cards begin with the first hour after the current observation.
  const next24Hours = useMemo(() => {
    if (!hourly?.time || !current?.time) return [];

    const currentTime = new Date(current.time).getTime();

    const startIndex = hourly.time.findIndex(
      (time) => new Date(time).getTime() > currentTime
    );

    if (startIndex === -1) return [];

    return hourly.time.slice(startIndex, startIndex + 24).map((time, offset) => {
      const index = startIndex + offset;

      return {
        time,
        temperature: hourly.temperature_2m?.[index],
        apparentTemperature: hourly.apparent_temperature?.[index],
        weatherCode: hourly.weather_code?.[index],
        rainChance: hourly.precipitation_probability?.[index],
        precipitation: hourly.precipitation?.[index],
        isDay: hourly.is_day?.[index],
      };
    });
  }, [hourly, current]);

  const usAqi = airQuality?.current?.us_aqi;
  const aqiCategory = getAqiCategory(usAqi);

  const aqiValues = airQuality?.current || {};

  const uvIndex = daily?.uv_index_max?.[0];
  const rainChance = daily?.precipitation_probability_max?.[0];

  return (
    <div className="min-h-screen bg-[#f7f9fc] px-5 py-7 text-[#14243a] md:px-7 lg:px-8">
      {/* Header */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[23px] font-semibold tracking-tight text-[#10233d] sm:text-[26px]">
            Air Quality Index & Realtime Air Pollution
          </h1>

          <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-slate-500">
            <MapPin size={14} />
            Weather and air quality for {weather?.location?.name || city}
          </p>
        </div>

        <button
          onClick={() => loadDashboard(city)}
          disabled={weatherLoading || aqLoading}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={weatherLoading || aqLoading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </header>

      {/* Errors */}
      {weatherError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          Weather error: {weatherError}
        </div>
      )}

      {aqError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          Air quality error: {aqError}
        </div>
      )}

      {/* AQI and Current Weather */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(340px,1fr)]">
        {/* AQI Card */}
        <article className="rounded-2xl border border-slate-200 bg-gradient-to-br from-[#fff5ed] via-white to-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px] font-medium text-slate-700">
              Live Air Quality in {city}
            </p>

            <span className="flex items-center gap-2 text-[11px] text-slate-500">
              <span
                className={`size-2 rounded-full ${
                  airQuality ? "bg-emerald-500" : "bg-slate-300"
                }`}
              />
              {aqLoading
                ? "Fetching data..."
                : airQuality
                  ? "CAMS data connected"
                  : "Data unavailable"}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap items-end gap-4">
            <div>
              <p className="text-6xl font-semibold leading-none tracking-tight text-[#14243a]">
                {usAqi ?? "—"}
              </p>
              <p className="mt-2 text-xs text-slate-500">US Air Quality Index</p>
            </div>

            {usAqi != null && (
              <span className={`mb-1 rounded-full px-3 py-1.5 text-xs font-medium ${aqiCategory.bg} ${aqiCategory.color}`}>
                {aqiCategory.label}
              </span>
            )}
          </div>

          <div className="mt-5">
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-500"
                style={{
                  width: `${Math.min((Number(usAqi) / 500) * 100, 100)}%`,
                }}
              />
            </div>

            <div className="mt-2 flex justify-between text-[9px] text-slate-400">
              <span>0 · Good</span>
              <span>100</span>
              <span>200</span>
              <span>300</span>
              <span>500 · Hazardous</span>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-white/80 p-3">
            <p className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
              <Activity size={14} />
              Data source and AQI standard
            </p>
            <p className="mt-1 text-[10px] leading-5 text-slate-500">
              Open-Meteo / CAMS model-based estimates. This is US AQI, not an
              official CPCB station measurement or Indian National AQI.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: "European AQI", value: airQuality?.current?.european_aqi },
              { label: "PM2.5", value: aqiValues.pm2_5, unit: "µg/m³" },
              { label: "PM10", value: aqiValues.pm10, unit: "µg/m³" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3"
              >
                <p className="text-[10px] text-slate-500">{item.label}</p>
                <p className="mt-1 text-xl font-semibold">
                  {item.value ?? "—"}
                  {item.unit && (
                    <span className="ml-1 text-[9px] font-normal text-slate-400">
                      {item.unit}
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </article>

        {/* Current Weather Card */}
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Current weather
              </p>
              <h2 className="mt-1 text-lg font-semibold">
                {weather?.location?.name || city}
              </h2>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] text-slate-500">
              Live
            </span>
          </div>

          {weatherLoading && !current ? (
            <div className="flex min-h-48 items-center justify-center text-xs text-slate-400">
              Loading weather...
            </div>
          ) : current ? (
            <>
              <div className="mt-6 flex items-center gap-5">
                <CurrentWeatherIcon
                  size={64}
                  strokeWidth={1.4}
                  className="shrink-0 text-amber-400"
                />

                <div>
                  <p className="text-6xl font-semibold tracking-tight">
                    {Math.round(current.temperature_2m)}°
                    <span className="text-2xl font-normal">C</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {currentCondition.label}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Feels like {Math.round(current.apparent_temperature)}°C
              </p>

              <div className="my-6 border-t border-slate-100" />

              <div className="grid grid-cols-2 gap-x-5 gap-y-6">
                <WeatherMetric
                  icon={Droplets}
                  label="Humidity"
                  value={`${current.relative_humidity_2m}%`}
                />

                <WeatherMetric
                  icon={Wind}
                  label="Wind speed"
                  value={`${current.wind_speed_10m} km/h`}
                />

                <WeatherMetric
                  icon={Sun}
                  label="UV index (today's max)"
                  value={uvIndex ?? "—"}
                />

                <WeatherMetric
                  icon={CloudRain}
                  label="Rain chance today"
                  value={rainChance != null ? `${rainChance}%` : "—"}
                />

                <WeatherMetric
                  icon={Thermometer}
                  label="Precipitation now"
                  value={`${current.precipitation} mm`}
                />

                <WeatherMetric
                  icon={Gauge}
                  label="Wind direction"
                  value={`${current.wind_direction_10m}°`}
                />
              </div>

              <div className="mt-6 border-t border-slate-100 pt-3 text-[10px] text-slate-400">
                Source: {weather.source}
              </div>
            </>
          ) : (
            <div className="flex min-h-48 items-center justify-center text-xs text-slate-400">
              Weather data unavailable
            </div>
          )}
        </article>
      </section>

      {/* Next 24 Hours */}
      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-semibold">Hourly weather forecast</h2>
            <p className="mt-1 text-xs text-slate-500">
              Current conditions and the next 24 hours in {city}
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <Clock3 size={14} />
            Local time
          </div>
        </div>

        {!hourly ? (
          <div className="flex min-h-32 items-center justify-center text-xs text-slate-400">
            {weatherLoading ? "Loading hourly forecast..." : "Hourly forecast unavailable"}
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-3">
            {/* Current observation */}
            {current && (
              <div className="flex min-w-[100px] flex-col items-center rounded-xl bg-slate-50 px-4 py-4">
                <span className="text-xs font-semibold text-slate-600">Now</span>

                <CurrentWeatherIcon
                  size={29}
                  className="my-4 text-amber-400"
                />

                <span className="text-2xl font-semibold">
                  {Math.round(current.temperature_2m)}°
                </span>

                <span className="mt-2 text-[10px] text-slate-400">
                  Current
                </span>
              </div>
            )}

            {next24Hours.map((hour) => {
              const { Icon } = getWeatherInfo(hour.weatherCode);

              return (
                <div
                  key={hour.time}
                  className="flex min-w-[100px] flex-col items-center rounded-xl border border-slate-100 px-4 py-4 transition hover:bg-slate-50"
                >
                  <span className="text-xs font-medium text-slate-500">
                    {formatHour(hour.time, timezone)}
                  </span>

                  <Icon
                    size={29}
                    className={`my-4 ${
                      hour.isDay ? "text-amber-400" : "text-slate-500"
                    }`}
                  />

                  <span className="text-2xl font-semibold">
                    {hour.temperature != null
                      ? `${Math.round(hour.temperature)}°`
                      : "—"}
                  </span>

                  <span className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
                    <Droplets size={11} />
                    {hour.rainChance ?? "—"}%
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-2 text-[10px] text-slate-400">
          Rain probability is the forecast probability for each hour.
          Forecast data is provided by Open-Meteo.
        </p>
      </section>

      {/* Five-day Forecast */}
      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-[17px] font-semibold">5-day weather forecast</h2>
          <p className="mt-1 text-xs text-slate-500">
            Daily temperature and precipitation outlook
          </p>
        </div>

        {daily?.time?.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {daily.time.map((date, index) => (
              <div
                key={date}
                className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"
              >
                <p className="text-xs font-semibold text-slate-600">
                  {index === 0 ? "Today" : formatDay(date, timezone)}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <Sun size={25} className="text-amber-400" />
                  <span className="text-sm font-semibold">
                    {Math.round(daily.temperature_2m_max[index])}°
                    <span className="ml-1 font-normal text-slate-400">
                      / {Math.round(daily.temperature_2m_min[index])}°
                    </span>
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-[10px] text-slate-500">
                  <Droplets size={12} />
                  Rain chance: {daily.precipitation_probability_max[index] ?? "—"}%
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-10 text-center text-xs text-slate-400">
            Daily forecast unavailable
          </p>
        )}
      </section>

      {/* Pollutants */}
      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-[17px] font-semibold">
            Air pollutants in {city}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Current pollutant concentrations estimated by CAMS.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {pollutants.map((pollutant) => {
            const value = aqiValues[pollutant.key];

            return (
              <article
                key={pollutant.key}
                className="overflow-hidden rounded-xl border border-slate-200"
              >
                <div className="h-1 bg-slate-200" />

                <div className="p-4">
                  <p className="text-xs font-semibold">{pollutant.name}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    {pollutant.description}
                  </p>

                  <p className={`mt-3 text-2xl font-semibold ${
                    value != null ? "text-slate-800" : "text-slate-300"
                  }`}>
                    {value ?? "—"}
                    <span className="ml-1 text-[10px] font-normal text-slate-400">
                      {pollutant.unit}
                    </span>
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-5 border-t border-slate-100 pt-3 text-[10px] text-slate-400">
          Source: Open-Meteo / CAMS · Model-based air quality estimates, not
          direct monitoring station readings.
        </p>
      </section>

      {/* AQI History placeholder */}
      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <h2 className="text-[17px] font-semibold">AQI history in {city}</h2>
          <p className="mt-1 text-xs text-slate-500">
            Historical air quality trends
          </p>
        </div>

        <div className="flex min-h-48 flex-col items-center justify-center text-center">
          <Clock3 size={28} className="text-slate-300" />

          <p className="mt-3 text-xs font-medium text-slate-500">
            Historical AQI data not connected
          </p>

          <p className="mt-1 max-w-sm text-[10px] text-slate-400">
            Historical trends will be available once historical readings are
            stored and connected to the dashboard.
          </p>
        </div>
      </section>
    </div>
  );
}

function WeatherMetric({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <Icon size={16} className="mt-0.5 shrink-0 text-slate-400" />

      <div className="min-w-0">
        <p className="text-[10px] text-slate-500">{label}</p>
        <p className="mt-0.5 truncate text-xs font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
