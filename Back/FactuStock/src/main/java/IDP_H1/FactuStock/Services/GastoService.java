package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Gasto;
import IDP_H1.FactuStock.Repositories.GastoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class GastoService {
    @Autowired
    private GastoRepository repository;

    @Transactional(readOnly = true)
    public List<Gasto> obtenerTodos() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Gasto> obtenerPorId(Long id) {
        return repository.findById(id);
    }

    @Transactional
    public Gasto guardar(Gasto gasto) {
        return repository.save(gasto);
    }

    @Transactional
    public void eliminar(Long id) {
        repository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Gasto> obtenerPorOrganizacion(Long organizacionId) {
        return repository.findByOrganizacionId(organizacionId);
    }

    @Transactional(readOnly = true)
    public Double obtenerTotalGastosPorAno(Long organizacionId, int year) {
        Double total = repository.sumMontoByOrganizacionIdAndYear(organizacionId, year);
        return total != null ? total : 0.0;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> obtenerGastosMensuales(Long organizacionId, int year) {
        if (organizacionId == null) {
            throw new IllegalArgumentException("El id de organización no puede ser null");
        }
        return repository.getGastosMensuales(organizacionId, year);
    }
}
