package IDP_H1.FactuStock.Repositories;

import IDP_H1.FactuStock.Entities.CategoriaProducto;
import IDP_H1.FactuStock.Entities.Organizacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoriaProductoRepository extends JpaRepository<CategoriaProducto, Long> {
    List<CategoriaProducto> findByOrganizacion(Organizacion organizacion);
}
