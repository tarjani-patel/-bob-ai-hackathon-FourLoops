import { PERMISSIONS } from "./permissions.js";

export const ROLES = {
  CRA: "CRA",
  INVESTIGATOR: "INVESTIGATOR",
  DATA_MANAGER: "DATA_MANAGER",
  SPONSOR: "SPONSOR"
};

export const CLINICAL_SITES = [
  { id: "SITE-01", name: "SITE-01 — Mayo Clinic Research Center", shortName: "Site 01" },
  { id: "SITE-02", name: "SITE-02 — Johns Hopkins Clinical Trials Unit", shortName: "Site 02" },
  { id: "SITE-03", name: "SITE-03 — Metro General Health Science Center", shortName: "Site 03" },
  { id: "SITE-04", name: "SITE-04 — UCSF Medical Center", shortName: "Site 04" },
  { id: "SITE-05", name: "SITE-05 — MD Anderson Cancer Center", shortName: "Site 05" }
];

export const ROLE_DEFINITIONS = {
  [ROLES.CRA]: {
    id: ROLES.CRA,
    label: "Clinical Research Associate",
    description: "Monitor sites, deviations, risk and CAPA.",
    dashboardTitle: "Trial Monitoring Overview",
    requiresSite: false,
    badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
    dotColor: "bg-blue-600",
    allowedRoutes: [
      "/dashboard",
      "/trial-protocol",
      "/patients",
      "/deviations",
      "/sites",
      "/capa",
      "/reports"
    ],
    permissions: [
      PERMISSIONS.VIEW_TRIAL,
      PERMISSIONS.VIEW_ALL_SITES,
      PERMISSIONS.VIEW_SITE_RISK,
      PERMISSIONS.VIEW_TRIAL_RISK,
      PERMISSIONS.VIEW_PATIENTS,
      PERMISSIONS.VIEW_ALL_PATIENTS,
      PERMISSIONS.VIEW_DEVIATIONS,
      PERMISSIONS.REVIEW_DEVIATION,
      PERMISSIONS.RUN_COMPLIANCE_ANALYSIS,
      PERMISSIONS.VIEW_CAPA,
      PERMISSIONS.CREATE_CAPA,
      PERMISSIONS.ASSIGN_CAPA,
      PERMISSIONS.UPDATE_CAPA_STATUS,
      PERMISSIONS.VIEW_REPORTS,
      PERMISSIONS.GENERATE_REPORTS,
      PERMISSIONS.EXPORT_REPORTS,
      PERMISSIONS.VIEW_NOTIFICATIONS
    ]
  },
  [ROLES.INVESTIGATOR]: {
    id: ROLES.INVESTIGATOR,
    label: "Site Investigator",
    description: "Manage activity and responses for your assigned site.",
    dashboardTitle: "My Site Overview",
    requiresSite: true,
    badgeColor: "bg-purple-50 text-purple-800 border-purple-200",
    dotColor: "bg-purple-600",
    allowedRoutes: [
      "/dashboard",
      "/trial-protocol",
      "/patients",
      "/deviations",
      "/sites",
      "/capa"
    ],
    permissions: [
      PERMISSIONS.VIEW_TRIAL,
      PERMISSIONS.VIEW_ASSIGNED_SITE,
      PERMISSIONS.VIEW_SITE_RISK,
      PERMISSIONS.VIEW_PATIENTS,
      PERMISSIONS.VIEW_OWN_SITE_PATIENTS,
      PERMISSIONS.VIEW_DEVIATIONS,
      PERMISSIONS.REVIEW_DEVIATION,
      PERMISSIONS.VIEW_CAPA,
      PERMISSIONS.RESPOND_TO_CAPA,
      PERMISSIONS.VIEW_NOTIFICATIONS
    ]
  },
  [ROLES.DATA_MANAGER]: {
    id: ROLES.DATA_MANAGER,
    label: "Clinical Data Manager",
    description: "Maintain patient, visit, laboratory and data quality.",
    dashboardTitle: "Data Quality Overview",
    requiresSite: false,
    badgeColor: "bg-teal-50 text-teal-800 border-teal-200",
    dotColor: "bg-teal-600",
    allowedRoutes: [
      "/dashboard",
      "/trial-protocol",
      "/patients",
      "/deviations",
      "/reports"
    ],
    permissions: [
      PERMISSIONS.VIEW_TRIAL,
      PERMISSIONS.VIEW_PATIENTS,
      PERMISSIONS.VIEW_ALL_PATIENTS,
      PERMISSIONS.MANAGE_PATIENT_DATA,
      PERMISSIONS.EDIT_PATIENT_DATA,
      PERMISSIONS.VIEW_DEVIATIONS,
      PERMISSIONS.CREATE_DEVIATION,
      PERMISSIONS.REVIEW_DEVIATION,
      PERMISSIONS.RUN_COMPLIANCE_ANALYSIS,
      PERMISSIONS.VIEW_REPORTS,
      PERMISSIONS.GENERATE_REPORTS,
      PERMISSIONS.VIEW_NOTIFICATIONS
    ]
  },
  [ROLES.SPONSOR]: {
    id: ROLES.SPONSOR,
    label: "Sponsor / Study Manager",
    description: "Oversee the trial, governance, CAPA and reporting.",
    dashboardTitle: "Trial Executive Overview",
    requiresSite: false,
    badgeColor: "bg-amber-50 text-amber-900 border-amber-200",
    dotColor: "bg-amber-600",
    allowedRoutes: [
      "/dashboard",
      "/trial-protocol",
      "/patients",
      "/deviations",
      "/sites",
      "/capa",
      "/reports",
      "/settings"
    ],
    permissions: [
      PERMISSIONS.VIEW_TRIAL,
      PERMISSIONS.MANAGE_PROTOCOL,
      PERMISSIONS.VIEW_ALL_SITES,
      PERMISSIONS.VIEW_SITE_RISK,
      PERMISSIONS.VIEW_TRIAL_RISK,
      PERMISSIONS.VIEW_PATIENTS,
      PERMISSIONS.VIEW_ALL_PATIENTS,
      PERMISSIONS.VIEW_DEVIATIONS,
      PERMISSIONS.REVIEW_DEVIATION,
      PERMISSIONS.RESOLVE_DEVIATION,
      PERMISSIONS.RUN_COMPLIANCE_ANALYSIS,
      PERMISSIONS.VIEW_CAPA,
      PERMISSIONS.CREATE_CAPA,
      PERMISSIONS.ASSIGN_CAPA,
      PERMISSIONS.APPROVE_CAPA,
      PERMISSIONS.UPDATE_CAPA_STATUS,
      PERMISSIONS.VIEW_REPORTS,
      PERMISSIONS.GENERATE_REPORTS,
      PERMISSIONS.EXPORT_REPORTS,
      PERMISSIONS.MANAGE_USERS,
      PERMISSIONS.MANAGE_SETTINGS,
      PERMISSIONS.VIEW_AUDIT_LOG,
      PERMISSIONS.VIEW_NOTIFICATIONS
    ]
  }
};

export const ROLE_CONFIG = ROLE_DEFINITIONS;

// Pre-seeded local accounts so evaluators can test immediately without creating an account first if desired
export const PRESEEDED_ACCOUNTS = [
  {
    id: "usr-pre-cra",
    name: "Sarah Jenkins, CCRA",
    email: "cra@trialguard.ai",
    password: "password123",
    role: ROLES.CRA,
    assignedSite: null,
    organization: "Global CRO Monitoring Ops",
    createdAt: "2026-01-05T08:00:00Z"
  },
  {
    id: "usr-pre-inv",
    name: "Dr. Evelyn Zhao, MD",
    email: "investigator@trialguard.ai",
    password: "password123",
    role: ROLES.INVESTIGATOR,
    assignedSite: "SITE-03",
    organization: "Metro General Health Science Center",
    createdAt: "2026-01-06T09:00:00Z"
  },
  {
    id: "usr-pre-cdm",
    name: "Marcus Vance",
    email: "data@trialguard.ai",
    password: "password123",
    role: ROLES.DATA_MANAGER,
    assignedSite: null,
    organization: "TrialGuard Data Operations",
    createdAt: "2026-01-07T10:00:00Z"
  },
  {
    id: "usr-pre-sponsor",
    name: "Elena Rostova",
    email: "sponsor@trialguard.ai",
    password: "password123",
    role: ROLES.SPONSOR,
    assignedSite: null,
    organization: "BioCardia Therapeutics (Sponsor)",
    createdAt: "2026-01-08T11:00:00Z"
  }
];

export const DEMO_ACCOUNTS = PRESEEDED_ACCOUNTS;
