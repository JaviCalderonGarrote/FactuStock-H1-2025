# 📊 FactoStock

**FactoStock** es una aplicación moderna diseñada para ayudar a pequeñas empresas a gestionar de forma eficiente sus **ingresos, gastos, facturación** y **stock de productos**. Su interfaz intuitiva y automatizada permite tener el control total del negocio desde un solo lugar.

---

## 🖥️ Descripción General

Al iniciar sesión en la aplicación, el usuario accede a un **dashboard** con un resumen visual del estado de la empresa:

- 🔢 **Balance general** del año actual.  
- 📄 **Facturas no completadas** pendientes.  
- 💵 **Caja activa** del día.  
- 📊 **Gráficas interactivas**:
  - Ventas por mes.
  - Ingresos vs gastos.
  - Empresas con más facturas.
  - Top 5 productos más vendidos.

---

## 💸 Gestión de Gastos

Registra todos los gastos empresariales con información detallada:

- Asociados a proveedores.
- Clasificados por categorías.
- Análisis y filtros personalizados.

---

## 💰 Gestión de Ingresos

### 🧾 Facturas
- Creación y envío automático al cliente en formato PDF por correo electrónico.
- Asociadas a productos o servicios.

### 🧮 Cajas TPV
- Para ventas rápidas del día a día.
- Descuenta automáticamente el stock.
- Solo puede haber **una caja activa** al mismo tiempo.

---

## 📦 Funcionalidades Adicionales

- 📦 **Inventario inteligente** con alertas automáticas por bajo stock (menos de 5 unidades).
- 👥 **Gestión de usuarios** y configuración de empresa (datos, logo, etc.).
- 📧 **Envío de correos** desde la aplicación a clientes.
- 🔄 **Gestión avanzada** de clientes y proveedores con posibilidad de rol dual (persona o empresa).

---

## 🛠️ Tecnologías Utilizadas

### 🔹 Frontend
- React 19
- Vite
- React Bootstrap + Bootstrap 5
- Axios
- Chart.js

### 🔸 Backend
- Java 21
- Spring Boot 3.4
- Spring Security + JWT
- Spring Data JPA
- iText / OpenPDF
- Spring Mail

### 🗄️ Base de Datos
- PostgreSQL
- PgAdmin

### 🧪 Testing
- Vitest, jsdom (Frontend)
- Mockito, JaCoCo (Backend)

---

## ⚙️ Instalación y Configuración

### ✅ Requisitos Previos

Asegúrate de tener instalados:

- Java JDK 21  
- Maven  
- PostgreSQL  
- Node.js y npm  

---
🚀 Guía de Configuración de FactuStock
Este documento te guiará a través de los pasos necesarios para configurar y ejecutar tanto el backend como el frontend de la aplicación FactuStock.

⚙️ Configuración del Backend
Sigue estos pasos para configurar y ejecutar el servidor backend de FactuStock.

Navega a la carpeta del backend:
Abre tu terminal y ejecuta el siguiente comando para acceder al directorio del backend:

cd Back/Factustock

Crea la base de datos PostgreSQL:
Asegúrate de tener PostgreSQL instalado y en funcionamiento. Luego, crea una nueva base de datos llamada factustock_db. Puedes hacerlo a través de tu cliente PostgreSQL (como psql o pgAdmin) o ejecutando un comando similar a este:

# Ejemplo usando psql (si tienes permisos para crear bases de datos)
createdb factustock_db

Configura el archivo application.properties:
Edita el archivo src/main/resources/application.properties y actualiza los valores con la configuración de tu base de datos y servidor de correo electrónico.

spring.datasource.url=jdbc:postgresql://localhost:5432/factustock_db
spring.datasource.username=tu_usuario
spring.datasource.password=tu_contraseña
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Configuración de correo electrónico (ajusta según tu proveedor)
spring.mail.host=smtp.tu-servidor.com
spring.mail.port=587
spring.mail.username=correo@ejemplo.com
spring.mail.password=clave
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

Asegúrate de reemplazar tu_usuario, tu_contraseña, smtp.tu-servidor.com, correo@ejemplo.com y clave con tus credenciales reales.

Ejecuta el backend:
Desde la carpeta Back/Factustock, ejecuta el siguiente comando para iniciar el servidor Spring Boot:

mvn spring-boot:run

✅ La API del backend estará disponible en: http://localhost:8080

🎨 Configuración del Frontend
Sigue estos pasos para configurar y ejecutar la aplicación frontend de FactuStock.

Abre una nueva terminal y navega al frontend:
Abre una nueva ventana de terminal (manteniendo el backend en ejecución en la otra) y navega al directorio del frontend:

cd ../../Front/FactuStock-Front

Instala las dependencias:
Una vez en el directorio del frontend, instala todas las dependencias del proyecto utilizando npm:

npm install

Ejecuta el servidor de desarrollo:
Finalmente, inicia el servidor de desarrollo del frontend:

npm run dev

✅ La aplicación frontend estará disponible en: http://localhost:5173

¡Listo! Ahora deberías tener tanto el backend como el frontend de FactuStock funcionando en tu máquina local.
