import React, { useState } from 'react';
import ConfirmationModal from '../common/ConfirmationModal';
import { postsApi } from '../../api/posts.api';
import { useToast } from '../../hooks/useToast';
import { parseApiError } from '../../utils/error';

export interface DeletePostModalProps {
  postId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: (postId: string) => void;
}

export const DeletePostModal: React.FC<DeletePostModalProps> = ({
  postId,
  isOpen,
  onClose,
  onDeleted,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  const handleConfirmDelete = async () => {
    if (!postId) return;

    setIsDeleting(true);
    try {
      await postsApi.deletePost(postId);
      toast.success('Post deleted successfully');
      onDeleted(postId);
      onClose();
    } catch (err: unknown) {
      const msg = parseApiError(err);
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirmDelete}
      title="Delete this post?"
      message="This action cannot be undone."
      confirmText="Delete Post"
      cancelText="Cancel"
      isLoading={isDeleting}
    />
  );
};

export default DeletePostModal;
