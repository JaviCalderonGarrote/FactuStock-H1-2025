import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import { FaSearch, FaPlusCircle, FaFileDownload, FaChevronLeft, FaChevronRight, FaFilter, FaTimes } from "react-icons/fa";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import Select from "react-select";

const EstadoGasto = {
    RECIBIDO: "RECIBIDO",
    COMPLETADO: "COMPLETADO",
    ERROR: "ERROR"
};

const FormaPagoGasto = {
    NO_PAGADA: "NO_PAGADA",
    EFECTIVO: "EFECTIVO",
    TARJETA: "TARJETA",
    TRANSFERENCIA: "TRANSFERENCIA"
};

const filtroTipos = [
    { value: "empresaPersonaFisica", label: "Empresa/Persona" },
    { value: "categoriaGasto", label: "Categoría" },
    { value: "formaPagoGasto", label: "Forma de Pago" },
    { value: "estado", label: "Estado" },
    { value: "orden", label: "Ordenar" }
];

const ordenTipoOptions = [
    { value: "fecha", label: "Por fecha" },
    { value: "monto", label: "Por monto" }
];

const ordenSentidoOptions = [
    { value: "desc", label: "Descendente" },
    { value: "asc", label: "Ascendente" }
];

const estadoColors = {
    RECIBIDO: { border: "#6f9fd7", bg: "#e3eefd", color: "#6f9fd7" },
    COMPLETADO: { border: "#2ecc71", bg: "#eafaf1", color: "#27ae60" },
    ERROR: { border: "#e74c3c", bg: "#fdecea", color: "#e74c3c" }
};

const formaPagoColors = {
    NO_PAGADA: { border: "#b2bec3", bg: "#f5f6fa", color: "#636e72" },
    EFECTIVO: { border: "#27ae60", bg: "#eafaf1", color: "#27ae60" },
    TARJETA: { border: "#2980b9", bg: "#eaf1fb", color: "#2980b9" },
    TRANSFERENCIA: { border: "#8e44ad", bg: "#f5eaf7", color: "#8e44ad" }
};

const getTodayLocalDateTime = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T00:00:00`;
};

const toLocalDateTime = (dateStr) => {
    if (!dateStr) return "";
    if (dateStr.includes("T")) return dateStr;
    return `${dateStr}T00:00:00`;
};

const GastosComponent = () => {
    const [gastos, setGastos] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [gastosPorPagina] = useState(8);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showNewGastoModal, setShowNewGastoModal] = useState(false);
    const [editingGasto, setEditingGasto] = useState(null);
    const [newGasto, setNewGasto] = useState({
        numFactura: "",
        monto: "",
        empresaPersonaFisica: null,
        fecha: getTodayLocalDateTime(),
        estado: EstadoGasto.RECIBIDO,
        formaPagoGasto: FormaPagoGasto.NO_PAGADA,
        categoriaGasto: null,
        archivo: null
    });
    const [categorias, setCategorias] = useState([]);
    const [empresasPersonasFisicas, setEmpresasPersonasFisicas] = useState([]);
    const [organizacion, setOrganizacion] = useState(null);

    // Filtros
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [filtrosActivos, setFiltrosActivos] = useState([]);
    const [nuevoFiltro, setNuevoFiltro] = useState(null);
    const [nuevoValorFiltro, setNuevoValorFiltro] = useState([]);
    const [ordenTipo, setOrdenTipo] = useState(null);
    const [ordenSentido, setOrdenSentido] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const filterTimeout = useRef(null);
    const filterRef = useRef(null);

    const token = localStorage.getItem("authToken");
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Opciones para filtros
    const formaPagoOptions = Object.keys(FormaPagoGasto).map(key => ({
        value: FormaPagoGasto[key],
        label: FormaPagoGasto[key]
    }));
    const estadoOptions = Object.keys(EstadoGasto).map(key => ({
        value: EstadoGasto[key],
        label: EstadoGasto[key]
    }));

    // Cargar datos
    const fetchData = useCallback(async () => {
        if (!token) {
            setGastos([]);
            setCategorias([]);
            setEmpresasPersonasFisicas([]);
            return;
        }
        try {
            const decodedToken = JSON.parse(atob(token.split(".")[1]));
            const userId = decodedToken?.idUsuario;
            if (!userId) return;
            const userResponse = await axios.get(`http://localhost:8080/usuarios/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const organizacionId = userResponse.data.organizacion.id;
            setOrganizacion(userResponse.data.organizacion);

            const gastosResponse = await axios.get(
                `http://localhost:8080/gastos/organizacion/${organizacionId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setGastos(Array.isArray(gastosResponse.data) ? gastosResponse.data : []);

            const categoriasResponse = await axios.get(
                `http://localhost:8080/categoriasgasto/organizacion/${organizacionId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCategorias(Array.isArray(categoriasResponse.data) ? categoriasResponse.data : []);

            const empresasResponse = await axios.get(
                `http://localhost:8080/empresaspersonasfisicas/organizacion/${organizacionId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEmpresasPersonasFisicas(Array.isArray(empresasResponse.data) ? empresasResponse.data : []);
        } catch {
            setGastos([]);
            setCategorias([]);
            setEmpresasPersonasFisicas([]);
        }
    }, [token]);

    useEffect(() => { fetchData(); }, [fetchData]);

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

    const handleAddFiltro = () => {
        if (!nuevoFiltro) return;
        if (nuevoFiltro.value === "orden") {
            if (!ordenTipo || !ordenSentido) return;
            setFiltrosActivos([
                ...filtrosActivos.filter(f => f.tipo !== "orden"),
                { tipo: "orden", valor: { tipo: ordenTipo.value, sentido: ordenSentido.value } }
            ]);
            setNuevoFiltro(null);
            setOrdenTipo(null);
            setOrdenSentido(null);
            setNuevoValorFiltro([]);
        } else {
            if (!nuevoValorFiltro.length) return;
            const nuevos = nuevoValorFiltro
                .filter(val => !filtrosActivos.some(f => f.tipo === nuevoFiltro.value && f.valor.value === val.value))
                .map(val => ({ tipo: nuevoFiltro.value, valor: val }));
            setFiltrosActivos([...filtrosActivos, ...nuevos]);
            setNuevoFiltro(null);
            setNuevoValorFiltro([]);
        }
    };

    const handleRemoveFiltro = (tipo, valor) => {
        setFiltrosActivos(filtrosActivos.filter(f => {
            if (tipo === "orden") return f.tipo !== "orden";
            return !(f.tipo === tipo && f.valor.value === valor);
        }));
    };

    const handleRemoveAllFiltros = () => setFiltrosActivos([]);

    let gastosFiltrados = gastos.filter(gasto => {
        let match = true;
        for (const filtro of filtrosActivos) {
            if (filtro.tipo === "empresaPersonaFisica" && gasto.empresaPersonaFisica?.id !== filtro.valor.value.id) match = false;
            if (filtro.tipo === "categoriaGasto" && gasto.categoriaGasto?.id !== filtro.valor.value.id) match = false;
            if (filtro.tipo === "formaPagoGasto" && gasto.formaPagoGasto !== filtro.valor.value) match = false;
            if (filtro.tipo === "estado" && gasto.estado !== filtro.valor.value) match = false;
        }
        const valoresGasto = [
            gasto.numFactura,
            gasto.empresaPersonaFisica?.nombre,
            gasto.monto,
            gasto.fecha ? new Date(gasto.fecha).toLocaleDateString() : "",
            gasto.estado,
            gasto.formaPagoGasto,
            gasto.categoriaGasto?.nombre
        ];
        const matchSearch = searchQuery.trim() === "" || valoresGasto.some(valor =>
            valor?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
        return match && matchSearch;
    });

    const filtroOrden = filtrosActivos.find(f => f.tipo === "orden");
    if (filtroOrden && filtroOrden.valor) {
        const { tipo, sentido } = filtroOrden.valor;
        if (tipo === "fecha") {
            gastosFiltrados.sort((a, b) =>
                sentido === "desc"
                    ? new Date(b.fecha) - new Date(a.fecha)
                    : new Date(a.fecha) - new Date(b.fecha)
            );
        } else if (tipo === "monto") {
            gastosFiltrados.sort((a, b) =>
                sentido === "desc"
                    ? parseFloat(b.monto) - parseFloat(a.monto)
                    : parseFloat(a.monto) - parseFloat(b.monto)
            );
        }
    } else {
        gastosFiltrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    const totalPages = Math.ceil(gastosFiltrados.length / gastosPorPagina);
    const gastosPaginados = gastosFiltrados.slice(
        (currentPage - 1) * gastosPorPagina,
        currentPage * gastosPorPagina
    );

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
                ? `Orden: ${filtro.valor.tipo} (${filtro.valor.sentido})`
                : `${filtro.tipo}: ${filtro.valor.label || filtro.valor.value}`
            }
            <FaTimes
                style={{ marginLeft: 6, cursor: "pointer" }}
                onClick={() => handleRemoveFiltro(filtro.tipo, filtro.valor.value)}
            />
        </span>
    );

    const renderValorFiltro = () => {
        if (!nuevoFiltro) return null;
        if (nuevoFiltro.value === "orden") {
            return (
                <div className="mt-2">
                    <Select
                        options={ordenTipoOptions}
                        value={ordenTipo}
                        onChange={setOrdenTipo}
                        placeholder="Tipo de orden"
                        className="mb-2"
                    />
                    <Select
                        options={ordenSentidoOptions}
                        value={ordenSentido}
                        onChange={setOrdenSentido}
                        placeholder="Sentido"
                    />
                </div>
            );
        }
        let options = [];
        if (nuevoFiltro.value === "empresaPersonaFisica") options = empresasPersonasFisicas.map(e => ({ value: e, label: e.nombre }));
        if (nuevoFiltro.value === "categoriaGasto") options = categorias.map(c => ({ value: c, label: c.nombre }));
        if (nuevoFiltro.value === "formaPagoGasto") options = formaPagoOptions;
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

    const getEstadoBadge = (estado) => {
        const c = estadoColors[estado] || estadoColors.RECIBIDO;
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
    const getFormaPagoBadge = (formaPagoGasto) => {
        const c = formaPagoColors[formaPagoGasto] || formaPagoColors.NO_PAGADA;
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
            }}>{formaPagoGasto}</span>
        );
    };

    const handleDownload = async (gasto) => {
        if (!gasto.archivo && !gasto.tieneArchivoFactura) {
            Swal.fire("Sin PDF", "Este gasto no tiene PDF asignado.", "info");
            return;
        }
        try {
            const response = await axios.get(`http://localhost:8080/gastos/${gasto.id}/archivo`, {
                responseType: "blob",
                headers: { Authorization: `Bearer ${token}` }
            });
            let filename = `Gasto_${gasto.id}.pdf`;
            const disposition = response.headers['content-disposition'];
            if (disposition && disposition.indexOf('filename=') !== -1) {
                filename = disposition.split('filename=')[1].replace(/"/g, '');
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
            Swal.fire("Error", "Ocurrió un problema al descargar el archivo.", "error");
        }
    };

    const getFormasPagoDisponibles = (estado) => {
        if (estado === EstadoGasto.COMPLETADO) {
            return [FormaPagoGasto.EFECTIVO, FormaPagoGasto.TARJETA, FormaPagoGasto.TRANSFERENCIA];
        }
        if (estado === EstadoGasto.ERROR || estado === EstadoGasto.RECIBIDO) {
            return [FormaPagoGasto.NO_PAGADA];
        }
        return Object.values(FormaPagoGasto);
    };

    const handleEdit = (gasto) => {
        setEditingGasto({ ...gasto, tempEstado: gasto.estado, tempFormaPago: gasto.formaPagoGasto });
        setShowEditModal(true);
    };
    const handleCloseEditModal = () => { setShowEditModal(false); setEditingGasto(null); };
    const handleEstadoChange = (e) => {
        const newEstado = e.target.value;
        let newFormaPago = editingGasto.tempFormaPago;
        const disponibles = getFormasPagoDisponibles(newEstado);
        if (!disponibles.includes(newFormaPago)) {
            newFormaPago = disponibles[0];
        }
        setEditingGasto(prev => ({
            ...prev,
            tempEstado: newEstado,
            tempFormaPago: newFormaPago
        }));
    };
    const handleFormaPagoChange = (e) => {
        const newFormaPago = e.target.value;
        setEditingGasto(prev => ({
            ...prev,
            tempFormaPago: newFormaPago
        }));
    };
    const handleSaveChanges = async () => {
        try {
            const updatedGasto = {
                ...editingGasto,
                estado: editingGasto.tempEstado,
                formaPagoGasto: editingGasto.tempFormaPago
            };
            if (!Object.values(EstadoGasto).includes(updatedGasto.estado)) return;
            if (!Object.values(FormaPagoGasto).includes(updatedGasto.formaPagoGasto)) return;
            if (updatedGasto.estado === EstadoGasto.COMPLETADO && updatedGasto.formaPagoGasto === FormaPagoGasto.NO_PAGADA) return;
            if ((updatedGasto.estado === EstadoGasto.ERROR || updatedGasto.estado === EstadoGasto.RECIBIDO) && updatedGasto.formaPagoGasto !== FormaPagoGasto.NO_PAGADA) return;
            await axios.put(`http://localhost:8080/gastos/${editingGasto.id}`, updatedGasto, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const updatedGastos = gastos.map(f =>
                f.id === editingGasto.id ? { ...f, ...updatedGasto } : f
            );
            setGastos(updatedGastos);
            handleCloseEditModal();
            Swal.fire({
                icon: "success",
                title: "Gasto actualizado",
                showConfirmButton: false,
                timer: 1200
            });
        } catch {
            Swal.fire({
                icon: "error",
                title: "Error al actualizar el gasto",
                showConfirmButton: false,
                timer: 1500
            });
        }
    };

    const handleNewGastoChange = (e) => {
        const { name, value, type, files } = e.target;
        if (name === "fecha") {
            setNewGasto(prev => ({
                ...prev,
                fecha: toLocalDateTime(value)
            }));
        } else if (type === "file") {
            setNewGasto(prev => ({
                ...prev,
                archivo: files[0] || null
            }));
        } else {
            setNewGasto(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };
    const handleSelectChange = (selectedOption, actionMeta) => {
        setNewGasto(prev => ({
            ...prev,
            [actionMeta.name]: selectedOption
        }));
    };
    const handleSaveNewGasto = async (e) => {
        e.preventDefault();
        if (newGasto.estado === EstadoGasto.COMPLETADO &&
            newGasto.formaPagoGasto === FormaPagoGasto.NO_PAGADA) {
            Swal.fire("Error", "Si el estado es COMPLETADO, la forma de pago no puede ser NO_PAGADA.", "error");
            return;
        }
        if ((newGasto.estado === EstadoGasto.ERROR || newGasto.estado === EstadoGasto.RECIBIDO) &&
            newGasto.formaPagoGasto !== FormaPagoGasto.NO_PAGADA) {
            Swal.fire("Error", "Si el estado es ERROR o RECIBIDO, la forma de pago debe ser NO_PAGADA.", "error");
            return;
        }
        if (!newGasto.empresaPersonaFisica || !newGasto.formaPagoGasto) {
            Swal.fire("Error", "Empresa/Persona y Forma de Pago son obligatorios.", "error");
            return;
        }
        if (!organizacion || !organizacion.id) {
            Swal.fire("Error", "No se ha podido obtener la organización.", "error");
            return;
        }
        try {
            const gastoData = {
                numFactura: newGasto.numFactura,
                monto: newGasto.monto,
                empresaPersonaFisica: newGasto.empresaPersonaFisica.value,
                fecha: newGasto.fecha,
                estado: newGasto.estado,
                formaPagoGasto: newGasto.formaPagoGasto,
                categoriaGasto: newGasto.categoriaGasto ? newGasto.categoriaGasto.value : null,
                organizacion: { id: organizacion.id }
            };

            const formData = new FormData();
            formData.append("gasto", JSON.stringify(gastoData));
            if (newGasto.archivo) {
                formData.append("archivo", newGasto.archivo);
            }

            await axios.post(`http://localhost:8080/gastos`, formData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
            });
            setShowNewGastoModal(false);
            fetchData();
            setNewGasto({
                numFactura: "",
                monto: "",
                empresaPersonaFisica: null,
                fecha: getTodayLocalDateTime(),
                estado: EstadoGasto.RECIBIDO,
                formaPagoGasto: FormaPagoGasto.NO_PAGADA,
                categoriaGasto: null,
                archivo: null
            });
            Swal.fire({
                icon: "success",
                title: "Gasto creado correctamente",
                showConfirmButton: false,
                timer: 1200
            });
        } catch {
            Swal.fire({
                icon: "error",
                title: "Error al crear el gasto",
                showConfirmButton: false,
                timer: 1500
            });
        }
    };

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

    return (
        <div className="d-flex" style={{ height: "100vh", overflow: "hidden" }}>
            <Sidebar />
            <div className="container mt-4" style={{ overflow: "hidden" }}>
                <h2 className="text-center mb-4" style={{ borderBottom: "2px solid #a7c5eb", paddingBottom: "10px" }}>
                    Gastos
                </h2>
                <div className="d-flex justify-content-between mb-3" style={{ position: "relative" }}>
                    <button
                        className="btn"
                        style={{ backgroundColor: "#6f9fd7", color: "#fff", borderRadius: "8px", padding: "8px 16px", border: "none" }}
                        onClick={() => setShowNewGastoModal(true)}
                    >
                        <FaPlusCircle className="me-2" />
                        Nuevo Gasto
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
                                            placeholder="Buscar gasto..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            style={{ paddingLeft: 32 }}
                                        />
                                        <FaSearch style={{ position: "absolute", left: 8, top: 10, color: "#a7c5eb" }} />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label style={{ fontWeight: 600, color: "#6f9fd7", marginBottom: 6, display: "block" }}>
                                        Añadir filtro
                                    </label>
                                    <Select
                                        options={filtroTipos.filter(f => !filtrosActivos.some(a => a.tipo === f.value))}
                                        value={nuevoFiltro}
                                        onChange={setNuevoFiltro}
                                        placeholder="Selecciona filtro..."
                                    />
                                    {renderValorFiltro()}
                                    <button
                                        className="btn mt-3"
                                        style={{ backgroundColor: "#6f9fd7", color: "#fff", borderRadius: "8px", width: "100%" }}
                                        onClick={handleAddFiltro}
                                    >
                                        Añadir
                                    </button>
                                </div>
                                {filtrosActivos.length > 0 && (
                                    <div className="mb-2">
                                        <label style={{ fontWeight: 600, color: "#6f9fd7", marginBottom: 6, display: "block" }}>
                                            Filtros activos
                                        </label>
                                        <div>
                                            {filtrosActivos.map(renderFiltroChip)}
                                            <button
                                                className="btn btn-sm ms-2"
                                                style={{ backgroundColor: "#fdecea", color: "#e74c3c", border: "none", borderRadius: 8 }}
                                                onClick={handleRemoveAllFiltros}
                                            >
                                                Limpiar
                                            </button>
                                        </div>
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
                            <th>ID</th>
                            <th>Nº Factura</th>
                            <th>Monto</th>
                            <th>Empresa/Persona</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th>Forma de Pago</th>
                            <th>Categoría</th>
                            <th>Archivo</th>
                            <th>Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {gastosPaginados.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="text-center">Aún no hay datos en la Base de Datos.</td>
                            </tr>
                        ) : (
                            gastosPaginados.map((gasto, index) => (
                                <tr key={gasto.id} style={{ backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff" }}>
                                    <td>{gasto.id}</td>
                                    <td>{gasto.numFactura || 'N/A'}</td>
                                    <td>{gasto.monto || 'N/A'}</td>
                                    <td>{gasto.empresaPersonaFisica?.nombre || 'N/A'}</td>
                                    <td>{gasto.fecha ? new Date(gasto.fecha).toLocaleDateString() : 'N/A'}</td>
                                    <td>{getEstadoBadge(gasto.estado)}</td>
                                    <td>{getFormaPagoBadge(gasto.formaPagoGasto)}</td>
                                    <td>{gasto.categoriaGasto?.nombre || 'N/A'}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm"
                                            style={{ backgroundColor: "#a7c5eb", color: "#fff" }}
                                            onClick={() => handleDownload(gasto)}
                                        >
                                            <FaFileDownload />
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-sm"
                                            style={{ backgroundColor: "#6f9fd7", color: "#fff" }}
                                            onClick={() => handleEdit(gasto)}
                                        >
                                            Editar
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

                {/* MODAL NUEVO GASTO */}
                <Modal show={showNewGastoModal} onHide={() => setShowNewGastoModal(false)} size="lg" centered>
                    <Modal.Header closeButton style={{ backgroundColor: '#a7c5eb', color: '#fff' }}>
                        <Modal.Title>Agregar Nuevo Gasto</Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={handleSaveNewGasto}>
                        <Modal.Body style={{ backgroundColor: '#f9f9f9' }}>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Nº Factura</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="numFactura"
                                            value={newGasto.numFactura}
                                            onChange={handleNewGastoChange}
                                            placeholder="Ej: 12345"
                                            style={{ borderRadius: 8, borderColor: "#a7c5eb" }}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Monto</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="monto"
                                            value={newGasto.monto}
                                            onChange={handleNewGastoChange}
                                            placeholder="Ej: 100.00"
                                            style={{ borderRadius: 8, borderColor: "#a7c5eb" }}
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Empresa/Persona</Form.Label>
                                        <Select
                                            name="empresaPersonaFisica"
                                            options={empresasPersonasFisicas.map(e => ({ value: e, label: e.nombre }))}
                                            value={newGasto.empresaPersonaFisica}
                                            onChange={handleSelectChange}
                                            placeholder="Selecciona..."
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    borderRadius: 8,
                                                    borderColor: "#a7c5eb"
                                                })
                                            }}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Categoría</Form.Label>
                                        <Select
                                            name="categoriaGasto"
                                            options={categorias.map(c => ({ value: c, label: c.nombre }))}
                                            value={newGasto.categoriaGasto}
                                            onChange={handleSelectChange}
                                            placeholder="Selecciona..."
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    borderRadius: 8,
                                                    borderColor: "#a7c5eb"
                                                })
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Fecha</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="fecha"
                                            value={newGasto.fecha.split("T")[0]}
                                            onChange={handleNewGastoChange}
                                            style={{ borderRadius: 8, borderColor: "#a7c5eb" }}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Estado</Form.Label>
                                        <Form.Select
                                            name="estado"
                                            value={newGasto.estado}
                                            onChange={handleNewGastoChange}
                                            style={{ borderRadius: 8, borderColor: "#a7c5eb" }}
                                            required
                                        >
                                            {Object.values(EstadoGasto).map(e => (
                                                <option key={e} value={e}>{e}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Forma de Pago</Form.Label>
                                        <Form.Select
                                            name="formaPagoGasto"
                                            value={newGasto.formaPagoGasto}
                                            onChange={handleNewGastoChange}
                                            style={{ borderRadius: 8, borderColor: "#a7c5eb" }}
                                            required
                                        >
                                            {getFormasPagoDisponibles(newGasto.estado).map(f => (
                                                <option key={f} value={f}>{f}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Archivo (PDF)</Form.Label>
                                        <Form.Control
                                            type="file"
                                            name="archivo"
                                            accept="application/pdf"
                                            onChange={handleNewGastoChange}
                                            style={{ borderRadius: 8, borderColor: "#a7c5eb" }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Modal.Body>
                        <Modal.Footer style={{ backgroundColor: '#f0f8ff' }}>
                            <Button variant="secondary" onClick={() => setShowNewGastoModal(false)} style={{ borderRadius: 8 }}>
                                Cancelar
                            </Button>
                            <Button type="submit" style={{ backgroundColor: "#6f9fd7", color: "#fff", borderRadius: 8, border: "none" }}>
                                Guardar Gasto
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>

                {/* MODAL EDITAR GASTO */}
                <Modal show={showEditModal} onHide={handleCloseEditModal}>
                    <Modal.Header closeButton style={{ backgroundColor: '#f0f8ff' }}>
                        <Modal.Title>Editar Estado y Forma de Pago</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ backgroundColor: '#f9f9f9' }}>
                        {editingGasto && (
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Estado</Form.Label>
                                    <Form.Select
                                        value={editingGasto.tempEstado}
                                        onChange={handleEstadoChange}
                                    >
                                        {Object.values(EstadoGasto).map(e => (
                                            <option key={e} value={e}>{e}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Forma de Pago</Form.Label>
                                    <Form.Select
                                        value={editingGasto.tempFormaPago}
                                        onChange={handleFormaPagoChange}
                                    >
                                        {getFormasPagoDisponibles(editingGasto.tempEstado).map(f => (
                                            <option key={f} value={f}>{f}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Form>
                        )}
                    </Modal.Body>
                    <Modal.Footer style={{ backgroundColor: '#f0f8ff' }}>
                        <Button variant="secondary" onClick={handleCloseEditModal}>
                            Cancelar
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

export default GastosComponent;