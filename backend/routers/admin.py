from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, timedelta
from models import (
    Galaxy, GalaxyCreate, GalaxyUpdate, GalaxyInDB,
    SolarSystem, SolarSystemCreate, SolarSystemUpdate, SolarSystemInDB,
    Project, ProjectCreate, ProjectUpdate, ProjectInDB,
    ProjectIdea, ProjectIdeaCreate, ProjectIdeaInDB, AdminProjectIdeaUpdate,
    Submission, SubmissionInDB, SubmissionStatus,
    Post, PostInDB,
    User, UserInDB,
    AdminStats, PaginatedResponse, MessageResponse
)
from database import get_database
from auth import get_current_user
from hashids import Hashids
import os

router = APIRouter()
hashids = Hashids(salt=os.getenv("HASHID_SALT", "lumina_salt"), min_length=8)

@router.get("/stats", response_model=AdminStats)
async def get_admin_stats(
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get admin dashboard statistics"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Count various entities
    total_users = await db.users.count_documents({})
    total_posts = await db.posts.count_documents({"is_removed": False})
    total_project_ideas = await db.project_ideas.count_documents({})
    total_submissions = await db.submissions.count_documents({})
    pending_submissions = await db.submissions.count_documents({"status": SubmissionStatus.PENDING})
    pending_project_ideas = await db.project_ideas.count_documents({"status": "pending_approval"})
    
    return AdminStats(
        total_users=total_users,
        total_posts=total_posts,
        total_project_ideas=total_project_ideas,
        total_submissions=total_submissions,
        pending_submissions=pending_submissions,
        pending_project_ideas=pending_project_ideas
    )

# Galaxy CRUD
@router.post("/galaxies", response_model=Galaxy)
async def create_galaxy(
    galaxy: GalaxyCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Create a new galaxy (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    galaxy_data = galaxy.dict()
    galaxy_data["hashid"] = hashids.encode(int(datetime.utcnow().timestamp()))
    galaxy_data["created_at"] = datetime.utcnow()
    galaxy_data["updated_at"] = datetime.utcnow()
    
    result = await db.galaxies.insert_one(galaxy_data)
    galaxy_data["id"] = str(result.inserted_id)
    
    return Galaxy(**galaxy_data)

@router.put("/galaxies/{galaxy_id}", response_model=Galaxy)
async def update_galaxy(
    galaxy_id: str,
    galaxy_update: GalaxyUpdate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Update a galaxy (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    update_data = {k: v for k, v in galaxy_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.galaxies.update_one(
        {"hashid": galaxy_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Galaxy not found"
        )
    
    updated_galaxy = await db.galaxies.find_one({"hashid": galaxy_id})
    updated_galaxy["id"] = str(updated_galaxy["_id"])
    
    return Galaxy(**updated_galaxy)

@router.delete("/galaxies/{galaxy_id}", response_model=MessageResponse)
async def delete_galaxy(
    galaxy_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Delete a galaxy (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    result = await db.galaxies.delete_one({"hashid": galaxy_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Galaxy not found"
        )
    
    return MessageResponse(message="Galaxy deleted successfully")

# Solar System CRUD
@router.post("/solar-systems", response_model=SolarSystem)
async def create_solar_system(
    solar_system: SolarSystemCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Create a new solar system (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    solar_system_data = solar_system.dict()
    solar_system_data["hashid"] = hashids.encode(int(datetime.utcnow().timestamp()))
    solar_system_data["created_at"] = datetime.utcnow()
    solar_system_data["updated_at"] = datetime.utcnow()
    
    result = await db.solar_systems.insert_one(solar_system_data)
    solar_system_data["id"] = str(result.inserted_id)
    
    return SolarSystem(**solar_system_data)

@router.put("/solar-systems/{solar_system_id}", response_model=SolarSystem)
async def update_solar_system(
    solar_system_id: str,
    solar_system_update: SolarSystemUpdate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Update a solar system (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    update_data = {k: v for k, v in solar_system_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.solar_systems.update_one(
        {"hashid": solar_system_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solar system not found"
        )
    
    updated_solar_system = await db.solar_systems.find_one({"hashid": solar_system_id})
    updated_solar_system["id"] = str(updated_solar_system["_id"])
    
    return SolarSystem(**updated_solar_system)

@router.delete("/solar-systems/{solar_system_id}", response_model=MessageResponse)
async def delete_solar_system(
    solar_system_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Delete a solar system (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    result = await db.solar_systems.delete_one({"hashid": solar_system_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solar system not found"
        )
    
    return MessageResponse(message="Solar system deleted successfully")

# Project CRUD
@router.post("/projects", response_model=Project)
async def create_project(
    project: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Create a new project (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    project_data = project.dict()
    project_data["hashid"] = hashids.encode(int(datetime.utcnow().timestamp()))
    project_data["status"] = "approved"
    project_data["created_at"] = datetime.utcnow()
    project_data["updated_at"] = datetime.utcnow()
    
    result = await db.projects.insert_one(project_data)
    project_data["id"] = str(result.inserted_id)
    
    return Project(**project_data)

@router.put("/projects/{project_id}", response_model=Project)
async def update_project(
    project_id: str,
    project_update: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Update a project (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    update_data = {k: v for k, v in project_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.projects.update_one(
        {"hashid": project_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    updated_project = await db.projects.find_one({"hashid": project_id})
    updated_project["id"] = str(updated_project["_id"])
    
    return Project(**updated_project)

@router.delete("/projects/{project_id}", response_model=MessageResponse)
async def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Delete a project (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    result = await db.projects.delete_one({"hashid": project_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return MessageResponse(message="Project deleted successfully")

# Project Ideas Management
@router.get("/project-ideas", response_model=PaginatedResponse)
async def get_project_ideas(
    page: int = 1,
    size: int = 20,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get project ideas for admin review"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    query = {}
    if status:
        query["status"] = status
    
    skip = (page - 1) * size
    total = await db.project_ideas.count_documents(query)
    
    cursor = db.project_ideas.find(query).skip(skip).limit(size).sort("created_at", -1)
    ideas = []
    
    async for idea in cursor:
        idea["id"] = str(idea["_id"])
        ideas.append(ProjectIdea(**idea))
    
    return PaginatedResponse(
        items=ideas,
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size
    )

@router.put("/project-ideas/{idea_id}", response_model=ProjectIdea)
async def update_project_idea(
    idea_id: str,
    update_data: AdminProjectIdeaUpdate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Update project idea status (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.utcnow()
    
    result = await db.project_ideas.update_one(
        {"hashid": idea_id},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project idea not found"
        )
    
    updated_idea = await db.project_ideas.find_one({"hashid": idea_id})
    updated_idea["id"] = str(updated_idea["_id"])
    
    return ProjectIdea(**updated_idea)

# Submissions Management
@router.get("/submissions", response_model=PaginatedResponse)
async def get_submissions(
    page: int = 1,
    size: int = 20,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get project submissions for admin review"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    query = {}
    if status:
        query["status"] = status
    
    skip = (page - 1) * size
    total = await db.submissions.count_documents(query)
    
    cursor = db.submissions.find(query).skip(skip).limit(size).sort("submitted_at", -1)
    submissions = []
    
    async for submission in cursor:
        submission["id"] = str(submission["_id"])
        submissions.append(Submission(**submission))
    
    return PaginatedResponse(
        items=submissions,
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size
    )

@router.put("/submissions/{submission_id}", response_model=Submission)
async def review_submission(
    submission_id: str,
    status: SubmissionStatus,
    review_notes: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Review a project submission (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    update_data = {
        "status": status,
        "reviewed_by": current_user.id,
        "reviewed_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    if review_notes:
        update_data["review_notes"] = review_notes
    
    result = await db.submissions.update_one(
        {"hashid": submission_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    updated_submission = await db.submissions.find_one({"hashid": submission_id})
    updated_submission["id"] = str(updated_submission["_id"])
    
    return Submission(**updated_submission)
