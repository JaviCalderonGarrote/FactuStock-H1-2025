import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import { FaPlusCircle } from "react-icons/fa";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Error ocurrido: ", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <h1 className="text-danger text-center">Algo salió mal al cargar las categorías de gasto.</h1>;
        }
        return this.props.children;
    }
}

const CategoriaGastoComponent = () => {
    const [categoriasGasto, setCategoriasGasto] = useState([]);
    const [error, setError] = useState(null);
    const [nuevaCategoria, setNuevaCategoria] = useState({ id: null, nombre: '' });
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [categoriasPorPagina] = useState(9);
    const token = localStorage.getItem("authToken");

    // Obtener las categorías de gasto al montar el componente
    useEffect(() => {
        if (!token) {
            setError("No se encontró un token de autenticación.");
            return;
        }
        const fetchData = async () => {
            try {
                const response = await axios.get("http://localhost:8080/categoriasgasto", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCategoriasGasto(response.data);
            } catch (err) {
                setError("Error al obtener las categorías de gasto.");
            }
        };
        fetchData();
    }, [token]);

    // Manejo del formulario para crear/editar categoría
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!nuevaCategoria.nombre) {
            Swal.fire('Error', 'El nombre de la categoría es obligatorio.', 'error');
            return;
        }
        const categoriaData = { nombre: nuevaCategoria.nombre };

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

    // Eliminar categoría
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

    // Preparar edición de categoría
    const handleEditar = (categoria) => {
        setNuevaCategoria({ id: categoria.id, nombre: categoria.nombre });
        setShowModal(true);
    };

    // Lógica de paginación
    const totalPages = Math.ceil(categoriasGasto.length / categoriasPorPagina);
    const categoriasPaginadas = categoriasGasto.slice(
        (currentPage - 1) * categoriasPorPagina,
        currentPage * categoriasPorPagina
    );

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="container mt-4">
                <h2 className="text-center mb-4" style={{ borderBottom: '2px solid #a7c5eb', paddingBottom: '10px' }}>Categorías de Gasto</h2>

                <ErrorBoundary>
                    {error ? (
                        <div className="alert alert-danger text-center">{error}</div>
                    ) : (
                        <>
                            <button
                                className="btn d-flex align-items-center"
                                style={{ backgroundColor: '#a7c5eb', marginBottom: '20px' }}
                                onClick={() => {
                                    setNuevaCategoria({ id: null, nombre: '' });
                                    setShowModal(true);
                                }}
                            >
                                <FaPlusCircle className="me-2" />
                                Agregar Categoría de Gasto
                            </button>

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
                                    {categoriasPaginadas.map((categoria, index) => (
                                        <tr key={categoria.id} style={{ backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff" }}>
                                            <td>{categoria.id}</td>
                                            <td>{categoria.nombre || 'N/A'}</td>
                                            <td>
                                                <button className="btn btn-sm btn-outline-secondary mx-1" onClick={() => handleEditar(categoria)}>✏️</button>
                                                <button className="btn btn-sm btn-outline-danger mx-1" onClick={() => handleEliminar(categoria.id)}>🗑️</button>
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

                {/* Modal para agregar/editar categoría */}
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
                                            <input type="text" className="form-control" name="nombre" value={nuevaCategoria.nombre} onChange={(e) => setNuevaCategoria({ ...nuevaCategoria, [e.target.name]: e.target.value })} required />
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
