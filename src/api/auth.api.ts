import apiClient from './client';
import type { LoginCredentials, RegisterCredentials, AuthTokenResponse, RegisterResponse } from '../types/auth';

export const authApi = {
  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    const params = new URLSearchParams();
    params.append('username', credentials.username.trim());
    params.append('email', credentials.email.trim());
    params.append('password', credentials.password);

    const response = await apiClient.post<RegisterResponse>(
      '/api/v1/auth/register',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data;
  },

  async login(credentials: LoginCredentials): Promise<AuthTokenResponse> {
    const params = new URLSearchParams();
    params.append('username_or_email', credentials.username_or_email.trim());
    params.append('password', credentials.password);

    const response = await apiClient.post<AuthTokenResponse>(
      '/api/v1/auth/login',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data;
  },
};

export default authApi;
