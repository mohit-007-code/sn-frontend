import apiClient from './client';
import type { HealthResponse } from '../types/api';

export const healthApi = {
  async checkHealth(): Promise<HealthResponse> {
    const response = await apiClient.get<HealthResponse>('/health');
    return response.data;
  },
};

export default healthApi;
