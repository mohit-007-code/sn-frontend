import React, { useState } from 'react';
import type { User } from '../../types/user';
import { resolveImageUrl } from '../../utils/image';
import { formatDate } from '../../utils/format';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { Calendar, Mail, Edit3, UserPlus, UserCheck, UserMinus } from 'lucide-react';

export interface ProfileHeaderProps {
  user: User;
  isOwnProfile?: boolean;
  followerCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  isFollowLoading?: boolean;
  onFollowToggle?: () => void;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
  onEditClick?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isOwnProfile = true,
  followerCount = 0,
  followingCount = 0,
  isFollowing = false,
  isFollowLoading = false,
  onFollowToggle,
  onFollowersClick,
  onFollowingClick,
  onEditClick,
}) => {
  const [isHoveringFollow, setIsHoveringFollow] = useState(false);
  const bannerUrl = resolveImageUrl(user.profile?.banner_photo_url);
  const fullName = user.profile?.full_name;
  const bio = user.profile?.bio;

  return (
    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Banner */}
      <div className="w-full h-44 sm:h-56 bg-zinc-900 relative overflow-hidden">
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt="Profile banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center opacity-60">
            <div className="w-full h-full bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>
        )}
      </div>

      {/* Main Profile Info Section */}
      <div className="px-6 pb-6 pt-0 relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-4">
          {/* Avatar with thick ring */}
          <div className="p-1 rounded-full bg-zinc-950 inline-block w-fit shadow-lg">
            <Avatar
              src={user.profile?.profile_photo_url}
              name={fullName || user.username}
              size="2xl"
              className="ring-4 ring-zinc-950"
            />
          </div>

          {/* Action Button: Edit Profile or Follow/Unfollow */}
          <div className="self-end sm:self-auto">
            {isOwnProfile ? (
              onEditClick && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onEditClick}
                  leftIcon={<Edit3 className="w-4 h-4" />}
                >
                  Edit Profile
                </Button>
              )
            ) : (
              <Button
                variant={isFollowing ? (isHoveringFollow ? 'danger' : 'outline') : 'primary'}
                size="sm"
                onClick={onFollowToggle}
                disabled={isFollowLoading}
                isLoading={isFollowLoading}
                onMouseEnter={() => setIsHoveringFollow(true)}
                onMouseLeave={() => setIsHoveringFollow(false)}
                leftIcon={
                  isFollowing ? (
                    isHoveringFollow ? (
                      <UserMinus className="w-4 h-4" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )
                }
              >
                {isFollowing ? (isHoveringFollow ? 'Unfollow' : 'Following') : 'Follow'}
              </Button>
            )}
          </div>
        </div>

        {/* User identification */}
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {fullName || user.username}
            </h1>
            <p className="text-sm font-mono text-zinc-400">@{user.username}</p>
          </div>

          {/* Bio if exists */}
          {bio && (
            <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl whitespace-pre-line">
              {bio}
            </p>
          )}

          {/* Followers / Following Counts */}
          <div className="flex items-center gap-6 py-1 text-sm">
            <button
              type="button"
              onClick={onFollowersClick}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors focus:outline-none focus:underline"
            >
              <span className="font-bold text-white font-mono">{followerCount}</span>
              <span>followers</span>
            </button>

            <button
              type="button"
              onClick={onFollowingClick}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors focus:outline-none focus:underline"
            >
              <span className="font-bold text-white font-mono">{followingCount}</span>
              <span>following</span>
            </button>
          </div>

          {/* Metadata chips */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-5 pt-1 text-xs text-zinc-400">
            {isOwnProfile && user.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span>{user.email}</span>
              </div>
            )}


            {user.created_at && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>Joined {formatDate(user.created_at)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
