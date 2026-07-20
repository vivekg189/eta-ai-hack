import sqlite3
import json
from datetime import datetime
from config import DB_PATH

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Documents Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            size TEXT NOT NULL,
            upload_date TEXT NOT NULL,
            status TEXT NOT NULL,
            file_path TEXT NOT NULL
        )
    """)
    
    # 2. Extracted Data Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS extracted_data (
            document_id TEXT PRIMARY KEY,
            summary TEXT NOT NULL,
            raw_text TEXT NOT NULL,
            entities TEXT NOT NULL, -- JSON String
            FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
        )
    """)
    
    # 3. Activity Logs Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            type TEXT NOT NULL,
            message TEXT NOT NULL,
            severity TEXT NOT NULL,
            asset TEXT,
            detail TEXT NOT NULL
        )
    """)
    
    conn.commit()
    conn.close()

# Activity Logging Helper
def add_activity_log(event_type: str, message: str, severity: str = "info", asset: str = None, detail: str = ""):
    conn = get_db_connection()
    cursor = conn.cursor()
    timestamp = datetime.now().isoformat()
    cursor.execute("""
        INSERT INTO activity_logs (timestamp, type, message, severity, asset, detail)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (timestamp, event_type, message, severity, asset, detail))
    conn.commit()
    conn.close()
