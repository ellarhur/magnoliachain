// js/navbar.mjs
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.createElement('nav');
  nav.classList.add('navbar');

  nav.innerHTML = `
      <h3>Magnolia Chain</h3>
    <div class="nav-links">
      <a href="index.html">Hem</a>
      <a href="blockchain.html">Blockchain</a>
      <a href="createtransaction.html">Skapa Transaktion</a>
    </div>
  `;

  document.body.prepend(nav);

  const logout = document.getElementById('logoutBtn');
  if (logout) {
    logout.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.href = './index.html';
    });
  }
});
