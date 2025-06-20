import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './db/magnolia.mjs';
import cors from 'cors';
import errorHandler from './middleware/errorHandler.mjs';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
global.__appdir = dirname;

// Läs in .env-fil från rotmappen
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

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.requestTime = new Date().toLocaleString();
  const token = req.headers.authorization;
  next();
});

// Error handling middleware (måste vara sist)
app.use(errorHandler);

export { app };