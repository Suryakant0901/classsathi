import React from 'react';
import {
  LayoutDashboard,
  ClipboardCheck,
  BookMarked,
  Users,
  FileDown,
  Settings,
  Database,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'take-attendance', label: 'Daily Attendance', icon: ClipboardCheck },
  { id: 'register', label: 'Attendance Register', icon: BookMarked },
  { id: 'students', label: 'Students (9 & 10)', icon: Users },
  { id: 'reports', label: 'Download Reports', icon: FileDown },
  { id: 'settings', label: 'Settings & Profile', icon: Settings }
];

const Sidebar = ({ activePage, setActivePage, isOpen, closeSidebar }) => {
  const { user } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-20 flex flex-col shadow-xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header inside mobile drawer */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 lg:hidden">
          <div className="font-bold text-white text-lg tracking-tight">
            Class<span className="text-indigo-400">Sathi</span>
          </div>
          <button
            onClick={closeSidebar}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section title */}
        <div className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
          Admin Portal
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  closeSidebar();
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* System & DB Status Pill at bottom */}
        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>MongoDB Connected</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Database:</span>
              <span className="font-mono text-indigo-300">classsathi</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-700/40 text-[10px] text-slate-400 truncate">
              {user?.schoolName || 'ClassSathi System'}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
