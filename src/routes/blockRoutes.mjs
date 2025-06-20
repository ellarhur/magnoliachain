import { Router } from 'express';
import {
  addBlock,
  listAllBlocks,
} from '../controllers/blockController.mjs';

const routes = Router();

routes.get('/', listAllBlocks);
routes.post('/mine', addBlock);

export default routes;