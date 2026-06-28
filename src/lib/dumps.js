// src/lib/dumps.js
//
// Build-time support for the static data dumps under src/pages/data/dumps/.
//
// Emits one downloadable file per public view so the "give me the data" path is
// a static file on the CDN rather than a live database query. The live API stays
// for light interactive use, and bulk consumers take the dumps instead. Runs at
// build time only, alongside the rest of the static build.

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    "Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_PUBLISHABLE_KEY. " +
    "Check the .env file locally, and check Environment Variables in Vercel for deploys."
  );
}

// The public views, in the same order they appear on the API documentation page.
// Keep this list in step with src/pages/api.astro.
export const DUMP_VIEWS = [
  "country_codes",
  "language_codes",
  "amar_by_country",
  "provider_overview",
  "government_orders_by_country",
  "government_orders_by_category",
  "government_orders_summary",
  "notices_by_category",
  "trusted_flagger_intensity",
  "notice_response_times",
  "moderation_volume_comparison",
  "automation_share_by_provider",
  "automated_means_accuracy",
  "restriction_type_breakdown",
  "account_actions_summary",
  "ad_services",
  "ad_service_appeals",
  "ad_service_automation",
  "internal_complaints_summary",
  "out_of_court_disputes",
  "misuse_suspensions",
  "human_moderators_by_language",
  "actions_per_user",
  "amar_per_moderator",
  "headline_metrics_normalised",
  "filings_overview",
  "anomalies_by_filing",
  "disclosure_coverage",
  "platform_notes",
  "provider_caveats",
];

const PAGE_SIZE = 1000;

// Fetch every row of a view, paging past any server-side row cap so a dump is
// always complete even when the live API limits a single response.
export async function fetchAllRows(view) {
  const rows = [];
  let offset = 0;

  for (;;) {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${view}`);
    url.searchParams.set("limit", String(PAGE_SIZE));
    url.searchParams.set("offset", String(offset));

    const response = await fetch(url.toString(), {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Dump fetch failed for "${view}" (${response.status}): ${body}`);
    }

    const page = await response.json();
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return rows;
}

// Serialise rows to CSV. Columns are the union of keys across rows in first-seen
// order. Any value holding a comma, quote or newline is quoted, and embedded
// quotes are doubled, per RFC 4180. Nulls become empty cells.
export function toCsv(rows) {
  if (!rows.length) return "";

  const columns = [];
  const seen = new Set();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key);
        columns.push(key);
      }
    }
  }

  const cell = (value) => {
    if (value === null || value === undefined) return "";
    const text = typeof value === "object" ? JSON.stringify(value) : String(value);
    if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
    return text;
  };

  const lines = [columns.join(",")];
  for (const row of rows) {
    lines.push(columns.map((c) => cell(row[c])).join(","));
  }
  return lines.join("\r\n");
}