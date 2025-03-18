-- ==========================================
-- Tabla Organizacion
-- ==========================================
CREATE TABLE Organizacion (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    direccion VARCHAR(255),
    telefono VARCHAR(20),
    nifCif VARCHAR(50) NOT NULL UNIQUE,
    web VARCHAR(255),
    email VARCHAR(255),
    logo VARCHAR(255),
    IBAN VARCHAR(34)
);

-- ==========================================
-- Tabla Caja
-- ==========================================
CREATE TABLE Caja (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    fechaInicio DATETIME NOT NULL,
    fechaFin DATETIME,
    totalIngresado DECIMAL(10,2) DEFAULT 0,
    cantidadVentas INT DEFAULT 0,
    estado ENUM('ABIERTA', 'CERRADA') NOT NULL DEFAULT 'ABIERTA'
);

-- ==========================================
-- Tabla CategoriaGasto
-- ==========================================
CREATE TABLE CategoriaGasto (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    organizacion_id BIGINT,
    FOREIGN KEY (organizacion_id) REFERENCES Organizacion(id) ON DELETE SET NULL
);

-- ==========================================
-- Tabla CategoriaProducto
-- ==========================================
CREATE TABLE CategoriaProducto (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    organizacion_id BIGINT,
    FOREIGN KEY (organizacion_id) REFERENCES Organizacion(id) ON DELETE SET NULL
);

-- ==========================================
-- Tabla EmpresaOPersonaFisica
-- ==========================================
CREATE TABLE EmpresaOPersonaFisica (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    nifCif VARCHAR(50) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    web VARCHAR(255),
    mail VARCHAR(255) NOT NULL,
    tipo ENUM('CLIENTE', 'PROVEEDOR', 'AMBOS') NOT NULL,
    organizacion_id BIGINT,
    FOREIGN KEY (organizacion_id) REFERENCES Organizacion(id) ON DELETE SET NULL
);

-- ==========================================
-- Tabla Usuario
-- ==========================================
CREATE TABLE Usuario (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    rol ENUM('Administrador', 'Gerente', 'Vendedor') NOT NULL,
    password VARCHAR(255) NOT NULL,
    mail VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    organizacion_id BIGINT,
    FOREIGN KEY (organizacion_id) REFERENCES Organizacion(id) ON DELETE SET NULL
);

-- ==========================================
-- Tabla Factura
-- ==========================================
CREATE TABLE Factura (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    numeroFactura VARCHAR(50) NOT NULL UNIQUE,
    organizacion_id BIGINT,
    empresa_id BIGINT,
    usuario_id BIGINT,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    archivo LONGBLOB,
    estado ENUM('ENVIADA', 'RECIBIDA', 'ERROR', 'PAGADA', 'COMPLETADA') NOT NULL,
    fecha DATETIME NOT NULL,
    fechaCreacionFactura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    formaPago ENUM('NoCobrada', 'EFECTIVO', 'TARJETA', 'TRANSFERENCIA'),
    FOREIGN KEY (organizacion_id) REFERENCES Organizacion(id) ON DELETE SET NULL,
    FOREIGN KEY (empresa_id) REFERENCES EmpresaOPersonaFisica(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE SET NULL
);

-- ==========================================
-- Tabla Gasto
-- ==========================================
CREATE TABLE Gasto (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    monto DECIMAL(10,2) NOT NULL,
    numFactura VARCHAR(50),
    estado ENUM('RECIBIDO', 'PAGADO', 'COMPLETO') NOT NULL,
    archivoFactura LONGBLOB,
    organizacion_id BIGINT,
    usuario_id BIGINT,
    categoriaGasto_id BIGINT,
    FOREIGN KEY (organizacion_id) REFERENCES Organizacion(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE SET NULL,
    FOREIGN KEY (categoriaGasto_id) REFERENCES CategoriaGasto(id) ON DELETE SET NULL
);

-- ==========================================
-- Tabla Producto
-- ==========================================
CREATE TABLE Producto (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    categoria_id BIGINT,
    cantidadStock INT NOT NULL,
    iva DECIMAL(5,2) DEFAULT 21.00,
    FOREIGN KEY (categoria_id) REFERENCES CategoriaProducto(id) ON DELETE SET NULL
);

-- ==========================================
-- Tabla Venta
-- ==========================================
CREATE TABLE Venta (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    fecha DATETIME NOT NULL,
    usuario_id BIGINT,
    caja_id BIGINT,
    empresa_id BIGINT,
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE SET NULL,
    FOREIGN KEY (caja_id) REFERENCES Caja(id) ON DELETE SET NULL,
    FOREIGN KEY (empresa_id) REFERENCES EmpresaOPersonaFisica(id) ON DELETE SET NULL
);

-- ==========================================
-- Tabla Detalle
-- ==========================================
CREATE TABLE Detalle (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    venta_id BIGINT,
    producto_id BIGINT,
    factura_id BIGINT,
    cantidad INT NOT NULL,
    iva INT NOT NULL,
    precioUnitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (venta_id) REFERENCES Venta(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES Producto(id) ON DELETE SET NULL,
    FOREIGN KEY (factura_id) REFERENCES Factura(id) ON DELETE SET NULL
);

-- ==========================================
-- Tabla Ingreso
-- ==========================================
CREATE TABLE Ingreso (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    caja_id BIGINT,
    factura_id BIGINT,
    monto DECIMAL(10,2) NOT NULL,
    fecha DATETIME NOT NULL,
    organizacion_id BIGINT,
    FOREIGN KEY (caja_id) REFERENCES Caja(id) ON DELETE SET NULL,
    FOREIGN KEY (factura_id) REFERENCES Factura(id) ON DELETE SET NULL,
    FOREIGN KEY (organizacion_id) REFERENCES Organizacion(id) ON DELETE SET NULL
);
