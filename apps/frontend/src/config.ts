
const validateBackendUrl = (url: string | undefined): string => {
  if (!url) {
    console.warn('VITE_BACKEND_URL not set, using default localhost');
    return 'http://localhost:8787';
  }
  
  try {
    new URL(url);
    return url;
  } catch {
    console.error('Invalid VITE_BACKEND_URL, using default localhost');
    return 'http://localhost:8787';
  }
};

export const BACKEND_URL = validateBackendUrl(import.meta.env.VITE_BACKEND_URL);


export const API_CONFIG = {
  baseURL: BACKEND_URL,
  timeout: 10000,
  withCredentials: true,
};


export const ENV = {
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
};

console.log('Frontend config loaded:', {
  backendUrl: BACKEND_URL,
  environment: import.meta.env.MODE
});
