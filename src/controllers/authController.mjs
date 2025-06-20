import jwt from 'jsonwebtoken';
import { catchErrorAsync } from '../middleware/catchErrorAsync.mjs';
import AppError from '../middleware/appError.mjs';
import UserRepository from '../repositories/userRepository.mjs';

export const loginUser = catchErrorAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Försök logga in igen med rätt information', 400));
  }

  const user = await new UserRepository().find(email, true);

  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError('Försök logga in igen med rätt information', 401));
  }

  const token = createToken(user._id);

  res
    .status(200)
    .json({ success: true, statusCode: 200, data: { token: token } });
});

const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};