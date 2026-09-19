from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
import requests
from config import SECRET_KEY, PORT, YUBIKEY_EXPECTED_ID
from core.auth_admin import verify_admin_login
from core.admin_actions import create_client_account, get_all_clients, update_client_tokens
from utils.logger import log_admin_activity
from database import get_db_connection
from psycopg2.extras import RealDictCursor

app = Flask(__name__)
app.secret_key = SECRET_KEY

# Inisialisasi Flask-Limiter untuk perlindungan dari serangan Brute Force (Rate Limiting)
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

UPLOAD_FOLDER = 'static/uploads'
try:
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
except OSError:
    pass  # Abaikan ralat sistem fail baca-sahaja di Vercel

@app.route('/')
def index():
    """Halaman utama pintu masuk Admin Panel"""
    return render_template('index.html')

@app.route('/admin/login', methods=['GET', 'POST'])
@limiter.limit("5 per minute")  # Sekatan maksimum 5 percubaan log masuk seminit untuk Admin
def admin_login():
    """Proses log masuk admin menggunakan Password + YubiKey"""
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        yubikey_id = request.form.get('yubikey_id')
        
        success, message = verify_admin_login(username, password, yubikey_id)
        
        if success:
            session['admin_logged_in'] = True
            session['admin_username'] = username
            log_admin_activity(username, "Berjaya log masuk ke Admin Panel.")
            flash(message, "success")
            return redirect(url_for('admin_dashboard'))
        else:
            log_admin_activity(username or "Unknown", f"Gagal log masuk: {message}")
            flash(message, "danger")
            
    return render_template('admin_login.html')

@app.route('/admin/dashboard')
def admin_dashboard():
    """Panel kawalan utama admin (Papar senarai klien & urus token)"""
    if not session.get('admin_logged_in'):
        flash("Sila log masuk terlebih dahulu!", "warning")
        return redirect(url_for('admin_login'))
        
    clients = get_all_clients()
    return render_template('admin_dashboard.html', clients=clients)

@app.route('/admin/client/register', methods=['POST'])
def register_client():
    """Tindakan admin mendaftarkan klien baru dengan butiran lengkap & automasi Drive"""
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin_login'))
        
    nama_syarikat = request.form.get('nama_syarikat')
    username = request.form.get('username') or request.form.get('client_username')
    email_pengguna = request.form.get('email_pengguna')
    no_telefon = request.form.get('no_telefon')
    no_wa_bot = request.form.get('no_wa_bot')
    url_server = request.form.get('url_server')
    
    try:
        jumlah_token = int(request.form.get('jumlah_token', 1000))
    except (ValueError, TypeError):
        jumlah_token = 1000
        
    tarikh_luput = request.form.get('tarikh_luput')
    raw_password = request.form.get('password') or request.form.get('client_password')
    
    success, message = create_client_account(
        nama_syarikat=nama_syarikat,
        username=username,
        email_pengguna=email_pengguna,
        no_telefon=no_telefon,
        no_wa_bot=no_wa_bot,
        url_server=url_server,
        jumlah_token=jumlah_token,
        tarikh_luput=tarikh_luput,
        raw_password=raw_password
    )
    
    if success:
        log_admin_activity(session['admin_username'], f"Mendaftarkan klien baru: {nama_syarikat} ({username})")
        
        # Automasi Google Drive (Sheet pecahan klien) guna Webhook BARU
        try:
            gas_webhook_url = "https://script.google.com/macros/s/AKfycbwKUDjft8PtsHNityg8M3o9CTkdt_DKX4LC6f60TxKih9TSPC94Ic8t6uJw_tlgSeqTsw/exec"
            
            payload = {
                "action": "CREATE_CLIENT_DB",
                "client_name": nama_syarikat.replace(" ", "_")
            }
            res = requests.post(gas_webhook_url, json=payload, timeout=20)
            res_data = res.json()
            
            if res_data.get("success"):
                flash(f"{message} (Folder & DB Sheet berjaya dicipta di Google Drive!)", "success")
            else:
                flash(f"{message} (Akaun berjaya didaftarkan, tapi DB Sheet gagal dicipta: {res_data.get('error')})", "warning")
        except Exception as e:
            flash(f"{message} (Ralat sambungan ke automasi Google Drive)", "warning")
            
    else:
        flash(f"Ralat pendaftaran: {message}", "danger")
        
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/client/topup', methods=['POST'])
def topup_client_tokens():
    """Tindakan admin menambah token klien secara manual"""
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin_login'))
        
    client_id = request.form.get('client_id')
    try:
        tokens_to_add = int(request.form.get('tokens', 0))
    except (ValueError, TypeError):
        tokens_to_add = 0
    
    success, message = update_client_tokens(client_id, tokens_to_add)
    if success:
        log_admin_activity(session['admin_username'], f"Menambah {tokens_to_add} token untuk ID klien: {client_id}")
        flash(message, "success")
    else:
        flash(f"Ralat kemaskini token: {message}", "danger")
        
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/client/delete', methods=['POST'])
def delete_client():
    """Tindakan admin memadam akaun klien yang tidak diperlukan dari database"""
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin_login'))
        
    client_id = request.form.get('client_id')
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM clients WHERE id = %s", (client_id,))
        conn.commit()
        cursor.close()
        conn.close()
        
        log_admin_activity(session['admin_username'], f"Memadam akaun klien dengan ID: {client_id}")
        flash("Akaun klien berjaya dipadam dari sistem!", "success")
    except Exception as e:
        flash(f"Ralat memadam klien: {e}", "danger")
        
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/client/update_bot', methods=['POST'])
def admin_update_bot():
    """Tindakan admin menyambungkan Zulfa-Bot kepada klien tertentu"""
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin_login'))
        
    client_id = request.form.get('client_id')
    bot_id_token = request.form.get('bot_id_token')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE clients SET bot_token = %s WHERE id = %s", (bot_id_token, client_id))
        conn.commit()
    except Exception:
        conn.rollback()
        cursor.execute("ALTER TABLE clients ADD COLUMN IF NOT EXISTS bot_token TEXT;")
        cursor.execute("UPDATE clients SET bot_token = %s WHERE id = %s", (bot_id_token, client_id))
        conn.commit()
        
    cursor.close()
    conn.close()
    
    log_admin_activity(session['admin_username'], f"Menyambungkan bot ({bot_id_token}) untuk ID klien: {client_id}")
    flash("Sambungan Zulfa-Bot ke klien berjaya ditetapkan oleh Admin!", "success")
    
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/logout')
def admin_logout():
    """Log keluar admin"""
    admin_name = session.get('admin_username', 'Unknown')
    log_admin_activity(admin_name, "Log keluar dari Admin Panel.")
    session.clear()
    flash("Sesi admin telah ditamatkan.", "info")
    return redirect(url_for('admin_login'))


# --- LALUAN PORTAL KLIEN ---

@app.route('/client/login', methods=['GET', 'POST'])
@limiter.limit("5 per minute")  # Sekatan maksimum 5 percubaan log masuk seminit untuk Klien
def client_login():
    """Proses log masuk khusus untuk klien menggunakan Username & Password"""
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM clients WHERE username = %s", (username,))
        client = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if client:
            stored_hash = client.get('password_hash', '')
            login_valid = False
            
            if stored_hash and len(stored_hash) > 5:
                try:
                    login_valid = check_password_hash(stored_hash, password)
                except Exception:
                    login_valid = (password == 'defaultpass123')
            else:
                login_valid = (password == 'defaultpass123' or password == client.get('plain_password'))
                
            if login_valid:
                session['client_logged_in'] = True
                session['client_username'] = client['username']
                session['client_id'] = client['id']
                flash(f"Selamat datang, {client['nama_syarikat']}!", "success")
                return redirect(url_for('client_dashboard'))
                
        flash("ID Log Masuk atau Kata Sandi salah!", "danger")
            
    return render_template('client_login.html')

@app.route('/client/dashboard')
def client_dashboard():
    """Papan pemuka khas untuk klien melihat baki token & status"""
    if not session.get('client_logged_in'):
        flash("Sila log masuk akaun klien terlebih dahulu!", "warning")
        return redirect(url_for('client_login'))
        
    client_id = session.get('client_id')
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM clients WHERE id = %s", (client_id,))
    client = cursor.fetchone()
    cursor.close()
    conn.close()
    
    return render_template('client_dashboard.html', client=client)

@app.route('/api/client/messages/<int:client_id>')
def api_get_client_messages(client_id):
    """API Endpoint untuk memuat turun mesej sebenar secara live ke Dashboard Klien"""
    if not session.get('client_logged_in') or session.get('client_id') != client_id:
        return jsonify({"error": "Unauthorized"}), 401
        
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute("""
            SELECT sender, message, timestamp 
            FROM messages 
            WHERE client_id = %s 
            ORDER BY timestamp DESC LIMIT 50
        """, (client_id,))
        messages = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(messages)
    except Exception as e:
        if cursor: cursor.close()
        if conn: conn.close()
        return jsonify([])

@app.route('/api/client/senders/<int:client_id>')
def api_get_client_senders(client_id):
    """API untuk mendapatkan senarai nombor telefon pengirim yang unik bagi klien tertentu"""
    if not session.get('client_logged_in') or session.get('client_id') != client_id:
        return jsonify({"error": "Unauthorized"}), 401
        
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute("""
            SELECT DISTINCT sender 
            FROM messages 
            WHERE client_id = %s AND sender NOT IN ('Admin', 'Zulfa (Bot)')
            ORDER BY sender DESC;
        """, (client_id,))
        senders = [row['sender'] for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        return jsonify(senders)
    except Exception as e:
        if cursor: cursor.close()
        if conn: conn.close()
        return jsonify([])

@app.route('/api/client/chat/<int:client_id>', methods=['GET'])
def api_get_chat_by_sender(client_id):
    """API untuk memuat turun mesej mengikut nombor telefon pengirim tertentu"""
    if not session.get('client_logged_in') or session.get('client_id') != client_id:
        return jsonify({"error": "Unauthorized"}), 401
        
    phone = request.args.get('phone', '')
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute("""
            SELECT sender, message, timestamp 
            FROM messages 
            WHERE client_id = %s AND (sender = %s OR sender LIKE 'Zulfa%%' OR sender = 'Admin')
            ORDER BY timestamp ASC;
        """, (client_id, phone))
        messages = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(messages)
    except Exception as e:
        if cursor: cursor.close()
        if conn: conn.close()
        return jsonify([])

@app.route('/api/client/reply', methods=['POST'])
def api_client_manual_reply():
    """API untuk klien menghantar balasan manual (Human Touch) kepada pelanggan"""
    if not session.get('client_logged_in'):
        return jsonify({"error": "Unauthorized"}), 401
        
    data = request.json or {}
    client_id = session.get('client_id')
    recipient_phone = data.get('phone', '').strip()
    message_text = data.get('message', '').strip()
    
    if not recipient_phone or not message_text:
        return jsonify({"success": False, "error": "Maklumat tidak lengkap"}), 400
        
    try:
        # 1. Tarik token dari persekitaran Vercel
        token = os.getenv("WHATSAPP_TOKEN")
        phone_number_id = os.getenv("PHONE_NUMBER_ID", "1274341599093050")
        
        if not token:
            return jsonify({"success": False, "error": "WHATSAPP_TOKEN tidak dijumpai dalam Vercel Env."}), 400

        clean_phone = recipient_phone.replace("+", "").strip()
        
        url = f"https://graph.facebook.com/v19.0/{phone_number_id}/messages"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }
        payload = {
            "messaging_product": "whatsapp",
            "to": clean_phone,
            "type": "text",
            "text": {"body": message_text},
        }
        
        # 2. Hantar mesej ke WhatsApp Meta API DAHULU
        meta_res = requests.post(url, json=payload, headers=headers, timeout=10)
        
        # 3. Semak jika Meta tolak mesej tersebut
        if meta_res.status_code not in [200, 201]:
            # Jika gagal, ia akan popup amaran merah di dashboard mendedahkan punca ralat Meta
            return jsonify({"success": False, "error": f"Ditolak oleh Meta: {meta_res.text}"}), 400
            
        # 4. Jika berjaya hantar ke WhatsApp, baru simpan rekod ke dalam Supabase
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO messages (client_id, sender, message, timestamp)
            VALUES (%s, 'Admin', %s, NOW());
        """, (client_id, message_text))
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Balasan berjaya dihantar!"}), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/client/toggle-mode', methods=['POST'])
def api_toggle_client_mode():
    """API untuk menukar mod perbualan antara AI dan Human Touch menggunakan Supabase (Bebas Ralat Read-Only Vercel)"""
    if not session.get('client_logged_in'):
        return jsonify({"error": "Unauthorized"}), 401
        
    data = request.json or {}
    phone = data.get('phone', '').strip()
    mode = data.get('mode', 'ai').strip()
    client_id = session.get('client_id')
    
    if not phone:
        return jsonify({"success": False, "error": "Nombor telefon tidak sah"}), 400
        
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"success": False, "error": "Gagal menyambung ke pangkalan data"}), 500
            
        cursor = conn.cursor()
        
        # Cipta jadual storan mod jika belum wujud untuk elak ralat
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS chat_modes (
                client_id INT,
                phone VARCHAR(50),
                mode VARCHAR(20),
                PRIMARY KEY (client_id, phone)
            );
        """)
        
        # Simpan status mod ke Supabase untuk mengelakkan penggunaan fail fizikal
        cursor.execute("""
            INSERT INTO chat_modes (client_id, phone, mode)
            VALUES (%s, %s, %s)
            ON CONFLICT (client_id, phone) 
            DO UPDATE SET mode = EXCLUDED.mode;
        """, (client_id, phone.replace("+", "").strip(), mode))
        
        conn.commit()
        cursor.close()
        conn.close()
            
        return jsonify({"success": True, "message": f"Mod berjaya ditukar kepada {mode.upper()}!"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/client/update_profile', methods=['POST'])
def client_update_profile():
    """Tindakan klien menukar kata laluan dan memuat naik logo syarikat"""
    if not session.get('client_logged_in'):
        return redirect(url_for('client_login'))
        
    client_id = session.get('client_id')
    current_password = request.form.get('current_password')
    new_password = request.form.get('new_password')
    logo_file = request.files.get('logo_file')
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM clients WHERE id = %s", (client_id,))
    client = cursor.fetchone()
    
    if new_password and current_password:
        stored_hash = client.get('password_hash', '')
        password_valid = False
        
        if stored_hash and len(stored_hash) > 5:
            try:
                password_valid = check_password_hash(stored_hash, current_password)
            except Exception:
                password_valid = (current_password == 'defaultpass123')
        else:
            password_valid = (current_password == 'defaultpass123' or current_password == client.get('plain_password'))
            
        if password_valid:
            new_hash = generate_password_hash(new_password)
            cursor.execute("UPDATE clients SET password_hash = %s, plain_password = %s WHERE id = %s", (new_hash, new_password, client_id))
            conn.commit()
            flash("Kata laluan berjaya dikemaskini!", "success")
        else:
            flash("Kata laluan semasa salah!", "danger")
            cursor.close()
            conn.close()
            return redirect(url_for('client_dashboard'))
            
    if logo_file and logo_file.filename:
        filename = secure_filename(f"logo_client_{client_id}_{logo_file.filename}")
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        logo_file.save(filepath)
        logo_url = f"uploads/{filename}"
        
        try:
            cursor.execute("UPDATE clients SET logo_path = %s WHERE id = %s", (logo_url, client_id))
            conn.commit()
        except Exception:
            conn.rollback()
            cursor.execute("ALTER TABLE clients ADD COLUMN IF NOT EXISTS logo_path TEXT;")
            cursor.execute("UPDATE clients SET logo_path = %s WHERE id = %s", (logo_url, client_id))
            conn.commit()
            
        flash("Logo syarikat berjaya dimuat naik!", "success")
        
    cursor.close()
    conn.close()
    return redirect(url_for('client_dashboard'))

@app.route('/client/logout')
def client_logout():
    """Log keluar klien"""
    session.clear()
    flash("Sesi klien telah ditamatkan.", "info")
    return redirect(url_for('client_login'))


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=True)