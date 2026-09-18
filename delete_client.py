from database import get_db_connection

def delete_old_client():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Padam klien berdasarkan username sbltransport
        cursor.execute("DELETE FROM clients WHERE username = 'sbltransport';",)
        conn.commit()
        print("Data klien sbltransport berjaya dipadam dari pangkalan data!")
    except Exception as e:
        conn.rollback()
        print(f"Ralat memadam data: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    delete_old_client()