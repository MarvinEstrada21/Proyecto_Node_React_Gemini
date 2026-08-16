import axios from 'axios';

export const API_BASE_URL = 'http://localhost:4000';

const client = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar token JWT si existe en localStorage
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('recetario_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para normalizar respuestas de error
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si la sesión expiró (401), podemos limpiar localStorage si deseado
    if (error.response && error.response.status === 401) {
      // Dejamos que los componentes o el contexto manejen la expiración
    }
    return Promise.reject(error);
  }
);

// Helper para obtener URL absoluta de imágenes servidas por el backend
export function getImageUrl(imagePath?: string | null): string {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  return `${API_BASE_URL}${imagePath}`;
}

export default client;
