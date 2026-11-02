
const API_BASE_URL = "http://localhost:8000";

async function fetchAPI(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// Current weather + 5-day forecast
export async function getWeather(city = "Delhi") {
  return fetchAPI(
    `/api/weather/?city=${encodeURIComponent(city)}`
  );
}

// Current air quality + 4-day hourly forecast
export async function getAirQuality(city = "Delhi") {
  return fetchAPI(
    `/api/weather/air-quality/?city=${encodeURIComponent(city)}`
  );
}
