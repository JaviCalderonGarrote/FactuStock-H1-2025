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
    const [clientesPorPagina] = useState(9);
    const [searchQuery, setSearchQuery] = useState(""); // Estado para la búsqueda
    const [inputFocused, setInputFocused] = useState(false); // Estado para saber si el input está enfocado
    const token = localStorage.getItem("authToken");
    const [usuario, setUsuario] = useState(null); // Definir estado para usuario
    const [organizacion, setOrganizacion] = useState(null); // Definir estado para organizacion

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

                setEmpresaPersonaFisica(empresaResponse.data);
            } catch (err) {
                setError("Error al obtener los datos.");
            }
        };

        fetchData();
    }, [token]);

    // Manejo del formulario para crear/editar empresaPersonaFisica
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
                setEmpresaPersonaFisica([...empresaPersonaFisica, response.data]);
            }

            setShowModal(false);
            Swal.fire('Éxito', `Empresa ${nuevaEmpresaPersonaFisica.id ? 'actualizada' : 'creada'} correctamente`, 'success');
        } catch (err) {
            Swal.fire('Error', 'Hubo un error al procesar la solicitud.', 'error');
        }
    };

    // Eliminar empresa
    const handleEliminar = (id) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta empresa será eliminada permanentemente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminarla'
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`http://localhost:8080/EmpresaPersonaFisica/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).then(() => {
                    setEmpresaPersonaFisica(empresaPersonaFisica.filter(empresa => empresa.id !== id));
                    Swal.fire('Eliminado', 'La empresa ha sido eliminada correctamente', 'success');
                    window.location.reload();
                }).catch(() => Swal.fire('Error', 'Hubo un error al eliminar la empresa', 'error'));
            }
        });
    };

    // Preparar edición de empresa
    const handleEditar = (empresa) => {
        setNuevaEmpresaPersonaFisica(empresa);
        setShowModal(true);
    };

    // Lógica de paginación
    const totalPages = Math.ceil(empresaPersonaFisica.length / clientesPorPagina);
    const empresaPersonaFisicaPaginada = empresaPersonaFisica.slice(
        (currentPage - 1) * clientesPorPagina,
        currentPage * clientesPorPagina
    );

    // Filtrar empresas por búsqueda
    const filteredEmpresas = empresaPersonaFisicaPaginada.filter(empresa => {
        return (
            empresa.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            empresa.nifCif.toLowerCase().includes(searchQuery.toLowerCase()) ||
            empresa.telefono.toLowerCase().includes(searchQuery.toLowerCase()) ||
            empresa.direccion.toLowerCase().includes(searchQuery.toLowerCase()) ||
            empresa.mail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            empresa.tipo.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

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
                                    {filteredEmpresas.map((empresa, index) => (
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

                {/* Modal para agregar/editar empresa */}
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
                                        {/* Fila 1: Nombre y NIF/CIF */}
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

                                        {/* Fila 2: Teléfono y Dirección */}
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

                                        {/* Fila 3: Web y Email */}
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

                                        {/* Fila 4: Tipo */}
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

                                        {/* Botones de Acción - uno debajo del otro */}
                                        <div className="d-flex flex-column gap-3 mt-3">
                                            <button type="submit" className="btn" style={{ backgroundColor: '#a7c5eb', width: '100%' }}>
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
