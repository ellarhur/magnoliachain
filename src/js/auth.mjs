//  entisering och navigering
const API_URL = window.location.origin + '/api';

// Visa/dölj formulär
document.getElementById('loginBtn')?.addEventListener('click', () => {
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('registerForm').classList.add('hidden');
});

document.getElementById('registerBtn')?.addEventListener('click', () => {
  document.getElementById('registerForm').classList.remove('hidden');
  document.getElementById('loginForm').classList.add('hidden');
});

// Hantera registrering
document.getElementById('register')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const userData = {
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password')
  };

  console.log('Försöker registrera användare:', { ...userData, password: '***' });

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Svar från server:', data);

    if (data.success) {
      localStorage.setItem('token', data.data.token);
      window.location.href = '/src/pages/blockchain.html';
    } else {
      alert('Registrering misslyckades: ' + (data.message || 'Okänt fel'));
    }
  } catch (error) {
    console.error('Fel vid registrering:', error);
    alert('Ett fel uppstod vid registrering: ' + error.message);
  }
});

// Hantera inloggning
document.getElementById('login')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const userData = {
    email: formData.get('email'),
    password: formData.get('password')
  };

  console.log('Försöker logga in användare:', { ...userData, password: '***' });

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Svar från server:', data);

    if (data.success) {
      localStorage.setItem('token', data.data.token);
      window.location.href = '/src/pages/blockchain.html';
    } else {
      alert('Inloggning misslyckades: ' + (data.message || 'Okänt fel'));
    }
  } catch (error) {
    console.error('Fel vid inloggning:', error);
    alert('Ett fel uppstod vid inloggning: ' + error.message);
  }
});

// Kontrollera autentisering
export const checkAuth = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/src/pages/login.html';
    return false;
  }
  return true;
}; 