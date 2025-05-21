package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.Caja;
import IDP_H1.FactuStock.Services.CajaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/cajas")
public class CajaController {

    private static final Logger logger = LoggerFactory.getLogger(CajaController.class);

    @Autowired
    private CajaService cajaService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'VENDEDOR')")
    public ResponseEntity<List<Caja>> obtenerTodas() {
        logger.info("Solicitando todas las cajas");
        List<Caja> cajas = cajaService.obtenerTodas();
        return new ResponseEntity<>(cajas, HttpStatus.OK);
    }

    @GetMapping("/organizacion/{organizacionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'VENDEDOR')")
    public ResponseEntity<List<Caja>> obtenerPorOrganizacion(@PathVariable Long organizacionId) {
        logger.info("Solicitando cajas para la organización con ID: {}", organizacionId);
        List<Caja> cajas = cajaService.obtenerPorOrganizacion(organizacionId);
        return new ResponseEntity<>(cajas, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'VENDEDOR')")
    public ResponseEntity<Caja> obtenerPorId(@PathVariable Long id) {
        logger.info("Solicitando caja con ID: {}", id);
        Optional<Caja> caja = cajaService.obtenerPorId(id);
        return caja.map(c -> {
            logger.info("Caja encontrada: {}", c);
            return ResponseEntity.ok(c);
        }).orElseGet(() -> {
            logger.warn("Caja no encontrada con ID: {}", id);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        });
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<Caja> crearCaja(@RequestBody Caja caja) {
        logger.info("Creando nueva caja: {}", caja);
        Caja nuevaCaja = cajaService.abrirNuevaCaja(caja);
        logger.info("Caja creada: {}", nuevaCaja);
        return new ResponseEntity<>(nuevaCaja, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'VENDEDOR')")
    public ResponseEntity<Caja> actualizarCaja(@PathVariable Long id, @RequestBody Caja caja) {
        logger.info("Actualizando caja con ID: {}", id);
        Optional<Caja> cajaExistente = cajaService.obtenerPorId(id);
        if (!cajaExistente.isPresent()) {
            logger.warn("Intento de actualizar una caja no existente. ID: {}", id);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        caja.setId(id);
        Caja cajaActualizada = cajaService.actualizarCaja(caja);
        logger.info("Caja actualizada: {}", cajaActualizada);
        return new ResponseEntity<>(cajaActualizada, HttpStatus.OK);
    }

    @PutMapping("/{id}/cerrar")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<Caja> cerrarCaja(@PathVariable Long id) {
        logger.info("Cerrando caja con ID: {}", id);
        try {
            Caja cajaCerrada = cajaService.cerrarCaja(id);
            logger.info("Caja cerrada: {}", cajaCerrada);
            return new ResponseEntity<>(cajaCerrada, HttpStatus.OK);
        } catch (RuntimeException e) {
            logger.error("Error al cerrar la caja con ID: {}", id, e);
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }


    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception e) {
        logger.error("Error no manejado en CajaController", e);
        return new ResponseEntity<>("Error interno del servidor: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }


    @GetMapping("/abierta/organizacion/{organizacionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'VENDEDOR')")
    public ResponseEntity<Map<String, Object>> obtenerCajaAbiertaPorOrganizacion(@PathVariable Long organizacionId) {
        logger.info("Solicitando caja abierta para la organización con ID: {}", organizacionId);
        Map<String, Object> cajaInfo = cajaService.obtenerCajaAbiertaConTotal(organizacionId);
        logger.info("Caja abierta obtenida: {}", cajaInfo);
        return ResponseEntity.ok(cajaInfo);
    }

}
