import os
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

# ID Parent Folder Google Drive utama yang Tuan berikan
PARENT_FOLDER_ID = '1goqibVvTjt5d0wQ8EG6K5npI9aDLy4kE'

def get_drive_service():
    """Autentikasi Google Drive API menggunakan fail credential JSON"""
    SCOPES = ['https://www.googleapis.com/auth/drive.v3', 'https://www.googleapis.com/auth/spreadsheets']
    # Pastikan laluan fail credential disesuaikan dengan projek Tuan (cth: credentials.json)
    creds_path = os.path.join(os.path.dirname(__file__), '../credentials.json')
    
    if not os.path.exists(creds_path):
        return None, None
        
    creds = Credentials.from_service_account_file(creds_path, scopes=SCOPES)
    drive_service = build('drive', 'v3', credentials=creds)
    sheets_service = build('sheets', 'v4', credentials=creds)
    return drive_service, sheets_service

def setup_new_client_drive(client_id_format, nama_syarikat):
    """Cipta folder khusus klien di dalam parent folder dan bina Google Sheet dengan tab pecahan"""
    drive_service, sheets_service = get_drive_service()
    
    if not drive_service or not sheets_service:
        # Jika fail credential tiada, pulangkan status simulasi / kosong untuk elak ralat sistem
        print("Amaran: Fail credentials.json Google API tidak dijumpai.")
        return False, None, None

    try:
        folder_name = f"{client_id_format} - {nama_syarikat}"
        
        # 1. Cipta folder klien di dalam Parent Folder utama Tuan
        folder_metadata = {
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder',
            'parents': [PARENT_FOLDER_ID]
        }
        folder = drive_service.files().create(body=folder_metadata, fields='id').execute()
        client_folder_id = folder.get('id')
        
        # 2. Cipta fail Google Sheet sandaran di dalam folder klien tersebut
        spreadsheet_name = f"Backup & Data - {client_id_format}"
        spreadsheet_body = {
            'properties': {'title': spreadsheet_name},
            'sheets': [
                {'properties': {'title': 'Log Aplikasi'}},
                {'properties': {'title': 'Memori Chat'}},
                {'properties': {'title': 'Sejarah Pembayaran'}}
            ]
        }
        
        spreadsheet = sheets_service.spreadsheets().create(body=spreadsheet_body, fields='spreadsheetId').execute()
        spreadsheet_id = spreadsheet.get('spreadsheetId')
        
        # 3. Pindahkan fail Google Sheet tadi secara fizikal ke dalam folder klien yang baru dicipta
        # Dapatkan parent sedia ada fail sheet
        file = drive_service.files().get(fileId=spreadsheet_id, fields='parents').execute()
        previous_parents = ",".join(file.get('parents', []))
        
        # Alih masuk ke folder klien dan buang dari root asal
        drive_service.files().update(
            fileId=spreadsheet_id,
            addParents=client_folder_id,
            removeParents=previous_parents,
            fields='id, parents'
        ).execute()
        
        return True, client_folder_id, spreadsheet_id
        
    except Exception as e:
        print(f"Ralat Google Drive Automation: {e}")
        return False, None, None