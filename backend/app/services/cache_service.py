from functools import wraps
from datetime import datetime, timedelta
from typing import Callable, Any, Dict, Tuple

#In-memory cache with TTL
_cache: Dict[Tuple, Tuple[Any, datetime]] = {}

def cached_with_ttl(ttl_seconds: int = 3600):
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            cache_key = (func.__name__, args, tuple(sorted(kwargs.items())))
            
            if cache_key in _cache:
                cached_result, cached_time = _cache[cache_key]
                if datetime.now() - cached_time < timedelta(seconds=ttl_seconds):
                    return cached_result
                else:
                    # Remove expired entry
                    del _cache[cache_key]
            
            # Call function and cache result
            result = func(*args, **kwargs)
            _cache[cache_key] = (result, datetime.now())
            
            return result
        
        return wrapper
    return decorator


def clear_cache():
    global _cache
    _cache.clear()


def clear_cache_for_function(func_name: str):
    global _cache
    keys_to_delete = [key for key in _cache.keys() if key[0] == func_name]
    for key in keys_to_delete:
        del _cache[key]
