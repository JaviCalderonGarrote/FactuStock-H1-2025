package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Gasto;
import IDP_H1.FactuStock.Repositories.GastoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GastoService {
    @Autowired
    private GastoRepository repository;

    public List<Gasto> obtenerTodos() {
        return repository.findAll();
    }

    public Optional<Gasto> obtenerPorId(Long id) {
        return repository.findById(id);
    }

    public Gasto guardar(Gasto gasto) {
        return repository.save(gasto);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}
