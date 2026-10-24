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
    // Default mobile app to the local Wi-Fi PC server running backend
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
          ? 'Connection timed out (4s). Ensure server is running and device is on same network.'
          : err.message || 'Server unreachable'
    };
  }
};

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

  const baseUrl = getApiBaseUrl();

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, config);
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
              ? `Backend service temporarily unavailable (${response.status}). Please check network/server settings.`
              : text || `Server error (${response.status})`
        };
      }
    }

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
    if (
      error.name === 'TypeError' &&
      (error.message.includes('fetch') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError') ||
        error.message.includes('Network request failed'))
    ) {
      throw new Error(
        `Failed to reach backend server (${baseUrl}). Please ensure your PC server is running and phone is on the same Wi-Fi / hotspot, or configure the Server Connection in settings below.`
      );
    }
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
