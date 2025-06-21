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

export const protect = catchErrorAsync(async (req, res, next) => {
  // 1) Hämta token och kontrollera om den finns
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Du är inte inloggad! Logga in för att få åtkomst.', 401));
  }

  // 2) Verifiera token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3) Kontrollera om användaren fortfarande finns
  const currentUser = await new UserRepository().findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('Användaren som tillhör denna token finns inte längre.', 401));
  }

  // 4) Lägg till användaren i req-objektet
  req.user = currentUser;
  next();
});

const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || '7d',
  });
};