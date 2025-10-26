from fastapi import APIRouter, HTTPException, status, Depends, Query
from models import UserResponse, UserUpdate, MessageResponse, PaginatedResponse
from auth import get_current_active_user, get_current_admin_user, generate_hashid
from database import get_database
from datetime import datetime
from typing import List, Optional

router = APIRouter()

@router.get("/", response_model=PaginatedResponse)
async def get_users(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Get paginated list of users"""
    
    # Build query
    query = {}
    if search:
        query["$or"] = [
            {"username": {"$regex": search, "$options": "i"}},
            {"bio": {"$regex": search, "$options": "i"}}
        ]
    
    # Get total count
    total = await database.users.count_documents(query)
    
    # Calculate pagination
    skip = (page - 1) * size
    pages = (total + size - 1) // size
    
    # Get users
    cursor = database.users.find(query).skip(skip).limit(size)
    users = await cursor.to_list(length=size)
    
    # Convert to response format
    user_responses = []
    for user in users:
        user_responses.append(UserResponse(
            id=str(user["_id"]),
            hashid=user["hashid"],
            username=user["username"],
            email=user["email"],
            bio=user["bio"],
            socials=user["socials"],
            avatar_url=user["avatar_url"],
            badges=user["badges"],
            unlocked_galaxies=user["unlocked_galaxies"],
            is_admin=user["is_admin"],
            created_at=user["created_at"],
            updated_at=user["updated_at"]
        ))
    
    return PaginatedResponse(
        items=user_responses,
        total=total,
        page=page,
        size=size,
        pages=pages
    )

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Get user by ID or hashid"""
    
    # Try to find by ObjectId first, then by hashid
    user = await database.users.find_one({
        "$or": [
            {"_id": user_id},
            {"hashid": user_id}
        ]
    })
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=str(user["_id"]),
        hashid=user["hashid"],
        username=user["username"],
        email=user["email"],
        bio=user["bio"],
        socials=user["socials"],
        avatar_url=user["avatar_url"],
        badges=user["badges"],
        unlocked_galaxies=user["unlocked_galaxies"],
        is_admin=user["is_admin"],
        created_at=user["created_at"],
        updated_at=user["updated_at"]
    )

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Update current user's profile"""
    
    # Build update data
    update_data = {"updated_at": datetime.utcnow()}
    
    if user_update.username is not None:
        # Check if username is already taken
        existing_user = await database.users.find_one({
            "username": user_update.username,
            "_id": {"$ne": current_user.id}
        })
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        update_data["username"] = user_update.username
    
    if user_update.bio is not None:
        update_data["bio"] = user_update.bio
    
    if user_update.socials is not None:
        update_data["socials"] = user_update.socials.dict()
    
    if user_update.avatar_url is not None:
        update_data["avatar_url"] = user_update.avatar_url
    
    # Update user
    result = await database.users.update_one(
        {"_id": current_user.id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get updated user
    updated_user = await database.users.find_one({"_id": current_user.id})
    
    return UserResponse(
        id=str(updated_user["_id"]),
        hashid=updated_user["hashid"],
        username=updated_user["username"],
        email=updated_user["email"],
        bio=updated_user["bio"],
        socials=updated_user["socials"],
        avatar_url=updated_user["avatar_url"],
        badges=updated_user["badges"],
        unlocked_galaxies=updated_user["unlocked_galaxies"],
        is_admin=updated_user["is_admin"],
        created_at=updated_user["created_at"],
        updated_at=updated_user["updated_at"]
    )

@router.put("/{user_id}/admin", response_model=UserResponse)
async def toggle_admin_status(
    user_id: str,
    database = Depends(get_database),
    current_user = Depends(get_current_admin_user)
):
    """Toggle admin status of a user (admin only)"""
    
    # Find user
    user = await database.users.find_one({
        "$or": [
            {"_id": user_id},
            {"hashid": user_id}
        ]
    })
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent self-demotion
    if str(user["_id"]) == str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own admin status"
        )
    
    # Toggle admin status
    new_admin_status = not user["is_admin"]
    
    await database.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"is_admin": new_admin_status, "updated_at": datetime.utcnow()}}
    )
    
    # Get updated user
    updated_user = await database.users.find_one({"_id": user["_id"]})
    
    return UserResponse(
        id=str(updated_user["_id"]),
        hashid=updated_user["hashid"],
        username=updated_user["username"],
        email=updated_user["email"],
        bio=updated_user["bio"],
        socials=updated_user["socials"],
        avatar_url=updated_user["avatar_url"],
        badges=updated_user["badges"],
        unlocked_galaxies=updated_user["unlocked_galaxies"],
        is_admin=updated_user["is_admin"],
        created_at=updated_user["created_at"],
        updated_at=updated_user["updated_at"]
    )

@router.delete("/{user_id}", response_model=MessageResponse)
async def delete_user(
    user_id: str,
    database = Depends(get_database),
    current_user = Depends(get_current_admin_user)
):
    """Delete a user (admin only)"""
    
    # Find user
    user = await database.users.find_one({
        "$or": [
            {"_id": user_id},
            {"hashid": user_id}
        ]
    })
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent self-deletion
    if str(user["_id"]) == str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    # Delete user
    await database.users.delete_one({"_id": user["_id"]})
    
    return {"message": "User deleted successfully"}
