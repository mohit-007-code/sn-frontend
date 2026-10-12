import React from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Avatar from '../components/common/Avatar';
import {
  BarChart3,
  Users,
  FileText,
  MessageSquare,
  UserPlus,
  ArrowLeft,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/admin', label: 'Dashboard & Charts', icon: BarChart3, end: true },
    { to: '/admin/users', label: 'Manage Users', icon: Users, end: false },
    { to: '/admin/posts', label: 'Manage Posts', icon: FileText, end: false },
    { to: '/admin/comments', label: 'Manage Comments', icon: MessageSquare, end: false },
    { to: '/admin/create-admin', label: 'Create New Admin', icon: UserPlus, end: false },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row antialiased">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-950 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col justify-between p-4 flex-shrink-0">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-black flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-tight text-white leading-tight">
                  SN Admin
                </h1>
                <p className="text-[11px] text-amber-400 font-mono">Control Center</p>
              </div>
            </div>

            {/* Quick Link back to Feed */}
            <Link
              to="/"
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors text-xs flex items-center gap-1 border border-zinc-800"
              title="Return to Main Social Feed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Feed</span>
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/20'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Admin User Info & Exit */}
        <div className="pt-6 border-t border-zinc-900 mt-6 space-y-3">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-900/60 border border-zinc-900">
            <Avatar
              src={user?.profile?.profile_photo_url || null}
              name={user?.username || 'Admin'}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user?.username}</p>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/20 text-amber-400">
                ADMIN
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              to="/"
              className="flex-1 py-2 px-3 text-center rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 font-medium transition-colors border border-zinc-800"
            >
              Main Site
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-900/40 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-black overflow-y-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
