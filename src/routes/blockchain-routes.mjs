import { Router } from 'express';
import { protect } from '../middleware/auth.mjs';
import {
  addBlock,
  listAllBlocks,
} from '../controllers/blockchain-controller.mjs';

const routes = Router();

routes.use(protect); // Skyddar alla blockchain-routes

routes.get('/', listAllBlocks);
routes.post('/mine', addBlock);

export default routes;