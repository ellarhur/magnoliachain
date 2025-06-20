import { ec } from 'elliptic';
import { INITIAL_BALANCE } from '../utils/config.mjs';
import { verify } from '../utils/verify.mjs';
import { createHash } from '../utils/hash.mjs';
import Transaction from './Transaction.mjs';

const keyManager = new ec('secp256k1');

export default class Wallet {
  constructor() {
    this.balance = INITIAL_BALANCE;
    this.keyPair = keyManager.genKeyPair();
    this.publicKey = this.keyPair.getPublic().encode('hex');
  }

  static calculateBalance({ chain, address }) {
    let total = 0,
      hasMadeTransaction = false;

    for (let i = chain.length - 1; i > 0; i--) {
      const block = chain[i];

      for (let transaction of block.data) {
        if (transaction.input.address === address) {
          hasMadeTransaction = true;
        }

        const amount = transaction.outputMap[address];

        if (amount) {
          total += amount;
        }
      }

      if (hasMadeTransaction) break;
    }
    return hasMadeTransaction ? total : INITIAL_BALANCE + total;
  }

  sign(data) {
    return this.keyPair.sign(createHash(data));
  }

  createTransaction({ recipient, amount, chain }) {
    if (chain) {
      this.balance = Wallet.calculateBalance({
        chain: chain,
        address: this.publicKey,
      });
    }

    if (amount > this.balance) throw new Error('Not enough funds!');
    return new Transaction({ sender: this, recipient, amount });
  }
}