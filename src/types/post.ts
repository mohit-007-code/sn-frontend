import type { UserProfile } from './user';

export interface Post {
  id: string;
  user_id: string;
  title: string;
  caption: string | null;
  image_url: string | null;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
  is_liked?: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostListResponse {
  items: Post[];
  page: number;
  page_size: number;
  total: number;
  pages: number;
}

export interface FeedResponse {
  items: Post[];
  page: number;
  page_size: number;
  total: number;
  has_next: boolean;
}

export interface CreatePostPayload {
  title: string;
  caption?: string | null;
  image?: File | null;
}

export interface UpdatePostPayload {
  title?: string | null;
  caption?: string | null;
  image?: File | null;
  remove_image?: boolean;
}

export interface LikeToggleResponse {
  is_liked: boolean;
  like_count: number;
}

export interface LikeUserItem {
  id: string;
  username: string;
  profile: UserProfile | null;
}

export interface PostLikesListResponse {
  items: LikeUserItem[];
  page: number;
  page_size: number;
  total: number;
  has_next: boolean;
}

export interface CommentAuthor {
  id: string;
  username: string;
  profile: UserProfile | null;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  text: string;
  created_at: string;
  updated_at: string;
  user: CommentAuthor | null;
}

export interface CommentListResponse {
  items: Comment[];
  page: number;
  page_size: number;
  total: number;
  has_next: boolean;
}

export interface ShareResponse {
  message?: string;
  share_count: number;
}
