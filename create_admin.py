import bcrypt
from database import get_db_connection, init_db_tables

def create_admin():
    # Pastikan jadual asas wujud terlebih dahulu
    print("Menyemak dan membina jadual pangkalan data...")
    init_db_tables()
    
    # Masukkan nama pengguna dan kata laluan admin pilihan tuan
    username = "admin"
    raw_password = "katalaluanadmin123"  # Tukar kepada kata laluan pilihan tuan
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Hash password menggunakan bcrypt
    hashed_password = bcrypt.hashpw(raw_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    try:
        # Masukkan ke dalam jadual admins
        cursor.execute(
            """
            INSERT INTO admins (username, password_hash)
            VALUES (%s, %s)
            ON CONFLICT (username) DO UPDATE 
            SET password_hash = EXCLUDED.password_hash;
            """,
            (username, hashed_password)
        )
        conn.commit()
        print(f"Berjaya daftarkan admin: '{username}' ke dalam pangkalan data!")
    except Exception as e:
        conn.rollback()
        print(f"Ralat mendaftarkan admin: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    create_admin()