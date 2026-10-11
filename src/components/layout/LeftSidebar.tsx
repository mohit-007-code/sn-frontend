import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import {
  Sparkles,
  PlusCircle,
  User as UserIcon,
  LogOut,
  LogIn,
  UserPlus,
  Activity,
} from 'lucide-react';

export interface LeftSidebarProps {
  isHealthy: boolean | null;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ isHealthy }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-16 xl:w-64 flex-shrink-0 flex flex-col justify-between h-[calc(100vh-3rem)] sticky top-6 select-none">

      <div className="space-y-6">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 p-2 rounded-2xl hover:bg-zinc-900 transition-colors focus:outline-none focus:ring-1 focus:ring-white w-fit xl:w-full"
        >
          <div className="w-10 h-10 rounded-xl bg-white text-black font-black flex items-center justify-center text-base tracking-tighter shadow-md">
            SN
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white hidden xl:inline-block">
            SN Platform
          </span>
        </Link>

        {/* Primary Navigation Links */}
        <nav className="space-y-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-4 px-3 py-3 rounded-full text-sm font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-white ${
                isActive
                  ? 'bg-zinc-900 text-white font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`
            }
            title="Feed"
          >
            <Sparkles className="w-5 h-5 flex-shrink-0" />
            <span className="hidden xl:inline-block">Home Feed</span>
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink
                to="/posts/create"
                className={({ isActive }) =>
                  `flex items-center gap-4 px-3 py-3 rounded-full text-sm font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-white ${
                    isActive
                      ? 'bg-zinc-900 text-white font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  }`
                }
                title="Create Post"
              >
                <PlusCircle className="w-5 h-5 flex-shrink-0" />
                <span className="hidden xl:inline-block">Create Post</span>
              </NavLink>

              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex items-center gap-4 px-3 py-3 rounded-full text-sm font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-white ${
                    isActive
                      ? 'bg-zinc-900 text-white font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  }`
                }
                title="Profile"
              >
                <UserIcon className="w-5 h-5 flex-shrink-0" />
                <span className="hidden xl:inline-block">My Profile</span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `flex items-center gap-4 px-3 py-3 rounded-full text-sm font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-white ${
                    isActive
                      ? 'bg-zinc-900 text-white font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  }`
                }
                title="Log In"
              >
                <LogIn className="w-5 h-5 flex-shrink-0" />
                <span className="hidden xl:inline-block">Log In</span>
              </NavLink>

              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `flex items-center gap-4 px-3 py-3 rounded-full text-sm font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-white ${
                    isActive
                      ? 'bg-zinc-900 text-white font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  }`
                }
                title="Register"
              >
                <UserPlus className="w-5 h-5 flex-shrink-0" />
                <span className="hidden xl:inline-block">Register</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Large "Post" CTA Button when Authenticated */}
        {isAuthenticated && (
          <div className="pt-2">
            <Link to="/posts/create" className="block">
              <button
                type="button"
                className="w-full bg-white text-black font-extrabold text-sm py-3 px-4 rounded-full hover:bg-zinc-200 transition-transform active:scale-95 shadow-md flex items-center justify-center gap-2"
                title="Post"
              >
                <PlusCircle className="w-5 h-5 xl:hidden" />
                <span className="hidden xl:inline-block">New Post</span>
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Bottom Area: User pill & Health */}
      <div className="space-y-3">
        {/* Health status */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950 border border-zinc-900 text-[11px] font-mono text-zinc-400 w-fit xl:w-full"
          title={isHealthy ? 'Backend API is connected & healthy' : 'Backend API connection check'}
        >
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              isHealthy === true
                ? 'bg-emerald-400 animate-pulse'
                : isHealthy === false
                ? 'bg-zinc-500'
                : 'bg-zinc-600'
            }`}
          />
          <span className="hidden xl:flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-zinc-500" />
            API: {isHealthy === true ? 'Online' : isHealthy === false ? 'Offline' : 'Checking'}
          </span>
        </div>

        {/* User Profile / Logout control */}
        {isAuthenticated && (
          <div className="p-2 rounded-2xl bg-zinc-950 border border-zinc-900 flex items-center justify-between gap-2">
            <Link
              to="/profile"
              className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition-opacity"
            >
              <Avatar
                src={user?.profile?.profile_photo_url}
                name={user?.profile?.full_name || user?.username}
                size="sm"
              />
              <div className="hidden xl:block min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {user?.profile?.full_name || user?.username}
                </p>
                <p className="text-[11px] text-zinc-500 font-mono truncate">
                  @{user?.username}
                </p>
              </div>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-zinc-500 hover:text-white p-2 h-8 w-8 flex-shrink-0"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default LeftSidebar;
