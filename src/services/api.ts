import { API_ENDPOINTS } from '../config/api';
import { authService } from './auth';

class ApiService {
  private baseURL = 'http://localhost:8000';

  // Helper method to get auth headers
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = authService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Generic GET request
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Try to refresh token
        const refreshed = await authService.refreshToken();
        if (refreshed) {
          // Retry with new token
          return this.get<T>(endpoint);
        }
        throw new Error('Authentication failed');
      }
      const error = await response.json();
      throw new Error(error.detail || 'Request failed');
    }

    return response.json();
  }

  // Generic POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Try to refresh token
        const refreshed = await authService.refreshToken();
        if (refreshed) {
          // Retry with new token
          return this.post<T>(endpoint, data);
        }
        throw new Error('Authentication failed');
      }
      const error = await response.json();
      throw new Error(error.detail || 'Request failed');
    }

    return response.json();
  }

  // Generic PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Try to refresh token
        const refreshed = await authService.refreshToken();
        if (refreshed) {
          // Retry with new token
          return this.put<T>(endpoint, data);
        }
        throw new Error('Authentication failed');
      }
      const error = await response.json();
      throw new Error(error.detail || 'Request failed');
    }

    return response.json();
  }

  // Generic DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Try to refresh token
        const refreshed = await authService.refreshToken();
        if (refreshed) {
          // Retry with new token
          return this.delete<T>(endpoint);
        }
        throw new Error('Authentication failed');
      }
      const error = await response.json();
      throw new Error(error.detail || 'Request failed');
    }

    return response.json();
  }
}

export const apiService = new ApiService();
