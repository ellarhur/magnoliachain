import Block, { BlockModel } from '../models/blockchain/Block.mjs';
import Blockchain from '../models/blockchain/Blockchain.mjs';

export default class BlockchainRepository {
  async add(block) {
    const blockData = block.toJSON();
    return await BlockModel.create(blockData);
  }

  async find(hash) {
    const block = await BlockModel.findOne({ hash });
    return block ? Block.fromJSON(block) : null;
  }

  async list() {
    const blocks = await BlockModel.find().sort({ timestamp: 1 });
    return blocks.map(block => Block.fromJSON(block));
  }

  async getLatestBlock() {
    const block = await BlockModel.findOne().sort({ timestamp: -1 });
    return block ? Block.fromJSON(block) : null;
  }

  async saveChain(chain) {
    const operations = chain.map(block => ({
      updateOne: {
        filter: { hash: block.hash },
        update: block.toJSON(),
        upsert: true
      }
    }));

    if (operations.length > 0) {
      await BlockModel.bulkWrite(operations);
    }
  }

  async getFullChain() {
    const blocks = await BlockModel.find().sort({ timestamp: 1 });
    return blocks.map(block => {
      const blockData = block.toObject();
      return {
        timestamp: blockData.timestamp,
        hash: blockData.hash,
        lastHash: blockData.lastHash,
        data: blockData.data,
        nonce: blockData.nonce,
        difficulty: blockData.difficulty
      };
    });
  }
}