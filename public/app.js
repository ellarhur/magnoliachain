// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authForms = document.getElementById('authForms');
const blockchainInterface = document.getElementById('blockchainInterface');
const walletAddress = document.getElementById('walletAddress');
const walletBalance = document.getElementById('walletBalance');
const transactionForm = document.getElementById('transactionForm');
const transactionPool = document.getElementById('transactionPool');
const blockchain = document.getElementById('blockchain');
const mineBlockBtn = document.getElementById('mineBlockBtn');

// API endpoints
const API_URL = 'http://localhost:3000/api';

// State
let token = localStorage.getItem('token');
let user = null;

// Event Listeners
loginBtn.addEventListener('click', () => {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
});

registerBtn.addEventListener('click', () => {
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    token = null;
    user = null;
    updateUI();
});

document.getElementById('login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: formData.get('email'),
                password: formData.get('password')
            })
        });
        const data = await response.json();
        if (response.ok) {
            token = data.token;
            user = data.user;
            localStorage.setItem('token', token);
            updateUI();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Ett fel uppstod vid inloggning');
    }
});

document.getElementById('register').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: formData.get('username'),
                email: formData.get('email'),
                password: formData.get('password')
            })
        });
        const data = await response.json();
        if (response.ok) {
            alert('Registrering lyckades! Logga in för att fortsätta.');
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Ett fel uppstod vid registrering');
    }
});

transactionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const recipientAddress = document.getElementById('recipientAddress').value;
    const amount = document.getElementById('amount').value;
    
    try {
        const response = await fetch(`${API_URL}/transaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ recipientAddress, amount })
        });
        const data = await response.json();
        if (response.ok) {
            alert('Transaktion skapad!');
            updateTransactionPool();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Transaction error:', error);
        alert('Ett fel uppstod vid skapande av transaktion');
    }
});

mineBlockBtn.addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_URL}/mine`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (response.ok) {
            alert('Nytt block skapat!');
            updateBlockchain();
            updateTransactionPool();
            updateWalletInfo();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Mining error:', error);
        alert('Ett fel uppstod vid mining');
    }
});

// UI Update Functions
function updateUI() {
    if (token) {
        authForms.classList.add('hidden');
        blockchainInterface.classList.remove('hidden');
        loginBtn.classList.add('hidden');
        registerBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        updateWalletInfo();
        updateTransactionPool();
        updateBlockchain();
    } else {
        authForms.classList.remove('hidden');
        blockchainInterface.classList.add('hidden');
        loginBtn.classList.remove('hidden');
        registerBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
    }
}

async function updateWalletInfo() {
    try {
        const response = await fetch(`${API_URL}/wallet`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (response.ok) {
            walletAddress.textContent = data.address;
            walletBalance.textContent = data.balance;
        }
    } catch (error) {
        console.error('Wallet info error:', error);
    }
}

async function updateTransactionPool() {
    try {
        const response = await fetch(`${API_URL}/transaction-pool`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (response.ok) {
            transactionPool.innerHTML = data.transactions.map(tx => `
                <div class="transaction">
                    <p>Från: ${tx.input.address}</p>
                    <p>Till: ${tx.outputs[0].address}</p>
                    <p>Belopp: ${tx.outputs[0].amount}</p>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Transaction pool error:', error);
    }
}

async function updateBlockchain() {
    try {
        const response = await fetch(`${API_URL}/blocks`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (response.ok) {
            blockchain.innerHTML = data.blocks.map(block => `
                <div class="block">
                    <p>Hash: ${block.hash}</p>
                    <p>Tid: ${new Date(block.timestamp).toLocaleString()}</p>
                    <p>Transaktioner: ${block.data.length}</p>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Blockchain error:', error);
    }
}

// Initial UI update
updateUI(); 