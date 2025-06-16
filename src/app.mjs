import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './db/magnolia.mjs';
import authRoutes from './routes/auth-routes.mjs';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
global.__appdir = dirname;

// Läs in .env-filen från rotmappen
const envPath = path.resolve(dirname, '../.env');
console.log('Laddar .env-fil från:', envPath);
dotenv.config({ path: envPath });

// Verifiera att miljövariablerna laddades
console.log('Miljövariabler efter dotenv.config():', {
  NODE_ENV: process.env.NODE_ENV,
  MONGO_URI: process.env.MONGO_URI ? 'Definierad' : 'Ej definierad'
});

await connectDB();

const app = express();

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

app.use((req, res, next) => {
  req.requestTime = new Date().toLocaleString();
  const token = req.headers.authorization;
  next();
});

export { app };