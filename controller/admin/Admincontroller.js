import adminData from "../../models/adminModel.js";
import Order from "../../models/order.js";
import jwt from "jsonwebtoken";
import { generateadminToken } from "../../utils/generateAdmintoken.js";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";


 const adminLogin = async (req, res) => {

  try {
    const { email, password } = req.body;
    console.log("Admin Login Request:", email, password);
  
    const adminD = await adminData.findOne({ email: email });
  
    if (adminD && password === adminD.password) {
      const { _id, name, email, isadmin } = adminD;
      generateadminToken(res, { _id, name, email, isadmin });
      return res.status(201).send({ message: "Successfully logged in" });
    }
    
    return res.status(401).send({ message: adminD ? "Wrong password" : "Email not found" });
  } catch (error) {
    console.error("Error during admin login:", error);
    return res.status(500).send({ message: "Server error" });
  }
};

// Admin token verification
export const admintokenVerify = async (req, res) => {
  const token = req.cookies?.token; // Use optional chaining to avoid potential errors
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  
  try {
    const decoded = jwt.verify(token, "secretKey");
    if (decoded.isadmin) {
      return res.json({ valid: true });
    }
    return res.status(403).json({ valid: false, message: "Not an admin" });
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(400).json({ valid: false, message: "Invalid token" });
  }
};

// Sales report generation
export const salesReport = async (req, res) => {
  const { fromDate, toDate, filter } = req.query;

  try {
    const today = new Date();
    let startDate, endDate;

    if (!filter && !fromDate && !toDate) {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (filter === "Daily") {
      startDate = new Date(today.setHours(0, 0, 0, 0));
      endDate = new Date(today.setHours(23, 59, 59, 999));
    } else if (filter === "Weekly") {
      const currentDayOfWeek = today.getDay();
      const startOfWeek = new Date(today.setDate(today.getDate() - currentDayOfWeek));
      startDate = new Date(startOfWeek.setHours(0, 0, 0, 0));
      endDate = new Date();
    } else if (filter === "Monthly") {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    } else {
      startDate = fromDate ? new Date(fromDate) : new Date("1970-01-01");
      endDate = toDate ? new Date(toDate) : new Date();
    }

    const salesData = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          productName: { $first: "$products.name" },
          totalQuantity: { $sum: "$products.quantity" },
          totalRevenue: { $sum: { $multiply: ["$products.quantity", "$products.price"] } }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      {
        $addFields: {
          thumbnail: { $arrayElemAt: ["$productDetails.images", 0] },
          productBrand: { $arrayElemAt: ["$productDetails.brandName", 0] }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    const totalSummary = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
      { $unwind: "$products" },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ["$products.quantity", "$products.price"] } },
          totalQuantity: { $sum: "$products.quantity" }
        }
      }
    ]);

    res.status(200).json({
      topProducts: salesData,
      topProductsSummary: totalSummary[0] || { totalRevenue: 0, totalQuantity: 0 }
    });
  } catch (error) {
    console.error("Error generating sales report:", error);
    res.status(500).json({ message: "Failed to generate sales report" });
  }
};



export const salesReportDownload = async (req, res) => {
  const { fromDate, toDate, filter, format } = req.query;

   console.log(fromDate,toDate)

  try {
    // Set date range based on the filter
    let startDate, endDate;
    const today = new Date();

    if (!filter && !fromDate && !toDate) {
      // Default to the current month if no filters are provided
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (filter === "Daily") {
      startDate = new Date(today.setHours(0, 0, 0, 0));
      endDate = new Date(today.setHours(23, 59, 59, 999));
    } else if (filter === "Weekly") {
      const currentDayOfWeek = today.getDay();
      const startOfWeek = new Date(today.setDate(today.getDate() - currentDayOfWeek));
      startDate = new Date(startOfWeek.setHours(0, 0, 0, 0));
      endDate = new Date();
    } else if (filter === "Monthly") {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    } else {
      startDate = fromDate ? new Date(fromDate) : new Date("1970-01-01");
      endDate = toDate ? new Date(toDate) : new Date();
    }

    // Step 1: Fetch product sales data within the date range
    const productSalesData = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.productId',
          productName: { $first: '$products.name' },
          totalQuantity: { $sum: '$products.quantity' },
          totalRevenue: { $sum: { $multiply: ['$products.quantity', '$products.price'] } },
        }
      }
    ]);

    // Step 2: Fetch total coupon amounts at the order level
    const couponData = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
      {
        $group: {
          _id: null, // Group all orders together
          totalCouponAmount: { $sum: { $ifNull: ['$couponAmount', 0] } }
        }
      }
    ]);

    // Extract overall coupon amount from result
    const overallCouponAmount = couponData.length > 0 ? couponData[0].totalCouponAmount : 0;

    // Step 3: Calculate overall revenue and overall quantity
    const overallRevenue = productSalesData.reduce((acc, item) => acc + item.totalRevenue, 0);
    const overallQuantity = productSalesData.reduce((acc, item) => acc + item.totalQuantity, 0);

    // Report generated date
    const reportGeneratedDate = new Date().toLocaleDateString();

    // Step 4: Generate report in PDF or Excel
    if (format === "pdf") {
      const doc = new PDFDocument({margin: 50});
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="sales_report.pdf"');
      doc.pipe(res);
  
      // Header
      doc.fontSize(24).fillColor('#1E90FF').text("Sales Report", {align: "center"});
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#000000');
      doc.text(`Report generated on: ${reportGeneratedDate}`, {align: "center"});
      doc.text(`Report Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, {align: "center"});
      doc.moveDown();
  
      // Overall totals
      doc.fontSize(14).fillColor('#000000');
      doc.text(`Overall Sales Revenue: $${overallRevenue.toFixed(2)}`, {align: "left"});
      doc.text(`Overall Coupon Amount: $${overallCouponAmount.toFixed(2)}`, {align: "left"});
      doc.text(`Overall Quantity Sold: ${overallQuantity}`, {align: "left"});  // New overall quantity
      doc.moveDown();
  
      // Table headers
      const tableTop = doc.y;
      const tableHeaders = ["Product Name", "Quantity Sold", "Total Revenue"];
      const tableWidths = [250, 100, 100];
  
      doc.font('Helvetica-Bold');
      tableHeaders.forEach((header, i) => {
        doc.text(header, 50 + tableWidths.slice(0, i).reduce((a, b) => a + b, 0), tableTop, {width: tableWidths[i], align: 'left'});
      });
  
      // Table data
      doc.font('Helvetica');
      let rowTop = tableTop + 20;
  
      productSalesData.forEach((item, i) => {
        const rowColor = i % 2 === 0 ? '#F0F8FF' : '#FFFFFF';
        doc.rect(50, rowTop, 450, 20).fill(rowColor);
        
        doc.fillColor('#000000')
           .text(item.productName, 50, rowTop + 5, {width: tableWidths[0], align: 'left'})
           .text(item.totalQuantity.toString(), 300, rowTop + 5, {width: tableWidths[1], align: 'left'})
           .text(`$${item.totalRevenue.toFixed(2)}`, 400, rowTop + 5, {width: tableWidths[2], align: 'left'});
        
        rowTop += 20;
      });
  
      // Footer
      doc.fontSize(10).fillColor('#808080').text('Generated by My Company', 0, doc.page.height - 50, {align: 'center'});
  
      doc.end();
    }  else if (format === "xlsx") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sales Report");

      // Styling
      const headerStyle = {
        font: { bold: true, size: 14, color: { argb: 'FF1E90FF' } },
        alignment: { horizontal: 'center' }
      };
      const subHeaderStyle = {
        font: { size: 12 },
        alignment: { horizontal: 'center' }
      };
      const totalStyle = {
        font: { bold: true },
        alignment: { horizontal: 'left' }
      };
      const tableHeaderStyle = {
        font: { bold: true },
        fill: { type: 'pattern', pattern:'solid', fgColor:{argb:'FFD3D3D3'} },
        alignment: { horizontal: 'left' }
      };

      // Header
      worksheet.mergeCells('A1:C1');
      worksheet.getCell('A1').value = 'Sales Report';
      worksheet.getCell('A1').style = headerStyle;

      worksheet.mergeCells('A2:C2');
      worksheet.getCell('A2').value = `Report generated on: ${reportGeneratedDate}`;
      worksheet.getCell('A2').style = subHeaderStyle;

      worksheet.mergeCells('A3:C3');
      worksheet.getCell('A3').value = `Report Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
      worksheet.getCell('A3').style = subHeaderStyle;

      // Overall totals
      worksheet.getCell('A5').value = 'Overall Sales Revenue';
      worksheet.getCell('B5').value = overallRevenue.toFixed(2);
      worksheet.getCell('A5').style = totalStyle;

      worksheet.getCell('A6').value = 'Overall Coupon Amount';
      worksheet.getCell('B6').value = overallCouponAmount.toFixed(2);
      worksheet.getCell('A6').style = totalStyle;

      worksheet.getCell('A7').value = 'Overall Quantity Sold'; // New overall quantity row
      worksheet.getCell('B7').value = overallQuantity;  // Adding overall quantity
      worksheet.getCell('A7').style = totalStyle;

      // Table headers
      worksheet.getCell('A9').value = 'Product Name';
      worksheet.getCell('B9').value = 'Quantity Sold';
      worksheet.getCell('C9').value = 'Total Revenue';
      ['A9', 'B9', 'C9'].forEach(cell => worksheet.getCell(cell).style = tableHeaderStyle);

      // Table data
      productSalesData.forEach((item, index) => {
        const row = worksheet.getRow(index + 10);
        row.getCell(1).value = item.productName;
        row.getCell(2).value = item.totalQuantity;
        row.getCell(3).value = item.totalRevenue.toFixed(2);
        row.commit();
      });

      // Auto-fit columns
      worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) maxLength = columnLength;
        });
        column.width = maxLength < 10 ? 10 : maxLength;
      });

      // Send Excel file
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="sales_report.xlsx"`);
      await workbook.xlsx.write(res);
      res.end();
    } else {
      res.status(400).send({ error: "Invalid format specified" });
    }
  } catch (error) {
    console.error("Error generating sales report:", error);
    res.status(500).send({ error: "Error generating sales report" });
  }
};



export default adminLogin;
