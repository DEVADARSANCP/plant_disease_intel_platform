import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

try:
    from domains.market.market_analyze import get_available_filters, DATA_DIR
    print(f"DATA_DIR resolved to: {DATA_DIR}")
    print(f"Exists? {DATA_DIR.exists()}")
    
    filters = get_available_filters()
    print("Filters result:", filters)
except Exception as e:
    print(f"Error: {e}")
