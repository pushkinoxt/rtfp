// src/lib/supabase.js
//
// One small helper for fetching from the RTFP public Supabase API.
// Used by every page that displays data.
//
// All calls go through fetchFromSupabase(), which:
//   - Reads credentials from environment variables (PUBLIC_SUPABASE_URL and
//     PUBLIC_SUPABASE_PUBLISHABLE_KEY)
//   - Handles auth headers
//   - Throws meaningful errors if the API returns a non-2xx response
//   - Returns parsed JSON on success
//
// Pages run this at *build time* (not in the browser at run time), so the
// resulting HTML is pre-rendered with the data baked in. Page loads in the
// wild stay sub-100ms regardless of how many views we query.

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    "Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_PUBLISHABLE_KEY. " +
    "Check the .env file locally, and check Environment Variables in Vercel for deploys."
  );
}

/**
 * Fetches rows from a Supabase view via PostgREST.
 *
 * @param {string} viewName - The view to query, e.g. "provider_overview"
 * @param {Object} options - Query options
 * @param {string} [options.select] - Comma-separated columns to return
 * @param {Object} [options.filters] - Filters as { column: "operator.value" }
 * @param {string} [options.order] - e.g. "amar_eu_total.desc.nullslast"
 * @param {number} [options.limit] - Max rows to return
 * @returns {Promise<Array>} - Array of row objects
 */
export async function fetchFromSupabase(viewName, options = {}) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${viewName}`);

  if (options.select) url.searchParams.set("select", options.select);
  if (options.order)  url.searchParams.set("order",  options.order);
  if (options.limit)  url.searchParams.set("limit",  String(options.limit));
  if (options.filters) {
    for (const [column, condition] of Object.entries(options.filters)) {
      url.searchParams.set(column, condition);
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Supabase API error ${response.status} on view "${viewName}": ${errorBody}`
    );
  }

  return response.json();
}