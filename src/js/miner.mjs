const api = 'http://localhost:5050';
const token = localStorage.getItem('token');

// Om ej inloggad, skicka till inloggning
if (!token) window.location.href = './index.html';

// Hantera formulärskick för att skapa transaktion
document.getElementById('transactionForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = new FormData(e.target);
  const recipient = form.get('recipient');
  const amount = form.get('amount');

  try {
    const res = await fetch(`${api}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ recipient, amount }),
    });

    const data = await res.json();

    if (res.ok) {
      alert('Transaktion skapad!');
      e.target.reset(); // Rensa formulär
    } else {
      alert('Fel vid transaktion: ' + (data.message || 'Okänt fel'));
    }
  } catch (error) {
    alert('Nätverksfel: ' + error.message);
  }
});

// Hantera "mine block"-knapp
document.getElementById('mineBtn').addEventListener('click', async () => {
  try {
    const res = await fetch(`${api}/blocks/mine`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (res.ok) {
      alert('Block mined!');
    } else {
      alert('Misslyckades att minea: ' + (data.message || 'Okänt fel'));
    }
  } catch (error) {
    alert('Nätverksfel: ' + error.message);
  }
});
