package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.CategoriaGasto;
import IDP_H1.FactuStock.Services.CategoriaGastoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/categoriasgasto")
public class CategoriaGastoController {

    @Autowired
    private CategoriaGastoService service;

    // Obtener todas las categorías de gasto
    @GetMapping
    public List<CategoriaGasto> obtenerTodas() {
        return service.obtenerTodas();
    }

    // Obtener una categoría por su ID
    @GetMapping("/{id}")
    public ResponseEntity<CategoriaGasto> obtenerPorId(@PathVariable Long id) {
        Optional<CategoriaGasto> categoria = service.obtenerPorId(id);
        return categoria.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    // Obtener categorías por organización
    @GetMapping("/organizacion/{idOrganizacion}")
    public ResponseEntity<List<CategoriaGasto>> obtenerPorOrganizacion(@PathVariable Long idOrganizacion) {
        List<CategoriaGasto> categorias = service.obtenerPorOrganizacion(idOrganizacion);
        if (categorias.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body(categorias);  // Devuelve 204 si no hay categorías
        }
        return ResponseEntity.ok(categorias);
    }
    // Crear una nueva categoría de gasto
    @PostMapping
    public ResponseEntity<CategoriaGasto> guardar(@RequestBody CategoriaGasto categoria) {
        CategoriaGasto nuevaCategoria = service.guardar(categoria);
        return ResponseEntity.ok(nuevaCategoria);
    }

    // Editar una categoría de gasto existente
    @PutMapping("/{id}")
    public ResponseEntity<CategoriaGasto> editarCategoria(@PathVariable Long id, @RequestBody CategoriaGasto categoria) {
        Optional<CategoriaGasto> categoriaExistente = service.obtenerPorId(id);

        if (!categoriaExistente.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        // Actualizar la categoría existente
        CategoriaGasto categoriaActualizada = categoriaExistente.get();
        categoriaActualizada.setNombre(categoria.getNombre());

        CategoriaGasto categoriaGuardada = service.guardar(categoriaActualizada);
        return ResponseEntity.ok(categoriaGuardada);
    }

    // Eliminar una categoría de gasto por ID (Evita eliminar si tiene gastos asociados)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        Optional<CategoriaGasto> categoria = service.obtenerPorId(id);
        if (categoria.isPresent()) {
            try {
                service.eliminar(id);
                return ResponseEntity.noContent().build();
            } catch (DataIntegrityViolationException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("No se puede eliminar la categoría porque tiene gastos asociados.");
            }
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Categoría no encontrada");
        }
    }
}
