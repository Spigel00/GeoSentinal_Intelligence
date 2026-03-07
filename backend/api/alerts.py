"""Alert history and management routes backed by MySQL."""

from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db import get_db
from models import Alert, Region
from schemas.response import AlertResponse

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=List[AlertResponse])
def get_all_alerts(db: Session = Depends(get_db)):
    """
    Get all logged alerts.
    
    Returns:
        List of all alerts
    """
    alerts = db.query(Alert).order_by(Alert.timestamp.desc()).all()
    return [
        AlertResponse(
            region=alert.region.name,
            risk_level=alert.risk_level,
            probability=alert.probability,
            timestamp=alert.timestamp.isoformat(),
        )
        for alert in alerts
    ]


@router.get("/region/{region_name}", response_model=List[AlertResponse])
def get_region_alerts(region_name: str, db: Session = Depends(get_db)):
    """
    Get alerts for a specific region.
    
    Args:
        region_name: Name of the region
        
    Returns:
        List of alerts for the region
    """
    alerts = (
        db.query(Alert)
        .join(Region, Alert.region_id == Region.id)
        .filter(Region.name == region_name)
        .order_by(Alert.timestamp.desc())
        .all()
    )
    return [
        AlertResponse(
            region=alert.region.name,
            risk_level=alert.risk_level,
            probability=alert.probability,
            timestamp=alert.timestamp.isoformat(),
        )
        for alert in alerts
    ]


@router.get("/high-risk", response_model=List[AlertResponse])
def get_high_risk_alerts(db: Session = Depends(get_db)):
    """
    Get all high-risk alerts.
    
    Returns:
        List of high-risk alerts only
    """
    alerts = (
        db.query(Alert)
        .filter(Alert.risk_level == "HIGH")
        .order_by(Alert.timestamp.desc())
        .all()
    )
    return [
        AlertResponse(
            region=alert.region.name,
            risk_level=alert.risk_level,
            probability=alert.probability,
            timestamp=alert.timestamp.isoformat(),
        )
        for alert in alerts
    ]
