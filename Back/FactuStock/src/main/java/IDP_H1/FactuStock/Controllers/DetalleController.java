package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.Detalle;
import IDP_H1.FactuStock.Services.DetalleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/detalles")
public class DetalleController {

    @Autowired
    private DetalleService detalleService;

    @GetMapping
    public ResponseEntity<List<Detalle>> obtenerTodos() {
        List<Detalle> detalles = detalleService.obtenerTodos();
        if (detalles.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(detalles, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Detalle> obtenerPorId(@PathVariable Long id) {
        Optional<Detalle> detalle = detalleService.obtenerPorId(id);
        return detalle.map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<Detalle> guardar(@RequestBody Detalle detalle) {
        Detalle nuevoDetalle = detalleService.guardar(detalle);
        return new ResponseEntity<>(nuevoDetalle, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Detalle> actualizar(@PathVariable Long id, @RequestBody Detalle detalle) {
        Detalle detalleActualizado = detalleService.actualizar(id, detalle);
        if (detalleActualizado != null) {
            return new ResponseEntity<>(detalleActualizado, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Optional<Detalle> detalle = detalleService.obtenerPorId(id);
        if (detalle.isPresent()) {
            detalleService.eliminar(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
