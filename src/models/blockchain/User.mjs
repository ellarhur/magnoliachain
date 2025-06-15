import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Användarnamn krävs'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email krävs'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Lösenord krävs'],
    minlength: 6,
    select: false
  },
  wallet: {
    publicKey: String,
    privateKey: String,
    address: String
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User; 