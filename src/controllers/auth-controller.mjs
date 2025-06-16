import jwt from 'jsonwebtoken';
import { catchErrorAsync } from '../middleware/catchErrorAsync.mjs';
import AppError from '../middleware/appError.mjs';
import User from '../models/blockchain/User.mjs';

export const register = catchErrorAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(new AppError('Alla fält måste fyllas i', 400));
  }

  const userRepository = new UserRepository();
  
  const existingUser = await userRepository.find(email);
  if (existingUser) {
    return next(new AppError('En användare med denna e-post finns redan', 400));
  }

  const user = await userRepository.create({
    username,
    email,
    password
  });

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

  const user = await new UserRepository().find(email, true);

  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError('e-post och eller lösenord är felaktigt', 401));
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

export default class UserRepository {
  async add(user) {
    return await User.create(user);
  }

  async find(email, login) {
    return login === true
      ? await User.findOne({ email: email }).select('+password')
      : await User.findOne({ email: email });
  }
}