import json
import re
import socket
import ipaddress
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from typing import Any, Dict, List

import cv2


def _normalise_payload(payload: str) -> Dict[str, Any]:
    payload = (payload or "").strip()
    if not payload:
        return {}

    try:
        value = json.loads(payload)
        if isinstance(value, dict):
            return value
    except Exception:
        pass

    data = {}
    for part in re.split(r"[\n;|]+", payload):
        if "=" in part:
            key, value = part.split("=", 1)
            data[key.strip()] = value.strip()
        elif ":" in part and not re.match(r"^https?://", part, re.I):
            key, value = part.split(":", 1)
            if key.strip() and len(key.strip()) < 60:
                data[key.strip()] = value.strip()
    return data



def _safe_fetch_url(url: str) -> str:
    """Fetch only public HTTP(S) QR destinations with strict limits."""
    try:
        parsed = urlparse(url)
        if parsed.scheme not in {"http", "https"} or not parsed.hostname:
            return ""
        host = parsed.hostname
        for resolved in socket.getaddrinfo(host, None):
            ip = ipaddress.ip_address(resolved[4][0])
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast:
                return ""
        request = Request(url, headers={"User-Agent": "LegalMetrix/2.0"})
        with urlopen(request, timeout=4) as response:
            content_type = (response.headers.get("Content-Type") or "").lower()
            if not any(t in content_type for t in ("text/", "json", "xml")):
                return ""
            data = response.read(1024 * 1024)
            return data.decode("utf-8", errors="ignore")
    except Exception:
        return ""


def enrich_url_payload(payload: str) -> Dict[str, Any]:
    payload = (payload or "").strip()
    if not re.match(r"^https?://", payload, re.I):
        return {}
    content = _safe_fetch_url(payload)
    if not content:
        return {}
    parsed = _normalise_payload(content)
    if parsed:
        return parsed
    # Some traceability pages expose simple key/value declarations in HTML/text.
    text = re.sub(r"<[^>]+>", " ", content)
    return _normalise_payload(text)

def scan_qr(image_path: str) -> List[Dict[str, Any]]:
    image = cv2.imread(image_path)
    if image is None:
        return []

    detector = cv2.QRCodeDetector()
    results = []

    try:
        ok, decoded, points, _ = detector.detectAndDecodeMulti(image)
        if ok and decoded:
            for i, payload in enumerate(decoded):
                payload = (payload or "").strip()
                if not payload:
                    continue
                box = points[i].tolist() if points is not None and i < len(points) else []
                results.append({
                    "payload": payload,
                    "data": _normalise_payload(payload),
                    "box": box,
                    "type": "QR",
                })
    except Exception:
        pass

    if not results:
        try:
            payload, points, _ = detector.detectAndDecode(image)
            payload = (payload or "").strip()
            if payload:
                results.append({
                    "payload": payload,
                    "data": _normalise_payload(payload),
                    "box": points.tolist() if points is not None else [],
                    "type": "QR",
                })
        except Exception:
            pass

    for result in results:
        payload = result.get("payload", "")
        if re.match(r"^https?://", payload, re.I):
            remote = enrich_url_payload(payload)
            if remote:
                result["remote_data"] = remote
                result["data"].update(remote)
    return results


def extract_manufacturing_details(qr_results: List[Dict[str, Any]]) -> Dict[str, str]:
    aliases = {
        "manufacturer": {"manufacturer", "manufacturedby", "manufacturername"},
        "packer": {"packer", "packedby", "packingunit", "packing_unit"},
        "address": {"address", "manufactureraddress", "unitaddress", "plantaddress"},
        "unit": {"unit", "unitname", "factory", "plant", "manufacturingplant", "manufacturingunit", "manufacturing_unit"},
        "batch_lot": {"batch", "batchno", "batchnumber", "lot", "lotno", "lotnumber"},
        "product": {"product", "productname", "commodity", "commodityname"},
    }
    output: Dict[str, str] = {}
    for result in qr_results:
        data = result.get("data") or {}
        for raw_key, value in data.items():
            key = re.sub(r"[^a-z0-9_]", "", str(raw_key).lower())
            value = str(value).strip()
            if not value:
                continue
            for target, names in aliases.items():
                if key in names and target not in output:
                    output[target] = value
    return output
