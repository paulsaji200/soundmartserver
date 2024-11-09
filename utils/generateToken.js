import jwt from "jsonwebtoken";

export const generateToken = (res, user) => {
    console.log("hello"+user)
    
    const token = jwt.sign({id:user._id,email: user.email,  name: user.name}, "secretKey", {expiresIn: "1d"})
     
    res.cookie("jwtToken", token, {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 1000,
        sameSite: 'None'
    })
}