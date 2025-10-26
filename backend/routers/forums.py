from fastapi import APIRouter, HTTPException, status, Depends, Query
from models import Post, PostCreate, PostUpdate, Comment, CommentCreate, MessageResponse, PaginatedResponse
from auth import get_current_active_user, get_current_admin_user, generate_hashid
from database import get_database
from datetime import datetime, timedelta
from typing import List, Optional
from ranking import rank_posts

router = APIRouter()

@router.get("/", response_model=PaginatedResponse)
async def get_posts(
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Get paginated list of forum posts"""
    
    # Build query
    query = {}
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"body_md": {"$regex": search, "$options": "i"}},
            {"tags": {"$in": [{"$regex": search, "$options": "i"}]}}
        ]
    
    # Get total count
    total = await database.posts.count_documents(query)
    
    # Calculate pagination
    skip = (page - 1) * size
    pages = (total + size - 1) // size
    
    # Get posts
    cursor = database.posts.find(query).sort("created_at", -1).skip(skip).limit(size)
    posts = await cursor.to_list(length=size)
    
    # Apply ranking algorithm
    ranked_posts = rank_posts(posts)
    
    # Convert to response format
    post_responses = []
    for post in ranked_posts:
        post_responses.append(Post(
            id=str(post["_id"]),
            hashid=post["hashid"],
            title=post["title"],
            body_md=post["body_md"],
            tags=post["tags"],
            category=post["category"],
            author_id=post["author_id"],
            comments=post["comments"],
            upvotes=post.get("upvotes", 0),
            downvotes=post.get("downvotes", 0),
            flags=post.get("flags", 0),
            is_removed=post.get("is_removed", False),
            created_at=post["created_at"],
            updated_at=post["updated_at"]
        ))
    
    return PaginatedResponse(
        items=post_responses,
        total=total,
        page=page,
        size=size,
        pages=pages
    )

@router.get("/{post_id}", response_model=Post)
async def get_post(
    post_id: str,
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Get post by ID or hashid"""
    
    post = await database.posts.find_one({
        "$or": [
            {"_id": post_id},
            {"hashid": post_id}
        ]
    })
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    return Post(
        id=str(post["_id"]),
        hashid=post["hashid"],
        title=post["title"],
        body_md=post["body_md"],
        tags=post["tags"],
        category=post["category"],
        author_id=post["author_id"],
        comments=post.get("comments", []),
        upvotes=post.get("upvotes", 0),
        downvotes=post.get("downvotes", 0),
        flags=post.get("flags", 0),
        is_removed=post.get("is_removed", False),
        created_at=post["created_at"],
        updated_at=post["updated_at"]
    )

@router.post("/", response_model=Post)
async def create_post(
    post_data: PostCreate,
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Create a new forum post"""
    
    post_doc = {
        "title": post_data.title,
        "body_md": post_data.body_md,
        "tags": post_data.tags,
        "category": post_data.category,
        "author_id": current_user.hashid,
        "comments": [],
        "upvotes": 0,
        "downvotes": 0,
        "upvoted_by": [],
        "downvoted_by": [],
        "flags": 0,
        "flagged_by": [],
        "is_removed": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await database.posts.insert_one(post_doc)
    
    # Generate hashid
    hashid = generate_hashid("posts", str(result.inserted_id))
    
    # Update post with hashid
    await database.posts.update_one(
        {"_id": result.inserted_id},
        {"$set": {"hashid": hashid}}
    )
    
    post_doc["_id"] = result.inserted_id
    post_doc["hashid"] = hashid
    post_doc["id"] = str(result.inserted_id)
    
    return Post(**post_doc)

@router.put("/{post_id}", response_model=Post)
async def update_post(
    post_id: str,
    post_update: PostUpdate,
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Update a forum post (author only)"""
    
    post = await database.posts.find_one({
        "$or": [
            {"_id": post_id},
            {"hashid": post_id}
        ]
    })
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Check if user is the author or admin
    if post["author_id"] != current_user.hashid and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to edit this post"
        )
    
    # Build update data
    update_data = {"updated_at": datetime.utcnow()}
    
    if post_update.title is not None:
        update_data["title"] = post_update.title
    if post_update.body_md is not None:
        update_data["body_md"] = post_update.body_md
    if post_update.tags is not None:
        update_data["tags"] = post_update.tags
    
    # Update post
    await database.posts.update_one(
        {"_id": post["_id"]},
        {"$set": update_data}
    )
    
    # Get updated post
    updated_post = await database.posts.find_one({"_id": post["_id"]})
    
    return Post(
        id=str(updated_post["_id"]),
        hashid=updated_post["hashid"],
        title=updated_post["title"],
        body_md=updated_post["body_md"],
        tags=updated_post["tags"],
        category=updated_post["category"],
        author_id=updated_post["author_id"],
        comments=updated_post.get("comments", []),
        upvotes=updated_post.get("upvotes", 0),
        downvotes=updated_post.get("downvotes", 0),
        flags=updated_post.get("flags", 0),
        is_removed=updated_post.get("is_removed", False),
        created_at=updated_post["created_at"],
        updated_at=updated_post["updated_at"]
    )

@router.delete("/{post_id}", response_model=MessageResponse)
async def delete_post(
    post_id: str,
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Delete a forum post (author or admin only)"""
    
    post = await database.posts.find_one({
        "$or": [
            {"_id": post_id},
            {"hashid": post_id}
        ]
    })
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Check if user is the author or admin
    if post["author_id"] != current_user.hashid and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this post"
        )
    
    # Delete all comments for this post
    await database.comments.delete_many({"post_id": post["hashid"]})
    
    # Delete post
    await database.posts.delete_one({"_id": post["_id"]})
    
    return {"message": "Post deleted successfully"}

@router.post("/{post_id}/upvote", response_model=MessageResponse)
async def upvote_post(
    post_id: str,
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Upvote a forum post"""
    
    post = await database.posts.find_one({
        "$or": [
            {"_id": post_id},
            {"hashid": post_id}
        ]
    })
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Check if already upvoted
    if current_user.hashid in post["upvoted_by"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already upvoted this post"
        )
    
    # Add upvote
    await database.posts.update_one(
        {"_id": post["_id"]},
        {
            "$addToSet": {"upvoted_by": current_user.hashid},
            "$inc": {"upvotes": 1},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    return {"message": "Post upvoted successfully"}

# Comments endpoints
@router.get("/{post_id}/comments", response_model=List[Comment])
async def get_post_comments(
    post_id: str,
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Get comments for a post"""
    
    # Verify post exists
    post = await database.posts.find_one({
        "$or": [
            {"_id": post_id},
            {"hashid": post_id}
        ]
    })
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    cursor = database.comments.find({"post_id": post["hashid"]}).sort("created_at", 1)
    comments = await cursor.to_list(length=None)
    
    comment_responses = []
    for comment in comments:
        comment_responses.append(Comment(
            id=str(comment["_id"]),
            hashid=comment["hashid"],
            body_md=comment["body_md"],
            tag=comment["tag"],
            author_id=comment["author_id"],
            post_id=comment["post_id"],
            created_at=comment["created_at"],
            updated_at=comment["updated_at"]
        ))
    
    return comment_responses

@router.post("/{post_id}/comments", response_model=Comment)
async def create_comment(
    post_id: str,
    comment_data: CommentCreate,
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Create a comment on a post"""
    
    # Verify post exists
    post = await database.posts.find_one({
        "$or": [
            {"_id": post_id},
            {"hashid": post_id}
        ]
    })
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    comment_doc = {
        "body_md": comment_data.body_md,
        "tag": comment_data.tag,
        "author_id": current_user.hashid,
        "post_id": post["hashid"],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await database.comments.insert_one(comment_doc)
    
    # Generate hashid
    hashid = generate_hashid("comments", str(result.inserted_id))
    
    # Update comment with hashid
    await database.comments.update_one(
        {"_id": result.inserted_id},
        {"$set": {"hashid": hashid}}
    )
    
    # Add comment to post
    await database.posts.update_one(
        {"_id": post["_id"]},
        {
            "$addToSet": {"comments": hashid},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    comment_doc["_id"] = result.inserted_id
    comment_doc["hashid"] = hashid
    comment_doc["id"] = str(result.inserted_id)
    
    return Comment(**comment_doc)

@router.put("/comments/{comment_id}", response_model=Comment)
async def update_comment(
    comment_id: str,
    comment_update: CommentCreate,
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Update a comment (author or admin only)"""
    
    comment = await database.comments.find_one({
        "$or": [
            {"_id": comment_id},
            {"hashid": comment_id}
        ]
    })
    
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    # Check if user is the author or admin
    if comment["author_id"] != current_user.hashid and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to edit this comment"
        )
    
    # Update comment
    await database.comments.update_one(
        {"_id": comment["_id"]},
        {
            "$set": {
                "body_md": comment_update.body_md,
                "tag": comment_update.tag,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Get updated comment
    updated_comment = await database.comments.find_one({"_id": comment["_id"]})
    
    return Comment(
        id=str(updated_comment["_id"]),
        hashid=updated_comment["hashid"],
        body_md=updated_comment["body_md"],
        tag=updated_comment["tag"],
        author_id=updated_comment["author_id"],
        post_id=updated_comment["post_id"],
        created_at=updated_comment["created_at"],
        updated_at=updated_comment["updated_at"]
    )

@router.delete("/comments/{comment_id}", response_model=MessageResponse)
async def delete_comment(
    comment_id: str,
    database = Depends(get_database),
    current_user = Depends(get_current_active_user)
):
    """Delete a comment (author or admin only)"""
    
    comment = await database.comments.find_one({
        "$or": [
            {"_id": comment_id},
            {"hashid": comment_id}
        ]
    })
    
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    # Check if user is the author or admin
    if comment["author_id"] != current_user.hashid and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this comment"
        )
    
    # Remove comment from post
    await database.posts.update_one(
        {"post_id": comment["post_id"]},
        {
            "$pull": {"comments": comment["hashid"]},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    # Delete comment
    await database.comments.delete_one({"_id": comment["_id"]})
    
    return {"message": "Comment deleted successfully"}
