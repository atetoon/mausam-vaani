
import os
from pathlib import Path

import httpx
from dotenv import load_dotenv

# Load backend/.env reliably
BACKEND_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_DIR / ".env")

CPCB_API_URL = (
    "https://api.data.gov.in/resource/"
    "3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69"
)


async def fetch_cpcb_data(city: str, state: str):
    api_key = os.getenv("DATA_GOV_IN_API_KEY")

    if not api_key:
        raise ValueError("DATA_GOV_IN_API_KEY is missing from backend/.env")

    params = {
        "api-key": api_key,
        "format": "json",
        "offset": 0,
        "limit": 100,
        "filters[state]": state.strip(),
        "filters[city]": city.strip(),
    }

    timeout = httpx.Timeout(
        connect=15.0,
        read=15.0,
        write=15.0,
        pool=15.0,
    )

    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.get(CPCB_API_URL, params=params)

        print("CPCB STATUS:", response.status_code)

        response.raise_for_status()
        data = response.json()

    records = data.get("records", [])

    return {
        "source": "CPCB / data.gov.in",
        "city": city,
        "state": state,
        "total": data.get("total", len(records)),
        "count": len(records),
        "records": records,
    }
