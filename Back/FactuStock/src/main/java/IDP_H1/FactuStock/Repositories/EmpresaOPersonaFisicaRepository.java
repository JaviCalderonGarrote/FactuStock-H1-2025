package IDP_H1.FactuStock.Repositories;

import IDP_H1.FactuStock.Entities.EmpresaPersonaFisica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmpresaOPersonaFisicaRepository extends JpaRepository<EmpresaPersonaFisica, Long> {
}
