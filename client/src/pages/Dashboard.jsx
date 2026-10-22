import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Coffee,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Calendar,
  School,
  FileText,
  UserPlus
} from 'lucide-react';

const Dashboard = ({ setActivePage }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await dashboardAPI.getStats(todayStr);
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium text-slate-500">Loading actual saved attendance metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-rose-800">Unable to load dashboard</h3>
        <p className="text-xs text-rose-600 mt-1">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { students, todayStats, monthStats, recentSessions, lowAttendanceAlerts } = stats || {};

  return (
    <div className="space-y-6">
      {/* Top Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <School className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-indigo-200 text-xs font-semibold mb-3">
            <Calendar className="w-3.5 h-3.5" />
            <span>Today: {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name || 'Administrator'}
          </h1>
          <p className="mt-1 text-sm text-indigo-100">
            {user?.schoolName || 'ClassSathi Academy'} — Class 9 & Class 10 Attendance Portal
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => setActivePage('take-attendance')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white text-indigo-950 font-bold text-xs shadow-md hover:bg-indigo-50 transition-all cursor-pointer"
            >
              <span>Take Today's Attendance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActivePage('students')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white font-semibold text-xs border border-indigo-400/30 transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Manage Students</span>
            </button>
          </div>
        </div>
      </div>

      {/* Zero Students Alert if none added yet */}
      {students?.total === 0 && (
        <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl p-6 text-center">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-amber-900">No Students Added Yet</h3>
          <p className="text-xs text-amber-700 max-w-md mx-auto mt-1">
            As requested, no demo students were pre-populated. Please add your Class 9 and Class 10 students manually or via quick bulk add.
          </p>
          <button
            onClick={() => setActivePage('students')}
            className="mt-4 inline-flex items-center space-x-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Students Now</span>
          </button>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Students */}
        <div className="col-span-2 sm:col-span-1 lg:col-span-2 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Enrolled</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{students?.total || 0}</div>
            <div className="mt-2 flex items-center space-x-2 text-xs">
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                Class 9: {students?.class9 || 0}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                Class 10: {students?.class10 || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Present Today */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Present</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{todayStats?.present || 0}</div>
            <span className="text-[11px] text-slate-500">Today</span>
          </div>
        </div>

        {/* Absent Today */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Absent</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600">{todayStats?.absent || 0}</div>
            <span className="text-[11px] text-slate-500">Today</span>
          </div>
        </div>

        {/* Late Today */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Late</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">{todayStats?.late || 0}</div>
            <span className="text-[11px] text-slate-500">Today</span>
          </div>
        </div>

        {/* Leave Today */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Leave</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Coffee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600">{todayStats?.leave || 0}</div>
            <span className="text-[11px] text-slate-500">Today</span>
          </div>
        </div>
      </div>

      {/* Today's Attendance Overview & Rate Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span>Today's Attendance Rate</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {todayStats?.isRecorded
                ? `Actual saved records: ${todayStats.totalMarked} students marked across ${todayStats.sessions.length} class session(s)`
                : 'No attendance marked yet for today.'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-2xl font-black text-slate-900">
                {todayStats?.isRecorded ? `${todayStats.percentage}%` : '—'}
              </div>
              <span className="text-[11px] text-slate-500">Daily Attendance Rate</span>
            </div>
            {todayStats?.isRecorded ? (
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                ✓ Recorded
              </span>
            ) : (
              <button
                onClick={() => setActivePage('take-attendance')}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Mark Now
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-3 mt-4 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              (todayStats?.percentage || 0) >= 80
                ? 'bg-emerald-500'
                : (todayStats?.percentage || 0) >= 60
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
            style={{ width: `${todayStats?.percentage || 0}%` }}
          />
        </div>
      </div>

      {/* Grid: Low Attendance Alerts & Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Low Attendance Watchlist (<75%) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Low Attendance Watchlist</h3>
                <p className="text-[11px] text-slate-500">Students below standard 75% requirement</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
              {lowAttendanceAlerts?.length || 0} Alert{lowAttendanceAlerts?.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="mt-3 flex-1 overflow-x-auto">
            {lowAttendanceAlerts && lowAttendanceAlerts.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400">
                    <th className="py-2 font-semibold">Roll</th>
                    <th className="py-2 font-semibold">Student Name</th>
                    <th className="py-2 font-semibold">Class</th>
                    <th className="py-2 font-semibold text-center">Absent</th>
                    <th className="py-2 font-semibold text-right">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowAttendanceAlerts.map((item) => (
                    <tr key={item.studentId} className="hover:bg-slate-50">
                      <td className="py-2 font-bold text-slate-700">{item.rollNo}</td>
                      <td className="py-2 font-medium text-slate-800">
                        {item.name}
                        <div className="text-[10px] text-slate-400">S/o {item.fatherName}</div>
                      </td>
                      <td className="py-2">
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-600 text-[10px]">
                          Class {item.studentClass}
                        </span>
                      </td>
                      <td className="py-2 text-center text-rose-600 font-bold">{item.absentDays}</td>
                      <td className="py-2 text-right">
                        <span className="font-bold text-rose-600">{item.percentage}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">No students below 75% attendance</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Or not enough attendance records have been accumulated yet.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Recent Saved Attendance Sessions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Attendance Logs</h3>
                <p className="text-[11px] text-slate-500">Saved sessions in MongoDB register</p>
              </div>
            </div>
            <button
              onClick={() => setActivePage('register')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View Full Register →
            </button>
          </div>

          <div className="mt-3 flex-1 overflow-x-auto">
            {recentSessions && recentSessions.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400">
                    <th className="py-2 font-semibold">Date</th>
                    <th className="py-2 font-semibold">Class</th>
                    <th className="py-2 font-semibold text-center">P / A / L</th>
                    <th className="py-2 font-semibold text-right">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentSessions.map((session) => (
                    <tr key={session._id} className="hover:bg-slate-50">
                      <td className="py-2 font-mono text-slate-700">{session.date}</td>
                      <td className="py-2 font-semibold text-indigo-700">
                        Class {session.studentClass}
                      </td>
                      <td className="py-2 text-center text-slate-600">
                        <span className="text-emerald-600 font-bold">{session.summary?.present || 0}</span> /{' '}
                        <span className="text-rose-600 font-bold">{session.summary?.absent || 0}</span> /{' '}
                        <span className="text-amber-600 font-bold">{session.summary?.late || 0}</span>
                      </td>
                      <td className="py-2 text-right">
                        <span className="font-bold text-slate-900">{session.summary?.percentage || 0}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">No attendance sessions saved yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Select Class 9 or 10 to take your first attendance.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
