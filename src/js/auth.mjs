const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

const api = 'http://localhost:5002';

export const checkAuth = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '../../index.html';
    return false;
  }
  return true;
};

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(loginForm);
  const email = form.get('email');
  const password = form.get('password');

  try {
    console.log('Försöker logga in med:', { email });
    console.log('Anropar URL:', `${api}/api/v1/auth/login`);
    
    const res = await fetch(`${api}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    console.log('Login response status:', res.status);
    
    const responseText = await res.text();
    console.log('Login raw response:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Login JSON parse error:', parseError);
      alert('Servern skickade tillbaka HTML istället för JSON vid inloggning.');
      return;
    }

    if (res.ok) {
      console.log('Inloggning lyckades!');
      localStorage.setItem('token', data.data.token);
      window.location.href = './src/pages/blockchain.html';
    } else {
      alert('Inloggning misslyckades: ' + (data.message || 'Fel användarnamn eller lösenord'));
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Något gick fel vid inloggning: ' + error.message);
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(registerForm);

  const firstName = form.get('firstName');
  const lastName = form.get('lastName');
  const email = form.get('email');
  const password = form.get('password');

  try {
    console.log('Skickar registreringsdata:', { firstName, lastName, email, password });
    console.log('Anropar URL:', `${api}/api/v1/users`);
    
    const res = await fetch(`${api}/api/v1/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, password })
    });

    console.log('Response status:', res.status);
    console.log('Response headers:', res.headers);
    
    const responseText = await res.text(); // Läs som text först
    console.log('Raw response:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText); // Försök parsa som JSON
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      alert('Servern skickade tillbaka HTML istället för JSON. Kontrollera att backend-servern körs på port 5002.');
      return;
    }
    
    console.log('Parsed data:', data);

    if (res.ok) {
      alert('Registrering lyckades! Du skickas nu vidare till blockchain-sidan.');
      if (data.data && data.data.token) {
        localStorage.setItem('token', data.data.token);
      }
      window.location.href = './src/pages/blockchain.html';
    } else {
      alert('Registrering misslyckades: ' + (data.message || 'Okänt fel'));
    }
  } catch (error) {
    console.error('Registration error:', error);
    alert('Något gick fel vid registrering: ' + error.message);
  }
});
