package IDP_H1.FactuStock.Repositories;

import IDP_H1.FactuStock.Entities.Organizacion;
import IDP_H1.FactuStock.Entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OrganizacionRepository extends JpaRepository<Organizacion, Long> {
    // Aquí buscarás la organización basándote en el 'Usuario'

}
