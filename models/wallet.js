import mongoose from "mongoose";


const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users', // Should match the model name
    required: true
  },
  
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  transactions: [
    {
      description: {
        type: String,  // e.g. "Pay To Picmart"
        required: true
      },
      type: {
        type: String,  // 'credit' or 'debit'
        enum: ['credit', 'debit'],
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});



const Wallet = mongoose.model('Wallet', walletSchema);

export default Wallet
