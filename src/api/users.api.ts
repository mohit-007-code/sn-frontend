import apiClient from './client';
import type {
  User,
  UpdateProfilePayload,
  FollowResponse,
  FollowUserListResponse,
  FollowUserItem,
} from '../types/user';

// In-memory cache for fast lookup and resolution of user profiles
const userCache = new Map<string, FollowUserItem | User>();
const pendingUserLookups = new Map<string, Promise<FollowUserItem | User | null>>();

export const usersApi = {
  registerCachedUser(user: FollowUserItem | User | null | undefined): void {
    if (user && user.id) {
      const existing = userCache.get(user.id);
      userCache.set(user.id, {
        ...existing,
        ...user,
        profile: user.profile || (existing && 'profile' in existing ? existing.profile : null),
      });
    }
  },

  getCachedUser(userId: string): (FollowUserItem | User) | undefined {
    return userCache.get(userId);
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get<User>('/api/v1/users/me');
    if (response.data) {
      usersApi.registerCachedUser(response.data);
    }
    return response.data;
  },

  async updateMe(payload: UpdateProfilePayload): Promise<User> {
    const formData = new FormData();

    if (payload.full_name !== undefined && payload.full_name !== null) {
      formData.append('full_name', payload.full_name);
    }
    if (payload.bio !== undefined && payload.bio !== null) {
      formData.append('bio', payload.bio);
    }
    if (payload.profile_photo) {
      formData.append('profile_photo', payload.profile_photo);
    }
    if (payload.banner_photo) {
      formData.append('banner_photo', payload.banner_photo);
    }

    const response = await apiClient.patch<User>('/api/v1/users/me', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (response.data) {
      usersApi.registerCachedUser(response.data);
    }
    return response.data;
  },

  async followUser(userId: string): Promise<FollowResponse> {
    const response = await apiClient.post<FollowResponse>(`/api/v1/users/${userId}/follow`);
    return response.data;
  },

  async unfollowUser(userId: string): Promise<FollowResponse> {
    const response = await apiClient.delete<FollowResponse>(`/api/v1/users/${userId}/follow`);
    return response.data;
  },

  async getFollowers(userId: string, page = 1, pageSize = 20): Promise<FollowUserListResponse> {
    const response = await apiClient.get<FollowUserListResponse>(`/api/v1/users/${userId}/followers`, {
      params: {
        page,
        page_size: pageSize,
      },
    });
    if (response.data?.items) {
      response.data.items.forEach(usersApi.registerCachedUser);
    }
    return response.data;
  },

  async getFollowing(userId: string, page = 1, pageSize = 20): Promise<FollowUserListResponse> {
    const response = await apiClient.get<FollowUserListResponse>(`/api/v1/users/${userId}/following`, {
      params: {
        page,
        page_size: pageSize,
      },
    });
    if (response.data?.items) {
      response.data.items.forEach(usersApi.registerCachedUser);
    }
    return response.data;
  },

  async getUser(userId: string): Promise<FollowUserItem | User | null> {
    if (!userId) return null;
    const cached = userCache.get(userId);
    if (cached && (cached.username !== 'User' || cached.profile)) {
      return cached;
    }

    if (pendingUserLookups.has(userId)) {
      return pendingUserLookups.get(userId)!;
    }

    const lookupPromise = (async () => {
      try {
        const directRes = await apiClient.get<User>(`/api/v1/users/${userId}`).catch(() => null);
        if (directRes?.data) {
          usersApi.registerCachedUser(directRes.data);
          return directRes.data;
        }
        return userCache.get(userId) || null;
      } finally {
        pendingUserLookups.delete(userId);
      }
    })();


    pendingUserLookups.set(userId, lookupPromise);
    return lookupPromise;
  },
};

export default usersApi;
