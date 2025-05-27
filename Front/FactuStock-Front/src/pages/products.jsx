import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import { FaPlusCircle, FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Select from 'react-select';

const Products = () => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [error, setError] = useState(null);
    const [nuevoProducto, setNuevoProducto] = useState({
        id: null,
        nombre: "",
        precio: "",
        cantidadStock: "",
        iva: 21,
        categoriaId: "",
    });
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [productosPorPagina] = useState(9);
    const [searchQuery, setSearchQuery] = useState("");
    const [organizacion, setOrganizacion] = useState(null);
    const [inputFocused, setInputFocused] = useState(false);
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

                const productosResponse = await axios.get(
                    `http://localhost:8080/productos/organizacion/${userResponse.data.organizacion.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const productosOrdenados = productosResponse.data.sort((a, b) => b.id - a.id);
                setProductos(productosOrdenados);

                const categoriasResponse = await axios.get(
                    `http://localhost:8080/categoriasProducto/organizacion/${userResponse.data.organizacion.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setCategorias(categoriasResponse.data);
            } catch (err) {
                setError("Error al obtener los productos.");
            }
        };

        fetchData();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nuevoProducto.nombre.trim() || !nuevoProducto.precio || !nuevoProducto.cantidadStock || !nuevoProducto.categoriaId) {
            Swal.fire("Error", "Todos los campos son obligatorios.", "error");
            return;
        }

        if (!organizacion?.id) {
            Swal.fire("Error", "No se pudo determinar la organización del usuario.", "error");
            return;
        }

        const productoData = {
            nombre: nuevoProducto.nombre.trim(),
            precio: parseFloat(nuevoProducto.precio),
            cantidadStock: parseInt(nuevoProducto.cantidadStock),
            iva: parseInt(nuevoProducto.iva),
            categoria: { id: nuevoProducto.categoriaId },
            organizacion: { id: organizacion.id },
        };

        try {
            if (nuevoProducto.id) {
                await axios.put(`http://localhost:8080/productos/${nuevoProducto.id}`, productoData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post("http://localhost:8080/productos", productoData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            setShowModal(false);
            Swal.fire("Éxito", `Producto ${nuevoProducto.id ? "actualizado" : "creado"} correctamente`, "success");
            const productosResponse = await axios.get(
                `http://localhost:8080/productos/organizacion/${organizacion.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const productosOrdenados = productosResponse.data.sort((a, b) => b.id - a.id);
            setProductos(productosOrdenados);
        } catch (error) {
            Swal.fire("Error", `Hubo un error al ${nuevoProducto.id ? "actualizar" : "crear"} el producto.`, "error");
        }
    };

    const handleEliminar = async (id) => {
        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Este producto será eliminado permanentemente.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminarlo",
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:8080/productos/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProductos(productos.filter((producto) => producto.id !== id));
                Swal.fire("Eliminado", "El producto ha sido eliminado correctamente", "success");
            } catch (error) {
                Swal.fire("Error", "Hubo un error al eliminar el producto", "error");
            }
        }
    };

    const productosFiltrados = productos.filter((producto) =>
        producto.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        producto.precio.toString().includes(searchQuery) ||
        producto.cantidadStock.toString().includes(searchQuery) ||
        producto.iva.toString().includes(searchQuery) ||
        producto.categoria.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const indexOfLastProducto = currentPage * productosPorPagina;
    const indexOfFirstProducto = indexOfLastProducto - productosPorPagina;
    const productosPaginados = productosFiltrados.slice(indexOfFirstProducto, indexOfLastProducto);

    const totalPages = Math.ceil(productosFiltrados.length / productosPorPagina);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const renderPaginationButtons = () => {
        let buttons = [];
        for (let i = 1; i <= totalPages; i++) {
            buttons.push(
                <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                    <button
                        className="page-link"
                        onClick={() => paginate(i)}
                        style={{
                            backgroundColor: currentPage === i ? '#6f9fd7' : 'transparent',
                            color: currentPage === i ? '#fff' : '#6f9fd7',
                            border: 'none'
                        }}
                    >
                        {i}
                    </button>
                </li>
            );
        }
        return buttons;
    };

    const categoryOptions = categorias.map(cat => ({
        value: cat.id,
        label: cat.nombre
    }));

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="container mt-4">
                <h2 className="text-center mb-4" style={{ borderBottom: "2px solid #a7c5eb", paddingBottom: "10px" }}>
                    Productos
                </h2>

                {error && <div className="alert alert-danger text-center">{error}</div>}

                <div className="d-flex justify-content-between mb-3">
                    <button
                        className="btn"
                        style={{ backgroundColor: "#6f9fd7", color: "#fff", borderRadius: "8px", padding: "8px 16px", border: "none" }}
                        onClick={() => {
                            setNuevoProducto({ id: null, nombre: "", precio: "", cantidadStock: "", iva: 21, categoriaId: "" });
                            setShowModal(true);
                        }}
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
                    {productosPaginados.length === 0 ? (
                        <table className="table">
                            <thead className="table-dark" style={{ backgroundColor: "#a7c5eb" }}>
                            <tr>
                                <th colSpan="6" className="text-center">No hay productos disponibles.</th>
                            </tr>
                            </thead>
                        </table>
                    ) : (
                        <table className="table">
                            <thead className="table-dark" style={{ backgroundColor: "#a7c5eb" }}>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Precio</th>
                                <th>Stock</th>
                                <th>IVA</th>
                                <th>Categoría</th>
                                <th>Acciones</th>
                            </tr>
                            </thead>
                            <tbody>
                            {productosPaginados.map((producto, index) => (
                                <tr key={producto.id} style={{ backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff" }}>
                                    <td>{producto.id}</td>
                                    <td>{producto.nombre || "N/A"}</td>
                                    <td>{producto.precio || "N/A"}€</td>
                                    <td>{producto.cantidadStock || "N/A"}</td>
                                    <td>{producto.iva || "N/A"}%</td>
                                    <td>{producto.categoria.nombre || "N/A"}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-outline-secondary mx-1"
                                            onClick={() => {
                                                setNuevoProducto({...producto, categoriaId: producto.categoria.id});
                                                setShowModal(true);
                                            }}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger mx-1"
                                            onClick={() => handleEliminar(producto.id)}
                                        >
                                            🗑️
                                        </button>
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
                                        <div className="form-group mb-3">
                                            <label htmlFor="nombre" className="form-label">Nombre</label>
                                            <input
                                                id="nombre"
                                                type="text"
                                                className="form-control"
                                                name="nombre"
                                                value={nuevoProducto.nombre}
                                                onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group mb-3">
                                            <label htmlFor="precio" className="form-label">Precio</label>
                                            <input
                                                id="precio"
                                                type="number"
                                                step="0.01"
                                                className="form-control"
                                                name="precio"
                                                value={nuevoProducto.precio}
                                                onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group mb-3">
                                            <label htmlFor="cantidadStock" className="form-label">Cantidad en Stock</label>
                                            <input
                                                id="cantidadStock"
                                                type="number"
                                                className="form-control"
                                                name="cantidadStock"
                                                value={nuevoProducto.cantidadStock}
                                                onChange={(e) => setNuevoProducto({ ...nuevoProducto, cantidadStock: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group mb-3">
                                            <label htmlFor="iva" className="form-label">IVA (%)</label>
                                            <input
                                                id="iva"
                                                type="number"
                                                className="form-control"
                                                name="iva"
                                                value={nuevoProducto.iva}
                                                onChange={(e) => setNuevoProducto({ ...nuevoProducto, iva: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group mb-3">
                                            <label htmlFor="categoria" className="form-label">Categoría</label>
                                            <Select
                                                id="categoria"
                                                options={categoryOptions}
                                                value={categoryOptions.find(option => option.value === nuevoProducto.categoriaId)}
                                                onChange={(selectedOption) => setNuevoProducto({ ...nuevoProducto, categoriaId: selectedOption.value })}
                                                placeholder="Seleccione o escriba una categoría"
                                                isClearable
                                                isSearchable
                                            />
                                        </div>
                                        <button type="submit" className="btn" style={{ backgroundColor: '#a7c5eb', width: '100%', color: '#fff' }}>
                                            {nuevoProducto.id ? 'Guardar Cambios' : 'Guardar Producto'}
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

export default Products;
