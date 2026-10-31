
import httpx


async def fetch_weather(city: str):
    async with httpx.AsyncClient(timeout=15) as client:
        # Find the city's coordinates
        geo_response = await client.get(
            "https://geocoding-api.open-meteo.com/v1/search",
            params={
                "name": city,
                "count": 1,
                "language": "en",
                "format": "json",
            },
        )
        geo_response.raise_for_status()
        locations = geo_response.json().get("results", [])

        if not locations:
            return None

        location = locations[0]

        # Fetch weather using those coordinates
        weather_response = await client.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": location["latitude"],
                "longitude": location["longitude"],
                "current": (
                    "temperature_2m,relative_humidity_2m,"
                    "apparent_temperature,precipitation,"
                    "weather_code,wind_speed_10m,wind_direction_10m"
                ),
                "daily": (
                    "temperature_2m_max,temperature_2m_min,"
                    "precipitation_probability_max,uv_index_max"
                ),
                "timezone": "auto",
                "forecast_days": 1,
            },
        )
        weather_response.raise_for_status()

        return {
            "source": "Open-Meteo",
            "location": {
                "name": location["name"],
                "country": location.get("country"),
                "latitude": location["latitude"],
                "longitude": location["longitude"],
            },
            "current": weather_response.json().get("current"),
            "daily": weather_response.json().get("daily"),
        }
