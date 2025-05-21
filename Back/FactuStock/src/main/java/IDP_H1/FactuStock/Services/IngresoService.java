package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Ingreso;
import IDP_H1.FactuStock.Repositories.IngresoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class IngresoService {

    @Autowired
    private IngresoRepository repository;

    @Transactional(readOnly = true)
    public List<Ingreso> obtenerTodos() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Ingreso> obtenerPorId(Long id) {
        return repository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Ingreso> obtenerPorOrganizacion(Long organizacionId) {
        return repository.findByOrganizacionId(organizacionId);
    }

    @Transactional
    public Ingreso guardar(Ingreso ingreso) {
        return repository.save(ingreso);
    }

    @Transactional
    public void eliminar(Long id) {
        repository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Ingreso> obtenerPorCaja(Long cajaId) {
        return repository.findByCajaId(cajaId);
    }

    @Transactional(readOnly = true)
    public List<Ingreso> obtenerPorFactura(Long facturaId) {
        return repository.findByFacturaId(facturaId);
    }

    @Transactional(readOnly = true)
    public Double obtenerTotalIngresosPorAno(Long organizacionId, int year) {
        Double total = repository.sumMontoByOrganizacionIdAndYear(organizacionId, year);
        return total != null ? total : 0.0;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> obtenerIngresosMensuales(Long organizacionId, int year) {
        return repository.getIngresosMensuales(organizacionId, year);
    }

}
