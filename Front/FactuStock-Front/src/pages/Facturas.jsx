import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaPlusCircle } from "react-icons/fa";

const FacturaComponent = () => {
    const [facturas, setFacturas] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [facturasPorPagina] = useState(9);
    const [searchQuery, setSearchQuery] = useState("");
    const token = localStorage.getItem("authToken");
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setError("No se encontró un token de autenticación.");
            return;
        }
        const fetchData = async () => {
            try {
                const response = await axios.get("http://localhost:8080/facturas", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data && Array.isArray(response.data)) {
                    setFacturas(response.data);
                } else {
                    setError("No se encontraron facturas.");
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
                        <div className="d-flex justify-content-between mb-3">
                            <button
                                className="btn d-flex align-items-center"
                                style={{ backgroundColor: '#a7c5eb', marginBottom: '20px' }}
                                onClick={() => navigate("/nueva-factura")}
                            >
                                <FaPlusCircle className="me-2" />
                                Crear Nueva Factura
                            </button>

                            <div className="position-relative" style={{ maxWidth: "400px" }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar en todas las columnas..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        paddingLeft: "35px",
                                        borderRadius: "5px",
                                        backgroundColor: '#a7c5eb',
                                        boxShadow: "0px 0px 8px rgba(0,0,0,0.1)",
                                        transition: "border-color 0.3s ease-in-out"
                                    }}
                                />
                                <FaSearch
                                    className="position-absolute"
                                    style={{
                                        left: "10px",
                                        top: "35%",
                                        transform: "translateY(-50%)",
                                        color: "black",
                                        fontSize: "20px"
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
