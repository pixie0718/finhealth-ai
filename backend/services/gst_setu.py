"""
GST SETU integration — fetch REAL GST return data from the government API.

If GST_SETU_API_KEY is configured and the call succeeds, live GST data is used and
tagged as REAL. Otherwise the platform transparently falls back to its deterministic
synthetic profile (tagged SANDBOX), so scoring always works in a demo.
"""
import os
from typing import Optional
import httpx

GST_SETU_BASE = os.environ.get("GST_SETU_BASE_URL", "https://api.gstsetu.in")


def is_configured() -> bool:
    return bool(os.environ.get("GST_SETU_API_KEY"))


def fetch_real_gst_data(gstin: str) -> Optional[dict]:
    """Return live GST summary for a GSTIN, or None if unavailable (caller falls back)."""
    api_key = os.environ.get("GST_SETU_API_KEY")
    if not api_key:
        return None
    try:
        with httpx.Client(timeout=5.0) as client:
            resp = client.get(
                f"{GST_SETU_BASE}/returns/monthly",
                params={"gstin": gstin},
                headers={"X-API-Key": api_key},
            )
        if resp.status_code == 200:
            data = resp.json()
            return {
                "source": "REAL (GST SETU)",
                "monthly_revenues": data.get("turnover_monthly"),
                "compliance_rate": (data.get("compliance_percentage") or 0) / 100,
                "tax_paid": data.get("tax_paid"),
            }
    except Exception:
        pass
    return None


def gst_provenance(gstin: str) -> dict:
    """Report whether a real GST fetch is available for this GSTIN (drives the UI badge)."""
    if not is_configured():
        return {"source": "SYNTHETIC", "mode": "SANDBOX", "live": False,
                "note": "GST SETU not configured — using deterministic synthetic data."}
    real = fetch_real_gst_data(gstin)
    if real:
        return {"source": "REAL (GST SETU)", "mode": "LIVE", "live": True,
                "note": "Live GST return data fetched from GST SETU."}
    return {"source": "SYNTHETIC", "mode": "SANDBOX", "live": False,
            "note": "GST SETU unreachable — fell back to synthetic data."}
