import express from "express";
import adminLogin, { 
  admintokenVerify, 
  salesReport, 
  salesReportDownload 
} from "../controller/admin/Admincontroller.js";
import addproduct, { 
  addCategory, 
  deletecategory, 
  deleteImageProduct, 
  deleteProduct, 
  editCategory, 
  editProduct, 
  getcategories, 
  geteditproduct, 
  getproductAdmin, 
  unDeleteProduct, 
  viewcustomer 
} from "../controller/admin/productAdmin.js";
import { 
  addbrand, 
  Branddelete, 
  getBrand, 
  updateBrand, 
  userstatus 
} from "../controller/admin/userManagement.js";
import { 
  createCoupon, 
  deleteCoupon, 
  editOrderStatus, 
  getBestSellingCategories, 
  getBestSellingProducts, 
  getCoupen, 
  getOrders, 
  getSalesData, 
  getSalesDataByMonth, 
  orderdetails 
} from "../controller/admin/orderAdmin.js";
import { updateOrderStatus } from "../controller/admin/orderAdmin.js";
import { isadmin } from "../middlewares/isuserAuth.js";

const adminRouter = express.Router();

// Public Route
adminRouter.post("/login", adminLogin);


adminRouter.post("/addproduct", isadmin, addproduct);
adminRouter.post("/addcategory", isadmin, addCategory);
adminRouter.delete('/deletecategory/:id', isadmin, deletecategory);
adminRouter.get("/getcategories", isadmin, getcategories);
adminRouter.put("/updatecategory/:id", isadmin, editCategory);
adminRouter.get("/viewcustomer", isadmin, viewcustomer);
adminRouter.put("/userstatus/:id", isadmin, userstatus);
adminRouter.get("/getproducts", isadmin, getproductAdmin);
adminRouter.get("/geteditproduct/:id", isadmin, geteditproduct);
adminRouter.put("/updateproduct/:id", isadmin, editProduct);
adminRouter.delete("/deleteproduct/:id", isadmin, deleteProduct);
adminRouter.patch("/undeleteproduct/:id", isadmin, unDeleteProduct);
adminRouter.get("/getorders", isadmin, getOrders);
adminRouter.get("/admintoken-verify", isadmin, admintokenVerify);
adminRouter.get("/orders/:id", isadmin, orderdetails);
adminRouter.put('/updateorders/:orderId/:productId', isadmin, updateOrderStatus);
adminRouter.patch('/orders/:orderId', isadmin, editOrderStatus);
adminRouter.get("/getCoupon", isadmin, getCoupen);
adminRouter.post("/createcoupon", isadmin, createCoupon);
adminRouter.delete("/deleteCoupon/:id", isadmin, deleteCoupon);
adminRouter.delete("/deleteimageproduct", isadmin, deleteImageProduct);
adminRouter.get("/salesreport", isadmin, salesReport);
adminRouter.get("/reportdownload", isadmin, salesReportDownload);
adminRouter.get("/getbrands", isadmin, getBrand);
adminRouter.post("/brandadd", isadmin, addbrand);
adminRouter.delete("/brandsdelete/:id", isadmin, Branddelete);
adminRouter.put("/updatebrand/:id", isadmin, updateBrand);
adminRouter.get("/salesdata/:timePeriod", isadmin, getSalesData);
adminRouter.get("/sales/weekly", isadmin, getSalesDataByMonth);
adminRouter.get("/sales/best-products", isadmin, getBestSellingProducts);
adminRouter.get("/sales/best-categories", isadmin, getBestSellingCategories);

export default adminRouter;
