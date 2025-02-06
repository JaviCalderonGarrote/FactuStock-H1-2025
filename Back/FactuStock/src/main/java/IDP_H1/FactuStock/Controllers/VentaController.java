package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.Venta;
import IDP_H1.FactuStock.Services.VentaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/ventas")
public class VentaController {

    @Autowired
    private VentaService ventaService;

    // Obtener todas las ventas
    @GetMapping
    public ResponseEntity<List<Venta>> obtenerTodas() {
        List<Venta> ventas = ventaService.obtenerTodas();
        return new ResponseEntity<>(ventas, HttpStatus.OK);
    }

    // Obtener venta por ID
    @GetMapping("/{id}")
    public ResponseEntity<Venta> obtenerPorId(@PathVariable Long id) {
        Optional<Venta> venta = ventaService.obtenerPorId(id);
        return venta.map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Guardar nueva venta
    @PostMapping
    public ResponseEntity<Venta> guardar(@RequestBody Venta venta) {
        Venta nuevaVenta = ventaService.guardar(venta);
        return new ResponseEntity<>(nuevaVenta, HttpStatus.CREATED);
    }

    // Eliminar venta por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Optional<Venta> venta = ventaService.obtenerPorId(id);
        if (venta.isPresent()) {
            ventaService.eliminar(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
