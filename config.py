import os
from dotenv import load_dotenv

# Muat naik fail .env
load_dotenv()

class Config:
    """Konfigurasi Tetapan Asas Admin Panel"""
    SECRET_KEY = os.getenv("SECRET_KEY", "kunci-rahsia-admin-sangat-selamat")
    DATABASE_URL = os.getenv("DATABASE_URL")
    PORT = 5000  # Tetapan manual port 5000
    
    # Tetapan Khusus YubiKey Admin
    YUBIKEY_EXPECTED_ID = "architech-yubikey-secure-token-2026"
    
# Tetapan luaran untuk diimport ke fail lain
DATABASE_URL = Config.DATABASE_URL
SECRET_KEY = Config.SECRET_KEY
PORT = Config.PORT
YUBIKEY_EXPECTED_ID = Config.YUBIKEY_EXPECTED_ID