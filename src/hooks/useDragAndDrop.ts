import { useState, useCallback, useRef, useEffect } from "react";
import { Status } from "../types";
import { useAppContext } from "../store/AppContext";

interface DragState {
  taskId: string | null;
  sourceStatus: Status | null;
  isDragging: boolean;
  placeholderHeight: number;
  dragOverColumn: Status | null;
}

export function useDragAndDrop() {
  const { dispatch } = useAppContext();
  const [dragState, setDragState] = useState<DragState>({
    taskId: null,
    sourceStatus: null,
    isDragging: false,
    placeholderHeight: 0,
    dragOverColumn: null,
  });

  const dragRef = useRef(dragState);
  dragRef.current = dragState;

  const startPos = useRef({ x: 0, y: 0 });
  const originalCard = useRef<HTMLElement | null>(null);
  const ghostRef = useRef<HTMLElement | null>(null);
  const hasMoved = useRef(false);
  const isActive = useRef(false);

  const cleanup = useCallback(() => {
    // Remove ghost
    const ghost = ghostRef.current;
    if (ghost && ghost.parentNode) {
      ghost.parentNode.removeChild(ghost);
    }
    ghostRef.current = null;

    // Restore original card
    const card = originalCard.current;
    if (card) {
      card.style.transition = "opacity 0.2s ease";
      card.style.opacity = "1";
      card.style.transform = "";
      card.style.filter = "";
    }

    // Remove all column highlights
    document.querySelectorAll("[data-column-status]").forEach((col) => {
      (col as HTMLElement).classList.remove("drag-over-highlight");
    });

    setDragState({
      taskId: null,
      sourceStatus: null,
      isDragging: false,
      placeholderHeight: 0,
      dragOverColumn: null,
    });

    hasMoved.current = false;
    isActive.current = false;
    originalCard.current = null;
  }, []);

  const handleMove = useCallback((e: PointerEvent) => {
    if (!isActive.current) return;

    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;

    // Must exceed 5px threshold before starting drag
    if (!hasMoved.current) {
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
      hasMoved.current = true;

      const card = originalCard.current;
      if (!card) return;

      // Create ghost clone
      const rect = card.getBoundingClientRect();
      const ghost = card.cloneNode(true) as HTMLElement;

      Object.assign(ghost.style, {
        position: "fixed",
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        zIndex: "99999",
        pointerEvents: "none",
        willChange: "transform",
        // Start at normal, then animate to lifted state
        transform: "scale(1) rotate(0deg)",
        opacity: "1",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        borderRadius: "12px",
        transition: "box-shadow 0.2s ease, opacity 0.15s ease",
      });
      ghost.id = "drag-ghost";
      document.body.appendChild(ghost);
      ghostRef.current = ghost;

      // Animate ghost to "lifted" state after a frame
      requestAnimationFrame(() => {
        if (ghost) {
          ghost.style.boxShadow =
            "0 20px 60px rgba(0,0,0,0.35), 0 8px 20px rgba(0,0,0,0.2)";
          ghost.style.opacity = "0.92";
        }
      });

      // Dim the original card in-place (acts as placeholder)
      card.style.transition = "opacity 0.2s ease, filter 0.2s ease";
      card.style.opacity = "0.25";
      card.style.filter = "grayscale(1)";

      setDragState((prev) => ({ ...prev, isDragging: true }));
    }

    // Move ghost with cursor using transform (GPU accelerated)
    const ghost = ghostRef.current;
    if (ghost) {
      ghost.style.transform = `translate(${dx}px, ${dy}px) rotate(2deg) scale(1.04)`;
    }

    // Detect which column the cursor is over
    let overColumn: Status | null = null;
    document.querySelectorAll("[data-column-status]").forEach((col) => {
      const rect = col.getBoundingClientRect();
      const isOver =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (isOver) {
        overColumn = col.getAttribute("data-column-status") as Status;
      }
    });

    setDragState((prev) => ({ ...prev, dragOverColumn: overColumn }));
  }, []);

  const handleUp = useCallback(
    (e: PointerEvent) => {
      if (!isActive.current) return;

      const { taskId, sourceStatus, dragOverColumn } = dragRef.current;

      if (
        hasMoved.current &&
        taskId &&
        dragOverColumn &&
        dragOverColumn !== sourceStatus
      ) {
        // Successful drop — animate ghost shrinking into target
        const ghost = ghostRef.current;
        if (ghost) {
          ghost.style.transition = "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)";
          ghost.style.opacity = "0";
          ghost.style.transform += " scale(0.9)";
        }

        dispatch({
          type: "UPDATE_TASK_STATUS",
          payload: { taskId, newStatus: dragOverColumn },
        });

        setTimeout(cleanup, 250);
      } else if (hasMoved.current) {
        // Snap back — animate ghost returning to original position
        const ghost = ghostRef.current;
        if (ghost) {
          ghost.style.transition = "all 0.3s cubic-bezier(0.2, 0, 0, 1)";
          ghost.style.transform = "translate(0px, 0px) rotate(0deg) scale(1)";
          ghost.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
          ghost.style.opacity = "1";
          setTimeout(cleanup, 300);
        } else {
          cleanup();
        }
      } else {
        cleanup();
      }
    },
    [dispatch, cleanup],
  );

  useEffect(() => {
    if (dragState.taskId && isActive.current) {
      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp);
      window.addEventListener("pointercancel", handleUp);
      return () => {
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
        window.removeEventListener("pointercancel", handleUp);
      };
    }
  }, [dragState.taskId, handleMove, handleUp]);

  const onPointerDown = useCallback(
    (
      e: React.PointerEvent,
      taskId: string,
      status: Status,
      cardElement: HTMLElement,
      index: number,
    ) => {
      e.preventDefault();
      e.stopPropagation();

      startPos.current = { x: e.clientX, y: e.clientY };
      hasMoved.current = false;
      isActive.current = true;
      originalCard.current = cardElement;

      setDragState((prev) => ({
        ...prev,
        taskId,
        sourceStatus: status,
        placeholderHeight: cardElement.getBoundingClientRect().height,
      }));
    },
    [],
  );

  return {
    dragState,
    onPointerDown,
  };
}
