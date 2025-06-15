const API_URL = 'http://localhost:3000/api';

// Auth-funktioner
const login = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    return response.json();
};

const register = async (username, email, password) => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
    });
    return response.json();
};

// Blockchain-funktioner
const getBlocks = async () => {
    const response = await fetch(`${API_URL}/blocks`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.json();
};

const createTransaction = async (recipient, amount) => {
    const response = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ recipient, amount })
    });
    return response.json();
};

const mineBlock = async () => {
    const response = await fetch(`${API_URL}/blocks/mine`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.json();
};

// UI-funktioner
const updateBlocks = async () => {
    const blocks = await getBlocks();
    const blocksDiv = document.getElementById('blocks');
    blocksDiv.innerHTML = blocks.data.chain.map(block => `
        <div class="block">
            <h3>Block ${block.hash.substring(0, 8)}...</h3>
            <p>Timestamp: ${new Date(block.timestamp).toLocaleString()}</p>
            <p>Transactions: ${block.data.length}</p>
        </div>
    `).join('');
};

const updateTransactions = async () => {
    const transactions = await getTransactions();
    const transactionsDiv = document.getElementById('transactions');
    transactionsDiv.innerHTML = transactions.data.map(transaction => `
        <div class="transaction">
            <p>From: ${transaction.sender.substring(0, 8)}...</p>
            <p>To: ${transaction.recipient.substring(0, 8)}...</p>
            <p>Amount: ${transaction.amount}</p>
        </div>
    `).join('');
};

// Event listeners
document.getElementById('login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.elements[0].value;
    const password = e.target.elements[1].value;
    
    try {
        const response = await login(email, password);
        if (response.success) {
            localStorage.setItem('token', response.token);
            updateBlocks();
            updateTransactions();
        }
    } catch (error) {
        console.error('Login failed:', error);
    }
});

document.getElementById('register').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = e.target.elements[0].value;
    const email = e.target.elements[1].value;
    const password = e.target.elements[2].value;
    
    try {
        const response = await register(username, email, password);
        if (response.success) {
            localStorage.setItem('token', response.token);
            updateBlocks();
            updateTransactions();
        }
    } catch (error) {
        console.error('Registration failed:', error);
    }
});

document.getElementById('transaction-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const recipient = e.target.elements[0].value;
    const amount = e.target.elements[1].value;
    
    try {
        await createTransaction(recipient, amount);
        updateTransactions();
    } catch (error) {
        console.error('Transaction failed:', error);
    }
});

document.getElementById('mine-button').addEventListener('click', async () => {
    try {
        await mineBlock();
        updateBlocks();
        updateTransactions();
    } catch (error) {
        console.error('Mining failed:', error);
    }
}); 

// Registrera
fetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ ... }), headers: { 'Content-Type': 'application/json' } })

// Logga in
fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ ... }), headers: { 'Content-Type': 'application/json' } })

// Skapa transaktion (med token)
fetch('/api/transaction', { method: 'POST', body: JSON.stringify({ ... }), headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token } })