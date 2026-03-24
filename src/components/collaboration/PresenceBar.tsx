import React from 'react';
import { useCollaboration } from '../../hooks/useCollaboration';
import { Avatar } from '../shared/Avatar';

export function PresenceBar() {
  const { activeViewerCount, simulatedUsers } = useCollaboration();

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center -space-x-2">
        {simulatedUsers
          .filter(u => u.currentTaskId !== null)
          .map(u => (
          <div key={u.id}>
              <Avatar initials={u.initials} color={u.color} size="sm" />
            </div>
          ))}
      </div>
      {activeViewerCount > 0 && (
        <span className="text-xs text-slate-400">
          <span className="font-semibold text-slate-300">{activeViewerCount}</span>
          {' '}people viewing this board
        </span>
      )}
      <div className="w-2 h-2 rounded-full bg-emerald-400" title="Live" />
    </div>
  );
}
