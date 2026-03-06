import axios from 'axios';

// API Base URL - Configure based on environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens if needed
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('geosentinel_auth');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      localStorage.removeItem('geosentinel_auth');
      localStorage.removeItem('geosentinel_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  user_id?: string;
  name: string;
  email: string;
  phone: string;
  region: string;
}

export interface PredictionInput {
  rainfall_6h: number;
  rainfall_12h: number;
  rainfall_24h: number;
  soil_saturation_index: number;
  slope_stability_factor: number;
  terrain_vulnerability_index: number;
}

export interface EnvironmentalData {
  rainfall_6h: number;
  rainfall_12h: number;
  rainfall_24h: number;
  soil_saturation_index: number;
  slope_stability_factor: number;
  terrain_vulnerability_index: number;
}

export interface PredictionResult {
  region: string;
  landslide_probability: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  environmental_data: EnvironmentalData;
}

export interface Region {
  region: string;
  lat: number;
  lon: number;
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Alert {
  region: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  probability: number;
  timestamp: string;
}

// API Service Methods

/**
 * Health Check
 */
export const checkHealth = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

/**
 * User Management
 */
export const registerUser = async (userData: User): Promise<User> => {
  const response = await apiClient.post('/users/register', userData);
  return response.data;
};

export const getAllUsers = async (): Promise<User[]> => {
  const response = await apiClient.get('/users/');
  return response.data;
};

export const getUserById = async (userId: string): Promise<User> => {
  const response = await apiClient.get(`/users/${userId}`);
  return response.data;
};

export const deleteUser = async (userId: string): Promise<void> => {
  await apiClient.delete(`/users/${userId}`);
};

/**
 * Predictions
 */
export const makeCustomPrediction = async (
  data: PredictionInput
): Promise<PredictionResult> => {
  const response = await apiClient.post('/predict', data);
  return response.data;
};

export const getMapRiskLevels = async (): Promise<Region[]> => {
  const response = await apiClient.get('/map/risk');
  return response.data.regions || [];
};

export const predictForRegion = async (regionName: string): Promise<any> => {
  const response = await apiClient.post(`/regions/${regionName}/predict`);
  return response.data;
};

export const getAllRegions = async (): Promise<Region[]> => {
  const response = await apiClient.get('/regions');
  return response.data;
};

export const getRegionAlerts = async (regionName: string): Promise<Alert[]> => {
  const response = await apiClient.get(`/regions/${regionName}/alerts`);
  return response.data;
};

/**
 * Alerts
 */
export const getAllAlerts = async (): Promise<Alert[]> => {
  const response = await apiClient.get('/alerts/');
  return response.data;
};

export const getAlertsByRegion = async (regionName: string): Promise<Alert[]> => {
  const response = await apiClient.get(`/alerts/region/${regionName}`);
  return response.data;
};

export const getHighRiskAlerts = async (): Promise<Alert[]> => {
  const response = await apiClient.get('/alerts/high-risk');
  return response.data;
};

/**
 * Statistics (Custom endpoints if backend provides them)
 */
export const getStatistics = async () => {
  try {
    const [regions, alerts, users] = await Promise.all([
      getAllRegions(),
      getAllAlerts(),
      getAllUsers(),
    ]);

    // Calculate statistics from available data
    const highRiskRegions = regions.filter(r => r.risk_level === 'HIGH').length;
    const mediumRiskRegions = regions.filter(r => r.risk_level === 'MEDIUM').length;
    const lowRiskRegions = regions.filter(r => r.risk_level === 'LOW').length;
    const highRiskAlerts = alerts.filter(a => a.risk_level === 'HIGH').length;

    return {
      totalRegions: regions.length,
      activeRegions: regions.filter(r => r.risk_level !== 'LOW').length,
      totalUsers: users.length,
      totalAlerts: alerts.length,
      highRiskAlerts,
      riskDistribution: {
        high: highRiskRegions,
        medium: mediumRiskRegions,
        low: lowRiskRegions,
      },
    };
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
};

export default apiClient;
