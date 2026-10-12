import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin.api';
import type { AdminDashboardAnalytics } from '../../types/admin';
import {
  Users,
  UserCheck,
  Heart,
  MessageSquare,
  TrendingUp,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { PageSkeleton } from '../../components/common/Skeleton';
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/format';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<AdminDashboardAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const toast = useToast();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAnalytics();
      setData(res);
    } catch (err: any) {
      toast.error('Failed to load dashboard analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading && !data) {
    return (
      <div className="p-8">
        <PageSkeleton />
      </div>
    );
  }

  const summary = data?.summary;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Admin Analytics Dashboard
            <span className="text-xs px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full font-mono font-medium">
              Live
            </span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time platform growth, activity metrics, and top community interactions
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-xl text-xs font-semibold transition-all hover:border-zinc-700 w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-sm relative overflow-hidden group hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Users</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
            {summary?.total_users ?? 0}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-zinc-500">
            <span className="text-emerald-400 font-medium">+{summary?.new_users_today ?? 0} today</span>
            <span>•</span>
            <span>+{summary?.new_users_this_month ?? 0} this month</span>
          </div>
        </div>

        {/* Active Users */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-sm relative overflow-hidden group hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Active Users</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-3">
            {summary?.active_users ?? 0}
          </p>
          <p className="text-[11px] text-zinc-500 mt-2">
            {summary?.inactive_users ?? 0} inactive accounts
          </p>
        </div>

        {/* Total Likes */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-sm relative overflow-hidden group hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Likes</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
            {summary?.total_likes ?? 0}
          </p>
          <p className="text-[11px] text-zinc-500 mt-2">Across all platform posts</p>
        </div>

        {/* Total Comments */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-sm relative overflow-hidden group hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Comments</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
            {summary?.total_comments ?? 0}
          </p>
          <p className="text-[11px] text-zinc-500 mt-2">
            In response to {summary?.total_posts ?? 0} total posts
          </p>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Registrations Area Chart */}
        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Daily User Registrations (Recent)
              </h2>
              <p className="text-xs text-zinc-400">New user signups over past days</p>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            {data?.daily_registrations && data.daily_registrations.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.daily_registrations}>
                  <defs>
                    <linearGradient id="dailyRegGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="date"
                    stroke="#71717a"
                    fontSize={11}
                    tickFormatter={(v) => v.slice(5)}
                  />
                  <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#3f3f46',
                      borderRadius: '0.75rem',
                      color: '#fff',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#dailyRegGradient)"
                    name="Registrations"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                No recent registration data available
              </div>
            )}
          </div>
        </div>

        {/* Monthly Registrations Bar Chart */}
        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                Monthly User Registrations
              </h2>
              <p className="text-xs text-zinc-400">Month-over-month platform expansion</p>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            {data?.monthly_registrations && data.monthly_registrations.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthly_registrations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#3f3f46',
                      borderRadius: '0.75rem',
                      color: '#fff',
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                    name="Users Joined"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                No monthly data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Posts Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Posts by Likes */}
        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                Top Posts by Likes
              </h2>
              <p className="text-xs text-zinc-400">Highest audience appreciation</p>
            </div>
          </div>

          <div className="space-y-3">
            {data?.top_posts_by_likes && data.top_posts_by_likes.length > 0 ? (
              data.top_posts_by_likes.map((post, idx) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-zinc-800 text-xs font-bold text-zinc-300 flex items-center justify-center flex-shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                        {post.title}
                      </p>
                      <p className="text-xs text-zinc-400">
                        by @{post.author_username} • {formatDate(post.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      {post.likes_count}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 py-6 text-center">No posts recorded yet</p>
            )}
          </div>
        </div>

        {/* Top Posts by Comments */}
        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                Top Posts by Comments
              </h2>
              <p className="text-xs text-zinc-400">Highest community discussion</p>
            </div>
          </div>

          <div className="space-y-3">
            {data?.top_posts_by_comments && data.top_posts_by_comments.length > 0 ? (
              data.top_posts_by_comments.map((post, idx) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-zinc-800 text-xs font-bold text-zinc-300 flex items-center justify-center flex-shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                        {post.title}
                      </p>
                      <p className="text-xs text-zinc-400">
                        by @{post.author_username} • {formatDate(post.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="flex items-center gap-1 text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {post.comments_count}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 py-6 text-center">No posts recorded yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
