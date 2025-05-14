import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import '../assets/tpv.css';
import { Modal, Button, Form } from 'react-bootstrap';
import Select from 'react-select';
import { FaShoppingCart, FaUser, FaTrash, FaPrint, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

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
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");

    const handleResize = useCallback(() => {
        setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight,
        });
    }, []);

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    const calculateProductsPerPage = useCallback(() => {
        const gridWidth = windowSize.width > 768 ? windowSize.width / 2 : windowSize.width;
        const gridHeight = windowSize.height * 0.6;
        const productWidth = 200;
        const productHeight = 200;
        const columns = Math.floor(gridWidth / productWidth);
        const rows = Math.floor(gridHeight / productHeight);
        return columns * rows;
    }, [windowSize]);

    const productsPerPage = calculateProductsPerPage();

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

                const cajasResponse = await axios.get('http://localhost:8080/cajas', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const cajaAbiertaFound = cajasResponse.data.find(caja => caja.estado === "ABIERTA");

                if (!cajaAbiertaFound) {
                    Swal.fire({
                        title: "No hay caja abierta",
                        text: "Es necesario abrir una caja para usar el TPV",
                        icon: "warning",
                        confirmButtonText: "Ir a Gestión de Cajas"
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
            } catch (error) {
                console.error("Error al cargar datos:", error);
                if (error.response && error.response.status === 403) {
                    setError("Token inválido o expirado. Por favor, inicie sesión nuevamente.");
                    localStorage.removeItem("authToken");
                    Swal.fire("Error de autenticación", "Por favor, inicie sesión nuevamente.", "error");
                    navigate('/login');
                } else {
                    setError("Hubo un problema al cargar los datos.");
                    Swal.fire("Error", "Hubo un problema al cargar los datos.", "error");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, navigate]);

    const handleCategorySelect = async (categoryId) => {
        setSelectedCategory(categoryId);
        setCurrentPage(1);
        try {
            const productosResponse = await axios.get(
                `http://localhost:8080/productos/organizacion/${organizacion.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const filteredProducts = productosResponse.data
                .filter(product => product.categoria.id === categoryId && product.cantidadStock > 0);

            if (filteredProducts.length === 0) {
                Swal.fire("Sin productos", "Esta categoría no tiene productos disponibles.", "info");
            }

            setProducts(filteredProducts);
            setTotalProducts(filteredProducts.length);
        } catch (error) {
            console.error('Error al cargar productos:', error);
            Swal.fire("Error", "No se pudieron cargar los productos.", "error");
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

            handleFinalizarVenta(totalCarrito, cantidadPagada);
        } else if (action === 'añadir-cliente') {
            setShowClienteModal(true);
        } else if (action === 'cancelar') {
            setSelectedProducts([]);
            setKeypadDisplay('');
            Swal.fire("Venta cancelada", "Se han eliminado todos los productos del carrito", "info");
        } else if (action === 'imprimir') {
            console.log('Imprimiendo ticket...');
        }
    };

    const handleClienteSearch = (inputValue) => {
        const filtered = clientes
            .filter(cliente =>
                cliente.nombre.toLowerCase().includes(inputValue.toLowerCase())
            )
            .slice(0, 5)
            .map(cliente => ({
                value: cliente.id,
                label: cliente.nombre
            }));
        setClienteOptions(filtered);
    };

    const handleClienteSelect = (selectedOption) => {
        setSelectedCliente(selectedOption ? clientes.find(c => c.id === selectedOption.value) : null);
    };

    const handleFinalizarVenta = async (totalCarrito, cantidadPagada) => {
        try {
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

            const response = await axios.post('http://localhost:8080/ventas', ventaData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log("Respuesta del servidor:", response.data);

            // Actualizar stock
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

            // Actualizar caja
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

            let mensaje = `Total: ${totalCarrito.toFixed(2)}€`;
            if (cantidadPagada) {
                const cambio = cantidadPagada - totalCarrito;
                mensaje += `<br>Pagado: ${cantidadPagada.toFixed(2)}€<br>Cambio: ${cambio.toFixed(2)}€`;
            }

            Swal.fire({
                title: "Venta realizada",
                html: mensaje,
                icon: "success"
            });

            setSelectedProducts([]);
            setSelectedCliente(null);
            setKeypadDisplay('');

            // Actualizar el estado de la caja abierta
            setCajaAbierta(prevCaja => ({
                ...prevCaja,
                totalIngresado: prevCaja.totalIngresado + totalCarrito,
                cantidadVentas: prevCaja.cantidadVentas + 1
            }));

            // Actualizar la lista de productos
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
            Swal.fire("Error", errorMessage, "error");
        }
    };

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

    const CategoryGrid = ({ categories, onCategorySelect }) => (
        <div className="category-grid">
            {categories.map(category => (
                <button key={category.id} onClick={() => onCategorySelect(category.id)} className="category-button">
                    {category.nombre}
                </button>
            ))}
        </div>
    );

    const MIN_COLUMNS_SMALL = 5;
    const MIN_COLUMNS_LARGE = 6;
    const MIN_ROWS = 2;

    const ProductGrid = ({ products, onProductSelect, onBackToCategories }) => {
        const gridRef = useRef(null);
        const [gridSize, setGridSize] = useState({ columns: MIN_COLUMNS_SMALL, rows: MIN_ROWS });
        const [currentPage, setCurrentPage] = useState(1);
        const [productsPerPage, setProductsPerPage] = useState(MIN_COLUMNS_SMALL * MIN_ROWS);

        useEffect(() => {
            const updateGridSize = () => {
                if (gridRef.current) {
                    const rect = gridRef.current.getBoundingClientRect();
                    const isLargeScreen = rect.width >= 1200;
                    const minColumns = isLargeScreen ? MIN_COLUMNS_LARGE : MIN_COLUMNS_SMALL;

                    const maxProductWidth = Math.floor(rect.width / minColumns);
                    const maxProductHeight = Math.floor(rect.height / MIN_ROWS);
                    const productSize = Math.min(maxProductWidth, maxProductHeight, 150);

                    const columns = Math.max(minColumns, Math.floor(rect.width / productSize));
                    const rows = Math.max(MIN_ROWS, Math.floor(rect.height / productSize));

                    setGridSize({ columns, rows });
                    setProductsPerPage(columns * rows);
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

        const paginate = (pageNumber) => {
            setCurrentPage(pageNumber);
        };

        return (
            <div className="product-grid-container">
                <button onClick={onBackToCategories} className="back-button">
                    <FaChevronLeft /> Volver a Categorías
                </button>
                <div className="product-grid" ref={gridRef} style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${gridSize.columns}, 1fr)`,
                    gridTemplateRows: `repeat(${gridSize.rows}, 1fr)`,
                    gap: '5px',
                    justifyContent: 'center',
                    alignContent: 'center',
                    height: 'calc(100% - 60px)',
                }}>
                    {currentProducts.map(product => (
                        <button key={product.id} onClick={() => onProductSelect(product)} className="product-button" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '5px',
                            height: '100%',
                            width: '100%',
                            minHeight: '100px',
                            maxHeight: '150px',
                            overflow: 'hidden',
                        }}>
                            <h3 style={{ fontSize: '1em', marginBottom: '5px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' }}>{product.nombre}</h3>
                            <p style={{ fontSize: '1em', fontWeight: 'bold', marginBottom: '5px' }}>{product.precio.toFixed(2)}€</p>
                            <p style={{ fontSize: '0.8em' }}>Stock: {product.cantidadStock}</p>
                        </button>
                    ))}
                </div>
                <div className="paginationtpv" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <FaChevronLeft />
                    </button>
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <FaChevronRight />
                    </button>
                </div>
            </div>
        );
    };

    const ActionButtons = ({ onAction }) => (
        <div className="action-buttons">
            <button onClick={() => onAction('cobrar')} className="action-button cobrar">
                <FaShoppingCart /> Cobrar
            </button>
            <button onClick={() => onAction('añadir-cliente')} className="action-button cliente">
                <FaUser /> Añadir Cliente
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

    if (error) {
        return <div className="error">{error}</div>;
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
                        <ActionButtons onAction={handleAction} />
                    </div>
                </div>
            </div>

            <Modal show={showClienteModal} onHide={() => setShowClienteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Seleccionar Cliente</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Cliente</Form.Label>
                        <Select
                            value={selectedCliente ? { value: selectedCliente.id, label: selectedCliente.nombre } : null}
                            onChange={handleClienteSelect}
                            onInputChange={handleClienteSearch}
                            options={clienteOptions}
                            isClearable
                            isSearchable
                            placeholder="Buscar cliente..."
                            noOptionsMessage={() => "No se encontraron clientes"}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowClienteModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={() => {
                        setShowClienteModal(false);
                        if (selectedCliente) {
                            Swal.fire("Cliente seleccionado", `Se ha asignado el cliente: ${selectedCliente.nombre}`, "success");
                        } else {
                            Swal.fire("Sin cliente", "No se ha asignado ningún cliente a la venta", "info");
                        }
                    }}>
                        Confirmar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default TPV;
