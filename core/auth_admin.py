import os
import bcrypt
from database import get_db_connection

def verify_admin_login(username, raw_password, *args, **kwargs):
    """
    Menyemak kelayakan log masuk admin melalui pangkalan data.
    Semakan pemacu fizikal E:\ telah dilumpuhkan untuk keserasian pelayan awan (Vercel).
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Ambil data admin dari pangkalan data
        cursor.execute("SELECT * FROM admins WHERE username = %s", (username,))
        admin = cursor.fetchone()
        
        if not admin:
            return False, "ID Pengguna atau Kata Laluan salah."
            
        # Semak kesahihan kata laluan menggunakan bcrypt
        stored_password_hash = admin['password_hash']
        if not bcrypt.checkpw(raw_password.encode('utf-8'), stored_password_hash.encode('utf-8')):
            return False, "ID Pengguna atau Kata Laluan salah."
            
        return True, "Log masuk berjaya disahkan."
        
    except Exception as e:
        return False, f"Ralat sistem pengesahan: {str(e)}"
    finally:
        cursor.close()
        conn.close()