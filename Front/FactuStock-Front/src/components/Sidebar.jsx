import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Sidebar = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("Usuario"); // Valor por defecto

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
      <aside id="sidebar">
        <div className="d-flex">
          <button className="toggle-btn" type="button">
            <i className="fas fa-bars"></i>
          </button>
          <div className="sidebar-logo">
            <Link to="/home">FactuStock</Link>
          </div>
        </div>
        <ul className="sidebar-nav">
          <li className="sidebar-item">
            <Link to="/profile" className="sidebar-link">
              <i className="fas fa-user"></i>
              <span>{username}</span>
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to="/products" className="sidebar-link">
              <i className="fas fa-box-open"></i>
              <span>Productos</span>
            </Link>
          </li>
          <li className="sidebar-item has-dropdown">
            <Link to="#" className="sidebar-link" data-bs-toggle="collapse" data-bs-target="#category" aria-expanded="false">
              <i className="fas fa-layer-group"></i>
              <span>Categoría</span>
            </Link>
            <ul id="category" className="sidebar-dropdown list-unstyled collapse">
              <li className="sidebar-item">
                <Link to="/category-product" className="sidebar-link">Categoría Producto</Link>
              </li>
              <li className="sidebar-item">
                <Link to="/category-expense" className="sidebar-link">Categoría Gasto</Link>
              </li>
            </ul>
          </li>
          <li className="sidebar-item">
            <Link to="/tpv" className="sidebar-link">
              <i className="fas fa-store"></i>
              <span>TPV</span>
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to="/invoices" className="sidebar-link">
              <i className="fas fa-file-invoice"></i>
              <span>Facturas</span>
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to="/expenses" className="sidebar-link">
              <i className="fas fa-money-bill-wave"></i>
              <span>Gastos</span>
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to="/income" className="sidebar-link">
              <i className="fas fa-coins"></i>
              <span>Ingresos</span>
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to="/organización" className="sidebar-link">
              <i className="fas fa-sitemap"></i>
              <span>Organizacion</span>
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to="/clients" className="sidebar-link">
              <i className="fas fa-users"></i>
              <span>Clientes</span>
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to="/cash-register" className="sidebar-link">
              <i className="fas fa-cash-register"></i>
              <span>Caja</span>
            </Link>
          </li>
        </ul>
        <div className="sidebar-footer">
          <Link to="/login" className="sidebar-link" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </Link>
        </div>
      </aside>
  );
};

export default Sidebar;
