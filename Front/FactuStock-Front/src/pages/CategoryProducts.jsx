import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import { FaPlusCircle, FaSearch } from "react-icons/fa"; // Importamos el icono de la lupa

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
            return <h1 className="text-danger text-center">Algo salió mal al cargar las categorías.</h1>;
        }
        return this.props.children;
    }
}

const CategoryProducts = () => {
    const [categorias, setCategorias] = useState([]);
    const [error, setError] = useState(null);
    const [nuevaCategoria, setNuevaCategoria] = useState({
        id: null,
        nombre: '',
    });
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [categoriasPorPagina] = useState(9);
    const [searchQuery, setSearchQuery] = useState(""); // Estado para la búsqueda
    const token = localStorage.getItem("authToken");

    useEffect(() => {
        if (!token) {
            setError("No se encontró un token de autenticación.");
            return;
        }

        const fetchData = async () => {
            try {
                const categoriasResponse = await axios.get("http://localhost:8080/categoriasProducto", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCategorias(categoriasResponse.data);
            } catch (err) {
                setError("Error al obtener las categorías.");
            }
        };

        fetchData();
    }, [token]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!nuevaCategoria.nombre) {
            Swal.fire('Error', 'El nombre de la categoría es obligatorio.', 'error');
            return;
        }

        const categoriaData = { nombre: nuevaCategoria.nombre };

        const request = nuevaCategoria.id
            ? axios.put(`http://localhost:8080/categoriasProducto/${nuevaCategoria.id}`, categoriaData, { headers: { Authorization: `Bearer ${token}` } })
            : axios.post("http://localhost:8080/categoriasProducto", categoriaData, { headers: { Authorization: `Bearer ${token}` } });

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
                axios.delete(`http://localhost:8080/categoriasProducto/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).then(() => {
                    setCategorias(categorias.filter(categoria => categoria.id !== id));
                    Swal.fire('Eliminada', 'La categoría ha sido eliminada correctamente', 'success');
                    window.location.reload();
                }).catch((error) => {
                    if (error.response && error.response.status === 400) {
                        Swal.fire('Error', 'No se puede eliminar la categoría porque tiene productos asociados.', 'error');
                    } else {
                        Swal.fire('Error', 'Hubo un error al eliminar la categoría', 'error');
                    }
                });
            }
        });
    };

    const handleEditar = (categoria) => {
        setNuevaCategoria({
            id: categoria.id,
            nombre: categoria.nombre,
        });
        setShowModal(true);
    };

    const totalPages = Math.ceil(categorias.length / categoriasPorPagina);
    const categoriasPaginadas = categorias
        .filter(categoria =>
            categoria.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || // Buscar por nombre
            categoria.id.toString().includes(searchQuery) // Buscar por ID (convertido a string)
        )
        .slice(
            (currentPage - 1) * categoriasPorPagina,
            currentPage * categoriasPorPagina
        );

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="container mt-4">
                <h2 className="text-center mb-4" style={{ borderBottom: '2px solid #a7c5eb', paddingBottom: '10px' }}>Categorías de Productos</h2>

                <ErrorBoundary>
                    {error ? (
                        <div className="alert alert-danger text-center">{error}</div>
                    ) : (
                        <>
                            <div className="d-flex justify-content-between mb-3">
                                <button
                                    className="btn d-flex align-items-center"
                                    style={{ backgroundColor: '#a7c5eb', marginBottom: '20px' }}
                                    onClick={() => {
                                        setNuevaCategoria({ id: null, nombre: '' });
                                        setShowModal(true);
                                    }}
                                >
                                    <FaPlusCircle className="me-2" />
                                    Agregar Categoría
                                </button>

                                <div className="position-relative" style={{ maxWidth: "400px" }}>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Buscar aquí..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{
                                            paddingLeft: "35px", // Espacio para la lupa
                                            borderRadius: "5px",
                                            backgroundColor: '#a7c5eb',
                                            boxShadow: "0px 0px 8px rgba(0,0,0,0.1)",
                                            transition: "border-color 0.3s ease-in-out"
                                        }}
                                    />
                                    <FaSearch
                                        className="position-absolute"
                                        style={{
                                            left: "10px", // Ajustamos la posición horizontal de la lupa
                                            top: "35%",   // Alineación vertical
                                            transform: "translateY(-50%)",
                                            color: "black",  // Color de la lupa
                                            fontSize: "20px"
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
                                    <h5 className="modal-title">{nuevaCategoria.id ? 'Editar Categoría' : 'Agregar Categoría'}</h5>
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
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryProducts;
