import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getApiBaseUrl,
  setApiBaseUrl,
  testApiConnection,
  DEFAULT_LOCAL_API_URL,
  DEFAULT_CLOUD_API_URL,
  isNativePlatform
} from '../services/api';
import {
  BookOpen,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Settings,
  Wifi,
  Globe,
  CheckCircle,
  XCircle,
  RefreshCw,
  X
} from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Server Settings Modal State
  const [showServerModal, setShowServerModal] = useState(false);
  const [currentServerUrl, setCurrentServerUrl] = useState(() => getApiBaseUrl());
  const [inputServerUrl, setInputServerUrl] = useState(() => getApiBaseUrl());
  const [testingPing, setTestingPing] = useState(false);
  const [pingStatus, setPingStatus] = useState(null); // { success: boolean, message: string }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email.trim(), password.trim());
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenServerModal = () => {
    setInputServerUrl(getApiBaseUrl());
    setPingStatus(null);
    setShowServerModal(true);
  };

  const handleTestPing = async (urlToTest) => {
    const url = (urlToTest || inputServerUrl).trim();
    if (!url) return;
    setTestingPing(true);
    setPingStatus(null);

    const result = await testApiConnection(url);
    setTestingPing(false);

    if (result.success) {
      setPingStatus({
        success: true,
        message: 'Connected! Server is online and responsive.'
      });
    } else {
      setPingStatus({
        success: false,
        message: `Failed to connect (${result.error || 'Server unreachable'}). Ensure PC backend is running and phone is on same Wi-Fi.`
      });
    }
  };

  const handleSaveServer = () => {
    const trimmed = inputServerUrl.trim();
    setApiBaseUrl(trimmed);
    setCurrentServerUrl(getApiBaseUrl());
    setShowServerModal(false);
    setError('');
  };

  const isLocalServer = currentServerUrl.includes('192.168') || currentServerUrl.includes('localhost') || currentServerUrl.includes('127.0.0.1');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Brand Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 mb-4 ring-4 ring-indigo-500/20">
          <BookOpen className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Class<span className="text-indigo-400">Sathi</span>
        </h1>
        <p className="mt-1 text-sm font-medium text-indigo-200">
          Class 9 & 10 Attendance Management System
        </p>
        <div className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-900/60 border border-indigo-700/50 text-[11px] font-semibold text-indigo-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Official Administrator Access Only</span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex flex-col space-y-2 text-rose-700 text-xs">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span className="leading-relaxed">{error}</span>
                </div>
                {(error.includes('Failed to reach') || error.includes('network') || error.includes('Wi-Fi') || error.includes('Server')) && (
                  <button
                    type="button"
                    onClick={handleOpenServerModal}
                    className="self-start inline-flex items-center space-x-1 text-indigo-600 font-bold hover:underline cursor-pointer pt-1"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Open Server Settings & Test Connection</span>
                  </button>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                  autoComplete="email"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  autoComplete="current-password"
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-600/30 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In as Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Server Connection Indicator & Configuration Toggle */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center space-x-1.5 truncate max-w-[240px]">
              {isLocalServer ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              )}
              <span className="truncate text-[11px]" title={currentServerUrl}>
                {isLocalServer ? 'Wi-Fi Server' : 'Cloud Server'}: {currentServerUrl.replace(/^https?:\/\//, '')}
              </span>
            </div>
            <button
              type="button"
              onClick={handleOpenServerModal}
              className="inline-flex items-center space-x-1 font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer text-[11px]"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Change</span>
            </button>
          </div>
        </div>
      </div>

      {/* Server Connection Modal */}
      {showServerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Backend Server Settings</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowServerModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-3">
              Configure which backend server the mobile app connects to. Make sure your phone and PC are on the same Wi-Fi network when using Local Wi-Fi.
            </p>

            {/* Quick Preset Buttons */}
            <div className="mt-4 space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Quick Presets
              </label>

              {/* Preset 1: Local Wi-Fi */}
              <button
                type="button"
                onClick={() => {
                  setInputServerUrl(DEFAULT_LOCAL_API_URL);
                  handleTestPing(DEFAULT_LOCAL_API_URL);
                }}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                  inputServerUrl === DEFAULT_LOCAL_API_URL
                    ? 'border-indigo-500 bg-indigo-50/60'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Wifi className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Local PC Server (Wi-Fi)</span>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                      Recommended
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">{DEFAULT_LOCAL_API_URL}</div>
                </div>
              </button>

              {/* Preset 2: Cloud Vercel */}
              <button
                type="button"
                onClick={() => {
                  setInputServerUrl(DEFAULT_CLOUD_API_URL);
                  handleTestPing(DEFAULT_CLOUD_API_URL);
                }}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                  inputServerUrl === DEFAULT_CLOUD_API_URL
                    ? 'border-indigo-500 bg-indigo-50/60'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Globe className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-800">Cloud Server</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">{DEFAULT_CLOUD_API_URL}</div>
                </div>
              </button>
            </div>

            {/* Custom Input */}
            <div className="mt-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Server Base URL
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputServerUrl}
                  onChange={(e) => {
                    setInputServerUrl(e.target.value);
                    setPingStatus(null);
                  }}
                  placeholder="e.g. http://192.168.30.247:5000/api"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => handleTestPing(inputServerUrl)}
                  disabled={testingPing}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingPing ? 'animate-spin text-indigo-600' : ''}`} />
                  <span>{testingPing ? 'Testing...' : 'Test'}</span>
                </button>
              </div>
            </div>

            {/* Ping Status Feedback */}
            {pingStatus && (
              <div
                className={`mt-3 p-2.5 rounded-xl text-xs flex items-start space-x-2 border ${
                  pingStatus.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {pingStatus.success ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span className="leading-snug">{pingStatus.message}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowServerModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveServer}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                Save & Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
