import jwt from 'jsonwebtoken';
import { catchErrorAsync } from '../middleware/catchErrorAsync.mjs';
import AppError from '../middleware/appError.mjs';
import UserRepository from '../repositories/users-repository.mjs';

export const register = catchErrorAsync(async (req, res, next) => {
  console.log('Registreringsförsök med data:', req.body);
  
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    console.log('Saknade fält:', { username, email, password: password ? 'finns' : 'saknas' });
    return next(new AppError('Alla fält måste fyllas i', 400));
  }

  const userRepository = new UserRepository();
  
  try {
    const existingUser = await userRepository.find(email);
    if (existingUser) {
      console.log('Användare finns redan:', email);
      return next(new AppError('En användare med denna e-post finns redan', 400));
    }

    console.log('Skapar ny användare...');
    const user = await userRepository.add({
      username,
      email,
      password
    });
    console.log('Användare skapad:', user._id);

    const token = createToken(user._id);
    console.log('Token skapad för användare:', user._id);

    res.status(201).json({
      success: true,
      statusCode: 201,
      data: { token }
    });
  } catch (error) {
    console.error('Fel vid registrering:', error);
    return next(new AppError(error.message, 500));
  }
});

export const login = catchErrorAsync(async (req, res, next) => {
  console.log('Inloggningsförsök med data:', { email: req.body.email });
  
  const { email, password } = req.body;

  if (!email || !password) {
    console.log('Saknade fält vid inloggning');
    return next(new AppError('e-post och eller lösenord saknas', 400));
  }

  const userRepository = new UserRepository();
  const user = await userRepository.find(email, true);

  if (!user || !(await user.matchPassword(password))) {
    console.log('Felaktiga inloggningsuppgifter för:', email);
    return next(new AppError('e-post och eller lösenord är felaktigt', 401));
  }

  const token = createToken(user._id);
  console.log('Inloggning lyckades för:', email);

  res
    .status(200)
    .json({ success: true, statusCode: 200, data: { token: token } });
});

const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};