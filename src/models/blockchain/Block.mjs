import mongoose from 'mongoose';
import { createHash } from '../../utilities/hash.mjs';

const blockSchema = new mongoose.Schema({
  timestamp: {
    type: Number,
    required: true
  },
  hash: {
    type: String,
    required: true
  },
  lastHash: {
    type: String,
    required: true
  },
  data: [{
    type: mongoose.Schema.Types.Mixed,
    required: true
  }],
  nonce: {
    type: Number,
    required: true
  },
  difficulty: {
    type: Number,
    required: true
  }
});

const BlockModel = mongoose.model('Block', blockSchema);

export default class Block {
  constructor(timestamp, data, lastHash = '') {
    this.timestamp = timestamp;
    this.data = data;
    this.lastHash = lastHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
    this.difficulty = 2;
  }

  calculateHash() {
    return createHash(
      this.timestamp,
      this.data,
      this.lastHash,
      this.nonce,
      this.difficulty
    );
  }

  static genesis() {
    return new Block(0, [], '0');
  }

  static mineBlock({ previousBlock, data }) {
    const block = new Block(
      Date.now(),
      data,
      previousBlock.hash
    );

    let nonce = 0;
    while (true) {
      block.nonce = nonce;
      block.hash = block.calculateHash();
      if (block.hash.startsWith('0'.repeat(block.difficulty))) {
        break;
      }
      nonce++;
    }

    return block;
  }

  async save() {
    const blockDoc = new BlockModel(this);
    return await blockDoc.save();
  }

  static async findOne(query) {
    return await BlockModel.findOne(query);
  }

  static async find(query) {
    return await BlockModel.find(query);
  }
}