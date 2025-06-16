import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { FaSearch, FaChevronLeft, FaChevronRight, FaFilter, FaTimes } from "react-icons/fa";
import Select from "react-select";

// Tipos de filtro disponibles
const filtroTipos = [
    { value: "origen", label: "Origen" },
    { value: "orden", label: "Ordenar" }
];

const origenes = [
    { value: "todos", label: "Todos" },
    { value: "caja", label: "Caja" },
    { value: "factura", label: "Factura" }
];

const ordenTipoOptions = [
    { value: "fecha", label: "Por fecha" },
    { value: "monto", label: "Por monto" }
];

const ordenSentidoOptions = [
    { value: "desc", label: "Descendente" },
    { value: "asc", label: "Ascendente" }
];

const IngresosComponent = () => {
    const [ingresos, setIngresos] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [ingresosPorPagina] = useState(9);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [filtrosActivos, setFiltrosActivos] = useState([]);
    const [nuevoFiltro, setNuevoFiltro] = useState(null);
    const [nuevoValorFiltro, setNuevoValorFiltro] = useState([]);
    const [ordenTipo, setOrdenTipo] = useState(null);
    const [ordenSentido, setOrdenSentido] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const filterRef = useRef(null);
    const token = localStorage.getItem("authToken");

    useEffect(() => {
        if (!token) {
            setError("No se encontró un token de autenticación. Por favor, inicie sesión nuevamente.");
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
                const ingresosResponse = await axios.get(
                    `http://localhost:8080/ingresos/organizacion/${userResponse.data.organizacion.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setIngresos(Array.isArray(ingresosResponse.data) ? ingresosResponse.data : []);
            } catch {
                setError("Error al obtener los ingresos. Por favor, intente de nuevo más tarde.");
            }
        };
        fetchData();
    }, [token]);

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

    // Animación para el filtro
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

    // Añadir filtro activo
    const handleAddFiltro = () => {
        if (!nuevoFiltro) return;
        if (nuevoFiltro.value === "orden") {
            if (!ordenTipo || !ordenSentido) return;
            setFiltrosActivos([
                ...filtrosActivos.filter(f => f.tipo !== "orden"),
                {
                    tipo: "orden",
                    valor: {
                        tipo: ordenTipo.value,
                        sentido: ordenSentido.value,
                        label: `${ordenTipo.label} (${ordenSentido.label})`
                    }
                }
            ]);
            setNuevoFiltro(null);
            setOrdenTipo(null);
            setOrdenSentido(null);
            setNuevoValorFiltro([]);
        } else if (nuevoFiltro.value === "origen") {
            if (!nuevoValorFiltro.length) return;
            const nuevos = nuevoValorFiltro.filter(val =>
                !filtrosActivos.some(f => f.tipo === "origen" && f.valor.value === val.value)
            ).map(val => ({ tipo: "origen", valor: val }));
            setFiltrosActivos([...filtrosActivos.filter(f => f.tipo !== "origen"), ...nuevos]);
            setNuevoFiltro(null);
            setNuevoValorFiltro([]);
        }
    };

    // Eliminar filtro activo
    const handleRemoveFiltro = (tipo, valor) => {
        setFiltrosActivos(filtrosActivos.filter(f => {
            if (tipo === "orden") return f.tipo !== "orden";
            return !(f.tipo === tipo && f.valor.value === valor);
        }));
    };

    // Eliminar todos los filtros
    const handleRemoveAllFiltros = () => {
        setFiltrosActivos([]);
    };

    // Render de chips de filtros activos
    const renderFiltroChip = (filtro) => (
        <span key={filtro.tipo + (filtro.tipo === "orden" ? filtro.valor.tipo + filtro.valor.sentido : filtro.valor.value)}
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
            {filtro.tipo === "orden"
                ? `Orden: ${filtro.valor.label}`
                : `${filtroTipos.find(f => f.value === filtro.tipo)?.label}: ${filtro.valor.label}`
            }
            <FaTimes
                style={{ marginLeft: 6, cursor: "pointer" }}
                onClick={() => handleRemoveFiltro(filtro.tipo, filtro.valor.value)}
            />
        </span>
    );

    // Render del selector de valor según tipo de filtro (multi)
    const renderValorFiltro = () => {
        if (!nuevoFiltro) return null;
        if (nuevoFiltro.value === "orden") {
            return (
                <div className="mt-2">
                    <label style={{ fontWeight: 500, color: "#6f9fd7" }}>Tipo de orden</label>
                    <Select
                        options={ordenTipoOptions}
                        value={ordenTipo}
                        onChange={setOrdenTipo}
                        placeholder="Selecciona tipo..."
                        isSearchable={false}
                        className="mb-2"
                    />
                    <label style={{ fontWeight: 500, color: "#6f9fd7" }}>Sentido</label>
                    <Select
                        options={ordenSentidoOptions}
                        value={ordenSentido}
                        onChange={setOrdenSentido}
                        placeholder="Selecciona sentido..."
                        isSearchable={false}
                    />
                </div>
            );
        }
        if (nuevoFiltro.value === "origen") {
            return (
                <Select
                    isMulti
                    options={origenes}
                    value={nuevoValorFiltro}
                    onChange={setNuevoValorFiltro}
                    placeholder="Selecciona origen..."
                    className="mt-2"
                />
            );
        }
        return null;
    };

    // Filtrado avanzado y búsqueda por todos los campos
    let ingresosFiltrados = ingresos.filter(ingreso => {
        let match = true;
        for (const filtro of filtrosActivos) {
            if (filtro.tipo === "origen") {
                if (filtro.valor.value === "caja" && !ingreso.caja) match = false;
                if (filtro.valor.value === "factura" && !ingreso.factura) match = false;
                // "todos" no filtra nada
            }
        }
        // Búsqueda por todos los campos
        const valoresIngreso = [
            ingreso.id?.toString(),
            ingreso.monto?.toFixed(2),
            ingreso.fecha ? new Date(ingreso.fecha).toLocaleDateString() : "",
            ingreso.caja?.nombre,
            ingreso.factura?.numeroFactura,
        ];
        const matchSearch = searchQuery.trim() === "" || valoresIngreso.some(valor =>
            valor?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
        return match && matchSearch;
    });

    // Ordenar por filtro de orden
    const filtroOrden = filtrosActivos.find(f => f.tipo === "orden");
    if (filtroOrden && filtroOrden.valor) {
        const { tipo, sentido } = filtroOrden.valor;
        if (tipo === "fecha") {
            ingresosFiltrados.sort((a, b) =>
                sentido === "desc"
                    ? new Date(b.fecha) - new Date(a.fecha)
                    : new Date(a.fecha) - new Date(b.fecha)
            );
        } else if (tipo === "monto") {
            ingresosFiltrados.sort((a, b) =>
                sentido === "desc"
                    ? (b.monto || 0) - (a.monto || 0)
                    : (a.monto || 0) - (b.monto || 0)
            );
        }
    } else {
        // Por defecto, por fecha descendente
        ingresosFiltrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    const totalPages = Math.ceil(ingresosFiltrados.length / ingresosPorPagina);
    const ingresosPaginados = ingresosFiltrados.slice(
        (currentPage - 1) * ingresosPorPagina,
        currentPage * ingresosPorPagina
    );

    // Paginación avanzada
    const renderPaginationButtons = () => {
        let buttons = [];
        if (totalPages <= 1) return buttons;
        buttons.push(
            <li key={1} className={`page-item ${currentPage === 1 ? 'active' : ''}`}>
                <button
                    className="page-link"
                    onClick={() => setCurrentPage(1)}
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
                    <span className="page-link" style={{ background: "transparent", color: "#6f9fd7", border: "none", cursor: "default" }}>...</span>
                </li>
            );
        }
        if (currentPage - 1 > 1) {
            buttons.push(
                <li key={currentPage - 1} className="page-item">
                    <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage - 1)}
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
                        onClick={() => setCurrentPage(currentPage)}
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
                        onClick={() => setCurrentPage(currentPage + 1)}
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
                    <span className="page-link" style={{ background: "transparent", color: "#6f9fd7", border: "none", cursor: "default" }}>...</span>
                </li>
            );
        }
        if (totalPages > 1) {
            buttons.push(
                <li key={totalPages} className={`page-item ${currentPage === totalPages ? 'active' : ''}`}>
                    <button
                        className="page-link"
                        onClick={() => setCurrentPage(totalPages)}
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

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="container mt-4">
                <h2 className="text-center mb-4" style={{ borderBottom: '2px solid #a7c5eb', paddingBottom: '10px' }}>
                    Registro de Ingresos
                </h2>
                {error && <div className="alert alert-danger text-center">{error}</div>}

                <div className="d-flex justify-content-between mb-3" style={{ position: "relative" }}>
                    <div></div>
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
                                            placeholder="Buscar ingreso..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            style={{ paddingLeft: 32 }}
                                        />
                                        <FaSearch style={{ position: "absolute", left: 8, top: 10, color: "#a7c5eb" }} />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label style={{ fontWeight: 600, color: "#6f9fd7", marginBottom: 6, display: "block" }}>
                                        Añadir filtro
                                    </label>
                                    <Select
                                        options={filtroTipos}
                                        value={nuevoFiltro}
                                        onChange={setNuevoFiltro}
                                        placeholder="Selecciona filtro..."
                                        isSearchable={false}
                                    />
                                    {renderValorFiltro()}
                                    <button
                                        className="btn btn-sm mt-2"
                                        style={{ backgroundColor: "#6f9fd7", color: "#fff", borderRadius: "8px", width: "100%" }}
                                        onClick={handleAddFiltro}
                                        disabled={
                                            !nuevoFiltro ||
                                            (nuevoFiltro.value === "orden"
                                                ? !(ordenTipo && ordenSentido)
                                                : !nuevoValorFiltro.length)
                                        }
                                    >
                                        Añadir filtro
                                    </button>
                                </div>
                                {filtrosActivos.length > 0 && (
                                    <div className="mb-2">
                                        <div style={{ fontWeight: 600, color: "#6f9fd7", marginBottom: 6 }}>Filtros activos:</div>
                                        <div>{filtrosActivos.map(renderFiltroChip)}</div>
                                        <button
                                            className="btn btn-link p-0 mt-1"
                                            style={{ color: "#e74c3c", fontSize: 13 }}
                                            onClick={handleRemoveAllFiltros}
                                        >
                                            Quitar todos
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table">
                        <thead className="table-dark" style={{ backgroundColor: '#a7c5eb' }}>
                        <tr>
                            <th>ID</th>
                            <th>Monto</th>
                            <th>Fecha</th>
                            <th>Origen</th>
                        </tr>
                        </thead>
                        <tbody>
                        {ingresos.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center">Aún no hay datos en la base de datos.</td>
                            </tr>
                        ) : ingresosPaginados.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center">No hay ingresos para mostrar.</td>
                            </tr>
                        ) : (
                            ingresosPaginados.map((ingreso, index) => (
                                <tr key={ingreso.id} style={{ backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff" }}>
                                    <td>{ingreso.id}</td>
                                    <td>{ingreso.monto?.toFixed(2) || "0.00"}€</td>
                                    <td>{ingreso.fecha ? new Date(ingreso.fecha).toLocaleDateString() : "N/A"}</td>
                                    <td>
                                        {ingreso.caja
                                            ? `Caja: ${ingreso.caja.nombre}`
                                            : ingreso.factura
                                                ? `Factura: ${ingreso.factura.numeroFactura}`
                                                : "Desconocido"}
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
            </div>
        </div>
    );
};

export default IngresosComponent;