import { blockChain, server } from '../server.mjs';
import BlockchainRepository from '../repositories/blockchain-repository.mjs';

const blockchainRepository = new BlockchainRepository();

export const listAllBlocks = async (req, res) => {
  try {
    const blocks = await blockchainRepository.list();
    res.status(200).json({ success: true, data: blocks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addBlock = async (req, res) => {
  try {
    const { data } = req.body;
    const newBlock = blockChain.addBlock({ data });
    
    // Spara det nya blocket i databasen
    await blockchainRepository.add(newBlock);
    
    // Spara hela kedjan i databasen
    await blockchainRepository.saveChain(blockChain.chain);

    server.broadcast();

    res.status(201).json({ 
      success: true, 
      message: 'Block är tillagt', 
      data: blockChain.chain 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};