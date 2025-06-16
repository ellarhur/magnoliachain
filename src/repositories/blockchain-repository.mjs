import Block from '../models/blockchain/Block.mjs';
import Blockchain from '../models/blockchain/Blockchain.mjs';

export default class BlockchainRepository {
  async add(block) {
    return await Block.create(block);
  }
  async find(id) {
    return await Block.findById(id);
  }

  async list() {
    return await Block.find();
  }
}