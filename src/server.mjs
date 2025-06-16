import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Blockchain from './models/blockchain/Blockchain.mjs';
import User from './models/blockchain/User.mjs';
import 'dotenv/config';

const app = express();
const blockchain = new Blockchain();

app.use(cors());
app.use(express.json());

// Anslut till MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Ansluten till MongoDB'))
  .catch(err => console.error('MongoDB anslutningsfel:', err));

// Middleware för autentisering
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Ingen token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Ogiltig token' });
  }
}

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Kontrollera om användaren redan finns
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Användaren finns redan' });
    }

    // Hasha lösenordet
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Skapa ny användare
    const user = new User({
      username,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    res.status(201).json({ message: 'Användare skapad' });
  } catch (error) {
    console.error('Registreringsfel:', error);
    res.status(500).json({ message: 'Serverfel vid registrering' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Hitta användaren
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Felaktig e-post eller lösenord' });
    }
    
    // Verifiera lösenord
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Felaktig e-post eller lösenord' });
    }
    
    // Skapa JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ token, user: { id: user._id, email: user.email, username: user.username } });
  } catch (error) {
    console.error('Inloggningsfel:', error);
    res.status(500).json({ message: 'Serverfel vid inloggning' });
  }
});

// Blockchain routes
app.get('/api/wallet', auth, (req, res) => {
  const address = req.user.userId;
  const balance = blockchain.getBalance(address);
  res.json({ address, balance });
});

app.post('/api/transaction', auth, (req, res) => {
  const { recipientAddress, amount } = req.body;
  const transaction = blockchain.createTransaction(
    req.user.userId,
    recipientAddress,
    amount
  );
  res.json(transaction);
});

app.get('/api/transaction-pool', auth, (req, res) => {
  res.json({ transactions: blockchain.transactionPool.transactions });
});

app.post('/api/mine', auth, async (req, res) => {
  try {
    await blockchain.addBlock({ minerAddress: req.user.userId });
    res.json({ message: 'Nytt block skapat' });
  } catch (error) {
    res.status(500).json({ message: 'Fel vid mining' });
  }
});

app.get('/api/blocks', auth, (req, res) => {
  res.json({ blocks: blockchain.chain });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server körs på port ${PORT}`);
}); 