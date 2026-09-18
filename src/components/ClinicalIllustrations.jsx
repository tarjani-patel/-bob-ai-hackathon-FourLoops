import React from "react";

/**
 * Clinical Research Team Illustration (inspired by abcMD line-art doctors)
 */
export function DoctorTeamIllustration({ className = "w-full max-w-lg h-auto" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 540 380" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="cloudGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eff6ff" />
          <stop offset="100%" stopColor="#dbeafe" />
        </linearGradient>
        <linearGradient id="blueUniform" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#0f2b52" />
        </linearGradient>
        <linearGradient id="tealScrubs" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id="glowG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Ambient background organic shape */}
      <path 
        d="M60 220C20 140 80 50 190 40C320 28 440 60 480 140C520 220 480 320 370 350C250 380 100 310 60 220Z" 
        fill="url(#cloudGrad)" 
        opacity="0.8" 
      />
      <circle cx="430" cy="90" r="50" fill="url(#glowG)" />

      {/* Floating mini clinical badge: 100% Adherence */}
      <g transform="translate(380, 50)" className="animate-soft-float">
        <rect width="130" height="42" rx="21" fill="white" filter="drop-shadow(0 8px 16px rgba(14,140,233,0.12))" />
        <circle cx="21" cy="21" r="13" fill="#ecfdf5" />
        <path d="M16 21L19.5 24.5L26 17.5" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="42" y="19" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="700" fill="#0f172a">ICH GCP E6</text>
        <text x="42" y="31" fontFamily="Inter, sans-serif" fontSize="8.5" fontWeight="600" fill="#059669">Verified 100%</text>
      </g>

      {/* Background Doctor 1 (Lead Researcher - Male Center-Back) */}
      <g>
        <circle cx="270" cy="115" r="28" fill="#fde68a" opacity="0.4" />
        <path d="M250 112C250 98 260 88 270 88C280 88 290 98 290 112V124C290 134 282 142 270 142C258 142 250 134 250 124V112Z" fill="#fed7aa" />
        {/* Hair */}
        <path d="M248 108C248 94 256 82 270 82C284 82 292 94 292 108C292 110 286 102 270 102C254 102 248 110 248 108Z" fill="#334155" />
        {/* Lab coat back */}
        <path d="M232 156L246 138H294L308 156L314 240H226L232 156Z" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
        {/* Navy scrubs inner */}
        <path d="M258 138H282L270 170L258 138Z" fill="url(#tealScrubs)" />
      </g>

      {/* Doctor Left (Clinical Research Associate - Female Left) */}
      <g>
        {/* Hair */}
        <path d="M152 140C148 110 162 92 185 92C208 92 222 110 218 140C222 170 210 200 206 205C200 175 198 140 185 140C172 140 170 175 164 205C160 200 148 170 152 140Z" fill="#1e293b" />
        {/* Head */}
        <ellipse cx="185" cy="138" rx="19" ry="24" fill="#fecaca" opacity="0.8" />
        {/* Facial features simplified line art */}
        <circle cx="178" cy="136" r="2" fill="#0f172a" />
        <circle cx="192" cy="136" r="2" fill="#0f172a" />
        <path d="M182 148C184 150 186 150 188 148" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
        {/* Lab Coat */}
        <path d="M150 185C140 210 135 270 135 340H235C235 270 230 210 220 185C205 178 198 175 185 175C172 175 165 178 150 185Z" fill="#ffffff" stroke="#334155" strokeWidth="2.5" />
        {/* Lapels */}
        <path d="M172 176L164 240L185 270L206 240L198 176" stroke="#334155" strokeWidth="2" fill="#f1f5f9" />
        {/* Inner Teal Scrubs */}
        <path d="M175 178H195L185 208L175 178Z" fill="url(#blueUniform)" />
        {/* Stethoscope */}
        <path d="M168 195C165 240 205 240 202 195" stroke="#0284c7" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="185" cy="245" r="7" fill="#38bdf8" stroke="#0369a1" strokeWidth="2" />
        {/* Research binder held */}
        <rect x="130" y="270" width="45" height="60" rx="4" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" transform="rotate(-10 130 270)" />
        <line x1="140" y1="280" x2="160" y2="277" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="138" y1="290" x2="162" y2="286" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Main Center Doctor / Principal Investigator (Foreground Female - abcMD star style) */}
      <g>
        {/* Head */}
        <ellipse cx="320" cy="140" rx="22" ry="26" fill="#fde68a" opacity="0.6" />
        {/* Friendly eyes & smile */}
        <circle cx="312" cy="138" r="2.2" fill="#0f172a" />
        <circle cx="328" cy="138" r="2.2" fill="#0f172a" />
        <path d="M315 150C318 153 322 153 325 150" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
        {/* Hair styled modern bob with clean stroke */}
        <path d="M294 135C292 100 310 82 328 82C350 82 360 102 358 135C352 130 348 118 335 118C315 118 305 130 294 135Z" fill="#0369a1" />
        {/* Dark Navy Professional Scrubs (abcMD inspired contrast) */}
        <path d="M280 186C265 215 258 280 255 350H385C382 280 375 215 360 186C345 178 335 174 320 174C305 174 295 178 280 186Z" fill="url(#blueUniform)" stroke="#0c1b33" strokeWidth="2.5" />
        {/* Stethoscope around neck */}
        <path d="M302 188C296 245 344 245 338 188" stroke="#38bdf8" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <circle cx="320" cy="254" r="8" fill="#f8fafc" stroke="#0284c7" strokeWidth="2.5" />
        {/* ID Badge on scrubs */}
        <rect x="338" y="210" width="18" height="25" rx="3" fill="white" stroke="#64748b" strokeWidth="1.5" />
        <circle cx="347" cy="218" r="4" fill="#0284c7" />
        <line x1="341" y1="228" x2="353" y2="228" stroke="#94a3b8" strokeWidth="1.5" />
      </g>

      {/* Floating mini metric pill: Protocol CT-101 */}
      <g transform="translate(60, 190)" className="animate-soft-float" style={{ animationDelay: "1.5s" }}>
        <rect width="140" height="46" rx="23" fill="white" filter="drop-shadow(0 10px 20px rgba(15,23,42,0.08))" />
        <circle cx="24" cy="23" r="14" fill="#eff6ff" />
        <path d="M19 23L23 27L29 19" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="46" y="20" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="700" fill="#0f172a">CT-101 Cardio-X</text>
        <text x="46" y="33" fontFamily="Inter, sans-serif" fontSize="9" fontWeight="500" fill="#64748b">104 Cohorts Monitored</text>
      </g>
    </svg>
  );
}

/**
 * Tablet Monitoring & eCRF Line-Art Illustration (inspired by abcMD mobile care graphic)
 */
export function TabletMonitoringIllustration({ className = "w-full max-w-sm h-auto" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 320 360" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="tabBlue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f0f7ff" />
        </linearGradient>
      </defs>

      {/* Ambient background glow */}
      <circle cx="160" cy="180" r="130" fill="#e0f2fe" opacity="0.6" />

      {/* Tablet Device Frame */}
      <rect 
        x="60" 
        y="40" 
        width="200" 
        height="280" 
        rx="28" 
        fill="url(#tabBlue)" 
        stroke="#0c1b33" 
        strokeWidth="3.5" 
        filter="drop-shadow(0 16px 32px rgba(14,140,233,0.12))"
      />
      {/* Tablet Speaker Notch & Home Indicator */}
      <rect x="135" y="52" width="50" height="4" rx="2" fill="#94a3b8" />
      <rect x="130" y="306" width="60" height="4" rx="2" fill="#cbd5e1" />

      {/* Screen Content: eCRF Header */}
      <rect x="80" y="70" width="160" height="45" rx="10" fill="#0284c7" />
      <circle cx="102" cy="92" r="10" fill="#ffffff" opacity="0.25" />
      <path d="M98 92L101 95L107 89" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      <rect x="122" y="85" width="80" height="6" rx="3" fill="#ffffff" />
      <rect x="122" y="96" width="50" height="4" rx="2" fill="#bae6fd" />

      {/* Heartbeat ECG wave box */}
      <rect x="80" y="125" width="160" height="55" rx="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
      <path 
        d="M90 152H115L122 135L132 165L140 145L146 155L152 152H230" 
        stroke="#ef4444" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <circle cx="132" cy="165" r="3" fill="#ef4444" />
      <text x="90" y="140" fontFamily="Inter, sans-serif" fontSize="9" fontWeight="700" fill="#64748b">Vitals: HR 72 bpm • BP 124/80</text>

      {/* Compliance Checklist item 1 */}
      <rect x="80" y="190" width="160" height="34" rx="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
      <circle cx="98" cy="207" r="8" fill="#dcfce7" />
      <path d="M94 207L97 210L103 204" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
      <text x="114" y="205" fontFamily="Inter, sans-serif" fontSize="9.5" fontWeight="700" fill="#1e293b">Visit 2 Window</text>
      <text x="114" y="216" fontFamily="Inter, sans-serif" fontSize="8" fontWeight="500" fill="#059669">Within ±3 Day Tolerance</text>

      {/* Compliance Checklist item 2 */}
      <rect x="80" y="232" width="160" height="34" rx="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
      <circle cx="98" cy="249" r="8" fill="#dbeafe" />
      <path d="M94 249L97 252L103 246" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
      <text x="114" y="247" fontFamily="Inter, sans-serif" fontSize="9.5" fontWeight="700" fill="#1e293b">Investigational Product</text>
      <text x="114" y="258" fontFamily="Inter, sans-serif" fontSize="8" fontWeight="500" fill="#2563eb">Target: 100mg QD Confirmed</text>

      {/* Stylized clinical hand holding device (abcMD signature line-art) */}
      <path 
        d="M40 310C65 290 90 270 95 240C98 220 85 210 75 225C65 240 50 265 30 285" 
        stroke="#0c1b33" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        fill="none" 
      />
      <path 
        d="M270 310C245 290 220 270 215 240C212 220 225 210 235 225C245 240 260 265 280 285" 
        stroke="#0c1b33" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        fill="none" 
      />
    </svg>
  );
}

/**
 * Organic Wave Divider (abcMD style curve separating sections)
 */
export function OrganicWaveDivider({ className = "w-full text-slate-50", fill = "currentColor", flip = false }) {
  return (
    <div className={`w-full overflow-hidden leading-none ${flip ? "rotate-180" : ""}`}>
      <svg 
        className={className} 
        viewBox="0 0 1440 80" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path 
          d="M0,32L80,37.3C160,43,320,53,480,48C640,43,800,21,960,21.3C1120,21,1280,43,1360,53.3L1440,64L1440,80L1360,80C1280,80,1120,80,960,80C800,80,640,80,480,80C320,80,160,80,80,80L0,80Z" 
          fill={fill} 
        />
      </svg>
    </div>
  );
}

/**
 * Verified Audit Seal Illustration
 */
export function AuditSealIllustration({ className = "w-12 h-12" }) {
  return (
    <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-glow ${className}`}>
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    </div>
  );
}
