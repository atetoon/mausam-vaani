import json
import os
import subprocess
from pathlib import Path
from urllib.parse import urlencode

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_DIR / ".env")

CPCB_API_URL = (
    "https://api.data.gov.in/resource/"
    "3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69"
)


def fetch_page(api_key: str, offset: int):
    params = {
        "api-key": api_key,
        "format": "json",
        "offset": offset,
        "limit": 1000,
    }

    url = f"{CPCB_API_URL}?{urlencode(params)}"

    command = [
        "curl.exe",
        "-sS",
        "--max-time", "60",
        url,
        "-w", "\n%{http_code}",
    ]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
        timeout=65,
        check=False,
    )

    if result.returncode != 0:
        raise RuntimeError(f"CPCB curl failed: {result.stderr.strip()}")

    body, separator, status = result.stdout.rpartition("\n")

    if not separator or status != "200":
        raise RuntimeError(f"CPCB provider returned HTTP {status or 'unknown'}")

    data = json.loads(body)
    return data.get("records", [])


async def fetch_cpcb_data(city: str, state: str):
    api_key = os.getenv("DATA_GOV_IN_API_KEY")

    if not api_key:
        raise ValueError("DATA_GOV_IN_API_KEY is missing from backend/.env")

    all_records = []

    for offset in (0, 1000):
        all_records.extend(fetch_page(api_key, offset))

    matching_records = [
        record
        for record in all_records
        if record.get("city", "").strip().casefold() == city.strip().casefold()
        and record.get("state", "").strip().casefold() == state.strip().casefold()
    ]

    return {
        "source": "CPCB / data.gov.in",
        "city": city,
        "state": state,
        "total": len(matching_records),
        "count": len(matching_records),
        "records": matching_records,
    }