const API_URL = 'http://localhost:5002/api/v1';

export const updateWalletInfo = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('Ingen token hittades');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/users/wallet`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      const walletAddress = document.getElementById('walletAddress');
      const walletBalance = document.getElementById('walletBalance');
      
      if (walletAddress) {
        walletAddress.textContent = data.data.address.substring(0, 20) + '...';
      }
      
      if (walletBalance) {
        walletBalance.textContent = data.data.balance;
      }
      
      return data.data;
    } else {
      console.error('Fel vid hämtning av wallet-info:', data.message);
    }
  } catch (error) {
    console.error('Fel vid hämtning av wallet-information:', error);
    
    const walletAddress = document.getElementById('walletAddress');
    const walletBalance = document.getElementById('walletBalance');
    
    if (walletAddress) walletAddress.textContent = 'Kunde inte ladda';
    if (walletBalance) walletBalance.textContent = 'Kunde inte ladda';
  }
}; 