/**
 * Synthetic Patient Dataset for CT-101 (Cardio-X Phase III)
 * 
 * Contains approximately 104 realistic patients across 5 clinical sites.
 * Underlying violations are genuinely seeded into raw patient/visit/lab/medication records
 * so that the deterministic compliance & risk engines calculate objective scores.
 */

// Helper to format ISO dates relative to trial start
const BASE_DATE = new Date("2026-01-05T08:00:00Z");

function addDays(days) {
  const d = new Date(BASE_DATE);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export const SYNTHETIC_PATIENTS = [
  // ==========================================
  // SITE-01: Mayo Clinic Research Center (Clean site, Low Risk)
  // ~20 patients (PT-1001 to PT-1020)
  // ==========================================
  ...Array.from({ length: 20 }, (_, i) => {
    const num = 1001 + i;
    const ptId = `PT-${num}`;
    // Minor administrative or clean records
    const isSlightDelay = i === 7; // PT-1008 minor delay Day 17 (compliant within window)
    const isPT1014 = ptId === "PT-1014"; // Minor procedure discrepancy
    return {
      id: ptId,
      siteId: "SITE-01",
      siteName: "Mayo Clinic Research Center",
      age: 58 + (i % 15),
      gender: i % 2 === 0 ? "Female" : "Male",
      status: "Active",
      enrollmentDate: addDays(i * 2),
      visits: [
        {
          visitNumber: 1,
          scheduledDay: 1,
          actualDay: 1,
          date: addDays(i * 2 + 1),
          status: "Completed",
          proceduresCompleted: isPT1014 ? [
            "Informed Consent Form (ICF)",
            "Vital Signs (BP, HR, Resp, Temp)",
            "Physical Examination",
            "Baseline Safety Chemistry & Hematology",
            "Investigational Product Dispensation"
            // omitted 12-Lead Baseline ECG
          ] : [
            "Informed Consent Form (ICF)",
            "Vital Signs (BP, HR, Resp, Temp)",
            "12-Lead Baseline ECG",
            "Physical Examination",
            "Baseline Safety Chemistry & Hematology",
            "Investigational Product Dispensation"
          ],
          vitals: { bpSystolic: 124, bpDiastolic: 78, heartRate: 72 }
        },
        {
          visitNumber: 2,
          scheduledDay: 14,
          actualDay: isSlightDelay ? 17 : 14, // Day 17 is within Day 14 ± 3
          date: addDays(i * 2 + (isSlightDelay ? 17 : 14)),
          status: "Completed",
          proceduresCompleted: [
            "Vital Signs",
            "Concomitant Medication Review",
            "Adverse Event (AE) Assessment",
            "Drug Accountability & Adherence Check",
            "Serum Electrolytes & Renal Function"
          ],
          vitals: { bpSystolic: 122, bpDiastolic: 76, heartRate: 70 }
        },
        {
          visitNumber: 3,
          scheduledDay: 28,
          actualDay: 28,
          date: addDays(i * 2 + 28),
          status: "Completed",
          proceduresCompleted: [
            "Vital Signs",
            "12-Lead Follow-up ECG",
            "Complete Blood Count (CBC) with Differential",
            "Serum Cardiac Biomarkers (NT-proBNP, Troponin T)",
            "Primary Efficacy Endpoint Evaluation",
            "Drug Accountability & Reconciliation"
          ],
          vitals: { bpSystolic: 120, bpDiastolic: 74, heartRate: 68 }
        }
      ],
      labs: [
        { labName: "Complete Blood Count (CBC)", date: addDays(i * 2 + 25), status: "Completed", value: "Normal", unit: "cells/mcL" },
        { labName: "Serum Electrolytes", date: addDays(i * 2 + 14), status: "Completed", value: "Normal", unit: "mmol/L" }
      ],
      medications: [
        { drugName: "Cardio-X", doseMg: 100, frequency: "QD", isInvestigational: true, startDate: addDays(i * 2 + 1) },
        { drugName: "Amlodipine", doseMg: 5, frequency: "QD", isInvestigational: false, startDate: "2025-10-01" }
      ]
    };
  }),

  // Add one minor deviation to SITE-01 so it's realistic but still low risk
  // PT-1014 missed a non-critical procedure (Baseline ECG recorded 1 day post ICF)

  // ==========================================
  // SITE-02: Johns Hopkins CTU (Medium-Low Risk)
  // ~21 patients (PT-1021 to PT-1041)
  // Seeded: PT-1022 dose 50mg (Major), PT-1025 early visit 3 (Minor), PT-1030 missing vitals (Admin)
  // ==========================================
  ...Array.from({ length: 21 }, (_, i) => {
    const num = 1021 + i;
    const ptId = `PT-${num}`;
    
    // Seeded violations:
    const isPT1022 = ptId === "PT-1022"; // dose 50mg instead of 100mg
    const isPT1025 = ptId === "PT-1025"; // early Visit 3 (Day 21 vs window 23-33)
    const isPT1030 = ptId === "PT-1030"; // missing vitals data at Visit 2
    const isPT1035 = ptId === "PT-1035"; // late Visit 2 (Day 20 vs window 11-17)
    
    return {
      id: ptId,
      siteId: "SITE-02",
      siteName: "Johns Hopkins Clinical Trials Unit",
      age: 55 + (i % 18),
      gender: i % 2 === 0 ? "Male" : "Female",
      status: "Active",
      enrollmentDate: addDays(3 + i * 2),
      visits: [
        {
          visitNumber: 1,
          scheduledDay: 1,
          actualDay: 1,
          date: addDays(3 + i * 2 + 1),
          status: "Completed",
          proceduresCompleted: [
            "Informed Consent Form (ICF)",
            "Vital Signs (BP, HR, Resp, Temp)",
            "12-Lead Baseline ECG",
            "Physical Examination",
            "Baseline Safety Chemistry & Hematology",
            "Investigational Product Dispensation"
          ],
          vitals: { bpSystolic: 128, bpDiastolic: 82, heartRate: 74 }
        },
        {
          visitNumber: 2,
          scheduledDay: 14,
          actualDay: isPT1035 ? 20 : 14,
          date: addDays(3 + i * 2 + (isPT1035 ? 20 : 14)),
          status: "Completed",
          proceduresCompleted: isPT1030 ? [
            "Concomitant Medication Review",
            "Adverse Event (AE) Assessment",
            "Drug Accountability & Adherence Check",
            "Serum Electrolytes & Renal Function"
          ] : [
            "Vital Signs",
            "Concomitant Medication Review",
            "Adverse Event (AE) Assessment",
            "Drug Accountability & Adherence Check",
            "Serum Electrolytes & Renal Function"
          ],
          vitals: isPT1030 ? null : { bpSystolic: 126, bpDiastolic: 80, heartRate: 72 }
        },
        {
          visitNumber: 3,
          scheduledDay: 28,
          actualDay: isPT1025 ? 21 : 28, // PT-1025 early visit (Day 21 < window start 23)
          date: addDays(3 + i * 2 + (isPT1025 ? 21 : 28)),
          status: "Completed",
          proceduresCompleted: [
            "Vital Signs",
            "12-Lead Follow-up ECG",
            "Complete Blood Count (CBC) with Differential",
            "Serum Cardiac Biomarkers (NT-proBNP, Troponin T)",
            "Primary Efficacy Endpoint Evaluation",
            "Drug Accountability & Reconciliation"
          ],
          vitals: { bpSystolic: 124, bpDiastolic: 78, heartRate: 70 }
        }
      ],
      labs: [
        { labName: "Complete Blood Count (CBC)", date: addDays(3 + i * 2 + (isPT1025 ? 20 : 26)), status: "Completed", value: "Normal", unit: "cells/mcL" },
        { labName: "Serum Electrolytes", date: addDays(3 + i * 2 + 14), status: "Completed", value: "Normal", unit: "mmol/L" }
      ],
      medications: [
        { 
          drugName: "Cardio-X", 
          doseMg: isPT1022 ? 50 : 100, // PT-1022 dose error 50mg
          frequency: "QD", 
          isInvestigational: true, 
          startDate: addDays(3 + i * 2 + 1) 
        },
        { drugName: "Atorvastatin", doseMg: 20, frequency: "QD", isInvestigational: false, startDate: "2025-08-15" }
      ]
    };
  }),

  // ==========================================
  // SITE-03: Metro General Health (HIGHEST RISK SITE)
  // ~22 patients (PT-1042 to PT-1063)
  // SEEDED MULTIPLE CRITICAL & MAJOR VIOLATIONS:
  // - PT-1042: Late Visit 2 (Day 20 vs window 11-17) + Incorrect dose (150mg) [REPEATED DEVIATION & MULTI-CATEGORY]
  // - PT-1043: Prohibited medication "Drug-X" (CRITICAL) + Late Visit 3 (Day 36) [REPEATED DEVIATION]
  // - PT-1044: Early Visit 2 (Day 9 vs window 11-17) [MINOR]
  // - PT-1045: Late Visit 3 (Day 38 vs window 23-33) [MAJOR]
  // - PT-1046: Missing CBC before Visit 3 [MAJOR]
  // - PT-1047: Incomplete baseline data: missing Baseline 12-Lead ECG at Visit 1 [ADMIN / MINOR]
  // - PT-1048: Missed Visit 2 altogether [CRITICAL] + Missing CBC before Visit 3 [MAJOR] [REPEATED]
  // - PT-1050: Missing CBC before Visit 3 [MAJOR]
  // - PT-1051: Incorrect dose 200mg daily (CRITICAL)
  // - PT-1052: Prohibited medication "Ketoconazole" (CRITICAL)
  // - PT-1053: Missing drug accountability at Visit 2 [ADMIN]
  // - PT-1055: Late Visit 2 (Day 19) [MAJOR]
  // ==========================================
  ...Array.from({ length: 22 }, (_, i) => {
    const num = 1042 + i;
    const ptId = `PT-${num}`;
    
    // Specific seeded flags:
    const isPT1042 = ptId === "PT-1042"; // Late Visit 2 (Day 20) + 150mg dose
    const isPT1043 = ptId === "PT-1043"; // Drug-X + Late Visit 3 (Day 36)
    const isPT1044 = ptId === "PT-1044"; // Early Visit 2 (Day 9)
    const isPT1045 = ptId === "PT-1045"; // Late Visit 3 (Day 38)
    const isPT1046 = ptId === "PT-1046"; // Missing CBC
    const isPT1047 = ptId === "PT-1047"; // Missing Baseline ECG
    const isPT1048 = ptId === "PT-1048"; // Missed Visit 2 + Missing CBC
    const isPT1050 = ptId === "PT-1050"; // Missing CBC
    const isPT1051 = ptId === "PT-1051"; // Incorrect dose 200mg
    const isPT1052 = ptId === "PT-1052"; // Prohibited Ketoconazole
    const isPT1053 = ptId === "PT-1053"; // Missing drug accountability
    const isPT1055 = ptId === "PT-1055"; // Late Visit 2 (Day 19)

    // Calculate actual visit days
    let v2ActualDay = 14;
    let v2Status = "Completed";
    if (isPT1042) v2ActualDay = 20; // 6 days late (window is 11-17)
    if (isPT1044) v2ActualDay = 9;  // 2 days early (window is 11-17)
    if (isPT1048) { v2ActualDay = null; v2Status = "Missed"; }
    if (isPT1055) v2ActualDay = 19; // 2 days late

    let v3ActualDay = 28;
    if (isPT1043) v3ActualDay = 36; // 3 days late (window is 23-33)
    if (isPT1045) v3ActualDay = 38; // 5 days late

    // Determine dose
    let dose = 100;
    if (isPT1042) dose = 150;
    if (isPT1051) dose = 200;

    // Concomitant meds
    const conmeds = [
      { drugName: "Cardio-X", doseMg: dose, frequency: "QD", isInvestigational: true, startDate: addDays(5 + i * 2 + 1) },
      { drugName: "Lisinopril", doseMg: 10, frequency: "QD", isInvestigational: false, startDate: "2025-11-01" }
    ];

    if (isPT1043) {
      conmeds.push({
        drugName: "Drug-X",
        doseMg: 25,
        frequency: "BID",
        isInvestigational: false,
        startDate: addDays(5 + i * 2 + 12),
        prescriber: "External Cardiologist"
      });
    }

    if (isPT1052) {
      conmeds.push({
        drugName: "Ketoconazole",
        doseMg: 200,
        frequency: "QD",
        isInvestigational: false,
        startDate: addDays(5 + i * 2 + 10),
        prescriber: "Dermatologist"
      });
    }

    // Labs
    const ptLabs = [
      { labName: "Serum Electrolytes", date: addDays(5 + i * 2 + 14), status: "Completed", value: "Normal", unit: "mmol/L" }
    ];
    // CBC only if not in the missing CBC list
    if (!isPT1046 && !isPT1048 && !isPT1050) {
      ptLabs.push({
        labName: "Complete Blood Count (CBC)",
        date: addDays(5 + i * 2 + 26),
        status: "Completed",
        value: "Normal",
        unit: "cells/mcL"
      });
    }

    // Procedures for V1
    const v1Procedures = [
      "Informed Consent Form (ICF)",
      "Vital Signs (BP, HR, Resp, Temp)",
      ...(isPT1047 ? [] : ["12-Lead Baseline ECG"]), // PT-1047 missed baseline ECG
      "Physical Examination",
      "Baseline Safety Chemistry & Hematology",
      "Investigational Product Dispensation"
    ];

    // Procedures for V2
    const v2Procedures = isPT1053 ? [
      "Vital Signs",
      "Concomitant Medication Review",
      "Adverse Event (AE) Assessment",
      "Serum Electrolytes & Renal Function"
      // missing "Drug Accountability & Adherence Check"
    ] : [
      "Vital Signs",
      "Concomitant Medication Review",
      "Adverse Event (AE) Assessment",
      "Drug Accountability & Adherence Check",
      "Serum Electrolytes & Renal Function"
    ];

    return {
      id: ptId,
      siteId: "SITE-03",
      siteName: "Metro General Health Science Center",
      age: 52 + (i % 22),
      gender: i % 2 === 0 ? "Female" : "Male",
      status: isPT1048 ? "Active" : (i > 18 ? "Completed" : "Active"),
      enrollmentDate: addDays(5 + i * 2),
      visits: [
        {
          visitNumber: 1,
          scheduledDay: 1,
          actualDay: 1,
          date: addDays(5 + i * 2 + 1),
          status: "Completed",
          proceduresCompleted: v1Procedures,
          vitals: { bpSystolic: 134, bpDiastolic: 86, heartRate: 78 }
        },
        {
          visitNumber: 2,
          scheduledDay: 14,
          actualDay: v2ActualDay,
          date: v2ActualDay ? addDays(5 + i * 2 + v2ActualDay) : null,
          status: v2Status,
          proceduresCompleted: v2Status === "Missed" ? [] : v2Procedures,
          vitals: v2Status === "Missed" ? null : { bpSystolic: 132, bpDiastolic: 84, heartRate: 76 }
        },
        {
          visitNumber: 3,
          scheduledDay: 28,
          actualDay: v3ActualDay,
          date: addDays(5 + i * 2 + v3ActualDay),
          status: "Completed",
          proceduresCompleted: [
            "Vital Signs",
            "12-Lead Follow-up ECG",
            ...(isPT1046 || isPT1048 || isPT1050 ? [] : ["Complete Blood Count (CBC) with Differential"]),
            "Serum Cardiac Biomarkers (NT-proBNP, Troponin T)",
            "Primary Efficacy Endpoint Evaluation",
            "Drug Accountability & Reconciliation"
          ],
          vitals: { bpSystolic: 130, bpDiastolic: 82, heartRate: 74 }
        }
      ],
      labs: ptLabs,
      medications: conmeds
    };
  }),

  // ==========================================
  // SITE-04: Stanford Cardiovascular Institute (Clean site, Low Risk)
  // ~20 patients (PT-1064 to PT-1083)
  // Clean protocols, 1 minor administrative procedure notation
  // ==========================================
  ...Array.from({ length: 20 }, (_, i) => {
    const num = 1064 + i;
    const ptId = `PT-${num}`;
    const isPT1072 = ptId === "PT-1072";
    return {
      id: ptId,
      siteId: "SITE-04",
      siteName: "Stanford Cardiovascular Institute",
      age: 50 + (i % 20),
      gender: i % 2 === 0 ? "Male" : "Female",
      status: "Active",
      enrollmentDate: addDays(7 + i * 2),
      visits: [
        {
          visitNumber: 1,
          scheduledDay: 1,
          actualDay: 1,
          date: addDays(7 + i * 2 + 1),
          status: "Completed",
          proceduresCompleted: [
            "Informed Consent Form (ICF)",
            "Vital Signs (BP, HR, Resp, Temp)",
            "12-Lead Baseline ECG",
            "Physical Examination",
            "Baseline Safety Chemistry & Hematology",
            "Investigational Product Dispensation"
          ],
          vitals: { bpSystolic: 122, bpDiastolic: 78, heartRate: 68 }
        },
        {
          visitNumber: 2,
          scheduledDay: 14,
          actualDay: 14,
          date: addDays(7 + i * 2 + 14),
          status: "Completed",
          proceduresCompleted: [
            "Vital Signs",
            "Concomitant Medication Review",
            "Adverse Event (AE) Assessment",
            "Drug Accountability & Adherence Check",
            "Serum Electrolytes & Renal Function"
          ],
          vitals: isPT1072 ? null : { bpSystolic: 120, bpDiastolic: 76, heartRate: 66 }
        },
        {
          visitNumber: 3,
          scheduledDay: 28,
          actualDay: 28,
          date: addDays(7 + i * 2 + 28),
          status: "Completed",
          proceduresCompleted: [
            "Vital Signs",
            "12-Lead Follow-up ECG",
            "Complete Blood Count (CBC) with Differential",
            "Serum Cardiac Biomarkers (NT-proBNP, Troponin T)",
            "Primary Efficacy Endpoint Evaluation",
            "Drug Accountability & Reconciliation"
          ],
          vitals: { bpSystolic: 118, bpDiastolic: 74, heartRate: 65 }
        }
      ],
      labs: [
        { labName: "Complete Blood Count (CBC)", date: addDays(7 + i * 2 + 25), status: "Completed", value: "Normal", unit: "cells/mcL" },
        { labName: "Serum Electrolytes", date: addDays(7 + i * 2 + 14), status: "Completed", value: "Normal", unit: "mmol/L" }
      ],
      medications: [
        { drugName: "Cardio-X", doseMg: 100, frequency: "QD", isInvestigational: true, startDate: addDays(7 + i * 2 + 1) },
        { drugName: "Metoprolol", doseMg: 25, frequency: "BID", isInvestigational: false, startDate: "2025-06-10" }
      ]
    };
  }),

  // ==========================================
  // SITE-05: Boston Cardiovascular & Research Hospital (Medium Risk)
  // ~21 patients (PT-1084 to PT-1104)
  // Seeded:
  // - PT-1088: Prohibited "Drug-X" (CRITICAL)
  // - PT-1090: Missing CBC before Visit 3 (MAJOR)
  // - PT-1092: Late Visit 2 (Day 19 vs window 11-17) (MAJOR)
  // - PT-1095: Missed Visit 3 (CRITICAL)
  // ==========================================
  ...Array.from({ length: 21 }, (_, i) => {
    const num = 1084 + i;
    const ptId = `PT-${num}`;

    const isPT1088 = ptId === "PT-1088"; // Drug-X
    const isPT1090 = ptId === "PT-1090"; // Missing CBC
    const isPT1092 = ptId === "PT-1092"; // Late Visit 2 (Day 19)
    const isPT1095 = ptId === "PT-1095"; // Missed Visit 3
    const isPT1099 = ptId === "PT-1099"; // Late Visit 2 (Day 21)
    const isPT1102 = ptId === "PT-1102"; // Incorrect dose 150mg

    const conmeds = [
      { drugName: "Cardio-X", doseMg: isPT1102 ? 150 : 100, frequency: "QD", isInvestigational: true, startDate: addDays(8 + i * 2 + 1) },
      { drugName: "Furosemide", doseMg: 40, frequency: "QD", isInvestigational: false, startDate: "2025-09-20" }
    ];
    if (isPT1088) {
      conmeds.push({
        drugName: "Drug-X",
        doseMg: 50,
        frequency: "QD",
        isInvestigational: false,
        startDate: addDays(8 + i * 2 + 15),
        prescriber: "Local Clinic"
      });
    }

    const labs = [
      { labName: "Serum Electrolytes", date: addDays(8 + i * 2 + 14), status: "Completed", value: "Normal", unit: "mmol/L" }
    ];
    if (!isPT1090) {
      labs.push({
        labName: "Complete Blood Count (CBC)",
        date: addDays(8 + i * 2 + 26),
        status: "Completed",
        value: "Normal",
        unit: "cells/mcL"
      });
    }

    return {
      id: ptId,
      siteId: "SITE-05",
      siteName: "Boston Cardiovascular & Research Hospital",
      age: 60 + (i % 16),
      gender: i % 2 === 0 ? "Female" : "Male",
      status: isPT1095 ? "Lost to Follow-up" : "Active",
      enrollmentDate: addDays(8 + i * 2),
      visits: [
        {
          visitNumber: 1,
          scheduledDay: 1,
          actualDay: 1,
          date: addDays(8 + i * 2 + 1),
          status: "Completed",
          proceduresCompleted: [
            "Informed Consent Form (ICF)",
            "Vital Signs (BP, HR, Resp, Temp)",
            "12-Lead Baseline ECG",
            "Physical Examination",
            "Baseline Safety Chemistry & Hematology",
            "Investigational Product Dispensation"
          ],
          vitals: { bpSystolic: 126, bpDiastolic: 80, heartRate: 70 }
        },
        {
          visitNumber: 2,
          scheduledDay: 14,
          actualDay: isPT1092 ? 19 : (isPT1099 ? 21 : 14),
          date: addDays(8 + i * 2 + (isPT1092 ? 19 : (isPT1099 ? 21 : 14))),
          status: "Completed",
          proceduresCompleted: [
            "Vital Signs",
            "Concomitant Medication Review",
            "Adverse Event (AE) Assessment",
            "Drug Accountability & Adherence Check",
            "Serum Electrolytes & Renal Function"
          ],
          vitals: { bpSystolic: 124, bpDiastolic: 78, heartRate: 68 }
        },
        {
          visitNumber: 3,
          scheduledDay: 28,
          actualDay: isPT1095 ? null : 28,
          date: isPT1095 ? null : addDays(8 + i * 2 + 28),
          status: isPT1095 ? "Missed" : "Completed",
          proceduresCompleted: isPT1095 ? [] : [
            "Vital Signs",
            "12-Lead Follow-up ECG",
            ...(isPT1090 ? [] : ["Complete Blood Count (CBC) with Differential"]),
            "Serum Cardiac Biomarkers (NT-proBNP, Troponin T)",
            "Primary Efficacy Endpoint Evaluation",
            "Drug Accountability & Reconciliation"
          ],
          vitals: isPT1095 ? null : { bpSystolic: 122, bpDiastolic: 76, heartRate: 66 }
        }
      ],
      labs,
      medications: conmeds
    };
  })
];
