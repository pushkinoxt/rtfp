// src/pages/data/dumps/[view].json.js
//
// One static JSON dump per public view, baked at build time and served from the
// CDN. Bulk data consumers use these instead of the live API.

import { DUMP_VIEWS, fetchAllRows } from "../../../lib/dumps.js";

export function getStaticPaths() {
  return DUMP_VIEWS.map((view) => ({ params: { view } }));
}

export async function GET({ params }) {
  const rows = await fetchAllRows(params.view);
  return new Response(JSON.stringify(rows), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}