function appData() {
    return {
        isLoggedIn: false,
        clientTab: 'dashboard',
        loginForm: { username: '', password: '' },
        showPassword: false,
        loginError: '',
        currentUser: null,
        clients: [],
        liveChats: [],
        activeChat: null,
        replyText: '',
        clientMessages: [],
        showInboxModal: false,
        showMsgDetailModal: false,
        selectedMessage: { senderTitle: '', date: '', content: '', index: null },
        brainPrompt: 'Anda adalah pembantu khidmat pelanggan profesional.',
        botSettings: { tone: 'professional' },
        clientBot: {
            botName: 'bot',
            planTier: 'v1 pro',
            memoryUsageMb: 220,
            tokenBalance: 1000
        },
        clientProfile: {
            companyName: '',
            logoUrl: '',
            address: '',
            facebookUrl: '',
            instagramUrl: '',
            bio: ''
        },
        affiliateData: {
            isAgent: false,
            walletBalance: 0.00,
            totalReferrals: 0,
            totalEarned: 0.00
        },
        affiliateForm: {
            agreed: false
        },
        affiliateBank: {
            bankName: '',
            accountNo: '',
            accountHolder: ''
        },

        get hasUnreadMessages() {
            return this.clientMessages.some(m => !m.isRead);
        },

        init() {
            const saved = localStorage.getItem('leea_admin_clients');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed)) {
                        this.clients = parsed.filter(c => {
                            const u = (c.username || '').toLowerCase();
                            const comp = (c.companyName || '').toLowerCase();
                            return !u.includes('architech') && !comp.includes('architech');
                        });
                    }
                } catch(e) {}
            }

            const user = localStorage.getItem('leea_current_user');
            if (user) {
                try {
                    const parsedUser = JSON.parse(user);
                    const uname = (parsedUser.username || '').toLowerCase();
                    if (uname.includes('architech')) {
                        this.logout();
                    } else {
                        const matchedClient = this.clients.find(c => c.username === parsedUser.username);
                        if (matchedClient) {
                            this.currentUser = parsedUser;
                            this.isLoggedIn = true;
                            if (matchedClient.planTier) {
                                this.clientBot.planTier = matchedClient.planTier;
                            }
                            if (matchedClient.tokenBalance) {
                                this.clientBot.tokenBalance = matchedClient.tokenBalance;
                            }
                            this.fetchLiveChats();
                            this.loadClientMessages();
                            this.loadCompanyProfileData();
                            this.loadBrainSettings();
                            this.loadAffiliateData();
                        } else {
                            this.logout();
                        }
                    }
                } catch(e) {
                    this.logout();
                }
            }

            setInterval(() => {
                if (this.isLoggedIn) {
                    this.fetchLiveChats();
                    this.loadClientMessages();
                }
            }, 4000);
        },

        scrollToBottom() {
            if (this.$refs.chatContainer) {
                this.$refs.chatContainer.scrollTop = this.$refs.chatContainer.scrollHeight;
            }
        },

        openMessageDetail(msg, index) {
            this.selectedMessage = { ...msg, index: index };
            this.showMsgDetailModal = true;
            if (!msg.isRead) {
                this.clientMessages[index].isRead = true;
                this.saveClientMessagesState();
            }
        },

        deleteSelectedMessage() {
            if (confirm('Adakah anda pasti untuk memadam mesej ini?')) {
                let deletedList = JSON.parse(localStorage.getItem('leea_deleted_msgs_' + this.currentUser.username) || '[]');
                deletedList.push({ content: this.selectedMessage.content, date: this.selectedMessage.date });
                localStorage.setItem('leea_deleted_msgs_' + this.currentUser.username, JSON.stringify(deletedList));

                this.clientMessages.splice(this.selectedMessage.index, 1);
                this.saveClientMessagesState();
                this.showMsgDetailModal = false;
            }
        },

        buyTokenWithWallet(packageSize) {
            let cost = packageSize === 500 ? 300 : 500;
            if (this.affiliateData.walletBalance < cost) {
                alert('Baki E-Wallet anda tidak mencukupi untuk pembelian ' + packageSize + ' token (Keperluan: RM ' + cost + '.00).');
                return;
            }
            
            if (confirm('Adakah anda pasti untuk menebus ' + packageSize + ' token menggunakan baki E-Wallet (RM ' + cost + '.00)? Permohonan akan dihantar kepada Admin untuk kelulusan.')) {
                this.affiliateData.walletBalance -= cost;
                this.saveAffiliateDataToStorage();
                alert('Permohonan pembelian ' + packageSize + ' token menggunakan E-Wallet telah berjaya dihantar kepada Administrator untuk disahkan.');
            }
        },

        saveClientMessagesState() {
            if (!this.currentUser) return;
            localStorage.setItem('leea_client_inbox_state_' + this.currentUser.username, JSON.stringify(this.clientMessages));
        },

        handleBotUpgrade() {
            alert('Pautan halaman upgrade bot sedang dikonfigurasi. Sila hubungi Administrator Master untuk menaik taraf pelan anda.');
        },

        handleLogoUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.clientProfile.logoUrl = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        },

        loadCompanyProfileData() {
            if (!this.currentUser) return;
            const savedProfile = localStorage.getItem('leea_client_profile_' + this.currentUser.username);
            if (savedProfile) {
                try {
                    this.clientProfile = JSON.parse(savedProfile);
                } catch(e) {}
            } else {
                this.clientProfile = {
                    companyName: this.currentUser.username,
                    logoUrl: '',
                    address: '',
                    facebookUrl: '',
                    instagramUrl: '',
                    bio: 'Sistem automasi pintar perniagaan berteraskan AI.'
                };
            }
        },

        saveClientCompanyProfile() {
            if (!this.currentUser) return;
            const updatedName = (this.clientProfile.companyName || '').toLowerCase();
            if (updatedName.includes('architech')) {
                alert('Keselamatan Sistem: Penggunaan nama atau keyword "architech" / "architech laboratory" adalah dilarang sama sekali.');
                return;
            }
            localStorage.setItem('leea_client_profile_' + this.currentUser.username, JSON.stringify(this.clientProfile));
            if (this.clientProfile.companyName) {
                this.currentUser.username = this.clientProfile.companyName;
                localStorage.setItem('leea_current_user', JSON.stringify(this.currentUser));
            }
            alert('Profil syarikat dan logo berjaya disimpan!');
        },

        loadBrainSettings() {
            if (!this.currentUser) return;
            const savedBrain = localStorage.getItem('leea_brain_settings_' + this.currentUser.username);
            if (savedBrain) {
                try {
                    const parsed = JSON.parse(savedBrain);
                    this.brainPrompt = parsed.prompt || this.brainPrompt;
                    this.botSettings = parsed.settings || this.botSettings;
                    if (parsed.botName) this.clientBot.botName = parsed.botName;
                } catch(e) {}
            } else {
                this.clientBot.botName = this.currentUser.username + '-bot';
            }
        },

        saveBrainSettings() {
            if (!this.currentUser) return;
            const dataToSave = {
                prompt: this.brainPrompt,
                settings: this.botSettings,
                botName: this.clientBot.botName
            };
            localStorage.setItem('leea_brain_settings_' + this.currentUser.username, JSON.stringify(dataToSave));
            alert('Tetapan Brain Bot, nama identiti, dan persona berjaya disimpan!');
        },

        loadAffiliateData() {
            if (!this.currentUser) return;
            const savedAff = localStorage.getItem('leea_affiliate_' + this.currentUser.username);
            if (savedAff) {
                try {
                    const parsed = JSON.parse(savedAff);
                    this.affiliateData = parsed.data || this.affiliateData;
                    this.affiliateBank = parsed.bank || this.affiliateBank;
                } catch(e) {}
            }
        },

        registerAffiliateAgent() {
            if (!this.affiliateForm.agreed) {
                alert('Sila bersetuju dengan terma & syarat terlebih dahulu.');
                return;
            }
            this.affiliateData.isAgent = true;
            this.saveAffiliateDataToStorage();
            alert('Tahniah! Anda kini rasmi berdaftar sebagai Agen Affiliate LEEA System.');
        },

        saveBankAccount() {
            if (!this.affiliateBank.bankName || !this.affiliateBank.accountNo || !this.affiliateBank.accountHolder) {
                alert('Sila lengkapkan maklumat akaun.');
                return;
            }
            this.saveAffiliateDataToStorage();
            alert('Maklumat akaun bank / DuitNow berjaya disimpan untuk urusan pembayaran komisen.');
        },

        saveAffiliateDataToStorage() {
            if (!this.currentUser) return;
            const payload = {
                data: this.affiliateData,
                bank: this.affiliateBank
            };
            localStorage.setItem('leea_affiliate_' + this.currentUser.username, JSON.stringify(payload));
        },

        copyAffiliateLink() {
            const link = 'https://leea-portal.vercel.app/?ref=' + this.currentUser.username;
            navigator.clipboard.writeText(link);
            alert('Pautan rujukan affiliate berjaya disalin ke papan keratan!');
        },

        requestWithdrawal() {
            if (this.affiliateData.walletBalance < 1.00) {
                alert('Minimum pengeluaran E-Wallet adalah RM1.00.');
                return;
            }
            if (!this.affiliateBank.accountNo) {
                alert('Sila tetapkan maklumat akaun bank atau DuitNow terlebih dahulu.');
                return;
            }
            
            const payoutAmount = this.affiliateData.walletBalance;
            
            if (confirm('Sahkan permohonan pengeluaran (payout) sebanyak RM ' + payoutAmount.toFixed(2) + '? Permohonan akan dihantar dan notifikasi e-mel keselamatan akan dikeluarkan.')) {
                
                const payoutPayload = {
                    timestamp: new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kuala_Lumpur' }),
                    type: 'payout_request',
                    sender: this.currentUser.username,
                    phone: this.affiliateBank.accountNo,
                    role: 'agent',
                    message: `[PERMOHONAN PAYOUT AFFILIATE]\nKlien: ${this.currentUser.username}\nJumlah: RM ${payoutAmount.toFixed(2)}\nBank: ${this.affiliateBank.bankName}\nAkaun: ${this.affiliateBank.accountNo}\nNama: ${this.affiliateBank.accountHolder}`
                };

                const emailClientPayload = {
                    timestamp: new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kuala_Lumpur' }),
                    type: 'payout_client_email',
                    sender: 'Master Administrator',
                    username: this.currentUser.username,
                    role: 'admin',
                    message: `[NOTIFIKASI KESELAMATAN: PERMOHONAN PENGELUARAN E-WALLET]\n\nHai ${this.currentUser.username},\n\nSistem kami telah menerima satu permohonan pengeluaran (payout) komisen sebanyak RM ${payoutAmount.toFixed(2)} daripada e-wallet affiliate anda ke akaun ${this.affiliateBank.bankName} (${this.affiliateBank.accountNo}).\n\n⚠️ PERHATIAN PENTING:\nSekiranya pengeluaran ini BUKAN dilakukan oleh pihak anda, sila hubungi team sokongan kami dengan kadar segera atau WhatsApp ke live chat support / live chat sokongan di talian 60183172114 untuk tindakan keselamatan.\n\nTerima kasih,\nTeam Architech Labs / LEEA System`
                };

                const gasEndpoint = "https://script.google.com/macros/s/AKfycbxaZ76G3wCvMLiNUxqksGR1ayEF8PvJHQ5MjjwYgMr8Ek7K1XLkRBLmSH_cZ7fEMjB-/exec";
                
                fetch(gasEndpoint, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payoutPayload)
                }).catch(err => console.error("Ralat hantar payout:", err));

                fetch(gasEndpoint, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(emailClientPayload)
                }).catch(err => console.error("Ralat hantar emel notifikasi klien:", err));

                alert('Permohonan pengeluaran sebanyak RM ' + payoutAmount.toFixed(2) + ' berjaya dihantar! E-mel notifikasi keselamatan telah dihantar kepada e-mel berdaftar anda.');
                
                this.affiliateData.walletBalance = 0;
                this.saveAffiliateDataToStorage();
            }
        },

        async loadClientMessages() {
            if (!this.currentUser) return;
            const inboxScriptUrl = "https://script.google.com/macros/s/AKfycbyu_sszjigSPdhk0ZCGfidw4co91_Cea-LjtFU4iH50ivfGMSnM5FxmKvrCPSrARRSA/exec?t=" + new Date().getTime();
            try {
                const res = await fetch(inboxScriptUrl);
                const data = await res.json();
                if (data && data.status === "success" && Array.isArray(data.data)) {
                    const msgs = [];
                    let deletedList = JSON.parse(localStorage.getItem('leea_deleted_msgs_' + this.currentUser.username) || '[]');

                    data.data.forEach(row => {
                        const rowType = String(row.type || '').trim().toLowerCase();
                        const rowRole = String(row.role || '').trim().toLowerCase();
                        
                        if (rowType === 'inbox' || rowRole === 'admin' || rowType === 'admin') {
                            const target = String(row.targetClient || 'ALL').trim();
                            if (target === 'ALL' || target.toLowerCase() === this.currentUser.username.toLowerCase()) {
                                let formattedInboxTime = '';
                                if (row.timestamp) {
                                    try {
                                        let rawTs = String(row.timestamp).trim();
                                        if (rawTs.match(/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/)) {
                                            rawTs = rawTs.replace(' ', 'T') + 'Z';
                                        } else if (!rawTs.endsWith('Z') && !rawTs.includes('+') && rawTs.includes('T')) {
                                            rawTs += 'Z';
                                        }
                                        const d = new Date(rawTs);
                                        if (!isNaN(d.getTime())) {
                                            formattedInboxTime = d.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kuala_Lumpur', hour: '2-digit', minute: '2-digit', hour12: false });
                                        } else {
                                            formattedInboxTime = rawTs.substring(11, 16);
                                        }
                                    } catch (e) {
                                        formattedInboxTime = String(row.timestamp).substring(11, 16);
                                    }
                                }

                                const msgContent = row.message || '';
                                const msgDate = (row.timestamp ? String(row.timestamp).substring(0, 10) + ' ' : '') + formattedInboxTime;

                                const isDeleted = deletedList.some(d => d.content === msgContent && d.date === msgDate);

                                if (!isDeleted && msgContent !== '') {
                                    msgs.push({
                                        senderTitle: row.sender || 'Master Administrator',
                                        date: msgDate,
                                        content: msgContent,
                                        isRead: false
                                    });
                                }
                            }
                        }
                    });

                    const savedState = localStorage.getItem('leea_client_inbox_state_' + this.currentUser.username);
                    if (savedState) {
                        try {
                            const parsedState = JSON.parse(savedState);
                            msgs.forEach(m => {
                                const foundMatch = parsedState.find(s => s.content === m.content && s.date === m.date);
                                if (foundMatch) {
                                    m.isRead = foundMatch.isRead;
                                }
                            });
                        } catch(e) {}
                    }

                    this.clientMessages = msgs.reverse();
                }
            } catch(err) {
                console.error("Gagal tarik mesej inbox:", err);
            }
        },

        async fetchLiveChats() {
            const url = "https://script.google.com/macros/s/AKfycbyTMhmYpFMzbEzGM8NoUTczMZU87PUmuq64HLd4gC7PzUgBiILKWohT_RGa6xyi7pMAVw/exec?t=" + new Date().getTime();
            try {
                const res = await fetch(url);
                const data = await res.json();
                if (data && data.status === "success" && Array.isArray(data.data)) {
                    const chatMap = {};
                    let lastPhone = "";

                    data.data.forEach(row => {
                        if (row.type && row.type !== 'chat') return;

                        let phone = row.phone ? String(row.phone).trim() : lastPhone;
                        if (!phone || phone === "Unknown") phone = lastPhone;
                        else lastPhone = phone;

                        if (!phone) return;

                        const cleanPhone = phone.replace(/[^0-9]/g, '');
                        if (!chatMap[cleanPhone]) {
                            chatMap[cleanPhone] = { id: 'chat-' + cleanPhone, phone: cleanPhone, lastMessage: '', time: '', messages: [] };
                        }
                        
                        if (row.message) {
                            let formattedTime = '';
                            if (row.timestamp) {
                                try {
                                    let rawTs = String(row.timestamp).trim();
                                    if (rawTs.match(/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/)) {
                                        rawTs = rawTs.replace(' ', 'T') + 'Z';
                                    } else if (!rawTs.endsWith('Z') && !rawTs.includes('+') && rawTs.includes('T')) {
                                        rawTs += 'Z';
                                    }
                                    const d = new Date(rawTs);
                                    if (!isNaN(d.getTime())) {
                                        formattedTime = d.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kuala_Lumpur', hour: '2-digit', minute: '2-digit', hour12: false });
                                    } else {
                                        formattedTime = rawTs.substring(11, 16);
                                    }
                                } catch (e) {
                                    formattedTime = String(row.timestamp).substring(11, 16);
                                }
                            }

                            chatMap[cleanPhone].messages.push({
                                sender: row.role || 'customer',
                                text: row.message,
                                time: formattedTime
                            });
                            chatMap[cleanPhone].lastMessage = row.message;
                            chatMap[cleanPhone].time = formattedTime;
                        }
                    });

                    this.liveChats = Object.values(chatMap);
                    if (this.liveChats.length > 0 && !this.activeChat) {
                        this.activeChat = this.liveChats[0];
                        this.$nextTick(() => { this.scrollToBottom(); });
                    }
                }
            } catch (err) {
                console.error("Gagal tarik data chat:", err);
            }
        },

        sendReply() {
            if (!this.replyText.trim() || !this.activeChat) return;
            this.activeChat.messages.push({ sender: 'agent', text: this.replyText, time: 'Now' });
            this.activeChat.lastMessage = this.replyText;
            this.replyText = '';
            this.$nextTick(() => { this.scrollToBottom(); });
        },

        login() {
            const usernameInput = this.loginForm.username.toLowerCase();
            if (usernameInput.includes('architech')) {
                this.loginError = 'Akaun ini telah dilupuskan dan tidak dibenarkan!';
                return;
            }

            const saved = localStorage.getItem('leea_admin_clients');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed)) {
                        this.clients = parsed.filter(c => {
                            const u = (c.username || '').toLowerCase();
                            const comp = (c.companyName || '').toLowerCase();
                            return !u.includes('architech') && !comp.includes('architech');
                        });
                    }
                } catch(e) {}
            }

            const found = this.clients.find(c => c.username === this.loginForm.username && c.password === this.loginForm.password);
            if (found) {
                const nowString = new Date().toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true });
                this.currentUser = { username: found.username, clientId: found.clientId || 'CLI-1001', status: found.status || 'Paid 🟢', expiryDate: found.expiryDate || '27/09/2026', lastLogin: nowString };
                this.isLoggedIn = true;
                this.clientBot.botName = found.username + '-bot';
                this.clientBot.planTier = found.planTier || 'v1 pro';
                if (found.tokenBalance) {
                    this.clientBot.tokenBalance = found.tokenBalance;
                }
                localStorage.setItem('leea_current_user', JSON.stringify(this.currentUser));
                this.fetchLiveChats();
                this.loadClientMessages();
                this.loadCompanyProfileData();
                this.loadBrainSettings();
                this.loadAffiliateData();
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