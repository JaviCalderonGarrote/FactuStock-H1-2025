import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaPlusCircle, FaLock, FaChevronLeft, FaChevronRight, FaEllipsisH } from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap";

const EstadoCaja = {
    ABIERTA: "ABIERTA",
    CERRADA: "CERRADA"
};

const CajaComponent = () => {
    const [cajas, setCajas] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [cajasPorPagina] = useState(9);
    const [searchQuery, setSearchQuery] = useState("");
    const [inputFocused, setInputFocused] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [nuevaCaja, setNuevaCaja] = useState({ nombre: "" });
    const [organizacion, setOrganizacion] = useState(null);
    const [usuario, setUsuario] = useState(null);
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

                setUsuario(userResponse.data);
                setOrganizacion(userResponse.data.organizacion);

                const cajasResponse = await axios.get(
                    `http://localhost:8080/cajas/organizacion/${userResponse.data.organizacion.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setCajas(cajasResponse.data);
            } catch (err) {
                setError("Error al obtener las cajas.");
                console.error(err);
            }
        };

        fetchData();
    }, [token]);

    const handleCrearCaja = () => {
        const cajaAbierta = cajas.find(caja => caja.estado === EstadoCaja.ABIERTA);
        if (cajaAbierta) {
            Swal.fire({
                title: '¿Cerrar caja actual?',
                text: "Hay una caja abierta. Se cerrará automáticamente al crear una nueva.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, crear nueva caja',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    setShowModal(true);
                }
            });
        } else {
            setShowModal(true);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setNuevaCaja({ nombre: "" });
    };

    const handleSaveNuevaCaja = async () => {
        try {
            const cajaAbierta = cajas.find(caja => caja.estado === EstadoCaja.ABIERTA);

            if (cajaAbierta) {
                await axios.put(`http://localhost:8080/cajas/${cajaAbierta.id}/cerrar`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            const nuevaCajaData = {
                nombre: nuevaCaja.nombre || `Caja ${new Date().toLocaleString()}`,
                fechaInicio: new Date().toISOString(),
                estado: EstadoCaja.ABIERTA,
                totalIngresado: 0,
                cantidadVentas: 0,
                organizacion: { id: organizacion.id }
            };

            const response = await axios.post('http://localhost:8080/cajas', nuevaCajaData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setCajas(prevCajas => [
                ...prevCajas.map(caja =>
                    caja.id === cajaAbierta?.id ? {...caja, estado: EstadoCaja.CERRADA, fechaFin: new Date().toISOString()} : caja
                ),
                response.data
            ]);

            handleCloseModal();
            Swal.fire('Éxito', 'Nueva caja creada correctamente', 'success');
        } catch (error) {
            console.error("Error al crear la caja:", error);
            Swal.fire('Error', 'No se pudo crear la caja: ' + error.message, 'error');
        }
    };

    const handleCerrarCaja = async (cajaId) => {
        try {
            const cajaToClose = cajas.find(caja => caja.id === cajaId);
            if (!cajaToClose || cajaToClose.estado === EstadoCaja.CERRADA) {
                Swal.fire('Error', 'Esta caja ya está cerrada o no existe', 'error');
                return;
            }

            const result = await Swal.fire({
                title: '¿Cerrar caja?',
                text: "¿Estás seguro de que quieres cerrar esta caja?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, cerrar caja',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                const response = await axios.put(`http://localhost:8080/cajas/${cajaId}/cerrar`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.status === 200) {
                    setCajas(prevCajas => prevCajas.map(caja =>
                        caja.id === cajaId ? { ...caja, estado: EstadoCaja.CERRADA, fechaFin: new Date().toISOString() } : caja
                    ));

                    Swal.fire('Éxito', 'Caja cerrada correctamente', 'success');
                } else {
                    throw new Error('La respuesta del servidor no fue exitosa');
                }
            }
        } catch (error) {
            console.error("Error al cerrar la caja:", error);
            if (error.response && error.response.status === 403) {
                Swal.fire('Error', 'No tienes permiso para cerrar esta caja', 'error');
            } else {
                Swal.fire('Error', 'No se pudo cerrar la caja: ' + error.message, 'error');
            }
        }
    };

    const getBadgeStyle = (borderColor, backgroundColor, textColor) => ({
        padding: '6px 12px',
        borderRadius: '4px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontSize: '0.75em',
        display: 'inline-block',
        width: '120px',
        textAlign: 'center',
        color: textColor,
        backgroundColor: backgroundColor,
        border: `2px solid ${borderColor}`,
    });

    const getEstadoBadge = (estado) => {
        switch (estado) {
            case EstadoCaja.ABIERTA:
                return <span style={getBadgeStyle('#32CD32', '#E8F5E9', '#32CD32')}>Abierta</span>;
            case EstadoCaja.CERRADA:
                return <span style={getBadgeStyle('#FF0000', '#FFEBEE', '#FF0000')}>Cerrada</span>;
            default:
                return null;
        }
    };

    const cajasFiltradas = cajas.filter(caja => {
        const valoresCaja = [
            caja.nombre,
            caja.fechaInicio ? new Date(caja.fechaInicio).toLocaleDateString() : "",
            caja.fechaFin ? new Date(caja.fechaFin).toLocaleDateString() : "",
            caja.totalIngresado?.toFixed(2),
            caja.cantidadVentas?.toString(),
            caja.estado
        ];

        return valoresCaja.some(valor =>
            valor?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    cajasFiltradas.sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio));

    const totalPages = Math.ceil(cajasFiltradas.length / cajasPorPagina);
    const indexOfLastCaja = currentPage * cajasPorPagina;
    const indexOfFirstCaja = indexOfLastCaja - cajasPorPagina;
    const cajasPaginadas = cajasFiltradas.slice(indexOfFirstCaja, indexOfLastCaja);

    const renderPaginationButtons = () => {
        const buttons = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                buttons.push(
                    <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
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
                    onClick={() => setCurrentPage(1)}
                    className={`pagination-button ${currentPage === 1 ? 'active' : ''}`}
                >
                    1
                </button>
            );
            buttons.push(
                <button
                    key={2}
                    onClick={() => setCurrentPage(2)}
                    className={`pagination-button ${currentPage === 2 ? 'active' : ''}`}
                >
                    2
                </button>
            );

            if (currentPage > 3) {
                buttons.push(<span key="ellipsis1" className="pagination-ellipsis"><FaEllipsisH /></span>);
            }

            if (currentPage !== 1 && currentPage !== 2 && currentPage !== totalPages) {
                buttons.push(
                    <button
                        key={currentPage}
                        onClick={() => setCurrentPage(currentPage)}
                        className="pagination-button active"
                    >
                        {currentPage}
                    </button>
                );
            }

            if (currentPage < totalPages - 2) {
                buttons.push(<span key="ellipsis2" className="pagination-ellipsis"><FaEllipsisH /></span>);
            }

            buttons.push(
                <button
                    key={totalPages}
                    onClick={() => setCurrentPage(totalPages)}
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
                    Gestión de Cajas
                </h2>

                {error ? (
                    <div className="alert alert-danger text-center">{error}</div>
                ) : (
                    <>
                        <div className="d-flex justify-content-between mb-3">
                            <button
                                className="btn d-flex align-items-center"
                                style={{ backgroundColor: "#6f9fd7", color: "#fff", borderRadius: "8px", padding: "8px 16px", border: "none" }}
                                onClick={handleCrearCaja}
                            >
                                <FaPlusCircle className="me-2" />
                                Crear nueva Caja
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
                            {cajasPaginadas.length === 0 ? (
                                <table className="table">
                                    <thead className="table-dark" style={{ backgroundColor: '#a7c5eb' }}>
                                    <tr>
                                        <th colSpan="7" className="text-center">No hay cajas disponibles</th>
                                    </tr>
                                    </thead>
                                </table>
                            ) : (
                                <table className="table table-hover">
                                    <thead className="table-dark" style={{ backgroundColor: '#a7c5eb' }}>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Fecha Inicio</th>
                                        <th>Fecha Fin</th>
                                        <th>Total Ingresado</th>
                                        <th>Cantidad Ventas</th>
                                        <th>Estado</th>
                                        <th>Acción</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {cajasPaginadas.map((caja, index) => (
                                        <tr key={caja.id} style={{ backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff" }}>
                                            <td>{caja.nombre || 'N/A'}</td>
                                            <td>{caja.fechaInicio ? new Date(caja.fechaInicio).toLocaleDateString() : 'N/A'}</td>
                                            <td>{caja.fechaFin ? new Date(caja.fechaFin).toLocaleDateString() : 'N/A'}</td>
                                            <td>{caja.totalIngresado?.toFixed(2) || '0.00'}€</td>
                                            <td>{caja.cantidadVentas || 0}</td>
                                            <td>{getEstadoBadge(caja.estado)}</td>
                                            <td>
                                                {caja.estado === EstadoCaja.ABIERTA && (
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleCerrarCaja(caja.id)}
                                                        title="Cerrar Caja"
                                                    >
                                                        <FaLock />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {totalPages > 1 && (
                            <nav aria-label="Page navigation" className="mt-4">
                                <ul className="pagination justify-content-center">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setCurrentPage(currentPage - 1)}
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
                                            onClick={() => setCurrentPage(currentPage + 1)}
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

                        <Modal show={showModal} onHide={handleCloseModal}>
                            <Modal.Header closeButton style={{backgroundColor: '#a7c5eb', color: '#fff'}}>
                                <Modal.Title>Crear Nueva Caja</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form onSubmit={(e) => { e.preventDefault(); handleSaveNuevaCaja(); }}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nombre de la Caja (Opcional)</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={nuevaCaja.nombre}
                                            onChange={(e) => setNuevaCaja({...nuevaCaja, nombre: e.target.value})}
                                            placeholder="Dejar en blanco para nombre automático"
                                        />
                                    </Form.Group>
                                    <Button type="submit" style={{ backgroundColor: '#a7c5eb', width: '100%', color: '#fff', border: 'none' }}>
                                        Crear Caja
                                    </Button>
                                </Form>
                                <Button
                                    variant="secondary"
                                    onClick={handleCloseModal}
                                    className="mt-3"
                                    style={{ width: '100%' }}
                                >
                                    Cerrar
                                </Button>
                            </Modal.Body>
                        </Modal>
                    </>
                )}
            </div>
        </div>
    );
};

export default CajaComponent;
