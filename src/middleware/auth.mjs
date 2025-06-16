import jwt from 'jsonwebtoken';
import User from '../models/User.mjs';

// Skydda routes
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Ingen åtkomst till denna route'
    });
  }

  try {
    // Verifiera token
    const decoded = jwt.verify(token, 'din_hemliga_nyckel_här');

    // Hämta användare från token
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Ingen åtkomst till denna route'
    });
  }
};

// Ge åtkomst till specifika roller
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Användarrollen ${req.user.role} har inte åtkomst till denna route`
      });
    }
    next();
  };
}; 