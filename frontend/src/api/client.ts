import axios from 'axios';

// Función para determinar la URL base de la API dinámicamente
// Si se accede desde 'localhost', apunta a 'localhost:4000'
// Si se accede desde una IP de red/VM (ej. '192.168.56.1'), apunta automáticamente a esa misma IP en el puerto 4000
export const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname) {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:4000`;
  }
  return 'http://localhost:4000';
};

export const API_BASE_URL = getApiBaseUrl();

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
    return Promise.reject(error);
  }
);

// Helper para obtener URL absoluta de imágenes servidas por el backend
export function getImageUrl(imagePath?: string | null): string {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const currentBaseUrl = getApiBaseUrl();
  return `${currentBaseUrl}${imagePath}`;
}

export default client;
