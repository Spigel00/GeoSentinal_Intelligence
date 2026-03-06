"""
Prediction API routes.
Handles custom predictions and map risk visualization.
"""
from fastapi import APIRouter, HTTPException
from typing import List
from schemas.request import PredictionRequest
from schemas.response import PredictionResponse, MapRiskResponse, RegionResponse
from services.predictor import LandslidePredictor
from services.simulator import EnvironmentalSimulator
from services.alert_service import AlertService
import json
import os

router = APIRouter(tags=["predictions"])

REGIONS_FILE = "data/regions.json"
ALERTS_FILE = "data/alerts.json"
USERS_FILE = "data/users.json"


def load_regions() -> List[dict]:
    """Load regions from JSON file"""
    if os.path.exists(REGIONS_FILE):
        try:
            with open(REGIONS_FILE, 'r') as f:
                return json.load(f) or []
        except:
            return []
    return []


# Cache for storing latest predictions
_prediction_cache = {}


@router.post("/predict", response_model=PredictionResponse)
def predict_landslide_risk(request: PredictionRequest):
    """
    Predict landslide risk using custom environmental data.
    
    Args:
        request: Environmental parameters for prediction
        
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
    
    # Prepare environmental data dict for response
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


@router.get("/map/risk", response_model=MapRiskResponse)
def get_map_risk_levels():
    """
    Get risk levels for all regions for map visualization.
    Provides color-coded data: LOW (green), MEDIUM (yellow), HIGH (red).
    
    Returns:
        MapRiskResponse with all regions and their risk levels
    """
    regions = load_regions()
    predictor = LandslidePredictor()
    alert_service = AlertService(ALERTS_FILE, USERS_FILE)
    
    region_responses = []
    
    for region in regions:
        # Generate simulated environmental data for this region
        env_data = EnvironmentalSimulator.simulate_environmental_data()
        features = EnvironmentalSimulator.get_feature_vector(env_data)
        
        # Make prediction
        probability, risk_level = predictor.predict_and_classify(features)
        
        # Cache prediction for quick access
        _prediction_cache[region["region"]] = risk_level
        
        # If HIGH risk, send alerts
        if risk_level == "HIGH":
            alert_service.send_high_risk_alert(region["region"], probability)
        
        region_responses.append(RegionResponse(
            region=region["region"],
            lat=region["lat"],
            lon=region["lon"],
            risk_level=risk_level
        ))
    
    return MapRiskResponse(regions=region_responses)
