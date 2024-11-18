import express from "express"
import  adminLogin, { admintokenVerify, salesReport, salesReportDownload } from "../controller/admin/Admincontroller.js";
import addproduct, { addCategory, deletecategory, deleteImageProduct, deleteProduct, editCategory, editProduct, getcategories, geteditproduct, getproductAdmin, unDeleteProduct, viewcustomer } from "../controller/admin/productAdmin.js";
import { addbrand, Branddelete, getBrand, updateBrand, userstatus } from "../controller/admin/userManagement.js";
import { createCoupon, deleteCoupon, editOrderStatus, getBestSellingCategories, getBestSellingProducts, getCoupen, getOrders, getSalesData, getSalesDataByMonth, orderdetails } from "../controller/admin/orderAdmin.js";
import { updateOrderStatus } from "../controller/admin/orderAdmin.js";
const adminRouter = express.Router();

adminRouter.post("/login",adminLogin)
adminRouter.post("/addproduct",addproduct)
adminRouter.post("/addcategory",addCategory)
adminRouter.delete('/deletecategory/:id',deletecategory)
adminRouter.get("/getcategories",getcategories)
adminRouter.put("/updatecategory/:id",editCategory)
adminRouter.get("/viewcustomer",viewcustomer)
adminRouter.put("/userstatus/:id",userstatus)
adminRouter.get("/getproducts",getproductAdmin)
adminRouter.get("/geteditproduct/:id",geteditproduct)
adminRouter.put("/updateproduct/:id",editProduct)
adminRouter.delete("/deleteproduct/:id",deleteProduct)
adminRouter.patch("/undeleteproduct/:id",unDeleteProduct)
adminRouter.get("/getorders",getOrders)
adminRouter.get("/admintoken-verify",admintokenVerify)
adminRouter.get("/orders/:id",orderdetails)
adminRouter.put('/updateorders/:orderId/:productId', updateOrderStatus);
adminRouter.patch('/orders/:orderId',editOrderStatus)
adminRouter.get("/getCoupon",getCoupen)
adminRouter.post("/createcoupon",createCoupon)
adminRouter.delete("/deleteCoupon/:id",deleteCoupon)
adminRouter.delete("/deleteimageproduct",deleteImageProduct)
adminRouter.get("/salesreport",salesReport)
adminRouter.get("/reportdownload",salesReportDownload)
adminRouter.get("/getbrands",getBrand)
adminRouter.post("/brandadd",addbrand)
adminRouter.delete("/brandsdelete/:id",Branddelete)
adminRouter.put("/updatebrand/:id",updateBrand)
adminRouter.get("/salesdata/:timePeriod",getSalesData)
adminRouter.get("/sales/weekly",getSalesDataByMonth)
adminRouter.get("/sales/best-products",getBestSellingProducts)
adminRouter.get("/sales/best-categories",getBestSellingCategories)
export default adminRouter