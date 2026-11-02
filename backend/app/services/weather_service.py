
import httpx

GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
WEATHER_URL = "https://api.open-meteo.com/v1/forecast"
AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"


async def geocode_city(client: httpx.AsyncClient, city: str):
    response = await client.get(
        GEOCODING_URL,
        params={
            "name": city,
            "count": 1,
            "language": "en",
            "format": "json",
        },
    )
    response.raise_for_status()

    locations = response.json().get("results", [])
    return locations[0] if locations else None


async def fetch_weather(city: str):
    async with httpx.AsyncClient(timeout=30) as client:
        location = await geocode_city(client, city)

        if not location:
            return None

        response = await client.get(
            WEATHER_URL,
            params={
                "latitude": location["latitude"],
                "longitude": location["longitude"],
                "current": (
                    "temperature_2m,relative_humidity_2m,"
                    "apparent_temperature,precipitation,"
                    "weather_code,wind_speed_10m,wind_direction_10m"
                ),
                "hourly": (
                    "temperature_2m,relative_humidity_2m,"
                    "apparent_temperature,precipitation_probability,"
                    "precipitation,weather_code,is_day"
                ),
                "daily": (
                    "temperature_2m_max,temperature_2m_min,"
                    "precipitation_probability_max,uv_index_max"
                ),
                "timezone": "auto",
                "forecast_days": 5,
            },
        )
        response.raise_for_status()
        data = response.json()

        return {
            "source": "Open-Meteo",
            "timezone": data.get("timezone"),
            "location": {
                "name": location["name"],
                "country": location.get("country"),
                "latitude": location["latitude"],
                "longitude": location["longitude"],
            },
            "current": data.get("current"),
            "hourly": data.get("hourly"),
            "daily": data.get("daily"),
        }


async def fetch_air_quality(city: str):
    async with httpx.AsyncClient(timeout=30) as client:
        location = await geocode_city(client, city)

        if not location:
            return None

        response = await client.get(
            AIR_QUALITY_URL,
            params={
                "latitude": location["latitude"],
                "longitude": location["longitude"],
                "current": (
                    "european_aqi,us_aqi,pm10,pm2_5,"
                    "carbon_monoxide,nitrogen_dioxide,"
                    "sulphur_dioxide,ozone,ammonia"
                ),
                "hourly": (
                    "european_aqi,us_aqi,pm10,pm2_5,"
                    "carbon_monoxide,nitrogen_dioxide,"
                    "sulphur_dioxide,ozone,ammonia"
                ),
                "timezone": "auto",
                "forecast_days": 4,
            },
        )
        response.raise_for_status()
        data = response.json()

        return {
            "source": "Open-Meteo / CAMS",
            "aqi_standard": {
                "us": "US AQI",
                "european": "European AQI",
            },
            "location": {
                "name": location["name"],
                "country": location.get("country"),
                "latitude": location["latitude"],
                "longitude": location["longitude"],
            },
            "current": data.get("current"),
            "hourly": data.get("hourly"),
        }
