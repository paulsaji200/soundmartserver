import jwt from "jsonwebtoken";

export const generateadminToken = (res, adminD) => {
    console.log("hello")
    console.log(adminD)
    const token = jwt.sign({email: adminD.email, name: adminD.name, isadmin: adminD.isadmin }, "secretKey", {expiresIn: "3h"})
     
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60*60*1000
    })
}