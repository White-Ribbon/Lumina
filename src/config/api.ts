// API Configuration
// For production: Set VITE_API_BASE_URL in Vercel environment variables
// Example: https://cosmic-project-forge-backend.onrender.com
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD 
    ? 'https://cosmic-project-forge-backend.onrender.com'  // Update this after Render deployment
    : 'http://localhost:8000');

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REFRESH: `${API_BASE_URL}/api/auth/refresh`,
    ME: `${API_BASE_URL}/api/auth/me`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  },
  GALAXIES: `${API_BASE_URL}/api/galaxies`,
  SOLAR_SYSTEMS: `${API_BASE_URL}/api/solar-systems`,
  PROJECTS: `${API_BASE_URL}/api/projects`,
  FORUMS: `${API_BASE_URL}/api/forums`,
  SUBMISSIONS: `${API_BASE_URL}/api/submissions`,
  USERS: `${API_BASE_URL}/api/users`,
  BADGES: `${API_BASE_URL}/api/badges`,
  ADMIN: `${API_BASE_URL}/api/admin`,
  VOTING: `${API_BASE_URL}/api/voting`,
  PROJECT_IDEAS: `${API_BASE_URL}/api/project-ideas`,
};

export default API_BASE_URL;
