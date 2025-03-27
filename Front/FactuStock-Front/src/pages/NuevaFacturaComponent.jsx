import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import Select from "react-select"; // Ensure you have this library installed for the select input

const convertToISOFormat = (date) => {
    const dateObj = new Date(date);
    return dateObj.toISOString();
};

const NuevaFacturaComponent = () => {
    const navigate = useNavigate();
    const [factura, setFactura] = useState({
        fecha: "",
        empresaPersonaFisicaId: "",
        estado: "ENVIADA",
        formaCobro: "NoCobrada",
        organizacion: null,
        usuario: null,
        numeroFactura: "",
        detalles: [],
        total: 0,
    });

    const [empresasPersonaFisica, setEmpresasPersonaFisica] = useState([]);
    const [organizacion, setOrganizacion] = useState(null);
    const [usuario, setUsuario] = useState(null);
    const [productos, setProductos] = useState([]);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalVisible, setModalVisible] = useState(false); // State for the new modal visibility
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [cantidad, setCantidad] = useState(1);
    const token = localStorage.getItem("authToken");

    const decodeToken = (token) => {
        try {
            const tokenParts = token.split(".");
            if (tokenParts.length !== 3) {
                setError("Token JWT no es válido.");
                return null;
            }
            const decoded = atob(tokenParts[1].replace(/-/g, "+").replace(/_/g, "/"));
            return JSON.parse(decoded);
        } catch (error) {
            setError("Error al decodificar el token.");
            console.error(error);
            return null;
        }
    };

    useEffect(() => {
        if (!token) {
            setError("No se encontró un token de autenticación.");
            return;
        }

        const decodedToken = decodeToken(token);
        const userId = decodedToken?.idUsuario;

        if (!userId) {
            setError("ID de usuario no encontrado en el token.");
            return;
        }

        const fetchData = async () => {
            try {
                const userResponse = await axios.get(`http://localhost:8080/usuarios/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (userResponse.data) {
                    setUsuario(userResponse.data);
                    setOrganizacion(userResponse.data.organizacion);
                } else {
                    setError("No se encontró la información del usuario.");
                }

                const empresaResponse = await axios.get(
                    `http://localhost:8080/EmpresaPersonaFisica/organizacion/${userResponse.data.organizacion.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setEmpresasPersonaFisica(empresaResponse.data);

                // Obtener productos de la organización del usuario
                const productosResponse = await axios.get(
                    `http://localhost:8080/productos/organizacion/${userResponse.data.organizacion.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setProductos(productosResponse.data);
            } catch (err) {
                setError("Error al obtener los datos.");
                console.error(err);
            }
        };

        fetchData();
    }, [token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFactura({ ...factura, [name]: value });
    };

    const handleAddDetalle = () => {
        if (!productoSeleccionado || cantidad <= 0) {
            Swal.fire("Error", "Por favor selecciona un producto y una cantidad válida.", "error");
            return;
        }

        const detalle = {
            producto: productoSeleccionado,
            cantidad,
            precioUnitario: productoSeleccionado.precio,
            iva: productoSeleccionado.iva,
            subtotal: productoSeleccionado.precio * cantidad,
        };

        const nuevosDetalles = [...factura.detalles, detalle];

        const totalFactura = nuevosDetalles.reduce((total, detalle) => total + detalle.subtotal, 0);

        setFactura({
            ...factura,
            detalles: nuevosDetalles,
            total: totalFactura,
        });

        setModalVisible(false); // Close the new modal after adding the product
    };

    const handleRemoveDetalle = (index) => {
        const nuevosDetalles = factura.detalles.filter((_, i) => i !== index);

        const totalFactura = nuevosDetalles.reduce((total, detalle) => total + detalle.subtotal, 0);

        setFactura({ ...factura, detalles: nuevosDetalles, total: totalFactura });
    };

    const handleSelectProducto = (producto) => {
        setProductoSeleccionado(producto);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!factura.fecha || !factura.empresaPersonaFisicaId) {
            Swal.fire("Error", "Por favor selecciona una empresa/persona física y una fecha.", "error");
            return;
        }

        if (!organizacion || !usuario) {
            Swal.fire("Error", "No se pudo obtener la organización o el usuario.", "error");
            return;
        }

        try {
            const fechaFactura = new Date(factura.fecha);
            const year = fechaFactura.getFullYear() % 100;
            const month = fechaFactura.getMonth() + 1;

            const countResponse = await axios.get(
                `http://localhost:8080/facturas/count?month=${month}&year=${fechaFactura.getFullYear()}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const sequence = countResponse.data + 1;

            const organizacionId = organizacion?.id;
            if (!organizacionId) {
                Swal.fire("Error", "No se encontró el ID de la organización.", "error");
                return;
            }

            const numeroFactura = `Fac_${organizacionId}_${String(year).padStart(2, "0")}/${String(month).padStart(2, "0")}/${String(sequence).padStart(5, "0")}`;

            const facturaData = {
                ...factura,
                fecha: convertToISOFormat(factura.fecha),
                organizacion: organizacion,
                usuario: usuario,
                numeroFactura: numeroFactura,
                empresaPersonaFisica: { id: factura.empresaPersonaFisicaId },
                formaPago: factura.formaCobro,
                detalles: factura.detalles,
                total: factura.total,
            };

            await axios.post("http://localhost:8080/facturas", facturaData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            Swal.fire("Éxito", "Factura creada correctamente.", "success").then(() => {
                navigate("/facturas");
            });
        } catch (err) {
            Swal.fire("Error", err.response?.data?.message || "Hubo un problema al crear la factura.", "error");
        }
    };

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="container mt-4">
                <h2 className="text-center mb-4" style={{ borderBottom: "2px solid #a7c5eb", paddingBottom: "10px" }}>
                    Crear Nueva Factura
                </h2>

                {error && <div className="alert alert-danger text-center">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label">Empresa/Persona Física</label>
                            <select
                                className="form-control"
                                name="empresaPersonaFisicaId"
                                value={factura.empresaPersonaFisicaId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Selecciona una empresa/persona...</option>
                                {empresasPersonaFisica.map((empresa) => (
                                    <option key={empresa.id} value={empresa.id}>
                                        {empresa.nombre} ({empresa.tipo})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label">Fecha</label>
                            <input
                                type="date"
                                className="form-control"
                                name="fecha"
                                value={factura.fecha}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label">Estado</label>
                            <input type="text" className="form-control" value="Enviada" disabled />
                        </div>

                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label">Forma de Pago</label>
                            <input type="text" className="form-control" value="No Cobrada" disabled />
                        </div>

                        <div className="col-12 mb-3">
                            <button
                                type="button"
                                className="btn"
                                style={{ backgroundColor: "#a7c5eb", width: "100%" }}
                                onClick={() => setModalVisible(true)}
                            >
                                Añadir Detalle
                            </button>
                        </div>

                        {factura.detalles.length > 0 && (
                            <div className="col-12 mb-3">
                                <h4>Detalles de la Factura</h4>
                                {factura.detalles.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-striped">
                                            <thead>
                                            <tr>
                                                <th>Producto</th>
                                                <th>Cantidad</th>
                                                <th>Precio Unitario (€)</th>
                                                <th>Subtotal (€)</th>
                                                <th>Acciones</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {factura.detalles.map((detalle, index) => (
                                                <tr key={index}>
                                                    <td>{detalle.producto.nombre}</td>
                                                    <td>{detalle.cantidad}</td>
                                                    <td>{detalle.precioUnitario.toFixed(2)}</td>
                                                    <td>{detalle.subtotal.toFixed(2)}</td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveDetalle(index)}
                                                            className="btn btn-danger btn-sm"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                        <div className="text-end">
                                            <h5>Total: <strong>{factura.total.toFixed(2)}€</strong></h5>
                                        </div>
                                    </div>
                                ) : (
                                    <p>No hay detalles agregados a la factura.</p>
                                )}
                            </div>
                        )}

                        <div className="col-12 mb-3">
                            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                                Crear Factura
                            </button>
                        </div>
                    </div>
                </form>

                {/* Modal for selecting products */}
                {modalVisible && (
                    <div className="modal fade show" style={{ display: "block" }} tabIndex="-1" aria-hidden="true">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Seleccionar Producto</h5>
                                    <button type="button" className="btn-close" onClick={() => setModalVisible(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label htmlFor="productoSelect">Producto</label>
                                        <Select
                                            options={productos.map(producto => ({
                                                value: producto.id,
                                                label: `${producto.nombre} - €${producto.precio}`,
                                            }))}
                                            onChange={(selectedOption) =>
                                                handleSelectProducto(productos.find(p => p.id === selectedOption.value))
                                            }
                                            placeholder="Buscar producto..."
                                        />
                                    </div>

                                    {productoSeleccionado && (
                                        <div className="mt-3">
                                            <h5>Detalles del Producto</h5>
                                            <p><strong>Nombre:</strong> {productoSeleccionado.nombre}</p>
                                            <p><strong>Precio:</strong> €{productoSeleccionado.precio}</p>
                                            <p><strong>IVA:</strong> {productoSeleccionado.iva}%</p>
                                            <div className="mt-3">
                                                <label>Cantidad</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={cantidad}
                                                    onChange={(e) => setCantidad(Number(e.target.value))}
                                                    min="1"
                                                />
                                            </div>
                                            <div className="mt-3">
                                                <button className="btn" style={{ backgroundColor: "#a7c5eb" }} onClick={handleAddDetalle}>
                                                    Agregar Producto
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NuevaFacturaComponent;
