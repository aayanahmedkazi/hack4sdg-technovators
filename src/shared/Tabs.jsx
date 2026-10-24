import React from 'react';

/**
 * Tab bar placed directly under the top bar.
 * Active tab indicated with Teal #0B5D5E.
 */
export function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`w-full border-b border-slate-200 bg-white ${className}`}>
      <div className="max-w-content mx-auto px-4 sm:px-6">
        <nav className="flex space-x-1 sm:space-x-8 overflow-x-auto no-scrollbar" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                className={`group inline-flex items-center gap-2.5 py-4 px-3 sm:px-1 border-b-2 font-medium text-base whitespace-nowrap transition-colors min-h-[48px] select-none ${
                  isActive
                    ? 'border-mediteal text-mediteal font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                {Icon && (
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-colors stroke-[2] ${
                      isActive ? 'text-mediteal' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                )}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1 px-2 py-0.5 text-xs rounded-full font-semibold ${
                      isActive ? 'bg-mediteal-light text-mediteal' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
