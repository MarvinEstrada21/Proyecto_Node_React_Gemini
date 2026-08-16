import client from './client';
import type { AuthResponse, User, ApiResponse } from '../types';

export const authApi = {
  // Iniciar sesión
  login: async (username: string, passwordUser: string): Promise<AuthResponse> => {
    const response = await client.post<AuthResponse>('/auth/login', {
      username,
      passwordUser,
    });
    return response.data;
  },

  // Registrarse con campos requeridos y opcional foto de perfil
  register: async (formData: FormData): Promise<AuthResponse> => {
    const response = await client.post<AuthResponse>('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Obtener perfil actual
  getProfile: async (): Promise<{ success: boolean; user: User }> => {
    const response = await client.get<{ success: boolean; user: User }>('/auth/profile');
    return response.data;
  },

  // Actualizar perfil (name, lastname, optional imageUser)
  updateProfile: async (formData: FormData): Promise<ApiResponse<User>> => {
    const response = await client.put<ApiResponse<User>>('/auth/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
