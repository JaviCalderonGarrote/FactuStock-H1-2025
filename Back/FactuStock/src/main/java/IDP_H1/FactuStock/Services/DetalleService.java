package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Detalle;
import IDP_H1.FactuStock.Repositories.DetalleRepository;
import IDP_H1.FactuStock.DTO.DetalleDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DetalleService {

    @Autowired
    private DetalleRepository detalleRepository;

    // Obtener todos los detalles
    public List<DetalleDTO> obtenerTodos() {
        List<Detalle> detalles = detalleRepository.findAll();
        return detalles.stream()
                .map(DetalleDTO::fromDetalle)  // Convertir Detalle a DetalleDTO
                .collect(Collectors.toList());
    }

    // Obtener detalle por ID
    public Optional<DetalleDTO> obtenerPorId(Long id) {
        Optional<Detalle> detalle = detalleRepository.findById(id);
        return detalle.map(DetalleDTO::fromDetalle);  // Convertir a DetalleDTO
    }

    // Guardar un nuevo detalle
    public DetalleDTO guardar(Detalle detalle) {
        Detalle nuevoDetalle = detalleRepository.save(detalle);
        return DetalleDTO.fromDetalle(nuevoDetalle);  // Convertir la entidad guardada a DTO
    }

    // Eliminar detalle por ID
    public void eliminar(Long id) {
        detalleRepository.deleteById(id);
    }

    // Actualizar el detalle (por si necesitas alguna operación de actualización específica)
    public DetalleDTO actualizar(Long id, Detalle detalleActualizado) {
        Optional<Detalle> detalleOptional = detalleRepository.findById(id);
        if (detalleOptional.isPresent()) {
            Detalle detalle = detalleOptional.get();
            // Actualiza las propiedades necesarias del detalle
            detalle.setCantidad(detalleActualizado.getCantidad());
            detalle.setIva(detalleActualizado.getIva());
            detalle.setPrecioUnitario(detalleActualizado.getPrecioUnitario());
            detalle.setSubtotal(detalleActualizado.getSubtotal());
            // Guarda los cambios y retorna el DTO
            Detalle detalleGuardado = detalleRepository.save(detalle);
            return DetalleDTO.fromDetalle(detalleGuardado);
        }
        return null;  // Si no se encuentra el detalle, puedes devolver null o lanzar una excepción
    }
}
