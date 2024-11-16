import Product from "../../models/productModel.js";
import Category from "../../models/Categorymodel.js";
import Users from "../../models/userModel.js";


const addproduct = async (req, res) => {
  try {
    const {
      productName,
      category,
      description,
      productPrice,
      salePrice,
      quantity,
      brandName,
      images,
    } = req.body;

    // Fetch the category from the Category collection to get the offer
    const categoryData = await Category.findOne({ name: category });

    if (!categoryData) {
      return res.status(400).json({
        message: "Category not found",
      });
    }

    const categoryOffer = categoryData.categoryOffer || 0;
    console.log("Category Offer:", categoryOffer);
      

    let discountedPrice = productPrice * categoryOffer / 100;
    console.log("Price after Category Discount:", discountedPrice);

    
    if (salePrice) {
      discountedPrice = salePrice-discountedPrice;  
    }
    console.log("Final Price after applying Sale Price (if any):", discountedPrice);

    const product = new Product({
      productName,
      category,
      description,
      productPrice, 
      salePrice: discountedPrice, 
      quantity,
      brandName,
      images,
    });

    const savedProduct = await product.save();

    res.status(201).json({
      message: "Product added successfully",
      product: savedProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({
      message: "Failed to add product",
    });
  }
};

export const editProduct = async (req, res) => {
  console.log("hittedbbbb");
  try {
    const { id } = req.params;
    const {
      productName,
      category,
      description,
      productPrice,
      salePrice,
      quantity,
      brandName,
      images,
    } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(id,
      {
        productName,
        category,
        description,
        productPrice,
        salePrice,
        quantity,
        brandName,
        images,
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
   console.log(updatedProduct)
    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      message: "Failed to update product",
    });
  }
};

export const addCategory = async (req, res) => {
  try {
    const { name, listed, offer, maxoffer } = req.body;

    // Check if name is provided
    if (!name) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    // Log the data being received
    console.log("Received data:", req.body);

    // Create new category with offer and maxoffer
    const category = new Category({
      name,
      listed,
      categoryOffer: offer,     // Saving the offer
      maxOffer: maxoffer        // Saving the max offer
    });

    await category.save();

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      message: "Error creating category",
      error: error.message,
    });
  }
};

export const deletecategory = async (req, res) => {
  console.log("lllllllll");
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndUpdate(
      id,
      { listed: false },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res
      .status(200)
      .json({ message: "Category soft deleted successfully", category });
  } catch (error) {
    console.error("Error soft deleting category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getcategories = async (req, res) => {
  const data = await Category.find();
  res.status(201).send({ data: data });
};
export const viewcustomer = async (req, res) => {
  console.log("hitted");
  try {
    const customers = await Users.find({});
    res.status(201).send({ data: customers });
  } catch {
    res.status(401);
  }
};

export const editCategory = async (req, res) => {

  const { id } = req.params;
  const { name, listed,offer } = req.body;
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        name,
        listed,
        categoryOffer:offer
      },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getproductAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || ""; 
    const sortOption = req.query.sort || "createdAt-asc"; // Default to "createdAt-asc" if no sort is provided.
     console.log(sortOption)
    const startIndex = (page - 1) * limit;

    const sortMap = {
      "name-asc": { productName: 1 },
      "name-desc": { productName: -1 },
      "price-asc": { salePrice: 1 },
      "price-desc": { salePrice: -1 },
      "createdAt-asc": { createdAt: 1 },
      "createdAt-desc": { createdAt: -1 },
    };

    // Get the sort condition based on the sort option
    const sortCondition = sortMap[sortOption] || { createdAt: -1 };

    // Search condition
    const searchCondition = {
      $or: [
        { productName: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ],
    };

    // Fetch sorted and paginated products
    const data = await Product.find(searchCondition)
      .sort(sortCondition) 
      .limit(limit)
      .skip(startIndex);

    // Total count of matching documents
    const totalCount = await Product.countDocuments(searchCondition);

    res.status(200).send({
      data: data,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalProducts: totalCount,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send({ error: "Server error" });
  }
};


export const geteditproduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    
    res.status(201).send({ data: product });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByIdAndUpdate(
      id,
      { deleted: true },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product successfully deleted", product });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const unDeleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByIdAndUpdate(
      id,
      { deleted: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res
      .status(200)
      .json({ message: "Product successfully undeleted", product });
  } catch (error) {
    console.error("Error  undeleting product:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const deleteImageProduct = async (req,res)=>{
  
    try {
      
      const { img, pid } = req.query;
      console.log("hello")
  
      if (!img || !pid) {
        return res.status(400).json({ message: "Image URL and Product ID are required" });
      }
  
     
      const product = await Product.findById(pid);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
  
   
      product.images = product.images.filter((image) => image !== img);
  
   
      await product.save();
  
      
      res.status(200).json({ message: "Image deleted successfully", product });
    } catch (error) {
 
      console.error("Error deleting image:", error);
      res.status(500).json({ message: "Server error" });
    }
  }




export default addproduct;
