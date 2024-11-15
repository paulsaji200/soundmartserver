import Users from "../../models/userModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../../utils/generateToken.js";
import Product from "../../models/productModel.js";
import Cart from "../../models/Cart.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Address from "../../models/addressMode.js";
import Order from "../../models/order.js";
import Wallet from "../../models/wallet.js";

const getproduct = async (req, res) => {

  try {
    const data = await Product.find({ deleted: false });

    res.status(201).send({ data });
  } catch (error) {
    console.error("Error occurred while fetching products:", error);
    res
      .status(500)
      .send({ error: "An error occurred while fetching products" });
  }
};
export const productdetails = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const data = await Product.findById(id);

  res.status(201).send({ data: data });
};

export const serachProduct = async (req, res) => {
  try {
    const searchQuery = req.query.query;
    const regex = new RegExp(searchQuery, "i");

    const products = await Product.find({
      $or: [
        { productName: regex },
        { description: regex },
        { category: regex },
      ],
    });

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const filterProduct = async (req, res) => {
  console.log("filter");
  try {
    const {
      price,
      category,
      brand,
      rating,
      newArrivals,
      popularity,
      featured,
    } = req.query;

    let query = { deleted: false };

    if (price) {
      const [minPrice, maxPrice] = price.split(",").map(Number);
      query["$or"] = [
        { productPrice: { $gte: minPrice, $lte: maxPrice } },
        { salePrice: { $gte: minPrice, $lte: maxPrice } },
      ];
    }

    if (category) {
      const categoryArray = category.split(",");
      query.category = { $in: categoryArray };
    }

    if (brand) {
      const brandArray = brand.split(",");
      query.brandName = { $in: brandArray };
    }

    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    if (newArrivals === "true") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query.createdAt = { $gte: thirtyDaysAgo };
    }

    if (popularity === "true") {
    }

    if (featured === "true") {
      query.featured = true;
    }

    const products = await Product.find(query);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error filtering products:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
export const search = async (req, res) => {
  console.log("1");
  const query = req.query.query || "";
  console.log("Search Query:", query);

  try {
    let products;

    if (query) {
      products = await Product.find({
        $or: [
          { productName: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      });
    } else {
      products = await Product.find();
    }

    res.status(200).json({ data: products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products", error });
  }
};
export const filter = async (req, res) => {
  console.log("Filtering products...");

  // Extract query parameters from the request
  const {
    query,
    price,
    category,
    brand,
    rating,
    newArrivals,
    popularity,
    featured,
    sort,
  } = req.query;

  const filters = {};

  // Search Query
  if (query) {
    filters.$or = [
      { productName: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  // Price Filter
  if (price) {
    try {
      const priceRange = JSON.parse(price);
      filters.salePrice = {
        $gte: priceRange.min || 0,
        $lte: priceRange.max || Infinity,
      };
    } catch (error) {
      console.error("Invalid price format:", error);
      return res.status(400).json({ message: "Invalid price format" });
    }
  }

  // Category Filter
  if (category) {
    filters.category = Array.isArray(category)
      ? { $in: category }
      : { $in: [category] };
  }

  // Brand Filter
  if (brand) {
    filters.brand = Array.isArray(brand)
      ? { $in: brand }
      : { $in: [brand] };
  }

  // Rating Filter
  if (rating) {
    filters.rating = { $gte: parseInt(rating, 10) || 0 };
  }

  // New Arrivals Filter
  if (newArrivals === "true") {
    filters.newArrivals = true;
  }

  // Popularity Filter
  if (popularity === "true") {
    filters.popularity = true;
  }

  // Featured Filter
  if (featured === "true") {
    filters.featured = true;
  }

  console.log("Filters applied:", filters);

  // Sorting Logic
  const sortOptions = {};
  if (sort) {
    if (sort === "nameAsc") {
      sortOptions.productName = 1;
    } else if (sort === "nameDesc") {
      sortOptions.productName = -1;
    } else if (sort === "priceLowHigh") {
      sortOptions.salePrice = 1;
    } else if (sort === "priceHighLow") {
      sortOptions.salePrice = -1;
    }
  }

  try {
    // Fetch products from the database
    const products = await Product.find(filters).sort(sortOptions);

    if (!products || products.length === 0) {
      console.log("No products found with the applied filters.");
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json({ data: { products } });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products", error });
  }
};

 export const addtowishlist = async (req, res) => {
  const userId = req.user.id;
  const { product_Id } = req.params; 
  console.log(userId,product_Id,) 

  try { 
   
    const product = await Product.findById(product_Id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

   
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }


    if (user.wishlist.includes(product_Id)) {
      return res.status(400).json({ message: 'Product is already in the wishlist' });
    }

 
    user.wishlist.push(product_Id);
    await user.save(); 

    res.status(200).json({ message: 'Product added to wishlist', wishlist: user.wishlist });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export const getWishlist = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await Users.findById(userId).populate('wishlist');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch wishlist', error: error.message });
  }
};



export const removeFromWishlist = async (req, res) => {
  try {
    console.log("removing")
    const userId = req.user.id; 
    const { productId } = req.params; 
     console.log(productId)
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

   
    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    await user.save(); 

    res.status(200).json({ message: 'Product removed from wishlist', wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove product from wishlist', error: error.message });
  }
};
export const getwallet = async (req, res) => {
  try {
    console.log("Fetching wallet...");

    
    const wallet = await Wallet.findOne({ user: req.user.id })
      .populate('user')
      .sort({ createdAt:1 }); 

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    res.json(wallet);
  } catch (error) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
export const fproduct = async (req, res) => {
  try {
 
    const data = await Product.find().limit(4);
    
 
    res.status(200).json(data);
  } catch (error) {
   
    res.status(500).json({ message: 'Error fetching products', error });
  }
};


export default getproduct;
