package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.CategoriaProducto;
import IDP_H1.FactuStock.Entities.Organizacion;
import IDP_H1.FactuStock.Entities.Producto;
import IDP_H1.FactuStock.Services.CategoriaProductoService;
import IDP_H1.FactuStock.Services.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/productos")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    @Autowired
    private CategoriaProductoService categoriaProductoService;

    @GetMapping("/organizacion/{organizacionId}")
    public ResponseEntity<List<Producto>> obtenerProductosPorOrganizacion(@PathVariable Long organizacionId) {
        Organizacion organizacion = new Organizacion();
        organizacion.setId(organizacionId);

        List<Producto> productos = productoService.obtenerProductosPorOrganizacion(organizacion);

        if (productos.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }

        return new ResponseEntity<>(productos, HttpStatus.OK);
    }

    @GetMapping("/categorias")
    public ResponseEntity<List<CategoriaProducto>> obtenerCategorias() {
        List<CategoriaProducto> categorias = categoriaProductoService.obtenerTodas();
        return new ResponseEntity<>(categorias, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<Producto>> obtenerTodos() {
        List<Producto> productos = productoService.obtenerTodos();
        return new ResponseEntity<>(productos, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody Producto producto) {
        if (producto.getNombre() == null || producto.getNombre().trim().isEmpty()) {
            return new ResponseEntity<>("El nombre del producto no puede estar vacío", HttpStatus.BAD_REQUEST);
        }
        if (producto.getIva() == null) {
            producto.setIva(BigDecimal.valueOf(21.00));
        }
        try {
            Producto nuevoProducto = productoService.guardar(producto);
            return new ResponseEntity<>(nuevoProducto, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Error al guardar el producto: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerPorId(@PathVariable Long id) {
        Optional<Producto> producto = productoService.obtenerPorId(id);
        return producto.map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Optional<Producto> producto = productoService.obtenerPorId(id);
        if (producto.isPresent()) {
            productoService.eliminar(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarProducto(@PathVariable Long id, @RequestBody Producto producto) {
        Optional<Producto> productoExistente = productoService.obtenerPorId(id);

        if (productoExistente.isPresent()) {
            Producto productoActualizado = productoExistente.get();

            if (producto.getNombre() == null || producto.getNombre().trim().isEmpty()) {
                return new ResponseEntity<>("El nombre del producto no puede estar vacío", HttpStatus.BAD_REQUEST);
            }

            productoActualizado.setNombre(producto.getNombre());
            productoActualizado.setPrecio(producto.getPrecio());
            productoActualizado.setCantidadStock(producto.getCantidadStock());
            productoActualizado.setIva(producto.getIva());
            productoActualizado.setCategoria(producto.getCategoria());

            try {
                Producto guardado = productoService.guardar(productoActualizado);
                return new ResponseEntity<>(guardado, HttpStatus.OK);
            } catch (Exception e) {
                return new ResponseEntity<>("Error al actualizar el producto: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } else {
            return new ResponseEntity<>("Producto no encontrado", HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/lote")
    public ResponseEntity<?> guardarLote(@RequestBody List<Producto> productos) {
        try {
            for (Producto producto : productos) {
                if (producto.getIva() == null) {
                    producto.setIva(BigDecimal.valueOf(21.00));
                }
            }
            List<Producto> guardados = productoService.guardarTodos(productos);
            return new ResponseEntity<>(guardados, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Error al guardar productos: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
