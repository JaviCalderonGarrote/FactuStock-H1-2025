package IDP_H1.FactuStock.Repositories;

import IDP_H1.FactuStock.Entities.EmpresaPersonaFisica;
import IDP_H1.FactuStock.Entities.Organizacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;

public interface EmpresaOPersonaFisicaRepository extends JpaRepository<EmpresaPersonaFisica, Long> {

    // Buscar empresas/personas físicas por organización
    List<EmpresaPersonaFisica> findByOrganizacion(Organizacion organizacion);

    // Buscar empresas/personas físicas por idOrganizacion
    List<EmpresaPersonaFisica> findByOrganizacionId(Long idOrganizacion);

    @Query(value = "SELECT e.nombre, " +
            "COUNT(DISTINCT f.id) AS facturas_count " +
            "FROM empresa_persona_fisica e " +
            "LEFT JOIN factura f ON f.empresa_persona_fisica_id = e.id " +
            "WHERE e.organizacion_id = :organizacionId " +
            "GROUP BY e.id " +
            "ORDER BY facturas_count DESC " +
            "LIMIT 6", nativeQuery = true)
    List<Map<String, Object>> findTop6EmpresasWithFacturas(@Param("organizacionId") Long organizacionId);

}
