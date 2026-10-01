export interface LoginCredentials {
  username_or_email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterResponse {
  message?: string;
  id?: string;
  username?: string;
  email?: string;
  [key: string]: unknown;
}
