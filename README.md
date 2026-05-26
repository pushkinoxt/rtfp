# RTFP

A cross-platform comparison of the major platforms' transparency reports under the EU Digital Services Act.

The site is at **[rtfp.io](https://rtfp.io)**.

## What this is

Since the H2 2025 reporting cycle (published February 2026), regulated platforms are required to file their DSA transparency reports using a harmonised template defined by Commission Implementing Regulation 2024/2835. For the first time, the major providers can be compared directly.

RTFP loads the harmonised filings into a normalised database, surfaces the cross-platform comparisons that no single provider would report individually, and presents the findings.

## Architecture

- **Database**: Supabase (PostgreSQL with PostgREST exposing read-only views)
- **Site**: Astro, statically built and deployed to Vercel
- **Source data**: Provider CSV filings under Annex II of the Implementing Regulation

## Querying the data directly

The database is publicly queryable via a REST API. See the [API reference](https://yhbsqzktmsmctsxmpchy.supabase.co/rest/v1/) for endpoints, or browse the example URLs in the project documentation.

## Status

Work in progress. The database is live. The site is being built page by page through May - June 2026.

## Contact

Oscar - open an issue at https://github.com/pushkinoxt/rtfp/issues