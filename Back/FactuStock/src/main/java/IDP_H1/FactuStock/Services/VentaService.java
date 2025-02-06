package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Venta;
import IDP_H1.FactuStock.Repositories.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VentaService {
    @Autowired
    private VentaRepository repository;

    public List<Venta> obtenerTodas() {
        return repository.findAll();
    }

    public Optional<Venta> obtenerPorId(Long id) {
        return repository.findById(id);
    }

    public Venta guardar(Venta venta) {
        return repository.save(venta);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}
