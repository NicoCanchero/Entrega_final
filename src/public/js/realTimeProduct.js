const socket = io();

socket.on("productos", (products) => {
  console.log("Productos recibidos desde el servidor:", products);

  if (Array.isArray(products)) {
    const productList = document.getElementById("productList");
    productList.innerHTML = "";

    products.forEach((product) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <h2>${product.title}</h2>
        <p>${product.description}</p>
        <p>Precio: $${product.price}</p>
        <p>Stock: ${product.stock}</p>
        <img src="${product.thumbnails[0]}" alt="Imagen del producto" />
      `;
      productList.appendChild(li);
    });
  } else {
    console.error("Los productos recibidos no son un array válido:", products);
  }
});
