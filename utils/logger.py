import datetime

def log_admin_activity(admin_username, action_description):
    """Merekodkan aktiviti admin ke dalam fail log teks tempatan atau konsol Vercel"""
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"[{timestamp}] ADMIN: {admin_username} - {action_description}\n"
    
    try:
        with open("admin_activity.log", "a", encoding="utf-8") as log_file:
            log_file.write(log_entry)
        return True
    except OSError:
        # Jika pelayan read-only (seperti Vercel), hantar log terus ke konsol sistem
        print(log_entry.strip())
        return True
    except Exception as e:
        print(f"Ralat menulis fail log: {e}")
        return False