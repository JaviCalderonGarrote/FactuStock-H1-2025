import Sidebar from "../components/Sidebar";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {FaPlusCircle, FaSearch, FaChevronLeft, FaChevronRight, FaEllipsisH, FaSave} from "react-icons/fa";
import {Button, Col, Form, Modal, Row} from "react-bootstrap";
import Select from "react-select";

// Componente para manejar errores
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
            return <h1 className="text-danger text-center">Algo salió mal al cargar los productos.</h1>;
        }
        return this.props.children;
    }
}

const Products = () => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [error, setError] = useState(null);
    const [nuevoProducto, setNuevoProducto] = useState({
        id: null,
        nombre: '',
        precio: '',
        cantidadStock: '',
        iva: 21,
        categoriaId: '',
        organizacionId: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [productosPorPagina] = useState(9);
    const [searchQuery, setSearchQuery] = useState("");
    const [inputFocused, setInputFocused] = useState(false);
    const [organizacion, setOrganizacion] = useState(null);
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

                setOrganizacion(userResponse.data.organizacion);

                const productosResponse = await axios.get(`http://localhost:8080/productos/organizacion/${userResponse.data.organizacion.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProductos(productosResponse.data);

                const categoriasResponse = await axios.get(`http://localhost:8080/categoriasProducto/organizacion/${userResponse.data.organizacion.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setCategorias(Array.isArray(categoriasResponse.data) ? categoriasResponse.data : []);
            } catch (err) {
                setError("Error al obtener los datos.");
            }
        };

        fetchData();
    }, [token]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (nuevoProducto.precio < 0 || nuevoProducto.cantidadStock < 0 || nuevoProducto.iva < 0 || nuevoProducto.iva > 100) {
            Swal.fire('Error', 'Verifica los valores ingresados.', 'error');
            return;
        }

        const productoData = {
            nombre: nuevoProducto.nombre,
            precio: nuevoProducto.precio,
            cantidadStock: nuevoProducto.cantidadStock,
            iva: nuevoProducto.iva,
            categoria: { id: nuevoProducto.categoriaId },
            organizacion: { id: organizacion.id }
        };

        const request = nuevoProducto.id
            ? axios.put(`http://localhost:8080/productos/${nuevoProducto.id}`, productoData, { headers: { Authorization: `Bearer ${token}` } })
            : axios.post("http://localhost:8080/productos", productoData, { headers: { Authorization: `Bearer ${token}` } });

        request
            .then(() => {
                setShowModal(false);
                Swal.fire({
                    title: 'Éxito',
                    text: `Producto ${nuevoProducto.id ? 'actualizado' : 'creado'} correctamente`,
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    window.location.reload();
                });
            })
            .catch(() => Swal.fire('Error', `Hubo un error al ${nuevoProducto.id ? 'actualizar' : 'crear'} el producto.`, 'error'));
    };

    const handleEliminar = (id) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Este producto será eliminado permanentemente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminarlo'
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`http://localhost:8080/productos/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).then(() => {
                    Swal.fire({
                        title: 'Eliminado',
                        text: 'El producto ha sido eliminado correctamente',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    }).then(() => {
                        window.location.reload();
                    });
                }).catch(() => Swal.fire('Error', 'Hubo un error al eliminar el producto', 'error'));
            }
        });
    };

    const handleEditar = (producto) => {
        setNuevoProducto({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidadStock: producto.cantidadStock,
            iva: producto.iva,
            categoriaId: producto.categoria?.id,
            organizacionId: producto.organizacion?.id
        });
        setShowModal(true);
    };

    const productosFiltrados = Array.isArray(productos)
        ? productos.filter(producto =>
            producto.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            producto.precio.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
            (producto.categoria?.nombre || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            producto.cantidadStock.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
            producto.iva.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    const indexOfLastProduct = currentPage * productosPorPagina;
    const indexOfFirstProduct = indexOfLastProduct - productosPorPagina;
    const currentProducts = productosFiltrados.slice(indexOfFirstProduct, indexOfLastProduct);

    const totalPages = Math.ceil(productosFiltrados.length / productosPorPagina);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleCrearProductoClick = () => {
        if (categorias.length === 0) {
            Swal.fire({
                title: 'Advertencia',
                text: 'No hay categorías disponibles para esta organización. Por favor, añade categorías primero.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
        } else {
            setNuevoProducto({
                id: null,
                nombre: '',
                precio: '',
                cantidadStock: '',
                iva: 21,
                categoriaId: '',
                organizacionId: organizacion?.id || ''
            });
            setShowModal(true);
        }
    };

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
        }
        return buttons;
    };

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="container mt-4">
                <h2 className="text-center mb-4" style={{ borderBottom: '2px solid #a7c5eb', paddingBottom: '10px' }}>Productos</h2>

                <ErrorBoundary>
                    {error && (
                        <div className="alert alert-danger text-center">
                            {error}
                        </div>
                    )}

                    <div className="d-flex justify-content-between mb-3">
                        <button
                            className="btn d-flex align-items-center"
                            style={{ backgroundColor: "#6f9fd7", color: "#fff", borderRadius: "8px", padding: "8px 16px", border: "none" }}
                            onClick={handleCrearProductoClick}
                        >
                            <FaPlusCircle className="me-2" />
                            Agregar Producto
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
                        {currentProducts.length === 0 ? (
                            <table className="table">
                                <thead className="table-dark" style={{ backgroundColor: '#a7c5eb' }}>
                                <tr>
                                    <th colSpan="7" className="text-center">No hay productos disponibles</th>
                                </tr>
                                </thead>
                            </table>
                        ) : (
                            <table className="table">
                                <thead className="table-dark" style={{ backgroundColor: '#a7c5eb' }}>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Precio</th>
                                    <th>Categoría</th>
                                    <th>Stock</th>
                                    <th>IVA</th>
                                    <th>Acciones</th>
                                </tr>
                                </thead>
                                <tbody>
                                {currentProducts.map((producto, index) => (
                                    <tr key={producto.id} style={{ backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff" }}>
                                        <td>{producto.id}</td>
                                        <td>{producto.nombre || 'N/A'}</td>
                                        <td>{producto.precio ?? 'N/A'}€</td>
                                        <td>{producto.categoria?.nombre || 'N/A'}</td>
                                        <td>{producto.cantidadStock ?? 'N/A'}</td>
                                        <td>{producto.iva ?? 'N/A'}%</td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-secondary mx-1" onClick={() => handleEditar(producto)}>✏️</button>
                                            <button className="btn btn-sm btn-outline-danger mx-1" onClick={() => handleEliminar(producto.id)}>🗑️</button>
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
                </ErrorBoundary>

                {showModal && (
                    <div className="modal fade show" style={{ display: "block" }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content shadow-lg rounded">
                                <div className="modal-header" style={{ backgroundColor: '#a7c5eb', color: '#fff' }}>
                                    <h5 className="modal-title">{nuevoProducto.id ? 'Editar Producto' : 'Agregar Producto'}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <form onSubmit={handleSubmit}>
                                        {["nombre", "precio", "cantidadStock", "iva"].map((campo, i) => (
                                            <div className="form-group mb-3" key={campo}>
                                                <label className="form-label">{campo.charAt(0).toUpperCase() + campo.slice(1)}</label>
                                                <input type={campo === "nombre" ? "text" : "number"} className="form-control" name={campo} value={nuevoProducto[campo]} onChange={(e) => setNuevoProducto({ ...nuevoProducto, [campo]: e.target.value })} required />
                                            </div>
                                        ))}
                                        <div className="form-group mb-3">
                                            <label className="form-label">Categoría</label>
                                            <select className="form-control" value={nuevoProducto.categoriaId} onChange={(e) => setNuevoProducto({ ...nuevoProducto, categoriaId: e.target.value })} required>
                                                <option value="">Seleccionar Categoría</option>
                                                {categorias && Array.isArray(categorias) && categorias.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="d-flex justify-content-end">
                                            <button type="button" className="btn btn-secondary me-2" onClick={() => setShowModal(false)}>Cancelar</button>
                                            <button type="submit" className="btn btn-primary">{nuevoProducto.id ? 'Actualizar Producto' : 'Crear Producto'}</button>
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

export default Products;


