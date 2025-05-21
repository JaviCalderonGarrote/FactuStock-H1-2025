package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Caja;
import IDP_H1.FactuStock.Entities.EstadoCaja;
import IDP_H1.FactuStock.Entities.Ingreso;
import IDP_H1.FactuStock.Repositories.CajaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class CajaService {

    private static final Logger log = LoggerFactory.getLogger(CajaService.class);

    @Autowired
    private CajaRepository repository;

    @Autowired
    private IngresoService ingresoService;

    public List<Caja> obtenerTodas() {
        return repository.findAll();
    }

    public Optional<Caja> obtenerPorId(Long id) {
        return repository.findById(id);
    }

    @Transactional
    public Caja guardar(Caja caja) {
        if (caja.getFechaInicio() == null) {
            caja.setFechaInicio(LocalDateTime.now());
        }
        return repository.save(caja);
    }

    @Transactional
    public void eliminar(Long id) {
        repository.deleteById(id);
    }

    public Optional<Caja> obtenerCajaAbierta(Long organizacionId) {
        List<Caja> cajasAbiertas = repository.findByEstadoAndOrganizacionId(EstadoCaja.ABIERTA, organizacionId);
        if (cajasAbiertas.isEmpty()) {
            return Optional.empty();
        } else if (cajasAbiertas.size() > 1) {
            log.warn("Se encontraron múltiples cajas abiertas para la organización {}. Se utilizará la más reciente.", organizacionId);
            return cajasAbiertas.stream()
                    .max(Comparator.comparing(Caja::getFechaInicio));
        } else {
            return Optional.of(cajasAbiertas.get(0));
        }
    }

    @Transactional
    public Caja abrirNuevaCaja(Caja caja) {
        Optional<Caja> cajaAbiertaExistente = obtenerCajaAbierta(caja.getOrganizacion().getId());
        cajaAbiertaExistente.ifPresent(c -> cerrarCaja(c.getId()));
        caja.setEstado(EstadoCaja.ABIERTA);
        caja.setFechaInicio(LocalDateTime.now());
        caja.setTotalIngresado(0.0);
        caja.setCantidadVentas(0);
        return guardar(caja);
    }

    @Transactional
    public Caja cerrarCaja(Long id) {
        Caja caja = obtenerPorId(id)
                .orElseThrow(() -> new RuntimeException("Caja no encontrada con ID: " + id));
        if (caja.getEstado() == EstadoCaja.CERRADA) {
            throw new RuntimeException("La caja ya está cerrada");
        }
        caja.setEstado(EstadoCaja.CERRADA);
        caja.setFechaFin(LocalDateTime.now());
        Caja cajaCerrada = guardar(caja);

        Ingreso ingreso = new Ingreso();
        ingreso.setCaja(cajaCerrada);
        ingreso.setMonto(cajaCerrada.getTotalIngresado());
        ingreso.setFecha(LocalDateTime.now());
        ingreso.setOrganizacion(cajaCerrada.getOrganizacion());
        ingresoService.guardar(ingreso);

        return cajaCerrada;
    }

    @Transactional
    public Caja actualizarCaja(Caja cajaActualizada) {
        Caja cajaExistente = obtenerPorId(cajaActualizada.getId())
                .orElseThrow(() -> new RuntimeException("Caja no encontrada con ID: " + cajaActualizada.getId()));

        cajaExistente.setTotalIngresado(cajaActualizada.getTotalIngresado());
        cajaExistente.setCantidadVentas(cajaActualizada.getCantidadVentas());

        if (cajaActualizada.getEstado() == EstadoCaja.CERRADA && cajaExistente.getEstado() != EstadoCaja.CERRADA) {
            cajaExistente.setEstado(EstadoCaja.CERRADA);
            cajaExistente.setFechaFin(LocalDateTime.now());
        }

        return guardar(cajaExistente);
    }

    public List<Caja> obtenerPorOrganizacion(Long organizacionId) {
        return repository.findByOrganizacionId(organizacionId);
    }

    @Transactional
    public Caja abrirNuevaCajaPorOrganizacion(Caja caja, Long organizacionId) {
        Optional<Caja> cajaAbiertaExistente = obtenerCajaAbierta(organizacionId);
        cajaAbiertaExistente.ifPresent(c -> cerrarCaja(c.getId()));
        caja.setEstado(EstadoCaja.ABIERTA);
        caja.setFechaInicio(LocalDateTime.now());
        caja.setTotalIngresado(0.0);
        caja.setCantidadVentas(0);
        return guardar(caja);
    }

    public Map<String, Object> obtenerCajaAbiertaConTotal(Long organizacionId) {
        Map<String, Object> cajaInfo = new HashMap<>();
        try {
            Optional<Object> result = repository.obtenerCajaAbiertaConTotal(organizacionId);
            if (result.isPresent()) {
                Object[] data = (Object[]) result.get();  // 🔧 Cast correcto aquí
                cajaInfo.put("nombre", data[0] != null ? data[0].toString() : "No hay caja abierta");
                cajaInfo.put("totalIngresado", data[1] != null ? Double.parseDouble(data[1].toString()) : 0.0);
            } else {
                cajaInfo.put("nombre", "No hay caja abierta");
                cajaInfo.put("totalIngresado", 0.0);
            }
        } catch (Exception e) {
            log.error("Error al obtener caja abierta para organización {}: {}", organizacionId, e.getMessage());
            cajaInfo.put("nombre", "Error al obtener información de la caja");
            cajaInfo.put("totalIngresado", 0.0);
        }
        log.info("Información de caja obtenida: {}", cajaInfo);
        return cajaInfo;
    }

}
