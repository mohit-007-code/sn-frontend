import { apiClient } from './client';
import type {
  AdminDashboardAnalytics,
  AdminUserListResponse,
  AdminPostListResponse,
  AdminCommentListResponse,
  CreateAdminPayload,
} from '../types/admin';
import type { User } from '../types/user';

export const adminApi = {
  getAnalytics: async (): Promise<AdminDashboardAnalytics> => {
    const response = await apiClient.get<AdminDashboardAnalytics>('/api/v1/admin/analytics');
    return response.data;
  },

  getUsers: async (page = 1, pageSize = 20, search?: string): Promise<AdminUserListResponse> => {
    const params: Record<string, string | number> = { page, page_size: pageSize };
    if (search) params.search = search;
    const response = await apiClient.get<AdminUserListResponse>('/api/v1/admin/users', { params });
    return response.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/users/${userId}`);
  },

  getPosts: async (page = 1, pageSize = 20, search?: string): Promise<AdminPostListResponse> => {
    const params: Record<string, string | number> = { page, page_size: pageSize };
    if (search) params.search = search;
    const response = await apiClient.get<AdminPostListResponse>('/api/v1/admin/posts', { params });
    return response.data;
  },

  deletePost: async (postId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/posts/${postId}`);
  },

  getComments: async (page = 1, pageSize = 20, search?: string): Promise<AdminCommentListResponse> => {
    const params: Record<string, string | number> = { page, page_size: pageSize };
    if (search) params.search = search;
    const response = await apiClient.get<AdminCommentListResponse>('/api/v1/admin/comments', { params });
    return response.data;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/comments/${commentId}`);
  },

  createAdmin: async (payload: CreateAdminPayload): Promise<User> => {
    const response = await apiClient.post<User>('/api/v1/admin/create-admin', payload);
    return response.data;
  },
};
