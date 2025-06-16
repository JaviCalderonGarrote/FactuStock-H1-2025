import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaPlusCircle, FaLock, FaChevronLeft, FaChevronRight, FaEllipsisH, FaFilter, FaTimes } from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap";
import Select from "react-select";

const EstadoCaja = {
    ABIERTA: "ABIERTA",
    CERRADA: "CERRADA"
};

const filtroTipos = [
    { value: "estado", label: "Estado" },
    { value: "orden", label: "Ordenar" },
    { value: "fecha", label: "Rango de Fecha" }
];

const ordenTipoOptions = [
    { value: "fechaInicio", label: "Por fecha" },
    { value: "totalIngresado", label: "Por total ingresado" },
    { value: "cantidadVentas", label: "Por cantidad de ventas" }
];

const ordenSentidoOptions = [
    { value: "desc", label: "Descendente" },
    { value: "asc", label: "Ascendente" }
];

const estadoOptions = [
    { value: EstadoCaja.ABIERTA, label: "Abierta" },
    { value: EstadoCaja.CERRADA, label: "Cerrada" }
];

const CajaComponent = () => {
    const [cajas, setCajas] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [cajasPorPagina] = useState(9);
    const [searchQuery, setSearchQuery] = useState("");
    const [inputFocused, setInputFocused] = useState(false); // No usado, puedes eliminarlo si quieres
    const [showModal, setShowModal] = useState(false);
    const [nuevaCaja, setNuevaCaja] = useState({ nombre: "" });
    const [organizacion, setOrganizacion] = useState(null);
    const [usuario, setUsuario] = useState(null);
    const token = localStorage.getItem("authToken");
    const navigate = useNavigate(); // No usado, puedes eliminarlo si quieres

    // Filtros avanzados
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [filtrosActivos, setFiltrosActivos] = useState([]);
    const [nuevoFiltro, setNuevoFiltro] = useState(null);
    const [nuevoValorFiltro, setNuevoValorFiltro] = useState([]);
    const [ordenTipo, setOrdenTipo] = useState(null);
    const [ordenSentido, setOrdenSentido] = useState(null);
    const [rangoFecha, setRangoFecha] = useState([null, null]);
    const filterRef = useRef(null);

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
                const cajasResponse = await axios.get(
                    `http://localhost:8080/cajas/organizacion/${userResponse.data.organizacion.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setCajas(cajasResponse.data || []);
            } catch {
                setError("Error al obtener las cajas.");
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

    const handleCrearCaja = () => {
        const cajaAbierta = cajas.find(caja => caja.estado === EstadoCaja.ABIERTA);
        if (cajaAbierta) {
            Swal.fire({
                icon: 'warning',
                title: 'Caja abierta existente',
                text: 'Ya hay una caja abierta. Debes cerrarla antes de crear una nueva.',
                confirmButtonColor: '#6f9fd7'
            });
        } else {
            setShowModal(true);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setNuevaCaja({ nombre: "" });
    };

    const handleSaveNuevaCaja = async () => {
        try {
            const cajaAbierta = cajas.find(caja => caja.estado === EstadoCaja.ABIERTA);
            if (cajaAbierta) {
                Swal.fire('Error', 'Ya hay una caja abierta. Debes cerrarla antes de crear una nueva.', 'error');
                return;
            }
            const nuevaCajaData = {
                nombre: nuevaCaja.nombre,
                organizacion: organizacion,
                usuario: usuario
            };
            const response = await axios.post('http://localhost:8080/cajas', nuevaCajaData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCajas(prevCajas => [
                response.data,
                ...prevCajas
            ]);
            handleCloseModal();
            Swal.fire('Éxito', 'Nueva caja creada correctamente', 'success');
        } catch (error) {
            console.error("Error al crear la caja:", error);
            Swal.fire('Error', 'No se pudo crear la caja: ' + error.message, 'error');
        }
    };

    const handleCerrarCaja = async (cajaId) => {
        try {
            const cajaToClose = cajas.find(caja => caja.id === cajaId);
            if (!cajaToClose || cajaToClose.estado === EstadoCaja.CERRADA) {
                Swal.fire('Error', 'Esta caja ya está cerrada o no existe', 'error');
                return;
            }
            const result = await Swal.fire({
                title: '¿Cerrar caja?',
                text: "¿Estás seguro de que quieres cerrar esta caja?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, cerrar caja',
                cancelButtonText: 'Cancelar'
            });
            if (result.isConfirmed) {
                const response = await axios.put(`http://localhost:8080/cajas/${cajaId}/cerrar`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.status === 200) {
                    setCajas(prevCajas =>
                        prevCajas.map(caja =>
                            caja.id === cajaId ? { ...caja, estado: EstadoCaja.CERRADA, fechaFin: new Date().toISOString() } : caja
                        )
                    );
                    Swal.fire('Éxito', 'Caja cerrada correctamente', 'success');
                }
            }
        } catch (error) {
            console.error("Error al cerrar la caja:", error);
            if (error.response && error.response.status === 403) {
                Swal.fire('Error', 'No tienes permiso para cerrar esta caja', 'error');
            } else {
                Swal.fire('Error', 'No se pudo cerrar la caja', 'error');
            }
        }
    };

    const getBadgeStyle = (borderColor, backgroundColor, textColor) => ({
        padding: '6px 12px',
        borderRadius: '4px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontSize: '0.75em',
        display: 'inline-block',
        width: '120px',
        textAlign: 'center',
        color: textColor,
        backgroundColor: backgroundColor,
        border: `2px solid ${borderColor}`,
    });

    const getEstadoBadge = (estado) => {
        switch (estado) {
            case EstadoCaja.ABIERTA:
                return <span style={getBadgeStyle('#32CD32', '#E8F5E9', '#32CD32')}>Abierta</span>;
            case EstadoCaja.CERRADA:
                return <span style={getBadgeStyle('#FF0000', '#FFEBEE', '#FF0000')}>Cerrada</span>;
            default:
                return null;
        }
    };

    // --- Filtros y orden avanzado ---
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
            setRangoFecha([null, null]);
        } else if (nuevoFiltro.value === "estado") {
            if (!nuevoValorFiltro.length) return;
            const nuevos = nuevoValorFiltro.filter(val =>
                !filtrosActivos.some(f => f.tipo === "estado" && f.valor.value === val.value)
            ).map(val => ({ tipo: "estado", valor: val }));
            setFiltrosActivos([...filtrosActivos, ...nuevos]);
            setNuevoFiltro(null);
            setNuevoValorFiltro([]);
        } else if (nuevoFiltro.value === "fecha") {
            if (!rangoFecha[0] && !rangoFecha[1]) return;
            setFiltrosActivos([
                ...filtrosActivos.filter(f => f.tipo !== "fecha"),
                {
                    tipo: "fecha",
                    valor: rangoFecha
                }
            ]);
            setNuevoFiltro(null);
            setRangoFecha([null, null]);
        }
    };

    const handleRemoveFiltro = (tipo, valor) => {
        if (tipo === "orden" || tipo === "fecha") {
            setFiltrosActivos(filtrosActivos.filter(f => f.tipo !== tipo));
        } else {
            setFiltrosActivos(filtrosActivos.filter(f => !(f.tipo === tipo && f.valor.value === valor)));
        }
    };

    const handleRemoveAllFiltros = () => {
        setFiltrosActivos([]);
    };

    // --- Filtrado y ordenado ---
    let cajasFiltradas = cajas.filter(caja => {
        let match = true;
        for (const filtro of filtrosActivos) {
            if (filtro.tipo === "estado" && caja.estado !== filtro.valor.value) match = false;
            if (filtro.tipo === "fecha") {
                const fechaCaja = new Date(caja.fechaInicio);
                const desde = filtro.valor[0] ? new Date(filtro.valor[0]) : null;
                const hasta = filtro.valor[1] ? new Date(filtro.valor[1]) : null;
                if ((desde && fechaCaja < desde) || (hasta && fechaCaja > hasta)) match = false;
            }
        }
        // Búsqueda por texto
        const valoresCaja = [
            caja.nombre,
            caja.fechaInicio ? new Date(caja.fechaInicio).toLocaleDateString() : "",
            caja.fechaFin ? new Date(caja.fechaFin).toLocaleDateString() : "",
            caja.totalIngresado?.toFixed(2),
            caja.cantidadVentas?.toString(),
            caja.estado
        ];
        const matchSearch = searchQuery.trim() === "" || valoresCaja.some(valor =>
            valor?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
        return match && matchSearch;
    });

    // Ordenar
    const filtroOrden = filtrosActivos.find(f => f.tipo === "orden");
    if (filtroOrden && filtroOrden.valor) {
        const { tipo, sentido } = filtroOrden.valor;
        cajasFiltradas.sort((a, b) => {
            let valA = a[tipo] || 0;
            let valB = b[tipo] || 0;
            if (tipo === "fechaInicio") {
                valA = new Date(valA);
                valB = new Date(valB);
                return sentido === "desc" ? valB - valA : valA - valB;
            }
            return sentido === "desc" ? (valB - valA) : (valA - valB);
        });
    } else {
        // Por defecto, por fecha descendente
        cajasFiltradas.sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio));
    }

    const totalPages = Math.ceil(cajasFiltradas.length / cajasPorPagina);
    const indexOfLastCaja = currentPage * cajasPorPagina;
    const indexOfFirstCaja = indexOfLastCaja - cajasPorPagina;
    const cajasPaginadas = cajasFiltradas.slice(indexOfFirstCaja, indexOfLastCaja);

    const handleChangePage = (newPage) => {
        setCurrentPage(newPage);
    };

    const renderPaginationButtons = () => {
        const buttons = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                buttons.push(
                    <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => handleChangePage(i)}
                            style={{
                                backgroundColor: currentPage === i ? '#6f9fd7' : 'transparent',
                                color: currentPage === i ? '#fff' : '#6f9fd7',
                                border: 'none'
                            }}
                        >{i}</button>
                    </li>
                );
            }
        } else {
            buttons.push(
                <li key={1} className={`page-item ${currentPage === 1 ? 'active' : ''}`}>
                    <button
                        className="page-link"
                        onClick={() => handleChangePage(1)}
                        style={{
                            backgroundColor: currentPage === 1 ? '#6f9fd7' : 'transparent',
                            color: currentPage === 1 ? '#fff' : '#6f9fd7',
                            border: 'none'
                        }}
                    >1</button>
                </li>
            );
            if (currentPage > 3) {
                buttons.push(<li key="ellipsis1" className="page-item disabled"><span className="page-link"><FaEllipsisH /></span></li>);
            }
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                buttons.push(
                    <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => handleChangePage(i)}
                            style={{
                                backgroundColor: currentPage === i ? '#6f9fd7' : 'transparent',
                                color: currentPage === i ? '#fff' : '#6f9fd7',
                                border: 'none'
                            }}
                        >{i}</button>
                    </li>
                );
            }
            if (currentPage < totalPages - 2) {
                buttons.push(<li key="ellipsis2" className="page-item disabled"><span className="page-link"><FaEllipsisH /></span></li>);
            }
            buttons.push(
                <li key={totalPages} className={`page-item ${currentPage === totalPages ? 'active' : ''}`}>
                    <button
                        className="page-link"
                        onClick={() => handleChangePage(totalPages)}
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

    // Render chips de filtros activos
    const renderFiltroChip = (filtro) => (
        <span key={filtro.tipo + (filtro.tipo === "orden" ? filtro.valor.tipo + filtro.valor.sentido : filtro.valor.value || "")}
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
                : filtro.tipo === "fecha"
                    ? `Rango: ${filtro.valor[0] ? new Date(filtro.valor[0]).toLocaleDateString() : "Sin inicio"} - ${filtro.valor[1] ? new Date(filtro.valor[1]).toLocaleDateString() : "Sin fin"}`
                    : `${filtroTipos.find(f => f.value === filtro.tipo)?.label}: ${filtro.valor.label}`
            }
            <FaTimes
                style={{ marginLeft: 6, cursor: "pointer" }}
                onClick={() => handleRemoveFiltro(filtro.tipo, filtro.valor.value)}
            />
        </span>
    );

    // Render del selector de valor según tipo de filtro
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
        if (nuevoFiltro.value === "estado") {
            return (
                <Select
                    isMulti
                    options={estadoOptions}
                    value={nuevoValorFiltro}
                    onChange={setNuevoValorFiltro}
                    placeholder="Selecciona estado..."
                    className="mt-2"
                />
            );
        }
        if (nuevoFiltro.value === "fecha") {
            return (
                <div className="mt-2">
                    <label style={{ fontWeight: 500, color: "#6f9fd7" }}>Desde</label>
                    <input
                        type="date"
                        className="form-control mb-2"
                        value={rangoFecha[0] || ""}
                        onChange={e => setRangoFecha([e.target.value, rangoFecha[1]])}
                    />
                    <label style={{ fontWeight: 500, color: "#6f9fd7" }}>Hasta</label>
                    <input
                        type="date"
                        className="form-control"
                        value={rangoFecha[1] || ""}
                        onChange={e => setRangoFecha([rangoFecha[0], e.target.value])}
                    />
                </div>
            );
        }
        return null;
    };

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="container mt-4">
                <h2 className="text-center mb-4" style={{ borderBottom: '2px solid #a7c5eb', paddingBottom: '10px' }}>
                    Gestión de Cajas
                </h2>

                {error ? (
                    <div className="alert alert-danger text-center">{error}</div>
                ) : (
                    <>
                        <div className="d-flex justify-content-between mb-3" style={{ position: "relative" }}>
                            <button
                                className="btn d-flex align-items-center"
                                style={{ backgroundColor: "#6f9fd7", color: "#fff", borderRadius: "8px", padding: "8px 16px", border: "none" }}
                                onClick={handleCrearCaja}
                            >
                                <FaPlusCircle className="me-2" />
                                Crear nueva Caja
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
                                                    placeholder="Buscar caja..."
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
                                                            : nuevoFiltro.value === "estado"
                                                                ? !nuevoValorFiltro.length
                                                                : nuevoFiltro.value === "fecha"
                                                                    ? (!rangoFecha[0] && !rangoFecha[1])
                                                                    : false
                                                    )
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
                            <table className="table" style={{ marginBottom: 0 }}>
                                <thead className="table-dark" style={{ backgroundColor: "#a7c5eb" }}>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Fecha Inicio</th>
                                    <th>Fecha Fin</th>
                                    <th>Total Ingresado</th>
                                    <th>Cantidad Ventas</th>
                                    <th>Estado</th>
                                    <th>Acción</th>
                                </tr>
                                </thead>
                                <tbody>
                                {cajasPaginadas.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center">
                                            Aún no hay datos en la base de datos
                                        </td>
                                    </tr>
                                ) : (
                                    cajasPaginadas.map((caja, index) => (
                                        <tr key={caja.id} style={{ backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff" }}>
                                            <td>{caja.nombre || "Caja"}</td>
                                            <td>{caja.fechaInicio ? new Date(caja.fechaInicio).toLocaleDateString() : "N/A"}</td>
                                            <td>{caja.fechaFin ? new Date(caja.fechaFin).toLocaleDateString() : "N/A"}</td>
                                            <td>{caja.totalIngresado?.toFixed(2) || "0.00"}€</td>
                                            <td>{caja.cantidadVentas || 0}</td>
                                            <td>{getEstadoBadge(caja.estado)}</td>
                                            <td>
                                                {caja.estado === EstadoCaja.ABIERTA && (
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        title="Cerrar Caja"
                                                        onClick={() => handleCerrarCaja(caja.id)}
                                                    >
                                                        <FaLock /> Cerrar
                                                    </button>
                                                )}
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
                                            onClick={() => handleChangePage(currentPage - 1)}
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
                                            onClick={() => handleChangePage(currentPage + 1)}
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

                        <Modal show={showModal} onHide={handleCloseModal}>
                            <Modal.Header closeButton style={{backgroundColor: '#a7c5eb', color: '#fff'}}>
                                <Modal.Title>Crear Nueva Caja</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form onSubmit={(e) => { e.preventDefault(); handleSaveNuevaCaja(); }}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nombre de la Caja (Opcional)</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={nuevaCaja.nombre}
                                            onChange={(e) => setNuevaCaja({...nuevaCaja, nombre: e.target.value})}
                                            placeholder="Dejar en blanco para nombre automático"
                                        />
                                    </Form.Group>
                                    <Button type="submit" style={{ backgroundColor: '#a7c5eb', width: '100%', color: '#fff', border: 'none' }}>
                                        Crear Caja
                                    </Button>
                                </Form>
                                <Button
                                    variant="secondary"
                                    onClick={handleCloseModal}
                                    className="mt-3"
                                    style={{ width: '100%' }}
                                >
                                    Cerrar
                                </Button>
                            </Modal.Body>
                        </Modal>
                    </>
                )}
            </div>
        </div>
    );
};

export default CajaComponent;