import { catchErrorAsync } from '../middleware/catchErrorAsync.mjs';
import TransactionRepository from '../repositories/transaction-repository.mjs';
import AppError from '../middleware/appError.mjs';

export const addTransaction = catchErrorAsync(async (req, res, next) => {
  const transaction = await new TransactionRepository().add(req.body);

  res
    .status(201)
    .json({ success: true, statusCode: 201, data: { transaction: transaction } });
});

export const findTransaction = catchErrorAsync(async (req, res, next) => {
  const transaction = await new TransactionRepository().find(req.params.id);

  if (!transaction) {
    return next(new AppError(`Hittade ingen transaktion med id: ${id}`, 404));
  }

  res
    .status(200)
    .json({ success: true, statusCode: 200, data: { transaction: transaction } });
});


export const listTransactions = catchErrorAsync(async (req, res, next) => {
  const transaction = await new TransactionRepository().list();

  res
    .status(200)
    .json({ success: true, statusCode: 200, data: { transaction: transaction } });
});