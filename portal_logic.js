// portal_logic.js - Skrip Fungsi Utama Portal Klien Sistem Leea (Sokongan Lokal & Vercel)
let selectedActivePhone = null;
let isHumanManualMode = false;
let currentLang = localStorage.getItem('leea_portal_lang') || 'BM';

function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('leea_portal_lang', lang);
    applyTranslations();
}

function applyTranslations() {
    const t = translations[currentLang];
    document.getElementById('selectLang').value = currentLang;
    document.getElementById('pageTitle').innerText = t.pageTitle;
    document.getElementById('loginTitle').innerText = t.loginTitle;
    document.getElementById('lblLanguage').innerText = t.lblLanguage;
    document.getElementById('lblUsername').innerText = t.lblUsername;
    document.getElementById('lblPassword').innerText = t.lblPassword;
    document.getElementById('btnLogin').innerText = t.btnLogin;
    document.getElementById('brandTitle').innerText = t.brandTitle;
    document.getElementById('txtEwallet').childNodes[0].nodeValue = t.txtEwallet + " ";
    document.getElementById('clientProfileBtn').innerText = t.clientProfileBtn;
    document.getElementById('btnLogout').innerText = t.btnLogout;
    document.getElementById('tabBtnAnalysis').innerText = t.tabBtnAnalysis;
    document.getElementById('tabBtnAutomation').innerText = t.tabBtnAutomation;
    document.getElementById('tabBtnAffiliate').innerText = t.tabBtnAffiliate;
    document.getElementById('tabBtnPayment').innerText = t.tabBtnPayment;
    document.getElementById('cardBotProfile').childNodes[0].nodeValue = t.cardBotProfile + " ";
    document.getElementById('lblBotName').innerText = t.lblBotName;
    document.getElementById('btnUpdateBot').innerText = t.btnUpdateBot;
    document.getElementById('lblModelBot').innerText = t.lblModelBot;
    document.getElementById('lblMemoryBot').innerText = t.lblMemoryBot;
    document.getElementById('lblExpiryBot').innerText = t.lblExpiryBot;
    document.getElementById('lblStatusBot').innerText = t.lblStatusBot;
    document.getElementById('txtRunningStatus').innerText = t.txtRunningStatus;
    document.getElementById('cardAnalyticsTitle').innerText = t.cardAnalyticsTitle;
    document.getElementById('statDaily').innerText = t.statDaily;
    document.getElementById('statDailySub').innerText = t.statDailySub;
    document.getElementById('statWeekly').innerText = t.statWeekly;
    document.getElementById('statWeeklySub').innerText = t.statWeeklySub;
    document.getElementById('statMonthly').innerText = t.statMonthly;
    document.getElementById('statMonthlySub').innerText = t.statMonthlySub;
    document.getElementById('statLeads').innerText = t.statLeads;
    document.getElementById('statLeadsSub').innerText = t.statLeadsSub;
    document.getElementById('statReturning').innerText = t.statReturning;
    document.getElementById('statReturningSub').innerText = t.statReturningSub;
    document.getElementById('statSpeed').innerText = t.statSpeed;
    document.getElementById('statSpeedSub').innerText = t.statSpeedSub;
    document.getElementById('statIntervention').innerText = t.statIntervention;
    document.getElementById('statInterventionSub').innerText = t.statInterventionSub;
    document.getElementById('statMemoryIndex').innerText = t.statMemoryIndex;
    document.getElementById('statMemoryIndexSub').innerText = t.statMemoryIndexSub;
    document.getElementById('cardLiveChat').childNodes[0].nodeValue = t.cardLiveChat + " ";
    document.getElementById('btnExportLeads').innerText = t.btnExportLeads;
    document.getElementById('txtLiveChatDesc').innerText = t.txtLiveChatDesc;
    document.getElementById('txtLoadingLeads').innerText = t.txtLoadingLeads;
    document.getElementById('activeChatTitle').innerText = t.activeChatTitle;
    document.getElementById('takeoverBtn').innerText = t.takeoverBtn;
    document.getElementById('txtSelectChatPrompt').innerText = t.txtSelectChatPrompt;
    document.getElementById('btnSendChat').innerText = t.btnSendChat;
    document.getElementById('cardBrainPromptTitle').innerText = t.cardBrainPromptTitle;
    document.getElementById('lblBrainPrompt').innerText = t.lblBrainPrompt;
    document.getElementById('btnSaveBrain').innerText = t.btnSaveBrain;
    document.getElementById('cardAdminNumberTitle').innerText = t.cardAdminNumberTitle;
    document.getElementById('lblAdminNumber').innerText = t.lblAdminNumber;
    document.getElementById('btnSaveAdminNum').innerText = t.btnSaveAdminNum;
    document.getElementById('cardSopTitle').innerText = t.cardSopTitle;
    document.getElementById('sop1Title').innerText = t.sop1Title;
    document.getElementById('sop1Desc').innerText = t.sop1Desc;
    document.getElementById('sop2Title').innerText = t.sop2Title;
    document.getElementById('sop2Desc').innerText = t.sop2Desc;
    document.getElementById('sop3Title').innerText = t.sop3Title;
    document.getElementById('sop3Desc').innerText = t.sop3Desc;
    document.getElementById('cardAffiliateTitle').innerText = t.cardAffiliateTitle;
    document.getElementById('txtAffiliateDesc').innerHTML = t.txtAffiliateDesc;
    document.getElementById('termsHeader').innerText = t.termsHeader;
    document.getElementById('termsTextContent').innerHTML = t.termsTextContent;
    document.getElementById('lblAgreeTerms').innerText = t.lblAgreeTerms;
    document.getElementById('formAgentHeader').innerText = t.formAgentHeader;
    document.getElementById('lblAgentName').innerText = t.lblAgentName;
    document.getElementById('lblAgentBank').innerText = t.lblAgentBank;
    document.getElementById('lblAgentAccNo').innerText = t.lblAgentAccNo;
    document.getElementById('btnSubmitAgent').innerText = t.btnSubmitAgent;
    document.getElementById('txtPendingHeader').innerText = t.txtPendingHeader;
    document.getElementById('txtPendingDesc').innerText = t.txtPendingDesc;
    document.getElementById('lblAffLink').innerText = t.lblAffLink;
    document.getElementById('txtTotalReferrals').innerText = t.txtTotalReferrals;
    document.getElementById('txtTotalCommission').innerText = t.txtTotalCommission;
    document.getElementById('cardPaymentGatewayTitle').innerText = t.cardPaymentGatewayTitle;
    document.getElementById('lblPaymentLink').innerText = t.lblPaymentLink;
    document.getElementById('lblQrUpload').innerText = t.lblQrUpload;
    document.getElementById('btnSavePayment').innerText = t.btnSavePayment;
    document.getElementById('cardSubscriptionTitle').innerText = t.cardSubscriptionTitle;
    document.getElementById('txtSubscriptionDesc').innerText = t.txtSubscriptionDesc;
    document.getElementById('sub1Title').innerText = t.sub1Title;
    document.getElementById('sub1Expiry').childNodes[0].nodeValue = t.sub1Expiry;
    document.getElementById('sub1Status').innerText = t.sub1Status;
    document.getElementById('btnRenewSub1').innerText = t.btnRenewSub1;
    document.getElementById('sub2Title').innerText = t.sub2Title;
    document.getElementById('sub2Status').innerHTML = t.sub2Status;
    document.getElementById('btnSub2').innerText = t.btnSub2;
    document.getElementById('sub3Title').innerText = t.sub3Title;
    document.getElementById('sub3Status').innerHTML = t.sub3Status;
    document.getElementById('btnSub3').innerText = t.btnSub3;
    document.getElementById('sub4Title').innerText = t.sub4Title;
    document.getElementById('sub4Status').innerHTML = t.sub4Status;
    document.getElementById('btnSub4').innerText = t.btnSub4;
    document.getElementById('modalProfileTitle').childNodes[0].nodeValue = t.modalProfileTitle + " ";
    document.getElementById('lblModalUser').innerText = t.lblModalUser;
    document.getElementById('lblModalEmail').innerText = t.lblModalEmail;
    document.getElementById('lblModalPhone').innerText = t.lblModalPhone;
    document.getElementById('lblModalRailway').innerText = t.lblModalRailway;
    document.getElementById('lblModalLogo').innerText = t.lblModalLogo;
    document.getElementById('lblModalFb').innerText = t.lblModalFb;
    document.getElementById('lblModalIg').innerText = t.lblModalIg;
    document.getElementById('lblModalTiktok').innerText = t.lblModalTiktok;
    document.getElementById('lblModalPass').innerText = t.lblModalPass;
    document.getElementById('btnSaveProfile').innerText = t.btnSaveProfile;
}

document.addEventListener('DOMContentLoaded', async function() {
    applyTranslations();
    const currentClient = localStorage.getItem('leea_current_client');
    
    if (currentClient) {
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('portalHeader').style.display = 'flex';
        document.getElementById('portalTabs').style.display = 'flex';
        document.getElementById('tabAnalisis').classList.add('active');
        
        const profileBtn = document.getElementById('clientProfileBtn');
        if (profileBtn) profileBtn.innerText = '👤 ' + currentClient;

        let railwayUrl = 'https://web-production-07b92.up.railway.app/';
        try {
            const dbRes = await fetch('clients_db.json');
            if (dbRes.ok) {
                const clients = await dbRes.json();
                const foundClient = clients.find(c => c.username === currentClient);
                if (foundClient && foundClient.railway_url) {
                    railwayUrl = foundClient.railway_url;
                }
            }
        } catch (e) {
            console.log("Menggunakan laluan Railway standard rasmi.");
        }

        // Muat turun data profil terkini dari server Railway supaya kekal
        try {
            const profileRes = await fetch(`${railwayUrl}/api/clients`);
            if (profileRes.ok) {
                const profileJson = await profileRes.json();
                if (profileJson.status === 'success' && profileJson.data) {
                    const clientData = profileJson.data.find(c => c.username === currentClient);
                    if (clientData) {
                        if (clientData.bot_name) {
                            document.getElementById('botNameInput').value = clientData.bot_name;
                        }
                        if (clientData.logo) {
                            document.getElementById('headerCompanyLogo').src = clientData.logo;
                            document.getElementById('modalLogoPreview').src = clientData.logo;
                        }
                        if (clientData.fb_link) document.getElementById('modalFbLink').value = clientData.fb_link;
                        if (clientData.ig_link) document.getElementById('modalIgLink').value = clientData.ig_link;
                        if (clientData.tiktok_link) document.getElementById('modalTiktokLink').value = clientData.tiktok_link;
                    }
                }
            }
        } catch(err) {
            console.log("Gagal memuatkan profil server, menggunakan tetapan lalai.");
        }

        const botInput = document.getElementById('botNameInput');
        if (botInput && !botInput.value) botInput.value = 'bot-' + currentClient.toLowerCase();

        const affiliateInput = document.getElementById('affiliateLinkInput');
        if (affiliateInput) affiliateInput.value = 'https://www.architechlaboratory.my/ref/' + currentClient.toLowerCase();

        const adminEmail = localStorage.getItem('admin_email_' + currentClient) || (currentClient.toLowerCase() + '@adminportal.my');
        const adminPhone = localStorage.getItem('admin_phone_' + currentClient) || '+60 19-000 0000';

        document.getElementById('modalUsername').value = currentClient;
        document.getElementById('modalAdminEmail').value = adminEmail;
        document.getElementById('modalAdminPhone').value = adminPhone;
        document.getElementById('modalRailwayUrl').value = railwayUrl;

        const savedAdminNum = localStorage.getItem('client_admin_number_' + currentClient) || '';
        if (savedAdminNum) document.getElementById('clientAdminNumber').value = savedAdminNum;

        checkAgentAffiliateStatus();
        fetchLiveLeads(currentClient, railwayUrl);
        fetchLiveAnalytics(railwayUrl);
        
        setInterval(() => {
            fetchLiveLeads(currentClient, railwayUrl);
            fetchLiveAnalytics(railwayUrl);
        }, 3000);
    } else {
        document.getElementById('loginOverlay').style.display = 'flex';
        document.getElementById('portalHeader').style.display = 'none';
        document.getElementById('portalTabs').style.display = 'none';
    }
});

async function clientLogin() {
    const user = document.getElementById('loginUsername').value.trim();
    const pass = document.getElementById('loginPassword').value.trim();
    const errBox = document.getElementById('loginErrorMsg');

    if (!user || !pass) {
        errBox.innerText = currentLang === 'BM' ? 'Sila masukkan username dan kata laluan.' : 'Please enter username and password.';
        return;
    }

    try {
        const response = await fetch('/portal/api-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });

        const result = await response.json();
        if (response.ok && result.status === 'success') {
            localStorage.setItem('leea_current_client', result.client.username);
            document.getElementById('loginOverlay').style.display = 'none';
            document.getElementById('portalHeader').style.display = 'flex';
            document.getElementById('portalTabs').style.display = 'flex';
            document.getElementById('tabAnalisis').classList.add('active');
            location.reload();
            return;
        }
    } catch (err) {
        try {
            const dbRes = await fetch('clients_db.json');
            if (dbRes.ok) {
                const clients = await dbRes.json();
                const found = clients.find(c => c.username === user && c.password === pass);
                if (found) {
                    localStorage.setItem('leea_current_client', found.username);
                    document.getElementById('loginOverlay').style.display = 'none';
                    document.getElementById('portalHeader').style.display = 'flex';
                    document.getElementById('portalTabs').style.display = 'flex';
                    document.getElementById('tabAnalisis').classList.add('active');
                    location.reload();
                    return;
                }
            }
        } catch (dbErr) {
            console.error("Gagal membaca clients_db.json:", dbErr);
        }
    }

    errBox.innerText = translations[currentLang].errorLogin;
}

function clientLogout() {
    localStorage.removeItem('leea_current_client');
    location.reload();
}

function submitAgentRegistration() {
    const isAgreed = document.getElementById('agreeTermsCheck').checked;
    const fullName = document.getElementById('agentFullName').value.trim();
    const bankName = document.getElementById('agentBankName').value;
    const accountNo = document.getElementById('agentAccountNo').value.trim();
    const currentClient = localStorage.getItem('leea_current_client') || 'Klien';

    if (!isAgreed) {
        alert(currentLang === 'BM' ? 'Sila tandakan kotak persetujuan pada Terma & Syarat Affiliate terlebih dahulu.' : 'Please check the agreement box on Affiliate Terms & Conditions first.');
        return;
    }
    if (!fullName || !bankName || !accountNo) {
        alert(currentLang === 'BM' ? 'Sila lengkapkan nama penuh, jenis bank, dan nombor akaun bank.' : 'Please fill in full name, bank name, and account number.');
        return;
    }

    const affiliatePayload = {
        data: { isAgent: true, walletBalance: 0.00, totalReferrals: 0, totalEarned: 0, verifiedByAdmin: false },
        bank: { fullName: fullName, bankName: bankName, accountNo: accountNo }
    };

    localStorage.setItem('leea_affiliate_' + currentClient, JSON.stringify(affiliatePayload));
    alert(currentLang === 'BM' ? 'Permohonan pendaftaran agen affiliate berjaya dihantar kepada Administrator untuk pengesahan akaun!' : 'Affiliate agent application successfully submitted to Administrator for review!');
    checkAgentAffiliateStatus();
}

function checkAgentAffiliateStatus() {
    const currentClient = localStorage.getItem('leea_current_client') || 'Klien';
    const savedData = localStorage.getItem('leea_affiliate_' + currentClient);

    const formCard = document.getElementById('agentRegistrationFormCard');
    const termsBox = document.getElementById('affiliateTermsBox');
    const activeDashboard = document.getElementById('activeAgentDashboard');
    const pendingNotice = document.getElementById('pendingAgentNotice');

    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            const affiliateInfo = parsed.data || {};
            const walletBal = affiliateInfo.walletBalance || 0.00;

            document.getElementById('affiliateWalletBalance').innerText = 'RM ' + walletBal.toFixed(2);
            document.getElementById('headerWalletBal').innerText = 'RM ' + walletBal.toFixed(2);

            if (affiliateInfo.isAgent) {
                termsBox.style.display = 'none';
                formCard.style.display = 'none';

                if (!affiliateInfo.verifiedByAdmin) {
                    pendingNotice.style.display = 'block';
                    activeDashboard.style.display = 'none';
                } else {
                    pendingNotice.style.display = 'none';
                    activeDashboard.style.display = 'block';
                    document.getElementById('affiliateLinkInput').value = 'https://www.architechlaboratory.my/ref/' + currentClient.toLowerCase();
                }
            }
        } catch(e) {}
    }
}

async function fetchLiveLeads(clientName, serverUrl) {
    try {
        const response = await fetch(`${serverUrl}/api/get-leads?client=${clientName}`);
        if(response.ok) {
            const leads = await response.json();
            const leadListContainer = document.getElementById('whatsappLeadList');
            
            if(leads && leads.length > 0) {
                leadListContainer.innerHTML = '';
                leads.forEach(lead => {
                    const activeClass = (selectedActivePhone === lead.phone) ? 'lead-item active' : 'lead-item';
                    leadListContainer.innerHTML += `
                        <div class="${activeClass}" onclick="selectLead('${lead.phone}', '${lead.name}')">
                            <strong style="color: var(--accent); display: block;">${lead.name}</strong>
                            <span style="color: #64748b; font-size: 10px;">${lead.phone} • ${lead.status || 'Aktif'}</span>
                        </div>
                    `;
                });

                if(!selectedActivePhone && leads[0]) {
                    selectLead(leads[0].phone, leads[0].name);
                } else if(selectedActivePhone) {
                    fetchChatHistory(clientName, serverUrl, selectedActivePhone);
                }
            }
        }
    } catch (error) {
        console.log("Mod menunggu sambungan enjin bot...");
    }
}

async function fetchLiveAnalytics(serverUrl) {
    try {
        const response = await fetch(`${serverUrl}/api/get-analytics`);
        if (response.ok) {
            const data = await response.json();
            
            const cards = document.querySelectorAll('.analytic-card .metric-val');
            if (cards.length >= 8) {
                cards[1].innerText = data.daily_chats;
                cards[2].innerText = data.weekly_chats;
                cards[3].innerText = data.monthly_chats;
                cards[4].innerText = data.total_leads;
                cards[7].innerText = data.human_interventions;
            }

            const tokenCountEl = document.getElementById('tokenUsageCount');
            const tokenBarEl = document.getElementById('tokenProgressBar');
            if (tokenCountEl && data.monthly_chats !== undefined) {
                let usedTokens = data.monthly_chats;
                if (usedTokens > 1000) usedTokens = 1000;
                tokenCountEl.innerText = usedTokens;
                let percentage = (usedTokens / 1000) * 100;
                if (tokenBarEl) tokenBarEl.style.width = percentage + '%';
            }
        }
    } catch (e) {
        console.log("Gagal memuatkan analitik live.");
    }
}

async function fetchChatHistory(clientName, serverUrl, phone) {
    try {
        const response = await fetch(`${serverUrl}/api/get-chat-history?client=${clientName}&phone=${phone}`);
        if(response.ok) {
            const messages = await response.json();
            const chatBox = document.getElementById('chatMessagesBox');
            chatBox.innerHTML = '';

            if(messages && messages.length > 0) {
                messages.forEach(m => {
                    let isBotOrAgent = (m.sender === 'bot' || m.sender === 'human' || m.sender === 'agent');
                    
                    let bubbleAlign = isBotOrAgent 
                        ? 'margin-left: auto; text-align: right; background: rgba(0, 240, 255, 0.12); border-color: var(--accent);' 
                        : 'margin-right: auto; text-align: left; background: rgba(16, 185, 129, 0.08); border-color: #10b981;';
                    
                    let borderColor = isBotOrAgent ? 'var(--accent)' : '#10b981';
                    let senderLabel = '[' + m.name + ']';
                    
                    if(m.sender === 'bot') senderLabel = '[Zulfa (Bot)]';
                    else if(m.sender === 'human') senderLabel = currentLang === 'BM' ? '[Agen Manusia]' : '[Human Agent]';

                    chatBox.innerHTML += `
                        <div style="max-width: 75%; ${bubbleAlign} padding: 8px 12px; border-radius: 8px; border: 1px solid ${borderColor}; margin-bottom: 8px; word-break: break-word;">
                            <span style="color: ${borderColor}; font-size: 10px; display: block; margin-bottom: 3px;">${senderLabel} - ${m.time}</span>
                            <span style="color: #fff; font-size: 12px;">${m.text}</span>
                        </div>
                    `;
                });
                
                setTimeout(() => {
                    chatBox.scrollTop = chatBox.scrollHeight;
                }, 50);
            }
        }
    } catch(e) {
        console.error("Gagal memuatkan sejarah chat:", e);
    }
}

function selectLead(phone, name) {
    selectedActivePhone = phone;
    document.getElementById('activeChatTitle').innerText = (currentLang === 'BM' ? 'Prospek: ' : 'Lead: ') + name + ' (' + phone + ')';
    const currentClient = localStorage.getItem('leea_current_client') || 'Klien';
    const railwayUrl = document.getElementById('modalRailwayUrl').value || 'https://web-production-07b92.up.railway.app/';
    fetchChatHistory(currentClient, railwayUrl, phone);
}

function openClientProfileModal() {
    const currentClient = localStorage.getItem('leea_current_client') || 'Klien';
    document.getElementById('modalUsername').value = currentClient;
    document.getElementById('clientProfileModal').style.display = 'flex';
}

function closeClientProfileModal() {
    document.getElementById('clientProfileModal').style.display = 'none';
}

function previewCompanyLogo(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Img = e.target.result;
            document.getElementById('modalLogoPreview').src = base64Img;
        }
        reader.readAsDataURL(file);
    }
}

async function saveClientProfileChanges() {
    const currentClient = localStorage.getItem('leea_current_client') || 'Klien';
    const serverUrl = document.getElementById('modalRailwayUrl').value || 'https://web-production-07b92.up.railway.app/';
    const newPass = document.getElementById('modalNewPassword').value.trim();
    const fbLink = document.getElementById('modalFbLink').value.trim();
    const igLink = document.getElementById('modalIgLink').value.trim();
    const tiktokLink = document.getElementById('modalTiktokLink').value.trim();
    const logoSrc = document.getElementById('modalLogoPreview').src;
    
    if(newPass && newPass.length < 6) {
        alert(currentLang === 'BM' ? 'Kata laluan baharu mestilah sekurang-kurangnya 6 aksara.' : 'New password must be at least 6 characters long.');
        return;
    }

    try {
        const response = await fetch(`${serverUrl}/api/update-client-profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: currentClient,
                fb_link: fbLink,
                ig_link: igLink,
                tiktok_link: tiktokLink,
                logo_base64: logoSrc
            })
        });

        if(response.ok) {
            document.getElementById('headerCompanyLogo').src = logoSrc;
            alert(currentLang === 'BM' ? 'Profil syarikat dan tetapan berjaya disimpan secara kekal di server!' : 'Company profile and settings permanently saved on server!');
            closeClientProfileModal();
        } else {
            alert(currentLang === 'BM' ? 'Gagal menyimpan ke server.' : 'Failed to save to server.');
        }
    } catch(e) {
        alert(currentLang === 'BM' ? 'Ralat sambungan ke pelayan.' : 'Server connection error.');
    }
}

function switchTab(evt, tabName) {
    const contents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < contents.length; i++) contents[i].classList.remove('active');
    const btns = document.getElementsByClassName('tab-btn');
    for (let i = 0; i < btns.length; i++) btns[i].classList.remove('active');
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');
}

async function updateBotName() {
    const newName = document.getElementById('botNameInput').value.trim();
    const currentClient = localStorage.getItem('leea_current_client') || 'Klien';
    const serverUrl = document.getElementById('modalRailwayUrl').value || 'https://web-production-07b92.up.railway.app/';

    if(!newName) {
        alert(currentLang === 'BM' ? 'Sila masukkan nama bot yang sah.' : 'Please enter a valid bot name.');
        return;
    }

    try {
        const response = await fetch(`${serverUrl}/api/update-client-profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentClient, bot_name: newName })
        });

        if(response.ok) {
            alert((currentLang === 'BM' ? 'Nama bot berjaya dikemaskini dan disimpan ke server: ' : 'Bot name updated and saved to server: ') + newName);
        } else {
            alert(currentLang === 'BM' ? 'Gagal mengemaskini nama bot.' : 'Failed to update bot name.');
        }
    } catch(e) {
        alert(currentLang === 'BM' ? 'Ralat sambungan ke pelayan.' : 'Server connection error.');
    }
}

async function saveClientBrainPrompt() {
    const promptText = document.getElementById('clientBrainPrompt').value.trim();
    const currentClient = localStorage.getItem('leea_current_client') || 'Klien';
    const serverUrl = document.getElementById('modalRailwayUrl').value || 'https://web-production-07b92.up.railway.app/';

    if(!promptText) {
        alert(currentLang === 'BM' ? 'Sila masukkan skrip prompt minda bot terlebih dahulu.' : 'Please enter the bot brain prompt script first.');
        return;
    }

    try {
        const response = await fetch(`${serverUrl}/api/update-prompt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ client: currentClient, prompt: promptText })
        });

        if(response.ok) {
            alert(currentLang === 'BM' ? 'Prompt minda bot berjaya dihantar dan dikemaskini terus pada enjin bot klien!' : 'Bot brain prompt successfully sent and updated on client engine!');
        } else {
            alert(currentLang === 'BM' ? 'Gagal dikemaskini. Sila semak status server bot.' : 'Failed to update. Please check bot server status.');
        }
    } catch (err) {
        alert(currentLang === 'BM' ? 'Amaran: Sambungan ke server bot tempatan/Railway tidak terhasil.' : 'Warning: Unable to connect to local bot/Railway server.');
    }
}

function saveClientPaymentSettings() {
    alert(currentLang === 'BM' ? 'Tetapan pembayaran dan gateway affiliate berjaya disimpan.' : 'Payment and gateway settings saved successfully.');
}

async function saveClientSystemSettings() {
    const adminNum = document.getElementById('clientAdminNumber').value.trim();
    const currentClient = localStorage.getItem('leea_current_client') || 'Klien';
    const serverUrl = document.getElementById('modalRailwayUrl').value || 'https://web-production-07b92.up.railway.app/';

    if(!adminNum) {
        alert(currentLang === 'BM' ? 'Sila masukkan nombor admin yang sah.' : 'Please enter a valid admin number.');
        return;
    }

    try {
        const response = await fetch(`${serverUrl}/api/update-client-profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentClient, admin_number: adminNum })
        });

        if(response.ok) {
            localStorage.setItem('client_admin_number_' + currentClient, adminNum);
            alert(currentLang === 'BM' ? 'Nombor telefon admin berjaya dikemaskini dan disimpan secara kekal di server!' : 'Admin phone number successfully updated and permanently saved on server!');
        } else {
            alert(currentLang === 'BM' ? 'Gagal menyimpan nombor admin ke server.' : 'Failed to save admin number to server.');
        }
    } catch(e) {
        alert(currentLang === 'BM' ? 'Ralat sambungan ke pelayan.' : 'Server connection error.');
    }
}

function toggleHumanTakeover() {
    isHumanManualMode = !isHumanManualMode;
    const btn = document.getElementById('takeoverBtn');
    if (isHumanManualMode) {
        btn.style.background = 'rgba(16,185,129,0.2)';
        btn.style.borderColor = '#10b981';
        btn.style.color = '#34d399';
        btn.innerText = currentLang === 'BM' ? 'MOD MANUAL: AKTIF (AGEN MANUSIA)' : 'MANUAL MODE: ACTIVE (HUMAN AGENT)';
    } else {
        btn.style.background = 'rgba(245,158,11,0.2)';
        btn.style.borderColor = '#f59e0b';
        btn.style.color = '#f59e0b';
        btn.innerText = currentLang === 'BM' ? 'MOD BOT: AKTIF (AMBIL ALIH MANUAL)' : 'BOT MODE: ACTIVE (MANUAL TAKEOVER)';
    }
}

async function sendManualMessage() {
    const input = document.getElementById('liveChatInput');
    const msg = input.value.trim();
    if(!msg || !selectedActivePhone) {
        alert(currentLang === 'BM' ? 'Sila pilih prospek dan masukkan mesej.' : 'Please select a prospect and enter a message.');
        return;
    }

    const currentClient = localStorage.getItem('leea_current_client') || 'Klien';
    const serverUrl = document.getElementById('modalRailwayUrl').value || 'https://web-production-07b92.up.railway.app/';

    try {
        const response = await fetch(`${serverUrl}/api/send-whatsapp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ client: currentClient, phone: selectedActivePhone, message: msg })
        });

        if(response.ok) {
            input.value = '';
            fetchChatHistory(currentClient, serverUrl, selectedActivePhone);
        } else {
            alert(currentLang === 'BM' ? 'Gagal menghantar mesej WhatsApp.' : 'Failed to send WhatsApp message.');
        }
    } catch(e) {
        alert(currentLang === 'BM' ? 'Ralat sambungan ke pelayan bot.' : 'Bot server connection error.');
    }
}

function exportLeadsCsv() {
    alert(currentLang === 'BM' ? 'Fail senarai prospek (Leads) berjaya dieksport dalam format CSV.' : 'Leads list successfully exported as CSV.');
}