import axios from 'axios';
import { toast } from 'react-toastify';
import { defaultConfig } from '../App/configs/common';

// Create an Axios instance
const api = axios.create({
  baseURL: `${defaultConfig.BASE_API_URL}`, // Your API base URL\

  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding Bearer token to all requests
api.interceptors.request.use(
  (config) => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        // Remove the authentication token from local storage
        localStorage.removeItem('authToken');
        window.location.href = '/';
      } else if (error.response?.status === 403) {
        toast.error('Access forbidden. You do not have permission.');
        window.location.href = '/';
      } else if (error.response?.status === 500) {
        toast.error('Internal Server Error. Please try again later.');
      }
    } else if (error instanceof Error) {
      toast.error('An unexpected error occurred: ' + error.message);
    }
    return Promise.reject(error);
  },
);

// Add this function to fetch live class details
export const getLiveClassDetails = async (classId: string) => {
  try {
    const response = await api.get('/live-class', {
      params: { class_id: classId },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching live class details:', error);
    throw error;
  }
};

export const checkLiveClassEligibility = async (classId: string) => {
  try {
    const response = await api.get('/live-class/check-eligibility', {
      params: { class_id: classId },
    });
    return response.data;
  } catch (error) {
    console.error('Error checking live class eligibility:', error);
    throw error;
  }
};

// Add a separate instance for video streaming
export const videoApi = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Accept': 'video/mp4,video/webm,video/ogg,video/*',
    'Content-Type': 'application/json',
  },
});

export default api;
