package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Detalle;
import IDP_H1.FactuStock.Repositories.DetalleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DetalleService {

    private static final Logger logger = LoggerFactory.getLogger(DetalleService.class);

    @Autowired
    private DetalleRepository detalleRepository;

    public List<Detalle> obtenerTodos() {
        logger.info("Obteniendo todos los detalles");
        List<Detalle> detalles = detalleRepository.findAll();
        logger.info("Se encontraron {} detalles", detalles.size());
        return detalles;
    }

    public Optional<Detalle> obtenerPorId(Long id) {
        logger.info("Buscando detalle con ID: {}", id);
        Optional<Detalle> detalle = detalleRepository.findById(id);
        if (detalle.isPresent()) {
            logger.info("Detalle encontrado con ID: {}", id);
        } else {
            logger.warn("No se encontró detalle con ID: {}", id);
        }
        return detalle;
    }

    public Detalle guardar(Detalle detalle) {
        logger.info("Guardando nuevo detalle");
        Detalle nuevoDetalle = detalleRepository.save(detalle);
        logger.info("Nuevo detalle guardado con ID: {}", nuevoDetalle.getId());
        return nuevoDetalle;
    }

    public void eliminar(Long id) {
        logger.info("Eliminando detalle con ID: {}", id);
        detalleRepository.deleteById(id);
        logger.info("Detalle eliminado con ID: {}", id);
    }

    public Detalle actualizar(Long id, Detalle detalleActualizado) {
        logger.info("Actualizando detalle con ID: {}", id);
        Optional<Detalle> detalleOptional = detalleRepository.findById(id);
        if (detalleOptional.isPresent()) {
            Detalle detalle = detalleOptional.get();
            detalle.setCantidad(detalleActualizado.getCantidad());
            detalle.setIva(detalleActualizado.getIva());
            detalle.setPrecioUnitario(detalleActualizado.getPrecioUnitario());
            detalle.setSubtotal(detalleActualizado.getSubtotal());
            Detalle detalleSaved = detalleRepository.save(detalle);
            logger.info("Detalle actualizado con ID: {}", id);
            return detalleSaved;
        }
        logger.warn("No se pudo actualizar el detalle con ID: {}", id);
        return null;
    }

    public Map<String, Long> obtenerTop5ProductosMasVendidos(Long organizacionId) {
        logger.info("Obteniendo top 5 productos más vendidos para la organización: {}", organizacionId);
        List<Object[]> resultados = detalleRepository.findTop5ProductosMasVendidos(organizacionId);

        if (resultados == null || resultados.isEmpty()) {
            logger.warn("La consulta de top 5 productos más vendidos devolvió null o vacío");
            return Map.of();
        }

        // Encuentra el valor del 5º producto (si hay al menos 5)
        long limite = resultados.size() >= 5 ? (Long) resultados.get(4)[1] : Long.MIN_VALUE;

        // Devuelve todos los productos cuyo totalVendido sea mayor o igual al 5º
        Map<String, Long> top5 = resultados.stream()
                .filter(row -> (Long) row[1] >= limite)
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]
                ));

        logger.info("Top 5 productos más vendidos (incluyendo empates): {}", top5);
        return top5;
    }
}