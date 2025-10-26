from datetime import datetime, timedelta
from typing import List, Dict, Any
import math

def calculate_post_score(post: Dict[str, Any]) -> float:
    """
    Calculate a ranking score for forum posts using a modified Reddit-style algorithm.
    
    Factors considered:
    - Upvotes vs downvotes (net score)
    - Time decay (newer posts rank higher)
    - Comment engagement
    - Flag penalty
    - Author reputation (if available)
    """
    # Base score from votes
    upvotes = post.get('upvotes', 0)
    downvotes = post.get('downvotes', 0)
    net_score = upvotes - downvotes
    
    # Time decay factor (posts lose score over time)
    created_at = post.get('created_at', datetime.utcnow())
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
    
    hours_old = (datetime.utcnow() - created_at).total_seconds() / 3600
    time_decay = math.pow(hours_old + 2, -1.5)  # Decay factor
    
    # Comment engagement bonus
    comment_count = len(post.get('comments', []))
    comment_bonus = math.log(comment_count + 1) * 0.5
    
    # Flag penalty
    flags = post.get('flags', 0)
    flag_penalty = flags * 0.1
    
    # Calculate final score
    score = (net_score + comment_bonus - flag_penalty) * time_decay
    
    # Ensure minimum score for very new posts
    if hours_old < 1:
        score = max(score, 1.0)
    
    return max(score, 0.0)

def calculate_project_idea_score(idea: Dict[str, Any]) -> float:
    """
    Calculate a ranking score for project ideas.
    
    Factors considered:
    - Upvotes
    - Time decay
    - Status (approved ideas rank higher)
    - Expiration proximity (ideas expiring soon get boost)
    - Taken status penalty
    """
    # Base score from upvotes
    upvotes = idea.get('upvotes', 0)
    
    # Time decay factor
    created_at = idea.get('created_at', datetime.utcnow())
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
    
    hours_old = (datetime.utcnow() - created_at).total_seconds() / 3600
    time_decay = math.pow(hours_old + 2, -1.2)  # Less aggressive decay for ideas
    
    # Status bonus
    status = idea.get('status', 'pending_approval')
    status_bonus = 1.0
    if status == 'approved':
        status_bonus = 1.5
    elif status == 'rejected':
        status_bonus = 0.3
    
    # Expiration boost (ideas expiring soon get a boost)
    expires_at = idea.get('expires_at', datetime.utcnow() + timedelta(days=15))
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
    
    hours_to_expire = (expires_at - datetime.utcnow()).total_seconds() / 3600
    if 0 < hours_to_expire < 72:  # Within 3 days
        expiration_boost = 1.2
    else:
        expiration_boost = 1.0
    
    # Taken penalty
    is_taken = idea.get('is_taken', False)
    taken_penalty = 0.5 if is_taken else 1.0
    
    # Calculate final score
    score = upvotes * status_bonus * expiration_boost * taken_penalty * time_decay
    
    # Ensure minimum score for very new ideas
    if hours_old < 1:
        score = max(score, 0.5)
    
    return max(score, 0.0)

def rank_posts(posts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Rank posts by their calculated score."""
    for post in posts:
        post['_ranking_score'] = calculate_post_score(post)
    
    return sorted(posts, key=lambda x: x['_ranking_score'], reverse=True)

def rank_project_ideas(ideas: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Rank project ideas by their calculated score."""
    for idea in ideas:
        idea['_ranking_score'] = calculate_project_idea_score(idea)
    
    return sorted(ideas, key=lambda x: x['_ranking_score'], reverse=True)

def get_trending_posts(posts: List[Dict[str, Any]], limit: int = 10) -> List[Dict[str, Any]]:
    """Get trending posts (high engagement, recent)"""
    # Filter for posts from last 7 days
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_posts = [
        post for post in posts 
        if datetime.fromisoformat(post.get('created_at', '').replace('Z', '+00:00')) > week_ago
    ]
    
    ranked_posts = rank_posts(recent_posts)
    return ranked_posts[:limit]

def get_popular_ideas(ideas: List[Dict[str, Any]], limit: int = 10) -> List[Dict[str, Any]]:
    """Get popular project ideas (high upvotes, not expired)"""
    # Filter out expired ideas
    now = datetime.utcnow()
    active_ideas = [
        idea for idea in ideas
        if datetime.fromisoformat(idea.get('expires_at', '').replace('Z', '+00:00')) > now
    ]
    
    ranked_ideas = rank_project_ideas(active_ideas)
    return ranked_ideas[:limit]
