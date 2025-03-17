package IDP_H1.FactuStock.Repositories;

import IDP_H1.FactuStock.Entities.CategoriaGasto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoriaGastoRepository extends JpaRepository<CategoriaGasto, Long> {
    List<CategoriaGasto> findByOrganizacionId(Long idOrganizacion);

}
