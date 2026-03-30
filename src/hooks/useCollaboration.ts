import { useEffect, useCallback, useMemo } from "react";
import { useAppContext } from "../store/AppContext";
import { SimulatedUser } from "../types";

export function useCollaboration() {
  const { state, dispatch } = useAppContext();

  const moveRandomUser = useCallback(() => {
    const { simulatedUsers, tasks } = state;
    if (tasks.length === 0) return;

    const userIndex = Math.floor(Math.random() * simulatedUsers.length);
    const randomTask =
      tasks[Math.floor(Math.random() * Math.min(tasks.length, 50))];

    const updatedUsers: SimulatedUser[] = simulatedUsers.map((u, i) => {
      if (i === userIndex) {
        return { ...u, currentTaskId: randomTask.id };
      }
      return u;
    });

    dispatch({ type: "UPDATE_SIMULATED_USERS", payload: updatedUsers });
  }, [state, dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const { tasks, simulatedUsers } = state;
      if (tasks.length === 0) return;

      const needsInit = simulatedUsers.every((u) => u.currentTaskId === null);
      if (needsInit) {
        const initialized = simulatedUsers.map((u) => ({
          ...u,
          currentTaskId:
            tasks[Math.floor(Math.random() * Math.min(tasks.length, 50))].id,
        }));
        dispatch({ type: "UPDATE_SIMULATED_USERS", payload: initialized });
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => {
        moveRandomUser();
      },
      5000 + Math.random() * 7000,
    );

    return () => clearInterval(interval);
  }, [moveRandomUser]);

  const usersByTask = useMemo(() => {
    const map = new Map<string, SimulatedUser[]>();
    state.simulatedUsers.forEach((u) => {
      if (u.currentTaskId) {
        const existing = map.get(u.currentTaskId) || [];
        existing.push(u);
        map.set(u.currentTaskId, existing);
      }
    });
    return map;
  }, [state.simulatedUsers]);

  const activeViewerCount = useMemo(
    () => state.simulatedUsers.filter((u) => u.currentTaskId !== null).length,
    [state.simulatedUsers],
  );

  return {
    usersByTask,
    activeViewerCount,
    simulatedUsers: state.simulatedUsers,
  };
}
