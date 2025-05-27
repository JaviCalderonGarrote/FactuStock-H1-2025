import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { FaSearch, FaChevronLeft, FaChevronRight, FaEllipsisH } from "react-icons/fa";

const IngresosComponent = () => {
    const [ingresos, setIngresos] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [ingresosPorPagina] = useState(9);
    const [searchQuery, setSearchQuery] = useState("");
    const [inputFocused, setInputFocused] = useState(false);
    const [organizacion, setOrganizacion] = useState(null);
    const token = localStorage.getItem("authToken");

    const fetchData = useCallback(async () => {
        if (!token) {
            setError("No se encontró un token de autenticación. Por favor, inicie sesión nuevamente.");
            return;
        }

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

            setOrganizacion(userResponse.data.organizacion);

            const ingresosResponse = await axios.get(
                `http://localhost:8080/ingresos/organizacion/${userResponse.data.organizacion.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (ingresosResponse.data && Array.isArray(ingresosResponse.data)) {
                setIngresos(ingresosResponse.data);
            } else {
                setIngresos([]);
            }

        } catch (err) {
            console.error("Error al obtener los datos:", err);
            setError("Error al obtener los ingresos. Por favor, intente de nuevo más tarde.");
        }
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Función para ordenar los ingresos por ID descendente
    const ordenarIngresosPorIdDesc = (a, b) => b.id - a.id;

    const ingresosFiltrados = ingresos
        .sort(ordenarIngresosPorIdDesc) // Ordena los ingresos por ID descendente
        .filter(ingreso => {
            const valoresIngreso = [
                ingreso.id?.toString(),
                ingreso.monto?.toFixed(2),
                ingreso.fecha?.toString(),
                ingreso.caja?.nombre,
                ingreso.factura?.numeroFactura,
            ];

            return valoresIngreso.some(valor =>
                valor?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        });

    const indexOfLastIngreso = currentPage * ingresosPorPagina;
    const indexOfFirstIngreso = indexOfLastIngreso - ingresosPorPagina;
    const ingresosPaginados = ingresosFiltrados.slice(indexOfFirstIngreso, indexOfLastIngreso);

    const totalPages = Math.ceil(ingresosFiltrados.length / ingresosPorPagina);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const renderPaginationButtons = () => {
        const buttons = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                buttons.push(
                    <button
                        key={i}
                        onClick={() => paginate(i)}
                        className={`pagination-button ${currentPage === i ? 'active' : ''}`}
                    >
                        {i}
                    </button>
                );
            }
        } else {
            buttons.push(
                <button
                    key={1}
                    onClick={() => paginate(1)}
                    className={`pagination-button ${currentPage === 1 ? 'active' : ''}`}
                >
                    1
                </button>
            );
            buttons.push(
                <button
                    key={2}
                    onClick={() => paginate(2)}
                    className={`pagination-button ${currentPage === 2 ? 'active' : ''}`}
                >
                    2
                </button>
            );

            if (currentPage > 3) {
                buttons.push(
                    <span
                        key="ellipsis1"
                        className="pagination-ellipsis"
                        aria-label="ellipsis"
                    >
                        <FaEllipsisH />
                    </span>
                );
            }

            if (currentPage !== 1 && currentPage !== 2 && currentPage !== totalPages) {
                buttons.push(
                    <button
                        key={currentPage}
                        onClick={() => paginate(currentPage)}
                        className="pagination-button active"
                    >
                        {currentPage}
                    </button>
                );
            }

            if (currentPage < totalPages - 2) {
                buttons.push(
                    <span
                        key="ellipsis2"
                        className="pagination-ellipsis"
                        aria-label="ellipsis"
                    >
                        <FaEllipsisH />
                    </span>
                );
            }

            buttons.push(
                <button
                    key={totalPages}
                    onClick={() => paginate(totalPages)}
                    className={`pagination-button ${currentPage === totalPages ? 'active' : ''}`}
                >
                    {totalPages}
                </button>
            );
        }
        return buttons;
    };

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="container mt-4">
                <h2 className="text-center mb-4" style={{ borderBottom: '2px solid #a7c5eb', paddingBottom: '10px' }}>
                    Registro de Ingresos
                </h2>

                {error && <div className="alert alert-danger text-center">{error}</div>}

                <div className="d-flex justify-content-end mb-3">
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
                            <th>ID</th>
                            <th>Monto</th>
                            <th>Fecha</th>
                            <th>Origen</th>
                        </tr>
                        </thead>
                        <tbody>
                        {ingresosPaginados.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center">No hay ingresos disponibles.</td>
                            </tr>
                        ) : (
                            ingresosPaginados.map((ingreso, index) => (
                                <tr key={ingreso.id} style={{ backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff" }}>
                                    <td>{ingreso.id}</td>
                                    <td>{ingreso.monto?.toFixed(2) || '0.00'}€</td>
                                    <td>{new Date(ingreso.fecha).toLocaleString()}</td>
                                    <td>{ingreso.caja ? ingreso.caja.nombre : ingreso.factura?.numeroFactura}</td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <nav aria-label="Page navigation" className="mt-4">
                        <ul className="pagination justify-content-center">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    style={{
                                        backgroundColor: 'transparent',
                                        color: '#6f9fd7',
                                        border: 'none'
                                    }}
                                >
                                    <FaChevronLeft />
                                </button>
                            </li>
                            {renderPaginationButtons()}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        backgroundColor: 'transparent',
                                        color: '#6f9fd7',
                                        border: 'none'
                                    }}
                                >
                                    <FaChevronRight />
                                </button>
                            </li>
                        </ul>
                    </nav>
                )}
            </div>
        </div>
    );
};

export default IngresosComponent;
