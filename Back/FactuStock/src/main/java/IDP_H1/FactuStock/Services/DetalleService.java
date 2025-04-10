package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Detalle;
import IDP_H1.FactuStock.Repositories.DetalleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DetalleService {

    @Autowired
    private DetalleRepository detalleRepository;

    // Obtener todos los detalles
    public List<Detalle> obtenerTodos() {
        return detalleRepository.findAll();
    }

    // Obtener detalle por ID
    public Optional<Detalle> obtenerPorId(Long id) {
        return detalleRepository.findById(id);
    }

    // Guardar un nuevo detalle
    public Detalle guardar(Detalle detalle) {
        return detalleRepository.save(detalle);
    }

    // Eliminar detalle por ID
    public void eliminar(Long id) {
        detalleRepository.deleteById(id);
    }

    // Actualizar el detalle (por si necesitas alguna operación de actualización específica)
    public Detalle actualizar(Long id, Detalle detalleActualizado) {
        Optional<Detalle> detalleOptional = detalleRepository.findById(id);
        if (detalleOptional.isPresent()) {
            Detalle detalle = detalleOptional.get();
            // Actualiza las propiedades necesarias del detalle
            detalle.setCantidad(detalleActualizado.getCantidad());
            detalle.setIva(detalleActualizado.getIva());
            detalle.setPrecioUnitario(detalleActualizado.getPrecioUnitario());
            detalle.setSubtotal(detalleActualizado.getSubtotal());
            // Guarda los cambios y retorna el detalle actualizado
            return detalleRepository.save(detalle);
        }
        return null;  // Si no se encuentra el detalle, puedes devolver null o lanzar una excepción
    }
}
