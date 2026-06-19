// src/data/supplementary_documents.js
//
// Catalogue of documents a provider filed beyond the eleven harmonised CSV files.
// Each value is an array of { title, summary } for the providers that filed a
// genuine additional document. A provider not listed here shows no section.
//
// This does not cover the consolidated single-file copies of the eleven CSVs that
// several providers also filed (as a spreadsheet, or in Pinterest's case a PDF).
// Those repackage the same data and are not catalogued as separate documents.
//
// Summaries are descriptive, never evaluative. They say what a document is, not
// whether a provider's figures or practices are good. The documents themselves
// live on each provider's own transparency page, linked from Sources.

// Google reports its recipient figures in one document covering all of its
// services (Maps, Play, Search, Shopping and YouTube), so each Google service
// page points to the same document.
const GOOGLE_AMAR = {
  title: "Monthly active recipients (PDF)",
  summary:
    "A single document covering all of Google's services, giving the recipient figures on two bases, distinct signed-in accounts and distinguishable sessions of signed-out recipients, broken down by country. Google states the counts are not de-duplicated and are not comparable with other providers'.",
};

export const SUPPLEMENTARY_DOCUMENTS = {
  aliexpress: [
    {
      title: "Transparency report (PDF)",
      summary:
        "A narrative report describing its content-moderation processes, its use of automation, and its moderation teams. It reproduces the per-country recipient figures from the CSV files and records that, counting only logged-in users, its EU total would fall below 45 million.",
    },
  ],
  tiktok: [
    {
      title: "Transparency report (PDF)",
      summary:
        "A document accompanying the CSV files that sets out the methodological choices behind its figures, with contextual notes and a summary. It describes how it mapped its moderation labels onto the template's categories and how it now spreads policy violations across those categories so they sum to the reported total.",
    },
  ],
  youtube: [GOOGLE_AMAR],
  "google-shopping": [GOOGLE_AMAR],
  "google-play": [GOOGLE_AMAR],
  "google-maps": [GOOGLE_AMAR],
};