package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.Factura;
import IDP_H1.FactuStock.Services.FacturaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    // Guardar nueva factura
    @PostMapping
    public ResponseEntity<Factura> guardar(@RequestBody Factura factura) {
        Factura nuevaFactura = facturaService.guardar(factura);
        return new ResponseEntity<>(nuevaFactura, HttpStatus.CREATED);
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
