// Start a Sales Navigator export, wait for it, print a summary and a CSV link.
// Node 18+.  SCRAPIGATOR_API_KEY=sgk_... node export-and-wait.mjs "<sales navigator url>"
const API = 'https://scrapigator.com/api/v1';
const key = process.env.SCRAPIGATOR_API_KEY;
const url = process.argv[2];
if (!key || !url) throw new Error('Usage: SCRAPIGATOR_API_KEY=sgk_... node export-and-wait.mjs "<sales navigator url>"');

async function call(method, path, body, headers = {}) {
  for (;;) {
    const r = await fetch(API + path, { method, headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...headers }, body: body && JSON.stringify(body) });
    if (r.status === 429) { await new Promise(ok => setTimeout(ok, 1000 * Number(r.headers.get('retry-after') || 30))); continue; }
    const json = await r.json();
    if (!r.ok) throw new Error(`${json.error?.code}: ${json.error?.message} ${json.error?.hint ?? ''}`);
    return json;
  }
}

let exp = await call('POST', '/exports', { url, only_new: true }, { 'Idempotency-Key': `${url}#${new Date().toISOString().slice(0, 10)}` });
console.log('export', exp.id, exp.status);
let lastNote = '';
while (!['finished', 'partial', 'failed', 'cancelled'].includes(exp.status)) {
  const note = `${exp.status} ${exp.row_count} rows ${exp.next_step ?? ''}`;
  if (note !== lastNote) console.log(note), lastNote = note;
  await new Promise(ok => setTimeout(ok, 60_000));
  exp = await call('GET', `/exports/${exp.id}`);
}
if (exp.status === 'failed' || exp.status === 'cancelled') throw new Error(`${exp.status}: ${exp.next_step ?? exp.message}`);

const summary = await call('GET', `/exports/${exp.id}/summary`);
console.log(`${summary.matching_rows} rows. Top companies:`, summary.top.company?.slice(0, 5));
const { url: csv } = await call('POST', `/exports/${exp.id}/csv-link`, { template: 'essentials' });
console.log('CSV (15 min):', csv);
