import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import { FaPlusCircle, FaSearch, FaChevronLeft, FaChevronRight, FaEllipsisH } from "react-icons/fa";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Error ocurrió: ", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <h1 className="text-danger text-center">Algo salió mal al cargar las empresas.</h1>;
        }
        return this.props.children;
    }
}

const EmpresaPersonaFisicaComponent = () => {
    const [empresaPersonaFisica, setEmpresaPersonaFisica] = useState([]);
    const [error, setError] = useState(null);
    const [nuevaEmpresaPersonaFisica, setNuevaEmpresaPersonaFisica] = useState({
        id: null,
        nombre: "",
        nifCif: "",
        telefono: "",
        direccion: "",
        web: "",
        mail: "",
        tipo: "CLIENTE"
    });
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [empresasPorPagina] = useState(9);
    const [searchQuery, setSearchQuery] = useState("");
    const [inputFocused, setInputFocused] = useState(false);
    const token = localStorage.getItem("authToken");
    const [usuario, setUsuario] = useState(null);
    const [organizacion, setOrganizacion] = useState(null);

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

                const empresaResponse = await axios.get(
                    `http://localhost:8080/EmpresaPersonaFisica/organizacion/${userResponse.data.organizacion.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (empresaResponse.data.message) {
                    // No hay datos
                    setEmpresaPersonaFisica([]);
                    setError(null);
                } else {
                    // Hay datos
                    setEmpresaPersonaFisica(empresaResponse.data);
                    setError(null);
                }
            } catch (err) {
                console.error("Error al obtener los datos:", err);
                setError("Error al obtener los datos: " + err.message);
            }
        };

        fetchData();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nuevaEmpresaPersonaFisica.nombre || !nuevaEmpresaPersonaFisica.nifCif || !nuevaEmpresaPersonaFisica.mail) {
            Swal.fire('Error', 'Los campos nombre, NIF/CIF y mail son obligatorios.', 'error');
            return;
        }

        const empresaData = { ...nuevaEmpresaPersonaFisica, organizacion: { id: organizacion.id } };

        try {
            let response;
            if (nuevaEmpresaPersonaFisica.id) {
                response = await axios.put(`http://localhost:8080/EmpresaPersonaFisica/${nuevaEmpresaPersonaFisica.id}`, empresaData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                response = await axios.post("http://localhost:8080/EmpresaPersonaFisica", empresaData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            setShowModal(false);
            Swal.fire('Éxito', `Empresa ${nuevaEmpresaPersonaFisica.id ? 'actualizada' : 'creada'} correctamente`, 'success');

            // Actualizar la lista de empresas
            const empresaResponse = await axios.get(
                `http://localhost:8080/EmpresaPersonaFisica/organizacion/${organizacion.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEmpresaPersonaFisica(empresaResponse.data);
        } catch (err) {
            Swal.fire('Error', 'Hubo un error al procesar la solicitud: ' + err.message, 'error');
        }
    };

    const handleEliminar = async (id) => {
        try {
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: 'Esta empresa será eliminada permanentemente.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, eliminarla'
            });

            if (result.isConfirmed) {
                await axios.delete(`http://localhost:8080/EmpresaPersonaFisica/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                Swal.fire('Eliminado', 'La empresa ha sido eliminada correctamente', 'success');

                // Actualizar la lista de empresas
                const empresaResponse = await axios.get(
                    `http://localhost:8080/EmpresaPersonaFisica/organizacion/${organizacion.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setEmpresaPersonaFisica(empresaResponse.data);
            }
        } catch (error) {
            Swal.fire('Error', 'Hubo un error al eliminar la empresa: ' + error.message, 'error');
        }
    };

    const handleEditar = (empresa) => {
        setNuevaEmpresaPersonaFisica(empresa);
        setShowModal(true);
    };

    const empresasFiltradas = empresaPersonaFisica.filter(empresa => {
        return (
            empresa.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            empresa.nifCif.toLowerCase().includes(searchQuery.toLowerCase()) ||
            empresa.telefono.toLowerCase().includes(searchQuery.toLowerCase()) ||
            empresa.direccion.toLowerCase().includes(searchQuery.toLowerCase()) ||
            empresa.mail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            empresa.tipo.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    const indexOfLastEmpresa = currentPage * empresasPorPagina;
    const indexOfFirstEmpresa = indexOfLastEmpresa - empresasPorPagina;
    const empresasPaginadas = empresasFiltradas.slice(indexOfFirstEmpresa, indexOfLastEmpresa);

    const totalPages = Math.ceil(empresasFiltradas.length / empresasPorPagina);

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
                        style={{
                            backgroundColor: currentPage === i ? '#6f9fd7' : 'white',
                            color: currentPage === i ? 'white' : '#6f9fd7',
                            border: '1px solid #6f9fd7',
                            borderRadius: '4px',
                            padding: '5px 10px',
                            margin: '0 2px',
                            cursor: 'pointer'
                        }}
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
                    style={{
                        backgroundColor: currentPage === 1 ? '#6f9fd7' : 'white',
                        color: currentPage === 1 ? 'white' : '#6f9fd7',
                        border: '1px solid #6f9fd7',
                        borderRadius: '4px',
                        padding: '5px 10px',
                        margin: '0 2px',
                        cursor: 'pointer'
                    }}
                >
                    1
                </button>
            );

            if (currentPage > 3) {
                buttons.push(<span key="ellipsis1" className="pagination-ellipsis"><FaEllipsisH /></span>);
            }

            for (let i = Math.max(2, currentPage - 1); i <= Math.min(currentPage + 1, totalPages - 1); i++) {
                buttons.push(
                    <button
                        key={i}
                        onClick={() => paginate(i)}
                        className={`pagination-button ${currentPage === i ? 'active' : ''}`}
                        style={{
                            backgroundColor: currentPage === i ? '#6f9fd7' : 'white',
                            color: currentPage === i ? 'white' : '#6f9fd7',
                            border: '1px solid #6f9fd7',
                            borderRadius: '4px',
                            padding: '5px 10px',
                            margin: '0 2px',
                            cursor: 'pointer'
                        }}
                    >
                        {i}
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
                    style={{
                        backgroundColor: currentPage === totalPages ? '#6f9fd7' : 'white',
                        color: currentPage === totalPages ? 'white' : '#6f9fd7',
                        border: '1px solid #6f9fd7',
                        borderRadius: '4px',
                        padding: '5px 10px',
                        margin: '0 2px',
                        cursor: 'pointer'
                    }}
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
                <h2 className="text-center mb-4" style={{ borderBottom: '2px solid #a7c5eb', paddingBottom: '10px' }}>Empresas</h2>

                <ErrorBoundary>
                    {error ? (
                        <div className="alert alert-danger text-center">{error}</div>
                    ) : (
                        <>
                            <div className="d-flex justify-content-between mb-3">
                                <button
                                    className="btn d-flex align-items-center"
                                    style={{ backgroundColor: "#6f9fd7", color: "#fff", borderRadius: "8px", padding: "8px 16px", border: "none" }}
                                    onClick={() => {
                                        setNuevaEmpresaPersonaFisica({
                                            id: null,
                                            nombre: "",
                                            nifCif: "",
                                            telefono: "",
                                            direccion: "",
                                            web: "",
                                            mail: "",
                                            tipo: "CLIENTE"
                                        });
                                        setShowModal(true);
                                    }}
                                >
                                    <FaPlusCircle className="me-2" />
                                    Agregar Empresa
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
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>NIF/CIF</th>
                                        <th>Email</th>
                                        <th>Teléfono</th>
                                        <th>Dirección</th>
                                        <th>Tipo</th>
                                        <th>Acciones</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {empresasPaginadas.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="text-center">
                                                No hay datos disponibles en la base de datos.
                                            </td>
                                        </tr>
                                    ) : (
                                        empresasPaginadas.map((empresa, index) => (
                                            <tr key={empresa.id} style={{ backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff" }}>
                                                <td>{empresa.id}</td>
                                                <td>{empresa.nombre || 'N/A'}</td>
                                                <td>{empresa.nifCif || 'N/A'}</td>
                                                <td>{empresa.mail || 'N/A'}</td>
                                                <td>{empresa.telefono || 'N/A'}</td>
                                                <td>{empresa.direccion || 'N/A'}</td>
                                                <td>{empresa.tipo || 'N/A'}</td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-secondary mx-1" onClick={() => handleEditar(empresa)}>✏️</button>
                                                    <button className="btn btn-sm btn-outline-danger mx-1" onClick={() => handleEliminar(empresa.id)}>🗑️</button>
                                                </td>
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
                                                    border: '1px solid #6f9fd7',
                                                    borderRadius: '4px',
                                                    margin: '0 2px'
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
                                                    border: '1px solid #6f9fd7',
                                                    borderRadius: '4px',
                                                    margin: '0 2px'
                                                }}
                                            >
                                                <FaChevronRight />
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            )}
                        </>
                    )}
                </ErrorBoundary>

                {showModal && (
                    <div className="modal fade show" style={{ display: "block" }}>
                        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "800px" }}>
                            <div className="modal-content shadow-lg rounded">
                                <div className="modal-header" style={{ backgroundColor: '#a7c5eb', color: '#fff' }}>
                                    <h5 className="modal-title">
                                        {nuevaEmpresaPersonaFisica.id ? 'Editar Empresa' : 'Agregar Empresa'}
                                    </h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <form onSubmit={handleSubmit}>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Nombre</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="nombre"
                                                    value={nuevaEmpresaPersonaFisica.nombre}
                                                    onChange={(e) => setNuevaEmpresaPersonaFisica({ ...nuevaEmpresaPersonaFisica, [e.target.name]: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">NIF/CIF</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="nifCif"
                                                    value={nuevaEmpresaPersonaFisica.nifCif}
                                                    onChange={(e) => setNuevaEmpresaPersonaFisica({ ...nuevaEmpresaPersonaFisica, [e.target.name]: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Teléfono</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="telefono"
                                                    value={nuevaEmpresaPersonaFisica.telefono}
                                                    onChange={(e) => setNuevaEmpresaPersonaFisica({ ...nuevaEmpresaPersonaFisica, [e.target.name]: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Dirección</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="direccion"
                                                    value={nuevaEmpresaPersonaFisica.direccion}
                                                    onChange={(e) => setNuevaEmpresaPersonaFisica({ ...nuevaEmpresaPersonaFisica, [e.target.name]: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Web</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="web"
                                                    value={nuevaEmpresaPersonaFisica.web}
                                                    onChange={(e) => setNuevaEmpresaPersonaFisica({ ...nuevaEmpresaPersonaFisica, [e.target.name]: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Email</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    name="mail"
                                                    value={nuevaEmpresaPersonaFisica.mail}
                                                    onChange={(e) => setNuevaEmpresaPersonaFisica({ ...nuevaEmpresaPersonaFisica, [e.target.name]: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Tipo</label>
                                                <select
                                                    className="form-control"
                                                    name="tipo"
                                                    value={nuevaEmpresaPersonaFisica.tipo}
                                                    onChange={(e) => setNuevaEmpresaPersonaFisica({ ...nuevaEmpresaPersonaFisica, [e.target.name]: e.target.value })}
                                                >
                                                    <option value="CLIENTE">Cliente</option>
                                                    <option value="PROVEEDOR">Proveedor</option>
                                                    <option value="AMBOS">Ambos</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="d-flex flex-column gap-3 mt-3">
                                            <button type="submit" className="btn" style={{ backgroundColor: '#a7c5eb', width: '100%', color: '#fff' }}>
                                                {nuevaEmpresaPersonaFisica.id ? 'Actualizar Empresa' : 'Crear Empresa'}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => setShowModal(false)}
                                                style={{ width: '100%' }}
                                            >
                                                Cerrar
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmpresaPersonaFisicaComponent;
