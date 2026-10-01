import React from 'react';
import Modal from '../common/Modal';
import LoginForm from './LoginForm';

export interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  onSuccess?: () => void;
}

export const AuthPromptModal: React.FC<AuthPromptModalProps> = ({
  isOpen,
  onClose,
  message = 'Please log in to continue.',
  onSuccess,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sign In Required"
      description={message}
      maxWidth="md"
    >
      <div className="pt-2">
        <LoginForm
          isModal
          onSuccess={() => {
            onClose();
            onSuccess?.();
          }}
        />
      </div>
    </Modal>
  );
};

export default AuthPromptModal;
