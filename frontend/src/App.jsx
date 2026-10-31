
import { useEffect, useState } from "react";
import { getWeather } from "./services/weather";

function App() {
  const [city, setCity] = useState("Mumbai");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadWeather(selectedCity = city) {
    setLoading(true);
    setError("");

    try {
      const data = await getWeather(selectedCity);
      setWeather(data);
    } catch (err) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWeather("Mumbai");
  }, []);

  return (
    <main style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>Mausam Vaani</h1>
      <p>Weather across India</p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          loadWeather();
        }}
      >
        <input
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="Enter city"
        />
        <button type="submit">Search</button>
      </form>

      {loading && <p>Loading weather...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {weather && (
        <section>
          <h2>{weather.location.name}, {weather.location.country}</h2>
          <h1>{weather.current.temperature_2m}°C</h1>
          <p>Feels like: {weather.current.apparent_temperature}°C</p>
          <p>Humidity: {weather.current.relative_humidity_2m}%</p>
          <p>Wind: {weather.current.wind_speed_10m} km/h</p>
          <p>Rain probability: {weather.daily.precipitation_probability_max[0]}%</p>
          <p>
            High: {weather.daily.temperature_2m_max[0]}°C |
            Low: {weather.daily.temperature_2m_min[0]}°C
          </p>
          <small>Source: {weather.source}</small>
        </section>
      )}
    </main>
  );
}

export default App;
