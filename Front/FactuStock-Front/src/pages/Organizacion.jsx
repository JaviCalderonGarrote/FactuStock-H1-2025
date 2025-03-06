import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaSave, FaUpload } from "react-icons/fa";

const Organizacion = () => {
    const [organizacion, setOrganizacion] = useState({
        id: null,
        nombre: "",
        direccion: "",
        telefono: "",
        nifCif: "",
        web: "",
        email: "",
        logo: "",
    });

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const token = localStorage.getItem("authToken");

    // Decodificar el token para obtener el ID del usuario
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

    // Cargar la información de la organización
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

    // Manejo de cambios en los inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setOrganizacion({ ...organizacion, [name]: value });
    };

    // Manejo del cambio de archivo
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && (selectedFile.type === "image/png" || selectedFile.type === "image/jpeg")) {
            setFile(selectedFile);
        } else {
            Swal.fire("Error", "Solo se permiten archivos PNG o JPG.", "error");
        }
    };

    // Guardar cambios en la organización
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!organizacion.nombre || !organizacion.direccion || !organizacion.telefono || !organizacion.nifCif || !organizacion.email) {
            Swal.fire("Error", "Por favor completa todos los campos correctamente.", "error");
            return;
        }

        setLoading(true);

        try {
            // Actualizar los datos de la organización
            await axios.put(`http://localhost:8080/organizaciones/${organizacion.id}`, organizacion, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Subir el nuevo logo si se seleccionó
            if (file) {
                const formData = new FormData();
                formData.append("file", file);

                const uploadResponse = await axios.post(
                    `http://localhost:8080/organizaciones/upload-logo/${organizacion.id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
                );

                // Actualizar el estado con el nuevo logo
                setOrganizacion((prev) => ({ ...prev, logo: uploadResponse.data.filename }));
            }

            setLoading(false);
            Swal.fire("Éxito", "Organización actualizada correctamente.", "success").then(() => {
                window.location.reload(); // Recargar la página después de mostrar el mensaje de éxito
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
                            <input type="text" className="form-control" name="nombre" value={organizacion.nombre || ""} onChange={handleChange} required />
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label">Dirección</label>
                            <input type="text" className="form-control" name="direccion" value={organizacion.direccion || ""} onChange={handleChange} required />
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label">Teléfono</label>
                            <input type="text" className="form-control" name="telefono" value={organizacion.telefono || ""} onChange={handleChange} required />
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label">NIF/CIF</label>
                            <input type="text" className="form-control" name="nifCif" value={organizacion.nifCif || ""} onChange={handleChange} required />
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label">Email</label>
                            <input type="email" className="form-control" name="email" value={organizacion.email || ""} onChange={handleChange} required />
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label">Sitio Web</label>
                            <input type="url" className="form-control" name="web" value={organizacion.web || ""} onChange={handleChange} />
                        </div>

                        {/* Vista previa del logo */}
                        {organizacion.logo && (
                            <div className="col-12 text-center mb-3">
                                <p>Logo actual:</p>
                                <img src={`http://localhost:8080/organizaciones/logo/${organizacion.logo}`} alt="Logo actual" className="img-fluid rounded" style={{ maxWidth: "150px" }} />
                            </div>
                        )}

                        {/* Subir nuevo logo */}
                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label">Subir nuevo logo</label>
                            <input type="file" className="form-control" accept="image/png, image/jpeg" onChange={handleFileChange} />
                        </div>

                        <div className="col-12 mb-3">
                            <button type="submit" className="btn" style={{ backgroundColor: "#a7c5eb", width: "100%" }} disabled={loading}>
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