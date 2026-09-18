import sys
import os

# Tambah direktori semasa ke laluan sistem modul Python
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from main_admin import app as application