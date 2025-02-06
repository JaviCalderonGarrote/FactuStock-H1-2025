package IDP_H1.FactuStock.Repositories;

import IDP_H1.FactuStock.Entities.Factura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FacturaRepository extends JpaRepository<Factura, Long> {
}
