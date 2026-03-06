"""
Prediction routes - legacy compatibility file
Uses main prediction router
"""
from fastapi import APIRouter
from schemas.request import PredictionRequest
from schemas.response import PredictionResponse
from services.predictor import LandslidePredictor
from services.simulator import EnvironmentalSimulator

router = APIRouter(prefix="/api", tags=["prediction"])


@router.post("/predict", response_model=PredictionResponse)
def predict_landslide(request: PredictionRequest):
    """
    Predict landslide risk using provided environmental parameters.
    
    Request body should contain:
    - rainfall_6h: Rainfall in last 6 hours (mm)
    - rainfall_12h: Rainfall in last 12 hours (mm) 
    - rainfall_24h: Rainfall in last 24 hours (mm)
    - soil_saturation_index: Soil saturation (0-1)
    - slope_stability_factor: Slope stability (0-1)
    - terrain_vulnerability_index: Terrain vulnerability (0-1)
    
    Returns:
        Prediction result with probability and risk level
    """
    # Build feature vector
    features = [
        request.rainfall_6h,
        request.rainfall_12h,
        request.rainfall_24h,
        request.soil_saturation_index,
        request.slope_stability_factor,
        request.terrain_vulnerability_index
    ]
    
    # Make prediction
    predictor = LandslidePredictor()
    probability, risk_level = predictor.predict_and_classify(features)
    
    # Prepare response
    env_data = {
        "rainfall_6h": request.rainfall_6h,
        "rainfall_12h": request.rainfall_12h,
        "rainfall_24h": request.rainfall_24h,
        "soil_saturation_index": request.soil_saturation_index,
        "slope_stability_factor": request.slope_stability_factor,
        "terrain_vulnerability_index": request.terrain_vulnerability_index
    }
    
    return PredictionResponse(
        region="Custom Input",
        landslide_probability=probability,
        risk_level=risk_level,
        environmental_data=env_data
    )
