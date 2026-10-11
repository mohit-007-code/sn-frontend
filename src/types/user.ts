export interface UserProfile {
  full_name: string | null;
  bio: string | null;
  profile_photo_url: string | null;
  banner_photo_url: string | null;
}

export interface User {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
  profile: UserProfile | null;
}

export interface UpdateProfilePayload {
  full_name?: string | null;
  bio?: string | null;
  profile_photo?: File | null;
  banner_photo?: File | null;
}

export interface FollowResponse {
  is_following: boolean;
  follower_count: number;
  following_count: number;
}

export interface FollowUserItem {
  id: string;
  username: string;
  profile: UserProfile | null;
}

export interface FollowUserListResponse {
  items: FollowUserItem[];
  page: number;
  page_size: number;
  total: number;
  has_next: boolean;
}

export interface PublicUserProfile {
  id: string;
  username: string;
  created_at?: string;
  profile: UserProfile | null;
  follower_count?: number;
  following_count?: number;
}

