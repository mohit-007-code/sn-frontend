import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Input from '../common/Input';
import Button from '../common/Button';

export interface LoginFormProps {
  isModal?: boolean;
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  isModal = false,
  onSuccess,
}) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ usernameOrEmail?: string; password?: string; general?: string }>({});

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const validate = () => {
    const newErrors: { usernameOrEmail?: string; password?: string } = {};

    if (!usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = 'Username or email is required';
    } else if (usernameOrEmail.trim().length < 3) {
      newErrors.usernameOrEmail = 'Must be at least 3 characters';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login({
        username_or_email: usernameOrEmail.trim(),
        password,
      });
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <>
      {!isModal && (
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Sign In
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Enter your credentials to access your SN account.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Input
          label="Username or Email"
          type="text"
          name="username_or_email"
          autoComplete="username"
          placeholder="developer or dev@example.com"
          value={usernameOrEmail}
          onChange={(e) => {
            setUsernameOrEmail(e.target.value);
            if (errors.usernameOrEmail) {
              setErrors((prev) => ({ ...prev, usernameOrEmail: undefined }));
            }
          }}
          error={errors.usernameOrEmail}
          leftIcon={<UserIcon className="w-4 h-4" />}
          required
          disabled={isSubmitting}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) {
              setErrors((prev) => ({ ...prev, password: undefined }));
            }
          }}
          error={errors.password}
          leftIcon={<Lock className="w-4 h-4" />}
          required
          disabled={isSubmitting}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-zinc-900 text-center">
        <p className="text-xs text-zinc-400">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-white hover:underline focus:outline-none focus:ring-1 focus:ring-white rounded px-1"
          >
            Create account
          </Link>
        </p>
      </div>
    </>
  );

  if (isModal) {
    return <div className="w-full">{formContent}</div>;
  }

  return (
    <div className="w-full max-w-md p-8 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl">
      {formContent}
    </div>
  );
};

export default LoginForm;
