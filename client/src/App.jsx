import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TakeAttendance from './pages/TakeAttendance';
import AttendanceRegister from './pages/AttendanceRegister';
import Students from './pages/Students';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-semibold tracking-wide text-slate-300">
            Initializing ClassSathi...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activePage === 'dashboard' && <Dashboard setActivePage={setActivePage} />}
          {activePage === 'take-attendance' && <TakeAttendance setActivePage={setActivePage} />}
          {activePage === 'register' && <AttendanceRegister setActivePage={setActivePage} />}
          {activePage === 'students' && <Students setActivePage={setActivePage} />}
          {activePage === 'reports' && <Reports setActivePage={setActivePage} />}
          {activePage === 'settings' && <Settings setActivePage={setActivePage} />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
