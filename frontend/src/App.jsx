
import { useState } from "react";
import {
  Search, MapPin, Cloud, CloudRain, Sun, Wind, Droplets,
  Eye, Gauge, Sunrise, Sunset, CloudSun
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, Tooltip
} from "recharts";
import "./App.css";

const hourly = [
  { time: "09 AM", temp: 18 },
  { time: "10 AM", temp: 20 },
  { time: "11 AM", temp: 23 },
  { time: "12 PM", temp: 25 },
  { time: "01 PM", temp: 24 },
  { time: "02 PM", temp: 22 },
  { time: "03 PM", temp: 21 },
  { time: "04 PM", temp: 19 },
  { time: "05 PM", temp: 17 },
];

const week = [
  ["Today", "Cloudy", 24, 16, Cloud],
  ["Tuesday", "Light rain", 22, 15, CloudRain],
  ["Wednesday", "Partly cloudy", 25, 17, CloudSun],
  ["Thursday", "Sunny", 27, 18, Sun],
  ["Friday", "Cloudy", 23, 16, Cloud],
  ["Saturday", "Light rain", 21, 14, CloudRain],
  ["Sunday", "Partly cloudy", 24, 15, CloudSun],
];

const metrics = [
  { label: "WIND SPEED", value: "12", unit: "km/h", Icon: Wind, note: "NW direction" },
  { label: "HUMIDITY", value: "64", unit: "%", Icon: Droplets, note: "Normal range" },
  { label: "VISIBILITY", value: "10", unit: "km", Icon: Eye, note: "Clear visibility" },
  { label: "PRESSURE", value: "1013", unit: "hPa", Icon: Gauge, note: "Near standard" },
  { label: "SUNRISE", value: "06:12", unit: "AM", Icon: Sunrise, note: "First light" },
  { label: "SUNSET", value: "06:24", unit: "PM", Icon: Sunset, note: "Daylight ending" },
];

function App() {
  const [city, setCity] = useState("New Delhi");
  const [search, setSearch] = useState("");
  const [searchedCity, setSearchedCity] = useState("New Delhi");

  function handleSearch(e) {
    e.preventDefault();
    if (search.trim()) {
      setCity(search.trim());
      setSearchedCity(search.trim());
      setSearch("");
    }
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Atmos home">
          <span className="brand-icon"><CloudSun size={22} /></span>
          <span>atmos<span className="brand-dot">.</span></span>
        </a>

        <form className="searchbar" onSubmit={handleSearch}>
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search any city..."
            aria-label="Search city"
          />
          <kbd>ENTER ↵</kbd>
        </form>

        <div className="live-label">
          <span className="status-dot" /> WEATHER DASHBOARD
        </div>
      </header>

      <section className="main-grid">
        <div className="left-column">
          <section className="hero panel">
            <div className="eyebrow"><MapPin size={13} /> {city.toUpperCase()}, INDIA</div>

            <div className="hero-main">
              <div>
                <div className="temperature">24<span>°</span></div>
                <div className="condition">Mostly cloudy</div>
                <div className="feels-like">Feels like 26°</div>
              </div>
              <div className="weather-art">
                <CloudSun size={92} strokeWidth={1.1} />
                <span>☁</span>
              </div>
              <div className="high-low">
                <div><span>HIGH</span><strong>27°</strong></div>
                <div><span>LOW</span><strong>16°</strong></div>
              </div>
            </div>

            <div className="hero-footer">
              <div><span>CONDITION</span><strong>Overcast skies</strong></div>
              <div><span>PRECIPITATION</span><strong>20% chance</strong></div>
              <div><span>DAYLIGHT</span><strong>12h 12m</strong></div>
            </div>
          </section>

          <section className="panel chart-panel">
            <div className="section-heading">
              <div>
                <div className="eyebrow">TEMPERATURE TREND</div>
                <h2>Hourly forecast</h2>
              </div>
              <span className="muted-pill">NEXT 9 HOURS</span>
            </div>

            <div className="chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourly} margin={{ top: 16, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="temperatureFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#777777" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#777777" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" axisLine={false} tickLine={false}
                    tick={{ fill: "#999", fontSize: 10 }} dy={8} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid #ddd", fontSize: 12 }}
                    formatter={(value) => [`${value}°C`, "Temperature"]}
                  />
                  <Area type="monotone" dataKey="temp" stroke="#555555"
                    strokeWidth={2} fill="url(#temperatureFill)"
                    dot={false} activeDot={{ r: 4, fill: "#333" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-summary">
              <span><span className="legend-dot" /> Temperature (°C)</span>
              <span>Peak: 25° · 12 PM</span>
            </div>
          </section>

          <section className="panel prediction-panel">
            <div className="section-heading">
              <div>
                <div className="eyebrow">MACHINE LEARNING</div>
                <h2>Environmental predictions</h2>
              </div>
              <span className="muted-pill">MODEL DATA PENDING</span>
            </div>
            <div className="prediction-grid">
              <div className="prediction-card">
                <CloudRain size={20} />
                <span>RAIN PREDICTION</span>
                <strong>—<small>%</small></strong>
                <p>Awaiting trained model</p>
              </div>
              <div className="prediction-card">
                <Wind size={20} />
                <span>AIR QUALITY INDEX</span>
                <strong>—<small> AQI</small></strong>
                <p>Awaiting trained model</p>
              </div>
            </div>
          </section>
        </div>

        <aside className="right-column">
          <section className="metrics-grid">
            {metrics.map(({ label, value, unit, Icon, note }) => (
              <article className="metric panel" key={label}>
                <div className="metric-top">
                  <span>{label}</span><Icon size={17} strokeWidth={1.5} />
                </div>
                <div className="metric-value">{value}<small> {unit}</small></div>
                <div className="metric-note">{note}</div>
              </article>
            ))}
          </section>

          <section className="panel forecast-panel">
            <div className="section-heading">
              <div>
                <div className="eyebrow">THE WEEK AHEAD</div>
                <h2>7-day forecast</h2>
              </div>
              <Cloud size={20} strokeWidth={1.5} />
            </div>

            <div className="forecast-list">
              {week.map(([day, description, high, low, Icon]) => (
                <div className="forecast-row" key={day}>
                  <span className="forecast-day">{day}</span>
                  <Icon size={19} strokeWidth={1.5} />
                  <span className="forecast-description">{description}</span>
                  <div className="forecast-temperatures">
                    <strong>{high}°</strong>
                    <span>{low}°</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="data-note">
              Illustrative values · Live data integration comes next.
            </p>
          </section>

          <section className="location-card">
            <div className="location-icon"><MapPin size={18} /></div>
            <div>
              <strong>{searchedCity}</strong>
              <p>Selected location</p>
            </div>
            <span className="location-arrow">↗</span>
          </section>
        </aside>
      </section>

      <footer className="footer">
        <span>ATMOS © 2026</span>
        <span>WEATHER · AIR QUALITY · MACHINE LEARNING</span>
        <span>DATA CONNECTION PENDING</span>
      </footer>
    </main>
  );
}

export default App;
