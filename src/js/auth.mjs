// js/auth.mjs
const loginForm = document.getElementById('login');
const registerForm = document.getElementById('register');

const api = 'http://localhost:5050';

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(loginForm);
  const email = form.get('email');
  const password = form.get('password');

  const res = await fetch(`${api}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem('token', data.data.token);
    window.location.href = './blockchain.html';
  } else {
    alert('Inloggning misslyckades');
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(registerForm);
  const email = form.get('email');
  const username = form.get('username');
  const password = form.get('password');

  const res = await fetch(`${api}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password })
  });

  const data = await res.json();

  if (res.ok) {
    alert('Registrerad! Logga in nu.');
  } else {
    alert('Registrering misslyckades');
  }
});
