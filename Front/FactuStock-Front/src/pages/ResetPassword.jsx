import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom"; // Usamos useLocation en lugar de useParams

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const location = useLocation(); // Usamos useLocation para acceder a la URL
    const navigate = useNavigate(); // Usamos useNavigate en lugar de useHistory

    useEffect(() => {
        // Extraemos el token desde los parámetros de la URL
        const queryParams = new URLSearchParams(location.search); // location.search contiene la cadena de consulta
        const urlToken = queryParams.get("token"); // Obtenemos el valor del token
        if (urlToken) {
            setToken(urlToken); // Si hay un token, lo asignamos al estado
            console.log("Token recibido desde la URL:", urlToken); // Verifica el valor del token
        } else {
            console.log("No se ha recibido un token.");
            Swal.fire("Error", "No se ha proporcionado un token válido.", "error");
        }
    }, [location.search, navigate]); // Dependemos de location.search para cuando la URL cambie

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            Swal.fire("Error", "Las contraseñas no coinciden.", "error");
            return;
        }

        if (newPassword.length < 6) {
            Swal.fire("Error", "La contraseña debe tener al menos 6 caracteres.", "error");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post("http://localhost:8080/usuarios/reset-password", {
                token,
                newPassword,
            });

            console.log("Respuesta del backend:", response); // Verifica lo que retorna el backend

            if (response.status === 200) {
                Swal.fire("Éxito", "Contraseña actualizada correctamente.", "success");
                navigate("/login"); // Redirigir al login después de cambiar la contraseña
            } else {
                Swal.fire("Error", "Hubo un error al restablecer la contraseña.", "error");
            }
        } catch (error) {
            console.error("Error al restablecer la contraseña:", error.response ? error.response.data : error); // Muestra los detalles del error

            if (error.response && error.response.data) {
                Swal.fire("Error", error.response.data.message || "Hubo un error al restablecer la contraseña.", "error");
            } else {
                Swal.fire("Error", "Hubo un error al restablecer la contraseña.", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">Restablecer Contraseña</h2>

            <form onSubmit={handleSubmit} className="col-md-6 offset-md-3">
                <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">
                        Nueva Contraseña
                    </label>
                    <input
                        type="password"
                        id="newPassword"
                        className="form-control"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">
                        Confirmar Contraseña
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        className="form-control"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? "Cargando..." : "Restablecer Contraseña"}
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;
