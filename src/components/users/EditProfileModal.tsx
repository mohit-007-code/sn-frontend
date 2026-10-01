import React, { useState, useRef } from 'react';
import type { User } from '../../types/user';
import { usersApi } from '../../api/users.api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { parseApiError } from '../../utils/error';
import { validateImageFile, resolveImageUrl } from '../../utils/image';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import { Camera, Image as ImageIcon, X } from 'lucide-react';

export interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [fullName, setFullName] = useState(user.profile?.full_name || '');
  const [bio, setBio] = useState(user.profile?.bio || '');
  
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);

  const [bannerPhotoFile, setBannerPhotoFile] = useState<File | null>(null);
  const [bannerPhotoPreview, setBannerPhotoPreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ full_name?: string; bio?: string; general?: string }>({});

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const { refreshUser } = useAuth();
  const toast = useToast();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid profile photo');
      return;
    }

    setProfilePhotoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setProfilePhotoPreview(objectUrl);
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid banner image');
      return;
    }

    setBannerPhotoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setBannerPhotoPreview(objectUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      await usersApi.updateMe({
        full_name: fullName.trim() || null,
        bio: bio.trim() || null,
        profile_photo: profilePhotoFile || undefined,
        banner_photo: bannerPhotoFile || undefined,
      });

      await refreshUser();
      toast.success('Profile updated successfully');
      onClose();
    } catch (err: unknown) {
      const msg = parseApiError(err);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeBannerSrc = bannerPhotoPreview || resolveImageUrl(user.profile?.banner_photo_url);
  const activeAvatarSrc = profilePhotoPreview || user.profile?.profile_photo_url;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profile"
      description="Update your display name, bio, and visual branding."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banner upload section */}
        <div className="space-y-2">
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
            Banner Photo
          </label>
          <div className="relative w-full h-32 bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 group">
            {activeBannerSrc ? (
              <img
                src={activeBannerSrc}
                alt="Banner preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600">
                <ImageIcon className="w-8 h-8" />
              </div>
            )}

            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="p-2 bg-zinc-950/80 text-white rounded-lg hover:bg-zinc-900 text-xs font-medium border border-zinc-700 flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-white"
              >
                <Camera className="w-3.5 h-3.5" />
                Change Banner
              </button>
              {bannerPhotoPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setBannerPhotoFile(null);
                    setBannerPhotoPreview(null);
                  }}
                  className="p-2 bg-zinc-950/80 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 border border-zinc-700"
                  aria-label="Remove pending banner preview"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleBannerChange}
            />
          </div>
        </div>

        {/* Profile photo upload */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Avatar
              src={activeAvatarSrc}
              name={fullName || user.username}
              size="xl"
              className="ring-2 ring-zinc-800"
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              aria-label="Change profile photo"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-white">Profile Photo</h4>
            <p className="text-xs text-zinc-400">
              Recommended JPG, PNG or WebP. Max 5MB.
            </p>
            {profilePhotoPreview && (
              <button
                type="button"
                onClick={() => {
                  setProfilePhotoFile(null);
                  setProfilePhotoPreview(null);
                }}
                className="text-xs text-zinc-400 hover:text-white underline pt-1 block"
              >
                Reset photo
              </button>
            )}
          </div>
        </div>

        {/* Text Fields */}
        <div className="space-y-4">
          <Input
            label="Display Name"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={errors.full_name}
            disabled={isSubmitting}
          />

          <Textarea
            label="Bio"
            rows={3}
            placeholder="Tell the community about yourself, your projects, or your interests..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            error={errors.bio}
            disabled={isSubmitting}
            helperText="Maximum 500 characters"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/80">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;
