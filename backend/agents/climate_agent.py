"""
Climate Risk Agent
Fetches real-time weather data from Open-Meteo API (free, no key required)
and computes plant disease outbreak probability.
"""

import httpx
from datetime import datetime


OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


def _compute_outbreak_probability(
    temperature: float,
    humidity: float,
    rainfall: float,
    wind_speed: float,
) -> float:
    """
    Calculate outbreak probability using weighted plant pathology risk factors.

    Key disease-favorable conditions:
    - Temperature 18–28°C (fungal sweet spot)
    - Humidity > 80% (spore germination)
    - Recent rainfall (leaf wetness)
    - Low wind (stagnant moist air)
    """
    score = 0.0

    # Temperature factor (40% weight) — peak at 22-26°C
    if 18 <= temperature <= 28:
        # Closer to 24°C = higher risk
        temp_factor = 1.0 - abs(temperature - 24) / 10
        score += temp_factor * 40
    elif 10 <= temperature < 18 or 28 < temperature <= 35:
        score += 10
    # else: too cold or too hot, minimal risk

    # Humidity factor (30% weight)
    if humidity >= 90:
        score += 30
    elif humidity >= 80:
        score += 25
    elif humidity >= 70:
        score += 15
    elif humidity >= 60:
        score += 8

    # Rainfall factor (20% weight)
    if rainfall > 20:
        score += 20
    elif rainfall > 10:
        score += 15
    elif rainfall > 5:
        score += 10
    elif rainfall > 0:
        score += 5

    # Wind factor (10% weight) — low wind = higher risk (moisture retention)
    if wind_speed < 5:
        score += 10
    elif wind_speed < 10:
        score += 7
    elif wind_speed < 20:
        score += 3

    return min(round(score, 1), 100.0)


def _classify_risk(probability: float) -> str:
    if probability >= 70:
        return "High"
    elif probability >= 40:
        return "Moderate"
    else:
        return "Low"


def _generate_forecast_summary(
    temperature: float,
    humidity: float,
    rainfall: float,
    risk_level: str,
) -> str:
    conditions = []
    if humidity >= 80:
        conditions.append("high humidity")
    if 18 <= temperature <= 28:
        conditions.append("warm temperatures")
    if rainfall > 5:
        conditions.append("recent precipitation")

    if not conditions:
        return (
            f"Current conditions show low disease risk. "
            f"Temperature at {temperature}°C with {humidity}% humidity."
        )

    condition_str = ", ".join(conditions)
    urgency = {
        "High": "creating highly favorable conditions for fungal and bacterial propagation. Immediate preventive action recommended.",
        "Moderate": "creating moderately favorable conditions for disease development. Monitor closely.",
        "Low": "with limited disease risk at present. Continue routine monitoring.",
    }

    return f"Current weather shows {condition_str}, {urgency.get(risk_level, '')}"


async def get_climate_risk(lat: float, lon: float) -> dict:
    """
    Fetch real-time weather data for given coordinates and compute
    plant disease outbreak risk.
    """
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": [
            "temperature_2m",
            "relative_humidity_2m",
            "wind_speed_10m",
            "precipitation",
        ],
        "daily": ["precipitation_sum"],
        "timezone": "auto",
        "forecast_days": 1,
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(OPEN_METEO_URL, params=params)
        response.raise_for_status()
        data = response.json()

    current = data.get("current", {})
    temperature = current.get("temperature_2m", 0)
    humidity = current.get("relative_humidity_2m", 0)
    wind_speed = current.get("wind_speed_10m", 0)
    rainfall = current.get("precipitation", 0)

    outbreak_prob = _compute_outbreak_probability(
        temperature, humidity, rainfall, wind_speed
    )
    risk_level = _classify_risk(outbreak_prob)

    return {
        "temperature": temperature,
        "humidity": humidity,
        "wind_speed": round(wind_speed, 1),
        "rainfall": round(rainfall, 1),
        "risk_level": risk_level,
        "outbreak_probability": outbreak_prob,
        "forecast_summary": _generate_forecast_summary(
            temperature, humidity, rainfall, risk_level
        ),
        "last_updated": datetime.now().strftime("%Y-%m-%d %I:%M %p"),
    }
