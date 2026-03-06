"""
Machine Learning model predictor service.
Loads and uses the trained XGBoost landslide prediction model.
"""
import pickle
import os
from typing import Dict, Tuple
import numpy as np


class LandslidePredictor:
    """Wrapper for XGBoost landslide prediction model"""
    
    # Risk thresholds
    RISK_THRESHOLDS = {
        "LOW": 0.4,
        "MEDIUM": 0.7,
        "HIGH": float('inf')
    }
    
    def __init__(self, model_path: str = None):
        """
        Initialize predictor and load model.
        
        Args:
            model_path: Path to trained model file (defaults to MODEL_PATH env var)
        """
        if model_path is None:
            model_path = os.getenv("MODEL_PATH", "model/landslide_model.pkl")
        self.model_path = model_path
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Load XGBoost model from pickle file"""
        if os.path.exists(self.model_path):
            try:
                with open(self.model_path, 'rb') as f:
                    self.model = pickle.load(f)
                print(f"Model loaded successfully from {self.model_path}")
            except Exception as e:
                print(f"Error loading model: {e}")
                self.model = None
        else:
            print(f"Model file not found at {self.model_path}")
            print("Using mock predictions for demonstration")
            self.model = None
    
    def predict(self, features: list) -> float:
        """
        Predict landslide probability from features.
        
        Args:
            features: List of environmental features
            
        Returns:
            Probability value (0-1)
        """
        if self.model is not None:
            try:
                # Model expects 2D array
                features_array = np.array(features).reshape(1, -1)
                probability = self.model.predict_proba(features_array)[0][1]
                return float(probability)
            except Exception as e:
                print(f"Prediction error: {e}")
                return self._mock_predict(features)
        else:
            return self._mock_predict(features)
    
    def _mock_predict(self, features: list) -> float:
        """
        Generate mock prediction based on feature values.
        Used when actual model is not available.
        
        Args:
            features: List of environmental features
            
        Returns:
            Simulated probability value
        """
        # Mock logic: higher rainfall and saturation increase risk
        rainfall_factor = (features[0] + features[1] + features[2]) / 300  # Normalize rainfall
        saturation_factor = features[3]  # Soil saturation
        vulnerability_factor = features[5]  # Terrain vulnerability
        
        # Weighted combination
        probability = min(0.95, (rainfall_factor * 0.4 + saturation_factor * 0.35 + vulnerability_factor * 0.25))
        return round(probability, 3)
    
    def classify_risk(self, probability: float) -> str:
        """
        Classify risk level based on probability.
        
        Args:
            probability: Landslide probability (0-1)
            
        Returns:
            Risk level: LOW, MEDIUM, or HIGH
        """
        if probability < self.RISK_THRESHOLDS["LOW"]:
            return "LOW"
        elif probability < self.RISK_THRESHOLDS["MEDIUM"]:
            return "MEDIUM"
        else:
            return "HIGH"
    
    def predict_and_classify(self, features: list) -> Tuple[float, str]:
        """
        Predict probability and classify risk in one call.
        
        Args:
            features: List of environmental features
            
        Returns:
            Tuple of (probability, risk_level)
        """
        probability = self.predict(features)
        risk_level = self.classify_risk(probability)
        return probability, risk_level
