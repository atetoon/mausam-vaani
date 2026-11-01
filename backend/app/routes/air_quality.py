
import httpx

from fastapi import APIRouter, HTTPException, Query

from app.services.cpcb_service import fetch_cpcb_data

router = APIRouter(
    prefix="/api/air-quality",
    tags=["Air Quality"]
)


@router.get("/")
async def get_air_quality(
    city: str = Query(default="Noida", min_length=2),
    state: str = Query(default="Uttar Pradesh", min_length=2),
):
    try:
        result = await fetch_cpcb_data(
            city=city,
            state=state
        )

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

    except httpx.HTTPStatusError as error:
        print("CPCB HTTP ERROR:", repr(error))

        raise HTTPException(
            status_code=502,
            detail=f"CPCB provider returned HTTP {error.response.status_code}"
        )

    except httpx.RequestError as error:
        print("CPCB CONNECTION ERROR:", repr(error))

        raise HTTPException(
            status_code=502,
            detail=f"Connection failed: {type(error).__name__}"
        )

    except Exception as error:
        print("UNEXPECTED AIR QUALITY ERROR:", repr(error))

        raise HTTPException(
            status_code=500,
            detail="Unexpected air quality service error"
        )
