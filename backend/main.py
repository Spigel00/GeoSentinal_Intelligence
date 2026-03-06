"""
FastAPI main application.
Initializes the backend server with all routes and configurations.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import sys
from dotenv import load_dotenv

# Add parent directory to path for imports
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

# Load local environment variables from backend/.env
load_dotenv(os.path.join(BASE_DIR, ".env"))

# Import routers
from api.users import router as users_router
from api.regions import router as regions_router
from api.prediction import router as prediction_router
from api.alerts import router as alerts_router
from api.routes_predict import router as routes_predict_router
from api.notifications import router as notifications_router

# Import services
from services.predictor import LandslidePredictor


# Load model at startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🌍 GeoSentinel Backend Starting...")
    print("📊 Loading ML Model...")
    predictor = LandslidePredictor()
    print("✅ GeoSentinel Backend Ready!")
    yield
    # Shutdown
    print("🛑 GeoSentinel Backend Shutting Down...")


# Create FastAPI app
app = FastAPI(
    title="GeoSentinel Backend API",
    description="Landslide Prediction System with Environmental Monitoring",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(users_router)
app.include_router(regions_router)
app.include_router(prediction_router)
app.include_router(alerts_router)
app.include_router(routes_predict_router)
app.include_router(notifications_router)


@app.get("/", tags=["root"])
def read_root():
    """Root endpoint with API information"""
    return {
        "name": "GeoSentinel Backend API",
        "version": "1.0.0",
        "status": "active",
        "message": "Welcome to GeoSentinel - Landslide Prediction System",
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health", tags=["health"])
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "GeoSentinel Backend"
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
