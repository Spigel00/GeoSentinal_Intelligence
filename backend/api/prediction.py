"""
Prediction API routes.
Handles custom predictions and map risk visualization.
"""
from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session

from db import get_db
from models import Prediction, Region
from schemas.request import PredictionRequest
from schemas.response import PredictionResponse, MapRiskResponse, RegionResponse
from services.predictor import LandslidePredictor
from services.simulator import EnvironmentalSimulator
from services.alert_service import AlertService

router = APIRouter(tags=["predictions"])

def load_regions(db: Session) -> List[dict]:
    """Load regions from MySQL."""
    rows = db.query(Region).order_by(Region.name.asc()).all()
    return [{"id": r.id, "region": r.name, "lat": r.lat, "lon": r.lon} for r in rows]


# Cache for storing latest predictions
_prediction_cache = {}


@router.post("/predict", response_model=PredictionResponse)
def predict_landslide_risk(request: PredictionRequest, db: Session = Depends(get_db)):
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

    custom_region = db.query(Region).filter(Region.name == "Custom Input").first()
    if custom_region is None:
        custom_region = Region(name="Custom Input", lat=0.0, lon=0.0)
        db.add(custom_region)
        db.flush()

    db.add(
        Prediction(
            region_id=custom_region.id,
            probability=probability,
            risk_level=risk_level,
            environmental_data=env_data,
        )
    )
    db.commit()
    
    return PredictionResponse(
        region="Custom Input",
        landslide_probability=probability,
        risk_level=risk_level,
        environmental_data=env_data
    )


@router.get("/map/risk", response_model=MapRiskResponse)
def get_map_risk_levels(db: Session = Depends(get_db)):
    """
    Get risk levels for all regions for map visualization.
    Provides color-coded data: LOW (green), MEDIUM (yellow), HIGH (red).
    
    Returns:
        MapRiskResponse with all regions and their risk levels
    """
    regions = load_regions(db)
    predictor = LandslidePredictor()
    alert_service = AlertService()
    
    region_responses = []
    
    for region in regions:
        # Generate simulated environmental data for this region
        env_data = EnvironmentalSimulator.simulate_environmental_data()
        features = EnvironmentalSimulator.get_feature_vector(env_data)
        
        # Make prediction
        probability, risk_level = predictor.predict_and_classify(features)
        
        # Cache prediction for quick access
        _prediction_cache[region["region"]] = risk_level

        db.add(
            Prediction(
                region_id=region["id"],
                probability=probability,
                risk_level=risk_level,
                environmental_data=env_data,
            )
        )
        
        # If HIGH risk, send alerts
        if risk_level == "HIGH":
            alert_service.send_high_risk_alert(region["region"], probability)
        
        region_responses.append(RegionResponse(
            region=region["region"],
            lat=region["lat"],
            lon=region["lon"],
            risk_level=risk_level
        ))
    
    db.commit()
    return MapRiskResponse(regions=region_responses)
