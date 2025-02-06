package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.Organizacion;
import IDP_H1.FactuStock.Services.OrganizacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/organizaciones")
public class OrganizacionController {
    @Autowired
    private OrganizacionService service;

    @GetMapping
    public List<Organizacion> obtenerTodas() {
        return service.obtenerTodas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Organizacion> obtenerPorId(@PathVariable Long id) {
        return service.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Organizacion guardar(@RequestBody Organizacion organizacion) {
        return service.guardar(organizacion);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
