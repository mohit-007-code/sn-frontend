export interface AdminStatsSummary {
  total_users: number;
  active_users: number;
  inactive_users: number;
  total_posts: number;
  total_comments: number;
  total_likes: number;
  new_users_today: number;
  new_users_this_month: number;
}

export interface DailyRegistrationItem {
  date: string;
  count: number;
}

export interface MonthlyRegistrationItem {
  month: string;
  count: number;
}

export interface TopPostItem {
  id: string;
  title: string;
  caption?: string | null;
  image_url?: string | null;
  author_username: string;
  author_email: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  share_count: number;
}

export interface AdminDashboardAnalytics {
  summary: AdminStatsSummary;
  daily_registrations: DailyRegistrationItem[];
  monthly_registrations: MonthlyRegistrationItem[];
  top_posts_by_likes: TopPostItem[];
  top_posts_by_comments: TopPostItem[];
}

export interface AdminUserItem {
  id: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  posts_count: number;
  comments_count: number;
  likes_count: number;
  profile_photo_url?: string | null;
  full_name?: string | null;
}

export interface AdminUserListResponse {
  items: AdminUserItem[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

export interface AdminPostItem {
  id: string;
  title: string;
  caption?: string | null;
  image_url?: string | null;
  created_at: string;
  author_id: string;
  author_username: string;
  likes_count: number;
  comments_count: number;
  share_count: number;
}

export interface AdminPostListResponse {
  items: AdminPostItem[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

export interface AdminCommentItem {
  id: string;
  text: string;
  created_at: string;
  post_id: string;
  post_title: string;
  author_id: string;
  author_username: string;
}

export interface AdminCommentListResponse {
  items: AdminCommentItem[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

export interface CreateAdminPayload {
  username: string;
  email: string;
  password: string;
}
