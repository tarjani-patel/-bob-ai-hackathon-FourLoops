import React from "react";

export function MetricCard({ title, value, subtext, icon: Icon, badge, alertLevel, onClick }) {
  let borderColor = "border-slate-200";
  let iconBg = "bg-clinical-50 text-clinical-700";

  if (alertLevel === "danger") {
    borderColor = "border-rose-300 ring-1 ring-rose-200";
    iconBg = "bg-rose-50 text-rose-700";
  } else if (alertLevel === "warning") {
    borderColor = "border-amber-300 ring-1 ring-amber-200";
    iconBg = "bg-amber-50 text-amber-700";
  } else if (alertLevel === "success") {
    iconBg = "bg-emerald-50 text-emerald-700";
  }

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-lg border ${borderColor} p-5 shadow-subtle transition-all duration-150 ${onClick ? "cursor-pointer hover:border-clinical-400 hover:shadow-card" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
            {badge && <div>{badge}</div>}
          </div>
          {subtext && <p className="mt-1 text-xs text-slate-500">{subtext}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-md ${iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
