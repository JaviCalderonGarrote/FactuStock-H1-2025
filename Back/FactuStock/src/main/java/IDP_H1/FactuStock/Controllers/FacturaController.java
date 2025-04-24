package IDP_H1.FactuStock.Controllers;


import IDP_H1.FactuStock.Entities.Factura;
import IDP_H1.FactuStock.Entities.Organizacion;
import IDP_H1.FactuStock.Entities.EmpresaPersonaFisica;
import IDP_H1.FactuStock.Services.FacturaService;
import IDP_H1.FactuStock.Services.ProductoService;
import IDP_H1.FactuStock.Services.EmpresaPersonaFisicaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;


import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Optional;


@RestController
@RequestMapping("/facturas")
public class FacturaController {


    @Autowired
    private FacturaService facturaService;


    @Autowired
    private ProductoService productoService;


    @Autowired
    private EmpresaPersonaFisicaService empresaPersonaFisicaService;


    private final RestTemplate restTemplate = new RestTemplate();


    @GetMapping
    public ResponseEntity<List<Factura>> obtenerTodas() {
        List<Factura> facturas = facturaService.obtenerTodas();
        return new ResponseEntity<>(facturas, HttpStatus.OK);
    }


    @GetMapping("/{id}")
    public ResponseEntity<Factura> obtenerPorId(@PathVariable Long id) {
        Factura factura = facturaService.obtenerPorId(id);
        return factura != null ? ResponseEntity.ok(factura) : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }


    @GetMapping("/organizacion/{organizacionId}")
    public ResponseEntity<List<Factura>> obtenerFacturasPorOrganizacion(@PathVariable Long organizacionId) {
        Organizacion organizacion = new Organizacion();
        organizacion.setId(organizacionId);
        List<Factura> facturas = facturaService.obtenerFacturasPorOrganizacion(organizacion);
        return facturas.isEmpty() ? new ResponseEntity<>(HttpStatus.NO_CONTENT) : new ResponseEntity<>(facturas, HttpStatus.OK);
    }


    @GetMapping("/count")
    public ResponseEntity<Integer> contarFacturas(@RequestParam int month, @RequestParam int year) {
        int count = facturaService.countByMonthAndYear(month, year);
        return ResponseEntity.ok(count);
    }


    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody Factura factura) {
        try {
            if (factura.getFecha() == null) {
                return new ResponseEntity<>("La fecha de la factura es obligatoria.", HttpStatus.BAD_REQUEST);
            }


            if (factura.getFechaCreacionFactura() == null) {
                factura.setFechaCreacionFactura(convertToLocalDateTime(new Date()));
            }


            // Cargar datos completos del cliente
            Optional<EmpresaPersonaFisica> optionalCliente = empresaPersonaFisicaService
                    .obtenerPorId(factura.getEmpresaPersonaFisica().getId());


            if (!optionalCliente.isPresent()) {
                return new ResponseEntity<>("Cliente no encontrado.", HttpStatus.NOT_FOUND);
            }


            EmpresaPersonaFisica cliente = optionalCliente.get();
            factura.setEmpresaPersonaFisica(cliente);


            factura.getDetalles().forEach(detalle -> {
                detalle.setFactura(factura);
                detalle.setSubtotal(detalle.getCantidad() * detalle.getPrecioUnitario());
            });


            factura.actualizarTotal();


            Factura nuevaFactura = facturaService.guardar(factura);


            enviarCorreoFactura(nuevaFactura);


            return new ResponseEntity<>(nuevaFactura, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Error al crear la factura: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Factura factura = facturaService.obtenerPorId(id);
        if (factura != null) {
            facturaService.eliminar(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }


    private LocalDateTime convertToLocalDateTime(Date date) {
        return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
    }


    private void enviarCorreoFactura(Factura factura) {
        try {
            String clienteNombre = factura.getEmpresaPersonaFisica().getNombre();
            String clienteEmail = factura.getEmpresaPersonaFisica().getMail();
            String organizacionNombre = factura.getOrganizacion().getNombre();
            String organizacionDireccion = factura.getOrganizacion().getDireccion();
            String organizacionTelefono = factura.getOrganizacion().getTelefono();
            String organizacionEmail = factura.getOrganizacion().getEmail();


            // HTML email content with improved styling
            String mensaje = "<html>" +
                    "<head>" +
                    "<style>" +
                    "body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; color: #333; }" +
                    ".container { max-width: 600px; margin: 30px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); }" +
                    ".header { background-color: #2E6DA4; color: #ffffff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }" +
                    ".header h2 { margin: 0; font-size: 24px; }" +
                    ".footer { font-size: 12px; color: #888; text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e1e1e1; }" +
                    ".content { padding: 20px; }" +
                    ".content h3 { color: #2E6DA4; font-size: 18px; }" +
                    ".content ul { padding-left: 20px; }" +
                    ".content li { margin-bottom: 10px; }" +
                    ".button { display: inline-block; padding: 10px 20px; background-color: #2E6DA4; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 20px; }" +
                    "</style>" +
                    "</head>" +
                    "<body>" +
                    "<div class='container'>" +
                    "<div class='header'>" +
                    "<h2>Factura Generada - " + organizacionNombre + "</h2>" +
                    "</div>" +
                    "<div class='content'>" +
                    "<p>Estimado/a <strong>" + clienteNombre + "</strong>,</p>" +
                    "<p>Gracias por tu compra. Adjunto te enviamos los detalles de la factura correspondiente a tu compra realizada el <strong>" + factura.getFecha() + "</strong>.</p>" +
                    "<h3>Detalles de la factura:</h3>" +
                    "<ul>" +
                    "    <li><strong>Número de factura:</strong> " + factura.getNumeroFactura() + "</li>" +
                    "    <li><strong>Fecha de emisión:</strong> " + factura.getFecha() + "</li>" +
                    "    <li><strong>Total:</strong> $" + factura.getTotal() + "</li>" +
                    "</ul>" +
                    "<h3>Datos de la organización emisora de la factura:</h3>" +
                    "<ul>" +
                    "    <li><strong>Nombre:</strong> " + organizacionNombre + "</li>" +
                    "    <li><strong>Dirección:</strong> " + organizacionDireccion + "</li>" +
                    "    <li><strong>Teléfono:</strong> " + organizacionTelefono + "</li>" +
                    "    <li><strong>Email:</strong> " + organizacionEmail + "</li>" +
                    "</ul>" +
                    "<p>Si tienes alguna pregunta o necesitas información adicional, no dudes en ponerte en contacto con nosotros.</p>" +
                    "<p>Atentamente,</p>" +
                    "<p><strong>El equipo de " + organizacionNombre + "</strong></p>" +
                    "<a href='http://www.organizacion.com' class='button'>Visita nuestra página</a>" +
                    "</div>" +
                    "<div class='footer'>" +
                    "<p>----------------------------------------------------------</p>" +
                    "<p><strong>AVISO LEGAL:</strong> Este mensaje y sus archivos adjuntos van dirigidos exclusivamente a su destinatario, pudiendo contener información confidencial sometida a secreto profesional.</p>" +
                    "<p><strong>PROTECCIÓN DE DATOS:</strong> De conformidad con lo dispuesto en el Reglamento (UE) 2016/679, le informamos de que los datos personales y la dirección de correo electrónico del interesado serán tratados para el envío de comunicaciones sobre nuestros productos y servicios.</p>" +
                    "</div>" +
                    "</div>" +
                    "</body>" +
                    "</html>";


            String correoOrganizacion = factura.getOrganizacion().getEmail();


            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("cliente", clienteEmail);
            params.add("asunto", "Nueva Factura #" + factura.getNumeroFactura());
            params.add("mensaje", mensaje);
            params.add("correoOrganizacion", correoOrganizacion);


            HttpHeaders headers = new HttpHeaders();
            // Importante: Establecer el tipo de contenido a HTML
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);


            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);


            restTemplate.postForEntity("http://localhost:8080/api/email/enviar", request, String.class);
        } catch (Exception e) {
            e.printStackTrace(); // Deberías usar un logger en producción
        }
    }




}

