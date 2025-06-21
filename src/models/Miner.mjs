import Transaction from './Transaction.mjs';

export default class Miner {
  constructor({ transactionPool, wallet, blockchain, server }) {
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.blockchain = blockchain;
    this.server = server;
  }

  async mineTransactions() {
    const validTransactions = this.transactionPool.validTransactions();

    if (validTransactions.length === 0) {
      console.log('No valid transactions to mine');
      return;
    }

    validTransactions.push(
      Transaction.rewardTransaction({ minerWallet: this.wallet })
    );

    await this.blockchain.addBlock({ data: validTransactions });

    this.server.broadcast();

    this.transactionPool.clear();
  }
}
