import axios, { AxiosError } from 'axios';
import type { ApiValidationErrorResponse } from '../types/api';

export function parseApiError(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
  }

  const axiosError = error as AxiosError<ApiValidationErrorResponse>;

  if (!axiosError.response) {
    if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
      return 'Request timed out. Please check your network connection.';
    }
    return 'Unable to connect to the server. Please ensure the backend is running.';
  }

  const { status, data } = axiosError.response;

  // Check for validation error structure (FastAPI standard)
  if (data?.detail) {
    if (typeof data.detail === 'string') {
      return data.detail;
    }
    if (Array.isArray(data.detail) && data.detail.length > 0) {
      const firstError = data.detail[0];
      const field = firstError.loc ? firstError.loc[firstError.loc.length - 1] : '';
      const cleanField = typeof field === 'string' ? field.replace('_', ' ') : '';
      if (cleanField && !firstError.msg.toLowerCase().includes(cleanField.toLowerCase())) {
        return `${cleanField.charAt(0).toUpperCase() + cleanField.slice(1)}: ${firstError.msg}`;
      }
      return firstError.msg;
    }
  }

  if (data?.message) {
    return data.message;
  }

  switch (status) {
    case 400:
      return 'Bad request. Please check your input.';
    case 401:
      return 'Authentication required or session expired. Please log in.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'A conflict occurred with the existing data.';
    case 413:
      return 'File size is too large. Please choose a smaller file.';
    case 422:
      return 'Validation failed. Please verify the submitted data.';
    case 500:
      return 'Internal server error. Please try again later.';
    case 502:
    case 503:
    case 504:
      return 'Server is temporarily unavailable. Please try again shortly.';
    default:
      return `Request failed with status ${status}. Please try again.`;
  }
}
