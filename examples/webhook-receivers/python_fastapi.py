"""Receive Scrapigator export rows with FastAPI.

pip install fastapi uvicorn ; SCRAPIGATOR_WEBHOOK_SECRET=... uvicorn python_fastapi:app
"""
import hashlib
import hmac
import json
import os
import time

from fastapi import FastAPI, HTTPException, Request

SECRET = os.environ["SCRAPIGATOR_WEBHOOK_SECRET"].encode()
seen: set[str] = set()  # use a database table with a unique eventId in production
app = FastAPI()


@app.post("/scrapigator")
async def receive(request: Request):
    raw = await request.body()
    ts = request.headers.get("X-Scrapigator-Timestamp", "")
    expected = "sha256=" + hmac.new(SECRET, ts.encode() + b"." + raw, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, request.headers.get("X-Scrapigator-Signature", "")) or abs(time.time() - float(ts or 0)) > 300:
        raise HTTPException(401)
    event = json.loads(raw)
    if event["eventId"] in seen:
        return {"ok": True}  # retries reuse the same eventId
    seen.add(event["eventId"])
    # ...store event["rows"]...
    return {"ok": True}
