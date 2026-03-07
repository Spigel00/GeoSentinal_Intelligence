"""
AI Assistant Service for GeoSentinel Intelligence.
Converts landslide predictions into human-readable intelligence for operational roles.
"""
import os
from typing import Dict, Optional
from enum import Enum


class UserRole(str, Enum):
    """Supported user roles for intelligence summaries"""
    USER = "user"
    ADMIN = "admin"
    RESCUE = "rescue"


class GeoSentinelAIAssistant:
    """
    AI-powered assistant that generates role-specific intelligence summaries
    for landslide risk predictions.
    """
    
    def __init__(self, use_huggingface: bool = False, model_name: str = "google/gemma-2b-it"):
        """
        Initialize the AI assistant.
        
        Args:
            use_huggingface: Whether to use HuggingFace models (requires transformers)
            model_name: HuggingFace model to use for generation
        """
        self.use_huggingface = use_huggingface
        self.model_name = model_name
        self.model = None
        self.tokenizer = None
        
        if use_huggingface:
            self._load_huggingface_model()
    
    def _load_huggingface_model(self):
        """Load HuggingFace text generation model"""
        try:
            from transformers import AutoTokenizer, AutoModelForCausalLM
            import torch
            
            print(f"Loading HuggingFace model: {self.model_name}")
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                device_map="auto" if torch.cuda.is_available() else None
            )
            print(f"✅ HuggingFace model loaded successfully")
        except ImportError:
            print("⚠️  transformers library not installed. Using template-based responses.")
            self.use_huggingface = False
        except Exception as e:
            print(f"⚠️  Error loading HuggingFace model: {e}")
            print("Using template-based responses as fallback.")
            self.use_huggingface = False
    
    def _generate_with_huggingface(self, prompt: str, max_length: int = 200) -> str:
        """Generate response using HuggingFace model"""
        if not self.use_huggingface or self.model is None:
            return None
        
        try:
            inputs = self.tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512)
            if self.model.device.type != "cpu":
                inputs = {k: v.to(self.model.device) for k, v in inputs.items()}
            
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=max_length,
                temperature=0.7,
                top_p=0.9,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id
            )
            
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            # Remove the prompt from response
            response = response[len(prompt):].strip()
            return response
        except Exception as e:
            print(f"Error generating with HuggingFace: {e}")
            return None
    
    def generate_user_summary(
        self, 
        region: str, 
        probability: float, 
        risk_level: str,
        features: Optional[Dict] = None
    ) -> str:
        """
        Generate a civilian-friendly safety advisory.
        
        Args:
            region: Name of the region
            probability: Landslide probability (0-1)
            risk_level: Risk level (LOW, MEDIUM, HIGH)
            features: Optional environmental features for context
            
        Returns:
            Safety-focused advisory for general public
        """
        if self.use_huggingface:
            prompt = f"""You are GeoSentinel Intelligence Assistant. Explain landslide risk to a civilian user.

Region: {region}
Risk Level: {risk_level}
Probability: {probability:.0%}

Provide a brief, clear safety advisory (2-3 sentences). Focus on:
- What the risk means for travelers and residents
- Safety precautions to take
- Areas to avoid

Advisory:"""
            
            response = self._generate_with_huggingface(prompt)
            if response:
                return response
        
        # Template-based fallback
        return self._template_user_summary(region, probability, risk_level, features)
    
    def _template_user_summary(
        self, 
        region: str, 
        probability: float, 
        risk_level: str,
        features: Optional[Dict] = None
    ) -> str:
        """Generate user summary using templates"""
        prob_pct = int(probability * 100)
        
        if risk_level == "HIGH":
            base = (
                f"🚨 GeoSentinel analysis indicates that the {region} region currently has a "
                f"HIGH landslide risk (probability: {prob_pct}%) due to "
            )
            
            factors = []
            if features:
                if features.get("rainfall_24h", 0) > 50:
                    factors.append("heavy rainfall accumulation")
                if features.get("soil_saturation_index", 0) > 0.7:
                    factors.append("saturated soil conditions")
                if features.get("slope_stability_factor", 0) < 0.5:
                    factors.append("unstable terrain conditions")
            
            if not factors:
                factors = ["adverse environmental conditions"]
            
            factors_str = " and ".join(factors)
            
            return (
                f"{base}{factors_str}. Travelers and residents should avoid mountain roads, "
                f"steep slopes, and vulnerable areas. Exercise extreme caution and follow "
                f"local authority guidance."
            )
        
        elif risk_level == "MEDIUM":
            return (
                f"⚠️  GeoSentinel monitoring shows a MODERATE landslide risk in {region} "
                f"(probability: {prob_pct}%). Environmental conditions warrant attention. "
                f"Stay informed about weather updates, avoid high-risk slopes during heavy rain, "
                f"and be prepared to evacuate if conditions worsen."
            )
        
        else:  # LOW
            return (
                f"✅ GeoSentinel reports LOW landslide risk in {region} (probability: {prob_pct}%). "
                f"Current environmental conditions are stable. Normal precautions apply, but "
                f"continue to monitor weather forecasts and remain aware of your surroundings "
                f"in mountainous terrain."
            )
    
    def generate_admin_summary(
        self, 
        region: str, 
        probability: float, 
        risk_level: str,
        features: Optional[Dict] = None
    ) -> str:
        """
        Generate tactical advisory for defense operations.
        
        Args:
            region: Name of the region
            probability: Landslide probability (0-1)
            risk_level: Risk level (LOW, MEDIUM, HIGH)
            features: Optional environmental features
            
        Returns:
            Tactical advisory for defense administrators
        """
        if self.use_huggingface:
            prompt = f"""You are GeoSentinel Intelligence Assistant. Provide tactical intelligence for defense operations.

Region: {region}
Risk Level: {risk_level}
Probability: {probability:.0%}

Provide a tactical advisory (2-3 sentences). Focus on:
- Operational impact on supply routes and logistics
- Strategic terrain considerations
- Recommended defensive measures

Advisory:"""
            
            response = self._generate_with_huggingface(prompt)
            if response:
                return response
        
        # Template-based fallback
        return self._template_admin_summary(region, probability, risk_level, features)
    
    def _template_admin_summary(
        self, 
        region: str, 
        probability: float, 
        risk_level: str,
        features: Optional[Dict] = None
    ) -> str:
        """Generate admin summary using templates"""
        prob_pct = int(probability * 100)
        
        if risk_level == "HIGH":
            return (
                f"⚔️  GeoSentinel Tactical Advisory: ELEVATED landslide probability detected in "
                f"the {region} sector ({prob_pct}% likelihood). Supply routes and forward logistics "
                f"movement may be significantly affected. IMMEDIATE ACTIONS: Monitor terrain stability, "
                f"prepare alternate transport corridors, suspend non-essential convoy movements through "
                f"high-risk zones, and pre-position engineering units for rapid response to route blockages."
            )
        
        elif risk_level == "MEDIUM":
            return (
                f"⚔️  GeoSentinel Tactical Advisory: MODERATE landslide risk identified in {region} "
                f"sector ({prob_pct}% probability). Operational tempo in affected areas should be "
                f"adjusted. RECOMMENDED ACTIONS: Increase reconnaissance of critical supply routes, "
                f"establish contingency logistics plans, maintain readiness of engineer assets, and "
                f"coordinate with local infrastructure authorities on route status."
            )
        
        else:  # LOW
            return (
                f"⚔️  GeoSentinel Tactical Advisory: LOW landslide threat in {region} sector "
                f"({prob_pct}% probability). Current environmental assessment indicates stable "
                f"conditions for normal operations. GUIDANCE: Maintain standard route security "
                f"protocols, continue environmental monitoring, and ensure communications with "
                f"forward units remain operational for rapid threat assessment updates."
            )
    
    def generate_rescue_summary(
        self, 
        region: str, 
        probability: float, 
        risk_level: str,
        features: Optional[Dict] = None
    ) -> str:
        """
        Generate emergency response guidance for rescue teams.
        
        Args:
            region: Name of the region
            probability: Landslide probability (0-1)
            risk_level: Risk level (LOW, MEDIUM, HIGH)
            features: Optional environmental features
            
        Returns:
            Emergency response advisory for rescue operations
        """
        if self.use_huggingface:
            prompt = f"""You are GeoSentinel Intelligence Assistant. Provide emergency response guidance for rescue teams.

Region: {region}
Risk Level: {risk_level}
Probability: {probability:.0%}

Provide rescue advisory (2-3 sentences). Focus on:
- Evacuation readiness and deployment planning
- Emergency resource preparation
- Terrain monitoring priorities

Advisory:"""
            
            response = self._generate_with_huggingface(prompt)
            if response:
                return response
        
        # Template-based fallback
        return self._template_rescue_summary(region, probability, risk_level, features)
    
    def _template_rescue_summary(
        self, 
        region: str, 
        probability: float, 
        risk_level: str,
        features: Optional[Dict] = None
    ) -> str:
        """Generate rescue summary using templates"""
        prob_pct = int(probability * 100)
        
        if risk_level == "HIGH":
            return (
                f"🚁 GeoSentinel Rescue Advisory: HIGH probability of landslide activity in {region} "
                f"({prob_pct}% likelihood). IMMEDIATE RESPONSE REQUIRED. Deploy monitoring personnel to "
                f"vulnerable slopes, prepare emergency evacuation plans for at-risk communities, ensure "
                f"medical and relief resources are ready for rapid deployment, coordinate with local "
                f"authorities on shelter locations, and establish emergency communication channels with "
                f"potentially affected populations."
            )
        
        elif risk_level == "MEDIUM":
            return (
                f"🚁 GeoSentinel Rescue Advisory: MODERATE landslide risk detected in {region} "
                f"({prob_pct}% probability). PREPAREDNESS PHASE ACTIVATED. Priority actions: Survey "
                f"high-risk zones to identify vulnerable populations, pre-position rescue equipment "
                f"and medical supplies at forward staging areas, brief response teams on potential "
                f"scenarios, establish liaison with local emergency services, and maintain enhanced "
                f"monitoring of environmental conditions."
            )
        
        else:  # LOW
            return (
                f"🚁 GeoSentinel Rescue Advisory: LOW landslide risk in {region} "
                f"({prob_pct}% probability). Current conditions are stable. STANDARD OPERATIONS: "
                f"Maintain routine monitoring of hazard-prone areas, ensure emergency response plans "
                f"are current, verify availability of rescue assets and personnel, and continue "
                f"community awareness programs. Be prepared to escalate response posture if conditions "
                f"deteriorate."
            )
    
    def explain_prediction(self, features: Dict[str, float]) -> str:
        """
        Explain why the model predicted a specific risk level.
        
        Args:
            features: Dictionary of environmental features
            
        Returns:
            Human-readable explanation of prediction factors
        """
        if self.use_huggingface:
            prompt = f"""You are GeoSentinel Intelligence Assistant. Explain why the landslide risk prediction was made.

Environmental Features:
- Rainfall (6h): {features.get('rainfall_6h', 0)}mm
- Rainfall (12h): {features.get('rainfall_12h', 0)}mm
- Rainfall (24h): {features.get('rainfall_24h', 0)}mm
- Soil Saturation Index: {features.get('soil_saturation_index', 0):.2f}
- Slope Stability Factor: {features.get('slope_stability_factor', 0):.2f}
- Terrain Vulnerability Index: {features.get('terrain_vulnerability_index', 0):.2f}

Provide a brief technical explanation (2-3 sentences) of the key factors driving the prediction.

Explanation:"""
            
            response = self._generate_with_huggingface(prompt)
            if response:
                return response
        
        # Template-based fallback
        return self._template_explanation(features)
    
    def _template_explanation(self, features: Dict[str, float]) -> str:
        """Generate explanation using templates"""
        factors = []
        
        rainfall_24h = features.get('rainfall_24h', 0)
        rainfall_12h = features.get('rainfall_12h', 0)
        soil_saturation = features.get('soil_saturation_index', 0)
        slope_stability = features.get('slope_stability_factor', 0)
        terrain_vuln = features.get('terrain_vulnerability_index', 0)
        
        # Analyze rainfall
        if rainfall_24h > 80:
            factors.append(f"very high rainfall accumulation ({rainfall_24h:.1f}mm in 24 hours)")
        elif rainfall_24h > 50:
            factors.append(f"significant rainfall ({rainfall_24h:.1f}mm in 24 hours)")
        elif rainfall_24h > 20:
            factors.append(f"moderate rainfall ({rainfall_24h:.1f}mm in 24 hours)")
        
        # Analyze soil saturation
        if soil_saturation > 0.8:
            factors.append("critically high soil saturation levels")
        elif soil_saturation > 0.6:
            factors.append("elevated soil moisture content")
        
        # Analyze slope stability
        if slope_stability < 0.4:
            factors.append("severely compromised slope stability")
        elif slope_stability < 0.6:
            factors.append("reduced slope stability")
        
        # Analyze terrain vulnerability
        if terrain_vuln > 0.7:
            factors.append("highly vulnerable terrain characteristics")
        elif terrain_vuln > 0.5:
            factors.append("elevated terrain vulnerability")
        
        if not factors:
            return (
                "The predicted landslide risk is based on current environmental conditions including "
                f"rainfall patterns ({rainfall_24h:.1f}mm/24h), soil conditions (saturation: {soil_saturation:.2f}), "
                f"and terrain characteristics (stability: {slope_stability:.2f})."
            )
        
        factors_str = ", ".join(factors[:-1])
        if len(factors) > 1:
            factors_str += f", and {factors[-1]}"
        else:
            factors_str = factors[0]
        
        return (
            f"The predicted landslide risk is primarily driven by {factors_str}. "
            f"These combined factors create conditions conducive to slope failure and landslide activity."
        )
    
    def generate_chat_response(
        self,
        role: UserRole,
        region: str,
        probability: float,
        risk_level: str,
        features: Optional[Dict] = None
    ) -> str:
        """
        Generate role-appropriate response for chat interface.
        
        Args:
            role: User role (user, admin, rescue)
            region: Geographic region
            probability: Landslide probability
            risk_level: Risk level classification
            features: Optional environmental features
            
        Returns:
            Role-specific intelligence summary
        """
        if role == UserRole.USER:
            return self.generate_user_summary(region, probability, risk_level, features)
        elif role == UserRole.ADMIN:
            return self.generate_admin_summary(region, probability, risk_level, features)
        elif role == UserRole.RESCUE:
            return self.generate_rescue_summary(region, probability, risk_level, features)
        else:
            raise ValueError(f"Unsupported role: {role}")
