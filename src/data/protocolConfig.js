/**
 * Trial Protocol Specification: CT-101 (Cardio-X Phase III)
 * 
 * Objective protocol parameters validated deterministically by the Compliance Engine.
 */

export const PROTOCOL_CONFIG = {
  trialId: "CT-101",
  trialName: "Cardio-X Phase III",
  indication: "Cardiovascular Disease (Heart Failure with Reduced Ejection Fraction)",
  phase: "Phase III",
  sponsor: "BioCardia Therapeutics / Global Clinical Innovations",
  protocolVersion: "v3.2",
  lastAmendmentDate: "2026-01-15",
  irbApprovalNumber: "IRB-2025-CV-8821",
  targetEnrollment: 100,
  investigationalProduct: {
    name: "Cardio-X",
    code: "BC-4089",
    targetDoseMg: 100,
    unit: "mg",
    frequency: "Once daily (QD)",
    route: "Oral",
    acceptableRangeMg: [95, 105],
  },
  sites: [
    {
      id: "SITE-01",
      code: "SITE-01",
      name: "Mayo Clinic Research Center",
      location: "Rochester, MN",
      pi: "Dr. Robert Vance, MD, FACC",
      cra: "Sarah Lin, CCRA",
      patientCount: 20,
    },
    {
      id: "SITE-02",
      code: "SITE-02",
      name: "Johns Hopkins Clinical Trials Unit",
      location: "Baltimore, MD",
      pi: "Dr. Aris Thorne, MD, PhD",
      cra: "Mark Reynolds, CRA",
      patientCount: 21,
    },
    {
      id: "SITE-03",
      code: "SITE-03",
      name: "Metro General Health Science Center",
      location: "Chicago, IL",
      pi: "Dr. Evelyn Zhao, MD",
      cra: "James Taylor, CRA",
      patientCount: 22,
    },
    {
      id: "SITE-04",
      code: "SITE-04",
      name: "Stanford Cardiovascular Institute",
      location: "Palo Alto, CA",
      pi: "Dr. Marcus Sterling, MD",
      cra: "Chloe Nguyen, MS, CCRA",
      patientCount: 20,
    },
    {
      id: "SITE-05",
      code: "SITE-05",
      name: "Boston Cardiovascular & Research Hospital",
      location: "Boston, MA",
      pi: "Dr. Priya Nair, MD, FACP",
      cra: "David Kim, CRA",
      patientCount: 21,
    }
  ],
  visits: [
    {
      visitNumber: 1,
      name: "Visit 1 (Baseline & Randomization)",
      targetDay: 1,
      windowDaysMinus: 3,
      windowDaysPlus: 3,
      windowDescription: "Day 1 ± 3 days (Day -2 to Day 4)",
      requiredProcedures: [
        "Informed Consent Form (ICF)",
        "Vital Signs (BP, HR, Resp, Temp)",
        "12-Lead Baseline ECG",
        "Physical Examination",
        "Baseline Safety Chemistry & Hematology",
        "Investigational Product Dispensation"
      ]
    },
    {
      visitNumber: 2,
      name: "Visit 2 (Intermediate Follow-up)",
      targetDay: 14,
      windowDaysMinus: 3,
      windowDaysPlus: 3,
      windowDescription: "Day 14 ± 3 days (Day 11 to Day 17)",
      requiredProcedures: [
        "Vital Signs",
        "Concomitant Medication Review",
        "Adverse Event (AE) Assessment",
        "Drug Accountability & Adherence Check",
        "Serum Electrolytes & Renal Function"
      ]
    },
    {
      visitNumber: 3,
      name: "Visit 3 (Primary Endpoint & Safety)",
      targetDay: 28,
      windowDaysMinus: 5,
      windowDaysPlus: 5,
      windowDescription: "Day 28 ± 5 days (Day 23 to Day 33)",
      requiredProcedures: [
        "Vital Signs",
        "12-Lead Follow-up ECG",
        "Complete Blood Count (CBC) with Differential",
        "Serum Cardiac Biomarkers (NT-proBNP, Troponin T)",
        "Primary Efficacy Endpoint Evaluation",
        "Drug Accountability & Reconciliation"
      ]
    }
  ],
  laboratoryRules: {
    mandatoryBeforeVisit3: "Complete Blood Count (CBC) with Differential",
    cbcWindowDaysBeforeV3: 7, // must be collected within 7 days prior to or at Visit 3
  },
  prohibitedMedications: [
    {
      name: "Drug-X",
      genericClass: "Strong CYP3A4 / P-gp Inhibitor & Antiarrhythmic Agent",
      rationale: "Causes severe pharmacokinetic interaction with Cardio-X, increasing plasma AUC by >320% with high arrhythmia risk.",
      severity: "Critical"
    },
    {
      name: "Ketoconazole",
      genericClass: "Systemic Antifungal CYP3A4 Inhibitor",
      rationale: "Potent CYP3A4 inhibition alters active metabolite clearance.",
      severity: "Critical"
    },
    {
      name: "Erythromycin",
      genericClass: "Macrolide Antibiotic",
      rationale: "QTc prolongation risk and CYP3A interaction.",
      severity: "Major"
    },
    {
      name: "St. John's Wort",
      genericClass: "Herbal CYP3A4 Inducer",
      rationale: "Significant reduction in Cardio-X therapeutic exposure.",
      severity: "Major"
    }
  ],
  severityWeights: {
    Critical: 15,
    Major: 10,
    Minor: 4,
    Administrative: 1
  },
  riskModifiers: {
    repeatedDeviation: 5,
    multipleCategories: 5
  },
  riskBands: {
    low: { min: 0, max: 30, label: "Low", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    medium: { min: 31, max: 60, label: "Medium", color: "text-amber-700 bg-amber-50 border-amber-200" },
    high: { min: 61, max: 100, label: "High", color: "text-rose-700 bg-rose-50 border-rose-200" }
  }
};
