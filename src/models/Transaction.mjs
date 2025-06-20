import { v4 as uuidv4 } from 'uuid';
import { verifySignature } from '../utils/verify.mjs';
import { MINING_REWARD, REWARD_ADDRESS } from '../utils/config.mjs';

export default class Transaction {
  constructor({ senderWallet, recipient, amount, input, outputMap }) {
    this.id = uuidv4().replaceAll('-', '');
    this.outputMap =
      outputMap ||
      this.createOutputMap({ senderWallet, recipient, amount });
    this.input =
      input || this.createInput({ senderWallet, outputMap: this.outputMap });
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

  static rewardTransaction({ minerWallet }) {
    return new this({
      input: REWARD_ADDRESS,
      outputMap: { [minerWallet.publicKey]: MINING_REWARD },
    });
  }

  update({ senderWallet, recipient, amount }) {
    if (amount > this.outputMap[senderWallet.publicKey])
      throw new Error('Amount exceeds balance');

    if (!this.outputMap[recipient]) {
      this.outputMap[recipient] = amount;
    } else {
      this.outputMap[recipient] = this.outputMap[recipient] + amount;
    }

    this.outputMap[senderWallet.publicKey] =
      this.outputMap[senderWallet.publicKey] - amount;

    this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
  }

  createOutputMap({ senderWallet, recipient, amount }) {
    const map = {};

    map[recipient] = amount;
    map[senderWallet.publicKey] = senderWallet.balance - amount;
    return map;
  }

  createInput({ senderWallet, outputMap }) {
    return {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(outputMap),
    };
  }
}