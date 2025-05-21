package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.*;
import IDP_H1.FactuStock.Services.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/ventas")
public class VentaController {

    private static final Logger logger = LoggerFactory.getLogger(VentaController.class);

    @Autowired
    private VentaService ventaService;

    @Autowired
    private ProductoService productoService;

    @Autowired
    private CajaService cajaService;

    @Autowired
    private EmpresaPersonaFisicaService empresaPersonaFisicaService;

    @GetMapping
    public ResponseEntity<List<Venta>> obtenerTodas() {
        logger.info("Solicitando todas las ventas");
        List<Venta> ventas = ventaService.obtenerTodas();
        return new ResponseEntity<>(ventas, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Venta> obtenerPorId(@PathVariable Long id) {
        logger.info("Solicitando venta con ID: {}", id);
        Optional<Venta> venta = ventaService.obtenerPorId(id);
        return venta.map(v -> {
            logger.info("Venta encontrada: {}", v);
            return ResponseEntity.ok(v);
        }).orElseGet(() -> {
            logger.warn("Venta no encontrada con ID: {}", id);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        });
    }

    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody Venta venta) {
        logger.info("Recibida solicitud para guardar venta: {}", venta);
        try {
            if (venta.getOrganizacion() == null || venta.getOrganizacion().getId() == null) {
                return new ResponseEntity<>("La organización es requerida para la venta", HttpStatus.BAD_REQUEST);
            }

            Optional<Caja> cajaAbierta = cajaService.obtenerCajaAbierta(venta.getOrganizacion().getId());
            if (cajaAbierta.isEmpty()) {
                return new ResponseEntity<>("No hay una caja abierta para realizar la venta", HttpStatus.BAD_REQUEST);
            }
            venta.setCaja(cajaAbierta.get());

            if (venta.getEmpresa() != null && venta.getEmpresa().getId() != null) {
                Optional<EmpresaPersonaFisica> empresa = empresaPersonaFisicaService.obtenerPorId(venta.getEmpresa().getId());
                if (empresa.isEmpty()) {
                    return new ResponseEntity<>("La empresa/persona física especificada no existe", HttpStatus.BAD_REQUEST);
                }
                venta.setEmpresa(empresa.get());
            } else {
                venta.setEmpresa(null);
            }

            for (Detalle detalle : venta.getDetalles()) {
                Producto producto = productoService.obtenerPorId(detalle.getProducto().getId())
                        .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + detalle.getProducto().getId()));
                if (producto.getCantidadStock() < detalle.getCantidad()) {
                    return new ResponseEntity<>("Stock insuficiente para el producto: " + producto.getNombre(), HttpStatus.BAD_REQUEST);
                }
                producto.setCantidadStock(producto.getCantidadStock() - detalle.getCantidad());
                productoService.guardar(producto);
            }

            Venta nuevaVenta = ventaService.guardar(venta);

            Caja caja = cajaAbierta.get();
            caja.setTotalIngresado(caja.getTotalIngresado() + venta.getTotal());
            caja.setCantidadVentas(caja.getCantidadVentas() + 1);
            cajaService.guardar(caja);

            logger.info("Venta guardada exitosamente: {}", nuevaVenta);
            return new ResponseEntity<>(nuevaVenta, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error al guardar la venta", e);
            return new ResponseEntity<>("Error al procesar la venta: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Venta> actualizar(@PathVariable Long id, @RequestBody Venta venta) {
        logger.info("Recibida solicitud para actualizar venta con ID: {}", id);
        if (!ventaService.obtenerPorId(id).isPresent()) {
            logger.warn("Intento de actualizar una venta no existente. ID: {}", id);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        venta.setId(id);
        try {
            Venta ventaActualizada = ventaService.guardar(venta);
            logger.info("Venta actualizada exitosamente: {}", ventaActualizada);
            return new ResponseEntity<>(ventaActualizada, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error al actualizar la venta", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        logger.info("Recibida solicitud para eliminar venta con ID: {}", id);
        Optional<Venta> venta = ventaService.obtenerPorId(id);
        if (venta.isPresent()) {
            try {
                ventaService.eliminar(id);
                logger.info("Venta eliminada exitosamente. ID: {}", id);
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } catch (Exception e) {
                logger.error("Error al eliminar la venta", e);
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } else {
            logger.warn("Intento de eliminar una venta no existente. ID: {}", id);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception e) {
        logger.error("Error no manejado en VentaController", e);
        return new ResponseEntity<>("Error interno del servidor: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @GetMapping("/por-mes/{organizacionId}/{year}")
    public ResponseEntity<List<Map<String, Object>>> obtenerVentasPorMes(
            @PathVariable Long organizacionId,
            @PathVariable int year) {
        List<Map<String, Object>> ventas = ventaService.obtenerVentasPorMes(organizacionId, year);
        return ResponseEntity.ok(ventas);
    }

}
