// Cloudflare Worker receiving Scrapigator rows. Set the secret with:
//   wrangler secret put SCRAPIGATOR_WEBHOOK_SECRET
// Dedupe by eventId with KV (binding SEEN) so retries are ignored.
export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return new Response('POST only', { status: 405 });
    const raw = await request.text();
    const ts = request.headers.get('X-Scrapigator-Timestamp') || '';
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.SCRAPIGATOR_WEBHOOK_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${ts}.${raw}`)));
    const expected = 'sha256=' + [...mac].map(b => b.toString(16).padStart(2, '0')).join('');
    const given = request.headers.get('X-Scrapigator-Signature') || '';
    let diff = expected.length ^ given.length;
    for (let i = 0; i < Math.min(expected.length, given.length); i++) diff |= expected.charCodeAt(i) ^ given.charCodeAt(i);
    if (diff || Math.abs(Date.now() / 1000 - Number(ts)) > 300) return new Response('bad signature', { status: 401 });

    const event = JSON.parse(raw);
    if (await env.SEEN.get(event.eventId)) return new Response('ok');
    // ...store event.rows (D1, R2, forward to a CRM)...
    await env.SEEN.put(event.eventId, '1', { expirationTtl: 7 * 86400 });
    return new Response('ok');
  },
};
