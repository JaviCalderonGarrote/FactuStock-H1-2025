import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import { FaPlusCircle, FaChevronLeft, FaChevronRight, FaFilter, FaTimes, FaEdit, FaTrash, FaSearch, FaEllipsisH } from "react-icons/fa";
import Select from "react-select";

const filtroTipos = [
    { value: "categoria", label: "Categoría" },
    { value: "orden", label: "Ordenar" }
];

const ordenCampoOptions = [
    { value: "id", label: "ID" },
    { value: "nombre", label: "Nombre" },
    { value: "precio", label: "Precio" }
];

const ordenDireccionOptions = [
    { value: "asc", label: "Ascendente" },
    { value: "desc", label: "Descendente" }
];

const Products = () => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [nuevoProducto, setNuevoProducto] = useState({
        id: null,
        nombre: "",
        precio: "",
        cantidadStock: "",
        iva: 21,
        categoriaId: "",
    });
    const [showModal, setShowModal] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [productosPorPagina] = useState(8);
    const [searchQuery, setSearchQuery] = useState("");
    const [organizacion, setOrganizacion] = useState(null);

    const [filtrosActivos, setFiltrosActivos] = useState([]);
    const [nuevoFiltro, setNuevoFiltro] = useState(null);
    const [nuevoValorFiltro, setNuevoValorFiltro] = useState([]);
    const [nuevoOrden, setNuevoOrden] = useState({ campo: ordenCampoOptions[0], direccion: ordenDireccionOptions[1] }); // Por defecto: id descendente
    const filterTimeout = useRef(null);
    const filterRef = useRef(null);

    const token = localStorage.getItem("authToken");

    useEffect(() => {
        if (!token) return;
        const fetchData = async () => {
            try {
                const decodedToken = JSON.parse(atob(token.split(".")[1]));
                const userId = decodedToken?.idUsuario;
                const userResponse = await axios.get(`http://localhost:8080/usuarios/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setOrganizacion(userResponse.data.organizacion);

                const catRes = await axios.get(
                    `http://localhost:8080/categoriasProducto/organizacion/${userResponse.data.organizacion.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setCategorias(Array.isArray(catRes.data) ? catRes.data : []);

                const prodRes = await axios.get(
                    `http://localhost:8080/productos/organizacion/${userResponse.data.organizacion.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                // Ordenar por id descendente al cargar
                const productosOrdenados = Array.isArray(prodRes.data)
                    ? [...prodRes.data].sort((a, b) => b.id - a.id)
                    : [];
                setProductos(productosOrdenados);
            } catch {
                setCategorias([]);
                setProductos([]);
            }
        };
        fetchData();
    }, [token]);

    useEffect(() => {
        if (showFilterDropdown) {
            filterTimeout.current = setTimeout(() => setShowFilterDropdown(false), 10000);
        }
        return () => clearTimeout(filterTimeout.current);
    }, [showFilterDropdown]);

    useEffect(() => {
        if (!showFilterDropdown) return;
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setShowFilterDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showFilterDropdown]);

    useEffect(() => {
        const style = document.createElement("style");
        style.innerHTML = `
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .action-btn {
            background: #e3eefd;
            color: #6f9fd7;
            border: 1.5px solid #a7c5eb;
            border-radius: 8px;
            padding: 6px 10px;
            margin: 0 2px;
            font-size: 16px;
            transition: background 0.2s, color 0.2s, box-shadow 0.2s;
            box-shadow: 0 2px 8px rgba(103, 144, 215, 0.08);
            display: inline-flex;
            align-items: center;
            cursor: pointer;
        }
        .action-btn:hover {
            background: #6f9fd7;
            color: #fff;
            border-color: #6f9fd7;
        }
        `;
        document.head.appendChild(style);
        return () => { document.head.removeChild(style); };
    }, []);

    const categoriaOptions = categorias.map(cat => ({
        value: cat.id,
        label: cat.nombre
    }));

    const handleAddFiltro = () => {
        if (!nuevoFiltro) return;
        let nuevos = [];
        if (nuevoFiltro.value === "categoria") {
            if (!nuevoValorFiltro.length) return;
            nuevos = nuevoValorFiltro.filter(val =>
                !filtrosActivos.some(f => f.tipo === nuevoFiltro.value && f.valor.value === val.value)
            ).map(val => ({ tipo: nuevoFiltro.value, valor: val }));
            setFiltrosActivos([...filtrosActivos, ...nuevos]);
        }
        if (nuevoFiltro.value === "orden") {
            if (!nuevoOrden.campo || !nuevoOrden.direccion) return;
            // Solo un filtro de orden activo
            setFiltrosActivos([
                ...filtrosActivos.filter(f => f.tipo !== "orden"),
                { tipo: "orden", valor: { campo: nuevoOrden.campo, direccion: nuevoOrden.direccion } }
            ]);
        }
        setNuevoFiltro(null);
        setNuevoValorFiltro([]);
    };

    const handleRemoveFiltro = (tipo, valor) => {
        setFiltrosActivos(filtrosActivos.filter(f => {
            if (tipo === "orden") return f.tipo !== "orden";
            return !(f.tipo === tipo && f.valor.value === valor);
        }));
    };

    const handleRemoveAllFiltros = () => {
        setFiltrosActivos([]);
    };

    const renderFiltroChip = (filtro) => {
        if (filtro.tipo === "orden") {
            return (
                <span key="orden"
                      style={{
                          background: "#e3eefd",
                          color: "#6f9fd7",
                          border: "1px solid #6f9fd7",
                          borderRadius: 16,
                          padding: "4px 12px",
                          marginRight: 8,
                          fontSize: 13,
                          display: "inline-flex",
                          alignItems: "center"
                      }}>
                    {`Orden: ${filtro.valor.campo.label} (${filtro.valor.direccion.label})`}
                    <FaTimes
                        style={{ marginLeft: 6, cursor: "pointer" }}
                        onClick={() => handleRemoveFiltro("orden")}
                    />
                </span>
            );
        }
        return (
            <span key={filtro.tipo + filtro.valor.value}
                  style={{
                      background: "#e3eefd",
                      color: "#6f9fd7",
                      border: "1px solid #6f9fd7",
                      borderRadius: 16,
                      padding: "4px 12px",
                      marginRight: 8,
                      fontSize: 13,
                      display: "inline-flex",
                      alignItems: "center"
                  }}>
                {`${filtroTipos.find(f => f.value === filtro.tipo)?.label}: ${filtro.valor.label}`}
                <FaTimes
                    style={{ marginLeft: 6, cursor: "pointer" }}
                    onClick={() => handleRemoveFiltro(filtro.tipo, filtro.valor.value)}
                />
            </span>
        );
    };

    const renderValorFiltro = () => {
        if (!nuevoFiltro) return null;
        if (nuevoFiltro.value === "categoria") {
            return (
                <Select
                    isMulti
                    options={categoriaOptions}
                    value={nuevoValorFiltro}
                    onChange={setNuevoValorFiltro}
                    placeholder="Selecciona valor..."
                    className="mt-2"
                />
            );
        }
        if (nuevoFiltro.value === "orden") {
            return (
                <div className="mt-2 d-flex gap-2 align-items-center">
                    <Select
                        options={ordenCampoOptions}
                        value={nuevoOrden.campo}
                        onChange={campo => setNuevoOrden({ ...nuevoOrden, campo })}
                        placeholder="Campo"
                        isSearchable={false}
                        styles={{ container: base => ({ ...base, minWidth: 120 }) }}
                    />
                    <Select
                        options={ordenDireccionOptions}
                        value={nuevoOrden.direccion}
                        onChange={direccion => setNuevoOrden({ ...nuevoOrden, direccion })}
                        placeholder="Dirección"
                        isSearchable={false}
                        styles={{ container: base => ({ ...base, minWidth: 140 }) }}
                    />
                </div>
            );
        }
        return null;
    };

    // Filtrado y ordenado
    let productosFiltrados = Array.isArray(productos) ? productos.filter(producto => {
        let match = true;
        for (const filtro of filtrosActivos) {
            if (filtro.tipo === "categoria" && producto.categoria?.id !== filtro.valor.value) match = false;
        }
        const valoresProducto = [
            producto.nombre,
            producto.precio,
            producto.cantidadStock,
            producto.iva,
            producto.categoria?.nombre
        ];
        const matchSearch = searchQuery.trim() === "" || valoresProducto.some(valor =>
            valor?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
        return match && matchSearch;
    }) : [];

    // Ordenar según filtro de orden, si existe, si no por defecto id desc
    const filtroOrden = filtrosActivos.find(f => f.tipo === "orden");
    if (filtroOrden && filtroOrden.valor) {
        const { campo, direccion } = filtroOrden.valor;
        productosFiltrados = [...productosFiltrados].sort((a, b) => {
            let valA = a[campo.value];
            let valB = b[campo.value];
            if (campo.value === "nombre") {
                valA = valA?.toLowerCase() || "";
                valB = valB?.toLowerCase() || "";
                if (valA < valB) return direccion.value === "asc" ? -1 : 1;
                if (valA > valB) return direccion.value === "asc" ? 1 : -1;
                return 0;
            }
            if (campo.value === "precio" || campo.value === "id") {
                if (valA < valB) return direccion.value === "asc" ? -1 : 1;
                if (valA > valB) return direccion.value === "asc" ? 1 : -1;
                return 0;
            }
            return 0;
        });
    } else {
        // Por defecto: id descendente
        productosFiltrados = [...productosFiltrados].sort((a, b) => b.id - a.id);
    }

    const indexOfLastProducto = currentPage * productosPorPagina;
    const indexOfFirstProducto = indexOfLastProducto - productosPorPagina;
    const productosPaginados = productosFiltrados.slice(indexOfFirstProducto, indexOfLastProducto);

    const totalPages = Math.ceil(productosFiltrados.length / productosPorPagina);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const renderPaginationButtons = () => {
        let buttons = [];
        if (totalPages <= 1) return buttons;
        buttons.push(
            <li key={1} className={`page-item ${currentPage === 1 ? 'active' : ''}`}>
                <button
                    className="page-link"
                    onClick={() => paginate(1)}
                    style={{
                        backgroundColor: currentPage === 1 ? '#6f9fd7' : 'transparent',
                        color: currentPage === 1 ? '#fff' : '#6f9fd7',
                        border: 'none'
                    }}
                >1</button>
            </li>
        );
        if (currentPage > 3) {
            buttons.push(
                <li key="start-ellipsis" className="page-item">
                    <span className="page-link" style={{ background: "transparent", color: "#6f9fd7", border: "none", cursor: "default" }}><FaEllipsisH /></span>
                </li>
            );
        }
        if (currentPage - 1 > 1) {
            buttons.push(
                <li key={currentPage - 1} className="page-item">
                    <button
                        className="page-link"
                        onClick={() => paginate(currentPage - 1)}
                        style={{
                            backgroundColor: 'transparent',
                            color: '#6f9fd7',
                            border: 'none'
                        }}
                    >{currentPage - 1}</button>
                </li>
            );
        }
        if (currentPage !== 1 && currentPage !== totalPages) {
            buttons.push(
                <li key={currentPage} className="page-item active">
                    <button
                        className="page-link"
                        onClick={() => paginate(currentPage)}
                        style={{
                            backgroundColor: '#6f9fd7',
                            color: '#fff',
                            border: 'none'
                        }}
                    >{currentPage}</button>
                </li>
            );
        }
        if (currentPage + 1 < totalPages) {
            buttons.push(
                <li key={currentPage + 1} className="page-item">
                    <button
                        className="page-link"
                        onClick={() => paginate(currentPage + 1)}
                        style={{
                            backgroundColor: 'transparent',
                            color: '#6f9fd7',
                            border: 'none'
                        }}
                    >{currentPage + 1}</button>
                </li>
            );
        }
        if (currentPage < totalPages - 2) {
            buttons.push(
                <li key="end-ellipsis" className="page-item">
                    <span className="page-link" style={{ background: "transparent", color: "#6f9fd7", border: "none", cursor: "default" }}><FaEllipsisH /></span>
                </li>
            );
        }
        if (totalPages > 1) {
            buttons.push(
                <li key={totalPages} className={`page-item ${currentPage === totalPages ? 'active' : ''}`}>
                    <button
                        className="page-link"
                        onClick={() => paginate(totalPages)}
                        style={{
                            backgroundColor: currentPage === totalPages ? '#6f9fd7' : 'transparent',
                            color: currentPage === totalPages ? '#fff' : '#6f9fd7',
                            border: 'none'
                        }}
                    >{totalPages}</button>
                </li>
            );
        }
        return buttons;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nuevoProducto.nombre.trim() || !nuevoProducto.precio || !nuevoProducto.cantidadStock || !nuevoProducto.categoriaId) {
            Swal.fire('Error', 'Todos los campos son obligatorios.', 'error');
            return;
        }
        if (parseFloat(nuevoProducto.precio) < 0) {
            Swal.fire('Error', 'El precio no puede ser negativo.', 'error');
            return;
        }
        if (parseInt(nuevoProducto.cantidadStock) < 0) {
            Swal.fire('Error', 'El stock no puede ser negativo.', 'error');
            return;
        }
        if (parseInt(nuevoProducto.iva) > 50) {
            Swal.fire('Error', 'El IVA no puede ser mayor a 50%.', 'error');
            return;
        }
        if (!organizacion?.id) {
            Swal.fire('Error', 'No se encontró la organización.', 'error');
            return;
        }
        const productoData = {
            ...nuevoProducto,
            cantidadStock: parseInt(nuevoProducto.cantidadStock),
            iva: parseInt(nuevoProducto.iva),
            organizacion: { id: organizacion.id },
            categoria: { id: nuevoProducto.categoriaId }
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
            const prodRes = await axios.get(
                `http://localhost:8080/productos/organizacion/${organizacion.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Ordenar por id descendente al recargar
            const productosOrdenados = Array.isArray(prodRes.data)
                ? [...prodRes.data].sort((a, b) => b.id - a.id)
                : [];
            setProductos(productosOrdenados);
            setShowModal(false);
            Swal.fire('Éxito', 'Producto guardado correctamente.', 'success');
        } catch (error) {
            let msg = 'Hubo un error al guardar el producto.';
            if (error.response && error.response.data) {
                msg = typeof error.response.data === "string"
                    ? error.response.data
                    : error.response.data.message || msg;
            }
            Swal.fire('Error', msg, 'error');
        }
    };

    const handleEditar = (producto) => {
        setNuevoProducto({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidadStock: producto.cantidadStock,
            iva: producto.iva,
            categoriaId: producto.categoria?.id || ""
        });
        setShowModal(true);
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
                const prodRes = await axios.get(
                    `http://localhost:8080/productos/organizacion/${organizacion.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const productosOrdenados = Array.isArray(prodRes.data)
                    ? [...prodRes.data].sort((a, b) => b.id - a.id)
                    : [];
                setProductos(productosOrdenados);
                Swal.fire('Eliminado', 'El producto ha sido eliminado correctamente', 'success');
            } catch {
                Swal.fire('Error', 'Hubo un error al eliminar el producto', 'error');
            }
        }
    };

    return (
        <div className="d-flex" style={{ height: "100vh", overflow: "hidden" }}>
            <Sidebar />
            <div className="container mt-4" style={{ overflow: "hidden" }}>
                <h2 className="text-center mb-4" style={{ borderBottom: "2px solid #a7c5eb", paddingBottom: "10px" }}>
                    Productos
                </h2>
                <div className="d-flex justify-content-between mb-3" style={{ position: "relative" }}>
                    <button
                        className="btn d-flex align-items-center"
                        style={{ backgroundColor: "#6f9fd7", color: "#fff", borderRadius: "8px", padding: "8px 16px", border: "none" }}
                        onClick={async () => {
                            if (categorias.length === 0) {
                                await Swal.fire({
                                    icon: 'warning',
                                    title: 'No hay categorías disponibles',
                                    text: 'Debes crear al menos una categoría antes de añadir productos.',
                                    confirmButtonText: 'Ir a categorías'
                                });
                                window.location.href = '/category-product';
                                return;
                            }
                            setNuevoProducto({
                                id: null,
                                nombre: "",
                                precio: "",
                                cantidadStock: "",
                                iva: 21,
                                categoriaId: "",
                            });
                            setShowModal(true);
                        }}
                    >
                        <FaPlusCircle className="me-2" />
                        Nuevo Producto
                    </button>
                    <div style={{ position: "relative" }}>
                        <button
                            className="btn"
                            style={{ backgroundColor: "#a7c5eb", color: "#fff", borderRadius: "8px", padding: "8px 16px", border: "none" }}
                            onClick={() => setShowFilterDropdown((prev) => !prev)}
                        >
                            <FaFilter className="me-2" />
                            Filtro
                        </button>
                        {showFilterDropdown && (
                            <div
                                ref={filterRef}
                                style={{
                                    position: "absolute",
                                    right: 0,
                                    top: "110%",
                                    zIndex: 1000,
                                    background: "#fff",
                                    border: "1.5px solid #a7c5eb",
                                    borderRadius: "18px",
                                    padding: "28px 24px 20px 24px",
                                    minWidth: "340px",
                                    boxShadow: "0 8px 32px rgba(103, 144, 215, 0.18)",
                                    transition: "all 0.25s cubic-bezier(.4,2,.6,1)",
                                    animation: "fadeInDown 0.3s",
                                }}
                            >
                                <button
                                    className="btn btn-sm"
                                    style={{
                                        position: "absolute",
                                        top: 8,
                                        right: 8,
                                        background: "transparent",
                                        color: "#6f9fd7",
                                        border: "none"
                                    }}
                                    onClick={() => setShowFilterDropdown(false)}
                                    tabIndex={0}
                                >
                                    <FaTimes />
                                </button>
                                <div className="mb-4" style={{ marginTop: 10 }}>
                                    <label style={{ fontWeight: 600, color: "#6f9fd7", marginBottom: 6, display: "block" }}>
                                        Buscar
                                    </label>
                                    <div className="position-relative" style={{ width: "100%" }}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Buscar producto..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            style={{ paddingLeft: 32 }}
                                        />
                                        <FaSearch style={{ position: "absolute", left: 8, top: 10, color: "#a7c5eb" }} />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label style={{ fontWeight: 600, color: "#6f9fd7", marginBottom: 6, display: "block" }}>
                                        Tipo de filtro
                                    </label>
                                    <Select
                                        options={filtroTipos}
                                        value={nuevoFiltro}
                                        onChange={setNuevoFiltro}
                                        placeholder="Selecciona tipo..."
                                        isSearchable={false}
                                    />
                                    {renderValorFiltro()}
                                    <button
                                        className="btn btn-sm mt-2"
                                        style={{ backgroundColor: "#6f9fd7", color: "#fff", borderRadius: "6px", width: "100%" }}
                                        onClick={handleAddFiltro}
                                    >
                                        Añadir filtro
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="mb-2">
                    {filtrosActivos.map(renderFiltroChip)}
                    {filtrosActivos.length > 0 && (
                        <button
                            className="btn btn-link p-0"
                            style={{ color: "#e74c3c", fontSize: 13 }}
                            onClick={handleRemoveAllFiltros}
                        >
                            Quitar todos
                        </button>
                    )}
                </div>
                <div className="table-responsive">
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
                        {productosPaginados.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center">No hay productos para mostrar.</td>
                            </tr>
                        ) : (
                            productosPaginados.map((producto, index) => (
                                <tr key={producto.id} style={{ backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff" }}>
                                    <td>{producto.id}</td>
                                    <td>{producto.nombre}</td>
                                    <td>{producto.precio}</td>
                                    <td>{producto.cantidadStock}</td>
                                    <td>{producto.iva}%</td>
                                    <td>{producto.categoria?.nombre || "-"}</td>
                                    <td>
                                        <button
                                            className="action-btn me-2"
                                            onClick={() => handleEditar(producto)}
                                            title="Editar"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            className="action-btn"
                                            onClick={() => handleEliminar(producto.id)}
                                            title="Eliminar"
                                        >
                                            <FaTrash />
                                        </button>
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
                        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "800px" }}>
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
                                                onChange={e => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group mb-3">
                                            <label htmlFor="precio" className="form-label">Precio</label>
                                            <input
                                                id="precio"
                                                type="number"
                                                className="form-control"
                                                name="precio"
                                                value={nuevoProducto.precio}
                                                onChange={e => setNuevoProducto({ ...nuevoProducto, precio: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group mb-3">
                                            <label htmlFor="cantidadStock" className="form-label">Stock</label>
                                            <input
                                                id="cantidadStock"
                                                type="number"
                                                className="form-control"
                                                name="cantidadStock"
                                                value={nuevoProducto.cantidadStock}
                                                onChange={e => setNuevoProducto({ ...nuevoProducto, cantidadStock: e.target.value })}
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
                                                onChange={e => setNuevoProducto({ ...nuevoProducto, iva: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group mb-3">
                                            <label className="form-label">Categoría</label>
                                            <Select
                                                options={categoriaOptions}
                                                value={categoriaOptions.find(opt => opt.value === nuevoProducto.categoriaId) || null}
                                                onChange={option => setNuevoProducto({ ...nuevoProducto, categoriaId: option ? option.value : "" })}
                                                placeholder="Selecciona una categoría"
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