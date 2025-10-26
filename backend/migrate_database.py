import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "cosmic_project_forge")

async def migrate_posts():
    """Add missing fields to existing posts"""
    try:
        # Create database connection
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client[DATABASE_NAME]
        
        # Update posts that don't have the new fields
        result = await db.posts.update_many(
            {
                "$or": [
                    {"downvotes": {"$exists": False}},
                    {"flags": {"$exists": False}},
                    {"is_removed": {"$exists": False}}
                ]
            },
            {
                "$set": {
                    "downvotes": 0,
                    "flags": 0,
                    "is_removed": False,
                    "downvoted_by": [],
                    "flagged_by": [],
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        logger.info(f"Updated {result.modified_count} posts with missing fields")
        
        # Also update project ideas that might be missing fields
        idea_result = await db.project_ideas.update_many(
            {
                "$or": [
                    {"is_taken": {"$exists": False}},
                    {"expires_at": {"$exists": False}}
                ]
            },
            {
                "$set": {
                    "is_taken": False,
                    "expires_at": datetime.utcnow() + timedelta(days=15),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        logger.info(f"Updated {idea_result.modified_count} project ideas with missing fields")
        
        # Close the database connection
        client.close()
        
    except Exception as e:
        logger.error(f"Error migrating posts: {e}")

if __name__ == "__main__":
    asyncio.run(migrate_posts())
