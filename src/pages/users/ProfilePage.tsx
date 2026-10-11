import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { postsApi } from '../../api/posts.api';
import { usersApi } from '../../api/users.api';
import type { PostListResponse } from '../../types/post';
import type { User, FollowUserItem } from '../../types/user';
import { useToast } from '../../hooks/useToast';
import { parseApiError } from '../../utils/error';
import ProfileHeader from '../../components/users/ProfileHeader';
import EditProfileModal from '../../components/users/EditProfileModal';
import FollowListModal from '../../components/users/FollowListModal';
import AuthPromptModal from '../../components/auth/AuthPromptModal';
import PostCard from '../../components/posts/PostCard';
import DeletePostModal from '../../components/posts/DeletePostModal';
import { ProfileSkeleton, PostListSkeleton } from '../../components/common/Skeleton';
import Button from '../../components/common/Button';
import {
  PlusCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();

  const isOwnProfile = !id || id === user?.id;
  const targetUserId = id || user?.id;

  // If attempting to visit own profile (/profile) while logged out, redirect to login
  useEffect(() => {
    if (!id && !isAuthenticated && !isAuthLoading) {
      navigate('/login');
    }
  }, [id, isAuthenticated, isAuthLoading, navigate]);

  const [targetUser, setTargetUser] = useState<User | FollowUserItem | null>(
    isOwnProfile ? user : (targetUserId ? usersApi.getCachedUser(targetUserId) || null : null)
  );

  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(!isOwnProfile);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [postsResponse, setPostsResponse] = useState<PostListResponse | null>(null);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Follower / Following states
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [followModalType, setFollowModalType] = useState<'followers' | 'following' | null>(null);
  const [authPromptMessage, setAuthPromptMessage] = useState<string | null>(null);

  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);


  // Load target user profile and follow data
  useEffect(() => {
    let isCancelled = false;
    if (!targetUserId) return;

    if (isOwnProfile && user) {
      setTargetUser(user);
      setIsLoadingProfile(false);
      setProfileError(null);
    }

    const loadProfileData = async () => {
      if (!isOwnProfile) {
        setIsLoadingProfile(true);
        setProfileError(null);
      }

      try {
        const resolvedUser = await usersApi.getUser(targetUserId);

        if (!isCancelled) {
          if (resolvedUser) {
            setTargetUser(resolvedUser);

            const userWithStats = resolvedUser as {
              follower_count?: number;
              following_count?: number;
              is_following?: boolean;
            };

            if (typeof userWithStats.follower_count === 'number') {
              setFollowerCount(userWithStats.follower_count);
            }
            if (typeof userWithStats.following_count === 'number') {
              setFollowingCount(userWithStats.following_count);
            }
            if (typeof userWithStats.is_following === 'boolean') {
              setIsFollowing(userWithStats.is_following);
            }
          } else if (!isOwnProfile) {
            // Construct basic profile with id
            setTargetUser({
              id: targetUserId,
              username: 'User',
              profile: null,
            });
          }
        }
      } catch (err: unknown) {
        if (!isCancelled && !isOwnProfile) {
          const msg = parseApiError(err);
          setProfileError(msg);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingProfile(false);
        }
      }
    };

    loadProfileData();

    return () => {
      isCancelled = true;
    };
  }, [targetUserId, isOwnProfile, user]);


  // Load posts for target user
  useEffect(() => {
    let isCancelled = false;
    if (!targetUserId) return;

    const loadPosts = async () => {
      setIsLoadingPosts(true);
      try {
        const data = await postsApi.getUserPosts(targetUserId, currentPage, 10);
        if (!isCancelled) {
          setPostsResponse(data);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          const msg = parseApiError(err);
          toastError(msg);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingPosts(false);
        }
      }
    };

    loadPosts();

    return () => {
      isCancelled = true;
    };
  }, [targetUserId, currentPage, toastError]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      setAuthPromptMessage('Please log in first to follow this user.');
      return;
    }
    if (!targetUserId || isOwnProfile || isFollowLoading) return;

    setIsFollowLoading(true);
    const previousIsFollowing = isFollowing;
    const previousFollowerCount = followerCount;

    // Optimistic UI update
    setIsFollowing(!previousIsFollowing);
    setFollowerCount(
      previousIsFollowing ? Math.max(0, previousFollowerCount - 1) : previousFollowerCount + 1
    );

    try {
      if (previousIsFollowing) {
        const res = await usersApi.unfollowUser(targetUserId);
        setIsFollowing(res.is_following);
        setFollowerCount(res.follower_count);
        setFollowingCount(res.following_count);
        toastSuccess('Unfollowed successfully');
      } else {
        const res = await usersApi.followUser(targetUserId);
        setIsFollowing(res.is_following);
        setFollowerCount(res.follower_count);
        setFollowingCount(res.following_count);
        toastSuccess('Following user');
      }
    } catch (err: unknown) {
      setIsFollowing(previousIsFollowing);
      setFollowerCount(previousFollowerCount);
      const msg = parseApiError(err);
      toastError(msg);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleOpenDelete = (postId: string) => {
    setDeletingPostId(postId);
    setIsDeleteModalOpen(true);
  };

  const handlePostDeleted = (deletedId: string) => {
    setPostsResponse((prev) => {
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

  if (isAuthLoading || (isLoadingProfile && !targetUser)) {
    return (
      <div className="space-y-8">
        <ProfileSkeleton />
        <div className="space-y-4 pt-4">
          <div className="h-6 w-32 bg-zinc-900 rounded animate-pulse" />
          <PostListSkeleton count={2} />
        </div>
      </div>
    );
  }

  if (profileError || (!targetUser && !isOwnProfile)) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 w-fit mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">User Profile Not Found</h2>
        <p className="text-xs text-zinc-400">
          {profileError || 'The user profile you are looking for does not exist or is unavailable.'}
        </p>
        <div className="pt-2">
          <Link to="/">
            <Button variant="primary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Feed
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const posts = postsResponse?.items || [];
  const totalPages = postsResponse?.pages || 1;

  const displayUser: User = {
    id: targetUser?.id || targetUserId || '',
    username: targetUser?.username || 'User',
    email: isOwnProfile && user ? user.email : '',
    is_active: true,
    created_at: isOwnProfile && user ? user.created_at : '',
    profile: targetUser?.profile || null,
  };

  return (
    <div className="space-y-6">
      {/* Twitter-style Sticky Top Header with Back button and user post count */}
      <div className="sticky top-0 z-30 bg-black/85 backdrop-blur-md px-4 py-2 border-b border-zinc-900 flex items-center gap-5 -mx-4 sm:-mx-6 -mt-6 mb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-zinc-900 text-zinc-300 hover:text-white transition-colors"
          title="Back"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
            {displayUser.profile?.full_name || displayUser.username}
          </h2>
          <p className="text-xs text-zinc-500 font-mono">
            {postsResponse?.total ?? 0} {postsResponse?.total === 1 ? 'post' : 'posts'}
          </p>
        </div>
      </div>

      {/* Profile Header */}
      <ProfileHeader

        user={displayUser}
        isOwnProfile={isOwnProfile}
        followerCount={followerCount}
        followingCount={followingCount}
        isFollowing={isFollowing}
        isFollowLoading={isFollowLoading}
        onFollowToggle={handleFollowToggle}
        onFollowersClick={() => {
          if (!isAuthenticated) {
            setAuthPromptMessage('Please log in or register to view followers.');
            return;
          }
          setFollowModalType('followers');
        }}
        onFollowingClick={() => {
          if (!isAuthenticated) {
            setAuthPromptMessage('Please log in or register to view following list.');
            return;
          }
          setFollowModalType('following');
        }}
        onEditClick={isOwnProfile ? () => setIsEditProfileOpen(true) : undefined}
      />


      {/* Posts Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-zinc-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              {isOwnProfile ? 'My Posts' : `${displayUser.username}'s Posts`}
            </h2>
            {postsResponse && (
              <span className="text-xs font-mono bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-800">
                {postsResponse.total}
              </span>
            )}
          </div>

          {isOwnProfile && (
            <Link to="/posts/create">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
              >
                New Post
              </Button>
            </Link>
          )}
        </div>

        {/* Posts List */}
        {isLoadingPosts ? (
          <PostListSkeleton count={3} />
        ) : posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                author={displayUser}
                onDeleteClick={isOwnProfile ? handleOpenDelete : undefined}
                onEditClick={isOwnProfile ? handleEditPost : undefined}
                showActions={isOwnProfile}
              />
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-zinc-900">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage <= 1 || isLoadingPosts}
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
                  disabled={currentPage >= totalPages || isLoadingPosts}
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
              <UserIcon className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-white">No posts yet</h3>
            <p className="text-xs text-zinc-400 max-w-sm mt-1 mb-5">
              {isOwnProfile
                ? 'Share your insights, progress, or code snippets with the community.'
                : 'This user has not published any posts yet.'}
            </p>
            {isOwnProfile && (
              <Link to="/posts/create">
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<PlusCircle className="w-4 h-4" />}
                >
                  Create your first post
                </Button>
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Edit Profile Modal */}
      {user && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          user={user}
        />
      )}

      {/* Follow List Modal */}
      <FollowListModal
        userId={targetUserId || null}
        type={followModalType || 'followers'}
        isOpen={followModalType !== null}
        onClose={() => setFollowModalType(null)}
      />

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

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={!!authPromptMessage}
        message={authPromptMessage || ''}
        onClose={() => setAuthPromptMessage(null)}
      />
    </div>
  );
};

export default ProfilePage;
