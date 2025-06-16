import { createHash } from '../../utilities/hash.mjs';
import Block from './Block.mjs';

export default class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
  }

  addBlock({ data }) {
    const addedBlock = Block.mineBlock({
      previousBlock: this.chain.at(-1),
      data,
    });
    this.chain.push(addedBlock);
    return addedBlock;
  }

  replaceChain(chain) {
    try {
            if (!Array.isArray(chain)) {
        console.error('Ogiltig kedja: måste vara en array');
        return false;
      }

      // Validera att kedjan inte är tom
      if (chain.length === 0) {
        console.error('Ogiltig kedja: kedjan är tom');
        return false;
      }

      // Validera att kedjan är längre än den nuvarande
      if (chain.length <= this.chain.length) {
        console.log('Kedjan är inte längre än den nuvarande, ingen uppdatering behövs');
        return false;
      }

      // Validera att genesis-blocket är korrekt
      const genesisBlock = Block.genesis();
      const receivedGenesis = chain[0];
      
      if (!this.isValidGenesisBlock(receivedGenesis)) {
        console.error('Ogiltig kedja: genesis-blocket är inte korrekt');
        return false;
      }

      // Validera hela kedjan
      if (!Blockchain.isValid(chain)) {
        console.error('Ogiltig kedja: validering misslyckades');
        return false;
      }

      console.log('Ersätter kedja med:', chain);
      this.chain = chain;
      return true;
    } catch (error) {
      console.error('Fel vid ersättning av kedja:', error);
      return false;
    }
  }

  isValidGenesisBlock(block) {
    const genesisBlock = Block.genesis();
    return (
      block.hash === genesisBlock.hash &&
      block.lastHash === genesisBlock.lastHash &&
      block.data.length === 0 &&
      block.nonce === genesisBlock.nonce &&
      block.difficulty === genesisBlock.difficulty
    );
  }

  static isValid(chain) {
    try {
      // Validera genesis-blocket
      if (!chain[0] || JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
        console.error('Ogiltig genesis-block');
        return false;
      }

      // Validera resten av kedjan
      for (let i = 1; i < chain.length; i++) {
        const { timestamp, data, hash, lastHash, nonce, difficulty } = chain[i];
        const prevHash = chain[i - 1].hash;

        // Validera länk till föregående block
        if (lastHash !== prevHash) {
          console.error(`Ogiltig länk vid block ${i}: lastHash (${lastHash}) matchar inte prevHash (${prevHash})`);
          return false;
        }

        // Validera hash
        const validHash = createHash(timestamp, data, lastHash, nonce, difficulty);
        if (hash !== validHash) {
          console.error(`Ogiltig hash vid block ${i}: ${hash} !== ${validHash}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Fel vid validering av kedja:', error);
      return false;
    }
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  getChain() {
    return this.chain;
  }
}