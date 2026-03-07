"""
Region management and prediction routes.
Handles region queries and predictions by region.
"""
from fastapi import APIRouter, HTTPException
from typing import List
import json
import os
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from schemas.response import (
    MapRiskResponse,
    PredictionResponse,
    RegionResponse,
    RegionWeatherResponse,
    RegionsWeatherBatchResponse,
)
from services.simulator import EnvironmentalSimulator
from services.predictor import LandslidePredictor
from services.alert_service import AlertService
from services.weather_client import WeatherClient

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


@router.get("/live-weather", response_model=RegionsWeatherBatchResponse)
def get_live_weather_for_regions(mock: bool = False):
    """
    Fetch live weather data for all configured regions.
    
    Query params:
        mock: If True, return simulated weather data instead of calling real API
    """
    regions = load_regions()
    weather_client = WeatherClient()

    if not weather_client.is_configured():
        raise HTTPException(
            status_code=500,
            detail=(
                "INDIAN_WEATHER_API_KEY is not configured. "
                "Set it in your environment or .env before calling this endpoint."
            ),
        )

    weather_results: List[RegionWeatherResponse] = []

    if mock:
        for region in regions:
            name = region["region"]
            lat = region["lat"]
            lon = region["lon"]
            env_data = EnvironmentalSimulator.simulate_environmental_data()
            weather_data = {
                "location": {"name": name, "lat": lat, "lon": lon},
                "current": {
                    "temp_c": round(15 + (lat % 10), 1),
                    "condition": "Partly cloudy",
                    "humidity": int(env_data["soil_saturation_index"] * 100),
                    "precip_mm": env_data["rainfall_24h"],
                    "wind_kph": round(10 + (lon % 15), 1),
                },
                "note": "Mock data - set mock=false for live API data"
            }
            weather_results.append(
                RegionWeatherResponse(
                    region=name,
                    lat=lat,
                    lon=lon,
                    success=True,
                    weather_data=weather_data,
                )
            )
    else:
        max_workers = max(1, int(os.getenv("INDIAN_WEATHER_MAX_WORKERS", "5")))

        def fetch_region_weather(region: dict) -> RegionWeatherResponse:
            name = region["region"]
            lat = region["lat"]
            lon = region["lon"]
            try:
                weather_data = weather_client.get_current_weather(
                    lat=lat,
                    lon=lon,
                    state_name=name,
                )
                return RegionWeatherResponse(
                    region=name,
                    lat=lat,
                    lon=lon,
                    success=True,
                    weather_data=weather_data,
                )
            except RuntimeError as exc:
                return RegionWeatherResponse(
                    region=name,
                    lat=lat,
                    lon=lon,
                    success=False,
                    error=str(exc),
                )

        ordered_index = {region["region"]: idx for idx, region in enumerate(regions)}
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = [executor.submit(fetch_region_weather, region) for region in regions]
            for future in as_completed(futures):
                weather_results.append(future.result())

        weather_results.sort(key=lambda r: ordered_index.get(r.region, 0))

    source = "Mock Weather Data" if mock else "https://api.data.gov.in"
    total_regions = len(weather_results)
    success_count = sum(1 for region in weather_results if region.success)
    failure_count = total_regions - success_count
    return RegionsWeatherBatchResponse(
        source=source,
        generated_at=datetime.utcnow().isoformat(),
        total_regions=total_regions,
        success_count=success_count,
        failure_count=failure_count,
        degraded=failure_count > 0,
        regions=weather_results,
    )


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
    # For Sikkim, use low-risk environmental conditions
    if region_name == "Sikkim":
        env_data = {
            "rainfall_6h": 15.0,
            "rainfall_12h": 25.0,
            "rainfall_24h": 45.0,
            "soil_saturation_index": 0.25,
            "slope_stability_factor": 0.75,
            "terrain_vulnerability_index": 0.35,
        }
    else:
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
