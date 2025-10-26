from fastapi import APIRouter, HTTPException, status, Depends, Query
from models import SolarSystem, SolarSystemCreate, SolarSystemUpdate, MessageResponse, PaginatedResponse
from auth import get_current_active_user, get_current_admin_user, generate_hashid
from database import get_database
from datetime import datetime
from typing import List, Optional

router = APIRouter()

@router.get("/", response_model=List[SolarSystem])
async def get_solar_systems(
    galaxy_id: Optional[str] = Query(None),
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Get solar systems, optionally filtered by galaxy"""
    
    query = {}
    if galaxy_id:
        # Verify galaxy access
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
        
        query["galaxy_id"] = galaxy["hashid"]
    
    cursor = database.solar_systems.find(query).sort("created_at", 1)
    solar_systems = await cursor.to_list(length=None)
    
    solar_system_responses = []
    for solar_system in solar_systems:
        solar_system_responses.append(SolarSystem(
            id=str(solar_system["_id"]),
            hashid=solar_system["hashid"],
            galaxy_id=solar_system["galaxy_id"],
            name=solar_system["name"],
            description=solar_system["description"],
            tags=solar_system["tags"],
            badge_id=solar_system["badge_id"],
            icon=solar_system["icon"],
            color=solar_system["color"],
            created_at=solar_system["created_at"],
            updated_at=solar_system["updated_at"]
        ))
    
    return solar_system_responses

@router.get("/{solar_system_id}", response_model=SolarSystem)
async def get_solar_system(
    solar_system_id: str,
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Get solar system by ID or hashid"""
    
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
    
    # Verify galaxy access
    galaxy = await database.galaxies.find_one({
        "hashid": solar_system["galaxy_id"]
    })
    
    if not galaxy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent galaxy not found"
        )
    
    # Check if user has access to this galaxy
    has_access = (
        galaxy["is_unlocked_by_default"] or 
        galaxy["hashid"] in current_user.unlocked_galaxies
    )
    
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Parent galaxy not unlocked"
        )
    
    return SolarSystem(
        id=str(solar_system["_id"]),
        hashid=solar_system["hashid"],
        galaxy_id=solar_system["galaxy_id"],
        name=solar_system["name"],
        description=solar_system["description"],
        tags=solar_system["tags"],
        badge_id=solar_system["badge_id"],
        icon=solar_system["icon"],
        color=solar_system["color"],
        created_at=solar_system["created_at"],
        updated_at=solar_system["updated_at"]
    )

@router.post("/", response_model=SolarSystem)
async def create_solar_system(
    solar_system_data: SolarSystemCreate,
    database = Depends(get_database),
    current_user = Depends(get_current_admin_user)
):
    """Create a new solar system (admin only)"""
    
    # Verify galaxy exists
    galaxy = await database.galaxies.find_one({
        "$or": [
            {"_id": solar_system_data.galaxy_id},
            {"hashid": solar_system_data.galaxy_id}
        ]
    })
    
    if not galaxy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Galaxy not found"
        )
    
    # Verify badge exists
    badge = await database.badges.find_one({
        "$or": [
            {"_id": solar_system_data.badge_id},
            {"hashid": solar_system_data.badge_id}
        ]
    })
    
    if not badge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Badge not found"
        )
    
    solar_system_doc = {
        "galaxy_id": galaxy["hashid"],
        "name": solar_system_data.name,
        "description": solar_system_data.description,
        "tags": solar_system_data.tags,
        "badge_id": badge["hashid"],
        "icon": solar_system_data.icon,
        "color": solar_system_data.color,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await database.solar_systems.insert_one(solar_system_doc)
    
    # Generate hashid
    hashid = generate_hashid("solar_systems", str(result.inserted_id))
    
    # Update solar system with hashid
    await database.solar_systems.update_one(
        {"_id": result.inserted_id},
        {"$set": {"hashid": hashid}}
    )
    
    solar_system_doc["_id"] = result.inserted_id
    solar_system_doc["hashid"] = hashid
    solar_system_doc["id"] = str(result.inserted_id)
    
    return SolarSystem(**solar_system_doc)

@router.put("/{solar_system_id}", response_model=SolarSystem)
async def update_solar_system(
    solar_system_id: str,
    solar_system_update: SolarSystemUpdate,
    database = Depends(get_database),
    current_user = Depends(get_current_admin_user)
):
    """Update a solar system (admin only)"""
    
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
    
    # Build update data
    update_data = {"updated_at": datetime.utcnow()}
    
    if solar_system_update.name is not None:
        update_data["name"] = solar_system_update.name
    if solar_system_update.description is not None:
        update_data["description"] = solar_system_update.description
    if solar_system_update.tags is not None:
        update_data["tags"] = solar_system_update.tags
    if solar_system_update.icon is not None:
        update_data["icon"] = solar_system_update.icon
    if solar_system_update.color is not None:
        update_data["color"] = solar_system_update.color
    
    # Update solar system
    await database.solar_systems.update_one(
        {"_id": solar_system["_id"]},
        {"$set": update_data}
    )
    
    # Get updated solar system
    updated_solar_system = await database.solar_systems.find_one({"_id": solar_system["_id"]})
    
    return SolarSystem(
        id=str(updated_solar_system["_id"]),
        hashid=updated_solar_system["hashid"],
        galaxy_id=updated_solar_system["galaxy_id"],
        name=updated_solar_system["name"],
        description=updated_solar_system["description"],
        tags=updated_solar_system["tags"],
        badge_id=updated_solar_system["badge_id"],
        icon=updated_solar_system["icon"],
        color=updated_solar_system["color"],
        created_at=updated_solar_system["created_at"],
        updated_at=updated_solar_system["updated_at"]
    )

@router.delete("/{solar_system_id}", response_model=MessageResponse)
async def delete_solar_system(
    solar_system_id: str,
    database = Depends(get_database),
    current_user = Depends(get_current_admin_user)
):
    """Delete a solar system (admin only)"""
    
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
    
    # Check if solar system has projects
    projects_count = await database.projects.count_documents({
        "solar_system_id": solar_system["hashid"]
    })
    
    if projects_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete solar system with existing projects"
        )
    
    # Delete solar system
    await database.solar_systems.delete_one({"_id": solar_system["_id"]})
    
    return {"message": "Solar system deleted successfully"}
