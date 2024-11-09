import jwt from "jsonwebtoken";

export const generateToken = (res, user) => {
    const IS_PRODUCTION = false;
    console.log("hello"+user)
    
    const token = jwt.sign({id:user._id,email: user.email,  name: user.name}, "secretKey", {expiresIn: "1d"})
     
    res.cookie('token', token, {
        httpOnly: true,
        secure: IS_PRODUCTION, // true if in production and using HTTPS
        maxAge: 60 * 60 * 1000, // 1 hour
        sameSite: 'None',       // Required for cross-site cookies
        domain: 'soundmart.life'
    });
    ;}