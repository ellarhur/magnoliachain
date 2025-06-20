import Transaction from '../models/Transaction.mjs';

export default class TransactionRepository {
  async add(transaction) {
    const transactionData = {
      id: transaction.id,
      input: transaction.input,
      outputs: transaction.outputs,
    };

    return await Transaction.create(transactionData);
  }

  async list() {
    return await Transaction.find();
  }

  async findById(id) {
    return await Transaction.findOne({ id });
  }
}
