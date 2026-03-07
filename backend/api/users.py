"""User management routes backed by MySQL with authentication and behavior tracking."""

import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session

from db import get_db
from models import Region, User
from schemas.request import UserLoginRequest, UserRegistrationRequest
from schemas.response import (
    AnomalyDetectionResponse,
    BehaviorStatsResponse,
    LoginResponse,
    MessageResponse,
    UserResponse,
)
from services.anomaly_detector import anomaly_detector
from services.auth_service import AuthService
from services.behavior_tracking import BehaviorTrackingService

router = APIRouter(prefix="/users", tags=["users"])

# Helper function to get current user from JWT token
async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get current authenticated user from JWT token.
    
    Args:
        authorization: Authorization header with Bearer token
        db: Database session
        
    Returns:
        Current User instance
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    token = AuthService.get_token_from_header(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
    
    payload = AuthService.decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    if not user.is_active:
        raise HTTPException(status_code=401, detail="User account is inactive")
    
    return user


@router.post("/register", response_model=UserResponse)
def register_user(user_data: UserRegistrationRequest, db: Session = Depends(get_db)):
    """
    Register a new user with their monitoring region and password.
    Password is hashed using bcrypt before storage.
    
    Returns:
        UserResponse with user details (without password)
    """
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    region = db.query(Region).filter(Region.name == user_data.region).first()
    if region is None:
        # Preserve previous behavior where any region string could be accepted.
        region = Region(name=user_data.region, lat=0.0, lon=0.0)
        db.add(region)
        db.flush()

    # Hash the password using bcrypt
    password_hash = AuthService.hash_password(user_data.password)

    new_user = User(
        user_id=f"U{str(uuid.uuid4())[:8].upper()}",
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        password_hash=password_hash,
        region_id=region.id,
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return UserResponse(
        user_id=new_user.user_id,
        name=new_user.name,
        email=new_user.email,
        phone=new_user.phone,
        region=region.name,
    )


@router.post("/login", response_model=LoginResponse)
async def login_user(
    login_data: UserLoginRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Authenticate user and return JWT access token.
    Captures behavior events including login attempts, IP, device fingerprint.
    
    Returns:
        LoginResponse with access token and user details
    """
    # Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()
    
    # Get request metadata for behavior tracking
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    device_fingerprint = request.headers.get("x-device-fingerprint")
    
    if not user:
        # Log failed login attempt (user not found)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Check if account is active
    if not user.is_active:
        BehaviorTrackingService.log_event(
            db=db,
            user_id=user.id,
            event_type="failed_login",
            ip_address=client_ip,
            device_fingerprint=device_fingerprint,
            user_agent=user_agent,
            success=False,
            event_metadata={"reason": "account_inactive"}
        )
        raise HTTPException(status_code=401, detail="Account is inactive")
    
    # Verify password
    if not AuthService.verify_password(login_data.password, user.password_hash):
        # Log failed login attempt
        BehaviorTrackingService.log_event(
            db=db,
            user_id=user.id,
            event_type="failed_login",
            ip_address=client_ip,
            device_fingerprint=device_fingerprint,
            user_agent=user_agent,
            success=False,
            event_metadata={"reason": "invalid_password"}
        )
        
        # Check for suspicious failed login patterns
        recent_failed = BehaviorTrackingService.get_recent_failed_login_count(db, user.id, minutes=30)
        if recent_failed >= 5:
            # Too many failed attempts - could deactivate account here
            raise HTTPException(
                status_code=429,
                detail="Too many failed login attempts. Please try again later."
            )
        
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Successful login - log the event
    BehaviorTrackingService.log_event(
        db=db,
        user_id=user.id,
        event_type="login",
        ip_address=client_ip,
        device_fingerprint=device_fingerprint,
        user_agent=user_agent,
        success=True
    )
    
    # Update last login time
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create JWT token
    access_token = AuthService.create_access_token(
        data={"sub": user.email, "user_id": user.user_id}
    )
    
    # Load region for response
    region = db.query(Region).filter(Region.id == user.region_id).first()
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            user_id=user.user_id,
            name=user.name,
            email=user.email,
            phone=user.phone,
            region=region.name if region else "",
        )
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user's information.
    Requires valid JWT token in Authorization header.
    
    Returns:
        Current user details
    """
    return UserResponse(
        user_id=current_user.user_id,
        name=current_user.name,
        email=current_user.email,
        phone=current_user.phone,
        region=current_user.region.name,
    )


@router.get("/me/behavior-stats", response_model=BehaviorStatsResponse)
async def get_behavior_stats(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get behavior statistics for the current user.
    
    Args:
        days: Number of days to analyze (default: 30)
        
    Returns:
        Behavior statistics
    """
    stats = BehaviorTrackingService.get_user_behavior_stats(db, current_user.id, days)
    return BehaviorStatsResponse(**stats)


@router.get("/me/anomaly-detection", response_model=AnomalyDetectionResponse)
async def detect_anomalies(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Run anomaly detection on current user's behavior.
    Uses SVM model to detect unusual patterns.
    
    Args:
        days: Number of days to analyze (default: 30)
        
    Returns:
        Anomaly detection results
    """
    result = anomaly_detector.predict_anomaly(db, current_user.id, days)
    return AnomalyDetectionResponse(**result)


@router.post("/train-anomaly-model", response_model=MessageResponse)
async def train_anomaly_model(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Train the SVM anomaly detection model on historical data.
    Requires authentication.
    
    Returns:
        Success message
    """
    success = anomaly_detector.train(db)
    
    if success:
        return MessageResponse(
            message="Anomaly detection model trained successfully",
            success=True
        )
    else:
        return MessageResponse(
            message="Failed to train model - insufficient data",
            success=False
        )


@router.get("/", response_model=List[UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    """
    Get all registered users.
    
    Returns:
        List of all users
    """
    users = db.query(User).join(Region).all()
    return [
        UserResponse(
            user_id=user.user_id,
            name=user.name,
            email=user.email,
            phone=user.phone,
            region=user.region.name,
        )
        for user in users
    ]


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: str, db: Session = Depends(get_db)):
    """
    Get a specific user by ID.
    
    Args:
        user_id: User ID
        
    Returns:
        User details
    """
    user = db.query(User).join(Region).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserResponse(
        user_id=user.user_id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        region=user.region.name,
    )


@router.delete("/{user_id}", response_model=MessageResponse)
def delete_user(user_id: str, db: Session = Depends(get_db)):
    """
    Delete a user by ID.
    
    Args:
        user_id: User ID
        
    Returns:
        Success message
    """
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    return MessageResponse(message=f"User {user_id} deleted successfully")

