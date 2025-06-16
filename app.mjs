import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDb } from './src/db/magnolia.mjs';
import authRoutes from './src/routes/auth-routes.mjs';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
global.__appdir = dirname;

dotenv.config({ path: './config/config.env' });

await connectDb();

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