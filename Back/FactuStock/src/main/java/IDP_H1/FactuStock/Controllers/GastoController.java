package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.Gasto;
import IDP_H1.FactuStock.Services.GastoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/gastos")
public class GastoController {

    @Autowired
    private GastoService gastoService;

    // Obtener todos los gastos
    @GetMapping
    public ResponseEntity<List<Gasto>> obtenerTodos() {
        List<Gasto> gastos = gastoService.obtenerTodos();
        return new ResponseEntity<>(gastos, HttpStatus.OK);
    }

    // Obtener gasto por ID
    @GetMapping("/{id}")
    public ResponseEntity<Gasto> obtenerPorId(@PathVariable Long id) {
        Optional<Gasto> gasto = gastoService.obtenerPorId(id);
        return gasto.map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Guardar nuevo gasto
    @PostMapping
    public ResponseEntity<Gasto> guardar(@RequestBody Gasto gasto) {
        Gasto nuevoGasto = gastoService.guardar(gasto);
        return new ResponseEntity<>(nuevoGasto, HttpStatus.CREATED);
    }

    // Eliminar gasto por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Optional<Gasto> gasto = gastoService.obtenerPorId(id);
        if (gasto.isPresent()) {
            gastoService.eliminar(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
