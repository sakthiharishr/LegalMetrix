"""Score OCR + field extraction against the hand-checked answers in test_images/truth.json.

Usage (from the Backend folder):
    python scripts/ocr_benchmark.py            # all products
    python scripts/ocr_benchmark.py colin p4   # only these folders
    python scripts/ocr_benchmark.py --fresh    # ignore the OCR cache

OCR output is cached per image in test_images/.cache and is re-used until the
image or ocr_service.py changes, so extraction changes can be re-scored quickly.
"""
import difflib
import hashlib
import json
import re
import sys
import time
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND))

from app.services import ocr_service  # noqa: E402
from app.services.extraction_service import extract_fields  # noqa: E402
from app.services.rule_engine import analyze_packaging_compliance  # noqa: E402

IMAGES = BACKEND.parent / "test_images"
CACHE = IMAGES / ".cache"
FIELDS = [
    "product_name", "brand", "mrp", "unit_sale_price", "net_quantity", "batch_lot",
    "manufacturing_date", "use_by_date", "manufacturer", "consumer_phone",
    "consumer_email", "country_of_origin",
]
# Compliance check -> the fields that decide whether it can pass.
CHECK_FIELDS = {
    "Manufacturer / Packer / Importer": ["manufacturer"],
    "Commodity Name": ["product_name"],
    "Net Quantity": ["net_quantity"],
    "Manufacture / Packing Date": ["manufacturing_date"],
    "Maximum Retail Price (MRP)": ["mrp"],
    "Consumer Care Details": ["consumer_phone", "consumer_email"],
}


def _letters(value):
    return re.sub(r"[^A-Z0-9]", "", str(value).upper())


def _partial_ratio(short, long):
    if not short or not long:
        return 0.0
    if len(short) > len(long):
        short, long = long, short
    best = 0.0
    for start in range(0, len(long) - len(short) + 1):
        best = max(best, difflib.SequenceMatcher(None, short, long[start:start + len(short)]).ratio())
    return best


def _norm_qty(value):
    v = str(value).upper().replace(" ", "")
    v = re.sub(r"(NUMBERS?|NOS?\.?|PCS?\.?|PIECES?|UNITS?)$", "N", v)
    return v.replace("GM", "G").replace("GMS", "G")


def _norm_date(value):
    parts = re.findall(r"\d+", str(value))
    if not parts:
        return ""
    parts = [p.zfill(2) if len(p) < 3 else p[-2:] for p in parts]
    return "/".join(parts)


def _digits(value):
    return re.sub(r"\D", "", str(value))[-10:]


def matches(field, got, want):
    got = str(got or "").strip()
    if want == "":
        return got == ""
    if not got:
        return False
    if field in {"mrp"}:
        try:
            return abs(float(got.replace(",", "")) - float(want)) < 0.001
        except ValueError:
            return False
    if field == "unit_sale_price":
        return _letters(got).replace("RS", "") == _letters(want)
    if field == "net_quantity":
        return _norm_qty(got) == _norm_qty(want)
    if field in {"manufacturing_date", "use_by_date"}:
        return _norm_date(got) == _norm_date(want)
    if field == "consumer_phone":
        return _digits(got) == _digits(want)
    if field == "batch_lot":
        return _letters(got) == _letters(want)
    if field == "consumer_email":
        return difflib.SequenceMatcher(None, got.upper(), want.upper()).ratio() >= 0.9
    if field == "manufacturer":
        # The value may include the address; the company name must be in it (allowing OCR slips).
        return _partial_ratio(_letters(want), _letters(got)) >= 0.85
    if field == "country_of_origin":
        return _letters(got) == _letters(want)
    # product_name / brand: whole value must match, allowing small OCR slips.
    return difflib.SequenceMatcher(None, _letters(got), _letters(want)).ratio() >= 0.88


def field_ok(field, got, want):
    options = want if isinstance(want, list) else [want]
    return any(matches(field, got, w) for w in options)


def _file_hash(path):
    return hashlib.md5(Path(path).read_bytes()).hexdigest()[:12]


def ocr_cached(image, fresh=False):
    key = f"{image.parent.name}_{image.stem}_{_file_hash(image)}_{_file_hash(ocr_service.__file__)}.json"
    cached = CACHE / key
    if cached.exists() and not fresh:
        return json.loads(cached.read_text(encoding="utf-8")), 0.0
    t0 = time.time()
    result = ocr_service.run_ocr(str(image))
    elapsed = time.time() - t0
    CACHE.mkdir(exist_ok=True)
    cached.write_text(json.dumps(result, ensure_ascii=False), encoding="utf-8")
    return result, elapsed


def analyse(folder, fresh=False):
    """Same merge the API does in analysis_service.analyze_scan."""
    outputs, items, ocr_time = [], [], 0.0
    for image in sorted(p for p in folder.iterdir() if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}):
        result, elapsed = ocr_cached(image, fresh)
        ocr_time += elapsed
        for item in result["items"]:
            item["image_id"] = image.name
        outputs.append(result)
        items += result["items"]
    raw = "\n".join(o["text"] for o in outputs if o.get("text"))
    conf = sum(o["confidence"] for o in outputs) / max(1, len(outputs))
    t0 = time.time()
    fields = extract_fields(raw, ocr_items=items, ocr_confidence=conf)
    evaluation = analyze_packaging_compliance(raw, metadata=dict(fields))
    return fields, evaluation, ocr_time, time.time() - t0


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    fresh = "--fresh" in sys.argv
    truth = {k: v for k, v in json.loads((IMAGES / "truth.json").read_text(encoding="utf-8")).items() if not k.startswith("_")}
    products = args or list(truth)

    totals = {"right": 0, "wrong": 0, "missing": 0, "extra": 0, "verdict_ok": 0, "verdict_total": 0}
    per_field = {f: 0 for f in FIELDS}
    for name in products:
        expect = truth[name]
        fields, evaluation, ocr_time, ext_time = analyse(IMAGES / name, fresh)
        print(f"\n=== {name}  (OCR {ocr_time:.1f}s{' cached' if ocr_time == 0 else ''}, extraction {ext_time:.2f}s) ===")
        for field in FIELDS:
            want, got = expect.get(field), fields.get(field, "")
            if want is None:
                continue
            ok = field_ok(field, got, want)
            if ok:
                kind = "right"
            elif not got:
                kind = "missing"
            elif want == "":
                kind = "extra"
            else:
                kind = "wrong"
            totals[kind] += 1
            per_field[field] += ok
            label = {"right": "PASS", "wrong": "WRONG", "missing": "MISSING", "extra": "EXTRA"}[kind]
            print(f"  [{label:7s}] {field:19s} got={got!r}" + ("" if ok else f"   expected={want!r}"))

        for check in evaluation["complianceChecks"]:
            needed = CHECK_FIELDS.get(check["name"])
            if not needed:
                continue
            printed = any(expect.get(f) not in ("", None) for f in needed)
            should = "COMPLIANT" if printed else "NEEDS_REVIEW"
            if check["name"] == "Maximum Retail Price (MRP)" and printed:
                should = "COMPLIANT"
            ok = check["status"] == should
            totals["verdict_total"] += 1
            totals["verdict_ok"] += ok
            if not ok:
                print(f"  [VERDICT] {check['name']}: app said {check['status']}, should be {should}")

    scored = totals["right"] + totals["wrong"] + totals["missing"] + totals["extra"]
    print("\n=== SUMMARY ===")
    print(f"Fields correct : {totals['right']}/{scored} ({100 * totals['right'] / max(1, scored):.0f}%)")
    print(f"  wrong value  : {totals['wrong']}")
    print(f"  missing      : {totals['missing']}")
    print(f"  not on pack but filled in: {totals['extra']}")
    print(f"Verdicts right : {totals['verdict_ok']}/{totals['verdict_total']}")
    print("Per field      : " + ", ".join(f"{f}={per_field[f]}/{len(products)}" for f in FIELDS))


if __name__ == "__main__":
    main()
