import { MINE_RATE } from '../../utilities/config.mjs';
import { createHash } from '../../utilities/hash.mjs';
import { GENESIS_BLOCK } from './genesis.mjs';
import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema({
  timestamp: {
    type: Number,
    required: true
  },
  hash: {
    type: String,
    required: true,
    unique: true
  },
  lastHash: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  nonce: {
    type: Number,
    required: true
  },
  difficulty: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

const BlockModel = mongoose.model('Block', blockSchema);

export default class Block {
  constructor({ timestamp, hash, lastHash, data, nonce, difficulty }) {
    this.timestamp = timestamp;
    this.hash = hash;
    this.lastHash = lastHash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty;
  }

  static genesis() {
    return new this(GENESIS_BLOCK);
  }

  static mineBlock({ previousBlock, data }) {
    let timestamp, hash;
    const lastHash = previousBlock.hash;
    let { difficulty } = previousBlock;
    let nonce = 0;

    do {
      nonce++;
      timestamp = Date.now();
      difficulty = Block.adjustDifficultyLevel({
        block: previousBlock,
        timestamp,
      });
      hash = createHash(timestamp, lastHash, data, nonce, difficulty);
    } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

    return new this({ timestamp, hash, lastHash, data, nonce, difficulty });
  }

  static adjustDifficultyLevel({ block, timestamp }) {
    const { difficulty } = block;

    if (difficulty < 1) return 1;

    if (timestamp - block.timestamp > MINE_RATE) {
      return difficulty - 1;
    }

    return difficulty + 1;
  }

  toJSON() {
    return {
      timestamp: this.timestamp,
      hash: this.hash,
      lastHash: this.lastHash,
      data: this.data,
      nonce: this.nonce,
      difficulty: this.difficulty
    };
  }

  static fromJSON(json) {
    return new this(json);
  }
}

export { BlockModel };