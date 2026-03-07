"""Alert service for sending notifications and persisting alerts in MySQL."""

from datetime import datetime
from typing import Dict, List

from db import SessionLocal
from models import Alert, Region, User
from services.notification_service import get_notification_service


class AlertService:
    """Manages alerts and notifications"""
    
    HIGH_RISK_THRESHOLD = 0.7
    
    def __init__(self, alerts_file: str = "data/alerts.json", users_file: str = "data/users.json"):
        """
        Initialize alert service.
        
        Args:
            alerts_file: Path to alerts JSON file
            users_file: Path to users JSON file
        """
        # Kept for backward compatibility with old call sites.
        self.alerts_file = alerts_file
        self.users_file = users_file
        self.notification_service = get_notification_service()
    
    def log_alert(self, region: str, risk_level: str, probability: float):
        """
        Log an alert to the alerts file.
        
        Args:
            region: Region name
            risk_level: Risk level (LOW, MEDIUM, HIGH)
            probability: Landslide probability
        """
        db = SessionLocal()
        try:
            region_row = db.query(Region).filter(Region.name == region).first()
            if region_row is None:
                region_row = Region(name=region, lat=0.0, lon=0.0)
                db.add(region_row)
                db.flush()

            db.add(
                Alert(
                    region_id=region_row.id,
                    risk_level=risk_level,
                    probability=probability,
                    timestamp=datetime.utcnow(),
                )
            )
            db.commit()
        finally:
            db.close()
    
    def get_users_for_region(self, region: str) -> List[Dict]:
        """
        Get all users subscribed to a region.
        
        Args:
            region: Region name
            
        Returns:
            List of user dictionaries
        """
        db = SessionLocal()
        try:
            users = (
                db.query(User)
                .join(User.region)
                .filter(Region.name == region)
                .all()
            )
            return [
                {
                    "user_id": user.user_id,
                    "name": user.name,
                    "email": user.email,
                    "phone": user.phone,
                    "region": user.region.name,
                }
                for user in users
            ]
        finally:
            db.close()
    
    def send_high_risk_alert(self, region: str, probability: float) -> bool:
        """
        Send alerts when high risk is detected.
        
        Args:
            region: Region name
            probability: Landslide probability
            
        Returns:
            True if alert was successfully processed
        """
        # Log the alert
        self.log_alert(region, "HIGH", probability)
        
        # Get users in this region
        users = self.get_users_for_region(region)
        
        if not users:
            return False
        
        # Send notifications using real notification service
        notification_results = []
        for user in users:
            result = self.notification_service.send_landslide_alert(
                user=user,
                region=region,
                probability=probability,
                risk_level="HIGH"
            )
            notification_results.append({
                "user": user.get("name"),
                "email_result": result.get("email"),
                "sms_result": result.get("sms")
            })
        
        return True
    
    def send_custom_alert(self, user: Dict, region: str, probability: float, risk_level: str = "HIGH"):
        """
        Send custom alert to a user (both email and SMS).
        
        Args:
            user: User dictionary
            region: Region name
            probability: Landslide probability
            risk_level: Risk level (LOW, MEDIUM, HIGH)
            
        Returns:
            Dict with notification results
        """
        return self.notification_service.send_landslide_alert(
            user=user,
            region=region,
            probability=probability,
            risk_level=risk_level
        )
    
    def get_all_alerts(self) -> List[Dict]:
        """Get all logged alerts"""
        db = SessionLocal()
        try:
            alerts = db.query(Alert).order_by(Alert.timestamp.desc()).all()
            return [
                {
                    "region": alert.region.name,
                    "risk_level": alert.risk_level,
                    "probability": alert.probability,
                    "timestamp": alert.timestamp.isoformat(),
                }
                for alert in alerts
            ]
        finally:
            db.close()
    
    def get_alerts_by_region(self, region: str) -> List[Dict]:
        """
        Get alerts for a specific region.
        
        Args:
            region: Region name
            
        Returns:
            List of alert dictionaries
        """
        db = SessionLocal()
        try:
            alerts = (
                db.query(Alert)
                .join(Alert.region)
                .filter(Region.name == region)
                .order_by(Alert.timestamp.desc())
                .all()
            )
            return [
                {
                    "region": alert.region.name,
                    "risk_level": alert.risk_level,
                    "probability": alert.probability,
                    "timestamp": alert.timestamp.isoformat(),
                }
                for alert in alerts
            ]
        finally:
            db.close()
