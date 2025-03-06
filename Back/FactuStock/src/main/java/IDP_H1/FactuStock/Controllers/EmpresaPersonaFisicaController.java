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
@RequestMapping("/clientes")
public class EmpresaPersonaFisicaController {

    @Autowired
    private EmpresaPersonaFisicaService service;

    // Obtener todos los clientes
    @GetMapping
    public List<EmpresaPersonaFisica> obtenerTodos() {
        return service.obtenerTodos();
    }

    // Obtener un cliente por su ID
    @GetMapping("/{id}")
    public ResponseEntity<EmpresaPersonaFisica> obtenerPorId(@PathVariable Long id) {
        Optional<EmpresaPersonaFisica> cliente = service.obtenerPorId(id);
        return cliente.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Crear un nuevo cliente
    @PostMapping
    public ResponseEntity<EmpresaPersonaFisica> guardar(@RequestBody EmpresaPersonaFisica cliente) {
        EmpresaPersonaFisica nuevoCliente = service.guardar(cliente);
        return ResponseEntity.ok(nuevoCliente);
    }

    // Editar un cliente existente
    @PutMapping("/{id}")
    public ResponseEntity<EmpresaPersonaFisica> editarCliente(@PathVariable Long id, @RequestBody EmpresaPersonaFisica cliente) {
        Optional<EmpresaPersonaFisica> clienteExistente = service.obtenerPorId(id);

        if (!clienteExistente.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        // Actualizar el cliente existente
        EmpresaPersonaFisica clienteActualizado = clienteExistente.get();
        clienteActualizado.setNombre(cliente.getNombre());
        clienteActualizado.setNifCif(cliente.getNifCif());
        clienteActualizado.setTelefono(cliente.getTelefono());
        clienteActualizado.setDireccion(cliente.getDireccion());
        clienteActualizado.setWeb(cliente.getWeb());
        clienteActualizado.setMail(cliente.getMail());
        clienteActualizado.setTipo(cliente.getTipo());

        EmpresaPersonaFisica clienteGuardado = service.guardar(clienteActualizado);
        return ResponseEntity.ok(clienteGuardado);
    }

    // Eliminar un cliente por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        Optional<EmpresaPersonaFisica> cliente = service.obtenerPorId(id);
        if (cliente.isPresent()) {
            try {
                service.eliminar(id);
                return ResponseEntity.noContent().build();
            } catch (DataIntegrityViolationException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("No se puede eliminar el cliente porque tiene relaciones asociadas.");
            }
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Cliente no encontrado");
        }
    }
}
