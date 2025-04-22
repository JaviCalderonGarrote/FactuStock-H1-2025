import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

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
        <div className="card p-4 shadow" style={{ width: "22rem" }}>
          {/* LOGO ENCIMA DEL FORMULARIO */}
          <div className="text-center mb-3">
            <img src="/LOGO-Letras.png" alt="Logo" style={{ height: "100px" }} />
          </div>

          <h3 className="text-center mb-4">Iniciar Sesión</h3>
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

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

            <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={isSubmitting}
            >
              {isSubmitting ? "Ingresando..." : "Ingresar"}
            </button>

            <div className="mt-3 text-center">
              <button
                  type="button"
                  className="btn btn-link"
                  onClick={() => setShowModal(true)}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <div className="mt-2 text-center">
              <span>¿No tienes cuenta?</span>
              <button
                  type="button"
                  className="btn btn-outline-success w-100 mt-2"
                  onClick={() => navigate("/registro")}
              >
                Registrarse
              </button>
            </div>
          </form>
        </div>

        {/* Modal de recuperación de contraseña */}
        {showModal && (
            <div className="modal fade show d-block" tabIndex="-1" role="dialog">
              <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                  <div className="modal-header">
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
                        <input
                            type="text"
                            className="form-control"
                            id="recoveryInput"
                            value={recoveryInput}
                            onChange={(e) => setRecoveryInput(e.target.value)}
                            required
                        />
                      </div>
                      <button
                          type="submit"
                          className="btn btn-primary w-100"
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
