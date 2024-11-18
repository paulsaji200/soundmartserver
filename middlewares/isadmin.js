import jwt from "jsonwebtoken";

const isadmin = async (req, res, next) => {
  // Retrieve the JWT token from cookies
  const token = req.cookies?.jwtToken; 

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, "secretKey");

    // Check if the user has admin privileges
    if (decoded.isadmin) {
      console.log("Admin verified");
      return next(); // Proceed to the next middleware or route handler
    } else {
      return res.status(403).json({ valid: false, message: "Not an admin" });
    }
  } catch (error) {
    // Handle errors during token verification
    console.error("Token verification error:", error);
    return res.status(400).json({ valid: false, message: "Invalid token" });
  }
};

export default isadmin;
