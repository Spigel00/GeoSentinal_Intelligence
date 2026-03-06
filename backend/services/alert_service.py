"""
Alert service for sending notifications and logging alerts.
Handles SMS, email, and alert storage.
"""
import json
import os
from datetime import datetime
from typing import List, Dict


class AlertService:
    """Manages alerts and notifications"""
    
    HIGH_RISK_THRESHOLD = 0.7
    
    def __init__(self, alerts_file: str = "data/alerts.json", 
                 users_file: str = "data/users.json"):
        """
        Initialize alert service.
        
        Args:
            alerts_file: Path to alerts JSON file
            users_file: Path to users JSON file
        """
        self.alerts_file = alerts_file
        self.users_file = users_file
    
    def load_alerts(self) -> List[Dict]:
        """Load all alerts from JSON file"""
        if os.path.exists(self.alerts_file):
            try:
                with open(self.alerts_file, 'r') as f:
                    return json.load(f) or []
            except:
                return []
        return []
    
    def load_users(self) -> List[Dict]:
        """Load all users from JSON file"""
        if os.path.exists(self.users_file):
            try:
                with open(self.users_file, 'r') as f:
                    return json.load(f) or []
            except:
                return []
        return []
    
    def save_alerts(self, alerts: List[Dict]):
        """Save alerts to JSON file"""
        os.makedirs(os.path.dirname(self.alerts_file), exist_ok=True)
        with open(self.alerts_file, 'w') as f:
            json.dump(alerts, f, indent=2)
    
    def log_alert(self, region: str, risk_level: str, probability: float):
        """
        Log an alert to the alerts file.
        
        Args:
            region: Region name
            risk_level: Risk level (LOW, MEDIUM, HIGH)
            probability: Landslide probability
        """
        alerts = self.load_alerts()
        alert = {
            "region": region,
            "risk_level": risk_level,
            "probability": probability,
            "timestamp": datetime.now().isoformat()
        }
        alerts.append(alert)
        self.save_alerts(alerts)
    
    def get_users_for_region(self, region: str) -> List[Dict]:
        """
        Get all users subscribed to a region.
        
        Args:
            region: Region name
            
        Returns:
            List of user dictionaries
        """
        users = self.load_users()
        return [user for user in users if user.get("region") == region]
    
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
        
        # Send notifications (mock implementation)
        for user in users:
            self._send_sms_alert(user, region, probability)
            self._send_email_alert(user, region, probability)
        
        return True
    
    def _send_email_alert(self, user: Dict, region: str, probability: float):
        """
        Send email alert (mock implementation).
        
        Args:
            user: User dictionary
            region: Region name
            probability: Landslide probability
        """
        subject = "GeoSentinel Landslide Warning"
        body = f"""
A high landslide risk has been detected in your region.

Region: {region}
Probability: {probability:.2%}
Risk Level: HIGH
Timestamp: {datetime.now().isoformat()}

Please take necessary precautions and avoid vulnerable terrain.

GeoSentinel Alerts Team
        """
        
        print(f"📧 EMAIL ALERT [Mock]")
        print(f"   To: {user.get('email')}")
        print(f"   Subject: {subject}")
        print(f"   Body: {body}")
    
    def _send_sms_alert(self, user: Dict, region: str, probability: float):
        """
        Send SMS alert (mock implementation).
        
        Args:
            user: User dictionary
            region: Region name
            probability: Landslide probability
        """
        message = f"""GeoSentinel Alert

High landslide risk detected in {region}.

Probability: {probability:.2%}
Please avoid vulnerable terrain."""
        
        print(f"📱 SMS ALERT [Mock]")
        print(f"   To: {user.get('phone')}")
        print(f"   Message: {message}")
    
    def get_all_alerts(self) -> List[Dict]:
        """Get all logged alerts"""
        return self.load_alerts()
    
    def get_alerts_by_region(self, region: str) -> List[Dict]:
        """
        Get alerts for a specific region.
        
        Args:
            region: Region name
            
        Returns:
            List of alert dictionaries
        """
        alerts = self.load_alerts()
        return [alert for alert in alerts if alert.get("region") == region]
