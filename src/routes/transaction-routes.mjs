import express from 'express';
import {
  addTransaction,
  listTransactions,
} from '../controllers/transaction-controller.mjs';

const router = express.Router();

router.route('/transactions').post(addTransaction).get(listTransactions);

export default router;