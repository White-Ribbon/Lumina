import asyncio
from datetime import datetime, timedelta
from database import get_database
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def cleanup_expired_project_ideas():
    """Clean up expired project ideas from the frontend (but keep them in database)"""
    try:
        db = await get_database()
        
        # Find project ideas that have expired
        expired_cutoff = datetime.utcnow()
        
        # Update expired project ideas to mark them as expired (but don't delete)
        result = await db.project_ideas.update_many(
            {
                "expires_at": {"$lt": expired_cutoff},
                "status": {"$ne": "expired"}
            },
            {
                "$set": {
                    "status": "expired",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count > 0:
            logger.info(f"Marked {result.modified_count} project ideas as expired")
        
        # Also clean up very old expired ideas (older than 30 days) - optional cleanup
        very_old_cutoff = datetime.utcnow() - timedelta(days=30)
        old_expired_result = await db.project_ideas.delete_many({
            "expires_at": {"$lt": very_old_cutoff},
            "status": "expired"
        })
        
        if old_expired_result.deleted_count > 0:
            logger.info(f"Deleted {old_expired_result.deleted_count} very old expired project ideas")
            
    except Exception as e:
        logger.error(f"Error cleaning up expired project ideas: {e}")

async def schedule_cleanup():
    """Schedule the cleanup task to run every hour"""
    while True:
        await cleanup_expired_project_ideas()
        await asyncio.sleep(3600)  # Run every hour

if __name__ == "__main__":
    # Run cleanup once
    asyncio.run(cleanup_expired_project_ideas())
