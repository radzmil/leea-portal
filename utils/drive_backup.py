# utils/drive_backup.py (atau fail pengurusan Drive tuan)

from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

# Pastikan SCOPES merangkumi akses penuh ke Drive
SCOPES = ['https://www.googleapis.com/auth/drive']
SERVICE_ACCOUNT_FILE = 'credentials.json' # Fail rahsia API Google tuan

def get_drive_service():
    """Mendapatkan servis API Google Drive."""
    creds = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    return build('drive', 'v3', credentials=creds)

def setup_new_client_drive(client_id, nama_syarikat):
    """
    Fungsi untuk:
    1. Mencipta folder khusus untuk klien di Google Drive.
    2. Mencipta Google Sheet automatik di dalam folder tersebut.
    """
    service = get_drive_service()
    
    # Format nama folder: CLI-1001 - Perusahaan ABC
    folder_name = f"{client_id} - {nama_syarikat}"
    
    try:
        # 1. Cipta Folder Klien
        folder_metadata = {
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder'
            # 'parents': ['ID_FOLDER_UTAMA'] # (Pilihan) Buka komen jika mahu folder klien ini duduk dalam 1 Folder Induk
        }
        folder = service.files().create(body=folder_metadata, fields='id').execute()
        folder_id = folder.get('id')
        
        # 2. Cipta Google Sheet (Fail Backup) dalam Folder Klien
        sheet_metadata = {
            'name': f"Backup Data & Log - {nama_syarikat}",
            'mimeType': 'application/vnd.google-apps.spreadsheet',
            'parents': [folder_id] # Masukkan fail ini ke dalam folder klien tadi
        }
        sheet = service.files().create(body=sheet_metadata, fields='id').execute()
        sheet_id = sheet.get('id')
        
        return True, folder_id, sheet_id
        
    except Exception as e:
        print(f"Ralat Google Drive API: {str(e)}")
        return False, None, None