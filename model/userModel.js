const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['admin', 'normal'],
    default: 'normal',
  },
  cart: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      default: 1
    }
  }],
}, {
  timestamps: true
});

// Creating a model from the schema
const User = mongoose.model('User', userSchema);

// Exporting the User model
module.exports = User;
