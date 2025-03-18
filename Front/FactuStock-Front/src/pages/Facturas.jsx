import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom"; // Ya lo tienes importado
import { FaSearch, FaPlusCircle } from "react-icons/fa";

const FacturaComponent = () => {
    const [facturas, setFacturas] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [facturasPorPagina] = useState(9);
    const [searchQuery, setSearchQuery] = useState("");
    const [organizacion, setOrganizacion] = useState(null);
    const [inputFocused, setInputFocused] = useState(false); // Estado para el enfoque del input
    const token = localStorage.getItem("authToken");
    const navigate = useNavigate();  // Esto te permite navegar programáticamente

    useEffect(() => {
        if (!token) {
            setError("No se encontró un token de autenticación.");
            return;
        }
        const fetchData = async () => {
            try {
                // Obtener el ID de usuario del token
                const decodedToken = JSON.parse(atob(token.split(".")[1]));
                const userId = decodedToken?.idUsuario;

                if (!userId) {
                    setError("ID de usuario no encontrado en el token.");
                    return;
                }

                // Obtener información del usuario
                const userResponse = await axios.get(`http://localhost:8080/usuarios/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setOrganizacion(userResponse.data.organizacion);

                // Obtener las facturas de la organización
                const facturasResponse = await axios.get(`http://localhost:8080/facturas/organizacion/${userResponse.data.organizacion.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (facturasResponse.data && Array.isArray(facturasResponse.data)) {
                    setFacturas(facturasResponse.data);
                } else {
                    setError("No se encontraron facturas para esta organización.");
                }

            } catch (err) {
                setError("Error al obtener las facturas.");
                console.error(err);
            }
        };
        fetchData();
    }, [token]);

    // Función para filtrar facturas
    const facturasFiltradas = facturas.filter(factura => {
        // Crear un array de valores a partir de todos los campos relevantes de la factura
        const valoresFactura = [
            factura.numeroFactura,                            // Número de factura
            factura.empresaPersonaFisica?.nombre,             // Nombre del cliente
            factura.usuario?.username,                        // Nombre del usuario
            factura.formaPago,                                // Forma de pago
            factura.fecha ? new Date(factura.fecha).toLocaleDateString() : "", // Fecha
            factura.total?.toFixed(2),                        // Total
            factura.estado                                    // Estado
        ];

        // Verificar si alguna de las propiedades contiene el término de búsqueda (ignorando mayúsculas/minúsculas)
        return valoresFactura.some(valor =>
            valor?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    const totalPages = Math.ceil(facturasFiltradas.length / facturasPorPagina);
    const facturasPaginadas = facturasFiltradas.slice(
        (currentPage - 1) * facturasPorPagina,
        currentPage * facturasPorPagina
    );

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="container mt-4">
                <h2 className="text-center mb-4" style={{ borderBottom: '2px solid #a7c5eb', paddingBottom: '10px' }}>Facturas Emitidas</h2>

                {error ? (
                    <div className="alert alert-danger text-center">{error}</div>
                ) : (
                    <>
                        {/* Botón para crear nueva factura */}
                        <div className="d-flex justify-content-between mb-3">
                            <button
                                className="btn d-flex align-items-center"
                                style={{ backgroundColor: "#6f9fd7", color: "#fff", borderRadius: "8px", padding: "8px 16px", border: "none" }}
                                onClick={() => navigate('/nueva-factura')}  // Redirigir al usuario a /nueva-factura
                            >
                                <FaPlusCircle className="me-2" />
                                Crear nueva Factura
                            </button>

                            {/* Campo de búsqueda */}
                            <div className="position-relative" style={{ width: "250px" }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setInputFocused(true)} // Cambiar estado a true cuando el input esté enfocado
                                    onBlur={() => setInputFocused(false)} // Cambiar estado a false cuando el input pierda el foco
                                    style={{
                                        paddingLeft: "35px",
                                        borderRadius: "8px",
                                        border: "1px solid #ccc",
                                        backgroundColor: inputFocused || searchQuery ? "#ffffff" : "#6f9fd7",
                                        color: inputFocused || searchQuery ? "#000" : "#fff",
                                    }}
                                />
                                <FaSearch
                                    className="position-absolute"
                                    style={{
                                        left: "10px",
                                        top: "25%",
                                        color: inputFocused || searchQuery ? "#6f9fd7" : "#fff",
                                        fontSize: "18px"
                                    }}
                                />
                            </div>
                        </div>

                        {/* Tabla de Facturas */}
                        <div className="table-responsive">
                            <table className="table">
                                <thead className="table-dark" style={{ backgroundColor: '#a7c5eb' }}>
                                <tr>
                                    <th>Número</th>
                                    <th>Cliente</th>
                                    <th>Usuario</th>
                                    <th>Forma de Pago</th>
                                    <th>Fecha</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                </tr>
                                </thead>
                                <tbody>
                                {facturasPaginadas.map((factura, index) => (
                                    <tr key={factura.id} style={{ backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff" }}>
                                        <td>{factura.numeroFactura}</td>
                                        <td>{factura.empresaPersonaFisica?.nombre || 'N/A'}</td>
                                        <td>{factura.usuario?.username || 'N/A'}</td>
                                        <td>{factura.formaPago || 'N/A'}</td>
                                        <td>{factura.fecha ? new Date(factura.fecha).toLocaleDateString() : 'N/A'}</td>
                                        <td>${factura.total?.toFixed(2) || '0.00'}</td>
                                        <td>{factura.estado}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        {totalPages > 1 && (
                            <nav aria-label="Page navigation">
                                <ul className="pagination justify-content-center">
                                    {[...Array(totalPages).keys()].map((i) => (
                                        <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                            <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default FacturaComponent;
