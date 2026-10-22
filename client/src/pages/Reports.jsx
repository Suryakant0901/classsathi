import React, { useState } from 'react';
import { attendanceAPI } from '../services/api';
import {
  generateDailyPDF,
  generateDailyExcel,
  generateMonthlyPDF,
  generateMonthlyExcel
} from '../utils/exportHelpers';
import { useAuth } from '../context/AuthContext';
import {
  FileDown,
  FileSpreadsheet,
  Calendar,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Printer,
  School,
  Download
} from 'lucide-react';

const Reports = () => {
  const { user } = useAuth();

  // Daily Report State (Class 9 or 10)
  const [dailyClass, setDailyClass] = useState('9');
  const [dailyDate, setDailyDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailyMessage, setDailyMessage] = useState(null);

  // Monthly Report State (Class 9 or 10)
  const [monthlyClass, setMonthlyClass] = useState('9');
  const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear());
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().getMonth() + 1);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [monthlyMessage, setMonthlyMessage] = useState(null);

  // Handle Daily PDF
  const handleDailyDownload = async (format) => {
    try {
      setDailyLoading(true);
      setDailyMessage(null);

      const res = await attendanceAPI.getDaily(dailyDate, dailyClass);
      if (res.success && res.data) {
        if (format === 'pdf') {
          generateDailyPDF(res.data, { schoolName: user?.schoolName });
          setDailyMessage({ type: 'success', text: `Daily PDF for Class ${dailyClass} downloaded successfully!` });
        } else {
          generateDailyExcel(res.data, { schoolName: user?.schoolName });
          setDailyMessage({ type: 'success', text: `Daily Excel sheet for Class ${dailyClass} downloaded successfully!` });
        }
      } else {
        setDailyMessage({
          type: 'error',
          text: `No attendance records found for Class ${dailyClass} on ${dailyDate}. Please mark attendance first.`
        });
      }
    } catch (err) {
      setDailyMessage({ type: 'error', text: err.message || 'Error downloading daily register' });
    } finally {
      setDailyLoading(false);
    }
  };

  // Handle Monthly PDF / Excel
  const handleMonthlyDownload = async (format) => {
    try {
      setMonthlyLoading(true);
      setMonthlyMessage(null);

      const res = await attendanceAPI.getMonthly(
        monthlyYear,
        monthlyMonth,
        monthlyClass
      );
      if (res.success && res.data && res.data.studentRows && res.data.studentRows.length > 0) {
        if (format === 'pdf') {
          generateMonthlyPDF(res.data, { schoolName: user?.schoolName });
          setMonthlyMessage({ type: 'success', text: `Monthly Register PDF for Class ${monthlyClass} downloaded successfully!` });
        } else {
          generateMonthlyExcel(res.data, { schoolName: user?.schoolName });
          setMonthlyMessage({ type: 'success', text: `Monthly Register Excel sheet for Class ${monthlyClass} downloaded successfully!` });
        }
      } else {
        setMonthlyMessage({
          type: 'error',
          text: `No attendance records found for Class ${monthlyClass} in ${monthlyMonth}/${monthlyYear}.`
        });
      }
    } catch (err) {
      setMonthlyMessage({ type: 'error', text: err.message || 'Error downloading monthly register' });
    } finally {
      setMonthlyLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <span>Attendance Reports & Registers Download Center</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Export official print-ready attendance registers for Class 9 and Class 10 in PDF and Excel (.xlsx) formats. All reports include roll numbers, student names, fathers' names, daily attendance marks, and official summary statistics.
        </p>
      </div>

      {/* Grid: 2 Download Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Daily Attendance Register */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Daily Attendance Register</h3>
                <p className="text-xs text-slate-500">Official one-day attendance sheet with summary</p>
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Select Class
                </label>
                <div className="flex space-x-2">
                  {['9', '10'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setDailyClass(c)}
                      className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                        dailyClass === c
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Class {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Attendance Date
                </label>
                <input
                  type="date"
                  value={dailyDate}
                  onChange={(e) => setDailyDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
                />
              </div>
            </div>

            {/* Daily Message */}
            {dailyMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-center space-x-2 ${
                  dailyMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {dailyMessage.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{dailyMessage.text}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex space-x-3">
            <button
              onClick={() => handleDailyDownload('pdf')}
              disabled={dailyLoading}
              className="flex-1 inline-flex items-center justify-center space-x-2 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>{dailyLoading ? 'Preparing...' : 'Download Daily PDF'}</span>
            </button>
            <button
              onClick={() => handleDailyDownload('excel')}
              disabled={dailyLoading}
              className="flex-1 inline-flex items-center justify-center space-x-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{dailyLoading ? 'Preparing...' : 'Download Daily Excel'}</span>
            </button>
          </div>
        </div>

        {/* Card 2: Monthly Attendance Register (Full Matrix) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Monthly Attendance Register</h3>
                <p className="text-xs text-slate-500">Traditional 31-day school register format</p>
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Class
                </label>
                <div className="flex space-x-1">
                  {['9', '10'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setMonthlyClass(c)}
                      className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                        monthlyClass === c
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Class {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Month
                </label>
                <select
                  value={monthlyMonth}
                  onChange={(e) => setMonthlyMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
                >
                  {[
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                  ].map((m, i) => (
                    <option key={m} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Year
                </label>
                <select
                  value={monthlyYear}
                  onChange={(e) => setMonthlyYear(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
                >
                  {[2025, 2026, 2027, 2028].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Monthly Message */}
            {monthlyMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-center space-x-2 ${
                  monthlyMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {monthlyMessage.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{monthlyMessage.text}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex space-x-3">
            <button
              onClick={() => handleMonthlyDownload('pdf')}
              disabled={monthlyLoading}
              className="flex-1 inline-flex items-center justify-center space-x-2 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>{monthlyLoading ? 'Preparing...' : 'Download Monthly PDF'}</span>
            </button>
            <button
              onClick={() => handleMonthlyDownload('excel')}
              disabled={monthlyLoading}
              className="flex-1 inline-flex items-center justify-center space-x-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{monthlyLoading ? 'Preparing...' : 'Download Monthly Excel'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Helpful Info Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-600">
        <h4 className="font-bold text-slate-800 mb-1 flex items-center space-x-1.5">
          <School className="w-4 h-4 text-indigo-600" />
          <span>School Compliance & Printing Notice</span>
        </h4>
        <p className="leading-relaxed">
          The generated PDF registers strictly follow standard educational board format for Class 9 and Class 10, including student roll numbers, student names, father/guardian details, daily marks (P/A/L/LV), and dedicated signature boxes for Class Teacher and Principal.
        </p>
      </div>
    </div>
  );
};

export default Reports;
