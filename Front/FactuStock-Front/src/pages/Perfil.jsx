import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaSave, FaKey } from "react-icons/fa";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const Perfil = () => {
    const [usuario, setUsuario] = useState({
        id: null,
        username: "",
        mail: "",
        nombre: "",
        apellido: "",
        telefono: "",
        rol: "", // Agregado campo rol
    });

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const token = localStorage.getItem("authToken");

    // Función para decodificar el token JWT
    const decodeToken = (token) => {
        try {
            const tokenParts = token.split(".");
            if (tokenParts.length !== 3) {
                setError("Token JWT no es válido.");
                return null;
            }

            const base64Url = tokenParts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const decoded = atob(base64);  // Decodifica correctamente el base64
            return JSON.parse(decoded);  // Devuelve el payload decodificado
        } catch (error) {
            setError("Error al decodificar el token.");
            console.error(error);
            return null;
        }
    };

    // Fetch user data when the component mounts
    useEffect(() => {
        if (!token) {
            setError("No se encontró un token de autenticación.");
            return;
        }

        const decodedToken = decodeToken(token);
        const userId = decodedToken?.idUsuario;

        if (!userId) {
            setError("ID de usuario no encontrado en el token.");
            return;
        }

        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/usuarios/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data) {
                    setUsuario(response.data); // Establece los datos del usuario al estado
                } else {
                    setError("No se encontró la información del usuario.");
                }
            } catch (err) {
                setError("Error al obtener los datos.");
                console.error(err);
            }
        };

        fetchData(); // Llama la función para obtener los datos del usuario
    }, [token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUsuario({ ...usuario, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!usuario.nombre || !usuario.apellido || !usuario.mail || !usuario.telefono) {
            Swal.fire("Error", "Por favor completa todos los campos correctamente.", "error");
            return;
        }

        setLoading(true);

        try {
            await axios.put(`http://localhost:8080/usuarios/${usuario.id}`, usuario, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setLoading(false);
            Swal.fire({
                title: "Éxito",
                text: "Perfil actualizado correctamente.",
                icon: "success",
                confirmButtonText: "OK",
            });

        } catch (err) {
            setLoading(false);
            Swal.fire({
                title: "Error",
                text: err.response?.data?.message || "Hubo un error al actualizar el perfil.",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!oldPassword || !newPassword || newPassword !== confirmPassword) {
            Swal.fire("Error", "Por favor verifica que la contraseña antigua y la nueva sean correctas.", "error");
            return;
        }

        setLoading(true);

        try {
            await axios.patch(`http://localhost:8080/usuarios/${usuario.id}/password`, {
                oldPassword,
                newPassword,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setLoading(false);
            Swal.fire({
                title: "Éxito",
                text: "Contraseña actualizada correctamente.",
                icon: "success",
                confirmButtonText: "OK",
            }).then(() => {
                setShowPasswordModal(false);
            });

        } catch (err) {
            setLoading(false);
            Swal.fire({
                title: "Error",
                text: err.response?.data?.message || "Hubo un error al actualizar la contraseña.",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="container mt-4">
                <h2 className="text-center mb-4" style={{ borderBottom: "2px solid #a7c5eb", paddingBottom: "10px" }}>
                    Editar Perfil
                </h2>

                {error && <div className="alert alert-danger text-center">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-6 mb-3">
                            <div className="form-group">
                                <label className="form-label">Usuario</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="username"
                                    value={usuario.username || ""}
                                    onChange={handleChange}
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="col-12 col-md-6 mb-3">
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    name="mail"
                                    value={usuario.mail || ""}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="col-12 col-md-6 mb-3">
                            <div className="form-group">
                                <label className="form-label">Nombre</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="nombre"
                                    value={usuario.nombre || ""}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="col-12 col-md-6 mb-3">
                            <div className="form-group">
                                <label className="form-label">Apellido</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="apellido"
                                    value={usuario.apellido || ""}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="col-12 col-md-6 mb-3">
                            <div className="form-group">
                                <label className="form-label">Teléfono</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="telefono"
                                    value={usuario.telefono || ""}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Nuevo campo de rol */}
                        <div className="col-12 col-md-6 mb-3">
                            <div className="form-group">
                                <label className="form-label">Rol</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="rol"
                                    value={usuario.rol || ""}
                                    onChange={handleChange}
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="col-12 mb-3">
                            <button
                                type="submit"
                                className="btn"
                                style={{ backgroundColor: "#a7c5eb", width: "100%" }}
                                disabled={loading}
                            >
                                {loading ? "Guardando..." : <><FaSave className="me-2" /> Guardar Cambios</>}
                            </button>
                        </div>

                        <div className="col-12 mb-3">
                            <button
                                type="button"
                                className="btn btn-secondary w-100"
                                onClick={() => setShowPasswordModal(true)}
                            >
                                <FaKey className="me-2" /> Cambiar Contraseña
                            </button>
                        </div>
                    </div>
                </form>

                {/* Modal para cambiar la contraseña */}
                <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} aria-labelledby="modal-title">
                    <Modal.Header closeButton>
                        <Modal.Title id="modal-title">Cambiar Contraseña</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleChangePassword}>
                            <div className="mb-3">
                                <label htmlFor="oldPassword" className="form-label">Contraseña Actual</label>
                                <input
                                    type="password"
                                    id="oldPassword"
                                    className="form-control"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="newPassword" className="form-label">Nueva Contraseña</label>
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
                                <label htmlFor="confirmPassword" className="form-label">Confirmar Nueva Contraseña</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    className="form-control"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-3 text-center">
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? "Actualizando..." : "Actualizar Contraseña"}
                                </button>
                            </div>
                        </form>
                    </Modal.Body>
                </Modal>
            </div>
        </div>
    );
};

export default Perfil;
