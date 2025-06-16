import { app } from './app.mjs';
import blockchainRoutes from './routes/blockchain-routes.mjs';
import transactionRoutes from './routes/transaction-routes.mjs';
import networkServer from './network.mjs';
import Blockchain from './models/blockchain/Blockchain.mjs';
import TransactionPool from './models/wallet/TransactionPool.mjs';
import Wallet from './models/wallet/Wallet.mjs';
import BlockchainRepository from './repositories/blockchain-repository.mjs';

const blockchainRepository = new BlockchainRepository();
export const blockChain = new Blockchain();
export const transactionPool = new TransactionPool();
export const wallet = new Wallet();
export const server = new networkServer({
  blockChain,
  transactionPool,
  wallet,
});

const DEFAULT_PORT = 3000;
const ROOT_NODE = `http://localhost:${DEFAULT_PORT}`;
let NODE_PORT;

app.use('/api/blocks', blockchainRoutes);
app.use('/api/wallet', transactionRoutes);

const synchronize = async () => {
  try {
    let response = await fetch(`${ROOT_NODE}/api/blocks`);
    if (response) {
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        console.log('Synkroniserar kedja med:', result.data);
        const success = blockChain.replaceChain(result.data);
        if (success) {
          console.log('Kedja synkroniserad framgångsrikt');
        } else {
          console.error('Kedjan kunde inte synkroniseras');
        }
      } else {
        console.error('Ogiltigt svar från root-noden:', result);
      }
    }

    response = await fetch(`${ROOT_NODE}/api/wallet/transactions`);
    if (response) {
      const result = await response.json();
      if (result.success && result.data) {
        console.log('Synkroniserar transaktionspool med:', result.data);
        transactionPool.replaceMap(result.data);
      } else {
        console.error('Ogiltigt svar för transaktioner:', result);
      }
    }
  } catch (error) {
    console.error('Fel vid synkronisering:', error);
  }
};

if (process.env.GENERATE_NODE_PORT === 'true') {
  NODE_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = NODE_PORT || DEFAULT_PORT;

app.listen(PORT, () => {
  console.log(
    `Servern är startad på adress ${PORT} och kör i läget ${process.env.NODE_ENV}`
  );

  if (PORT !== DEFAULT_PORT) {
    synchronize();
  }
});