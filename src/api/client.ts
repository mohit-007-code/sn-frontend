import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosRequestConfig, AxiosResponse } from 'axios';

export const TOKEN_STORAGE_KEY = 'sn_access_token';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
});

// Request interceptor: attach token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle 401 unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      // Dispatch custom event for auth listeners
      window.dispatchEvent(new CustomEvent('sn:auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

// In-flight GET request deduplication map to prevent redundant duplicate network calls
const pendingGetRequests = new Map<string, Promise<unknown>>();
const originalGet = apiClient.get.bind(apiClient);

apiClient.get = function <T = unknown, R = AxiosResponse<T>, D = unknown>(
  url: string,
  config?: AxiosRequestConfig<D>
): Promise<R> {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY) || 'anon';
  const paramKey = config?.params ? JSON.stringify(config.params) : '';
  const requestKey = `${token}:${url}:${paramKey}`;

  const existingRequest = pendingGetRequests.get(requestKey);
  if (existingRequest) {
    return existingRequest as Promise<R>;
  }

  const promise = originalGet<T, R, D>(url, config).finally(() => {
    pendingGetRequests.delete(requestKey);
  });

  pendingGetRequests.set(requestKey, promise as Promise<unknown>);
  return promise as unknown as Promise<R>;
};

export default apiClient;
