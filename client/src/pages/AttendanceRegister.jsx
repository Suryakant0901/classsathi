import React, { useState, useEffect } from 'react';
import { attendanceAPI, studentsAPI } from '../services/api';
import {
  generateDailyPDF,
  generateDailyExcel,
  generateMonthlyPDF,
  generateMonthlyExcel
} from '../utils/exportHelpers';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  BookOpen,
  User,
  FileDown,
  FileSpreadsheet,
  History,
  CheckCircle,
  XCircle,
  Clock,
  Coffee,
  AlertCircle,
  Search,
  Filter,
  Eye,
  Edit2,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

const AttendanceRegister = ({ setActivePage }) => {
  const { user } = useAuth();

  // Mode: 'monthly' | 'daily' | 'student'
  const [viewMode, setViewMode] = useState('monthly');

  // Shared Filter: Class (9 or 10)
  const [selectedClass, setSelectedClass] = useState('9');

  // Monthly State
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [monthlyData, setMonthlyData] = useState(null);

  // Daily State
  const [selectedDailyDate, setSelectedDailyDate] = useState(() => currentDate.toISOString().split('T')[0]);
  const [dailyData, setDailyData] = useState(null);

  // Student Drilldown State
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentHistory, setStudentHistory] = useState(null);

  // Audit Modal State
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [activeAuditTrail, setActiveAuditTrail] = useState(null);

  // Common UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Load Monthly Register
  const loadMonthlyData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await attendanceAPI.getMonthly(
        selectedYear,
        selectedMonth,
        selectedClass
      );
      if (res.success) {
        setMonthlyData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load monthly attendance register');
    } finally {
      setLoading(false);
    }
  };

  // 2. Load Daily Register
  const loadDailyData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await attendanceAPI.getDaily(selectedDailyDate, selectedClass);
      if (res.success) {
        setDailyData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load daily attendance sheet');
    } finally {
      setLoading(false);
    }
  };

  // 3. Load Students for drilldown
  const loadStudentsList = async () => {
    try {
      const res = await studentsAPI.getAll({
        studentClass: selectedClass,
        isActive: 'true'
      });
      if (res.success) {
        setAllStudents(res.data);
        if (res.data.length > 0 && !selectedStudentId) {
          setSelectedStudentId(res.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Error loading students list:', err);
    }
  };

  // 4. Load Single Student History
  const loadStudentHistory = async (studentId) => {
    if (!studentId) return;
    try {
      setLoading(true);
      const res = await attendanceAPI.getStudentHistory(studentId);
      if (res.success) {
        setStudentHistory(res);
      }
    } catch (err) {
      console.error('Error loading student attendance history:', err);
    } finally {
      setLoading(false);
    }
  };

  // Triggers
  useEffect(() => {
    if (viewMode === 'monthly') {
      loadMonthlyData();
    } else if (viewMode === 'daily') {
      loadDailyData();
    } else if (viewMode === 'student') {
      loadStudentsList();
    }
  }, [viewMode, selectedClass, selectedYear, selectedMonth, selectedDailyDate]);

  useEffect(() => {
    if (viewMode === 'student' && selectedStudentId) {
      loadStudentHistory(selectedStudentId);
    }
  }, [selectedStudentId, viewMode]);

  // Open Audit Modal
  const openAuditModal = (auditTrail) => {
    setActiveAuditTrail(auditTrail || []);
    setAuditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <span>Attendance Register</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Permanent register records saved in MongoDB. View monthly school matrix, daily sheets, or student history.
            </p>
          </div>

          {/* Export Action Buttons */}
          <div className="flex items-center space-x-2">
            {viewMode === 'monthly' && (
              <>
                <button
                  onClick={() => generateMonthlyPDF(monthlyData, { schoolName: user?.schoolName })}
                  disabled={!monthlyData || !monthlyData.studentRows?.length}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  <FileDown className="w-4 h-4 text-rose-600" />
                  <span>Monthly PDF</span>
                </button>
                <button
                  onClick={() => generateMonthlyExcel(monthlyData, { schoolName: user?.schoolName })}
                  disabled={!monthlyData || !monthlyData.studentRows?.length}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Monthly Excel</span>
                </button>
              </>
            )}

            {viewMode === 'daily' && (
              <>
                <button
                  onClick={() => generateDailyPDF(dailyData, { schoolName: user?.schoolName })}
                  disabled={!dailyData}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  <FileDown className="w-4 h-4 text-rose-600" />
                  <span>Daily PDF</span>
                </button>
                <button
                  onClick={() => generateDailyExcel(dailyData, { schoolName: user?.schoolName })}
                  disabled={!dailyData}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Daily Excel</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex border-b border-slate-200 pb-3 space-x-2">
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center space-x-1.5 ${
              viewMode === 'monthly'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Monthly Register Matrix (1–31 Days)</span>
          </button>
          <button
            onClick={() => setViewMode('daily')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center space-x-1.5 ${
              viewMode === 'daily'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Daily Register Sheet</span>
          </button>
          <button
            onClick={() => setViewMode('student')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center space-x-1.5 ${
              viewMode === 'student'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Student Drilldown</span>
          </button>
        </div>

        {/* Global Class & Conditional Date Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Class Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Select Class
            </label>
            <div className="flex space-x-2">
              {['9', '10'].map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setSelectedClass(cls)}
                  className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    selectedClass === cls
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Class {cls}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Filters based on View Mode */}
          {viewMode === 'monthly' ? (
            <>
              {/* Month */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                >
                  {[
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                  ].map((name, idx) => (
                    <option key={name} value={idx + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                >
                  {[2025, 2026, 2027, 2028].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : viewMode === 'daily' ? (
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDailyDate}
                onChange={(e) => setSelectedDailyDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
          ) : (
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Select Student (Class {selectedClass})
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
              >
                {allStudents.map((st) => (
                  <option key={st._id} value={st._id}>
                    Roll {st.rollNo}: {st.name} (S/o {st.fatherName})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: MONTHLY MATRIX REGISTER */}
      {viewMode === 'monthly' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Class {selectedClass} Attendance Matrix — Month {selectedMonth}/{selectedYear}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Recorded Sessions: {monthlyData?.totalWorkingDaysRecorded || 0} days | Total Students: {monthlyData?.studentsCount || 0}
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center space-x-3 text-[11px] font-medium">
              <span className="flex items-center space-x-1">
                <span className="w-3.5 h-3.5 rounded-sm bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[9px]">P</span>
                <span>Present</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-3.5 h-3.5 rounded-sm bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-[9px]">A</span>
                <span>Absent</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-3.5 h-3.5 rounded-sm bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-[9px]">L</span>
                <span>Late</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-3.5 h-3.5 rounded-sm bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[9px]">LV</span>
                <span>Leave</span>
              </span>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading monthly attendance register...</div>
          ) : !monthlyData || !monthlyData.studentRows?.length ? (
            <div className="p-12 text-center">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">No Register Data</h4>
              <p className="text-xs text-slate-500 mt-1">
                No students or attendance recorded for Class {selectedClass} in {selectedMonth}/{selectedYear}.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-2 text-center w-12 sticky left-0 bg-slate-900 z-10">Roll</th>
                    <th className="py-2.5 px-3 min-w-[150px] sticky left-12 bg-slate-900 z-10">Student Name</th>
                    {Array.from({ length: monthlyData.daysInMonth }, (_, i) => i + 1).map((day) => (
                      <th key={day} className="py-2 px-1 text-center min-w-[26px] font-mono">
                        {day}
                      </th>
                    ))}
                    <th className="py-2 px-2 text-center bg-emerald-950 text-emerald-300">P</th>
                    <th className="py-2 px-2 text-center bg-rose-950 text-rose-300">A</th>
                    <th className="py-2 px-2 text-center bg-amber-950 text-amber-300">L</th>
                    <th className="py-2 px-2 text-center bg-blue-950 text-blue-300">LV</th>
                    <th className="py-2 px-3 text-center bg-indigo-950 text-indigo-300 font-black">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {monthlyData.studentRows.map((student) => (
                    <tr key={student.studentId} className="hover:bg-slate-50 transition-colors">
                      {/* Roll */}
                      <td className="py-2 px-2 text-center font-bold text-slate-700 sticky left-0 bg-white group-hover:bg-slate-50 border-r border-slate-100">
                        {student.rollNo}
                      </td>

                      {/* Name & Father */}
                      <td className="py-2 px-3 sticky left-12 bg-white group-hover:bg-slate-50 border-r border-slate-200">
                        <div className="font-bold text-slate-900 truncate max-w-[160px]">{student.name}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[160px]">S/o {student.fatherName}</div>
                      </td>

                      {/* Days 1..31 */}
                      {Array.from({ length: monthlyData.daysInMonth }, (_, i) => i + 1).map((day) => {
                        const cell = student.dailyStatus[day];
                        if (!cell) {
                          return (
                            <td key={day} className="py-2 px-1 text-center text-slate-300 text-[10px] border-r border-slate-100">
                              -
                            </td>
                          );
                        }
                        const status = cell.status;
                        return (
                          <td
                            key={day}
                            title={cell.remarks ? `Remark: ${cell.remarks}` : status}
                            className={`py-2 px-1 text-center text-[10px] font-bold border-r border-slate-100 ${
                              status === 'Present'
                                ? 'text-emerald-700 bg-emerald-50/60'
                                : status === 'Absent'
                                ? 'text-rose-700 bg-rose-100/70'
                                : status === 'Late'
                                ? 'text-amber-700 bg-amber-100/60'
                                : status === 'Leave'
                                ? 'text-blue-700 bg-blue-100/60'
                                : 'text-slate-400'
                            }`}
                          >
                            {status === 'Present' ? 'P' : status === 'Absent' ? 'A' : status === 'Late' ? 'L' : status === 'Leave' ? 'LV' : '-'}
                          </td>
                        );
                      })}

                      {/* Summary Columns */}
                      <td className="py-2 px-2 text-center font-bold text-emerald-700 bg-emerald-50/40">
                        {student.summary.present}
                      </td>
                      <td className="py-2 px-2 text-center font-bold text-rose-700 bg-rose-50/40">
                        {student.summary.absent}
                      </td>
                      <td className="py-2 px-2 text-center font-bold text-amber-700 bg-amber-50/40">
                        {student.summary.late}
                      </td>
                      <td className="py-2 px-2 text-center font-bold text-blue-700 bg-blue-50/40">
                        {student.summary.leave}
                      </td>
                      <td
                        className={`py-2 px-3 text-center font-black ${
                          student.summary.percentage >= 75
                            ? 'text-emerald-700 bg-emerald-50/60'
                            : 'text-rose-600 bg-rose-50/80'
                        }`}
                      >
                        {student.summary.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: DAILY REGISTER SHEET */}
      {viewMode === 'daily' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Class {selectedClass} Attendance Sheet — {selectedDailyDate}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {dailyData ? (
                  <>
                    Saved Attendance: {dailyData.summary?.present || 0} Present, {dailyData.summary?.absent || 0} Absent, {dailyData.summary?.late || 0} Late, {dailyData.summary?.leave || 0} Leave (Rate: {dailyData.summary?.percentage || 0}%)
                  </>
                ) : (
                  'No attendance has been saved yet for this date.'
                )}
              </p>
            </div>

            {dailyData && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openAuditModal(dailyData.auditTrail)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs border border-indigo-200 transition-all cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Audit History ({dailyData.auditTrail?.length || 0})</span>
                </button>
                <button
                  onClick={() => setActivePage('take-attendance')}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs transition-all cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Sheet</span>
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading daily attendance record...</div>
          ) : !dailyData ? (
            <div className="p-12 text-center">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">No Record for This Date</h4>
              <p className="text-xs text-slate-500 mt-1">
                Attendance has not been taken for Class {selectedClass} on {selectedDailyDate}.
              </p>
              <button
                onClick={() => setActivePage('take-attendance')}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                + Mark Attendance Now
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-16 text-center">Roll</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Father's Name</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dailyData.records?.map((record) => (
                    <tr key={record.rollNo} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 text-center font-bold text-slate-700">{record.rollNo}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{record.name}</td>
                      <td className="py-3 px-4 text-slate-600">{record.fatherName}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            record.status === 'Present'
                              ? 'bg-emerald-100 text-emerald-800'
                              : record.status === 'Absent'
                              ? 'bg-rose-100 text-rose-800'
                              : record.status === 'Late'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{record.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 3: STUDENT DRILLDOWN */}
      {viewMode === 'student' && (
        <div className="space-y-4">
          {studentHistory && studentHistory.student && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-lg">
                    {studentHistory.student.rollNo}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">{studentHistory.student.name}</h2>
                    <p className="text-xs text-slate-500">
                      Father: <span className="font-semibold text-slate-700">{studentHistory.student.fatherName}</span> | Class {studentHistory.student.studentClass}
                    </p>
                  </div>
                </div>

                {/* Percentage Badge */}
                <div className="text-right">
                  <div className={`text-2xl font-black ${
                    studentHistory.summary.percentage >= 75 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {studentHistory.summary.percentage}%
                  </div>
                  <span className="text-[11px] text-slate-400">Total Attendance Rate</span>
                </div>
              </div>

              {/* Student KPI Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 text-center">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Recorded Days</div>
                  <div className="text-xl font-bold text-slate-800 mt-1">{studentHistory.summary.totalDays}</div>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                  <div className="text-xs text-emerald-700 font-medium">Present</div>
                  <div className="text-xl font-bold text-emerald-700 mt-1">{studentHistory.summary.present}</div>
                </div>
                <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                  <div className="text-xs text-rose-700 font-medium">Absent</div>
                  <div className="text-xl font-bold text-rose-700 mt-1">{studentHistory.summary.absent}</div>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                  <div className="text-xs text-amber-700 font-medium">Late</div>
                  <div className="text-xl font-bold text-amber-700 mt-1">{studentHistory.summary.late}</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <div className="text-xs text-blue-700 font-medium">Leave</div>
                  <div className="text-xl font-bold text-blue-700 mt-1">{studentHistory.summary.leave}</div>
                </div>
              </div>

              {/* Day-by-day History Table */}
              <div className="mt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Session History Log
                </h4>
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentHistory.history.map((h, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-mono font-medium text-slate-700">{h.date}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md font-bold text-[11px] ${
                                h.status === 'Present'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : h.status === 'Absent'
                                  ? 'bg-rose-100 text-rose-800'
                                  : h.status === 'Late'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {h.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">{h.remarks || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AUDIT HISTORY MODAL */}
      {auditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Attendance Audit History</h3>
              </div>
              <button
                onClick={() => setAuditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {activeAuditTrail && activeAuditTrail.length > 0 ? (
                activeAuditTrail.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between font-semibold">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.action === 'CREATED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.action}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-slate-700">
                      <span className="text-slate-500 font-medium">By:</span> {item.changedBy} |{' '}
                      <span className="text-slate-500 font-medium">Reason:</span> {item.reason}
                    </div>

                    {item.changes && item.changes.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200/60 space-y-1">
                        <div className="font-bold text-slate-600 text-[11px]">Changes Made:</div>
                        {item.changes.map((c, i) => (
                          <div key={i} className="text-[11px] text-slate-600 flex items-center space-x-2">
                            <span>Roll {c.rollNo} ({c.name}):</span>
                            <span className="line-through text-rose-500">{c.oldStatus}</span>
                            <span>→</span>
                            <span className="font-bold text-emerald-600">{c.newStatus}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-400 py-6">No audit records found.</p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setAuditModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceRegister;
