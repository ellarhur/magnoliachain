import mongoose from 'mongoose';
import { MINE_RATE, INITIAL_DIFFICULTY } from '../utils/config.mjs';
import { createHash } from '../utils/hash.mjs';

const Block = new mongoose.Schema({
  timestamp: { type: Number, required: true },
  hash: { type: String, required: true },
  lastHash: { type: String, required: true },
  data: { type: Array, required: true },
  nonce: { type: Number, required: true },
  difficulty: { type: Number, required: true },
});

Block.statics.genesis = function () {
  return new this({
    timestamp: 1,
    hash: '#1',
    lastHash: '#######',
    data: [],
    nonce: 0,
    difficulty: INITIAL_DIFFICULTY,
  });
};

Block.statics.adjustDifficultyLevel = function ({ block, timestamp }) {
  let { difficulty } = block;

  if (difficulty < 1) return 1;

  if (timestamp - block.timestamp > MINE_RATE) {
    return difficulty - 1;
  }

  return difficulty + 1;
};

Block.statics.mineBlock = function ({ previousBlock, data }) {
  let timestamp, hash;
  const lastHash = previousBlock.hash;
  let { difficulty } = previousBlock;
  let nonce = 0;

  do {
    nonce++;
    timestamp = Date.now();
    difficulty = this.adjustDifficultyLevel({
      block: previousBlock,
      timestamp,
    });
    hash = createHash(timestamp, lastHash, data, nonce, difficulty);
  } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

  return new this({ timestamp, hash, lastHash, data, nonce, difficulty });
};

export default mongoose.model('Block', Block);
