package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.DTO.DetalleDTO;
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

    // Obtener todos los detalles
    @GetMapping
    public ResponseEntity<List<DetalleDTO>> obtenerTodos() {
        List<DetalleDTO> detallesDTO = detalleService.obtenerTodos();
        if (detallesDTO.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(detallesDTO, HttpStatus.OK);
    }

    // Obtener detalle por ID
    @GetMapping("/{id}")
    public ResponseEntity<DetalleDTO> obtenerPorId(@PathVariable Long id) {
        Optional<DetalleDTO> detalleDTO = detalleService.obtenerPorId(id);
        return detalleDTO.map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Guardar nuevo detalle
    @PostMapping
    public ResponseEntity<DetalleDTO> guardar(@RequestBody Detalle detalle) {
        DetalleDTO detalleDTO = detalleService.guardar(detalle);
        return new ResponseEntity<>(detalleDTO, HttpStatus.CREATED);
    }

    // Actualizar detalle por ID
    @PutMapping("/{id}")
    public ResponseEntity<DetalleDTO> actualizar(@PathVariable Long id, @RequestBody Detalle detalle) {
        DetalleDTO detalleActualizado = detalleService.actualizar(id, detalle);
        if (detalleActualizado != null) {
            return new ResponseEntity<>(detalleActualizado, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // Eliminar detalle por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Optional<DetalleDTO> detalleDTO = detalleService.obtenerPorId(id);
        if (detalleDTO.isPresent()) {
            detalleService.eliminar(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
