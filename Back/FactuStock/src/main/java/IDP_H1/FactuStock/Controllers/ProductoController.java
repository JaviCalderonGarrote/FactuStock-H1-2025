package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.DTO.ProductoDTO;
import IDP_H1.FactuStock.DTO.CategoriaProductoDTO;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/productos")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    @Autowired
    private CategoriaProductoService categoriaProductoService;

    // Obtener productos por organización
    @GetMapping("/organizacion/{organizacionId}")
    public ResponseEntity<List<ProductoDTO>> obtenerProductosPorOrganizacion(@PathVariable Long organizacionId) {
        Organizacion organizacion = new Organizacion();
        organizacion.setId(organizacionId);

        List<Producto> productos = productoService.obtenerProductosPorOrganizacion(organizacion);

        if (productos.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }

        // Convertir la lista de productos a DTO e incluir la categoría
        List<ProductoDTO> productosDTO = productos.stream()
                .map(producto -> {
                    ProductoDTO dto = ProductoDTO.fromEntity(producto);

                    // Añadir la categoría completa si existe
                    if (producto.getCategoria() != null) {
                        dto.setCategoriaNombre(producto.getCategoria().getNombre());
                    }

                    return dto;
                })
                .collect(Collectors.toList());

        return new ResponseEntity<>(productosDTO, HttpStatus.OK);
    }

    // Obtener todas las categorías (ahora devuelve CategoriaProductoDTO)
    @GetMapping("/categorias")
    public ResponseEntity<List<CategoriaProductoDTO>> obtenerCategorias() {
        List<CategoriaProductoDTO> categorias = categoriaProductoService.obtenerTodas();
        return new ResponseEntity<>(categorias, HttpStatus.OK);
    }

    // Obtener todos los productos
    @GetMapping
    public ResponseEntity<List<ProductoDTO>> obtenerTodos() {
        List<Producto> productos = productoService.obtenerTodos();

        // Convertir la lista de productos a DTO e incluir la categoría
        List<ProductoDTO> productosDTO = productos.stream()
                .map(producto -> {
                    ProductoDTO dto = ProductoDTO.fromEntity(producto);

                    // Añadir la categoría completa si existe
                    if (producto.getCategoria() != null) {
                        dto.setCategoriaNombre(producto.getCategoria().getNombre());
                    }

                    return dto;
                })
                .collect(Collectors.toList());

        return new ResponseEntity<>(productosDTO, HttpStatus.OK);
    }

    // Crear un nuevo producto
    @PostMapping
    public ResponseEntity<ProductoDTO> guardar(@RequestBody ProductoDTO productoDTO) {
        if (productoDTO.getIva() == null) {
            productoDTO.setIva(BigDecimal.valueOf(21.00)); // Set IVA default to 21% if not provided
        }

        // Convertir el DTO a entidad Producto
        Producto producto = new Producto();
        producto.setNombre(productoDTO.getNombre());
        producto.setPrecio(productoDTO.getPrecio());
        producto.setCantidadStock(productoDTO.getCantidadStock());
        producto.setIva(productoDTO.getIva());

        // Asignar la categoría y la organización si existen
        CategoriaProducto categoria = new CategoriaProducto();
        categoria.setId(productoDTO.getCategoriaId());
        producto.setCategoria(categoria);

        Organizacion organizacion = new Organizacion();
        organizacion.setId(productoDTO.getOrganizacionId());
        producto.setOrganizacion(organizacion);

        Producto nuevoProducto = productoService.guardar(producto);

        // Convertir la entidad Producto a DTO antes de devolverla
        ProductoDTO nuevoProductoDTO = ProductoDTO.fromEntity(nuevoProducto);
        if (nuevoProducto.getCategoria() != null) {
            nuevoProductoDTO.setCategoriaNombre(nuevoProducto.getCategoria().getNombre());
        }

        return new ResponseEntity<>(nuevoProductoDTO, HttpStatus.CREATED);
    }

    // Obtener producto por ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductoDTO> obtenerPorId(@PathVariable Long id) {
        Optional<Producto> producto = productoService.obtenerPorId(id);
        return producto.map(p -> {
                    ProductoDTO productoDTO = ProductoDTO.fromEntity(p);
                    if (p.getCategoria() != null) {
                        productoDTO.setCategoriaNombre(p.getCategoria().getNombre());
                    }
                    return new ResponseEntity<>(productoDTO, HttpStatus.OK);
                })
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Eliminar producto por ID
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

    // Actualizar producto
    @PutMapping("/{id}")
    public ResponseEntity<ProductoDTO> actualizarProducto(@PathVariable Long id, @RequestBody ProductoDTO productoDTO) {
        Optional<Producto> productoExistente = productoService.obtenerPorId(id);

        if (productoExistente.isPresent()) {
            Producto productoActualizado = productoExistente.get();

            // Actualizar los campos necesarios
            productoActualizado.setNombre(productoDTO.getNombre());
            productoActualizado.setPrecio(productoDTO.getPrecio());
            productoActualizado.setCantidadStock(productoDTO.getCantidadStock());
            productoActualizado.setIva(productoDTO.getIva());

            CategoriaProducto categoria = new CategoriaProducto();
            categoria.setId(productoDTO.getCategoriaId());
            productoActualizado.setCategoria(categoria);

            Organizacion organizacion = new Organizacion();
            organizacion.setId(productoDTO.getOrganizacionId());
            productoActualizado.setOrganizacion(organizacion);

            productoService.guardar(productoActualizado);

            // Convertir el producto actualizado a DTO
            ProductoDTO productoActualizadoDTO = ProductoDTO.fromEntity(productoActualizado);
            if (productoActualizado.getCategoria() != null) {
                productoActualizadoDTO.setCategoriaNombre(productoActualizado.getCategoria().getNombre());
            }

            return new ResponseEntity<>(productoActualizadoDTO, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
