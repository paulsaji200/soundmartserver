import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    discount: {
        type: Number,  // Discount percentage (e.g., 10 for 10%)
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
    minPurchase: {
        type: Number,  // Minimum purchase amount to apply this coupon
        default: 0     // If 0, the coupon can be applied to any purchase
    },
    maxPurchase: {
        type: Number,  // Maximum purchase amount allowed for the coupon (optional)
        default: null  // If null, no upper limit for purchase amount
    },
    maxDiscount:{
        type:Number,
        default:null
    }
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
