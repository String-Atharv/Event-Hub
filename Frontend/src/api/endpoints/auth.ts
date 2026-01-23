import apiClient from '../client';
import { User } from '@/types';

export const authApi = {
  // Get current user info (if backend provides this endpoint)
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  // Logout (if backend provides this endpoint)
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};

