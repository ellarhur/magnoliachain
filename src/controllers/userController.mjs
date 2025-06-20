import { catchErrorAsync } from '../middleware/catchErrorAsync.mjs';
import UserRepository from '../repositories/userRepository.mjs';
import AppError from '../middleware/appError.mjs';
import jwt from 'jsonwebtoken';

export const addUser = catchErrorAsync(async (req, res, next) => {
  const userRepo = new UserRepository();
  
  const user = await userRepo.add(req.body);

  if (!user) {
    return next(new AppError('Kunde inte skapa användare..', 400));
  }
  
  const token = jwt.sign(
    { id: user._id }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' }
  );

  res.status(201).json({
    success: true,
    statusCode: 201,
    data: { user, token }
  });
});

export const listUsers = catchErrorAsync(async (req, res, next) => {
  const userRepo = new UserRepository();

  const users = await userRepo.list();

  if (!users || users.length === 0) {
    return next(new AppError('Hittade inte användaren', 404));
  }

  res.status(200).json({
    success: true,
    statusCode: 200,
    data: { users }
  });
});
