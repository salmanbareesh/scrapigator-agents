"""Start a Sales Navigator export, wait for it, print a summary and a CSV link.

Python 3.9+, standard library only.
    SCRAPIGATOR_API_KEY=sgk_... python export_and_wait.py "<sales navigator url>"
"""
import datetime
import json
import os
import sys
import time
import urllib.error
import urllib.request

API = "https://scrapigator.com/api/v1"
KEY = os.environ.get("SCRAPIGATOR_API_KEY")


def call(method, path, body=None, headers=None):
    while True:
        req = urllib.request.Request(API + path, method=method, data=json.dumps(body).encode() if body is not None else None,
                                     headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json", **(headers or {})})
        try:
            with urllib.request.urlopen(req) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(int(e.headers.get("Retry-After", "30")))
                continue
            err = json.load(e).get("error", {})
            raise SystemExit(f"{err.get('code')}: {err.get('message')} {err.get('hint') or ''}")


def main():
    if not KEY or len(sys.argv) < 2:
        raise SystemExit(__doc__)
    url = sys.argv[1]
    exp = call("POST", "/exports", {"url": url, "only_new": True}, {"Idempotency-Key": f"{url}#{datetime.date.today()}"})
    print("export", exp["id"], exp["status"])
    while exp["status"] not in ("finished", "partial", "failed", "cancelled"):
        print(exp["status"], exp["row_count"], "rows", exp.get("next_step") or "")
        time.sleep(60)
        exp = call("GET", f"/exports/{exp['id']}")
    if exp["status"] in ("failed", "cancelled"):
        raise SystemExit(f"{exp['status']}: {exp.get('next_step') or exp.get('message')}")
    summary = call("GET", f"/exports/{exp['id']}/summary")
    print(summary["matching_rows"], "rows. Top companies:", summary["top"].get("company", [])[:5])
    print("CSV (15 min):", call("POST", f"/exports/{exp['id']}/csv-link", {"template": "essentials"})["url"])


if __name__ == "__main__":
    main()
