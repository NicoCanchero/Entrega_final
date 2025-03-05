import { Router } from "express";
import mongoose from "mongoose";
import Product from "../models/product-model.js"; // Correct default import
const router = new Router();

// GET all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find(); // Fetch all products from MongoDB
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error fetching products" });
  }
});

// GET a single product by ID
router.get("/:pid", async (req, res) => {
  const { pid } = req.params;
  try {
    const product = await Product.findById(pid); // Find a product by ID
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Error fetching the product" });
  }
});

// POST a new product
router.post("/", async (req, res) => {
  const {
    title,
    description,
    code,
    price,
    status = "active",
    stock,
    category,
    thumbnails = [],
  } = req.body;

  if (!title || !description || !code || !price || !stock || !category) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const newProduct = new Product({
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails,
    });

    const savedProduct = await newProduct.save(); // Save the new product in MongoDB
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ error: "Error saving the product" });
  }
});

// PUT (update) a product by ID
router.put("/:pid", async (req, res) => {
  const { pid } = req.params;
  const {
    title,
    description,
    code,
    price,
    status,
    stock,
    category,
    thumbnails,
  } = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      pid,
      { title, description, code, price, status, stock, category, thumbnails },
      { new: true } // This returns the updated document
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: "Error updating the product" });
  }
});

// DELETE a product by ID
router.delete("/:pid", async (req, res) => {
  const { pid } = req.params;

  try {
    const deletedProduct = await Product.findByIdAndDelete(pid);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(200).json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting the product" });
  }
});

export default router;
