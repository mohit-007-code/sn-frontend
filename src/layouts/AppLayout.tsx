import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { healthApi } from '../api/health.api';
import LeftSidebar from '../components/layout/LeftSidebar';
import RightSidebar from '../components/layout/RightSidebar';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import { Sparkles, PlusCircle, LogOut } from 'lucide-react';


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
      {/* Mobile Top Header (hidden on md/lg screens where left nav is present) */}
      <header className="lg:hidden sticky top-0 z-40 w-full bg-black/85 backdrop-blur-md border-b border-zinc-800 px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white text-black font-black flex items-center justify-center text-sm tracking-tighter">
            SN
          </div>
          <span className="font-bold text-sm tracking-tight text-white">
            SN Platform
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-400"
            title={isHealthy ? 'API Online' : 'API Offline'}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isHealthy === true
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-zinc-500'
              }`}
            />
            <span>{isHealthy === true ? 'Online' : 'API'}</span>
          </div>

          {isAuthenticated ? (
            <Link to="/profile">
              <Avatar
                src={user?.profile?.profile_photo_url}
                name={user?.profile?.full_name || user?.username}
                size="xs"
              />
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2.5">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Main 3-Column Twitter Layout Container */}
      <div className="max-w-7xl w-full mx-auto px-2 sm:px-4 lg:px-6 flex justify-center flex-1">
        {/* Left Column: Navigation Sidebar */}
        <div className="hidden lg:block flex-shrink-0 pr-6 py-6">
          <LeftSidebar isHealthy={isHealthy} />
        </div>


        {/* Center Column: Feed / Profile Stream */}
        <main className="flex-1 min-w-0 max-w-2xl border-x border-zinc-900 min-h-screen pb-20 lg:pb-8">
          <Outlet />
        </main>

        {/* Right Column: Sticky Auth Box / Discovery Sidebar */}
        <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0 pl-6 py-6">
          <RightSidebar />
        </div>
      </div>

      {/* Floating Bottom Auth Bar for Guests on Mobile / Compact screens */}
      {!isAuthenticated ? (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-zinc-950/95 border-t border-zinc-800 backdrop-blur-md px-4 py-3 flex items-center justify-between gap-3 shadow-2xl">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">
              Don’t miss what’s happening
            </p>
            <p className="text-[11px] text-zinc-400 truncate">
              Log in or register to like, comment & follow
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link to="/login">
              <Button variant="outline" size="sm" className="text-xs h-8 px-3">
                Log In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm" className="text-xs h-8 px-3">
                Register
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Mobile Bottom Nav Bar for Authenticated Users */
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-zinc-950/95 border-t border-zinc-800 backdrop-blur-md px-6 py-2 flex items-center justify-around">
          <Link
            to="/"
            className="p-2 text-zinc-400 hover:text-white transition-colors flex flex-col items-center gap-1"
            title="Feed"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px]">Feed</span>
          </Link>

          <Link
            to="/posts/create"
            className="p-2 text-zinc-400 hover:text-white transition-colors flex flex-col items-center gap-1"
            title="Create Post"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="text-[10px]">Post</span>
          </Link>

          <Link
            to="/profile"
            className="p-2 text-zinc-400 hover:text-white transition-colors flex flex-col items-center gap-1"
            title="Profile"
          >
            <Avatar
              src={user?.profile?.profile_photo_url}
              name={user?.profile?.full_name || user?.username}
              size="xs"
            />
            <span className="text-[10px]">Profile</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="p-2 text-zinc-500 hover:text-white transition-colors flex flex-col items-center gap-1"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[10px]">Logout</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default AppLayout;
