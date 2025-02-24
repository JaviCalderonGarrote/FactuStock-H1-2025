// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService"; // Importamos el AuthService
import Sidebar from "../components/Sidebar"; // Importamos Sidebar

const Home = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Verificamos si el usuario está autenticado
    if (!authService.isAuthenticated()) {
      navigate("/login"); // Si no está autenticado, redirige al login
    } else {
      const storedUsername = localStorage.getItem("username");
      setUsername(storedUsername || "Invitado"); // Usamos el username desde el localStorage
    }
  }, [navigate]);

  return (
    <div className="wrapper">
      <Sidebar /> {/* Agregamos Sidebar aquí */}
      <div className="main p-3">
        <div className="text-center">
          <h1>Bienvenido a FactuStock</h1>
          <p>¡Hola, <strong>{username}</strong>! Has iniciado sesión correctamente.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
