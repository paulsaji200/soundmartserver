
import express from "express"
import userRegister, { addAddress, deleteAddress, editAddress, editProfile, forgetpassword, getAddress, googleReg, Login, logoutUser, resetpassword, sendOtp, userProfile, verifyOtp, verifyUser } from "../controller/user/Usercontroller.js";
import getproduct, { addtowishlist, filter, filterProduct, fproduct, getwallet, getWishlist, productdetails, removeFromWishlist, search, serachProduct } from "../controller/user/product.js";
import createOrder, { addToCart, cancelOrder, cartupdate, clearCart, couponsapply, deleteCart, getCart,getCoupon,getOrder, invoice, returnOrder } from "../controller/user/order.js";
import userAuth from "../middlewares/isuserAuth.js";

import Brand from "../models/Barndmodel.js";


const userRouter = express.Router();

userRouter.post("/register",userRegister)
userRouter.post("/login",Login)
userRouter.get("/getproduct",getproduct)
userRouter.get("/productdetails/:id",productdetails)

userRouter.get("/verifyuser",userAuth,verifyUser)
userRouter.post("/addtocart",userAuth,addToCart)
userRouter.get("/getcart",userAuth,getCart)
userRouter.post("/addaddress",userAuth,addAddress)
userRouter.get("/getaddress",userAuth,getAddress)
userRouter.post("/createorder",userAuth,createOrder)
userRouter.get("/google",googleReg)
userRouter.post("/verify-otp",verifyOtp)
userRouter.post("/send-otp",sendOtp)
userRouter.post("/forgetpassword",forgetpassword)
userRouter.post("/resetpassword",resetpassword)
userRouter.patch("/cartupdate/:product_id",userAuth, cartupdate);
userRouter.delete("/deletecart/:product_id",userAuth,deleteCart)
userRouter.delete("/deleteaddress/:id",userAuth,deleteAddress)
userRouter.get("/products/search",serachProduct)
userRouter.get("/getorder",userAuth,getOrder)
userRouter.get("/profile",userAuth,userProfile)
userRouter.delete("/clearcart",userAuth,clearCart)
userRouter.patch("/updateaddress/:id",userAuth,editAddress)
userRouter.patch("/cancerorder",userAuth)
userRouter.get("/getcoupon",getCoupon)
userRouter.get("/search",search)
userRouter.get("/filter",filter)
userRouter.post("/couponapply",couponsapply)
userRouter.post("/addtowishlist/:product_Id",userAuth,addtowishlist)
userRouter.patch("/cancelOrder",userAuth,cancelOrder)
userRouter.patch("/returnOrder",userAuth,returnOrder)
userRouter.put("/editprofile",userAuth,editProfile)
userRouter.get("/getwishlist",userAuth,getWishlist)
userRouter.delete("/deletewishlist/:productId",userAuth,removeFromWishlist)
userRouter.get("/getwallet",userAuth,getwallet)
userRouter.get("/invoice/:orderId",userAuth,invoice)
userRouter.get("/fproducts",fproduct)
userRouter.post("/logout",logoutUser)
export default userRouter  