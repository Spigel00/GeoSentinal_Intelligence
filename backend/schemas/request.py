from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class PredictionRequest(BaseModel):
    """Request body for custom prediction"""
    rainfall_6h: float = Field(..., ge=0, le=200, description="Rainfall in last 6 hours (mm)")
    rainfall_12h: float = Field(..., ge=0, le=250, description="Rainfall in last 12 hours (mm)")
    rainfall_24h: float = Field(..., ge=0, le=500, description="Rainfall in last 24 hours (mm)")
    soil_saturation_index: float = Field(..., ge=0, le=1, description="Soil saturation index (0-1)")
    slope_stability_factor: float = Field(..., ge=0, le=1, description="Slope stability factor (0-1)")
    terrain_vulnerability_index: float = Field(..., ge=0, le=1, description="Terrain vulnerability index (0-1)")


class UserRegistrationRequest(BaseModel):
    """Request body for user registration"""
    name: str = Field(..., min_length=1, description="User's full name")
    email: str = Field(..., description="User's email address")
    phone: str = Field(..., min_length=10, description="User's phone number")
    region: str = Field(..., min_length=1, description="Monitoring region")


class RegionPredictionRequest(BaseModel):
    """Request body for region-based prediction (empty, uses simulated data)"""
    pass
