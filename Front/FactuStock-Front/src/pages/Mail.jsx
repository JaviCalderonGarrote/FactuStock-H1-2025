import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Select from "react-select";
import axios from "axios";
import Swal from "sweetalert2";

const Mail = () => {
    const [clientes, setClientes] = useState([]);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [correoOrganizacion, setCorreoOrganizacion] = useState("");
    const [formData, setFormData] = useState({
        asunto: "",
        mensaje: "",
        archivo: null,
    });
    const [inputCorreo, setInputCorreo] = useState("");
    const [error, setError] = useState(null);
    const token = localStorage.getItem("authToken");

    const decodeToken = (token) => {
        try {
            const tokenParts = token.split(".");
            if (tokenParts.length !== 3) {
                setError("Token JWT no es válido.");
                return null;
            }
            const decoded = atob(tokenParts[1].replace(/-/g, "+").replace(/_/g, "/"));
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
                const userResponse = await axios.get(`http://localhost:8080/usuarios/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (userResponse.data) {
                    setCorreoOrganizacion(userResponse.data.organizacion.email);
                    const empresaResponse = await axios.get(
                        `http://localhost:8080/EmpresaPersonaFisica/organizacion/${userResponse.data.organizacion.id}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setClientes(empresaResponse.data);
                } else {
                    setError("No se encontró la información del usuario.");
                }
            } catch (err) {
                setError("Error al obtener los datos.");
                console.error(err);
            }
        };

        fetchData();
    }, [token]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const handleSelectChange = (selectedOption) => {
        setSelectedCliente(selectedOption);
        if (selectedOption) {
            setInputCorreo(selectedOption.value);
        } else {
            setInputCorreo("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!inputCorreo || !/\S+@\S+\.\S+/.test(inputCorreo)) {
            Swal.fire({
                icon: "warning",
                title: "Correo inválido",
                text: "Por favor, introduce un correo válido.",
            });
            return;
        }

        const data = new FormData();
        data.append("cliente", inputCorreo);
        data.append("asunto", formData.asunto);
        data.append("mensaje", formData.mensaje);
        data.append("correoOrganizacion", correoOrganizacion);

        if (formData.archivo) {
            data.append("archivo", formData.archivo);
        }

        try {
            const response = await fetch("http://localhost:8080/api/email/enviar", {
                method: "POST",
                body: data,
                headers: {
                    "Authorization": `Bearer ${token}`,
                }
            });

            if (response.ok) {
                Swal.fire({
                    icon: "success",
                    title: "Correo enviado",
                    text: "El correo fue enviado con éxito.",
                    timer: 2000,
                    showConfirmButton: false,
                });

                setFormData({ asunto: "", mensaje: "", archivo: null });
                setSelectedCliente(null);
                setInputCorreo("");
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Hubo un problema al enviar el correo.",
                });
            }
        } catch (error) {
            console.error("Error al enviar:", error);
            Swal.fire({
                icon: "error",
                title: "Error de red",
                text: "No se pudo enviar el correo. Revisa tu conexión.",
            });
        }
    };

    const clientOptions = clientes.map((cliente) => ({
        value: cliente.mail,
        label: `${cliente.nombre} - ${cliente.mail}`,
    }));

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="container mt-5 mail-page">
                <h2 className="text-center mb-4" style={{ borderBottom: '2px solid #a7c5eb', paddingBottom: '10px' }}>Enviar Correo</h2>
                <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
                    <div className="mb-3">
                        <label className="form-label">Seleccionar Cliente o Escribir Correo</label>
                        <Select
                            options={clientOptions}
                            value={selectedCliente}
                            onChange={handleSelectChange}
                            placeholder="Buscar cliente o escribir correo..."
                            isClearable
                            isSearchable
                            onInputChange={(inputValue, { action }) => {
                                if (action === "input-change") {
                                    setInputCorreo(inputValue);
                                }
                            }}
                            noOptionsMessage={() => "No se encontraron clientes"}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Asunto</label>
                        <input
                            type="text"
                            name="asunto"
                            className="form-control"
                            value={formData.asunto}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Mensaje</label>
                        <textarea
                            name="mensaje"
                            className="form-control"
                            rows="5"
                            value={formData.mensaje}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Adjuntar archivo</label>
                        <input
                            type="file"
                            name="archivo"
                            className="form-control"
                            onChange={handleChange}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">
                        <i className="fas fa-paper-plane me-2"></i>Enviar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Mail;
