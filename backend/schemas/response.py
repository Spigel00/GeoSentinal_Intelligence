from pydantic import BaseModel
from typing import Any, Dict, List, Optional


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


class LoginResponse(BaseModel):
    """Response for successful login"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class BehaviorStatsResponse(BaseModel):
    """Response for user behavior statistics"""
    total_events: int
    failed_logins: int
    successful_logins: int
    unique_ips: int
    unique_devices: int
    unique_locations: int
    avg_time_between_actions_seconds: float
    period_days: int


class AnomalyDetectionResponse(BaseModel):
    """Response for anomaly detection"""
    is_anomalous: bool
    anomaly_score: float
    confidence: float
    message: str
    anomaly_ratio: Optional[float] = None
    flagged_events: Optional[int] = None
    total_events: Optional[int] = None


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


class RegionWeatherResponse(BaseModel):
    """Weather details mapped to a configured region."""
    region: str
    lat: float
    lon: float
    success: bool
    weather_data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class RegionsWeatherBatchResponse(BaseModel):
    """Batch weather response for all configured regions."""
    source: str
    generated_at: str
    total_regions: int
    success_count: int
    failure_count: int
    degraded: bool = False
    regions: List[RegionWeatherResponse]
