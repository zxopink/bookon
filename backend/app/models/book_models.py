from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class BookBase(BaseModel):
    external_id: str = Field(..., min_length=1, max_length=100, description="Unique external identifier")
    title: str = Field(..., min_length=1, max_length=500)
    authors: List[str] = Field(default_factory=list, description="List of authors")
    first_publish_year: Optional[str | int] = Field(None)
    cover_i: Optional[int] = Field(None, description="Cover image ID")

class BookDetail(BookBase):
    description: Optional[str] = Field(None, description="Book description")
    number_of_pages: Optional[int] = Field(None)
    publishers: List[str] = Field(default_factory=list, description="List of publishers")
    isbn_13: List[str] = Field(default_factory=list, description="List of ISBN-13 identifiers")
    isbn_10: List[str] = Field(default_factory=list, description="List of ISBN-10 identifiers")

class SearchBooksResponse(BaseModel):
    books: List[BookBase]
    total: int
    page: int
    limit: int
    total_pages: int
