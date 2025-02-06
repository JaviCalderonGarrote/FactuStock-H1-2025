package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Factura;
import IDP_H1.FactuStock.Repositories.FacturaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FacturaService {
    @Autowired
    private FacturaRepository repository;

    public List<Factura> obtenerTodas() {
        return repository.findAll();
    }

    public Optional<Factura> obtenerPorId(Long id) {
        return repository.findById(id);
    }

    public Factura guardar(Factura factura) {
        return repository.save(factura);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}

