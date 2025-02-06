package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.Ingreso;
import IDP_H1.FactuStock.Services.IngresoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/ingresos")
public class IngresoController {

    @Autowired
    private IngresoService ingresoService;

    // Obtener todos los ingresos
    @GetMapping
    public ResponseEntity<List<Ingreso>> obtenerTodos() {
        List<Ingreso> ingresos = ingresoService.obtenerTodos();
        return new ResponseEntity<>(ingresos, HttpStatus.OK);
    }

    // Obtener ingreso por ID
    @GetMapping("/{id}")
    public ResponseEntity<Ingreso> obtenerPorId(@PathVariable Long id) {
        Optional<Ingreso> ingreso = ingresoService.obtenerPorId(id);
        return ingreso.map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Guardar nuevo ingreso
    @PostMapping
    public ResponseEntity<Ingreso> guardar(@RequestBody Ingreso ingreso) {
        Ingreso nuevoIngreso = ingresoService.guardar(ingreso);
        return new ResponseEntity<>(nuevoIngreso, HttpStatus.CREATED);
    }

    // Eliminar ingreso por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Optional<Ingreso> ingreso = ingresoService.obtenerPorId(id);
        if (ingreso.isPresent()) {
            ingresoService.eliminar(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}

