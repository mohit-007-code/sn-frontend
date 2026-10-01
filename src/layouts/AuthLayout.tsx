import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-white selection:text-black">
      {/* Top minimal header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2.5 focus:outline-none focus:ring-1 focus:ring-white rounded p-1"
        >
          <div className="w-8 h-8 rounded-lg bg-white text-black font-black flex items-center justify-center text-sm tracking-tighter">
            SN
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            SN Platform
          </span>
        </Link>
      </header>

      {/* Main content centered */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-zinc-600">
        <p>© {new Date().getFullYear()} SN Social Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AuthLayout;
