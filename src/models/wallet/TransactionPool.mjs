import Transaction from './Transaction.mjs';

export default class TransactionPool {
    constructor() {
      this.transactions = [];
    }
  
    addTransaction(transaction) {
      if (!Transaction.validateTransaction(transaction)) {
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
  
    addRewardTransaction(minerAddress, reward) {
      const rewardTransaction = Transaction.rewardTransaction({ 
        minerAddress, 
        reward 
      });
      this.transactions.push(rewardTransaction);
    }
  
    clear() {
      this.transactions = [];
    }
  
    validTransactions() {
      return this.transactions.filter(transaction =>
        Transaction.validateTransaction(transaction)
      );
    }

    getTransactionsForBlock() {
      const validTransactions = this.validTransactions();
      return validTransactions;
    }

    removeTransactionsForBlock(transactions) {
      this.transactions = this.transactions.filter(
        transaction => !transactions.includes(transaction)
      );
    }
  } 