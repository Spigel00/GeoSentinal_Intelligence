"""
User behavior tracking service for GeoSentinel.
Captures and stores user behavior events for security analysis.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional

from sqlalchemy.orm import Session

from models import User, UserBehavior


class BehaviorTrackingService:
    """Service for tracking and analyzing user behavior."""

    @staticmethod
    def log_event(
        db: Session,
        user_id: int,
        event_type: str,
        ip_address: Optional[str] = None,
        device_fingerprint: Optional[str] = None,
        user_agent: Optional[str] = None,
        location: Optional[str] = None,
        success: bool = True,
        event_metadata: Optional[dict] = None
    ) -> UserBehavior:
        """
        Log a user behavior event.
        
        Args:
            db: Database session
            user_id: User's database ID
            event_type: Type of event (login, logout, failed_login, action, region_change)
            ip_address: User's IP address
            device_fingerprint: Unique device identifier
            user_agent: User agent string
            location: Geographic location
            success: Whether the event was successful
            metadata: Additional event metadata
            
        Returns:
            Created UserBehavior instance
        """
        behavior = UserBehavior(
            user_id=user_id,
            event_type=event_type,
            ip_address=ip_address,
            device_fingerprint=device_fingerprint,
            user_agent=user_agent,
            location=location,
            success=success,
            event_metadata=event_metadata or {},
            timestamp=datetime.utcnow()
        )
        db.add(behavior)
        db.commit()
        db.refresh(behavior)
        return behavior

    @staticmethod
    def get_user_behavior_stats(db: Session, user_id: int, days: int = 30) -> Dict:
        """
        Get user behavior statistics for the last N days.
        
        Args:
            db: Database session
            user_id: User's database ID
            days: Number of days to look back
            
        Returns:
            Dictionary with behavior statistics
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        behaviors = db.query(UserBehavior).filter(
            UserBehavior.user_id == user_id,
            UserBehavior.timestamp >= cutoff_date
        ).all()
        
        # Calculate statistics
        total_events = len(behaviors)
        failed_logins = sum(1 for b in behaviors if b.event_type == "failed_login")
        successful_logins = sum(1 for b in behaviors if b.event_type == "login" and b.success)
        unique_ips = len(set(b.ip_address for b in behaviors if b.ip_address))
        unique_devices = len(set(b.device_fingerprint for b in behaviors if b.device_fingerprint))
        unique_locations = len(set(b.location for b in behaviors if b.location))
        
        # Calculate average time between actions
        if len(behaviors) > 1:
            sorted_behaviors = sorted(behaviors, key=lambda x: x.timestamp)
            time_diffs = [
                (sorted_behaviors[i+1].timestamp - sorted_behaviors[i].timestamp).total_seconds()
                for i in range(len(sorted_behaviors) - 1)
            ]
            avg_time_between_actions = sum(time_diffs) / len(time_diffs) if time_diffs else 0
        else:
            avg_time_between_actions = 0
        
        return {
            "total_events": total_events,
            "failed_logins": failed_logins,
            "successful_logins": successful_logins,
            "unique_ips": unique_ips,
            "unique_devices": unique_devices,
            "unique_locations": unique_locations,
            "avg_time_between_actions_seconds": avg_time_between_actions,
            "period_days": days
        }

    @staticmethod
    def get_recent_failed_login_count(db: Session, user_id: int, minutes: int = 30) -> int:
        """
        Get count of recent failed login attempts.
        
        Args:
            db: Database session
            user_id: User's database ID
            minutes: Time window in minutes
            
        Returns:
            Count of failed login attempts
        """
        cutoff_time = datetime.utcnow() - timedelta(minutes=minutes)
        
        count = db.query(UserBehavior).filter(
            UserBehavior.user_id == user_id,
            UserBehavior.event_type == "failed_login",
            UserBehavior.timestamp >= cutoff_time
        ).count()
        
        return count

    @staticmethod
    def get_user_ips(db: Session, user_id: int, days: int = 30) -> List[str]:
        """
        Get list of unique IP addresses used by user.
        
        Args:
            db: Database session
            user_id: User's database ID
            days: Number of days to look back
            
        Returns:
            List of unique IP addresses
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        behaviors = db.query(UserBehavior.ip_address).filter(
            UserBehavior.user_id == user_id,
            UserBehavior.timestamp >= cutoff_date,
            UserBehavior.ip_address.isnot(None)
        ).distinct().all()
        
        return [b.ip_address for b in behaviors]

    @staticmethod
    def detect_unusual_region_change(
        db: Session,
        user_id: int,
        new_location: str,
        threshold_hours: int = 1
    ) -> bool:
        """
        Detect if user changed location unusually fast (potential account compromise).
        
        Args:
            db: Database session
            user_id: User's database ID
            new_location: New location string
            threshold_hours: Time threshold in hours
            
        Returns:
            True if location change is suspicious
        """
        cutoff_time = datetime.utcnow() - timedelta(hours=threshold_hours)
        
        last_behavior = db.query(UserBehavior).filter(
            UserBehavior.user_id == user_id,
            UserBehavior.timestamp >= cutoff_time,
            UserBehavior.location.isnot(None)
        ).order_by(UserBehavior.timestamp.desc()).first()
        
        if last_behavior and last_behavior.location:
            # Simple check: if locations are different within threshold
            if last_behavior.location != new_location:
                return True
        
        return False

    @staticmethod
    def calculate_request_rate(db: Session, user_id: int, minutes: int = 5) -> float:
        """
        Calculate user's request rate (requests per minute).
        
        Args:
            db: Database session
            user_id: User's database ID
            minutes: Time window in minutes
            
        Returns:
            Requests per minute
        """
        cutoff_time = datetime.utcnow() - timedelta(minutes=minutes)
        
        count = db.query(UserBehavior).filter(
            UserBehavior.user_id == user_id,
            UserBehavior.timestamp >= cutoff_time
        ).count()
        
        return count / minutes if minutes > 0 else 0
