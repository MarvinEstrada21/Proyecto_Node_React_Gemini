import client from './client';
import type { Recipe, ApiResponse } from '../types';

export const recipeApi = {
  // Listar recetas con búsqueda por término, categoría y autor
  getRecipes: async (params?: { search?: string; category?: string; author?: string }): Promise<Recipe[]> => {
    const response = await client.get<ApiResponse<Recipe[]>>('/recipes', { params });
    return response.data.data || [];
  },

  // Obtener receta por ID
  getRecipeById: async (id: number): Promise<Recipe> => {
    const response = await client.get<ApiResponse<Recipe>>(`/recipes/${id}`);
    if (!response.data.data) {
      throw new Error(response.data.message || 'Receta no encontrada');
    }
    return response.data.data;
  },

  // Crear receta
  createRecipe: async (formData: FormData): Promise<{ success: boolean; message: string; recipeId: number }> => {
    const response = await client.post<{ success: boolean; message: string; recipeId: number }>('/recipes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Actualizar receta
  updateRecipe: async (id: number, formData: FormData): Promise<{ success: boolean; message: string; recipeId: number }> => {
    const response = await client.put<{ success: boolean; message: string; recipeId: number }>(`/recipes/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Eliminar receta
  deleteRecipe: async (id: number): Promise<ApiResponse> => {
    const response = await client.delete<ApiResponse>(`/recipes/${id}`);
    return response.data;
  },

  // Obtener lista de categorías
  getCategories: async (): Promise<string[]> => {
    const response = await client.get<ApiResponse<string[]>>('/recipes/categories');
    return response.data.data || [];
  },
};
