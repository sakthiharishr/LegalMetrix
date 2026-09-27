"""Legal Metrology field extraction from OCR lines.

The extractor holds no lists of brands or products. Every field is found with rules that apply to
any pack:

1. Lines   - OCR items become lines that remember their photo, position and letter height.
2. Labels  - declaration labels (MRP, Net Qty, Mfg date, Batch, Mfd. by, Customer care, ...) are
             matched with OCR-tolerant patterns. A label's value is read from the same line first,
             then from the text to its right, then below it, on the same photo.
3. Shapes  - a value is only accepted when it looks like its field: a price, a real date, a
             quantity with a unit, a code. Stamped print without its own label is assigned by
             shape: the earlier date is manufacture, the later one expiry, a currency amount is the
             MRP, an amount per unit is the unit sale price.
4. Names   - the brand is the most prominent (largest, most repeated) wording on the pack; the
             product name is the brand plus the descriptor printed right under it.
"""
import math
import re
from dataclasses import dataclass, field
from difflib import SequenceMatcher
from typing import Any, Dict, Iterable, List, Optional, Tuple

from .ocr_service import _text_angle

# ---------------------------------------------------------------------------
# Lines
# ---------------------------------------------------------------------------


@dataclass
class Line:
    text: str
    conf: float = 90.0
    image: str = ""
    x1: float = 0.0
    y1: float = 0.0
    x2: float = 0.0
    y2: float = 0.0
    order: int = 0
    item: Dict[str, Any] = field(default_factory=dict)

    @property
    def upper(self) -> str:
        return self.text.upper()

    @property
    def h(self) -> float:
        """Letter height: the short side of the text box (also right for sideways text)."""
        return max(1.0, min(self.x2 - self.x1, self.y2 - self.y1))

    @property
    def has_box(self) -> bool:
        return self.x2 > self.x1 and self.y2 > self.y1

    @property
    def cx(self) -> float:
        return (self.x1 + self.x2) / 2

    @property
    def cy(self) -> float:
        return (self.y1 + self.y2) / 2


def _clean(text: str) -> str:
    text = str(text or "")
    for old, new in {"â‚¹": "₹", "â€“": "-", "â€”": "-", "â€™": "'", "�": " ", "–": "-", "—": "-"}.items():
        text = text.replace(old, new)
    return re.sub(r"\s+", " ", text).strip()


def _build_lines(text: str, ocr_items: Optional[Iterable[Dict[str, Any]]]) -> List[Line]:
    items = [item for item in (ocr_items or []) if _clean(item.get("text", ""))]
    # Work in each photo's reading frame, so "right of" and "below" also hold for sideways photos.
    angles: Dict[str, float] = {}
    for image in {str(item.get("image_id", "")) for item in items}:
        angle = _text_angle([item for item in items if str(item.get("image_id", "")) == image])
        angles[image] = angle if abs(math.degrees(angle)) > 20 else 0.0

    lines: List[Line] = []
    for index, item in enumerate(items):
        image = str(item.get("image_id", ""))
        cos_a, sin_a = math.cos(-angles[image]), math.sin(-angles[image])
        points = [(float(p[0]) * cos_a - float(p[1]) * sin_a, float(p[0]) * sin_a + float(p[1]) * cos_a)
                  for p in item.get("box") or []]
        xs = [p[0] for p in points] or [0.0]
        ys = [p[1] for p in points] or [0.0]
        conf = float(item.get("confidence", 90) or 0)
        lines.append(Line(_clean(item["text"]), conf if conf > 1 else conf * 100, image,
                          min(xs), min(ys), max(xs), max(ys), index, item))
    if not lines:
        lines = [Line(_clean(t), order=i) for i, t in enumerate(str(text or "").splitlines()) if _clean(t)]
    return lines


def _same_image(a: Line, b: Line) -> bool:
    return a.image == b.image


def _neighbours(label: Line, lines: List[Line], rows: float = 3.0) -> List[Line]:
    """Lines that can hold a label's value: to its right on the same row, then just below it,
    then the next lines in reading order. All on the same photo."""
    right, below = [], []
    if label.has_box:
        h = label.h
        for other in lines:
            if other is label or not _same_image(other, label) or not other.has_box:
                continue
            overlap_y = min(label.y2, other.y2) - max(label.y1, other.y1)
            gap_x = other.x1 - label.x2
            if overlap_y >= 0.45 * min(label.h, other.h) and -0.5 * h <= gap_x <= 14 * h:
                right.append((gap_x, other))
                continue
            dy = other.y1 - label.y1
            if 0.5 * h <= dy <= rows * 1.8 * h and other.x1 < label.x2 + 5 * h and other.x2 > label.x1 - 3 * h:
                below.append((dy + 0.3 * abs(other.x1 - label.x1), other))
    ordered = [l for _, l in sorted(right, key=lambda t: t[0])] + [l for _, l in sorted(below, key=lambda t: t[0])]
    following = [l for l in lines if _same_image(l, label) and 0 < l.order - label.order <= 3]
    return ordered + [l for l in following if l not in ordered]


def _after(match: "re.Match[str]", text: str) -> str:
    return text[match.end():].strip(" :.-;,")


# ---------------------------------------------------------------------------
# Value shapes
# ---------------------------------------------------------------------------

UNIT_WORDS = {
    "ML": "ml", "L": "l", "LTR": "l", "LITRE": "l", "LITRES": "l", "LITER": "l", "G": "g", "GM": "g", "GMS": "g",
    "GRAM": "g", "GRAMS": "g", "KG": "kg", "MG": "mg", "N": "N", "NO": "N", "NOS": "N", "NUMBER": "N", "NUMBERS": "N",
    "PC": "N", "PCS": "N", "PIECE": "N", "PIECES": "N", "U": "N", "UNIT": "N", "UNITS": "N",
}
QTY_RE = re.compile(r"(?<![\d.])(\d{1,5}(?:\.\d{1,3})?)\s*(ML|LTR|LITRES?|LITER|L|KG|MG|GMS|GM|GRAMS?|G|NUMBERS?|NOS?|N|PCS?|PIECES?|UNITS?|U)(?![A-Z])", re.I)
MEASURE_UNITS = {"ml", "l", "g", "kg", "mg"}
NUTRITION_RE = re.compile(r"SERV|\bPER\b|%|KCAL|\bKJ\b|ENERGY|PROTEIN|CARBO|SUGAR|\bFAT\b|SODIUM|CHOLESTEROL|RDA|\(\s*M?G\s*\)", re.I)
TIME_RE = re.compile(r"(?<!\d)\d{1,2}:\d{2}(?::\d{2})?(?!\d)")
USP_UNIT = r"(100\s*(?:ML|G)|ML|GMS?|G|KG|LTR|L)"
USP_RE = re.compile(r"(?:₹|RS\.?|[RTFZ?])?\s*(\d{1,4}[.,]\d{1,3})\s*(?:/|PER\b)\s*" + USP_UNIT + r"(?![A-Z])"
                    r"|(?:₹|RS\.?|[RTFZ?])?\s*(\d{1,4}[.,]\d{2})1\s*" + USP_UNIT + r"(?![A-Z])", re.I)


def _unit_price_values(text: str) -> List[str]:
    """ "(₹0.29/g)", "₹0.32 per ml" and dot-matrix "0.521g" (the slash printed thin, read as 1)."""
    values = []
    for m in USP_RE.finditer(text):
        amount = (m.group(1) or m.group(3)).replace(",", ".")
        unit = re.sub(r"\s+", "", (m.group(2) or m.group(4))).lower().replace("gms", "g").replace("gm", "g").replace("ltr", "l")
        values.append(f"{amount}/{unit}")
    return values


def _strip_non_prices(text: str) -> str:
    text = USP_RE.sub(" ", text)
    text = re.sub(r"(?:U?SP|UNIT\s*SALE\s*PRICE)\s*[:.]?\s*\S+", " ", text, flags=re.I)
    text = TIME_RE.sub(" ", text)
    for value, start, end in _date_spans(text):
        text = text[:start] + " " * (end - start) + text[end:]
    text = QTY_RE.sub(" ", text)
    return re.sub(r"\d+(?:\.\d+)?\s*%", " ", text)


def _prices(text: str, whole_only: bool = False) -> List[Tuple[str, int]]:
    """Amounts that can be an MRP, strongest first: with a currency sign, with paise, or '52/-'."""
    cleaned = _strip_non_prices(text)
    found: List[Tuple[str, int]] = []
    patterns = (
        (r"(?:₹|RS\.?|INR|(?<![A-Z])[RTFZ](?=\d))\s*(\d{1,6}(?:[.,]\d{1,2})?)(?![\d])", 3),
        (r"(?<![A-Z\d.,])((?:[1-9]\d{0,5}|0)[.,]\d{2})(?![\d])", 2),
        (r"(?<![\d.,])(\d{1,5})\s*(?:/|1)-", 2),     # 52/- (the slash is often read as 1)
    )
    for pattern, strength in patterns:
        for m in re.finditer(pattern, cleaned, re.I):
            amount = m.group(1).replace(",", ".")
            try:
                if 0 < float(amount) <= 100000:
                    found.append((f"{float(amount):.2f}", strength))
            except ValueError:
                pass
    if not found:
        m = re.fullmatch(r"\s*(?:₹|RS\.?)?\s*(\d{1,5})\s*(?:/-)?\s*", cleaned, re.I)
        if m and 0 < int(m.group(1)) <= 100000:
            found.append((f"{int(m.group(1)):.2f}", 1))
    if whole_only:
        return found
    return sorted(found, key=lambda x: -x[1])


def _quantities(text: str, measures_only: bool = False) -> List[str]:
    if NUTRITION_RE.search(text):
        return []
    combo = re.search(r"(\d+(?:\.\d+)?)\s*(ML|G)\s*\+\s*(\d+(?:\.\d+)?)\s*\2", text, re.I)
    if combo:
        return [f"{float(combo.group(1)) + float(combo.group(3)):g}{combo.group(2).lower()}"]
    values = []
    for m in QTY_RE.finditer(text):
        unit = UNIT_WORDS[m.group(2).upper()]
        if measures_only and unit not in MEASURE_UNITS:
            continue
        values.append(f"{float(m.group(1)):g}{unit}")
    return values


MONTH_ABBR = ("JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC")
MONTHS = r"JAN(?:UARY)?|FEB(?:RUARY)?|MAR(?:CH)?|APR(?:IL)?|MAY|JUNE?|JULY?|AUG(?:UST)?|SEPT?(?:EMBER)?|OCT(?:OBER)?|NOV(?:EMBER)?|DEC(?:EMBER)?"


def _plausible_year(year: int) -> bool:
    return 15 <= year <= 45 or 2015 <= year <= 2045


def _date_spans(text: str) -> List[Tuple[str, int, int]]:
    """Dates with their position: dd/mm/yy (also dd.mm.yyyy, 5 DEC 2025) or month/year (12/25, DEC 2025).
    Values are normalised to dd/mm/yy or mm/yy."""
    upper = str(text or "").upper()
    spans: List[Tuple[str, int, int]] = []
    taken: List[Tuple[int, int]] = []

    def add(value, start, end):
        if any(start < e and end > s for s, e in taken):
            return
        taken.append((start, end))
        spans.append((value, start, end))

    full_patterns = (
        # Date run into a time: 21/08/2618:37:49
        r"(?<!\d)(\d{1,2})([./-])(\d{1,2})\2(\d{2})(?=\d{1,2}:\d{2})",
        r"(?<!\d)(\d{1,2})([./-])(\d{1,2})\2(\d{4}|\d{2})(?!\d)",
        # A stray digit after the year: "16/02/271" from "16/02/27 USP".
        r"(?<!\d)(\d{1,2})([./-])(\d{1,2})\2(\d{2})\d(?!\d)",
        # Dot-matrix slashes read as 1: 30107126 -> 30/07/26.
        r"(?<!\d)(\d{2})(1)(\d{2})1(\d{2})(?!\d)",
    )
    for pattern in full_patterns:
        for m in re.finditer(pattern, upper):
            d, mo, y = int(m.group(1)), int(m.group(3)), int(m.group(4))
            if 1 <= d <= 31 and 1 <= mo <= 12 and _plausible_year(y):
                add(f"{d:02d}/{mo:02d}/{y % 100:02d}", m.start(), m.end())
    for m in re.finditer(r"(?<!\d)(\d{1,2})[\s./-]*(" + MONTHS + r")(?![A-Z])[\s.'/-]*(\d{4}|\d{2})(?!\d)", upper):
        d, y = int(m.group(1)), int(m.group(3))
        if 1 <= d <= 31 and _plausible_year(y):
            add(f"{d:02d}/{MONTH_ABBR.index(m.group(2)[:3]) + 1:02d}/{y % 100:02d}", m.start(), m.end())
    for pattern in (r"(?<![\d/.-])(\d{1,2})([/-])(\d{4}|\d{2})(?![\d/.-])",
                    r"(?<![\d/.-])(\d{1,2})(/)(\d{2})(?=\d{1,2}:\d{2})",
                    r"(?<![\d/.-])(\d{1,2})(\.)(20\d{2})(?![\d.])"):
        for m in re.finditer(pattern, upper):
            mo, y = int(m.group(1)), int(m.group(3))
            if 1 <= mo <= 12 and _plausible_year(y):
                add(f"{mo:02d}/{y % 100:02d}", m.start(), m.end())
    for m in re.finditer(r"\b(" + MONTHS + r")(?![A-Z])[\s.'/-]*(\d{4}|\d{2})(?!\d)", upper):
        if _plausible_year(int(m.group(2))):
            add(f"{MONTH_ABBR.index(m.group(1)[:3]) + 1:02d}/{int(m.group(2)) % 100:02d}", m.start(), m.end())
    return sorted(spans, key=lambda s: s[1])


def _dates(text: str) -> List[str]:
    return [value for value, _, _ in _date_spans(text)]


def _date_key(value: str) -> Tuple[int, int, int]:
    parts = [int(p) for p in value.split("/")]
    if len(parts) == 3:
        return parts[2], parts[1], parts[0]
    return parts[1], parts[0], 0


def _add_months(value: str, months: int) -> str:
    parts = [int(p) for p in value.split("/")]
    day, (month, year) = (parts[0], parts[1:]) if len(parts) == 3 else (None, parts)
    year2, month0 = divmod(year * 12 + month - 1 + months, 12)
    return f"{day:02d}/{month0 + 1:02d}/{year2 % 100:02d}" if day else f"{month0 + 1:02d}/{year2 % 100:02d}"


def _codes(text: str, short_ok: bool = False) -> List[str]:
    """Batch/lot-shaped tokens: letters and digits mixed, not a date, price, quantity or time."""
    cleaned = _strip_non_prices(text)
    for pattern in (r"(?:₹|RS\.?)\s*\d+(?:[.,]\d+)?", r"(?<![\d.,])\d{1,6}[.,]\d{2}(?!\d)", r"\d+\s*(?:/|1)-"):
        cleaned = re.sub(pattern, " ", cleaned, flags=re.I)
    cleaned = re.sub(r"[^A-Z0-9\s/-]", " ", cleaned.upper())
    tokens = cleaned.split()
    found = []
    # A code split by a space ("BN HY026233", "W3 B") is one code when nothing else is on the line.
    if 2 <= len(tokens) <= 3 and all(re.fullmatch(r"[A-Z0-9]+", t) for t in tokens):
        joined = " ".join(tokens) if short_ok and len("".join(tokens)) <= 5 else "".join(tokens)
        if re.search(r"\d", joined) and re.search(r"[A-Z]", joined) and 3 <= len(joined.replace(" ", "")) <= 20:
            found.append(joined)
    for token in tokens:
        token = token.strip("/-")
        minimum = 2 if short_ok else 3
        # All-digit runs of 8+ are barcodes, phone or licence numbers, not batch codes.
        if minimum <= len(token) <= 20 and re.search(r"\d", token) and (re.search(r"[A-Z]", token) or 5 <= len(token) <= 7):
            if not re.fullmatch(r"(?:INS|E)\d+|\d+(?:ML|G|KG|MG|L)", token):
                found.append(token)
    return [_fix_code_digits(code) for code in found]


def _fix_code_digits(code: str) -> str:
    """Inside the digit run that ends a code, O/I/L are misread 0/1/1: BNHYO26233 -> BNHY026233."""
    m = re.fullmatch(r"([A-Z0-9 ]*?[A-Z] ?)([OIL0-9]*[0-9][OIL0-9]*)", code)
    if not m or len(re.findall(r"\d", m.group(2))) < 3 or not re.match(r"[OIL]?\d", m.group(2)):
        return code
    return m.group(1) + m.group(2).translate(str.maketrans("OIL", "011"))


PHONE_PATTERNS = (
    r"1800[\s-]*\d{2,4}[\s-]*\d{2,4}[\s-]*\d{0,4}",                   # toll free: 1800 266 4448, 1800-10-22-221
    r"(?:\+?\s*91[\s-]*)?\(?0?\d{2,4}\)?[\s-]*\d{3,4}[\s-]*\d{3,4}",   # +91 (821) 252 1985, 0161-2674904
    r"(?:\+?\s*91[\s-]*)?[6-9]\d{4}[\s-]*\d{5}",                       # mobile
)


def _phones(text: str) -> List[str]:
    found = []
    for pattern in PHONE_PATTERNS:
        for m in re.finditer(r"(?<![\d.])" + pattern + r"(?![\d])", text):
            digits = re.sub(r"\D", "", m.group(0))
            if 10 <= len(digits) <= 13 and not re.search(r"\d{2}[./]\d{2}[./]\d{2}", m.group(0)):
                found.append(re.sub(r"\s+", " ", m.group(0)).strip(" -,."))
    return found


EMAIL_RE = re.compile(r"[A-Z0-9._%+-]+@[A-Z0-9-]+(?:\.[A-Z0-9-]+)*\.[A-Z]{2,}", re.I)

# ---------------------------------------------------------------------------
# Labels (OCR-tolerant)
# ---------------------------------------------------------------------------

MRP_LABEL = re.compile(r"\bM\s*\.?\s*R\s*\.?\s*P\b|M\.R\.P|MRP|MAXIMUM\s+RETAIL|RETAIL\s+(?:SALE\s+)?PRICE", re.I)
QTY_LABEL = re.compile(r"\b[NW]ETT?\b\.?\s*(?:QUANTITY|QTY|[O0]TY|WT|WEIGHT|VOL(?:UME)?|CONTENTS?|MASS)?|\bQ(?:UANTI)?TY\b|\bQUANTITY\b", re.I)
MFG_LABEL = re.compile(r"\bMF[GD]\b\.?(?!\s*(?:\.|UL)?\s*(?:BY|UNIT|FOR)\b)|MANUFACTUR(?:ED|ING|E)\s+(?:DATE|ON)|DATE\s+OF\s+(?:MFG|MANUFACTURE|PACKING)|\bPKD\b|PACKED\s+ON|PACKING\s+DATE|\bPKG\s*DATE", re.I)
EXP_LABEL = re.compile(r"USE\s*BY|EXPIRY|\bEXP\b|BEST\s*BEFORE|\bBB\b|EXPIRES", re.I)
BATCH_LABEL = re.compile(r"(?:BATCH|\bLOT)\s*(?:NO\b|NUMBER|#)?\s*\.?|\bB\.?\s*NO\b\.?|\bCODE\b", re.I)
MAKER_LABELS = (  # in order of preference
    # "Md. By" is how OCR often reads a small "Mfd. By".
    re.compile(r"(?:MANUFACTURED|M[FI]?D|MFG|MANUFACTURED\s+&\s+PACKED)\s*\.?\s*(?:UL\s*)?BY\b\s*[:.-]?", re.I),
    re.compile(r"(?:MARKETED|MKTD)\s*\.?\s*(?:BY|&\s*DISTRIBUTED\s+BY)\b\s*[:.-]?", re.I),
    re.compile(r"BRAND\s+OWNED\s+BY\s*[:.-]?|MANUFACTURED\s+FOR\s*[:.-]?", re.I),
    re.compile(r"TRADE\s*-?\s*MARK\s+(?:OF|UNDER\s+LICEN[CS]E\s+FROM)\s*", re.I),
    re.compile(r"PACKED\s*(?:&\s*MARKETED\s*)?BY\b\s*[:.-]?", re.I),
)
PACKER_LABEL = re.compile(r"PACKED\s+BY\b\s*[:.-]?", re.I)
IMPORTER_LABEL = re.compile(r"IMPORTED\s+(?:&\s*MARKETED\s+)?BY\b\s*[:.-]?|\bIMPORTER\b\s*[:.-]?", re.I)
CARE_LABEL = re.compile(r"CONSUMER|CUSTOMER|CUST\.?\s*CARE|CARE\s*(?:CELL|TEL|NO|LINE)|HELP\s*LINE|TOLL\s*-?\s*FREE|CALL\s*US|FEEDBACK|QUERY|COMPLAINT|CONTACT|PHONE|\bTEL\b|\bPH\b|\bMOB", re.I)
ORIGIN_LABEL = re.compile(r"COUNTRY\s+OF\s+ORIGIN\s*[:.-]?|MADE\s+IN\b|PRODUCT\s+OF\b", re.I)
PANEL_REFERENCE = re.compile(r"\bSEE\b|\bREFER\b|\bPANEL\b|PRINTED\s+ON|\bFLAP\b", re.I)
TAX_INCLUSIVE = re.compile(r"IN[CK][LI1]\w*\s*\.?\s*(?:OF)?\s*A[LI1]+\s*TAX", re.I)
COMPANY_SUFFIX = re.compile(r"\b(?:P\.?\s*[VR]?\s*T\.?\s*L(?:TD|IMITED|T|D)\b\.?|PRIVATE\s+LIMITED|LIMITED|LTD\.?|LLP|INC\.?|CORPORATION|CORP\.?|& CO\.?|COMPANY)", re.I)
# Words that mark a line as instructions, claims or legal text rather than a name.
NOT_A_NAME = re.compile(
    r"INGREDIENT|NUTRITION|DIRECTION|CAUTION|WARNING|STORE|KEEP|ALLERGEN|CONTAINS|REGISTERED|TRADE\s*MARK|COPYRIGHT|"
    r"RIGHTS|RESERVED|WWW\.|HTTP|\.COM|\.IN\b|@|LIC\b|LICEN|FSSAI|BATCH|MRP|MFD|MFG|PKD|NET\b|QTY|USE\s+BY|BEST\s+BEFORE|"
    r"CONSUMER|CUSTOMER|CARE|FEEDBACK|CALL|EMAIL|PHONE|TOLL|ADDRESS|MANUFACTUR|MARKETED|PACKED|IMPORTED|OFFER|FREE\b|"
    r"\bMORE\b|\bNEW\b|SHOP|ONLINE|SCAN|VISIT|ONLY|\bFOR\b|\bAND\b|\bWITH\b|\bTHE\b|\bOF\b|\bIS\b|\bNOT\b|\bVS\b|%", re.I)


# ---------------------------------------------------------------------------
# Field finders
# ---------------------------------------------------------------------------


@dataclass
class Found:
    value: str = ""
    conf: float = 0.0
    line: Optional[Line] = None


def _labelled(lines: List[Line], label_re: "re.Pattern[str]", parse, rows: float = 3.0,
              skip=None) -> Found:
    """Best value next to a label: on the label's own line, else the nearest parsable line to its right
    or below. A label may be printed several times (front and back); the clearest reading wins."""
    best: Tuple[Tuple[int, float], Found] = ((9, 0.0), Found())
    for line in lines:
        m = label_re.search(line.text)
        if not m or PANEL_REFERENCE.search(line.text) or (skip and skip(line)):
            continue
        values = parse(_after(m, line.text))
        if values:
            rank: Tuple[int, float] = (0, -line.conf)
            if rank < best[0]:
                best = (rank, Found(values[0], line.conf, line))
            continue
        if _is_legend(line):
            continue  # "MRP, Mfd. & Batch No." explains a stamp printed elsewhere; the stamp logic reads it
        for distance, other in enumerate(_neighbours(line, lines, rows)):
            other_label = label_re.search(other.text)
            if other_label and not parse(_after(other_label, other.text)):
                continue  # another label of the same kind owns this line
            values = parse(other.text)
            if values:
                rank = (1 + min(distance, 3), -other.conf)
                if rank < best[0]:
                    best = (rank, Found(values[0], other.conf * 0.97, other))
                break
    return best[1]


def _is_legend(line: Line) -> bool:
    """A line naming several declarations at once ("MFG. DATE & LOT NO.: USE BY DATE:")."""
    kinds = [MRP_LABEL, MFG_LABEL, EXP_LABEL, BATCH_LABEL, re.compile(r"UNIT\s+SALE\s+PRICE|\bUSP\b", re.I)]
    return sum(bool(k.search(line.text)) for k in kinds) >= 2


def _is_stamp(line: Line) -> bool:
    """Inkjet/dot-matrix print: short, few real words, and carrying a date, a price or a code."""
    words = re.findall(r"[A-Za-z]{4,}", line.text)
    if len(line.text) > 45 or len(words) > 2:
        return False
    return bool(_dates(line.text) or _prices(line.text) or re.search(r"[A-Z]{1,5}\d{3,}|\d[A-Z]\d", line.upper))


def _symbol_legend(lines: List[Line]) -> Dict[str, str]:
    """Legends such as "*MRP ... USP & #MFD: SEE ON FLAP" say which symbol marks which stamped value."""
    legend = {}
    for line in lines:
        for m in re.finditer(r"([#*@$^~+])\s*(MRP|MFD|MFG|PKD|USP|EXP|BB|BEST\s+BEFORE|USE\s+BY)", line.upper):
            legend[m.group(1)] = {"MFD": "mfg", "MFG": "mfg", "PKD": "mfg", "MRP": "mrp", "USP": "usp"}.get(m.group(2), "exp")
    return legend


def _symbol_values(lines: List[Line], legend: Dict[str, str], kind: str, parse) -> Found:
    for symbol, meaning in legend.items():
        if meaning != kind:
            continue
        for line in lines:
            if not _is_stamp(line):
                continue
            for m in re.finditer(re.escape(symbol), line.text):
                values = parse(line.text[m.end():m.end() + 16])
                if values:
                    return Found(values[0], line.conf * 0.95, line)
    return Found()


def _extract_mrp(lines: List[Line], legend: Dict[str, str]) -> Found:
    def parse(text):
        # Beside a label, a price must look like one; a number buried in an address line is not a price.
        if len(re.findall(r"[A-Za-z]{3,}", text)) > 3:
            return []
        return [v for v, _ in _prices(text)]

    found = _labelled(lines, MRP_LABEL, parse, skip=lambda l: bool(PANEL_REFERENCE.search(l.text)))
    if found.value:
        return found
    found = _symbol_values(lines, legend, "mrp", parse)
    if found.value:
        return found
    # Stamped price with no label next to it ("₹79.00, HVG665"): the strongest currency amount.
    best: Tuple[int, float, Found] = (0, 0.0, Found())
    for line in lines:
        if not _is_stamp(line):
            continue
        for value, strength in _prices(line.text):
            if (strength, line.conf) > best[:2]:
                best = (strength, line.conf, Found(value, line.conf * 0.9, line))
    return best[2] if best[0] >= 2 else Found()


def _extract_unit_price(lines: List[Line]) -> Found:
    legend_unit = ""
    for line in lines:
        m = re.search(r"UNIT\s+SALE\s+PRICE\s+PER\s+" + USP_UNIT, line.upper)
        if m:
            legend_unit = re.sub(r"\s+", "", m.group(1)).lower()
    for line in lines:
        values = _unit_price_values(line.text)
        if values and ("/" in line.text or re.search(r"\bPER\b", line.upper)):
            return Found(values[0], line.conf, line)
    for line in lines:
        values = _unit_price_values(line.text)
        if values:
            return Found(values[0], line.conf * 0.9, line)
    # "USP: ₹0.07" with the unit given only in the legend ("UNIT SALE PRICE PER ML").
    for line in lines:
        m = re.search(r"U?SP\s*[:.]\s*(?:₹|RS\.?|[RTFZ?])?\s*(\d{1,4}[.,]\d{1,3})", line.upper)
        if m and legend_unit:
            return Found(f"{m.group(1).replace(',', '.')}/{legend_unit}", line.conf * 0.9, line)
    return Found()


def _extract_quantity(lines: List[Line]) -> Found:
    found = _labelled(lines, QTY_LABEL, _quantities)
    if found.value:
        # "150 ml (125ml+25ml More)": the bundle total is stated next to the declared quantity.
        return found
    # No label read: a quantity printed on its own. Accept it only when it is the one such quantity on
    # the pack, or clearly the most prominent one (table headers such as "100ml | 150ml" are neither).
    standalone = []
    for line in lines:
        values = _quantities(line.text, measures_only=True)
        if values and re.fullmatch(r"\(?\s*[\d.]+\s*[A-Za-z]+\s*\)?(?:\s*NET)?", line.text.strip(), re.I):
            standalone.append((line.h, values[0], line))
    standalone.sort(key=lambda s: -s[0])
    distinct = {v for _, v, _ in standalone}
    if len(distinct) == 1 or (standalone and all(s[0] * 1.5 <= standalone[0][0] for s in standalone if s[1] != standalone[0][1])):
        _, value, line = standalone[0]
        return Found(value, line.conf * 0.9, line)
    return Found()


def _extract_dates(lines: List[Line], text: str, legend: Dict[str, str]) -> Tuple[Found, Found]:
    """Manufacture/packing date and use-by/expiry date."""
    def mfg_only(t):
        return _dates(t)

    mfg = _labelled(lines, MFG_LABEL, mfg_only, skip=lambda l: bool(EXP_LABEL.search(l.text)) and bool(MFG_LABEL.search(l.text)))
    # "Best before 24 months from manufacture" is relative; it is resolved from the manufacture date below.
    exp = _labelled(lines, EXP_LABEL, _dates, skip=lambda l: bool(MFG_LABEL.search(l.text)) and bool(EXP_LABEL.search(l.text))
                    or bool(re.search(r"\d+\s*(?:MONTHS?|YEARS?|DAYS?)", l.text, re.I)))
    if not mfg.value:
        mfg = _symbol_values(lines, legend, "mfg", _dates)
    if not exp.value:
        exp = _symbol_values(lines, legend, "exp", _dates)

    # Stamped dates under a combined legend ("MFG. DATE & LOT NO.: USE BY DATE:"): manufacture comes
    # before expiry, so order them by date rather than by where OCR happened to read them.
    stamped = []
    for line in lines:
        if _is_stamp(line):
            stamped += [(d, line) for d in _dates(line.text)]
    mentions_mfg = bool(re.search(MFG_LABEL.pattern + r"|MFD\b|MFG\b", text, re.I))
    mentions_exp = bool(EXP_LABEL.search(text))
    if stamped:
        ordered = sorted({d for d, _ in stamped}, key=_date_key)
        by_value = {d: l for d, l in stamped}
        if not mfg.value and mentions_mfg:
            first = ordered[0]
            if not exp.value or _date_key(first) < _date_key(exp.value):
                mfg = Found(first, by_value[first].conf * 0.9, by_value[first])
        if not exp.value and mentions_exp:
            later = [d for d in ordered if mfg.value and _date_key(d) > _date_key(mfg.value)]
            if later:
                exp = Found(later[-1], by_value[later[-1]].conf * 0.9, by_value[later[-1]])

    if mfg.value and exp.value and exp.value == mfg.value:
        exp = Found()
    if mfg.value and exp.value and _date_key(exp.value) < _date_key(mfg.value):
        mfg, exp = exp, mfg

    # "Best before 24 months from manufacture".
    if mfg.value and not exp.value:
        m = re.search(r"(?:BEST\s+BEFORE|USE\s+(?:BY|WITHIN)|EXPIR\w*|SHELF\s+LIFE)\D{0,25}?(\d{1,3})\s*(MONTHS?|YEARS?)", text, re.I)
        if m:
            months = int(m.group(1)) * (12 if m.group(2).upper().startswith("Y") else 1)
            exp = Found(_add_months(mfg.value, months), mfg.conf * 0.9, mfg.line)
    return mfg, exp


def _extract_batch(lines: List[Line], mrp: Found, dates: Iterable[Found]) -> Found:
    def slot_code(text):
        # Right under / beside a BATCH label short codes ("W3 B") are fine; a bare word is not.
        return [c for c in _codes(text, short_ok=True) if not _dates(text) or c not in text]

    found = _labelled(lines, BATCH_LABEL, slot_code, rows=2.5,
                      skip=lambda l: bool(re.search(r"FIRST|CHARACTER|INDICATE|READ|SEE\b", l.upper)))
    if found.value:
        return found
    # A stamp line that carries the price or a date usually carries the batch code too.
    anchors = [f.line for f in (mrp, *dates) if f.line is not None]
    best: Tuple[float, Found] = (0.0, Found())
    for line in lines:
        if not _is_stamp(line):
            continue
        codes = [c for c in _codes(line.text) if re.search(r"[A-Z]", c)]
        if not codes:
            continue
        near = any(a is line or (_same_image(a, line) and abs(a.cy - line.cy) < 4 * max(a.h, line.h)) for a in anchors)
        score = line.conf + (40 if near else 0) + (10 if len(codes[-1]) >= 5 else 0)
        if score > best[0]:
            best = (score, Found(max(codes, key=len), line.conf * (0.9 if near else 0.7), line))
    return best[1] if best[0] >= 100 else Found()


def _unit_code(text: str) -> str:
    m = re.match(r"\s*\(([A-Z][0-9]|[0-9][A-Z]|[A-Z]{2})\)\s*[-:]?\s*[A-Z]", text.upper())
    return m.group(1) if m else ""


def _resolve_unit(batch: str, lines: List[Line]) -> Tuple[str, str]:
    """Packs listing contract units as "(W3)-LAKSHMIBALAJI BAKERS LLP" say the batch starts with the unit code.
    Returns (manufacturing unit, batch corrected for a one-letter misread)."""
    units = {}
    for line in lines:
        code = _unit_code(line.text)
        if code:
            units.setdefault(code, _company_name(line.text))
    compact = re.sub(r"[^A-Z0-9]", "", batch.upper())
    if not units or len(compact) < 2:
        return "", batch
    prefix = compact[:2]
    if prefix in units:
        return units[prefix], batch
    near = [code for code in units if sum(a != b for a, b in zip(code, prefix)) == 1]
    if len(near) == 1:
        fixed = near[0] + batch.upper().lstrip()[2:]
        return units[near[0]], fixed
    return "", batch


ADDRESS_WORDS = re.compile(
    r"\b(?:ROAD|RD|STREET|NAGAR|PLOT|PHASE|SECTOR|SCTOR|FLOOR|TOWER|AREA|ESTATE|VILLAGE|DIST|DISTT|DISTRICT|TALUK|"
    r"TAQ|PIN|HIGHWAY|MARG|LANE|BUILDING|COMPLEX|INDL|INDUSTRIAL|PARK|CROSSING|OFFICE|P\.?\s*O\.?\s*BOX)\b|\b\d{3}\s?\d{3}\b", re.I)


def _looks_address(text: str) -> bool:
    return bool(ADDRESS_WORDS.search(text)) and not COMPANY_SUFFIX.search(text)


def _company_name(text: str) -> str:
    """Company name at the start of a declaration, cut after its legal suffix or before the address."""
    text = re.sub(r"^\s*(?:LIC\.?\s*USER|[A-Z]\d?\)|\([A-Z0-9]{2}\))\s*[-:]?\s*", "", text.strip(), flags=re.I).strip(" :.,-")
    m = COMPANY_SUFFIX.search(text)
    if m and m.start() > 2:
        return text[:m.end()].strip(" ,")
    return re.split(r",|\s#|\s\d", text)[0].strip(" ,.")


def _extract_manufacturer(lines: List[Line]) -> Found:
    found: List[Tuple[int, Found]] = []
    for priority, label_re in enumerate(MAKER_LABELS):
        for line in lines:
            m = label_re.search(line.text)
            if not m:
                continue
            candidates = [(_after(m, line.text), line)] + [(l.text, l) for l in _neighbours(line, lines, rows=1.6)[:2]]
            for candidate, source in candidates:
                name = _company_name(candidate)
                named = COMPANY_SUFFIX.search(name) or (len(re.sub(r"[^A-Za-z]", "", name)) >= 4
                                                        and not NOT_A_NAME.search(name.replace("&", " ")))
                if named and not _looks_address(name) and not re.search(r"^(?:READ|SEE|FOR|THE)\b|\bBATCH\b", name, re.I):
                    found.append((priority, Found(name, source.conf, source)))
                    break
    if found:
        first = min(found, key=lambda f: (f[0], -f[1].conf))[1]
        # The same company is often printed twice (Mfd. by / trademark of); keep the clearer read.
        same = [f for _, f in found if SequenceMatcher(None, _letters(f.value), _letters(first.value)).ratio() >= 0.6]
        best = max(same, key=lambda f: f.conf)
        if not COMPANY_SUFFIX.search(best.value):
            # A clipped read ("N. Ranga Rao & Sons Pe"): use a complete printing of the same name.
            key = _letters(best.value)
            options = []
            for line in lines:
                if not COMPANY_SUFFIX.search(line.text):
                    continue
                starts = [0] + [m.end() for m in re.finditer(r"[\s,:]+", line.text)]
                for start in starts:
                    name = _company_name(line.text[start:])
                    ratio = SequenceMatcher(None, _letters(name)[:len(key)], key).ratio()
                    if COMPANY_SUFFIX.search(name) and ratio >= 0.85:
                        options.append((ratio, Found(name, line.conf, line)))
            if options:
                return max(options, key=lambda o: o[0])[1]
        return best
    for line in lines:
        if COMPANY_SUFFIX.search(line.text) and not CARE_LABEL.search(line.text):
            name = _company_name(line.text)
            if len(name) >= 6:
                return Found(name, line.conf * 0.8, line)
    return Found()


def _extract_party(lines: List[Line], label_re: "re.Pattern[str]") -> str:
    for line in lines:
        m = label_re.search(line.text)
        if m:
            for candidate in [_after(m, line.text)] + [l.text for l in _neighbours(line, lines, rows=1.6)[:1]]:
                name = _company_name(candidate)
                if len(re.sub(r"[^A-Za-z]", "", name)) >= 4:
                    return name
    return ""


def _extract_contacts(lines: List[Line]) -> Tuple[Found, Found]:
    phone, email = Found(), Found()
    # Phone: printed on or just after a consumer-care / feedback label.
    for line in lines:
        if not CARE_LABEL.search(line.text) or re.search(r"\bLIC|FSSAI|BARCODE", line.upper):
            continue
        for candidate in [line] + [l for l in lines if _same_image(l, line) and 0 < l.order - line.order <= 4]:
            values = [p for p in _phones(candidate.text) if not re.search(r"LIC|REG", candidate.upper[:10])]
            if values:
                phone = Found(values[0], candidate.conf, candidate)
                break
        if phone.value:
            break
    if not phone.value:
        for line in lines:
            values = [p for p in _phones(line.text) if re.sub(r"\D", "", p).startswith("1800")]
            if values:
                phone = Found(values[0], line.conf * 0.9, line)
                break
    emails = [(line, m.group(0)) for line in lines for m in EMAIL_RE.finditer(line.text)]
    if emails:
        cared = [e for e in emails if CARE_LABEL.search(e[0].text) or "CARE" in e[1].upper()]
        line, value = (cared or emails)[0]
        email = Found(value, line.conf, line)
    return phone, email


def _extract_origin(lines: List[Line]) -> Found:
    for line in lines:
        m = ORIGIN_LABEL.search(line.text)
        if not m:
            continue
        rest = re.split(r"[.,;:()|]|\bMKTD\b|\bMFD\b|\bBY\b", _after(m, line.text), flags=re.I)[0].strip()
        words = rest.split()
        if 1 <= len(words) <= 3 and all(re.fullmatch(r"[A-Za-z]{2,}", w) for w in words):
            return Found(" ".join(words).title(), line.conf, line)
    return Found()


# ---------------------------------------------------------------------------
# Brand and product name
# ---------------------------------------------------------------------------


def _letters(text: str) -> str:
    return re.sub(r"[^A-Z]", "", text.upper())


def _name_like(text: str, max_words: int = 5) -> bool:
    words = text.split()
    if not 1 <= len(words) <= max_words or NOT_A_NAME.search(text):
        return False
    letters = len(re.findall(r"[A-Za-z]", text))
    return letters >= 3 and letters >= 0.6 * len(text.replace(" ", ""))


def _image_median_h(lines: List[Line]) -> Dict[str, float]:
    by_image: Dict[str, List[float]] = {}
    for line in lines:
        if line.has_box:
            by_image.setdefault(line.image, []).append(line.h)
    return {k: sorted(v)[len(v) // 2] for k, v in by_image.items()}


def _trademark_brand(lines: List[Line]) -> str:
    for line in lines:
        m = re.search(r"([A-Za-z][A-Za-z0-9&' ]{1,24}?)\s*(?:®\s*)?(?:IS|I|1S|lS|ISA)\s*A?\s+REGISTERED\s+TRADE\s*-?\s*MARK", line.text, re.I)
        if m:
            name = re.sub(r"^\W+", "", m.group(1)).strip()
            if 1 <= len(name.split()) <= 3 and _name_like(name, 3):
                return name.upper()
    return ""


def _extract_brand(lines: List[Line]) -> Tuple[str, Optional[Line]]:
    """The brand is the pack's most prominent wording: big letters relative to the photo's other text,
    repeated across the pack (logo, URL, statements)."""
    medians = _image_median_h(lines)
    per_image: Dict[str, str] = {}
    for line in lines:
        per_image[line.image] = per_image.get(line.image, "") + "|" + _letters(line.text)
    stated = _trademark_brand(lines)
    best: Tuple[float, str, Optional[Line]] = (0.0, "", None)
    for line in lines:
        text = re.sub(r"[®™©]", "", line.text).strip(" .,:;-'\"")
        if not line.has_box or not _name_like(text, 3) or re.search(r"\d", text):
            continue
        key = _letters(text)
        prominence = line.h / max(1.0, medians.get(line.image, line.h))
        # Size is the main signal; a small word repeated in a table ("PER") is not a brand.
        if len(key) < 3 or prominence < 1.5:
            continue
        photos = sum(key in blob for blob in per_image.values())
        score = prominence + 0.5 * min(photos - 1, 3) + (3 if stated and SequenceMatcher(None, key, _letters(stated)).ratio() > 0.8 else 0)
        if score > best[0]:
            best = (score, text.upper(), line)
    if stated and (not best[1] or SequenceMatcher(None, _letters(best[1]), _letters(stated)).ratio() > 0.8):
        return stated, best[2]
    if best[0] >= 1.8:
        return best[1], best[2]
    return stated, None


def _gap(a: Line, b: Line) -> Tuple[float, float]:
    dx = max(0.0, max(a.x1, b.x1) - min(a.x2, b.x2))
    dy = max(0.0, max(a.y1, b.y1) - min(a.y2, b.y2))
    return dx, dy


def _is_company(text: str, company: str) -> bool:
    """True when the text is (part of) the company name, e.g. "Parlé Agro" printed on the front."""
    key, full = _letters(text), _letters(company)
    if len(key) < 4 or not full:
        return False
    return max(SequenceMatcher(None, key, full[i:i + len(key)]).ratio() for i in range(max(1, len(full) - len(key) + 1))) >= 0.8


def _descriptor_near(brand_line: Line, lines: List[Line], company: str = "") -> List[Line]:
    """The block of words printed right under or beside one printing of the brand, in a smaller
    display font: "Original Glycerin Bar", "PURE CAMPHOR", "GLASS & MULTISURFACE CLEANER"."""
    bh = brand_line.h
    nearby = []
    for other in lines:
        if other is brand_line or not _same_image(other, brand_line) or not other.has_box:
            continue
        dx, dy = _gap(brand_line, other)
        if dx <= 1.5 * bh and dy <= 1.6 * bh and 0.06 * bh <= other.h <= 0.95 * bh:
            nearby.append(other)
    # Claim tokens are short: "5X", "20% MORE".
    numeric = [l for l in nearby if re.search(r"\d", l.text) and len(l.text.split()) <= 2]

    def usable(line: Line) -> bool:
        text = line.text.strip(" .,:;-")
        if re.search(r"\d", text) or not _name_like(re.sub(r"[&+]", " ", text), 4):
            return False
        if _letters(text) in _letters(brand_line.text) or _is_company(text, company):
            return False
        # Claims pair a word with a number ("5X" over "SHINE", "20%" "MORE").
        return not any(_gap(line, n)[1] < 0.6 * max(line.h, n.h) and _gap(line, n)[0] < 0.5 * line.h
                       and 0.5 <= n.h / line.h <= 2.5 for n in numeric)

    words = sorted((l for l in nearby if usable(l)), key=lambda l: (l.y1, l.x1))
    if not words:
        return []
    # Build stacked blocks: same size, aligned, directly on top of each other.
    blocks: List[List[Line]] = []
    for line in words:
        for block in blocks:
            last = block[-1]
            dx, dy = _gap(last, line)
            # One name set in stacked lines has tight leading; a tagline under it is set apart.
            if 0.55 <= line.h / last.h <= 1.8 and dy <= 0.25 * min(line.h, last.h) and dx <= 0.5 * line.h:
                block.append(line)
                break
        else:
            blocks.append([line])
    # The block nearest the brand is its descriptor.
    return min(blocks, key=lambda b: _gap(brand_line, b[0])[0] + _gap(brand_line, b[0])[1])[:4]


def _statement_name(brand: str, lines: List[Line]) -> str:
    """A printed statement of the product's name: "HAPPY HAPPY MAWA FLAVOURED CAKE", "Pears Glycerin Bar"."""
    key = _letters(brand)
    best = ""
    for line in lines:
        for sentence in re.split(r"[.;:(]", line.text):
            words = sentence.split()
            for start in range(len(words)):
                if not SequenceMatcher(None, _letters(" ".join(words[start:start + len(brand.split())])), key).ratio() > 0.85:
                    continue
                tail = words[start + len(brand.split()):start + len(brand.split()) + 4]
                name = " ".join(words[start:start + len(brand.split())] + tail).strip(" ,")
                if tail and _name_like(name, 7) and len(name) > len(best):
                    best = name
    return best


def _generic_name(lines: List[Line]) -> str:
    """Explicit commodity statements: "Content: Camphor", "Stapler....HP-45", "Product: ..."."""
    for line in lines:
        m = re.match(r"\s*(?:CONTENTS?|PRODUCT|COMMODITY|GENERIC\s+NAME|NAME\s+OF\s+(?:THE\s+)?(?:COMMODITY|PRODUCT))\s*[:.-]\s*([A-Za-z][A-Za-z &-]{2,30})$", line.text, re.I)
        if m:
            return m.group(1).strip()
        m = re.match(r"\s*([A-Za-z]{4,20})\s*\.{2,}\s*([A-Z0-9-]{2,12})\s*$", line.text)
        if m:
            return f"{m.group(1)} {m.group(2)}"
    return ""


def _extract_product_name(brand: str, lines: List[Line], company: str = "") -> str:
    if not brand:
        return ""
    candidates = []
    statement = _statement_name(brand, lines)
    if statement:
        candidates.append(statement)
    # Look beside every printing of the brand (front logo, back-panel logo) and keep the fullest descriptor.
    key = _letters(brand)
    best_block: List[Line] = []
    for line in lines:
        if line.has_box and SequenceMatcher(None, _letters(line.text), key).ratio() >= 0.75:
            block = _descriptor_near(line, lines, company)
            if len(" ".join(l.text for l in block).split()) > len(" ".join(l.text for l in best_block).split()):
                best_block = block
    if best_block:
        candidates.append(f"{brand} " + " ".join(l.text.strip(" .,:;-") for l in best_block))
    name = max(candidates, key=lambda c: (len(c.split()) <= 7, len(c))) if candidates else brand
    generic = _generic_name(lines)
    if generic:
        extra = [w for w in generic.split() if _letters(w) and _letters(w) not in _letters(name)]
        model = [w for w in generic.split() if re.search(r"\d", w)]
        if model and all(_letters(m) not in _letters(name) or re.sub(r"\W", "", m) not in re.sub(r"\W", "", name.upper()) for m in model):
            name = f"{name} {' '.join(model)}"
        if extra:
            name = f"{name} {' '.join(w for w in extra if not re.search(r'\d', w))}".strip()
    return re.sub(r"\s+", " ", name).strip().upper()


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------


def _confidence(found: Found) -> float:
    return round(max(50.0, min(98.0, found.conf)), 2) if found.value else 0.0


def extract_fields(text: str, ocr_items: Optional[Iterable[Dict[str, Any]]] = None,
                   qr_details: Optional[Dict[str, Any]] = None, ocr_confidence: float = 0.0) -> Dict[str, Any]:
    qr_details = qr_details or {}
    lines = _build_lines(text, ocr_items)
    raw = "\n".join(l.text for l in lines)
    legend = _symbol_legend(lines)

    mrp = _extract_mrp(lines, legend)
    usp = _extract_unit_price(lines)
    qty = _extract_quantity(lines)
    mfg, exp = _extract_dates(lines, raw, legend)
    batch = _extract_batch(lines, mrp, (mfg, exp))
    maker = _extract_manufacturer(lines)
    unit, batch_value = _resolve_unit(batch.value, lines) if batch.value else ("", "")
    if batch.value:
        batch.value = batch_value
    phone, email = _extract_contacts(lines)
    origin = _extract_origin(lines)
    brand, _ = _extract_brand(lines)
    product = _extract_product_name(brand, lines, maker.value) or qr_details.get("product", "")
    # A doubled brand word ("Happy / Happy") is printed as two stacked logo lines, but stated in full.
    if brand and product.startswith(f"{brand} {brand}"):
        brand = f"{brand} {brand}"

    base = max(0.0, min(98.0, float(ocr_confidence or 0.0)))
    fields = {
        "product_name": product,
        "brand": brand,
        "mrp": mrp.value,
        "mrp_tax_inclusive": bool(TAX_INCLUSIVE.search(raw)),
        "unit_sale_price": usp.value,
        "net_quantity": qty.value,
        "manufacturer": unit or maker.value or qr_details.get("manufacturer", ""),
        "packer": _extract_party(lines, PACKER_LABEL) or qr_details.get("packer", ""),
        "importer": _extract_party(lines, IMPORTER_LABEL),
        "batch_lot": batch.value or qr_details.get("batch_lot", ""),
        "manufacturing_date": mfg.value,
        "use_by_date": exp.value,
        "consumer_email": email.value,
        "consumer_phone": phone.value,
        "country_of_origin": origin.value,
        "raw_text": re.sub(r"[ \t]+", " ", raw).strip(),
        "qr_manufacturing_unit": qr_details.get("unit", ""),
        "qr_manufacturing_address": qr_details.get("address", ""),
    }
    found_by_field = {"mrp": mrp, "unit_sale_price": usp, "net_quantity": qty, "manufacturing_date": mfg,
                      "use_by_date": exp, "batch_lot": batch, "manufacturer": maker, "consumer_phone": phone,
                      "consumer_email": email, "country_of_origin": origin}
    confidence = {}
    for key, value in fields.items():
        if key in {"raw_text", "mrp_tax_inclusive"}:
            continue
        if not value:
            confidence[key] = 0.0
        elif key in found_by_field and found_by_field[key].value:
            confidence[key] = _confidence(found_by_field[key])
        elif qr_details and key in qr_details:
            confidence[key] = 96.0
        else:
            confidence[key] = round(max(50.0, base), 2)
    if unit:
        confidence["manufacturer"] = confidence.get("batch_lot", 0.0) or round(base, 2)
    fields["field_confidence"] = confidence
    fields["batch_evidence_items"] = [batch.line.item] if batch.line is not None and batch.line.item else []
    return fields
