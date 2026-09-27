import re
from typing import Any, Dict, Iterable, List, Optional, Tuple

KNOWN_BRANDS = ("PARLE", "AMUL", "BRITANNIA", "HALDIRAM", "COCA COLA", "COCA-COLA", "PEPSI", "NESTLE", "ITC", "TATA", "DABUR", "PATANJALI", "BISLERI")
# Product-level brands: when one of these is on the pack it is the brand, and it prefixes the product name.
PRODUCT_BRANDS = (
    "COLIN", "DETTOL", "HARPIC", "LIZOL", "VIM", "SURF EXCEL", "ARIEL", "TIDE", "RIN", "WHEEL", "GHADI", "LUX",
    "LIFEBUOY", "DOVE", "PEARS", "SANTOOR", "CINTHOL", "HAMAM", "COLGATE", "PEPSODENT", "CLOSEUP", "SENSODYNE",
    "DABUR RED", "MAGGI", "KITKAT", "MUNCH", "CADBURY", "DAIRY MILK", "LAYS", "KURKURE", "BINGO", "UNCLE CHIPPS",
    "SUNFEAST", "GOOD DAY", "MARIE GOLD", "OREO", "BOURBON", "HIDE & SEEK", "MONACO", "KRACKJACK", "AASHIRVAAD",
    "FORTUNE", "SAFFOLA", "MDH", "EVEREST", "HORLICKS", "BOURNVITA", "COMPLAN", "BRU", "NESCAFE",
    "KISSAN", "TROPICANA", "MINUTE MAID", "SPRITE", "FANTA", "MIRINDA", "7UP", "MOUNTAIN DEW", "KINLEY",
    "AQUAFINA", "HIMALAYA", "GARNIER", "LAKME", "PONDS", "NIVEA", "VASELINE", "PARACHUTE", "CLINIC PLUS",
    "HEAD & SHOULDERS", "SUNSILK", "PANTENE", "GOOD KNIGHT", "ODONIL",
)
KNOWN_PRODUCT_NAMES = ("FROOTI", "THUMS UP", "LIMCA", "MAAZA", "SLICE", "REAL", "APPY FIZZ")
PRODUCT_WORDS = (
    "DRINK", "JUICE", "BISCUIT", "BISCUITS", "CAKE", "MILK", "SNACK", "NOODLES", "SOAP", "SHAMPOO", "OIL", "POWDER",
    "CREAM", "PASTE", "SAUCE", "COFFEE", "TEA", "WATER", "FOOD", "CLEANER", "DETERGENT", "LIQUID", "SPRAY", "LOTION",
    "GEL", "WASH", "HANDWASH", "TOOTHPASTE", "CONDITIONER", "DEODORANT", "PERFUME", "SANITIZER", "SANITISER",
    "DISINFECTANT", "REPELLENT", "FRESHENER", "POLISH", "CHIPS", "NAMKEEN", "CHOCOLATE", "CANDY", "WAFER", "WAFERS",
    "COOKIES", "RUSK", "BREAD", "JAM", "KETCHUP", "PICKLE", "RICE", "ATTA", "FLOUR", "DAL", "MASALA", "SPICE", "SALT",
    "SUGAR", "PASTA", "CEREAL", "OATS", "BUTTER", "GHEE", "CHEESE", "CURD", "YOGURT", "ICE CREAM", "SODA", "SYRUP",
    "HONEY", "MIX", "BAR", "TABLETS", "CAPSULES", "BALM", "FACEWASH", "SERUM",
)
SECTION_HEADINGS = (
    r"^(?:DIRECTIONS?|HOW\s+TO\s+USE|CAUTION|WARNINGS?|PRECAUTIONS?|STORAGE|STORE|KEEP|INGREDIENTS?|NUTRITION(?:AL)?|"
    r"ALLERGEN|NOTE|DISCLAIMER|SAFETY|FIRST\s+AID|MARKETED|MANUFACTURED|MFD|PACKED|IMPORTED|BEST\s+BEFORE|USE\s+BY|"
    r"FOR\s+(?:SALE|EXTERNAL|FEEDBACK|MFG|OTHER)|SCAN|VISIT|CALL|EMAIL|WRITE)\b|DIRECTIONS\s+FOR\s+USE"
)
HEADER_TERMS = ("MRP", "NET QUANTITY", "NET WT", "NET WEIGHT", "MFG", "MFD", "PKD", "PACKED", "MANUFACTURED", "BATCH", "LOT", "USE BY", "BEST BEFORE", "INGREDIENT", "NUTRITION", "CONSUMER CARE", "CUSTOMER CARE", "HELPLINE", "COUNTRY OF ORIGIN", "MADE IN")
PROMOTIONAL_TERMS = ("MORE", "FREE", "OFFER", "SPECIAL OFFER", "NEW PACK", "NO ADDED PRESERVATIVE")


def _normalise_text(text: str) -> str:
    replacements = {"â‚¹": "₹", "â€“": "-", "â€”": "-", "â€™": "'"}
    for old, new in replacements.items():
        text = (text or "").replace(old, new)
    return text or ""


def _clean_line(value: str) -> str:
    value = re.sub(r"[^A-Za-z0-9₹€$%&@./,:;()'’+\- ]+", " ", value or "")
    return re.sub(r"\s+", " ", value).strip(" -:.,;")


def _is_promotional(line: str) -> bool:
    upper = line.upper().strip()
    return upper in PROMOTIONAL_TERMS or bool(re.fullmatch(r"\d+\s*%\s*(MORE|EXTRA)", upper))


def _is_declaration(line: str) -> bool:
    upper = line.upper().strip()
    if any(upper.startswith(term) for term in HEADER_TERMS):
        return True
    if re.search(r"\b(?:MRP|MFG|MFD|PKD|BATCH|LOT)\b", upper):
        return True
    if re.search(r"\b\d+(?:\.\d+)?\s*(?:KG|G|MG|ML|L|LTR|LITRE|LITRES)\b", upper):
        return True
    return "@" in upper and "." in upper


def _valid_mrp(value: str) -> bool:
    try:
        amount = float(value.replace(",", ".").strip())
        return 0 < amount <= 100000
    except (TypeError, ValueError):
        return False


def _clean_declaration(value: str) -> str:
    value = re.sub(r"\s+", " ", value or "").strip()
    return re.sub(r"^[\s:./\\\-]+", "", value).strip(" :.,;/-")


def _valid_manufacturer(value: str) -> bool:
    if not value:
        return False
    upper = value.upper()
    invalid = ("HOW MAY WE", "REFRESH YOU", "TASTE", "ENJOY", "MORE", "FREE", "OFFER", "DRINK", "MANGO", "FRUIT", "INGREDIENT", "NUTRITION", "CALORIES", "SERVE", "SERVING", "GOODNESS", "QUALITY")
    return 3 <= len(value) <= 150 and not any(x in upper for x in invalid)


def _trademark_brand(lines: List[str]) -> str:
    # "Colin is a registered trademark of Reckitt Benckiser" -> COLIN (OCR often drops letters of "is").
    for line in lines:
        m = re.search(r"(?:®\s*)?([A-Za-z][A-Za-z0-9&' ]{1,24}?)\s+(?:IS|I|1S|lS)\s+A\s+REGISTERED\s+TRADE\s*-?\s*MARK", line, re.I)
        if m and len(m.group(1).split()) <= 3:
            return m.group(1).strip().upper()
    return ""


def _extract_brand(lines: List[str]) -> str:
    combined = " ".join(lines).upper()
    trademark = _trademark_brand(lines)
    if trademark:
        return trademark
    for brand in PRODUCT_BRANDS:
        if re.search(rf"(?<![A-Z]){re.escape(brand)}(?![A-Z])", combined):
            return brand
    for brand in KNOWN_BRANDS:
        if brand in combined:
            return brand
    return ""


def _extract_product_name(lines: List[str], brand: str) -> str:
    # Prefer an explicit known product token even when OCR adds nearby words.
    # For example, FROOTI is the product name while PARLE is the brand.
    for line in lines:
        normalized = re.sub(r"\s+", " ", line).strip().upper()
        if normalized in KNOWN_PRODUCT_NAMES:
            return normalized
        for product in KNOWN_PRODUCT_NAMES:
            if re.search(rf"(?<![A-Z]){re.escape(product)}(?![A-Z])", normalized):
                return product

    def short_word(value: str) -> bool:
        words = value.split()
        return 1 <= len(words) <= 2 and all(re.fullmatch(r"[A-Za-z&]{3,}", w) for w in words) \
            and not re.search(SECTION_HEADINGS, value.upper()) and not _is_promotional(value)

    # Pack titles are often stacked one word per line ("GLASS" / "MULTISURFACE" / "CLEANER").
    joined = []
    for index in range(len(lines)):
        for width in (2, 3):
            part = lines[index:index + width]
            if len(part) == width and all(short_word(p) for p in part):
                text = " ".join(part)
                if any(re.fullmatch(rf"{word}S?", part[-1].upper()) for word in PRODUCT_WORDS):
                    joined.append((index, text))

    candidates = []
    for index, line in [(i, l) for i, l in enumerate(lines)] + joined:
        upper = line.upper()
        is_joined = (index, line) in joined
        if not (3 <= len(line) <= 80) or _is_promotional(line) or _is_declaration(line):
            continue
        if re.search(SECTION_HEADINGS, upper) or line.rstrip().endswith(":") or len(upper.split()) > 8:
            continue
        if re.search(r"TRADE\s*MARK|REGISTERED|\bSEE\b|\bVS\b|ONLY", upper):
            continue
        # Nutrition-table rows ("ADDED SUGARS (g) 24.7").
        if re.search(r"\(\s*(?:G|MG|KCAL|KJ|MCG)\s*\)|\d+\.\d|\bRDA\b|KCAL|SERVING\s+SIZE|PER\s+SERVE", upper):
            continue
        if any(x in upper for x in ("PARLE AGRO", "CONSUMER", "CUSTOMER", "WWW.", "HTTP", "@")) or re.search(r"\d{5,}", upper):
            continue
        # Ingredient/additive text ("FLAVOURING", "COLOUR (INS 110)") is not a product name; "FLAVOURED CAKE" is.
        if re.search(r"\bINS\b|INGREDIENT|\bCOLOURS?\b|FLAVOURING|REGULATOR|STABILI[SZ]ER|ANTIOXIDANT|PRESERVATIVE|EMULSIFIER|%|\bRDA\b", upper):
            continue
        # Allergen statements and ingredient lists ("CONTAINS: WHEAT, EGGS & MILK").
        if re.search(r"CONTAIN|ALLERGEN|\bEGGS?\b|WHEAT|\bSOY|GLUTEN|\bNUTS?\b|SOLIDS", upper) or upper.count(",") >= 2:
            continue
        # Company names, addresses and licence lines.
        if re.search(r"\b(?:PVT|LTD|LLP|LIMITED|PRIVATE|BAKERS|BAKERIES|INDUSTRIES|ESTATE|ROAD|NAGAR|LIC|CATEGORY|PROPRIETARY)\b", upper):
            continue
        score = (1 if index < 15 else 0) + (2 if 4 <= len(line) <= 50 else 0) + (1 if len(line.split()) <= 8 else 0)
        score += 5 if any(re.search(rf"\b{word}S?\b", upper) for word in PRODUCT_WORDS) else 0
        score += 5 if brand and brand.upper() in upper else 0
        # A descriptive name ("HAPPY HAPPY MAWA FLAVOURED CAKE") beats a lone category word ("CAKES").
        words = len(upper.split())
        score += 2 if 2 <= words <= 8 else 0
        score -= 3 if words == 1 and any(re.fullmatch(rf"{word}S?", upper.strip()) for word in PRODUCT_WORDS) else 0
        score -= 1 if is_joined else 0
        candidates.append((score, line))
    if not candidates:
        return brand
    candidates.sort(key=lambda x: (-x[0], len(x[1])))
    best = candidates[0][1]
    # OCR often returns both a clipped and a full read ("HAPPY MAWA ... CAKE" / "HAPPY HAPPY MAWA ... CAKE").
    for score, candidate in candidates:
        if score == candidates[0][0] and len(candidate) > len(best) and best.upper() in candidate.upper():
            best = candidate
    if brand and brand.upper() not in best.upper() and brand not in KNOWN_BRANDS:
        return f"{brand} {best}".upper()
    if brand and brand.upper() not in best.upper():
        for _, candidate in candidates:
            if re.search(r"\b(?:DRINK|JUICE|BISCUIT|BISCUITS|SNACK|FOOD|WATER)\b", candidate, re.I):
                return f"{brand} {candidate}"
    return best


def _all_lines(text: str) -> List[str]:
    return [line.strip() for line in _normalise_text(text).splitlines() if line.strip()]


def _extract_mrp(text: str, ocr_items: Optional[Iterable[Dict[str, Any]]] = None) -> str:
    """Extract MRP using the explicit MRP declaration and spatial OCR evidence.

    Important: OCR text from multiple package images is combined. Never let a
    number from another image win simply because it appears later/earlier in
    the combined text. Prefer a numeric candidate on the same image as the
    MRP label, close to that label, with currency/decimal evidence.
    """
    items = _candidate_items(ocr_items)

    def numeric_candidates(value: str):
        # Unit sale price ("₹0.32 per ml", "(₹0.29/g)", "USP: ₹0.07/ml") is not the MRP.
        value = re.sub(r"(?:USP\s*:?\s*)?(?:₹|RS\.?|F|T)?\s*\d+(?:[.,]\d+)?\s*(?:/|PER)\s*(?:ML|G|GM|GMS|KG|L|LTR|UNIT|PC|PCS|PIECE)\b",
                       " ", value, flags=re.I)
        value = value.replace("₹", " ").strip()
        found = []
        for pattern, priority in (
            (r"(?:₹|RS\.?|INR|RUP(?:EES)?)\s*([0-9]{1,6}(?:[.,][0-9]{1,2})?)", 120),
            (r"(?<![0-9])([0-9]{1,6}[.,][0-9]{1,2})(?![0-9])", 105),
        ):
            for m in re.finditer(pattern, value, re.I):
                amount = m.group(1).replace(",", ".")
                if _valid_mrp(amount):
                    found.append((amount, priority))
        return found

    # --- Preferred path: bounding-box aware extraction -----------------
    labels = [
        item for item in items
        if re.search(r"\bMRP\b|M\.?R\.?P|MAXIMUM\s+RETAIL", str(item.get("text", "")), re.I)
        and not _is_panel_reference(str(item.get("text", "")))
    ]

    candidates = []
    for label in labels:
        # The price is often in the same OCR line as the label: "MRP (INCL. OF ALL TAXES) Rs. 10.00".
        label_text = str(label.get("text", ""))
        tail = re.split(r"\bMRP\b|M\.?R\.?P|MAXIMUM\s+RETAIL\s+PRICE", label_text, maxsplit=1, flags=re.I)[-1]
        for amount, priority in numeric_candidates(tail):
            candidates.append((float(priority + 80), amount, float(label.get("confidence", 0) or 0), 0.0, label.get("image_id")))

    for label in labels:
        lx, ly = _center(label)
        label_image = label.get("image_id")
        for item in items:
            if item is label:
                continue
            value_text = str(item.get("text", "")).strip()
            if not value_text:
                continue
            # A candidate from another uploaded package image must never win.
            if label_image and item.get("image_id") and item.get("image_id") != label_image:
                continue
            if _is_date(value_text) or _looks_quantity(value_text) or _looks_phone(value_text) or _looks_email(value_text):
                continue
            # Stamps combine price and batch ("79.00, HVG665"), so letter+digit codes are fine here.
            if _looks_code_or_nutrition(value_text, allow_codes=True) or _date_candidates(value_text):
                continue

            numeric = numeric_candidates(value_text)
            # A price stamped next to the batch/date is stronger evidence than a stray number.
            stamp_bonus = 12 if re.search(r"[A-Z]{2,}\d{3,}", value_text.upper()) else 0
            numeric = [(amount, priority + stamp_bonus) for amount, priority in numeric]
            if not numeric:
                # OCR may return a bare integer such as "10". Accept it only when the
                # whole item is that number, near an explicit MRP label.
                m = re.fullmatch(r"\s*(?:₹|RS\.?)?\s*([0-9]{1,5})\s*(?:/-)?\s*", value_text, re.I)
                if m and _valid_mrp(m.group(1)):
                    numeric.append((m.group(1), 70))

            if not numeric:
                continue

            cx, cy = _center(item)
            dx = abs(cx - lx)
            dy = cy - ly
            distance = (dx * dx + dy * dy) ** 0.5
            confidence = float(item.get("confidence", 0) or 0)

            # Packaging normally prints the value to the right/below the MRP
            # declaration. Nearby values get a strong spatial advantage.
            direction_bonus = 18 if (-80 <= dy <= 650 and dx <= 900) else -20
            proximity = max(0.0, 35.0 - distance / 35.0)

            for amount, priority in numeric:
                score = priority + direction_bonus + proximity + min(confidence, 100) * 0.10
                candidates.append((score, amount, confidence, distance, label_image))

    if candidates:
        candidates.sort(key=lambda x: x[0], reverse=True)
        value = candidates[0][1]
        return value.replace(",", ".") if "." in value else f"{float(value):.2f}"

    # --- Text-only fallback --------------------------------------------
    # Used only when bounding boxes did not contain an explicit MRP label.
    lines = _all_lines(text)
    for i, line in enumerate(lines):
        if not re.search(r"\bMRP\b|M\.?R\.?P|MAXIMUM\s+RETAIL", line, re.I) or _is_panel_reference(line):
            continue
        candidates = []
        for j in range(max(0, i - 2), min(len(lines), i + 5)):
            candidate_line = lines[j]
            if _looks_code_or_nutrition(candidate_line, allow_codes=True) or (j != i and _date_candidates(candidate_line)):
                continue
            for amount, priority in numeric_candidates(candidate_line):
                candidates.append((priority - abs(j - i) * 8 - (6 if j < i else 0), amount))
        if candidates:
            candidates.sort(reverse=True)
            value = candidates[0][1]
            return value.replace(",", ".") if "." in value else f"{float(value):.2f}"
    return ""

QTY_PATTERN = r"(\d+(?:\.\d+)?)\s*(ml|l|ltr|litres?|g|gm|gms|kg|mg|pcs|n)\b"
NET_LABEL = r"\bNETT?\b\.?\s*(?:QUANTITY|QTY|WT|WEIGHT|VOL(?:UME)?|CONTENTS?|MASS)?"
UNIT_ALIASES = {"gm": "g", "gms": "g", "ltr": "l", "litre": "l", "litres": "l"}


def _qty_values(line: str) -> List[str]:
    if re.search(r"SERV|PER\s*\d|PER\s+(?:ML|G|KG|L)\b|/\s*(?:ML|G|KG)\b|%|ENERGY|KCAL", line, re.I):
        return []
    combo = re.search(r"(\d+(?:\.\d+)?)\s*(ml|g)\s*\+\s*(\d+(?:\.\d+)?)\s*\2", line, re.I)
    if combo:
        total = float(combo.group(1)) + float(combo.group(3))
        return [f"{total:g}{combo.group(2).lower()}"]
    values = []
    for m in re.finditer(QTY_PATTERN, line, re.I):
        unit = m.group(2).lower()
        values.append(f"{float(m.group(1)):g}{UNIT_ALIASES.get(unit, unit)}")
    return values


def _extract_quantity(text: str) -> str:
    lines = _all_lines(text)
    for i, line in enumerate(lines):
        if not re.search(NET_LABEL, line, re.I):
            continue
        # Same line first ("250 ml net", "NET WT. 35 g"), then the following lines, then the previous ones.
        window = [i] + list(range(i + 1, min(len(lines), i + 4))) + list(range(i - 1, max(-1, i - 3), -1))
        # A bundle such as "(125ml+25ml More)" states the total; a clipped "(125ml" read must not win over it.
        for j in window:
            if re.search(r"\d\s*(?:ml|g)\s*\+\s*\d", lines[j], re.I):
                return _qty_values(lines[j])[0]
        for j in window:
            values = _qty_values(lines[j])
            if values:
                return values[0]
    # No NET label read: accept a standalone quantity only when the pack shows exactly one.
    standalone = {v for line in lines if re.fullmatch(r"\(?\s*" + QTY_PATTERN + r"\s*\)?", line.strip(), re.I) for v in _qty_values(line)}
    return standalone.pop() if len(standalone) == 1 else ""


def _date_candidates(text: str) -> List[str]:
    result = []
    patterns = [
        # OCR may concatenate a two-digit year and HH:MM:SS: 21/08/2612:37:49
        r"(?<!\d)(\d{1,2})[./-](\d{1,2})[./-](\d{2})(?:\d{2}):\d{2}(?::\d{2})?",
        r"(?<!\d)(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})(?!\d)",
        # Stamped dates run into the next field, e.g. "16/02/271" from "16/02/27 USP".
        r"(?<!\d)(\d{1,2})[./-](\d{1,2})[./-](\d{2})\d(?!\d)",
    ]
    for pattern in patterns:
        for m in re.finditer(pattern, text or ""):
            d, mo, y = int(m.group(1)), int(m.group(2)), int(m.group(3))
            if 1 <= d <= 31 and 1 <= mo <= 12 and (0 <= y <= 99 or 2000 <= y <= 2100):
                value = f"{d:02d}/{mo:02d}/{y:02d}" if y < 100 else f"{d:02d}/{mo:02d}/{y}"
                if value not in result:
                    result.append(value)

    upper = (text or "").upper()
    # "05 DEC 2025" / "05-DEC-25"
    for m in re.finditer(r"(?<!\d)(\d{1,2})[\s./-]*(" + MONTHS + r")(?![A-Z])[\s.'/-]*(\d{4}|\d{2})(?!\d)", upper):
        d, mo, y = int(m.group(1)), _month_number(m.group(2)), int(m.group(3))
        if 1 <= d <= 31 and _plausible_year(y):
            value = f"{d:02d}/{mo:02d}/{y % 100:02d}"
            if value not in result:
                result.append(value)
    if result:
        return result

    # Month/year only, common on non-food packs: "12/25", "12/2025", "DEC 2025", "12/2520:19" (date + time).
    for pattern in (r"(?<![\d/.-])(\d{1,2})[/-](\d{4}|\d{2})(?![\d/.-])",
                    r"(?<![\d/.-])(\d{1,2})/(\d{2})\d{2}:\d{2}",
                    r"(?<![\d/.-])(\d{1,2})\.(20\d{2})(?![\d.])"):
        for m in re.finditer(pattern, upper):
            mo, y = int(m.group(1)), int(m.group(2))
            if 1 <= mo <= 12 and _plausible_year(y):
                value = f"{mo:02d}/{y % 100:02d}"
                if value not in result:
                    result.append(value)
    for m in re.finditer(r"\b(" + MONTHS + r")(?![A-Z])[\s.'/-]*(\d{4}|\d{2})(?!\d)", upper):
        y = int(m.group(2))
        if _plausible_year(y):
            value = f"{_month_number(m.group(1)):02d}/{y % 100:02d}"
            if value not in result:
                result.append(value)
    return result


MONTH_ABBR = ("JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC")
MONTHS = ("JAN(?:UARY)?|FEB(?:RUARY)?|MAR(?:CH)?|APR(?:IL)?|MAY|JUNE?|JULY?|AUG(?:UST)?|SEPT?(?:EMBER)?|"
          "OCT(?:OBER)?|NOV(?:EMBER)?|DEC(?:EMBER)?")


def _month_number(name: str) -> int:
    return MONTH_ABBR.index(name[:3].upper()) + 1


def _plausible_year(year: int) -> bool:
    # Packaging dates: 2015-2045. Rejects nutrition values such as "1.75" or "4/8".
    return 15 <= year <= 45 or 2015 <= year <= 2045


def _add_months(date_value: str, months: int) -> str:
    parts = [int(p) for p in date_value.split("/")]
    if len(parts) == 3:
        d, mo, y = parts
    elif len(parts) == 2:
        d, (mo, y) = None, parts
    else:
        return ""
    total = (y % 100) * 12 + (mo - 1) + months
    y2, mo2 = divmod(total, 12)
    return f"{d:02d}/{mo2 + 1:02d}/{y2:02d}" if d else f"{mo2 + 1:02d}/{y2:02d}"


def _relative_use_by(text: str, manufacturing_date: str) -> str:
    """ "Best before 24 months from manufacture" -> mfg date + 24 months."""
    m = re.search(r"(?:BEST\s+BEFORE|USE\s+BY|EXPIRY|SHELF\s+LIFE)\D{0,25}?(\d{1,3})\s*(MONTHS?|YEARS?|DAYS?)", text or "", re.I)
    if not m:
        return ""
    amount, unit = int(m.group(1)), m.group(2).upper()
    if manufacturing_date and not unit.startswith("DAY"):
        return _add_months(manufacturing_date, amount * (12 if unit.startswith("YEAR") else 1))
    return f"{amount} {unit.title()} from manufacture"

MFG_DATE_LABEL = r"MFG\.?\s*DATE|MFD\b|MANUFACT(?:URE|URED|URING)|\bPKD\b|PACKED\s+ON"
EXPIRY_DATE_LABEL = r"USE\s*BY|EXPIRY|\bEXP\b|BEST\s*BEFORE"


def _extract_date(text: str, label_pattern: str, other_label: str) -> str:
    lines = _all_lines(text)
    for i, line in enumerate(lines):
        label = re.search(label_pattern, line, re.I)
        if not label:
            continue
        # A combined label such as "MFG. DATE & LOT NO.: USE BY DATE:" is followed by the dates in label order.
        other = re.search(other_label, line, re.I)
        position = 1 if other and other.start() < label.start() else 0

        # Same line first, then lines after the label, then before; never a line owned by the other date label.
        forward = 13 if other else 9
        order = [i] + list(range(i + 1, min(len(lines), i + forward))) + list(range(i - 1, max(-1, i - 5), -1))
        dates: List[str] = []
        for j in order:
            if j != i and re.search(other_label, lines[j], re.I):
                continue
            for value in _date_candidates(lines[j]):
                if value not in dates:
                    dates.append(value)
            if other is None and dates:
                return dates[0]
        if other is not None and len(dates) > position:
            return dates[position]
        if dates and position == 0:
            return dates[0]
    return ""


def _extract_manufacturing_date(text: str) -> str:
    return _extract_date(text, MFG_DATE_LABEL, EXPIRY_DATE_LABEL)


def _extract_use_by_date(text: str) -> str:
    return _extract_date(text, EXPIRY_DATE_LABEL, MFG_DATE_LABEL)


def _candidate_items(ocr_items: Optional[Iterable[Dict[str, Any]]]) -> List[Dict[str, Any]]:
    items = list(ocr_items or [])
    return [x for x in items if str(x.get("text", "")).strip()]


def _center(item: Dict[str, Any]) -> Tuple[float, float]:
    box = item.get("box") or []
    if len(box) < 4:
        return (0.0, 0.0)
    return (sum(float(p[0]) for p in box) / len(box), sum(float(p[1]) for p in box) / len(box))


def _distance(a, b) -> float:
    ax, ay = _center(a); bx, by = _center(b)
    return ((ax-bx)**2 + (ay-by)**2) ** 0.5


def _is_date(value: str) -> bool:
    return bool(re.fullmatch(r"\d{1,2}[./-]\d{1,2}[./-]\d{2,4}(?::\d{2}){0,2}", value.strip()))


def _looks_quantity(value: str) -> bool:
    return bool(re.search(r"^\(?\d+(?:\.\d+)?\s*(?:ml|l|ltr|g|kg|mg)\)?$", value.strip(), re.I))


def _looks_phone(value: str) -> bool:
    digits = re.sub(r"\D", "", value)
    return 8 <= len(digits) <= 15


def _looks_email(value: str) -> bool:
    return bool(re.search(r"@.+\.", value))


def _is_panel_reference(value: str) -> bool:
    # "MRP ... SEE TOP PANEL" points elsewhere; it is not a price declaration.
    return bool(re.search(r"\bSEE\b|\bREFER\b|\bPANEL\b|PRINTED\s+ON", value, re.I))


NUTRITION_TERMS = ("KCAL", "KJ", "RDA", "ENERGY", "PROTEIN", "CARBOHYDRATE", "SUGAR", "FAT", "SODIUM", "SERVING", "SERVE", "INGREDIENT", "INS ")


def _looks_code_or_nutrition(value: str, allow_codes: bool = False) -> bool:
    upper = str(value or "").upper()
    if any(term in upper for term in NUTRITION_TERMS) or "%" in upper:
        return True
    # Registration / licence numbers such as 80-13-009-07-AAACP84166-22.
    if len(re.findall(r"[-/]", upper)) >= 3:
        return True
    return not allow_codes and bool(re.search(r"[A-Z]{3,}\d{3,}", upper))


INDIAN_STATES = (
    "NADU", "PRADESH", "MAHARASHTRA", "KARNATAKA", "GUJARAT", "KERALA", "BENGAL", "UTTARAKHAND", "HARYANA",
    "PUNJAB", "RAJASTHAN", "TELANGANA", "DELHI", "ODISHA", "ORISSA", "BIHAR", "ASSAM", "GOA", "JHARKHAND",
    "CHHATTISGARH", "HIMACHAL", "KASHMIR", "SIKKIM", "TRIPURA", "MEGHALAYA", "MANIPUR", "PUDUCHERRY",
)


def _looks_address(value: str) -> bool:
    u = value.upper()
    if re.search(r"\b(?:ROAD|RD|STREET|ST|NAGAR|ANDHERI|PARSIWADA|PLOT|INDUSTRIAL|INDL|ESTATE|EAST|WEST|NORTH|SOUTH|"
                 r"PIN|DISTRICT|DIST|TALUK|TALUKA|CITY|COMPLEX|SIPCOT|MIDC|PHASE|SECTOR|FLOOR|TOWER|PARK|VILLAGE|"
                 r"HIGHWAY|MARG|LANE|BUILDING|UNIT)\b", u):
        return True
    # State name next to a six-digit PIN code: "Tamil Nadu-635126".
    return any(state in u for state in INDIAN_STATES) or bool(re.search(r"[A-Z]\s*-\s*\d{6}\b", u))


def _batch_tokens(value: str) -> List[str]:
    """Return compact alphanumeric tokens that can plausibly be batch/lot IDs."""
    text = str(value or "").upper()
    # OCR may insert spaces/hyphens inside a stamped code. Keep normal tokens
    # first, then allow a compact form only when the surrounding text is short.
    raw_tokens = re.findall(r"[A-Z0-9][A-Z0-9/_-]{4,24}", text)
    tokens: List[str] = []
    # Stamped codes are often split by OCR at a space ("BN HY026233"); keep the joined form too.
    parts = text.split()
    if 2 <= len(parts) <= 3 and all(re.fullmatch(r"[A-Z0-9]+", p) for p in parts):
        joined = _fix_code_digits("".join(parts))
        if 6 <= len(joined) <= 20:
            tokens.append(joined)
    for token in raw_tokens:
        compact = _fix_code_digits(re.sub(r"[^A-Z0-9-]", "", token))
        if 6 <= len(compact) <= 20:
            tokens.append(compact)
    return tokens


def _fix_code_digits(token: str) -> str:
    # In "letters + digits" codes OCR often reads 0 as O and 1 as I/L inside the digit run: BNHYO26233 -> BNHY026233.
    m = re.fullmatch(r"([A-Z]{2,8}?)([0-9OIL]*[0-9][0-9OIL]*)", token)
    if not m or len(re.findall(r"\d", m.group(2))) < 3:
        return token
    return m.group(1) + m.group(2).translate(str.maketrans("OIL", "011"))


def _batch_token_score(token: str, source: str = "") -> float:
    """Score a batch token by the shape normally used for stamped lot codes."""
    t = token.upper()
    compact = re.sub(r"[^A-Z0-9]", "", t)
    if not (6 <= len(compact) <= 20):
        return -999.0

    # Strongly reject nutrition/ingredient codes and prose.
    if re.fullmatch(r"(?:INS|NS)\d{2,5}", compact):
        return -999.0
    if re.fullmatch(r"E\d{2,4}", compact):
        return -999.0
    if re.fullmatch(r"\d+(?:KCAL|KJ|MG|ML|G|KG|L|LTR)", compact):
        return -999.0
    blocked = (
        "MANUFACTURING", "MANUFACTURED", "MANUFACTURER", "ADDRESS", "UNIT",
        "COMPANY", "PARLEAGRO", "PRIVATE", "LIMITED", "INGREDIENT",
        "NUTRITION", "ACIDITY", "REGULATORS", "CONSUMER", "CUSTOMER",
        "PACKAGING", "PACKED", "IMPORTED", "DRINK", "MANGO", "MORE",
    )
    if any(term in compact for term in blocked):
        return -999.0

    # Do not accept tokens coming from percentage/ingredient/nutrition lines.
    source_upper = str(source or "").upper()
    if "%" in source_upper or any(term in source_upper for term in ("INGREDIENT", "ACIDITY", "NUTRITION", "CALORIES", "KCAL", "RDA", "ENERGY", "DIET")):
        return -999.0

    letters = len(re.findall(r"[A-Z]", compact))
    digits = len(re.findall(r"\d", compact))
    if letters == 0 or digits == 0:
        return -999.0

    score = 30.0
    # This is the strongest pattern for the observed FROOTI lot code:
    # letters followed by a numeric sequence, e.g. BNHY026233.
    if re.fullmatch(r"[A-Z]{2,8}\d{3,10}", compact):
        score += 55.0
    elif re.fullmatch(r"[A-Z0-9]{6,20}", compact):
        score += 20.0

    if 8 <= len(compact) <= 14:
        score += 8.0
    if 3 <= digits <= 10:
        score += 5.0
    return score


def _looks_batch(value: str) -> bool:
    original = str(value or "").strip()
    if _is_date(original) or _looks_quantity(original) or _looks_phone(original) or _looks_email(original):
        return False
    return any(_batch_token_score(token, original) > 0 for token in _batch_tokens(original))


def _best_batch_token(value: str) -> Tuple[str, float]:
    candidates = []
    for token in _batch_tokens(value):
        score = _batch_token_score(token, value)
        if score > 0:
            candidates.append((score, token))
    if not candidates:
        return "", 0.0
    candidates.sort(key=lambda x: (-x[0], -len(x[1])))
    return candidates[0][1], candidates[0][0]


def _extract_batch(text: str, ocr_items: Optional[Iterable[Dict[str, Any]]] = None) -> Tuple[str, float, List[Dict[str, Any]]]:
    items = _candidate_items(ocr_items)
    label_items = [
        x for x in items
        if re.search(r"\b(?:BATCH|LOT)\b|BATCH\s*(?:NO|NUMBER)|LOT\s*(?:NO|NUMBER)", x["text"], re.I)
    ]
    candidates: List[Tuple[float, str, Dict[str, Any]]] = []

    # 0) Tabular layouts print the code directly under or beside a "BATCH:" label, e.g.
    #    PKD.: | BATCH: | USE BY:   over   14/8/26 | W3 B | 12/12/26.
    #    Short codes are allowed only in this slot, where the position is strong evidence.
    for label in label_items:
        if len(re.sub(r"[^A-Z]", "", str(label["text"]).upper())) > 12:
            continue
        box = label.get("box") or []
        if len(box) < 4:
            continue
        x1, y1 = min(p[0] for p in box), min(p[1] for p in box)
        x2, y2 = max(p[0] for p in box), max(p[1] for p in box)
        lw, lh = max(1.0, x2 - x1), max(1.0, y2 - y1)
        lcy = (y1 + y2) / 2
        for item in items:
            if item is label or (label.get("image_id") and item.get("image_id") != label.get("image_id")):
                continue
            value = re.sub(r"\s+", " ", str(item["text"])).strip()
            compact = re.sub(r"[^A-Z0-9]", "", value.upper())
            if not (2 <= len(compact) <= 14) or not re.search(r"\d", compact) or ":" in value:
                continue
            if _date_candidates(value) or _looks_quantity(value) or re.search(r"[₹$]|\bRS\b|\d+[.,]\d{2}\b", value, re.I):
                continue
            if re.search(r"\d\s*(?:G|KG|MG|ML|L|LTR|KCAL|KJ)\b|\bPER\b|^PER", value.upper()) or _looks_code_or_nutrition(value):
                continue
            cx, cy = _center(item)
            below = x1 - 1.5 * lw <= cx <= x2 + 1.5 * lw and y2 < cy <= y2 + 4 * lh
            right = cx > x2 and abs(cy - lcy) < lh and cx - x2 < 6 * lw
            if not (below or right):
                continue
            dist = ((cx - (x1 + x2) / 2) ** 2 + (cy - lcy) ** 2) ** 0.5
            score = 150.0 + float(item.get("confidence", 0) or 0) * 0.5 - dist / 20.0
            candidates.append((score, value.upper(), item))

    # 1) First inspect the label itself. OCR may return "MFG DATE & LOT NO BNHY026233"
    # as one text item, so the code can be present inside the label item.
    for label in label_items:
        token, token_score = _best_batch_token(str(label["text"]))
        if token:
            candidates.append((125.0 + token_score, token, label))

    # 2) Look around explicit BATCH/LOT labels. Extract a token from the OCR item,
    # rather than treating the whole line as a batch code.
    for label in label_items:
        lx, ly = _center(label)
        label_image = label.get("image_id")
        for item in items:
            if item is label:
                continue
            value = str(item["text"]).strip()
            token, token_score = _best_batch_token(value)
            if not token:
                continue
            if label_image and item.get("image_id") and item.get("image_id") != label_image:
                continue
            dist = _distance(label, item)
            if dist > 900:
                continue
            if _looks_address(value):
                continue
            score = 85.0 + token_score + max(0.0, 30.0 - dist / 30.0)
            # Batch codes are stamped together with the price/date ("₹79.00, HVG665").
            if re.search(r"\d+[.,]\d{2}\b|₹", value) or _date_candidates(value):
                score += 15.0
            candidates.append((score, token, item))

    # 3) If there is no explicit label, use the manufacturing-date region,
    # but strongly prefer compact stamped-code shapes over ingredient text.
    if not candidates:
        date_items = [x for x in items if _date_candidates(x["text"])]
        for date_item in date_items:
            for item in items:
                if item is date_item:
                    continue
                value = str(item["text"]).strip()
                token, token_score = _best_batch_token(value)
                if not token or _looks_address(value):
                    continue
                dist = _distance(date_item, item)
                if dist > 500:
                    continue
                score = 45.0 + token_score + max(0.0, 25.0 - dist / 25.0)
                candidates.append((score, token, item))

    if candidates:
        candidates.sort(key=lambda x: (-x[0], -float(x[2].get("confidence", 0) or 0)))
        score, value, item = candidates[0]
        return value, min(99.0, max(0.0, score)), [item]

    return "", 0.0, []

def _extract_labelled(text: str, patterns: str) -> str:
    match = re.search(patterns + r"\s*[:.-]?\s*([^\n]+)", text, re.I)
    return _clean_declaration(match.group(1)) if match else ""


def _extract_manufacturer(text: str, lines: List[str], brand: str = "") -> str:
    value = _extract_labelled(text, r"(?:MANUFACTURED\s+BY|MFD\.?\s+BY|MFG\.?\s+BY|MANUFACTURER)")
    if _valid_manufacturer(value) and re.search(r"[A-Z]{3,}", value.upper()):
        return value
    candidates = []
    for line in lines:
        # "Colin is a registered trademark of Reckitt Benckiser (India) Pvt. Ltd." -> the company.
        line = re.sub(r"^.*?TRADE\s*-?\s*MARK\s+(?:OF|UNDER\s+LICEN[CS]E\s+FROM)\s+", "", line, flags=re.I)
        line = re.sub(r"^.*?(?:MARKETED|MFD|MANUFACTURED|PACKED)\s*(?:BY|FOR)\s*[:.-]?\s*", "", line, flags=re.I)
        upper = line.upper()
        if "PARLE AGRO" in upper or re.search(r"\b(?:PVT|PT|LTD|LLP|LIMITED|PRIVATE|INDUSTRIES|FOODS|BEVERAGES|BAKERS|BAKERIES|COMPANY|CORPORATION|CORP)\b", upper):
            if not _is_promotional(line) and _valid_manufacturer(line):
                candidates.append(line)
    if not candidates:
        return ""
    # With several contract units listed, the brand owner line is the safest single answer.
    owned = [c for c in candidates if brand and brand.upper() in c.upper() and not _unit_code(c)]
    return min(owned, key=len) if owned else max(candidates, key=len)


PHONE_PATTERNS = (
    r"1800[\s-]*\d{2,4}[\s-]*\d{3,4}(?:[\s-]*\d{1,4})?",   # toll free
    r"(?:\+?91[\s-]*)?[6-9]\d{4}[\s-]*\d{5}",              # mobile
    r"0\d{2,4}[\s-]*\d{6,8}",                               # landline with STD code
)


def _extract_phone(lines: List[str]) -> str:
    label = r"CALL|PHONE|\bTEL\b|TOLL|HELP\s*LINE|CARE|CONTACT\s*(?:NO|NUMBER|US)|\bMOB|WHATSAPP"
    for require_label in (True, False):
        for line in lines:
            upper = line.upper()
            if re.search(r"\bLIC|FSSAI|REG|BARCODE|BATCH", upper):
                continue
            if require_label and not re.search(label, upper):
                continue
            for pattern in PHONE_PATTERNS:
                m = re.search(r"(?<!\d)" + pattern + r"(?!\d)", line)
                if not m:
                    continue
                digits = re.sub(r"\D", "", m.group(0))
                # Unlabelled numbers are accepted only when they are toll-free numbers.
                if 10 <= len(digits) <= 13 and (require_label or digits.startswith("1800")):
                    return re.sub(r"\s+", " ", m.group(0)).strip(" -")
    return ""


def _unit_code(line: str) -> str:
    m = re.match(r"\s*\(([A-Z][0-9]|[0-9][A-Z]|[A-Z]{2})\)\s*[-:]?\s*[A-Z]", line.upper())
    return m.group(1) if m else ""


def _resolve_unit_from_batch(batch: str, lines: List[str]) -> Tuple[str, str]:
    """Packs list contract units as "(W3)-LAKSHMIBALAJI BAKERS ..." and state that the first two
    characters of the batch identify the unit. Returns (unit line, corrected batch)."""
    units = {}
    for line in lines:
        code = _unit_code(line)
        if code and re.search(r"[A-Z]{3,}", line.upper()[4:]):
            units.setdefault(code, re.sub(r"^\s*\([A-Z0-9]{2}\)\s*[-:]?\s*", "", line.upper()).strip())
    compact = re.sub(r"[^A-Z0-9]", "", batch.upper())
    if not units or len(compact) < 2:
        return "", batch
    prefix = compact[:2]
    if prefix in units:
        return units[prefix], batch
    # Stamped dot-matrix letters are easily misread (W->N, 0->O); accept a single-character
    # mismatch only when exactly one listed unit code fits.
    near = [code for code in units if sum(a != b for a, b in zip(code, prefix)) == 1]
    if len(near) == 1:
        fixed = batch.upper().replace(prefix[0], near[0][0], 1) if prefix[0] != near[0][0] else batch.upper().replace(prefix[1], near[0][1], 1)
        return units[near[0]], fixed
    return "", batch


def _extract_packer(text: str) -> str:
    value = _extract_labelled(text, r"(?:PACKED\s+BY|PACKAGING\s+BY|PACKER)")
    return "" if value.upper() in {"PER", "PFR", "SIG"} else value


def _extract_importer(text: str) -> str:
    return _extract_labelled(text, r"(?:IMPORTED\s+BY|IMPORTER)")


def _extract_origin(text: str) -> str:
    # Bare "ORIGIN" also appears in ingredients ("EMULSIFIERS OF VEGETABLE ORIGIN").
    value = _clean_declaration(_extract_labelled(text, r"(?:COUNTRY\s+OF\s+ORIGIN|MADE\s+IN)"))
    if not value or len(value) > 40 or re.search(r"\d", value):
        return ""
    return value


def _field_confidence(fields: Dict[str, Any], ocr_confidence: float = 0.0, batch_confidence: float = 0.0, qr_details: Optional[Dict[str, Any]] = None) -> Dict[str, float]:
    base = max(0.0, min(98.0, float(ocr_confidence or 0.0)))
    result = {key: round(base, 2) if value else 0.0 for key, value in fields.items() if key != "raw_text"}
    for key, value in fields.items():
        if not value or key == "raw_text":
            continue
        if key == "batch_lot" and batch_confidence:
            result[key] = round(min(99.0, batch_confidence), 2)
        elif key in {"mrp", "net_quantity", "manufacturing_date", "use_by_date"}:
            result[key] = round(min(98.0, max(50.0, base + 3.0)), 2)
        elif qr_details and key in {"manufacturer", "packer", "batch_lot"} and key in qr_details:
            result[key] = 96.0
    return result


def extract_fields(text: str, ocr_items: Optional[Iterable[Dict[str, Any]]] = None, qr_details: Optional[Dict[str, Any]] = None, ocr_confidence: float = 0.0) -> Dict[str, Any]:
    text = _normalise_text(text)
    clean = re.sub(r"[ \t]+", " ", text).strip()
    lines = [_clean_line(x) for x in text.splitlines() if _clean_line(x)]
    qr_details = qr_details or {}

    batch, batch_confidence, batch_items = _extract_batch(text, ocr_items)
    brand = _extract_brand(lines)
    unit, batch = _resolve_unit_from_batch(batch, lines) if batch else ("", batch)
    email = re.search(r"([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})", clean, re.I)
    fields = {
        "product_name": _extract_product_name(lines, brand),
        "brand": brand,
        "mrp": _extract_mrp(text, ocr_items=ocr_items),
        "net_quantity": _extract_quantity(text),
        "manufacturer": unit or _extract_manufacturer(text, lines, brand) or qr_details.get("manufacturer", ""),
        "packer": _extract_packer(text) or qr_details.get("packer", ""),
        "importer": _extract_importer(text),
        "batch_lot": batch or qr_details.get("batch_lot", ""),
        "manufacturing_date": _extract_manufacturing_date(text),
        "use_by_date": _extract_use_by_date(text),
        "consumer_email": email.group(1) if email else "",
        "consumer_phone": _extract_phone(lines),
        "country_of_origin": _extract_origin(clean),
        "raw_text": clean,
        "qr_manufacturing_unit": qr_details.get("unit", ""),
        "qr_manufacturing_address": qr_details.get("address", ""),
    }
    # "Best before 24 months from manufacture": the date printed near that sentence is the mfg date.
    relative = _relative_use_by(clean, fields["manufacturing_date"])
    if relative and (not fields["use_by_date"] or fields["use_by_date"] == fields["manufacturing_date"]):
        fields["use_by_date"] = relative
    if not fields["product_name"] and qr_details.get("product"):
        fields["product_name"] = qr_details["product"]
    fields["field_confidence"] = _field_confidence(fields, ocr_confidence, batch_confidence, qr_details)
    fields["batch_evidence_items"] = batch_items
    return fields
