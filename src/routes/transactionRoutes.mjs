import express from 'express';
import {
  addTransaction,
  listAllTransactions,
} from '../controllers/transactionController.mjs';

const router = express.Router();

router.route('/transactions').post(addTransaction).get(listAllTransactions);

export default router;