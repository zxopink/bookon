from fastapi import APIRouter, Query
from typing import List
from models.book_models import Book, SearchBooksResponse
from services.books_service import search_books, get_popular_books

router = APIRouter(prefix="/api", tags=["books"])


@router.get("/search/books", response_model=SearchBooksResponse)
async def search_books_route(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(20, ge=1, le=100, description="Number of books per page"),
    page: int = Query(1, ge=1, description="Number of books to skip")
):
    #querying limit and offset directly to avoid user's overflowing page number
    result = search_books(q, page=page, limit=limit)
    return result


@router.get("/popular/books")
async def get_popular_books_route(
    limit: int = Query(12, ge=1, le=50, description="Number of books to return"),
    page: int = Query(1, ge=1, description="Page number"),
    duration: str = Query("monthly", description="Duration for popular books (daily, weekly, monthly, yearly, forever)")
):
    result = get_popular_books(limit=limit, page=page, duration=duration)
    return result

