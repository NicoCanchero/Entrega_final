import { Router } from "express";
import fs from "fs";
import path from "path";
const router = new Router();

const __dirname = path.resolve();

const productsFilePath = path.resolve(
  __dirname,
  "src",
  "data",
  "productos.json"
);

const readFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};

router.get("/", (req, res) => {
  const products = readFile(productsFilePath);
  res.json(products);
});

router.get("/:pid", (req, res) => {
  const { pid } = req.params;
  const products = readFile(productsFilePath);
  const product = products.find((prod) => prod.id === parseInt(pid));

  if (!product) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  res.json(product);
});

router.post("/", (req, res) => {
  const {
    title,
    description,
    code,
    price,
    status = true,
    stock,
    category,
    thumbnails = [],
  } = req.body;

  if (!title || !description || !code || !price || !stock || !category) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  const products = readFile(productsFilePath);
  const newProduct = {
    id: Math.floor(Math.random() * 100), //id unico
    title,
    description,
    code,
    price,
    status,
    stock,
    category,
    thumbnails,
  };

  products.push(newProduct);
  writeFile(productsFilePath, products);
  res.status(201).json(newProduct);
});

router.put("/:pid", (req, res) => {
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

  const products = readFile(productsFilePath);
  const index = products.findIndex((prod) => prod.id === parseInt(pid));

  if (index === -1) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  const updatedProduct = {
    ...products[index],
    title,
    description,
    code,
    price,
    status,
    stock,
    category,
    thumbnails,
  };

  products[index] = updatedProduct;
  writeFile(productsFilePath, products);
  res.json(updatedProduct);
});

router.delete("/:pid", (req, res) => {
  const { pid } = req.params;
  let products = readFile(productsFilePath);

  const productIndex = products.findIndex((prod) => prod.id === parseInt(pid));

  if (productIndex === -1) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  products = products.filter((prod) => prod.id !== parseInt(pid));
  writeFile(productsFilePath, products);
  res.status(200).json({ message: "Producto eliminado correctamente" });
});

export default router;
