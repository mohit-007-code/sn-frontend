import React, { useState } from 'react';
import { adminApi } from '../../api/admin.api';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/common/Button';
import { UserPlus, ShieldCheck, KeyRound, Mail, User } from 'lucide-react';

export const AdminCreateAdminPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !email.trim() || !password.trim()) {
      toast.error('All fields are required');
      return;
    }

    if (password.length < 6) {
      toast.error('Password should be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await adminApi.createAdmin({
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
      });
      toast.success(`Admin @${username} created successfully!`);
      setUsername('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-800">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-amber-400" />
          Create Admin Account
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Provision a new administrator user with full administrative privileges
        </p>
      </div>

      {/* Form Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-6">
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
          <div>
            <strong className="font-semibold block text-amber-200 mb-0.5">
              Superadmin Privileges
            </strong>
            Users created here can delete accounts, moderate all posts and comments, and access dashboard metrics. You can also create admins via terminal CLI using{' '}
            <code className="text-amber-300 font-mono bg-black/40 px-1 py-0.5 rounded">
              python create_admin.py
            </code>
            .
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 font-mono">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin_moderator"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-amber-400 focus:outline-none rounded-xl text-sm text-white placeholder-zinc-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 font-mono">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. moderator@platform.net"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-amber-400 focus:outline-none rounded-xl text-sm text-white placeholder-zinc-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 font-mono">
              Admin Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-amber-400 focus:outline-none rounded-xl text-sm text-white placeholder-zinc-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3 rounded-xl transition-all shadow-md shadow-amber-500/20"
            >
              {loading ? 'Creating Admin...' : 'Create Admin Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateAdminPage;
