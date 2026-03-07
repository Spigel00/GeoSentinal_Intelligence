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
from sqlalchemy.exc import SQLAlchemyError

# Add parent directory to path for imports
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

# Load local environment variables from backend/.env and override stale shell vars
load_dotenv(os.path.join(BASE_DIR, ".env"), override=True)

# Import routers
from api.users import router as users_router
from api.regions import router as regions_router
from api.prediction import router as prediction_router
from api.alerts import router as alerts_router
from api.routes_predict import router as routes_predict_router
from api.notifications import router as notifications_router
from api.ai import router as ai_router

# Import services
from db import init_db, seed_initial_data_if_empty
from services.predictor import LandslidePredictor



# Load model at startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🌍 GeoSentinel Backend Starting...")
    print("🗄️ Initializing MySQL schema...")
    try:
        init_db()
        seeded = seed_initial_data_if_empty()
        if any(seeded.values()):
            print(
                "✅ Seeded initial data into MySQL "
                f"(regions={seeded['regions']}, users={seeded['users']}, alerts={seeded['alerts']})"
            )
        else:
            print("✅ MySQL schema ready (no seeding needed)")
    except SQLAlchemyError as e:
        print(f"❌ Database initialization failed: {e}")
        raise

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
app.include_router(ai_router)


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
    
    print("\n" + "="*60)
    print("🚀 Starting GeoSentinel Backend Server")
    print("="*60)
    print(f"📡 Server URL: http://0.0.0.0:8000")
    print(f"📚 API Docs: http://localhost:8000/docs")
    print(f"🔄 Auto-reload: Disabled (run with uvicorn for reload)")
    print("="*60 + "\n")
    uvicorn.run(
        "main:app",  # Changed to import string format
        host="0.0.0.0",
        port=8000,
        reload=False,  # Disabled reload to avoid warning
        log_level="info"
    )
