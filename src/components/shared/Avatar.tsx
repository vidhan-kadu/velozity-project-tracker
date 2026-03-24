import React from 'react';
import { SimulatedUser } from '../../types';

interface AvatarProps {
  initials: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ initials, color, size = 'md', className = '' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white shrink-0 border-2 border-slate-900 ${className}`}
      style={{ backgroundColor: color }}
      title={initials}
    >
      {initials}
    </div>
  );
}

interface AvatarStackProps {
  users: SimulatedUser[];
  maxShow?: number;
}

export function AvatarStack({ users, maxShow = 2 }: AvatarStackProps) {
  if (users.length === 0) return null;
  const visible = users.slice(0, maxShow);
  const overflow = users.length - maxShow;

  return (
    <div className="flex items-center -space-x-2">
      {visible.map(u => (
        <div key={u.id} className="transition-all duration-500 ease-in-out animate-fade-in">
          <Avatar initials={u.initials} color={u.color} size="sm" />
        </div>
      ))}
      {overflow > 0 && (
        <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-[10px] font-semibold text-white border-2 border-slate-900">
          +{overflow}
        </div>
      )}
    </div>
  );
}
