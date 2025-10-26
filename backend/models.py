from pydantic import BaseModel, Field, EmailStr, GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import core_schema
from typing import List, Optional, Dict, Any, Annotated
from datetime import datetime
from bson import ObjectId
from enum import Enum

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type: Any, handler: Any
    ) -> core_schema.CoreSchema:
        return core_schema.union_schema([
            core_schema.is_instance_schema(ObjectId),
            core_schema.chain_schema([
                core_schema.str_schema(),
                core_schema.no_info_plain_validator_function(cls.validate),
            ])
        ],
        serialization=core_schema.plain_serializer_function_ser_schema(
            lambda x: str(x)
        ))

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if isinstance(v, str):
            if ObjectId.is_valid(v):
                return ObjectId(v)
        raise ValueError("Invalid ObjectId")

    @classmethod
    def __get_pydantic_json_schema__(
        cls, schema: core_schema.CoreSchema, handler: GetJsonSchemaHandler
    ) -> JsonSchemaValue:
        return {"type": "string"}

class DifficultyLevel(str, Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"

class PostCategory(str, Enum):
    SHOWCASING = "showcasing"
    HELP = "help"

class SubmissionStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class ProjectStatus(str, Enum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    REJECTED = "rejected"

# User Models
class SocialLinks(BaseModel):
    github: Optional[str] = None
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    website: Optional[str] = None

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    bio: Optional[str] = Field(None, max_length=500)
    socials: Optional[SocialLinks] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    bio: Optional[str] = Field(None, max_length=500)
    socials: Optional[SocialLinks] = None
    avatar_url: Optional[str] = None

class UserInDB(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    hashid: str
    password_hash: str
    badges: List[str] = []
    unlocked_galaxies: List[str] = []
    is_admin: bool = False
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class User(UserBase):
    id: str
    hashid: str
    badges: List[str] = []
    unlocked_galaxies: List[str] = []
    is_admin: bool = False
    created_at: datetime
    updated_at: datetime

class UserResponse(User):
    pass

# Galaxy Models
class GalaxyBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=500)
    icon: Optional[str] = None
    color: Optional[str] = None
    is_unlocked_by_default: bool = False

class GalaxyCreate(GalaxyBase):
    pass

class GalaxyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, min_length=1, max_length=500)
    icon: Optional[str] = None
    color: Optional[str] = None

class GalaxyInDB(GalaxyBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    hashid: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Galaxy(GalaxyBase):
    id: str
    hashid: str
    created_at: datetime
    updated_at: datetime

# Solar System Models
class SolarSystemBase(BaseModel):
    galaxy_id: str
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=500)
    tags: List[str] = Field(default_factory=list)
    badge_id: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None

class SolarSystemCreate(SolarSystemBase):
    pass

class SolarSystemUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, min_length=1, max_length=500)
    tags: Optional[List[str]] = None
    icon: Optional[str] = None
    color: Optional[str] = None

class SolarSystemInDB(SolarSystemBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    hashid: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class SolarSystem(SolarSystemBase):
    id: str
    hashid: str
    created_at: datetime
    updated_at: datetime

# Project Models
class Resource(BaseModel):
    title: str
    url: str

class ProjectBase(BaseModel):
    solar_system_id: str
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=1000)
    tags: List[str] = Field(default_factory=list)
    difficulty: Optional[str] = "beginner"
    estimated_time: Optional[str] = "1-2 hours"
    resources: List[Resource] = Field(default_factory=list)
    requirements: List[str] = Field(default_factory=list)
    learning_objectives: List[str] = Field(default_factory=list)

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1, max_length=1000)
    tags: Optional[List[str]] = None
    difficulty: Optional[str] = None
    estimated_time: Optional[str] = Field(None, min_length=1, max_length=50)
    resources: Optional[List[Resource]] = None
    requirements: Optional[List[str]] = None
    learning_objectives: Optional[List[str]] = None

class ProjectInDB(ProjectBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    hashid: str
    status: ProjectStatus = ProjectStatus.APPROVED
    created_by: Optional[str] = None  # User who submitted this project idea
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Project(ProjectBase):
    id: str
    hashid: str
    status: ProjectStatus
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

# Project Idea Models (for user-submitted project ideas)
class ProjectIdeaBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=1000)
    solar_system_id: str
    tags: List[str] = []
    difficulty: DifficultyLevel
    estimated_time: str = Field(..., min_length=1, max_length=50)
    resources: List[Resource] = []
    requirements: List[str] = []
    learning_objectives: List[str] = []

class ProjectIdeaCreate(ProjectIdeaBase):
    pass

class ProjectIdeaInDB(ProjectIdeaBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    hashid: str
    submitted_by: str  # User ID
    upvotes: int = 0
    upvoted_by: List[str] = []  # List of user IDs who upvoted
    status: ProjectStatus = ProjectStatus.PENDING_APPROVAL
    is_taken: bool = False  # Whether this idea has been implemented
    expires_at: datetime = Field(default_factory=lambda: datetime.utcnow().replace(day=datetime.utcnow().day + 15))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ProjectIdea(ProjectIdeaBase):
    id: str
    hashid: str
    submitted_by: str
    upvotes: int
    status: ProjectStatus
    is_taken: bool
    expires_at: datetime
    created_at: datetime
    updated_at: datetime

# Forum Models
class CommentBase(BaseModel):
    body_md: str = Field(..., min_length=1, max_length=2000)
    tag: Optional[str] = Field(None, max_length=50)

class CommentCreate(CommentBase):
    pass

class CommentInDB(CommentBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    hashid: str
    author_id: str
    post_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Comment(CommentBase):
    id: str
    hashid: str
    author_id: str
    post_id: str
    created_at: datetime
    updated_at: datetime

class PostBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    body_md: str = Field(..., min_length=1, max_length=5000)
    tags: List[str] = []
    category: PostCategory

class PostCreate(PostBase):
    pass

class PostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    body_md: Optional[str] = Field(None, min_length=1, max_length=5000)
    tags: Optional[List[str]] = None

class PostInDB(PostBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    hashid: str
    author_id: str
    comments: List[str] = []  # List of comment IDs
    upvotes: int = 0
    downvotes: int = 0
    upvoted_by: List[str] = []  # List of user IDs who upvoted
    downvoted_by: List[str] = []  # List of user IDs who downvoted
    flags: int = 0
    flagged_by: List[str] = []  # List of user IDs who flagged
    is_removed: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Post(PostBase):
    id: str
    hashid: str
    author_id: str
    comments: List[str] = []
    upvotes: int = 0
    downvotes: int = 0
    flags: int = 0
    is_removed: bool = False
    created_at: datetime
    updated_at: datetime

# Submission Models
class SubmissionBase(BaseModel):
    project_id: str
    repo_url: str = Field(..., min_length=1, max_length=500)
    readme_md: str = Field(..., min_length=1, max_length=10000)

class SubmissionCreate(SubmissionBase):
    pass

class SubmissionUpdate(BaseModel):
    repo_url: Optional[str] = Field(None, min_length=1, max_length=500)
    readme_md: Optional[str] = Field(None, min_length=1, max_length=10000)

class SubmissionInDB(SubmissionBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    hashid: str
    user_id: str
    status: SubmissionStatus = SubmissionStatus.PENDING
    reviewed_by: Optional[str] = None
    review_notes: Optional[str] = None
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    reviewed_at: Optional[datetime] = None

class Submission(SubmissionBase):
    id: str
    hashid: str
    user_id: str
    status: SubmissionStatus
    reviewed_by: Optional[str] = None
    review_notes: Optional[str] = None
    submitted_at: datetime
    reviewed_at: Optional[datetime] = None

# Badge Models
class BadgeBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=500)
    icon: str
    color: str
    solar_system_id: str  # Which solar system this badge belongs to

class BadgeCreate(BadgeBase):
    pass

class BadgeUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, min_length=1, max_length=500)
    icon: Optional[str] = None
    color: Optional[str] = None

class BadgeInDB(BadgeBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    hashid: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Badge(BadgeBase):
    id: str
    hashid: str
    created_at: datetime
    updated_at: datetime

# Authentication Models
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

# Voting Models
class VoteRequest(BaseModel):
    post_id: Optional[str] = None
    project_idea_id: Optional[str] = None
    vote_type: str = Field(..., pattern="^(upvote|downvote|flag)$")

class VoteResponse(BaseModel):
    success: bool
    message: str
    upvotes: int
    downvotes: int
    flags: int = 0

# Admin Models
class AdminStats(BaseModel):
    total_users: int
    total_posts: int
    total_project_ideas: int
    total_submissions: int
    pending_submissions: int
    pending_project_ideas: int

class AdminProjectIdeaUpdate(BaseModel):
    status: Optional[ProjectStatus] = None
    is_taken: Optional[bool] = None

# Response Models
class MessageResponse(BaseModel):
    message: str

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int
