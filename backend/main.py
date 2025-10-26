from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from dotenv import load_dotenv
import uvicorn
from contextlib import asynccontextmanager

# Load environment variables
load_dotenv()

# Import database connection
from database import connect_to_mongo, close_mongo_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

# Initialize FastAPI app
app = FastAPI(
    title="Lumina API",
    description="Backend API for the e-learning social media platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware - MUST be added before any routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Security
security = HTTPBearer()

# Root and health check endpoints
@app.get("/")
async def root():
    return {"message": "Cosmic Project Forge API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}

# Include routers
from routers import auth, users, galaxies, solar_systems, projects, forums, submissions, badges, admin, voting, project_ideas

app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(galaxies.router, prefix="/api/galaxies", tags=["galaxies"])
app.include_router(solar_systems.router, prefix="/api/solar-systems", tags=["solar-systems"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(forums.router, prefix="/api/forums", tags=["forums"])
app.include_router(submissions.router, prefix="/api/submissions", tags=["submissions"])
app.include_router(badges.router, prefix="/api/badges", tags=["badges"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(voting.router, prefix="/api/voting", tags=["voting"])
app.include_router(project_ideas.router, prefix="/api/project-ideas", tags=["project-ideas"])

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
