import Transaction from '../models/wallet/Transaction.mjs';

export default class TransactionRepository{
  async add(transaction) {
    return await Transaction.create(transaction);
  }
  async find(id) {
    return await Transaction.findById(id);
  }

  async list() {
    return await Transactions.find();
  }
}