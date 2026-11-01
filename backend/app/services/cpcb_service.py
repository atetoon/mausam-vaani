
import json
import os
import subprocess
from pathlib import Path

from dotenv import load_dotenv

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

    command = [
        "curl.exe",
        "-sS",
        "--max-time", "20",
        "-G",
        CPCB_API_URL,
        "--data-urlencode", f"api-key={api_key}",
        "--data-urlencode", "format=json",
        "--data-urlencode", "limit=100",
        "--data-urlencode", f"filters[state]={state.strip()}",
        "--data-urlencode", f"filters[city]={city.strip()}",
        "-w", "\n%{http_code}",
    ]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
        timeout=25,
        check=False,
    )

    if result.returncode != 0:
        raise RuntimeError(f"CPCB curl failed: {result.stderr.strip()}")

    body, separator, status = result.stdout.rpartition("\n")

    if not separator:
        raise RuntimeError("CPCB returned an invalid response")

    if status != "200":
        raise RuntimeError(f"CPCB provider returned HTTP {status}")

    data = json.loads(body)
    records = data.get("records", [])

    return {
        "source": "CPCB / data.gov.in",
        "city": city,
        "state": state,
        "total": data.get("total", len(records)),
        "count": len(records),
        "records": records,
    }
