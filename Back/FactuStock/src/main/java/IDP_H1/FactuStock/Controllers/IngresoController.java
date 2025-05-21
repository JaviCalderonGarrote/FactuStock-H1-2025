package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.Ingreso;
import IDP_H1.FactuStock.Services.IngresoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ingresos")
public class IngresoController {

    private static final Logger logger = LoggerFactory.getLogger(IngresoController.class);

    @Autowired
    private IngresoService ingresoService;

    @GetMapping
    public ResponseEntity<List<Ingreso>> obtenerTodos() {
        logger.info("Obteniendo todos los ingresos");
        List<Ingreso> ingresos = ingresoService.obtenerTodos();
        logger.info("Se encontraron {} ingresos", ingresos.size());
        return ResponseEntity.ok(ingresos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ingreso> obtenerPorId(@PathVariable Long id) {
        logger.info("Obteniendo ingreso con ID: {}", id);
        return ingresoService.obtenerPorId(id)
                .map(ingreso -> {
                    logger.info("Ingreso encontrado: {}", ingreso);
                    return ResponseEntity.ok(ingreso);
                })
                .orElseGet(() -> {
                    logger.warn("No se encontró ingreso con ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @GetMapping("/organizacion/{organizacionId}")
    public ResponseEntity<List<Ingreso>> obtenerPorOrganizacion(@PathVariable Long organizacionId) {
        logger.info("Obteniendo ingresos para la organización con ID: {}", organizacionId);
        List<Ingreso> ingresos = ingresoService.obtenerPorOrganizacion(organizacionId);
        logger.info("Se encontraron {} ingresos para la organización", ingresos.size());
        return ResponseEntity.ok(ingresos);
    }

    @PostMapping
    public ResponseEntity<Ingreso> crear(@RequestBody Ingreso ingreso) {
        logger.info("Creando nuevo ingreso: {}", ingreso);
        Ingreso nuevoIngreso = ingresoService.guardar(ingreso);
        logger.info("Nuevo ingreso creado con ID: {}", nuevoIngreso.getId());
        return ResponseEntity.ok(nuevoIngreso);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ingreso> actualizar(@PathVariable Long id, @RequestBody Ingreso ingreso) {
        logger.info("Actualizando ingreso con ID: {}", id);
        return ingresoService.obtenerPorId(id)
                .map(ingresoExistente -> {
                    ingreso.setId(ingresoExistente.getId());
                    Ingreso ingresoActualizado = ingresoService.guardar(ingreso);
                    logger.info("Ingreso actualizado: {}", ingresoActualizado);
                    return ResponseEntity.ok(ingresoActualizado);
                })
                .orElseGet(() -> {
                    logger.warn("No se encontró ingreso con ID: {} para actualizar", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        logger.info("Eliminando ingreso con ID: {}", id);
        return ingresoService.obtenerPorId(id)
                .map(ingreso -> {
                    ingresoService.eliminar(id);
                    logger.info("Ingreso eliminado correctamente");
                    return ResponseEntity.ok().<Void>build();
                })
                .orElseGet(() -> {
                    logger.warn("No se encontró ingreso con ID: {} para eliminar", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @GetMapping("/total/{organizacionId}/{year}")
    public ResponseEntity<Double> obtenerTotalIngresosPorAno(@PathVariable Long organizacionId, @PathVariable int year) {
        logger.info("Obteniendo total de ingresos para la organización {} en el año {}", organizacionId, year);
        Double totalIngresos = ingresoService.obtenerTotalIngresosPorAno(organizacionId, year);
        logger.info("Total de ingresos obtenido: {}", totalIngresos);
        return ResponseEntity.ok(totalIngresos);
    }

    @GetMapping("/mensuales/{organizacionId}/{year}")
    public ResponseEntity<List<Map<String, Object>>> obtenerIngresosMensuales(@PathVariable Long organizacionId, @PathVariable int year) {
        logger.info("Obteniendo ingresos mensuales para la organización {} en el año {}", organizacionId, year);
        List<Map<String, Object>> ingresosMensuales = ingresoService.obtenerIngresosMensuales(organizacionId, year);
        logger.info("Se obtuvieron los ingresos mensuales: {}", ingresosMensuales);
        return ResponseEntity.ok(ingresosMensuales);
    }



}
