// src/pages/data/dumps/index.json.js
//
// A manifest of the available data dumps, one entry per view with its JSON and
// CSV paths. Generated at build time so it always matches the current views.

import { DUMP_VIEWS } from "../../../lib/dumps.js";

export function GET() {
  const manifest = {
    generated_at: new Date().toISOString(),
    note: "Static snapshots of the RTFP public views, rebuilt on each deploy. Use these for bulk data. The live API is for light interactive queries.",
    dumps: DUMP_VIEWS.map((view) => ({
      view,
      json: `/data/dumps/${view}.json`,
      csv: `/data/dumps/${view}.csv`,
    })),
  };
  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}