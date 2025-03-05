import { Router } from "express";
import Product from "../models/product-model.js";
import { cartModel } from "../models/cart-model.js"; // Import cart model

const router = new Router();

// Create a new cart
router.post("/", async (req, res) => {
  try {
    const newCart = new cartModel({
      products: [], // Initial empty products array
    });
    const savedCart = await newCart.save(); // Save the new cart in MongoDB
    res.status(201).json(savedCart);
  } catch (error) {
    res.status(500).json({ error: "Error creating the cart" });
  }
});

// Get all carts
router.get("/", async (req, res) => {
  try {
    const carts = await cartModel.find(); // Fetch all carts from MongoDB
    res.json(carts);
  } catch (error) {
    res.status(500).json({ error: "Error fetching carts" });
  }
});

// Get a specific cart by ID with populated products
router.get("/:cid", async (req, res) => {
  const { cid } = req.params;
  try {
    const cart = await cartModel.findById(cid).populate("products.product"); // Populate the product details

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    res.json(cart.products); // Return the products in the cart with details
  } catch (error) {
    res.status(500).json({ error: "Error fetching the cart" });
  }
});

// Add a product to a specific cart
router.post("/:cid/product/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  try {
    const cart = await cartModel.findById(cid); // Find the cart by ID
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    const product = await Product.findById(pid); // Find the product by ID
    if (!product)
      return res.status(404).json({ error: "Producto no encontrado" });

    const existingProduct = cart.products.find(
      (p) => p.product.toString() === pid
    );
    if (existingProduct) {
      // If product exists, increase the quantity
      existingProduct.quantity += 1;
    } else {
      // If product doesn't exist, add it with quantity 1
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save(); // Save the updated cart
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error adding product to the cart" });
  }
});

// DELETE product from cart
router.delete("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  try {
    const cart = await cartModel.findById(cid); // Find the cart by ID
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    const productIndex = cart.products.findIndex(
      (p) => p.product.toString() === pid
    );
    if (productIndex === -1)
      return res
        .status(404)
        .json({ error: "Producto no encontrado en el carrito" });

    // Remove the product from the cart
    cart.products.splice(productIndex, 1);
    await cart.save(); // Save the updated cart
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error deleting product from the cart" });
  }
});

// PUT to update the entire cart with an array of products (product ID and quantity)
router.put("/:cid", async (req, res) => {
  const { cid } = req.params;
  const newProducts = req.body.products; // Array of { productId, quantity }
  try {
    const cart = await cartModel.findById(cid); // Find the cart by ID
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    // Clear the current cart products and add the new products
    cart.products = [];
    for (const product of newProducts) {
      const productDetails = await Product.findById(product.product);
      if (productDetails) {
        cart.products.push({
          product: product.product,
          quantity: product.quantity,
        });
      }
    }

    await cart.save(); // Save the updated cart
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error updating the cart" });
  }
});

// PUT to update only the quantity of a specific product in the cart
router.put("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body; // The new quantity from the request body
  try {
    const cart = await cartModel.findById(cid); // Find the cart by ID
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    const product = cart.products.find((p) => p.product.toString() === pid);
    if (!product)
      return res
        .status(404)
        .json({ error: "Producto no encontrado en el carrito" });

    // Update the quantity of the product
    product.quantity = quantity;
    await cart.save(); // Save the updated cart
    res.status(200).json(cart);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error updating the product quantity in the cart" });
  }
});

// DELETE all products from the cart
router.delete("/:cid", async (req, res) => {
  const { cid } = req.params;
  try {
    const cart = await cartModel.findById(cid); // Find the cart by ID
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    // Clear all products from the cart
    cart.products = [];
    await cart.save(); // Save the updated cart
    res.status(200).json(cart);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error deleting all products from the cart" });
  }
});

export default router;
