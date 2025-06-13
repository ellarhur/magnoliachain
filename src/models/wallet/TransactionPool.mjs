export default class TransactionPool {
    constructor() {
      this.transactions = [];
    }
  
    addTransaction(transaction) {
      if (!transaction.validateTransaction(transaction)) {
        throw new Error('Ogiltig transaktion');
      }
  
      const existingTransaction = this.transactions.find(
        t => t.input.address === transaction.input.address
      );
  
      if (existingTransaction) {
        this.transactions = this.transactions.map(t =>
          t.input.address === transaction.input.address ? transaction : t
        );
      } else {
        this.transactions.push(transaction);
      }
    }
  
    clear() {
      this.transactions = [];
    }
  
    validTransactions() {
      return this.transactions.filter(transaction =>
        transaction.validateTransaction(transaction)
      );
    }
  } 