from fastapi import APIRouter, HTTPException, status, Depends, Query
from models import (
    Project, ProjectCreate, ProjectUpdate, ProjectIdea, ProjectIdeaCreate,
    MessageResponse, PaginatedResponse, ProjectStatus
)
from auth import get_current_active_user, get_current_admin_user, generate_hashid
from database import get_database
from datetime import datetime
from typing import List, Optional

router = APIRouter()

@router.get("/", response_model=List[Project])
async def get_projects(
    solar_system_id: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    tags: Optional[str] = Query(None),
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Get projects with optional filters"""
    
    query = {"status": ProjectStatus.APPROVED}
    
    if solar_system_id:
        # Verify solar system access
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
        
        query["solar_system_id"] = solar_system["hashid"]
    
    if difficulty:
        query["difficulty"] = difficulty
    
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        query["tags"] = {"$in": tag_list}
    
    cursor = database.projects.find(query).sort("created_at", 1)
    projects = await cursor.to_list(length=None)
    
    project_responses = []
    for project in projects:
        project_responses.append(Project(
            id=str(project["_id"]),
            hashid=project["hashid"],
            solar_system_id=project["solar_system_id"],
            title=project["title"],
            description=project["description"],
            tags=project["tags"],
            difficulty=project["difficulty"],
            est_time=project["est_time"],
            resources=project["resources"],
            requirements=project["requirements"],
            learning_objectives=project["learning_objectives"],
            status=project["status"],
            created_by=project["created_by"],
            created_at=project["created_at"],
            updated_at=project["updated_at"]
        ))
    
    return project_responses

@router.get("/{project_id}", response_model=Project)
async def get_project(
    project_id: str,
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Get project by ID or hashid"""
    
    project = await database.projects.find_one({
        "$or": [
            {"_id": project_id},
            {"hashid": project_id}
        ]
    })
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Verify solar system access
    solar_system = await database.solar_systems.find_one({
        "hashid": project["solar_system_id"]
    })
    
    if not solar_system:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent solar system not found"
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
    
    return Project(
        id=str(project["_id"]),
        hashid=project["hashid"],
        solar_system_id=project["solar_system_id"],
        title=project["title"],
        description=project["description"],
        tags=project["tags"],
        difficulty=project["difficulty"],
        est_time=project["est_time"],
        resources=project["resources"],
        requirements=project["requirements"],
        learning_objectives=project["learning_objectives"],
        status=project["status"],
        created_by=project["created_by"],
        created_at=project["created_at"],
        updated_at=project["updated_at"]
    )

@router.post("/", response_model=Project)
async def create_project(
    project_data: ProjectCreate,
    database = Depends(get_database),
    current_user = Depends(get_current_admin_user)
):
    """Create a new project (admin only)"""
    
    # Verify solar system exists
    solar_system = await database.solar_systems.find_one({
        "$or": [
            {"_id": project_data.solar_system_id},
            {"hashid": project_data.solar_system_id}
        ]
    })
    
    if not solar_system:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solar system not found"
        )
    
    project_doc = {
        "solar_system_id": solar_system["hashid"],
        "title": project_data.title,
        "description": project_data.description,
        "tags": project_data.tags,
        "difficulty": project_data.difficulty,
        "est_time": project_data.est_time,
        "resources": [resource.dict() for resource in project_data.resources],
        "requirements": project_data.requirements,
        "learning_objectives": project_data.learning_objectives,
        "status": ProjectStatus.APPROVED,
        "created_by": None,  # Admin created
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await database.projects.insert_one(project_doc)
    
    # Generate hashid
    hashid = generate_hashid("projects", str(result.inserted_id))
    
    # Update project with hashid
    await database.projects.update_one(
        {"_id": result.inserted_id},
        {"$set": {"hashid": hashid}}
    )
    
    project_doc["_id"] = result.inserted_id
    project_doc["hashid"] = hashid
    project_doc["id"] = str(result.inserted_id)
    
    return Project(**project_doc)

@router.put("/{project_id}", response_model=Project)
async def update_project(
    project_id: str,
    project_update: ProjectUpdate,
    database = Depends(get_database),
    current_user = Depends(get_current_admin_user)
):
    """Update a project (admin only)"""
    
    project = await database.projects.find_one({
        "$or": [
            {"_id": project_id},
            {"hashid": project_id}
        ]
    })
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Build update data
    update_data = {"updated_at": datetime.utcnow()}
    
    if project_update.title is not None:
        update_data["title"] = project_update.title
    if project_update.description is not None:
        update_data["description"] = project_update.description
    if project_update.tags is not None:
        update_data["tags"] = project_update.tags
    if project_update.difficulty is not None:
        update_data["difficulty"] = project_update.difficulty
    if project_update.est_time is not None:
        update_data["est_time"] = project_update.est_time
    if project_update.resources is not None:
        update_data["resources"] = [resource.dict() for resource in project_update.resources]
    if project_update.requirements is not None:
        update_data["requirements"] = project_update.requirements
    if project_update.learning_objectives is not None:
        update_data["learning_objectives"] = project_update.learning_objectives
    
    # Update project
    await database.projects.update_one(
        {"_id": project["_id"]},
        {"$set": update_data}
    )
    
    # Get updated project
    updated_project = await database.projects.find_one({"_id": project["_id"]})
    
    return Project(
        id=str(updated_project["_id"]),
        hashid=updated_project["hashid"],
        solar_system_id=updated_project["solar_system_id"],
        title=updated_project["title"],
        description=updated_project["description"],
        tags=updated_project["tags"],
        difficulty=updated_project["difficulty"],
        est_time=updated_project["est_time"],
        resources=updated_project["resources"],
        requirements=updated_project["requirements"],
        learning_objectives=updated_project["learning_objectives"],
        status=updated_project["status"],
        created_by=updated_project["created_by"],
        created_at=updated_project["created_at"],
        updated_at=updated_project["updated_at"]
    )

@router.delete("/{project_id}", response_model=MessageResponse)
async def delete_project(
    project_id: str,
    database = Depends(get_database),
    current_user = Depends(get_current_admin_user)
):
    """Delete a project (admin only)"""
    
    project = await database.projects.find_one({
        "$or": [
            {"_id": project_id},
            {"hashid": project_id}
        ]
    })
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check if project has submissions
    submissions_count = await database.submissions.count_documents({
        "project_id": project["hashid"]
    })
    
    if submissions_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete project with existing submissions"
        )
    
    # Delete project
    await database.projects.delete_one({"_id": project["_id"]})
    
    return {"message": "Project deleted successfully"}

# Project Ideas endpoints
@router.post("/ideas", response_model=ProjectIdea)
async def create_project_idea(
    idea_data: ProjectIdeaCreate,
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Submit a new project idea"""
    
    # Verify solar system exists
    solar_system = await database.solar_systems.find_one({
        "$or": [
            {"_id": idea_data.solar_system_id},
            {"hashid": idea_data.solar_system_id}
        ]
    })
    
    if not solar_system:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solar system not found"
        )
    
    idea_doc = {
        "title": idea_data.title,
        "description": idea_data.description,
        "solar_system_id": solar_system["hashid"],
        "tags": idea_data.tags,
        "difficulty": idea_data.difficulty,
        "est_time": idea_data.est_time,
        "resources": [resource.dict() for resource in idea_data.resources],
        "requirements": idea_data.requirements,
        "learning_objectives": idea_data.learning_objectives,
        "submitted_by": current_user.hashid,
        "upvotes": 0,
        "upvoted_by": [],
        "status": ProjectStatus.PENDING_APPROVAL,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await database.project_ideas.insert_one(idea_doc)
    
    # Generate hashid
    hashid = generate_hashid("project_ideas", str(result.inserted_id))
    
    # Update idea with hashid
    await database.project_ideas.update_one(
        {"_id": result.inserted_id},
        {"$set": {"hashid": hashid}}
    )
    
    idea_doc["_id"] = result.inserted_id
    idea_doc["hashid"] = hashid
    idea_doc["id"] = str(result.inserted_id)
    
    return ProjectIdea(**idea_doc)

@router.get("/ideas", response_model=List[ProjectIdea])
async def get_project_ideas(
    status: Optional[ProjectStatus] = Query(None),
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Get project ideas"""
    
    query = {}
    if status:
        query["status"] = status
    
    cursor = database.project_ideas.find(query).sort("upvotes", -1)
    ideas = await cursor.to_list(length=None)
    
    idea_responses = []
    for idea in ideas:
        idea_responses.append(ProjectIdea(
            id=str(idea["_id"]),
            hashid=idea["hashid"],
            title=idea["title"],
            description=idea["description"],
            solar_system_id=idea["solar_system_id"],
            tags=idea["tags"],
            difficulty=idea["difficulty"],
            est_time=idea["est_time"],
            resources=idea["resources"],
            requirements=idea["requirements"],
            learning_objectives=idea["learning_objectives"],
            submitted_by=idea["submitted_by"],
            upvotes=idea["upvotes"],
            status=idea["status"],
            created_at=idea["created_at"],
            updated_at=idea["updated_at"]
        ))
    
    return idea_responses

@router.post("/ideas/{idea_id}/upvote", response_model=MessageResponse)
async def upvote_project_idea(
    idea_id: str,
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Upvote a project idea"""
    
    idea = await database.project_ideas.find_one({
        "$or": [
            {"_id": idea_id},
            {"hashid": idea_id}
        ]
    })
    
    if not idea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project idea not found"
        )
    
    # Check if already upvoted
    if current_user.hashid in idea["upvoted_by"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already upvoted this idea"
        )
    
    # Add upvote
    await database.project_ideas.update_one(
        {"_id": idea["_id"]},
        {
            "$addToSet": {"upvoted_by": current_user.hashid},
            "$inc": {"upvotes": 1},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    return {"message": "Project idea upvoted successfully"}

@router.post("/ideas/{idea_id}/approve", response_model=MessageResponse)
async def approve_project_idea(
    idea_id: str,
    database = Depends(get_database),
    current_user = Depends(get_current_admin_user)
):
    """Approve a project idea and convert it to a project (admin only)"""
    
    idea = await database.project_ideas.find_one({
        "$or": [
            {"_id": idea_id},
            {"hashid": idea_id}
        ]
    })
    
    if not idea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project idea not found"
        )
    
    if idea["status"] != ProjectStatus.PENDING_APPROVAL:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project idea is not pending approval"
        )
    
    # Create project from idea
    project_doc = {
        "solar_system_id": idea["solar_system_id"],
        "title": idea["title"],
        "description": idea["description"],
        "tags": idea["tags"],
        "difficulty": idea["difficulty"],
        "est_time": idea["est_time"],
        "resources": idea["resources"],
        "requirements": idea["requirements"],
        "learning_objectives": idea["learning_objectives"],
        "status": ProjectStatus.APPROVED,
        "created_by": idea["submitted_by"],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await database.projects.insert_one(project_doc)
    
    # Generate hashid for project
    project_hashid = generate_hashid("projects", str(result.inserted_id))
    
    # Update project with hashid
    await database.projects.update_one(
        {"_id": result.inserted_id},
        {"$set": {"hashid": project_hashid}}
    )
    
    # Mark idea as approved
    await database.project_ideas.update_one(
        {"_id": idea["_id"]},
        {
            "$set": {
                "status": ProjectStatus.APPROVED,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Project idea approved and converted to project successfully"}
