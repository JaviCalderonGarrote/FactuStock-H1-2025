package IDP_H1.FactuStock.Repositories;

import IDP_H1.FactuStock.Entities.Caja;
import IDP_H1.FactuStock.Entities.EstadoCaja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CajaRepository extends JpaRepository<Caja, Long> {

    List<Caja> findByEstadoAndOrganizacionId(EstadoCaja estado, Long organizacionId);

    List<Caja> findByOrganizacionId(Long organizacionId);

    List<Caja> findByOrganizacionIdOrderByFechaInicioDesc(Long organizacionId);
}
