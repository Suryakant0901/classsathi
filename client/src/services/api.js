// In production (Vercel), uses VITE_API_URL env variable pointing to the deployed backend.
// In local dev, uses Vite proxy so '/api' works directly.
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

// Helper for making API calls with token
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

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        // Token expired or invalid
        localStorage.removeItem('classsathi_token');
        localStorage.removeItem('classsathi_user');
        window.location.reload();
      }
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, error);
    throw error;
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
