import mongoose from 'mongoose';

const TransactionDB = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  amount: { type: Number },
  recipient: { type: String },
  input: {
    timestamp: { type: Number },
    amount: { type: Number },
    address: { type: String },
    signature: { type: mongoose.Schema.Types.Mixed }
  },
  outputMap: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Number, default: Date.now }
});

export default mongoose.model('TransactionDB', TransactionDB); 