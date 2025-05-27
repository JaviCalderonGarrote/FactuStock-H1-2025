import { Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Home from "./pages/Home";
import Facturas from "./pages/Facturas.jsx";
import NuevaFacturaComponent from "./pages/NuevaFacturaComponent.jsx";
import Products from "./pages/products.jsx";
import CategoryProducts from "./pages/CategoryProducts.jsx";
import CategoryGasto from "./pages/CategoryGasto.jsx";
import Organizacion from "./pages/Organizacion.jsx";
import Perfil from "./pages/Perfil.jsx";
import Clientes from "./pages/Clientes.jsx";
import './assets/styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ResetPassword from "./pages/ResetPassword.jsx";
import Registro from "./pages/Registro.jsx";
import Mail from "./pages/Mail.jsx";
import TPV from "./pages/TPV.jsx";
import Caja from  "./pages/Caja.jsx"
import Gastos from "./pages/Gastos.jsx";
import IngresosComponent from "./pages/ingresos.jsx"; // Importamos el nuevo componente de Gastos

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
            <Route path="/clients" element={<Clientes />} />
            <Route path="/facturas" element={<Facturas />} />
            <Route path="/usuarios/reset-password" element={<ResetPassword />} />
            <Route path="/registro/" element={<Registro />} />
            <Route path="/nueva-factura" element={<NuevaFacturaComponent />} />
            <Route path="/tpv" element={<TPV />} />
            <Route path="/caja" element={<Caja />} />
            <Route path="/mail" element={<Mail />} />
            <Route path="/gastos" element={<Gastos />} />
            <Route path="/ingresos" element={<IngresosComponent />} />

        </Routes>
    );
};

export default App;
