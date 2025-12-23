from typing import List, Dict, Any, Optional
from psycopg.sql import SQL
from database import execute_query, execute_one, execute_command, execute_script
import requests
from urllib.parse import quote
from services.cache_service import cached_with_ttl
from config import API_HEADERS
from mockings.book_mocking import get_mock_data

#A service for fetching books, no SQL use here, we gotta play smart🧑🏼‍🏫
#Also includes caching for performance

@cached_with_ttl(ttl_seconds=3600)  # Cache for one hour
def get_book_by_id(book_id: int) -> Optional[Dict[str, Any]]:
    query = SQL("SELECT * FROM books WHERE id = %s")
    return execute_one(query, (book_id,))

@cached_with_ttl(ttl_seconds=3600)  #Cache for one hour
def get_popular_books(limit: int = 12, page: int = 1, duration: str = "monthly") -> Dict[str, Any]:
    if duration not in ("daily", "weekly", "monthly", "yearly", "forever"):
        raise ValueError("Invalid duration. Must be 'daily', 'weekly', 'monthly', or None.")
    
    url = f"https://openlibrary.org/trending/{duration}.json?limit={limit}&page={page}"
    
    try:
        response = requests.get(url, headers=API_HEADERS, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Transform the response to match our book model
        books = []
        for work in data.get("works", []):
            book = {
                "external_id": work.get("key", ""),
                "title": work.get("title", "Unknown"),
                "authors": [author.get("name", "") for author in work.get("authors", [])],
                "first_publish_year": work.get("first_publish_year"),
                "cover_i": work.get("cover_i")
            }
            books.append(book)
        
        return {
            "books": books,
            "total": len(books),
            "page": page,
            "limit": limit
        }
    except Exception as e:
        #Failed to fetch, result to mocking books taken from real data by me (yoav) :)
        #Modern problems require modern solutions
        print(f"Error fetching popular books: {str(e)}. Using mock data.")
        return {
            "books": get_mock_data().get(duration, []),
            "total": len(get_mock_data().get(duration, [])),
            "page": page,
            "limit": limit
        }
        raise Exception(f"Failed to fetch popular books: {str(e)}")


# Search books by title or author from Open Library API
@cached_with_ttl(ttl_seconds=3600)  # Cache one hour
def search_books(search_term: str, page: int = 1, limit: int = 20) -> Dict[str, Any]:
    quoted_query = quote(search_term)
    url = f"https://openlibrary.org/search.json?q={quoted_query}&limit={limit}&page={page}"
    print(f"Searching books with URL: {url}")   
    
    try:
        response = requests.get(url, headers=API_HEADERS, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Transform the response to match our book model
        books = []
        for doc in data.get("docs", []):
            book = {
                "external_id": doc.get("key", ""),
                "title": doc.get("title", "Unknown"),
                "authors": doc.get("author_name", []),
                "first_publish_year": doc.get("first_publish_year"),
                "cover_i": doc.get("cover_i")
            }
            books.append(book)
        
        return {
            "books": books,
            "total": data.get("numFound", 0),
            "page": page,
            "limit": limit,
            "total_pages": (data.get("numFound", 0) + limit - 1) // limit
        }
    except Exception as e:
        raise Exception(f"Failed to search books: {str(e)}")