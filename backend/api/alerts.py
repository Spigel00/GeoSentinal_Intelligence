"""
Alert history and management routes.
Handles alert queries and management.
"""
from fastapi import APIRouter
from typing import List
from schemas.response import AlertResponse
from services.alert_service import AlertService

router = APIRouter(prefix="/alerts", tags=["alerts"])

ALERTS_FILE = "data/alerts.json"
USERS_FILE = "data/users.json"


@router.get("", response_model=List[AlertResponse])
def get_all_alerts():
    """
    Get all logged alerts.
    
    Returns:
        List of all alerts
    """
    alert_service = AlertService(ALERTS_FILE, USERS_FILE)
    alerts = alert_service.get_all_alerts()
    
    return [AlertResponse(**alert) for alert in alerts]


@router.get("/region/{region_name}", response_model=List[AlertResponse])
def get_region_alerts(region_name: str):
    """
    Get alerts for a specific region.
    
    Args:
        region_name: Name of the region
        
    Returns:
        List of alerts for the region
    """
    alert_service = AlertService(ALERTS_FILE, USERS_FILE)
    alerts = alert_service.get_alerts_by_region(region_name)
    
    return [AlertResponse(**alert) for alert in alerts]


@router.get("/high-risk", response_model=List[AlertResponse])
def get_high_risk_alerts():
    """
    Get all high-risk alerts.
    
    Returns:
        List of high-risk alerts only
    """
    alert_service = AlertService(ALERTS_FILE, USERS_FILE)
    all_alerts = alert_service.get_all_alerts()
    
    high_risk = [alert for alert in all_alerts if alert.get("risk_level") == "HIGH"]
    
    return [AlertResponse(**alert) for alert in high_risk]
