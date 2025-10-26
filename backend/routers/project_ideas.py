from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, timedelta
from models import (
    ProjectIdea, ProjectIdeaCreate, ProjectIdeaInDB,
    PaginatedResponse, MessageResponse
)
from database import get_database
from auth import get_current_user
from hashids import Hashids
from ranking import rank_project_ideas
import os

router = APIRouter()
hashids = Hashids(salt=os.getenv("HASHID_SALT", "lumina_salt"), min_length=8)

@router.post("/", response_model=ProjectIdea)
async def create_project_idea(
    idea: ProjectIdeaCreate,
    current_user = Depends(get_current_user),
    db = Depends(get_database)
):
    """Submit a new project idea"""
    idea_data = idea.dict()
    idea_data["hashid"] = hashids.encode(int(datetime.utcnow().timestamp()))
    idea_data["submitted_by"] = current_user.id
    idea_data["upvotes"] = 0
    idea_data["upvoted_by"] = []
    idea_data["status"] = "pending_approval"
    idea_data["is_taken"] = False
    idea_data["expires_at"] = datetime.utcnow() + timedelta(days=15)
    idea_data["created_at"] = datetime.utcnow()
    idea_data["updated_at"] = datetime.utcnow()
    
    result = await db.project_ideas.insert_one(idea_data)
    idea_data["id"] = str(result.inserted_id)
    
    return ProjectIdea(**idea_data)

@router.get("/", response_model=PaginatedResponse)
async def get_project_ideas(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    solar_system_id: Optional[str] = None,
    status: Optional[str] = None,
    include_expired: bool = Query(False, description="Include expired project ideas"),
    db = Depends(get_database)
):
    """Get project ideas with filtering and pagination"""
    query = {}
    
    # Only show non-expired ideas by default (unless explicitly requested)
    if not include_expired:
        query["expires_at"] = {"$gt": datetime.utcnow()}
        # Also exclude expired status
        query["status"] = {"$ne": "expired"}
    
    if solar_system_id:
        query["solar_system_id"] = solar_system_id
    
    if status and status != "all":
        query["status"] = status
    
    skip = (page - 1) * size
    total = await db.project_ideas.count_documents(query)
    
    # Get all matching ideas first
    cursor = db.project_ideas.find(query)
    all_ideas = await cursor.to_list(length=None)
    
    # Apply ranking algorithm
    ranked_ideas = rank_project_ideas(all_ideas)
    
    # Apply pagination after ranking
    ideas = []
    for idea in ranked_ideas[skip:skip + size]:
        idea["id"] = str(idea["_id"])
        ideas.append(ProjectIdea(**idea))
    
    return PaginatedResponse(
        items=ideas,
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size
    )

@router.get("/{idea_id}", response_model=ProjectIdea)
async def get_project_idea(
    idea_id: str,
    db = Depends(get_database)
):
    """Get a specific project idea"""
    idea = await db.project_ideas.find_one({"hashid": idea_id})
    if not idea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project idea not found"
        )
    
    idea["id"] = str(idea["_id"])
    return ProjectIdea(**idea)

@router.put("/{idea_id}", response_model=ProjectIdea)
async def update_project_idea(
    idea_id: str,
    idea_update: dict,
    current_user = Depends(get_current_user),
    db = Depends(get_database)
):
    """Update a project idea (only by the author)"""
    idea = await db.project_ideas.find_one({"hashid": idea_id})
    if not idea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project idea not found"
        )
    
    # Only the author can update their idea
    if idea["submitted_by"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own project ideas"
        )
    
    # Don't allow updating certain fields
    allowed_fields = ["title", "description", "tags", "difficulty", "est_time", "resources", "requirements", "learning_objectives"]
    update_data = {k: v for k, v in idea_update.items() if k in allowed_fields and v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.project_ideas.update_one(
        {"hashid": idea_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project idea not found"
        )
    
    updated_idea = await db.project_ideas.find_one({"hashid": idea_id})
    updated_idea["id"] = str(updated_idea["_id"])
    
    return ProjectIdea(**updated_idea)

@router.delete("/{idea_id}", response_model=MessageResponse)
async def delete_project_idea(
    idea_id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_database)
):
    """Delete a project idea (only by the author)"""
    idea = await db.project_ideas.find_one({"hashid": idea_id})
    if not idea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project idea not found"
        )
    
    # Only the author can delete their idea
    if idea["submitted_by"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own project ideas"
        )
    
    result = await db.project_ideas.delete_one({"hashid": idea_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project idea not found"
        )
    
    return MessageResponse(message="Project idea deleted successfully")

@router.get("/user/{user_id}", response_model=List[ProjectIdea])
async def get_user_project_ideas(
    user_id: str,
    db = Depends(get_database)
):
    """Get all project ideas submitted by a specific user"""
    cursor = db.project_ideas.find({"submitted_by": user_id}).sort("created_at", -1)
    ideas = []
    
    async for idea in cursor:
        idea["id"] = str(idea["_id"])
        ideas.append(ProjectIdea(**idea))
    
    return ideas

