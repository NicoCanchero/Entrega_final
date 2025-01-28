import express from "express";
import cartsRouter from "./routes/carts.routes.js";
import productsRouter from "./routes/products.routes.js";
import __dirname from "./utils.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/public"));

const PORT = 8080;

//defino routers
app.use("/api/cart", cartsRouter); //localhost:8080/api/carts
app.use("/api/product", productsRouter);

app.listen(PORT, () => {
  console.log(`Server escuchando`);
});
