import { createHash } from '../../utilities/hash.mjs';
import { REWARD_INPUT, MINING_REWARD } from '../../utilities/config.mjs';

export default class Transaction {
  constructor({ sender, recipient, amount, input, outputs }) {
    this.sender = sender;
    this.recipient = recipient;
    this.amount = amount;
    this.input = input;
    this.outputs = outputs;
  }

  static newTransaction({ sender, recipient, amount, blockchain }) {
    if (amount <= 0) {
      throw new Error('Beloppet måste vara större än 0');
    }

    // Beräkna avsändarens saldo
    const balance = blockchain.getBalance(sender);
    
    if (amount > balance) {
      throw new Error('Otillräckligt saldo');
    }

    return new Transaction({
      sender,
      recipient,
      amount,
      input: this.createInput(sender, balance),
      outputs: this.createOutputs({ sender, recipient, amount, balance })
    });
  }

  static rewardTransaction({ minerAddress, reward }) {
    return new Transaction({
      sender: REWARD_INPUT.address,
      recipient: minerAddress,
      amount: reward,
      input: REWARD_INPUT,
      outputs: [{ address: minerAddress, amount: reward }]
    });
  }

  static createInput(sender, balance) {
    return {
      timestamp: Date.now(),
      address: sender,
      amount: balance,
      signature: 'signature'
    };
  }

  static createOutputs({ sender, recipient, amount, balance }) {
    const outputs = [];
    outputs.push({ address: recipient, amount });
    outputs.push({ address: sender, amount: balance - amount });
    return outputs;
  }

  static validateTransaction(transaction) {
    const { input, outputs } = transaction;
    const outputTotal = outputs.reduce((total, output) => total + output.amount, 0);

    if (input.amount !== outputTotal) {
      return false;
    }

    return true;
  }
} 