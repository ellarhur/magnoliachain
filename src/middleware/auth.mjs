import jwt from 'jsonwebtoken';
import User from '../models/blockchain/User.mjs';
import AppError from './appError.mjs';

export const protect = async (req, res, next) => {
  try {
    // 1) Kontrollera om token finns
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Du är inte inloggad', 401));
    }

    // 2) Verifiera token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Kontrollera om användaren fortfarande finns
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('Användaren finns inte längre', 401));
    }

    // 4) Lägg till användaren i request
    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Du är inte inloggad', 401));
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Du har inte behörighet för denna åtgärd', 403));
    }
    next();
  };
}; 