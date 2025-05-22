package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.CategoriaGasto;
import IDP_H1.FactuStock.Repositories.CategoriaGastoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoriaGastoService {
    @Autowired
    private CategoriaGastoRepository repository;

    public List<CategoriaGasto> obtenerTodas() {
        return repository.findAll();
    }

    public Optional<CategoriaGasto> obtenerPorId(Long id) {
        return repository.findById(id);
    }

    public CategoriaGasto guardar(CategoriaGasto categoria) {
        return repository.save(categoria);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }

    // ✅ VALIDACIÓN AGREGADA AQUÍ
    public List<CategoriaGasto> obtenerPorOrganizacion(Long idOrganizacion) {
        if (idOrganizacion == null) {
            throw new NullPointerException("El ID de la organización no puede ser null");
        }
        return repository.findByOrganizacionId(idOrganizacion);
    }
}
