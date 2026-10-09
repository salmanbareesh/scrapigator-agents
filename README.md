# Scrapigator for AI agents

Export LinkedIn Sales Navigator leads and accounts from **Claude, ChatGPT, Cursor, VS Code, n8n, Make, Zapier** or your own code.

- **Remote MCP server**: `https://scrapigator.com/mcp`
- **REST API**: `https://scrapigator.com/api/v1` ([OpenAPI](openapi/openapi.json), [docs](https://scrapigator.com/docs/api))
- **Claude Code plugin** with skills for common workflows (this repo)

Exports run in **your own Chrome extension**, with its normal pacing and daily limits. Agents only queue them; your LinkedIn login never leaves your browser. Included on every Scrapigator plan (Free keeps its 100 rows per month).

## What you can ask

- "Export this Sales Navigator search, only people I haven't exported before, and tell me when it's done."
- "Every Monday, re-run my 'fintech CTOs' search and send the new people to my Google Sheet."
- "Which companies in yesterday's export have three or more leads? What's the seniority split?"
- "Give me only the VPs in Germany from my last export as a CSV."
- "Which of these 300 LinkedIn profiles have I already exported?"
- "Send export X to my n8n webhook."

## Connect

1. Install the [Scrapigator extension](https://scrapigator.com) and connect your account.
2. Open **API & agents** at <https://scrapigator.com/agents>. Turn on **Allow agents to start exports** if agents should start exports, and create an API key for key-based clients.

| Client | How |
|---|---|
| Claude.ai, Claude Desktop, ChatGPT | Add a custom connector with `https://scrapigator.com/mcp`, then sign in and approve. No key needed. |
| Claude Code (plugin) | `claude plugin marketplace add salmanbareesh/scrapigator-agents` then `claude plugin install scrapigator@scrapigator`. It asks for your API key. |
| Claude Code (MCP only) | `claude mcp add --transport http scrapigator https://scrapigator.com/mcp --header "Authorization: Bearer sgk_YOUR_KEY"` |
| Cursor / VS Code | See [clients/mcp.json](clients/mcp.json) |
| n8n | MCP Client node with Bearer auth, or HTTP Request nodes ([examples/n8n](examples/n8n)) |
| Make, Zapier | MCP client with an `Authorization: Bearer` header, or plain HTTP requests |

## MCP tools

| Tool | What it does |
|---|---|
| `scrapigator_start_export` | Queue an export from a Sales Navigator search or saved list URL |
| `scrapigator_get_export` | Status, progress and what the user must do next |
| `scrapigator_list_exports` | Recent exports |
| `scrapigator_summarize_export` | Top companies, titles, seniority, locations and a sample |
| `scrapigator_get_leads` | Filtered page of rows (max 100) |
| `scrapigator_csv_link` | Signed 15-minute CSV link for whole or filtered lists |
| `scrapigator_check_exported` | Which profiles you already exported |
| `scrapigator_list_destinations` | Connected webhooks and Google Sheets |
| `scrapigator_send_export` / `scrapigator_delivery_status` | Send rows to a destination and check progress |
| `scrapigator_account` / `scrapigator_cancel_export` | Usage, extension status, cancelling |

Large lists never go into the agent's context: tools return summaries, small pages and CSV links.

## Export statuses

`needs_approval` (the user must allow agent exports once) → `waiting_for_browser` (Chrome closed) → `queued` → `planning` / `running` / `paused` (LinkedIn limit, resumes automatically) → `finished` / `partial` / `failed` / `cancelled`. Every response includes `next_step` when the user must do something.

## Examples

- [curl](examples/curl.md)
- [Node: start an export and wait](examples/node/export-and-wait.mjs)
- [Python: start an export and wait](examples/python/export_and_wait.py)
- Webhook receivers that verify signatures: [Node](examples/webhook-receivers/node-express.mjs), [Python](examples/webhook-receivers/python_fastapi.py), [Cloudflare Worker](examples/webhook-receivers/cloudflare-worker.js)
- [n8n: export then send to a sheet](examples/n8n/README.md)

## Limits

120 requests per minute and 20,000 per day per key (`429` with `Retry-After`). Agents can't raise the extension's pacing or daily caps. Scrapigator has no messaging, connection-request or profile-visit tools.

## License

MIT
