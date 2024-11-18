import jwt from "jsonwebtoken";
import Users from "../models/userModel.js"; 
const userAuth = async (req, res, next) => {
  console.log("hello........");
  const token = req.cookies.jwtToken;

  if (!token) {
console.log("xhjbvjdfvbjd")
    return res.status(401).json({ message: "No token provided, authorization denied" });
     


  }

  try {

    const decoded = jwt.verify(token, "secretKey");
    req.user = decoded;

   
    const user = await Users.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.blocked) {
      return res.status(403).json({ message: "User is blocked" });
    }

    console.log("User verified and not blocked:", decoded);
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Token is not valid" });
  }
};


export const isadmin = async (req, res) => {
  const token = req.cookies?.jwtToken; 
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  
  try {
    const decoded = jwt.verify(token, "secretKey");
    if (decoded.isadmin) {
      console.log("admin");
    }
    return res.status(403).json({ valid: false, message: "Not an admin" });
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(400).json({ valid: false, message: "Invalid token" });
  }
};


export default userAuth;
