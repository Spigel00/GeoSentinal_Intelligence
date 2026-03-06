from pydantic import BaseModel
from typing import List
from datetime import datetime


class PredictionResponse(BaseModel):
    """Response for prediction results"""
    region: str
    landslide_probability: float
    risk_level: str  # LOW, MEDIUM, HIGH
    environmental_data: dict


class UserResponse(BaseModel):
    """Response for user object"""
    user_id: str
    name: str
    email: str
    phone: str
    region: str


class AlertResponse(BaseModel):
    """Response for alert object"""
    region: str
    risk_level: str
    probability: float
    timestamp: str


class RegionResponse(BaseModel):
    """Response for region with risk level"""
    region: str
    lat: float
    lon: float
    risk_level: str


class MapRiskResponse(BaseModel):
    """Response for map risk data"""
    regions: List[RegionResponse]


class MessageResponse(BaseModel):
    """Generic message response"""
    message: str
    success: bool = True
