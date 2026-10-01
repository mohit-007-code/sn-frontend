import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-5">
      <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
        <Compass className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">404</h1>
        <h2 className="text-lg font-semibold text-zinc-300">Page Not Found</h2>
        <p className="text-xs text-zinc-400 max-w-sm">
          The page you requested could not be found or does not exist on this server.
        </p>
      </div>
      <div className="pt-2">
        <Link to="/profile">
          <Button variant="primary" size="md">
            Go to Profile
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
