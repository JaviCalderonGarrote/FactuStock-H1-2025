package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.EmpresaPersonaFisica;
import IDP_H1.FactuStock.Services.EmpresaPersonaFisicaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/EmpresaPersonaFisica")
public class EmpresaPersonaFisicaController {

    @Autowired
    private EmpresaPersonaFisicaService service;

    // Obtener todos los registros de EmpresaPersonaFisica
    @GetMapping
    public List<EmpresaPersonaFisica> obtenerTodos() {
        return service.obtenerTodos();
    }

    // Obtener un registro de EmpresaPersonaFisica por su ID
    @GetMapping("/{id}")
    public ResponseEntity<EmpresaPersonaFisica> obtenerPorId(@PathVariable Long id) {
        Optional<EmpresaPersonaFisica> empresaPersonaFisica = service.obtenerPorId(id);
        return empresaPersonaFisica.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Crear un nuevo registro de EmpresaPersonaFisica
    @PostMapping
    public ResponseEntity<EmpresaPersonaFisica> guardar(@RequestBody EmpresaPersonaFisica empresaPersonaFisica) {
        EmpresaPersonaFisica nuevoEmpresaPersonaFisica = service.guardar(empresaPersonaFisica);
        return ResponseEntity.ok(nuevoEmpresaPersonaFisica);
    }

    // Editar un registro existente de EmpresaPersonaFisica
    @PutMapping("/{id}")
    public ResponseEntity<EmpresaPersonaFisica> editar(@PathVariable Long id, @RequestBody EmpresaPersonaFisica empresaPersonaFisica) {
        Optional<EmpresaPersonaFisica> empresaExistente = service.obtenerPorId(id);

        if (!empresaExistente.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        // Actualizar el registro existente
        EmpresaPersonaFisica empresaActualizada = empresaExistente.get();
        empresaActualizada.setNombre(empresaPersonaFisica.getNombre());
        empresaActualizada.setNifCif(empresaPersonaFisica.getNifCif());
        empresaActualizada.setTelefono(empresaPersonaFisica.getTelefono());
        empresaActualizada.setDireccion(empresaPersonaFisica.getDireccion());
        empresaActualizada.setWeb(empresaPersonaFisica.getWeb());
        empresaActualizada.setMail(empresaPersonaFisica.getMail());
        empresaActualizada.setTipo(empresaPersonaFisica.getTipo());

        EmpresaPersonaFisica empresaGuardada = service.guardar(empresaActualizada);
        return ResponseEntity.ok(empresaGuardada);
    }

    // Eliminar un registro de EmpresaPersonaFisica por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        Optional<EmpresaPersonaFisica> empresaPersonaFisica = service.obtenerPorId(id);
        if (empresaPersonaFisica.isPresent()) {
            try {
                service.eliminar(id);
                return ResponseEntity.noContent().build();
            } catch (DataIntegrityViolationException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("No se puede eliminar el registro porque tiene relaciones asociadas.");
            }
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Registro no encontrado");
        }
    }
}
