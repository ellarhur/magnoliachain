import { createHash } from '../../utilities/hash.mjs';
import { REWARD_INPUT } from '../../utilities/config.mjs';

export default class Transaction {
  constructor({ sender, recipient, amount, input, outputs }) {
    this.sender = sender;
    this.recipient = recipient;
    this.amount = amount;
    this.input = input;
    this.outputs = outputs;
  }

  static newTransaction({ sender, recipient, amount }) {
    if (amount <= 0) {
      throw new Error('Beloppet måste vara större än 0');
    }

    return new Transaction({
      sender,
      recipient,
      amount,
      input: this.createInput(sender),
      outputs: this.createOutputs({ sender, recipient, amount })
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

  static createInput(sender) {
    return {
      timestamp: Date.now(),
      address: sender,
      amount: 0, 
      signature: 'signature'
    };
  }

  static createOutputs({ sender, recipient, amount }) {
    const outputs = [];
    outputs.push({ address: recipient, amount });
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