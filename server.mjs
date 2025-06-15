import { app } from './app.mjs';
import blockchainRoutes from './src/routes/blockchain-routes.mjs';
import networkServer from './network.mjs';
import Blockchain from './src/models/blockchain/Blockchain.mjs';
import { connectDb } from './src//db/magnolia.mjs'; 

export const blockChain = new Blockchain();
export const server = new networkServer({ blockchain: blockChain });

const DEFAULT_PORT = 3000;
const ROOT_NODE = `http://localhost:${DEFAULT_PORT}`;
let NODE_PORT;
const activeNodes = new Set();

app.use('/api/blocks/', blockchainRoutes);

const synchronize = async () => {
  const response = await fetch(`${ROOT_NODE}/api/blocks`);
  if (response) {
    const result = await response.json();
    console.log('Replacing chain on sync with:', result.data.chain);
    blockChain.replaceChain(result.data.chain);
  }
};

const displayActiveNodes = () => {
  console.log('\nLista på aktiva noder:');
  activeNodes.forEach(node => {
    console.log(`Node på http://localhost:${node}`);
  });
};

if (process.env.GENERATE_NODE_PORT === 'true') {
  NODE_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = NODE_PORT || DEFAULT_PORT;
activeNodes.add(PORT);

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(
      `Servern är startad på port ${PORT} (${process.env.NODE_ENV})`
    );
    displayActiveNodes();

    if (PORT !== DEFAULT_PORT) {
      synchronize();
    }
  });
}).catch(err => {
  console.error('MongoDB-fel:', err.message);
});