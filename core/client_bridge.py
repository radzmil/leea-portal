from database import get_db_connection
from psycopg2.extras import RealDictCursor

def get_client_live_stats(client_id):
    """Modul untuk mengambil data real-time token dan aktiviti klien dari Supabase"""
    conn = get_db_connection()
    if not conn:
        return None
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT id, username, nama_syarikat, token_balance, bot_token FROM clients WHERE id = %s", (client_id,))
        client_data = cursor.fetchone()
        cursor.close()
        conn.close()
        return client_data
    except Exception as e:
        print(f"Ralat modul bridge: {e}")
        return None