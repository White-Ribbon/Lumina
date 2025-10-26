from fastapi import APIRouter, HTTPException, status, Depends, Query
from models import Submission, SubmissionCreate, SubmissionUpdate, MessageResponse, PaginatedResponse, SubmissionStatus
from auth import get_current_active_user, get_current_admin_user, generate_hashid
from database import get_database
from datetime import datetime
from typing import List, Optional

router = APIRouter()

@router.get("/", response_model=PaginatedResponse)
async def get_submissions(
    user_id: Optional[str] = Query(None),
    project_id: Optional[str] = Query(None),
    status: Optional[SubmissionStatus] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Get paginated list of submissions"""
    
    # Build query
    query = {}
    
    if user_id:
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
        
        query["user_id"] = user["hashid"]
    
    if project_id:
        # Find project by ID or hashid
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
        
        query["project_id"] = project["hashid"]
    
    if status:
        query["status"] = status
    
    # If not admin, only show user's own submissions or approved ones
    if not current_user.is_admin:
        query["$or"] = [
            {"user_id": current_user.hashid},
            {"status": SubmissionStatus.APPROVED}
        ]
    
    # Get total count
    total = await database.submissions.count_documents(query)
    
    # Calculate pagination
    skip = (page - 1) * size
    pages = (total + size - 1) // size
    
    # Get submissions
    cursor = database.submissions.find(query).sort("submitted_at", -1).skip(skip).limit(size)
    submissions = await cursor.to_list(length=size)
    
    # Convert to response format
    submission_responses = []
    for submission in submissions:
        submission_responses.append(Submission(
            id=str(submission["_id"]),
            hashid=submission["hashid"],
            project_id=submission["project_id"],
            repo_url=submission["repo_url"],
            readme_md=submission["readme_md"],
            user_id=submission["user_id"],
            status=submission["status"],
            reviewed_by=submission["reviewed_by"],
            review_notes=submission["review_notes"],
            submitted_at=submission["submitted_at"],
            reviewed_at=submission["reviewed_at"]
        ))
    
    return PaginatedResponse(
        items=submission_responses,
        total=total,
        page=page,
        size=size,
        pages=pages
    )

@router.get("/{submission_id}", response_model=Submission)
async def get_submission(
    submission_id: str,
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Get submission by ID or hashid"""
    
    submission = await database.submissions.find_one({
        "$or": [
            {"_id": submission_id},
            {"hashid": submission_id}
        ]
    })
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    # Check if user can view this submission
    if not current_user.is_admin and submission["user_id"] != current_user.hashid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this submission"
        )
    
    return Submission(
        id=str(submission["_id"]),
        hashid=submission["hashid"],
        project_id=submission["project_id"],
        repo_url=submission["repo_url"],
        readme_md=submission["readme_md"],
        user_id=submission["user_id"],
        status=submission["status"],
        reviewed_by=submission["reviewed_by"],
        review_notes=submission["review_notes"],
        submitted_at=submission["submitted_at"],
        reviewed_at=submission["reviewed_at"]
    )

@router.post("/", response_model=Submission)
async def create_submission(
    submission_data: SubmissionCreate,
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Submit a project implementation"""
    
    # Verify project exists
    project = await database.projects.find_one({
        "$or": [
            {"_id": submission_data.project_id},
            {"hashid": submission_data.project_id}
        ]
    })
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check if user already submitted for this project
    existing_submission = await database.submissions.find_one({
        "project_id": project["hashid"],
        "user_id": current_user.hashid
    })
    
    if existing_submission:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already submitted for this project"
        )
    
    submission_doc = {
        "project_id": project["hashid"],
        "repo_url": submission_data.repo_url,
        "readme_md": submission_data.readme_md,
        "user_id": current_user.hashid,
        "status": SubmissionStatus.PENDING,
        "reviewed_by": None,
        "review_notes": None,
        "submitted_at": datetime.utcnow(),
        "reviewed_at": None
    }
    
    result = await database.submissions.insert_one(submission_doc)
    
    # Generate hashid
    hashid = generate_hashid("submissions", str(result.inserted_id))
    
    # Update submission with hashid
    await database.submissions.update_one(
        {"_id": result.inserted_id},
        {"$set": {"hashid": hashid}}
    )
    
    submission_doc["_id"] = result.inserted_id
    submission_doc["hashid"] = hashid
    submission_doc["id"] = str(result.inserted_id)
    
    return Submission(**submission_doc)

@router.put("/{submission_id}", response_model=Submission)
async def update_submission(
    submission_id: str,
    submission_update: SubmissionUpdate,
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Update a submission (author only, if not reviewed)"""
    
    submission = await database.submissions.find_one({
        "$or": [
            {"_id": submission_id},
            {"hashid": submission_id}
        ]
    })
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    # Check if user is the author
    if submission["user_id"] != current_user.hashid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to edit this submission"
        )
    
    # Check if submission is still pending
    if submission["status"] != SubmissionStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot edit reviewed submission"
        )
    
    # Build update data
    update_data = {}
    
    if submission_update.repo_url is not None:
        update_data["repo_url"] = submission_update.repo_url
    if submission_update.readme_md is not None:
        update_data["readme_md"] = submission_update.readme_md
    
    # Update submission
    await database.submissions.update_one(
        {"_id": submission["_id"]},
        {"$set": update_data}
    )
    
    # Get updated submission
    updated_submission = await database.submissions.find_one({"_id": submission["_id"]})
    
    return Submission(
        id=str(updated_submission["_id"]),
        hashid=updated_submission["hashid"],
        project_id=updated_submission["project_id"],
        repo_url=updated_submission["repo_url"],
        readme_md=updated_submission["readme_md"],
        user_id=updated_submission["user_id"],
        status=updated_submission["status"],
        reviewed_by=updated_submission["reviewed_by"],
        review_notes=updated_submission["review_notes"],
        submitted_at=updated_submission["submitted_at"],
        reviewed_at=updated_submission["reviewed_at"]
    )

@router.delete("/{submission_id}", response_model=MessageResponse)
async def delete_submission(
    submission_id: str,
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Delete a submission (author or admin only)"""
    
    submission = await database.submissions.find_one({
        "$or": [
            {"_id": submission_id},
            {"hashid": submission_id}
        ]
    })
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    # Check if user is the author or admin
    if submission["user_id"] != current_user.hashid and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this submission"
        )
    
    # Delete submission
    await database.submissions.delete_one({"_id": submission["_id"]})
    
    return {"message": "Submission deleted successfully"}

@router.post("/{submission_id}/review", response_model=MessageResponse)
async def review_submission(
    submission_id: str,
    status: SubmissionStatus,
    review_notes: Optional[str] = None,
    database = Depends(get_database),
    current_user = Depends(get_current_admin_user)
):
    """Review a submission (admin only)"""
    
    submission = await database.submissions.find_one({
        "$or": [
            {"_id": submission_id},
            {"hashid": submission_id}
        ]
    })
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    if submission["status"] != SubmissionStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Submission already reviewed"
        )
    
    # Update submission
    await database.submissions.update_one(
        {"_id": submission["_id"]},
        {
            "$set": {
                "status": status,
                "reviewed_by": current_user.hashid,
                "review_notes": review_notes,
                "reviewed_at": datetime.utcnow()
            }
        }
    )
    
    # If approved, award badge to user
    if status == SubmissionStatus.APPROVED:
        # Get project to find solar system
        project = await database.projects.find_one({
            "hashid": submission["project_id"]
        })
        
        if project:
            # Get solar system to find badge
            solar_system = await database.solar_systems.find_one({
                "hashid": project["solar_system_id"]
            })
            
            if solar_system:
                # Award badge to user
                await database.users.update_one(
                    {"hashid": submission["user_id"]},
                    {
                        "$addToSet": {"badges": solar_system["badge_id"]},
                        "$set": {"updated_at": datetime.utcnow()}
                    }
                )
                
                # Unlock random galaxy
                await unlock_random_galaxy(submission["user_id"], database)
    
    return {"message": f"Submission {status.value} successfully"}

async def unlock_random_galaxy(user_id: str, database):
    """Unlock a random galaxy for a user after earning a badge"""
    import random
    
    # Get user
    user = await database.users.find_one({"hashid": user_id})
    if not user:
        return
    
    # Get all galaxies that are not unlocked by default and not already unlocked by user
    available_galaxies = await database.galaxies.find({
        "is_unlocked_by_default": False,
        "hashid": {"$nin": user["unlocked_galaxies"]}
    }).to_list(length=None)
    
    if available_galaxies:
        # Select random galaxy
        random_galaxy = random.choice(available_galaxies)
        
        # Add galaxy to user's unlocked galaxies
        await database.users.update_one(
            {"hashid": user_id},
            {
                "$addToSet": {"unlocked_galaxies": random_galaxy["hashid"]},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
