import client from './client';
import type { Comment, ApiResponse } from '../types';

export const commentApi = {
  // Obtener comentarios de una receta
  getCommentsByRecipe: async (recipeId: number): Promise<Comment[]> => {
    const response = await client.get<ApiResponse<Comment[]>>(`/comments/recipe/${recipeId}`);
    return response.data.data || [];
  },

  // Publicar nuevo comentario
  createComment: async (recipeId: number, bodyComment: string): Promise<Comment> => {
    const response = await client.post<ApiResponse<Comment>>(`/comments/recipe/${recipeId}`, {
      bodyComment,
    });
    if (!response.data.data) {
      throw new Error(response.data.message || 'Error al guardar comentario');
    }
    return response.data.data;
  },

  // Eliminar comentario
  deleteComment: async (id: number): Promise<ApiResponse> => {
    const response = await client.delete<ApiResponse>(`/comments/${id}`);
    return response.data;
  },
};
