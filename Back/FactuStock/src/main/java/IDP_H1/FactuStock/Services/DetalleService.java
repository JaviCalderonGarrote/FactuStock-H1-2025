package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Detalle;
import IDP_H1.FactuStock.Repositories.DetalleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DetalleService {
    @Autowired
    private DetalleRepository repository;

    public List<Detalle> obtenerTodos() {
        return repository.findAll();
    }

    public Optional<Detalle> obtenerPorId(Long id) {
        return repository.findById(id);
    }

    public Detalle guardar(Detalle detalle) {
        return repository.save(detalle);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}
