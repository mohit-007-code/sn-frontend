import React, { useState } from 'react';
import { resolveImageUrl } from '../../utils/image';
import { getInitials } from '../../utils/format';

export interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [src]);

  const resolvedSrc = src && !hasError ? resolveImageUrl(src) : null;

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base font-semibold',
    xl: 'w-20 h-20 text-xl font-bold',
    '2xl': 'w-28 h-28 text-3xl font-bold',
  };

  const initials = getInitials(name);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden bg-zinc-900 border border-zinc-800 select-none ${sizeClasses[size]} ${className}`}
    >
      {resolvedSrc ? (
        <img
          src={resolvedSrc}
          alt={name ? `${name}'s avatar` : 'User avatar'}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="text-zinc-200 tracking-wider font-mono uppercase">
          {initials}
        </span>
      )}
    </div>
  );
};

export default Avatar;
