package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Factura;
import IDP_H1.FactuStock.Entities.Organizacion;
import IDP_H1.FactuStock.Repositories.FacturaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class FacturaService {

    @Autowired
    private FacturaRepository facturaRepository;

    public List<Factura> obtenerFacturasPorOrganizacion(Organizacion organizacion) {
        return facturaRepository.findByOrganizacion(organizacion);
    }

    public int countByMonthAndYear(int month, int year) {
        return facturaRepository.countByMonthAndYear(month, year);
    }

    @Transactional
    public Factura guardar(Factura factura) {
        if (factura.getFechaCreacionFactura() == null) {
            factura.setFechaCreacionFactura(LocalDateTime.now());
        }

        int maxIntentos = 100;  // Aumentamos el número máximo de intentos
        for (int intento = 0; intento < maxIntentos; intento++) {
            try {
                if (factura.getNumeroFactura() == null || factura.getNumeroFactura().trim().isEmpty()) {
                    String numeroFactura = generarNumeroFacturaUnico(factura, intento);
                    factura.setNumeroFactura(numeroFactura);
                }

                return facturaRepository.save(factura);
            } catch (DataIntegrityViolationException e) {
                if (intento == maxIntentos - 1) {
                    throw new RuntimeException("No se pudo generar un número de factura único después de " + maxIntentos + " intentos", e);
                }
                // Si hay un conflicto, continuamos con el siguiente intento
            }
        }
        throw new RuntimeException("No se pudo generar un número de factura único después de " + maxIntentos + " intentos");
    }

    private String generarNumeroFacturaUnico(Factura factura, int intento) {
        LocalDate fechaActual = factura.getFecha() != null ? factura.getFecha().toLocalDate() : LocalDate.now();
        int year = fechaActual.getYear() % 100;
        int month = fechaActual.getMonthValue();

        Organizacion organizacion = factura.getOrganizacion();
        String organizacionId = String.valueOf(organizacion.getId());

        int count = countByMonthAndYear(month, fechaActual.getYear());
        int sequence = count + 1 + intento;

        return String.format("Fac_%s_%02d/%02d/%05d", organizacionId, year, month, sequence);
    }

    public List<Factura> obtenerTodas() {
        return facturaRepository.findAll();
    }

    public Factura obtenerPorId(Long id) {
        return facturaRepository.findById(id).orElse(null);
    }

    public void eliminar(Long id) {
        facturaRepository.deleteById(id);
    }
}
