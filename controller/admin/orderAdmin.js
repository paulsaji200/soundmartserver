import Order from "../../models/order.js";
import Users from "../../models/userModel.js";
import Product from "../../models/productModel.js";
import Coupon from "../../models/Coupon.js";
import Category from "../../models/Categorymodel.js";

export const getOrders = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || ""; // Get search query from request

  try {
    // Build the search condition
    const searchCondition = search
      ? { order_ID: { $regex: search, $options: "i" } } // Case-insensitive search
      : {};

    // Fetch orders matching the search condition
    const orders = await Order.find(searchCondition)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(searchCondition); // Count documents matching the search condition

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.status(200).json({
      data: orders,
      totalOrders, // Total number of matched orders
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error: Unable to fetch orders" });
  }
};

  export const orderdetails = async (req, res) => {
    try {
      const order = await Order.findById(req.params.id)
        .populate('user', 'name') 
        .populate('products.productId', 'name'); 
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      res.json(order);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error', error });
    }
  };
  
 


  export const updateOrderStatus = async (req, res) => {
    try {
      const { orderId, productId } = req.params; 
      const { status } = req.body;
  
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const order = await Order.findOneAndUpdate(
        { _id: orderId, "products.productId": productId },
        { $set: { "products.$.status": status } },
        { new: true } 
      );
  
      if (!order) {
        return res.status(404).json({ message: "Order or product not found" });
      }
  
      res.status(200).json({ message: "Order status updated successfully", order });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  export const editOrderStatus =  async (req, res) => {
    const { orderId } = req.params;
    const { orderStatus, paymentStatus } = req.body;
  
    try {

      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          orderStatus,
          paymentStatus,
          updatedAt: Date.now(), 
        },
        { new: true }
      );
  
      if (!updatedOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      res.status(200).json({
        message: 'Order updated successfully',
        updatedOrder,
      });
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ message: 'Failed to update order', error });
    }
  };

  
  
export const getCoupen =  async (req, res) => {
    try {
      console.log("get")
      const coupons = await Coupon.find();
      res.status(200).json(coupons);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching coupons', error });
    }
  };
  
  // POST create a new coupon
  export const createCoupon = async (req, res) => {
    const { code, discount, expiryDate,minPurchase,maxPurchase,maxDiscount } = req.body;
  
    try {
      console.log("create")
  
      const existingCoupon = await Coupon.findOne({ code });
      if (existingCoupon) {
        return res.status(400).json({ message: 'Coupon code already exists' });
      }
  
      const newCoupon = new Coupon({
        code,
        discount,
        expiryDate: new Date(expiryDate),
        minPurchase,
          maxPurchase,
          maxDiscount
      });
  
      const savedCoupon = await newCoupon.save();
      res.status(201).json({ message: 'Coupon created successfully', coupon: savedCoupon });
    } catch (error) {
      res.status(500).json({ message: 'Error creating coupon', error });
    }
  };



  
  export const deleteCoupon = async (req, res) => {
    consoel.log(req.params.id)
    try {
      const coupon = await Coupon.findByIdAndDelete(req.params.id);
      if (!coupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }
      res.status(200).json({ message: 'Coupon deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting coupon', error });
    }
  };





// Fetch sales data grouped by month
export const getSalesData = async (req, res) => {
  const { timePeriod } = req.params;
  let groupBy;

  // Determine the grouping based on the time period
  if (timePeriod === "weekly") {
    groupBy = { week: { $week: "$createdAt" }, year: { $year: "$createdAt" } };
  } else if (timePeriod === "monthly") {
    groupBy = { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } };
  } else if (timePeriod === "yearly") {
    groupBy = { year: { $year: "$createdAt" } };
  } else {
    return res.status(400).json({ message: "Invalid time period" });
  }

  try {
    const sales = await Order.aggregate([
      {
        $group: {
          _id: groupBy,
          totalSales: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          week: "$_id.week",
          month: "$_id.month",
          year: "$_id.year",
          monthNumber: "$_id.month", // Pass the month number for frontend use
          weekNumber: "$_id.week",   // Pass the week number for frontend use
          totalSales: 1,
          totalOrders: 1,
          averageSalesPerOrder: { $divide: ["$totalSales", "$totalOrders"] },
        },
      },
      { $sort: { "year": 1, "month": 1, "week": 1 } },
    ]);

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sales data", error });
  }
};


export const getSalesDataByMonth = async (req, res) => {
  try {
    const sales = await Order.aggregate([
      {
        $group: {
          _id: { 
            month: { $month: "$createdAt" },  // Group by month
            year: { $year: "$createdAt" }     // Group by year
          },
          totalSales: { $sum: "$totalPrice" },  // Sum the total sales for the month
          totalOrders: { $sum: 1 },              // Count total number of orders
          averageOrderValue: { $avg: "$totalPrice" }, // Calculate average order value
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },  // Sort by year and month
    ]);

    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ message: "Error fetching monthly sales data", error });
  }
};


// Fetch top 10 best-selling products
export const getBestSellingProducts = async (req, res) => {
  try {
    const products = await Order.aggregate([
      { $unwind: "$products" }, // Unwind products array
      {
        $group: {
          _id: "$products.productId", // Group by product ID
          totalQuantity: { $sum: "$products.quantity" }, // Sum total quantity
          totalRevenue: { $sum: { $multiply: ["$products.quantity", "$products.price"] } }, // Sum total revenue
        },
      },
      { $sort: { totalQuantity: -1 } }, // Sort by quantity in descending order
      { $limit: 10 }, // Limit to top 10
    ]);

    // Populate the product name and other fields from the Product model
    const populatedProducts = await Product.populate(products, {
      path: "_id",
      select: "productName", // Only include the product name
    });

    res.json(populatedProducts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching best-selling products", error });
  }
};

// Fetch best-selling categories




export const getBestSellingCategories = async (req, res) => {
  try {
    // Step 1: Aggregate orders to get total quantities and revenue per category
    const categories = await Order.aggregate([
      { $unwind: "$products" }, // Unwind the products array
      {
        $lookup: {
          from: "products", // Name of the Product collection in MongoDB
          localField: "products.productId", // Field from Order
          foreignField: "_id", // Field from Product
          as: "productDetails", // Name of the new array field
        },
      },
      { $unwind: "$productDetails" }, // Unwind product details to access fields
      {
        $group: {
          _id: "$productDetails.category", // Group by category ObjectId from the Product model
          totalQuantity: { $sum: "$products.quantity" }, // Sum of quantities
          totalRevenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } }, // Total revenue calculation
        },
      },
      { $sort: { totalQuantity: -1 } }, // Sort by total quantity
      { $limit: 10 }, // Limit to top 10
    ]);

   
    res.json(categories); // Send the results as a response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching best-selling categories", error });
  }
};



  export default getOrders
