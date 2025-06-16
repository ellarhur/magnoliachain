import jwt from 'jsonwebtoken';
import { catchErrorAsync } from '../middleware/catchErrorAsync.mjs';
import AppError from '../middleware/appError.mjs';
import UserRepository from '../repositories/users-repository.mjs';

export const register = catchErrorAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(new AppError('Alla fält måste fyllas i', 400));
  }

  const userRepository = new UserRepository();
  
  // Kolla om användaren redan finns
  const existingUser = await userRepository.find(email);
  if (existingUser) {
    return next(new AppError('En användare med denna e-post finns redan', 400));
  }

  // Skapa ny användare
  const user = await userRepository.create({
    username,
    email,
    password
  });

  // Skapa token
  const token = createToken(user._id);

  res.status(201).json({
    success: true,
    statusCode: 201,
    data: { token }
  });
});

export const login = catchErrorAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('e-post och eller lösenord saknas', 400));
  }

  // Hämta användarens uppgifter...
  const user = await new UserRepository().find(email, true);

  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError('e-post och eller lösenord är felaktigt', 401));
  }

  // Skapa ett jwt token...
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