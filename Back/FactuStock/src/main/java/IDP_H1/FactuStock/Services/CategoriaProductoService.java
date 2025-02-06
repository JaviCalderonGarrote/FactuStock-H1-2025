package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.CategoriaProducto;
import IDP_H1.FactuStock.Repositories.CategoriaProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoriaProductoService {
    @Autowired
    private CategoriaProductoRepository repository;

    public List<CategoriaProducto> obtenerTodas() {
        return repository.findAll();
    }

    public Optional<CategoriaProducto> obtenerPorId(Long id) {
        return repository.findById(id);
    }

    public CategoriaProducto guardar(CategoriaProducto categoriaProducto) {
        return repository.save(categoriaProducto);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}
