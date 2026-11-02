"""Bounded public-page/reference scan. Does not download candidate binaries."""
import concurrent.futures
from datetime import datetime, timezone
import hashlib
import html
import json
from pathlib import Path
import re
import urllib.request
import urllib.parse

ROOT = Path(__file__).resolve().parents[1]
CATALOGUE = ROOT / "research/flash-classics/catalog.json"


def scan(game):
    url = game["page"]
    record = {"game": game["id"], "url": url}
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "SucukReferenceAudit/1.0"}), timeout=15) as response:
            data = response.read(2 * 1024 * 1024 + 1)
            if len(data) > 2 * 1024 * 1024:
                raise ValueError("Page exceeds scan limit")
            record.update({"status": response.status, "resolvedUrl": response.url, "pageSha256": hashlib.sha256(data).hexdigest()})
        content = html.unescape(data.decode("utf-8", errors="replace")).replace("\\/", "/")
        title = re.search(r"<title[^>]*>(.*?)</title>", content, re.I | re.S)
        record["pageTitle"] = re.sub(r"\s+", " ", title.group(1)).strip() if title else None
        candidates = re.findall(r'''(?:https?://|/|\.\.?/)?[^\s"'<>\\{}]*\.(?:swf|fla|zip)(?=$|[\s"'<>?])(?:\?[^\s"'<>\\{}]*)?''', content, re.I)
        resolved = []
        for item in candidates:
            if item.startswith("supernova://"):
                item = urllib.parse.parse_qs(urllib.parse.urlsplit(item).query).get("swfurl", [""])[0]
            if not item or re.search(r"expressinstall|header|banner|box_nav|char_|getflashplayer", item, re.I):
                continue
            absolute = urllib.parse.urljoin(url, item)
            if urllib.parse.urlsplit(absolute).path.rsplit("/", 1)[-1] in (".swf", ".fla", ".zip"):
                continue
            resolved.append(absolute)
        record["candidateFiles"] = sorted(set(resolved))[:30]
        record["interpretation"] = "Candidate URLs only; identity, content, dependencies and permissions need separate verification. A page can serve a later HTML5 version."
    except Exception as error:
        record.update({"status": "unavailable", "error": str(error), "candidateFiles": []})
    return record


if __name__ == "__main__":
    games = json.loads(CATALOGUE.read_text(encoding="utf-8"))["games"]
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        records = list(pool.map(scan, games))
    target = ROOT / "research/flash-classics/pages.json"
    target.write_text(json.dumps({"checkedAt": datetime.now(timezone.utc).isoformat(), "pages": records}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    for record in records:
        print(record["game"], record["status"], len(record["candidateFiles"]), "candidates")
