const API_BASE_URL = "http://localhost:8000";

export async function getWeather(city = "Delhi") {
  const response = await fetch(
    `${API_BASE_URL}/api/weather/?city=${encodeURIComponent(city)}`
  );

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  return response.json();
}