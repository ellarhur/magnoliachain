document.addEventListener('DOMContentLoaded', () => {
  const nav = document.createElement('nav');
  nav.classList.add('navbar');

  const currentPath = window.location.pathname;
  const isInPagesFolder = currentPath.includes('/pages/');
  const basePath = isInPagesFolder ? '../..' : '.';
  const pagesPath = isInPagesFolder ? '.' : './src/pages';

  nav.innerHTML = `
      <h3>Magnolia Chain</h3>
    <div class="nav-links">
      <a href="${basePath}/index.html">Logga in/Registrera dig</a>
      <a href="${pagesPath}/blockchain.html">Blockchain</a>
      <a href="${pagesPath}/createtransaction.html">Skapa Transaktion</a>
      <button id="logoutBtn" class="btn">Logga ut</button>
    </div>
  `;

  document.body.prepend(nav);

  const logout = document.getElementById('logoutBtn');
  if (logout) {
    logout.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.href = `${basePath}/index.html`;
    });
  }
});
