// js/auth.mjs
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

const api = 'http://localhost:3000';

// LOGIN
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(loginForm);
  const email = form.get('email');
  const password = form.get('password');

  try {
    const res = await fetch(`${api}/auth/login`, {  // OBS! Kolla att detta är rätt endpoint i backend
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.data.token);
      window.location.href = './blockchain.html';
    } else {
      alert('Inloggning misslyckades: ' + (data.message || 'Fel användarnamn eller lösenord'));
    }
  } catch (error) {
    alert('Något gick fel vid inloggning');
  }
});

// REGISTRERING
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(registerForm);

  // Se till att du har inputs för dessa i ditt registerformulär
  const firstName = form.get('firstName');
  const lastName = form.get('lastName');
  const email = form.get('email');
  const password = form.get('password');

  try {
    const res = await fetch(`${api}/users`, {  // POST till /users enligt din user-router
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, password })
    });

    const data = await res.json();

    if (res.ok) {
      // Om backend skickar token efter registrering
      localStorage.setItem('token', data.data.token);
      window.location.href = './blockchain.html';
    } else {
      alert('Registrering misslyckades: ' + (data.message || 'Okänt fel'));
    }
  } catch (error) {
    alert('Något gick fel vid registrering');
  }
});
