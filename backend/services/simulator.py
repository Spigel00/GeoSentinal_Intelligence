"""
Environmental data simulator for landslide predictions.
Generates realistic environmental conditions for regions.
"""
import random
from typing import Dict


class EnvironmentalSimulator:
    """Simulates environmental conditions for landslide prediction"""
    
    # Random ranges for environmental parameters
    RAINFALL_6H_RANGE = (10, 80)
    RAINFALL_12H_RANGE = (20, 120)
    RAINFALL_24H_RANGE = (40, 200)
    SOIL_SATURATION_RANGE = (0.2, 0.9)
    SLOPE_STABILITY_RANGE = (0.3, 0.8)
    TERRAIN_VULNERABILITY_RANGE = (0.3, 0.9)
    
    @staticmethod
    def simulate_environmental_data() -> Dict[str, float]:
        """
        Generate simulated environmental conditions.
        
        Returns:
            Dict with environmental parameters
        """
        return {
            "rainfall_6h": round(random.uniform(*EnvironmentalSimulator.RAINFALL_6H_RANGE), 2),
            "rainfall_12h": round(random.uniform(*EnvironmentalSimulator.RAINFALL_12H_RANGE), 2),
            "rainfall_24h": round(random.uniform(*EnvironmentalSimulator.RAINFALL_24H_RANGE), 2),
            "soil_saturation_index": round(random.uniform(*EnvironmentalSimulator.SOIL_SATURATION_RANGE), 2),
            "slope_stability_factor": round(random.uniform(*EnvironmentalSimulator.SLOPE_STABILITY_RANGE), 2),
            "terrain_vulnerability_index": round(random.uniform(*EnvironmentalSimulator.TERRAIN_VULNERABILITY_RANGE), 2),
        }
    
    @staticmethod
    def get_feature_vector(env_data: Dict[str, float]) -> list:
        """
        Convert environmental data to feature vector for ML model.
        
        Args:
            env_data: Dictionary of environmental parameters
            
        Returns:
            List in the correct order for model prediction
        """
        return [
            env_data["rainfall_6h"],
            env_data["rainfall_12h"],
            env_data["rainfall_24h"],
            env_data["soil_saturation_index"],
            env_data["slope_stability_factor"],
            env_data["terrain_vulnerability_index"],
        ]
