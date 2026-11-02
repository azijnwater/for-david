"""Record inspected source-repository revisions without running their code."""
from datetime import datetime, timezone
import json
from pathlib import Path
import urllib.request

REPOSITORIES = [
    "ninjamuffin99/canabalt-hf",
    "conundrumer/lr-core",
    "jacob-grahn/platform-racing-2-client",
    "jacob-grahn/platform-racing-2-server",
    "jealouscloud/linerider-advanced",
]


def read(url):
    with urllib.request.urlopen(url, timeout=20) as response:
        return json.load(response)


if __name__ == "__main__":
    records = []
    for repo in REPOSITORIES:
        metadata = read(f"https://api.github.com/repos/{repo}")
        commit = read(f"https://api.github.com/repos/{repo}/commits/{metadata['default_branch']}")
        records.append({"repository": repo, "url": f"https://github.com/{repo}", "commit": commit["sha"], "licenseApi": (metadata.get("license") or {}).get("spdx_id"), "licenseReview": "Read code and asset terms separately. A null/NOASSERTION API value does not establish the absence of a license."})
    target = Path(__file__).resolve().parents[1] / "research/flash-classics/sources.json"
    target.write_text(json.dumps({"checkedAt": datetime.now(timezone.utc).isoformat(), "sources": records}, indent=2) + "\n", encoding="utf-8")
    print(f"Pinned {len(records)} source repositories.")
