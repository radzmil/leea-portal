import datetime

def log_admin_activity(admin_username, action_description):
    """Merekodkan aktiviti admin ke dalam fail log teks tempatan"""
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"[{timestamp}] ADMIN: {admin_username} - {action_description}\n"
    
    try:
        with open("admin_activity.log", "a", encoding="utf-8") as log_file:
            log_file.write(log_entry)
        return True
    except Exception as e:
        print(f"Ralat menulis fail log: {e}")
        return false