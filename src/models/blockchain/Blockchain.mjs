import { createHash } from '../../utilities/hash.mjs';
import Block from './Block.mjs';
import TransactionPool from '../wallet/TransactionPool.mjs';
import 'dotenv/config';

export default class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
        this.transactionPool = new TransactionPool();
    }

    addBlock({ data }) {
        const addedBlock = Block.mineBlock({
          previousBlock: this.chain.at(-1),
          data,
        });
        this.chain.push(addedBlock);
      }
      replaceChain(chain) {
        if (chain.length <= this.chain.length) {
          return;
        }
    
        if (!Blockchain.isValid(chain)) {
          return;
        }
        this.chain = chain;
      }
    
      getBalance(address) {
        let balance = 0;
    
        for (const block of this.chain) {
          for (const transaction of block.data) {
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
    }