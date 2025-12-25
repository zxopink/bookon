import psycopg
from psycopg.sql import SQL
from psycopg.rows import dict_row
import os
from typing import Optional, Any, List, Dict, Tuple
from contextlib import contextmanager

# Get database connection string from environment
DATABASE_URL = os.getenv("DATABASE_URL", "")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set.")

if DATABASE_URL.startswith("postgresql+psycopg://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql+psycopg://", "postgresql://")

print(f"[DEBUG] Using DATABASE_URL: {DATABASE_URL}")
@contextmanager
def get_connection():
    conn = psycopg.connect(DATABASE_URL)
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def execute_query(query: SQL, params: Optional[Tuple] = None) -> List[Dict[str, Any]]:
    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(query, params or ())  
            return cur.fetchall()


def execute_one(query: SQL, params: Optional[Tuple] = None) -> Optional[Dict[str, Any]]:
    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(query, params or ())  
            return cur.fetchone()


def execute_command(query: SQL, params: Optional[Tuple] = None) -> int:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params or ())  
            return cur.rowcount


def execute_many(query: SQL, params_list: List[Tuple]) -> int:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.executemany(query, params_list)  
            return cur.rowcount


def execute_transaction(queries: List[Tuple[SQL, Optional[Tuple]]]) -> bool:    
    with get_connection() as conn:
        with conn.cursor() as cur:
            for query, params in queries:
                cur.execute(query, params or ())  
    return True


#Execute a multi-statement SQL script.
def execute_script(sql_script: SQL):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql_script)  
