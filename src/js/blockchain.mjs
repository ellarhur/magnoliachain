import { checkAuth } from './auth.mjs';

const API_URL = 'http://localhost:3000/api';

// Kontrollera autentisering
if (!checkAuth()) {
    console.log('Användaren är inte inloggad');
}

// Hämta DOM-element
const walletAddress = document.getElementById('walletAddress');
const walletBalance = document.getElementById('walletBalance');
const mineButton = document.getElementById('mineButton');
const miningStatus = document.getElementById('miningStatus');
const transactionForm = document.getElementById('transactionForm');
const blockchainList = document.getElementById('blockchain');

// Hämta token från localStorage
const token = localStorage.getItem('token');

// Uppdatera plånboksinformation
const updateWalletInfo = async () => {
    try {
        const response = await fetch(`${API_URL}/wallet/info`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        
        if (data.success) {
            walletAddress.textContent = data.data.address;
            walletBalance.textContent = data.data.balance;
        }
    } catch (error) {
        console.error('Fel vid hämtning av plånboksinformation:', error);
    }
};

// Uppdatera blockkedjan
const updateBlockchain = async () => {
    try {
        const response = await fetch(`${API_URL}/blocks`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        
        if (data.success) {
            blockchainList.innerHTML = data.data.map(block => `
                <div class="block">
                    <div class="block-header">
                        <span>Block #${block.index}</span>
                        <span class="block-hash">${block.hash.substring(0, 16)}...</span>
                    </div>
                    <div class="block-data">
                        <p>Timestamp: ${new Date(block.timestamp).toLocaleString()}</p>
                        <p>Previous Hash: ${block.lastHash.substring(0, 16)}...</p>
                        <p>Data: ${JSON.stringify(block.data)}</p>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Fel vid hämtning av blockkedjan:', error);
    }
};

// Hantera mining
let isMining = false;

mineButton.addEventListener('click', async () => {
    if (isMining) {
        isMining = false;
        mineButton.textContent = 'Starta Mining';
        miningStatus.textContent = 'Mining stoppad';
        return;
    }

    isMining = true;
    mineButton.textContent = 'Stoppa Mining';
    miningStatus.textContent = 'Mining pågår...';

    try {
        const response = await fetch(`${API_URL}/blocks/mine`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        
        if (data.success) {
            miningStatus.textContent = 'Nytt block skapat!';
            updateBlockchain();
        }
    } catch (error) {
        console.error('Fel vid mining:', error);
        miningStatus.textContent = 'Fel vid mining';
    }
});

// Hantera transaktioner
transactionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const recipientAddress = document.getElementById('recipientAddress').value;
    const amount = document.getElementById('amount').value;

    try {
        const response = await fetch(`${API_URL}/wallet/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                recipient: recipientAddress,
                amount: parseFloat(amount)
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Transaktion skickad!');
            transactionForm.reset();
            updateWalletInfo();
        } else {
            alert('Fel vid skickande av transaktion: ' + data.message);
        }
    } catch (error) {
        console.error('Fel vid skickande av transaktion:', error);
        alert('Ett fel uppstod vid skickande av transaktion');
    }
});

// Uppdatera information regelbundet
updateWalletInfo();
updateBlockchain();
setInterval(() => {
    updateWalletInfo();
    updateBlockchain();
}, 10000); 