import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService"; // Importamos el servicio de autenticación

const Login = () => {
  const navigate = useNavigate();  // Hook para la navegación

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Estado para manejar el error de login

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Llamamos al servicio de login
      const token = await authService.login(username, password);
      
      // Si el login es exitoso, redirigimos al home
      navigate("/home");
    } catch (error) {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="d-flex vh-100 justify-content-center align-items-center bg-light">
      <div className="card p-4 shadow" style={{ width: "22rem" }}>
        <h3 className="text-center mb-4">Iniciar Sesión</h3>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger">{error}</div>}  {/* Muestra el error si existe */}

          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
