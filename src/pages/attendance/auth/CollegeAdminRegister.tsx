import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAttendanceAuth } from '@/contexts/AttendanceAuthContext';
import { School, Lock, Mail, User, KeyRound, ArrowLeft, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export const CollegeAdminRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    adminName: '',
    email: '',
    password: '',
    confirmPassword: '',
    collegeName: '',
    collegeEmail: '',
    collegeSecretCode: 'APEX2026',
  });
  const [loading, setLoading] = useState(false);
  const { registerCollegeAdmin } = useAttendanceAuth();
  const navigate = useNavigate();

  // Password rule tests
  const hasMinLen = formData.password.length >= 8;
  const hasUpper = /[A-Z]/.test(formData.password);
  const hasLower = /[a-z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password);
  const passwordsMatch = formData.password && formData.password === formData.confirmPassword;

  const isPasswordValid = hasMinLen && hasUpper && hasLower && hasNumber && hasSpecial && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error('Please fulfill all password security requirements.');
      return;
    }

    if (!formData.collegeSecretCode.trim()) {
      toast.error('College Secret Code is required.');
      return;
    }

    setLoading(true);
    try {
      await registerCollegeAdmin(formData);
      navigate('/college-admin/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 text-white relative">
      <Link
        to="/"
        className="absolute top-6 left-6 text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Portal Selector
      </Link>

      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-600/10">
            <School className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">College Admin Registration</h2>
          <p className="text-xs text-slate-400 mt-1">Link your administrator account to an approved college</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Dr. John Doe"
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Email *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="admin@college.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">College Name</label>
              <input
                type="text"
                placeholder="e.g. Apex Institute of Technology"
                value={formData.collegeName}
                onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">College Email</label>
              <input
                type="email"
                placeholder="contact@college.edu"
                value={formData.collegeEmail}
                onChange={(e) => setFormData({ ...formData, collegeEmail: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-300 mb-1">College Secret Code *</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="Enter approved College Secret Code (e.g. APEX2026)"
                value={formData.collegeSecretCode}
                onChange={(e) => setFormData({ ...formData, collegeSecretCode: e.target.value.toUpperCase() })}
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-amber-500/50 rounded-xl text-xs font-mono font-bold tracking-wider text-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Must match an approved college registered by Super Admin (e.g., <code className="text-amber-300 font-mono">APEX2026</code> or <code className="text-amber-300 font-mono">METRO2026</code>).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Min 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Password Validation Checklist */}
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 text-[11px] space-y-1.5">
            <p className="font-semibold text-slate-300 mb-1">Password Security Requirements:</p>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <span className={`flex items-center gap-1.5 ${hasMinLen ? 'text-emerald-400' : 'text-slate-500'}`}>
                {hasMinLen ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                At least 8 characters
              </span>
              <span className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-400' : 'text-slate-500'}`}>
                {hasUpper ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                1 uppercase letter
              </span>
              <span className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-400' : 'text-slate-500'}`}>
                {hasLower ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                1 lowercase letter
              </span>
              <span className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                1 number
              </span>
              <span className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
                {hasSpecial ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                1 special character
              </span>
              <span className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-400' : 'text-slate-500'}`}>
                {passwordsMatch ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                Passwords match
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isPasswordValid}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registering College Admin...</span>
              </>
            ) : (
              <span>Register College Administrator</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          <span>Already have an administrator account? </span>
          <Link to="/college-admin/login" className="text-blue-400 hover:text-blue-300 font-semibold underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
