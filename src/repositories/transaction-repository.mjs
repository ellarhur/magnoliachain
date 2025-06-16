import Transaction, { TransactionModel } from '../models/wallet/Transaction.mjs';

export default class TransactionRepository {
  async add(transaction) {
    const transactionData = transaction.toJSON();
    return await TransactionModel.create(transactionData);
  }

  async find(id) {
    const transaction = await TransactionModel.findOne({ id });
    return transaction ? Transaction.fromJSON(transaction) : null;
  }

  async list() {
    const transactions = await TransactionModel.find().sort({ 'input.timestamp': -1 });
    return transactions.map(transaction => Transaction.fromJSON(transaction));
  }

  async saveTransactions(transactions) {
    const operations = transactions.map(transaction => ({
      updateOne: {
        filter: { id: transaction.id },
        update: transaction.toJSON(),
        upsert: true
      }
    }));

    if (operations.length > 0) {
      await TransactionModel.bulkWrite(operations);
    }
  }
}