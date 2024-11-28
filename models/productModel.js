import mongoose from "mongoose";
import Category from "./Categorymodel.js";

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    productPrice: {
      type: Number,
      required: true,
    },
    salePrice: {
      type: Number,
    },
    quantity: {
      type: Number,
      required: true,
    },
    brandName: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);


productSchema.virtual("finalPrice").get(async function () {
  const category = await Category.findOne({ name: this.category });

 
  const offer = category ? category.offer : 0;
  const discountedPrice = this.productPrice - (this.productPrice * offer) / 100;

  return this.salePrice ? Math.min(this.salePrice, discountedPrice) : discountedPrice;
});


productSchema.set("toJSON",{ virtuals: true });

const Product = mongoose.model("Product", productSchema);

export default Product;

