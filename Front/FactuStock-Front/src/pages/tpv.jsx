import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import '../assets/tpv.css';
import { Modal, Button, Form } from 'react-bootstrap';
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
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");

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
        try {
            const productosResponse = await axios.get(
                `http://localhost:8080/productos/organizacion/${organizacion.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const filteredProducts = productosResponse.data
                .filter(product => product.categoria.id === categoryId && product.cantidadStock > 0);
            setProducts(filteredProducts);
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
        const quantity = parseInt(keypadDisplay) || 1;
        setSelectedProducts(prevProducts =>
            prevProducts.map(p =>
                p.id === productId
                    ? { ...p, quantity: Math.max(0, p.quantity - quantity) }
                    : p
            ).filter(p => p.quantity > 0)
        );
        setKeypadDisplay('');
    };

    const handleKeypadInput = (value) => {
        if (value === 'Enter') {
            return;
        }
        if (value === 'C') {
            setKeypadDisplay(prevDisplay => prevDisplay.slice(0, -1));
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
            handleFinalizarVenta();
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
            .slice(0, 5) // Limitar a 5 resultados
            .map(cliente => ({
                value: cliente.id,
                label: cliente.nombre
            }));
        setClienteOptions(filtered);
    };

    const handleClienteSelect = (selectedOption) => {
        setSelectedCliente(selectedOption ? clientes.find(c => c.id === selectedOption.value) : null);
    };

    const handleFinalizarVenta = async () => {
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
            const totalVenta = selectedProducts.reduce((total, product) => total + (product.precio * product.quantity), 0);
            const cajaActualizada = {
                id: cajaAbierta.id,
                totalIngresado: cajaAbierta.totalIngresado + totalVenta,
                cantidadVentas: cajaAbierta.cantidadVentas + 1,
                estado: cajaAbierta.estado,
                organizacion: { id: organizacion.id }
            };

            await axios.put(`http://localhost:8080/cajas/${cajaAbierta.id}`, cajaActualizada, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            Swal.fire("Éxito", "Venta realizada correctamente", "success");
            setSelectedProducts([]);
            setSelectedCliente(null);

            // Actualizar el estado de la caja abierta
            setCajaAbierta(prevCaja => ({
                ...prevCaja,
                totalIngresado: prevCaja.totalIngresado + totalVenta,
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
            {products.map(product => (
                <div key={product.id} className="product-item">
                    <span>{product.nombre}</span>
                    <span>x{product.quantity}</span>
                    <span>${product.precio.toFixed(2)}</span>
                    <span>${(product.precio * product.quantity).toFixed(2)}</span>
                    <button onClick={() => onRemove(product.id)} className="remove-button">X</button>
                </div>
            ))}
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

    const ProductGrid = ({ products, onProductSelect, onBackToCategories }) => (
        <div className="product-grid">
            <button onClick={onBackToCategories} className="back-button">Volver a Categorías</button>
            {products.map(product => (
                <button key={product.id} onClick={() => onProductSelect(product)} className="product-button">
                    <h3>{product.nombre}</h3>
                    <p>${product.precio.toFixed(2)}</p>
                    <p>Stock: {product.cantidadStock}</p>
                </button>
            ))}
        </div>
    );

    const ActionButtons = ({ onAction }) => (
        <div className="action-buttons">
            <button onClick={() => onAction('cobrar')}>Cobrar</button>
            <button onClick={() => onAction('añadir-cliente')}>Añadir Cliente</button>
            <button onClick={() => onAction('cancelar')}>Cancelar Venta</button>
            <button onClick={() => onAction('imprimir')}>Imprimir Ticket</button>
        </div>
    );

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (error) {
        return <div className="alert alert-danger text-center">{error}</div>;
    }

    return (
        <div className="app-container">
            <Sidebar />
            <div className="tpv-container">
                <div className="tpv-grid">
                    <div className="product-list-section">
                        <ProductList products={selectedProducts} onRemove={handleProductRemove} />
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
