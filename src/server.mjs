import { app } from './app.mjs';
import authRouter from './routes/authRoutes.mjs';
import usersRouter from './routes/userRoutes.mjs';
import blockchainRoutes from './routes/blockRoutes.mjs';
import networkServer from './network.mjs';
import Blockchain from './models/Blockchain.mjs';

export const blockChain = new Blockchain();
export const server = new networkServer({ blockchain: blockChain });

const PORT = process.env.PORT || 5002;

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/blocks', blockchainRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
