import apiClient from './client';
import { usersApi } from './users.api';
import type {
  Post,
  PostListResponse,
  FeedResponse,
  CreatePostPayload,
  UpdatePostPayload,
  LikeToggleResponse,
  PostLikesListResponse,
  Comment,
  CommentListResponse,
  ShareResponse,
} from '../types/post';

export const postsApi = {
  async getFeed(page = 1, pageSize = 10): Promise<FeedResponse> {
    const response = await apiClient.get<FeedResponse>('/api/v1/feed', {
      params: {
        page,
        page_size: pageSize,
      },
    });
    return response.data;
  },

  async createPost(payload: CreatePostPayload): Promise<Post> {
    const formData = new FormData();
    formData.append('title', payload.title.trim());

    if (payload.caption !== undefined && payload.caption !== null) {
      formData.append('caption', payload.caption);
    }
    if (payload.image) {
      formData.append('image', payload.image);
    }

    const response = await apiClient.post<Post>('/api/v1/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getPost(postId: string): Promise<Post> {
    const response = await apiClient.get<Post>(`/api/v1/posts/${postId}`);
    return response.data;
  },

  async updatePost(postId: string, payload: UpdatePostPayload): Promise<Post> {
    const formData = new FormData();

    if (payload.title !== undefined && payload.title !== null) {
      formData.append('title', payload.title.trim());
    }
    if (payload.caption !== undefined && payload.caption !== null) {
      formData.append('caption', payload.caption);
    }
    if (payload.image) {
      formData.append('image', payload.image);
    }
    if (payload.remove_image !== undefined) {
      formData.append('remove_image', String(payload.remove_image));
    }

    const response = await apiClient.patch<Post>(`/api/v1/posts/${postId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deletePost(postId: string): Promise<void> {
    await apiClient.delete(`/api/v1/posts/${postId}`);
  },

  async getUserPosts(userId: string, page = 1, pageSize = 20): Promise<PostListResponse> {
    const response = await apiClient.get<PostListResponse>(`/api/v1/posts/user/${userId}`, {
      params: {
        page,
        page_size: pageSize,
      },
    });
    return response.data;
  },

  async likePost(postId: string): Promise<LikeToggleResponse> {
    const response = await apiClient.post<LikeToggleResponse>(`/api/v1/posts/${postId}/like`);
    return response.data;
  },

  async unlikePost(postId: string): Promise<LikeToggleResponse> {
    const response = await apiClient.delete<LikeToggleResponse>(`/api/v1/posts/${postId}/like`);
    return response.data;
  },

  async getPostLikes(postId: string, page = 1, pageSize = 20): Promise<PostLikesListResponse> {
    const response = await apiClient.get<PostLikesListResponse>(`/api/v1/posts/${postId}/likes`, {
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

  async getPostComments(postId: string, page = 1, pageSize = 20): Promise<CommentListResponse> {
    const response = await apiClient.get<CommentListResponse>(`/api/v1/posts/${postId}/comments`, {
      params: {
        page,
        page_size: pageSize,
      },
    });
    if (response.data?.items) {
      response.data.items.forEach((item) => {
        if (item.user) {
          usersApi.registerCachedUser(item.user);
        }
      });
    }
    return response.data;
  },

  async createComment(postId: string, text: string): Promise<Comment> {
    const response = await apiClient.post<Comment>(`/api/v1/posts/${postId}/comments`, {
      text: text.trim(),
    });
    if (response.data?.user) {
      usersApi.registerCachedUser(response.data.user);
    }
    return response.data;
  },

  async sharePost(postId: string): Promise<ShareResponse> {
    const response = await apiClient.post<ShareResponse>(`/api/v1/posts/${postId}/share`);
    return response.data;
  },
};

export default postsApi;
