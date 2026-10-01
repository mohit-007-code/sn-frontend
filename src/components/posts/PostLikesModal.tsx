import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsApi } from '../../api/posts.api';
import type { LikeUserItem, PostLikesListResponse } from '../../types/post';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { parseApiError } from '../../utils/error';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { Skeleton } from '../common/Skeleton';
import { Heart, ChevronRight } from 'lucide-react';

export interface PostLikesModalProps {
  postId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PostLikesModal: React.FC<PostLikesModalProps> = ({
  postId,
  isOpen,
  onClose,
}) => {
  const [likesData, setLikesData] = useState<PostLikesListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

  const { isAuthenticated, user } = useAuth();
  const { info, error: toastError } = useToast();
  const navigate = useNavigate();

  const handleClose = () => {
    setLikesData(null);
    setPage(1);
    onClose();
  };

  useEffect(() => {
    if (!isOpen || !postId) {
      return;
    }

    let isCancelled = false;
    const fetchLikes = async () => {
      setIsLoading(true);
      try {
        const data = await postsApi.getPostLikes(postId, page, 20);
        if (!isCancelled) {
          setLikesData((prev) => {
            if (page === 1 || !prev) return data;
            return {
              ...data,
              items: [...prev.items, ...data.items],
            };
          });
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

    fetchLikes();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, postId, page, toastError]);

  const handleUserClick = (targetUser: LikeUserItem) => {
    if (!isAuthenticated) {
      info('Please log in to view profiles.');
      handleClose();
      navigate('/login');
      return;
    }

    handleClose();
    if (targetUser.id === user?.id) {
      navigate('/profile');
    } else {
      navigate(`/profile/${targetUser.id}`);
    }
  };

  const users = likesData?.items || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Liked by"
      description={`${likesData?.total ?? 0} ${likesData?.total === 1 ? 'person' : 'people'} liked this post`}
      maxWidth="sm"
    >
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {isLoading && page === 1 ? (
          <div className="space-y-3 py-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="w-28 h-4 rounded" />
                  <Skeleton className="w-20 h-3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : users.length > 0 ? (
          <div className="space-y-2">
            {users.map((item) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => handleUserClick(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleUserClick(item);
                  }
                }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer group focus:outline-none focus:ring-1 focus:ring-white"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    src={item.profile?.profile_photo_url}
                    name={item.profile?.full_name || item.username}
                    size="md"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-zinc-200">
                      {item.profile?.full_name || item.username}
                    </p>
                    <p className="text-xs font-mono text-zinc-400 truncate">
                      @{item.username}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 shrink-0" />
              </div>
            ))}

            {likesData?.has_next && (
              <div className="pt-2 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={isLoading}
                  isLoading={isLoading}
                >
                  Load More
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center space-y-2">
            <div className="p-3 rounded-full bg-zinc-900 text-zinc-500 w-fit mx-auto border border-zinc-800">
              <Heart className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-zinc-300">No likes yet</p>
            <p className="text-xs text-zinc-500">Be the first to like this post.</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PostLikesModal;
