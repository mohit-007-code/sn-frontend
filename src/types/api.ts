export interface ApiValidationErrorItem {
  loc: (string | number)[];
  msg: string;
  type: string;
  ctx?: Record<string, unknown>;
}

export interface ApiValidationErrorResponse {
  detail?: string | ApiValidationErrorItem[];
  message?: string;
}

export interface HealthResponse {
  status: string;
  service?: string;
  application?: string;
  [key: string]: unknown;
}
