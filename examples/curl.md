# curl

```sh
export SG=sgk_YOUR_KEY   # https://scrapigator.com/agents
API=https://scrapigator.com/api/v1

# Account, usage, extension online?
curl -s $API/account -H "Authorization: Bearer $SG"

# Start an export (returns 202 + export; poll it)
curl -s -X POST $API/exports -H "Authorization: Bearer $SG" -H "Content-Type: application/json" \
  -H "Idempotency-Key: ctos-2026-w41" \
  -d '{"url":"https://www.linkedin.com/sales/search/people?query=...","only_new":true,"list_name":"CTOs"}'

# Status
curl -s $API/exports/EXPORT_ID -H "Authorization: Bearer $SG"

# Summary and filtered rows
curl -s "$API/exports/EXPORT_ID/summary" -H "Authorization: Bearer $SG"
curl -s "$API/exports/EXPORT_ID/rows?title=VP&location=Germany&template=essentials&limit=100" -H "Authorization: Bearer $SG"

# CSV link (15 minutes, no header needed to download)
curl -s -X POST $API/exports/EXPORT_ID/csv-link -H "Authorization: Bearer $SG" -H "Content-Type: application/json" -d '{"template":"crm"}'

# Already exported?
curl -s -X POST $API/identities/check -H "Authorization: Bearer $SG" -H "Content-Type: application/json" \
  -d '{"items":["https://www.linkedin.com/in/someone"]}'

# Webhook destination + send
curl -s -X POST $API/destinations -H "Authorization: Bearer $SG" -H "Content-Type: application/json" -d '{"name":"n8n","url":"https://your-n8n/webhook/abc"}'
curl -s -X POST $API/exports/EXPORT_ID/deliveries -H "Authorization: Bearer $SG" -H "Content-Type: application/json" -d '{"destination_id":"DEST_ID","template":"essentials"}'
```
