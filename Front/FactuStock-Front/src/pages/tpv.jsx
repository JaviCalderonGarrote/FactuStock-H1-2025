import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import '../assets/tpv.css';
import { FaShoppingCart, FaUser, FaTrash, FaPrint, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Select from 'react-select';

const TPV = () => {
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [organizacion, setOrganizacion] = useState(null);
    const [usuario, setUsuario] = useState(null);
    const [cajaAbierta, setCajaAbierta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [keypadDisplay, setKeypadDisplay] = useState('');
    const [error, setError] = useState(null);
    const [showClienteModal, setShowClienteModal] = useState(false);
    const [clientes, setClientes] = useState([]);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [clienteOptions, setClienteOptions] = useState([]);
    const [clienteSeleccionadoModal, setClienteSeleccionadoModal] = useState(null);

    const [usuarioIncompleto, setUsuarioIncompleto] = useState(false);
    const [usuarioCamposFaltantes, setUsuarioCamposFaltantes] = useState([]);

    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");

    const handleResize = useCallback(() => {}, []);

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    useEffect(() => {
        if (!token) {
            setError("No se encontró un token de autenticación.");
            Swal.fire("Error", "No se encontró un token de autenticación.", "error");
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const decodedToken = JSON.parse(atob(token.split(".")[1]));
                const userId = decodedToken?.idUsuario;

                if (!userId) {
                    throw new Error("ID de usuario no encontrado en el token.");
                }

                const userResponse = await axios.get(`http://localhost:8080/usuarios/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setUsuario(userResponse.data);
                setOrganizacion(userResponse.data.organizacion);

                // Validación de campos obligatorios del usuario
                const camposObligatorios = [
                    { campo: "nombre", label: "Nombre" },
                    { campo: "email", label: "Email" },
                ];
                const camposFaltantes = [];
                camposObligatorios.forEach(({ campo, label }) => {
                    if (!userResponse.data[campo] || (typeof userResponse.data[campo] === "string" && userResponse.data[campo].trim() === "")) {
                        camposFaltantes.push(label);
                    }
                });
                if (!userResponse.data.organizacion || !userResponse.data.organizacion.id) {
                    if (!camposFaltantes.includes("Organización")) camposFaltantes.push("Organización");
                }

                if (camposFaltantes.length > 0) {
                    setUsuarioIncompleto(true);
                    setUsuarioCamposFaltantes(camposFaltantes);
                } else {
                    setUsuarioIncompleto(false);
                    setUsuarioCamposFaltantes([]);
                }

                const cajasResponse = await axios.get('http://localhost:8080/cajas', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const cajaAbiertaFound = cajasResponse.data.find(caja => caja.estado === "ABIERTA");

                if (!cajaAbiertaFound) {
                    Swal.fire({
                        title: "No hay caja abierta",
                        text: "¿Desea abrir una caja ahora?",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonText: "Abrir caja",
                        cancelButtonText: "Cancelar"
                    }).then((result) => {
                        if (result.isConfirmed) {
                            navigate('/caja');
                        }
                    });
                    return;
                }

                setCajaAbierta(cajaAbiertaFound);

                const categoriasResponse = await axios.get(
                    `http://localhost:8080/categoriasProducto/organizacion/${userResponse.data.organizacion.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setCategories(categoriasResponse.data.length ? categoriasResponse.data : []);

                const clientesResponse = await axios.get(
                    `http://localhost:8080/EmpresaPersonaFisica/organizacion/${userResponse.data.organizacion.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setClientes(clientesResponse.data);
                setClienteOptions(clientesResponse.data.map(cliente => ({
                    value: cliente.id,
                    label: cliente.nombre
                })));
            } catch (error) {
                console.error("Error al cargar datos:", error);
                if (error.response && error.response.status === 403) {
                    setError("Token inválido o expirado. Por favor, inicie sesión nuevamente.");
                    localStorage.removeItem("authToken");
                    Swal.fire("Error de autenticación", "Por favor, inicie sesión nuevamente.", "error");
                    navigate('/login');
                } else {
                    let mensaje = "Hubo un problema al cargar los datos.";
                    if (error.response && error.response.data) {
                        mensaje += ` Detalle: ${JSON.stringify(error.response.data)}`;
                    } else if (error.message) {
                        mensaje += ` Detalle: ${error.message}`;
                    }
                    setError(mensaje);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, navigate]);

    // --- ADVERTENCIAS TPV ---
    useEffect(() => {
        if (!loading) {
            if (!categories.length) {
                Swal.fire({
                    title: "Sin categorías",
                    text: "No hay categorías creadas. ¿Desea crear una ahora?",
                    icon: "info",
                    showCancelButton: true,
                    confirmButtonText: "Crear categoría",
                    cancelButtonText: "Cancelar"
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/category-product');
                    }
                });
            } else if (selectedCategory && !products.length) {
                Swal.fire({
                    title: "Sin productos",
                    text: "No hay productos en esta categoría. ¿Desea crear uno ahora?",
                    icon: "info",
                    showCancelButton: true,
                    confirmButtonText: "Crear producto",
                    cancelButtonText: "Cancelar"
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/category-product');
                    }
                });
            }
            // Eliminado el alert de clientes aquí
        }
    }, [loading, categories, products, selectedCategory, navigate]);

    // Mostrar error con Swal
    useEffect(() => {
        if (error) {
            Swal.fire({
                title: "Error",
                text: error,
                icon: "error",
                confirmButtonText: "Aceptar"
            });
        }
    }, [error]);

    // Mostrar advertencia de usuario incompleto con Swal

    const handleCategorySelect = async (categoryId) => {
        setSelectedCategory(categoryId);
        try {
            const productosResponse = await axios.get(
                `http://localhost:8080/productos/organizacion/${organizacion.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const filteredProducts = productosResponse.data
                .filter(product => product.categoria.id === categoryId && product.cantidadStock > 0)
                .sort((a, b) => a.nombre.localeCompare(b.nombre));

            if (filteredProducts.length === 0) {
                Swal.fire({
                    title: "Sin productos",
                    text: "Esta categoría no tiene productos disponibles. ¿Desea crear nuevos productos?",
                    icon: "info",
                    showCancelButton: true,
                    confirmButtonText: "Crear productos",
                    cancelButtonText: "Cancelar"
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/products');
                    }
                });
            }

            setProducts(filteredProducts);
        } catch (error) {
            console.error('Error al cargar productos:', error);
            Swal.fire({
                title: "Error",
                text: "No se pudieron cargar los productos. ¿Desea crear nuevos productos?",
                icon: "error",
                showCancelButton: true,
                confirmButtonText: "Crear productos",
                cancelButtonText: "Cancelar"
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/products');
                }
            });
        }
    };

    const handleProductSelect = (product) => {
        const quantity = parseInt(keypadDisplay) || 1;
        if (quantity > product.cantidadStock) {
            Swal.fire("Error", `Solo hay ${product.cantidadStock} unidades disponibles.`, "error");
            return;
        }
        setSelectedProducts(prevProducts => {
            const existingProduct = prevProducts.find(p => p.id === product.id);
            if (existingProduct) {
                const newQuantity = existingProduct.quantity + quantity;
                if (newQuantity > product.cantidadStock) {
                    Swal.fire("Error", `No hay suficiente stock. Stock disponible: ${product.cantidadStock}`, "error");
                    return prevProducts;
                }
                return prevProducts.map(p =>
                    p.id === product.id ? { ...p, quantity: newQuantity } : p
                );
            } else {
                return [...prevProducts, { ...product, quantity: quantity }];
            }
        });
        setKeypadDisplay('');
    };

    const handleProductRemove = (productId) => {
        const amountToRemove = parseInt(keypadDisplay) || 1;
        setSelectedProducts(prevProducts => {
            const updatedProducts = prevProducts.map(p =>
                p.id === productId
                    ? { ...p, quantity: Math.max(0, p.quantity - amountToRemove) }
                    : p
            ).filter(p => p.quantity > 0);
            return updatedProducts;
        });
        setKeypadDisplay('');
    };

    const handleKeypadInput = (value) => {
        if (value === 'Enter') {
            return;
        }
        if (value === 'C') {
            setKeypadDisplay('');
            return;
        }
        setKeypadDisplay(prevDisplay => prevDisplay + value);
    };

    const handleAbrirModalCliente = () => {
        setClienteSeleccionadoModal(selectedCliente);
        setShowClienteModal(true);
    };

    const handleAction = async (action) => {
        if (action === 'cobrar') {
            if (selectedProducts.length === 0) {
                Swal.fire("Error", "No hay productos seleccionados para cobrar.", "error");
                return;
            }
            const totalCarrito = selectedProducts.reduce((total, product) => total + (product.precio * product.quantity), 0);
            const cantidadPagada = parseFloat(keypadDisplay);

            if (cantidadPagada && cantidadPagada < totalCarrito) {
                Swal.fire("Error", "La cantidad ingresada es menor que el total del carrito.", "error");
                return;
            }

            await handleFinalizarVenta(totalCarrito, isNaN(cantidadPagada) ? null : cantidadPagada);
        } else if (action === 'añadir-cliente') {
            // Solo mostrar alert si no hay clientes al pulsar añadir cliente
            if (!clientes.length) {
                Swal.fire({
                    title: "Sin clientes",
                    text: "No hay clientes creados. ¿Desea crear uno ahora?",
                    icon: "info",
                    showCancelButton: true,
                    confirmButtonText: "Crear cliente",
                    cancelButtonText: "Cancelar"
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/clients');
                    }
                });
                return;
            }
            handleAbrirModalCliente();
        } else if (action === 'cancelar') {
            setSelectedProducts([]);
            setKeypadDisplay('');
            Swal.fire("Venta cancelada", "Se han eliminado todos los productos del carrito", "info");
        } else if (action === 'imprimir') {
            console.log('Imprimiendo ticket...');
        }
    };

    const handleFinalizarVenta = async (totalCarrito, cantidadPagada) => {
        try {
            if (!cajaAbierta) {
                throw new Error("No hay una caja abierta para realizar la venta");
            }

            if (selectedCliente && !clientes.some(c => c.id === selectedCliente.id)) {
                throw new Error("Cliente seleccionado no válido");
            }

            const ventaData = {
                fecha: new Date().toISOString(),
                usuario: { id: usuario.id },
                caja: { id: cajaAbierta.id },
                organizacion: { id: organizacion.id },
                empresaPersonaFisica: selectedCliente ? { id: selectedCliente.id } : null,
                detalles: selectedProducts.map(product => ({
                    producto: { id: product.id },
                    cantidad: product.quantity,
                    precioUnitario: parseFloat(product.precio),
                    iva: parseFloat(product.iva),
                    subtotal: parseFloat((product.precio * product.quantity).toFixed(2)),
                    nombre: product.nombre
                }))
            };

            await axios.post('http://localhost:8080/ventas', ventaData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            for (const product of selectedProducts) {
                await axios.put(`http://localhost:8080/productos/${product.id}`, {
                    id: product.id,
                    nombre: product.nombre,
                    cantidadStock: product.cantidadStock - product.quantity,
                    precio: product.precio,
                    iva: product.iva,
                    categoria: product.categoria,
                    organizacion: { id: organizacion.id }
                }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }

            const cajaActualizada = {
                id: cajaAbierta.id,
                totalIngresado: cajaAbierta.totalIngresado + totalCarrito,
                cantidadVentas: cajaAbierta.cantidadVentas + 1,
                estado: cajaAbierta.estado,
                organizacion: { id: organizacion.id }
            };

            await axios.put(`http://localhost:8080/cajas/${cajaAbierta.id}`, cajaActualizada, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (cantidadPagada) {
                let mensaje = `Total: ${totalCarrito.toFixed(2)}€`;
                const cambio = cantidadPagada - totalCarrito;
                mensaje += `<br>Pagado: ${cantidadPagada.toFixed(2)}€<br>Cambio: ${cambio.toFixed(2)}€`;

                Swal.fire({
                    title: "Venta realizada",
                    html: mensaje,
                    icon: "success"
                });
            }

            setSelectedProducts([]);
            setSelectedCliente(null);
            setKeypadDisplay('');

            setCajaAbierta(prevCaja => ({
                ...prevCaja,
                totalIngresado: prevCaja.totalIngresado + totalCarrito,
                cantidadVentas: prevCaja.cantidadVentas + 1
            }));

            if (selectedCategory) {
                handleCategorySelect(selectedCategory);
            }
        } catch (error) {
            console.error("Error al procesar la venta:", error);
            let errorMessage = "No se pudo procesar la venta";
            if (error.response && error.response.data) {
                errorMessage += ": " + error.response.data;
            } else if (error.message) {
                errorMessage += ": " + error.message;
            }

            if (errorMessage.includes("No hay una caja abierta para realizar la venta")) {
                Swal.fire({
                    title: "Error",
                    text: "No hay una caja abierta para realizar la venta. ¿Desea abrir una caja?",
                    icon: "error",
                    showCancelButton: true,
                    confirmButtonText: "Abrir caja",
                    cancelButtonText: "Cancelar"
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/caja');
                    }
                });
            } else {
                Swal.fire("Error", errorMessage, "error");
            }
        }
    };

    // --- COMPONENTES INTERNOS ---
    const ProductList = ({ products, onRemove }) => (
        <div className="product-list">
            <div className="total-section">
                <h3>Total: {products.reduce((total, product) => total + (product.precio * product.quantity), 0).toFixed(2)}€</h3>
            </div>
            <table className="product-table">
                <thead>
                <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Total</th>
                    <th>Acción</th>
                </tr>
                </thead>
                <tbody>
                {products.map(product => (
                    <tr key={product.id} className="product-item">
                        <td className="product-name">{product.nombre}</td>
                        <td className="product-quantity">x{product.quantity}</td>
                        <td className="product-price">{product.precio.toFixed(2)}€</td>
                        <td className="product-total">{(product.precio * product.quantity).toFixed(2)}€</td>
                        <td>
                            <button onClick={() => onRemove(product.id)} className="remove-button">X</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );

    const NumericKeypad = ({ onInput, display }) => {
        const buttons = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.', 'C', 'Enter'];
        return (
            <div className="numeric-keypad-container">
                <div className="keypad-display">{display || '0'}</div>
                <div className="numeric-keypad">
                    {buttons.map(btn => (
                        <button key={btn} onClick={() => onInput(btn)} className="keypad-button">{btn}</button>
                    ))}
                </div>
            </div>
        );
    };

    // --- CARD ESPECIAL SI NO HAY CATEGORÍAS ---
    const CategoryGrid = ({ categories, onCategorySelect }) => (
        <div className="category-grid">
            {categories.length === 0 ? (
                <button
                    className="category-button category-empty"
                    onClick={() => {
                        Swal.fire({
                            title: "No hay categorías",
                            text: "¿Desea crear una categoría ahora?",
                            icon: "info",
                            showCancelButton: true,
                            confirmButtonText: "Crear categoría",
                            cancelButtonText: "Cancelar"
                        }).then((result) => {
                            if (result.isConfirmed) {
                                navigate('/category-product');
                            }
                        });
                    }}
                >
                    <span style={{ fontSize: "2em" }}>+</span>
                    <div>Crear Categoría</div>
                </button>
            ) : (
                categories.map(category => (
                    <button key={category.id} onClick={() => onCategorySelect(category.id)} className="category-button">
                        {category.nombre}
                    </button>
                ))
            )}
        </div>
    );

    // --- EFECTO HOVER AMPLIADO EN PRODUCTOS ---
    const ProductGrid = ({ products, onProductSelect, onBackToCategories }) => {
        const gridRef = useRef(null);
        const [gridSize, setGridSize] = useState({ columns: 5, rows: 2 });
        const [currentPage, setCurrentPage] = useState(1);
        const [productsPerPage, setProductsPerPage] = useState(10);

        const [hoveredProductId, setHoveredProductId] = useState(null);
        const [showInfoProductId, setShowInfoProductId] = useState(null);
        const hoverTimeout = useRef(null);

        const handleMouseEnter = (productId) => {
            setHoveredProductId(productId);
            hoverTimeout.current = setTimeout(() => {
                setShowInfoProductId(productId);
            }, 2000);
        };

        const handleMouseLeave = () => {
            setHoveredProductId(null);
            setShowInfoProductId(null);
            clearTimeout(hoverTimeout.current);
        };

        useEffect(() => {
            const updateGridSize = () => {
                if (gridRef.current) {
                    const rect = gridRef.current.getBoundingClientRect();
                    if (rect.width >= 1400) {
                        setGridSize({ columns: 6, rows: 3 });
                        setProductsPerPage(18);
                    } else {
                        setGridSize({ columns: 5, rows: 2 });
                        setProductsPerPage(10);
                    }
                }
            };
            updateGridSize();
            window.addEventListener('resize', updateGridSize);
            return () => window.removeEventListener('resize', updateGridSize);
        }, []);

        const totalPages = Math.ceil(products.length / productsPerPage);
        const indexOfLastProduct = currentPage * productsPerPage;
        const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
        const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

        const paginate = (pageNumber) => setCurrentPage(pageNumber);

        return (
            <div className="product-grid-container">
                <button onClick={onBackToCategories} className="back-button">
                    <FaChevronLeft /> Volver a Categorías
                </button>
                <div
                    className="product-grid"
                    ref={gridRef}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${gridSize.columns}, 1fr)`,
                        gridTemplateRows: `repeat(${gridSize.rows}, 1fr)`,
                        gap: '5px',
                        justifyContent: 'center',
                        alignContent: 'center',
                        height: 'calc(100% - 60px)',
                    }}
                >
                    {currentProducts.map(product => (
                        <button
                            key={product.id}
                            onClick={() => onProductSelect(product)}
                            className={`product-button${showInfoProductId === product.id ? ' product-button-expanded' : ''}`}
                            style={{ overflow: 'hidden', position: 'relative' }}
                            onMouseEnter={() => handleMouseEnter(product.id)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <h3>{product.nombre}</h3>
                            <p>{product.precio.toFixed(2)}€</p>
                            <span style={{ fontSize: '0.8em', color: '#888' }}>Stock: {product.cantidadStock}</span>
                            {showInfoProductId === product.id && (
                                <div className="product-info-tooltip">
                                    {/* Aquí puedes mostrar más info del producto */}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
                <div className="paginationtpv">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        aria-label="Página anterior"
                    >
                        <FaChevronLeft size={20} />
                    </button>
                    <span className="paginationtpv-page">
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        aria-label="Página siguiente"
                    >
                        <FaChevronRight size={20} />
                    </button>
                </div>
            </div>
        );
    };

    const ActionButtons = ({ onAction, selectedCliente }) => (
        <div className="action-buttons">
            <button onClick={() => onAction('cobrar')} className="action-button cobrar">
                <FaShoppingCart /> Cobrar
            </button>
            <button
                onClick={() => onAction('añadir-cliente')}
                className={`action-button cliente${selectedCliente ? ' cliente-seleccionado' : ''}`}
            >
                <FaUser /> {selectedCliente ? selectedCliente.nombre : 'Añadir Cliente'}
            </button>
            <button onClick={() => onAction('cancelar')} className="action-button cancelar">
                <FaTrash /> Cancelar Venta
            </button>
            <button onClick={() => onAction('imprimir')} className="action-button imprimir">
                <FaPrint /> Imprimir Ticket
            </button>
        </div>
    );

    if (loading) {
        return <div className="loading">Cargando...</div>;
    }

    if (!cajaAbierta) {
        return (
            <div className="no-caja-abierta">
                <h2>No hay caja abierta</h2>
                <p>Es necesario abrir una caja para usar el TPV.</p>
                <button onClick={() => navigate('/caja')} className="btn btn-primary">
                    Ir a Gestión de Cajas
                </button>
            </div>
        );
    }

    return (
        <div className="app-container">
            <Sidebar />
            <div className="tpv-container">
                <div className="tpv-grid">
                    <div className="product-list-section">
                        <h2>Carrito de Compras</h2>
                        <div className="product-list-scroll">
                            <ProductList products={selectedProducts} onRemove={handleProductRemove} />
                        </div>
                    </div>
                    <div className="product-grid-section">
                        {selectedCategory ? (
                            <ProductGrid
                                products={products}
                                onProductSelect={handleProductSelect}
                                onBackToCategories={() => setSelectedCategory(null)}
                            />
                        ) : (
                            <CategoryGrid categories={categories} onCategorySelect={handleCategorySelect} />
                        )}
                    </div>
                    <div className="keypad-section">
                        <NumericKeypad onInput={handleKeypadInput} display={keypadDisplay} />
                    </div>
                    <div className="action-buttons-section">
                        <ActionButtons onAction={handleAction} selectedCliente={selectedCliente} />
                    </div>
                </div>
            </div>

            {showClienteModal && (
                <div className="modal fade show" style={{ display: "block" }} data-testid="cliente-modal">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content shadow-lg rounded">
                            <div className="modal-header" style={{ backgroundColor: '#a7c5eb', color: '#fff' }}>
                                <h5 className="modal-title">Seleccionar Cliente</h5>
                                <button type="button" className="btn-close" onClick={() => setShowClienteModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="form-group mb-3">
                                        <label htmlFor="cliente" className="form-label">Cliente</label>
                                        <Select
                                            options={clienteOptions}
                                            value={clienteSeleccionadoModal ? { value: clienteSeleccionadoModal.id, label: clienteSeleccionadoModal.nombre } : null}
                                            onChange={(selectedOption) => {
                                                const cliente = clientes.find(c => c.id === selectedOption?.value);
                                                setClienteSeleccionadoModal(cliente || null);
                                            }}
                                            placeholder="Buscar cliente..."
                                            isClearable
                                            isSearchable
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        className="btn"
                                        style={{ backgroundColor: '#a7c5eb', width: '100%', color: '#fff' }}
                                        onClick={() => {
                                            setSelectedCliente(clienteSeleccionadoModal || null);
                                            setShowClienteModal(false);
                                            if (clienteSeleccionadoModal) {
                                                Swal.fire("Cliente seleccionado", `Se ha asignado el cliente: ${clienteSeleccionadoModal.nombre}`, "success");
                                            } else {
                                                Swal.fire("Sin cliente", "No se ha asignado ningún cliente a la venta", "info");
                                            }
                                        }}
                                    >
                                        Confirmar Selección
                                    </button>
                                </form>
                                <button type="button" className="btn btn-secondary mt-3" onClick={() => setShowClienteModal(false)} style={{ width: '100%' }}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TPV;