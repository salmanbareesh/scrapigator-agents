# n8n

Two ways to use Scrapigator in n8n.

## 1. AI Agent + MCP Client Tool

In an **AI Agent** workflow, add the **MCP Client Tool**:
- Endpoint: `https://scrapigator.com/mcp`
- Server transport: HTTP Streamable
- Authentication: Bearer, with your `sgk_...` key

The agent can then start exports, summarize them and send them on.

## 2. Plain HTTP (no AI)

Weekly "only new leads" to a webhook or sheet:

1. **Schedule Trigger**: every Monday 08:00.
2. **HTTP Request**: `POST https://scrapigator.com/api/v1/exports`
   - Header `Authorization: Bearer sgk_...`
   - Header `Idempotency-Key`: `{{ $now.toFormat('kkkk-WW') }}`
   - JSON body: `{"url": "<your Sales Navigator URL>", "only_new": true, "destination_id": "<your destination id>", "list_name": "Weekly {{ $now.toFormat('WW') }}"}`

With `destination_id`, Scrapigator sends the rows to that webhook or Google Sheet when the export finishes. To receive them in n8n, add an n8n **Webhook** node URL as a destination (`POST /api/v1/destinations`) and verify `X-Scrapigator-Signature` in a Code node (see `../webhook-receivers`).

The export runs in the user's Chrome extension, so Chrome must be open at some point after the trigger. The status is `waiting_for_browser` until it is.
