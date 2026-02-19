"""
Market Transformers — Domain Layer
Shapes market data into frontend-ready response formats.
No API calls, no LLM — pure data transformation.
"""

from datetime import datetime


def to_price_card(enriched: dict) -> dict:
    """Shape enriched market data into a price summary card for the UI."""
    price  = enriched.get("mandi_price", 0.0)
    change = enriched.get("price_change", 0.0)
    trend  = enriched.get("trend", "stable")
    prev   = enriched.get("prev_price", price) or price

    return {
        "commodity":    enriched.get("commodity", "—"),
        "variety":      enriched.get("variety",   "—"),
        "grade":        enriched.get("grade",     "—"),
        "market_name":  enriched.get("market_name", "—"),
        "district":     enriched.get("district",    "—"),
        "state_name":   enriched.get("state_name",  "—"),
        "modal_price":  price,
        "min_price":    enriched.get("min_price", price),
        "max_price":    enriched.get("max_price", price),
        "prev_price":   prev,
        "price_change": change,
        "change_pct":   round((change / prev) * 100, 2) if prev else 0.0,
        "trend":        trend,
        "trend_icon":   "↑" if trend == "up" else ("↓" if trend == "down" else "→"),
        "arrival":      enriched.get("arrival", 0.0),
        "buyer_signal": enriched.get("buyer_signal", "—"),
        "date":         enriched.get("arrival_date", ""),
        "last_updated": enriched.get("last_updated", ""),
        "status":       enriched.get("status", "error"),
    }


def to_chart_series(series: list[dict]) -> dict:
    """
    Transform raw series data into a chart-ready format.
    Returns labels (dates) + price/arrival datasets.
    """
    labels   = [r["date"]    for r in series]
    prices   = [r["price"]   for r in series]
    arrivals = [r["arrival"] for r in series]

    return {
        "labels":  labels,
        "price":   prices,
        "arrival": arrivals,
    }


def to_market_summary(enriched: dict, recommendation: dict | None = None) -> dict:
    """
    Full market intelligence summary combining price card + signals + recommendation.
    This is the top-level response shape for GET /api/market/intelligence.
    """
    card     = to_price_card(enriched)
    momentum = enriched.get("momentum", {})

    return {
        "price_card":     card,
        "momentum":       momentum,
        "recommendation": recommendation or {},
        "context": {
            "state":     enriched.get("state_name"),
            "commodity": enriched.get("commodity"),
            "market":    enriched.get("market_name"),
            "source":    enriched.get("source", "Agmarknet CSV"),
        },
        "generated_at": datetime.now().strftime("%d %b %Y %I:%M %p"),
    }



def to_chart_series(series: list[dict]) -> dict:
    """
    Transform raw series data into a chart-ready format.
    Returns labels (dates) + price/arrival datasets.
    """
    labels   = [r["date"]    for r in series]
    prices   = [r["price"]   for r in series]
    arrivals = [r["arrival"] for r in series]

    return {
        "labels":   labels,
        "price":    prices,
        "arrival":  arrivals,
    }


def to_market_summary(enriched: dict, recommendation: dict | None = None) -> dict:
    """
    Full market intelligence summary combining price card + signals + recommendation.
    This is the top-level response shape for GET /api/market/intelligence.
    """
    card     = to_price_card(enriched)
    momentum = enriched.get("momentum", {})

    return {
        "price_card":     card,
        "momentum":       momentum,
        "recommendation": recommendation or {},
        "context": {
            "state_id":     enriched.get("state_id"),
            "commodity_id": enriched.get("commodity_id"),
            "market_id":    enriched.get("market_id"),
        },
        "generated_at": datetime.now().strftime("%Y-%m-%d %I:%M %p"),
    }
