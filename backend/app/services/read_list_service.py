from typing import List, Dict, Any, Optional
from psycopg.sql import SQL
from database import execute_query, execute_one, execute_command, execute_script

status_types = ["PLANNED", "READING", "DONE"]
def _int_to_status_string(status_int: int) -> str:
    if 0 <= status_int < len(status_types):
        return status_types[status_int]
    return "PLANNED"


def _status_string_to_int(status_str: str) -> int:
    try:
        return status_types.index(status_str)
    except ValueError:
        raise ValueError(f"Invalid status string: {status_str}")


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
    results = execute_query(query)
    # Convert status integers to strings
    for result in results:
        result['status'] = _int_to_status_string(result['status'])
    return results

#Unused
def get_read_list_entry(book_external_id: str) -> Optional[Dict[str, Any]]:
    query = SQL("SELECT * FROM read_list WHERE book_external_id = %s")
    result = execute_one(query, (book_external_id,))
    if result:
        result['status'] = _int_to_status_string(result['status'])
    return result


def get_read_list_entry_by_id(entry_id: int) -> Optional[Dict[str, Any]]:
    query = SQL("SELECT * FROM read_list WHERE id = %s")
    result = execute_one(query, (entry_id,))
    if result:
        result['status'] = _int_to_status_string(result['status'])
    return result


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
    # Convert status to string for API response
    result['status'] = _int_to_status_string(result['status'])
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


def update_read_list_entry_by_id(entry_id: int, status: str) -> Optional[Dict[str, Any]]:


    int_status = _status_string_to_int(status)
    query = SQL("""
        UPDATE read_list 
        SET status = %s, updated_at = CURRENT_TIMESTAMP
        WHERE id = %s
        RETURNING *
    """)
    result = execute_one(query, (int_status, entry_id))
    if result:
        result['status'] = _int_to_status_string(result['status'])
    return result

#Unused
def remove_from_read_list(book_external_id: str) -> int:
    query = SQL("DELETE FROM read_list WHERE book_external_id = %s")
    return execute_command(query, (book_external_id,))


def remove_from_read_list_by_id(entry_id: int) -> int:
    query = SQL("DELETE FROM read_list WHERE id = %s")
    return execute_command(query, (entry_id,))
