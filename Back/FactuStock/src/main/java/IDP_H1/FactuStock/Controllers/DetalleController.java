package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.Detalle;
import IDP_H1.FactuStock.Services.DetalleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/detalles")
public class DetalleController {

    private static final Logger logger = LoggerFactory.getLogger(DetalleController.class);

    @Autowired
    private DetalleService detalleService;

    @GetMapping
    public ResponseEntity<List<Detalle>> obtenerTodos() {
        logger.info("Solicitud para obtener todos los detalles");
        List<Detalle> detalles = detalleService.obtenerTodos();
        if (detalles.isEmpty()) {
            logger.warn("No se encontraron detalles");
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        logger.info("Se encontraron {} detalles", detalles.size());
        return new ResponseEntity<>(detalles, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Detalle> obtenerPorId(@PathVariable Long id) {
        logger.info("Solicitud para obtener detalle con ID: {}", id);
        Optional<Detalle> detalle = detalleService.obtenerPorId(id);
        if (detalle.isPresent()) {
            logger.info("Detalle encontrado con ID: {}", id);
            return ResponseEntity.ok(detalle.get());
        } else {
            logger.warn("No se encontró detalle con ID: {}", id);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody Detalle detalle) {
        logger.info("Solicitud para guardar nuevo detalle");
        // Validación: el detalle debe tener una venta asociada obligatoriamente
        if (detalle.getVenta() == null || detalle.getVenta().getId() == null) {
            logger.warn("Intento de guardar un detalle sin venta asociada");
            return new ResponseEntity<>("El detalle debe estar asociado a una venta", HttpStatus.BAD_REQUEST);
        }
        Detalle nuevoDetalle = detalleService.guardar(detalle);
        logger.info("Nuevo detalle guardado con ID: {}", nuevoDetalle.getId());
        return new ResponseEntity<>(nuevoDetalle, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Detalle> actualizar(@PathVariable Long id, @RequestBody Detalle detalle) {
        logger.info("Solicitud para actualizar detalle con ID: {}", id);
        // Validación: el detalle debe tener una venta asociada obligatoriamente
        if (detalle.getVenta() == null || detalle.getVenta().getId() == null) {
            logger.warn("Intento de actualizar un detalle sin venta asociada");
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        Detalle detalleActualizado = detalleService.actualizar(id, detalle);
        if (detalleActualizado != null) {
            logger.info("Detalle actualizado con ID: {}", id);
            return new ResponseEntity<>(detalleActualizado, HttpStatus.OK);
        }
        logger.warn("No se pudo actualizar el detalle con ID: {}", id);
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        logger.info("Solicitud para eliminar detalle con ID: {}", id);
        Optional<Detalle> detalle = detalleService.obtenerPorId(id);
        if (detalle.isPresent()) {
            detalleService.eliminar(id);
            logger.info("Detalle eliminado con ID: {}", id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        logger.warn("No se pudo eliminar el detalle con ID: {}", id);
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping("/top5-productos-vendidos/{organizacionId}")
    @PreAuthorize("hasAuthority('READ_STATS')")
    public ResponseEntity<Map<String, Long>> obtenerTop5ProductosMasVendidos(@PathVariable Long organizacionId) {
        logger.info("Recibida solicitud para top 5 productos. OrganizacionId: {}", organizacionId);

        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            var request = attributes.getRequest();
            var headerNames = request.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                logger.info("Header: {} = {}", headerName, request.getHeader(headerName));
            }
        }

        Map<String, Long> top5Productos = detalleService.obtenerTop5ProductosMasVendidos(organizacionId);
        if (top5Productos.isEmpty()) {
            logger.warn("No se encontraron datos para los top 5 productos más vendidos");
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        logger.info("Se encontraron {} productos en el top 5", top5Productos.size());
        return new ResponseEntity<>(top5Productos, HttpStatus.OK);
    }
}