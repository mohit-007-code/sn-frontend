import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import { LogIn, UserPlus, Sparkles, ShieldCheck } from 'lucide-react';


export const RightSidebar: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <aside className="w-full space-y-5 sticky top-6">
      {/* 1. Primary Card: Log in / Sign up box for Guests, or User Status for Authenticated */}
      {!isAuthenticated ? (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div>
            <h3 className="text-lg font-extrabold text-white tracking-tight">
              Log in or sign up
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              See what’s happening and join the conversation.
            </p>
          </div>

          <div className="space-y-2.5">
            <Link to="/register" className="block">
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center font-bold text-xs"
                leftIcon={<UserPlus className="w-4 h-4" />}
              >
                Create Account
              </Button>
            </Link>

            <Link to="/login" className="block">
              <Button
                variant="outline"
                size="md"
                className="w-full justify-center font-bold text-xs"
                leftIcon={<LogIn className="w-4 h-4" />}
              >
                Log In
              </Button>
            </Link>
          </div>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
              <span className="bg-zinc-950 px-2 text-zinc-500">Why register?</span>
            </div>
          </div>

          <ul className="text-xs text-zinc-400 space-y-2.5">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold text-xs mt-0.5">✓</span>
              <span>Follow creators & see a personalized feed</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold text-xs mt-0.5">✓</span>
              <span>Like, comment, and engage with posts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold text-xs mt-0.5">✓</span>
              <span>Share your own posts, photos, and updates</span>
            </li>
          </ul>

          <div className="text-[11px] text-zinc-500 pt-2 border-t border-zinc-900 leading-relaxed">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      ) : (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <Avatar
              src={user?.profile?.profile_photo_url}
              name={user?.profile?.full_name || user?.username}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">
                {user?.profile?.full_name || user?.username}
              </p>
              <p className="text-xs text-zinc-400 font-mono truncate">
                @{user?.username}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Authenticated Session
            </span>
            <Link
              to="/profile"
              className="text-zinc-300 hover:text-white font-medium hover:underline"
            >
              My Profile →
            </Link>
          </div>
        </div>
      )}

      {/* 2. Secondary Card: Community Information / Explore */}
      <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4 space-y-3 text-xs">
        <div className="flex items-center gap-1.5 text-zinc-300 font-bold text-sm">
          <Sparkles className="w-4 h-4 text-white" />
          <span>Explore SN Community</span>
        </div>
        <p className="text-zinc-400 leading-relaxed">
          Discover insights, posts, and real-time updates from creators across the platform.
        </p>
        <div className="pt-2 border-t border-zinc-900/80 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-zinc-600">
          <Link to="/" className="hover:text-zinc-400 transition-colors">About</Link>
          <Link to="/" className="hover:text-zinc-400 transition-colors">Privacy</Link>
          <Link to="/" className="hover:text-zinc-400 transition-colors">Terms</Link>
          <span>© 2026 SN Platform</span>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
