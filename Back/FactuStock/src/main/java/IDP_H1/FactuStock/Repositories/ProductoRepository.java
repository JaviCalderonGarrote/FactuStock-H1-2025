package IDP_H1.FactuStock.Repositories;

import IDP_H1.FactuStock.Entities.Producto;
import IDP_H1.FactuStock.Entities.Organizacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    // Método para obtener productos por organización

    List<Producto> findByOrganizacion(Organizacion organizacion);
}
