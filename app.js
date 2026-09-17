// app.js - Sistem Leea Enterprise Portal & Drive DB Sync
function appData() {
    return {
        isLoggedIn: false,
        clientTab: 'dashboard',
        loginForm: { username: '', password: '' },
        loginError: '',
        currentUser: null,
        
        // Storan pangkalan data JSON klien yang diselaraskan dari Google Drive
        clientDatabase: {
            profile: null,
            botBrain: null,
            chatHistory: [],
            auditTrail: [],
            inbox: [],
            dailyAudit: [],
            affiliate: null,
            paymentHistory: [],
            railwayDeployment: null
        },

        liveChats: [],
        activeChat: null,
        clientMessages: [],
        showInboxModal: false,
        affiliateData: { isAgent: false, walletBalance: 0.00 },

        get hasUnreadMessages() { return this.clientMessages.some(m => !m.isRead); },

        init() {
            const user = localStorage.getItem('leea_current_user');
            if (user) {
                try {
                    this.currentUser = JSON.parse(user);
                    this.isLoggedIn = true;
                    // Tarik kesemua fail sheet DB klien apabila sesi aktif dimuatkan[cite: 2, 6]
                    this.fetchAllClientSheetsFromDrive(this.currentUser.clientId || this.currentUser.username);
                } catch(e) { this.logout(); }
            }
        },

        async login() {
            this.loginError = '';
            try {
                const response = await fetch('/portal/api-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: this.loginForm.username,
                        password: this.loginForm.password
                    })
                });

                const result = await response.json();
                if (response.ok && result.status === 'success') {
                    this.currentUser = { 
                        username: result.client.username, 
                        clientId: result.client.clientId || result.client.username, 
                        status: result.client.status, 
                        expiryDate: result.client.expiryDate 
                    };
                    this.isLoggedIn = true;
                    localStorage.setItem('leea_current_user', JSON.stringify(this.currentUser));
                    
                    // Tarik kesemua data sheet DB dari Google Drive selepas log masuk berjaya[cite: 2, 6]
                    await this.fetchAllClientSheetsFromDrive(this.currentUser.clientId);
                } else {
                    this.loginError = result.message || 'ID atau Katalaluan Salah!';
                }
            } catch (err) {
                this.loginError = 'Ralat sambungan ke pelayan backend.';
            }
        },

        // Fungsi Ambil (Load) Kesemua Fail Sheet DB dari Google Drive Web App
        async fetchAllClientSheetsFromDrive(clientId) {
            try {
                console.log(`Menarik kesemua fail sheet DB untuk klien: ${clientId}`);
                const appsScriptUrl = `https://script.google.com/macros/s/AKfycbzr3TNpy10tvGYcqjRZxeCvXCscHlqid27_0dAcqmtZGJv-Epiekuq0aXx4JEV3BauaaQ/exec?action=get_db&client=${clientId}`;
                
                const response = await fetch(appsScriptUrl);
                const result = await response.json();
                
                if (result.success && result.data) {
                    // Masukkan data fail JSON ke dalam storan Alpine.js[cite: 2, 6]
                    this.clientDatabase.profile = result.data.client_profile || null;
                    this.clientDatabase.botBrain = result.data.bot_brain_config || null;
                    this.clientDatabase.chatHistory = result.data.chat_history_logs || [];
                    this.clientDatabase.auditTrail = result.data.client_audit_trail || [];
                    this.clientDatabase.inbox = result.data.client_inbox || [];
                    this.clientDatabase.dailyAudit = result.data.daily_system_audit || [];
                    this.clientDatabase.affiliate = result.data.e_wallet_affiliate || null;
                    this.clientDatabase.paymentHistory = result.data.payment_history || [];
                    this.clientDatabase.railwayDeployment = result.data.railway_deployment || null;
                    
                    // Sinkronisasi data e-wallet affiliate ke state tempatan jika ada
                    if (this.clientDatabase.affiliate) {
                        this.affiliateData.isAgent = this.clientDatabase.affiliate.isAgent || false;
                        this.affiliateData.walletBalance = this.clientDatabase.affiliate.walletBalance || 0.00;
                    }

                    console.log("Kesemua sheet DB Google Drive berjaya diselaraskan ke dashboard:", this.clientDatabase);
                }
            } catch (error) {
                console.error("Gagal menyelaraskan pangkalan data dari Google Drive:", error);
            }
        },

        // Fungsi Hantar & Simpan (Save) Perubahan ke Google Drive DB
        async saveSheetRecordToDrive(sheetName, payloadData) {
            if (!this.currentUser) return;
            try {
                const clientId = this.currentUser.clientId;
                console.log(`Menyimpan ${sheetName}.json ke Google Drive untuk ${clientId}...`);
                
                const appsScriptUrl = "https://script.google.com/macros/s/AKfycbzr3TNpy10tvGYcqjRZxeCvXCscHlqid27_0dAcqmtZGJv-Epiekuq0aXx4JEV3BauaaQ/exec";
                
                const response = await fetch(appsScriptUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Mengelakkan isu CORS preflight Google Apps Script[cite: 6]
                    body: JSON.stringify({
                        action: 'save_db',
                        client: clientId,
                        sheet: sheetName, // cth: 'client_profile', 'bot_brain_config'[cite: 2, 6]
                        data: payloadData
                    })
                });

                const result = await response.json();
                if (result.success) {
                    alert(`Perubahan pada ${sheetName} berjaya disimpan ke folder Google Drive!`);
                } else {
                    alert(`Gagal menyimpan ke Drive: ${result.error}`);
                }
            } catch (err) {
                console.error("Ralat rangkaian ketika menyimpan ke Drive:", err);
                alert("Ralat sambungan ke pangkalan data Drive.");
            }
        },

        logout() {
            this.isLoggedIn = false;
            this.currentUser = null;
            localStorage.removeItem('leea_current_user');
        }
    }
}