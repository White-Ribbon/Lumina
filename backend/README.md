# Cosmic Project Forge - Backend API

A comprehensive backend API for the Cosmic Project Forge e-learning social media platform built with FastAPI and MongoDB.

## 🌟 Features

- **JWT Authentication** - Secure user authentication with access and refresh tokens
- **Dynamic Universe System** - Galaxy → Solar Systems → Projects hierarchy
- **Badge System** - Earn badges by completing solar systems, unlock random galaxies
- **Project Submissions** - Submit project implementations for review
- **Community Forums** - Post showcasing projects and get help
- **Project Ideas** - Submit and vote on new project ideas
- **Admin Panel** - Admin controls for content management
- **HashID System** - User-friendly IDs for all entities

## 🏗️ Architecture

### Database Structure

```
Users
├── username, email, bio, socials
├── badges (list of badge IDs)
├── unlocked_galaxies (list of galaxy IDs)
└── is_admin, is_active

Galaxies
├── name, description, icon, color
└── is_unlocked_by_default

Solar Systems
├── galaxy_id, name, description, tags
├── badge_id (badge earned when completed)
└── icon, color

Projects
├── solar_system_id, title, description
├── difficulty, est_time, resources
├── requirements, learning_objectives
└── status (approved/pending/rejected)

Project Ideas
├── submitted_by, upvotes, upvoted_by
├── status (pending_approval/approved/rejected)
└── Same fields as Projects

Forums
├── Posts (showcasing/help categories)
├── Comments (nested under posts)
└── Upvoting system

Submissions
├── project_id, user_id, repo_url, readme_md
├── status (pending/approved/rejected)
└── review system

Badges
├── name, description, icon, color
└── solar_system_id (one-to-one relationship)
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- MongoDB 4.4+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cosmic-project-forge/backend
   ```

2. **Install MongoDB**
   - **macOS**: `brew install mongodb-community`
   - **Ubuntu**: `sudo apt install mongodb`
   - **Windows**: Download from [MongoDB website](https://www.mongodb.com/try/download/community)

3. **Start MongoDB**
   - **macOS**: `brew services start mongodb-community`
   - **Ubuntu**: `sudo systemctl start mongod`
   - **Windows**: Start MongoDB service

4. **Run the startup script**
   
   **Linux/macOS:**
   ```bash
   chmod +x start.sh
   ./start.sh
   ```
   
   **Windows:**
   ```cmd
   start.bat
   ```

5. **Manual setup (alternative)**
   ```bash
   # Create virtual environment
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Copy environment file
   cp env.example .env
   
   # Initialize database
   python init_db.py
   
   # Start server
   python main.py
   ```

### Default Admin Credentials

- **Email**: `admin@cosmicprojectforge.com`
- **Password**: `admin123`

## 🔧 Configuration

Edit the `.env` file to configure:

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=cosmic_project_forge
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7
ADMIN_EMAIL=admin@cosmicprojectforge.com
ADMIN_PASSWORD=admin123
```

## 📚 API Documentation

Once the server is running, visit:
- **Interactive API Docs**: http://localhost:8000/docs
- **ReDoc Documentation**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## 🔐 Authentication

The API uses JWT tokens for authentication:

1. **Register/Login** to get access and refresh tokens
2. **Include token** in Authorization header: `Bearer <access_token>`
3. **Refresh token** when access token expires

### Example Authentication Flow

```bash
# Register
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "password123"}'

# Login
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'

# Use token
curl -X GET "http://localhost:8000/api/users/me" \
  -H "Authorization: Bearer <access_token>"
```

## 🎯 Key Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user info

### Galaxies
- `GET /api/galaxies` - List galaxies (filtered by unlocked status)
- `GET /api/galaxies/{id}` - Get galaxy details
- `POST /api/galaxies/unlock-random` - Unlock random galaxy

### Solar Systems
- `GET /api/solar-systems` - List solar systems (filtered by galaxy)
- `GET /api/solar-systems/{id}` - Get solar system details

### Projects
- `GET /api/projects` - List projects (with filters)
- `GET /api/projects/{id}` - Get project details
- `POST /api/projects/ideas` - Submit project idea
- `POST /api/projects/ideas/{id}/upvote` - Upvote project idea

### Submissions
- `POST /api/submissions` - Submit project implementation
- `GET /api/submissions` - List submissions (user's own or approved)
- `POST /api/submissions/{id}/review` - Review submission (admin)

### Forums
- `GET /api/forums` - List forum posts
- `POST /api/forums` - Create new post
- `POST /api/forums/{id}/comments` - Add comment to post
- `POST /api/forums/{id}/upvote` - Upvote post

## 🏆 Badge System

The platform implements a gamification system:

1. **Complete Projects** → Submit implementations
2. **Get Approved** → Earn solar system badge
3. **Unlock Galaxy** → Random galaxy becomes available
4. **Progress Tracking** → View earned badges and unlocked content

### Badge Earning Flow

```python
# When submission is approved
if submission.status == "approved":
    # Award badge to user
    user.badges.append(solar_system.badge_id)
    
    # Unlock random galaxy
    available_galaxies = get_unlocked_galaxies(user)
    random_galaxy = random.choice(available_galaxies)
    user.unlocked_galaxies.append(random_galaxy.hashid)
```

## 🔄 Project Ideas System

Users can submit new project ideas that go through a community-driven approval process:

1. **Submit Idea** → Project idea created with `pending_approval` status
2. **Community Voting** → Users can upvote ideas
3. **Admin Review** → Admins can approve popular ideas
4. **Convert to Project** → Approved ideas become official projects

## 🛠️ Development

### Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── models.py              # Pydantic models
├── auth.py                # Authentication utilities
├── database.py            # Database connection
├── init_db.py             # Database initialization
├── routers/               # API route handlers
│   ├── auth.py           # Authentication endpoints
│   ├── users.py          # User management
│   ├── galaxies.py       # Galaxy endpoints
│   ├── solar_systems.py  # Solar system endpoints
│   ├── projects.py       # Project endpoints
│   ├── forums.py         # Forum endpoints
│   ├── submissions.py    # Submission endpoints
│   └── badges.py         # Badge endpoints
├── requirements.txt       # Python dependencies
├── env.example           # Environment variables template
├── start.sh              # Linux/macOS startup script
└── start.bat             # Windows startup script
```

### Adding New Features

1. **Create Model** in `models.py`
2. **Add Router** in `routers/` directory
3. **Include Router** in `main.py`
4. **Update Database** schema if needed
5. **Test Endpoints** using `/docs` interface

### Database Migrations

For schema changes, update `init_db.py` and run:

```bash
python init_db.py
```

## 🧪 Testing

### Manual Testing

Use the interactive API documentation at http://localhost:8000/docs

### Example Test Script

```python
import requests

BASE_URL = "http://localhost:8000"

# Test registration
response = requests.post(f"{BASE_URL}/api/auth/register", json={
    "username": "testuser",
    "email": "test@example.com", 
    "password": "password123"
})
print("Registration:", response.json())

# Test login
response = requests.post(f"{BASE_URL}/api/auth/login", json={
    "username": "testuser",
    "password": "password123"
})
tokens = response.json()
print("Login:", tokens)

# Test authenticated request
headers = {"Authorization": f"Bearer {tokens['access_token']}"}
response = requests.get(f"{BASE_URL}/api/users/me", headers=headers)
print("User info:", response.json())
```

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify MongoDB port (default: 27017)

2. **Import Errors**
   - Activate virtual environment
   - Install dependencies: `pip install -r requirements.txt`

3. **Authentication Issues**
   - Check JWT secret key in `.env`
   - Verify token format in Authorization header
   - Ensure token hasn't expired

4. **Database Initialization**
   - Run `python init_db.py` to reset database
   - Check MongoDB permissions
   - Verify database name in `.env`

### Logs

Check console output for detailed error messages. The API provides comprehensive error responses with status codes and descriptions.

## 📈 Performance Considerations

- **Database Indexes** - Automatically created for optimal query performance
- **Pagination** - All list endpoints support pagination
- **Caching** - Consider implementing Redis for production
- **Rate Limiting** - Add rate limiting for production deployment

## 🔒 Security Features

- **Password Hashing** - Bcrypt for secure password storage
- **JWT Tokens** - Secure token-based authentication
- **CORS Protection** - Configurable CORS policies
- **Input Validation** - Pydantic models for request validation
- **SQL Injection Protection** - MongoDB with parameterized queries

## 🌐 Production Deployment

### Environment Variables

```env
MONGODB_URL=mongodb://your-production-mongodb-url
JWT_SECRET_KEY=your-production-secret-key
ADMIN_EMAIL=your-admin-email
ADMIN_PASSWORD=your-secure-admin-password
```

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "main.py"]
```

### Reverse Proxy

Use Nginx or similar for production:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation at `/docs`
3. Check console logs for error details
4. Verify database connection and configuration

## 🎉 Success!

Your Cosmic Project Forge backend is now running! The API is ready to power your e-learning social media platform with all the features you requested:

- ✅ JWT Authentication
- ✅ Dynamic Universe System (Galaxies → Solar Systems → Projects)
- ✅ Badge Earning and Galaxy Unlocking
- ✅ Project Submission and Review System
- ✅ Community Forums
- ✅ Project Ideas with Voting
- ✅ Admin Controls
- ✅ HashID System for User-Friendly URLs

Happy coding! 🚀
