package IDP_H1.FactuStock.Repositories;

import IDP_H1.FactuStock.Entities.EmpresaPersonaFisica;
import IDP_H1.FactuStock.Entities.Organizacion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmpresaOPersonaFisicaRepository extends JpaRepository<EmpresaPersonaFisica, Long> {

    // Buscar empresas/personas físicas por organización
    List<EmpresaPersonaFisica> findByOrganizacion(Organizacion organizacion);

    // Buscar empresas/personas físicas por idOrganizacion
    List<EmpresaPersonaFisica> findByOrganizacionId(Long idOrganizacion);
}
