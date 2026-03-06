"""
Region management and prediction routes.
Handles region queries and predictions by region.
"""
from fastapi import APIRouter, HTTPException
from typing import List
import json
import os
from schemas.response import RegionResponse, PredictionResponse, MapRiskResponse
from services.simulator import EnvironmentalSimulator
from services.predictor import LandslidePredictor
from services.alert_service import AlertService

router = APIRouter(prefix="/regions", tags=["regions"])

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


# Cache for predictions to simulate persistence across calls
_prediction_cache = {}


@router.get("", response_model=List[RegionResponse])
def get_all_regions():
    """
    Get all monitoring regions.
    
    Returns:
        List of regions with current risk levels
    """
    regions = load_regions()
    predictor = LandslidePredictor()
    
    result = []
    for region in regions:
        # Get cached risk level or default to LOW
        risk_level = _prediction_cache.get(region["region"], "LOW")
        
        result.append(RegionResponse(
            region=region["region"],
            lat=region["lat"],
            lon=region["lon"],
            risk_level=risk_level
        ))
    
    return result


@router.post("/{region_name}/predict", response_model=PredictionResponse)
def predict_for_region(region_name: str):
    """
    Run prediction for a specific region with simulated environmental data.
    
    Args:
        region_name: Name of the region
        
    Returns:
        Prediction result with probability and risk level
    """
    regions = load_regions()
    region = next((r for r in regions if r["region"] == region_name), None)
    
    if not region:
        raise HTTPException(status_code=404, detail=f"Region '{region_name}' not found")
    
    # Simulate environmental data
    env_data = EnvironmentalSimulator.simulate_environmental_data()
    features = EnvironmentalSimulator.get_feature_vector(env_data)
    
    # Make prediction
    predictor = LandslidePredictor()
    probability, risk_level = predictor.predict_and_classify(features)
    
    # Cache the risk level for map API
    _prediction_cache[region_name] = risk_level
    
    # If HIGH risk, send alerts
    if risk_level == "HIGH":
        alert_service = AlertService(ALERTS_FILE, USERS_FILE)
        alert_service.send_high_risk_alert(region_name, probability)
    
    return PredictionResponse(
        region=region_name,
        landslide_probability=probability,
        risk_level=risk_level,
        environmental_data=env_data
    )


@router.get("/{region_name}/alerts", response_model=List[dict])
def get_region_alerts(region_name: str):
    """
    Get alert history for a specific region.
    
    Args:
        region_name: Name of the region
        
    Returns:
        List of alerts for the region
    """
    alert_service = AlertService(ALERTS_FILE, USERS_FILE)
    alerts = alert_service.get_alerts_by_region(region_name)
    
    return alerts
