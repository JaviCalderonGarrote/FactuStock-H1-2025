import { Routes, Route } from "react-router-dom";  // Asegúrate de importar Routes y Route
import Login from "./pages/login"; // Asegúrate de que las rutas sean correctas
import Home from "./pages/Home";
import Products from "./pages/products.jsx";  // Asegúrate de importar el CSS aquí
import CategoryProducts from "./pages/CategoryProducts.jsx";
import CategoryGasto from "./pages/CategoryGasto.jsx";
import Organizacion from "./pages/Organizacion.jsx";
import Perfil from "./pages/Perfil.jsx";
import './assets/styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';


const App = () => {
  return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products" element={<Products />} />
        <Route path="/home" element={<Home />} />
        <Route path="/category-product" element={<CategoryProducts />} />
        <Route path="/category-expense" element={<CategoryGasto />} />
        <Route path="/organización" element={<Organizacion />} />
          <Route path="/profile" element={<Perfil />} />


      </Routes>
  );
};

export default App;
