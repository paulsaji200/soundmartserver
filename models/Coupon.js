import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    discount: {
        type: Number, 
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
        type: Number, 
        default: 0    
    },
    maxPurchase: {
        type: Number,  
        default: null  
    },
    maxDiscount:{
        type:Number,
        default:null
    }
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
