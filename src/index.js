import express from "express";
import handlebars from "express-handlebars";
import cartsRouter from "./routes/carts.routes.js";
import productsRouter from "./routes/products.routes.js";
import __dirname from "./utils.js";
import { Server } from "socket.io";
import fs from "fs";
import path from "path";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/public"));

app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

const PORT = 8080;

app.use("/ping", (req, res) => {
  res.json({ message: "Pong!" });
});

// Definición de rutas
app.use("/api/cart", cartsRouter); // Carritos
app.use("/api/product", productsRouter); // Productos

// Ruta para la vista de productos
app.get("/", (req, res) => {
  const products = readProductsFromFile();
  console.log(products);
  res.render("home", { products });
});

app.get("/realtimeproducts", (req, res) => {
  const products = readProductsFromFile();
  res.render("realTimeProducts", { products });
});

const httpServer = app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

const socketServer = new Server(httpServer);

const readProductsFromFile = () => {
  const productsFilePath = path.resolve(__dirname, "data", "productos.json");
  try {
    const data = fs.readFileSync(productsFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error leyendo el archivo de productos:", error);
    return [];
  }
};

const writeProductsToFile = (products) => {
  const productsFilePath = path.resolve(
    __dirname,
    "src",
    "data",
    "productos.json"
  );
  fs.writeFileSync(
    productsFilePath,
    JSON.stringify(products, null, 2),
    "utf-8"
  );
};

// Conexión WebSocket
socketServer.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");

  socket.emit("productos", readProductsFromFile());

  socket.on("agregarProducto", (producto) => {
    const products = readProductsFromFile();
    products.push(producto);
    writeProductsToFile(products);
    socketServer.emit("productos", products);
  });

  socket.on("eliminarProducto", (idProducto) => {
    let products = readProductsFromFile();
    products = products.filter((prod) => prod.id !== idProducto);
    writeProductsToFile(products);
    socketServer.emit("productos", products);
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado");
  });
});
