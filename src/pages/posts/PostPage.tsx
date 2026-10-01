import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postsApi } from '../../api/posts.api';
import { usersApi } from '../../api/users.api';
import type { Post } from '../../types/post';
import type { User, FollowUserItem } from '../../types/user';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { parseApiError } from '../../utils/error';
import { resolveImageUrl } from '../../utils/image';
import { formatDate, formatFullDate } from '../../utils/format';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import DeletePostModal from '../../components/posts/DeletePostModal';
import PostComments from '../../components/posts/PostComments';
import PostLikesModal from '../../components/posts/PostLikesModal';
import AuthPromptModal from '../../components/auth/AuthPromptModal';
import { PostSkeleton } from '../../components/common/Skeleton';
import {
  ArrowLeft,
  Calendar,
  Edit,
  Trash2,
  AlertCircle,
  Heart,
  MessageSquare,
  Share2,
} from 'lucide-react';

export const PostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [postAuthor, setPostAuthor] = useState<User | FollowUserItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Interaction states
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [authPromptMessage, setAuthPromptMessage] = useState<string | null>(null);

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    let isCancelled = false;
    const fetchPost = async () => {
      if (!postId) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await postsApi.getPost(postId);
        if (!isCancelled) {
          setPost(data);
          setIsLiked(data.is_liked || false);
          setLikeCount(data.like_count || 0);
          setCommentCount(data.comment_count || 0);

          if (data.user_id === user?.id) {
            setPostAuthor(user);
          } else {
            const cached = usersApi.getCachedUser(data.user_id);
            if (cached) {
              setPostAuthor(cached);
            } else {
              usersApi.getUser(data.user_id).then((author) => {
                if (!isCancelled && author) {
                  setPostAuthor(author);
                }
              });
            }
          }
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

    fetchPost();

    return () => {
      isCancelled = true;
    };
  }, [postId, toastError, user]);

  const isAuthorCurrentUser = user?.id === post?.user_id;

  const authorDisplayName =
    postAuthor?.profile?.full_name ||
    postAuthor?.username ||
    (isAuthorCurrentUser ? user?.profile?.full_name || user?.username : 'Author');

  const authorUsername =
    postAuthor?.username || (isAuthorCurrentUser ? user?.username : '');

  const authorPhoto =
    postAuthor?.profile?.profile_photo_url ||
    (isAuthorCurrentUser ? user?.profile?.profile_photo_url : null);

  const handleAuthorClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setAuthPromptMessage('Please log in first to view this profile.');
      return;
    }

    if (isAuthorCurrentUser) {
      navigate('/profile');
    } else if (post?.user_id) {
      navigate(`/profile/${post.user_id}`);
    }
  };

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      setAuthPromptMessage('Please log in first to like this post.');
      return;
    }
    if (!post || isLiking) return;

    setIsLiking(true);
    const previousLiked = isLiked;
    const previousCount = likeCount;

    // Optimistic update
    setIsLiked(!previousLiked);
    setLikeCount(previousLiked ? Math.max(0, previousCount - 1) : previousCount + 1);

    try {
      if (previousLiked) {
        const res = await postsApi.unlikePost(post.id);
        setIsLiked(res.is_liked);
        setLikeCount(res.like_count);
      } else {
        const res = await postsApi.likePost(post.id);
        setIsLiked(res.is_liked);
        setLikeCount(res.like_count);
      }
    } catch (err: unknown) {
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
      const msg = parseApiError(err);
      toastError(msg);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    if (!post) return;
    const postUrl = window.location.href;

    try {
      await postsApi.sharePost(post.id).catch(() => null);

      if (navigator.share && navigator.canShare && navigator.canShare({ url: postUrl })) {
        await navigator.share({
          title: post.title,
          text: post.caption || post.title,
          url: postUrl,
        });
      } else {
        await navigator.clipboard.writeText(postUrl);
        toastSuccess('Post link copied to clipboard!');
      }
    } catch (err: unknown) {
      try {
        await navigator.clipboard.writeText(postUrl);
        toastSuccess('Post link copied to clipboard!');
      } catch {
        const msg = parseApiError(err);
        toastError(msg);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-4 w-28 bg-zinc-900 rounded animate-pulse" />
        <PostSkeleton />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 w-fit mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Post Not Found</h2>
        <p className="text-xs text-zinc-400">
          {error || 'The post you are looking for does not exist or has been removed.'}
        </p>
        <div className="pt-2">
          <Link to="/">
            <Button variant="primary" size="md">
              Back to Feed
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = resolveImageUrl(post.image_url);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors focus:outline-none focus:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to feed
        </Link>

        {isAuthorCurrentUser && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/posts/${post.id}/edit`)}
              leftIcon={<Edit className="w-3.5 h-3.5" />}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Main Post Card */}
      <article className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Author header */}
        <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
          <div
            role="button"
            tabIndex={0}
            onClick={handleAuthorClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleAuthorClick(e);
              }
            }}
            className="flex items-center gap-3 cursor-pointer group focus:outline-none focus-visible:ring-1 focus-visible:ring-white rounded-lg p-1 -m-1 transition-colors"
            title={isAuthenticated ? 'View profile' : 'Log in to view profile'}
          >
            <Avatar
              src={authorPhoto}
              name={authorDisplayName}
              size="md"
              className="transition-transform group-hover:scale-105"
            />
            <div>
              <span className="text-sm font-semibold text-white group-hover:text-zinc-200 transition-colors block">
                {authorDisplayName}
              </span>
              {authorUsername && (
                <span className="text-xs font-mono text-zinc-400 group-hover:text-zinc-300 transition-colors">
                  @{authorUsername}
                </span>
              )}
            </div>
          </div>

          <div className="text-xs text-zinc-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <time dateTime={post.created_at} title={formatFullDate(post.created_at)}>
              {formatDate(post.created_at)}
            </time>
          </div>
        </div>

        {/* Post Title & Caption */}
        <div className="p-6 space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {post.title}
          </h1>

          {post.caption && (
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
              {post.caption}
            </p>
          )}
        </div>

        {/* High-res Attached Image */}
        {imageUrl && (
          <div className="w-full bg-zinc-900 border-t border-b border-zinc-900">
            <img
              src={imageUrl}
              alt={post.title}
              className="w-full max-h-[650px] object-contain mx-auto"
            />
          </div>
        )}

        {/* Post Actions Bar: Like, Likes modal, Comment count, Share */}
        <div className="px-6 py-3.5 bg-zinc-950 border-t border-zinc-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-5">
            {/* Like button */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleLikeToggle}
                disabled={isLiking}
                className={`p-1.5 -m-1.5 rounded-lg flex items-center gap-1.5 transition-colors focus:outline-none focus:ring-1 focus:ring-white ${
                  isLiked
                    ? 'text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
                title={isLiked ? 'Unlike' : 'Like'}
                aria-label={isLiked ? 'Unlike post' : 'Like post'}
              >
                <Heart
                  className={`w-4 h-4 transition-transform active:scale-125 ${
                    isLiked ? 'fill-white text-white' : ''
                  }`}
                />
              </button>
              {likeCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setShowLikesModal(true)}
                  className="font-mono text-zinc-400 hover:text-white hover:underline focus:outline-none"
                  title="View likes"
                >
                  {likeCount}
                </button>
              ) : (
                <span className="font-mono text-zinc-500">0</span>
              )}
            </div>

            {/* Comment count */}
            <div className="flex items-center gap-1.5 text-zinc-400">
              <MessageSquare className="w-4 h-4" />
              <span className="font-mono">{commentCount}</span>
            </div>

            {/* Share button */}
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-white rounded p-1 -m-1"
              title="Share post"
              aria-label="Share post"
            >
              <Share2 className="w-4 h-4" />
              <span className="font-medium text-xs">Share</span>
            </button>
          </div>

          <div className="text-zinc-400 text-[11px]">
            {formatFullDate(post.created_at)}
          </div>
        </div>

        {/* Comments Section */}
        <div className="p-6 border-t border-zinc-900 bg-zinc-950/50">
          <h3 className="text-sm font-semibold text-white mb-4">Comments</h3>
          <PostComments
            postId={post.id}
            onCommentAdded={() => setCommentCount((c) => c + 1)}
          />
        </div>
      </article>

      {/* Post Likes Modal */}
      <PostLikesModal
        postId={post.id}
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
      />

      {/* Delete Post Modal */}
      <DeletePostModal
        postId={post.id}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDeleted={() => {
          navigate('/');
        }}
      />

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={!!authPromptMessage}
        message={authPromptMessage || ''}
        onClose={() => setAuthPromptMessage(null)}
      />
    </div>
  );
};

export default PostPage;
