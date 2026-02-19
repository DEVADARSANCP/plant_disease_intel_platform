"""
Market Signals — Domain Layer
Derives economic signals from raw market data.
No API calls, no LLM — pure computation.
"""


def compute_buyer_signal(arrival: float, trend: str) -> str:
    """
    Derive buyer activity signal from arrival volume + price trend.
    Threshold: 50 tonnes considered 'high arrival'.
    """
    high = arrival > 50
    if high and trend == "up":
        return "Strong Demand"
    elif high and trend == "down":
        return "Oversupply"
    elif not high and trend == "up":
        return "Scarcity Premium"
    elif not high and trend == "down":
        return "Weak Demand"
    return "Stable"


def compute_price_momentum(series: list[dict]) -> dict:
    """
    Given a list of {date, price} dicts (oldest→newest),
    compute momentum metrics for the trend chart.
    """
    prices = [r["price"] for r in series if r.get("price", 0) > 0]
    if len(prices) < 2:
        return {"momentum": "neutral", "change_pct": 0.0, "volatility": 0.0}

    first, last = prices[0], prices[-1]
    change_pct  = round(((last - first) / first) * 100, 2) if first else 0.0

    # Volatility: std-dev of daily changes
    daily_changes = [abs(prices[i] - prices[i - 1]) for i in range(1, len(prices))]
    avg_change    = sum(daily_changes) / len(daily_changes) if daily_changes else 0
    volatility    = round(avg_change, 2)

    momentum = "rising" if change_pct > 2 else ("falling" if change_pct < -2 else "neutral")

    return {
        "momentum":   momentum,
        "change_pct": change_pct,
        "volatility": volatility,
        "high":       max(prices),
        "low":        min(prices),
        "period_days": len(series),
    }


def compute_trade_recommendation(
    trend: str,
    buyer_signal: str,
    momentum: str,
    risk_level: str = "Low",
) -> dict:
    """
    Derive a BUY / HOLD / SELL recommendation from market signals.
    risk_level comes from climate agent.
    """
    score = 0

    # Price trend
    if trend == "up":
        score += 2
    elif trend == "down":
        score -= 2

    # Momentum
    if momentum == "rising":
        score += 1
    elif momentum == "falling":
        score -= 1

    # Buyer signal
    if buyer_signal in ("Strong Demand", "Scarcity Premium"):
        score += 1
    elif buyer_signal in ("Oversupply", "Weak Demand"):
        score -= 1

    # Disease / climate risk penalty
    if risk_level == "High":
        score -= 2
    elif risk_level == "Moderate":
        score -= 1

    if score >= 3:
        action = "BUY"
        reason = "Strong price momentum with high buyer demand."
    elif score <= -2:
        action = "SELL"
        reason = "Falling prices and weak demand signal oversupply."
    else:
        action = "HOLD"
        reason = "Mixed signals — monitor for 3–5 days before acting."

    confidence = min(95, 50 + abs(score) * 10)

    return {
        "action":     action,
        "reason":     reason,
        "confidence": confidence,
        "score":      score,
    }


def enrich_market_data(raw: dict, series: list[dict] | None = None) -> dict:
    """
    Combine raw market data with computed signals into a single enriched dict.
    This is the canonical output format for the Market Intelligence domain.
    """
    trend        = raw.get("trend", "stable")
    arrival      = raw.get("arrival", 0.0)
    buyer_signal = compute_buyer_signal(arrival, trend)

    momentum_data = {}
    if series:
        momentum_data = compute_price_momentum(series)

    return {
        **raw,
        "buyer_signal":  buyer_signal,
        "momentum":      momentum_data,
    }
