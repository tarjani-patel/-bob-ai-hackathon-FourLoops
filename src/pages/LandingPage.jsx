import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Activity, 
  FileText, 
  Users, 
  Building2, 
  AlertTriangle, 
  ShieldAlert, 
  TrendingUp, 
  Lock, 
  Sparkles,
  Award,
  ChevronRight,
  Database,
  Search,
  Clock,
  HeartPulse,
  BarChart3,
  Check
} from "lucide-react";
import { 
  DoctorTeamIllustration, 
  TabletMonitoringIllustration, 
  OrganicWaveDivider,
  AuditSealIllustration 
} from "../components/ClinicalIllustrations.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { ROLES, ROLE_DEFINITIONS } from "../auth/roleConfig.js";

export function LandingPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const handleQuickLogin = (email) => {
    try {
      login(email, "password123");
      navigate("/dashboard");
    } catch (e) {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col">
      {/* ============================================================ */}
      {/* 1. TOP NAVIGATION HEADER (ProHealth Glassmorphic)           */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 border-b border-blue-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/landing" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  TrialGuard
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                  AI
                </span>
              </div>
              <p className="text-[10px] font-semibold text-slate-500 tracking-wide uppercase">
                Clinical Compliance Copilot
              </p>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#architecture" className="hover:text-blue-600 transition-colors">
              Architecture
            </a>
            <a href="#personas" className="hover:text-blue-600 transition-colors">
              Clinical Roles
            </a>
            <a href="#protocol" className="hover:text-blue-600 transition-colors">
              Protocol CT-101
            </a>
            <a href="#compliance" className="hover:text-blue-600 transition-colors">
              Regulatory
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-glow transition-all hover:scale-105"
              >
                <span>Go to Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors hidden sm:block"
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-glow transition-all hover:scale-105"
                >
                  <span>Launch Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. HERO SECTION (ProHealth Airy Mesh + Line-Art Team)        */}
      {/* ============================================================ */}
      <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden prohealth-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-800 text-xs font-bold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span>ICH GCP E6(R2) • 21 CFR Part 11 Automated Intelligence</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Autonomous Clinical Trial{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600">
                  Compliance Intelligence
                </span>
              </h1>

              {/* Tagline */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                Replace error-prone monitoring spreadsheets with continuous deterministic protocol verification, proactive site risk trajectories, and autonomous root-cause CAPA generation.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-float transition-all hover:scale-105"
                >
                  <span>Launch Live Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#architecture"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold bg-white/90 hover:bg-white text-slate-700 hover:text-blue-600 border border-slate-200 shadow-xs transition-all"
                >
                  <span>Explore Architecture</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/70 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-extrabold text-slate-900">104</div>
                  <div className="text-xs font-semibold text-slate-500">Enrolled Subjects</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-blue-600">99.4%</div>
                  <div className="text-xs font-semibold text-slate-500">Rule Adherence</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-emerald-600">0%</div>
                  <div className="text-xs font-semibold text-slate-500">AI Hallucination</div>
                </div>
              </div>
            </div>

            {/* Hero Right Visual: Line-art Illustration + Floating Metric Badges */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="relative w-full max-w-lg">
                {/* Ambient glow sphere */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 to-sky-300/30 rounded-3xl blur-2xl -z-10" />

                {/* Main Illustration Wrapper */}
                <div className="prohealth-card p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-glass relative">
                  <DoctorTeamIllustration className="w-full h-auto drop-shadow-sm" />

                  {/* Floating Metric 1 (Top Left) */}
                  <div className="absolute -top-4 -left-4 sm:-left-6 bg-white rounded-2xl p-3.5 shadow-float border border-blue-100/80 flex items-center gap-3 animate-soft-float">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Protocol CT-101</div>
                      <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> 5 Active Clinical Sites
                      </div>
                    </div>
                  </div>

                  {/* Floating Metric 2 (Bottom Right) */}
                  <div className="absolute -bottom-5 -right-4 sm:-right-6 bg-white rounded-2xl p-3.5 shadow-float border border-blue-100/80 flex items-center gap-3 animate-soft-float" style={{ animationDelay: "1.8s" }}>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Deterministic Gate</div>
                      <div className="text-[11px] text-slate-500 font-semibold">100% Mathematical Precision</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Smooth Organic Wave Divider to next section */}
        <div className="mt-16 sm:mt-20">
          <OrganicWaveDivider fill="#ffffff" className="w-full text-white h-12 sm:h-16" />
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. DETERMINISTIC ARCHITECTURE SECTION (4 Step Flow)          */}
      {/* ============================================================ */}
      <section id="architecture" className="py-16 md:py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
              Zero-Hallucination Framework
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              4-Pillar Continuous Compliance Architecture
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
              Unlike probabilistic chat bots, TrialGuard AI combines strict deterministic logic gates with generative root-cause analysis for verifiable audit readiness.
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="prohealth-card p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-float hover:border-blue-300 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <FileText className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Pillar 01</div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Protocol Specification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Translates protocol criteria into mathematical thresholds: Visit 2 (Day 14 ±3), target 100mg QD dosing, and exclusionary conmed bounds.
              </p>
            </div>

            {/* Step 2 */}
            <div className="prohealth-card p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-float hover:border-sky-300 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition-all">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">Pillar 02</div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Deterministic Verification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every patient eCRF entry is verified deterministically against protocol bounds. Zero chance of AI hallucination on safety lab limits.
              </p>
            </div>

            {/* Step 3 */}
            <div className="prohealth-card p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-float hover:border-amber-300 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Pillar 03</div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Site Risk Trajectory</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Multi-variable scoring (0–100) aggregates deviation severity, unresolved queries, and monitoring intervals into forward-looking site risk bands.
              </p>
            </div>

            {/* Step 4 */}
            <div className="prohealth-card p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-float hover:border-indigo-300 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Pillar 04</div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Autonomous CAPA</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generates 5-Why root cause hypotheses, corrective preventive action plans, and regulatory submission drafts with investigator sign-off.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. 4 CLINICAL PERSONAS SHOWCASE (Interactive Quick Sign-In)   */}
      {/* ============================================================ */}
      <section id="personas" className="py-16 md:py-24 bg-slate-50 relative border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
              Role-Based Compliance Scoping
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Engineered For Every Trial Stakeholder
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
              TrialGuard AI strictly enforces 21 CFR Part 11 and ICH GCP role segregation. Switch roles instantly to test different operational perspectives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Persona 1: CRA */}
            <div className="prohealth-card bg-white rounded-2xl p-6 border border-blue-200/80 shadow-sm hover:shadow-float flex flex-col justify-between transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-mono">
                    CRA
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Lead CRA</h3>
                <div className="text-xs font-semibold text-slate-500 mb-3">Sarah Jenkins, CCRA</div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Monitors trial-wide compliance across all 5 sites. Runs deterministic audits, initiates CAPAs, and monitors deviation lifecycles.
                </p>
                <div className="space-y-1.5 mb-6 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span>Run trial-wide scans</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span>Draft & assign CAPAs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span>Cross-site risk ranking</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleQuickLogin("cra@trialguard.ai")}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <span>Launch as Lead CRA</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Persona 2: Site Investigator */}
            <div className="prohealth-card bg-white rounded-2xl p-6 border border-purple-200/80 shadow-sm hover:shadow-float flex flex-col justify-between transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-mono">
                    PI (Site 03)
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Principal Investigator</h3>
                <div className="text-xs font-semibold text-slate-500 mb-3">Dr. Evelyn Zhao, MD</div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Strictly scoped to Metro General (SITE-03) under 21 CFR 312 GCP isolation. Supervises 22 site participants and resolves local queries.
                </p>
                <div className="space-y-1.5 mb-6 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span>Isolated Site-03 data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span>Patient visit rescheduling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span>Sign off on local CAPAs</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleQuickLogin("investigator@trialguard.ai")}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <span>Launch as Investigator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Persona 3: Clinical Data Manager */}
            <div className="prohealth-card bg-white rounded-2xl p-6 border border-teal-200/80 shadow-sm hover:shadow-float flex flex-col justify-between transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                    <Database className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 font-mono">
                    DATA MGR
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Clinical Data Manager</h3>
                <div className="text-xs font-semibold text-slate-500 mb-3">Marcus Vance, CCDM</div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Focuses on eCRF discrepancies, missing labs, dosage validations, and reconciles queries with full 21 CFR Part 11 change logs.
                </p>
                <div className="space-y-1.5 mb-6 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    <span>eCRF query reconciliation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    <span>Lab data completeness</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    <span>Dosing verification suite</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleQuickLogin("data@trialguard.ai")}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <span>Launch as Data Manager</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Persona 4: Study Sponsor */}
            <div className="prohealth-card bg-white rounded-2xl p-6 border border-amber-200/80 shadow-sm hover:shadow-float flex flex-col justify-between transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Award className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-mono">
                    SPONSOR
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Trial Sponsor</h3>
                <div className="text-xs font-semibold text-slate-500 mb-3">Elena Rostova, VP Ops</div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  High-level executive oversight. Inspects immutable audit logs, authorizes formal CAPAs, and monitors trial submission readiness.
                </p>
                <div className="space-y-1.5 mb-6 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>Executive trial governance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>Final CAPA authorization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>FDA submission analytics</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleQuickLogin("sponsor@trialguard.ai")}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <span>Launch as Sponsor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. PROTOCOL & LIVE TABLET SURVEILLANCE PREVIEW                */}
      {/* ============================================================ */}
      <section id="protocol" className="py-16 md:py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Tablet Monitoring Illustration */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-sky-100 rounded-full blur-2xl -z-10" />
                <TabletMonitoringIllustration className="w-full max-w-sm h-auto drop-shadow-md" />
              </div>
            </div>

            {/* Protocol Rules Checklist */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
                Study Protocol CT-101 (Cardio-X)
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Deterministic Bounds Applied in Real Time
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Every incoming case report form (eCRF) is cross-referenced against exact protocol specifications to guarantee safety and compliance before milestone submission:
              </p>

              <div className="space-y-3.5">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    01
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Visit 2 Window Verification</div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      Must occur exactly 14 calendar days post-baseline with a strict ±3 day tolerance window (Days 11 to 17).
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    02
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Cardio-X Dosing Verification</div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      Investigational medicinal product must be recorded at exactly 100 mg QD. Deviations flagged as Major/Critical.
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    03
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Prohibited Concomitant Medications</div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      Amiodarone and other Class III antiarrhythmics strictly prohibited due to severe QT prolongation interactions.
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/trial-protocol"
                  className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <span>View complete CT-101 Protocol Specification</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. CONTRAST DARK NAVY CTA & FOOTER (abcMD Style)             */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden">
        {/* Wave divider transitioning to navy */}
        <OrganicWaveDivider fill="#0c1b33" className="w-full text-[#0c1b33] h-12 sm:h-16" />

        <footer id="compliance" className="bg-[#0c1b33] text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            
            {/* High-Impact CTA Block */}
            <div className="relative rounded-3xl bg-gradient-to-r from-blue-900/60 to-slate-900/80 border border-blue-500/30 p-8 sm:p-12 mb-16 text-center shadow-2xl overflow-hidden">
              <div className="max-w-3xl mx-auto relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> Ready for Audit Inspection
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
                  Empower Your Trial Team with Deterministic Compliance Assurance
                </h2>
                <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                  Experience automated deviation detection, predictive risk trajectories, and instant 21 CFR Part 11 audit trails right now.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    to="/dashboard"
                    className="w-full sm:w-auto px-8 py-4 rounded-full text-sm font-extrabold bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 shadow-glow transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
                  >
                    <span>Launch TrialGuard AI Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-6 py-4 rounded-full text-sm font-bold text-white hover:text-blue-300 border border-white/20 hover:border-white/40 transition-all text-center"
                  >
                    Create Clinical Account
                  </Link>
                </div>
              </div>
            </div>

            {/* Regulatory Certification Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-12 border-b border-slate-800 text-center">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xs font-bold text-blue-400">FDA 21 CFR Part 11</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Electronic Signatures & Records</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xs font-bold text-sky-400">ICH GCP E6(R2)</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Risk-Based Quality Management</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xs font-bold text-amber-400">FDA 21 CFR 312</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Investigational New Drug Safety</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xs font-bold text-emerald-400">Immutable Audit Trail</div>
                <div className="text-[11px] text-slate-400 mt-0.5">SHA-256 Verified Data Mutations</div>
              </div>
            </div>

            {/* Bottom Footer Links & Info */}
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-bold text-white">TrialGuard AI</span>
                <span>• Cardiovascular Protocol CT-101 Monitoring Platform</span>
              </div>

              <div className="flex items-center gap-6">
                <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                <Link to="/trial-protocol" className="hover:text-white transition-colors">Protocol</Link>
                <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
                <Link to="/register" className="hover:text-white transition-colors">Register</Link>
              </div>
            </div>

            <div className="mt-4 text-center sm:text-left text-[11px] text-slate-500">
              © 2026 TrialGuard AI Systems. Confidential Clinical Trial Management System. All rights reserved.
            </div>

          </div>
        </footer>
      </div>

    </div>
  );
}
