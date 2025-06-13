import { blockChain } from '../../server.mjs';
import { server } from '../../server.mjs';
import Transaction from '../models/wallet/Transaction.mjs';
import { REWARD_INPUT, MINING_REWARD } from '../../src/utilities/config.mjs';

export const getTransactionPool = (req, res) => {
  res.status(200).json({
    success: true,
    data: blockChain.transactionPool.transactions
  });
};

// Skapa en ny transaktion
export const createTransaction = (req, res) => {
  const { recipient, amount } = req.body;
  const { address } = req.user; // Hämtas från JWT

  try {
    const transaction = Transaction.newTransaction({
      sender: address,
      recipient,
      amount
    });

    blockChain.transactionPool.addTransaction(transaction);
    server.broadcastTransactionPool();

    res.status(201).json({
      success: true,
      message: 'Transaktion skapad',
      data: transaction
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getUserTransactions = (req, res) => {
  const { address } = req.user;
  
  const transactions = blockChain.chain
    .flatMap(block => block.data)
    .filter(transaction => 
      transaction.input.address === address || 
      transaction.outputs.some(output => output.address === address)
    );

  res.status(200).json({
    success: true,
    data: transactions
  });
};

export const mineTransactions = (req, res) => {
  const { address } = req.user;

  try {
    const rewardTransaction = Transaction.rewardTransaction({
      minerAddress: address,
      reward: MINING_REWARD
    });

    blockChain.transactionPool.addTransaction(rewardTransaction);

    blockChain.addBlock({ data: blockChain.transactionPool.transactions });

    blockChain.transactionPool.clear();

    server.broadcast();
    server.broadcastTransactionPool();

    res.status(200).json({
      success: true,
      message: 'Nytt block skapat',
      data: blockChain.chain[blockChain.chain.length - 1]
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};