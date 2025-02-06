package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Caja;
import IDP_H1.FactuStock.Repositories.CajaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CajaService {
    @Autowired
    private CajaRepository repository;

    public List<Caja> obtenerTodas() {
        return repository.findAll();
    }

    public Optional<Caja> obtenerPorId(Long id) {
        return repository.findById(id);
    }

    public Caja guardar(Caja caja) {
        return repository.save(caja);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}
