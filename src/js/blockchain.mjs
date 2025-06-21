import { checkAuth } from './auth.mjs';
import { updateWalletInfo } from './wallet.mjs';

const API_URL = 'http://localhost:5002/api/v1';

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

// Formatera transaktioner för visning
const formatTransactions = (transactions) => {
    if (!Array.isArray(transactions) || transactions.length === 0) {
        return '<p class="no-transactions">Inga transaktioner</p>';
    }
    
    return transactions.map(tx => {
        console.log('Processing transaction:', tx);
        
        // Hantera mining reward-transaktioner
        if (tx.input && tx.input.address === '#reward-address#') {
            const recipient = Object.keys(tx.outputMap)[0];
            const amount = Object.values(tx.outputMap)[0];
            
            return `
                <div class="transaction reward-transaction">
                    <p><strong>🏆 Mining Reward</strong></p>
                    <p>Mottagare: ${recipient ? recipient.substring(0, 20) + '...' : 'N/A'}</p>
                    <p>Belopp: ${amount || 'N/A'} tokens</p>
                </div>
            `;
        } else {
            // Hantera vanliga transaktioner
            const senderAddress = tx.input?.address;
            let recipient = tx.recipient;
            let amount = tx.amount;
            
            // Om recipient/amount saknas, försök hämta från outputMap
            if (!recipient && tx.outputMap) {
                const outputKeys = Object.keys(tx.outputMap);
                // Recipient är den som INTE är sender
                recipient = outputKeys.find(key => key !== senderAddress);
                amount = recipient ? tx.outputMap[recipient] : 'N/A';
            }
            
            return `
                <div class="transaction user-transaction">
                    <p><strong>💸 Transaktion</strong></p>
                    <p>Från: ${senderAddress ? senderAddress.substring(0, 20) + '...' : 'N/A'}</p>
                    <p>Till: ${recipient ? recipient.substring(0, 20) + '...' : 'N/A'}</p>
                    <p>Belopp: ${amount || 'N/A'} tokens</p>
                    <p>Timestamp: ${tx.input?.timestamp ? new Date(tx.input.timestamp).toLocaleString() : 'N/A'}</p>
                </div>
            `;
        }
    }).join('');
};

// Uppdatera blockkedjan
const updateBlockchain = async () => {
    try {
        console.log('Hämtar blockkedja från:', `${API_URL}/blocks`);
        
        const response = await fetch(`${API_URL}/blocks`);
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Blockchain data:', data);
        
        if (data.success && data.data && data.data.chain) {
            console.log('Chain length:', data.data.chain.length);
            
            if (data.data.chain.length === 0) {
                blockchainList.innerHTML = '<p>Blockkedjan är tom</p>';
                return;
            }
            
            blockchainList.innerHTML = data.data.chain.map((block, index) => `
                <div class="block">
                    <div class="block-header">
                        <span class="block-number">Block #${index}</span>
                        <span class="block-hash">${block.hash ? block.hash.substring(0, 16) + '...' : 'Genesis'}</span>
                    </div>
                    <div class="block-info">
                        <p><strong>Timestamp:</strong> ${new Date(block.timestamp).toLocaleString()}</p>
                        <p><strong>Previous Hash:</strong> ${block.lastHash ? block.lastHash.substring(0, 16) + '...' : 'None'}</p>
                        <p><strong>Nonce:</strong> ${block.nonce || 'N/A'}</p>
                        <p><strong>Difficulty:</strong> ${block.difficulty || 'N/A'}</p>
                    </div>
                    <div class="block-transactions">
                        <h4>Transaktioner (${Array.isArray(block.data) ? block.data.length : 0}):</h4>
                        <div class="transactions-list">
                            ${formatTransactions(block.data)}
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            console.error('API returned invalid data structure:', data);
            blockchainList.innerHTML = '<p>API returnerade ogiltig data</p>';
        }
    } catch (error) {
        console.error('Fel vid hämtning av blockkedjan:', error);
        blockchainList.innerHTML = '<p>Kunde inte ladda blockkedja: ' + error.message + '</p>';
    }
};

// Hantera mining
let isMining = false;

if (mineButton) {
    mineButton.addEventListener('click', async () => {
        if (isMining) {
            isMining = false;
            mineButton.textContent = 'Starta Mining';
            if (miningStatus) miningStatus.textContent = 'Mining stoppad';
            return;
        }

        isMining = true;
        mineButton.textContent = 'Mining pågår...';
        if (miningStatus) miningStatus.textContent = 'Mining pågår...';

        try {
            const response = await fetch(`${API_URL}/transactions/mine`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            
            if (response.ok) {
                if (miningStatus) miningStatus.textContent = 'Nytt block skapat!';
                mineButton.textContent = 'Starta Mining';
                isMining = false;
                updateBlockchain(); // Uppdatera blockkedjan
                updateWalletInfo(); // Uppdatera wallet-info
            } else {
                if (miningStatus) miningStatus.textContent = 'Fel vid mining: ' + (data.message || 'Okänt fel');
                mineButton.textContent = 'Starta Mining';
                isMining = false;
            }
        } catch (error) {
            console.error('Fel vid mining:', error);
            if (miningStatus) miningStatus.textContent = 'Fel vid mining';
            mineButton.textContent = 'Starta Mining';
            isMining = false;
        }
    });
}

// Hantera transaktioner
if (transactionForm) {
    transactionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const recipientAddress = document.getElementById('recipientAddress').value;
        const amount = document.getElementById('amount').value;

        try {
            const response = await fetch(`${API_URL}/transactions`, {
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
            
            if (response.ok) {
                alert('Transaktion skapad!');
                transactionForm.reset();
                updateWalletInfo(); // Uppdatera wallet-info
            } else {
                alert('Fel vid skickande av transaktion: ' + (data.message || 'Okänt fel'));
            }
        } catch (error) {
            console.error('Fel vid skickande av transaktion:', error);
            alert('Ett fel uppstod vid skickande av transaktion');
        }
    });
}

// Uppdatera information vid start
updateWalletInfo();
updateBlockchain();

// Uppdatera information regelbundet
setInterval(() => {
    updateBlockchain();
}, 5000); // Uppdatera var 5:e sekund 