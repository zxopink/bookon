from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class BookBase(BaseModel):
    external_id: str = Field(..., min_length=1, max_length=100, description="Unique external identifier")
    title: str = Field(..., min_length=1, max_length=500)
    authors: List[str] = Field(default_factory=list, description="List of authors")
    first_publish_year: Optional[int] = Field(None, ge=0)
    cover_i: Optional[int] = Field(None, description="Cover image ID")


class Book(BookBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SearchBooksResponse(BaseModel):
    books: List[BookBase]
    total: int
    page: int
    limit: int
    total_pages: int
