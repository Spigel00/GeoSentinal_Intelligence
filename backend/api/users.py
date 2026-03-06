"""
User management routes.
Handles user registration and retrieval.
"""
from fastapi import APIRouter, HTTPException
from typing import List
import json
import os
import uuid
from schemas.request import UserRegistrationRequest
from schemas.response import UserResponse, MessageResponse

router = APIRouter(prefix="/users", tags=["users"])

USERS_FILE = "data/users.json"


def load_users() -> List[dict]:
    """Load users from JSON file"""
    if os.path.exists(USERS_FILE):
        try:
            with open(USERS_FILE, 'r') as f:
                return json.load(f) or []
        except:
            return []
    return []


def save_users(users: List[dict]):
    """Save users to JSON file"""
    os.makedirs(os.path.dirname(USERS_FILE), exist_ok=True)
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)


@router.post("/register", response_model=UserResponse)
def register_user(user_data: UserRegistrationRequest):
    """
    Register a new user with their monitoring region.
    
    Returns:
        UserResponse with user details
    """
    users = load_users()
    
    # Check if user already exists
    if any(user["email"] == user_data.email for user in users):
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    # Create new user
    new_user = {
        "user_id": f"U{str(uuid.uuid4())[:8].upper()}",
        "name": user_data.name,
        "email": user_data.email,
        "phone": user_data.phone,
        "region": user_data.region
    }
    
    users.append(new_user)
    save_users(users)
    
    return UserResponse(**new_user)


@router.get("/", response_model=List[UserResponse])
def get_all_users():
    """
    Get all registered users.
    
    Returns:
        List of all users
    """
    users = load_users()
    return [UserResponse(**user) for user in users]


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: str):
    """
    Get a specific user by ID.
    
    Args:
        user_id: User ID
        
    Returns:
        User details
    """
    users = load_users()
    user = next((u for u in users if u["user_id"] == user_id), None)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(**user)


@router.delete("/{user_id}", response_model=MessageResponse)
def delete_user(user_id: str):
    """
    Delete a user by ID.
    
    Args:
        user_id: User ID
        
    Returns:
        Success message
    """
    users = load_users()
    user = next((u for u in users if u["user_id"] == user_id), None)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    users = [u for u in users if u["user_id"] != user_id]
    save_users(users)
    
    return MessageResponse(message=f"User {user_id} deleted successfully")
