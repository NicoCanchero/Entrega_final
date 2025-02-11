import express from "express";
import handlebars from "express-handlebars";
import cartsRouter from "./routes/carts.routes.js";
import productsRouter from "./routes/products.routes.js";
import __dirname from "./utils.js";
import { Server } from "socket.io";
import fs from "fs";
import path from "path";

const app = express();

// Middleware de Express para manejar JSON y URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Carpeta estática para archivos públicos (CSS, imágenes, etc.)
app.use(express.static(__dirname + "/public"));

// Configuración del motor de plantillas Handlebars
app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

const PORT = 8080;

// Ruta de prueba
app.use("/ping", (req, res) => {
  res.json({ message: "Pong!" });
});

// Definición de rutas
app.use("/api/cart", cartsRouter); // Carritos
app.use("/api/product", productsRouter); // Productos

// Ruta para la vista de productos
app.get("/", (req, res) => {
  const products = readProductsFromFile(); // Lee los productos desde el archivo
  console.log(products); // Agrega un log para verificar los productos leídos
  res.render("home", { products }); // Renderiza la vista pasando los productos
});

// Ruta para productos en tiempo real
app.get("/realtimeproducts", (req, res) => {
  const products = readProductsFromFile(); // Leemos los productos desde el archivo
  res.render("realTimeProducts", { products }); // Renderiza la vista realTimeProducts.handlebars
});

// Inicia el servidor HTTP de Express
const httpServer = app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

// Inicia el servidor WebSocket
const socketServer = new Server(httpServer);

// Función para leer los productos desde el archivo productos.json
const readProductsFromFile = () => {
  const productsFilePath = path.resolve(__dirname, "data", "productos.json"); // Asegúrate de que la ruta sea correcta
  try {
    const data = fs.readFileSync(productsFilePath, "utf-8"); // Lee el archivo de productos
    return JSON.parse(data); // Devuelve los productos parseados
  } catch (error) {
    console.error("Error leyendo el archivo de productos:", error); // Muestra errores si no se puede leer el archivo
    return []; // Devuelve un array vacío si hay error
  }
};

// Función para escribir productos en el archivo productos.json
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

  // Emite la lista de productos cuando el cliente se conecta
  socket.emit("productos", readProductsFromFile());

  // Evento para agregar un producto (vía WebSocket)
  socket.on("agregarProducto", (producto) => {
    const products = readProductsFromFile();
    products.push(producto); // Agrega el nuevo producto
    writeProductsToFile(products); // Guarda el archivo actualizado
    socketServer.emit("productos", products); // Notifica a todos los clientes
  });

  // Evento para eliminar un producto (vía WebSocket)
  socket.on("eliminarProducto", (idProducto) => {
    let products = readProductsFromFile();
    products = products.filter((prod) => prod.id !== idProducto); // Filtra el producto a eliminar
    writeProductsToFile(products); // Guarda el archivo actualizado
    socketServer.emit("productos", products); // Notifica a todos los clientes
  });

  // Evento de desconexión
  socket.on("disconnect", () => {
    console.log("Usuario desconectado");
  });
});
