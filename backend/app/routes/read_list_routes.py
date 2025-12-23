from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from models import ReadList, ReadListCreate, ReadListUpdate, ReadStatus
from services import read_list_service


router = APIRouter(prefix="/api/reading-list", tags=["Reading List"])


@router.get("/", response_model=List[ReadList])
async def get_reading_list():
    try:
        entries = read_list_service.get_read_list()
        return entries
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch reading list: {str(e)}"
        )


@router.get("/{id}", response_model=ReadList)
async def get_reading_list_entry(id: int):
    try:
        entry = read_list_service.get_read_list_entry_by_id(id)
        if not entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Book not found in reading list"
            )
        return entry
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch book: {str(e)}"
        )


@router.post("/", response_model=ReadList, status_code=status.HTTP_201_CREATED)
async def add_to_reading_list(book: ReadListCreate):
    try:
        entry = read_list_service.add_to_read_list(
            book_external_id=book.external_id,
            title=book.title,
            description=book.description,
            author=book.author,
            cover_i=book.cover_i,
            status=ReadStatus.PLANNED
        )
        return entry
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add book to reading list: {str(e)}"
        )


@router.put("/{id}", response_model=ReadList)
async def update_reading_list_entry(id: int, update: ReadListUpdate):
    try:
        status_value = ReadStatus.from_string(update.status).value
        entry = read_list_service.update_read_list_entry_by_id(
            entry_id=id,
            status=status_value
        )
        if not entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Book not found in reading list"
            )
        return entry
    except HTTPException:
        raise
    except (KeyError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: PLANNED, READING, DONE"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update book: {str(e)}"
        )


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_reading_list(id: int):
    try:
        rows_deleted = read_list_service.remove_from_read_list_by_id(id)
        if rows_deleted == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Book not found in reading list"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to remove book: {str(e)}"
        )
