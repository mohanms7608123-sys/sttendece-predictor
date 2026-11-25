import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  School,
  GraduationCap,
  ArrowRight,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Lock,
  Building2,
  Database,
  BarChart3,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-slate-800/80 px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-40 bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-2">
              Smart Attendance & Predictor System
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                SaaS Enterprise
              </span>
            </h1>
            <p className="text-xs text-slate-400">Accurate Forecasting, Multi-Tenancy & Student Success</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Backend Isolated Engine Online
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-12 max-w-6xl mx-auto text-center flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 mx-auto">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Role-Based Multi-Portal Architecture
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          Next-Gen Academic Attendance & Predictive Risk Intelligence
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mt-4 leading-relaxed">
          Empowering Super Admins, College Administrators, and Students with real-time class tracking, mathematical attendance prediction, and instant shortfall alerts.
        </p>

        {/* 3 User Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left">
          {/* 1. Super Admin Card */}
          <div className="rounded-2xl p-6 bg-slate-800/60 border border-slate-700/80 hover:border-indigo-500/60 transition-all hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Super Admin</h3>
              <p className="text-xs text-indigo-300 font-medium mt-0.5">Platform Controller</p>
              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                Central oversight of all registered colleges, administrators, enrolled students, cross-college attendance analytics, and activity audit logs.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-700/60 flex flex-col gap-2">
              <button
                onClick={() => navigate('/super-admin/login')}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white flex items-center justify-center gap-2 transition-colors shadow-md shadow-indigo-600/30"
              >
                <span>Super Admin Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2. College Admin Card */}
          <div className="rounded-2xl p-6 bg-slate-800/60 border border-slate-700/80 hover:border-blue-500/60 transition-all hover:shadow-xl hover:shadow-blue-500/10 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <School className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">College Admin</h3>
              <p className="text-xs text-blue-300 font-medium mt-0.5">Institution Management</p>
              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                Add and manage curriculum subjects, update conducted class hours, monitor students at risk, and address student grievances with tenant data isolation.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-700/60 flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigate('/college-admin/login')}
                  className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-blue-600/30"
                >
                  <span>Admin Login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => navigate('/college-admin/register')}
                  className="py-2.5 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 font-semibold text-xs text-slate-200 transition-colors"
                >
                  Register
                </button>
              </div>
            </div>
          </div>

          {/* 3. Student Card */}
          <div className="rounded-2xl p-6 bg-slate-800/60 border border-slate-700/80 hover:border-emerald-500/60 transition-all hover:shadow-xl hover:shadow-emerald-500/10 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Student Portal</h3>
              <p className="text-xs text-emerald-300 font-medium mt-0.5">Attendance & Predictor</p>
              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                Connect via unique College Secret Code, track real-time attendance, simulate future absences, calculate required classes, and file complaints.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-700/60 flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigate('/student/login')}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-emerald-600/30"
                >
                  <span>Student Login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => navigate('/student/register')}
                  className="py-2.5 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 font-semibold text-xs text-slate-200 transition-colors"
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Prediction Engine Showcase */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-slate-800/40 border border-slate-800 text-left">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-6">
            <div>
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-400" />
                Attendance Prediction Formula Engine
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Deterministic mathematical forecasting engine computed on both server and client:
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 font-mono">P = Planned</span>
              <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-400 font-mono">H = Conducted</span>
              <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-400 font-mono">A = Attended</span>
              <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 font-mono">M = Min %</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-4 h-4" />
                1. ELIGIBLE
              </div>
              <p className="text-xs text-slate-300 font-medium">
                "Congratulations! You have achieved the minimum attendance requirement."
              </p>
              <div className="mt-3 text-[11px] text-slate-400">
                Formula: <code className="text-emerald-300 font-mono">Current % ≥ M</code> or <code className="text-emerald-300 font-mono">A ≥ ceil(P × M / 100)</code>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/30">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
                <AlertTriangle className="w-4 h-4" />
                2. AT RISK
              </div>
              <p className="text-xs text-slate-300 font-medium">
                "Your attendance is below the required percentage. You must attend [X] more classes to reach the target."
              </p>
              <div className="mt-3 text-[11px] text-slate-400">
                Formula: <code className="text-amber-300 font-mono">Classes Required ≤ Remaining Classes</code>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-rose-500/30">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-2">
                <XCircle className="w-4 h-4" />
                3. UNREACHABLE
              </div>
              <p className="text-xs text-slate-300 font-medium">
                "Attendance Target Unreachable. Even if you attend all remaining classes, you cannot achieve the required attendance percentage."
              </p>
              <div className="mt-3 text-[11px] text-slate-400">
                Formula: <code className="text-rose-300 font-mono">Classes Required &gt; Remaining Classes</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 px-6 text-center text-xs text-slate-500 bg-slate-950">
        <p>Smart Student Attendance and Predictor System &bull; Production Enterprise Architecture</p>
      </footer>
    </div>
  );
};
