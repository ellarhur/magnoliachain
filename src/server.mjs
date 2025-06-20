import { app } from './app.mjs';
import authRouter from './routes/authRoutes.mjs';
import usersRouter from './routes/userRoutes.mjs';
import blockchainRoutes from './routes/blockRoutes.mjs';
import transactionRoutes from './routes/transactionRoutes.mjs';
import Network from './network.mjs';
import Blockchain from './models/Blockchain.mjs';
import TransactionPool from './models/TransactionPool.mjs';
import Wallet from './models/Wallet.mjs';

// Skapa centrala instanser
export const blockChain = new Blockchain();
export const transactionPool = new TransactionPool();
export const wallet = new Wallet();
export const network = new Network({
  blockchain: blockChain,
  transactionPool: transactionPool,
});

const PORT = process.env.PORT || 5002;

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/blocks', blockchainRoutes);
app.use('/api/v1/transactions', transactionRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
