-- Tabla Organizacion
CREATE TABLE Organizacion (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    direccion VARCHAR(255),
    telefono VARCHAR(15),
    nifCif VARCHAR(20) NOT NULL,
    web VARCHAR(255),
    logo BLOB,
    gastos DECIMAL(10, 2) DEFAULT 0,
    ingresos DECIMAL(10, 2) DEFAULT 0
);

-- Tabla CategoriaGasto
CREATE TABLE CategoriaGasto (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL
);

-- Tabla Gasto
CREATE TABLE Gasto (
    id INT PRIMARY KEY AUTO_INCREMENT,
    monto DECIMAL(10, 2) NOT NULL,
    numFactura VARCHAR(50),
    estado ENUM('recibido', 'pagado', 'completo') NOT NULL,
    archivoFactura BLOB,
    idEmpresa INT,
    idUsuario INT,
    idCategoriaGasto INT,
    FOREIGN KEY (idEmpresa) REFERENCES Organizacion(id),
    FOREIGN KEY (idUsuario) REFERENCES Usuario(id),
    FOREIGN KEY (idCategoriaGasto) REFERENCES CategoriaGasto(id)
);

-- Tabla EmpresaOPersonaFisica
CREATE TABLE EmpresaOPersonaFisica (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    nifCif VARCHAR(20) NOT NULL,
    telefono VARCHAR(15),
    direccion VARCHAR(255),
    web VARCHAR(255),
    mail VARCHAR(255) NOT NULL
    tipo ENUM('cliente', 'proveedor', 'ambos')
);

-- Tabla Usuario
CREATE TABLE Usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    rol ENUM('vendedor', 'gerente', 'administrador') NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    mail VARCHAR(255) NOT NULL,
    idOrganizacion INT, 
    FOREIGN KEY (idOrganizacion) REFERENCES Organizacion(id)
);


-- Tabla Caja
CREATE TABLE Caja (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    fechaInicio DATETIME NOT NULL,
    fechaFin DATETIME,
    totalIngresado DECIMAL(10, 2) DEFAULT 0,
    cantidadVentas INT DEFAULT 0
    estado ENUM('abierta', 'cerrada') DEFAULT 'abierta';
);

-- Tabla Venta
CREATE TABLE Venta (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fecha DATETIME NOT NULL,
    idUsuario INT,
    idCaja INT,
    idEmpresaOPersonaFisica INT,
    FOREIGN KEY (idUsuario) REFERENCES Usuario(id),
    FOREIGN KEY (idCaja) REFERENCES Caja(id),
    FOREIGN KEY (idEmpresaOPersonaFisica) REFERENCES EmpresaOPersonaFisica(id)
);

-- Tabla Detalle
CREATE TABLE Detalle (
    id INT PRIMARY KEY AUTO_INCREMENT,
    idVenta INT,
    idProducto INT,
    idFactura INT,
    cantidad INT NOT NULL,
    precioUnitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (idVenta) REFERENCES Venta(id),
    FOREIGN KEY (idProducto) REFERENCES Producto(id)
    FOREIGN KEY (idFactura) REFERENCES Factura(id)

);

-- Tabla Producto
CREATE TABLE Producto (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    idCategoria INT,
    cantidadStock INT NOT NULL,
    iva DECIMAL(5, 2) DEFAULT 21,
    FOREIGN KEY (idCategoria) REFERENCES CategoriaProducto(id)
);

-- Tabla CategoriaProducto
CREATE TABLE CategoriaProducto (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL
);

-- Tabla Factura
CREATE TABLE Factura (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numeroFactura VARCHAR(50) NOT NULL,
    idEmpresa INT,
    idUsuario INT,
    total DECIMAL(10, 2) NOT NULL,
    archivo BLOB,
    estado ENUM('enviada', 'recibida', 'error', 'pagada', 'completada') NOT NULL,
    fecha DATETIME NOT NULL,
    formaPago ENUM('efectivo', 'tarjeta', 'transferencia'),
    FOREIGN KEY (idEmpresa) REFERENCES Organizacion(id),
    FOREIGN KEY (idUsuario) REFERENCES Usuario(id)
);

-- Tabla Ingreso
CREATE TABLE Ingreso (
    id INT PRIMARY KEY AUTO_INCREMENT,
    idCaja INT,
    idFactura INT,
    monto DECIMAL(10, 2) NOT NULL,
    fecha DATETIME NOT NULL,
    FOREIGN KEY (idCaja) REFERENCES Caja(id),
    FOREIGN KEY (idFactura) REFERENCES Factura(id)
);