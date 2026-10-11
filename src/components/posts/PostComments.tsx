import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsApi } from '../../api/posts.api';
import { usersApi } from '../../api/users.api';
import type { Comment } from '../../types/post';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { parseApiError } from '../../utils/error';
import { formatDate } from '../../utils/format';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import AuthPromptModal from '../auth/AuthPromptModal';
import { Skeleton } from '../common/Skeleton';
import { Send, MessageSquare, CornerDownRight, RefreshCw } from 'lucide-react';

export interface PostCommentsProps {
  postId: string;
  onCommentAdded?: () => void;
}

export const PostComments: React.FC<PostCommentsProps> = ({
  postId,
  onCommentAdded,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentReplies, setCommentReplies] = useState<Record<string, Comment[]>>({});
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [authPromptMessage, setAuthPromptMessage] = useState<string | null>(null);

  const { isAuthenticated, user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let isCancelled = false;
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        const data = await postsApi.getPostComments(postId, page, 20);
        if (!isCancelled) {
          setComments((prev) => (page === 1 ? data.items : [...prev, ...data.items]));
          setHasNext(data.has_next);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          const msg = parseApiError(err);
          toastError(msg);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchComments();

    return () => {
      isCancelled = true;
    };
  }, [postId, page, toastError]);

  const handleAuthorClick = (authorId: string) => {
    if (authorId === user?.id) {
      navigate('/profile');
    } else {
      navigate(`/profile/${authorId}`);
    }
  };


  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setAuthPromptMessage('Please log in first to comment.');
      return;
    }

    if (!newCommentText.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await postsApi.createComment(postId, newCommentText.trim());
      if (created.user) {
        usersApi.registerCachedUser(created.user);
      }
      setComments((prev) => [created, ...prev]);
      setNewCommentText('');
      success('Comment posted');
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (err: unknown) {
      const msg = parseApiError(err);
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplyClick = (comment: Comment) => {
    if (!isAuthenticated) {
      setAuthPromptMessage('Please log in first to reply to this comment.');
      return;
    }
    if (replyingToCommentId === comment.id) {
      setReplyingToCommentId(null);
      setReplyText('');
    } else {
      setReplyingToCommentId(comment.id);
      setReplyText('');
    }
  };

  const handleCreateReply = async (e: React.FormEvent, parentComment: Comment) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setAuthPromptMessage('Please log in first to reply to this comment.');
      return;
    }

    if (!replyText.trim()) return;

    setIsSubmittingReply(true);
    try {
      const authorTag = parentComment.user?.username
        ? `@${parentComment.user.username} `
        : '';
      const textToSend = replyText.startsWith('@')
        ? replyText.trim()
        : `${authorTag}${replyText.trim()}`;

      const createdReply = await postsApi.createComment(postId, textToSend);
      if (createdReply.user) {
        usersApi.registerCachedUser(createdReply.user);
      }

      setCommentReplies((prev) => ({
        ...prev,
        [parentComment.id]: [...(prev[parentComment.id] || []), createdReply],
      }));

      setReplyingToCommentId(null);
      setReplyText('');
      success('Reply posted');
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (err: unknown) {
      const msg = parseApiError(err);
      toastError(msg);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div className="pt-4 border-t border-zinc-900 space-y-4">
      {/* Comment Input */}
      <form onSubmit={handleCreateComment} className="flex items-center gap-2">
        <div className="shrink-0">
          <Avatar
            src={isAuthenticated ? user?.profile?.profile_photo_url : null}
            name={isAuthenticated ? user?.profile?.full_name || user?.username : 'Guest'}
            size="sm"
          />
        </div>

        <div className="relative flex-1">
          <input
            type="text"
            placeholder={
              isAuthenticated
                ? 'Write a comment...'
                : 'Log in to write a comment...'
            }
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            disabled={isSubmitting}
            onClick={() => {
              if (!isAuthenticated) {
                setAuthPromptMessage('Please log in first to comment.');
              }
            }}
            className="w-full h-9 px-3.5 pr-10 bg-zinc-900/80 text-white placeholder-zinc-500 text-xs rounded-lg border border-zinc-800 hover:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-white transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newCommentText.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-white"
            aria-label="Send comment"
          >
            {isSubmitting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3 pt-1">
        {isLoading && page === 1 ? (
          <div className="space-y-2 py-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="w-24 h-3.5 rounded" />
                  <Skeleton className="w-full h-3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-3">
            {comments.map((comment) => {
              const commentAuthorName =
                comment.user?.profile?.full_name || comment.user?.username || 'User';
              const commentAuthorUsername = comment.user?.username || '';
              const replies = commentReplies[comment.id] || [];

              return (
                <div key={comment.id} className="space-y-2">
                  <div className="flex items-start gap-2.5 group">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => handleAuthorClick(comment.user_id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleAuthorClick(comment.user_id);
                        }
                      }}
                      className="cursor-pointer shrink-0 mt-0.5 focus:outline-none focus:ring-1 focus:ring-white rounded-full"
                    >
                      <Avatar
                        src={comment.user?.profile?.profile_photo_url}
                        name={commentAuthorName}
                        size="xs"
                      />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-2.5 text-xs">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <button
                            type="button"
                            onClick={() => handleAuthorClick(comment.user_id)}
                            className="font-semibold text-white hover:underline focus:outline-none"
                          >
                            {commentAuthorName}
                          </button>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-zinc-300 whitespace-pre-line leading-relaxed">
                          {comment.text}
                        </p>
                      </div>

                      {/* Comment Actions: Reply button */}
                      <div className="flex items-center gap-3 px-1">
                        <button
                          type="button"
                          onClick={() => handleReplyClick(comment)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 hover:text-white transition-colors focus:outline-none focus:underline"
                        >
                          <CornerDownRight className="w-3 h-3 text-zinc-500" />
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Inline Reply Input for this comment */}
                  {replyingToCommentId === comment.id && (
                    <div className="ml-8 pl-3 border-l-2 border-zinc-800 space-y-2 py-1">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span className="flex items-center gap-1">
                          <CornerDownRight className="w-3 h-3 text-zinc-500" />
                          Replying to{' '}
                          <span className="text-white font-medium">
                            {commentAuthorUsername ? `@${commentAuthorUsername}` : commentAuthorName}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingToCommentId(null);
                            setReplyText('');
                          }}
                          className="text-zinc-500 hover:text-zinc-300 text-[10px] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>

                      <form
                        onSubmit={(e) => handleCreateReply(e, comment)}
                        className="flex items-center gap-2"
                      >
                        <div className="shrink-0">
                          <Avatar
                            src={isAuthenticated ? user?.profile?.profile_photo_url : null}
                            name={isAuthenticated ? user?.profile?.full_name || user?.username : 'User'}
                            size="xs"
                          />
                        </div>

                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder={
                              commentAuthorUsername
                                ? `Write a reply to @${commentAuthorUsername}...`
                                : 'Write a reply...'
                            }
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            disabled={isSubmittingReply}
                            autoFocus
                            className="w-full h-8 px-3 pr-9 bg-zinc-900 text-white placeholder-zinc-500 text-xs rounded-lg border border-zinc-800 hover:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-white transition-all disabled:opacity-50"
                          />
                          <button
                            type="submit"
                            disabled={isSubmittingReply || !replyText.trim()}
                            className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-white"
                            aria-label="Send reply"
                          >
                            {isSubmittingReply ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Nested Replies List */}
                  {replies.length > 0 && (
                    <div className="ml-8 pl-3 border-l-2 border-zinc-800/80 space-y-2.5 pt-1">
                      {replies.map((reply) => {
                        const replyAuthorName =
                          reply.user?.profile?.full_name || reply.user?.username || 'User';

                        return (
                          <div key={reply.id} className="flex items-start gap-2 group/reply">
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => handleAuthorClick(reply.user_id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  handleAuthorClick(reply.user_id);
                                }
                              }}
                              className="cursor-pointer shrink-0 mt-0.5 focus:outline-none focus:ring-1 focus:ring-white rounded-full"
                            >
                              <Avatar
                                src={reply.user?.profile?.profile_photo_url}
                                name={replyAuthorName}
                                size="xs"
                              />
                            </div>

                            <div className="flex-1 bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-2 text-xs">
                              <div className="flex items-center justify-between gap-2 mb-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleAuthorClick(reply.user_id)}
                                  className="font-semibold text-white hover:underline focus:outline-none text-[11px]"
                                >
                                  {replyAuthorName}
                                </button>
                                <span className="text-[10px] font-mono text-zinc-500">
                                  {formatDate(reply.created_at)}
                                </span>
                              </div>
                              <p className="text-zinc-300 whitespace-pre-line leading-relaxed text-[11px]">
                                {reply.text}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {hasNext && (
              <div className="text-center pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={isLoading}
                  isLoading={isLoading}
                  className="text-xs h-7"
                >
                  Load More Comments
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-3 text-center text-zinc-500 text-xs flex items-center justify-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>No comments yet.</span>
          </div>
        )}
      </div>

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={!!authPromptMessage}
        message={authPromptMessage || ''}
        onClose={() => setAuthPromptMessage(null)}
      />
    </div>
  );
};

export default PostComments;
