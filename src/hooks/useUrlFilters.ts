import { useEffect, useCallback } from "react";
import { FilterState, Status, Priority } from "../types";
import { useAppContext } from "../store/AppContext";

export function useUrlFilters() {
  const { state, dispatch } = useAppContext();

  // Read filters from URL on mount and on popstate
  const readFiltersFromUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);

    const filters: Partial<FilterState> = {};

    const statuses = params.get("statuses");
    if (statuses) filters.statuses = statuses.split(",") as Status[];
    else filters.statuses = [];

    const priorities = params.get("priorities");
    if (priorities) filters.priorities = priorities.split(",") as Priority[];
    else filters.priorities = [];

    const assignees = params.get("assignees");
    if (assignees) filters.assignees = assignees.split(",");
    else filters.assignees = [];

    const dueDateFrom = params.get("dueDateFrom");
    filters.dueDateFrom = dueDateFrom || "";

    const dueDateTo = params.get("dueDateTo");
    filters.dueDateTo = dueDateTo || "";

    dispatch({ type: "SET_FILTERS", payload: filters });
  }, [dispatch]);

  const writeFiltersToUrl = useCallback((filters: FilterState) => {
    const params = new URLSearchParams();

    if (filters.statuses.length > 0)
      params.set("statuses", filters.statuses.join(","));
    if (filters.priorities.length > 0)
      params.set("priorities", filters.priorities.join(","));
    if (filters.assignees.length > 0)
      params.set("assignees", filters.assignees.join(","));
    if (filters.dueDateFrom) params.set("dueDateFrom", filters.dueDateFrom);
    if (filters.dueDateTo) params.set("dueDateTo", filters.dueDateTo);

    const search = params.toString();
    const newUrl = search
      ? `${window.location.pathname}?${search}`
      : window.location.pathname;
    window.history.pushState({}, "", newUrl);
  }, []);

  useEffect(() => {
    readFiltersFromUrl();

    const handlePopstate = () => readFiltersFromUrl();
    window.addEventListener("popstate", handlePopstate);
    return () => window.removeEventListener("popstate", handlePopstate);
  }, [readFiltersFromUrl]);

  useEffect(() => {
    writeFiltersToUrl(state.filters);
  }, [state.filters, writeFiltersToUrl]);
}
