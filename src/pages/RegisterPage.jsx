import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Check, 
  ArrowRight, 
  Building2, 
  AlertCircle,
  FileText,
  Users,
  Database,
  Award,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";
import { ROLES, ROLE_DEFINITIONS, CLINICAL_SITES } from "../auth/roleConfig.js";
import { useTrial } from "../context/TrialContext.jsx";

export function RegisterPage() {
  const { register } = useAuth();
  const { logAuditEvent } = useTrial() || {};
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState(ROLES.CRA);
  const [assignedSite, setAssignedSite] = useState("SITE-03");
  const [showPassword, setShowPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    // 1. Required fields
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Please enter a valid institutional email address.");
      return;
    }

    // 3. Password minimum length
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters in length.");
      return;
    }

    // 4. Password confirmation
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    // 5. Site required for Investigator
    if (selectedRole === ROLES.INVESTIGATOR && !assignedSite) {
      setErrorMessage("Site Investigators must select an assigned clinical investigation site.");
      return;
    }

    setIsSubmitting(true);

    try {
      const newUser = register({
        name: name.trim(),
        email: email.trim(),
        password,
        role: selectedRole,
        assignedSite: selectedRole === ROLES.INVESTIGATOR ? assignedSite : null
      });

      // Automatically log audit event
      if (logAuditEvent) {
        logAuditEvent({
          action: "USER_REGISTERED",
          entityType: "USER",
          entityId: newUser.id,
          details: `New account created: ${newUser.name} (${newUser.email}) registered as ${newUser.roleTitle}${newUser.assignedSite ? ` assigned to ${newUser.assignedSite}` : ""}.`,
          performedBy: newUser.name,
          role: newUser.role
        });
      }

      // Redirect to login with success indicator
      navigate("/login?registered=true", { replace: true });
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage(err.message || "Registration failed. Please verify your details.");
    }
  };

  const getRoleIcon = (roleKey) => {
    switch (roleKey) {
      case ROLES.CRA:
        return Users;
      case ROLES.INVESTIGATOR:
        return Building2;
      case ROLES.DATA_MANAGER:
        return Database;
      case ROLES.SPONSOR:
        return Award;
      default:
        return Users;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 prohealth-mesh flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Back to Platform Overview Pill */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl mb-4 text-left">
        <Link 
          to="/landing" 
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-blue-700 bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-xs transition-all hover:scale-105"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Platform Overview</span>
        </Link>
      </div>

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mb-6">
        <Link to="/landing" className="inline-flex items-center gap-2.5 mb-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-1.5 text-xl font-extrabold tracking-tight text-slate-900">
            <span>TrialGuard</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">AI</span>
          </div>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create your TrialGuard account
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Set up your workspace based on your clinical trial role.
        </p>
      </div>

      {/* Registration Form Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="prohealth-card bg-white/95 backdrop-blur-xl py-8 px-6 sm:px-10 border border-blue-100 rounded-3xl shadow-glass">
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Jane Mitchell, MD"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50/60 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>

            {/* Institutional Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Institutional Email <span className="text-rose-500">*</span>
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

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password <span className="text-rose-500">*</span>
                </label>
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50/60 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Role Selection Cards */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-800 mb-2">
                Select Your Clinical Role <span className="text-rose-500">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.values(ROLES).map((roleKey) => {
                  const roleMeta = ROLE_DEFINITIONS[roleKey];
                  const isSelected = selectedRole === roleKey;
                  const RoleIcon = getRoleIcon(roleKey);

                  return (
                    <div
                      key={roleKey}
                      onClick={() => setSelectedRole(roleKey)}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? "bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 shadow-xs"
                          : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/70 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isSelected ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                            <RoleIcon className="w-3.5 h-3.5" />
                          </div>
                          <span className={`text-xs font-bold ${isSelected ? "text-blue-900" : "text-slate-900"}`}>
                            {roleMeta.label}
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-blue-600 font-bold" />}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal pl-8">
                        {roleMeta.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Conditional Assigned Site Dropdown (When Investigator is selected) */}
            {selectedRole === ROLES.INVESTIGATOR && (
              <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 animate-fade-in space-y-2">
                <label className="block text-xs font-bold text-purple-950">
                  Assigned Clinical Investigation Site <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-purple-800 leading-relaxed">
                  Select the clinical trial site you supervise. Your account will be strictly scoped to this site under 21 CFR 312 GCP site isolation controls.
                </p>
                <select
                  value={assignedSite}
                  onChange={(e) => setAssignedSite(e.target.value)}
                  className="w-full mt-2 px-3.5 py-2.5 text-xs bg-white border border-purple-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all shadow-xs"
                >
                  {CLINICAL_SITES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 active:scale-[0.99] text-white shadow-glow hover:shadow-float transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Clinical Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer link to login */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Already have an account? </span>
            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-800 hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        {/* Regulatory footer note */}
        <p className="text-center text-[11px] text-slate-400 mt-4">
          ICH GCP E6(R2) and FDA 21 CFR Part 11 compliant authentication.
        </p>
      </div>
    </div>
  );
}
