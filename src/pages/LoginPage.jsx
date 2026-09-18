import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  CheckSquare, 
  AlertTriangle, 
  ShieldAlert, 
  Info,
  Sparkles,
  Lock,
  Users,
  Building2,
  Database,
  Award,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useTrial } from "../context/TrialContext.jsx";
import { TabletMonitoringIllustration } from "../components/ClinicalIllustrations.jsx";

export function LoginPage() {
  const { login } = useAuth();
  const { logAuditEvent } = useTrial() || {};
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const redirectPath = searchParams.get("redirect") || "/dashboard";
  const justRegistered = searchParams.get("registered") === "true";

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showForgotNotice, setShowForgotNotice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeQuickRole, setActiveQuickRole] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both your institutional email and password.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      try {
        const session = login(email.trim(), password);

        // Record audit event
        if (logAuditEvent) {
          logAuditEvent({
            action: "USER_LOGIN",
            entityType: "AUTHENTICATION",
            entityId: session.userId || session.id,
            details: `User ${session.name} (${session.email}) signed in with role ${session.roleTitle}${session.assignedSite ? ` [${session.assignedSite}]` : ""}.`,
            performedBy: session.name,
            role: session.role
          });
        }

        setIsLoading(false);
        navigate(redirectPath, { replace: true });
      } catch (err) {
        setIsLoading(false);
        setErrorMessage(err.message || "Invalid credentials. Please verify your email and password.");
      }
    }, 250);
  };

  const setEvaluatorCredentials = (roleKey, em, pw) => {
    setEmail(em);
    setPassword(pw);
    setActiveQuickRole(roleKey);
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-slate-50/70 prohealth-mesh flex flex-col justify-center p-4 sm:p-6 lg:p-12 text-slate-900 selection:bg-blue-600 selection:text-white">
      
      {/* Back to Platform Overview Pill */}
      <div className="max-w-6xl w-full mx-auto mb-4">
        <Link 
          to="/landing" 
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-blue-700 bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-xs transition-all hover:scale-105"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Platform Overview & Architecture</span>
        </Link>
      </div>

      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* ============================================================ */}
        {/* LEFT COLUMN: Modern ProHealth Brand & Medical Illustration  */}
        {/* ============================================================ */}
        <div className="lg:col-span-6 space-y-6 py-2 px-2 sm:px-4">
          {/* Brand */}
          <div>
            <div className="inline-flex items-center gap-2.5 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-glow">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                  TrialGuard
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  AI
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              Clinical Trial Compliance Intelligence
            </h1>

            <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-lg">
              Automated deterministic verification, multi-site risk trajectories, and autonomous root-cause CAPAs for ICH GCP & FDA 21 CFR Part 11 protocols.
            </p>
          </div>

          {/* Visual Tablet Showcase Card */}
          <div className="prohealth-card bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-blue-100/90 shadow-glass relative max-w-md hidden sm:block">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800">Study CT-101 • Phase III</span>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Live Ingestion
              </span>
            </div>

            <div className="flex justify-center py-2">
              <TabletMonitoringIllustration className="w-64 h-auto drop-shadow-sm" />
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-left">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Enrolled Cohort</div>
                <div className="text-sm font-extrabold text-slate-900">104 Patients</div>
              </div>
              <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
                <div className="text-[10px] font-bold text-blue-600 uppercase">Verification Engine</div>
                <div className="text-sm font-extrabold text-blue-900">Deterministic</div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>21 CFR Part 11 Compliant Electronic Records & Signatures</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: Modern White ProHealth Login Card             */}
        {/* ============================================================ */}
        <div className="lg:col-span-6">
          <div className="prohealth-card bg-white/95 backdrop-blur-xl border border-blue-100 rounded-3xl shadow-glass p-6 sm:p-10 max-w-md mx-auto">
            
            {/* Form Titles */}
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Welcome back
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Sign in to your TrialGuard operational workspace.
              </p>
            </div>

            {/* Registration Success Banner */}
            {justRegistered && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">Account created successfully. Sign in to continue.</span>
              </div>
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Forgot Password Notice */}
            {showForgotNotice && (
              <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-start gap-2 animate-fade-in">
                <Info className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  For password resets, contact your Lead CRA or Study Lead under protocol standard operating procedure SOP-04.
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Institutional Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.org"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50/60 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotNotice(!showForgotNotice)}
                    className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 pr-9 py-2.5 text-xs bg-slate-50/60 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 active:scale-[0.99] text-white shadow-glow hover:shadow-float transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Verifying Credentials...</span>
                  ) : (
                    <>
                      <span>Sign In to Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Evaluator Role Chips */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Quick Role Switcher
                </span>
                <span className="text-[10px] text-blue-600 font-semibold">1-Click Sign In</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEvaluatorCredentials("cra", "cra@trialguard.ai", "password123")}
                  className={`p-2 rounded-xl text-left border text-xs transition-all ${
                    activeQuickRole === "cra"
                      ? "bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-500"
                      : "bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-blue-50/50 hover:border-blue-200"
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-blue-600" />
                    <span>Lead CRA</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">Trial-wide scope</div>
                </button>

                <button
                  type="button"
                  onClick={() => setEvaluatorCredentials("investigator", "investigator@trialguard.ai", "password123")}
                  className={`p-2 rounded-xl text-left border text-xs transition-all ${
                    activeQuickRole === "investigator"
                      ? "bg-purple-50 border-purple-500 text-purple-900 ring-1 ring-purple-500"
                      : "bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-purple-50/50 hover:border-purple-200"
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <Building2 className="w-3 h-3 text-purple-600" />
                    <span>Investigator</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">Site 03 Scoped</div>
                </button>

                <button
                  type="button"
                  onClick={() => setEvaluatorCredentials("data", "data@trialguard.ai", "password123")}
                  className={`p-2 rounded-xl text-left border text-xs transition-all ${
                    activeQuickRole === "data"
                      ? "bg-teal-50 border-teal-500 text-teal-900 ring-1 ring-teal-500"
                      : "bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-teal-50/50 hover:border-teal-200"
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <Database className="w-3 h-3 text-teal-600" />
                    <span>Data Manager</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">eCRF Quality Suite</div>
                </button>

                <button
                  type="button"
                  onClick={() => setEvaluatorCredentials("sponsor", "sponsor@trialguard.ai", "password123")}
                  className={`p-2 rounded-xl text-left border text-xs transition-all ${
                    activeQuickRole === "sponsor"
                      ? "bg-amber-50 border-amber-500 text-amber-900 ring-1 ring-amber-500"
                      : "bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-amber-50/50 hover:border-amber-200"
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <Award className="w-3 h-3 text-amber-600" />
                    <span>Sponsor</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">Executive Oversight</div>
                </button>
              </div>
            </div>

            {/* Create Account Link */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              <span>Don't have an account? </span>
              <Link to="/register" className="font-bold text-blue-600 hover:text-blue-800 hover:underline">
                Create clinical account
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
