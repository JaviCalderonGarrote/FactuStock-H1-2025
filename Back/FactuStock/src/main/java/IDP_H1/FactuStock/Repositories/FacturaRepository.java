package IDP_H1.FactuStock.Repositories;

import IDP_H1.FactuStock.Entities.Factura;
import IDP_H1.FactuStock.Entities.Organizacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface FacturaRepository extends JpaRepository<Factura, Long> {

    // Contar el número de facturas generadas en un mes y año específico
    @Query("SELECT COUNT(f) FROM Factura f WHERE EXTRACT(MONTH FROM f.fecha) = :month AND EXTRACT(YEAR FROM f.fecha) = :year")
    int countByMonthAndYear(@Param("month") int month, @Param("year") int year);

    // Obtener facturas por organización
    @Query("SELECT f FROM Factura f WHERE f.organizacion = :organizacion")
    List<Factura> findByOrganizacion(@Param("organizacion") Organizacion organizacion);
}
