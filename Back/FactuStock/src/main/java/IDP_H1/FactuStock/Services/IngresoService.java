package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Ingreso;
import IDP_H1.FactuStock.Repositories.IngresoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class IngresoService {

    @Autowired
    private IngresoRepository repository;

    public List<Ingreso> obtenerTodos() {
        return repository.findAll();
    }

    public Optional<Ingreso> obtenerPorId(Long id) {
        return repository.findById(id);
    }

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

    public List<Ingreso> obtenerPorCaja(Long cajaId) {
        return repository.findByCajaId(cajaId);
    }

    public List<Ingreso> obtenerPorFactura(Long facturaId) {
        return repository.findByFacturaId(facturaId);
    }
}
