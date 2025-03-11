package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Factura;
import IDP_H1.FactuStock.Repositories.FacturaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class FacturaService {

    @Autowired
    private FacturaRepository facturaRepository;

    // Contar facturas de un mes y año específicos
    public int countByMonthAndYear(int month, int year) {
        return facturaRepository.countByMonthAndYear(month, year);
    }

    // Guardar una nueva factura con número en formato "Fac_AA/MM/00001"
    public Factura guardar(Factura factura) {
        if (factura.getFechaCreacionFactura() == null) {
            factura.setFechaCreacionFactura(new java.util.Date());
        }

        // Generar número de factura si no tiene asignado
        if (factura.getNumeroFactura() == null || factura.getNumeroFactura().trim().isEmpty()) {
            LocalDate fechaActual = LocalDate.now();
            int year = fechaActual.getYear() % 100; // Últimos dos dígitos del año
            int month = fechaActual.getMonthValue(); // Mes actual

            // Contar cuántas facturas existen en el mes y año actual
            int count = countByMonthAndYear(month, fechaActual.getYear());
            int sequence = count + 1; // Incrementar en 1

            // Formato de número de factura
            String numeroFactura = String.format("Fac_%02d/%02d/%05d", year, month, sequence);
            factura.setNumeroFactura(numeroFactura);
        }

        return facturaRepository.save(factura);
    }

    // Obtener todas las facturas
    public List<Factura> obtenerTodas() {
        return facturaRepository.findAll();
    }

    // Obtener factura por ID
    public Optional<Factura> obtenerPorId(Long id) {
        return facturaRepository.findById(id);
    }

    // Eliminar factura por ID
    public void eliminar(Long id) {
        facturaRepository.deleteById(id);
    }
}
