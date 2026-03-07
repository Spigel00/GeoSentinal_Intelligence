"""User management routes backed by MySQL."""

import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from models import Region, User
from schemas.request import UserRegistrationRequest
from schemas.response import MessageResponse, UserResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/register", response_model=UserResponse)
def register_user(user_data: UserRegistrationRequest, db: Session = Depends(get_db)):
    """
    Register a new user with their monitoring region.
    
    Returns:
        UserResponse with user details
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

    new_user = User(
        user_id=f"U{str(uuid.uuid4())[:8].upper()}",
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        region_id=region.id,
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
