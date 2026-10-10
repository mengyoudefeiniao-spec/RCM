import React from 'react';
import { ChevronRight, ArrowLeftRight } from 'lucide-react';

/**
 * Universal Responsive Container for all system modules and pages.
 * Ensures consistent mobile-first padding, maximum width boundary,
 * and prevents accidental horizontal layout breakage.
 */
export const ResponsiveContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 space-y-4 sm:space-y-6 overflow-x-hidden ${className}`}>
      {children}
    </div>
  );
};

/**
 * Universal Responsive Header
 * Adapts between mobile vertical stack and desktop row alignment.
 */
export const ResponsiveHeader: React.FC<{
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, icon, badge, actions, className = '' }) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-xs ${className}`}
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        {icon && (
          <div className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 text-slate-700 dark:text-slate-300">
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
              {title}
            </h2>
            {badge}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 sm:line-clamp-none">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80">
          {actions}
        </div>
      )}
    </div>
  );
};

/**
 * Universal Responsive Horizontal Tab Bar
 * Smoothly scrolls on mobile without clumsy line-breaks,
 * while automatically expanding or wrapping nicely on wider screens.
 */
export interface TabItem<T extends string = string> {
  id: T;
  label: string | React.ReactNode;
  icon?: React.ReactNode;
  badge?: string | number;
  badgeColor?: string;
}

export const ResponsiveTabs = <T extends string>({
  tabs,
  activeTab,
  onChange,
  className = ''
}: {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  className?: string;
}) => {
  return (
    <div className={`w-full overflow-x-auto no-scrollbar scroll-smooth pb-1 ${className}`}>
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-800 w-max min-w-full sm:min-w-0 sm:w-auto">
        {tabs.map(tab => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors touch-manipulation cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-700/40'
              }`}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    tab.badgeColor || 'bg-rose-500 text-white'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Responsive Form Grid: 1 column on mobile, 2 or 3 columns on tablet/desktop.
 */
export const ResponsiveFormGrid: React.FC<{
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}> = ({ children, cols = 2, className = '' }) => {
  const colClass =
    cols === 2
      ? 'grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'
      : cols === 3
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'
      : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4';

  return <div className={`${colClass} ${className}`}>{children}</div>;
};

/**
 * Responsive Card Grid: Auto-fits across devices.
 */
export const ResponsiveCardGrid: React.FC<{
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}> = ({ children, cols = 3, className = '' }) => {
  const colClass =
    cols === 2
      ? 'grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'
      : cols === 3
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5'
      : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4';

  return <div className={`${colClass} ${className}`}>{children}</div>;
};

/**
 * Universal Responsive Table Wrapper
 * Enforces smooth horizontal scrolling, subtle borders, and an optional touch cue on mobile.
 */
export const ResponsiveTableContainer: React.FC<{
  children: React.ReactNode;
  showScrollHint?: boolean;
  className?: string;
}> = ({ children, showScrollHint = true, className = '' }) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs relative ${className}`}
    >
      {showScrollHint && (
        <div className="sm:hidden px-3 py-1 bg-slate-50 dark:bg-slate-800/40 text-[10px] text-slate-400 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <ArrowLeftRight className="w-3 h-3 text-slate-400" />
            <span>左右滑动查看完整表格</span>
          </span>
          <span className="font-mono text-[9px] text-slate-500">Swipe ↔</span>
        </div>
      )}
      <div className="overflow-x-auto w-full">{children}</div>
    </div>
  );
};

/**
 * Universal Modal Wrapper: ensures comfortable touch margin and full scrolling on mobile devices.
 */
export const ResponsiveModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string | React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}> = ({ isOpen, onClose, title, children, maxWidth = 'lg' }) => {
  if (!isOpen) return null;

  const widthClass =
    maxWidth === 'sm'
      ? 'max-w-sm'
      : maxWidth === 'md'
      ? 'max-w-md'
      : maxWidth === 'lg'
      ? 'max-w-lg'
      : maxWidth === 'xl'
      ? 'max-w-xl'
      : 'max-w-2xl';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div
        className={`w-full ${widthClass} bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 max-h-[92vh] overflow-y-auto flex flex-col space-y-4`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm sm:text-base font-bold text-white truncate">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};
