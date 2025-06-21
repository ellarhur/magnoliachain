import { blockChain, network } from '../server.mjs';

export const listAllBlocks = (req, res) => {
  res.status(200).json({ 
    success: true, 
    data: { 
      chain: blockChain.chain 
    } 
  });
};

export const addBlock = (req, res) => {
  const { data } = req.body;

  blockChain.addBlock({ data });

  network.broadcast();

  res
    .status(201)
    .json({ success: true, message: 'Block is added', data: { chain: blockChain.chain } });
};