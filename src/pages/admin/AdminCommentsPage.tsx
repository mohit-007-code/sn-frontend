import React, { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../api/admin.api';
import type { AdminCommentItem } from '../../types/admin';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/format';
import {
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminCommentsPage: React.FC = () => {
  const [comments, setComments] = useState<AdminCommentItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteTarget, setDeleteTarget] = useState<AdminCommentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const toast = useToast();

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getComments(page, 20, search);
      setComments(res.items);
      setTotal(res.total);
    } catch {
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await adminApi.deleteComment(deleteTarget.id);
      toast.success('Comment deleted successfully');
      setDeleteTarget(null);
      loadComments();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to delete comment');
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
            Comment Moderation
            <span className="text-xs px-2.5 py-0.5 bg-zinc-800 text-zinc-300 rounded-full font-mono">
              {total} Total
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Review community commentary, spam, or abusive messages and delete as needed
          </p>
        </div>

        <button
          onClick={loadComments}
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
            placeholder="Search comment text..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 focus:border-amber-400 focus:outline-none rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500"
          />
        </div>
      </div>

      {/* Comments Table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-zinc-900/60 text-zinc-400 uppercase text-[11px] font-mono border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Comment Text</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">On Post</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500">
                    Loading comments...
                  </td>
                </tr>
              ) : comments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500">
                    No comments found
                  </td>
                </tr>
              ) : (
                comments.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-normal text-white max-w-md break-words">
                        {c.text}
                      </p>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-zinc-300 font-medium">@{c.author_username}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 max-w-xs truncate">
                        <span className="text-zinc-400 truncate">{c.post_title}</span>
                        <Link
                          to={`/posts/${c.post_id}`}
                          target="_blank"
                          className="text-zinc-500 hover:text-white transition-colors"
                          title="View Post"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-500 text-xs whitespace-nowrap">
                      {formatDate(c.created_at)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setDeleteTarget(c)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-transparent hover:border-red-900/40 transition-colors"
                        title="Delete Comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
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
          title="Delete Comment"
          message={`Are you sure you want to delete this comment by @${deleteTarget.author_username}: "${deleteTarget.text}"?`}
          confirmText="Yes, Delete Comment"
          isLoading={isDeleting}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default AdminCommentsPage;
