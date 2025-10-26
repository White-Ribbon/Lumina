import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

// Generic hook for API calls
export function useApi<T>(endpoint: string, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.get<T>(endpoint);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}

// Hook for galaxies
export function useGalaxies() {
  return useApi<any[]>('/api/galaxies');
}

// Hook for single galaxy
export function useGalaxy(galaxyId: string) {
  return useApi<any>(`/api/galaxies/${galaxyId}`, [galaxyId]);
}

// Hook for solar systems
export function useSolarSystems(galaxyId?: string) {
  const endpoint = galaxyId ? `/api/solar-systems?galaxy_id=${galaxyId}` : '/api/solar-systems';
  return useApi<any[]>(endpoint, [galaxyId]);
}

// Hook for single solar system
export function useSolarSystem(solarSystemId: string) {
  return useApi<any>(`/api/solar-systems/${solarSystemId}`, [solarSystemId]);
}

// Hook for projects
export function useProjects(solarSystemId?: string) {
  const endpoint = solarSystemId ? `/api/projects?solar_system_id=${solarSystemId}` : '/api/projects';
  return useApi<any[]>(endpoint, [solarSystemId]);
}

// Hook for single project
export function useProject(projectId: string) {
  return useApi<any>(`/api/projects/${projectId}`, [projectId]);
}

// Hook for user profile
export function useUserProfile(userId: string) {
  return useApi<any>(`/api/users/${userId}`, [userId]);
}

// Hook for forum posts
export function useForumPosts(category?: string) {
  const endpoint = category ? `/api/forums?category=${category}` : '/api/forums';
  return useApi<any>(endpoint, [category]);
}

// Hook for user submissions
export function useUserSubmissions(userId?: string) {
  const endpoint = userId ? `/api/submissions?user_id=${userId}` : '/api/submissions';
  return useApi<any>(endpoint, [userId]);
}

// Hook for project submissions
export function useProjectSubmissions(projectId?: string) {
  const endpoint = projectId ? `/api/submissions?project_id=${projectId}` : '/api/submissions';
  return useApi<any>(endpoint, [projectId]);
}

// Hook for badges
export function useBadges(solarSystemId?: string) {
  const endpoint = solarSystemId ? `/api/badges?solar_system_id=${solarSystemId}` : '/api/badges';
  return useApi<any[]>(endpoint, [solarSystemId]);
}

// Hook for user badges
export function useUserBadges(userId: string) {
  return useApi<any[]>(`/api/badges/user/${userId}`, [userId]);
}

// Hook for project ideas
export function useProjectIdeas(solarSystemId?: string) {
  const endpoint = solarSystemId ? `/api/project-ideas?solar_system_id=${solarSystemId}` : '/api/project-ideas';
  return useApi<any>(endpoint, [solarSystemId]);
}

// Hook for admin stats
export function useAdminStats() {
  return useApi<any>('/api/admin/stats');
}

// Hook for admin submissions
export function useAdminSubmissions(status?: string) {
  const endpoint = status ? `/api/admin/submissions?status=${status}` : '/api/admin/submissions';
  return useApi<any>(endpoint, [status]);
}

// Hook for admin project ideas
export function useAdminProjectIdeas(status?: string) {
  const endpoint = status ? `/api/admin/project-ideas?status=${status}` : '/api/admin/project-ideas';
  return useApi<any>(endpoint, [status]);
}
