package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.CategoriaProducto;
import IDP_H1.FactuStock.Entities.Organizacion;
import IDP_H1.FactuStock.Repositories.CategoriaProductoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoriaProductoService {

    private final CategoriaProductoRepository categoriaProductoRepository;

    public CategoriaProductoService(CategoriaProductoRepository categoriaProductoRepository) {
        this.categoriaProductoRepository = categoriaProductoRepository;
    }

    // Guardar o actualizar una categoría
    public CategoriaProducto guardarCategoria(CategoriaProducto categoria) {
        return categoriaProductoRepository.save(categoria);
    }

    // Obtener una categoría por ID
    public Optional<CategoriaProducto> obtenerPorId(Long id) {
        return categoriaProductoRepository.findById(id);
    }

    // Obtener todas las categorías
    public List<CategoriaProducto> obtenerTodas() {
        return categoriaProductoRepository.findAll();
    }

    // Obtener categorías por organización
    public List<CategoriaProducto> obtenerCategoriasPorOrganizacion(Organizacion organizacion) {
        return categoriaProductoRepository.findByOrganizacion(organizacion);
    }

    // Verificar si una categoría existe por ID
    public boolean existePorId(Long id) {
        return categoriaProductoRepository.existsById(id);
    }

    // Eliminar una categoría por ID
    public void eliminarCategoria(Long id) {
        categoriaProductoRepository.deleteById(id);
    }
}
