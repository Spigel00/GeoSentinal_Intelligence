"""
Notification testing and management routes.
Allows testing of SMTP and SMS notifications.
"""
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from services.notification_service import get_notification_service
from services.alert_service import AlertService

router = APIRouter(prefix="/notifications", tags=["notifications"])


class EmailTestRequest(BaseModel):
    """Request body for testing email"""
    to_email: EmailStr = Field(..., description="Recipient email address")
    subject: str = Field(default="GeoSentinel Test Email", description="Email subject")
    message: str = Field(..., description="Email message body")


class SMSTestRequest(BaseModel):
    """Request body for testing SMS"""
    to_phone: str = Field(..., description="Recipient phone number (E.164 format, e.g., +919999999999)")
    message: str = Field(..., description="SMS message body")


class AlertTestRequest(BaseModel):
    """Request body for testing complete alert"""
    user_email: EmailStr = Field(..., description="User email address")
    user_phone: str = Field(..., description="User phone number")
    user_name: str = Field(..., description="User name")
    region: str = Field(default="Test Region", description="Region name")
    probability: float = Field(default=0.85, ge=0, le=1, description="Landslide probability")
    risk_level: str = Field(default="HIGH", description="Risk level (LOW, MEDIUM, HIGH)")


@router.get("/status")
def get_notification_status():
    """
    Get notification service status.
    
    Returns:
        Current configuration and status of email and SMS services
    """
    notification_service = get_notification_service()
    
    return {
        "email": {
            "enabled": notification_service.smtp_enabled,
            "configured": bool(notification_service.from_email and notification_service.email_password),
            "server": notification_service.smtp_server,
            "port": notification_service.smtp_port,
            "from_email": notification_service.from_email if notification_service.from_email else "Not configured"
        },
        "sms": {
            "enabled": notification_service.sms_enabled,
            "configured": bool(notification_service.twilio_client),
            "provider": "Twilio",
            "from_phone": notification_service.twilio_phone if notification_service.twilio_phone else "Not configured"
        }
    }


@router.post("/test/email")
def test_email(request: EmailTestRequest):
    """
    Test email notification.
    
    Args:
        request: Email test request with recipient and message
        
    Returns:
        Result of email send operation
    """
    notification_service = get_notification_service()
    
    result = notification_service.send_email(
        to_email=request.to_email,
        subject=request.subject,
        body=request.message
    )
    
    if result["success"]:
        return {
            "status": "success",
            "message": result["message"],
            "mode": result["mode"]
        }
    else:
        raise HTTPException(
            status_code=500 if result["mode"] == "error" else 400,
            detail=result["message"]
        )


@router.post("/test/sms")
def test_sms(request: SMSTestRequest):
    """
    Test SMS notification.
    
    Args:
        request: SMS test request with recipient and message
        
    Returns:
        Result of SMS send operation
    """
    notification_service = get_notification_service()
    
    result = notification_service.send_sms(
        to_phone=request.to_phone,
        message=request.message
    )
    
    if result["success"]:
        return {
            "status": "success",
            "message": result["message"],
            "mode": result["mode"],
            "message_sid": result.get("message_sid")
        }
    else:
        raise HTTPException(
            status_code=500 if result["mode"] == "error" else 400,
            detail=result["message"]
        )


@router.post("/test/alert")
def test_alert(request: AlertTestRequest):
    """
    Test complete landslide alert (both email and SMS).
    
    Args:
        request: Alert test request with user info and alert details
        
    Returns:
        Results of both email and SMS operations
    """
    notification_service = get_notification_service()
    
    # Create user dict
    user = {
        "email": request.user_email,
        "phone": request.user_phone,
        "name": request.user_name
    }
    
    # Send alert
    results = notification_service.send_landslide_alert(
        user=user,
        region=request.region,
        probability=request.probability,
        risk_level=request.risk_level
    )
    
    return {
        "status": "completed",
        "user": request.user_name,
        "region": request.region,
        "probability": request.probability,
        "risk_level": request.risk_level,
        "results": {
            "email": results.get("email"),
            "sms": results.get("sms")
        }
    }


@router.post("/send-region-alert/{region_name}")
def send_region_alert(region_name: str, probability: float = 0.85, risk_level: str = "HIGH"):
    """
    Send alert to all users subscribed to a region.
    
    Args:
        region_name: Name of the region
        probability: Landslide probability (default 0.85)
        risk_level: Risk level (default HIGH)
        
    Returns:
        Summary of alerts sent
    """
    alert_service = AlertService()
    
    # Get users for region
    users = alert_service.get_users_for_region(region_name)
    
    if not users:
        raise HTTPException(
            status_code=404,
            detail=f"No users found for region: {region_name}"
        )
    
    # Send alerts to all users
    notification_service = get_notification_service()
    results = []
    
    for user in users:
        result = notification_service.send_landslide_alert(
            user=user,
            region=region_name,
            probability=probability,
            risk_level=risk_level
        )
        results.append({
            "user": user.get("name"),
            "email": result.get("email"),
            "sms": result.get("sms")
        })
    
    # Log the alert
    alert_service.log_alert(region_name, risk_level, probability)
    
    return {
        "status": "completed",
        "region": region_name,
        "users_notified": len(users),
        "results": results
    }
