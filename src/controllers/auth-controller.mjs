import jwt from 'jsonwebtoken';
import { catchErrorAsync } from '../middleware/catchErrorAsync.mjs';
import AppError from '../middleware/appError.mjs';
import User from '../models/blockchain/User.mjs';
import dotenv from 'dotenv';

// Ladda miljövariabler
dotenv.config();

// Kontrollera att JWT_SECRET finns
if (!process.env.JWT_SECRET) {
    console.error('VARNING: JWT_SECRET är inte definierad i miljövariablerna');
    process.exit(1);
}

export const register = catchErrorAsync(async (req, res, next) => {
    console.log('Registreringsförsök:', { ...req.body, password: '***' });
    
    const { username, email, password } = req.body;

    // Kontrollera om användaren redan finns
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        console.log('Användare finns redan:', email);
        return next(new AppError('Användaren finns redan', 400));
    }

    try {
        // Skapa ny användare
        const user = await User.create({
            username,
            email,
            password
        });

        console.log('Användare skapad:', { id: user._id, email: user.email });

        // Skapa JWT token med modellens metod
        const token = user.getSignedJwtToken();

        // Ta bort lösenord från svaret
        user.password = undefined;

        res.status(201).json({
            success: true,
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email
                }
            }
        });
    } catch (error) {
        console.error('Fel vid användarskapande:', error);
        return next(new AppError('Kunde inte skapa användare: ' + error.message, 500));
    }
});

export const login = catchErrorAsync(async (req, res, next) => {
    console.log('Inloggningsförsök:', { ...req.body, password: '***' });
    
    const { email, password } = req.body;

    // Hitta användaren och inkludera lösenordet
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        console.log('Användare hittades inte:', email);
        return next(new AppError('Felaktig e-post eller lösenord', 401));
    }

    // Kontrollera lösenord med modellens metod
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        console.log('Felaktigt lösenord för användare:', email);
        return next(new AppError('Felaktig e-post eller lösenord', 401));
    }

    console.log('Användare inloggad:', { id: user._id, email: user.email });

    // Skapa JWT token med modellens metod
    const token = user.getSignedJwtToken();

    // Ta bort lösenord från svaret
    user.password = undefined;

    res.json({
        success: true,
        data: {
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        }
    });
});