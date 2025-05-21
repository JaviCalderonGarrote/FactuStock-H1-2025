import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import Select from "react-select";
import { Pagination } from 'react-bootstrap';

const convertToISOFormat = (date) => {
    const dateObj = new Date(date);
    return dateObj.toISOString();
};

const NuevaFacturaComponent = () => {
    const navigate = useNavigate();
    const [factura, setFactura] = useState({
        fecha: "",
        empresaPersonaFisica: null,
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
    const [modalVisible, setModalVisible] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [cantidad, setCantidad] = useState(1);
    const [detalleMano, setDetalleMano] = useState({
        nombre: "",
        iva: 21,
        cantidad: 1,
        precio: 0,
    });
    const [isProducto, setIsProducto] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const detallesPorPagina = 4;

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
                setEmpresasPersonaFisica(empresaResponse.data.map(emp => ({
                    value: emp.id,
                    label: `${emp.nombre} (${emp.tipo})`
                })));

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

    const handleChange = (name, value) => {
        setFactura({ ...factura, [name]: value });
    };

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
                precioUnitario: parseFloat(productoSeleccionado.precio),
                iva: productoSeleccionado.iva,
                subtotal,
            };
        } else if (!isProducto) {
            const subtotal = calcularSubtotal(detalleMano.cantidad, detalleMano.precio);
            detalle = {
                nombre: detalleMano.nombre,
                cantidad: detalleMano.cantidad,
                precioUnitario: parseFloat(detalleMano.precio),
                iva: detalleMano.iva,
                subtotal,
            };
        }

        if (!detalle) return;

        const nuevosDetalles = [...factura.detalles];
        const detalleExistente = nuevosDetalles.findIndex(d =>
            d.producto?.id === detalle.producto?.id || d.nombre === detalle.nombre
        );

        if (detalleExistente !== -1) {
            nuevosDetalles[detalleExistente].cantidad += detalle.cantidad;
            nuevosDetalles[detalleExistente].subtotal += detalle.subtotal;
        } else {
            nuevosDetalles.push(detalle);
        }

        const totalFactura = nuevosDetalles.reduce((total, detalle) => total + detalle.subtotal, 0);

        setFactura({
            ...factura,
            detalles: nuevosDetalles,
            total: totalFactura,
        });

        setModalVisible(false);
        resetModal();
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

        if (!factura.fecha || !factura.empresaPersonaFisica) {
            Swal.fire("Error", "Por favor selecciona una empresa/persona física y una fecha.", "error");
            return;
        }

        if (!organizacion || !usuario) {
            Swal.fire("Error", "No se pudo obtener la organización o el usuario.", "error");
            return;
        }

        Swal.fire({
            title: 'Creando factura...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

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
                throw new Error("No se encontró el ID de la organización.");
            }

            const numeroFactura = `Fac_${organizacionId}_${String(year).padStart(2, "0")}/${String(month).padStart(2, "0")}/${String(sequence).padStart(5, "0")}`;

            const facturaData = {
                ...factura,
                fecha: convertToISOFormat(factura.fecha),
                organizacion: organizacion,
                usuario: usuario,
                numeroFactura: numeroFactura,
                empresaPersonaFisica: { id: factura.empresaPersonaFisica.value },
                formaPago: factura.formaCobro,
                detalles: factura.detalles,
                total: factura.total,
            };

            await axios.post("http://localhost:8080/facturas", facturaData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            Swal.close();
            navigate("/facturas");

            Swal.fire({
                title: "Éxito",
                text: "Factura creada correctamente.",
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            });

        } catch (err) {
            Swal.close();
            Swal.fire("Error", err.response?.data?.message || "Hubo un problema al crear la factura.", "error");
        }
    };

    const resetModal = () => {
        setProductoSeleccionado(null);
        setCantidad(1);
        setDetalleMano({ nombre: "", iva: 21, cantidad: 1, precio: 0 });
        setIsProducto(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        resetModal();
    };

    const indexOfLastDetalle = currentPage * detallesPorPagina;
    const indexOfFirstDetalle = indexOfLastDetalle - detallesPorPagina;
    const currentDetalles = factura.detalles.slice(indexOfFirstDetalle, indexOfLastDetalle);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
                            <Select
                                options={empresasPersonaFisica}
                                value={factura.empresaPersonaFisica}
                                onChange={(selectedOption) => handleChange("empresaPersonaFisica", selectedOption)}
                                placeholder="Selecciona una empresa/persona..."
                                isClearable
                                isSearchable
                            />
                        </div>

                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label">Fecha</label>
                            <input
                                type="date"
                                className="form-control"
                                name="fecha"
                                value={factura.fecha}
                                onChange={(e) => handleChange("fecha", e.target.value)}
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
                                        {currentDetalles.map((detalle, index) => (
                                            <tr key={index}>
                                                <td>{detalle.nombre || detalle.producto?.nombre}</td>
                                                <td>{detalle.cantidad}</td>
                                                <td>{detalle.precioUnitario.toFixed(2)}</td>
                                                <td>{detalle.subtotal.toFixed(2)}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleRemoveDetalle(indexOfFirstDetalle + index)}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                    <div className="d-flex justify-content-center align-items-center mt-3">
                                        <Pagination>
                                            {[...Array(Math.ceil(factura.detalles.length / detallesPorPagina)).keys()].map(number => (
                                                <Pagination.Item key={number + 1} active={number + 1 === currentPage} onClick={() => paginate(number + 1)}>
                                                    {number + 1}
                                                </Pagination.Item>
                                            ))}
                                        </Pagination>
                                    </div>
                                    <div className="text-end mt-3">
                                        <h5>Total: <strong>{factura.total.toFixed(2)}€</strong></h5>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="col-12 mb-3">
                            <button type="submit" className="btn" style={{ backgroundColor: "#a7c5eb", width: "100%" }}>
                                Crear Factura
                            </button>
                        </div>
                    </div>
                </form>

                {modalVisible && (
                    <div className="modal fade show" style={{ display: "block" }} tabIndex="-1" aria-hidden="true">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header" style={{ backgroundColor: "#a7c5eb", color: "#fff" }}>
                                    <h5 className="modal-title">Añadir Detalle a la Factura</h5>
                                    <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="form-group mb-4">
                                        <label className="mb-2">Tipo de Detalle</label>
                                        <div className="btn-group w-100" role="group">
                                            <button
                                                type="button"
                                                className={`btn ${isProducto ? 'btn-primary' : 'btn-outline-primary'}`}
                                                onClick={() => setIsProducto(true)}
                                            >
                                                Producto
                                            </button>
                                            <button
                                                type="button"
                                                className={`btn ${!isProducto ? 'btn-primary' : 'btn-outline-primary'}`}
                                                onClick={() => setIsProducto(false)}
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
                                                <div className="mt-3 p-3 border rounded">
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
                                        </>
                                    )}

                                    <div className="mt-4 text-center">
                                        <button
                                            className="btn"
                                            style={{ backgroundColor: "#a7c5eb" }}
                                            onClick={() => {
                                                handleAddDetalle();
                                                handleCloseModal();
                                            }}
                                        >
                                            Añadir Detalle
                                        </button>
                                    </div>
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
