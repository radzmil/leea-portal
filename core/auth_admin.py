import os
import bcrypt
from database import get_db_connection

def check_thumbdrive_inserted():
    """
    Menyemak kehadiran pemacu fizikal secara senyap di latar belakang.
    """
    usb_path = "E:\\"
    return os.path.exists(usb_path)

def verify_admin_login(username, raw_password, *args, **kwargs):
    """
    Menyemak kelayakan log masuk admin:
    1. Pastikan peranti fizikal rahsia disambungkan.
    2. Semak username & password hash dalam database.
    """
    
    # 1. Semak pengesahan Kunci Fizikal (Secara senyap)
    if not check_thumbdrive_inserted():
        # Ayat notifikasi ditukar tepat seperti yang tuan arahkan
        return False, "PENGESAHAN KESELAMATAN TIDAK DIKESAN"

    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 2. Ambil data admin dari pangkalan data
        cursor.execute("SELECT * FROM admins WHERE username = %s", (username,))
        admin = cursor.fetchone()
        
        if not admin:
            return False, "ID Pengguna atau Kata Laluan salah."
            
        # 3. Semak kesahihan kata laluan
        stored_password_hash = admin['password_hash']
        if not bcrypt.checkpw(raw_password.encode('utf-8'), stored_password_hash.encode('utf-8')):
            return False, "ID Pengguna atau Kata Laluan salah."
            
        return True, "Log masuk berjaya disahkan oleh token keselamatan."
        
    except Exception as e:
        return False, f"Ralat sistem pengesahan: {str(e)}"
    finally:
        cursor.close()
        conn.close()