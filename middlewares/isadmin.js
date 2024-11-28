import jwt from "jsonwebtoken";

const isadmin = async (req, res, next) => {

  const token = req.cookies.jwtToken;; 

  if (!token) {
    console.log("notoken")
    return res.status(401).json({ message: "No token provided" });
  }

  try {
  
    const decoded = jwt.verify(token, "secretKey");

   
    if (decoded.isadmin) {
      console.log("Admin verified");
      next(); 
    } else {
      return res.status(403).json({ valid: false, message: "Not an admin" });
    }
  } catch (error) {
   
    console.error("Token verification error:", error);
    return res.status(400).json({ valid: false, message: "Invalid token" });
  }
};

export default isadmin;
