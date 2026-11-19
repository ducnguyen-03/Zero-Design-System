/* Insights onboarding — copy and tour steps from the Claude Design "Insights Onboarding" prototype. */
import type { TermsSection, TourStep } from "../components/OnboardingTour";
import { TourIllustration } from "../components/OnboardingTour";

export const TERMS_SUBTITLE = "Your agreement with Children’s Cancer Institute · Effective September 2026";
export const TERMS_INTRO = "Welcome to Insights. By accessing or using Insights, you agree to the following terms of use.";

export const TERMS: TermsSection[] = [
  {
    heading: "Eligibility",
    paragraphs: [
      'These terms apply to anyone who accesses or uses Insights ("you"). By using Insights you confirm you are at least 18 years old and able to enter a binding agreement.',
      "If you use Insights on behalf of an institution, you accept these terms for that institution to the extent you are authorised to do so.",
    ],
  },
  {
    heading: "Licence to use Insights",
    paragraphs: [
      'Children’s Cancer Institute ("CCI") grants you a limited, revocable, non-exclusive, non-transferable licence to access Insights and to view, analyse and process the data it makes available, for as long as your access remains active.',
      "No other rights in CCI’s intellectual property are granted to you.",
    ],
  },
  {
    heading: "Changes to these terms and to Insights",
    paragraphs: [
      "CCI may update these terms, change or discontinue any part of Insights, suspend or end your access, or remove material you upload, at any time.",
      "Changes take effect when published in Insights. If you continue to use Insights after a change, you accept the updated terms.",
    ],
  },
  {
    heading: "Acknowledging Insights",
    paragraphs: [
      "Acknowledge CCI and Insights as the source of any data or tools you use in a publication, presentation or patent application.",
      "Notify CCI within 30 days of any such publication, presentation or filing.",
    ],
  },
  {
    heading: "Intellectual property and feedback",
    paragraphs: [
      "Insights, its data, software and tools are owned by CCI or its licensors and are protected by intellectual property law.",
      "If you send CCI feedback, you confirm you are entitled to share it, and you give CCI a perpetual, royalty-free licence to use it.",
    ],
  },
  {
    heading: "Permitted use",
    paragraphs: [
      "Use Insights and its data for research and education only. Do not use them to diagnose, treat or make decisions about any patient or research participant, or for commercial purposes, unless CCI has agreed in writing.",
      "Insights has not been approved by the Therapeutic Goods Administration or any other regulator. You remain responsible for any decision you make.",
      "Obtain all ethics and institutional approvals (including HREC approval) that your use requires.",
    ],
  },
  {
    heading: "Patient privacy",
    paragraphs: [
      "All data in Insights is de-identified. Do not attempt to identify any individual. If you believe you have recognised someone, do not disclose it, and report it to CCI.",
    ],
  },
  {
    heading: "Security and access",
    paragraphs: [
      "Do not share your login, access tokens or encryption keys, and do not give anyone else access to Insights.",
      "Do not download, copy, reverse engineer or redistribute Insights data, software or tools except as permitted by an approved Data Access Agreement.",
      "Do not upload malicious code or take any action that affects the security, speed or integrity of Insights. Tell CCI promptly about any unauthorised access or transfer of data.",
    ],
  },
  {
    heading: "Restricted and unpublished data",
    paragraphs: [
      "Some datasets are unpublished or belong to controlled cohorts and require approval from the Data Access Committee (DAC). Use them only within the scope of your approval.",
    ],
  },
  {
    heading: "Data you upload",
    paragraphs: [
      "You are responsible for any data you upload. Upload only de-identified data that you have the right and consent to use. Never upload identifiable health or personal information.",
      "You give CCI and its service providers a licence to store, process and display your uploaded data only to operate Insights. CCI may remove uploaded data that breaches these terms.",
    ],
  },
  {
    heading: "Legal compliance",
    paragraphs: [
      "Comply with all laws that apply to your use of Insights, including privacy, human research and export control laws in Australia and your own country.",
    ],
  },
  {
    heading: "No warranties",
    paragraphs: [
      'Insights and its data are provided "as is". CCI does not guarantee that they are accurate, complete, secure, uninterrupted or free of errors, and you use them at your own risk. Nothing in Insights is medical advice.',
    ],
  },
  {
    heading: "Limitation of liability",
    paragraphs: [
      "To the extent permitted by law, CCI and its staff are not liable for any loss or damage arising from your use of, or inability to use, Insights or its data. Nothing in these terms excludes rights you have under the Australian Consumer Law.",
    ],
  },
  {
    heading: "Indemnity",
    paragraphs: ["You agree to indemnify CCI against claims, losses and costs arising from your use of Insights or your breach of these terms."],
  },
  {
    heading: "Governing law",
    paragraphs: [
      "These terms are governed by the laws of New South Wales, Australia, and you submit to the jurisdiction of its courts.",
      "If any part of these terms is unenforceable, the rest continues to apply.",
    ],
  },
  {
    heading: "Entire agreement",
    paragraphs: [
      "These terms, the Insights privacy policy and any Data Access Agreement you sign with CCI form the entire agreement between you and CCI about Insights.",
    ],
  },
];

export const WELCOME = {
  title: "Hi Alicia, welcome to Insights",
  body: "Take a short tour of the basics: where to find data, how to filter it and how to request access. It takes about two minutes.",
  progress: { value: 0.2, label: "Terms accepted · Tour next" },
};

/** Insights view tabs (Figma Insights-UI 15230:84687). "Participants and oncoprint" lives on Biosamples. */
export type InsightsView = "summary" | "biosamples" | "pdx" | "participants" | "molecular"; // "participants" = Study monitoring tab

/** The 14 steps of the Insights tour, with the view each one lives on. */
export function insightsTourSteps(go: (view: InsightsView) => void): TourStep[] {
  const on = (view: InsightsView) => () => go(view);
  return [
    { target: '[data-tour="nav"]', onEnter: on("summary"), icon: "views", illustration: <TourIllustration name="views" />, title: "Explore data in one place", body: "Insights is organised into four views: a summary of the cohort, participants, PDX models and molecular variant detail." },
    { target: '[data-tour="search"]', onEnter: on("summary"), icon: "search", illustration: <TourIllustration name="search" />, title: "Search across the portal", body: "Search for diagnoses, genes and variants from anywhere. Press ⌘K to open search from the keyboard." },
    { target: '[data-tour="kpi"]', onEnter: on("summary"), icon: "charts", illustration: <TourIllustration name="metrics" />, title: "Metrics and genomic charts", body: "These cards show live counts of participants and samples. Select a gene or variant in any chart to see its detailed distribution." },
    { target: '[data-tour="kpi"]', onEnter: on("summary"), icon: "locked", illustration: <TourIllustration name="published" />, title: "Published and unpublished data", body: "Each count is split into published and unpublished data. Select Unpublished on a card to see what it contains and how to request it." },
    { target: '[data-tour="charts"]', placement: "inside", onEnter: on("summary"), icon: "charts", illustration: <TourIllustration name="cohort" />, title: "Cohort charts", body: "These charts break the cohort down by cancer category, age, sex, study, event, sequencing and gene mutation. Select a gene or variant to see its detailed distribution." },
    { target: '[data-tour="participants"]', placement: "inside", onEnter: on("biosamples"), icon: "participants", illustration: <TourIllustration name="oncoprint" />, title: "Participants and oncoprint", body: "Browse participants in a configurable table and view their alterations in the oncoprint. Choose a cancer category to load it." },
    { target: '[data-tour="pdx"]', onEnter: on("pdx"), icon: "pdx", illustration: <TourIllustration name="pdx" />, title: "PDX models", body: "See which patient-derived xenograft models are available and how they are validated, then open the model list." },
    { target: '[data-tour="monitoring"]', onEnter: on("participants"), icon: "participants", illustration: <TourIllustration name="metrics" />, title: "Study monitoring", body: "Track unique enrolments, time to sequencing and participants per quarter, by study or by cancer category." },
    { target: '[data-tour="molecular"]', placement: "inside", onEnter: on("molecular"), icon: "molecular", illustration: <TourIllustration name="molecular" />, title: "Molecular variants explorer", body: "Review gene and impact overviews, the frequency heatmap, co-occurrence network and protein view for a selected gene." },
    { target: '[data-tour="filters"]', placement: "left", onEnter: on("summary"), icon: "filters", illustration: <TourIllustration name="filters" />, title: "Filter by research criteria", body: "Combine clinical criteria and molecular variants to narrow the cohort. Every view updates with your filters." },
    { target: '[data-tour="saved"]', placement: "right", onEnter: on("summary"), icon: "saved", illustration: <TourIllustration name="saved" />, title: "Saved queries", body: "Save a set of filters as a query to reuse it. Create a new query to start from all available data." },
    { target: '[data-tour="access"]', placement: "right", onEnter: on("summary"), icon: "access", illustration: <TourIllustration name="access" />, title: "Your dataset access", body: "This bar shows how much of the data your current access tier covers." },
    { target: '[data-tour="request"]', onEnter: on("summary"), icon: "locked", illustration: <TourIllustration name="request" />, title: "Request access to restricted data", body: "Some data is unpublished or belongs to a controlled cohort. Select Request data access to send an application to the Data Access Committee (DAC)." },
    { target: '[data-tour="help"]', placement: "right", onEnter: on("summary"), icon: "done", illustration: <TourIllustration name="ready" />, title: "You are ready to explore", body: "Replay this tour or find FAQs at any time from Help and support in the sidebar." },
  ];
}
