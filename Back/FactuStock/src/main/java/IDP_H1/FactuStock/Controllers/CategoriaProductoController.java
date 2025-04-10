package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.DTO.CategoriaProductoDTO;
import IDP_H1.FactuStock.Entities.Organizacion;
import IDP_H1.FactuStock.Services.CategoriaProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/categoriasProducto")
public class CategoriaProductoController {

    @Autowired
    private CategoriaProductoService categoriaProductoService;

    // Obtener todas las categorías
    @GetMapping
    public ResponseEntity<List<CategoriaProductoDTO>> obtenerTodas() {
        List<CategoriaProductoDTO> categorias = categoriaProductoService.obtenerTodas();
        return new ResponseEntity<>(categorias, HttpStatus.OK);
    }

    // Obtener categoría por ID
    @GetMapping("/{id}")
    public ResponseEntity<CategoriaProductoDTO> obtenerPorId(@PathVariable Long id) {
        Optional<CategoriaProductoDTO> categoria = categoriaProductoService.obtenerPorId(id);
        return categoria.map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Obtener categorías por organización
    @GetMapping("/organizacion/{organizacionId}")
    public ResponseEntity<List<CategoriaProductoDTO>> obtenerCategoriasPorOrganizacion(@PathVariable Long organizacionId) {
        Organizacion organizacion = new Organizacion();
        organizacion.setId(organizacionId);
        List<CategoriaProductoDTO> categorias = categoriaProductoService.obtenerCategoriasPorOrganizacion(organizacion);

        if (categorias.isEmpty()) {
            // Puedes devolver una respuesta con un mensaje si la lista está vacía
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);  // Esto devuelve un código 204 si no hay categorías
        }

        return new ResponseEntity<>(categorias, HttpStatus.OK);
    }

    // Guardar nueva categoría
    @PostMapping
    public ResponseEntity<CategoriaProductoDTO> guardar(@RequestBody CategoriaProductoDTO categoriaProductoDTO) {
        CategoriaProductoDTO nuevaCategoria = categoriaProductoService.guardarCategoria(categoriaProductoDTO);
        return new ResponseEntity<>(nuevaCategoria, HttpStatus.CREATED);
    }

    // Editar categoría por ID
    @PutMapping("/{id}")
    public ResponseEntity<CategoriaProductoDTO> editar(@PathVariable Long id, @RequestBody CategoriaProductoDTO categoriaProductoDTO) {
        Optional<CategoriaProductoDTO> categoriaExistente = categoriaProductoService.obtenerPorId(id);
        if (categoriaExistente.isPresent()) {
            categoriaProductoDTO.setId(id);
            CategoriaProductoDTO categoriaEditada = categoriaProductoService.guardarCategoria(categoriaProductoDTO);
            return new ResponseEntity<>(categoriaEditada, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Eliminar categoría por ID (Manejo de errores si tiene productos asociados)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        Optional<CategoriaProductoDTO> categoria = categoriaProductoService.obtenerPorId(id);
        if (categoria.isPresent()) {
            try {
                categoriaProductoService.eliminarCategoria(id);
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } catch (DataIntegrityViolationException e) {
                return new ResponseEntity<>("No se puede eliminar la categoría porque tiene productos asociados.", HttpStatus.BAD_REQUEST);
            }
        } else {
            return new ResponseEntity<>("Categoría no encontrada", HttpStatus.NOT_FOUND);
        }
    }
}
