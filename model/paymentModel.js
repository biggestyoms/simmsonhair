const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  transactionId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Creating a model from the schema
const Payment = mongoose.model('Payment', paymentSchema);

// Exporting the Payment model
module.exports = Payment;


