package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.EmpresaPersonaFisica;
import IDP_H1.FactuStock.Services.EmpresaPersonaFisicaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/EmpresaPersonaFisica")
public class EmpresaPersonaFisicaController {

    @Autowired
    private EmpresaPersonaFisicaService service;

    @GetMapping
    public ResponseEntity<List<EmpresaPersonaFisica>> obtenerTodos() {
        List<EmpresaPersonaFisica> empresas = service.obtenerTodos();
        return ResponseEntity.ok(empresas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmpresaPersonaFisica> obtenerPorId(@PathVariable Long id) {
        Optional<EmpresaPersonaFisica> empresaPersonaFisica = service.obtenerPorId(id);
        return empresaPersonaFisica.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<EmpresaPersonaFisica> guardar(@RequestBody EmpresaPersonaFisica empresaPersonaFisica) {
        try {
            EmpresaPersonaFisica nuevaEmpresa = service.guardar(empresaPersonaFisica);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaEmpresa);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmpresaPersonaFisica> editar(@PathVariable Long id, @RequestBody EmpresaPersonaFisica empresaPersonaFisica) {
        Optional<EmpresaPersonaFisica> empresaExistente = service.obtenerPorId(id);

        if (!empresaExistente.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        EmpresaPersonaFisica empresaActualizada = empresaExistente.get();
        empresaActualizada.setNombre(empresaPersonaFisica.getNombre());
        empresaActualizada.setNifCif(empresaPersonaFisica.getNifCif());
        empresaActualizada.setTelefono(empresaPersonaFisica.getTelefono());
        empresaActualizada.setDireccion(empresaPersonaFisica.getDireccion());
        empresaActualizada.setWeb(empresaPersonaFisica.getWeb());
        empresaActualizada.setMail(empresaPersonaFisica.getMail());
        empresaActualizada.setTipo(empresaPersonaFisica.getTipo());
        empresaActualizada.setOrganizacion(empresaPersonaFisica.getOrganizacion());

        EmpresaPersonaFisica empresaGuardada = service.guardar(empresaActualizada);
        return ResponseEntity.ok(empresaGuardada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminar(@PathVariable Long id) {
        Optional<EmpresaPersonaFisica> empresaPersonaFisica = service.obtenerPorId(id);
        if (!empresaPersonaFisica.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Registro no encontrado");
        }
        try {
            service.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("No se puede eliminar el registro porque tiene relaciones asociadas.");
        }
    }

    // CORREGIDO: siempre devuelve un array, nunca un objeto
    @GetMapping("/organizacion/{idOrganizacion}")
    public ResponseEntity<List<EmpresaPersonaFisica>> getEmpresasByOrganizacion(@PathVariable Long idOrganizacion) {
        List<EmpresaPersonaFisica> empresas = service.findByOrganizacion(idOrganizacion);
        return ResponseEntity.ok(empresas != null ? empresas : List.of());
    }

    @GetMapping("/top6-facturas/{organizacionId}")
    public ResponseEntity<List<Map<String, Object>>> obtenerTop6EmpresasFacturas(@PathVariable Long organizacionId) {
        List<Map<String, Object>> top6Empresas = service.obtenerTop6EmpresasConConteos(organizacionId);
        return ResponseEntity.ok(top6Empresas);
    }
}