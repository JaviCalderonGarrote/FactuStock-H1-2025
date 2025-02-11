import { useEffect, useState } from "react";
import axios from "axios";

function ProductosTable() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/productos")
      .then(response => {
        setProductos(response.data);
      })
      .catch(error => {
        console.error("Error al obtener los productos:", error);
      });
  }, []);

  return (
    <div>
      <h2>Lista de Productos</h2>
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Categoría</th>
            <th>Cantidad en Stock</th>
            <th>IVA</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto.id}>
              <td>{producto.id}</td>
              <td>{producto.nombre}</td>
              <td>{producto.precio} €</td>
              <td>{producto.categoria?.nombre}</td> {/* Categoría */}
              <td>{producto.cantidadStock}</td>       {/* Cantidad en stock */}
              <td>{producto.iva} %</td>               {/* IVA */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductosTable;
