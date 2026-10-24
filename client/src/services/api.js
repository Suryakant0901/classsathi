export const DEFAULT_LOCAL_API_URL = 'http://192.168.30.247:5000/api';
export const DEFAULT_CLOUD_API_URL = 'https://classsathi-eight.vercel.app/api';

export const isNativePlatform = () => {
  return (
    typeof window !== 'undefined' &&
    Boolean(
      window.Capacitor?.isNativePlatform?.() ||
      window.location.protocol === 'capacitor:' ||
      window.location.protocol === 'file:' ||
      (window.location.hostname === 'localhost' && window.location.port === '') ||
      (window.location.hostname === '127.0.0.1' && window.location.port === '')
    )
  );
};

export const isNativeApp = isNativePlatform();

export const getLocalDateString = (d = new Date()) => {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Pre-seeded starter students for Class 9 and Class 10 (Offline / School Standalone Mode)
const INITIAL_STUDENTS = [
  // Class 9
  { _id: 'st_9_1', rollNo: 1, name: 'Aarav Sharma', fatherName: 'Rajesh Sharma', studentClass: '9', phone: '9876543210', gender: 'Male', isActive: true },
  { _id: 'st_9_2', rollNo: 2, name: 'Aditya Kumar', fatherName: 'Suresh Kumar', studentClass: '9', phone: '9876543211', gender: 'Male', isActive: true },
  { _id: 'st_9_3', rollNo: 3, name: 'Ananya Verma', fatherName: 'Manoj Verma', studentClass: '9', phone: '9876543212', gender: 'Female', isActive: true },
  { _id: 'st_9_4', rollNo: 4, name: 'Aryan Gupta', fatherName: 'Ramesh Gupta', studentClass: '9', phone: '9876543213', gender: 'Male', isActive: true },
  { _id: 'st_9_5', rollNo: 5, name: 'Ayush Tiwari', fatherName: 'Vinod Tiwari', studentClass: '9', phone: '9876543214', gender: 'Male', isActive: true },
  { _id: 'st_9_6', rollNo: 6, name: 'Divya Mishra', fatherName: 'Ashok Mishra', studentClass: '9', phone: '9876543215', gender: 'Female', isActive: true },
  { _id: 'st_9_7', rollNo: 7, name: 'Khushi Singh', fatherName: 'Sanjay Singh', studentClass: '9', phone: '9876543216', gender: 'Female', isActive: true },
  { _id: 'st_9_8', rollNo: 8, name: 'Priya Patel', fatherName: 'Dharmendra Patel', studentClass: '9', phone: '9876543217', gender: 'Female', isActive: true },
  { _id: 'st_9_9', rollNo: 9, name: 'Rohan Yadav', fatherName: 'Dinesh Yadav', studentClass: '9', phone: '9876543218', gender: 'Male', isActive: true },
  { _id: 'st_9_10', rollNo: 10, name: 'Shivam Pandey', fatherName: 'Sunil Pandey', studentClass: '9', phone: '9876543219', gender: 'Male', isActive: true },

  // Class 10
  { _id: 'st_10_1', rollNo: 1, name: 'Aman Shukla', fatherName: 'Alok Shukla', studentClass: '10', phone: '9876543220', gender: 'Male', isActive: true },
  { _id: 'st_10_2', rollNo: 2, name: 'Ankit Dubey', fatherName: 'Pradeep Dubey', studentClass: '10', phone: '9876543221', gender: 'Male', isActive: true },
  { _id: 'st_10_3', rollNo: 3, name: 'Deepika Maurya', fatherName: 'Ramakant Maurya', studentClass: '10', phone: '9876543222', gender: 'Female', isActive: true },
  { _id: 'st_10_4', rollNo: 4, name: 'Harsh Srivastava', fatherName: 'Ajay Srivastava', studentClass: '10', phone: '9876543223', gender: 'Male', isActive: true },
  { _id: 'st_10_5', rollNo: 5, name: 'Neha Chauhan', fatherName: 'Virendra Chauhan', studentClass: '10', phone: '9876543224', gender: 'Female', isActive: true },
  { _id: 'st_10_6', rollNo: 6, name: 'Pooja Tripathi', fatherName: 'Anand Tripathi', studentClass: '10', phone: '9876543225', gender: 'Female', isActive: true },
  { _id: 'st_10_7', rollNo: 7, name: 'Rahul Chauhan', fatherName: 'Santosh Chauhan', studentClass: '10', phone: '9876543226', gender: 'Male', isActive: true },
  { _id: 'st_10_8', rollNo: 8, name: 'Ritu Sen', fatherName: 'Mahesh Sen', studentClass: '10', phone: '9876543227', gender: 'Female', isActive: true },
  { _id: 'st_10_9', rollNo: 9, name: 'Sachin Dixit', fatherName: 'Kailash Dixit', studentClass: '10', phone: '9876543228', gender: 'Male', isActive: true },
  { _id: 'st_10_10', rollNo: 10, name: 'Vikas Yadav', fatherName: 'Ravindra Yadav', studentClass: '10', phone: '9876543229', gender: 'Male', isActive: true }
];

const INITIAL_USER = {
  _id: 'admin_local_master',
  name: 'SURYAKANT CHATURVEDI',
  email: 'admin@classsathi.com',
  role: 'admin',
  schoolName: 'ClassSathi Academy (Class 9 & 10)',
  teacherTitle: 'Class Teacher'
};

// Local storage storage engine helpers
const getLocalStudents = () => {
  try {
    const raw = localStorage.getItem('classsathi_students_db');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  localStorage.setItem('classsathi_students_db', JSON.stringify(INITIAL_STUDENTS));
  return INITIAL_STUDENTS;
};

const saveLocalStudents = (list) => {
  localStorage.setItem('classsathi_students_db', JSON.stringify(list));
};

const getLocalAttendances = () => {
  try {
    const raw = localStorage.getItem('classsathi_attendances_db');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
};

const saveLocalAttendances = (list) => {
  localStorage.setItem('classsathi_attendances_db', JSON.stringify(list));
};

const getLocalUser = () => {
  try {
    const raw = localStorage.getItem('classsathi_user_db');
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_USER;
};

const saveLocalUser = (user) => {
  localStorage.setItem('classsathi_user_db', JSON.stringify(user));
};

// Embedded Standalone Engine
const localEngine = {
  login: (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    const localUser = getLocalUser();
    const savedPassword = localStorage.getItem('classsathi_password_db') || 'admin123';

    if (cleanEmail === localUser.email.toLowerCase() && cleanPassword === savedPassword) {
      const token = 'standalone_token_' + Date.now();
      localStorage.setItem('classsathi_token', token);
      localStorage.setItem('classsathi_user', JSON.stringify(localUser));
      return { success: true, data: { ...localUser, token } };
    }
    throw new Error('Invalid email or password. Please try again.');
  },

  getMe: () => {
    return { success: true, data: getLocalUser() };
  },

  updateProfile: (profileData) => {
    const current = getLocalUser();
    const updated = { ...current, ...profileData };
    saveLocalUser(updated);
    localStorage.setItem('classsathi_user', JSON.stringify(updated));
    return { success: true, data: updated };
  },

  changePassword: (passwordData) => {
    const saved = localStorage.getItem('classsathi_password_db') || 'admin123';
    if (passwordData.currentPassword !== saved) {
      throw new Error('Current password does not match.');
    }
    localStorage.setItem('classsathi_password_db', passwordData.newPassword);
    return { success: true, message: 'Password updated successfully' };
  },

  getStudents: (params = {}) => {
    let list = getLocalStudents();
    if (params.studentClass && params.studentClass !== 'all') {
      list = list.filter((s) => String(s.studentClass) === String(params.studentClass));
    }
    if (params.isActive !== undefined) {
      list = list.filter((s) => String(s.isActive) === String(params.isActive));
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.fatherName?.toLowerCase().includes(q) ||
          String(s.rollNo).includes(q)
      );
    }
    list.sort((a, b) => Number(a.rollNo) - Number(b.rollNo));
    return { success: true, count: list.length, data: list };
  },

  getStudentById: (id) => {
    const list = getLocalStudents();
    const found = list.find((s) => String(s._id) === String(id));
    if (!found) throw new Error('Student not found');
    return { success: true, data: found };
  },

  createStudent: (studentData) => {
    const list = getLocalStudents();
    const exists = list.some(
      (s) =>
        String(s.studentClass) === String(studentData.studentClass) &&
        Number(s.rollNo) === Number(studentData.rollNo)
    );
    if (exists) {
      throw new Error(`Roll No ${studentData.rollNo} already exists in Class ${studentData.studentClass}`);
    }
    const newStudent = {
      ...studentData,
      rollNo: Number(studentData.rollNo),
      _id: 'st_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      isActive: true,
      createdAt: new Date().toISOString()
    };
    list.push(newStudent);
    saveLocalStudents(list);
    return { success: true, data: newStudent };
  },

  bulkCreateStudents: (studentsArray) => {
    const list = getLocalStudents();
    const added = [];
    studentsArray.forEach((st) => {
      const exists = list.some(
        (s) => String(s.studentClass) === String(st.studentClass) && Number(s.rollNo) === Number(st.rollNo)
      );
      if (!exists) {
        const item = {
          ...st,
          rollNo: Number(st.rollNo),
          _id: 'st_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          isActive: true,
          createdAt: new Date().toISOString()
        };
        list.push(item);
        added.push(item);
      }
    });
    saveLocalStudents(list);
    return { success: true, count: added.length, data: added };
  },

  updateStudent: (id, studentData) => {
    const list = getLocalStudents();
    const idx = list.findIndex((s) => String(s._id) === String(id));
    if (idx === -1) throw new Error('Student not found');
    list[idx] = { ...list[idx], ...studentData, rollNo: Number(studentData.rollNo || list[idx].rollNo) };
    saveLocalStudents(list);
    return { success: true, data: list[idx] };
  },

  deleteStudent: (id) => {
    let list = getLocalStudents();
    list = list.filter((s) => String(s._id) !== String(id));
    saveLocalStudents(list);
    return { success: true, message: 'Student removed successfully' };
  },

  getClassesSummary: () => {
    const list = getLocalStudents().filter((s) => s.isActive !== false);
    const count9 = list.filter((s) => String(s.studentClass) === '9').length;
    const count10 = list.filter((s) => String(s.studentClass) === '10').length;
    return {
      success: true,
      data: [
        { _id: '9', count: count9 },
        { _id: '10', count: count10 }
      ]
    };
  },

  saveAttendance: (payload) => {
    const { date, studentClass, records, reason } = payload;
    let list = getLocalAttendances();

    let present = 0, absent = 0, late = 0, leave = 0;
    records.forEach((r) => {
      if (r.status === 'Present') present++;
      else if (r.status === 'Absent') absent++;
      else if (r.status === 'Late') late++;
      else if (r.status === 'Leave') leave++;
    });

    const total = records.length;
    const effectivePresent = present + late;
    const percentage = total > 0 ? Number(((effectivePresent / total) * 100).toFixed(1)) : 0;
    const summary = { total, present, absent, late, leave, percentage };

    const existingIndex = list.findIndex(
      (a) => a.date === date && String(a.studentClass) === String(studentClass)
    );

    let savedDoc;
    if (existingIndex > -1) {
      const existing = list[existingIndex];
      const auditEntry = {
        timestamp: new Date().toISOString(),
        changedBy: 'Administrator',
        reason: reason || 'Attendance updated',
        changes: []
      };

      savedDoc = {
        ...existing,
        records,
        summary,
        updatedAt: new Date().toISOString(),
        auditTrail: [...(existing.auditTrail || []), auditEntry]
      };
      list[existingIndex] = savedDoc;
    } else {
      savedDoc = {
        _id: 'att_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        date,
        studentClass,
        records,
        summary,
        createdAt: new Date().toISOString(),
        auditTrail: [
          {
            timestamp: new Date().toISOString(),
            changedBy: 'Administrator',
            reason: reason || 'Initial daily attendance'
          }
        ]
      };
      list.push(savedDoc);
    }

    saveLocalAttendances(list);
    return { success: true, message: 'Attendance recorded successfully', data: savedDoc };
  },

  getDailyAttendance: (date, studentClass) => {
    const attendances = getLocalAttendances();
    const doc = attendances.find(
      (a) => a.date === date && String(a.studentClass) === String(studentClass)
    );
    const students = getLocalStudents().filter(
      (s) => String(s.studentClass) === String(studentClass) && s.isActive !== false
    );
    students.sort((a, b) => Number(a.rollNo) - Number(b.rollNo));

    return {
      success: true,
      isRecorded: Boolean(doc),
      data: doc || null,
      students
    };
  },

  getMonthlyRegister: (year, month, studentClass) => {
    const y = Number(year);
    const m = Number(month);
    const daysInMonth = new Date(y, m, 0).getDate();

    const students = getLocalStudents().filter(
      (s) => String(s.studentClass) === String(studentClass) && s.isActive !== false
    );
    students.sort((a, b) => Number(a.rollNo) - Number(b.rollNo));

    const monthStr = m < 10 ? `0${m}` : `${m}`;
    const prefix = `${y}-${monthStr}`;

    const attendances = getLocalAttendances().filter(
      (a) => String(a.studentClass) === String(studentClass) && a.date.startsWith(prefix)
    );

    const dateMap = new Map();
    attendances.forEach((att) => {
      const dayNum = parseInt(att.date.split('-')[2], 10);
      const studentStatusMap = new Map();
      att.records.forEach((r) => {
        studentStatusMap.set(String(r.student || r.rollNo), r);
      });
      dateMap.set(dayNum, studentStatusMap);
    });

    const studentRows = students.map((st) => {
      const dailyStatus = {};
      let present = 0, absent = 0, late = 0, leave = 0;

      for (let d = 1; d <= daysInMonth; d++) {
        const dayAttendance = dateMap.get(d);
        if (dayAttendance) {
          const rec = dayAttendance.get(String(st._id)) || dayAttendance.get(String(st.rollNo));
          if (rec) {
            dailyStatus[d] = { status: rec.status, remarks: rec.remarks || '' };
            if (rec.status === 'Present') present++;
            else if (rec.status === 'Absent') absent++;
            else if (rec.status === 'Late') late++;
            else if (rec.status === 'Leave') leave++;
          } else {
            dailyStatus[d] = null;
          }
        } else {
          dailyStatus[d] = null;
        }
      }

      const totalRecorded = present + absent + late + leave;
      const effectivePresent = present + late;
      const percentage = totalRecorded > 0 ? Number(((effectivePresent / totalRecorded) * 100).toFixed(1)) : 0;

      return {
        studentId: st._id,
        rollNo: st.rollNo,
        name: st.name,
        fatherName: st.fatherName,
        dailyStatus,
        summary: { present, absent, late, leave, totalRecorded, percentage }
      };
    });

    return {
      success: true,
      data: {
        year: y,
        month: m,
        studentClass,
        daysInMonth,
        totalStudents: students.length,
        studentRows
      }
    };
  },

  getStudentHistory: (studentId) => {
    const students = getLocalStudents();
    const st = students.find((s) => String(s._id) === String(studentId));
    if (!st) throw new Error('Student not found');

    const attendances = getLocalAttendances().filter((a) => String(a.studentClass) === String(st.studentClass));
    attendances.sort((a, b) => new Date(b.date) - new Date(a.date));

    let present = 0, absent = 0, late = 0, leave = 0;
    const history = [];

    attendances.forEach((att) => {
      const rec = att.records.find((r) => String(r.student || r.rollNo) === String(st._id) || String(r.rollNo) === String(st.rollNo));
      if (rec) {
        history.push({ date: att.date, status: rec.status, remarks: rec.remarks || '' });
        if (rec.status === 'Present') present++;
        else if (rec.status === 'Absent') absent++;
        else if (rec.status === 'Late') late++;
        else if (rec.status === 'Leave') leave++;
      }
    });

    const totalDays = history.length;
    const effectivePresent = present + late;
    const percentage = totalDays > 0 ? Number(((effectivePresent / totalDays) * 100).toFixed(1)) : 0;

    return {
      success: true,
      data: {
        student: st,
        summary: { totalDays, present, absent, late, leave, percentage },
        history
      }
    };
  },

  getAudit: (id) => {
    const list = getLocalAttendances();
    const found = list.find((a) => String(a._id) === String(id));
    return { success: true, data: found?.auditTrail || [] };
  },

  deleteAttendance: (id) => {
    let list = getLocalAttendances();
    list = list.filter((a) => String(a._id) !== String(id));
    saveLocalAttendances(list);
    return { success: true, message: 'Attendance record deleted successfully' };
  },

  getDashboardStats: (dateParam) => {
    const today = dateParam || getLocalDateString();
    const students = getLocalStudents().filter((s) => s.isActive !== false);
    const attendances = getLocalAttendances();

    const todayAtts = attendances.filter((a) => a.date === today);

    const class9Students = students.filter((s) => String(s.studentClass) === '9');
    const class10Students = students.filter((s) => String(s.studentClass) === '10');

    const class9Att = todayAtts.find((a) => String(a.studentClass) === '9');
    const class10Att = todayAtts.find((a) => String(a.studentClass) === '10');

    const class9Stats = {
      studentClass: '9',
      total: class9Students.length,
      isRecorded: Boolean(class9Att),
      present: class9Att?.summary?.present || 0,
      absent: class9Att?.summary?.absent || 0,
      late: class9Att?.summary?.late || 0,
      leave: class9Att?.summary?.leave || 0,
      percentage: class9Att?.summary?.percentage || 0
    };

    const class10Stats = {
      studentClass: '10',
      total: class10Students.length,
      isRecorded: Boolean(class10Att),
      present: class10Att?.summary?.present || 0,
      absent: class10Att?.summary?.absent || 0,
      late: class10Att?.summary?.late || 0,
      leave: class10Att?.summary?.leave || 0,
      percentage: class10Att?.summary?.percentage || 0
    };

    const presentToday = class9Stats.present + class10Stats.present;
    const absentToday = class9Stats.absent + class10Stats.absent;
    const lateToday = class9Stats.late + class10Stats.late;
    const leaveToday = class9Stats.leave + class10Stats.leave;
    const totalMarked = presentToday + absentToday + lateToday + leaveToday;
    const effectivePresent = presentToday + lateToday;
    const overallRate = totalMarked > 0 ? Number(((effectivePresent / totalMarked) * 100).toFixed(1)) : 0;

    const todayStats = {
      isRecorded: todayAtts.length > 0,
      totalMarked,
      present: presentToday,
      absent: absentToday,
      late: lateToday,
      leave: leaveToday,
      percentage: overallRate,
      sessions: todayAtts.map((att) => ({
        _id: att._id,
        date: att.date,
        studentClass: att.studentClass,
        summary: att.summary
      }))
    };

    // Recent sessions (most recent first)
    const recentSessions = [...attendances]
      .sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0))
      .slice(0, 6)
      .map((att) => ({
        _id: att._id,
        date: att.date,
        studentClass: att.studentClass,
        summary: att.summary
      }));

    // Current month statistics
    const currentMonthPrefix = today.substring(0, 7);
    const monthAtts = attendances.filter((a) => a.date && a.date.startsWith(currentMonthPrefix));
    const totalWorkingDays = new Set(monthAtts.map((a) => a.date)).size;
    const monthAvgPct = monthAtts.length > 0
      ? Number((monthAtts.reduce((acc, curr) => acc + (curr.summary?.percentage || 0), 0) / monthAtts.length).toFixed(1))
      : 0;

    const monthStats = {
      totalWorkingDays,
      totalSessions: monthAtts.length,
      averagePercentage: monthAvgPct
    };

    // Low attendance alerts (< 75%)
    const studentHistoryMap = new Map();
    attendances.forEach((att) => {
      (att.records || []).forEach((r) => {
        const id = String(r.student || r.rollNo);
        if (!studentHistoryMap.has(id)) {
          studentHistoryMap.set(id, {
            studentId: r.student || id,
            rollNo: r.rollNo,
            name: r.name,
            fatherName: r.fatherName,
            studentClass: att.studentClass,
            totalDays: 0,
            presentDays: 0,
            absentDays: 0,
            lateDays: 0
          });
        }
        const stRec = studentHistoryMap.get(id);
        stRec.totalDays++;
        if (r.status === 'Present') stRec.presentDays++;
        else if (r.status === 'Absent') stRec.absentDays++;
        else if (r.status === 'Late') stRec.lateDays++;
      });
    });

    const lowAttendanceAlerts = [];
    studentHistoryMap.forEach((rec) => {
      if (rec.totalDays >= 2) {
        const pct = Number((((rec.presentDays + rec.lateDays) / rec.totalDays) * 100).toFixed(1));
        if (pct < 75) {
          lowAttendanceAlerts.push({
            ...rec,
            percentage: pct
          });
        }
      }
    });
    lowAttendanceAlerts.sort((a, b) => a.percentage - b.percentage);

    return {
      success: true,
      data: {
        date: today,
        students: {
          total: students.length,
          class9: class9Students.length,
          class10: class10Students.length
        },
        todayStats,
        classStats: {
          class9: class9Stats,
          class10: class10Stats
        },
        classStatsList: [class9Stats, class10Stats],
        monthStats,
        recentSessions,
        lowAttendanceAlerts: lowAttendanceAlerts.slice(0, 10),
        totalStudents: students.length,
        class9Count: class9Students.length,
        class10Count: class10Students.length,
        todayAttendance: {
          present: presentToday,
          absent: absentToday,
          late: lateToday,
          leave: leaveToday,
          percentage: overallRate
        }
      }
    };
  }
};

export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('classsathi_api_url');
    if (saved && saved.trim()) {
      return saved.trim().replace(/\/+$/, '');
    }
  }

  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`;
  }

  if (isNativePlatform()) {
    return DEFAULT_LOCAL_API_URL;
  }

  // Web browser development proxy
  return '/api';
};

export const setApiBaseUrl = (url) => {
  if (!url || !url.trim()) {
    localStorage.removeItem('classsathi_api_url');
  } else {
    let cleanUrl = url.trim().replace(/\/+$/, '');
    if (!cleanUrl.endsWith('/api')) {
      cleanUrl = `${cleanUrl}/api`;
    }
    localStorage.setItem('classsathi_api_url', cleanUrl);
  }
};

export const testApiConnection = async (customUrl) => {
  const targetBase = (customUrl || getApiBaseUrl()).trim().replace(/\/+$/, '');
  const testUrl = targetBase.endsWith('/api')
    ? `${targetBase}/health`
    : `${targetBase}/api/health`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(testUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: true, status: res.status, data };
    }
    return { success: false, status: res.status, error: `HTTP ${res.status}` };
  } catch (err) {
    return {
      success: false,
      error:
        err.name === 'AbortError'
          ? 'Connection timed out (4s)'
          : err.message || 'Server unreachable'
    };
  }
};

// Dispatch router between Remote Backend and Local Standalone Engine
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('classsathi_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  const baseUrl = getApiBaseUrl();

  // Try network fetch first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...config,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = {
          message:
            text.includes('<html') || text.includes('NOT_FOUND')
              ? `Backend service unavailable (${response.status})`
              : text || `Server error (${response.status})`
        };
      }
    }

    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        localStorage.removeItem('classsathi_token');
        localStorage.removeItem('classsathi_user');
        window.location.reload();
      }
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (networkError) {
    // If backend is unreachable (e.g. Papa is at school without Wi-Fi),
    // automatically activate Standalone Device Engine!
    console.warn(`[ClassSathi Engine] Backend offline (${baseUrl}). Running standalone on device for ${endpoint}`);

    // Auth endpoints
    if (endpoint === '/auth/login') {
      const body = JSON.parse(options.body || '{}');
      return localEngine.login(body.email, body.password);
    }
    if (endpoint === '/auth/me') {
      return localEngine.getMe();
    }
    if (endpoint === '/auth/profile') {
      const body = JSON.parse(options.body || '{}');
      return localEngine.updateProfile(body);
    }
    if (endpoint === '/auth/change-password') {
      const body = JSON.parse(options.body || '{}');
      return localEngine.changePassword(body);
    }

    // Student endpoints
    if (endpoint.startsWith('/students/classes-summary')) {
      return localEngine.getClassesSummary();
    }
    if (endpoint === '/students/bulk') {
      const body = JSON.parse(options.body || '{}');
      return localEngine.bulkCreateStudents(body.students || []);
    }
    if (endpoint.startsWith('/students') && (options.method === 'GET' || !options.method)) {
      const url = new URL('http://dummy.local' + endpoint);
      const params = Object.fromEntries(url.searchParams.entries());
      return localEngine.getStudents(params);
    }
    if (endpoint === '/students' && options.method === 'POST') {
      const body = JSON.parse(options.body || '{}');
      return localEngine.createStudent(body);
    }
    if (endpoint.startsWith('/students/') && options.method === 'PUT') {
      const id = endpoint.split('/students/')[1];
      const body = JSON.parse(options.body || '{}');
      return localEngine.updateStudent(id, body);
    }
    if (endpoint.startsWith('/students/') && options.method === 'DELETE') {
      const id = endpoint.split('/students/')[1];
      return localEngine.deleteStudent(id);
    }
    if (endpoint.startsWith('/students/') && (options.method === 'GET' || !options.method)) {
      const id = endpoint.split('/students/')[1];
      return localEngine.getStudentById(id);
    }

    // Attendance endpoints
    if (endpoint === '/attendance' && options.method === 'POST') {
      const body = JSON.parse(options.body || '{}');
      return localEngine.saveAttendance(body);
    }
    if (endpoint.startsWith('/attendance/daily')) {
      const url = new URL('http://dummy.local' + endpoint);
      const date = url.searchParams.get('date');
      const studentClass = url.searchParams.get('studentClass');
      return localEngine.getDailyAttendance(date, studentClass);
    }
    if (endpoint.startsWith('/attendance/monthly')) {
      const url = new URL('http://dummy.local' + endpoint);
      const year = url.searchParams.get('year');
      const month = url.searchParams.get('month');
      const studentClass = url.searchParams.get('studentClass');
      return localEngine.getMonthlyRegister(year, month, studentClass);
    }
    if (endpoint.startsWith('/attendance/student/')) {
      const studentId = endpoint.split('/attendance/student/')[1];
      return localEngine.getStudentHistory(studentId);
    }
    if (endpoint.startsWith('/attendance/audit/')) {
      const id = endpoint.split('/attendance/audit/')[1];
      return localEngine.getAudit(id);
    }
    if (endpoint.startsWith('/attendance/') && options.method === 'DELETE') {
      const id = endpoint.split('/attendance/')[1];
      return localEngine.deleteAttendance(id);
    }

    // Dashboard endpoint
    if (endpoint.startsWith('/dashboard/stats')) {
      const url = new URL('http://dummy.local' + endpoint);
      const date = url.searchParams.get('date');
      return localEngine.getDashboardStats(date);
    }

    // Fallback if no matching local route
    throw networkError;
  }
}

// Authentication API
export const authAPI = {
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  getMe: () => request('/auth/me'),
  updateProfile: (profileData) =>
    request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    }),
  changePassword: (passwordData) =>
    request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData)
    })
};

// Students API
export const studentsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/students${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/students/${id}`),
  create: (studentData) =>
    request('/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    }),
  bulkCreate: (studentsArray) =>
    request('/students/bulk', {
      method: 'POST',
      body: JSON.stringify({ students: studentsArray })
    }),
  update: (id, studentData) =>
    request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData)
    }),
  delete: (id) =>
    request(`/students/${id}`, {
      method: 'DELETE'
    }),
  getClassesSummary: () => request('/students/classes-summary')
};

// Attendance API
export const attendanceAPI = {
  save: (attendanceData) =>
    request('/attendance', {
      method: 'POST',
      body: JSON.stringify(attendanceData)
    }),
  getDaily: (date, studentClass) =>
    request(`/attendance/daily?date=${date}&studentClass=${studentClass}`),
  getMonthly: (year, month, studentClass) =>
    request(`/attendance/monthly?year=${year}&month=${month}&studentClass=${studentClass}`),
  getStudentHistory: (studentId) => request(`/attendance/student/${studentId}`),
  getAudit: (id) => request(`/attendance/audit/${id}`),
  delete: (id) =>
    request(`/attendance/${id}`, {
      method: 'DELETE'
    })
};

// Dashboard API
export const dashboardAPI = {
  getStats: (date) => request(`/dashboard/stats${date ? `?date=${date}` : ''}`)
};
