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

// Build-time fetching is bursty. An eighty-page build plus the data dumps makes
// a lot of requests in a short window, and the free tier will occasionally drop
// a connection or refuse one. A dropped handshake surfaces as a thrown "fetch
// failed" rather than a clean HTTP status, so both cases are retried here with
// a widening pause. Real errors, for example a bad view name, are not retried.

// Pages fetch many views at once, so a parallel build can try to open dozens of
// connections in the same instant. Some networks and machines refuse them at
// that rate, which shows up as a dropped handshake rather than a clean refusal.
// This gate lets a fixed number of requests be in flight at a time and queues
// the rest. The build stays fast because the queue drains continuously.

const MAX_IN_FLIGHT = 4;
let inFlight = 0;
const waiting = [];

function acquire() {
  if (inFlight < MAX_IN_FLIGHT) {
    inFlight++;
    return Promise.resolve();
  }
  return new Promise((resolve) => waiting.push(resolve));
}

function release() {
  const next = waiting.shift();
  if (next) {
    next();
    return;
  }
  inFlight--;
}

const MAX_ATTEMPTS = 4;
const BACKOFF_MS = [500, 1500, 4000];

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchWithRetry(url, label) {
  await acquire();
  try {
    return await attemptFetch(url, label);
  } finally {
    release();
  }
}

async function attemptFetch(url, label) {
  let lastError;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) await pause(BACKOFF_MS[attempt - 1]);

    let response;
    try {
      response = await fetch(url, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      });
    } catch (networkError) {
      // Connection refused, reset, or a dropped TLS handshake. Worth retrying.
      lastError = networkError;
      continue;
    }

    if (response.ok) return response;

    // Too many requests, or the server having a moment. Worth retrying.
    if (response.status === 429 || response.status >= 500) {
      lastError = new Error(`Supabase API error ${response.status} on ${label}`);
      continue;
    }

    // Anything else is a real error and will not improve by asking again.
    const errorBody = await response.text();
    throw new Error(`Supabase API error ${response.status} on ${label}: ${errorBody}`);
  }

  throw new Error(
    `Supabase request for ${label} failed after ${MAX_ATTEMPTS} attempts. ` +
    `Last error: ${lastError && lastError.message}`
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

  const response = await fetchWithRetry(url.toString(), `view "${viewName}"`);
  return response.json();
}