from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import weather, air_quality, predictions

app = FastAPI(
    title="Mausam Vaani API",
    description="Indian weather, rainfall and air quality platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(weather.router)
app.include_router(air_quality.router)
app.include_router(predictions.router)


@app.get("/")
def home():
    return {"message": "Mausam Vaani API is running"}


@app.get("/api/health")
def health():
    return {"backend": "online"}