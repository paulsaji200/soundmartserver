const orderSchema = new mongoose.Schema({
  order_ID: {
    type: String,
    unique: true,
    required: false,  // Temporarily set to false to avoid validation error
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        enum: ['Ordered', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
        default: 'Ordered',
      },
      cancellationReason: {
        type: String,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  couponAmount: {
    type: Number,
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending',
  },
  orderStatus: {
    type: String,
    enum: ['Processing', 'Completed', 'Cancelled'],
    default: 'Processing',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

async function generateUniqueOrderID() {
  const min = 100000;
  const max = 999999;
  let orderID;
  let isUnique = false;

  while (!isUnique) {
    orderID = Math.floor(Math.random() * (max - min + 1)) + min;
    const existingOrder = await mongoose.model("Order").findOne({ order_ID: orderID });
    if (!existingOrder) isUnique = true;
  }
  return orderID.toString();
}

orderSchema.pre("save", async function (next) {
  try {
    if (!this.order_ID) {
      this.order_ID = await generateUniqueOrderID();
    }
    next();
  } catch (error) {
    next(error);  // Pass the error to Mongoose error handler
  }
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
