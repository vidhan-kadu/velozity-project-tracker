import React, { lazy, Suspense } from 'react';
import { useAppContext } from './store/AppContext';
import { ViewType } from './types';
import { FilterBar } from './components/layout/FilterBar';
import { PresenceBar } from './components/collaboration/PresenceBar';
import { KanbanBoard } from './components/kanban/KanbanBoard';
import { useUrlFilters } from './hooks/useUrlFilters';

const ListView = lazy(() => import('./components/list/ListView').then(m => ({ default: m.ListView })));
const TimelineView = lazy(() => import('./components/timeline/TimelineView').then(m => ({ default: m.TimelineView })));

const VIEW_CONFIG: { key: ViewType; label: string; icon: React.ReactNode }[] = [
  {
    key: 'kanban',
    label: 'Kanban',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
      </svg>
    ),
  },
  {
    key: 'list',
    label: 'List',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
  {
    key: 'timeline',
    label: 'Timeline',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    ),
  },
];

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex items-center gap-3 text-slate-400">
        <div className="w-5 h-5 border-2 border-slate-500 border-t-indigo-400 rounded-full animate-spin" />
        <span className="text-sm">Loading view...</span>
      </div>
    </div>
  );
}

function AppContent() {
  const { state, dispatch } = useAppContext();
  useUrlFilters();

  const renderView = () => {
    switch (state.activeView) {
      case 'kanban':
        return <KanbanBoard />;
      case 'list':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ListView />
          </Suspense>
        );
      case 'timeline':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <TimelineView />
          </Suspense>
        );
    }
  };

  return (
    <div className="h-full flex flex-col relative z-10">
      {/* Header */}
      <header className="shrink-0 px-6 py-4 border-b border-slate-700/30">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">Project Tracker</h1>
                <p className="text-[10px] text-slate-500 -mt-0.5 uppercase tracking-widest">Velozity Global Solutions</p>
              </div>
            </div>
          </div>
          <PresenceBar />
        </div>

        {/* View Switcher + Filters */}
        <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <nav className="flex bg-slate-800/40 rounded-xl p-1 border border-slate-700/30 w-fit" role="tablist" aria-label="View switcher">
            {VIEW_CONFIG.map(view => (
              <button
                key={view.key}
                role="tab"
                aria-label={`${view.label} view`}
                aria-selected={state.activeView === view.key}
                onClick={() => dispatch({ type: 'SET_VIEW', payload: view.key })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${state.activeView === view.key
                    ? 'bg-indigo-500/20 text-indigo-300 shadow-sm shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                  }`}
              >
                {view.icon}
                {view.label}
              </button>
            ))}
          </nav>
          <FilterBar />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 md:p-6 overflow-hidden">
        {renderView()}
      </main>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
