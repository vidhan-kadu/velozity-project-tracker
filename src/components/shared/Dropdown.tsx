import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Dropdown({ options, value, onChange, className = '' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find(o => o.value === value)?.label || value;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-1.5 text-xs bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 text-left flex items-center justify-between hover:bg-slate-700 transition-colors"
      >
        <span className="truncate">{selectedLabel}</span>
        <svg aria-hidden="true" className={`w-3 h-3 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-slate-800 border border-slate-600/50 rounded-lg shadow-xl overflow-hidden">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className={`w-full px-3 py-2 text-xs text-left hover:bg-slate-700 transition-colors ${opt.value === value ? 'text-indigo-400 bg-slate-700/50' : 'text-slate-300'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface MultiSelectDropdownProps {
  label: string;
  options: DropdownOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function MultiSelectDropdown({ label, options, selected, onChange }: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 text-xs bg-slate-800/60 border border-slate-600/40 rounded-lg text-slate-300 flex items-center gap-2 hover:bg-slate-700/60 hover:border-slate-500/50 transition-all min-w-[120px]"
      >
        <span>{label}</span>
        {selected.length > 0 && (
          <span className="bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
            {selected.length}
          </span>
        )}
        <svg aria-hidden="true" className={`w-3 h-3 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-1 min-w-[180px] bg-slate-800 border border-slate-600/50 rounded-lg shadow-xl overflow-hidden">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => toggleOption(opt.value)}
              className={`w-full px-3 py-2 text-xs text-left flex items-center gap-2 hover:bg-slate-700 transition-colors ${selected.includes(opt.value) ? 'text-indigo-300' : 'text-slate-400'
                }`}
            >
              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${selected.includes(opt.value)
                  ? 'bg-indigo-500 border-indigo-500'
                  : 'border-slate-500'
                }`}>
                {selected.includes(opt.value) && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
