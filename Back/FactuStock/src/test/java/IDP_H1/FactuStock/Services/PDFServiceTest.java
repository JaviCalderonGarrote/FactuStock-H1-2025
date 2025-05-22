package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class PDFServiceTest {

    private PDFService pdfService;

    @BeforeEach
    void setUp() {
        pdfService = new PDFService();
    }

    @Test
    void generarPDF_deberiaGenerarPDFValido() throws IOException {
        // Preparar datos mínimos para Factura

        Organizacion org = new Organizacion();
        org.setNombre("Mi Empresa S.A.");
        org.setDireccion("Calle Falsa 123");
        org.setTelefono("123456789");
        org.setEmail("info@empresa.com");

        // Para evitar IOException por logo, creamos un archivo temporal con un logo dummy
        String logoPath = "src/main/resources/static/img-logo/";
        String logoFileName = "logo.png";
        org.setLogo(logoFileName);

        // Crear logo dummy si no existe
        if (!Files.exists(Paths.get(logoPath + logoFileName))) {
            Files.createDirectories(Paths.get(logoPath));
            // Crear un archivo pequeño vacío o con algo de contenido válido base64 PNG
            byte[] dummyPng = new byte[]{
                    (byte)0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
                    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
                    0x00, 0x00, 0x00, 0x01,
                    0x00, 0x00, 0x00, 0x01,
                    0x08, 0x06, 0x00, 0x00,
                    0x00, 0x1F, 0x15, (byte)0xC4, (byte)0x89,
                    0x00, 0x00, 0x00, 0x0A,
                    0x49, 0x44, 0x41, 0x54,
                    0x78, (byte)0xDA, 0x63, 0x60,
                    0x00, 0x00, 0x00, 0x02,
                    0x00, 0x01, (byte)0xE2, 0x21,
                    (byte)0xBC, (byte)0x33, 0x00, 0x00,
                    0x00, 0x00, 0x49, 0x45,
                    0x4E, 0x44, (byte)0xAE, 0x42,
                    0x60, (byte)0x82
            };
            Files.write(Paths.get(logoPath + logoFileName), dummyPng);
        }

        EmpresaPersonaFisica cliente = new EmpresaPersonaFisica();
        cliente.setNombre("Cliente Ejemplo");
        cliente.setDireccion("Av. Siempre Viva 742");
        cliente.setNifCif("X1234567Y");
        cliente.setMail("cliente@mail.com");
        cliente.setTelefono("987654321");

        Detalle detalle = new Detalle();
        detalle.setNombre("Producto 1");
        detalle.setCantidad(2);
        detalle.setPrecioUnitario(50.0);
        detalle.setIva(21);
        detalle.setSubtotal(121.0); // 50*2 + 21% IVA = 121 aprox

        Factura factura = new Factura();
        factura.setNumeroFactura("FAC-2025-0001");
        factura.setOrganizacion(org);
        factura.setEmpresaPersonaFisica(cliente);
        factura.setDetalles(Collections.singletonList(detalle));
        factura.setEstado(EstadoFactura.ENVIADA);
        factura.setFecha(LocalDateTime.now());
        factura.setFechaCreacionFactura(LocalDateTime.now());
        factura.setFormaPago(FormaPago.EFECTIVO);

        // Ejecutar método a testear
        byte[] pdfBytes = pdfService.generarPDF(factura);

        // Comprobar que genera un PDF con contenido
        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0, "El PDF generado no debe estar vacío");

        // Opcional: verificar que el contenido empieza con %PDF típico
        String pdfHeader = new String(pdfBytes, 0, 4);
        assertEquals("%PDF", pdfHeader);
    }
}
