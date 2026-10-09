---
name: weekly-new-leads
description: Re-run a saved Sales Navigator search with Scrapigator and deliver only the people not exported before, to a Google Sheet or webhook. Use when the user wants recurring, weekly or "only new" lead pulls.
---

# Weekly new leads

1. Ask for (or reuse) the Sales Navigator search URL and the destination. List destinations with `scrapigator_list_destinations`. If there is none, tell the user to connect Google Sheets on https://scrapigator.com/exports or add a webhook.
2. Start with `scrapigator_start_export` using:
   - `only_new: true` (previously exported people are skipped and do not count against quota)
   - `destination_id`: rows are sent automatically when the export finishes
   - `idempotency_key`: `<url>#<ISO week>` so the same week never runs twice
   - `list_name`: e.g. `"CTOs fintech – week 41"`
3. Follow the status handling from the `export-sales-navigator` skill until `finished`.
4. Report: new people found (`row_count`), people skipped as already exported (`skipped_already_exported`), and where they were sent (`scrapigator_delivery_status`).

To repeat this on a schedule, use the scheduling feature of your agent (for example a scheduled task or an n8n Schedule trigger calling `POST /api/v1/exports`). Scrapigator itself does not schedule runs.
