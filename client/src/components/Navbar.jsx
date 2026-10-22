import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, School, User, LogOut, Menu, BookOpen, ShieldCheck } from 'lucide-react';

const Navbar = ({ toggleSidebar, activePage, setActivePage }) => {
  const { user, logout } = useAuth();

  const formattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left Brand & Mobile Toggle */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              title="Toggle Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => setActivePage('dashboard')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold tracking-tight text-slate-900">
                    Class<span className="text-indigo-600">Sathi</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Class 9 & 10
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block truncate max-w-xs">
                  {user?.schoolName || 'Attendance Management System'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Info & Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Today's Date */}
            <div className="hidden md:flex items-center space-x-2 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>{formattedDate}</span>
            </div>

            {/* Quick Link to Take Attendance */}
            <button
              onClick={() => setActivePage('take-attendance')}
              className={`hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
                activePage === 'take-attendance'
                  ? 'bg-indigo-700 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <span>+ Mark Today</span>
            </button>

            {/* Admin Profile Details */}
            <div className="flex items-center pl-2 sm:pl-3 sm:border-l sm:border-slate-200 space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs ring-2 ring-indigo-100">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="hidden xl:block text-left">
                  <div className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">
                    {user?.name || 'Administrator'}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium flex items-center">
                    <ShieldCheck className="w-3 h-3 mr-0.5 inline" />
                    Verified Admin
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Log Out"
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
