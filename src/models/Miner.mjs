import Transaction from './Transaction.mjs';

export default class Miner {
  constructor({ transactionPool, wallet, blockchain, server }) {
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.blockchain = blockchain;
    this.server = server;
  }

  mineTransactions() {
    const validTransactions = this.transactionPool.validTransactions();

    if (validTransactions.length === 0) {
      return;
    }

    validTransactions.push(
      Transaction.rewardTransaction({ minerWallet: this.wallet })
    );

    this.blockchain.addBlock({ data: validTransactions });

    this.server.broadcast();

    this.transactionPool.clear();
  }
}
