import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { FaUser, FaLock, FaPaperPlane } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [recoveryInput, setRecoveryInput] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [recoveryError, setRecoveryError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = await authService.login(username, password);
      navigate("/home");
    } catch (error) {
      setError("Usuario o contraseña incorrectos");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await authService.sendPasswordResetEmail(recoveryInput);
      setRecoveryMessage("Correo de recuperación enviado con éxito.");
      setRecoveryError("");
      setTimeout(() => setShowModal(false), 2500);
    } catch (err) {
      setRecoveryError("No se pudo enviar el correo. Verifica tu correo o nombre de usuario.");
      setRecoveryMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="d-flex vh-100 justify-content-center align-items-center bg-light">
        <div className="card p-4 shadow" style={{ width: "22rem", borderRadius: "15px" }}>
          <div className="text-center mb-3">
            <img src="/LOGO-Letras.png" alt="Logo" style={{ height: "100px" }} />
          </div>

          <h3 className="text-center mb-4" style={{ color: "#2c3e50", borderBottom: "2px solid #a7c5eb", paddingBottom: "10px" }}>Iniciar Sesión</h3>
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <div className="input-group">
                <span className="input-group-text"><FaUser /></span>
                <input
                    type="text"
                    className="form-control"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={{ borderRadius: "0 8px 8px 0" }}
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Contraseña</label>
              <div className="input-group">
                <span className="input-group-text"><FaLock /></span>
                <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ borderRadius: "0 8px 8px 0" }}
                />
              </div>
            </div>

            <button
                type="submit"
                className="btn w-100"
                style={{ backgroundColor: "#6f9fd7", color: "#fff", borderRadius: "8px" }}
                disabled={isSubmitting}
            >
              {isSubmitting ? "Ingresando..." : "Ingresar"}
            </button>

            <div className="mt-3 text-center">
              <button
                  type="button"
                  className="btn btn-link"
                  onClick={() => setShowModal(true)}
                  style={{ color: "#6f9fd7" }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <div className="mt-2 text-center">
              <span>¿No tienes cuenta?</span>
              <button
                  type="button"
                  className="btn w-100 mt-2"
                  onClick={() => navigate("/registro")}
                  style={{ backgroundColor: "#a7c5eb", color: "#fff", borderRadius: "8px" }}
              >
                Registrarse
              </button>
            </div>
          </form>
        </div>

        {showModal && (
            <div className="modal fade show d-block" tabIndex="-1" role="dialog">
              <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content" style={{ borderRadius: "15px" }}>
                  <div className="modal-header" style={{ backgroundColor: '#a7c5eb', color: '#fff' }}>
                    <h5 className="modal-title">Recuperar Contraseña</h5>
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    {recoveryMessage && (
                        <div className="alert alert-success">{recoveryMessage}</div>
                    )}
                    {recoveryError && (
                        <div className="alert alert-danger">{recoveryError}</div>
                    )}
                    <form onSubmit={handlePasswordReset}>
                      <div className="mb-3">
                        <label htmlFor="recoveryInput" className="form-label">
                          Correo o nombre de usuario
                        </label>
                        <div className="input-group">
                          <span className="input-group-text"><FaPaperPlane /></span>
                          <input
                              type="text"
                              className="form-control"
                              id="recoveryInput"
                              value={recoveryInput}
                              onChange={(e) => setRecoveryInput(e.target.value)}
                              required
                              style={{ borderRadius: "0 8px 8px 0" }}
                          />
                        </div>
                      </div>
                      <button
                          type="submit"
                          className="btn w-100"
                          style={{ backgroundColor: "#6f9fd7", color: "#fff", borderRadius: "8px" }}
                          disabled={isSubmitting}
                      >
                        {isSubmitting ? "Enviando..." : "Enviar enlace"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default Login;
