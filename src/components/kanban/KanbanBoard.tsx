import React from 'react';
import { useAppContext } from '../../store/AppContext';
import { STATUSES, Status } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { useCollaboration } from '../../hooks/useCollaboration';

export function KanbanBoard() {
  const { tasksByStatus } = useAppContext();
  const { dragState, onPointerDown } = useDragAndDrop();
  const { usersByTask } = useCollaboration();

  return (
    <div className="flex gap-4 h-full overflow-x-auto p-1">
      {STATUSES.map(status => (
        <KanbanColumn
          key={status}
          status={status}
          tasks={tasksByStatus[status]}
          isDragOver={dragState.dragOverColumn === status}
          isDragging={dragState.isDragging}
          placeholderHeight={dragState.placeholderHeight}
          dragTaskId={dragState.taskId}
          sourceStatus={dragState.sourceStatus}
          onPointerDown={onPointerDown}
          usersByTask={usersByTask}
        />
      ))}
    </div>
  );
}
