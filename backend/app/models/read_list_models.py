from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class ReadStatus(int, Enum):
    PLANNED = 0
    READING = 1
    DONE = 2
    
    def to_string(self) -> str:
        return self.name.lower()
    
    @classmethod
    def from_string(cls, value: str) -> "ReadStatus":
        return cls[value.upper()]


class ReadList(BaseModel):
    id: int
    external_id: str = Field(..., min_length=1, max_length=100, alias="book_external_id")
    title: str = Field(..., min_length=1)
    author: str = Field(..., min_length=1)
    description: Optional[str] = None
    cover_i: Optional[int] = None
    status: str = Field(..., pattern="^(PLANNED|READING|DONE)$")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True


class ReadListCreate(BaseModel):
    external_id: str = Field(..., min_length=1, max_length=100)
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    author: str = Field(..., min_length=1)
    cover_i: Optional[int] = None


class ReadListUpdate(BaseModel):
    status: str = Field(..., pattern="^(PLANNED|READING|DONE)$")
