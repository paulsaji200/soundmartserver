import mongoose from "mongoose";


const brandSchema = new mongoose.Schema({
  brandName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
 
  status: {
    type: Boolean,
    default: true // true = active, false = inactive
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

brandSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Brand = mongoose.model('Brand', brandSchema);
export default Brand
