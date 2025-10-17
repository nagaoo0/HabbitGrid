import React from 'react';

/**
 * Separator component for dividing sections in the UI.
 * Renders a horizontal line with optional styling for light/dark mode.
 */
export function Separator({ className = '' }) {
  return (
    <div className="w-full my-8 mx-auto flex flex-col items-center" style={{ maxWidth: '96%' }}>
      <div className="w-full h-0.5 bg-slate-100 dark:bg-slate-800 mb-1 rounded-full" />
      <hr
        className={`w-full border-0 h-1 rounded-lg bg-slate-200 dark:bg-slate-700 shadow-sm ${className}`}
        style={{ boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)' }}
        role="separator"
        aria-orientation="horizontal"
      />
    </div>
  );
}
