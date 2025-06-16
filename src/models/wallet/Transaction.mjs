import { v4 as uuidv4 } from 'uuid';
import { verifySignature } from '../../utilities/verify.mjs';
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  outputMap: {
    type: Map,
    of: Number,
    required: true
  },
  input: {
    timestamp: {
      type: Number,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    signature: {
      type: String,
      required: true
    }
  }
}, {
  timestamps: true
});

const TransactionModel = mongoose.model('Transaction', transactionSchema);

export default class Transaction {
  constructor({ sender, recipient, amount }) {
    this.id = uuidv4().replaceAll('-', '');
    this.outputMap = this.createOutputMap({ sender, recipient, amount });
    this.input = this.createInput({ sender, outputMap: this.outputMap });
  }

  static validate(transaction) {
    const {
      input: { address, amount, signature },
      outputMap,
    } = transaction;

    const total = Object.values(outputMap).reduce(
      (sum, amount) => sum + amount
    );

    if (amount !== total) return false;

    if (!verifySignature({ publicKey: address, data: outputMap, signature }))
      return false;

    return true;
  }

  update({ sender, recipient, amount }) {
    if (amount > this.outputMap[sender.publicKey])
      throw new Error('Not enough funds!');
    if (!this.outputMap[recipient]) {
      this.outputMap[recipient] = amount;
    } else {
      this.outputMap[recipient] = this.outputMap[recipient] + amount;
    }

    this.outputMap[sender.publicKey] =
      this.outputMap[sender.publicKey] - amount;

    this.input = this.createInput({ sender, outputMap: this.outputMap });
  }

  createOutputMap({ sender, recipient, amount }) {
    const map = {};

    map[recipient] = amount;
    map[sender.publicKey] = sender.balance - amount;
    return map;
  }

  createInput({ sender, outputMap }) {
    return {
      timestamp: Date.now(),
      amount: sender.balance,
      address: sender.publicKey,
      signature: sender.sign(outputMap),
    };
  }

  toJSON() {
    return {
      id: this.id,
      outputMap: this.outputMap,
      input: this.input
    };
  }

  static fromJSON(json) {
    const transaction = new this({
      sender: { publicKey: json.input.address, balance: json.input.amount },
      recipient: Object.keys(json.outputMap).find(key => key !== json.input.address),
      amount: json.outputMap[Object.keys(json.outputMap).find(key => key !== json.input.address)]
    });
    transaction.id = json.id;
    return transaction;
  }
}

export { TransactionModel };