// js/auth.mjs
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

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
const firstName = form.get('firstName');
const lastName = form.get('lastName');
const email = form.get('email');
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
