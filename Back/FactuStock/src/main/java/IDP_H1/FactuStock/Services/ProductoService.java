package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Organizacion;
import IDP_H1.FactuStock.Entities.Producto;
import IDP_H1.FactuStock.Repositories.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {
    @Autowired
    private ProductoRepository productoRepository;

    public List<Producto> obtenerTodos() {
        return productoRepository.findAll();
    }

    public Optional<Producto> obtenerPorId(Long id) {
        return productoRepository.findById(id);
    }

    public Producto guardar(Producto producto) {
        return productoRepository.save(producto);
    }

    public void eliminar(Long id) {
        productoRepository.deleteById(id);
    }

    public List<Producto> obtenerProductosPorOrganizacion(Organizacion organizacion) {
        return productoRepository.findByOrganizacion(organizacion);
    }
}
