import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const User = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Förnamn måste anges'],
  },
  lastName: {
    type: String,
    required: [true, 'Efternamn måste anges'],
  },
  email: {
    type: String,
    required: [true, 'E-post måste anges'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Ange en giltig e-postadress'],
  },
  password: {
    type: String,
    required: [true, 'Lösenord måste anges'],
    select: false,
  },
});

User.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

User.methods.checkPassword = async function (
  passwordToCheck,
  userPassword
) {
  return await bcrypt.compare(passwordToCheck, userPassword);
};

export default mongoose.model('User', User);