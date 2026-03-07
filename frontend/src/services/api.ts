import axios from 'axios';

// API Base URL - Configure based on environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const DEBUG_MODE = import.meta.env.VITE_DEBUG === 'true';

console.log('🌍 GeoSentinel API Client Initialized');
console.log('📡 API Base URL:', API_BASE_URL);
console.log('🔍 Debug Mode:', DEBUG_MODE);

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
    // Log outgoing requests
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      baseURL: config.baseURL,
      params: config.params,
      data: config.data,
    });
    
    const token = localStorage.getItem('geosentinel_auth');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    // Log error responses
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
    
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

export interface WeatherRecord {
  state_ut_name: string;
  district_name: string;
  subdivision_name?: string;
  year: number;
  month: number;
  jan?: number;
  feb?: number;
  mar?: number;
  apr?: number;
  may?: number;
  jun?: number;
  jul?: number;
  aug?: number;
  sep?: number;
  oct?: number;
  nov?: number;
  dec?: number;
  annual?: number;
  date?: string;
  avg_rainfall?: number;
  agency_name?: string;
}

export interface LiveWeatherResponse {
  region: string;
  weather_data: WeatherRecord | null;
  status: string;
  message?: string;
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

export interface NotificationChannelStatus {
  enabled: boolean;
  configured: boolean;
  [key: string]: string | number | boolean;
}

export interface NotificationStatusResponse {
  email: NotificationChannelStatus;
  sms: NotificationChannelStatus;
}

export interface EmailTestRequest {
  to_email: string;
  subject: string;
  message: string;
}

export interface SMSTestRequest {
  to_phone: string;
  message: string;
}

export interface AlertTestRequest {
  user_email: string;
  user_phone: string;
  user_name: string;
  region: string;
  probability: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface NotificationActionResponse {
  status: string;
  message?: string;
  mode?: string;
  [key: string]: unknown;
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
 * Notifications
 */
export const getNotificationStatus = async (): Promise<NotificationStatusResponse> => {
  const response = await apiClient.get('/notifications/status');
  return response.data;
};

export const testEmailNotification = async (
  payload: EmailTestRequest
): Promise<NotificationActionResponse> => {
  const response = await apiClient.post('/notifications/test/email', payload);
  return response.data;
};

export const testSMSNotification = async (
  payload: SMSTestRequest
): Promise<NotificationActionResponse> => {
  const response = await apiClient.post('/notifications/test/sms', payload);
  return response.data;
};

export const testAlertNotification = async (
  payload: AlertTestRequest
): Promise<NotificationActionResponse> => {
  const response = await apiClient.post('/notifications/test/alert', payload);
  return response.data;
};

export const sendRegionAlert = async (
  regionName: string,
  probability: number,
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
): Promise<NotificationActionResponse> => {
  const encodedRegion = encodeURIComponent(regionName);
  const response = await apiClient.post(
    `/notifications/send-region-alert/${encodedRegion}?probability=${probability}&risk_level=${riskLevel}`
  );
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

export const getLiveWeatherData = async (mock: boolean = false): Promise<LiveWeatherResponse[]> => {
  const response = await apiClient.get('/regions/live-weather', {
    params: { mock },
  });
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
