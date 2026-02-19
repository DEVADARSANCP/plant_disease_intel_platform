"""
Market Analysis — CSV-Based (Domain Layer)
Reads mandi price data from uploaded CSV files in backend/data/.
Files are named like "State_District.csv" (e.g., Kerala_Kottayam.csv).
Each file represents a "Region".

CSV Columns: State, District, Market, Commodity, Variety, Grade,
             Arrival_Date, Min_Price, Max_Price, Modal_Price, Commodity_Code
"""

import os
import glob
import pandas as pd
from datetime import datetime, date
from pathlib import Path
from functools import lru_cache

# ── CSV file location ──────────────────────────────────────────────────────
DATA_DIR = Path(__file__).parent.parent.parent / "data"

# Expected column names (after normalisation)
COL_STATE     = "State"
COL_DISTRICT  = "District"
COL_MARKET    = "Market"
COL_COMMODITY = "Commodity"
COL_VARIETY   = "Variety"
COL_GRADE     = "Grade"
COL_DATE      = "Arrival_Date"
COL_MIN       = "Min_Price"
COL_MAX       = "Max_Price"
COL_MODAL     = "Modal_Price"


# Coordinate lookup for known states/districts
# We use this to map a selected Region (File) to a lat/lon
REGION_COORDS = {
    "Kerala_Kottayam":      (9.59, 76.52),
    "Kerala_Kozhikode":     (11.25, 75.78),
    "Kerala_Palakad":       (10.78, 76.65),
    "Maharastra_Sholapur":  (17.65, 75.90),
    "Tamilnadu_Coimbatore": (11.01, 76.95),
    "Tamilnadu_Thanjavur":  (10.78, 79.13),
}

def resolve_coords_for_state(region_name: str) -> tuple[float, float]:
    """
    Return (lat, lon) for a region (filename key), defaulting to coordinates of the state/district.
    fallback: default to Kerala coords if unknown.
    """
    # Try exact match first
    if region_name in REGION_COORDS:
        return REGION_COORDS[region_name]
    
    # Simple fallback based on string content
    lower = region_name.lower()
    if "kerala" in lower: return (10.85, 76.27)
    if "maharashtra" in lower or "maharastra" in lower: return (19.75, 75.71)
    if "tamil" in lower: return (11.12, 78.65)
    
    return (10.85, 76.27) # Default


@lru_cache(maxsize=10)
def _load_csv(filename: str) -> pd.DataFrame:
    """
    Load and cache a specific CSV file by name.
    """
    path = DATA_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"Region file {filename} not found")

    df = pd.read_csv(path)

    # Strip whitespace from column names
    df.columns = [c.strip() for c in df.columns]

    # Normalise common alternate column names
    rename_map = {
        "Arrival_Date":   COL_DATE,
        "ArrivalDate":    COL_DATE,
        "arrival_date":   COL_DATE,
        "Min_Price":      COL_MIN,
        "MinPrice":       COL_MIN,
        "min_price":      COL_MIN,
        "Max_Price":      COL_MAX,
        "MaxPrice":       COL_MAX,
        "max_price":      COL_MAX,
        "Modal_Price":    COL_MODAL,
        "ModalPrice":     COL_MODAL,
        "modal_price":    COL_MODAL,
        "Modal_Pri":      COL_MODAL,   # truncated
        "Commodi":        COL_COMMODITY, # typo handling
    }
    df.rename(columns={k: v for k, v in rename_map.items() if k in df.columns}, inplace=True)

    # Parse date column
    for fmt in ("%d-%m-%Y", "%d/%m/%Y", "%Y-%m-%d", "%m/%d/%Y"):
        try:
            df[COL_DATE] = pd.to_datetime(df[COL_DATE], format=fmt, errors="raise")
            break
        except Exception:
            continue
    else:
        df[COL_DATE] = pd.to_datetime(df[COL_DATE], infer_datetime_format=True, errors="coerce")

    # Coerce numeric
    for col in [COL_MIN, COL_MAX, COL_MODAL]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col].astype(str).str.replace(",", ""), errors="coerce")
            
    # Strip strings
    for col in [COL_STATE, COL_DISTRICT, COL_MARKET, COL_COMMODITY, COL_VARIETY]:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip()

    return df


def get_available_filters() -> dict:
    """
    Scans backend/data/*.csv and returns structured topology:
    {
       "topology": {
           "Kerala": ["Kottayam", "Kozhikode", ...],
           "Tamilnadu": ["Coimbatore", ...],
           ...
       },
       "commodities": {
           "Kerala_Kottayam": ["Banana", ...],
           ...
       }
    }
    """
    csv_files = glob.glob(str(DATA_DIR / "*.csv"))
    topology = {}
    commodities_map = {}

    for path in csv_files:
        p = Path(path)
        if p.name == "market_prices.csv": continue # Skip sample

        region_id = p.stem  # e.g. "Kerala_Kottayam"
        
        # Parse State_District from filename
        parts = region_id.split('_')
        if len(parts) >= 2:
            state    = parts[0]
            district = parts[1]
        else:
            state    = "Unknown"
            district = region_id

        if state not in topology:
            topology[state] = []
        if district not in topology[state]:
            topology[state].append(district)
        
        # Load commodities
        try:
            df = _load_csv(p.name)
            if COL_COMMODITY in df.columns:
                commodities_map[region_id] = sorted(df[COL_COMMODITY].dropna().unique().tolist())
            else:
                commodities_map[region_id] = []
        except Exception:
            commodities_map[region_id] = []

    # Sort lists
    for state in topology:
        topology[state].sort()
    
    # Sort topology keys
    sorted_topology = {k: topology[k] for k in sorted(topology.keys())}

    return {
        "topology":    sorted_topology,
        "commodities": commodities_map
    }


async def get_market_data(
    region:    str,  # e.g. "Kerala_Kottayam"
    commodity: str,  # e.g. "Banana"
    market:    str = "", # filtered if provided, else use latest
) -> dict:
    """
    Fetch market data from the specific region CSV file.
    """
    try:
        filename = f"{region}.csv"
        df = _load_csv(filename)
        
        # Filter by Commodity
        if COL_COMMODITY in df.columns:
            df = df[df[COL_COMMODITY].str.lower() == commodity.lower()]

        if df.empty:
            return _error_result(region, commodity, "No data for this commodity")

        # Sort by Date descending
        df = df.sort_values(COL_DATE, ascending=False)
        
        latest = df.iloc[0]
        prev   = df.iloc[1] if len(df) > 1 else None

        modal_price = float(latest.get(COL_MODAL, 0) or 0)
        min_price   = float(latest.get(COL_MIN,   modal_price) or modal_price)
        max_price   = float(latest.get(COL_MAX,   modal_price) or modal_price)

        if prev is not None:
            prev_price   = float(prev.get(COL_MODAL, modal_price) or modal_price)
            price_change = round(modal_price - prev_price, 2)
            trend        = "up" if price_change > 0 else ("down" if price_change < 0 else "stable")
        else:
            prev_price   = modal_price
            price_change = 0.0
            trend        = "stable"
            
        arrival_date = latest[COL_DATE]
        if pd.notna(arrival_date):
            arrival_date = arrival_date.strftime("%d %b %Y")
        else:
            arrival_date = "Unknown"

        return {
            "commodity":    str(latest.get(COL_COMMODITY, commodity)),
            "variety":      str(latest.get(COL_VARIETY, "—")),
            "grade":        str(latest.get(COL_GRADE, "—")),
            "market_name":  str(latest.get(COL_MARKET, "—")),
            "district":     str(latest.get(COL_DISTRICT, "—")),
            "state_name":   str(latest.get(COL_STATE, "—")),
            "mandi_price":  modal_price,
            "min_price":    min_price,
            "max_price":    max_price,
            "prev_price":   prev_price,
            "price_change": price_change,
            "arrival":      0.0,
            "trend":        trend,
            "arrival_date": arrival_date,
            "source":       f"{region}.csv",
            "last_updated": datetime.now().strftime("%Y-%m-%d %I:%M %p"),
            "status":       "success",
        }

    except Exception as e:
        return _error_result(region, commodity, str(e))


async def get_price_trend_series(
    region:    str,
    commodity: str,
    market:    str = "",
    days:      int = 14,
) -> list[dict]:
    try:
        filename = f"{region}.csv"
        df = _load_csv(filename)
        
        if COL_COMMODITY in df.columns:
            df = df[df[COL_COMMODITY].str.lower() == commodity.lower()]
            
        if df.empty: return []

        df = df.dropna(subset=[COL_DATE, COL_MODAL])
        # Group by date, taking median price if multiple markets/varieties exist for same day
        daily = (
            df.groupby(COL_DATE)
              .agg(price=(COL_MODAL, "median"), count=(COL_MODAL, "count"))
              .reset_index()
              .sort_values(COL_DATE)
              .tail(days)
        )
        
        return [
            {
                "date":    row[COL_DATE].strftime("%d %b"),
                "price":   round(float(row["price"]), 2),
                "arrival": int(row["count"])
            }
            for _, row in daily.iterrows()
        ]
    except Exception:
        return []


def get_market_records(
    region: str,
    commodity: str,
    page: int = 1,
    page_size: int = 50,
) -> dict:
    """
    Return paginated individual records from the CSV for a given region+commodity.
    Each record has: State, District, Market, Commodity, Variety, Grade,
    Arrival_Date, Min_Price, Max_Price, Modal_Price, Commodity_Code.
    """
    try:
        filename = f"{region}.csv"
        df = _load_csv(filename)

        if COL_COMMODITY in df.columns:
            df = df[df[COL_COMMODITY].str.lower() == commodity.lower()]

        if df.empty:
            return {"records": [], "total": 0, "page": page, "page_size": page_size}

        # Sort by date descending (most recent first)
        df = df.sort_values(COL_DATE, ascending=False)

        total = len(df)

        # Paginate
        start = (page - 1) * page_size
        end = start + page_size
        page_df = df.iloc[start:end]

        records = []
        for _, row in page_df.iterrows():
            arrival_date = row.get(COL_DATE)
            if pd.notna(arrival_date):
                arrival_date = arrival_date.strftime("%d/%m/%Y")
            else:
                arrival_date = "—"

            records.append({
                "state": str(row.get(COL_STATE, "—")),
                "district": str(row.get(COL_DISTRICT, "—")),
                "market": str(row.get(COL_MARKET, "—")),
                "commodity": str(row.get(COL_COMMODITY, "—")),
                "variety": str(row.get(COL_VARIETY, "Other")),
                "grade": str(row.get(COL_GRADE, "—")),
                "arrival_date": arrival_date,
                "min_price": float(row.get(COL_MIN, 0) or 0),
                "max_price": float(row.get(COL_MAX, 0) or 0),
                "modal_price": float(row.get(COL_MODAL, 0) or 0),
                "commodity_code": str(row.get("Commodity_Code", "—")),
            })

        return {
            "records": records,
            "total": total,
            "page": page,
            "page_size": page_size,
        }
    except Exception as e:
        return {"records": [], "total": 0, "page": page, "page_size": page_size, "error": str(e)}


def _error_result(region: str, commodity: str, reason: str) -> dict:
    return {
        "commodity":    commodity,
        "variety":      "—",
        "grade":        "—",
        "market_name":  "—",
        "district":     "—",
        "state_name":   region,
        "mandi_price":  0.0,
        "min_price":    0.0,
        "max_price":    0.0,
        "prev_price":   0.0,
        "price_change": 0.0,
        "arrival":      0.0,
        "trend":        "unknown",
        "arrival_date": "—",
        "source":       "Error",
        "last_updated": datetime.now().strftime("%Y-%m-%d %I:%M %p"),
        "status":       "error",
        "error":        reason,
    }
