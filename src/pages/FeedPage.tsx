import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { postsApi } from '../api/posts.api';
import type { FeedResponse } from '../types/post';
import { useToast } from '../hooks/useToast';
import { parseApiError } from '../utils/error';
import PostCard from '../components/posts/PostCard';
import DeletePostModal from '../components/posts/DeletePostModal';
import { PostListSkeleton } from '../components/common/Skeleton';
import Button from '../components/common/Button';
import { Sparkles, PlusCircle, RefreshCw, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

export const FeedPage: React.FC = () => {
  const [feedResponse, setFeedResponse] = useState<FeedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { error: toastError } = useToast();

  useEffect(() => {
    let isCancelled = false;

    const fetchFeed = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await postsApi.getFeed(currentPage, 10);
        if (!isCancelled) {
          setFeedResponse(data);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          const msg = parseApiError(err);
          setError(msg);
          toastError(msg);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchFeed();

    return () => {
      isCancelled = true;
    };
  }, [currentPage, refreshTrigger, toastError]);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleOpenDelete = (postId: string) => {
    setDeletingPostId(postId);
    setIsDeleteModalOpen(true);
  };

  const handlePostDeleted = (deletedId: string) => {
    setFeedResponse((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        items: prev.items.filter((p) => p.id !== deletedId),
        total: Math.max(0, prev.total - 1),
      };
    });
  };

  const handleEditPost = (postId: string) => {
    navigate(`/posts/${postId}/edit`);
  };

  const posts = feedResponse?.items || [];
  const total = feedResponse?.total || 0;
  const pageSize = feedResponse?.page_size || 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-8">
      {/* Feed Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-white" />
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Feed
            </h1>
            {total > 0 && (
              <span className="text-xs font-mono bg-zinc-900 text-zinc-400 px-2.5 py-0.5 rounded-full border border-zinc-800">
                {total} {total === 1 ? 'post' : 'posts'}
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Discover the latest posts and updates from the community.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            aria-label="Refresh feed"
          >
            Refresh
          </Button>

          {isAuthenticated ? (
            <Link to="/posts/create">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
              >
                Create Post
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button
                variant="secondary"
                size="sm"
              >
                Sign In to Post
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <PostListSkeleton count={3} />
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 space-y-4">
          <div className="p-4 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">Failed to load feed</h3>
            <p className="text-xs text-zinc-400 max-w-sm">{error}</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Try Again
          </Button>
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              author={post.user_id === user?.id ? user : undefined}
              onDeleteClick={post.user_id === user?.id ? handleOpenDelete : undefined}
              onEditClick={post.user_id === user?.id ? handleEditPost : undefined}
              showActions={post.user_id === user?.id}
            />
          ))}

          {/* Pagination Controls */}
          {(totalPages > 1 || feedResponse?.has_next) && (
            <div className="flex items-center justify-between pt-6 border-t border-zinc-900">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage <= 1 || isLoading}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>

              <span className="text-xs font-mono text-zinc-400">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="secondary"
                size="sm"
                disabled={(!feedResponse?.has_next && currentPage >= totalPages) || isLoading}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40">
          <div className="p-4 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800 mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-white">No posts in the feed yet</h3>
          <p className="text-xs text-zinc-400 max-w-sm mt-1 mb-5">
            Be the first to share an update or project with the community.
          </p>
          {isAuthenticated ? (
            <Link to="/posts/create">
              <Button
                variant="primary"
                size="md"
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Create the first post
              </Button>
            </Link>
          ) : (
            <Link to="/register">
              <Button
                variant="primary"
                size="md"
              >
                Create Account to Post
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Delete Post Modal */}
      <DeletePostModal
        postId={deletingPostId}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingPostId(null);
        }}
        onDeleted={handlePostDeleted}
      />
    </div>
  );
};

export default FeedPage;
