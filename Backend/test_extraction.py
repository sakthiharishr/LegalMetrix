import re


ocr_text = """
MFG. DATE & LOT NO.:USE BY DATE:
BN HYD 26233
21/08/2612:37:49
10.00
MRP (INCL. OF ALL TAXES)
NET QUANTITY
(125ml+25ml More)
"""


def extract_mrp(text):
    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    for i, line in enumerate(lines):
        if re.search(
            r"\bMRP\b|M\.R\.P",
            line,
            re.IGNORECASE
        ):
            start = max(0, i - 3)
            end = min(len(lines), i + 3)

            nearby = lines[start:end]

            for candidate in nearby:
                match = re.search(
                    r"\b(\d+\.\d{1,2})\b",
                    candidate
                )

                if match:
                    value = float(match.group(1))

                    if 0 < value <= 100000:
                        return f"{value:.2f}"

            for candidate in nearby:
                match = re.search(
                    r"\b(\d{1,4})\b",
                    candidate
                )

                if match:
                    value = float(match.group(1))

                    if 0 < value <= 100000:
                        return f"{value:.2f}"

    return "Not detected"


def extract_mfg_date(text):
    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    for i, line in enumerate(lines):
        if re.search(
            r"MFG\.?\s*DATE|MFD|MANUFACT",
            line,
            re.IGNORECASE
        ):
            nearby = " ".join(
                lines[i:i + 4]
            )

            match = re.search(
                r"(\d{1,2})[./-]"
                r"(\d{1,2})[./-]"
                r"(\d{2})(?::\d{2}){0,2}",
                nearby
            )

            if match:
                day = int(match.group(1))
                month = int(match.group(2))
                year = int(match.group(3))

                if (
                    1 <= day <= 31
                    and 1 <= month <= 12
                    and 0 <= year <= 99
                ):
                    return (
                        f"{day:02d}/"
                        f"{month:02d}/"
                        f"{year:02d}"
                    )

            match = re.search(
                r"(\d{1,2})[./-]"
                r"(\d{1,2})[./-]"
                r"(20\d{2})",
                nearby
            )

            if match:
                day = int(match.group(1))
                month = int(match.group(2))
                year = int(match.group(3))

                if (
                    1 <= day <= 31
                    and 1 <= month <= 12
                    and 2000 <= year <= 2100
                ):
                    return (
                        f"{day:02d}/"
                        f"{month:02d}/"
                        f"{year}"
                    )

    return "Not detected"


def extract_quantity(text):
    match = re.search(
        r"NET\s+QUANTITY.*?"
        r"\((\d+(?:\.\d+)?)\s*ml"
        r"\s*\+\s*"
        r"(\d+(?:\.\d+)?)\s*ml",
        text,
        re.IGNORECASE | re.DOTALL
    )

    if match:
        first = float(match.group(1))
        second = float(match.group(2))

        total = first + second

        return f"{int(total)}ml"

    return "Not detected"


print("=" * 50)
print("LEGALMETRIX EXTRACTION TEST")
print("=" * 50)

print(
    "MRP               :",
    extract_mrp(ocr_text)
)

print(
    "Manufacturing Date:",
    extract_mfg_date(ocr_text)
)

print(
    "Net Quantity      :",
    extract_quantity(ocr_text)
)

print("=" * 50)