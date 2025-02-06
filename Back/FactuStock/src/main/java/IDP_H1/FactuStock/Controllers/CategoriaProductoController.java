package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.CategoriaProducto;
import IDP_H1.FactuStock.Services.CategoriaProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/categorias")
public class CategoriaProductoController {

    @Autowired
    private CategoriaProductoService categoriaProductoService;

    // Obtener todas las categorías
    @GetMapping
    public ResponseEntity<List<CategoriaProducto>> obtenerTodas() {
        List<CategoriaProducto> categorias = categoriaProductoService.obtenerTodas();
        return new ResponseEntity<>(categorias, HttpStatus.OK);
    }

    // Obtener categoría por ID
    @GetMapping("/{id}")
    public ResponseEntity<CategoriaProducto> obtenerPorId(@PathVariable Long id) {
        Optional<CategoriaProducto> categoria = categoriaProductoService.obtenerPorId(id);
        return categoria.map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Guardar nueva categoría
    @PostMapping
    public ResponseEntity<CategoriaProducto> guardar(@RequestBody CategoriaProducto categoriaProducto) {
        CategoriaProducto nuevaCategoria = categoriaProductoService.guardar(categoriaProducto);
        return new ResponseEntity<>(nuevaCategoria, HttpStatus.CREATED);
    }

    // Eliminar categoría por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Optional<CategoriaProducto> categoria = categoriaProductoService.obtenerPorId(id);
        if (categoria.isPresent()) {
            categoriaProductoService.eliminar(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
