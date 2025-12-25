import json
import os
from typing import Dict, Any, Optional

#This was primarily made to copy old data from a list to provide
#In case popular books API failed to respond
#It's an offline backup by me (yoav) :)

MOCK_DATA_PATH = os.path.join(os.path.dirname(__file__), "book_monthly_mock_info.json")

# Cache for the parsed mock data
_cached_mock_data: Optional[Dict[str, Any]] = None


def get_mock_data() -> Dict[str, Any]:
    global _cached_mock_data
    
    if _cached_mock_data is None:
        with open(MOCK_DATA_PATH, 'r', encoding='utf-8') as f:
            _cached_mock_data = json.load(f)
    
    if _cached_mock_data is None:
        raise ValueError("Mock data could not be loaded.")

    return _cached_mock_data

