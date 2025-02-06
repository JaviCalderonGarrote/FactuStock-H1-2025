package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Organizacion;
import IDP_H1.FactuStock.Repositories.OrganizacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrganizacionService {
    @Autowired
    private OrganizacionRepository repository;

    public List<Organizacion> obtenerTodas() {
        return repository.findAll();
    }

    public Optional<Organizacion> obtenerPorId(Long id) {
        return repository.findById(id);
    }

    public Organizacion guardar(Organizacion organizacion) {
        return repository.save(organizacion);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}
