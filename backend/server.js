const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 6001;

const path = require("path");
app.use(express.json());
app.use(bodyParser.json());

const _dirname = path.dirname("");
const buildpath = path.join(_dirname,"../frontend/build");
app.use(express.static(buildpath));
app.use(cors({"origin":"*"}));

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Connection
const db = mysql.createConnection({
  host: "database-1.cnc2qeuiaxr4.ap-south-1.rds.amazonaws.com", // Replace with your RDS endpoint
  user: "admin",                          // Replace with your RDS username
  password: "admin123",              // Replace with your RDS password
  database: "supermarket",
  port: 3306
});

db.connect((err) => {
    if (err) {
      console.error("Database connection failed:", err);
      process.exit(1);
    }
    console.log("Connected to AWS RDS MySQL database.");
  });
  
  // API Endpoint: Monthly Sales
app.get("/api/monthly-sales", (req, res) => {
    const query = `
      SELECT 
        MONTH(Transaction_Date) AS month,
        SUM(Total_Amount) AS total_sales
      FROM Sales
      GROUP BY MONTH(Transaction_Date)
      ORDER BY month;
    `;
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching monthly sales:", err);
        return res.status(500).json(err);
      }
      res.json(results);
    });
  });
  
  // API Endpoint: Product Sales Distribution
  app.get("/api/product-sales", (req, res) => {
    const query = `
      SELECT 
        Product_Line AS product_line,
        SUM(Total_Amount) AS total_sales
      FROM Sales
      INNER JOIN Products ON Sales.Product_ID = Products.Product_ID
      GROUP BY Product_Line;
    `;
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching product sales:", err);
        return res.status(500).json(err);
      }
      res.json(results);
    });
  });
  
  // API Endpoint: Customer Gender Distribution
  app.get("/api/customer-gender", (req, res) => {
    const query = `
      SELECT 
        Gender, 
        COUNT(*) AS count
      FROM Customers
      GROUP BY Gender;
    `;
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching gender distribution:", err);
        return res.status(500).json(err);
      }
      res.json(results);
    });
  });
  
  // API Endpoint: Payment Method Distribution
  app.get("/api/payment-methods", (req, res) => {
    const query = `
      SELECT 
        Payment_Method AS payment_method,
        COUNT(*) AS count
      FROM Sales
      GROUP BY Payment_Method;
    `;
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching payment methods:", err);
        return res.status(500).json(err);
      }
      res.json(results);
    });
  });


  // ---------- CRUD Routes for Customers ----------

// Get all customers
app.get("/api/customers", (req, res) => {
    const searchTerm = req.query.search || '';
    const query = `SELECT * FROM Customers WHERE Customer_ID LIKE ? OR Customer_Type LIKE ?`;
    db.query(query, [`%${searchTerm}%`, `%${searchTerm}%`], (err, results) => {
      if (err) {
        return res.status(500).send("Error fetching customers data");
      }
      res.json(results);
    });
  });
  
  // Add a new customer
  app.post("/api/customers", (req, res) => {
    const { Customer_ID, Customer_Type, Gender } = req.body;
    const query = "INSERT INTO Customers (Customer_ID, Customer_Type, Gender) VALUES (?, ?, ?)";
    db.query(query, [Customer_ID, Customer_Type, Gender], (err, results) => {
      if (err) {
        return res.status(500).send("Error adding customer");
      }
      res.status(201).json({ id: results.insertId, ...req.body });
    });
  });

  app.put("/api/customers/:id", (req, res) => {
    const { id } = req.params; // Get the Customer_ID from the URL
    const { Customer_ID, Customer_Type, Gender } = req.body;
    const query = "UPDATE Customers SET Customer_Type = ?, Gender = ? WHERE Customer_ID = ?";
    db.query(query, [Customer_Type, Gender, id], (err, results) => {
      if (err) {
        console.error("Error updating customer:", err);
        return res.status(500).send("Error updating customer");
      }
      res.status(200).json({ id, ...req.body });
    });
  });
  
  app.delete("/api/customers/:id", (req, res) => {
    const { id } = req.params;
    console.log("Deleting record with id:", id); // Log the id to verify it
    const query = "DELETE FROM Customers WHERE Customer_ID = ?";
    db.query(query, [id], (err, results) => {
      if (err) {
        console.error("Error deleting customer:", err); // Log the error
        return res.status(500).send("Error deleting customer");
      }
      res.status(204).send(); // No content for successful delete
    });
  });
  
  // ---------- CRUD Routes for Branches ----------
  
  // Get all branches
  app.get("/api/branches", (req, res) => {
    const query = "SELECT * FROM Branches";
    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).send("Error fetching branches data");
      }
      res.json(results);
    });
  });
  
  // Add a new branch
  app.post("/api/branches", (req, res) => {
    const { Branch, City } = req.body;
    const query = "INSERT INTO Branches (Branch, City) VALUES (?, ?)";
    db.query(query, [Branch, City], (err, results) => {
      if (err) {
        return res.status(500).send("Error adding branch");
      }
      res.status(201).json({ id: results.insertId, ...req.body });
    });
  });
  
  // Update an existing branch
  app.put("/api/branches/:id", (req, res) => {
    const { id } = req.params;
    const { Branch, City } = req.body;
    const query = "UPDATE Branches SET Branch = ?, City = ? WHERE ID = ?";
    db.query(query, [Branch, City, id], (err, results) => {
      if (err) {
        return res.status(500).send("Error updating branch");
      }
      res.status(200).json({ id, ...req.body });
    });
  });
  
  // Delete a branch
  // Delete a branch
app.delete("/api/branches/:id", (req, res) => {
    const { id } = req.params;
  
    // First delete the dependent records from Sales
    const deleteSalesQuery = "DELETE FROM Sales WHERE Branch_ID = ?";
    db.query(deleteSalesQuery, [id], (err, results) => {
      if (err) {
        console.error("Error deleting sales records:", err);
        return res.status(500).send("Error deleting sales records");
      }
  
      // Now delete the branch
      const deleteBranchQuery = "DELETE FROM Branches WHERE ID = ?";
      db.query(deleteBranchQuery, [id], (err, results) => {
        if (err) {
          console.error("Error deleting branch:", err);
          return res.status(500).send("Error deleting branch");
        }
  
        res.status(204).send(); // Successfully deleted
      });
    });
  });
  
  // ---------- CRUD Routes for Products ----------
  
  // Get all products
  app.get("/api/products", (req, res) => {
    const query = "SELECT * FROM Products";
    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).send("Error fetching products data");
      }
      res.json(results);
    });
  });
  
  // Add a new product
  app.post("/api/products", (req, res) => {
    const { Product_Line, Unit_Price } = req.body;
    const query = "INSERT INTO Products (Product_Line, Unit_Price) VALUES (?, ?)";
    db.query(query, [Product_Line, Unit_Price], (err, results) => {
      if (err) {
        return res.status(500).send("Error adding product");
      }
      res.status(201).json({ id: results.insertId, ...req.body });
    });
  });
  
  // Update an existing product
  app.put("/api/products/:id", (req, res) => {
    const { id } = req.params;
    const { Product_Line, Unit_Price } = req.body;
    const query = "UPDATE Products SET Product_Line = ?, Unit_Price = ? WHERE Product_ID = ?";
    db.query(query, [Product_Line, Unit_Price, id], (err, results) => {
      if (err) {
        return res.status(500).send("Error updating product");
      }
      res.status(200).json({ id, ...req.body });
    });
  });
  
  // Delete a product
  app.delete("/api/products/:id", (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM Products WHERE Product_ID = ?";
    db.query(query, [id], (err, results) => {
      if (err) {
        return res.status(500).send("Error deleting product");
      }
      res.status(204).send();
    });
  });

  // ---------- CRUD Routes for Financials ----------

// Get all financial data
app.get("/api/financials", (req, res) => {
    const query = "SELECT * FROM Financials";
    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).send("Error fetching financial data");
      }
      res.json(results);
    });
  });
  
  // Add new financial data
  app.post("/api/financials", (req, res) => {
    const { Invoice_ID, COGS, Gross_Margin_Percentage, Gross_Income, Customer_Rating } = req.body;
    const query =
      "INSERT INTO Financials (Invoice_ID, COGS, Gross_Margin_Percentage, Gross_Income, Customer_Rating) VALUES (?, ?, ?, ?, ?)";
    db.query(
      query,
      [Invoice_ID, COGS, Gross_Margin_Percentage, Gross_Income, Customer_Rating],
      (err, results) => {
        if (err) {
          return res.status(500).send("Error adding financial data");
        }
        res.status(201).json({ id: results.insertId, ...req.body });
      }
    );
  });
  
  // Update an existing financial record
  app.put("/api/financials/:id", (req, res) => {
    const { id } = req.params;
    const { Invoice_ID, COGS, Gross_Margin_Percentage, Gross_Income, Customer_Rating } = req.body;
    const query =
      "UPDATE Financials SET COGS = ?, Gross_Margin_Percentage = ?, Gross_Income = ?, Customer_Rating = ? WHERE Invoice_ID = ?";
    db.query(
      query,
      [COGS, Gross_Margin_Percentage, Gross_Income, Customer_Rating, id],
      (err, results) => {
        if (err) {
          return res.status(500).send("Error updating financial data");
        }
        res.status(200).json({ id, ...req.body });
      }
    );
  });
  
  // Delete financial data
  app.delete("/api/financials/:id", (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM Financials WHERE Invoice_ID = ?";
    db.query(query, [id], (err, results) => {
      if (err) {
        return res.status(500).send("Error deleting financial data");
      }
      res.status(204).send();
    });
  });

  
  // Start Server
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });