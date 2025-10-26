# Cosmic Project Forge

A comprehensive e-learning social media platform that gamifies project-based learning through a cosmic universe metaphor.

## 🌟 Features

- **Dynamic Universe System** - Explore galaxies, solar systems, and projects
- **Gamified Learning** - Earn badges, unlock galaxies, track progress
- **Community Forums** - Share projects, get help, showcase work
- **Project Submissions** - Submit implementations for review and feedback
- **Project Ideas** - Submit and vote on new project ideas
- **JWT Authentication** - Secure user management and sessions
- **Admin Panel** - Content management and moderation tools

## 🏗️ Architecture

### Frontend (React + TypeScript)
- Modern React with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- React Router for navigation
- Shadcn/ui components

### Backend (Python + FastAPI)
- FastAPI for high-performance API
- MongoDB for data storage
- JWT authentication
- Async/await support
- Automatic API documentation

### Database Structure
```
Universe Hierarchy:
Galaxies → Solar Systems → Projects

User Progression:
Complete Projects → Earn Badges → Unlock Galaxies
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- MongoDB 4.4+

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Run startup script**
   ```bash
   # Linux/macOS
   chmod +x start.sh
   ./start.sh
   
   # Windows
   start.bat
   ```

3. **API will be available at**: http://localhost:8000
4. **API Documentation**: http://localhost:8000/docs

### Frontend Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Frontend will be available at**: http://localhost:5173

### Default Admin Credentials
- **Email**: `admin@cosmicprojectforge.com`
- **Password**: `admin123`

## 🔧 Configuration

### Backend Configuration
Edit `backend/.env`:
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=cosmic_project_forge
JWT_SECRET_KEY=your-super-secret-jwt-key
ADMIN_EMAIL=admin@cosmicprojectforge.com
ADMIN_PASSWORD=admin123
```

### Frontend Configuration
The frontend automatically connects to the backend API at `http://localhost:8000`. For production, update the API base URL in your frontend configuration.

## 📚 API Integration

### Authentication Flow

```typescript
// Register user
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'newuser',
    email: 'user@example.com',
    password: 'password123'
  })
});

// Login user
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'newuser',
    password: 'password123'
  })
});

const { access_token } = await loginResponse.json();

// Use token for authenticated requests
const userResponse = await fetch('/api/users/me', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
```

### Key API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

#### Universe Navigation
- `GET /api/galaxies` - List available galaxies
- `GET /api/galaxies/{id}` - Get galaxy details
- `GET /api/solar-systems?galaxy_id={id}` - List solar systems in galaxy
- `GET /api/projects?solar_system_id={id}` - List projects in solar system

#### Project Management
- `GET /api/projects/{id}` - Get project details
- `POST /api/submissions` - Submit project implementation
- `POST /api/projects/ideas` - Submit new project idea
- `POST /api/projects/ideas/{id}/upvote` - Upvote project idea

#### Community Features
- `GET /api/forums` - List forum posts
- `POST /api/forums` - Create new post
- `POST /api/forums/{id}/comments` - Add comment to post

## 🎯 User Journey

### 1. Registration & Login
- User registers with username, email, password
- Receives JWT tokens for authentication
- Profile created with empty badges and unlocked galaxies

### 2. Explore Universe
- User sees unlocked galaxies (some unlocked by default)
- Navigates through galaxies → solar systems → projects
- Views project details, requirements, and resources

### 3. Complete Projects
- User implements project according to requirements
- Submits implementation with GitHub link and README
- Admin reviews and approves/rejects submission

### 4. Earn Badges & Unlock Content
- Approved submission awards solar system badge
- Random galaxy becomes unlocked
- User can view earned badges and unlocked content

### 5. Community Engagement
- User posts project showcases in forums
- Asks for help with challenging projects
- Votes on new project ideas
- Comments on other users' posts

## 🏆 Gamification System

### Badge System
- Each solar system has a unique badge
- Complete all projects in a solar system to earn the badge
- Badges are displayed on user profile

### Galaxy Unlocking
- Some galaxies are unlocked by default
- Complete solar systems to unlock random new galaxies
- Creates progression and discovery elements

### Project Ideas
- Users can submit new project ideas
- Community votes on ideas
- Popular ideas can be approved by admins
- Approved ideas become official projects

## 🛠️ Development

### Frontend Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Development
```bash
# Activate virtual environment
source backend/venv/bin/activate  # Linux/macOS
# backend/venv/Scripts/activate  # Windows

# Install dependencies
pip install -r backend/requirements.txt

# Start development server
python backend/main.py

# Initialize database
python backend/init_db.py
```

### Database Management
```bash
# Reset database with sample data
python backend/init_db.py

# Access MongoDB shell
mongosh cosmic_project_forge
```

## 🧪 Testing

### API Testing
Visit http://localhost:8000/docs for interactive API documentation where you can test all endpoints.

### Frontend Testing
The frontend runs on http://localhost:5173 with hot reload for development.

### Integration Testing
1. Start both backend and frontend
2. Register a new user
3. Navigate through galaxies and solar systems
4. Submit a project implementation
5. Test forum posting and commenting

## 🚨 Troubleshooting

### Common Issues

1. **Backend won't start**
   - Ensure MongoDB is running
   - Check Python version (3.8+)
   - Verify virtual environment is activated

2. **Frontend won't connect to backend**
   - Ensure backend is running on port 8000
   - Check CORS configuration
   - Verify API base URL

3. **Database connection errors**
   - Start MongoDB service
   - Check connection string in `.env`
   - Run database initialization script

4. **Authentication issues**
   - Check JWT secret key configuration
   - Verify token format in requests
   - Ensure tokens haven't expired

## 📈 Production Deployment

### Backend Deployment
1. Set production environment variables
2. Use production MongoDB instance
3. Configure reverse proxy (Nginx)
4. Set up SSL certificates
5. Use process manager (PM2, systemd)

### Frontend Deployment
1. Build production bundle: `npm run build`
2. Serve static files with web server
3. Configure API base URL for production
4. Set up CDN for assets

### Database Production
1. Use MongoDB Atlas or dedicated server
2. Configure replica sets for high availability
3. Set up regular backups
4. Monitor performance and usage

## 🔒 Security Considerations

- **JWT Tokens** - Secure token-based authentication
- **Password Hashing** - Bcrypt for password security
- **Input Validation** - Pydantic models validate all inputs
- **CORS Protection** - Configurable cross-origin policies
- **Rate Limiting** - Implement for production use
- **HTTPS** - Use SSL/TLS in production

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation at `/docs`
3. Check console logs for error details
4. Verify all services are running correctly

## 🎉 Success!

Your Cosmic Project Forge platform is now running with:

- ✅ Complete backend API with JWT authentication
- ✅ Dynamic universe system with galaxies and solar systems
- ✅ Badge earning and galaxy unlocking mechanics
- ✅ Project submission and review system
- ✅ Community forums with posts and comments
- ✅ Project ideas with voting system
- ✅ Admin controls for content management
- ✅ Modern React frontend with beautiful UI
- ✅ Comprehensive documentation and setup guides

The platform is ready for users to explore, learn, and build amazing projects! 🚀