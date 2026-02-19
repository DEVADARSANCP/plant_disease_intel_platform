"""
Satellite Health Agent
Fetches vegetation-related data from NASA POWER API (free, no key required)
and computes a vegetation health index as a proxy for NDVI.
"""

import httpx
from datetime import datetime, timedelta


NASA_POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"


def _compute_vegetation_health(
    solar_radiation_avg: float,
    temperature_avg: float,
    humidity_avg: float,
    precipitation_sum: float,
) -> float:
    """
    Compute a synthetic vegetation health index (0.0 – 1.0) from
    environmental parameters as a proxy for NDVI.

    Healthy vegetation correlates with:
    - Adequate solar radiation (4–8 kWh/m²/day)
    - Moderate temperature (15–30°C)
    - Good moisture (humidity 60–85%, some rain)
    """
    score = 0.0

    # Solar radiation factor (30%) — optimal 4-8 kWh/m²/day
    if 4 <= solar_radiation_avg <= 8:
        score += 0.30
    elif 2 <= solar_radiation_avg < 4 or 8 < solar_radiation_avg <= 10:
        score += 0.20
    else:
        score += 0.08

    # Temperature factor (30%) — optimal 15-30°C
    if 15 <= temperature_avg <= 30:
        temp_factor = 1.0 - abs(temperature_avg - 22.5) / 15
        score += temp_factor * 0.30
    elif 5 <= temperature_avg < 15 or 30 < temperature_avg <= 40:
        score += 0.10
    else:
        score += 0.03

    # Moisture factor (40%) — humidity + rainfall
    moisture_score = 0.0
    if 60 <= humidity_avg <= 85:
        moisture_score += 0.25
    elif 40 <= humidity_avg < 60 or 85 < humidity_avg <= 95:
        moisture_score += 0.15
    else:
        moisture_score += 0.05

    if 2 <= precipitation_sum <= 15:
        moisture_score += 0.15
    elif 0 < precipitation_sum < 2 or 15 < precipitation_sum <= 30:
        moisture_score += 0.08
    elif precipitation_sum > 30:
        moisture_score += 0.03  # flooding stress

    score += moisture_score

    return round(min(score, 1.0), 2)


def _classify_stress(ndvi: float) -> str:
    if ndvi >= 0.65:
        return "Low"
    elif ndvi >= 0.45:
        return "Moderate"
    elif ndvi >= 0.25:
        return "High"
    else:
        return "Severe"


def _compute_trend(recent_ndvi: float, older_ndvi: float) -> str:
    diff = recent_ndvi - older_ndvi
    if diff > 0.05:
        return "Improving"
    elif diff < -0.05:
        return "Declining"
    else:
        return "Stable"


async def get_satellite_health(lat: float, lon: float) -> dict:
    """
    Fetch vegetation-related environmental data from NASA POWER and
    compute a synthetic vegetation health index.
    """
    end_date = datetime.now()
    start_date = end_date - timedelta(days=14)

    params = {
        "parameters": "ALLSKY_SFC_SW_DWN,T2M,RH2M,PRECTOTCORR",
        "community": "AG",
        "longitude": lon,
        "latitude": lat,
        "start": start_date.strftime("%Y%m%d"),
        "end": end_date.strftime("%Y%m%d"),
        "format": "JSON",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(NASA_POWER_URL, params=params)
        response.raise_for_status()
        data = response.json()

    properties = data.get("properties", {}).get("parameter", {})
    solar = properties.get("ALLSKY_SFC_SW_DWN", {})
    temp = properties.get("T2M", {})
    humidity = properties.get("RH2M", {})
    precip = properties.get("PRECTOTCORR", {})

    # Filter out fill values (-999)
    def clean_values(d):
        return [v for v in d.values() if v != -999.0 and v is not None]

    solar_vals = clean_values(solar)
    temp_vals = clean_values(temp)
    humidity_vals = clean_values(humidity)
    precip_vals = clean_values(precip)

    # Compute averages for recent (last 7 days) and older (previous 7 days)
    midpoint = max(len(solar_vals) // 2, 1)

    def safe_avg(vals):
        return sum(vals) / len(vals) if vals else 0

    recent_ndvi = _compute_vegetation_health(
        safe_avg(solar_vals[midpoint:]),
        safe_avg(temp_vals[midpoint:]),
        safe_avg(humidity_vals[midpoint:]),
        sum(precip_vals[midpoint:]) if precip_vals[midpoint:] else 0,
    )

    older_ndvi = _compute_vegetation_health(
        safe_avg(solar_vals[:midpoint]),
        safe_avg(temp_vals[:midpoint]),
        safe_avg(humidity_vals[:midpoint]),
        sum(precip_vals[:midpoint]) if precip_vals[:midpoint] else 0,
    )

    return {
        "ndvi_score": recent_ndvi,
        "vegetation_stress": _classify_stress(recent_ndvi),
        "health_trend": _compute_trend(recent_ndvi, older_ndvi),
        "data_source": "NASA POWER (AG Community)",
        "coverage_period": f"{start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}",
        "last_updated": datetime.now().strftime("%Y-%m-%d %I:%M %p"),
    }
