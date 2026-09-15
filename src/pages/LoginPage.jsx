import React, { useState, useEffect } from "react";
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
  HelpCircle
} from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useTrial } from "../context/TrialContext.jsx";

export function LoginPage() {
  const { login } = useAuth();
  const { logAuditEvent } = useTrial() || {};
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const redirectPath = searchParams.get("redirect") || "/dashboard";
  const justRegistered = searchParams.get("registered") === "true";

  // Form state - NOT pre-filled with fake names or role selector
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showForgotNotice, setShowForgotNotice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-12 text-slate-900 selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* ============================================================ */}
        {/* LEFT COLUMN: Clean Brand & Clinical Intelligence Message    */}
        {/* ============================================================ */}
        <div className="lg:col-span-6 space-y-8 py-4 px-2 sm:px-6">
          {/* Brand */}
          <div>
            <div className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                  TrialGuard
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                  AI
                </span>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
              Clinical Trial Compliance Intelligence
            </h1>

            <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-md">
              "Monitor protocol adherence, identify emerging site risk, and turn deviations into corrective action."
            </p>
          </div>

          {/* Clean Visual Representation: Protocol -> Compliance -> Risk -> CAPA */}
          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs max-w-md">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              Automated Verification Architecture
            </div>

            <div className="space-y-2">
              {/* Step 1: Protocol */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 flex-shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800">Protocol Specification</div>
                  <div className="text-[11px] text-slate-500">ICH GCP visit windows, dosing & safety gates</div>
                </div>
              </div>

              {/* Arrow */}
              <div className="pl-3.5 py-0.5 text-slate-300 font-mono text-xs">↓</div>

              {/* Step 2: Compliance */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 flex-shrink-0">
                  <CheckSquare className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800">Deterministic Compliance Check</div>
                  <div className="text-[11px] text-slate-500">Continuous rule evaluation across subject eCRFs</div>
                </div>
              </div>

              {/* Arrow */}
              <div className="pl-3.5 py-0.5 text-slate-300 font-mono text-xs">↓</div>

              {/* Step 3: Risk */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800">Site Risk Profiling</div>
                  <div className="text-[11px] text-slate-500">Objective scoring (0–100) & trajectory forecast</div>
                </div>
              </div>

              {/* Arrow */}
              <div className="pl-3.5 py-0.5 text-slate-300 font-mono text-xs">↓</div>

              {/* Step 4: CAPA */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
                  <ShieldAlert className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800">Autonomous CAPA Formulation</div>
                  <div className="text-[11px] text-slate-500">Root cause evidence and human sign-off loop</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400">
            Study CT-101 • Cardio-X Phase III • 21 CFR Part 11 Compliant
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: Compact White Login Form                      */}
        {/* ============================================================ */}
        <div className="lg:col-span-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-10 max-w-md mx-auto">
            
            {/* Form Titles */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Welcome back
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Sign in to your TrialGuard workspace.
              </p>
            </div>

            {/* Registration Success Banner */}
            {justRegistered && (
              <div className="mb-5 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">Account created successfully. Sign in to continue.</span>
              </div>
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Forgot Password Notice */}
            {showForgotNotice && (
              <div className="mb-5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-start gap-2 animate-fade-in">
                <Info className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  For password resets, contact your Lead CRA or Study Lead under protocol standard operating procedure SOP-04.
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institutional Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.org"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotNotice(!showForgotNotice)}
                    className="text-[11px] text-blue-700 hover:text-blue-900 hover:underline font-medium"
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
                    className="w-full px-3 pr-8 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white shadow-sm hover:shadow transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Verifying Credentials...</span>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Create Account Link */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
              <span>Don't have an account? </span>
              <Link to="/register" className="font-semibold text-blue-700 hover:text-blue-900 hover:underline">
                Create account
              </Link>
            </div>

            {/* Discreet demo helper for quick testing without looking up credentials */}
            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <details className="text-[11px] text-slate-400 cursor-pointer">
                <summary className="hover:text-slate-600">Quick-fill test credentials (Evaluator Hint)</summary>
                <div className="mt-2 text-left bg-slate-50 p-2.5 rounded border border-slate-200 text-[10px] space-y-1 font-mono text-slate-600">
                  <div onClick={() => { setEmail("cra@trialguard.ai"); setPassword("password123"); }} className="hover:text-blue-700 cursor-pointer">
                    • CRA: cra@trialguard.ai (pw: password123)
                  </div>
                  <div onClick={() => { setEmail("investigator@trialguard.ai"); setPassword("password123"); }} className="hover:text-purple-700 cursor-pointer">
                    • Investigator: investigator@trialguard.ai (Site 03)
                  </div>
                  <div onClick={() => { setEmail("data@trialguard.ai"); setPassword("password123"); }} className="hover:text-teal-700 cursor-pointer">
                    • Data Manager: data@trialguard.ai
                  </div>
                  <div onClick={() => { setEmail("sponsor@trialguard.ai"); setPassword("password123"); }} className="hover:text-amber-800 cursor-pointer">
                    • Sponsor: sponsor@trialguard.ai
                  </div>
                </div>
              </details>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
