package IDP_H1.FactuStock.Repositories;

import IDP_H1.FactuStock.Entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsername(String username);
    Optional<Usuario> findByMail(String mail);
    Optional<Usuario> findById(Long id);

}
