package IDP_H1.FactuStock.Repositories;

import IDP_H1.FactuStock.Entities.Ingreso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Repository
public interface IngresoRepository extends JpaRepository<Ingreso, Long> {

    List<Ingreso> findByOrganizacionId(Long organizacionId);
    List<Ingreso> findByCajaId(Long cajaId);
    List<Ingreso> findByFacturaId(Long facturaId);

    @Query("SELECT COALESCE(SUM(i.monto), 0) FROM Ingreso i WHERE i.organizacion.id = :organizacionId")
    Double sumTotalIngresos(@Param("organizacionId") Long organizacionId);

    @Query("SELECT FUNCTION('DATE_FORMAT', i.fecha, '%Y-%m') as mes, COALESCE(SUM(i.monto), 0) as total " +
            "FROM Ingreso i " +
            "WHERE i.organizacion.id = :organizacionId AND i.fecha BETWEEN :startDate AND :endDate " +
            "GROUP BY FUNCTION('DATE_FORMAT', i.fecha, '%Y-%m')")
    List<Map<String, Object>> getIngresosPorMes(@Param("organizacionId") Long organizacionId,
                                                @Param("startDate") LocalDate startDate,
                                                @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(i.monto), 0) FROM Ingreso i WHERE i.organizacion.id = :organizacionId AND EXTRACT(YEAR FROM i.fecha) = :year")
    Double sumMontoByOrganizacionIdAndYear(@Param("organizacionId") Long organizacionId, @Param("year") int year);

    @Query("SELECT DISTINCT YEAR(i.fecha) FROM Ingreso i WHERE i.organizacion.id = :organizacionId")
    List<Integer> findDistinctYearsByOrganizacionId(@Param("organizacionId") Long organizacionId);

    @Query(value = "SELECT " +
            "COALESCE(SUM(i.monto), 0) AS total_ingresos, " +
            "COALESCE(SUM(g.monto), 0) AS total_gastos, " +
            "COALESCE(SUM(i.monto), 0) - COALESCE(SUM(g.monto), 0) AS balance " +
            "FROM " +
            "(SELECT COALESCE(SUM(monto), 0) as monto FROM ingreso WHERE organizacion_id = :organizacionId AND EXTRACT(YEAR FROM fecha) = :year) i, " +
            "(SELECT COALESCE(SUM(monto), 0) as monto FROM gasto WHERE organizacion_id = :organizacionId AND EXTRACT(YEAR FROM fecha) = :year) g",
            nativeQuery = true)
    Map<String, Object> getBalanceData(@Param("organizacionId") Long organizacionId, @Param("year") int year);


    @Query(value = "SELECT " +
            "meses.mes, " +
            "COALESCE(ingresos.total_ingresos, 0) AS ingresos " +
            "FROM " +
            "(SELECT generate_series(1, 12) AS mes) meses " +
            "LEFT JOIN ( " +
            "    SELECT " +
            "        EXTRACT(MONTH FROM fecha) AS mes, " +
            "        SUM(monto) AS total_ingresos " +
            "    FROM ingreso " +
            "    WHERE EXTRACT(YEAR FROM fecha) = :year " +
            "      AND organizacion_id = :organizacionId " +
            "    GROUP BY mes " +
            ") ingresos ON ingresos.mes = meses.mes " +
            "ORDER BY meses.mes",
            nativeQuery = true)
    List<Map<String, Object>> getIngresosMensuales(@Param("organizacionId") Long organizacionId, @Param("year") int year);

}
