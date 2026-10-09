// Receive Scrapigator export rows. Verifies the signature on the RAW body and drops duplicates.
// npm i express ;  SCRAPIGATOR_WEBHOOK_SECRET=... node node-express.mjs
import express from 'express';
import { createHmac, timingSafeEqual } from 'node:crypto';

const secret = process.env.SCRAPIGATOR_WEBHOOK_SECRET;
const seen = new Set(); // use a database table with a unique eventId in production
const app = express();

app.post('/scrapigator', express.raw({ type: 'application/json', limit: '5mb' }), (req, res) => {
  const ts = req.header('X-Scrapigator-Timestamp') ?? '';
  const sig = req.header('X-Scrapigator-Signature') ?? '';
  const expected = 'sha256=' + createHmac('sha256', secret).update(ts + '.' + req.body).digest('hex');
  const valid = sig.length === expected.length && timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  if (!valid || Math.abs(Date.now() / 1000 - Number(ts)) > 300) return res.sendStatus(401);

  const event = JSON.parse(req.body.toString('utf8'));
  if (seen.has(event.eventId)) return res.sendStatus(200); // retries reuse the same eventId
  seen.add(event.eventId);
  console.log(`${event.listName}: rows ${event.offset + 1}-${event.offset + event.rows.length} of ${event.total}${event.complete ? ' (complete)' : ''}`);
  // ...store event.rows...
  res.sendStatus(200); // only after the rows are stored
});

app.listen(3000);
