import Users from "../../models/userModel.js";
import Brand from "../../models/Barndmodel.js";
export const viewcustomer = async (req, res) => {
    console.log("hitted");
    try {
      const customers = await Users.find({});
      res.status(201).send({ data: customers });
    } catch {
      res.status(401);
    }
  };

export const userstatus = async (req, res) => {
  console.log("ll");
  try {
    const { id } = req.params;


    const user = await Users.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    user.blocked = !user.blocked;


    await user.save();

    return res.status(200).json({
      message: `User ${user.blocked ? "blocked" : "unblocked"} successfully`,
      user,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const  addbrand = async (req, res) => {
  const { brandName, description } = req.body;
console.log(brandName)
  try {
    // Check if brand already exists
    const existingBrand = await Brand.findOne({ brandName });
    if (existingBrand) {
      return res.status(400).json({ message: "Brand already exists." });
    }

    const brand = new Brand({
      brandName,
      description,
     
    });

    const savedBrand = await brand.save();
    console.log(savedBrand)
    res.status(201).json(savedBrand);
  } catch (error) {
    res.status(500).json({ message: "Error adding brand.", error });
  }
};

export const getBrand = async (req, res) => {
  try {
    const brandData = await Brand.find({});


    res.status(201).json(brandData);
  } catch (error) {
     res.status(500).json({ message: "Error retrieving brands", error });
  }
};
export const Branddelete = async (req, res) => {
  const { id } = req.params;

  try {
    console.log(id);
    const deletedBrand = await Brand.findByIdAndDelete(id);

    if (!deletedBrand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    return res.status(200).json({ message: "Brand deleted successfully"});
  } catch (error) {
    console.error("Error deleting brand:", error);
    return res.status(500).json({ message: "Failed to delete brand", error });
  }
};

export const updateBrand = async (req, res) => {
  const { id } = req.params;
  const { brandName, description } = req.body;

  try {
    // Check if required fields are present
    if (!brandName || !description) {
      return res.status(400).json({ message: "Brand name and description are required" });
    }

    // Find and update the brand by ID
    const updatedBrand = await Brand.findByIdAndUpdate(
      id,
      { brandName, description },
      { new: true } // Return the updated document
    );

    // If no brand is found, return 404
    if (!updatedBrand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    // Successfully updated, return the updated brand
    return res.status(200).json({ message: "Brand updated successfully", brand: updatedBrand });
  } catch (error) {
    console.error("Error updating brand:", error);
    return res.status(500).json({ message: "Failed to update brand", error });
  }
};








export default viewcustomer;
