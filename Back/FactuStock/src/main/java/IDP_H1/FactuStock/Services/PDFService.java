package IDP_H1.FactuStock.Services;

import com.itextpdf.html2pdf.ConverterProperties;
import com.itextpdf.html2pdf.HtmlConverter;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import IDP_H1.FactuStock.Entities.Factura;
import IDP_H1.FactuStock.Entities.Detalle;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.nio.file.Files;
import java.nio.file.Paths;

@Service
public class PDFService {

    public byte[] generarPDF(Factura factura) throws IOException {
        String html = generarHTML(factura);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdf = new PdfDocument(writer);
        ConverterProperties properties = new ConverterProperties();
        HtmlConverter.convertToPdf(html, pdf, properties);

        return outputStream.toByteArray();
    }

    private String generarHTML(Factura factura) throws IOException {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        StringBuilder htmlBuilder = new StringBuilder();

        // Leer y codificar la imagen del logo
        String logoPath = "src/main/resources/static/img-logo/" + factura.getOrganizacion().getLogo();
        byte[] logoBytes = Files.readAllBytes(Paths.get(logoPath));
        String logoBase64 = Base64.getEncoder().encodeToString(logoBytes);

        // Calcular los totales
        double baseImponible = 0;
        double ivaTotal = 0;
        double total = 0;

        for (Detalle detalle : factura.getDetalles()) {
            double subtotal = detalle.getSubtotal();
            double iva = subtotal * detalle.getIva() / 100;
            baseImponible += subtotal - iva;
            ivaTotal += iva;
            total += subtotal;
        }

        htmlBuilder.append("<!DOCTYPE html>")
                .append("<html lang=\"es\">")
                .append("<head>")
                .append("<meta charset=\"UTF-8\">")
                .append("<title>Factura</title>")
                .append("<style>")
                .append("@page { size: A4; margin: 0; }")
                .append("body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f0f0f0; }")
                .append(".page { width: 210mm; min-height: 297mm; padding: 10mm; margin: 0 auto; background-color: white; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); box-sizing: border-box; }")
                .append(".header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15mm; }")
                .append(".logo-container { width: 45%; }")
                .append(".logo { max-width: 100%; max-height: 60mm; width: auto; height: auto; }")
                .append(".org-info { width: 50%; text-align: right; font-size: 12pt; }")
                .append(".org-info h2 { color: #2c3e50; margin-bottom: 5pt; font-size: 16pt; }")
                .append(".org-info p { margin: 3pt 0; }")
                .append(".invoice-title { text-align: center; font-size: 22pt; font-weight: bold; margin: 15mm 0; color: #2c3e50; }")
                .append(".client-invoice-info { display: flex; justify-content: space-between; margin-bottom: 14mm; }")
                .append(".client-info, .invoice-info { width: 47%; font-size: 10pt; }")
                .append(".info-box { border: 1.5pt solid #ddd; padding: 7mm; border-radius: 3mm; }")
                .append(".info-box h3 { color: #3498db; border-bottom: 1.5pt solid #3498db; padding-bottom: 3mm; margin-top: 0; font-size: 14pt; }")
                .append(".info-box p { margin: 3pt 0; }")
                .append("table { width: 100%; border-collapse: collapse; margin-bottom: 15mm; font-size: 11pt; }")
                .append("th, td { padding: 3mm; text-align: left; border-bottom: 1.5pt solid #ddd; }")
                .append("th { background-color: #f8f9fa; font-weight: bold; color: #2c3e50; }")
                .append("tr:nth-child(even) { background-color: #f8f9fa; }")
                .append(".total-section { margin-top: 15mm; width: 60%; float: right; }")
                .append(".total-row { display: flex; justify-content: space-between; margin-bottom: 3pt; padding: 3pt 0; }")
                .append(".total-label { font-weight: bold; }")
                .append(".total-amount { text-align: right; }")
                .append(".subtotal { background-color: #f8f9fa; }")
                .append(".grand-total { font-size: 14pt; font-weight: bold; color: #2c3e50; border-top: 2pt solid #3498db; padding-top: 3mm; }")
                .append(".footer { margin-top: 20mm; text-align: center; font-size: 10pt; color: #7f8c8d; clear: both; }")
                .append("</style>")
                .append("</head>")
                .append("<body>")
                .append("<div class=\"page\">")
                .append("<div class=\"header\">")
                .append("<div class=\"logo-container\">")
                .append("<img src=\"data:image/png;base64,").append(logoBase64).append("\" alt=\"Logo\" class=\"logo\">")
                .append("</div>")
                .append("<div class=\"org-info\">")
                .append("<h2>").append(factura.getOrganizacion().getNombre()).append("</h2>")
                .append("<p>").append(factura.getOrganizacion().getDireccion()).append("</p>")
                .append("<p>Tel: ").append(factura.getOrganizacion().getTelefono()).append("</p>")
                .append("<p>Email: ").append(factura.getOrganizacion().getEmail()).append("</p>")
                .append("</div>")
                .append("</div>")
                .append("<div class=\"invoice-title\">FACTURA</div>")
                .append("<div class=\"client-invoice-info\">")
                .append("<div class=\"client-info info-box\">")
                .append("<h3>Datos del Cliente</h3>")
                .append("<p><strong>").append(factura.getEmpresaPersonaFisica().getNombre()).append("</strong></p>")
                .append("<p>").append(factura.getEmpresaPersonaFisica().getDireccion()).append("</p>")
                .append("<p>CIF/NIF: ").append(factura.getEmpresaPersonaFisica().getNifCif()).append("</p>")
                .append("<p>Email: ").append(factura.getEmpresaPersonaFisica().getMail()).append("</p>")
                .append("<p>Teléfono: ").append(factura.getEmpresaPersonaFisica().getTelefono()).append("</p>")
                .append("</div>")
                .append("<div class=\"invoice-info info-box\">")
                .append("<h3>Detalles de la Factura</h3>")
                .append("<p><strong>Número:</strong> ").append(factura.getNumeroFactura()).append("</p>")
                .append("<p><strong>Fecha:</strong> ").append(factura.getFecha().format(formatter)).append("</p>")
                .append("<p><strong>Estado:</strong> ").append(factura.getEstado()).append("</p>")
                .append("<p><strong>Forma de Pago:</strong> ").append(factura.getFormaPago()).append("</p>")
                .append("</div>")
                .append("</div>")
                .append("<table>")
                .append("<tr>")
                .append("<th>Descripción</th>")
                .append("<th>Cantidad</th>")
                .append("<th>Precio Unitario</th>")
                .append("<th>IVA</th>")
                .append("<th>Subtotal</th>")
                .append("</tr>");

        for (Detalle detalle : factura.getDetalles()) {
            htmlBuilder.append("<tr>")
                    .append("<td>").append(detalle.getNombre() != null ? detalle.getNombre() : detalle.getProducto().getNombre()).append("</td>")
                    .append("<td>").append(detalle.getCantidad()).append("</td>")
                    .append("<td>").append(String.format("%.2f €", detalle.getPrecioUnitario())).append("</td>")
                    .append("<td>").append(detalle.getIva()).append("%</td>")
                    .append("<td>").append(String.format("%.2f €", detalle.getSubtotal())).append("</td>")
                    .append("</tr>");
        }

        htmlBuilder.append("</table>")
                .append("<div class=\"total-section\">")
                .append("<div class=\"total-row subtotal\">")
                .append("<span class=\"total-label\">Base Imponible :  </span> ")
                .append("<span class=\"total-amount\">").append(String.format("%.2f €",   baseImponible)).append("</span>")
                .append("</div>")
                .append("<div class=\"total-row subtotal\">")
                .append("<span class=\"total-label\">IVA Total:  </span>")
                .append("<span class=\"total-amount\">").append(String.format("%.2f €",   ivaTotal)).append("</span>")
                .append("</div>")
                .append("<div class=\"total-row grand-total\">")
                .append("<span class=\"total-label\">Total:  </span>  " )
                .append("<span class=\"total-amount\"> ").append(String.format(" %.2f €",   total)).append("</span>")
                .append("</div>")
                .append("</div>")
                .append("<div class=\"footer\">")
                .append("<p>Gracias por su confianza. Para cualquier consulta, no dude en contactarnos.</p>")
                .append("<p>Este documento es una factura oficial emitida por ").append(factura.getOrganizacion().getNombre()).append(".</p>")
                .append("</div>")
                .append("</div>")
                .append("</body>")
                .append("</html>");

        return htmlBuilder.toString();
    }
}
