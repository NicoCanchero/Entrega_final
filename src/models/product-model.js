import mongoose from "mongoose";

// Define the collection name explicitly
const prodCollection = "productos";

// Define the schema for products
const prodSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    index: true,
  },
  price: {
    type: Number,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    required: true,
    index: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
});

// Define the model using the collection name explicitly
const Product = mongoose.model("Product", prodSchema, prodCollection);

// Export the model as default
export default Product;
