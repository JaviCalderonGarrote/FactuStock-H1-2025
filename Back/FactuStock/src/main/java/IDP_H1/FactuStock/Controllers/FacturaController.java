package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.Factura;
import IDP_H1.FactuStock.Services.FacturaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/facturas")
public class FacturaController {

    @Autowired
    private FacturaService facturaService;

    // Obtener todas las facturas
    @GetMapping
    public ResponseEntity<List<Factura>> obtenerTodas() {
        List<Factura> facturas = facturaService.obtenerTodas();
        return new ResponseEntity<>(facturas, HttpStatus.OK);
    }

    // Obtener factura por ID
    @GetMapping("/{id}")
    public ResponseEntity<Factura> obtenerPorId(@PathVariable Long id) {
        Optional<Factura> factura = facturaService.obtenerPorId(id);
        return factura.map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
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

            if (factura.getFechaCreacionFactura() == null) {
                factura.setFechaCreacionFactura(new Date());
            }

            Factura nuevaFactura = facturaService.guardar(factura);
            return new ResponseEntity<>(nuevaFactura, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Error al crear la factura: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Eliminar factura por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Optional<Factura> factura = facturaService.obtenerPorId(id);
        if (factura.isPresent()) {
            facturaService.eliminar(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
