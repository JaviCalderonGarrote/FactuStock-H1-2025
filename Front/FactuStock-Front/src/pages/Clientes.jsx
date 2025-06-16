import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import { FaPlusCircle, FaSearch, FaChevronLeft, FaChevronRight, FaEllipsisH, FaFilter, FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import Select from "react-select";

// Opciones de filtro
const filtroTipos = [
    { value: "nombre", label: "Nombre" },
    { value: "nifCif", label: "NIF/CIF" },
    { value: "mail", label: "Email" },
    { value: "telefono", label: "Teléfono" },
    { value: "tipo", label: "Tipo" }
];

const tipoOptions = [
    { value: "CLIENTE", label: "Cliente" },
    { value: "PROVEEDOR", label: "Proveedor" },
    { value: "AMBOS", label: "Ambos" }
];

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error, errorInfo) {
        console.error("Error ocurrió: ", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return <h1 className="text-danger text-center">Algo salió mal al cargar las empresas.</h1>;
        }
        return this.props.children;
    }
}

const EmpresaPersonaFisicaComponent = () => {
    const [empresaPersonaFisica, setEmpresaPersonaFisica] = useState([]);
    const [error, setError] = useState(null);
    const [nuevaEmpresaPersonaFisica, setNuevaEmpresaPersonaFisica] = useState({
        id: null,
        nombre: "",
        nifCif: "",
        telefono: "",
        direccion: "",
        web: "",
        mail: "",
        tipo: "CLIENTE"
    });
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [empresasPorPagina] = useState(8);
    const [searchQuery, setSearchQuery] = useState("");
    const token = localStorage.getItem("authToken");
    const [usuario, setUsuario] = useState(null);
    const [organizacion, setOrganizacion] = useState(null);

    // Filtro avanzado
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [filtrosActivos, setFiltrosActivos] = useState([]);
    const [nuevoFiltro, setNuevoFiltro] = useState(null);
    const [nuevoValorFiltro, setNuevoValorFiltro] = useState([]);
    const filterTimeout = useRef(null);
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
                const empresaResponse = await axios.get(
                    `http://localhost:8080/EmpresaPersonaFisica/organizacion/${userResponse.data.organizacion.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (empresaResponse.data.message) {
                    setEmpresaPersonaFisica([]);
                    setError(null);
                } else {
                    setEmpresaPersonaFisica(empresaResponse.data);
                    setError(null);
                }
            } catch (err) {
                console.error("Error al obtener los datos:", err);
                setError("Error al obtener los datos: " + err.message);
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
        let nuevos = [];
        if (nuevoFiltro.value === "tipo") {
            if (!nuevoValorFiltro.length) return;
            nuevos = nuevoValorFiltro.filter(val =>
                !filtrosActivos.some(f => f.tipo === nuevoFiltro.value && f.valor.value === val.value)
            ).map(val => ({ tipo: nuevoFiltro.value, valor: val }));
        } else {
            if (!nuevoValorFiltro.length) return;
            nuevos = nuevoValorFiltro.filter(val =>
                !filtrosActivos.some(f => f.tipo === nuevoFiltro.value && f.valor.value === val.value)
            ).map(val => ({ tipo: nuevoFiltro.value, valor: val }));
        }
        setFiltrosActivos([...filtrosActivos, ...nuevos]);
        setNuevoFiltro(null);
        setNuevoValorFiltro([]);
    };

    // Eliminar filtro activo
    const handleRemoveFiltro = (tipo, valor) => {
        setFiltrosActivos(filtrosActivos.filter(f => !(f.tipo === tipo && f.valor.value === valor)));
    };

    // Eliminar todos los filtros
    const handleRemoveAllFiltros = () => {
        setFiltrosActivos([]);
    };

    // Opciones dinámicas para los filtros
    const nombreOptions = empresaPersonaFisica.map(e => ({ value: e.nombre, label: e.nombre })).filter((v, i, a) => a.findIndex(t => t.value === v.value) === i);
    const nifCifOptions = empresaPersonaFisica.map(e => ({ value: e.nifCif, label: e.nifCif })).filter((v, i, a) => a.findIndex(t => t.value === v.value) === i);
    const mailOptions = empresaPersonaFisica.map(e => ({ value: e.mail, label: e.mail })).filter((v, i, a) => a.findIndex(t => t.value === v.value) === i);
    const telefonoOptions = empresaPersonaFisica.map(e => ({ value: e.telefono, label: e.telefono })).filter((v, i, a) => a.findIndex(t => t.value === v.value) === i);

    // Render del selector de valor según tipo de filtro (multi)
    const renderValorFiltro = () => {
        if (!nuevoFiltro) return null;
        let options = [];
        if (nuevoFiltro.value === "nombre") options = nombreOptions;
        if (nuevoFiltro.value === "nifCif") options = nifCifOptions;
        if (nuevoFiltro.value === "mail") options = mailOptions;
        if (nuevoFiltro.value === "telefono") options = telefonoOptions;
        if (nuevoFiltro.value === "tipo") options = tipoOptions;
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

    // Render de chips de filtros activos
    const renderFiltroChip = (filtro) => (
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

    // Filtrado avanzado y búsqueda por todos los campos
    let empresasFiltradas = empresaPersonaFisica.filter(empresa => {
        let match = true;
        for (const filtro of filtrosActivos) {
            if (filtro.tipo === "nombre" && empresa.nombre !== filtro.valor.value) match = false;
            if (filtro.tipo === "nifCif" && empresa.nifCif !== filtro.valor.value) match = false;
            if (filtro.tipo === "mail" && empresa.mail !== filtro.valor.value) match = false;
            if (filtro.tipo === "telefono" && empresa.telefono !== filtro.valor.value) match = false;
            if (filtro.tipo === "tipo" && empresa.tipo !== filtro.valor.value) match = false;
        }
        // Búsqueda por todos los campos
        const valoresEmpresa = [
            empresa.nombre,
            empresa.nifCif,
            empresa.telefono,
            empresa.direccion,
            empresa.mail,
            empresa.tipo
        ];
        const matchSearch = searchQuery.trim() === "" || valoresEmpresa.some(valor =>
            valor?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
        return match && matchSearch;
    });

    const indexOfLastEmpresa = currentPage * empresasPorPagina;
    const indexOfFirstEmpresa = indexOfLastEmpresa - empresasPorPagina;
    const empresasPaginadas = empresasFiltradas.slice(indexOfFirstEmpresa, indexOfLastEmpresa);

    const totalPages = Math.ceil(empresasFiltradas.length / empresasPorPagina);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // --- NUEVO: Paginación estilo Gastos.jsx ---
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

    // Animación fadeInDown para el filtro
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

    // Handlers de edición y eliminación
    function handleEditar(empresa) {
        setNuevaEmpresaPersonaFisica(empresa);
        setShowModal(true);
    }
    async function handleEliminar(id) {
        try {
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: 'Esta empresa será eliminada permanentemente.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, eliminarla'
            });
            if (result.isConfirmed) {
                await axios.delete(`http://localhost:8080/EmpresaPersonaFisica/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire('Eliminado', 'La empresa ha sido eliminada correctamente', 'success');
                const empresaResponse = await axios.get(
                    `http://localhost:8080/EmpresaPersonaFisica/organizacion/${organizacion.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setEmpresaPersonaFisica(empresaResponse.data);
            }
        } catch (error) {
            Swal.fire('Error', 'Hubo un error al eliminar la empresa: ' + error.message, 'error');
        }
    }
    async function handleSubmit(e) {
        e.preventDefault();
        if (!nuevaEmpresaPersonaFisica.nombre || !nuevaEmpresaPersonaFisica.nifCif || !nuevaEmpresaPersonaFisica.mail) {
            Swal.fire('Error', 'Los campos nombre, NIF/CIF y mail son obligatorios.', 'error');
            return;
        }
        const empresaData = { ...nuevaEmpresaPersonaFisica, organizacion: { id: organizacion.id } };
        try {
            let response;
            if (nuevaEmpresaPersonaFisica.id) {
                response = await axios.put(`http://localhost:8080/EmpresaPersonaFisica/${nuevaEmpresaPersonaFisica.id}`, empresaData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                response = await axios.post("http://localhost:8080/EmpresaPersonaFisica", empresaData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowModal(false);
            Swal.fire('Éxito', `Empresa ${nuevaEmpresaPersonaFisica.id ? 'actualizada' : 'creada'} correctamente`, 'success');
            const empresaResponse = await axios.get(
                `http://localhost:8080/EmpresaPersonaFisica/organizacion/${organizacion.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEmpresaPersonaFisica(empresaResponse.data);
        } catch (err) {
            Swal.fire('Error', 'Hubo un error al procesar la solicitud: ' + err.message, 'error');
        }
    }

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="container mt-4">
                <h2 className="text-center mb-4" style={{ borderBottom: '2px solid #a7c5eb', paddingBottom: '10px' }}>Empresas</h2>
                <ErrorBoundary>
                    {error ? (
                        <div className="alert alert-danger text-center">{error}</div>
                    ) : (
                        <>
                            <div className="d-flex justify-content-between mb-3" style={{ position: "relative" }}>
                                <button
                                    className="btn d-flex align-items-center"
                                    style={{ backgroundColor: "#6f9fd7", color: "#fff", borderRadius: "8px", padding: "8px 16px", border: "none" }}
                                    onClick={() => {
                                        setNuevaEmpresaPersonaFisica({
                                            id: null,
                                            nombre: "",
                                            nifCif: "",
                                            telefono: "",
                                            direccion: "",
                                            web: "",
                                            mail: "",
                                            tipo: "CLIENTE"
                                        });
                                        setShowModal(true);
                                    }}
                                >
                                    <FaPlusCircle className="me-2" />
                                    Agregar Empresa
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
                                                        placeholder="Buscar empresa..."
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
                                                        !nuevoValorFiltro.length
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
                                        <th>Nombre</th>
                                        <th>NIF/CIF</th>
                                        <th>Email</th>
                                        <th>Teléfono</th>
                                        <th>Dirección</th>
                                        <th>Tipo</th>
                                        <th>Acciones</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {empresasPaginadas.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="text-center">
                                                No hay datos disponibles en la base de datos.
                                            </td>
                                        </tr>
                                    ) : (
                                        empresasPaginadas.map((empresa, index) => (
                                            <tr key={empresa.id} style={{ backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff" }}>
                                                <td>{empresa.id}</td>
                                                <td>{empresa.nombre || 'N/A'}</td>
                                                <td>{empresa.nifCif || 'N/A'}</td>
                                                <td>{empresa.mail || 'N/A'}</td>
                                                <td>{empresa.telefono || 'N/A'}</td>
                                                <td>{empresa.direccion || 'N/A'}</td>
                                                <td>{empresa.tipo || 'N/A'}</td>
                                                <td>
                                                    <button
                                                        className="action-btn"
                                                        title="Editar"
                                                        onClick={() => handleEditar(empresa)}
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        className="action-btn"
                                                        title="Eliminar"
                                                        onClick={() => handleEliminar(empresa.id)}
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
                        </>
                    )}
                </ErrorBoundary>
                {showModal && (
                    <div className="modal fade show" style={{ display: "block" }}>
                        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "800px" }}>
                            <div className="modal-content shadow-lg rounded">
                                <div className="modal-header" style={{ backgroundColor: '#a7c5eb', color: '#fff' }}>
                                    <h5 className="modal-title">
                                        {nuevaEmpresaPersonaFisica.id ? 'Editar Empresa' : 'Agregar Empresa'}
                                    </h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <form onSubmit={handleSubmit}>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="nombre" className="form-label">Nombre</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="nombre"
                                                    name="nombre"
                                                    value={nuevaEmpresaPersonaFisica.nombre}
                                                    onChange={(e) => setNuevaEmpresaPersonaFisica({ ...nuevaEmpresaPersonaFisica, [e.target.name]: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="nifCif" className="form-label">NIF/CIF</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="nifCif"
                                                    name="nifCif"
                                                    value={nuevaEmpresaPersonaFisica.nifCif}
                                                    onChange={(e) => setNuevaEmpresaPersonaFisica({ ...nuevaEmpresaPersonaFisica, [e.target.name]: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="telefono" className="form-label">Teléfono</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="telefono"
                                                    name="telefono"
                                                    value={nuevaEmpresaPersonaFisica.telefono}
                                                    onChange={(e) => setNuevaEmpresaPersonaFisica({ ...nuevaEmpresaPersonaFisica, [e.target.name]: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="direccion" className="form-label">Dirección</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="direccion"
                                                    name="direccion"
                                                    value={nuevaEmpresaPersonaFisica.direccion}
                                                    onChange={(e) => setNuevaEmpresaPersonaFisica({ ...nuevaEmpresaPersonaFisica, [e.target.name]: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="web" className="form-label">Web</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="web"
                                                    name="web"
                                                    value={nuevaEmpresaPersonaFisica.web}
                                                    onChange={(e) => setNuevaEmpresaPersonaFisica({ ...nuevaEmpresaPersonaFisica, [e.target.name]: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="mail" className="form-label">Email</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    id="mail"
                                                    name="mail"
                                                    value={nuevaEmpresaPersonaFisica.mail}
                                                    onChange={(e) => setNuevaEmpresaPersonaFisica({ ...nuevaEmpresaPersonaFisica, [e.target.name]: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="tipo" className="form-label">Tipo</label>
                                                <select
                                                    className="form-control"
                                                    id="tipo"
                                                    name="tipo"
                                                    value={nuevaEmpresaPersonaFisica.tipo}
                                                    onChange={(e) => setNuevaEmpresaPersonaFisica({ ...nuevaEmpresaPersonaFisica, [e.target.name]: e.target.value })}
                                                >
                                                    <option value="CLIENTE">Cliente</option>
                                                    <option value="PROVEEDOR">Proveedor</option>
                                                    <option value="AMBOS">Ambos</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="d-flex flex-column gap-3 mt-3">
                                            <button type="submit" className="btn" style={{ backgroundColor: '#a7c5eb', width: '100%', color: '#fff' }}>
                                                {nuevaEmpresaPersonaFisica.id ? 'Actualizar Empresa' : 'Crear Empresa'}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => setShowModal(false)}
                                                style={{ width: '100%' }}
                                            >
                                                Cerrar
                                            </button>
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

export default EmpresaPersonaFisicaComponent;