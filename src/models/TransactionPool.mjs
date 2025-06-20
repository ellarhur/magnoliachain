import Transaction from './Transaction.mjs';

export default class TransactionPool {
  constructor() {
    this.transactionMap = {};
  }

  addTransaction(transaction) {
    this.transactionMap[transaction.id] = transaction;
  }

  clearBlockTransactions({ chain }) {
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];

      for (let transaction of block.data) {
        if (this.transactionMap[transaction.id]) {
          delete this.transactionMap[transaction.id];
        }
      }
    }
  }

  clearTransactions() {
    this.transactionMap = {};
  }

  replaceMap(transactionMap) {
    this.transactionMap = transactionMap;
  }

  transactionExists({ address }) {
    const transactions = Object.values(this.transactionMap);
    return transactions.find(
      (transaction) => transaction.input.address === address
    );
  }

  validateTransactions() {
    return Object.values(this.transactionMap).filter((transaction) =>
      Transaction.validate(transaction)
    );
  }

  // Alias för kompatibilitet med Miner.mjs
  validTransactions() {
    return this.validateTransactions();
  }

  // Alias för kompatibilitet med Miner.mjs  
  clear() {
    this.clearTransactions();
  }
}