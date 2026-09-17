function appData() {
    return {
        isLoggedIn: false,
        clientTab: 'dashboard',
        loginForm: { username: '', password: '' },
        loginError: '',
        currentUser: null,
        clients: [],
        liveChats: [],
        activeChat: null,
        clientMessages: [],
        showInboxModal: false,
        affiliateData: { isAgent: false, walletBalance: 0.00 },

        get hasUnreadMessages() { return this.clientMessages.some(m => !m.isRead); },

        init() {
            const saved = localStorage.getItem('leea_admin_clients');
            if (saved) {
                try {
                    this.clients = JSON.parse(saved);
                } catch(e) {}
            }
            const user = localStorage.getItem('leea_current_user');
            if (user) {
                try {
                    this.currentUser = JSON.parse(user);
                    this.isLoggedIn = true;
                } catch(e) { this.logout(); }
            }
        },

        login() {
            const found = this.clients.find(c => c.username === this.loginForm.username && c.password === this.loginForm.password);
            if (found) {
                this.currentUser = { username: found.username, clientId: 'CLI-1001', status: 'Paid 🟢', expiryDate: '27/09/2026' };
                this.isLoggedIn = true;
                localStorage.setItem('leea_current_user', JSON.stringify(this.currentUser));
            } else {
                this.loginError = 'ID atau Katalaluan Salah!';
            }
        },

        logout() {
            this.isLoggedIn = false;
            this.currentUser = null;
            localStorage.removeItem('leea_current_user');
        }
    }
}