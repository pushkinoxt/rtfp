// src/pages/data/dumps/[view].csv.js
//
// One static CSV dump per public view, baked at build time and served from the
// CDN. The CSV mirrors the JSON dump for spreadsheet users.

import { DUMP_VIEWS, fetchAllRows, toCsv } from "../../../lib/dumps.js";

export function getStaticPaths() {
  return DUMP_VIEWS.map((view) => ({ params: { view } }));
}

export async function GET({ params }) {
  const rows = await fetchAllRows(params.view);
  return new Response(toCsv(rows), {
    headers: { "Content-Type": "text/csv; charset=utf-8" },
  });
}