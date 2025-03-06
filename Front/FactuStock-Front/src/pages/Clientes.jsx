import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import { FaPlusCircle, FaSearch } from "react-icons/fa";

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
            return <h1 className="text-danger text-center">Algo salió mal al cargar los clientes.</h1>;
        }
        return this.props.children;
    }
}

const ClienteComponent = () => {
    const [clientes, setClientes] = useState([]);
    const [error, setError] = useState(null);
    const [nuevoCliente, setNuevoCliente] = useState({
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
    const [clientesPorPagina] = useState(9);
    const [searchQuery, setSearchQuery] = useState(""); // Estado para la búsqueda
    const token = localStorage.getItem("authToken");

    // Obtener los clientes al montar el componente
    useEffect(() => {
        if (!token) {
            setError("No se encontró un token de autenticación.");
            return;
        }
        const fetchData = async () => {
            try {
                const response = await axios.get("http://localhost:8080/clientes", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setClientes(response.data);
            } catch (err) {
                setError("Error al obtener los clientes.");
            }
        };
        fetchData();
    }, [token]);

    // Manejo del formulario para crear/editar cliente
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!nuevoCliente.nombre || !nuevoCliente.nifCif || !nuevoCliente.mail) {
            Swal.fire('Error', 'Los campos nombre, NIF/CIF y mail son obligatorios.', 'error');
            return;
        }

        const clienteData = { ...nuevoCliente };

        const request = nuevoCliente.id
            ? axios.put(`http://localhost:8080/clientes/${nuevoCliente.id}`, clienteData, {
                headers: { Authorization: `Bearer ${token}` }
            })
            : axios.post("http://localhost:8080/clientes", clienteData, {
                headers: { Authorization: `Bearer ${token}` }
            });

        request
            .then(() => {
                setShowModal(false);
                Swal.fire('Éxito', `Cliente ${nuevoCliente.id ? 'actualizado' : 'creado'} correctamente`, 'success');
                window.location.reload();
            })
            .catch(() => Swal.fire('Error', `Hubo un error al ${nuevoCliente.id ? 'actualizar' : 'crear'} el cliente.`, 'error'));
    };

    // Eliminar cliente
    const handleEliminar = (id) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Este cliente será eliminado permanentemente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminarlo'
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`http://localhost:8080/clientes/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).then(() => {
                    setClientes(clientes.filter(cliente => cliente.id !== id));
                    Swal.fire('Eliminado', 'El cliente ha sido eliminado correctamente', 'success');
                    window.location.reload();
                }).catch(() => Swal.fire('Error', 'Hubo un error al eliminar el cliente', 'error'));
            }
        });
    };

    // Preparar edición de cliente
    const handleEditar = (cliente) => {
        setNuevoCliente(cliente);
        setShowModal(true);
    };

    // Lógica de paginación
    const totalPages = Math.ceil(clientes.length / clientesPorPagina);
    const clientesPaginados = clientes.slice(
        (currentPage - 1) * clientesPorPagina,
        currentPage * clientesPorPagina
    );

    // Filtrar clientes por búsqueda
    const filteredClientes = clientesPaginados.filter(cliente => {
        return (
            cliente.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cliente.nifCif.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cliente.telefono.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cliente.direccion.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cliente.mail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cliente.tipo.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="container mt-4">
                <h2 className="text-center mb-4" style={{ borderBottom: '2px solid #a7c5eb', paddingBottom: '10px' }}>Clientes</h2>

                <ErrorBoundary>
                    {error ? (
                        <div className="alert alert-danger text-center">{error}</div>
                    ) : (
                        <>
                            <div className="d-flex justify-content-between mb-3">
                                <button
                                    className="btn d-flex align-items-center"
                                    style={{ backgroundColor: '#a7c5eb' }}
                                    onClick={() => {
                                        setNuevoCliente({
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
                                    Agregar Cliente
                                </button>
                                <div className="input-group" style={{ maxWidth: '300px' }}>
                                    <span className="input-group-text" style={{ backgroundColor: '#a7c5eb' }}>
                                        <FaSearch />
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Buscar cliente..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{
                                            backgroundColor: '#a7c5eb', // Fondo azul suave
                                            border: '1px solid #ccc',
                                            borderRadius: '5px',
                                            padding: '5px',
                                            boxShadow: '0px 0px 8px rgba(0,0,0,0.1)',
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
                                    {filteredClientes.map((cliente, index) => (
                                        <tr key={cliente.id} style={{ backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff" }}>
                                            <td>{cliente.id}</td>
                                            <td>{cliente.nombre || 'N/A'}</td>
                                            <td>{cliente.nifCif || 'N/A'}</td>
                                            <td>{cliente.mail || 'N/A'}</td>
                                            <td>{cliente.telefono || 'N/A'}</td>
                                            <td>{cliente.direccion || 'N/A'}</td>
                                            <td>{cliente.tipo || 'N/A'}</td>
                                            <td>
                                                <button className="btn btn-sm btn-outline-secondary mx-1" onClick={() => handleEditar(cliente)}>✏️</button>
                                                <button className="btn btn-sm btn-outline-danger mx-1" onClick={() => handleEliminar(cliente.id)}>🗑️</button>
                                            </td>
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
                </ErrorBoundary>

                {/* Modal para agregar/editar cliente */}
                {showModal && (
                    <div className="modal fade show" style={{ display: "block" }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content shadow-lg rounded">
                                <div className="modal-header" style={{ backgroundColor: '#a7c5eb', color: '#fff' }}>
                                    <h5 className="modal-title">{nuevoCliente.id ? 'Editar Cliente' : 'Agregar Cliente'}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <form onSubmit={handleSubmit}>
                                        <div className="form-group mb-3">
                                            <label className="form-label">Nombre</label>
                                            <input type="text" className="form-control" name="nombre" value={nuevoCliente.nombre} onChange={(e) => setNuevoCliente({ ...nuevoCliente, [e.target.name]: e.target.value })} required />
                                        </div>
                                        <div className="form-group mb-3">
                                            <label className="form-label">NIF/CIF</label>
                                            <input type="text" className="form-control" name="nifCif" value={nuevoCliente.nifCif} onChange={(e) => setNuevoCliente({ ...nuevoCliente, [e.target.name]: e.target.value })} required />
                                        </div>
                                        <div className="form-group mb-3">
                                            <label className="form-label">Teléfono</label>
                                            <input type="text" className="form-control" name="telefono" value={nuevoCliente.telefono} onChange={(e) => setNuevoCliente({ ...nuevoCliente, [e.target.name]: e.target.value })} />
                                        </div>
                                        <div className="form-group mb-3">
                                            <label className="form-label">Dirección</label>
                                            <input type="text" className="form-control" name="direccion" value={nuevoCliente.direccion} onChange={(e) => setNuevoCliente({ ...nuevoCliente, [e.target.name]: e.target.value })} />
                                        </div>
                                        <div className="form-group mb-3">
                                            <label className="form-label">Web</label>
                                            <input type="text" className="form-control" name="web" value={nuevoCliente.web} onChange={(e) => setNuevoCliente({ ...nuevoCliente, [e.target.name]: e.target.value })} />
                                        </div>
                                        <div className="form-group mb-3">
                                            <label className="form-label">Email</label>
                                            <input type="email" className="form-control" name="mail" value={nuevoCliente.mail} onChange={(e) => setNuevoCliente({ ...nuevoCliente, [e.target.name]: e.target.value })} required />
                                        </div>
                                        <div className="form-group mb-3">
                                            <label className="form-label">Tipo</label>
                                            <select className="form-control" name="tipo" value={nuevoCliente.tipo} onChange={(e) => setNuevoCliente({ ...nuevoCliente, [e.target.name]: e.target.value })}>
                                                <option value="CLIENTE">Cliente</option>
                                                <option value="PROVEEDOR">Proveedor</option>
                                            </select>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                            <button type="submit" className="btn btn-primary">{nuevoCliente.id ? 'Guardar cambios' : 'Agregar Cliente'}</button>
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

export default ClienteComponent;
