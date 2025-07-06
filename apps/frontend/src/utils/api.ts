import axios, { AxiosError } from 'axios';
import { API_CONFIG } from '../config';
import type { ApiResponse } from '../hooks';


export const apiClient = axios.create(API_CONFIG);


apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
  
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/signin';
      return Promise.reject(new Error('Session expired. Please sign in again.'));
    }
  
    return Promise.reject(error);
  }
);


export const handleApiError = (error: AxiosError<ApiResponse<unknown>>): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};


export const tokenUtils = {
  set: (token: string) => localStorage.setItem('token', token),
  get: () => localStorage.getItem('token'),
  remove: () => localStorage.removeItem('token'),
  isValid: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      // Check if token has 3 parts (header.payload.signature)
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      
      // If token has expiration, check it
      if (payload.exp) {
        return payload.exp * 1000 > Date.now();
      }
      
      // If no expiration, check if payload has required fields
      return payload.id && typeof payload.id === 'string';
    } catch {
      return false;
    }
  }
};
