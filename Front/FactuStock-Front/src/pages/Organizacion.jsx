import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaSave } from "react-icons/fa";

const Organizacion = () => {
    const [organizacion, setOrganizacion] = useState({
        id: null,
        nombre: "",
        direccion: "",
        telefono: "",
        nifCif: "",
        web: "",
        email: "",
    });

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("authToken");

    const decodeToken = (token) => {
        try {
            const tokenParts = token.split(".");
            if (tokenParts.length !== 3) {
                setError("Token JWT no es válido.");
                return null;
            }

            const base64Url = tokenParts[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const decoded = atob(base64);
            return JSON.parse(decoded);
        } catch (error) {
            setError("Error al decodificar el token.");
            console.error(error);
            return null;
        }
    };

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

                if (response.data.organizacion) {
                    setOrganizacion(response.data.organizacion);
                } else {
                    setError("No se encontró la información de la organización.");
                }
            } catch (err) {
                setError("Error al obtener los datos.");
                console.error(err);
            }
        };

        fetchData();
    }, [token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setOrganizacion({ ...organizacion, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!organizacion.nombre || !organizacion.direccion || !organizacion.telefono || !organizacion.nifCif || !organizacion.email) {
            Swal.fire("Error", "Por favor completa todos los campos correctamente.", "error");
            return;
        }

        setLoading(true);

        try {
            await axios.put(`http://localhost:8080/organizaciones/${organizacion.id}`, organizacion, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setLoading(false);
            Swal.fire({
                title: "Éxito",
                text: "Organización actualizada correctamente.",
                icon: "success",
                confirmButtonText: "OK",
            });

        } catch (err) {
            setLoading(false);
            Swal.fire({
                title: "Error",
                text: err.response?.data?.message || "Hubo un error al actualizar la organización.",
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
                    Editar Organización
                </h2>

                {error && <div className="alert alert-danger text-center">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label">Nombre</label>
                            <input
                                type="text"
                                className="form-control"
                                name="nombre"
                                value={organizacion.nombre || ""}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label">Dirección</label>
                            <input
                                type="text"
                                className="form-control"
                                name="direccion"
                                value={organizacion.direccion || ""}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label">Teléfono</label>
                            <input
                                type="text"
                                className="form-control"
                                name="telefono"
                                value={organizacion.telefono || ""}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label">NIF/CIF</label>
                            <input
                                type="text"
                                className="form-control"
                                name="nifCif"
                                value={organizacion.nifCif || ""}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                value={organizacion.email || ""}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label">Sitio Web</label>
                            <input
                                type="url"
                                className="form-control"
                                name="web"
                                value={organizacion.web || ""}
                                onChange={handleChange}
                            />
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
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Organizacion;
