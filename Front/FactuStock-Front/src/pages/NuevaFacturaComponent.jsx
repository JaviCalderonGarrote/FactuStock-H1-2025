import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";

const convertToISOFormat = (date) => {
    const dateObj = new Date(date);
    return dateObj.toISOString();
};

const NuevaFacturaComponent = () => {
    const navigate = useNavigate();
    const [factura, setFactura] = useState({
        fecha: "",
        empresaPersonaFisicaId: "", // Campo correcto
        estado: "ENVIADA",
        formaCobro: "NoCobrada",
        organizacion: null,
        usuario: null,
        numeroFactura: "",
    });

    const [empresasPersonaFisica, setEmpresasPersonaFisica] = useState([]);
    const [organizacion, setOrganizacion] = useState(null);
    const [usuario, setUsuario] = useState(null);
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
                    setUsuario(userResponse.data);
                    setOrganizacion(userResponse.data.organizacion);
                } else {
                    setError("No se encontró la información del usuario.");
                }

                const empresasResponse = await axios.get("http://localhost:8080/EmpresaPersonaFisica", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (empresasResponse.data) {
                    setEmpresasPersonaFisica(empresasResponse.data);
                } else {
                    setError("No se pudieron obtener las empresas/personas físicas.");
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
        setFactura({ ...factura, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!factura.fecha || !factura.empresaPersonaFisicaId) {
            Swal.fire("Error", "Por favor selecciona una empresa/persona física y una fecha.", "error");
            return;
        }

        if (!organizacion || !usuario) {
            Swal.fire("Error", "No se pudo obtener la organización o el usuario.", "error");
            return;
        }

        try {
            const fechaFactura = new Date(factura.fecha);
            const year = fechaFactura.getFullYear() % 100;
            const month = fechaFactura.getMonth() + 1;

            const countResponse = await axios.get(
                `http://localhost:8080/facturas/count?month=${month}&year=${fechaFactura.getFullYear()}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const sequence = countResponse.data + 1;
            const numeroFactura = `Fac_${String(year).padStart(2, "0")}/${String(month).padStart(2, "0")}/${String(sequence).padStart(5, "0")}`;

            const facturaData = {
                ...factura,
                fecha: convertToISOFormat(factura.fecha),
                organizacion: organizacion,
                usuario: usuario,
                numeroFactura: numeroFactura,
                empresaPersonaFisica: { id: factura.empresaPersonaFisicaId },
                formaPago: factura.formaCobro,
            };

            await axios.post("http://localhost:8080/facturas", facturaData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            Swal.fire("Éxito", "Factura creada correctamente.", "success").then(() => {
                navigate("/facturas");
            });
        } catch (err) {
            Swal.fire("Error", err.response?.data?.message || "Hubo un problema al crear la factura.", "error");
        }
    };

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="container mt-4">
                <h2 className="text-center mb-4" style={{ borderBottom: "2px solid #a7c5eb", paddingBottom: "10px" }}>
                    Crear Nueva Factura
                </h2>

                {error && <div className="alert alert-danger text-center">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label">Empresa/Persona Física</label>
                            <select
                                className="form-control"
                                name="empresaPersonaFisicaId"
                                value={factura.empresaPersonaFisicaId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Selecciona una empresa/persona...</option>
                                {empresasPersonaFisica.map((empresa) => (
                                    <option key={empresa.id} value={empresa.id}>
                                        {empresa.nombre} ({empresa.tipo})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label">Fecha</label>
                            <input type="date" className="form-control" name="fecha" value={factura.fecha} onChange={handleChange} required />
                        </div>

                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label">Estado</label>
                            <input type="text" className="form-control" value="Enviada" disabled />
                        </div>

                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label">Forma de Pago</label>
                            <input type="text" className="form-control" value="No Cobrada" disabled />
                        </div>

                        <div className="col-12 mb-3">
                            <button type="submit" className="btn" style={{ backgroundColor: "#a7c5eb", width: "100%" }}>
                                Guardar Factura
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NuevaFacturaComponent;
