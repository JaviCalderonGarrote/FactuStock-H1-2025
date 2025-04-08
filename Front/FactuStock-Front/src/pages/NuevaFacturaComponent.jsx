import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import Select from "react-select";

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
    const [modalVisible, setModalVisible] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [cantidad, setCantidad] = useState(1);
    const [detalleMano, setDetalleMano] = useState({
        nombre: "",
        iva: 21,
        cantidad: 1,
        precio: 0,
    });
    const [isProducto, setIsProducto] = useState(true); // Estado para alternar entre producto o detalle personalizado
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

    // Función para calcular el subtotal
    const calcularSubtotal = (cantidad, precio) => {
        return cantidad * precio;
    };

    const handleAddDetalle = () => {
        let detalle;

        if (isProducto && productoSeleccionado) {
            const subtotal = calcularSubtotal(cantidad, productoSeleccionado.precio);
            detalle = {
                producto: productoSeleccionado,
                cantidad,
                precioUnitario: parseFloat(productoSeleccionado.precio), // Asegurarnos que sea un número
                iva: productoSeleccionado.iva,
                subtotal,
            };
        } else if (!isProducto) {
            const subtotal = calcularSubtotal(detalleMano.cantidad, detalleMano.precio);
            detalle = {
                nombre: detalleMano.nombre,
                cantidad: detalleMano.cantidad,
                precioUnitario: parseFloat(detalleMano.precio), // Asegurarnos que sea un número
                iva: detalleMano.iva,
                subtotal,
            };
        }

        if (!detalle) return;

        const nuevosDetalles = [...factura.detalles, detalle];
        const totalFactura = nuevosDetalles.reduce((total, detalle) => total + detalle.subtotal, 0);

        setFactura({
            ...factura,
            detalles: nuevosDetalles,
            total: totalFactura,
        });

        setModalVisible(false);

        setDetalleMano({ nombre: "", iva: 21, cantidad: 1, precio: 0 });
        setCantidad(1); // Reset cantidad a 1
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
                                <div className="table-responsive">
                                    <table className="table table-bordered table-striped">
                                        <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Cantidad</th>
                                            <th>Precio Unitario (€)</th>
                                            <th>Subtotal (€)</th>
                                            <th>Acciones</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {factura.detalles.map((detalle, index) => (
                                            <tr key={index}>
                                                <td>{detalle.nombre || detalle.producto?.nombre}</td>
                                                <td>{detalle.cantidad}</td>
                                                <td>{detalle.precioUnitario.toFixed(2)}</td>
                                                <td>{detalle.subtotal.toFixed(2)}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                        onClick={() => handleRemoveDetalle(index)}
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
                            </div>
                        )}

                        <div className="col-12 mb-3">
                            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                                Crear Factura
                            </button>
                        </div>
                    </div>
                </form>

                {modalVisible && (
                    <div className="modal fade show" style={{ display: "block" }} tabIndex="-1" aria-hidden="true">
                        <div className="modal-dialog modal-lg"> {/* Modal más grande */}
                            <div className="modal-content">
                                <div className="modal-header" style={{ backgroundColor: "#a7c5eb", color: "#fff" }}>
                                    <h5 className="modal-title">Seleccionar Producto o Detalle Personalizado</h5>
                                    <button type="button" className="btn-close" onClick={() => setModalVisible(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="form-group mb-3">
                                        <label htmlFor="productoSelect">Tipo de Detalle</label>
                                        <div className="d-flex justify-content-start gap-3">
                                            <button
                                                className="btn btn-secondary btn-lg"
                                                onClick={() => setIsProducto(true)} // Muestra los productos
                                            >
                                                Producto
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-lg"
                                                onClick={() => setIsProducto(false)} // Muestra el detalle personalizado
                                            >
                                                Detalle Personalizado
                                            </button>
                                        </div>
                                    </div>

                                    {isProducto ? (
                                        <>
                                            <div className="form-group mb-3">
                                                <label htmlFor="productoSelect">Producto</label>
                                                <Select
                                                    options={productos.map((producto) => ({
                                                        value: producto.id,
                                                        label: `${producto.nombre} - €${producto.precio}`,
                                                    }))}
                                                    onChange={(selectedOption) =>
                                                        handleSelectProducto(productos.find((p) => p.id === selectedOption.value))
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
                                                    <div className="mt-3 text-center">
                                                        <button
                                                            className="btn btn-success btn-lg"
                                                            onClick={handleAddDetalle}
                                                        >
                                                            Añadir Producto
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <div className="form-group mb-3">
                                                <label htmlFor="detalleManoNombre">Nombre del Detalle</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="detalleManoNombre"
                                                    name="nombre"
                                                    value={detalleMano.nombre}
                                                    onChange={(e) =>
                                                        setDetalleMano({ ...detalleMano, nombre: e.target.value })
                                                    }
                                                />
                                            </div>

                                            <div className="form-group mb-3">
                                                <label htmlFor="detalleManoPrecio">Precio (€)</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    id="detalleManoPrecio"
                                                    name="precio"
                                                    value={detalleMano.precio}
                                                    onChange={(e) =>
                                                        setDetalleMano({ ...detalleMano, precio: e.target.value })
                                                    }
                                                    min="0"
                                                />
                                            </div>

                                            <div className="form-group mb-3">
                                                <label htmlFor="detalleManoCantidad">Cantidad</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    id="detalleManoCantidad"
                                                    name="cantidad"
                                                    value={detalleMano.cantidad}
                                                    onChange={(e) =>
                                                        setDetalleMano({ ...detalleMano, cantidad: e.target.value })
                                                    }
                                                    min="1"
                                                />
                                            </div>

                                            <div className="mt-3 text-center">
                                                <button
                                                    className="btn btn-success btn-lg"
                                                    onClick={handleAddDetalle}
                                                >
                                                    Añadir Detalle
                                                </button>
                                            </div>
                                        </>
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
