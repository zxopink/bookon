from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class ReadStatus(int, Enum):
    PLANNED = 0
    READING = 1
    DONE = 2
    
    def to_string(self) -> str:
        """Convert enum to readable string"""
        return self.name.lower()
    
    @classmethod
    def from_string(cls, value: str) -> "ReadStatus":
        """Convert string to enum"""
        return cls[value.upper()]


class ReadListBase(BaseModel):
    book_external_id: str = Field(..., min_length=1, max_length=100)
    status: ReadStatus


class ReadListCreate(BaseModel):
    external_id: str = Field(..., min_length=1, max_length=100)
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    author: str = Field(..., min_length=1)
    cover_i: Optional[int] = None


class ReadListUpdate(BaseModel):
    status: str = Field(..., pattern="^(PLANNED|READING|DONE)$")


class ReadList(ReadListBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
