import express from "express";
import handlebars from "express-handlebars";
import cartsRouter from "./routes/carts.routes.js";
import productsRouter from "./routes/products.routes.js";
import __dirname from "./utils.js";
import { Server } from "socket.io";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Product from "./models/product-model.js";

const app = express();

// Register the 'eq' helper when creating the Handlebars instance
const hbs = handlebars.create({
  helpers: {
    eq: (a, b) => a === b,
  },
  runtimeOptions: {
    allowProtoPropertiesByDefault: true, // Disable prototype property checks
  },
});

// Middleware for JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for public directory
app.use(express.static(__dirname + "/public"));

// Set up Handlebars as the view engine
app.engine("handlebars", hbs.engine); // Use hbs.engine here
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

// Define the port
const PORT = 8080;

// Ping route to test server status
app.use("/ping", (req, res) => {
  res.send("Pong!");
});

// MongoDB connection to Atlas
mongoose
  .connect(
    "mongodb+srv://nicocanchero:XE8pXR8TfZbP7pmK@codercluster.v7vzd.mongodb.net/",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "Final", // Specify the database name (optional if default)
    }
  )
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB Atlas:", error);
  });

// Defining routes
app.use("/api/carts", cartsRouter); // Carritos
app.use("/api/products", productsRouter); // Productos

// Route for rendering products from MongoDB (Handlebars view)
app.get("/", async (req, res) => {
  const { limit = 10, page = 1, sort = "asc", query = "" } = req.query;

  const options = {
    limit: parseInt(limit),
    skip: (parseInt(page) - 1) * parseInt(limit),
    sort: { price: sort === "asc" ? 1 : -1 },
  };

  try {
    let filter = {};

    if (query) {
      filter = { category: query }; // Modify this to add more filtering conditions
    }

    const products = await Product.find(filter, null, options); // Fetch products with filters, pagination, and sorting
    console.log(products);

    const hasPrevPage = page > 1;
    const hasNextPage = products.length === limit;
    const prevLink = hasPrevPage
      ? `/api/products?page=${
          page - 1
        }&limit=${limit}&sort=${sort}&query=${query}`
      : null;
    const nextLink = hasNextPage
      ? `/api/products?page=${
          parseInt(page) + 1
        }&limit=${limit}&sort=${sort}&query=${query}`
      : null;

    res.render("home", {
      products,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.render("home", { products: [] }); // In case of error, render an empty list
  }
});

// Route to render a single product's details page
app.get("/products/:pid", async (req, res) => {
  const { pid } = req.params;

  try {
    // Use .lean() to get plain JavaScript objects
    const product = await Product.findById(pid).lean();

    if (!product) {
      return res.status(404).send("Producto no encontrado");
    }

    // Render the details page for the product, using product
    res.render("productDetail", { product });
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).send("Error fetching product details");
  }
});

// Route for real-time products (Handlebars view)
app.get("/realtimeproducts", async (req, res) => {
  try {
    const products = await Product.find(); // Fetch all products from MongoDB
    res.render("realTimeProducts", { products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.render("realTimeProducts", { products: [] }); // In case of error, render an empty list
  }
});

// Route for API to fetch products with pagination, sorting, and filtering
app.get("/api/products", async (req, res) => {
  const {
    limit = 10,
    page = 1,
    sort = "asc",
    query = "",
    availability,
  } = req.query;

  const options = {
    limit: parseInt(limit),
    skip: (parseInt(page) - 1) * parseInt(limit),
    sort: { price: sort === "asc" ? 1 : -1 }, // Sorting by price, ascending or descending
  };

  try {
    let filter = {};

    if (query) {
      filter = { category: query }; // Filter by category if 'query' is provided
    }

    if (availability) {
      filter.status = availability === "true" ? "active" : "inactive"; // Filter by availability if 'availability' is provided
    }

    // Fetch products with the given filter, pagination, and sorting
    const products = await Product.find(filter, null, options);

    // Get total count of products to calculate totalPages
    const totalProducts = await Product.countDocuments(filter);

    const totalPages = Math.ceil(totalProducts / parseInt(limit));
    const hasPrevPage = parseInt(page) > 1;
    const hasNextPage = products.length === parseInt(limit);

    const prevLink = hasPrevPage
      ? `/api/products?page=${
          parseInt(page) - 1
        }&limit=${limit}&sort=${sort}&query=${query}&availability=${availability}`
      : null;

    const nextLink = hasNextPage
      ? `/api/products?page=${
          parseInt(page) + 1
        }&limit=${limit}&sort=${sort}&query=${query}&availability=${availability}`
      : null;

    // Send the response in the required format
    res.json({
      status: "success",
      payload: products,
      totalPages,
      prevPage: hasPrevPage ? parseInt(page) - 1 : null,
      nextPage: hasNextPage ? parseInt(page) + 1 : null,
      page: parseInt(page),
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching products",
    });
  }
});

// Start the HTTP server
const httpServer = app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
