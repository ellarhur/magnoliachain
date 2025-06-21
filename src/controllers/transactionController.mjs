import { transactionPool, wallet, network, blockChain } from '../server.mjs';
import Miner from '../models/Miner.mjs';
import Wallet from '../models/Wallet.mjs';
import { catchErrorAsync } from '../middleware/catchErrorAsync.mjs';

export const addTransaction = (req, res) => {
  const { amount, recipient } = req.body;
  let transaction = transactionPool.transactionExists({
    address: wallet.publicKey,
  });

  try {
    if (transaction) {
      transaction.update({ sender: wallet, recipient, amount });
    } else {
      transaction = wallet.createTransaction({ recipient, amount });
    }
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, statusCode: 400, error: error.message });
  }

  transactionPool.addTransaction(transaction);
  network.broadcastTransaction(transaction);

  res.status(201).json({ success: true, statusCode: 201, data: transaction });
};

export const getWalletInfo = (req, res) => {
  const address = wallet.publicKey;
  const balance = Wallet.calculateBalance({
    chain: blockChain.chain,
    address: address,
  });

  res
    .status(200)
    .json({
      success: true,
      statusCode: 200,
      data: { address: address, balance: balance },
    });
};

export const listAllTransactions = (req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    data: transactionPool.transactionMap,
  });
};

export const mineTransactions = catchErrorAsync(async (req, res) => {
  const miner = new Miner({
    transactionPool: transactionPool,
    wallet: wallet,
    blockchain: blockChain,
    server: network,
  });

  await miner.mineTransactions();

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Block mined successfully',
    data: { 
      chain: blockChain.chain,
      newBlockIndex: blockChain.chain.length - 1
    }
  });
});