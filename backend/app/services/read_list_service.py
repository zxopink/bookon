from typing import List, Dict, Any, Optional
from psycopg.sql import SQL
from database import execute_query, execute_one, execute_command, execute_script


def init_read_list_table():
    print("[DEBUG] Initializing read_list table...")
    create_table_sql = SQL("""
        CREATE TABLE IF NOT EXISTS read_list (
            id SERIAL PRIMARY KEY,
            book_external_id VARCHAR(100) NOT NULL UNIQUE,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            description TEXT,
            cover_i INTEGER,
            status INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    execute_script(create_table_sql)


def get_read_list() -> List[Dict[str, Any]]:
    query = SQL("SELECT * FROM read_list ORDER BY updated_at DESC")
    return execute_query(query)


def get_read_list_entry(book_external_id: str) -> Optional[Dict[str, Any]]:
    query = SQL("SELECT * FROM read_list WHERE book_external_id = %s")
    return execute_one(query, (book_external_id,))


def get_read_list_entry_by_id(entry_id: int) -> Optional[Dict[str, Any]]:
    query = SQL("SELECT * FROM read_list WHERE id = %s")
    return execute_one(query, (entry_id,))


def add_to_read_list(book_external_id: str, title: str, description: Optional[str], author: str, cover_i: Optional[int], status: int) -> Dict[str, Any]:
    existing = get_read_list_entry(book_external_id)
    if existing:
        return existing
    
    query = SQL("""
        INSERT INTO read_list (book_external_id, title, description, author, cover_i, status)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING *
    """)
    result = execute_one(query, (book_external_id, title, description, author, cover_i, status))
    if result is None:
        raise Exception("Failed to add book to read list")
    return result


def update_read_list_entry(book_external_id: str, status: Optional[int] = None) -> Optional[Dict[str, Any]]:
    updates = []
    params = []
    
    if status is not None:
        updates.append("status = %s")
        params.append(status)
    
    if not updates:
        return get_read_list_entry(book_external_id)
    
    updates.append("updated_at = CURRENT_TIMESTAMP")
    params.append(book_external_id)
    
    query = SQL(f"""
        UPDATE read_list 
        SET {', '.join(updates)}
        WHERE book_external_id = %s
        RETURNING *
    """)
    return execute_one(query, tuple(params))


def update_read_list_entry_by_id(entry_id: int, status: int) -> Optional[Dict[str, Any]]:
    query = SQL("""
        UPDATE read_list 
        SET status = %s, updated_at = CURRENT_TIMESTAMP
        WHERE id = %s
        RETURNING *
    """)
    return execute_one(query, (status, entry_id))

def remove_from_read_list(book_external_id: str) -> int:
    query = SQL("DELETE FROM read_list WHERE book_external_id = %s")
    return execute_command(query, (book_external_id,))


def remove_from_read_list_by_id(entry_id: int) -> int:
    query = SQL("DELETE FROM read_list WHERE id = %s")
    return execute_command(query, (entry_id,))
