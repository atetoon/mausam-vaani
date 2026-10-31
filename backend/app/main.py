
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Mausam Vaani API",
    description="Weather, rainfall and AQI prediction API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "Mausam Vaani API is running",
        "status": "healthy"
    }

@app.get("/api/health")
def health():
    return {
        "backend": "online",
        "rain_model": "not trained",
        "aqi_model": "not trained"
    }
