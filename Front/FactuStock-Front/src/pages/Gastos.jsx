import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import {FaSearch, FaPlusCircle, FaPencilAlt, FaSave, FaDownload, FaChevronLeft, FaChevronRight, FaEllipsisH} from "react-icons/fa";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import Select from "react-select";
import Home from "./Home.jsx";

const EstadoGasto = {
    RECIBIDO: "RECIBIDO",
    COMPLETADO: "COMPLETADO",
    ERROR: "ERROR"
};

const FormaPagoGasto = {
    EFECTIVO: "EFECTIVO",
    TARJETA: "TARJETA",
    TRANSFERENCIA: "TRANSFERENCIA",
    NO_PAGADA: "NO_PAGADA"
};
const GastosComponent = () => {
    const [gastos, setGastos] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [gastosPorPagina] = useState(9);
    const [searchQuery, setSearchQuery] = useState("");
    const [inputFocused, setInputFocused] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showNewGastoModal, setShowNewGastoModal] = useState(false);
    const [editingGasto, setEditingGasto] = useState(null);
    const [newGasto, setNewGasto] = useState({
        monto: "",
        numFactura: "",
        estado: EstadoGasto.RECIBIDO,
        formaPagoGasto: FormaPagoGasto.NO_PAGADA,
        categoriaGasto: null,
        empresaPersonaFisica: null,
        archivo: null,
        fecha: new Date().toISOString().split('T')[0] // Fecha actual por defecto
    });
    const [categorias, setCategorias] = useState([]);
    const [empresasPersonasFisicas, setEmpresasPersonasFisicas] = useState([]);
    const [organizacion, setOrganizacion] = useState(null);
    const token = localStorage.getItem("authToken");

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const fetchData = useCallback(async () => {
        if (!token) {
            setError("No se encontró un token de autenticación.");
            return;
        }

        try {
            const decodedToken = JSON.parse(atob(token.split(".")[1]));
            const userId = decodedToken?.idUsuario;

            if (!userId) {
                setError("ID de usuario no encontrado en el token.");
                return;
            }

            const userResponse = await axios.get(`http://localhost:8080/usuarios/${userId}`);
            setOrganizacion(userResponse.data.organizacion);

            const gastosResponse = await axios.get(
                `http://localhost:8080/gastos/organizacion/${userResponse.data.organizacion.id}`
            );

            if (gastosResponse.data && Array.isArray(gastosResponse.data)) {
                setGastos(gastosResponse.data);
            } else {
                setGastos([]);
            }

            const categoriasResponse = await axios.get(
                `http://localhost:8080/categoriasgasto/organizacion/${userResponse.data.organizacion.id}`
            );

            if (categoriasResponse.data && Array.isArray(categoriasResponse.data)) {
                setCategorias(categoriasResponse.data.map(cat => ({
                    value: cat.id,
                    label: cat.nombre
                })));
            } else {
                setCategorias([]);
            }

            const empresasResponse = await axios.get(
                `http://localhost:8080/EmpresaPersonaFisica/organizacion/${userResponse.data.organizacion.id}`
            );

            if (empresasResponse.data && Array.isArray(empresasResponse.data)) {
                setEmpresasPersonasFisicas(empresasResponse.data.map(emp => ({
                    value: emp.id,
                    label: emp.nombre
                })));
            } else {
                setEmpresasPersonasFisicas([]);
            }

        } catch (err) {
            console.error("Error al obtener los datos:", err.response ? err.response.data : err.message);
            setError("Error al obtener los datos. Por favor, intente de nuevo más tarde.");
        }
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
            case EstadoGasto.RECIBIDO:
                return <span style={getBadgeStyle('#FFA500', '#FFF3E0', '#FFA500')}>Recibido</span>;
            case EstadoGasto.COMPLETADO:
                return <span style={getBadgeStyle('#32CD32', '#E8F5E9', '#32CD32')}>Completado</span>;
            case EstadoGasto.ERROR:
                return <span style={getBadgeStyle('#FF0000', '#FFEBEE', '#FF0000')}>Error</span>;
            default:
                return null;
        }
    };

    const getFormaPagoBadge = (formaPagoGasto) => {
        switch (formaPagoGasto) {
            case FormaPagoGasto.EFECTIVO:
                return <span style={getBadgeStyle('#DAA520', '#FFFDE7', '#DAA520')}>Efectivo</span>;
            case FormaPagoGasto.TARJETA:
                return <span style={getBadgeStyle('#4169E1', '#E8EAF6', '#4169E1')}>Tarjeta</span>;
            case FormaPagoGasto.TRANSFERENCIA:
                return <span style={getBadgeStyle('#2E8B57', '#E0F2F1', '#2E8B57')}>Transferencia</span>;
            case FormaPagoGasto.NO_PAGADA:
                return <span style={getBadgeStyle('#FF0000', '#FFEBEE', '#FF0000')}>No Pagada</span>;
            default:
                return null;
        }
    };

    const handleEdit = (gasto) => {
        setEditingGasto({...gasto, tempEstado: gasto.estado, tempFormaPago: gasto.formaPagoGasto});
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingGasto(null);
    };

    const handleEstadoChange = (e) => {
        const newEstado = e.target.value;
        setEditingGasto(prev => ({
            ...prev,
            tempEstado: newEstado,
            tempFormaPago: newEstado === EstadoGasto.RECIBIDO ? FormaPagoGasto.NO_PAGADA : prev.tempFormaPago
        }));
    };

    const handleFormaPagoChange = (e) => {
        const newFormaPago = e.target.value;
        setEditingGasto(prev => ({
            ...prev,
            tempFormaPago: newFormaPago,
            tempEstado: newFormaPago === FormaPagoGasto.NO_PAGADA ? EstadoGasto.RECIBIDO : EstadoGasto.COMPLETADO
        }));
    };

    const handleSaveChanges = async () => {
        try {
            let updatedGasto = {
                ...editingGasto,
                estado: editingGasto.tempEstado,
                formaPagoGasto: editingGasto.tempFormaPago
            };

            await axios.put(`http://localhost:8080/gastos/${editingGasto.id}`, updatedGasto);

            setGastos(prev => prev.map(g => g.id === editingGasto.id ? updatedGasto : g));

            handleCloseEditModal();
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Gasto actualizado correctamente',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Error al actualizar el gasto:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un problema al actualizar el gasto.',
            });
        }
    };

    const handleNewGastoChange = (e) => {
        const { name, value, type, files } = e.target;
        setNewGasto(prev => {
            let updatedGasto = { ...prev };

            if (type === 'file') {
                updatedGasto.archivo = files[0];
            } else {
                updatedGasto[name] = value;
            }

            if (name === 'estado') {
                if (value === EstadoGasto.RECIBIDO) {
                    updatedGasto.formaPagoGasto = FormaPagoGasto.NO_PAGADA;
                } else if (value === EstadoGasto.COMPLETADO) {
                    updatedGasto.formaPagoGasto = FormaPagoGasto.EFECTIVO;
                } else if (value === EstadoGasto.ERROR) {
                    updatedGasto.formaPagoGasto = FormaPagoGasto.NO_PAGADA;
                }
            } else if (name === 'formaPagoGasto') {
                if (value === FormaPagoGasto.NO_PAGADA) {
                    updatedGasto.estado = EstadoGasto.RECIBIDO;
                } else {
                    updatedGasto.estado = EstadoGasto.COMPLETADO;
                }
            }

            return updatedGasto;
        });
    };

    const handleSelectChange = (selectedOption, actionMeta) => {
        setNewGasto(prev => ({
            ...prev,
            [actionMeta.name]: selectedOption
        }));
    };

    const handleSaveNewGasto = async () => {
        if (!newGasto.empresaPersonaFisica || !newGasto.formaPagoGasto) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Debes seleccionar una empresa o persona física y una forma de pago.',
            });
            return;
        }

        try {
            const formData = new FormData();
            formData.append('gasto', JSON.stringify({
                monto: parseFloat(newGasto.monto),
                numFactura: newGasto.numFactura,
                estado: newGasto.estado,
                formaPagoGasto: newGasto.formaPagoGasto,
                categoriaGasto: newGasto.categoriaGasto ? { id: newGasto.categoriaGasto.value } : null,
                empresaPersonaFisica: { id: newGasto.empresaPersonaFisica.value },
                organizacion: { id: organizacion.id },
                fecha: new Date(newGasto.fecha).toISOString()

            }));
            if (newGasto.archivo) {
                formData.append('archivo', newGasto.archivo);
            }

            const response = await axios.post(`http://localhost:8080/gastos`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setGastos(prev => [response.data, ...prev]);
            setShowNewGastoModal(false);
            setNewGasto({
                monto: "",
                numFactura: "",
                estado: EstadoGasto.RECIBIDO,
                formaPagoGasto: FormaPagoGasto.NO_PAGADA,
                categoriaGasto: null,
                empresaPersonaFisica: null,
                archivo: null,
                fecha: new Date().toISOString().split('T')[0]

            });

            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Nuevo gasto añadido correctamente',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Error al añadir nuevo gasto:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un problema al añadir el nuevo gasto.',
            });
        }
    };

    const handleDownload = async (gastoId) => {
        try {
            const response = await axios.get(`http://localhost:8080/gastos/${gastoId}/archivo`, {
                responseType: 'blob'
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `factura_${gastoId}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error al descargar el archivo:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un problema al descargar el archivo.',
            });
        }
    };

    const gastosFiltrados = gastos.filter(gasto => {
        const valoresGasto = [
            gasto.numFactura,
            gasto.categoriaGasto?.nombre,
            gasto.usuario?.username,
            gasto.monto?.toFixed(2),
            gasto.estado,
            gasto.formaPagoGasto,
            gasto.empresaPersonaFisica?.nombre
        ];

        return valoresGasto.some(valor =>
            valor?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    gastosFiltrados.sort((a, b) => b.id - a.id);

    const totalPages = Math.ceil(gastosFiltrados.length / gastosPorPagina);
    const indexOfLastGasto = currentPage * gastosPorPagina;
    const indexOfFirstGasto = indexOfLastGasto - gastosPorPagina;
    const gastosPaginados = gastosFiltrados.slice(indexOfFirstGasto, indexOfLastGasto);

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
                buttons.push(<span key="ellipsis1" className="pagination-ellipsis"><FaEllipsisH /></span>);
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
                buttons.push(<span key="ellipsis2" className="pagination-ellipsis"><FaEllipsisH /></span>);
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

            return buttons;
        };};

        return (
            <div className="d-flex">
                <Sidebar />
                <div className="container mt-4">
                    <h2 className="text-center mb-4" style={{ borderBottom: '2px solid #a7c5eb', paddingBottom: '10px' }}>
                        Registro de Gastos
                    </h2>

                    {error ? (
                        <div className="alert alert-danger text-center">{error}</div>
                    ) : (
                        <>
                            <div className="d-flex justify-content-between mb-3">
                                <button
                                    className="btn d-flex align-items-center"
                                    style={{ backgroundColor: "#6f9fd7", color: "#fff", borderRadius: "8px", padding: "8px 16px", border: "none" }}
                                    onClick={() => setShowNewGastoModal(true)}
                                >
                                    <FaPlusCircle className="me-2" />
                                    Añadir nuevo Gasto
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
                                        <th>Fecha</th>
                                        <th>Número de Factura</th>
                                        <th>Empresa/Persona</th>
                                        <th>Categoría</th>
                                        <th>Monto</th>
                                        <th>Estado</th>
                                        <th>Forma de Pago</th>
                                        <th>Acción</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {gastosPaginados.map((gasto, index) => (
                                        <tr key={gasto.id} style={{ backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff" }}>
                                            <td>{new Date(gasto.fecha).toLocaleDateString()}</td>
                                            <td>{gasto.numFactura}</td>
                                            <td>{gasto.empresaPersonaFisica?.nombre || 'N/A'}</td>
                                            <td>{gasto.categoriaGasto?.nombre || 'N/A'}</td>
                                            <td>{gasto.monto?.toFixed(2) || '0.00'}€</td>
                                            <td>{getEstadoBadge(gasto.estado)}</td>
                                            <td>{getFormaPagoBadge(gasto.formaPagoGasto)}</td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-primary me-2"
                                                    title="Editar Gasto"
                                                    onClick={() => handleEdit(gasto)}
                                                >
                                                    <FaPencilAlt />
                                                </button>
                                                {gasto.nombreArchivoFactura && (
                                                    <button
                                                        className="btn btn-sm btn-outline-success"
                                                        title="Descargar Factura"
                                                        onClick={() => handleDownload(gasto.id)}
                                                    >
                                                        <FaDownload />
                                                    </button>
                                                )}
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

                            {/* Modal para editar gasto */}
                            <Modal show={showEditModal} onHide={handleCloseEditModal} size="lg">
                                <Modal.Header closeButton style={{backgroundColor: '#f0f8ff'}}>
                                    <Modal.Title style={{color: '#2c3e50'}}>Editar Gasto</Modal.Title>
                                </Modal.Header>
                                <Modal.Body style={{backgroundColor: '#f9f9f9'}}>
                                    {editingGasto && (
                                        <Form>
                                            <Form.Group className="mb-3">
                                                <Form.Label style={{fontWeight: 'bold', color: '#34495e'}}>Estado</Form.Label>
                                                <Form.Control
                                                    as="select"
                                                    value={editingGasto.tempEstado}
                                                    onChange={handleEstadoChange}
                                                    style={{borderColor: '#bdc3c7', borderRadius: '8px'}}
                                                >
                                                    {Object.values(EstadoGasto).map(estado => (
                                                        <option key={estado} value={estado}>{estado}</option>
                                                    ))}
                                                </Form.Control>
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label style={{fontWeight: 'bold', color: '#34495e'}}>Forma de Pago</Form.Label>
                                                <Form.Control
                                                    as="select"
                                                    value={editingGasto.tempFormaPago}
                                                    onChange={handleFormaPagoChange}
                                                    style={{borderColor: '#bdc3c7', borderRadius: '8px'}}
                                                    disabled={!editingGasto.tempEstado}
                                                >
                                                    {editingGasto.tempEstado === EstadoGasto.RECIBIDO && (
                                                        <option value={FormaPagoGasto.NO_PAGADA}>No Pagada</option>
                                                    )}
                                                    {editingGasto.tempEstado === EstadoGasto.COMPLETADO && (
                                                        <>
                                                            <option value={FormaPagoGasto.EFECTIVO}>Efectivo</option>
                                                            <option value={FormaPagoGasto.TARJETA}>Tarjeta</option>
                                                            <option value={FormaPagoGasto.TRANSFERENCIA}>Transferencia</option>
                                                        </>
                                                    )}
                                                    {editingGasto.tempEstado === EstadoGasto.ERROR && (
                                                        <option value={FormaPagoGasto.NO_PAGADA}>No Pagada</option>
                                                    )}
                                                </Form.Control>
                                            </Form.Group>
                                        </Form>
                                    )}
                                </Modal.Body>
                                <Modal.Footer style={{backgroundColor: '#f0f8ff'}}>
                                    <Button variant="secondary" onClick={handleCloseEditModal}>
                                        Cerrar
                                    </Button>
                                    <Button variant="primary" onClick={handleSaveChanges}>
                                        Guardar Cambios
                                    </Button>
                                </Modal.Footer>
                            </Modal>

                            {/* Modal para nuevo gasto */}
                            <Modal show={showNewGastoModal} onHide={() => setShowNewGastoModal(false)} size="lg">
                                <Modal.Header closeButton style={{backgroundColor: '#a7c5eb', color: '#fff'}}>
                                    <Modal.Title>Nuevo Gasto</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form onSubmit={handleSaveNewGasto}>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Fecha</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        name="fecha"
                                                        value={newGasto.fecha}
                                                        onChange={handleNewGastoChange}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Monto</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        name="monto"
                                                        value={newGasto.monto}
                                                        onChange={handleNewGastoChange}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Número de Factura</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="numFactura"
                                                        value={newGasto.numFactura}
                                                        onChange={handleNewGastoChange}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Estado</Form.Label>
                                                    <Form.Control
                                                        as="select"
                                                        name="estado"
                                                        value={newGasto.estado}
                                                        onChange={handleNewGastoChange}
                                                    >
                                                        <option value="">Seleccione un estado</option>
                                                        {Object.values(EstadoGasto).map(estado => (
                                                            <option key={estado} value={estado}>{estado}</option>
                                                        ))}
                                                    </Form.Control>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Forma de Pago</Form.Label>
                                                    <Form.Control
                                                        as="select"
                                                        name="formaPagoGasto"
                                                        value={newGasto.formaPagoGasto}
                                                        onChange={handleNewGastoChange}
                                                        disabled={!newGasto.estado}
                                                    >
                                                        <option value="">Seleccione una forma de pago</option>
                                                        {newGasto.estado === EstadoGasto.RECIBIDO && (
                                                            <option value={FormaPagoGasto.NO_PAGADA}>No Pagada</option>
                                                        )}
                                                        {newGasto.estado === EstadoGasto.COMPLETADO && (
                                                            <>
                                                                <option value={FormaPagoGasto.EFECTIVO}>Efectivo</option>
                                                                <option value={FormaPagoGasto.TARJETA}>Tarjeta</option>
                                                                <option value={FormaPagoGasto.TRANSFERENCIA}>Transferencia</option>
                                                            </>
                                                        )}
                                                        {newGasto.estado === EstadoGasto.ERROR && (
                                                            <option value={FormaPagoGasto.NO_PAGADA}>No Pagada</option>
                                                        )}
                                                    </Form.Control>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Categoría</Form.Label>
                                                    <Select
                                                        options={categorias}
                                                        value={newGasto.categoriaGasto}
                                                        onChange={(selectedOption) => handleSelectChange(selectedOption, { name: "categoriaGasto" })}
                                                        placeholder="Seleccione una categoría"
                                                        isClearable
                                                        isSearchable
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Empresa o Persona Física</Form.Label>
                                                    <Select
                                                        options={empresasPersonasFisicas}
                                                        value={newGasto.empresaPersonaFisica}
                                                        onChange={(selectedOption) => handleSelectChange(selectedOption, { name: "empresaPersonaFisica" })}
                                                        placeholder="Seleccione una empresa o persona física"
                                                        isClearable
                                                        isSearchable
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Archivo de Factura</Form.Label>
                                                    <Form.Control
                                                        type="file"
                                                        onChange={handleNewGastoChange}
                                                        name="archivo"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Button type="submit" style={{ backgroundColor: '#a7c5eb', width: '100%', color: '#fff', border: 'none' }}>
                                            Guardar Gasto
                                        </Button>
                                    </Form>
                                    <Button variant="secondary" onClick={() => setShowNewGastoModal(false)} className="mt-3" style={{ width: '100%' }}>
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

    export default GastosComponent;
