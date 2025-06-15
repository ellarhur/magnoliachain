import jwt from 'jsonwebtoken';
import User from '../models/User.mjs';
import Wallet from '../models/wallet/Wallet.mjs';
import AppError from '../middleware/appError.mjs';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Skapa en ny plånbok för användaren
    const wallet = new Wallet();

    // Skapa användaren med plånboksinformation
    const user = await User.create({
      username,
      email,
      password,
      wallet: {
        publicKey: wallet.publicKey,
        privateKey: wallet.privateKey,
        address: wallet.getAddress()
      }
    });

    // Skapa JWT
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          wallet: user.wallet
        }
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Kontrollera om användaren finns
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new AppError('Felaktig email eller lösenord', 401));
    }

    // Kontrollera lösenord
    const correct = await user.correctPassword(password);
    if (!correct) {
      return next(new AppError('Felaktig email eller lösenord', 401));
    }

    // Skapa JWT
    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      token,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          wallet: user.wallet
        }
      }
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};