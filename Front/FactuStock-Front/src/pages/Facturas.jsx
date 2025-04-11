import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaPlusCircle, FaDownload } from "react-icons/fa";
import { generarFacturaPDF } from "../utils/generarFacturaPDF.js";

const FacturaComponent = () => {
    const [facturas, setFacturas] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [facturasPorPagina] = useState(9);
    const [searchQuery, setSearchQuery] = useState("");
    const [inputFocused, setInputFocused] = useState(false);
    const token = localStorage.getItem("authToken");
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setError("No se encontró un token de autenticación.");
            return;
        }

        const fetchData = async () => {
            try {
                const decodedToken = JSON.parse(atob(token.split(".")[1]));
                const userId = decodedToken?.idUsuario;

                if (!userId) {
                    setError("ID de usuario no encontrado en el token.");
                    return;
                }

                const userResponse = await axios.get(`http://localhost:8080/usuarios/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const facturasResponse = await axios.get(
                    `http://localhost:8080/facturas/organizacion/${userResponse.data.organizacion.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (facturasResponse.data && Array.isArray(facturasResponse.data)) {
                    setFacturas(facturasResponse.data);
                } else {
                    setFacturas([]);
                }

            } catch (err) {
                setError("Error al obtener las facturas.");
                console.error(err);
            }
        };

        fetchData();
    }, [token]);

    const handleDownload = async (facturaId) => {
        try {
            const response = await axios.get(`http://localhost:8080/facturas/${facturaId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data) {
                generarFacturaPDF(response.data);
            } else {
                Swal.fire("Error", "No se pudo obtener la factura.", "error");
            }
        } catch (error) {
            console.error("Error al descargar la factura:", error);
            Swal.fire("Error", "Ocurrió un problema al generar el PDF.", "error");
        }
    };

    const facturasFiltradas = facturas.filter(factura => {
        const valoresFactura = [
            factura.numeroFactura,
            factura.empresaPersonaFisica?.nombre,
            factura.usuario?.username,
            factura.formaPago,
            factura.fecha ? new Date(factura.fecha).toLocaleDateString() : "",
            factura.total?.toFixed(2),
            factura.estado
        ];

        return valoresFactura.some(valor =>
            valor?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    facturasFiltradas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    const totalPages = Math.ceil(facturasFiltradas.length / facturasPorPagina);
    const facturasPaginadas = facturasFiltradas.slice(
        (currentPage - 1) * facturasPorPagina,
        currentPage * facturasPorPagina
    );

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="container mt-4">
                <h2 className="text-center mb-4" style={{ borderBottom: '2px solid #a7c5eb', paddingBottom: '10px' }}>
                    Facturas Emitidas
                </h2>

                {error ? (
                    <div className="alert alert-danger text-center">{error}</div>
                ) : (
                    <>
                        <div className="d-flex justify-content-between mb-3">
                            <button
                                className="btn d-flex align-items-center"
                                style={{ backgroundColor: "#6f9fd7", color: "#fff", borderRadius: "8px", padding: "8px 16px", border: "none" }}
                                onClick={() => navigate('/nueva-factura')}
                            >
                                <FaPlusCircle className="me-2" />
                                Crear nueva Factura
                            </button>

                            <div className="position-relative" style={{ width: "250px" }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setInputFocused(true)}
                                    onBlur={() => setInputFocused(false)}
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
                                    <th>Acción</th>
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
                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                title="Descargar PDF"
                                                onClick={() => handleDownload(factura.id)}
                                            >
                                                <FaDownload />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

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
