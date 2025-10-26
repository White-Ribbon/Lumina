from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from datetime import datetime
from models import VoteRequest, VoteResponse, PostInDB, ProjectIdeaInDB
from database import get_database
from auth import get_current_user
from hashids import Hashids
import os

router = APIRouter()
hashids = Hashids(salt=os.getenv("HASHID_SALT", "lumina_salt"), min_length=8)

@router.post("/vote", response_model=VoteResponse)
async def vote(
    vote_request: VoteRequest,
    current_user = Depends(get_current_user),
    db = Depends(get_database)
):
    """Vote on a post or project idea (upvote, downvote, or flag)"""
    
    if vote_request.post_id:
        return await vote_on_post(vote_request, current_user, db)
    elif vote_request.project_idea_id:
        return await vote_on_project_idea(vote_request, current_user, db)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either post_id or project_idea_id must be provided"
        )

async def vote_on_post(vote_request: VoteRequest, current_user, db):
    """Handle voting on forum posts"""
    post = await db.posts.find_one({"hashid": vote_request.post_id})
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    user_id = current_user.id
    vote_type = vote_request.vote_type
    
    # Check if user already voted
    if vote_type == "upvote":
        if user_id in post.get("upvoted_by", []):
            # Remove upvote
            await db.posts.update_one(
                {"hashid": vote_request.post_id},
                {
                    "$inc": {"upvotes": -1},
                    "$pull": {"upvoted_by": user_id}
                }
            )
            message = "Upvote removed"
        else:
            # Add upvote, remove downvote if exists
            update_ops = {
                "$inc": {"upvotes": 1},
                "$addToSet": {"upvoted_by": user_id}
            }
            if user_id in post.get("downvoted_by", []):
                update_ops["$inc"]["downvotes"] = -1
                update_ops["$pull"] = {"downvoted_by": user_id}
            
            await db.posts.update_one(
                {"hashid": vote_request.post_id},
                update_ops
            )
            message = "Upvoted successfully"
    
    elif vote_type == "downvote":
        if user_id in post.get("downvoted_by", []):
            # Remove downvote
            await db.posts.update_one(
                {"hashid": vote_request.post_id},
                {
                    "$inc": {"downvotes": -1},
                    "$pull": {"downvoted_by": user_id}
                }
            )
            message = "Downvote removed"
        else:
            # Add downvote, remove upvote if exists
            update_ops = {
                "$inc": {"downvotes": 1},
                "$addToSet": {"downvoted_by": user_id}
            }
            if user_id in post.get("upvoted_by", []):
                update_ops["$inc"]["upvotes"] = -1
                update_ops["$pull"] = {"upvoted_by": user_id}
            
            await db.posts.update_one(
                {"hashid": vote_request.post_id},
                update_ops
            )
            message = "Downvoted successfully"
    
    elif vote_type == "flag":
        if user_id in post.get("flagged_by", []):
            # Remove flag
            await db.posts.update_one(
                {"hashid": vote_request.post_id},
                {
                    "$inc": {"flags": -1},
                    "$pull": {"flagged_by": user_id}
                }
            )
            message = "Flag removed"
        else:
            # Add flag
            await db.posts.update_one(
                {"hashid": vote_request.post_id},
                {
                    "$inc": {"flags": 1},
                    "$addToSet": {"flagged_by": user_id}
                }
            )
            message = "Post flagged"
    
    # Get updated post data
    updated_post = await db.posts.find_one({"hashid": vote_request.post_id})
    
    return VoteResponse(
        success=True,
        message=message,
        upvotes=updated_post.get("upvotes", 0),
        downvotes=updated_post.get("downvotes", 0),
        flags=updated_post.get("flags", 0)
    )

async def vote_on_project_idea(vote_request: VoteRequest, current_user, db):
    """Handle voting on project ideas"""
    idea = await db.project_ideas.find_one({"hashid": vote_request.project_idea_id})
    if not idea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project idea not found"
        )
    
    user_id = current_user.id
    vote_type = vote_request.vote_type
    
    if vote_type == "upvote":
        if user_id in idea.get("upvoted_by", []):
            # Remove upvote
            await db.project_ideas.update_one(
                {"hashid": vote_request.project_idea_id},
                {
                    "$inc": {"upvotes": -1},
                    "$pull": {"upvoted_by": user_id}
                }
            )
            message = "Upvote removed"
        else:
            # Add upvote
            await db.project_ideas.update_one(
                {"hashid": vote_request.project_idea_id},
                {
                    "$inc": {"upvotes": 1},
                    "$addToSet": {"upvoted_by": user_id}
                }
            )
            message = "Upvoted successfully"
    
    elif vote_type == "downvote":
        # Project ideas don't support downvotes, only upvotes
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project ideas only support upvotes"
        )
    
    elif vote_type == "flag":
        # Project ideas don't support flags
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project ideas don't support flags"
        )
    
    # Get updated idea data
    updated_idea = await db.project_ideas.find_one({"hashid": vote_request.project_idea_id})
    
    return VoteResponse(
        success=True,
        message=message,
        upvotes=updated_idea.get("upvotes", 0),
        downvotes=0,
        flags=0
    )
