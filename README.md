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

### 📁 Clonar el Repositorio

```bash
git clone https://github.com/JaviCalderonGarrote/FactuStock-H1-2025.git
cd FactuStock-H1-2025
🚀 Configuración del Backend
Ve a la carpeta del backend:

bash
Copiar
Editar
cd Back/Factustock
Crea una base de datos PostgreSQL llamada factustock_db.

Configura el archivo application.properties en src/main/resources/:

properties
Copiar
Editar
spring.datasource.url=jdbc:postgresql://localhost:5432/factustock_db
spring.datasource.username=tu_usuario
spring.datasource.password=tu_contraseña
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

spring.mail.host=smtp.tu-servidor.com
spring.mail.port=587
spring.mail.username=correo@ejemplo.com
spring.mail.password=clave
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
Ejecuta el backend:

bash
Copiar
Editar
mvn spring-boot:run
La API estará disponible en: http://localhost:8080

🎨 Configuración del Frontend
Abre una nueva terminal y navega al frontend:

bash
Copiar
Editar
cd ../../Front/FactuStock-Front
Instala las dependencias:

bash
Copiar
Editar
npm install
Ejecuta el servidor:

bash
Copiar
Editar
npm run dev
La aplicación estará disponible en: http://localhost:5173
