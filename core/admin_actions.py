import os
import uuid
import psycopg2
from psycopg2.extras import RealDictCursor
from werkzeug.security import generate_password_hash
from database import get_db_connection
from utils.drive_backup import setup_new_client_drive

def create_client_account(nama_syarikat, username, email_pengguna, no_telefon, no_wa_bot, url_server, jumlah_token, tarikh_luput, raw_password):
    """Fungsi mendaftarkan akaun klien baru, auto-jana bot_token unik, simpan DB, dan auto-bina folder Drive & Sheet"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Pastikan kolum bot_token wujud secara automatik dalam jadual clients
        cursor.execute("ALTER TABLE clients ADD COLUMN IF NOT EXISTS bot_token VARCHAR(100);")
        conn.commit()
        
        # Semak sama ada username atau email sudah wujud
        cursor.execute("SELECT id FROM clients WHERE username = %s OR email_pengguna = %s", (username, email_pengguna))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return False, "ID Log Masuk (Username) atau Email tersebut telah berdaftar!"
            
        # Hash kata laluan
        password_hash = generate_password_hash(raw_password)
        
        # Jana ID/Token Bot secara automatik (Contoh: bot_perusahaanabc_a1b2c3)
        clean_name = "".join(e for e in nama_syarikat if e.isalnum()).lower()
        generated_bot_token = f"bot_{clean_name}_{uuid.uuid4().hex[:6]}"
        
        # Masukkan data ke dalam pangkalan data beserta auto-generated bot_token
        cursor.execute("""
            INSERT INTO clients (nama_syarikat, username, email_pengguna, no_telefon, no_wa_bot, url_server, token_balance, tarikh_luput, password_hash, plain_password, bot_token)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id;
        """, (nama_syarikat, username, email_pengguna, no_telefon, no_wa_bot, url_server, jumlah_token, tarikh_luput, password_hash, raw_password, generated_bot_token))
        
        new_client = cursor.fetchone()
        client_id = new_client['id'] if isinstance(new_client, dict) else new_client[0]
        
        conn.commit()
        cursor.close()
        conn.close()
        
        # Automasi Google Drive: Cipta folder khas & spreadsheet untuk klien
        try:
            folder_id, sheet_id = setup_new_client_drive(client_id, nama_syarikat)
            if folder_id and sheet_id:
                conn = get_db_connection()
                cursor = conn.cursor()
                cursor.execute("""
                    UPDATE clients SET drive_folder_id = %s, drive_sheet_id = %s WHERE id = %s;
                """, (folder_id, sheet_id, client_id))
                conn.commit()
                cursor.close()
                conn.close()
        except Exception as drive_err:
            print(f"Nota (Drive Automasi): Gagal menyambung ke Google Drive - {drive_err}")

        return True, f"Akaun untuk {nama_syarikat} berjaya didaftarkan dengan ID Bot automatik!"
        
    except Exception as e:
        return False, str(e)

def get_all_clients():
    """Mendapatkan senarai semua klien berdaftar untuk dipaparkan di Admin Dashboard"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT id, username, nama_syarikat, email_pengguna, no_telefon, no_wa_bot, url_server, token_balance, tarikh_luput, plain_password, bot_token 
            FROM clients 
            ORDER BY id DESC;
        """)
        clients = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Format ID klien dan pastikan bot_token tidak kosong bagi data lama
        formatted_clients = []
        for c in clients:
            client_dict = dict(c)
            client_dict['format_id'] = f"CLI-{str(client_dict['id']).zfill(3)}"
            if not client_dict.get('bot_token'):
                client_dict['bot_token'] = f"bot_{str(client_dict['username']).lower()}_auto"
            formatted_clients.append(client_dict)
            
        return formatted_clients
    except Exception as e:
        print(f"Ralat mendapatkan senarai klien: {e}")
        return []

def update_client_tokens(client_id, tokens_to_add):
    """Fungsi menambah baki token klien secara manual oleh admin"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE clients 
            SET token_balance = token_balance + %s 
            WHERE id = %s;
        """, (tokens_to_add, client_id))
        conn.commit()
        cursor.close()
        conn.close()
        return True, "Baki token klien berjaya dikemaskini!"
    except Exception as e:
        return False, str(e)

def update_client_bot_token(client_id, new_bot_token):
    """Fungsi mengemaskini token bot klien sekiranya perlu diubah secara manual"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE clients 
            SET bot_token = %s 
            WHERE id = %s;
        """, (new_bot_token, client_id))
        conn.commit()
        cursor.close()
        conn.close()
        return True, "Token bot klien berjaya dikemaskini!"
    except Exception as e:
        return False, str(e)