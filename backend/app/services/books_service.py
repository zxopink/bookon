from typing import List, Dict, Any, Optional
from psycopg.sql import SQL
from models.book_models import BookDetail
from database import execute_query, execute_one, execute_command, execute_script
import requests
from urllib.parse import quote
from services.cache_service import cached_with_ttl
from config import API_HEADERS
from mockings.book_mocking import get_mock_data
from concurrent.futures import ThreadPoolExecutor, as_completed

#A service for fetching books, no SQL use here, we gotta play smart🧑🏼‍🏫
#Also includes caching for performance

def remove_id_prefix(book_external_id: str) -> str:
    prefixes = ["/works/", "/books/", "/authors/"]
    for prefix in prefixes:
        if book_external_id.startswith(prefix):
            return book_external_id[len(prefix):]
    return book_external_id

def add_id_prefix(openlibrary_id: str) -> str:
    if openlibrary_id.startswith("/"):
        return openlibrary_id  # already prefixed

    if openlibrary_id.endswith("W"):
        return f"/works/{openlibrary_id}"
    if openlibrary_id.endswith("M"):
        return f"/books/{openlibrary_id}"
    if openlibrary_id.endswith("A"):
        return f"/authors/{openlibrary_id}"

    raise ValueError(f"Unknown Open Library ID: {openlibrary_id}")

def fetch_single_author(author_key: str) -> str:
    """Fetch a single author's name from Open Library API."""
    try:
        author_url = f"https://openlibrary.org{author_key}.json"
        author_response = requests.get(author_url, headers=API_HEADERS, timeout=5)
        author_response.raise_for_status()
        author_data = author_response.json()
        return author_data.get("name", "Unknown")
    except Exception:
        return "Unknown"

def get_authors_from_keys(author_keys: List[str]) -> List[str]:
    """Fetch multiple authors concurrently using threading."""
    if not author_keys:
        return []
    
    author_names = []
    with ThreadPoolExecutor(max_workers=min(10, len(author_keys))) as executor:
        # Submit all author fetches concurrently
        future_to_key = {executor.submit(fetch_single_author, key): key for key in author_keys}
        
        # Collect results in order
        for future in as_completed(future_to_key):
            try:
                author_name = future.result()
                author_names.append(author_name)
            except Exception:
                author_names.append("Unknown")
    
    return author_names

def get_edition_info(book_id: str) -> Optional[Dict[str, Any]]:
    url = f"https://openlibrary.org/works/{book_id}/editions.json"
    try:
        response = requests.get(url, headers=API_HEADERS, timeout=10)
        response.raise_for_status()
        data = response.json()
        return data
    except Exception as e:
        print(f"Error fetching edition info for {book_id}: {str(e)}")
        return None
    
@cached_with_ttl(ttl_seconds=3600)  # Cache for one hour
def get_book_by_id(book_id: str) -> Optional[Dict[str, Any]]:
    url = f"https://openlibrary.org/works/{book_id}.json"
    print(f"Fetching book by ID with URL: {url}")
    try:
        response = requests.get(url, headers=API_HEADERS, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        description = None
        if "description" in data:
            desc = data["description"]
            if isinstance(desc, str):
                description = desc
            elif isinstance(desc, dict):
                description = desc.get("value", None)
        
        #Fetch author keys
        author_keys = []
        if "authors" in data:
            author_keys = [author.get("author", {}).get("key") for author in data["authors"] if author.get("author", {}).get("key")]
        
        #Fetch authors and edition info concurrently
        author_names = []
        edition_info = None
        
        with ThreadPoolExecutor(max_workers=2) as executor:
            authors_future = executor.submit(get_authors_from_keys, author_keys) if author_keys else None
            edition_future = executor.submit(get_edition_info, book_id)
            
            if authors_future:
                author_names = authors_future.result()
            edition_info = edition_future.result()

        latest_edition = None
        if edition_info:
            latest_edition = edition_info.get("entries", [])[0] if edition_info.get("entries") else {}

        #Get first valid cover ID (not -1)
        def get_valid_cover(covers):
            if not covers:
                return None
            for cover_id in covers:
                if cover_id and cover_id != -1:
                    return cover_id
            return None

        first_publish_year = latest_edition.get("publish_date") if latest_edition else data.get("first_publish_date")
        cover_id = get_valid_cover(latest_edition.get("covers")) if latest_edition and latest_edition.get("covers") else get_valid_cover(data.get("covers"))
        number_of_pages = latest_edition.get("number_of_pages") if latest_edition else None
        publishers = latest_edition.get("publishers", []) if latest_edition else []
        isbn_13 = latest_edition.get("isbn_13", []) if latest_edition else []
        isbn_10 = latest_edition.get("isbn_10", []) if latest_edition else []

        book = {
            "external_id": book_id,
            "title": data.get("title", "Unknown"),
            "authors": author_names,
            "first_publish_year": first_publish_year,
            "cover_i": cover_id,
            "description": description,
            "number_of_pages": number_of_pages,
            "publishers": publishers,
            "isbn_13": isbn_13,
            "isbn_10": isbn_10
        }
        return book
    except Exception as e:
        print(f"Error fetching book by ID {book_id}: {str(e)}")
        return None

@cached_with_ttl(ttl_seconds=3600)  #Cache for one hour
def get_popular_books(limit: int = 12, page: int = 1, duration: str = "monthly") -> Dict[str, Any]:
    if duration not in ("daily", "weekly", "monthly", "yearly", "forever"):
        raise ValueError("Invalid duration. Must be 'daily', 'weekly', 'monthly', or None.")
    
    url = f"https://openlibrary.org/trending/{duration}.json?limit={limit}&page={page}"
    
    try:
        response = requests.get(url, headers=API_HEADERS, timeout=10)
        response.raise_for_status()
        data = response.json()
        
    except Exception as e:
        #Modern problems require modern solutions
        print(f"Error fetching popular books: {str(e)}. Using mock data.")
        data = get_mock_data()

    # Transform the response to match our book model
    books = []
    for work in data.get("works", []):
        book = {
            "external_id": remove_id_prefix(work.get("key", "")),
            "title": work.get("title", "Unknown"),
            "authors": work.get("author_name", []),
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


#Search books by title or author from Open Library API
@cached_with_ttl(ttl_seconds=3600)  # Cache one hour
def search_books(search_term: str, page: int = 1, limit: int = 20) -> Dict[str, Any]:
    quoted_query = quote(search_term)
    url = f"https://openlibrary.org/search.json?q={quoted_query}&limit={limit}&page={page}"
    print(f"Searching books with URL: {url}")   
    
    try:
        response = requests.get(url, headers=API_HEADERS, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        #Transform the response to match our book model
        books = []
        for doc in data.get("docs", []):
            book = {
                "external_id": remove_id_prefix(doc.get("key", "")),
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