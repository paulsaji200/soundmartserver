import jwt from "jsonwebtoken";

export const generateToken = (res, user) => {
    console.log("hello"+user)
    
    const token = jwt.sign({id:user._id,email: user.email,  name: user.name}, "secretKey", {expiresIn: "1d"})
     
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60*60*1000,
       
    })
}