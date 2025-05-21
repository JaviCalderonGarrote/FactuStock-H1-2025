package IDP_H1.FactuStock.Repositories;

import IDP_H1.FactuStock.Entities.Factura;
import IDP_H1.FactuStock.Entities.Organizacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Repository
public interface FacturaRepository extends JpaRepository<Factura, Long> {

    @Query("SELECT COUNT(f) FROM Factura f WHERE EXTRACT(MONTH FROM f.fecha) = :month AND EXTRACT(YEAR FROM f.fecha) = :year")
    int countByMonthAndYear(@Param("month") int month, @Param("year") int year);

    @Query("SELECT f FROM Factura f WHERE f.organizacion = :organizacion")
    List<Factura> findByOrganizacion(@Param("organizacion") Organizacion organizacion);

    boolean existsByNumeroFactura(String numeroFactura);

    @Query("SELECT COUNT(f) FROM Factura f WHERE f.organizacion.id = :organizacionId AND f.estado = 'PENDIENTE'")
    long countFacturasPendientes(@Param("organizacionId") Long organizacionId);

    @Query("SELECT FUNCTION('DATE_FORMAT', f.fecha, '%Y-%m') as mes, SUM(f.total) as total " +
            "FROM Factura f " +
            "WHERE f.organizacion.id = :organizacionId AND f.fecha BETWEEN :startDate AND :endDate " +
            "GROUP BY FUNCTION('DATE_FORMAT', f.fecha, '%Y-%m')")
    List<Map<String, Object>> getVentasPorMes(@Param("organizacionId") Long organizacionId,
                                              @Param("startDate") LocalDate startDate,
                                              @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(f) FROM Factura f WHERE f.estado <> 'COMPLETADA' AND f.organizacion.id = :organizacionId")
    long countFacturasNoCompletadasByOrganizacion(@Param("organizacionId") Long organizacionId);


}
