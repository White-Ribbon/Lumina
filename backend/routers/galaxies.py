from fastapi import APIRouter, HTTPException, status, Depends, Query
from models import Galaxy, GalaxyCreate, GalaxyUpdate, MessageResponse, PaginatedResponse
from auth import get_current_active_user, get_current_admin_user, generate_hashid
from database import get_database
from datetime import datetime
from typing import List, Optional
import random

router = APIRouter()

@router.get("/", response_model=List[Galaxy])
async def get_galaxies(
    unlocked_only: bool = Query(False),
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Get all galaxies, optionally filtered by unlocked status"""
    
    query = {}
    if unlocked_only:
        # Get galaxies that are unlocked by default or unlocked by user
        query = {
            "$or": [
                {"is_unlocked_by_default": True},
                {"hashid": {"$in": current_user.unlocked_galaxies}}
            ]
        }
    
    cursor = database.galaxies.find(query).sort("created_at", 1)
    galaxies = await cursor.to_list(length=None)
    
    galaxy_responses = []
    for galaxy in galaxies:
        galaxy_responses.append(Galaxy(
            id=str(galaxy["_id"]),
            hashid=galaxy["hashid"],
            name=galaxy["name"],
            description=galaxy["description"],
            icon=galaxy["icon"],
            color=galaxy["color"],
            is_unlocked_by_default=galaxy["is_unlocked_by_default"],
            created_at=galaxy["created_at"],
            updated_at=galaxy["updated_at"]
        ))
    
    return galaxy_responses

@router.get("/{galaxy_id}", response_model=Galaxy)
async def get_galaxy(
    galaxy_id: str,
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Get galaxy by ID or hashid"""
    
    galaxy = await database.galaxies.find_one({
        "$or": [
            {"_id": galaxy_id},
            {"hashid": galaxy_id}
        ]
    })
    
    if not galaxy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Galaxy not found"
        )
    
    # Check if user has access to this galaxy
    has_access = (
        galaxy["is_unlocked_by_default"] or 
        galaxy["hashid"] in current_user.unlocked_galaxies
    )
    
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Galaxy not unlocked"
        )
    
    return Galaxy(
        id=str(galaxy["_id"]),
        hashid=galaxy["hashid"],
        name=galaxy["name"],
        description=galaxy["description"],
        icon=galaxy["icon"],
        color=galaxy["color"],
        is_unlocked_by_default=galaxy["is_unlocked_by_default"],
        created_at=galaxy["created_at"],
        updated_at=galaxy["updated_at"]
    )

@router.post("/", response_model=Galaxy)
async def create_galaxy(
    galaxy_data: GalaxyCreate,
    database = Depends(get_database),
    current_user = Depends(get_current_admin_user)
):
    """Create a new galaxy (admin only)"""
    
    galaxy_doc = {
        "name": galaxy_data.name,
        "description": galaxy_data.description,
        "icon": galaxy_data.icon,
        "color": galaxy_data.color,
        "is_unlocked_by_default": galaxy_data.is_unlocked_by_default,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await database.galaxies.insert_one(galaxy_doc)
    
    # Generate hashid
    hashid = generate_hashid("galaxies", str(result.inserted_id))
    
    # Update galaxy with hashid
    await database.galaxies.update_one(
        {"_id": result.inserted_id},
        {"$set": {"hashid": hashid}}
    )
    
    galaxy_doc["_id"] = result.inserted_id
    galaxy_doc["hashid"] = hashid
    galaxy_doc["id"] = str(result.inserted_id)
    
    return Galaxy(**galaxy_doc)

@router.put("/{galaxy_id}", response_model=Galaxy)
async def update_galaxy(
    galaxy_id: str,
    galaxy_update: GalaxyUpdate,
    database = Depends(get_database),
    current_user = Depends(get_current_admin_user)
):
    """Update a galaxy (admin only)"""
    
    galaxy = await database.galaxies.find_one({
        "$or": [
            {"_id": galaxy_id},
            {"hashid": galaxy_id}
        ]
    })
    
    if not galaxy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Galaxy not found"
        )
    
    # Build update data
    update_data = {"updated_at": datetime.utcnow()}
    
    if galaxy_update.name is not None:
        update_data["name"] = galaxy_update.name
    if galaxy_update.description is not None:
        update_data["description"] = galaxy_update.description
    if galaxy_update.icon is not None:
        update_data["icon"] = galaxy_update.icon
    if galaxy_update.color is not None:
        update_data["color"] = galaxy_update.color
    
    # Update galaxy
    await database.galaxies.update_one(
        {"_id": galaxy["_id"]},
        {"$set": update_data}
    )
    
    # Get updated galaxy
    updated_galaxy = await database.galaxies.find_one({"_id": galaxy["_id"]})
    
    return Galaxy(
        id=str(updated_galaxy["_id"]),
        hashid=updated_galaxy["hashid"],
        name=updated_galaxy["name"],
        description=updated_galaxy["description"],
        icon=updated_galaxy["icon"],
        color=updated_galaxy["color"],
        is_unlocked_by_default=updated_galaxy["is_unlocked_by_default"],
        created_at=updated_galaxy["created_at"],
        updated_at=updated_galaxy["updated_at"]
    )

@router.delete("/{galaxy_id}", response_model=MessageResponse)
async def delete_galaxy(
    galaxy_id: str,
    database = Depends(get_database),
    current_user = Depends(get_current_admin_user)
):
    """Delete a galaxy (admin only)"""
    
    galaxy = await database.galaxies.find_one({
        "$or": [
            {"_id": galaxy_id},
            {"hashid": galaxy_id}
        ]
    })
    
    if not galaxy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Galaxy not found"
        )
    
    # Check if galaxy has solar systems
    solar_systems_count = await database.solar_systems.count_documents({
        "galaxy_id": galaxy["hashid"]
    })
    
    if solar_systems_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete galaxy with existing solar systems"
        )
    
    # Delete galaxy
    await database.galaxies.delete_one({"_id": galaxy["_id"]})
    
    return {"message": "Galaxy deleted successfully"}

@router.post("/{galaxy_id}/unlock", response_model=MessageResponse)
async def unlock_galaxy(
    galaxy_id: str,
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Unlock a galaxy for the current user"""
    
    galaxy = await database.galaxies.find_one({
        "$or": [
            {"_id": galaxy_id},
            {"hashid": galaxy_id}
        ]
    })
    
    if not galaxy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Galaxy not found"
        )
    
    # Check if already unlocked
    if galaxy["hashid"] in current_user.unlocked_galaxies:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Galaxy already unlocked"
        )
    
    # Add galaxy to user's unlocked galaxies
    await database.users.update_one(
        {"_id": current_user.id},
        {
            "$addToSet": {"unlocked_galaxies": galaxy["hashid"]},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    return {"message": "Galaxy unlocked successfully"}

@router.post("/unlock-random", response_model=MessageResponse)
async def unlock_random_galaxy(
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Unlock a random galaxy for the current user"""
    
    # Get all galaxies that are not unlocked by default and not already unlocked by user
    available_galaxies = await database.galaxies.find({
        "is_unlocked_by_default": False,
        "hashid": {"$nin": current_user.unlocked_galaxies}
    }).to_list(length=None)
    
    if not available_galaxies:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No galaxies available to unlock"
        )
    
    # Select random galaxy
    random_galaxy = random.choice(available_galaxies)
    
    # Add galaxy to user's unlocked galaxies
    await database.users.update_one(
        {"_id": current_user.id},
        {
            "$addToSet": {"unlocked_galaxies": random_galaxy["hashid"]},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    return {
        "message": f"Random galaxy '{random_galaxy['name']}' unlocked successfully",
        "galaxy_id": random_galaxy["hashid"]
    }
