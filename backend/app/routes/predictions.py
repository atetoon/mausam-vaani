from fastapi import APIRouter

router = APIRouter(prefix="/api/predictions", tags=["Predictions"])


@router.get("/")
def get_predictions():
    return {
        "status": "pending",
        "rainfall_model": "not trained",
        "aqi_model": "not trained"
    }