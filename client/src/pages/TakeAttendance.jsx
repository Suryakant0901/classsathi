import React, { useState, useEffect } from 'react';
import { attendanceAPI, studentsAPI } from '../services/api';
import { generateDailyPDF, generateDailyExcel } from '../utils/exportHelpers';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Coffee,
  Save,
  CheckCheck,
  AlertCircle,
  FileDown,
  RefreshCw,
  Edit3,
  UserX,
  History,
  FileSpreadsheet,
  Trash2,
  AlertTriangle
} from 'lucide-react';

const TakeAttendance = ({ setActivePage }) => {
  const { user } = useAuth();

  // State
  const [selectedClass, setSelectedClass] = useState('9');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isAlreadyRecorded, setIsAlreadyRecorded] = useState(false);
  const [existingDocId, setExistingDocId] = useState(null);
  const [auditReason, setAuditReason] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  // Fetch students & attendance for selected class and date
  const loadData = async () => {
    try {
      setLoading(true);
      setMessage(null);

      // Call getDaily API without section
      const res = await attendanceAPI.getDaily(selectedDate, selectedClass);

      if (res.success) {
        const availableStudents = res.students || [];
        setStudents(availableStudents);

        if (res.isRecorded && res.data) {
          // Attendance already exists! Pre-fill with saved data
          setIsAlreadyRecorded(true);
          setExistingDocId(res.data._id);

          // Map saved records
          const recMap = new Map();
          res.data.records.forEach((r) => {
            recMap.set(String(r.student || r.rollNo), r);
          });

          const initialRecords = availableStudents.map((st) => {
            const saved = recMap.get(String(st._id)) || recMap.get(String(st.rollNo));
            return {
              student: st._id,
              rollNo: st.rollNo,
              name: st.name,
              fatherName: st.fatherName,
              status: saved ? saved.status : 'Present',
              remarks: saved ? saved.remarks || '' : ''
            };
          });

          setAttendanceRecords(initialRecords);
        } else {
          // No record yet: default everyone to 'Present'
          setIsAlreadyRecorded(false);
          setExistingDocId(null);
          setAuditReason('');

          const initialRecords = availableStudents.map((st) => ({
            student: st._id,
            rollNo: st.rollNo,
            name: st.name,
            fatherName: st.fatherName,
            status: 'Present',
            remarks: ''
          }));

          setAttendanceRecords(initialRecords);
        }
      }
    } catch (err) {
      console.error('Error loading attendance sheet:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to load attendance data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedClass, selectedDate]);

  // Update status for a specific student
  const handleStatusChange = (rollNo, newStatus) => {
    setAttendanceRecords((prev) =>
      prev.map((rec) => (rec.rollNo === rollNo ? { ...rec, status: newStatus } : rec))
    );
  };

  // Update remarks for a specific student
  const handleRemarksChange = (rollNo, newRemarks) => {
    setAttendanceRecords((prev) =>
      prev.map((rec) => (rec.rollNo === rollNo ? { ...rec, remarks: newRemarks } : rec))
    );
  };

  // Bulk actions
  const markAll = (status) => {
    setAttendanceRecords((prev) =>
      prev.map((rec) => ({
        ...rec,
        status
      }))
    );
  };

  // Live Summary calculation
  const summary = React.useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let leave = 0;

    attendanceRecords.forEach((r) => {
      if (r.status === 'Present') present++;
      else if (r.status === 'Absent') absent++;
      else if (r.status === 'Late') late++;
      else if (r.status === 'Leave') leave++;
    });

    const total = attendanceRecords.length;
    const effectivePresent = present + late;
    const percentage = total > 0 ? Number(((effectivePresent / total) * 100).toFixed(1)) : 0;

    return { total, present, absent, late, leave, percentage };
  }, [attendanceRecords]);

  // Save Attendance to MongoDB
  const handleSave = async () => {
    if (attendanceRecords.length === 0) {
      setMessage({ type: 'error', text: 'No students to record attendance for.' });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      const payload = {
        date: selectedDate,
        studentClass: selectedClass,
        records: attendanceRecords,
        reason: isAlreadyRecorded
          ? auditReason.trim() || 'Attendance corrected by administrator'
          : 'Initial daily attendance'
      };

      const res = await attendanceAPI.save(payload);

      if (res.success) {
        setIsAlreadyRecorded(true);
        setExistingDocId(res.data._id);

        // Confetti celebration
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        setMessage({
          type: 'success',
          text: `Attendance saved permanently in MongoDB for Class ${selectedClass} on ${selectedDate}!`
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save attendance' });
    } finally {
      setSaving(false);
    }
  };

  // Delete Attendance Record from MongoDB
  const handleDeleteAttendance = async () => {
    if (!existingDocId) {
      setMessage({ type: 'error', text: 'No existing attendance record found to delete.' });
      return;
    }

    try {
      setDeleting(true);
      setMessage(null);
      const res = await attendanceAPI.delete(existingDocId);

      if (res.success) {
        setIsAlreadyRecorded(false);
        setExistingDocId(null);
        setAuditReason('');
        setShowDeleteModal(false);

        // Reset loaded student records to default 'Present'
        setAttendanceRecords((prev) =>
          prev.map((rec) => ({
            ...rec,
            status: 'Present',
            remarks: ''
          }))
        );

        setMessage({
          type: 'success',
          text: `Attendance record for Class ${selectedClass} on ${selectedDate} has been permanently deleted.`
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete attendance record' });
    } finally {
      setDeleting(false);
    }
  };

  // Quick export
  const handleExportPDF = () => {
    const dataForExport = {
      studentClass: selectedClass,
      date: selectedDate,
      summary,
      records: attendanceRecords
    };
    generateDailyPDF(dataForExport, { schoolName: user?.schoolName });
  };

  const handleExportExcel = () => {
    const dataForExport = {
      studentClass: selectedClass,
      date: selectedDate,
      summary,
      records: attendanceRecords
    };
    generateDailyExcel(dataForExport, { schoolName: user?.schoolName });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card & Filters */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <span>Daily Attendance Sheet</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Select Class and Date. Mark student statuses and save permanently to the database.
            </p>
          </div>

          {/* Quick PDF & Excel Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportPDF}
              disabled={attendanceRecords.length === 0}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              title="Download PDF"
            >
              <FileDown className="w-4 h-4 text-rose-600" />
              <span>PDF</span>
            </button>
            <button
              onClick={handleExportExcel}
              disabled={attendanceRecords.length === 0}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              title="Download Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Excel</span>
            </button>
          </div>
        </div>

        {/* Selection Bar: Class & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
          {/* Class Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Select Class
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedClass('9')}
                className={`py-2.5 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                  selectedClass === '9'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>Class 9</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedClass('10')}
                className={`py-2.5 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                  selectedClass === '10'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>Class 10</span>
              </button>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Attendance Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Existing Record Notice & Audit Reason if Already Taken */}
        {isAlreadyRecorded && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start space-x-2 text-amber-900">
              <History className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Existing Record Loaded:</span> Attendance for Class {selectedClass} on {selectedDate} is already saved in the database.
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Any modifications made will be tracked in the audit trail.
                </p>
              </div>
            </div>
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                placeholder="Reason for correction (optional)..."
                value={auditReason}
                onChange={(e) => setAuditReason(e.target.value)}
                className="w-full sm:w-56 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs placeholder-amber-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                disabled={deleting}
                className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap"
                title="Permanently delete this attendance record from MongoDB"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Record</span>
              </button>
            </div>
          </div>
        )}

        {/* Message Banner */}
        {message && (
          <div
            className={`p-3.5 rounded-xl text-xs font-medium flex items-center space-x-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{message.text}</span>
          </div>
        )}
      </div>

      {/* Live Counter & Bulk Actions Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sticky top-18 z-20">
        {/* Counter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-700 mr-1">Class {selectedClass} Summary:</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold">
            Total: {summary.total}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
            Present: {summary.present}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold border border-rose-200">
            Absent: {summary.absent}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-bold border border-amber-200">
            Late: {summary.late}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200">
            Leave: {summary.leave}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-black border border-indigo-200">
            Rate: {summary.percentage}%
          </span>
        </div>

        {/* Bulk Action Buttons & Save */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => markAll('Present')}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs border border-emerald-200 transition-all cursor-pointer"
          >
            All Present
          </button>
          <button
            type="button"
            onClick={() => markAll('Absent')}
            className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs border border-rose-200 transition-all cursor-pointer"
          >
            All Absent
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || attendanceRecords.length === 0}
            className="ml-auto md:ml-2 inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : isAlreadyRecorded ? 'Update Attendance' : 'Save Attendance'}</span>
          </button>
        </div>
      </div>

      {/* Student Attendance List */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Fetching students for Class {selectedClass}...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
          <UserX className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            No Students Found in Class {selectedClass}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            There are currently no students added to Class {selectedClass}.
          </p>
          <button
            onClick={() => setActivePage('students')}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            + Add Students to Class {selectedClass}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4 w-16 text-center">Roll</th>
                  <th className="py-3 px-4">Student & Father's Name</th>
                  <th className="py-3 px-4 text-center">Attendance Status</th>
                  <th className="py-3 px-4 w-64">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceRecords.map((record) => (
                  <tr
                    key={record.rollNo}
                    className={`transition-colors ${
                      record.status === 'Absent'
                        ? 'bg-rose-50/30'
                        : record.status === 'Late'
                        ? 'bg-amber-50/30'
                        : record.status === 'Leave'
                        ? 'bg-blue-50/30'
                        : 'hover:bg-slate-50/60'
                    }`}
                  >
                    {/* Roll Number */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block w-8 h-8 leading-8 rounded-full bg-slate-100 font-bold text-slate-800 text-xs">
                        {record.rollNo}
                      </span>
                    </td>

                    {/* Student & Father Info */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{record.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Father: <span className="font-medium text-slate-700">{record.fatherName}</span>
                      </div>
                    </td>

                    {/* Attendance Status Selector Buttons */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-1.5 sm:space-x-2">
                        {/* Present */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(record.rollNo, 'Present')}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center space-x-1 ${
                            record.status === 'Present'
                              ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600 ring-offset-1'
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>P</span>
                        </button>

                        {/* Absent */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(record.rollNo, 'Absent')}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center space-x-1 ${
                            record.status === 'Absent'
                              ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-600 ring-offset-1'
                              : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>A</span>
                        </button>

                        {/* Late */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(record.rollNo, 'Late')}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center space-x-1 ${
                            record.status === 'Late'
                              ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-500 ring-offset-1'
                              : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>L</span>
                        </button>

                        {/* Leave */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(record.rollNo, 'Leave')}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center space-x-1 ${
                            record.status === 'Leave'
                              ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600 ring-offset-1'
                              : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                          }`}
                        >
                          <Coffee className="w-3.5 h-3.5" />
                          <span>LV</span>
                        </button>
                      </div>
                    </td>

                    {/* Remarks Input */}
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={record.remarks}
                        onChange={(e) => handleRemarksChange(record.rollNo, e.target.value)}
                        placeholder="Optional remark..."
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Save Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Total {attendanceRecords.length} student records for Class {selectedClass} ready to save permanently.
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              {isAlreadyRecorded && (
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={saving || deleting}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Delete Attendance</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || deleting}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : isAlreadyRecorded ? 'Update Attendance Record' : 'Save Attendance'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center">Delete Attendance Record?</h3>
            <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
              Are you sure you want to permanently delete the attendance record for <span className="font-bold text-slate-800">Class {selectedClass}</span> on <span className="font-bold text-slate-800">{selectedDate}</span>?
              This will remove attendance for {attendanceRecords.length} students from MongoDB.
            </p>

            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAttendance}
                disabled={deleting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30 transition-all cursor-pointer inline-flex items-center space-x-1.5"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete Record</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeAttendance;
