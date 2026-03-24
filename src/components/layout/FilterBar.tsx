import React from 'react';
import { useAppContext } from '../../store/AppContext';
import { MultiSelectDropdown } from '../shared/Dropdown';
import { STATUSES, PRIORITIES, STATUS_LABELS } from '../../types';
import { USERS } from '../../data/seedData';

export function FilterBar() {
  const { state, dispatch } = useAppContext();
  const { filters } = state;

  const hasActiveFilters =
    filters.statuses.length > 0 ||
    filters.priorities.length > 0 ||
    filters.assignees.length > 0 ||
    filters.dueDateFrom !== '' ||
    filters.dueDateTo !== '';

  return (
    <div className="flex items-center gap-3 flex-wrap px-1">
      <div className="flex items-center gap-1.5 text-slate-500">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span className="text-xs font-medium">Filters</span>
      </div>

      <MultiSelectDropdown
        label="Status"
        options={STATUSES.map(s => ({ value: s, label: STATUS_LABELS[s] }))}
        selected={filters.statuses}
        onChange={(selected) => dispatch({ type: 'SET_FILTERS', payload: { statuses: selected as any } })}
      />

      <MultiSelectDropdown
        label="Priority"
        options={PRIORITIES.map(p => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))}
        selected={filters.priorities}
        onChange={(selected) => dispatch({ type: 'SET_FILTERS', payload: { priorities: selected as any } })}
      />

      <MultiSelectDropdown
        label="Assignee"
        options={USERS.map(u => ({ value: u.id, label: u.name }))}
        selected={filters.assignees}
        onChange={(selected) => dispatch({ type: 'SET_FILTERS', payload: { assignees: selected } })}
      />

      <div className="flex items-center gap-2">
        <label htmlFor="filter-from-date" className="text-xs text-slate-500">From</label>
        <input
          id="filter-from-date"
          type="date"
          value={filters.dueDateFrom}
          onChange={(e) => dispatch({ type: 'SET_FILTERS', payload: { dueDateFrom: e.target.value } })}
          className="px-2 py-1.5 text-xs bg-slate-800/60 border border-slate-600/40 rounded-lg text-slate-300 hover:border-slate-500/50 transition-all"
        />
        <label htmlFor="filter-to-date" className="text-xs text-slate-500">To</label>
        <input
          id="filter-to-date"
          type="date"
          value={filters.dueDateTo}
          onChange={(e) => dispatch({ type: 'SET_FILTERS', payload: { dueDateTo: e.target.value } })}
          className="px-2 py-1.5 text-xs bg-slate-800/60 border border-slate-600/40 rounded-lg text-slate-300 hover:border-slate-500/50 transition-all"
        />
      </div>

      {hasActiveFilters && (
        <button
          onClick={() => dispatch({ type: 'CLEAR_FILTERS' })}
          className="px-3 py-1.5 text-xs font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 transition-all flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear all
        </button>
      )}
    </div>
  );
}
