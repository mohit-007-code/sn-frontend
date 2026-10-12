import React, { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../api/admin.api';
import type { AdminUserItem } from '../../types/admin';
import Avatar from '../../components/common/Avatar';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/format';
import { useAuth } from '../../hooks/useAuth';
import {
  Search,
  Trash2,
  Shield,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const { user: currentAdmin } = useAuth();
  const toast = useToast();

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers(page, 20, search);
      setUsers(res.items);
      setTotal(res.total);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await adminApi.deleteUser(deleteTarget.id);
      toast.success(`User @${deleteTarget.username} deleted successfully`);
      setDeleteTarget(null);
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / 20) || 1;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            User Management
            <span className="text-xs px-2.5 py-0.5 bg-zinc-800 text-zinc-300 rounded-full font-mono">
              {total} Total
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Search, inspect platform members, and perform account deletion/moderation
          </p>
        </div>

        <button
          onClick={loadUsers}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-xl text-xs font-semibold transition-all hover:border-zinc-700 w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by username or email..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 focus:border-amber-400 focus:outline-none rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-zinc-900/60 text-zinc-400 uppercase text-[11px] font-mono border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Posts</th>
                <th className="py-3 px-4 text-center">Comments</th>
                <th className="py-3 px-4 text-center">Likes</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500">
                    No users found matching query
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrentAdmin = currentAdmin?.id === u.id;
                  const isAdminRole = u.role === 'admin';
                  return (
                    <tr key={u.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={u.profile_photo_url} name={u.username} size="sm" />
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate">{u.full_name || u.username}</p>
                            <p className="text-zinc-500 text-xs">@{u.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-zinc-300 font-mono text-xs">{u.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                            isAdminRole
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {isAdminRole && <Shield className="w-3 h-3" />}
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-zinc-300">{u.posts_count}</td>
                      <td className="py-3 px-4 text-center font-mono text-zinc-300">{u.comments_count}</td>
                      <td className="py-3 px-4 text-center font-mono text-zinc-300">{u.likes_count}</td>
                      <td className="py-3 px-4 text-zinc-500 text-xs">{formatDate(u.created_at)}</td>
                      <td className="py-3 px-4 text-right">
                        {isCurrentAdmin ? (
                          <span className="text-[11px] text-zinc-500 italic">Current Admin</span>
                        ) : (
                          <button
                            onClick={() => setDeleteTarget(u)}
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-transparent hover:border-red-900/40 transition-colors"
                            title="Delete user account and all content"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-zinc-900 text-xs text-zinc-400 bg-zinc-950">
          <span>
            Showing Page <strong className="text-white">{page}</strong> of{' '}
            <strong className="text-white">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none text-white border border-zinc-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none text-white border border-zinc-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmationModal
          isOpen={!!deleteTarget}
          title="Delete User Account"
          message={`Are you sure you want to delete user @${deleteTarget.username} (${deleteTarget.email})? This action will permanently remove all their posts, comments, likes, and follows.`}
          confirmText="Yes, Delete User"
          isLoading={isDeleting}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default AdminUsersPage;
