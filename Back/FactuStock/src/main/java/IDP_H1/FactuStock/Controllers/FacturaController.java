package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.Factura;
import IDP_H1.FactuStock.Entities.Organizacion;
import IDP_H1.FactuStock.DTO.FacturaDTO;
import IDP_H1.FactuStock.Services.FacturaService;
import IDP_H1.FactuStock.Services.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/facturas")
public class FacturaController {

    @Autowired
    private FacturaService facturaService;

    @Autowired
    private ProductoService productoService;

    // Obtener todas las facturas
    @GetMapping
    public ResponseEntity<List<FacturaDTO>> obtenerTodas() {
        List<FacturaDTO> facturas = facturaService.obtenerTodas();
        return new ResponseEntity<>(facturas, HttpStatus.OK);
    }

    // Obtener factura por ID
    @GetMapping("/{id}")
    public ResponseEntity<FacturaDTO> obtenerPorId(@PathVariable Long id) {
        Optional<FacturaDTO> factura = facturaService.obtenerPorId(id);
        return factura.map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Obtener facturas por organización
    @GetMapping("/organizacion/{organizacionId}")
    public ResponseEntity<List<FacturaDTO>> obtenerFacturasPorOrganizacion(@PathVariable Long organizacionId) {
        Organizacion organizacion = new Organizacion();
        organizacion.setId(organizacionId);

        List<FacturaDTO> facturas = facturaService.obtenerFacturasPorOrganizacion(organizacion);

        if (facturas.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }

        return new ResponseEntity<>(facturas, HttpStatus.OK);
    }

    // Contar facturas por mes y año
    @GetMapping("/count")
    public ResponseEntity<Integer> contarFacturas(@RequestParam int month, @RequestParam int year) {
        int count = facturaService.countByMonthAndYear(month, year);
        return ResponseEntity.ok(count);
    }

    // Guardar nueva factura
    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody Factura factura) {
        try {
            if (factura.getFecha() == null) {
                return new ResponseEntity<>("La fecha de la factura es obligatoria.", HttpStatus.BAD_REQUEST);
            }

            // Si la fecha de creación de la factura es nula, se asigna la fecha actual
            if (factura.getFechaCreacionFactura() == null) {
                factura.setFechaCreacionFactura(convertToLocalDateTime(new Date()));
            }

            // Guardar los detalles de la factura
            factura.getDetalles().forEach(detalle -> {
                detalle.setFactura(factura);
                detalle.setSubtotal(detalle.getCantidad() * detalle.getProducto().getPrecio());
            });

            Factura nuevaFactura = facturaService.guardar(factura);
            return new ResponseEntity<>(nuevaFactura, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Error al crear la factura: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Eliminar factura por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Optional<FacturaDTO> factura = facturaService.obtenerPorId(id);
        if (factura.isPresent()) {
            facturaService.eliminar(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Convertir java.util.Date a java.time.LocalDateTime
    private LocalDateTime convertToLocalDateTime(Date date) {
        return date.toInstant()
                .atZone(ZoneId.systemDefault())  // Usa la zona horaria predeterminada del sistema
                .toLocalDateTime();
    }
}
