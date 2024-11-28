import mongoose from "mongoose";
import Product from "./productModel.js  ";
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
  },
  password: {
    type: String,
  },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
,
  blocked: {
    type: Boolean,
    default: false,
  },
});

const Users = mongoose.model("Users", userSchema);

export default Users;
