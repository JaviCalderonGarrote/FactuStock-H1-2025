import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import { FaPlusCircle, FaChevronLeft, FaChevronRight, FaFilter, FaTimes, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import Select from 'react-select';

const ordenOptions = [
    { value: "nombreAZ", label: "Nombre A-Z" },
    { value: "nombreZA", label: "Nombre Z-A" },
    { value: "nuevo", label: "Más reciente" },
    { value: "antiguo", label: "Más antiguo" }
];

const ROW_HEIGHT = 56;
const HEADER_HEIGHT = 56;
const EXTRA_HEIGHT = 320;

const CategoryProducts = () => {
    const [categorias, setCategorias] = useState([]);
    const [error, setError] = useState(null);
    const [nuevaCategoria, setNuevaCategoria] = useState({ id: null, nombre: "" });
    const [showModal, setShowModal] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [categoriasPorPagina, setCategoriasPorPagina] = useState(9);
    const [searchQuery, setSearchQuery] = useState("");
    const [organizacion, setOrganizacion] = useState(null);
    const [orden, setOrden] = useState(ordenOptions[2]);
    const token = localStorage.getItem("authToken");
    const filterTimeout = useRef(null);
    const interacted = useRef(false);
    const filterRef = useRef(null);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    useEffect(() => {
        const calcularCategoriasPorPagina = () => {
            const windowHeight = window.innerHeight;
            const disponible = windowHeight - EXTRA_HEIGHT;
            const filas = Math.max(1, Math.floor((disponible - HEADER_HEIGHT) / ROW_HEIGHT));
            setCategoriasPorPagina(filas);
        };
        calcularCategoriasPorPagina();
        window.addEventListener("resize", calcularCategoriasPorPagina);
        return () => window.removeEventListener("resize", calcularCategoriasPorPagina);
    }, []);

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
                const categoriasResponse = await axios.get(
                    `http://localhost:8080/categoriasProducto/organizacion/${userResponse.data.organizacion.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setCategorias(Array.isArray(categoriasResponse.data) ? categoriasResponse.data : []);
            } catch {
                setError("Error al obtener las categorías.");
                setCategorias([]); // Asegura array vacío en error
            }
        };
        fetchData();
    }, [token]);

    // Cierre automático del filtro por inactividad
    useEffect(() => {
        if (showFilterDropdown) {
            interacted.current = false;
            filterTimeout.current = setTimeout(() => {
                if (!interacted.current) setShowFilterDropdown(false);
            }, 5000);
        }
        return () => clearTimeout(filterTimeout.current);
    }, [showFilterDropdown]);

    // Cierre al hacer clic fuera del filtro
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

    // Animación fadeInDown para el filtro
    useEffect(() => {
        const style = document.createElement("style");
        style.innerHTML = `
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px);}
          to { opacity: 1; transform: translateY(0);}
        }
        `;
        document.head.appendChild(style);
        return () => { document.head.removeChild(style); };
    }, []);

    const handleFilterInteraction = () => {
        interacted.current = true;
        clearTimeout(filterTimeout.current);
    };

    const handleOpenModal = () => {
        setNuevaCategoria({ id: null, nombre: "" });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nuevaCategoria.nombre.trim()) {
            Swal.fire("Error", "El nombre de la categoría es obligatorio.", "error");
            return;
        }
        if (!organizacion?.id) {
            Swal.fire("Error", "No se pudo determinar la organización del usuario.", "error");
            return;
        }
        const categoriaData = {
            nombre: nuevaCategoria.nombre.trim(),
            organizacion: { id: organizacion.id },
        };
        try {
            if (nuevaCategoria.id) {
                await axios.put(`http://localhost:8080/categoriasProducto/${nuevaCategoria.id}`, categoriaData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post("http://localhost:8080/categoriasProducto", categoriaData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            setShowModal(false);
            Swal.fire("Éxito", `Categoría ${nuevaCategoria.id ? "actualizada" : "creada"} correctamente`, "success");
            const categoriasResponse = await axios.get(
                `http://localhost:8080/categoriasProducto/organizacion/${organizacion.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCategorias(Array.isArray(categoriasResponse.data) ? categoriasResponse.data : []);
        } catch {
            Swal.fire("Error", `Hubo un error al ${nuevaCategoria.id ? "actualizar" : "crear"} la categoría.`, "error");
        }
    };

    const handleEliminar = async (id) => {
        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta categoría será eliminada permanentemente.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminarla",
        });
        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:8080/categoriasProducto/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCategorias(categorias.filter((cat) => cat.id !== id));
                Swal.fire("Eliminada", "La categoría ha sido eliminada correctamente", "success");
            } catch {
                Swal.fire("Error", "Hubo un error al eliminar la categoría", "error");
            }
        }
    };

    // Filtro y ordenación
    let categoriasFiltradas = Array.isArray(categorias)
        ? categorias.filter((categoria) =>
            categoria.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            categoria.id.toString().includes(searchQuery)
        )
        : [];

    const categoriasOrdenadas = [...categoriasFiltradas].sort((a, b) => {
        switch (orden.value) {
            case "nombreAZ":
                return a.nombre.localeCompare(b.nombre);
            case "nombreZA":
                return b.nombre.localeCompare(a.nombre);
            case "nuevo":
                return b.id - a.id;
            case "antiguo":
                return a.id - b.id;
            default:
                return 0;
        }
    });

    const indexOfLastCategoria = currentPage * categoriasPorPagina;
    const indexOfFirstCategoria = indexOfLastCategoria - categoriasPorPagina;
    const categoriasPaginadas = categoriasOrdenadas.slice(indexOfFirstCategoria, indexOfLastCategoria);

    const totalPages = Math.ceil(categoriasOrdenadas.length / categoriasPorPagina);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Paginación avanzada igual que productos
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
                >
                    1
                </button>
            </li>
        );

        if (currentPage > 3) {
            buttons.push(
                <li key="start-ellipsis" className="page-item">
                    <span className="page-link" style={{ background: "transparent", color: "#6f9fd7", border: "none", cursor: "default" }}>...</span>
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
                    >
                        {currentPage - 1}
                    </button>
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
                    >
                        {currentPage}
                    </button>
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
                    >
                        {currentPage + 1}
                    </button>
                </li>
            );
        }

        if (currentPage < totalPages - 2) {
            buttons.push(
                <li key="end-ellipsis" className="page-item">
                    <span className="page-link" style={{ background: "transparent", color: "#6f9fd7", border: "none", cursor: "default" }}>...</span>
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
                    >
                        {totalPages}
                    </button>
                </li>
            );
        }

        return buttons;
    };

    return (
        <div className="d-flex" style={{ height: "100vh", overflow: "hidden" }}>
            <Sidebar />
            <div className="container mt-4" style={{ overflow: "hidden" }}>
                <h2 className="text-center mb-4" style={{ borderBottom: "2px solid #a7c5eb", paddingBottom: "10px" }}>
                    Categorías de Productos
                </h2>

                {error && <div className="alert alert-danger text-center">{error}</div>}

                <div className="d-flex justify-content-between mb-3" style={{ position: "relative" }}>
                    <button
                        className="btn"
                        style={{ backgroundColor: "#6f9fd7", color: "#fff", borderRadius: "8px", padding: "8px 16px", border: "none" }}
                        onClick={handleOpenModal}
                    >
                        <FaPlusCircle className="me-2" />
                        Agregar Categoría de Producto
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
                                onMouseDown={handleFilterInteraction}
                                onKeyDown={handleFilterInteraction}
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
                                            placeholder="Buscar categoría..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            style={{ paddingLeft: 32 }}
                                        />
                                        <FaSearch style={{ position: "absolute", left: 8, top: 10, color: "#a7c5eb" }} />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label style={{ fontWeight: 600, color: "#6f9fd7", marginBottom: 6, display: "block" }}>
                                        Ordenar por
                                    </label>
                                    <Select
                                        options={ordenOptions}
                                        value={orden}
                                        onChange={setOrden}
                                        placeholder="Selecciona orden..."
                                        isSearchable={false}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="table-responsive" style={{ overflow: "hidden", maxHeight: "none" }}>
                    <table className="table" style={{ marginBottom: 0 }}>
                        <thead className="table-dark" style={{ backgroundColor: "#a7c5eb" }}>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {categorias.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="text-center">Aún no hay datos en la Base de Datos.</td>
                            </tr>
                        ) : categoriasPaginadas.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="text-center">No hay categorías para mostrar.</td>
                            </tr>
                        ) : (
                            categoriasPaginadas.map((categoria, index) => (
                                <tr key={categoria.id} style={{ backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff" }}>
                                    <td>{categoria.id}</td>
                                    <td>{categoria.nombre}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm"
                                            style={{ backgroundColor: "#6f9fd7", color: "#fff", borderRadius: "6px", marginRight: 6 }}
                                            onClick={() => {
                                                setNuevaCategoria({ id: categoria.id, nombre: categoria.nombre });
                                                setShowModal(true);
                                            }}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            className="btn btn-sm"
                                            style={{ backgroundColor: "#e74c3c", color: "#fff", borderRadius: "6px" }}
                                            onClick={() => handleEliminar(categoria.id)}
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
                                    onClick={() => setCurrentPage(currentPage - 1)}
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
                                    onClick={() => setCurrentPage(currentPage + 1)}
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
                                    <h5 className="modal-title">{nuevaCategoria.id ? 'Editar Categoría de Producto' : 'Agregar Categoría de Producto'}</h5>
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
                                                value={nuevaCategoria.nombre}
                                                onChange={(e) => setNuevaCategoria({ ...nuevaCategoria, [e.target.name]: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="btn" style={{ backgroundColor: '#a7c5eb', width: '100%', color: '#fff' }}>
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

export default CategoryProducts;