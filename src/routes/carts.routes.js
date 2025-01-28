import { Router } from "express";
import fs from "fs";
import path from "path";
const router = new Router();

const __dirname = path.resolve(); // Esto obtiene el directorio desde donde se ejecuta el script, sin necesidad de usar `import.meta.url`

// Usamos path.resolve para asegurar que las rutas sean absolutas y correctas
const productsFilePath = path.resolve(
  __dirname,
  "src",
  "data",
  "productos.json"
);
const cartsFilePath = path.resolve(__dirname, "src", "data", "carrito.json");

console.log("Ruta carrito.json:", cartsFilePath);
console.log("Ruta productos.json:", productsFilePath);

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

router.post("/", (req, res) => {
  const carts = readFile(cartsFilePath);
  const newCart = {
    id: Math.floor(Math.random() * 100), //id unico
    products: [],
  };

  carts.push(newCart);
  writeFile(cartsFilePath, carts);
  res.status(201).json(newCart);
});

router.get("/:cid", (req, res) => {
  const { cid } = req.params;
  const carts = readFile(cartsFilePath);
  const cart = carts.find((c) => c.id === parseInt(cid));

  if (!cart) {
    return res.status(404).json({ error: "Carrito no encontrado" });
  }

  res.json(cart.products);
});

router.post("/:cid/product/:pid", (req, res) => {
  const { cid, pid } = req.params;
  const carts = readFile(cartsFilePath);
  const products = readFile(productsFilePath);

  const cart = carts.find((c) => c.id === parseInt(cid));
  if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

  const product = products.find((p) => p.id === parseInt(pid));
  if (!product)
    return res.status(404).json({ error: "Producto no encontrado" });

  const existingProduct = cart.products.find((p) => p.product === pid);
  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.products.push({ product: pid, quantity: 1 });
  }

  writeFile(cartsFilePath, carts);
  res.status(200).json(cart);
});

export default router;
