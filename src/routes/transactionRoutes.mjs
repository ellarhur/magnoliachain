import express from 'express';
import {
  addTransaction,
  listAllTransactions,
  mineTransactions,
} from '../controllers/transactionController.mjs';

const router = express.Router();

router.route('/').post(addTransaction).get(listAllTransactions);
router.route('/mine').get(mineTransactions);

export default router;