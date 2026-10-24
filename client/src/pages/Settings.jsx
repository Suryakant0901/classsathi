import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  authAPI,
  getApiBaseUrl,
  setApiBaseUrl,
  testApiConnection,
  DEFAULT_LOCAL_API_URL,
  DEFAULT_CLOUD_API_URL
} from '../services/api';
import {
  Settings as SettingsIcon,
  User,
  School,
  Lock,
  CheckCircle,
  AlertCircle,
  Database,
  Save,
  ShieldCheck,
  Wifi,
  Globe,
  RefreshCw,
  XCircle
} from 'lucide-react';

const Settings = () => {
  const { user, updateUser } = useAuth();

  // Server Settings State
  const [serverUrl, setServerUrlState] = useState(() => getApiBaseUrl());
  const [serverTesting, setServerTesting] = useState(false);
  const [serverStatus, setServerStatus] = useState(null);
  const [serverSuccessMsg, setServerSuccessMsg] = useState('');

  // Profile Form
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Administrator',
    schoolName: user?.schoolName || 'ClassSathi Academy (Class 9 & 10)',
    teacherTitle: user?.teacherTitle || 'Headmaster / Class Teacher'
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  // Password Form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);

  // Save Profile Changes
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setProfileSaving(true);
      setProfileMessage(null);
      const res = await authAPI.updateProfile(profileData);
      if (res.success) {
        updateUser(res.data);
        setProfileMessage({ type: 'success', text: 'School & Administrator profile updated successfully!' });
      }
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setProfileSaving(false);
    }
  };

  // Save Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }

    try {
      setPasswordSaving(true);
      setPasswordMessage(null);
      const res = await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (res.success) {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.message || 'Failed to change password' });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <span>Settings & Administrator Profile</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure your school name, administrator details, and secure login password.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <School className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">School & Teacher Details</h3>
                <p className="text-[11px] text-slate-500">Appears on attendance sheets & PDF exports</p>
              </div>
            </div>

            {profileMessage && (
              <div
                className={`mt-4 p-3 rounded-xl text-xs font-medium flex items-center space-x-2 ${
                  profileMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {profileMessage.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{profileMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  School / Institution Name
                </label>
                <input
                  type="text"
                  required
                  value={profileData.schoolName}
                  onChange={(e) => setProfileData({ ...profileData, schoolName: e.target.value })}
                  placeholder="e.g. Government Higher Secondary School"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Administrator / Father's Name
                </label>
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="e.g. Shri Suryakant Chaturvedi"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Designation / Teacher Title
                </label>
                <input
                  type="text"
                  value={profileData.teacherTitle}
                  onChange={(e) => setProfileData({ ...profileData, teacherTitle: e.target.value })}
                  placeholder="e.g. Class 9 & 10 Teacher / Headmaster"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Login Email (Read-only)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || 'admin@classsathi.com'}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{profileSaving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Change Admin Password</h3>
                <p className="text-[11px] text-slate-500">Keep administrator access secure</p>
              </div>
            </div>

            {passwordMessage && (
              <div
                className={`mt-4 p-3 rounded-xl text-xs font-medium flex items-center space-x-2 ${
                  passwordMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {passwordMessage.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{passwordMessage.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  New Password (Min. 6 chars)
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>{passwordSaving ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Backend Server Connection Settings Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Backend Server Connection</h3>
              <p className="text-[11px] text-slate-500">Configure host API endpoint for mobile APK & browser</p>
            </div>
          </div>

          <span className="font-mono text-[11px] bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 font-bold self-start sm:self-auto">
            Active: {getApiBaseUrl()}
          </span>
        </div>

        {serverSuccessMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{serverSuccessMsg}</span>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={async () => {
              setServerUrlState(DEFAULT_LOCAL_API_URL);
              setServerTesting(true);
              const res = await testApiConnection(DEFAULT_LOCAL_API_URL);
              setServerTesting(false);
              setServerStatus(res);
            }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start space-x-3 ${
              serverUrl === DEFAULT_LOCAL_API_URL
                ? 'border-indigo-500 bg-indigo-50/50'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Wifi className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-800">Local Wi-Fi PC Server</div>
              <div className="text-[11px] font-mono text-slate-500">{DEFAULT_LOCAL_API_URL}</div>
            </div>
          </button>

          <button
            type="button"
            onClick={async () => {
              setServerUrlState(DEFAULT_CLOUD_API_URL);
              setServerTesting(true);
              const res = await testApiConnection(DEFAULT_CLOUD_API_URL);
              setServerTesting(false);
              setServerStatus(res);
            }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start space-x-3 ${
              serverUrl === DEFAULT_CLOUD_API_URL
                ? 'border-indigo-500 bg-indigo-50/50'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Globe className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-800">Cloud Server</div>
              <div className="text-[11px] font-mono text-slate-500">{DEFAULT_CLOUD_API_URL}</div>
            </div>
          </button>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            value={serverUrl}
            onChange={(e) => {
              setServerUrlState(e.target.value);
              setServerStatus(null);
            }}
            placeholder="http://192.168.30.247:5000/api"
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="button"
            onClick={async () => {
              setServerTesting(true);
              setServerStatus(null);
              const res = await testApiConnection(serverUrl);
              setServerTesting(false);
              setServerStatus(res);
            }}
            disabled={serverTesting}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center justify-center space-x-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${serverTesting ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{serverTesting ? 'Testing...' : 'Test Ping'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setApiBaseUrl(serverUrl);
              setServerSuccessMsg('Server URL saved! Application is now routed to ' + getApiBaseUrl());
              setTimeout(() => setServerSuccessMsg(''), 4000);
            }}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Save URL
          </button>
        </div>

        {serverStatus && (
          <div
            className={`mt-3 p-2.5 rounded-xl flex items-center space-x-2 border ${
              serverStatus.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {serverStatus.success ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>
              {serverStatus.success
                ? 'Ping successful! Server is online and responding.'
                : `Ping failed: ${serverStatus.error || 'Server unreachable'}`}
            </span>
          </div>
        )}
      </div>

      {/* Database & Architecture Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs text-xs">
        <div className="flex items-center space-x-2 text-slate-800 font-bold mb-2">
          <Database className="w-4 h-4 text-indigo-600" />
          <span>Single MongoDB Architecture</span>
        </div>
        <p className="text-slate-600 leading-relaxed">
          All data including students, daily attendance sheets, monthly registers, audit trails, and administrator profiles are permanently saved in a unified MongoDB database (<code className="bg-slate-100 text-indigo-600 px-1 py-0.5 rounded font-mono">classsathi_attendance</code>). No temporary browser storage is used. Everything remains permanently accessible after logout or refresh.
        </p>
      </div>
    </div>
  );
};

export default Settings;
