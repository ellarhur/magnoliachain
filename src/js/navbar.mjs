// js/navbar.mjs
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.createElement('nav');
  nav.classList.add('navbar');

  nav.innerHTML = `
    <a href="./index.html" class="logo">🌸 Magnolia</a>
    <div class="nav-links">
      <a href="./src/pages/blockchain.html">📜 Blockkedja</a>
      <a href="./src/pages/createtransaction.html">⛏️ Mine</a>
      <a href="./" id="logout">🚪 Logga ut</a>
    </div>
  `;

  document.body.prepend(nav);

  const logout = document.getElementById('logout');
  if (logout) {
    logout.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.href = 'blockchain.html';
    });
  }
});
