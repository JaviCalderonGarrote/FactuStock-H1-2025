import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaPlusCircle, FaFilter, FaTimes, FaChevronLeft, FaChevronRight, FaPencilAlt, FaFileDownload } from "react-icons/fa";
import Select from "react-select";
import { Modal, Button, Form } from "react-bootstrap";

// Opciones de filtro y orden
const filtroTipos = [
    { value: "cliente", label: "Cliente" },
    { value: "usuario", label: "Usuario" },
    { value: "formaPago", label: "Forma de Pago" },
    { value: "estado", label: "Estado" },
    { value: "orden", label: "Ordenar" }
];

// Opciones de orden personalizadas
const ordenTipoOptions = [
    { value: "fecha", label: "Por fecha" },
    { value: "total", label: "Por total" }
];

const ordenSentidoOptions = [
    { value: "desc", label: "Descendente" },
    { value: "asc", label: "Ascendente" }
];

const estadoColors = {
    ENVIADA: { border: "#6f9fd7", bg: "#e3eefd", color: "#6f9fd7" },
    RECIBIDA: { border: "#2ecc71", bg: "#eafaf1", color: "#27ae60" },
    ERROR: { border: "#e74c3c", bg: "#fdecea", color: "#e74c3c" },
    COMPLETADA: { border: "#f1c40f", bg: "#fef9e7", color: "#b7950b" }
};

const formaPagoColors = {
    NoCobrada: { border: "#b2bec3", bg: "#f5f6fa", color: "#636e72" },
    EFECTIVO: { border: "#27ae60", bg: "#eafaf1", color: "#27ae60" },
    TARJETA: { border: "#2980b9", bg: "#eaf1fb", color: "#2980b9" },
    TRANSFERENCIA: { border: "#8e44ad", bg: "#f5eaf7", color: "#8e44ad" }
};

const EstadoFactura = {
    ENVIADA: "ENVIADA",
    RECIBIDA: "RECIBIDA",
    ERROR: "ERROR",
    COMPLETADA: "COMPLETADA"
};

const FormaPago = {
    NoCobrada: "NoCobrada",
    EFECTIVO: "EFECTIVO",
    TARJETA: "TARJETA",
    TRANSFERENCIA: "TRANSFERENCIA"
};

const FacturaComponent = () => {
    const [facturas, setFacturas] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [facturasPorPagina] = useState(8);
    const [showModal, setShowModal] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [filtrosActivos, setFiltrosActivos] = useState([]);
    const [nuevoFiltro, setNuevoFiltro] = useState(null);
    const [nuevoValorFiltro, setNuevoValorFiltro] = useState([]);
    const [ordenTipo, setOrdenTipo] = useState(null);
    const [ordenSentido, setOrdenSentido] = useState(null);
    const [editingFactura, setEditingFactura] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const filterTimeout = useRef(null);
    const filterRef = useRef(null);
    const token = localStorage.getItem("authToken");
    const navigate = useNavigate();

    // Opciones para los filtros
    const [clienteOptions, setClienteOptions] = useState([]);
    const [usuarioOptions, setUsuarioOptions] = useState([]);
    const formaPagoOptions = Object.keys(FormaPago).map(key => ({
        value: FormaPago[key],
        label: FormaPago[key]
    }));
    const estadoOptions = Object.keys(EstadoFactura).map(key => ({
        value: EstadoFactura[key],
        label: EstadoFactura[key]
    }));

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
                const facturasResponse = await axios.get(
                    `http://localhost:8080/facturas/organizacion/${userResponse.data.organizacion.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setFacturas(facturasResponse.data || []);
                // Opciones de filtro dinámicas
                const clientes = [];
                const usuarios = [];
                (facturasResponse.data || []).forEach(f => {
                    if (f.empresaPersonaFisica && !clientes.find(c => c.value === f.empresaPersonaFisica.id)) {
                        clientes.push({ value: f.empresaPersonaFisica.id, label: f.empresaPersonaFisica.nombre });
                    }
                    if (f.usuario && !usuarios.find(u => u.value === f.usuario.id)) {
                        usuarios.push({ value: f.usuario.id, label: f.usuario.username });
                    }
                });
                setClienteOptions(clientes);
                setUsuarioOptions(usuarios);
            } catch {
                setError("Error al obtener las facturas.");
            }
        };
        fetchData();
    }, [token]);

    // Cierre automático del filtro por inactividad
    useEffect(() => {
        if (showFilterDropdown) {
            filterTimeout.current = setTimeout(() => setShowFilterDropdown(false), 10000);
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

    // Añadir filtro activo
    const handleAddFiltro = () => {
        if (!nuevoFiltro) return;
        if (nuevoFiltro.value === "orden") {
            if (!ordenTipo || !ordenSentido) return;
            // Solo puede haber un filtro de orden
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
        } else {
            if (!nuevoValorFiltro.length) return;
            const nuevos = nuevoValorFiltro.filter(val =>
                !filtrosActivos.some(f => f.tipo === nuevoFiltro.value && f.valor.value === val.value)
            ).map(val => ({ tipo: nuevoFiltro.value, valor: val }));
            setFiltrosActivos([...filtrosActivos, ...nuevos]);
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

    // Filtrado avanzado y búsqueda por todos los campos
    let facturasFiltradas = facturas.filter(factura => {
        let match = true;
        for (const filtro of filtrosActivos) {
            if (filtro.tipo === "cliente" && factura.empresaPersonaFisica?.id !== filtro.valor.value) match = false;
            if (filtro.tipo === "usuario" && factura.usuario?.id !== filtro.valor.value) match = false;
            if (filtro.tipo === "formaPago" && factura.formaPago !== filtro.valor.value) match = false;
            if (filtro.tipo === "estado" && factura.estado !== filtro.valor.value) match = false;
        }
        // Búsqueda por todos los campos
        const valoresFactura = [
            factura.numeroFactura,
            factura.empresaPersonaFisica?.nombre,
            factura.usuario?.username,
            factura.formaPago,
            factura.fecha ? new Date(factura.fecha).toLocaleDateString() : "",
            factura.total?.toFixed(2),
            factura.estado
        ];
        const matchSearch = searchQuery.trim() === "" || valoresFactura.some(valor =>
            valor?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
        return match && matchSearch;
    });

    // Ordenar por filtro de orden
    const filtroOrden = filtrosActivos.find(f => f.tipo === "orden");
    if (filtroOrden && filtroOrden.valor) {
        const { tipo, sentido } = filtroOrden.valor;
        if (tipo === "fecha") {
            facturasFiltradas.sort((a, b) =>
                sentido === "desc"
                    ? new Date(b.fecha) - new Date(a.fecha)
                    : new Date(a.fecha) - new Date(b.fecha)
            );
        } else if (tipo === "total") {
            facturasFiltradas.sort((a, b) =>
                sentido === "desc"
                    ? (b.total || 0) - (a.total || 0)
                    : (a.total || 0) - (b.total || 0)
            );
        }
    } else {
        // Por defecto, por fecha descendente
        facturasFiltradas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    const totalPages = Math.ceil(facturasFiltradas.length / facturasPorPagina);
    const facturasPaginadas = facturasFiltradas.slice(
        (currentPage - 1) * facturasPorPagina,
        currentPage * facturasPorPagina
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
        let options = [];
        if (nuevoFiltro.value === "cliente") options = clienteOptions;
        if (nuevoFiltro.value === "usuario") options = usuarioOptions;
        if (nuevoFiltro.value === "formaPago") options = formaPagoOptions;
        if (nuevoFiltro.value === "estado") options = estadoOptions;
        return (
            <Select
                isMulti
                options={options}
                value={nuevoValorFiltro}
                onChange={setNuevoValorFiltro}
                placeholder="Selecciona valor..."
                className="mt-2"
            />
        );
    };

    // Render badge de estado
    const renderEstadoBadge = (estado) => {
        const c = estadoColors[estado] || estadoColors.ENVIADA;
        return (
            <span style={{
                padding: '6px 12px',
                borderRadius: '4px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                fontSize: '0.75em',
                display: 'inline-block',
                width: '120px',
                textAlign: 'center',
                color: c.color,
                backgroundColor: c.bg,
                border: `2px solid ${c.border}`,
            }}>{estado}</span>
        );
    };

    // Render badge de forma de pago
    const renderFormaPagoBadge = (formaPago) => {
        const c = formaPagoColors[formaPago] || formaPagoColors.NoCobrada;
        return (
            <span style={{
                padding: '6px 12px',
                borderRadius: '4px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                fontSize: '0.75em',
                display: 'inline-block',
                width: '120px',
                textAlign: 'center',
                color: c.color,
                backgroundColor: c.bg,
                border: `2px solid ${c.border}`,
            }}>{formaPago}</span>
        );
    };

    // --- MODAL DE EDICIÓN Y DESCARGA ---
    const handleDownload = async (facturaId) => {
        try {
            const response = await axios.get(`http://localhost:8080/facturas/${facturaId}/pdf`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            // Obtener el nombre del archivo del header si existe, si no, usar uno por defecto
            let filename = `Factura_${facturaId}.pdf`;
            const disposition = response.headers['content-disposition'];
            if (disposition && disposition.indexOf('filename=') !== -1) {
                // Extraer el nombre del archivo, soportando posibles comillas y espacios
                const match = disposition.match(/filename="?([^"]+)"?/);
                if (match && match[1]) {
                    filename = match[1];
                }
            }
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            Swal.fire("Error", "Ocurrió un problema al descargar el PDF.", "error");
        }
    };

    const handleEdit = (factura) => {
        setEditingFactura({ ...factura, tempEstado: factura.estado, tempFormaPago: factura.formaPago });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingFactura(null);
    };

    const handleEstadoChange = (e) => {
        const newEstado = e.target.value;
        let newFormaPago = editingFactura.tempFormaPago;
        if (newEstado === EstadoFactura.ERROR) {
            newFormaPago = FormaPago.NoCobrada;
        } else if (newEstado === EstadoFactura.COMPLETADA) {
            newFormaPago = [FormaPago.EFECTIVO, FormaPago.TARJETA, FormaPago.TRANSFERENCIA].includes(newFormaPago)
                ? newFormaPago
                : FormaPago.EFECTIVO;
        } else if (newEstado === EstadoFactura.ENVIADA) {
            newFormaPago = FormaPago.NoCobrada;
        } else if (newEstado === EstadoFactura.RECIBIDA) {
            newFormaPago = newFormaPago === FormaPago.NoCobrada ? newFormaPago : FormaPago.EFECTIVO;
        }
        setEditingFactura(prev => ({
            ...prev,
            tempEstado: newEstado,
            tempFormaPago: newFormaPago
        }));
    };

    const handleFormaPagoChange = (e) => {
        const newFormaPago = e.target.value;
        setEditingFactura(prev => ({
            ...prev,
            tempFormaPago: newFormaPago
        }));
    };

    const getFormasPagoDisponibles = (estado) => {
        switch (estado) {
            case EstadoFactura.COMPLETADA:
                return [FormaPago.EFECTIVO, FormaPago.TARJETA, FormaPago.TRANSFERENCIA];
            case EstadoFactura.ERROR:
                return [FormaPago.NoCobrada];
            case EstadoFactura.RECIBIDA:
                return [FormaPago.NoCobrada, FormaPago.EFECTIVO, FormaPago.TARJETA, FormaPago.TRANSFERENCIA];
            case EstadoFactura.ENVIADA:
                return [FormaPago.NoCobrada];
            default:
                return Object.values(FormaPago);
        }
    };

    const handleSaveChanges = async () => {
        try {
            const updatedFactura = {
                ...editingFactura,
                estado: editingFactura.tempEstado,
                formaPago: editingFactura.tempFormaPago
            };
            if (!Object.values(EstadoFactura).includes(updatedFactura.estado)) {
                Swal.fire("Error", "Estado de factura no válido", "error");
                return;
            }
            if (!Object.values(FormaPago).includes(updatedFactura.formaPago)) {
                Swal.fire("Error", "Forma de pago no válida", "error");
                return;
            }
            if (updatedFactura.estado === EstadoFactura.ERROR && updatedFactura.formaPago !== FormaPago.NoCobrada) {
                Swal.fire("Error", "Cuando el estado es ERROR, la forma de pago debe ser NoCobrada", "error");
                return;
            }
            if (updatedFactura.estado === EstadoFactura.ENVIADA && updatedFactura.formaPago !== FormaPago.NoCobrada) {
                Swal.fire("Error", "Cuando el estado es ENVIADA, la forma de pago debe ser NoCobrada", "error");
                return;
            }
            if (updatedFactura.estado === EstadoFactura.COMPLETADA && updatedFactura.formaPago === FormaPago.NoCobrada) {
                Swal.fire("Error", "Cuando el estado es COMPLETADA, la forma de pago no puede ser NoCobrada", "error");
                return;
            }
            await axios.put(`http://localhost:8080/facturas/${editingFactura.id}`, updatedFactura, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const updatedFacturas = facturas.map(f =>
                f.id === editingFactura.id ? updatedFactura : f
            );
            setFacturas(updatedFacturas);
            handleCloseModal();
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Factura actualizada correctamente',
                timer: 1500,
                showConfirmButton: false
            });
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un problema al actualizar la factura.',
            });
        }
    };

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

    // Mostrar filtro usuario solo si hay más de uno
    const filtroTiposFiltrados = usuarioOptions.length > 1
        ? filtroTipos
        : filtroTipos.filter(f => f.value !== "usuario");

    return (
        <div className="d-flex" style={{ height: "100vh", overflow: "hidden" }}>
            <Sidebar />
            <div className="container mt-4" style={{ overflow: "hidden" }}>
                <h2 className="text-center mb-4" style={{ borderBottom: "2px solid #a7c5eb", paddingBottom: "10px" }}>
                    Facturas Emitidas
                </h2>
                {error && <div className="alert alert-danger text-center">{error}</div>}
                <div className="d-flex justify-content-between mb-3" style={{ position: "relative" }}>
                    <button
                        className="btn"
                        style={{ backgroundColor: "#6f9fd7", color: "#fff", borderRadius: "8px", padding: "8px 16px", border: "none" }}
                        onClick={() => navigate('/nueva-factura')}
                    >
                        <FaPlusCircle className="me-2" />
                        Crear nueva Factura
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
                                            placeholder="Buscar factura..."
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
                                        options={filtroTiposFiltrados}
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
                <div className="table-responsive" style={{ overflow: "hidden", maxHeight: "none" }}>
                    <table className="table" style={{ marginBottom: 0 }}>
                        <thead className="table-dark" style={{ backgroundColor: "#a7c5eb" }}>
                        <tr>
                            <th>Número</th>
                            <th>Cliente</th>
                            <th>Usuario</th>
                            <th>Forma de Pago</th>
                            <th>Fecha</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                        </thead>
                        <tbody>
                        {facturasPaginadas.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center">No hay facturas para mostrar.</td>
                            </tr>
                        ) : (
                            facturasPaginadas.map((factura, index) => (
                                <tr key={factura.id} style={{ backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff" }}>
                                    <td>{factura.numeroFactura}</td>
                                    <td>{factura.empresaPersonaFisica?.nombre || 'N/A'}</td>
                                    <td>{factura.usuario?.username || 'N/A'}</td>
                                    <td>{renderFormaPagoBadge(factura.formaPago)}</td>
                                    <td>{factura.fecha ? new Date(factura.fecha).toLocaleDateString() : 'N/A'}</td>
                                    <td>{factura.total?.toFixed(2) || '0.00'}€</td>
                                    <td>{renderEstadoBadge(factura.estado)}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-outline-primary me-2"
                                            title="Editar Factura"
                                            onClick={() => handleEdit(factura)}
                                        >
                                            <FaPencilAlt />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-secondary"
                                            title="Descargar PDF"
                                            onClick={() => handleDownload(factura.id)}
                                        >
                                            <FaFileDownload />
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
                <Modal show={showModal} onHide={handleCloseModal}>
                    <Modal.Header closeButton style={{ backgroundColor: '#f0f8ff' }}>
                        <Modal.Title style={{ color: '#2c3e50' }}>Editar Factura</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ backgroundColor: '#f9f9f9' }}>
                        {editingFactura && (
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="estado" style={{ fontWeight: 'bold', color: '#34495e' }}>Estado</Form.Label>
                                    <Form.Control
                                        id="estado"
                                        as="select"
                                        value={editingFactura.tempEstado}
                                        onChange={handleEstadoChange}
                                        style={{ borderColor: '#bdc3c7', borderRadius: '8px' }}
                                    >
                                        {Object.values(EstadoFactura).map(estado => (
                                            <option key={estado} value={estado}>{estado}</option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="formaPago" style={{ fontWeight: 'bold', color: '#34495e' }}>Forma de Pago</Form.Label>
                                    <Form.Control
                                        id="formaPago"
                                        as="select"
                                        value={editingFactura.tempFormaPago}
                                        onChange={handleFormaPagoChange}
                                        style={{ borderColor: '#bdc3c7', borderRadius: '8px' }}
                                        disabled={editingFactura.tempEstado === EstadoFactura.ERROR}
                                    >
                                        {getFormasPagoDisponibles(editingFactura.tempEstado).map(formaPago => (
                                            <option key={formaPago} value={formaPago}>{formaPago}</option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </Form>
                        )}
                    </Modal.Body>
                    <Modal.Footer style={{ backgroundColor: '#f0f8ff' }}>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Cerrar
                        </Button>
                        <Button variant="primary" onClick={handleSaveChanges}>
                            Guardar Cambios
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
};

export default FacturaComponent;