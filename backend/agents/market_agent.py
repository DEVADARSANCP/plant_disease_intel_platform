"""
[DEPRECATED] agents/market_agent.py
====================================
This file is NO LONGER USED. It is kept only to avoid breaking git history.

All market data is now served from:
  backend/domains/market/market_agent.py  ← CSV-based, pandas-powered

Do NOT import from this file. Use:
  from domains.market import get_market_data, get_price_trend_series, ...
"""
# fmt: off  # noqa — deprecated file, do not lint or import

import httpx
from datetime import date, datetime


AGMARKNET_URL = "https://api.agmarknet.gov.in/v1/dashboard-data/"

# Coordinate lookup for known market IDs (used when lat/lon not provided)
MARKET_COORDS = {
    "100009": (20.0, 73.8),   # Nashik
    "100010": (18.5, 73.9),   # Pune
    "100011": (19.1, 72.9),   # Mumbai
    "100012": (17.4, 78.5),   # Hyderabad
    "100013": (12.9, 77.6),   # Bangalore
    "100014": (13.1, 80.3),   # Chennai
    "100015": (28.6, 77.2),   # Delhi
    "100016": (22.6, 88.4),   # Kolkata
}


async def get_market_data(
    state_id: str = "100006",
    commodity_id: str = "100001",
    market_id: str = "100009",
) -> dict:
    """
    Fetch today's mandi price data from Agmarknet using context parameters.
    Returns structured output including buyer_signal derived from arrival + trend.
    Falls back gracefully if the API is unreachable.
    """
    today = date.today().strftime("%Y-%m-%d")

    params = {
        "dashboard": "marketwise_price_arrival",
        "date": today,
        "group": "[100000]",
        "commodity": f"[{commodity_id}]",
        "variety": "100021",
        "state": state_id,
        "market": f"[{market_id}]",
        "grades": "[4]",
        "limit": "10",
        "format": "json",
    }
    # district is optional — omit to broaden results

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(AGMARKNET_URL, params=params)
            response.raise_for_status()
            raw = response.json()

        return _parse_response(raw, today, state_id, commodity_id, market_id)

    except httpx.HTTPStatusError as e:
        return _error_result(today, state_id, commodity_id, market_id,
                             f"HTTP {e.response.status_code}: {e.response.text[:200]}")
    except httpx.RequestError as e:
        return _error_result(today, state_id, commodity_id, market_id,
                             f"Network error: {str(e)}")
    except Exception as e:
        return _error_result(today, state_id, commodity_id, market_id,
                             f"Unexpected error: {str(e)}")


def _parse_response(raw: dict, today: str, state_id: str, commodity_id: str, market_id: str) -> dict:
    """
    Parse Agmarknet JSON and extract key market metrics.
    Computes price_trend and buyer_signal from arrival + price change.
    """
    records = raw.get("data", [])

    if not records:
        return _error_result(today, state_id, commodity_id, market_id,
                             "No market records returned for today's date.")

    latest = records[0]
    prev   = records[1] if len(records) > 1 else None

    commodity   = (latest.get("commodity_name")
                   or latest.get("Commodity")
                   or f"Commodity {commodity_id}")
    mandi_price = _safe_float(
        latest.get("modal_price") or latest.get("Modal_Price") or latest.get("price")
    )
    arrival = _safe_float(
        latest.get("arrivals") or latest.get("Arrivals") or latest.get("arrival")
    )

    # Price trend
    if prev is not None:
        prev_price = _safe_float(
            prev.get("modal_price") or prev.get("Modal_Price") or prev.get("price")
        )
        price_change = mandi_price - prev_price
        trend = "up" if price_change > 0 else ("down" if price_change < 0 else "stable")
    else:
        prev_price   = mandi_price
        price_change = 0.0
        trend        = "stable"

    # Buyer signal: derived from arrival volume + price direction
    buyer_signal = _compute_buyer_signal(arrival, trend)

    return {
        "commodity":     commodity,
        "mandi_price":   mandi_price,
        "prev_price":    prev_price,
        "price_change":  round(price_change, 2),
        "arrival":       arrival,
        "trend":         trend,
        "buyer_signal":  buyer_signal,
        "state_id":      state_id,
        "commodity_id":  commodity_id,
        "market_id":     market_id,
        "date":          today,
        "source":        "agmarknet",
        "last_updated":  datetime.now().strftime("%Y-%m-%d %I:%M %p"),
        "status":        "success",
    }


def _compute_buyer_signal(arrival: float, trend: str) -> str:
    """
    Derive a buyer activity signal from arrival volume and price trend.
    High arrival + rising price  → Strong Demand
    High arrival + falling price → Oversupply
    Low arrival  + rising price  → Scarcity Premium
    Low arrival  + falling price → Weak Demand
    """
    high_arrival = arrival > 50  # tonnes threshold

    if high_arrival and trend == "up":
        return "Strong Demand"
    elif high_arrival and trend == "down":
        return "Oversupply"
    elif not high_arrival and trend == "up":
        return "Scarcity Premium"
    elif not high_arrival and trend == "down":
        return "Weak Demand"
    else:
        return "Stable"


def _safe_float(value) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def _error_result(today: str, state_id: str, commodity_id: str, market_id: str, reason: str) -> dict:
    return {
        "commodity":    f"Commodity {commodity_id}",
        "mandi_price":  0.0,
        "prev_price":   0.0,
        "price_change": 0.0,
        "arrival":      0.0,
        "trend":        "unknown",
        "buyer_signal": "Unavailable",
        "state_id":     state_id,
        "commodity_id": commodity_id,
        "market_id":    market_id,
        "date":         today,
        "source":       "agmarknet",
        "last_updated": datetime.now().strftime("%Y-%m-%d %I:%M %p"),
        "status":       "error",
        "error":        reason,
    }


def resolve_coords_for_market(market_id: str) -> tuple[float, float]:
    """Return (lat, lon) for a known market_id, defaulting to Nashik."""
    return MARKET_COORDS.get(str(market_id), (20.0, 73.8))
