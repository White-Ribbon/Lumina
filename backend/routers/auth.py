from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer
from models import UserCreate, UserResponse, LoginRequest, Token, RefreshTokenRequest, MessageResponse
from auth import (
    verify_password, get_password_hash, create_access_token, create_refresh_token,
    verify_token, get_current_user, get_current_active_user, generate_hashid
)
from database import get_database
from datetime import datetime, timedelta
import os

router = APIRouter()
security = HTTPBearer()

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, database = Depends(get_database)):
    """Register a new user"""
    
    # Check if username already exists
    existing_user = await database.users.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    existing_email = await database.users.find_one({"email": user_data.email})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user document
    user_doc = {
        "username": user_data.username,
        "email": user_data.email,
        "bio": user_data.bio,
        "socials": user_data.socials.dict() if user_data.socials else None,
        "avatar_url": user_data.avatar_url,
        "password_hash": get_password_hash(user_data.password),
        "badges": [],
        "unlocked_galaxies": [],
        "is_admin": False,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Insert user
    result = await database.users.insert_one(user_doc)
    
    # Generate hashid
    hashid = generate_hashid("users", str(result.inserted_id))
    
    # Update user with hashid
    await database.users.update_one(
        {"_id": result.inserted_id},
        {"$set": {"hashid": hashid}}
    )
    
    # Return user without password
    user_doc["_id"] = result.inserted_id
    user_doc["hashid"] = hashid
    user_doc["id"] = str(result.inserted_id)
    del user_doc["password_hash"]
    
    return UserResponse(**user_doc)

@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest, database = Depends(get_database)):
    """Login user and return tokens"""
    
    # Find user by username or email
    user = await database.users.find_one({
        "$or": [
            {"username": login_data.username},
            {"email": login_data.username}
        ]
    })
    
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Create tokens
    access_token_expires = timedelta(minutes=30)
    refresh_token_expires = timedelta(days=7)
    
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        data={"sub": user["username"]}, expires_delta=refresh_token_expires
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_data: RefreshTokenRequest, database = Depends(get_database)):
    """Refresh access token using refresh token"""
    
    token_data = verify_token(refresh_data.refresh_token, "refresh")
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Find user
    user = await database.users.find_one({
        "$or": [
            {"username": token_data.username},
            {"email": token_data.username}
        ]
    })
    
    if not user or not user["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create new tokens
    access_token_expires = timedelta(minutes=30)
    refresh_token_expires = timedelta(days=7)
    
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    new_refresh_token = create_refresh_token(
        data={"sub": user["username"]}, expires_delta=refresh_token_expires
    )
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user = Depends(get_current_active_user)):
    """Get current user information"""
    return UserResponse(
        id=str(current_user.id),
        hashid=current_user.hashid,
        username=current_user.username,
        email=current_user.email,
        bio=current_user.bio,
        socials=current_user.socials,
        avatar_url=current_user.avatar_url,
        badges=current_user.badges,
        unlocked_galaxies=current_user.unlocked_galaxies,
        is_admin=current_user.is_admin,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )

@router.post("/logout", response_model=MessageResponse)
async def logout():
    """Logout user (client should discard tokens)"""
    return {"message": "Successfully logged out"}
