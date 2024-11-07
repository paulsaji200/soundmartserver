import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  name: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  addressType: {
    type: String,
    enum: ['home', 'work'],
    default: 'home',
    
  },
  
  landmark: {
    type: String,
    default: ''
  },
  mobile: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  alternate: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const Address = mongoose.model('Address', addressSchema);

export default Address
