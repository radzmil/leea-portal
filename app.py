from flask import Flask, render_template

# Inisialisasi aplikasi Flask
app = Flask(__name__)

@app.route('/')
def home():
    """
    Laluan utama (Route) untuk Leea Portal.
    Memaparkan index.html yang bertindak sebagai kerangka (dummy UI),
    manakala logik dan keselamatan diasingkan ke dalam fail static/js.
    """
    return render_template('index.html')

if __name__ == '__main__':
    # Pelayan dijalankan pada port 5000. 
    # debug=True diaktifkan untuk memudahkan fasa pembangunan lokal (local development).
    app.run(host='0.0.0.0', port=5000, debug=True)