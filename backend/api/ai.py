"""
AI Assistant API routes.
Handles intelligent conversation and role-specific landslide risk summaries.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict
from enum import Enum
from services.ai_assistant import GeoSentinelAIAssistant, UserRole


# Create router
router = APIRouter(prefix="/ai", tags=["ai-assistant"])


# Initialize AI Assistant (using template-based by default)
# Set use_huggingface=True if you have transformers installed
ai_assistant = GeoSentinelAIAssistant(use_huggingface=False)


class ChatRequest(BaseModel):
    """Request body for AI chat"""
    role: str = Field(..., description="User role: user, admin, or rescue")
    region: str = Field(..., description="Geographic region name")
    risk_level: str = Field(..., description="Risk level: LOW, MEDIUM, or HIGH")
    probability: float = Field(..., ge=0, le=1, description="Landslide probability (0-1)")
    features: Optional[Dict[str, float]] = Field(None, description="Optional environmental features")


class ChatResponse(BaseModel):
    """Response from AI chat"""
    message: str = Field(..., description="AI-generated intelligence summary")
    role: str = Field(..., description="Role the response was generated for")
    region: str = Field(..., description="Region the response is about")
    risk_level: str = Field(..., description="Risk level assessed")


class ExplanationRequest(BaseModel):
    """Request body for prediction explanation"""
    rainfall_6h: float = Field(..., ge=0, description="Rainfall in last 6 hours (mm)")
    rainfall_12h: float = Field(..., ge=0, description="Rainfall in last 12 hours (mm)")
    rainfall_24h: float = Field(..., ge=0, description="Rainfall in last 24 hours (mm)")
    soil_saturation_index: float = Field(..., ge=0, le=1, description="Soil saturation index (0-1)")
    slope_stability_factor: float = Field(..., ge=0, le=1, description="Slope stability factor (0-1)")
    terrain_vulnerability_index: float = Field(..., ge=0, le=1, description="Terrain vulnerability index (0-1)")


class ExplanationResponse(BaseModel):
    """Response for prediction explanation"""
    explanation: str = Field(..., description="Human-readable explanation of prediction factors")


@router.post("/chat", response_model=ChatResponse)
def chat_with_geosentinel(request: ChatRequest):
    """
    Generate role-specific intelligence summary for landslide risk.
    
    This endpoint converts raw prediction data into human-readable,
    actionable intelligence tailored to different operational roles.
    
    **Supported Roles:**
    - `user`: Civilian-friendly safety advisories
    - `admin`: Tactical intelligence for defense operations
    - `rescue`: Emergency response guidance for rescue teams
    
    Args:
        request: Chat request with role, region, and risk data
        
    Returns:
        Role-appropriate intelligence summary
        
    Raises:
        HTTPException: If role is invalid or request processing fails
    """
    try:
        # Validate role
        try:
            user_role = UserRole(request.role.lower())
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid role '{request.role}'. Must be one of: user, admin, rescue"
            )
        
        # Validate risk level
        valid_risk_levels = ["LOW", "MEDIUM", "HIGH"]
        if request.risk_level.upper() not in valid_risk_levels:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid risk_level '{request.risk_level}'. Must be one of: {', '.join(valid_risk_levels)}"
            )
        
        # Generate role-specific response
        message = ai_assistant.generate_chat_response(
            role=user_role,
            region=request.region,
            probability=request.probability,
            risk_level=request.risk_level.upper(),
            features=request.features
        )
        
        return ChatResponse(
            message=message,
            role=request.role.lower(),
            region=request.region,
            risk_level=request.risk_level.upper()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating AI response: {str(e)}"
        )


@router.post("/explain", response_model=ExplanationResponse)
def explain_prediction(request: ExplanationRequest):
    """
    Explain why the model predicted a specific landslide risk level.
    
    Analyzes the environmental features and provides a human-readable
    explanation of the key factors driving the prediction.
    
    Args:
        request: Environmental features used for prediction
        
    Returns:
        Technical explanation of prediction factors
        
    Raises:
        HTTPException: If explanation generation fails
    """
    try:
        features = {
            "rainfall_6h": request.rainfall_6h,
            "rainfall_12h": request.rainfall_12h,
            "rainfall_24h": request.rainfall_24h,
            "soil_saturation_index": request.soil_saturation_index,
            "slope_stability_factor": request.slope_stability_factor,
            "terrain_vulnerability_index": request.terrain_vulnerability_index
        }
        
        explanation = ai_assistant.explain_prediction(features)
        
        return ExplanationResponse(explanation=explanation)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating explanation: {str(e)}"
        )


@router.get("/roles")
def get_available_roles():
    """
    Get list of available user roles for the AI assistant.
    
    Returns:
        List of supported roles with descriptions
    """
    return {
        "roles": [
            {
                "id": "user",
                "name": "Civilian User",
                "description": "Safety-focused advisories for general public, travelers, and residents"
            },
            {
                "id": "admin",
                "name": "Defense Administrator",
                "description": "Tactical intelligence for defense operations, logistics, and strategic planning"
            },
            {
                "id": "rescue",
                "name": "Rescue Team",
                "description": "Emergency response guidance for disaster management and rescue operations"
            }
        ]
    }


@router.get("/health")
def ai_health_check():
    """Health check for AI assistant service"""
    return {
        "status": "healthy",
        "service": "GeoSentinel AI Assistant",
        "model_type": "HuggingFace" if ai_assistant.use_huggingface else "Template-based",
        "model_name": ai_assistant.model_name if ai_assistant.use_huggingface else "Built-in Templates"
    }
