import { createHash } from '../utils/hash.mjs';
import Block from './Block.mjs';
import TransactionDB from './TransactionDB.mjs';
import { REWARD_ADDRESS, MINING_REWARD } from '../utils/config.mjs';

export default class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
  }

  async addBlock({ data }) {
    const addedBlock = Block.mineBlock({
      previousBlock: this.chain.at(-1),
      data,
    });
    this.chain.push(addedBlock);

    // Spara blocket till MongoDB
    try {
      await Block.create({
        timestamp: addedBlock.timestamp,
        data: addedBlock.data,
        hash: addedBlock.hash,
        lastHash: addedBlock.lastHash,
        nonce: addedBlock.nonce,
        difficulty: addedBlock.difficulty
      });

      // Spara transaktioner till MongoDB
      if (Array.isArray(addedBlock.data)) {
        for (const transaction of addedBlock.data) {
          try {
            // Extrahera recipient och amount från outputMap för vanliga transaktioner
            let recipient = null;
            let amount = null;
            
            if (transaction.input && transaction.input.address !== '#reward-address#' && transaction.outputMap) {
              const senderAddress = transaction.input.address;
              const outputKeys = Object.keys(transaction.outputMap);
              
              // Hitta recipient (den som inte är sender)
              recipient = outputKeys.find(key => key !== senderAddress);
              amount = recipient ? transaction.outputMap[recipient] : null;
            }
            
            await TransactionDB.create({
              id: transaction.id,
              amount: amount || transaction.amount,
              recipient: recipient || transaction.recipient,
              input: transaction.input,
              outputMap: transaction.outputMap,
              timestamp: transaction.input?.timestamp || Date.now()
            });
          } catch (error) {
            console.log('Transaction already exists or error saving:', error.message);
          }
        }
      }

      console.log(`Block ${addedBlock.hash.substring(0, 10)}... saved to database`);
    } catch (error) {
      console.error('Error saving block to database:', error);
    }
  }

  replaceChain(chain, callback) {
    if (chain.length <= this.chain.length) return;

    if (!Blockchain.isValid(chain)) return;

    if (callback) callback();

    this.chain = chain;
  }

  validateTransactionData({ chain }) {
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      let rewardCount = 0;

      for (let transaction of block.data) {
        if (transaction.input.address === REWARD_ADDRESS.address) {
          rewardCount += 1;

          if (rewardCount > 1) {
            console.error('Too many rewards');
            return false;
          }
        }
      }
    }
    return true;
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
}