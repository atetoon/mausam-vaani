
import httpx
from fastapi import APIRouter, HTTPException, Query

from app.services.weather_service import (
    fetch_weather,
    fetch_air_quality,
)

router = APIRouter(prefix="/api/weather", tags=["Weather"])


@router.get("/")
async def get_weather(city: str = Query(default="Delhi", min_length=2)):
    try:
        result = await fetch_weather(city)

        if result is None:
            raise HTTPException(status_code=404, detail="City not found")

        return result

    except httpx.HTTPError:
        raise HTTPException(
            status_code=502,
            detail="Weather provider is currently unavailable",
        )


@router.get("/air-quality/")
async def get_air_quality(city: str = Query(default="Delhi", min_length=2)):
    try:
        result = await fetch_air_quality(city)

        if result is None:
            raise HTTPException(status_code=404, detail="City not found")

        return result

    except httpx.HTTPError:
        raise HTTPException(
            status_code=502,
            detail="Air quality provider is currently unavailable",
        )
