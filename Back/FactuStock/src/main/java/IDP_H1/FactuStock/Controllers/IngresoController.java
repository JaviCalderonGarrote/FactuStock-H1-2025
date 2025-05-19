package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.Ingreso;
import IDP_H1.FactuStock.Services.IngresoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ingresos")
public class IngresoController {

    @Autowired
    private IngresoService ingresoService;

    @GetMapping
    public ResponseEntity<List<Ingreso>> obtenerTodos() {
        return ResponseEntity.ok(ingresoService.obtenerTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ingreso> obtenerPorId(@PathVariable Long id) {
        return ingresoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/organizacion/{organizacionId}")
    public ResponseEntity<List<Ingreso>> obtenerPorOrganizacion(@PathVariable Long organizacionId) {
        return ResponseEntity.ok(ingresoService.obtenerPorOrganizacion(organizacionId));
    }

    @PostMapping
    public ResponseEntity<Ingreso> crear(@RequestBody Ingreso ingreso) {
        return ResponseEntity.ok(ingresoService.guardar(ingreso));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ingreso> actualizar(@PathVariable Long id, @RequestBody Ingreso ingreso) {
        return ingresoService.obtenerPorId(id)
                .map(ingresoExistente -> {
                    ingreso.setId(ingresoExistente.getId());
                    return ResponseEntity.ok(ingresoService.guardar(ingreso));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        return ingresoService.obtenerPorId(id)
                .map(ingreso -> {
                    ingresoService.eliminar(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
