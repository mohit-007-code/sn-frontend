import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Post } from '../../types/post';
import type { User, FollowUserItem } from '../../types/user';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { postsApi } from '../../api/posts.api';
import { usersApi } from '../../api/users.api';
import { parseApiError } from '../../utils/error';
import { resolveImageUrl } from '../../utils/image';
import { formatDate } from '../../utils/format';
import Avatar from '../common/Avatar';
import PostComments from './PostComments';
import PostLikesModal from './PostLikesModal';
import AuthPromptModal from '../auth/AuthPromptModal';
import {
  MoreHorizontal,
  Trash2,
  Edit,
  Calendar,
  Heart,
  MessageSquare,
  Share2,
} from 'lucide-react';

export interface PostCardProps {
  post: Post;
  author?: User | FollowUserItem | null;
  onDeleteClick?: (postId: string) => void;
  onEditClick?: (postId: string) => void;
  showActions?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  author,
  onDeleteClick,
  onEditClick,
  showActions = true,
}) => {
  const { isAuthenticated, user } = useAuth();
  const isAuthorCurrentUser = user?.id === post.user_id;

  const [postAuthor, setPostAuthor] = useState<User | FollowUserItem | null>(
    author || (isAuthorCurrentUser ? user : usersApi.getCachedUser(post.user_id)) || null
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [isLiked, setIsLiked] = useState<boolean>(post.is_liked || false);
  const [likeCount, setLikeCount] = useState<number>(post.like_count || 0);
  const [commentCount, setCommentCount] = useState<number>(post.comment_count || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [authPromptMessage, setAuthPromptMessage] = useState<string | null>(null);

  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  // Load author asynchronously if not cached yet
  useEffect(() => {
    if (author) {
      setPostAuthor(author);
      return;
    }
    if (isAuthorCurrentUser && user) {
      setPostAuthor(user);
      return;
    }

    const cached = usersApi.getCachedUser(post.user_id);
    if (cached) {
      setPostAuthor(cached);
      return;
    }

    let isMounted = true;
    usersApi.getUser(post.user_id).then((resolvedUser) => {
      if (isMounted && resolvedUser) {
        setPostAuthor(resolvedUser);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [author, isAuthorCurrentUser, post.user_id, user]);

  const imageUrl = resolveImageUrl(post.image_url);

  const authorDisplayName =
    postAuthor?.profile?.full_name ||
    postAuthor?.username ||
    (isAuthorCurrentUser ? user?.profile?.full_name || user?.username : 'User');

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
    } else {
      navigate(`/profile/${post.user_id}`);
    }
  };

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setAuthPromptMessage('Please log in first to like this post.');
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    const previousLiked = isLiked;
    const previousCount = likeCount;

    // Optimistic UI update
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
      // Revert on failure
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
      const msg = parseApiError(err);
      toastError(msg);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const postUrl = `${window.location.origin}/posts/${post.id}`;

    try {
      // Record share on backend
      await postsApi.sharePost(post.id).catch(() => null);

      // Attempt native share or fallback to copy
      if (navigator.share && navigator.canShare && navigator.canShare({ url: postUrl })) {
        await navigator.share({
          title: post.title,
          text: post.caption || post.title,
          url: postUrl,
        });
      } else {
        await navigator.clipboard.writeText(postUrl);
        success('Post link copied to clipboard!');
      }
    } catch (err: unknown) {
      try {
        await navigator.clipboard.writeText(postUrl);
        success('Post link copied to clipboard!');
      } catch {
        const msg = parseApiError(err);
        toastError(msg);
      }
    }
  };

  return (
    <article className="w-full bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-lg transition-all duration-200 hover:border-zinc-700">
      {/* Header with author info & actions */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-zinc-900">
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
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white group-hover:text-zinc-200 transition-colors">
                {authorDisplayName}
              </span>
              {authorUsername && (
                <span className="text-xs font-mono text-zinc-400 group-hover:text-zinc-300 transition-colors">
                  @{authorUsername}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
              <Calendar className="w-3 h-3 text-zinc-400" />
              <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
              {post.updated_at !== post.created_at && (
                <span className="text-[10px] text-zinc-400">(edited)</span>
              )}
            </div>
          </div>
        </div>

        {showActions && (onEditClick || onDeleteClick) && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors focus:outline-none focus:ring-1 focus:ring-white"
              aria-label="Post actions"
              aria-expanded={menuOpen}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-36 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                  {onEditClick && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onEditClick(post.id);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-zinc-200 hover:text-white hover:bg-zinc-900 flex items-center gap-2 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5 text-zinc-400" />
                      Edit Post
                    </button>
                  )}
                  {onDeleteClick && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onDeleteClick(post.id);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
                      Delete Post
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="p-4 sm:p-5 space-y-3">
        <Link
          to={`/posts/${post.id}`}
          className="block group focus:outline-none"
        >
          <h2 className="text-lg sm:text-xl font-bold text-white group-hover:text-zinc-300 transition-colors">
            {post.title}
          </h2>
        </Link>

        {post.caption && (
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
            {post.caption}
          </p>
        )}
      </div>

      {/* Attached Image */}
      {imageUrl && (
        <div className="w-full bg-zinc-900 overflow-hidden border-t border-zinc-900">
          <Link to={`/posts/${post.id}`} className="block overflow-hidden">
            <img
              src={imageUrl}
              alt={post.title}
              className="w-full max-h-[500px] object-cover hover:scale-[1.01] transition-transform duration-300"
              loading="lazy"
            />
          </Link>
        </div>
      )}

      {/* Post Actions Bar: Like, Likes modal, Comment, Share, Details */}
      <div className="px-4 py-3 sm:px-5 bg-zinc-950/80 border-t border-zinc-900 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
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

          {/* Comment button */}
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-white rounded p-1 -m-1"
            title="Comments"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="font-mono">{commentCount}</span>
          </button>

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

        {/* View details link */}
        <Link
          to={`/posts/${post.id}`}
          className="font-medium text-zinc-400 hover:text-white transition-colors focus:outline-none focus:underline"
        >
          View details →
        </Link>
      </div>

      {/* Expandable Comments Section */}
      {showComments && (
        <div className="px-4 pb-4 sm:px-5">
          <PostComments
            postId={post.id}
            onCommentAdded={() => setCommentCount((c) => c + 1)}
          />
        </div>
      )}

      {/* Post Likes Modal */}
      <PostLikesModal
        postId={post.id}
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
      />

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={!!authPromptMessage}
        message={authPromptMessage || ''}
        onClose={() => setAuthPromptMessage(null)}
      />
    </article>
  );
};

export default PostCard;
