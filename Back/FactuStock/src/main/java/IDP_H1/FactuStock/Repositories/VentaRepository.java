package IDP_H1.FactuStock.Repositories;

import IDP_H1.FactuStock.Entities.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {
    @Query(value = "SELECT EXTRACT(MONTH FROM fecha) AS mes, COUNT(*) AS cantidad_ventas " +
            "FROM venta " +
            "WHERE organizacion_id = :organizacionId " +
            "AND EXTRACT(YEAR FROM fecha) = :year " +
            "GROUP BY EXTRACT(MONTH FROM fecha) " +
            "ORDER BY mes", nativeQuery = true)
    List<Map<String, Object>> obtenerVentasPorMes(@Param("organizacionId") Long organizacionId, @Param("year") int year);

}
