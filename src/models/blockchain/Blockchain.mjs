import { createHash } from '../../utilities/hash.mjs';
import Block from './Block.mjs';
import TransactionPool from '../wallet/TransactionPool.mjs';
import { MINING_REWARD } from '../../utilities/config.mjs';
import 'dotenv/config';
import Transaction from '../wallet/Transaction.mjs';
import { REWARD_INPUT } from '../../utilities/config.mjs';
import User from './User.mjs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema({
  timestamp: Number,
  hash: String,
  lastHash: String,
  data: Array,
  nonce: Number,
  difficulty: Number
});

const BlockModel = mongoose.model('Block', blockSchema);

export default class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
        this.transactionPool = new TransactionPool();
    }

    async initialize() {
        // Hämta alla blocks från databasen
        const blocks = await Block.find().sort({ timestamp: 1 });
        if (blocks.length > 0) {
            this.chain = blocks;
        }
    }

    async addBlock({ minerAddress }) {
        const transactions = this.transactionPool.getTransactionsForBlock();
        
        this.transactionPool.addRewardTransaction(minerAddress, MINING_REWARD);
        
        const addedBlock = Block.mineBlock({
          previousBlock: this.chain.at(-1),
          data: this.transactionPool.getTransactionsForBlock(),
        });

        this.chain.push(addedBlock);
        
        this.transactionPool.removeTransactionsForBlock(transactions);

        // Spara blocket i databasen
        await addedBlock.save();
    }

    async replaceChain(chain) {
        if (chain.length <= this.chain.length) {
          return;
        }
    
        if (!Blockchain.isValid(chain)) {
          return;
        }

        // Ta bort alla blocks från databasen
        await Block.deleteMany({});
        
        // Spara den nya kedjan i databasen
        for (const block of chain) {
            await new Block(block).save();
        }
        
        this.chain = chain;
    }
    
    getBalance(address) {
        let balance = 0;
    
        for (const block of this.chain) {
          for (const transaction of block.data) {
            if (transaction.input && transaction.input.address === REWARD_INPUT.address) {
              for (const output of transaction.outputs) {
                if (output.address === address) {
                  balance += output.amount;
                }
              }
              continue;
            }
            if (transaction.input.address === address) {
              balance -= transaction.input.amount;
            }
    
            for (const output of transaction.outputs) {
              if (output.address === address) {
                balance += output.amount;
              }
            }
          }
        }
    
        return balance;
    }
    
    static isValid(chain) {
        if (JSON.stringify(chain.at(0)) !== JSON.stringify(Block.genesis())) {
          return false;
        }
    
        for (let i = 1; i < chain.length; i++) {
          const { timestamp, data, hash, lastHash, nonce, difficulty } =
            chain.at(i);
          const prevHash = chain[i - 1].hash;
    
          if (lastHash !== prevHash) return false;
    
          const validHash = createHash(
            timestamp,
            data,
            lastHash,
            nonce,
            difficulty
          );
          if (hash !== validHash) return false;
        }
    
        return true;
    }

    createTransaction(sender, recipient, amount) {
        const transaction = Transaction.newTransaction({
            sender: sender,
            recipient: recipient,
            amount: amount,
            blockchain: this
        });
        this.transactionPool.addTransaction(transaction);
        return transaction;
    }
}

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