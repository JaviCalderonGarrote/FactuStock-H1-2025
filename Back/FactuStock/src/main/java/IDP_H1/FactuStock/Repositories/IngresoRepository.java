package IDP_H1.FactuStock.Repositories;

import IDP_H1.FactuStock.Entities.Ingreso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IngresoRepository extends JpaRepository<Ingreso, Long> {
}
