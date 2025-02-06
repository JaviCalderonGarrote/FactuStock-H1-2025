package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.CategoriaGasto;
import IDP_H1.FactuStock.Services.CategoriaGastoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/categorias-gasto")
@CrossOrigin(origins = "*") // Permite peticiones desde cualquier origen (opcional)
public class CategoriaGastoController {

    @Autowired
    private CategoriaGastoService service;

    // 🔹 Obtener todas las categorías de gasto
    @GetMapping
    public List<CategoriaGasto> obtenerTodas() {
        return service.obtenerTodas();
    }

    // 🔹 Obtener una categoría por su ID
    @GetMapping("/{id}")
    public ResponseEntity<CategoriaGasto> obtenerPorId(@PathVariable Long id) {
        Optional<CategoriaGasto> categoria = service.obtenerPorId(id);
        return categoria.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 🔹 Crear una nueva categoría de gasto
    @PostMapping
    public ResponseEntity<CategoriaGasto> guardar(@RequestBody CategoriaGasto categoria) {
        CategoriaGasto nuevaCategoria = service.guardar(categoria);
        return ResponseEntity.ok(nuevaCategoria);
    }

    // 🔹 Actualizar una categoría de gasto existente
    @PutMapping("/{id}")
    public ResponseEntity<CategoriaGasto> actualizar(@PathVariable Long id, @RequestBody CategoriaGasto categoria) {
        if (!service.obtenerPorId(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        categoria.setId(id);
        CategoriaGasto categoriaActualizada = service.guardar(categoria);
        return ResponseEntity.ok(categoriaActualizada);
    }

    // 🔹 Eliminar una categoría de gasto por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!service.obtenerPorId(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
