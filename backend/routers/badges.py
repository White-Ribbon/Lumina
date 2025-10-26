from fastapi import APIRouter, HTTPException, status, Depends, Query
from models import Badge, BadgeCreate, BadgeUpdate, MessageResponse, PaginatedResponse
from auth import get_current_active_user, get_current_admin_user, generate_hashid
from database import get_database
from datetime import datetime
from typing import List, Optional

router = APIRouter()

@router.get("/", response_model=List[Badge])
async def get_badges(
    solar_system_id: Optional[str] = Query(None),
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Get all badges, optionally filtered by solar system"""
    
    query = {}
    if solar_system_id:
        # Find solar system by ID or hashid
        solar_system = await database.solar_systems.find_one({
            "$or": [
                {"_id": solar_system_id},
                {"hashid": solar_system_id}
            ]
        })
        
        if not solar_system:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Solar system not found"
            )
        
        query["solar_system_id"] = solar_system["hashid"]
    
    cursor = database.badges.find(query).sort("created_at", 1)
    badges = await cursor.to_list(length=None)
    
    badge_responses = []
    for badge in badges:
        badge_responses.append(Badge(
            id=str(badge["_id"]),
            hashid=badge["hashid"],
            name=badge["name"],
            description=badge["description"],
            icon=badge["icon"],
            color=badge["color"],
            solar_system_id=badge["solar_system_id"],
            created_at=badge["created_at"],
            updated_at=badge["updated_at"]
        ))
    
    return badge_responses

@router.get("/{badge_id}", response_model=Badge)
async def get_badge(
    badge_id: str,
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Get badge by ID or hashid"""
    
    badge = await database.badges.find_one({
        "$or": [
            {"_id": badge_id},
            {"hashid": badge_id}
        ]
    })
    
    if not badge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Badge not found"
        )
    
    return Badge(
        id=str(badge["_id"]),
        hashid=badge["hashid"],
        name=badge["name"],
        description=badge["description"],
        icon=badge["icon"],
        color=badge["color"],
        solar_system_id=badge["solar_system_id"],
        created_at=badge["created_at"],
        updated_at=badge["updated_at"]
    )

@router.post("/", response_model=Badge)
async def create_badge(
    badge_data: BadgeCreate,
    database = Depends(get_database),
    current_user = Depends(get_current_admin_user)
):
    """Create a new badge (admin only)"""
    
    # Verify solar system exists
    solar_system = await database.solar_systems.find_one({
        "$or": [
            {"_id": badge_data.solar_system_id},
            {"hashid": badge_data.solar_system_id}
        ]
    })
    
    if not solar_system:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solar system not found"
        )
    
    # Check if badge already exists for this solar system
    existing_badge = await database.badges.find_one({
        "solar_system_id": solar_system["hashid"]
    })
    
    if existing_badge:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Badge already exists for this solar system"
        )
    
    badge_doc = {
        "name": badge_data.name,
        "description": badge_data.description,
        "icon": badge_data.icon,
        "color": badge_data.color,
        "solar_system_id": solar_system["hashid"],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await database.badges.insert_one(badge_doc)
    
    # Generate hashid
    hashid = generate_hashid("badges", str(result.inserted_id))
    
    # Update badge with hashid
    await database.badges.update_one(
        {"_id": result.inserted_id},
        {"$set": {"hashid": hashid}}
    )
    
    badge_doc["_id"] = result.inserted_id
    badge_doc["hashid"] = hashid
    badge_doc["id"] = str(result.inserted_id)
    
    return Badge(**badge_doc)

@router.put("/{badge_id}", response_model=Badge)
async def update_badge(
    badge_id: str,
    badge_update: BadgeUpdate,
    database = Depends(get_database),
    current_user = Depends(get_current_admin_user)
):
    """Update a badge (admin only)"""
    
    badge = await database.badges.find_one({
        "$or": [
            {"_id": badge_id},
            {"hashid": badge_id}
        ]
    })
    
    if not badge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Badge not found"
        )
    
    # Build update data
    update_data = {"updated_at": datetime.utcnow()}
    
    if badge_update.name is not None:
        update_data["name"] = badge_update.name
    if badge_update.description is not None:
        update_data["description"] = badge_update.description
    if badge_update.icon is not None:
        update_data["icon"] = badge_update.icon
    if badge_update.color is not None:
        update_data["color"] = badge_update.color
    
    # Update badge
    await database.badges.update_one(
        {"_id": badge["_id"]},
        {"$set": update_data}
    )
    
    # Get updated badge
    updated_badge = await database.badges.find_one({"_id": badge["_id"]})
    
    return Badge(
        id=str(updated_badge["_id"]),
        hashid=updated_badge["hashid"],
        name=updated_badge["name"],
        description=updated_badge["description"],
        icon=updated_badge["icon"],
        color=updated_badge["color"],
        solar_system_id=updated_badge["solar_system_id"],
        created_at=updated_badge["created_at"],
        updated_at=updated_badge["updated_at"]
    )

@router.delete("/{badge_id}", response_model=MessageResponse)
async def delete_badge(
    badge_id: str,
    database = Depends(get_database),
    current_user = Depends(get_current_admin_user)
):
    """Delete a badge (admin only)"""
    
    badge = await database.badges.find_one({
        "$or": [
            {"_id": badge_id},
            {"hashid": badge_id}
        ]
    })
    
    if not badge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Badge not found"
        )
    
    # Check if badge is referenced by solar systems
    solar_systems_count = await database.solar_systems.count_documents({
        "badge_id": badge["hashid"]
    })
    
    if solar_systems_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete badge referenced by solar systems"
        )
    
    # Remove badge from all users
    await database.users.update_many(
        {"badges": badge["hashid"]},
        {
            "$pull": {"badges": badge["hashid"]},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    # Delete badge
    await database.badges.delete_one({"_id": badge["_id"]})
    
    return {"message": "Badge deleted successfully"}

@router.get("/user/{user_id}", response_model=List[Badge])
async def get_user_badges(
    user_id: str,
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Get badges earned by a specific user"""
    
    # Find user by ID or hashid
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
    
    # Get badges
    cursor = database.badges.find({"hashid": {"$in": user["badges"]}})
    badges = await cursor.to_list(length=None)
    
    badge_responses = []
    for badge in badges:
        badge_responses.append(Badge(
            id=str(badge["_id"]),
            hashid=badge["hashid"],
            name=badge["name"],
            description=badge["description"],
            icon=badge["icon"],
            color=badge["color"],
            solar_system_id=badge["solar_system_id"],
            created_at=badge["created_at"],
            updated_at=badge["updated_at"]
        ))
    
    return badge_responses
