from fastapi import APIRouter

router = APIRouter(prefix="/api/air-quality", tags=["Air Quality"])


@router.get("/")
def get_air_quality():
    return {
        "status": "pending",
        "message": "CPCB data integration is not configured yet."
    }