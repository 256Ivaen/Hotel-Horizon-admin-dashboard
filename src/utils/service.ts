import axios, { AxiosError } from 'axios';

export const BASE_URL = 'https://api.hotelhorizonug.com/admin/api';

export interface ApiErrorResponse {
  success: boolean;
  message?: string;
  data?: any;
}

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const saveAuthData = (token: string, user: any, fullResponse?: any): void => {
  localStorage.setItem('hotel_horizon_jwt', token);
  localStorage.setItem('hotel_horizon_user', JSON.stringify(user));
  localStorage.setItem('hotel_horizon_isLoggedIn', 'true');
  
  if (fullResponse) {
    localStorage.setItem('hotel_horizon_response', JSON.stringify(fullResponse));
  }
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('hotel_horizon_jwt');
};

export const getCurrentUser = (): any | null => {
  const userStr = localStorage.getItem('hotel_horizon_user');
  return userStr ? JSON.parse(userStr) : null;
};

export const getFullResponse = (): any | null => {
  const responseStr = localStorage.getItem('hotel_horizon_response');
  return responseStr ? JSON.parse(responseStr) : null;
};

export const isLoggedIn = (): boolean => {
  return localStorage.getItem('hotel_horizon_isLoggedIn') === 'true';
};

export const logout = (): void => {
  localStorage.removeItem('hotel_horizon_jwt');
  localStorage.removeItem('hotel_horizon_user');
  localStorage.removeItem('hotel_horizon_isLoggedIn');
  localStorage.removeItem('hotel_horizon_response');
  localStorage.removeItem('hotel_horizon_token_validated');
  localStorage.removeItem('authToken');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    const isLoginEndpoint = config.url?.includes('/auth/login');
    
    if (token && !isLoginEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const isLoginEndpoint = error.config?.url?.includes('/auth/login');
    
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (isLoggedIn() && !isLoginEndpoint) {
        logout();
      }
    }
    return Promise.reject(error);
  }
);

export const get = async <T>(url: string, params?: object): Promise<T> => {
  const response = await axiosInstance.get<T>(url, { params });
  return response.data;
};

export const post = async <T>(url: string, data?: object | FormData): Promise<T> => {
  const config: any = {};
  
  if (data instanceof FormData) {
    config.headers = {
      'Content-Type': 'multipart/form-data',
    };
  }
  
  const response = await axiosInstance.post<T>(url, data, config);
  return response.data;
};

export const put = async <T>(url: string, data?: object): Promise<T> => {
  const response = await axiosInstance.put<T>(url, data);
  return response.data;
};

export const del = async <T>(url: string): Promise<T> => {
  const response = await axiosInstance.delete<T>(url);
  return response.data;
};

export const upload = async <T>(url: string, formData: FormData): Promise<T> => {
  const response = await axiosInstance.post<T>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const patch = async <T>(url: string, data?: object): Promise<T> => {
  const response = await axiosInstance.patch<T>(url, data);
  return response.data;
};

export default axiosInstance;