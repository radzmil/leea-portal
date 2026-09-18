import os
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

# Muat fail .env secara langsung di sini
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def get_db_connection():
    """Mewujudkan sambungan ke pangkalan data PostgreSQL/Supabase"""
    try:
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
        return conn
    except Exception as e:
        print(f"Ralat menyambung ke pangkalan data: {e}")
        raise e

def init_db_tables():
    """Fungsi pembantu untuk membina jadual asas (admins & clients lengkap) jika belum wujud"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 1. Jadual Admin
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS admins (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # 2. Jadual Klien (Lengkap dengan data syarikat, server, dan bot_token)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS clients (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                nama_syarikat VARCHAR(150),
                email_pengguna VARCHAR(150),
                no_telefon VARCHAR(30),
                no_wa_bot VARCHAR(30),
                url_server TEXT,
                token_balance INTEGER DEFAULT 1000,
                tarikh_luput DATE,
                plain_password VARCHAR(100),
                bot_token VARCHAR(100),
                drive_folder_id VARCHAR(150),
                drive_sheet_id VARCHAR(150),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        conn.commit()
        print("Jadual pangkalan data lengkap berjaya disemak/dicipta.")
    except Exception as e:
        conn.rollback()
        print(f"Ralat membina jadual DB: {e}")
    finally:
        cursor.close()
        conn.close()