"""
SVM-based anomaly detection for user behavior in GeoSentinel.
Uses Support Vector Machine (One-Class SVM) to detect unusual user behavior patterns.
"""

import os
import pickle
from datetime import datetime, timedelta
from typing import Dict, List, Optional

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.svm import OneClassSVM
from sqlalchemy.orm import Session

from models import UserBehavior


class BehaviorAnomalyDetector:
    """
    SVM-based anomaly detection for user behavior.
    Uses One-Class SVM to learn normal behavior patterns and detect anomalies.
    """

    def __init__(self, model_path: str = "model/behavior_svm_model.pkl"):
        """
        Initialize the anomaly detector.
        
        Args:
            model_path: Path to save/load the trained model
        """
        self.model_path = model_path
        self.scaler = StandardScaler()
        self.svm_model = OneClassSVM(
            kernel='rbf',
            gamma='auto',
            nu=0.1,  # Expected proportion of outliers
            cache_size=500
        )
        self.is_trained = False
        self.load_model()

    def extract_features(self, behaviors: List[UserBehavior]) -> pd.DataFrame:
        """
        Extract features from user behavior events for ML model.
        
        Args:
            behaviors: List of UserBehavior instances
            
        Returns:
            DataFrame with extracted features
        """
        if not behaviors:
            return pd.DataFrame()
        
        # Group behaviors by hour to calculate hourly statistics
        df = pd.DataFrame([
            {
                'timestamp': b.timestamp,
                'event_type': b.event_type,
                'ip_address': b.ip_address or '',
                'device_fingerprint': b.device_fingerprint or '',
                'location': b.location or '',
                'success': b.success,
                'hour': b.timestamp.hour,
                'day_of_week': b.timestamp.weekday(),
            }
            for b in behaviors
        ])
        
        if df.empty:
            return pd.DataFrame()
        
        # Sort by timestamp
        df = df.sort_values('timestamp')
        
        # Calculate time-based features
        if len(df) > 1:
            df['time_since_last_action'] = df['timestamp'].diff().dt.total_seconds().fillna(0)
        else:
            df['time_since_last_action'] = 0
        
        # Feature extraction for each event
        features = []
        
        for i, row in df.iterrows():
            # Get recent window (last 10 events or available)
            window_start = max(0, i - 10)
            window = df.iloc[window_start:i+1]
            
            feature_dict = {
                # Time-based features
                'hour_of_day': row['hour'],
                'day_of_week': row['day_of_week'],
                'time_since_last': row['time_since_last_action'],
                
                # Event type distribution in window
                'login_ratio': (window['event_type'] == 'login').sum() / len(window),
                'failed_login_ratio': (window['event_type'] == 'failed_login').sum() / len(window),
                'action_ratio': (window['event_type'] == 'action').sum() / len(window),
                
                # IP and device diversity
                'unique_ips_in_window': window['ip_address'].nunique(),
                'unique_devices_in_window': window['device_fingerprint'].nunique(),
                'unique_locations_in_window': window['location'].nunique(),
                
                # Success rate
                'success_rate': window['success'].sum() / len(window),
                
                # Request rate (events per minute)
                'request_rate': len(window) / max(1, (window['timestamp'].max() - window['timestamp'].min()).total_seconds() / 60),
            }
            
            features.append(feature_dict)
        
        return pd.DataFrame(features)

    def train(self, db: Session, min_events_per_user: int = 50):
        """
        Train the SVM model on historical behavior data.
        
        Args:
            db: Database session
            min_events_per_user: Minimum events required per user for training
            
        Returns:
            True if training was successful
        """
        # Get all behavior events from the last 90 days
        cutoff_date = datetime.utcnow() - timedelta(days=90)
        behaviors = db.query(UserBehavior).filter(
            UserBehavior.timestamp >= cutoff_date
        ).order_by(UserBehavior.timestamp).all()
        
        if len(behaviors) < 100:  # Minimum required for training
            print(f"Not enough data for training. Found {len(behaviors)} events, need at least 100.")
            return False
        
        # Extract features
        features_df = self.extract_features(behaviors)
        
        if features_df.empty or len(features_df) < 50:
            print("Feature extraction resulted in insufficient data.")
            return False
        
        # Remove any NaN or infinite values
        features_df = features_df.replace([np.inf, -np.inf], np.nan).fillna(0)
        
        # Scale features
        X = self.scaler.fit_transform(features_df.values)
        
        # Train One-Class SVM
        self.svm_model.fit(X)
        self.is_trained = True
        
        # Save model
        self.save_model()
        
        print(f"SVM model trained on {len(features_df)} behavior events.")
        return True

    def predict_anomaly(self, db: Session, user_id: int, lookback_days: int = 30) -> Dict:
        """
        Predict if recent user behavior is anomalous.
        
        Args:
            db: Database session
            user_id: User's database ID
            lookback_days: Number of days to analyze
            
        Returns:
            Dictionary with anomaly detection results
        """
        if not self.is_trained:
            return {
                "is_anomalous": False,
                "anomaly_score": 0.0,
                "confidence": 0.0,
                "message": "Model not trained yet"
            }
        
        # Get user's recent behavior
        cutoff_date = datetime.utcnow() - timedelta(days=lookback_days)
        behaviors = db.query(UserBehavior).filter(
            UserBehavior.user_id == user_id,
            UserBehavior.timestamp >= cutoff_date
        ).order_by(UserBehavior.timestamp).all()
        
        if len(behaviors) < 5:  # Need minimum events to analyze
            return {
                "is_anomalous": False,
                "anomaly_score": 0.0,
                "confidence": 0.0,
                "message": "Insufficient behavior history"
            }
        
        # Extract features
        features_df = self.extract_features(behaviors)
        
        if features_df.empty:
            return {
                "is_anomalous": False,
                "anomaly_score": 0.0,
                "confidence": 0.0,
                "message": "Could not extract features"
            }
        
        # Remove any NaN or infinite values
        features_df = features_df.replace([np.inf, -np.inf], np.nan).fillna(0)
        
        # Scale features
        X = self.scaler.transform(features_df.values)
        
        # Predict (-1 for outliers, 1 for inliers)
        predictions = self.svm_model.predict(X)
        
        # Get decision function scores (distance from separating hyperplane)
        scores = self.svm_model.decision_function(X)
        
        # Calculate anomaly metrics
        anomaly_count = (predictions == -1).sum()
        anomaly_ratio = anomaly_count / len(predictions)
        avg_score = scores.mean()
        
        # Determine if behavior is anomalous
        is_anomalous = anomaly_ratio > 0.3  # More than 30% of recent actions flagged
        
        return {
            "is_anomalous": bool(is_anomalous),
            "anomaly_score": float(avg_score),
            "anomaly_ratio": float(anomaly_ratio),
            "flagged_events": int(anomaly_count),
            "total_events": len(predictions),
            "confidence": float(abs(avg_score)),
            "message": "Anomalous behavior detected" if is_anomalous else "Normal behavior"
        }

    def save_model(self):
        """Save the trained model and scaler to disk."""
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        
        model_data = {
            'svm_model': self.svm_model,
            'scaler': self.scaler,
            'is_trained': self.is_trained
        }
        
        with open(self.model_path, 'wb') as f:
            pickle.dump(model_data, f)

    def load_model(self):
        """Load a trained model and scaler from disk."""
        if os.path.exists(self.model_path):
            try:
                with open(self.model_path, 'rb') as f:
                    model_data = pickle.load(f)
                
                self.svm_model = model_data['svm_model']
                self.scaler = model_data['scaler']
                self.is_trained = model_data.get('is_trained', False)
                
                print(f"Loaded behavior anomaly detection model from {self.model_path}")
            except Exception as e:
                print(f"Failed to load model: {e}")
                self.is_trained = False
        else:
            print(f"No existing model found at {self.model_path}")


# Global instance
anomaly_detector = BehaviorAnomalyDetector()
