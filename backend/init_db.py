#!/usr/bin/env python3
"""
Database initialization script for Cosmic Project Forge
This script creates the initial data structure and sample data
"""

import os
import sys
from datetime import datetime
from database import get_sync_database
from auth import get_password_hash, generate_hashid
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def init_database():
    """Initialize the database with collections and indexes"""
    db = get_sync_database()
    
    print("Initializing Cosmic Project Forge database...")
    
    # Create collections
    collections = [
        "users", "galaxies", "solar_systems", "projects", "project_ideas",
        "posts", "comments", "submissions", "badges"
    ]
    
    for collection_name in collections:
        if collection_name not in db.list_collection_names():
            db.create_collection(collection_name)
            print(f"Created collection: {collection_name}")
    
    # Create indexes
    print("Creating indexes...")
    
    # Users indexes
    db.users.create_index("username", unique=True)
    db.users.create_index("email", unique=True)
    db.users.create_index("hashid", unique=True)
    
    # Galaxies indexes
    db.galaxies.create_index("hashid", unique=True)
    
    # Solar systems indexes
    db.solar_systems.create_index("hashid", unique=True)
    db.solar_systems.create_index("galaxy_id")
    db.solar_systems.create_index("badge_id")
    
    # Projects indexes
    db.projects.create_index("hashid", unique=True)
    db.projects.create_index("solar_system_id")
    db.projects.create_index("status")
    
    # Project ideas indexes
    db.project_ideas.create_index("hashid", unique=True)
    db.project_ideas.create_index("solar_system_id")
    db.project_ideas.create_index("submitted_by")
    db.project_ideas.create_index("status")
    
    # Posts indexes
    db.posts.create_index("hashid", unique=True)
    db.posts.create_index("author_id")
    db.posts.create_index("category")
    
    # Comments indexes
    db.comments.create_index("hashid", unique=True)
    db.comments.create_index("post_id")
    db.comments.create_index("author_id")
    
    # Submissions indexes
    db.submissions.create_index("hashid", unique=True)
    db.submissions.create_index("user_id")
    db.submissions.create_index("project_id")
    db.submissions.create_index("status")
    
    # Badges indexes
    db.badges.create_index("hashid", unique=True)
    # Drop old unique index if it exists and create new non-unique one
    try:
        db.badges.drop_index("solar_system_id_1")
        print("Dropped old solar_system_id index from badges")
    except:
        pass
    # Note: solar_system_id is not unique as one solar system can have multiple badges
    db.badges.create_index("solar_system_id")
    
    print("Database initialization completed!")

def create_admin_user():
    """Create the initial admin user"""
    db = get_sync_database()
    
    admin_email = os.getenv("ADMIN_EMAIL", "admin@cosmicprojectforge.com")
    admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
    
    # Check if admin user already exists
    existing_admin = db.users.find_one({"email": admin_email})
    if existing_admin:
        print(f"Admin user already exists: {admin_email}")
        return
    
    # Create admin user
    admin_doc = {
        "username": "admin",
        "email": admin_email,
        "bio": "System Administrator",
        "socials": None,
        "avatar_url": None,
        "password_hash": get_password_hash(admin_password),
        "badges": [],
        "unlocked_galaxies": [],
        "is_admin": True,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = db.users.insert_one(admin_doc)
    
    # Generate hashid
    hashid = generate_hashid("users", str(result.inserted_id))
    
    # Update user with hashid
    db.users.update_one(
        {"_id": result.inserted_id},
        {"$set": {"hashid": hashid}}
    )
    
    print(f"Created admin user: {admin_email}")

def create_sample_data():
    """Create sample data for the platform"""
    db = get_sync_database()
    
    print("Creating sample data...")
    
    # Sample Galaxies
    galaxies_data = [
        {
            "name": "Blockchain Galaxy",
            "description": "Explore decentralized technologies, smart contracts, and cryptocurrency projects",
            "icon": "🔗",
            "color": "#8B5CF6",
            "is_unlocked_by_default": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "IoT Galaxy",
            "description": "Internet of Things projects with embedded systems and connected devices",
            "icon": "🌐",
            "color": "#10B981",
            "is_unlocked_by_default": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "AI & Machine Learning Galaxy",
            "description": "Artificial Intelligence, Deep Learning, and Data Science projects",
            "icon": "🤖",
            "color": "#F59E0B",
            "is_unlocked_by_default": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Web Development Galaxy",
            "description": "Modern web applications, frameworks, and full-stack projects",
            "icon": "💻",
            "color": "#3B82F6",
            "is_unlocked_by_default": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Game Development Galaxy",
            "description": "Interactive games, game engines, and creative experiences",
            "icon": "🎮",
            "color": "#EF4444",
            "is_unlocked_by_default": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    galaxy_ids = []
    for galaxy_data in galaxies_data:
        result = db.galaxies.insert_one(galaxy_data)
        hashid = generate_hashid("galaxies", str(result.inserted_id))
        db.galaxies.update_one(
            {"_id": result.inserted_id},
            {"$set": {"hashid": hashid}}
        )
        galaxy_ids.append(hashid)
    
    # Sample Badges
    badges_data = [
        {
            "name": "Arduino Master",
            "description": "Completed Arduino Solar System projects",
            "icon": "🔧",
            "color": "#10B981",
            "solar_system_id": "",  # Will be updated after solar systems are created
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Ethereum Developer",
            "description": "Mastered Ethereum blockchain development",
            "icon": "⛓️",
            "color": "#8B5CF6",
            "solar_system_id": "",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "NLP Expert",
            "description": "Expert in Natural Language Processing",
            "icon": "🧠",
            "color": "#F59E0B",
            "solar_system_id": "",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "React Specialist",
            "description": "Advanced React development skills",
            "icon": "⚛️",
            "color": "#3B82F6",
            "solar_system_id": "",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Unity Game Developer",
            "description": "Proficient in Unity game development",
            "icon": "🎮",
            "color": "#EF4444",
            "solar_system_id": "",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    badge_ids = []
    for badge_data in badges_data:
        result = db.badges.insert_one(badge_data)
        hashid = generate_hashid("badges", str(result.inserted_id))
        db.badges.update_one(
            {"_id": result.inserted_id},
            {"$set": {"hashid": hashid}}
        )
        badge_ids.append(hashid)
    
    # Sample Solar Systems
    solar_systems_data = [
        {
            "galaxy_id": galaxy_ids[1],  # IoT Galaxy
            "name": "Arduino Solar System",
            "description": "Microcontroller projects using Arduino boards",
            "tags": ["hardware", "embedded", "sensors"],
            "badge_id": badge_ids[0],  # Arduino Master
            "icon": "🔧",
            "color": "#10B981",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "galaxy_id": galaxy_ids[0],  # Blockchain Galaxy
            "name": "Ethereum Solar System",
            "description": "Smart contracts and dApps on Ethereum",
            "tags": ["solidity", "web3", "defi"],
            "badge_id": badge_ids[1],  # Ethereum Developer
            "icon": "⛓️",
            "color": "#8B5CF6",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "galaxy_id": galaxy_ids[2],  # AI & ML Galaxy
            "name": "Natural Language Processing",
            "description": "Text processing and language understanding projects",
            "tags": ["python", "transformers", "nlp"],
            "badge_id": badge_ids[2],  # NLP Expert
            "icon": "🧠",
            "color": "#F59E0B",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "galaxy_id": galaxy_ids[3],  # Web Dev Galaxy
            "name": "React Solar System",
            "description": "Modern React applications and component libraries",
            "tags": ["javascript", "frontend", "ui"],
            "badge_id": badge_ids[3],  # React Specialist
            "icon": "⚛️",
            "color": "#3B82F6",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "galaxy_id": galaxy_ids[4],  # Game Dev Galaxy
            "name": "Unity Solar System",
            "description": "3D and 2D games built with Unity engine",
            "tags": ["c#", "3d", "mobile"],
            "badge_id": badge_ids[4],  # Unity Game Developer
            "icon": "🎮",
            "color": "#EF4444",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    solar_system_ids = []
    for solar_system_data in solar_systems_data:
        result = db.solar_systems.insert_one(solar_system_data)
        hashid = generate_hashid("solar_systems", str(result.inserted_id))
        db.solar_systems.update_one(
            {"_id": result.inserted_id},
            {"$set": {"hashid": hashid}}
        )
        solar_system_ids.append(hashid)
    
    # Update badges with solar system IDs
    for i, badge_id in enumerate(badge_ids):
        db.badges.update_one(
            {"hashid": badge_id},
            {"$set": {"solar_system_id": solar_system_ids[i]}}
        )
    
    # Sample Projects
    projects_data = [
        {
            "solar_system_id": solar_system_ids[0],  # Arduino
            "title": "Smart Home Hub",
            "description": "Build a centralized smart home control system using Arduino to manage lights, temperature, and security sensors",
            "tags": ["iot", "automation", "sensors"],
            "difficulty": "Intermediate",
            "estimated_time": "2-3 weeks",
            "resources": [
                {"title": "Arduino IoT Tutorial", "url": "https://arduino.cc"},
                {"title": "Home Automation Guide", "url": "https://example.com"}
            ],
            "requirements": ["Arduino Mega", "ESP8266 WiFi module", "DHT22 sensors"],
            "learning_objectives": ["IoT integration", "Sensor data processing", "Home automation"],
            "status": "approved",
            "created_by": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "solar_system_id": solar_system_ids[1],  # Ethereum
            "title": "NFT Marketplace",
            "description": "Develop a decentralized marketplace for creating, buying, and selling NFTs on Ethereum",
            "tags": ["solidity", "web3", "nft"],
            "difficulty": "Advanced",
            "estimated_time": "4-6 weeks",
            "resources": [
                {"title": "Solidity Documentation", "url": "https://docs.soliditylang.org"},
                {"title": "OpenZeppelin Contracts", "url": "https://openzeppelin.com"}
            ],
            "requirements": ["Solidity knowledge", "Web3.js", "MetaMask"],
            "learning_objectives": ["Smart contract development", "NFT standards", "DeFi protocols"],
            "status": "approved",
            "created_by": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    for project_data in projects_data:
        result = db.projects.insert_one(project_data)
        hashid = generate_hashid("projects", str(result.inserted_id))
        db.projects.update_one(
            {"_id": result.inserted_id},
            {"$set": {"hashid": hashid}}
        )
    
    print("Sample data created successfully!")

def main():
    """Main initialization function"""
    try:
        init_database()
        create_admin_user()
        create_sample_data()
        print("\n✅ Database initialization completed successfully!")
        print("\nAdmin credentials:")
        print(f"Email: {os.getenv('ADMIN_EMAIL', 'admin@cosmicprojectforge.com')}")
        print(f"Password: {os.getenv('ADMIN_PASSWORD', 'admin123')}")
        print("\nYou can now start the backend server with: python main.py")
        
    except Exception as e:
        print(f"❌ Error during initialization: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
