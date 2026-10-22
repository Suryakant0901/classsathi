import React, { useState, useEffect } from 'react';
import { studentsAPI } from '../services/api';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
  Upload,
  Phone,
  BookOpen
} from 'lucide-react';

const Students = ({ setActivePage }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Filters: Class (all, 9, 10) & Search
  const [filterClass, setFilterClass] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Form State for Single Add / Edit
  const [formData, setFormData] = useState({
    rollNo: '',
    name: '',
    fatherName: '',
    studentClass: '9',
    phone: '',
    gender: 'Male'
  });
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // Bulk Add Text
  const [bulkText, setBulkText] = useState('');
  const [bulkClass, setBulkClass] = useState('9');
  const [submitting, setSubmitting] = useState(false);

  // Fetch Students
  const loadStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filterClass !== 'all') params.studentClass = filterClass;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await studentsAPI.getAll(params);
      if (res.success) {
        setStudents(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [filterClass, searchQuery]);

  // Handle Single Student Submit (Add or Edit)
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');

      if (editingStudentId) {
        // Update
        const res = await studentsAPI.update(editingStudentId, formData);
        if (res.success) {
          setFeedbackMessage({ type: 'success', text: `Updated ${formData.name} successfully.` });
          setEditModalOpen(false);
          loadStudents();
        }
      } else {
        // Create
        const res = await studentsAPI.create(formData);
        if (res.success) {
          setFeedbackMessage({ type: 'success', text: `Added ${formData.name} to Class ${formData.studentClass}.` });
          setAddModalOpen(false);
          // Increment roll number automatically for rapid entry!
          setFormData((prev) => ({
            ...prev,
            rollNo: Number(prev.rollNo) + 1,
            name: '',
            fatherName: '',
            phone: ''
          }));
          loadStudents();
        }
      }
    } catch (err) {
      setError(err.message || 'Error saving student');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEdit = (student) => {
    setEditingStudentId(student._id);
    setFormData({
      rollNo: student.rollNo,
      name: student.name,
      fatherName: student.fatherName,
      studentClass: student.studentClass,
      phone: student.phone || '',
      gender: student.gender || 'Male'
    });
    setEditModalOpen(true);
  };

  // Delete Student
  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    try {
      setSubmitting(true);
      const res = await studentsAPI.delete(studentToDelete._id);
      if (res.success) {
        setFeedbackMessage({ type: 'success', text: 'Student deleted successfully.' });
        setDeleteModalOpen(false);
        setStudentToDelete(null);
        loadStudents();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete student');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Bulk Import Submit
  // Expected format: Roll, Name, Father Name, Phone (Optional)
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    try {
      setSubmitting(true);
      setError('');

      const lines = bulkText.split('\n').filter((l) => l.trim().length > 0);
      const parsedList = [];

      lines.forEach((line) => {
        const parts = line.includes('\t') ? line.split('\t') : line.split(',');
        if (parts.length >= 2) {
          const roll = parseInt(parts[0].trim(), 10);
          const name = parts[1].trim();
          const fatherName = parts[2] ? parts[2].trim() : 'Parent / Guardian';
          const phone = parts[3] ? parts[3].trim() : '';

          if (!isNaN(roll) && name) {
            parsedList.push({
              rollNo: roll,
              name,
              fatherName,
              studentClass: bulkClass,
              phone,
              gender: 'Male'
            });
          }
        }
      });

      if (parsedList.length === 0) {
        setError('Could not parse any valid student lines. Format: Roll, Student Name, Father Name');
        setSubmitting(false);
        return;
      }

      const res = await studentsAPI.bulkCreate(parsedList);
      if (res.success) {
        setFeedbackMessage({ type: 'success', text: res.message });
        setBulkModalOpen(false);
        setBulkText('');
        loadStudents();
      }
    } catch (err) {
      setError(err.message || 'Error processing bulk import');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <span>Class 9 & 10 Students Directory</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Add and manage students manually. Every student belongs to Class 9 or Class 10 with Roll Number and Father's Name.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setFormData({
                  rollNo: students.length + 1,
                  name: '',
                  fatherName: '',
                  studentClass: filterClass !== 'all' ? filterClass : '9',
                  phone: '',
                  gender: 'Male'
                });
                setEditingStudentId(null);
                setAddModalOpen(true);
              }}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add Student</span>
            </button>

            <button
              onClick={() => setBulkModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              title="Add multiple students at once"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Bulk Add</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          {/* Class Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Class Filter
            </label>
            <div className="flex space-x-2">
              {['all', '9', '10'].map((c) => (
                <button
                  key={c}
                  onClick={() => setFilterClass(c)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterClass === c
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {c === 'all' ? 'All Classes' : `Class ${c}`}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Search by Student Name, Roll Number, or Father's Name
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Feedback message */}
        {feedbackMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-medium flex items-center justify-between ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <span>{feedbackMessage.text}</span>
            <button onClick={() => setFeedbackMessage(null)} className="text-slate-400 hover:text-slate-600 font-bold">
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Student List Table or Empty State */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Total Students: <span className="text-indigo-600 font-black">{students.length}</span>
          </span>
          {students.length > 0 && (
            <button
              onClick={() => setActivePage('take-attendance')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              Take Attendance for this class →
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 font-medium">Loading students directory...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Students Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || filterClass !== 'all'
                ? 'No students matched your search filters.'
                : 'Your student directory is completely empty. Please add Class 9 and Class 10 students manually.'}
            </p>
            <div className="mt-4 flex justify-center space-x-3">
              <button
                onClick={() => setAddModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                + Add Single Student
              </button>
              <button
                onClick={() => setBulkModalOpen(true)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Bulk Import
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-16 text-center">Roll</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Father's Name</th>
                  <th className="py-3 px-4 text-center">Class</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block w-8 h-8 leading-8 rounded-full bg-slate-100 font-bold text-slate-800 text-xs">
                        {student.rollNo}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 text-sm">{student.name}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{student.fatherName}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-3 py-1 rounded-md bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200">
                        Class {student.studentClass}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {student.phone ? (
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{student.phone}</span>
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => openEdit(student)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="Edit Student"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setStudentToDelete(student);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD / EDIT STUDENT MODAL */}
      {(addModalOpen || editModalOpen) && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingStudentId ? 'Edit Student Details' : 'Add New Student'}
              </h3>
              <button
                onClick={() => {
                  setAddModalOpen(false);
                  setEditModalOpen(false);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSingleSubmit} className="mt-4 space-y-4 text-xs">
              {/* Roll Number, Class & Gender */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Roll No *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Class *
                  </label>
                  <select
                    value={formData.studentClass}
                    onChange={(e) => setFormData({ ...formData, studentClass: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="9">Class 9</option>
                    <option value="10">Class 10</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Student Name */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Student Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Father's Name */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Father's Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Sharma"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Parent / Emergency Phone Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setAddModalOpen(false);
                    setEditModalOpen(false);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving...' : editingStudentId ? 'Save Changes' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BULK IMPORT MODAL */}
      {bulkModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Bulk Add Students</h3>
              <button onClick={() => setBulkModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            {error && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleBulkSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Assign to Class
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBulkClass('9')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs cursor-pointer ${
                      bulkClass === '9'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Class 9
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkClass('10')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs cursor-pointer ${
                      bulkClass === '10'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Class 10
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Paste Students (One per line)
                </label>
                <p className="text-[11px] text-slate-400 mb-1.5">
                  Format: <span className="font-mono text-slate-600">Roll, Student Name, Father's Name, Phone (Optional)</span>
                </p>
                <textarea
                  rows={8}
                  required
                  placeholder={`1, Rohan Gupta, Rakesh Gupta, 9876543210\n2, Priya Singh, Manoj Singh\n3, Amit Kumar, Rajesh Kumar`}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setBulkModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Importing...' : `Import to Class ${bulkClass}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE CONFIRMATION */}
      {deleteModalOpen && studentToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete Student?</h3>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to remove <span className="font-bold text-slate-800">{studentToDelete.name}</span> (Roll {studentToDelete.rollNo}, Class {studentToDelete.studentClass})?
            </p>

            <div className="mt-5 flex justify-center space-x-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={submitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
