import React from "react";

export function RiskBadge({ band, score, size = "md" }) {
  const isHigh = band === "High" || score >= 61;
  const isMedium = band === "Medium" || (score >= 31 && score <= 60);

  let colorClasses = "bg-emerald-50 text-emerald-800 border-emerald-200";
  let dotClass = "bg-emerald-500";
  let label = "Low Risk";

  if (isHigh) {
    colorClasses = "bg-rose-50 text-rose-800 border-rose-200";
    dotClass = "bg-rose-500";
    label = "High Risk";
  } else if (isMedium) {
    colorClasses = "bg-amber-50 text-amber-800 border-amber-200";
    dotClass = "bg-amber-500";
    label = "Medium Risk";
  }

  const sizeClasses = size === "sm" 
    ? "text-xs px-2 py-0.5" 
    : size === "lg"
    ? "text-sm px-3 py-1 font-semibold"
    : "text-xs px-2.5 py-1 font-medium";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${colorClasses} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
      <span>{band || label}</span>
      {score !== undefined && score !== null && (
        <span className="opacity-75 font-mono text-[11px]">({score}/100)</span>
      )}
    </span>
  );
}

export function SeverityBadge({ severity, showWeight = false }) {
  let color = "bg-slate-100 text-slate-700 border-slate-200";
  let weight = 1;

  switch (severity) {
    case "Critical":
      color = "bg-rose-50 text-rose-800 border-rose-200 font-semibold";
      weight = 15;
      break;
    case "Major":
      color = "bg-orange-50 text-orange-800 border-orange-200 font-medium";
      weight = 10;
      break;
    case "Minor":
      color = "bg-amber-50 text-amber-800 border-amber-200";
      weight = 4;
      break;
    case "Administrative":
      color = "bg-slate-100 text-slate-700 border-slate-200";
      weight = 1;
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${color}`}>
      <span>{severity}</span>
      {showWeight && <span className="font-mono text-[10px] opacity-70">+{weight}pt</span>}
    </span>
  );
}

export function TrendBadge({ trend, projectedChange }) {
  if (trend === "Worsening") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
          <polyline points="17 6 23 6 23 12"></polyline>
        </svg>
        <span>Worsening</span>
        {projectedChange ? <span className="text-[11px]">(+{projectedChange})</span> : null}
      </span>
    );
  }

  if (trend === "Improving") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
          <polyline points="17 18 23 18 23 12"></polyline>
        </svg>
        <span>Improving</span>
        {projectedChange ? <span className="text-[11px]">({projectedChange})</span> : null}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      <span>Stable</span>
    </span>
  );
}
