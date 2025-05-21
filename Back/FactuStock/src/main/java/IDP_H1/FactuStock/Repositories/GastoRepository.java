package IDP_H1.FactuStock.Repositories;

import IDP_H1.FactuStock.Entities.Gasto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Repository
public interface GastoRepository extends JpaRepository<Gasto, Long> {
    List<Gasto> findByOrganizacionId(Long organizacionId);

    @Query("SELECT COALESCE(SUM(g.monto), 0) FROM Gasto g WHERE g.organizacion.id = :organizacionId")
    Double sumTotalGastos(@Param("organizacionId") Long organizacionId);

    @Query("SELECT FUNCTION('DATE_FORMAT', g.fecha, '%Y-%m') as mes, COALESCE(SUM(g.monto), 0) as total " +
            "FROM Gasto g " +
            "WHERE g.organizacion.id = :organizacionId AND g.fecha BETWEEN :startDate AND :endDate " +
            "GROUP BY FUNCTION('DATE_FORMAT', g.fecha, '%Y-%m')")
    List<Map<String, Object>> getGastosPorMes(@Param("organizacionId") Long organizacionId,
                                              @Param("startDate") LocalDate startDate,
                                              @Param("endDate") LocalDate endDate);

    @Query("SELECT g.categoriaGasto.nombre as categoria, COALESCE(SUM(g.monto), 0) as total " +
            "FROM Gasto g " +
            "WHERE g.organizacion.id = :organizacionId AND g.fecha BETWEEN :startDate AND :endDate " +
            "GROUP BY g.categoriaGasto.nombre")
    List<Map<String, Object>> getGastosPorCategoria(@Param("organizacionId") Long organizacionId,
                                                    @Param("startDate") LocalDate startDate,
                                                    @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(g.monto), 0) FROM Gasto g WHERE g.organizacion.id = :organizacionId AND YEAR(g.fecha) = :year")
    Double sumMontoByOrganizacionIdAndYear(@Param("organizacionId") Long organizacionId, @Param("year") int year);

    @Query("SELECT DISTINCT YEAR(g.fecha) FROM Gasto g WHERE g.organizacion.id = :organizacionId")
    List<Integer> findDistinctYearsByOrganizacionId(@Param("organizacionId") Long organizacionId);

    @Query(value = "SELECT " +
            "meses.mes, " +
            "COALESCE(gastos.total_gastos, 0) AS gastos " +
            "FROM " +
            "(SELECT generate_series(1, 12) AS mes) meses " +
            "LEFT JOIN ( " +
            "    SELECT " +
            "        EXTRACT(MONTH FROM fecha) AS mes, " +
            "        SUM(monto) AS total_gastos " +
            "    FROM gasto " +
            "    WHERE EXTRACT(YEAR FROM fecha) = :year " +
            "      AND organizacion_id = :organizacionId " +
            "      AND estado = 'COMPLETADO' " +
            "    GROUP BY mes " +
            ") gastos ON gastos.mes = meses.mes " +
            "ORDER BY meses.mes",
            nativeQuery = true)
    List<Map<String, Object>> getGastosMensuales(@Param("organizacionId") Long organizacionId, @Param("year") int year);

}
