import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaPlusCircle, FaFileDownload, FaPencilAlt, FaChevronLeft, FaChevronRight, FaEllipsisH } from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap";

const EstadoFactura = {
    ENVIADA: "ENVIADA",
    RECIBIDA: "RECIBIDA",
    ERROR: "ERROR",
    COMPLETADA: "COMPLETADA"
};

const FormaPago = {
    NoCobrada: "NoCobrada",
    EFECTIVO: "EFECTIVO",
    TARJETA: "TARJETA",
    TRANSFERENCIA: "TRANSFERENCIA"
};

const FacturaComponent = () => {
    const [facturas, setFacturas] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [facturasPorPagina] = useState(9);
    const [searchQuery, setSearchQuery] = useState("");
    const [inputFocused, setInputFocused] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingFactura, setEditingFactura] = useState(null);
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
            const response = await axios.get(`http://localhost:8080/facturas/${facturaId}/pdf`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `Factura_${facturaId}.pdf`;
            link.click();
            window.URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error("Error al descargar la factura:", error);
            Swal.fire("Error", "Ocurrió un problema al descargar el PDF.", "error");
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
            case EstadoFactura.ENVIADA:
                return <span style={getBadgeStyle('#FFA500', '#FFF3E0', '#FFA500')}>Enviada</span>;
            case EstadoFactura.RECIBIDA:
                return <span style={getBadgeStyle('#4682B4', '#E3F2FD', '#4682B4')}>Recibida</span>;
            case EstadoFactura.ERROR:
                return <span style={getBadgeStyle('#FF0000', '#FFEBEE', '#FF0000')}>Error</span>;
            case EstadoFactura.COMPLETADA:
                return <span style={getBadgeStyle('#32CD32', '#E8F5E9', '#32CD32')}>Completada</span>;
            default:
                return null;
        }
    };

    const getFormaPagoBadge = (formaPago) => {
        switch (formaPago) {
            case FormaPago.NoCobrada:
                return <span style={getBadgeStyle('#FF6347', '#FFF0F0', '#FF6347')}>No Cobrada</span>;
            case FormaPago.EFECTIVO:
                return <span style={getBadgeStyle('#DAA520', '#FFFDE7', '#DAA520')}>Efectivo</span>;
            case FormaPago.TARJETA:
                return <span style={getBadgeStyle('#4169E1', '#E8EAF6', '#4169E1')}>Tarjeta</span>;
            case FormaPago.TRANSFERENCIA:
                return <span style={getBadgeStyle('#2E8B57', '#E0F2F1', '#2E8B57')}>Transferencia</span>;
            default:
                return null;
        }
    };

    const handleEdit = (factura) => {
        setEditingFactura({...factura, tempEstado: factura.estado, tempFormaPago: factura.formaPago});
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingFactura(null);
    };

    const handleEstadoChange = (e) => {
        const newEstado = e.target.value;
        let newFormaPago = editingFactura.tempFormaPago;

        if (newEstado === EstadoFactura.ERROR) {
            newFormaPago = FormaPago.NoCobrada;
        } else if (newEstado === EstadoFactura.COMPLETADA) {
            newFormaPago = [FormaPago.EFECTIVO, FormaPago.TARJETA, FormaPago.TRANSFERENCIA].includes(newFormaPago)
                ? newFormaPago
                : FormaPago.EFECTIVO;
        } else if (newEstado === EstadoFactura.ENVIADA) {
            newFormaPago = FormaPago.NoCobrada;
        } else if (newEstado === EstadoFactura.RECIBIDA) {
            newFormaPago = newFormaPago === FormaPago.NoCobrada ? newFormaPago : FormaPago.EFECTIVO;
        }

        setEditingFactura(prev => ({
            ...prev,
            tempEstado: newEstado,
            tempFormaPago: newFormaPago
        }));
    };

    const handleFormaPagoChange = (e) => {
        const newFormaPago = e.target.value;
        setEditingFactura(prev => ({
            ...prev,
            tempFormaPago: newFormaPago
        }));
    };

    const getFormasPagoDisponibles = (estado) => {
        switch (estado) {
            case EstadoFactura.COMPLETADA:
                return [FormaPago.EFECTIVO, FormaPago.TARJETA, FormaPago.TRANSFERENCIA];
            case EstadoFactura.ERROR:
                return [FormaPago.NoCobrada];
            case EstadoFactura.RECIBIDA:
                return [FormaPago.NoCobrada, FormaPago.EFECTIVO, FormaPago.TARJETA, FormaPago.TRANSFERENCIA];
            case EstadoFactura.ENVIADA:
                return [FormaPago.NoCobrada];
            default:
                return Object.values(FormaPago);
        }
    };

    const handleSaveChanges = async () => {
        try {
            const updatedFactura = {
                ...editingFactura,
                estado: editingFactura.tempEstado,
                formaPago: editingFactura.tempFormaPago
            };

            if (!Object.values(EstadoFactura).includes(updatedFactura.estado)) {
                Swal.fire("Error", "Estado de factura no válido", "error");
                return;
            }

            if (!Object.values(FormaPago).includes(updatedFactura.formaPago)) {
                Swal.fire("Error", "Forma de pago no válida", "error");
                return;
            }

            // Validación adicional
            if (updatedFactura.estado === EstadoFactura.ERROR && updatedFactura.formaPago !== FormaPago.NoCobrada) {
                Swal.fire("Error", "Cuando el estado es ERROR, la forma de pago debe ser NoCobrada", "error");
                return;
            }

            if (updatedFactura.estado === EstadoFactura.ENVIADA && updatedFactura.formaPago !== FormaPago.NoCobrada) {
                Swal.fire("Error", "Cuando el estado es ENVIADA, la forma de pago debe ser NoCobrada", "error");
                return;
            }

            if (updatedFactura.estado === EstadoFactura.COMPLETADA && updatedFactura.formaPago === FormaPago.NoCobrada) {
                Swal.fire("Error", "Cuando el estado es COMPLETADA, la forma de pago no puede ser NoCobrada", "error");
                return;
            }

            await axios.put(`http://localhost:8080/facturas/${editingFactura.id}`, updatedFactura, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const updatedFacturas = facturas.map(f =>
                f.id === editingFactura.id ? updatedFactura : f
            );
            setFacturas(updatedFacturas);

            handleCloseModal();
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Factura actualizada correctamente',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Error al actualizar la factura:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un problema al actualizar la factura.',
            });
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
                            <table className="table table-hover">
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
                                        <td>{getFormaPagoBadge(factura.formaPago)}</td>
                                        <td>{factura.fecha ? new Date(factura.fecha).toLocaleDateString() : 'N/A'}</td>
                                        <td>{factura.total?.toFixed(2) || '0.00'}€</td>
                                        <td>{getEstadoBadge(factura.estado)}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline-primary me-2"
                                                title="Editar Factura"
                                                onClick={() => handleEdit(factura)}
                                            >
                                                <FaPencilAlt />
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-secondary"
                                                title="Descargar PDF"
                                                onClick={() => handleDownload(factura.id)}
                                            >
                                                <FaFileDownload />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
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
                            <Modal.Header closeButton style={{backgroundColor: '#f0f8ff'}}>
                                <Modal.Title style={{color: '#2c3e50'}}>Editar Factura</Modal.Title>
                            </Modal.Header>
                            <Modal.Body style={{backgroundColor: '#f9f9f9'}}>
                                {editingFactura && (
                                    <Form>
                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="estado" style={{fontWeight: 'bold', color: '#34495e'}}>Estado</Form.Label>
                                            <Form.Control
                                                id="estado"
                                                as="select"
                                                value={editingFactura.tempEstado}
                                                onChange={handleEstadoChange}
                                                style={{borderColor: '#bdc3c7', borderRadius: '8px'}}
                                            >
                                                {Object.values(EstadoFactura).map(estado => (
                                                    <option key={estado} value={estado}>{estado}</option>
                                                ))}
                                            </Form.Control>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="formaPago" style={{fontWeight: 'bold', color: '#34495e'}}>Forma de Pago</Form.Label>
                                            <Form.Control
                                                id="formaPago"
                                                as="select"
                                                value={editingFactura.tempFormaPago}
                                                onChange={handleFormaPagoChange}
                                                style={{borderColor: '#bdc3c7', borderRadius: '8px'}}
                                                disabled={editingFactura.tempEstado === EstadoFactura.ERROR}
                                            >
                                                {getFormasPagoDisponibles(editingFactura.tempEstado).map(formaPago => (
                                                    <option key={formaPago} value={formaPago}>{formaPago}</option>
                                                ))}
                                            </Form.Control>
                                        </Form.Group>
                                    </Form>
                                )}
                            </Modal.Body>
                            <Modal.Footer style={{backgroundColor: '#f0f8ff'}}>
                                <Button variant="secondary" onClick={handleCloseModal}>
                                    Cerrar
                                </Button>
                                <Button variant="primary" onClick={handleSaveChanges}>
                                    Guardar Cambios
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </>
                )}
            </div>
        </div>
    );
};

export default FacturaComponent;
