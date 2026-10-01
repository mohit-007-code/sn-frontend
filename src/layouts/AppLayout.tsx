import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import { healthApi } from '../api/health.api';
import { PlusCircle, LogOut, Activity, Sparkles, LogIn, UserPlus } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    const checkServer = async () => {
      try {
        await healthApi.checkHealth();
        if (isMounted) setIsHealthy(true);
      } catch {
        if (isMounted) setIsHealthy(false);
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-white selection:text-black">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-black/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand & Feed Nav */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-2.5 focus:outline-none focus:ring-1 focus:ring-white rounded p-1"
            >
              <div className="w-8 h-8 rounded-lg bg-white text-black font-black flex items-center justify-center text-sm tracking-tighter">
                SN
              </div>
              <span className="font-bold text-base tracking-tight text-white hidden sm:inline-block">
                SN Platform
              </span>
            </Link>

            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-white ${
                  isActive
                    ? 'bg-zinc-900 text-white border border-zinc-800'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-950'
                }`
              }
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Feed</span>
            </NavLink>

            {/* Health status indicator */}
            <div
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-400"
              title={isHealthy ? 'Backend API is connected & healthy' : 'Backend API connection check'}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isHealthy === true
                    ? 'bg-emerald-400 animate-pulse'
                    : isHealthy === false
                    ? 'bg-zinc-500'
                    : 'bg-zinc-600'
                }`}
              />
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-zinc-400" />
                API: {isHealthy === true ? 'Online' : isHealthy === false ? 'Offline' : 'Checking'}
              </span>
            </div>
          </div>

          {/* Navigation Links and User Controls */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/posts/create"
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-white ${
                      isActive
                        ? 'bg-white text-black'
                        : 'bg-zinc-900 text-zinc-100 hover:bg-zinc-800 border border-zinc-800'
                    }`
                  }
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Post</span>
                </NavLink>

                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium transition-colors border focus:outline-none focus:ring-1 focus:ring-white ${
                      isActive
                        ? 'bg-zinc-900 border-zinc-700 text-white'
                        : 'border-transparent text-zinc-400 hover:text-white hover:bg-zinc-950'
                    }`
                  }
                >
                  <Avatar
                    src={user?.profile?.profile_photo_url}
                    name={user?.profile?.full_name || user?.username}
                    size="xs"
                  />
                  <span className="hidden sm:inline-block font-mono">
                    @{user?.username}
                  </span>
                </NavLink>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-zinc-400 hover:text-white p-2 h-8"
                  aria-label="Log out"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<LogIn className="w-3.5 h-3.5" />}
                  >
                    Sign In
                  </Button>
                </Link>

                <Link to="/register">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                  >
                    Create Account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-900 py-6 text-center text-xs text-zinc-600">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SN Social Platform</span>
          <span>Designed with high-contrast monochrome aesthetic</span>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
