/* PedTrial in ZAK — example data for layout only (synthetic case, placeholder contacts).
   Extracted from the "PedTrial in ZAK" prototype; regenerate rather than hand-edit. */
import type { ProvenanceRow } from "../components/AI/Intake";
import type { ExcludedTrial, ScenarioRow, SiteRecipient, TrialCriterion } from "../components/AI/TrialMatch";

export const TRIAL_STATS = {
  "criteria_assessed": 539,
  "trials_assessed": 14,
  "corpus": 44,
  "biomcp": "0.9.1",
  "fetch_date": "2026-10-07",
  "model": "claude-sonnet-5-5"
};
export const TRIAL_ESTIMATE = {
  "trials": 14,
  "cost": "US$0.70",
  "minutes": "4–7"
};
export const TRIAL_TITLE = "H3 K27M thalamic glioma · AU/NZ trials";
export const TRIAL_RUN_TIME = "1m 56s";
export const TRIAL_FIRST_FIELDS = 17;
export const TRIAL_MISSING = [
  "age_years"
];
export const TRIAL_HELPFUL = [
  "recent blood counts and organ function (ANC, platelets, creatinine, bilirubin, ALT)"
];
export const TRIAL_QUESTION = "Radiotherapy finished 4 weeks ago. Is she still inside the window for randomisation, and does she need a new MRI before enrolment?";
export const TRIAL_REVISE_NOTE = "You asked for a shorter draft with only the radiotherapy timing question. The MRI question is gone; the summary, notice and recipient are unchanged.";

/** Chat transcript: even = user, odd = Zak's lead text. */
export const TRIAL_TRANSCRIPT: string[] = [
  "Girl with diffuse midline glioma of the left thalamus, H3 K27M-mutant on biopsy. Newly diagnosed; she completed focal radiotherapy (54 Gy) 4 weeks ago and her MRI is stable, with no leptomeningeal spread. Lansky 80, off dexamethasone, on levetiracetam. ANC 2.1, platelets 210, creatinine normal for age. Which trials in Australia and New Zealand could she join, and who is the site contact or PI?",
  "How old is she (in years)? That's the one fact still missing from the case card.",
  "She is 9 years old.",
  "The case card is complete. It's a synthetic 9-year-old girl with a newly diagnosed H3 K27M-mutant diffuse midline glioma of the left thalamus. She finished focal radiotherapy 4 weeks ago, has Lansky 80, and has no CNS spread. Bilirubin and ALT aren't recorded. That's optional, but they could help the matching.\n\nMatching would check 14 trials. It would cost about US$0.70 and take 4–7 minutes. Shall I go ahead?",
  "Yes, run the matching.",
  "Five trials ranked. Two have a direct molecular match: NCT05580562 (rank 1) and NCT05009992 (rank 2). Both test ONC201 against her H3 K27M mutation. The other three ranked without a molecular match. They are a selinexor trial for non-pontine tumours and two precision-medicine platform trials.\n\nNine trials were excluded. The main reasons were:\n- **Molecular mismatch:** some trials need an NTRK, ROS1 or ALK alteration, or require H3 K27M to be absent.\n- **Disease stage:** one trial enrols relapsed or refractory disease only.\n- **Pontine tumours:** one trial is for pontine tumours, and hers is thalamic.\n- **Timing:** one trial enrols up to 21 days after radiotherapy, and she is at 28 days.\n\nSeveral criteria have too little information to assess, and the reading of the criteria is automated and unvalidated. The trial team decides eligibility.\n\nYou asked for site contacts and PIs. I can list the AU/NZ sites and registry contacts for any of these trials, or draft an inquiry email. Which trial would you like?",
  "Please draft an inquiry for NCT05580562 to: Sydney Children's Hospital. My question: Radiotherapy finished 4 weeks ago. Is she still inside the window for randomisation, and does she need a new MRI before enrolment?",
  "The draft is ready in the panel. It's addressed to Dr Taylor Example (site.contact11@example.org), the listed contact at Sydney Children's Hospital for NCT05580562. It asks about the randomisation window after radiotherapy and whether she needs a new MRI before enrolment. There are no flags.\n\nI can't send email. Please review and edit the draft, then send it yourself. If the signature is blank, fill in the \"Your signature\" field in the panel. I can revise the wording if you want changes.",
  "Please make the draft shorter and keep only the radiotherapy timing question.",
  "I've shortened the draft, and it now asks only about radiotherapy timing. The MRI question is removed. The revised draft is in the panel and replaces the earlier one. It has a new ID, 4f585915af. The subject line now reads \"Eligibility question: NCT05580562, radiotherapy timing before randomization (synthetic case)\". It's still addressed to Dr Taylor Example at Sydney Children's Hospital, and there are no flags.\n\nI can't send it. Please review it, check that your signature is filled in the panel, and send it yourself.",
  "Write the MTB trial summary, including options if she relapses.",
  "The relapse scenario assumes a first relapse or progression after current therapy, with everything else as recorded. It would re-check 539 criteria across the 14 trials. The results are already cached, so it costs nothing and takes under a minute.\n\nShall I go ahead and write the summary with relapse options?",
  "Yes, run the relapse scenario.",
  "The summary is in the card below. At relapse, the two ONC201 trials (NCT05580562 and NCT05009992) would no longer apply, because they require a new diagnosis. The selinexor trial (NCT05099003) would also close. Two relapse-only trials would open for discussion: NCT04870944 (CBL0137) and NCT06838676 (ACT001).\n\nThere were no flags. These are options for discussion, not recommendations. The scenario is hypothetical, and washout, organ function and imaging would need re-checking at the time of relapse. The trial team decides eligibility."
];

export const TRIAL_CASE_CARD: ProvenanceRow[] = [
  {
    "field": "age_years",
    "value": "9",
    "phrase": "She is 9 years old"
  },
  {
    "field": "sex",
    "value": "female",
    "phrase": "Girl"
  },
  {
    "field": "diagnosis.name",
    "value": "diffuse midline glioma",
    "phrase": "diffuse midline glioma"
  },
  {
    "field": "diagnosis.category",
    "value": "high_grade_glioma",
    "phrase": "diffuse midline glioma"
  },
  {
    "field": "diagnosis.location",
    "value": "left thalamus",
    "phrase": "left thalamus"
  },
  {
    "field": "disease_status.status",
    "value": "newly diagnosed",
    "phrase": "Newly diagnosed"
  },
  {
    "field": "disease_status.cns_involvement",
    "value": "none",
    "phrase": "no leptomeningeal spread"
  },
  {
    "field": "weeks_since_radiotherapy_completion",
    "value": "4",
    "phrase": "completed focal radiotherapy (54 Gy) 4 weeks ago"
  },
  {
    "field": "performance_status.score",
    "value": "80",
    "phrase": "Lansky 80"
  },
  {
    "field": "performance_status.scale",
    "value": "Lansky",
    "phrase": "Lansky 80"
  },
  {
    "field": "other_clinical_details[0]",
    "value": "MRI is stable",
    "phrase": "her MRI is stable"
  },
  {
    "field": "other_clinical_details[1]",
    "value": "off dexamethasone",
    "phrase": "off dexamethasone"
  },
  {
    "field": "other_clinical_details[2]",
    "value": "on levetiracetam",
    "phrase": "on levetiracetam"
  },
  {
    "field": "other_clinical_details[3]",
    "value": "ANC 2.1",
    "phrase": "ANC 2.1"
  },
  {
    "field": "other_clinical_details[4]",
    "value": "platelets 210",
    "phrase": "platelets 210"
  },
  {
    "field": "other_clinical_details[5]",
    "value": "creatinine normal for age",
    "phrase": "creatinine normal for age"
  },
  {
    "field": "molecular_findings.somatic[0]",
    "value": "H3-3A K27M",
    "phrase": "H3 K27M-mutant on biopsy"
  },
  {
    "field": "prior_therapies[0]",
    "value": "focal radiotherapy 54 Gy (ended 2026-09)",
    "phrase": "completed focal radiotherapy (54 Gy) 4 weeks ago"
  }
];

export interface RankedTrial {
  rank: number;
  nct: string;
  title: string;
  phase: string;
  inclusion: string;
  match: "direct" | "none";
  unknown: number;
}
export const TRIAL_RANKED: RankedTrial[] = [
  {
    "rank": 1,
    "nct": "NCT05580562",
    "title": "ONC201 in H3 K27M-mutant Diffuse Glioma Following Radiotherapy (the ACTION Study)",
    "phase": "Phase 3",
    "inclusion": "7 of 12",
    "match": "direct",
    "unknown": 5
  },
  {
    "rank": 2,
    "nct": "NCT05009992",
    "title": "Combination Therapy for the Treatment of Diffuse Midline Gliomas",
    "phase": "Phase 2",
    "inclusion": "30 of 79",
    "match": "direct",
    "unknown": 9
  },
  {
    "rank": 3,
    "nct": "NCT05099003",
    "title": "A Study of the Drug Selinexor With Radiation Therapy in Patients With Newly-Diagnosed Diffuse Intrinsic Pontine (DIPG) Glioma and High-Grade Glioma (HGG)",
    "phase": "Phase 1/2",
    "inclusion": "12 of 27",
    "match": "none",
    "unknown": 2
  },
  {
    "rank": 4,
    "nct": "NCT05504772",
    "title": "Precision Medicine for Every Child With Cancer",
    "phase": "—",
    "inclusion": "2 of 4",
    "match": "none",
    "unknown": 2
  },
  {
    "rank": 5,
    "nct": "NCT06208657",
    "title": "Optimal Precision TherapIes to CustoMISE Care in Childhood and Adolescent Cancer",
    "phase": "Phase 1/2",
    "inclusion": "5 of 14",
    "match": "none",
    "unknown": 4
  }
];
export const TRIAL_EXCLUDED: ExcludedTrial[] = [
  {
    "nct": "NCT03581292",
    "title": "Veliparib, Radiation Therapy, and Temozolomide in Treating Patients With Newly Diagnosed Malignant Glioma Without H3 K27M or BRAFV600 Mutations",
    "reason": "Inclusion I4 not met: The case has an H3-3A K27M mutation, so it is not negative for H3 K27M."
  },
  {
    "nct": "NCT04655404",
    "title": "A Pilot Study of Larotrectinib for Newly-Diagnosed High-Grade Glioma With NTRK Fusion",
    "reason": "Inclusion I2 not met: The case is a newly diagnosed high-grade glioma, but the only molecular finding is H3-3A K27M and no NTRK fusion is documented, so the NTRK fusion requirement is not met."
  },
  {
    "nct": "NCT04870944",
    "title": "CBL0137 for the Treatment of Relapsed or Refractory Solid Tumors, Including CNS Tumors and Lymphoma",
    "reason": "Cohort 'Part A' does not fit: Inclusion I1 not met: The case is not in a tagged cohort, since she is newly diagnosed and the trial enrolls relapsed or refractory disease, so the cohort-tagged criterion is labelled not_met even though her age of 9 years falls within the range."
  },
  {
    "nct": "NCT05839379",
    "title": "Targeted Pediatric High-Grade Glioma Therapy",
    "reason": "Inclusion I18 not met: The patient is about 4 weeks (28 days) post RT, which exceeds the latest enrollment timepoint (21 days post RT) for any screening option."
  },
  {
    "nct": "NCT05843253",
    "title": "Study of Ribociclib and Everolimus in HGG and DIPG or Ribociclib and Temozolomide in DHG, H3G34-mutant",
    "reason": "Inclusion group 'actionable somatic alteration' (I10, I11, I12, I13, I14, I15, I16, I17): none of the alternatives is met."
  },
  {
    "nct": "NCT06333899",
    "title": "Lorlatinib for Newly-Diagnosed High-Grade Glioma With ROS or ALK Fusion",
    "reason": "Inclusion I2 not met: The case is newly diagnosed high-grade glioma but the only molecular finding is H3-3A K27M with no ALK or ROS1 fusion reported, so the fusion requirement is not met."
  },
  {
    "nct": "NCT06838676",
    "title": "ACT001 for the Treatment of Diffuse Intrinsic Pontine Gliomas and H3K27-altered High Grade Gliomas",
    "reason": "Cohort 'Cohort A' does not fit: Inclusion I2 not met: Cohort A requires newly diagnosed DIPG with a pontine epicenter, but this tumor is a left thalamic diffuse midline glioma, so the case does not belong to Cohort A."
  },
  {
    "nct": "NCT04094610",
    "title": "A Study of Repotrectinib in Pediatric and Young Adult Subjects Harboring ALK, ROS1, OR NTRK1-3 Alterations",
    "reason": "Inclusion I1 not met: The only documented alteration is H3-3A K27M; no ROS1 mutation/fusion/amplification or NTRK1-3 fusion is reported, and a good card would list it if present."
  },
  {
    "nct": "NCT04775485",
    "title": "A Study to Evaluate Tovorafenib in Pediatric and Young Adult Participants With Relapsed or Progressive Low-Grade Glioma and Advance Solid Tumors",
    "reason": "Inclusion I4 not met: The patient is newly diagnosed with only radiotherapy as prior therapy, no prior systemic therapy, and the MRI is stable without radiographic progression."
  }
];
export const TRIAL_SUMMARY_ROWS = [
  {
    "rank": 1,
    "title": "ONC201 in H3 K27M-mutant Diffuse Glioma Following Radiotherapy (the ACTION Study)",
    "nct": "NCT05580562",
    "phase": "3",
    "mol": "Direct target: Dordaviprone (ONC201) → H3-3A K27M",
    "inc": "7 of 12",
    "unknown": 5,
    "cohort": "—"
  },
  {
    "rank": 2,
    "title": "Combination Therapy for the Treatment of Diffuse Midline Gliomas",
    "nct": "NCT05009992",
    "phase": "2",
    "mol": "Direct target: ONC201 → H3-3A K27M",
    "inc": "30 of 79",
    "unknown": 9,
    "cohort": "Cohort 4A > 4A^2; Cohort 4B > 4B^2"
  },
  {
    "rank": 3,
    "title": "A Study of the Drug Selinexor With Radiation Therapy in Patients With Newly-Diagnosed Diffuse Intrinsic Pontine (DIPG) Glioma and High-Grade Glioma (HGG)",
    "nct": "NCT05099003",
    "phase": "1/2",
    "mol": "No molecular match",
    "inc": "12 of 27",
    "unknown": 2,
    "cohort": "Pre-enrollment > Non-pontine tumors"
  },
  {
    "rank": 4,
    "title": "Precision Medicine for Every Child With Cancer",
    "nct": "NCT05504772",
    "phase": "—",
    "mol": "No molecular match",
    "inc": "2 of 4",
    "unknown": 2,
    "cohort": "—"
  },
  {
    "rank": 5,
    "title": "Optimal Precision TherapIes to CustoMISE Care in Childhood and Adolescent Cancer",
    "nct": "NCT06208657",
    "phase": "1/2",
    "mol": "No molecular match",
    "inc": "5 of 14",
    "unknown": 4,
    "cohort": "Arms with orally administered therapeutic agents"
  }
];

export const TRIAL_FOCUS = { nct: "NCT05580562", short: "ACTION", title: "ONC201 in H3 K27M-mutant Diffuse Glioma Following Radiotherapy (the ACTION Study)" };
export const TRIAL_CRITERIA: TrialCriterion[] = [
  {
    "id": "I1",
    "type": "inclusion",
    "text": "Able to understand the study procedures and agree to participate in the study by providing written informed consent (by participant or legally authorized representative), and assent when applicable.",
    "cohorts": [],
    "reading": "insufficient_info",
    "why": "The case card has no information on consent or assent ability, and this is a procedural item the card would typically not capture, so it cannot be determined.",
    "evidence": [
      "age_years",
      "other_clinical_details"
    ]
  },
  {
    "id": "I2",
    "type": "inclusion",
    "text": "Body weight ≥ 10 kg at time of randomization.",
    "cohorts": [],
    "reading": "insufficient_info",
    "why": "Body weight is not recorded on the card; a 9-year-old is likely above 10 kg but this is not documented.",
    "evidence": [
      "age_years",
      "other_clinical_details"
    ]
  },
  {
    "id": "I3",
    "type": "inclusion",
    "text": "Histologically diagnosed H3 K27M-mutant diffuse glioma (new diagnosis).",
    "cohorts": [],
    "reading": "met",
    "why": "The case has a newly diagnosed diffuse midline glioma with H3-3A K27M from biopsy, consistent with a histologically diagnosed H3 K27M-mutant diffuse glioma.",
    "evidence": [
      "diagnosis.name",
      "disease_status.status",
      "molecular_findings.somatic[0].gene",
      "molecular_findings.somatic[0].alteration",
      "molecular_findings.somatic[0].source"
    ]
  },
  {
    "id": "I4",
    "type": "inclusion",
    "text": "Detection of a missense K27M mutation in any histone H3-encoding gene detected by testing of tumor tissue (immunohistochemistry [IHC] or next-generation sequencing [NGS] in a Clinical Laboratory Improvement Amendments [CLIA]-certified or equivalent laboratory). [Site to provide (as available): ≥ 11 unstained formalin-fixed paraffin-embedded (FFPE) slides from tumor tissue.]",
    "cohorts": [],
    "reading": "met",
    "why": "A K27M missense alteration in H3-3A (a histone H3-encoding gene) was detected from biopsy tissue, although the testing method/laboratory is not specified, this meets the substance of the criterion.",
    "evidence": [
      "molecular_findings.somatic[0].gene",
      "molecular_findings.somatic[0].alteration",
      "molecular_findings.somatic[0].source"
    ]
  },
  {
    "id": "I5",
    "type": "inclusion",
    "text": "At least one, high-quality, contrast-enhanced MRI of the brain obtained prior to starting radiotherapy for submission to sponsor's imaging vendor for central read. For participants who had a surgical resection, this scan must be post-resection; for participants who did not have a resection, this scan may be pre- or post-biopsy.",
    "cohorts": [],
    "reading": "insufficient_info",
    "why": "No information on availability of a pre-radiotherapy contrast-enhanced MRI is given in the card.",
    "evidence": [
      "other_clinical_details",
      "prior_therapies"
    ]
  },
  {
    "id": "I6",
    "type": "inclusion",
    "text": "At least one, high-quality, contrast-enhanced MRI of the brain obtained 2 to 6 weeks after completion of frontline radiotherapy. If unable to obtain contrast-enhanced imaging due to lack of venous access after multiple attempts, a patient may still be eligible after collection of a nonenhanced MRI of the brain. [Site to also provide all available MRIs completed prior to initiating treatment with study intervention.]",
    "cohorts": [],
    "reading": "insufficient_info",
    "why": "The card notes MRI is stable and 4 weeks since radiotherapy, implying a post-RT MRI within the 2-6 week window, but contrast status and quality are not stated.",
    "evidence": [
      "other_clinical_details[0]",
      "weeks_since_radiotherapy_completion"
    ]
  },
  {
    "id": "I7",
    "type": "inclusion",
    "text": "Received frontline radiotherapy",
    "cohorts": [],
    "reading": "met",
    "why": "The case received focal radiotherapy 54 Gy as frontline therapy.",
    "evidence": [
      "prior_therapies[0].therapy",
      "weeks_since_radiotherapy_completion"
    ]
  },
  {
    "id": "I8",
    "type": "inclusion",
    "text": "[Received frontline radiotherapy] Initiated radiotherapy within 12 weeks from the initial diagnosis of H3 K27M-mutant diffuse glioma.",
    "cohorts": [],
    "reading": "insufficient_info",
    "why": "Radiotherapy was received but the start date and diagnosis date are not provided, so timing within 12 weeks of diagnosis cannot be verified.",
    "evidence": [
      "prior_therapies[0]",
      "disease_status.status"
    ]
  },
  {
    "id": "I9",
    "type": "inclusion",
    "text": "[Received frontline radiotherapy] Completed radiotherapy within 2 to 6 weeks prior to randomization",
    "cohorts": [],
    "reading": "met",
    "why": "Radiotherapy was completed 4 weeks ago, within the 2 to 6 week window.",
    "evidence": [
      "weeks_since_radiotherapy_completion",
      "prior_therapies[0].end"
    ]
  },
  {
    "id": "I10",
    "type": "inclusion",
    "text": "[Received frontline radiotherapy] Completed standard fractionated radiotherapy (eg. 54 to 60 Gy in 28 to 33 fractions given over approximately 6 weeks or hypofractionated radiotherapy (eg. 40 Gy in 15 fractions given over approximately 3 weeks).",
    "cohorts": [],
    "reading": "met",
    "why": "54 Gy focal radiotherapy matches the standard fractionated range of 54-60 Gy, though the number of fractions is not stated.",
    "evidence": [
      "prior_therapies[0].therapy"
    ]
  },
  {
    "id": "I11",
    "type": "inclusion",
    "text": "Karnofsky Performance Status or Lansky Performance Status ≥ 70 at time of randomization.",
    "cohorts": [],
    "reading": "met",
    "why": "Lansky performance score is 80, which is ≥70.",
    "evidence": [
      "performance_status.score",
      "performance_status.scale"
    ]
  },
  {
    "id": "I12",
    "type": "inclusion",
    "text": "Stable or decreasing dose of corticosteroids and anti-seizure medications for 7 days prior to randomization, if applicable. Stable steroid dose is defined as ≤ 2 mg/day increase (based on dexamethasone dose or equivalent dose of an alternative steroid).",
    "cohorts": [],
    "reading": "met",
    "why": "The patient is off dexamethasone and on levetiracetam, with no indication of dose change, so steroid and anti-seizure medications are stable.",
    "evidence": [
      "other_clinical_details[1]",
      "other_clinical_details[2]"
    ]
  },
  {
    "id": "E1",
    "type": "exclusion",
    "text": "Primary spinal tumor.",
    "cohorts": [],
    "reading": "not_met",
    "why": "The tumor is in the left thalamus, not a primary spinal tumor.",
    "evidence": [
      "diagnosis.location"
    ]
  },
  {
    "id": "E2",
    "type": "exclusion",
    "text": "Diffuse intrinsic pontine glioma (DIPG), defined as tumors with a pontine epicenter and diffuse involvement of the pons.",
    "cohorts": [],
    "reading": "not_met",
    "why": "The tumor is thalamic, not pontine, so it is not DIPG.",
    "evidence": [
      "diagnosis.location",
      "diagnosis.name"
    ]
  },
  {
    "id": "E3",
    "type": "exclusion",
    "text": "Evidence of leptomeningeal spread of disease or cerebrospinal fluid dissemination.",
    "cohorts": [],
    "reading": "not_met",
    "why": "CNS involvement is recorded as none, so there is no leptomeningeal or CSF spread.",
    "evidence": [
      "disease_status.cns_involvement"
    ]
  },
  {
    "id": "E4",
    "type": "exclusion",
    "text": "Any known concurrent malignancy.",
    "cohorts": [],
    "reading": "not_met",
    "why": "No concurrent malignancy is mentioned, and a complete case card would list one if present.",
    "evidence": [
      "diagnosis.name",
      "other_clinical_details"
    ]
  },
  {
    "id": "E5",
    "type": "exclusion",
    "text": "New lesion(s) outside of the radiation field.",
    "cohorts": [],
    "reading": "not_met",
    "why": "MRI is described as stable, which implies no new lesions outside the radiation field.",
    "evidence": [
      "other_clinical_details[0]",
      "disease_status.status"
    ]
  },
  {
    "id": "E6",
    "type": "exclusion",
    "text": "Received whole-brain radiotherapy.",
    "cohorts": [],
    "reading": "not_met",
    "why": "The radiotherapy was focal (54 Gy), not whole-brain.",
    "evidence": [
      "prior_therapies[0].therapy"
    ]
  },
  {
    "id": "E7",
    "type": "exclusion",
    "text": "Received proton therapy for glioma.",
    "cohorts": [],
    "reading": "not_met",
    "why": "The radiotherapy is listed as focal radiotherapy with no mention of protons, so proton therapy is not documented.",
    "evidence": [
      "prior_therapies[0].therapy"
    ]
  },
  {
    "id": "E8",
    "type": "exclusion",
    "text": "Use of any of the following treatments within the specified time periods prior to randomization: Dordaviprone (ONC201) or ONC206 at any time.",
    "cohorts": [],
    "reading": "not_met",
    "why": "The only prior therapy is radiotherapy, with no ONC201 or ONC206 exposure.",
    "evidence": [
      "prior_therapies"
    ]
  },
  {
    "id": "E9",
    "type": "exclusion",
    "text": "Use of any of the following treatments within the specified time periods prior to randomization: Systemic bevacizumab (includes biosimilars) at any time since the initial diagnosis of H3 K27M-mutant diffuse glioma.",
    "cohorts": [],
    "reading": "not_met",
    "why": "The only prior therapy is radiotherapy, with no bevacizumab exposure.",
    "evidence": [
      "prior_therapies"
    ]
  },
  {
    "id": "E10",
    "type": "exclusion",
    "text": "Use of any of the following treatments within the specified time periods prior to randomization: Temozolomide within past 3 weeks.",
    "cohorts": [],
    "reading": "not_met",
    "why": "No temozolomide is listed in prior therapies, and it would be recorded if given recently.",
    "evidence": [
      "prior_therapies"
    ]
  },
  {
    "id": "E11",
    "type": "exclusion",
    "text": "Use of any of the following treatments within the specified time periods prior to randomization: Tumor treating fields at any time.",
    "cohorts": [],
    "reading": "not_met",
    "why": "No tumor treating fields are listed in prior therapies.",
    "evidence": [
      "prior_therapies"
    ]
  },
  {
    "id": "E12",
    "type": "exclusion",
    "text": "Use of any of the following treatments within the specified time periods prior to randomization: DRD2 antagonist within past 2 weeks.",
    "cohorts": [],
    "reading": "not_met",
    "why": "No DRD2 antagonist is listed among the therapies or medications; the only medication mentioned is levetiracetam.",
    "evidence": [
      "prior_therapies",
      "other_clinical_details[2]"
    ]
  },
  {
    "id": "E13",
    "type": "exclusion",
    "text": "Use of any of the following treatments within the specified time periods prior to randomization: Any investigational therapy within past 4 weeks.",
    "cohorts": [],
    "reading": "not_met",
    "why": "No investigational therapy is listed in prior therapies.",
    "evidence": [
      "prior_therapies"
    ]
  },
  {
    "id": "E14",
    "type": "exclusion",
    "text": "Use of any of the following treatments within the specified time periods prior to randomization: Strong CYP3A4 inhibitors within 3 days.",
    "cohorts": [],
    "reading": "not_met",
    "why": "The only concomitant medication is levetiracetam, which is not a strong CYP3A4 inhibitor.",
    "evidence": [
      "other_clinical_details[2]"
    ]
  },
  {
    "id": "E15",
    "type": "exclusion",
    "text": "Use of any of the following treatments within the specified time periods prior to randomization: Strong CYP3A4 inducers (includes enzyme-inducing antiepileptic drugs) within 2 weeks.",
    "cohorts": [],
    "reading": "not_met",
    "why": "Levetiracetam is not an enzyme-inducing antiepileptic drug or a strong CYP3A4 inducer.",
    "evidence": [
      "other_clinical_details[2]"
    ]
  },
  {
    "id": "E16",
    "type": "exclusion",
    "text": "Laboratory test results within 2 weeks prior to randomization: Absolute neutrophil count < 1.0 × 109/L or platelets < 75 × 109/L.",
    "cohorts": [],
    "reading": "not_met",
    "why": "ANC 2.1 and platelets 210 are above the thresholds (assuming standard 10^9/L units).",
    "evidence": [
      "other_clinical_details[3]",
      "other_clinical_details[4]"
    ]
  },
  {
    "id": "E17",
    "type": "exclusion",
    "text": "Laboratory test results within 2 weeks prior to randomization: Total bilirubin > 1.5 × upper limit of normal (ULN) (participants with Gilbert's syndrome may be included with total bilirubin > 1.5 × ULN if direct bilirubin is ≤ 1.5 × ULN).",
    "cohorts": [],
    "reading": "not_met",
    "why": "Bilirubin is not reported, but hepatic abnormality would likely be noted if present, so it is assumed normal.",
    "evidence": [
      "other_clinical_details"
    ]
  },
  {
    "id": "E18",
    "type": "exclusion",
    "text": "Laboratory test results within 2 weeks prior to randomization: Aspartate aminotransferase (AST) or alanine aminotransferase (ALT) > 2.5 × ULN.",
    "cohorts": [],
    "reading": "not_met",
    "why": "AST/ALT are not reported, but a significant elevation would likely be recorded, so it is assumed normal.",
    "evidence": [
      "other_clinical_details"
    ]
  },
  {
    "id": "E19",
    "type": "exclusion",
    "text": "Laboratory test results within 2 weeks prior to randomization: Creatinine clearance ≤ 60 mL/min as calculated by the Cockcroft Gault equation (or estimated glomerular filtration rate < 60 mL/min/1.73 m2).",
    "cohorts": [],
    "reading": "not_met",
    "why": "Creatinine is normal for age, which implies adequate renal function.",
    "evidence": [
      "other_clinical_details[5]"
    ]
  },
  {
    "id": "E20",
    "type": "exclusion",
    "text": "QTc > 480 msec (based on mean from triplicate electrocardiograms) during screening.",
    "cohorts": [],
    "reading": "not_met",
    "why": "QTc is not reported, and no cardiac abnormality is noted, so prolongation is not assumed.",
    "evidence": [
      "other_clinical_details"
    ]
  },
  {
    "id": "E21",
    "type": "exclusion",
    "text": "Known hypersensitivity to any excipients used in the study intervention formulation.",
    "cohorts": [],
    "reading": "not_met",
    "why": "No hypersensitivity is documented.",
    "evidence": [
      "other_clinical_details"
    ]
  },
  {
    "id": "E22",
    "type": "exclusion",
    "text": "Pregnant, breastfeeding, or planning to become pregnant while receiving study intervention or within 3 months after the last dose. Participants of childbearing potential must have a negative serum pregnancy test within 72 hours prior to receiving the first dose of study intervention.",
    "cohorts": [],
    "reading": "not_met",
    "why": "A 9-year-old female is very unlikely to be pregnant or breastfeeding, and none is documented.",
    "evidence": [
      "age_years",
      "sex"
    ]
  },
  {
    "id": "E23",
    "type": "exclusion",
    "text": "Uncontrolled intercurrent illness including, but not limited to, ongoing or active infection requiring systemic therapy or psychiatric illness/social situations that would limit compliance with study requirements.",
    "cohorts": [],
    "reading": "not_met",
    "why": "No uncontrolled intercurrent illness or active infection is documented.",
    "evidence": [
      "other_clinical_details"
    ]
  },
  {
    "id": "E24",
    "type": "exclusion",
    "text": "Any other condition (eg, medical, psychiatric, or social) that, in the opinion of the investigator, may interfere with participant safety or the ability to complete the study according to the protocol.",
    "cohorts": [],
    "reading": "not_met",
    "why": "No other interfering condition is documented; Lansky 80 with stable MRI and off steroids.",
    "evidence": [
      "performance_status.score",
      "other_clinical_details"
    ]
  }
];
export const TRIAL_SITES: SiteRecipient[] = [
  {
    "id": "s0",
    "facility": "Sydney Children's Hospital",
    "city": "Randwick",
    "recipient": {
      "name": "Dr Taylor Example",
      "email": "site.contact11@example.org",
      "role": "site contact"
    }
  },
  {
    "id": "s1",
    "facility": "Royal North Shore Hospital",
    "city": "Sydney",
    "recipient": {
      "name": "Dr Avery Example",
      "email": "site.contact14@example.org",
      "role": "site contact"
    }
  },
  {
    "id": "s2",
    "facility": "Royal Brisbane and Women's Hospital",
    "city": "Herston",
    "recipient": {
      "name": "Dr Casey Example",
      "email": "site.contact4@example.org",
      "role": "site contact"
    }
  },
  {
    "id": "s3",
    "facility": "Royal Hobart Hospital",
    "city": "Hobart",
    "recipient": {
      "name": "Riley Example",
      "email": "site.contact6@example.org",
      "role": "site contact"
    }
  },
  {
    "id": "s4",
    "facility": "Olivia Newton-John Cancer Research Institute (ONJCRI)",
    "city": "Heidelberg",
    "recipient": {
      "name": "Jordan Example",
      "email": "site.contact1@example.org",
      "role": "site contact"
    }
  },
  {
    "id": "s5",
    "facility": "Perth Children's Hospital",
    "city": "Nedlands",
    "recipient": {
      "name": "Morgan Example",
      "email": "emerson.example@example.org",
      "role": "site contact"
    }
  }
];

export const TRIAL_MTB = {
  paragraph: "Two currently open trials have a direct molecular match to the H3-3A K27M alteration: NCT05580562 (dordaviprone, ONC201, in H3 K27M-mutant diffuse glioma following radiotherapy) and NCT05009992 (ONC201, in diffuse midline gliomas). Both may be considered for discussion, with eligibility to be confirmed with the trial team. At relapse or progression, both would no longer apply, as they require a new diagnosis. Two trials open only at relapse mention the case's alteration and could be considered if the patient relapses: NCT04870944 (CBL0137, relapsed or refractory solid tumours including CNS tumours and lymphoma) and NCT06838676 (ACT001, DIPG and H3K27-altered high grade gliomas).",
  assumption: "Hypothetical scenario: first relapse or progression after current therapy; all other facts as currently recorded. Re-check washout, organ function and imaging at the time of relapse.",
  references: [
  "NCT05580562. ONC201 in H3 K27M-mutant Diffuse Glioma Following Radiotherapy (the ACTION Study). ClinicalTrials.gov (fetched 2026-10-07). https://clinicaltrials.gov/study/NCT05580562; molecular evidence: COSM327928, MyChem target CLPP (DB14844), chr1:g.226252135A>T, curated: data/target_map.json, rs1057519903",
  "NCT05009992. Combination Therapy for the Treatment of Diffuse Midline Gliomas. ClinicalTrials.gov (fetched 2026-10-07). https://clinicaltrials.gov/study/NCT05009992; molecular evidence: COSM327928, chr1:g.226252135A>T, curated: data/target_map.json, rs1057519903",
  "NCT04870944. CBL0137 for the Treatment of Relapsed or Refractory Solid Tumors, Including CNS Tumors and Lymphoma. ClinicalTrials.gov (fetched 2026-10-07). https://clinicaltrials.gov/study/NCT04870944",
  "NCT06838676. ACT001 for the Treatment of Diffuse Intrinsic Pontine Gliomas and H3K27-altered High Grade Gliomas. ClinicalTrials.gov (fetched 2026-10-07). https://clinicaltrials.gov/study/NCT06838676",
  "Eligibility readings: PedTrial automated criterion matching (TrialGPT method); not clinically validated.",
  "Hypothetical scenario: first relapse or progression after current therapy; all other facts as currently recorded. Re-check washout, organ function and imaging at the time of relapse."
] as string[],
  words: 100,
  recheck: {
  "trials": 14,
  "criteria": 539,
  "ranked": 4
},
};
export const TRIAL_SCENARIO: ScenarioRow[] = [
  {
    "nct": "NCT05580562",
    "title": "ONC201 in H3 K27M-mutant Diffuse Glioma Following Radiotherapy (the ACTION Study)",
    "now": "ranked",
    "then": "closes",
    "why": "Requires a new diagnosis (I3)."
  },
  {
    "nct": "NCT05009992",
    "title": "Combination Therapy for the Treatment of Diffuse Midline Gliomas",
    "now": "ranked",
    "then": "closes",
    "why": "Its cohorts need a new diagnosis; none fits at relapse."
  },
  {
    "nct": "NCT05099003",
    "title": "A Study of the Drug Selinexor With Radiation Therapy in Patients With Newly-Diagnosed Diffuse Intrinsic Pontine (DIPG) Glioma and High-Grade Glioma (HGG)",
    "now": "ranked",
    "then": "closes",
    "why": "No pre-enrolment diagnosis option fits at relapse."
  },
  {
    "nct": "NCT05504772",
    "title": "Precision Medicine for Every Child With Cancer",
    "now": "ranked",
    "then": "still-open",
    "why": "Ranked now and at relapse."
  },
  {
    "nct": "NCT06208657",
    "title": "Optimal Precision TherapIes to CustoMISE Care in Childhood and Adolescent Cancer",
    "now": "ranked",
    "then": "still-open",
    "why": "Ranked now and at relapse."
  },
  {
    "nct": "NCT04870944",
    "title": "CBL0137 for the Treatment of Relapsed or Refractory Solid Tumors, Including CNS Tumors and Lymphoma",
    "now": "excluded",
    "then": "opens",
    "why": "Relapsed or refractory disease only; Part B names H3 K27-altered DMG."
  },
  {
    "nct": "NCT06838676",
    "title": "ACT001 for the Treatment of Diffuse Intrinsic Pontine Gliomas and H3K27-altered High Grade Gliomas",
    "now": "excluded",
    "then": "opens",
    "why": "Ranked at relapse; the trial names H3K27-altered high-grade glioma."
  }
];

export const TRIAL_DRAFTS = [
  {
    "to": {
      "name": "Dr Taylor Example",
      "email": "site.contact11@example.org",
      "role": "CONTACT",
      "facility": "Sydney Children's Hospital",
      "note": ""
    },
    "subject": "Eligibility question: NCT05580562, radiotherapy window and MRI timing (synthetic case)",
    "flags": [],
    "body": "Dear Dr Taylor Example,\n\nPlease note: this inquiry concerns a SYNTHETIC case created for testing research software (PedTrial, a research demo). It is not a real patient or a clinical referral, and no action is needed beyond any feedback you are willing to share.\n\nI am writing about ONC201 in H3 K27M-mutant Diffuse Glioma Following Radiotherapy (the ACTION Study) (NCT05580562, https://clinicaltrials.gov/study/NCT05580562) at Sydney Children's Hospital.\n\nCase summary (synthetic):\n- 9-year-old female with diffuse midline glioma.\n- Disease status: newly diagnosed; cns involvement: none.\n- Somatic: H3-3A K27M (biopsy).\n- Prior therapy: focal radiotherapy 54 Gy, ended 2026-09.\n- Radiotherapy completed about 4 weeks ago.\n- Performance status: Lansky 80.\n- Other clinical details: MRI is stable; off dexamethasone; on levetiracetam; ANC 2.1; platelets 210; creatinine normal for age.\n\nQuestions:\n1. This 9-year-old patient completed focal radiotherapy (54 Gy) about 4 weeks ago. Could you confirm whether she is still within the protocol's allowed window between completing radiotherapy and randomization?\n   Relevant criterion I9: \"[Received frontline radiotherapy] Completed radiotherapy within 2 to 6 weeks prior to randomization\"\n   Our automated reading: met. Radiotherapy was completed 4 weeks ago, within the 2 to 6 week window.\n   Relevant criterion I10: \"[Received frontline radiotherapy] Completed standard fractionated radiotherapy (eg. 54 to 60 Gy in 28 to 33 fractions given over approximately 6 weeks or hypofractionated radiotherapy (eg. 40 Gy in 15 fractions given over approximately 3 weeks).\"\n   Our automated reading: met. 54 Gy focal radiotherapy matches the standard fractionated range of 54-60 Gy, though the number of fractions is not stated.\n   Relevant criterion I7: \"Received frontline radiotherapy\"\n   Our automated reading: met. The case received focal radiotherapy 54 Gy as frontline therapy.\n2. Her MRI is described as stable. Does she need a new contrast-enhanced brain MRI obtained 2 to 6 weeks after completing radiotherapy before enrolment, or could an existing scan satisfy this requirement?\n   Relevant criterion I6: \"At least one, high-quality, contrast-enhanced MRI of the brain obtained 2 to 6 weeks after completion of frontline radiotherapy. If unable to obtain contrast-enhanced imaging due to lack of venous access after multiple attempts, a patient may still be eligible after collection of a nonenhanced MRI of the brain. [Site to also provide all available MRIs completed prior to initiating treatment with study intervention.]\"\n   Our automated reading: insufficient info. The card notes MRI is stable and 4 weeks since radiotherapy, implying a post-RT MRI within the 2-6 week window, but contrast status and quality are not stated.\n   Relevant criterion I5: \"At least one, high-quality, contrast-enhanced MRI of the brain obtained prior to starting radiotherapy for submission to sponsor's imaging vendor for central read. For participants who had a surgical resection, this scan must be post-resection; for participants who did not have a resection, this scan may be pre- or post-biopsy.\"\n   Our automated reading: insufficient info. No information on availability of a pre-radiotherapy contrast-enhanced MRI is given in the card.\n\nI would be grateful for any guidance you can share.\n\nKind regards,\nDemo User, Research Fellow, Children's Cancer Institute\n\n--\nEligibility readings above were produced automatically by a research prototype and have not been clinically validated; the trial team's judgement is authoritative."
  },
  {
    "to": {
      "name": "Dr Taylor Example",
      "email": "site.contact11@example.org",
      "role": "CONTACT",
      "facility": "Sydney Children's Hospital",
      "note": ""
    },
    "subject": "Eligibility question: NCT05580562, radiotherapy timing before randomization (synthetic case)",
    "flags": [],
    "body": "Dear Dr Taylor Example,\n\nPlease note: this inquiry concerns a SYNTHETIC case created for testing research software (PedTrial, a research demo). It is not a real patient or a clinical referral, and no action is needed beyond any feedback you are willing to share.\n\nI am writing about ONC201 in H3 K27M-mutant Diffuse Glioma Following Radiotherapy (the ACTION Study) (NCT05580562, https://clinicaltrials.gov/study/NCT05580562) at Sydney Children's Hospital.\n\nCase summary (synthetic):\n- 9-year-old female with diffuse midline glioma.\n- Disease status: newly diagnosed; cns involvement: none.\n- Somatic: H3-3A K27M (biopsy).\n- Prior therapy: focal radiotherapy 54 Gy, ended 2026-09.\n- Radiotherapy completed about 4 weeks ago.\n- Performance status: Lansky 80.\n- Other clinical details: MRI is stable; off dexamethasone; on levetiracetam; ANC 2.1; platelets 210; creatinine normal for age.\n\nQuestions:\n1. This 9-year-old patient completed focal radiotherapy (54 Gy) about 4 weeks ago. Could you confirm whether she is still within the protocol's window for randomization?\n   Relevant criterion I9: \"[Received frontline radiotherapy] Completed radiotherapy within 2 to 6 weeks prior to randomization\"\n   Our automated reading: met. Radiotherapy was completed 4 weeks ago, within the 2 to 6 week window.\n   Relevant criterion I10: \"[Received frontline radiotherapy] Completed standard fractionated radiotherapy (eg. 54 to 60 Gy in 28 to 33 fractions given over approximately 6 weeks or hypofractionated radiotherapy (eg. 40 Gy in 15 fractions given over approximately 3 weeks).\"\n   Our automated reading: met. 54 Gy focal radiotherapy matches the standard fractionated range of 54-60 Gy, though the number of fractions is not stated.\n   Relevant criterion I7: \"Received frontline radiotherapy\"\n   Our automated reading: met. The case received focal radiotherapy 54 Gy as frontline therapy.\n\nI would be grateful for any guidance you can share.\n\nKind regards,\nDemo User, Research Fellow, Children's Cancer Institute\n\n--\nEligibility readings above were produced automatically by a research prototype and have not been clinically validated; the trial team's judgement is authoritative."
  }
];
