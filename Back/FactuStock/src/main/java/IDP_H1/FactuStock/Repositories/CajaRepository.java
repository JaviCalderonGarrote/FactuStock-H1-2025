package IDP_H1.FactuStock.Repositories;

import IDP_H1.FactuStock.Entities.Caja;
import IDP_H1.FactuStock.Entities.EstadoCaja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CajaRepository extends JpaRepository<Caja, Long> {

    List<Caja> findByEstadoAndOrganizacionId(EstadoCaja estado, Long organizacionId);

    List<Caja> findByOrganizacionId(Long organizacionId);

    List<Caja> findByOrganizacionIdOrderByFechaInicioDesc(Long organizacionId);

    @Query("SELECT c FROM Caja c WHERE c.estado = :estado AND c.organizacion.id = :organizacionId ORDER BY c.fechaInicio DESC")
    Optional<Caja> findFirstByEstadoAndOrganizacionIdOrderByFechaInicioDesc(@Param("estado") EstadoCaja estado, @Param("organizacionId") Long organizacionId);

    @Query(value = "SELECT COALESCE(c.nombre, 'No hay caja abierta') AS nombre, " +
            "COALESCE(c.total_ingresado, 0.0) AS total_ingresado " +
            "FROM (SELECT 1) AS dummy " +
            "LEFT JOIN (SELECT nombre, total_ingresado " +
            "           FROM caja " +
            "           WHERE estado = 'ABIERTA' AND organizacion_id = :organizacionId " +
            "           ORDER BY fecha_inicio DESC " +
            "           LIMIT 1) c ON true",
            nativeQuery = true)
    Optional<Object> obtenerCajaAbiertaConTotal(@Param("organizacionId") Long organizacionId);

}
