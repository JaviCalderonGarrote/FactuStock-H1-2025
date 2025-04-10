package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.DTO.CategoriaProductoDTO;
import IDP_H1.FactuStock.Entities.CategoriaProducto;
import IDP_H1.FactuStock.Entities.Organizacion;
import IDP_H1.FactuStock.Repositories.CategoriaProductoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CategoriaProductoService {

    private final CategoriaProductoRepository categoriaProductoRepository;

    public CategoriaProductoService(CategoriaProductoRepository categoriaProductoRepository) {
        this.categoriaProductoRepository = categoriaProductoRepository;
    }

    // Guardar o actualizar una categoría
    public CategoriaProductoDTO guardarCategoria(CategoriaProductoDTO categoriaDTO) {
        CategoriaProducto categoria = new CategoriaProducto();
        categoria.setId(categoriaDTO.getId());
        categoria.setNombre(categoriaDTO.getNombre());

        // Inicializa la organización correctamente con Long para el id
        Organizacion organizacion = new Organizacion();
        organizacion.setId(categoriaDTO.getOrganizacionId());  // Usa Long para organizacionId
        categoria.setOrganizacion(organizacion);

        CategoriaProducto categoriaGuardada = categoriaProductoRepository.save(categoria);
        return CategoriaProductoDTO.fromEntity(categoriaGuardada);
    }

    // Obtener una categoría por ID
    public Optional<CategoriaProductoDTO> obtenerPorId(Long id) {
        Optional<CategoriaProducto> categoria = categoriaProductoRepository.findById(id);
        return categoria.map(CategoriaProductoDTO::fromEntity);
    }

    // Obtener todas las categorías
    public List<CategoriaProductoDTO> obtenerTodas() {
        return categoriaProductoRepository.findAll().stream()
                .map(CategoriaProductoDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // Obtener categorías por organización
    public List<CategoriaProductoDTO> obtenerCategoriasPorOrganizacion(Organizacion organizacion) {
        return categoriaProductoRepository.findByOrganizacion(organizacion).stream()
                .map(CategoriaProductoDTO::fromEntity)
                .collect(Collectors.toList());
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
