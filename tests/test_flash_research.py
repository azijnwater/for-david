import importlib.util
import json
import lzma
from pathlib import Path
import struct
import unittest
import zlib
from hashlib import sha256

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("research_flash", ROOT / "scripts/research_flash.py")
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


class ReferenceInspectionTests(unittest.TestCase):
    def test_swf_compression_variants_have_matching_metadata(self):
        # RECT(0, 0, 0, 0), frame rate 24, one frame, End tag.
        body = b"\x08\x00" + struct.pack("<HHH", 24 * 256, 1, 0)
        header = bytes([10]) + struct.pack("<I", len(body) + 8)
        alone = lzma.compress(body, format=lzma.FORMAT_ALONE)
        samples = [b"FWS" + header + body, b"CWS" + header + zlib.compress(body), b"ZWS" + header + struct.pack("<I", len(alone) - 8) + alone[:5] + alone[13:]]
        for sample in samples:
            result = audit.swf_metadata(sample)
            self.assertEqual(result["frameRate"], 24)
            self.assertEqual(result["frameCount"], 1)
            self.assertEqual(result["actionScript"], "AS1/AS2")

    def test_invalid_and_oversized_swf_headers_are_rejected(self):
        with self.assertRaises(ValueError):
            audit.swf_metadata(b"<html>not a game</html>")
        with self.assertRaises(ValueError):
            audit.swf_metadata(b"FWS\x09" + struct.pack("<I", 200 * 1024 * 1024) + b"\x00" * 8)

    def test_available_reference_hashes_match_the_provenance_manifest(self):
        records = json.loads((ROOT / "research/flash-classics/files.json").read_text(encoding="utf-8"))["files"]
        checked = 0
        for record in records:
            if record["status"] != "downloaded-and-inspected":
                continue
            target = ROOT / record["localPath"]
            if not target.exists():
                continue  # Original binaries are deliberately not in git.
            data = target.read_bytes()
            self.assertEqual(len(data), record["bytes"])
            self.assertEqual(sha256(data).hexdigest(), record["sha256"])
            checked += 1
        if not checked:
            self.skipTest("Reference files are not present on this checkout.")


if __name__ == "__main__":
    unittest.main()
