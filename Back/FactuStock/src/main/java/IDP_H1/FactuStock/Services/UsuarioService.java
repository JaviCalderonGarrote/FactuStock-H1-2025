package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Usuario;
import IDP_H1.FactuStock.Repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {
    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // Obtener todos los usuarios
    public List<Usuario> obtenerTodos() {
        return repository.findAll();
    }

    // Obtener usuario por ID
    public Optional<Usuario> obtenerPorId(Long id) {
        return repository.findById(id);
    }

    // Obtener usuario por username
    public Optional<Usuario> obtenerPorUsername(String username) {
        return repository.findByUsername(username);
    }

    // Guardar o actualizar usuario
    public Usuario guardar(Usuario usuario) {
        return repository.save(usuario);
    }

    // Eliminar usuario por ID
    public void eliminar(Long id) {
        repository.deleteById(id);
    }

    // Cambiar contraseña del usuario
    public boolean cambiarPassword(Long id, String oldPassword, String newPassword) {
        Optional<Usuario> usuarioOpt = repository.findById(id);
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();

            // Verificar la contraseña actual
            if (!passwordEncoder.matches(oldPassword, usuario.getPassword())) {
                return false; // La contraseña actual no coincide
            }

            // Codificar la nueva contraseña
            usuario.setPassword(passwordEncoder.encode(newPassword));

            // Guardar usuario con la nueva contraseña
            repository.save(usuario);
            return true;
        }
        return false; // Usuario no encontrado
    }
}
