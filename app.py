from flask import Flask, render_template, request, jsonify
import json
import os

app = Flask(__name__)

# Simpan data klien di pelayan secara selamat (bukan lagi terdedah di front-end)
CLIENTS_FILE = 'clients_db.json'

def load_clients():
    if not os.path.exists(CLIENTS_FILE):
        return []
    with open(CLIENTS_FILE, 'r') as f:
        try:
            return json.load(f)
        except:
            return []

@app.route('/')
def home():
    return render_template('index.html')

# Endpoint API Pelayan untuk Log Masuk Selamat
@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    username = data.get('username', '').strip().lower()
    password = data.get('password', '').strip()
    
    # Halang cubaan akses akaun terlarang
    if 'architech' in username:
        return jsonify({'success': False, 'message': 'Akaun ini telah dilupuskan dan tidak dibenarkan!'}), 403
        
    clients = load_clients()
    matched = None
    for c in clients:
        if c.get('username', '').lower() == username and c.get('password') == password:
            matched = c
            break
            
    if matched:
        return jsonify({
            'success': True, 
            'user': {
                'username': matched.get('username'),
                'clientId': matched.get('clientId', 'CLI-1001'),
                'status': matched.get('status', 'Paid 🟢'),
                'expiryDate': matched.get('expiryDate', '27/09/2026')
            }
        })
    else:
        return jsonify({'success': False, 'message': 'ID atau Katalaluan Salah!'}), 401

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)