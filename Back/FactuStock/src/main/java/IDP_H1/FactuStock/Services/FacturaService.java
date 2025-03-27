package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Factura;
import IDP_H1.FactuStock.Entities.Organizacion;
import IDP_H1.FactuStock.Repositories.FacturaRepository;
import IDP_H1.FactuStock.DTO.FacturaDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FacturaService {

    @Autowired
    private FacturaRepository facturaRepository;

    // Obtener facturas de una organización específica
    public List<FacturaDTO> obtenerFacturasPorOrganizacion(Organizacion organizacion) {
        List<Factura> facturas = facturaRepository.findByOrganizacion(organizacion);
        return facturas.stream()
                .map(FacturaDTO::fromFactura)  // Convertir a DTO
                .collect(Collectors.toList());
    }

    // Contar facturas de un mes y año específicos
    public int countByMonthAndYear(int month, int year) {
        return facturaRepository.countByMonthAndYear(month, year);
    }

    // Guardar una nueva factura con número en formato "Fac_1_23/03/00002"
    public Factura guardar(Factura factura) {
        if (factura.getFechaCreacionFactura() == null) {
            factura.setFechaCreacionFactura(LocalDateTime.now());
        }

        if (factura.getNumeroFactura() == null || factura.getNumeroFactura().trim().isEmpty()) {
            LocalDate fechaActual = LocalDate.now();
            int year = fechaActual.getYear() % 100; // Últimos dos dígitos del año
            int month = fechaActual.getMonthValue(); // Mes actual

            Organizacion organizacion = factura.getOrganizacion();
            String organizacionId = String.valueOf(organizacion.getId());

            int count = countByMonthAndYear(month, fechaActual.getYear());
            int sequence = count + 1;

            // Formato de número de factura
            String numeroFactura = String.format("Fac_%s_%02d/%02d/%05d", organizacionId, year, month, sequence);
            factura.setNumeroFactura(numeroFactura);
        }

        return facturaRepository.save(factura);
    }

    // Obtener todas las facturas
    public List<FacturaDTO> obtenerTodas() {
        List<Factura> facturas = facturaRepository.findAll();
        return facturas.stream()
                .map(FacturaDTO::fromFactura)  // Convertir a DTO
                .collect(Collectors.toList());
    }

    // Obtener factura por ID
    public Optional<FacturaDTO> obtenerPorId(Long id) {
        Optional<Factura> facturaOpt = facturaRepository.findById(id);
        return facturaOpt.map(FacturaDTO::fromFactura);  // Convertir a DTO si existe
    }

    // Eliminar factura por ID
    public void eliminar(Long id) {
        facturaRepository.deleteById(id);
    }
}
