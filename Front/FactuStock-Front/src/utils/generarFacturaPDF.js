import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Función para cargar el logo desde el servidor
const loadLogo = async (logoFilename) => {
    const response = await fetch(`http://localhost:8080/organizaciones/logo/${logoFilename}`);
    if (response.ok) {
        const logoData = await response.blob();
        return logoData;
    }
    return null;
};

export const generarFacturaPDF = async (factura) => {
    const doc = new jsPDF();

    const organizacion = factura.organizacion;
    const cliente = factura.empresaPersonaFisica;
    const detalles = factura.detalles;

    let y = 20;

    // Cargar el logo
    const logoFilename = organizacion.logo;
    const logo = await loadLogo(logoFilename);

    if (logo) {
        // Convertir el logo a un formato adecuado (Base64)
        const reader = new FileReader();
        reader.onloadend = function () {
            const base64Logo = reader.result;

            // Usamos addImage para incluir el logo en el PDF
            doc.addImage(base64Logo, 'PNG', 20, 20, 50, 50);
            y = 55; // Ajustar la posición después del logo
            agregarContenidoFactura(doc, factura, y);
            // Descargar el PDF después de agregar el contenido
            doc.save(`${factura.numeroFactura}.pdf`);
        };
        reader.readAsDataURL(logo); // Convertir el blob a base64
    } else {
        // Si no hay logo, simplemente generamos el contenido sin él
        agregarContenidoFactura(doc, factura, y);
        // Descargar el PDF después de agregar el contenido
        doc.save(`${factura.numeroFactura}.pdf`);
    }
};

// Función que agrega el contenido de la factura con estilo mejorado
const agregarContenidoFactura = (doc, factura, y) => {
    const organizacion = factura.organizacion;
    const cliente = factura.empresaPersonaFisica;
    const detalles = factura.detalles;

    // Datos de la empresa (logo y nombre)
    const logoX = 10;
    const logoY = 10;
    const logoWidth = 40;
    const logoHeight = 40;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const empresaNombre = organizacion.nombre || 'Nombre de la Empresa';
    doc.text(empresaNombre, 60, 20); // Nombre de la empresa al lado del logo

    // Datos de la empresa a la derecha del logo (alineados a la derecha)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const empresaDatos = [
        `Dirección: ${organizacion.direccion || 'N/A'}`,
        `Teléfono: ${organizacion.telefono || 'N/A'}`,
        `Email: ${organizacion.email || 'N/A'}`,
        `CIF/NIF: ${organizacion.nifCif || 'N/A'}`
    ];

    let currentY = 30;
    empresaDatos.forEach((line, index) => {
        doc.text(line, 160, currentY + (index * 6)); // Ajustamos para que esté más a la derecha
    });

    y = 70; // Comenzamos después de la cabecera

    // Título de la factura (en negrita)
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(`Factura Nº ${factura.numeroFactura}`, 105, y, null, null, 'center'); // En negrita y centrado
    y += 20;

    // Datos del cliente
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("Datos del Cliente", 14, y);
    y += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre: ${cliente?.nombre || 'N/A'}`, 14, y);
    y += 6;
    doc.text(`Email: ${cliente?.email || 'N/A'}`, 14, y);
    y += 6;
    doc.text(`Teléfono: ${cliente?.telefono || 'N/A'}`, 14, y);
    y += 20;

    // Resumen de la factura
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("Resumen de Factura", 14, y);
    y += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${new Date(factura.fecha).toLocaleDateString()}`, 14, y);
    y += 6;
    doc.text(`Forma de Pago: ${factura.formaPago || 'N/A'}`, 14, y);
    y += 6;
    doc.text(`Estado: ${factura.estado}`, 14, y);
    y += 20;

    // Estilo para la tabla
    const tablaColumnas = ["Producto", "Cantidad", "Precio Unitario", "IVA (%)", "Subtotal"];
    const tablaFilas = detalles.map(detalle => [
        detalle.nombre || detalle.producto?.nombre || "N/A",
        detalle.cantidad,
        `${detalle.precioUnitario.toFixed(2)} €`,
        `${detalle.iva}%`,
        `${detalle.subtotal.toFixed(2)} €`
    ]);

    // Dibujar la tabla
    doc.autoTable({
        head: [tablaColumnas],
        body: tablaFilas,
        startY: y,
        theme: 'striped',
        headStyles: { fillColor: [70, 130, 180], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 4, halign: 'center' },
        columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'center' }, 4: { halign: 'right' } }
    });

    // Espacio final
    const finalY = doc.lastAutoTable.finalY + 10;

    // Total de la factura
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Factura: ${factura.total.toFixed(2)} €`, 14, finalY);

};