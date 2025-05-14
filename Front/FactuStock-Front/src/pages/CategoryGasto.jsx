import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import { FaPlusCircle, FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const CategoriaGastoComponent = () => {
    const [categoriasGasto, setCategoriasGasto] = useState([]);
    const [error, setError] = useState(null);
    const [nuevaCategoria, setNuevaCategoria] = useState({ id: null, nombre: "", organizacionId: "" });
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [categoriasPorPagina] = useState(9);
    const [searchQuery, setSearchQuery] = useState("");
    const [inputFocused, setInputFocused] = useState(false);
    const [organizacion, setOrganizacion] = useState(null);
    const [usuario, setUsuario] = useState(null);
    const token = localStorage.getItem("authToken");

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

                const categoriasResponse = await axios.get(
                    `http://localhost:8080/categoriasgasto/organizacion/${userResponse.data.organizacion.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setCategoriasGasto(categoriasResponse.data.length ? categoriasResponse.data : []);
            } catch (err) {
                setError("Error al obtener las categorías.");
            }
        };

        fetchData();
    }, [token]);

    const handleOpenModal = () => {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const organizacionId = decodedToken?.organizacionId;
        setNuevaCategoria({ id: null, nombre: "", organizacionId: organizacionId });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!nuevaCategoria.nombre) {
            Swal.fire('Error', 'El nombre de la categoría es obligatorio.', 'error');
            return;
        }

        if (!organizacion?.id) {
            Swal.fire('Error', 'No se pudo determinar la organización del usuario.', 'error');
            return;
        }

        const categoriaData = {
            nombre: nuevaCategoria.nombre,
            organizacion: { id: organizacion.id },
        };

        const request = nuevaCategoria.id
            ? axios.put(`http://localhost:8080/categoriasgasto/${nuevaCategoria.id}`, categoriaData, { headers: { Authorization: `Bearer ${token}` } })
            : axios.post("http://localhost:8080/categoriasgasto", categoriaData, { headers: { Authorization: `Bearer ${token}` } });

        request
            .then(() => {
                setShowModal(false);
                Swal.fire('Éxito', `Categoría ${nuevaCategoria.id ? 'actualizada' : 'creada'} correctamente`, 'success');
                window.location.reload();
            })
            .catch(() => Swal.fire('Error', `Hubo un error al ${nuevaCategoria.id ? 'actualizar' : 'crear'} la categoría.`, 'error'));
    };

    const handleEliminar = (id) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta categoría será eliminada permanentemente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminarla'
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`http://localhost:8080/categoriasgasto/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).then(() => {
                    setCategoriasGasto(categoriasGasto.filter(cat => cat.id !== id));
                    Swal.fire('Eliminada', 'La categoría ha sido eliminada correctamente', 'success');
                    window.location.reload();
                }).catch(() => Swal.fire('Error', 'Hubo un error al eliminar la categoría', 'error'));
            }
        });
    };

    const categoriasFiltradas = categoriasGasto.filter(categoria =>
        categoria.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        categoria.id.toString().includes(searchQuery)
    );

    const indexOfLastCategoria = currentPage * categoriasPorPagina;
    const indexOfFirstCategoria = indexOfLastCategoria - categoriasPorPagina;
    const categoriasPaginadas = categoriasFiltradas.slice(indexOfFirstCategoria, indexOfLastCategoria);

    const totalPages = Math.ceil(categoriasFiltradas.length / categoriasPorPagina);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="container mt-4">
                <h2 className="text-center mb-4" style={{ borderBottom: '2px solid #a7c5eb', paddingBottom: '10px' }}>Categorías de Gasto</h2>

                {error && <div className="alert alert-danger text-center">{error}</div>}

                <div className="d-flex justify-content-between mb-3">
                    <button
                        className="btn"
                        style={{ backgroundColor: "#6f9fd7", color: "#fff", borderRadius: "8px", padding: "8px 16px", border: "none" }}
                        onClick={handleOpenModal}
                    >
                        <FaPlusCircle className="me-2" />
                        Agregar Categoría
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
                            <th>Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {categoriasPaginadas.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="text-center">No hay categorías de gasto disponibles.</td>
                            </tr>
                        ) : (
                            categoriasPaginadas.map((categoria, index) => (
                                <tr key={categoria.id} style={{ backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff" }}>
                                    <td>{categoria.id}</td>
                                    <td>{categoria.nombre || 'N/A'}</td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-secondary mx-1" onClick={() => {
                                            setNuevaCategoria({ id: categoria.id, nombre: categoria.nombre, organizacionId: categoria.organizacion.id });
                                            setShowModal(true);
                                        }}>✏️</button>
                                        <button className="btn btn-sm btn-outline-danger mx-1" onClick={() => handleEliminar(categoria.id)}>🗑️</button>
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
                                <button className="page-link" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} style={{color: '#6f9fd7', borderColor: '#6f9fd7'}}>
                                    <FaChevronLeft />
                                </button>
                            </li>
                            {[...Array(totalPages).keys()].map((number) => (
                                <li key={number + 1} className={`page-item ${currentPage === number + 1 ? 'active' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => paginate(number + 1)}
                                        style={{
                                            backgroundColor: currentPage === number + 1 ? '#6f9fd7' : 'white',
                                            color: currentPage === number + 1 ? 'white' : '#6f9fd7',
                                            borderColor: '#6f9fd7'
                                        }}
                                    >
                                        {number + 1}
                                    </button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} style={{color: '#6f9fd7', borderColor: '#6f9fd7'}}>
                                    <FaChevronRight />
                                </button>
                            </li>
                        </ul>
                    </nav>
                )}

                {showModal && (
                    <div className="modal fade show" style={{ display: "block" }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content shadow-lg rounded">
                                <div className="modal-header" style={{ backgroundColor: '#a7c5eb', color: '#fff' }}>
                                    <h5 className="modal-title">{nuevaCategoria.id ? 'Editar Categoría de Gasto' : 'Agregar Categoría de Gasto'}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <form onSubmit={handleSubmit}>
                                        <div className="form-group mb-3">
                                            <label className="form-label">Nombre</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="nombre"
                                                value={nuevaCategoria.nombre}
                                                onChange={(e) => setNuevaCategoria({ ...nuevaCategoria, [e.target.name]: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="btn" style={{ backgroundColor: '#a7c5eb', width: '100%' }}>
                                            {nuevaCategoria.id ? 'Guardar Cambios' : 'Guardar Categoría'}
                                        </button>
                                    </form>
                                    <button type="button" className="btn btn-secondary mt-3" onClick={() => setShowModal(false)} style={{ width: '100%' }}>
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoriaGastoComponent;
