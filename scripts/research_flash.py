"""Fetch published reference files for offline inspection, never execution.

Original binaries stay in ignored .reference/. Only provenance is committed.
No redirects across failed authentication, TLS bypass, executable launch, or
automatic archive extraction is used. Run: python scripts/research_flash.py
"""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from hashlib import sha256
from io import BytesIO
import json
import lzma
from pathlib import Path, PurePosixPath
import struct
import urllib.error
import urllib.request
import urllib.parse
import zipfile
import zlib

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / ".reference" / "flash-classics"
REPORT = ROOT / "research" / "flash-classics"
MAX_FILE = 64 * 1024 * 1024
MAX_EXPANDED = 128 * 1024 * 1024

FILES = [
    ("hapland", "original-game", "https://foon.uk/swf/hapland.swf", "https://foon.uk/farcade/hapland/"),
    ("hapland-2", "additional-series-reference", "https://foon.uk/swf/hapland2.swf", "https://foon.uk/farcade/hapland2/"),
    ("hapland-3", "additional-series-reference", "https://foon.uk/swf/hapland3.swf", "https://foon.uk/farcade/hapland3/"),
    ("grow-rpg", "original-game", "https://www.eyezmaze.com/game/grow-rpg.swf", "https://www.eyezmaze.com/game/grow-rpg.html"),
    ("papas-pizzeria", "original-game", "https://i.flipline.com/gamefiles/papaspizzeria/papaspizzeria_v2.swf", "https://www.flipline.com/games/papaspizzeria/index.html"),
    ("bowman", "original-game", "https://farm.stickpage.com/bowmangame.swf", "https://www.stickpage.com/bowmangameplay.shtml"),
    ("stick-war", "original-game", "https://farm.stickpage.com/stickwar_08.swf", "https://www.stickpage.com/stickwargameplay.shtml"),
    ("desktop-td", "original-game-candidate", "https://chat.kongregate.com/game_files/0000/0492/desktop-tower-defense.swf", "https://www.kongregate.com/en/games/preecep/desktop-tower-defense"),
    ("n-tutorial-a", "creator-tutorial-source-not-full-game", "https://www.metanetsoftware.com/technique/diagrams/N_tutorialAsrc.zip", "https://www.metanetsoftware.com/2016/n-tutorial-a-collision-detection-and-response"),
    ("n-tutorial-b", "creator-tutorial-source-not-full-game", "https://www.metanetsoftware.com/technique/diagrams/N_tutorialBsrc.zip", "https://www.metanetsoftware.com/2016/n-tutorial-b-broad-phase-collision"),
]


def swf_metadata(data):
    signature = data[:3]
    if signature not in (b"FWS", b"CWS", b"ZWS") or len(data) < 12:
        raise ValueError("Not a valid SWF header")
    size = struct.unpack_from("<I", data, 4)[0]
    if size > MAX_EXPANDED:
        raise ValueError("Uncompressed SWF exceeds inspection limit")
    result = {"signature": signature.decode(), "swfVersion": data[3], "declaredUncompressedBytes": size}
    if signature == b"ZWS":
        if len(data) < 17:
            raise ValueError("Truncated LZMA SWF header")
        # Reconstruct an LZMA-alone header from SWF's property bytes and size.
        # SWF's LZMA stream carries an end marker. Use the unknown-size sentinel
        # for that decoder, then check the actual length against SWF's header.
        header = data[12:17] + b"\xff" * 8
        decoder = lzma.LZMADecompressor(format=lzma.FORMAT_ALONE, memlimit=256 * 1024 * 1024)
        body = decoder.decompress(header + data[17:], max_length=MAX_EXPANDED)
        if not decoder.eof:
            raise ValueError("Incomplete or oversized LZMA SWF")
    elif signature == b"CWS":
        decoder = zlib.decompressobj()
        body = decoder.decompress(data[8:], MAX_EXPANDED)
        if not decoder.eof or decoder.unused_data:
            raise ValueError("Incomplete or oversized compressed SWF")
    else:
        body = data[8:]
    if len(body) + 8 != size:
        raise ValueError("SWF uncompressed length does not match its header")
    bit = 0

    def bits(n, signed=False):
        nonlocal bit
        value = 0
        for _ in range(n):
            value = (value << 1) | ((body[bit // 8] >> (7 - bit % 8)) & 1)
            bit += 1
        return value - (1 << n) if signed and n and value & (1 << (n - 1)) else value

    n = bits(5)
    xmin, xmax, ymin, ymax = [bits(n, True) for _ in range(4)]
    cursor = (bit + 7) // 8
    rate, frames = struct.unpack_from("<HH", body, cursor)
    result.update({"width": (xmax - xmin) / 20, "height": (ymax - ymin) / 20, "frameRate": rate / 256, "frameCount": frames})
    cursor += 4
    as3 = False
    tags = 0
    while cursor + 2 <= len(body):
        tag = struct.unpack_from("<H", body, cursor)[0]
        cursor += 2
        kind, length = tag >> 6, tag & 63
        if length == 63:
            length = struct.unpack_from("<I", body, cursor)[0]
            cursor += 4
        if cursor + length > len(body):
            raise ValueError("Truncated SWF tag")
        if kind == 69 and length >= 4:
            as3 = bool(struct.unpack_from("<I", body, cursor)[0] & 8)
        if kind == 82:
            as3 = True
        tags += 1
        cursor += length
        if kind == 0:
            break
    result.update({"actionScript": "AS3" if as3 else "AS1/AS2", "topLevelTags": tags, "inspection": "Static metadata only; not executed or gameplay-tested"})
    return result


def download(item):
    game, purpose, url, page = item
    record = {"game": game, "purpose": purpose, "url": url, "discoveredOn": page}
    try:
        request = urllib.request.Request(url, headers={"User-Agent": "SucukReferenceAudit/1.0"})
        with urllib.request.urlopen(request, timeout=25) as response:
            data = response.read(MAX_FILE + 1)
            record["resolvedUrl"] = response.url
        if len(data) > MAX_FILE:
            raise ValueError("File exceeds reference download limit")
        extension = ".zip" if url.endswith(".zip") else ".swf"
        if extension == ".swf":
            record["metadata"] = swf_metadata(data)
        else:
            with zipfile.ZipFile(BytesIO(data)) as archive:
                names = archive.namelist()
                unsafe = [name for name in names if name.startswith(("/", "\\")) or ".." in PurePosixPath(name.replace("\\", "/")).parts or ":" in name]
                record["metadata"] = {"entries": len(names), "uncompressedBytes": sum(f.file_size for f in archive.infolist()), "sourceFiles": [name for name in names if name.lower().endswith((".fla", ".as", ".hx"))], "unsafePaths": unsafe, "inspection": "ZIP directory inspected; no files extracted or executed"}
        DEST.mkdir(parents=True, exist_ok=True)
        target = DEST / f"{game}{extension}"
        target.write_bytes(data)
        record.update({"status": "downloaded-and-inspected", "bytes": len(data), "sha256": sha256(data).hexdigest(), "localPath": target.relative_to(ROOT).as_posix(), "publicRedistribution": "Not authorized by this download; reference only"})
    except (OSError, ValueError, urllib.error.URLError, zipfile.BadZipFile, lzma.LZMAError, zlib.error, struct.error, IndexError) as error:
        record.update({"status": "unavailable-or-invalid", "error": str(error)})
    return record


def main():
    REPORT.mkdir(parents=True, exist_ok=True)
    files = list(FILES)
    pages = REPORT / "pages.json"
    if pages.exists():
        # Only add the actual game URLs exposed by the original publisher.
        for page in json.loads(pages.read_text(encoding="utf-8"))["pages"]:
            for url in page["candidateFiles"]:
                parsed = urllib.parse.urlsplit(url)
                if parsed.scheme == "https" and parsed.hostname == "cache.armorgames.com" and parsed.path.startswith("/files/games/") and parsed.path.endswith(".swf"):
                    files.append((page["game"], "publisher-hosted-flash-build", url, page["url"]))
    with ThreadPoolExecutor(max_workers=4) as pool:
        records = list(pool.map(download, files))
    report = {"checkedAt": datetime.now(timezone.utc).isoformat(), "scope": "Only explicitly discovered publisher/creator URLs; no executable files run or access restrictions bypassed.", "files": records}
    (REPORT / "files.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    for record in records:
        print(record["game"], record["status"], record.get("metadata", {}).get("actionScript", ""), record.get("error", ""))


if __name__ == "__main__":
    main()
